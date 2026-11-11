// spec: specs/notifiche.md (sezione 2)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  API, ERRORE_500, endsWith, locators as baseLocators, mockAll, mockAnni, mockBase, mockListaEnte, mockMesi,
  mockScadenziario, openPage,
} from "../../utils/notificheMock/notificheMock";
import { removeChip, selectOption } from "../../utils/ente/docContabiliMock";

// Body di default della lista ente: profilo/prodotto restano stringhe vuote, tipoNotifica [] diventa null
const BODY_DEFAULT = {
  profilo: "",
  prodotto: "",
  anno: 2026,
  mese: 9,
  tipoNotifica: null,
  statoContestazione: [],
  cap: null,
  iun: null,
  recipientId: null,
};

// Locator dei filtri: i select MUI non hanno labelId, quindi il combobox e' identificato per posizione
// (Anno, Mese, Tipo notifica); gli input testuali e l'autocomplete hanno la label associata.
function filtri(page: Page) {
  return {
    ...baseLocators(page),
    anno: page.getByRole("combobox").nth(0),
    mese: page.getByRole("combobox").nth(1),
    tipoNotifica: page.getByRole("combobox").nth(2),
    contestazione: page.getByRole("combobox", { name: "Contestazione", exact: true }),
    iun: page.getByRole("textbox", { name: "IUN", exact: true }),
    cap: page.getByRole("textbox", { name: "CAP", exact: true }),
    recipientId: page.getByRole("textbox", { name: "Recipient ID", exact: true }),
    // i chip mostrano solo un'icona: il valore e' l'aria-label (tooltip)
    chip: (value: string) => page.getByRole("button", { name: value, exact: true }),
    rows: page.getByRole("row", { name: /IUN-/ }),
    paginationLabel: page.getByText(/^\d+–\d+ of \d+$/).first(),
    next: page.getByRole("button", { name: "Go to next page" }).first(),
    rowsPerPage: page.getByRole("combobox", { name: /Rows per page/ }).first(),
    sortDataEvento: page.getByRole("columnheader", { name: /^Data Evento/ }).getByRole("button"),
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

test.describe("Filtri", () => {
  test("Caricamento iniziale: anni, mesi, lista", async ({ page }) => {
    const chiamate: string[] = [];
    page.on("request", (r) => {
      const path = new URL(r.url()).pathname;
      if ([API.anni, API.mesi, API.listaEnte].some((s) => path.endsWith(s))) chiamate.push(path.replace(/^.*\/api/, "/api"));
    });
    const { mesi, lista } = await mockAll(page);

    // 1. Aprire la pagina con mock anni [2026,2025,2024], mesi del 2026 e lista
    const l = await ready(page);

    // expect: Ordine delle chiamate: notifiche/anni, poi notifiche/mesi con body {anno:"2026"}, poi la lista
    expect(chiamate).toEqual([API.anni, API.mesi, API.listaEnte]);
    expect(mesi).toEqual([{ anno: "2026" }]);
    // expect: Anno preselezionato = primo anno, Mese = primo mese con iniziale maiuscola
    await expect(l.anno).toHaveText("2026");
    await expect(l.mese).toHaveText("Settembre");
    // expect: ENTE: POST /api/notifiche/ente chiamata subito con page=1, pageSize=10 e il body di default
    expect(lista).toHaveLength(1);
    expect(lista[0].query).toMatchObject({ page: "1", pageSize: "10", columnName: "null", order: "null" });
    expect(lista[0].body).toEqual(BODY_DEFAULT);
    // expect: la griglia mostra le righe
    await expect(l.rows).toHaveCount(10);
    await expect(l.paginationLabel).toHaveText("1–10 of 25");
    // expect: 'Annulla filtri' assente
    await expect(l.annulla).toHaveCount(0);
  });

  test("Presenza dei filtri per ruolo", async ({ page }) => {
    await mockAll(page);
    const l = await ready(page);

    // 1. Verificare i controlli con getByLabel/getByRole
    // expect: Anno, Mese, IUN, Tipo notifica, Contestazione, CAP, Recipient ID
    for (const label of ["Anno", "Mese", "IUN", "Tipo notifica", "Contestazione", "CAP", "Recipient ID"]) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }
    await expect(l.anno).toBeVisible();
    await expect(l.mese).toBeVisible();
    await expect(l.iun).toBeVisible();
    await expect(l.tipoNotifica).toBeVisible();
    await expect(l.contestazione).toBeVisible();
    await expect(l.cap).toBeVisible();
    await expect(l.recipientId).toBeVisible();
    // expect: ENTE: Tipo notifica e' una select singola con le sei opzioni
    await l.tipoNotifica.click();
    await expect(page.getByRole("option")).toHaveText([
      "Digitali", "Analogico AR Nazionali", "Analogico AR Internazionali",
      "Analogico RS Nazionali", "Analogico RS Internazionali", "Analogico 890",
    ]);
    await page.keyboard.press("Escape");
    // expect: ENTE: NON esistono Rag. Soc. Ente, Consolidatore, Recapitista
    for (const name of ["Rag. Soc. Ente", "Consolidatore", "Recapitista"]) {
      await expect(page.getByRole("combobox", { name })).toHaveCount(0);
      await expect(page.getByText(name, { exact: true })).toHaveCount(0);
    }
  });

  test("Opzioni di Anno e Mese", async ({ page }) => {
    await mockAll(page);
    const l = await ready(page);

    // 1. Aprire il select Anno
    await l.anno.click();

    // expect: Opzioni uguali ai valori mockati (2026, 2025, 2024)
    await expect(page.getByRole("option")).toHaveText(["2026", "2025", "2024"]);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("option")).toHaveCount(0);

    // 2. Aprire il select Mese
    await l.mese.click();

    // expect: Opzioni = mesi mockati per l'anno selezionato, con nome italiano e iniziale maiuscola
    await expect(page.getByRole("option")).toHaveText(["Settembre", "Agosto", "Luglio"]);
  });

  test("Cambio Anno ricarica i mesi e svuota la griglia", async ({ page }) => {
    const { mesi, lista } = await mockAll(page);
    // 1. Con griglia popolata (ente: automatico) selezionare Anno 2025
    const l = await ready(page);
    await selectOption(page, l.anno, "2025");

    // expect: Richiesta POST notifiche/mesi con body {anno:"2025"}
    await expect.poll(() => mesi.at(-1)).toEqual({ anno: "2025" });
    // expect: Mese impostato sul primo mese dell'anno 2025 e opzioni aggiornate
    await expect(l.anno).toHaveText("2025");
    await expect(l.mese).toHaveText("Dicembre");
    await l.mese.click();
    await expect(page.getByRole("option")).toHaveText(["Dicembre", "Novembre"]);
    await page.keyboard.press("Escape");
    // expect: Griglia svuotata, paginatore azzerato, 'Download risultati' disabilitato
    await expect(l.empty).toBeVisible();
    await expect(l.rows).toHaveCount(0);
    await expect(l.paginationLabel).toHaveText("0–0 of 0");
    await expect(l.download).toBeDisabled();
    // expect: Nessuna nuova chiamata alla lista finche' non si clicca 'Filtra'
    expect(lista).toHaveLength(1);
    // expect: 'Annulla filtri' visibile
    await expect(l.annulla).toBeVisible();
  });

  test("Cambio Mese svuota la griglia", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("11–20 of 25");

    // 1. Selezionare un mese diverso dal primo
    await selectOption(page, l.mese, "Agosto");

    // expect: Griglia svuotata, pagina 1 e 10 righe, 'Annulla filtri' visibile
    await expect(l.mese).toHaveText("Agosto");
    await expect(l.empty).toBeVisible();
    await expect(l.rows).toHaveCount(0);
    await expect(l.paginationLabel).toHaveText("0–0 of 0");
    await expect(l.rowsPerPage).toHaveText("10");
    await expect(l.annulla).toBeVisible();
    // il cambio mese non richiama la lista (solo la pagina 2 caricata in precedenza)
    expect(lista).toHaveLength(2);
  });

  test("Filtro IUN, CAP, Recipient ID", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Digitare IUN, CAP e Recipient ID e cliccare 'Filtra'
    await l.iun.fill("IUN-0003");
    await l.cap.fill("10099");
    await l.recipientId.fill("RCP0003");
    await l.filtra.click();

    // expect: Il body della lista contiene iun, cap e recipientId valorizzati
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].query).toMatchObject({ page: "1", pageSize: "10" });
    expect(lista[1].body).toMatchObject({ iun: "IUN-0003", cap: "10099", recipientId: "RCP0003" });

    // 2. Svuotare i campi e cliccare 'Filtra'
    await l.iun.fill("");
    await l.cap.fill("");
    await l.recipientId.fill("");
    await l.filtra.click();

    // expect: Il body contiene iun:null, cap:null, recipientId:null (stringa vuota convertita in null)
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].body).toMatchObject({ iun: null, cap: null, recipientId: null });
  });

  test("Input con valori speciali", async ({ page }) => {
    const errori: string[] = [];
    const dialoghi: string[] = [];
    page.on("pageerror", (e) => errori.push(e.message));
    page.on("dialog", (d) => {
      dialoghi.push(d.message());
      return d.dismiss();
    });
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Inserire in IUN '<script>alert(1)</script>' e in CAP spazi/lettere/testo molto lungo, poi 'Filtra'
    const iun = "<script>alert(1)</script>";
    const cap = `  ab ${"9".repeat(200)}`;
    await l.iun.fill(iun);
    await l.cap.fill(cap);
    await l.filtra.click();

    // expect: la richiesta parte con il testo come stringa (nel codice non c'e' validazione del CAP)
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].body).toMatchObject({ iun, cap });
    // expect: Nessun errore JS, nessun alert
    await expect(l.rows).toHaveCount(10);
    await expect(l.iun).toHaveValue(iun);
    expect(errori).toEqual([]);
    expect(dialoghi).toEqual([]);
  });

  test("Tipo notifica singolo", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Selezionare un tipo di notifica dalla select e cliccare 'Filtra'
    await selectOption(page, l.tipoNotifica, "Analogico AR Nazionali");
    await expect(l.tipoNotifica).toHaveText("Analogico AR Nazionali");
    await l.filtra.click();

    // expect: Il body di POST /api/notifiche/ente contiene tipoNotifica come numero singolo (non array)
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].body.tipoNotifica).toBe(2);

    // 2. Riportare la select al valore vuoto e 'Filtra'
    // la select non ha un'opzione vuota: il valore vuoto si ottiene con 'Annulla filtri'
    await l.annulla.click();

    // expect: tipoNotifica:null
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].body.tipoNotifica).toBeNull();
    await expect(l.tipoNotifica).not.toHaveText("Analogico AR Nazionali");
    await l.filtra.click();
    await expect.poll(() => lista.length).toBe(4);
    expect(lista[3].body.tipoNotifica).toBeNull();
  });

  test("Contestazione multi checkbox raggruppata", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Aprire 'Contestazione'
    await l.contestazione.click();

    // expect: Opzioni raggruppate per 'descrizione' (intestazioni di gruppo) con i flag mockati
    const listbox = page.getByRole("listbox");
    await expect(listbox.getByText("Contestazione", { exact: true })).toBeVisible();
    await expect(listbox.getByText("Esito", { exact: true })).toBeVisible();
    await expect(page.getByRole("option")).toHaveText(["Non contestata", "Contestata", "Accettata", "Rifiutata"]);

    // 2. Selezionare due flag di gruppi diversi e 'Filtra'
    await page.getByRole("option", { name: "Contestata", exact: true }).click();
    await page.getByRole("option", { name: "Accettata", exact: true }).click();

    // expect: Chip visibili (con il campo in focus li mostra entrambi)
    await expect(l.chip("Contestata")).toBeVisible();
    await expect(l.chip("Accettata")).toBeVisible();
    await page.keyboard.press("Escape");
    await l.filtra.click();
    // expect: statoContestazione nel body contiene gli id selezionati
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].body.statoContestazione).toEqual([2, 3]);

    // 3. Deselezionare un flag (il click sul campo gia' in focus non riapre il popup)
    await l.contestazione.press("ArrowDown");
    await page.getByRole("option", { name: "Accettata", exact: true }).click();

    // expect: Un solo chip rimasto
    await expect(l.chip("Accettata")).toHaveCount(0);
    await expect(l.chip("Contestata")).toBeVisible();
  });

  test("Visibilita' di 'Annulla filtri'", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Stato iniziale (filtri di default)
    // expect: 'Annulla filtri' non visibile
    await expect(l.annulla).toHaveCount(0);

    // 2. Modificare un qualsiasi filtro
    // expect: Anno diverso dal primo -> 'Annulla filtri' visibile
    await selectOption(page, l.anno, "2025");
    await expect(l.annulla).toBeVisible();
    // 3. Riportare il filtro al valore di default
    // expect: 'Annulla filtri' scompare
    await selectOption(page, l.anno, "2026");
    await expect(l.mese).toHaveText("Settembre");
    await expect(l.annulla).toHaveCount(0);

    // 2. expect: Mese diverso dal primo -> visibile
    await selectOption(page, l.mese, "Agosto");
    await expect(l.annulla).toBeVisible();
    // 3. expect: ripristino -> scompare
    await selectOption(page, l.mese, "Settembre");
    await expect(l.annulla).toHaveCount(0);

    // 2. IUN: diverge dalla spec, statusAnnulla non considera iun -> 'Annulla filtri' resta nascosto (da confermare col team)
    await l.iun.fill("IUN-0001");
    await expect(l.annulla).toHaveCount(0);
    await l.iun.fill("");

    // 2. expect: CAP -> visibile
    await l.cap.fill("10099");
    await expect(l.annulla).toBeVisible();
    // 3. expect: campo svuotato -> scompare
    await l.cap.fill("");
    await expect(l.annulla).toHaveCount(0);

    // 2. expect: Recipient ID -> visibile
    await l.recipientId.fill("RCP0001");
    await expect(l.annulla).toBeVisible();
    // 3. expect: campo svuotato -> scompare
    await l.recipientId.fill("");
    await expect(l.annulla).toHaveCount(0);

    // 2. expect: Contestazione -> visibile
    await l.contestazione.click();
    await page.getByRole("option", { name: "Contestata", exact: true }).click();
    await page.keyboard.press("Escape");
    await expect(l.annulla).toBeVisible();
    // 3. expect: chip rimosso -> scompare
    await removeChip({ chip: l.chip } as Parameters<typeof removeChip>[0], "Contestata");
    await expect(l.chip("Contestata")).toHaveCount(0);
    await expect(l.annulla).toHaveCount(0);

    // 2. expect: ordinamento attivo (Data Evento) -> visibile
    // il sort e' disabilitato a griglia vuota (svuotata dai cambi filtro): ricaricare con 'Filtra'
    await l.filtra.click();
    await expect.poll(() => lista.length).toBe(2);
    await l.sortDataEvento.click();
    await expect.poll(() => lista.length).toBe(3);
    await expect(l.annulla).toBeVisible();
    // 3. expect: dopo il ciclo asc -> desc -> nessuno -> scompare
    await l.sortDataEvento.click();
    await expect.poll(() => lista.length).toBe(4);
    await l.sortDataEvento.click();
    await expect.poll(() => lista.length).toBe(5);
    expect(lista[4].query).toMatchObject({ columnName: "null", order: "null" });
    await expect(l.annulla).toHaveCount(0);

    // 2. expect: Tipo notifica -> visibile
    await selectOption(page, l.tipoNotifica, "Digitali");
    await expect(l.annulla).toBeVisible();
    // 3. expect: la select non ha un'opzione vuota: il default si ripristina con 'Annulla filtri'
    await l.annulla.click();
    await expect(l.annulla).toHaveCount(0);
  });

  test("Filtra torna a pagina 1 con 10 righe", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Andare a pagina 2 e cliccare 'Filtra'
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("11–20 of 25");
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].query).toMatchObject({ page: "2", pageSize: "10" });
    await l.filtra.click();

    // expect: Richiesta con page=1&pageSize=10; il paginatore mostra '1-10 of N'
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].query).toMatchObject({ page: "1", pageSize: "10" });
    await expect(l.paginationLabel).toHaveText("1–10 of 25");
    await expect(l.rows).toHaveCount(10);
  });

  test("Annulla filtri ripristina i default", async ({ page }) => {
    const { mesi, lista } = await mockAll(page);
    let chiamateAnni = 0;
    page.on("request", (r) => {
      if (new URL(r.url()).pathname.endsWith(API.anni)) chiamateAnni++;
    });
    const l = await ready(page);
    expect(chiamateAnni).toBe(1);

    // 1. Impostare filtri (Anno, Mese, IUN, Contestazione) e cliccare 'Annulla filtri'
    await selectOption(page, l.anno, "2025");
    await selectOption(page, l.mese, "Novembre");
    await l.iun.fill("IUN-0001");
    await l.contestazione.click();
    await page.getByRole("option", { name: "Contestata", exact: true }).click();
    await page.keyboard.press("Escape");
    await expect(l.chip("Contestata")).toBeVisible();
    await expect(l.annulla).toBeVisible();
    await l.annulla.click();

    // expect: Anno/Mese tornano al primo anno/mese, campi testo e chip azzerati
    await expect(l.anno).toHaveText("2026");
    await expect(l.mese).toHaveText("Settembre");
    await expect(l.iun).toHaveValue("");
    await expect(l.chip("Contestata")).toHaveCount(0);
    // expect: Vengono richiamate notifiche/anni e notifiche/mesi (stesso flusso del primo render)
    await expect.poll(() => chiamateAnni).toBe(2);
    expect(mesi).toEqual([{ anno: "2026" }, { anno: "2025" }, { anno: "2026" }]);
    // expect: ENTE: lista ricaricata con filtri di default, pagina 1 e 10 righe
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].query).toMatchObject({ page: "1", pageSize: "10" });
    expect(lista[1].body).toEqual(BODY_DEFAULT);
    await expect(l.rows).toHaveCount(10);
    await expect(l.paginationLabel).toHaveText("1–10 of 25");
    // expect: 'Annulla filtri' scompare
    await expect(l.annulla).toHaveCount(0);
  });

  test("Filtri senza anni disponibili", async ({ page }) => {
    const errori: string[] = [];
    page.on("pageerror", (e) => errori.push(e.message));
    await mockBase(page);
    await mockScadenziario(page);
    // 1. Mockare notifiche/anni con []
    await mockAnni(page, []);
    const mesi = await mockMesi(page);
    const lista = await mockListaEnte(page);
    await openPage(page);
    const l = filtri(page);

    // expect: loading chiuso e nessun errore
    await expect(l.loading).toBeHidden();
    await expect(l.empty).toBeVisible();
    expect(errori).toEqual([]);
    // expect: Select Anno senza opzioni
    await l.anno.click();
    await expect(page.getByRole("option")).toHaveCount(0);
    await page.keyboard.press("Escape");
    // expect: nessuna chiamata a mesi/lista
    expect(mesi).toHaveLength(0);
    expect(lista).toHaveLength(0);
    // NB: con anni [] statusAnnulla confronta anno null con arrayAnni[0] undefined -> 'Annulla filtri' visibile (da confermare col team)
    await expect(l.annulla).toBeVisible();
  });

  test("Errore su anni o mesi", async ({ page }) => {
    const log: string[] = [];
    page.on("console", (m) => log.push(m.text()));

    // 1. Mockare notifiche/anni con 500
    await mockBase(page);
    await mockScadenziario(page);
    await mockAnni(page, [], 500);
    const mesi1 = await mockMesi(page);
    const lista1 = await mockListaEnte(page);
    await openPage(page);
    let l = filtri(page);

    // expect: Loading chiuso, filtri non popolati, pagina utilizzabile (errore solo in console: 'Error NOTIFICHE')
    await expect(l.loading).toBeHidden();
    await expect.poll(() => log.some((t) => t.includes("Error NOTIFICHE"))).toBe(true);
    await expect(l.empty).toBeVisible();
    await expect(l.title).toBeVisible();
    await expect(l.filtra).toBeEnabled();
    await expect(l.iun).toBeEditable();
    expect(mesi1).toHaveLength(0);
    expect(lista1).toHaveLength(0);

    // 2. Mockare notifiche/mesi con 500 dopo il cambio Anno
    await mockAnni(page);
    await page.route(endsWith(API.mesi), (route, request) => {
      const { anno } = request.postDataJSON();
      return route.fulfill(
        anno === "2025"
          ? { status: 500, contentType: "application/json", body: "{}" }
          : { status: 200, contentType: "application/json", body: JSON.stringify([{ mese: "9", descrizione: "SETTEMBRE" }]) },
      );
    });
    await mockListaEnte(page);
    await page.reload();
    l = filtri(page);
    await expect(l.rows).toHaveCount(10);
    await selectOption(page, l.anno, "2025");

    // expect: manageError visualizzato e loading chiuso
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    await expect(l.loading).toBeHidden();
  });
});
