// spec: specs/ente-asyncDocumenti.md (sezione 5)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  API, ERRORE_500, STATI, endsWith, locators, makeDocumenti, mockCount, mockDownload, mockLista, openPage,
} from "../../utils/asyncDocumentiMock/asyncDocumentiMock";

const MSG_404 = "La ricerca non ha prodotto risultati";

// Apre la pagina e attende il caricamento iniziale (prima pagina da 10 righe)
async function ready(page: Page) {
  await openPage(page);
  const l = locators(page);
  await expect(l.loading).toBeHidden();
  await expect(l.rows).toHaveCount(10);
  return {
    ...l,
    // riga con il chip di stato indicato (con makeDocumento(i): stato = STATI[i % 4])
    riga: (stato: (typeof STATI)[number]) =>
      l.rows.filter({ has: page.getByRole("cell", { name: stato, exact: true }) }).first(),
    // badge del contatore messaggi nell'header (MUI Badge: span con il numero)
    badge: (n: number) => page.getByText(String(n), { exact: true }),
  };
}

// Il pulsante di download e' l'unico pulsante dell'ultima cella
const downloadButton = (riga: ReturnType<Page["getByRole"]>) => riga.getByRole("cell").last().getByRole("button");

test.describe("Download", () => {
  test("Download di un documento Elaborato", async ({ page }) => {
    // 1. Mockare download e richiesta/count con 3; cliccare il download di una riga Elaborato
    const documenti = makeDocumenti(25);
    const lista = await mockLista(page, documenti);
    const idReport = await mockDownload(page);
    const count = await mockCount(page, 3);

    // la ricarica della lista dopo il download resta in attesa finche' non viene rilasciata
    let rilascia!: () => void;
    const gate = new Promise<void>((resolve) => {
      rilascia = resolve;
    });
    let chiamate = 0;
    await page.route(endsWith(API.lista), async (route) => {
      chiamate++;
      if (chiamate > 1) await gate;
      await route.fallback();
    });

    const l = await ready(page);
    const riga = l.riga("Elaborato");
    await expect(riga.getByRole("cell", { name: "Non letto", exact: true })).toBeVisible();
    await expect(l.badge(3)).toHaveCount(0);

    count.armed = true;
    const downloadPromise = page.waitForEvent("download");
    await downloadButton(riga).click();

    // expect: 'Downloading...' visibile (fino alla ricarica della lista)
    await expect(l.downloading).toBeVisible();

    // expect: Evento download con nome file 'Notifiche.csv'
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("Notifiche.csv");

    // expect: Richiesta con idReport uguale al reportId della riga (i=1 -> 1001)
    expect(idReport).toEqual(["1001"]);

    // expect: Chiamata a richiesta/count e contatore header a 3
    await expect.poll(() => count.n).toBe(1);
    await expect(l.badge(3)).toBeVisible();

    // expect: la lista viene ricaricata, 'Downloading...' si chiude solo dopo
    // (la richiesta arriva al gate; mockLista la registra solo dopo il rilascio)
    await expect.poll(() => chiamate).toBe(2);
    await expect(l.downloading).toBeVisible();
    documenti[1].letto = true; // il mock della ricarica restituisce il documento letto
    rilascia();
    await expect(l.downloading).toBeHidden();
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].query).toMatchObject({ page: "1", pageSize: "10" });
    expect(lista[1].body).toEqual(lista[0].body);

    // expect: La riga risulta letta
    await expect(l.riga("Elaborato").getByRole("cell", { name: "Letto", exact: true })).toBeVisible();
  });

  test("Download non possibile per stati diversi da Elaborato", async ({ page }) => {
    await mockLista(page, makeDocumenti(25));
    const idReport = await mockDownload(page);
    const l = await ready(page);

    // 1. Verificare il pulsante download su righe Presa in carico, Elaborato no data, Errore
    // expect: Pulsante disabilitato, nessuna richiesta a /download
    for (const stato of ["Presa in carico", "Elaborato no data", "Errore"] as const) {
      await expect(downloadButton(l.riga(stato))).toBeDisabled();
    }
    await expect(downloadButton(l.riga("Elaborato"))).toBeEnabled();
    expect(idReport).toHaveLength(0);
  });

  test("Download mantiene pagina e filtri", async ({ page }) => {
    const lista = await mockLista(page, makeDocumenti(33));
    const idReport = await mockDownload(page);
    const count = await mockCount(page, 3);
    const l = await ready(page);

    // 1. Con filtri date e pagina 2 scaricare un documento
    await l.dataInizio.click();
    await l.dataInizio.pressSequentially("01092026");
    await l.dataFine.click();
    await l.dataFine.pressSequentially("30092026");
    await l.filtra.click();
    await expect.poll(() => lista.length).toBe(2);
    await expect(l.rows).toHaveCount(10);
    await l.next.click();
    await expect.poll(() => lista.length).toBe(3);
    await expect(l.paginationLabel).toHaveText("11–20 of 33");

    count.armed = true;
    const downloadPromise = page.waitForEvent("download");
    await downloadButton(l.riga("Elaborato")).click();
    expect((await downloadPromise).suggestedFilename()).toBe("Notifiche.csv");

    // expect: La lista ricaricata usa gli stessi body, page e rows
    await expect.poll(() => lista.length).toBe(4);
    expect(lista[3].query).toMatchObject({ page: "2", pageSize: "10" });
    expect(lista[3].body).toEqual({ init: "2026-09-01", end: "2026-09-30", ordinamento: 1 });
    expect(lista[3].body).toEqual(lista[2].body);
    expect(idReport).toHaveLength(1);
    await expect(l.downloading).toBeHidden();
    await expect(l.paginationLabel).toHaveText("11–20 of 33");
  });

  test("Errore 500 sul download", async ({ page }) => {
    const lista = await mockLista(page, makeDocumenti(25));
    const idReport = await mockDownload(page, 500);
    const count = await mockCount(page, 3);
    const scaricati: string[] = [];
    page.on("download", (d) => scaricati.push(d.suggestedFilename()));
    const l = await ready(page);

    // 1. Mockare /download con 500
    count.armed = true;
    await downloadButton(l.riga("Elaborato")).click();

    // expect: Messaggio di errore 500, 'Downloading...' chiuso, nessun file, nessuna chiamata a count o lista
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    await expect(l.downloading).toBeHidden();
    expect(idReport).toHaveLength(1);
    expect(scaricati).toHaveLength(0);
    expect(count.n).toBe(0);
    expect(lista).toHaveLength(1);
  });

  test("Errore 404 sul download", async ({ page }) => {
    const lista = await mockLista(page, makeDocumenti(25));
    await mockDownload(page, 404);
    const count = await mockCount(page, 3);
    const scaricati: string[] = [];
    page.on("download", (d) => scaricati.push(d.suggestedFilename()));
    const l = await ready(page);

    // 1. Mockare /download con 404
    count.armed = true;
    await downloadButton(l.riga("Elaborato")).click();

    // expect: Errore gestito da manageError (i18n errori.404), modale chiuso, nessun file
    await expect(page.getByText(MSG_404)).toBeVisible();
    await expect(l.downloading).toBeHidden();
    expect(scaricati).toHaveLength(0);
    expect(count.n).toBe(0);
    expect(lista).toHaveLength(1);
  });

  test("Errore su richiesta/count dopo il download", async ({ page }) => {
    const lista = await mockLista(page, makeDocumenti(25));
    await mockDownload(page);
    const count = await mockCount(page, 3, 500);
    const l = await ready(page);

    // 1. Mockare richiesta/count con 500 dopo un download riuscito
    count.armed = true;
    const downloadPromise = page.waitForEvent("download");
    await downloadButton(l.riga("Elaborato")).click();

    // NB: diverge dalla spec (che lascia il dubbio): il file e' gia' stato scaricato, ma l'errore di count finisce nel catch,
    // mostra l'errore e la lista NON viene ricaricata (da confermare col team)
    expect((await downloadPromise).suggestedFilename()).toBe("Notifiche.csv");
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    await expect(l.downloading).toBeHidden();
    expect(count.n).toBe(1);
    expect(lista).toHaveLength(1);
    await expect(l.rows).toHaveCount(10);
    await expect(l.badge(3)).toHaveCount(0);
  });

  test("Errore sul ricaricamento lista dopo il download", async ({ page }) => {
    // 1. Mockare la POST lista con 500 solo alla seconda chiamata
    const lista = await mockLista(page, makeDocumenti(25), (call) => (call === 2 ? 500 : 200));
    await mockDownload(page);
    const count = await mockCount(page, 3);
    const l = await ready(page);

    count.armed = true;
    const downloadPromise = page.waitForEvent("download");
    await downloadButton(l.riga("Elaborato")).click();
    expect((await downloadPromise).suggestedFilename()).toBe("Notifiche.csv");

    // expect: listaDoc gestisce l'errore (manageError, griglia vuota), 'Downloading...' si chiude comunque
    await expect.poll(() => lista.length).toBe(2);
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    await expect(l.downloading).toBeHidden();
    await expect(l.loading).toBeHidden();
    await expect(l.rows).toHaveCount(0);
    await expect(l.empty).toBeVisible();
    expect(count.n).toBe(1);
  });
});
