// spec: specs/notifiche.md (sezione 3)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  API, ERRORE_500, ROUTE_ENTE, endsWith, locators as baseLocators, makeNotifica, makeNotifiche, mockAll, mockListaEnte, openPage,
} from "../../utils/notificheMock/notificheMock";

// Locator della griglia: stessi pattern di filtri.spec.ts
function filtri(page: Page) {
  return {
    ...baseLocators(page),
    rows: page.getByRole("row", { name: /IUN-/ }),
    paginationLabel: page.getByText(/^\d+–\d+ of \d+$/).first(),
    headers: page.getByRole("columnheader"),
    sortDataEvento: page.getByRole("columnheader", { name: /^Data Evento/ }).getByRole("button"),
    // la riga e' identificata dal bottone Event ID (aria-label = idNotifica)
    row: (idNotifica: string) =>
      page.getByRole("row").filter({ has: page.getByRole("button", { name: idNotifica, exact: true }) }),
  };
}

// Apre la pagina e attende il caricamento iniziale della lista ente (prima pagina da 10 righe)
async function ready(page: Page) {
  await openPage(page);
  const l = filtri(page);
  await expect(l.loading).toBeHidden();
  await expect(l.rows).toHaveCount(10);
  return l;
}

test.describe("Griglia", () => {
  test("Intestazioni per ruolo", async ({ page }) => {
    await mockAll(page);

    // 1. Con lista popolata verificare le colonne con getByRole('columnheader')
    const l = await ready(page);

    // expect: ENTE: Contestazione, Event ID, Onere, Recipient ID, Anno, Mese, Data Evento, Tipo Notifica, IUN,
    // Data Postalizzazione, Stato estero, CAP, Costo, colonna freccia vuota
    await expect(l.headers).toHaveText([
      "Contestazione", "Event ID", "Onere", "Recipient ID", "Anno", "Mese", "Data Evento", "Tipo Notifica", "IUN",
      "Data Postalizzazione", "Stato estero", "CAP", "Costo", "",
    ]);
    // expect: ENTE non ha la colonna 'Ragione Sociale'
    await expect(page.getByRole("columnheader", { name: "Ragione Sociale" })).toHaveCount(0);
    await expect(page.getByRole("columnheader", { name: "Stato Estero", exact: true })).toHaveCount(0);
  });

  test("Formattazione e contenuto delle righe", async ({ page }) => {
    const nullo = null as unknown as string;
    await mockAll(
      page,
      makeNotifiche(25, (i) => {
        if (i === 1) return { onere: "REC" };
        // riga con tutti i valori nulli (tranne idNotifica e iun, usati per trovare e contare le righe)
        if (i === 2) {
          return {
            onere: nullo, recipientId: nullo, anno: nullo, mese: nullo, data: nullo, tipoNotifica: nullo,
            dataInvio: nullo, statoEstero: nullo, cap: nullo, costEuroInCentesimi: nullo,
          };
        }
        if (i === 3) return { onere: "PA_SEND" };
        if (i === 4) return { onere: "PA_CON" };
        if (i === 5) return { onere: "SEND_PA" };
        return {};
      }),
    );

    // 1. Osservare una riga con dati noti
    const l = await ready(page);
    const riga = l.row("ID-NOTIFICA-1");

    // expect: Mese come nome, Data Evento in formato data-ora, Data Postalizzazione solo data,
    // Costo formattato da centesimi in euro, Onere tradotto da getOnereLabel
    // NB: diverge dalla spec: conf_GridNotifiche dichiara getOnereLabel su una colonna typeColumn "string", ma la griglia
    // non applica funToManipulateValue alle colonne string: viene mostrato il valore grezzo (bug da segnalare)
    await expect(riga.getByRole("cell", { name: "REC", exact: true })).toBeVisible();
    await expect(riga.getByRole("cell", { name: "RCP0001", exact: true })).toBeVisible();
    await expect(riga.getByRole("cell", { name: "2026", exact: true })).toBeVisible();
    await expect(riga.getByRole("cell", { name: "Settembre", exact: true })).toBeVisible();
    await expect(riga.getByRole("cell", { name: "2026-09-02 10:00:00", exact: true })).toBeVisible();
    await expect(riga.getByRole("cell", { name: "Digitale", exact: true })).toBeVisible();
    await expect(riga.getByRole("cell", { name: "IUN-0001", exact: true })).toBeVisible();
    await expect(riga.getByRole("cell", { name: "01-Set-2026", exact: true })).toBeVisible();
    await expect(riga.getByRole("cell", { name: "10099", exact: true })).toBeVisible();
    await expect(riga.getByRole("cell", { name: /^1,50\s€$/ })).toBeVisible();
    // Contestazione e Stato estero vuoti sono resi come '--'
    await expect(riga.getByRole("cell", { name: "--", exact: true })).toHaveCount(2);
    // altre traduzioni dell'onere
    await expect(l.row("ID-NOTIFICA-3").getByRole("cell", { name: "PA_SEND", exact: true })).toBeVisible();
    await expect(l.row("ID-NOTIFICA-4").getByRole("cell", { name: "PA_CON", exact: true })).toBeVisible();
    await expect(l.row("ID-NOTIFICA-5").getByRole("cell", { name: "SEND_PA", exact: true })).toBeVisible();

    // expect: Valori nulli resi senza errori ('--' in tutte le celle di testo, data e importo)
    await expect(l.row("ID-NOTIFICA-2").getByRole("cell", { name: "--", exact: true })).toHaveCount(11);
    await expect(l.row("ID-NOTIFICA-2").getByRole("cell", { name: "IUN-0002", exact: true })).toBeVisible();
  });

  test("Stato vuoto", async ({ page }) => {
    // 1. Mockare lista con {notifiche:[],count:0} e aprire pagina (ente)
    await mockAll(page, []);
    const l = await openPage(page);
    await expect(l.loading).toBeHidden();

    // expect: Testo 'Non sono presenti notifiche'; paginatore '0-0 of 0'; 'Download risultati' disabilitato
    await expect(l.empty).toBeVisible();
    await expect(filtri(page).rows).toHaveCount(0);
    await expect(filtri(page).paginationLabel).toHaveText("0–0 of 0");
    await expect(l.download).toBeDisabled();
  });

  test("Ordinamento server-side su Data Evento", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);
    expect(lista).toHaveLength(1);

    // 1. Cliccare il pulsante di sort di 'Data Evento' (1 click)
    await l.sortDataEvento.click();

    // expect: Richiesta con columnName=data&order=1 (asc), pagina 1, 10 righe; 'Annulla filtri' visibile
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].query).toMatchObject({ page: "1", pageSize: "10", columnName: "data", order: "1" });
    await expect(l.rows).toHaveCount(10);
    await expect(l.annulla).toBeVisible();

    // 2. Secondo click
    await l.sortDataEvento.click();

    // expect: Richiesta con columnName=data&order=2 (desc)
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].query).toMatchObject({ page: "1", pageSize: "10", columnName: "data", order: "2" });

    // 3. Terzo click
    await l.sortDataEvento.click();

    // expect: Richiesta con columnName=null&order=null (nessun ordinamento)
    await expect.poll(() => lista.length).toBe(4);
    expect(lista[3].query).toMatchObject({ page: "1", pageSize: "10", columnName: "null", order: "null" });
    await expect(l.rows).toHaveCount(10);
    await expect(l.annulla).toHaveCount(0);

    // 4. Verificare che sono ordinabili solo le colonne con headerActionSort
    // expect: Solo 'Data Evento' ha il controllo di sort
    await expect(l.headers.getByRole("button")).toHaveCount(1);
    await expect(l.sortDataEvento).toBeVisible();
  });

  test("Griglia disabilitata durante il caricamento", async ({ page }) => {
    await mockAll(page);
    // 1. Ritardare la risposta della lista (route con delay controllato da una promise)
    let rilascia!: () => void;
    const gate = new Promise<void>((resolve) => {
      rilascia = resolve;
    });
    await page.route(endsWith(API.listaEnte), async (route) => {
      await gate;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ notifiche: makeNotifiche(25).slice(0, 10), count: 25 }),
      });
    });
    await page.goto(ROUTE_ENTE);
    const l = filtri(page);

    // expect: Modale 'Loading...' visibile; 'Download risultati' non utilizzabile finche' la risposta non arriva
    await expect(l.loading).toBeVisible();
    // il modale Loading rende aria-hidden il resto della pagina
    await expect(page.getByRole("button", { name: "Download risultati", includeHidden: true })).toBeDisabled();
    await expect(l.rows).toHaveCount(0);

    rilascia();

    // expect: a risposta arrivata il loading scompare e la griglia e il download sono utilizzabili
    await expect(l.loading).toBeHidden();
    await expect(l.rows).toHaveCount(10);
    await expect(l.download).toBeEnabled();
    await expect(l.filtra).toBeEnabled();
  });

  test("Errore 500 sulla lista", async ({ page }) => {
    await mockAll(page);
    // 1. Mockare la lista con 500
    await mockListaEnte(page, undefined, 500);
    const l = filtri(page);
    await openPage(page);

    // expect: manageError visualizzato, loading chiuso, griglia vuota, 'Download risultati' disabilitato
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    await expect(l.loading).toBeHidden();
    await expect(l.empty).toBeVisible();
    await expect(l.rows).toHaveCount(0);
    await expect(l.download).toBeDisabled();

    // 2. Ripristinare il mock e cliccare 'Filtra'
    const lista = await mockListaEnte(page);
    await l.filtra.click();

    // expect: Griglia ripopolata e download riabilitato (dopo la scomparsa dell'alert di errore)
    await expect.poll(() => lista.length).toBe(1);
    await expect(l.rows).toHaveCount(10);
    await expect(l.empty).toHaveCount(0);
    await expect(l.download).toBeEnabled({ timeout: 10000 });
  });

  test("Errore 404 sulla lista", async ({ page }) => {
    await mockAll(page);
    // 1. Mockare POST /api/notifiche/ente con 404
    await mockListaEnte(page, undefined, 404);
    const l = filtri(page);
    await openPage(page);

    // expect: manageError gestito (404 = "La ricerca non ha prodotto risultati")
    await expect(page.getByText("La ricerca non ha prodotto risultati")).toBeVisible();
    // expect: Lista vuota, count 0, 'Non sono presenti notifiche'
    await expect(l.loading).toBeHidden();
    await expect(l.empty).toBeVisible();
    await expect(l.rows).toHaveCount(0);
    await expect(filtri(page).paginationLabel).toHaveText("0–0 of 0");
    await expect(l.download).toBeDisabled();
  });

  test("Link Event ID / snackbar", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const { lista } = await mockAll(page);
    let contestazioni = 0;
    await page.route(/\/api\/notifiche\/contestazione\//, (route) => {
      contestazioni++;
      return route.fulfill({ status: 500, contentType: "application/json", body: "{}" });
    });
    const l = await ready(page);
    const url = page.url();

    // 1. Interagire con la cella Event ID (colonna di tipo snackbar)
    await page.getByRole("button", { name: "ID-NOTIFICA-3", exact: true }).click();

    // expect: snackbar 'Event ID Copiato!' e id copiato negli appunti
    await expect(page.getByText("Event ID Copiato!")).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("ID-NOTIFICA-3");
    // expect: nessun navigation, nessuna apertura di contestazione e nessuna nuova chiamata alla lista
    expect(page.url()).toBe(url);
    expect(contestazioni).toBe(0);
    expect(lista).toHaveLength(1);
    await expect(l.rows).toHaveCount(10);
    // lo snackbar si chiude da solo dopo 2 secondi
    await expect(page.getByText("Event ID Copiato!")).toBeHidden();
  });
});
