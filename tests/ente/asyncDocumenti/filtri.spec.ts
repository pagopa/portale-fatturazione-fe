// spec: specs/ente-asyncDocumenti.md (sezione 2)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import { locators, mockAll, openPage, savedFilters } from "../../utils/asyncDocumentiMock/asyncDocumentiMock";

type Campo = ReturnType<typeof locators>["dataInizio"];

const VUOTO = /^(DD\/MM\/YYYY)?$/;
const BODY_DEFAULT = { init: null, end: null, ordinamento: 1 };

// Digita una data (ggmmaaaa) in un campo vuoto
async function digita(campo: Campo, valore: string) {
  await campo.click();
  await campo.pressSequentially(valore);
}

// Svuota un campo data (seleziona tutte le sezioni e cancella)
async function svuota(campo: Campo) {
  await campo.click();
  await campo.press("Control+A");
  await campo.press("Backspace");
  // senza blur il cursore resta su una sezione intermedia e la digitazione successiva finisce nel mese
  await campo.blur();
}

// Sostituisce il valore di un campo gia' compilato (valore "ggmmaaaa"): fill riscrive tutte le sezioni
async function sostituisci(campo: Campo, valore: string) {
  await campo.fill(`${valore.slice(0, 2)}/${valore.slice(2, 4)}/${valore.slice(4)}`);
}

// Apre la pagina e attende il caricamento iniziale (10 righe)
async function ready(page: Page) {
  const l = await openPage(page);
  await expect(l.loading).toBeHidden();
  await expect(l.rows).toHaveCount(10);
  return l;
}

test.describe("Filtri", () => {
  test("Presenza e stato iniziale dei filtri", async ({ page }) => {
    await mockAll(page);
    const l = await ready(page);

    // 1. Aprire la pagina e cercare 'Data inizio' e 'Data fine'
    // expect: Entrambi presenti e vuoti
    await expect(l.dataInizio).toBeVisible();
    await expect(l.dataFine).toBeVisible();
    await expect(l.dataInizio).toHaveValue(VUOTO);
    await expect(l.dataFine).toHaveValue(VUOTO);
    // expect: 'Filtra' abilitato
    await expect(l.filtra).toBeEnabled();
    // expect: 'Annulla filtri' non visibile
    await expect(l.annulla).toHaveCount(0);
  });

  test("Selezione di Data inizio svuota la griglia", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Inserire una Data inizio valida (es. 01/09/2026)
    await digita(l.dataInizio, "01092026");
    await expect(l.dataInizio).toHaveValue("01/09/2026");

    // expect: 'Annulla filtri' diventa visibile
    await expect(l.annulla).toBeVisible();
    // expect: Griglia svuotata (clearOnChangeFilter)
    await expect(l.empty).toBeVisible();
    await expect(l.rows).toHaveCount(0);
    await expect(l.paginationLabel).toHaveText("0–0 of 0");
    // expect: Nessuna nuova chiamata alla lista finche' non si clicca 'Filtra'
    expect(lista).toHaveLength(1);
  });

  test("Filtra con solo Data inizio, solo Data fine, intervallo completo", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Impostare solo Data inizio e cliccare 'Filtra'
    await digita(l.dataInizio, "01092026");
    await l.filtra.click();

    // expect: Body POST {init:'2026-09-01',end:null,ordinamento:1} (formato YYYY-MM-DD, senza orario)
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].body).toEqual({ init: "2026-09-01", end: null, ordinamento: 1 });
    expect(lista[1].query).toMatchObject({ page: "1", pageSize: "10" });
    // expect: Griglia ripopolata
    await expect(l.rows).toHaveCount(10);

    // 2. Impostare solo Data fine e 'Filtra'
    await svuota(l.dataInizio);
    await expect(l.annulla).toHaveCount(0);
    await digita(l.dataFine, "10092026");
    await expect(l.dataFine).toHaveValue("10/09/2026");

    // NB: diverge dalla spec: mainFilter (date_from_to) imposta error=true quando Data fine e' valorizzata
    // con Data inizio null, quindi 'Filtra' e' disabilitato e il body {init:null,end:...} non puo' essere inviato
    await expect(l.filtra).toBeDisabled();
    expect(lista).toHaveLength(2);

    // 3. Impostare entrambe e 'Filtra'
    await digita(l.dataInizio, "01092026");
    await expect(l.filtra).toBeEnabled();
    await l.filtra.click();

    // expect: Body con init e end valorizzati, righe coerenti col mock
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].body).toEqual({ init: "2026-09-01", end: "2026-09-10", ordinamento: 1 });
    expect(lista[2].query).toMatchObject({ page: "1", pageSize: "10" });
    await expect(l.rows).toHaveCount(10);
    await expect(l.paginationLabel).toHaveText("1–10 of 25");
  });

  test("Validazione intervallo: Data fine precedente a Data inizio", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Impostare Data inizio 10/09/2026 e Data fine 01/09/2026
    await digita(l.dataInizio, "10092026");
    await digita(l.dataFine, "01092026");
    await expect(l.dataFine).toHaveValue("01/09/2026");

    // expect: 'Filtra' disabilitato finche' error e' true
    await expect(l.filtra).toBeDisabled();
    // NB: anche 'Annulla filtri' e' visibile ma disabilitato (FilterActionButtons riceve disabled={error})
    await expect(l.annulla).toBeDisabled();
    // expect: Nessuna chiamata alla lista
    expect(lista).toHaveLength(1);

    // 2. Correggere Data fine (>= Data inizio)
    await sostituisci(l.dataFine, "15092026");
    await expect(l.dataFine).toHaveValue("15/09/2026");

    // expect: Errore rimosso, 'Filtra' riabilitato
    await expect(l.filtra).toBeEnabled();
    await expect(l.annulla).toBeEnabled();
  });

  test("Validazione intervallo: Data inizio successiva a Data fine e date uguali", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Impostare prima Data fine, poi una Data inizio successiva
    await digita(l.dataFine, "10092026");
    // NB: diverge dalla spec: con Data inizio null la sola Data fine e' gia' in errore
    await expect(l.filtra).toBeDisabled();
    await digita(l.dataInizio, "15092026");
    await expect(l.dataInizio).toHaveValue("15/09/2026");

    // expect: Errore e 'Filtra' disabilitato (confronto simmetrico)
    await expect(l.filtra).toBeDisabled();

    // 2. Impostare Data inizio = Data fine
    await sostituisci(l.dataInizio, "10092026");
    await expect(l.dataInizio).toHaveValue("10/09/2026");

    // expect: Nessun errore (start > end e' false), 'Filtra' abilitato
    await expect(l.filtra).toBeEnabled();
    await l.filtra.click();
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].body).toEqual({ init: "2026-09-10", end: "2026-09-10", ordinamento: 1 });
  });

  test("Data non valida o campo svuotato", async ({ page }) => {
    const errori: string[] = [];
    page.on("pageerror", (e) => errori.push(e.message));
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Digitare una data incompleta/non valida
    await digita(l.dataInizio, "0109");

    // expect: Nessun crash; la data incompleta non e' una data valida: il body resta con init null
    expect(errori).toEqual([]);
    await expect(l.annulla).toHaveCount(0);
    await expect(l.filtra).toBeEnabled();
    await l.filtra.click();
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].body).toEqual(BODY_DEFAULT);

    // 2. Svuotare un campo precedentemente compilato
    await sostituisci(l.dataInizio, "01092026");
    await digita(l.dataFine, "10092026");
    await expect(l.dataFine).toHaveValue("10/09/2026");
    await expect(l.filtra).toBeEnabled();

    await svuota(l.dataInizio);
    // NB: diverge dalla spec: svuotare Data inizio con Data fine valorizzata imposta error=true
    await expect(l.filtra).toBeDisabled();
    await digita(l.dataInizio, "01092026");
    await expect(l.filtra).toBeEnabled();

    await svuota(l.dataFine);
    await expect(l.filtra).toBeEnabled();
    await expect(l.annulla).toBeVisible();
    await l.filtra.click();

    // expect: La chiave del body torna null
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].body).toEqual({ init: "2026-09-01", end: null, ordinamento: 1 });

    // expect: se entrambi vuoti 'Annulla filtri' scompare
    await svuota(l.dataInizio);
    await expect(l.annulla).toHaveCount(0);
    await expect(l.filtra).toBeEnabled();
    expect(errori).toEqual([]);
  });

  test("Annulla filtri", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Impostare le due date, 'Filtra' e poi 'Annulla filtri'
    await digita(l.dataInizio, "01092026");
    await digita(l.dataFine, "10092026");
    await l.filtra.click();
    await expect.poll(() => lista.length).toBe(2);
    await expect(l.rows).toHaveCount(10);
    await l.annulla.click();

    // expect: Campi data svuotati, 'Annulla filtri' scompare
    await expect(l.dataInizio).toHaveValue(VUOTO);
    await expect(l.dataFine).toHaveValue(VUOTO);
    await expect(l.annulla).toHaveCount(0);
    // expect: Nuova POST con body {init:null,end:null,ordinamento:1}, page=1&pageSize=10
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].body).toEqual(BODY_DEFAULT);
    expect(lista[2].query).toMatchObject({ page: "1", pageSize: "10" });
    await expect(l.rows).toHaveCount(10);
    // expect: Stato di errore azzerato
    await expect(l.filtra).toBeEnabled();
    // expect: localStorage 'filters' resettato (poi riscritto dalla lista ricaricata con il body di default)
    await expect.poll(async () => (await savedFilters(page))?.body).toEqual(BODY_DEFAULT);
    expect(await savedFilters(page)).toMatchObject({ page: 0, rows: 10 });
  });

  test("Annulla filtri riporta a pagina 1 e 10 righe", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Andare a pagina 2, impostare una data e cliccare 'Annulla filtri'
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("11–20 of 25");
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].query).toMatchObject({ page: "2", pageSize: "10" });
    await digita(l.dataInizio, "01092026");
    await expect(l.paginationLabel).toHaveText("0–0 of 0");
    await l.annulla.click();

    // expect: Richiesta con page=1&pageSize=10, paginatore '1-10 of N'
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].query).toMatchObject({ page: "1", pageSize: "10" });
    expect(lista[2].body).toEqual(BODY_DEFAULT);
    await expect(l.paginationLabel).toHaveText("1–10 of 25");
    await expect(l.rows).toHaveCount(10);
  });

  test("Annulla filtri azzera lo stato di errore delle date", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Creare un intervallo invalido
    await digita(l.dataInizio, "10092026");
    await digita(l.dataFine, "01092026");

    // expect: Filtra disabilitato; Annulla filtri visibile
    await expect(l.filtra).toBeDisabled();
    await expect(l.annulla).toBeVisible();
    // NB: diverge dalla spec: con error=true anche 'Annulla filtri' e' disabilitato, quindi non si puo'
    // cliccare per azzerare l'errore: bisogna prima correggere una data
    await expect(l.annulla).toBeDisabled();
    expect(lista).toHaveLength(1);

    // correggendo l'intervallo l'errore sparisce e 'Annulla filtri' ripristina i default
    await sostituisci(l.dataFine, "15092026");
    await expect(l.annulla).toBeEnabled();
    await l.annulla.click();

    // expect: Campi vuoti, 'Filtra' riabilitato, lista ricaricata con body di default
    await expect(l.dataInizio).toHaveValue(VUOTO);
    await expect(l.dataFine).toHaveValue(VUOTO);
    await expect(l.filtra).toBeEnabled();
    await expect(l.annulla).toHaveCount(0);
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].body).toEqual(BODY_DEFAULT);
  });

  test("Filtra non resetta la pagina", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Andare a pagina 2 e cliccare 'Filtra' senza cambiare filtri
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("11–20 of 25");
    await expect.poll(() => lista.length).toBe(2);
    await l.filtra.click();

    // expect: Comportamento attuale: richiesta con page=2 (handleFiltra usa page e rowsPerPage correnti)
    // NB: probabile bug (da confermare col team): se deve essere page=1 aggiornare il test
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].query).toMatchObject({ page: "2", pageSize: "10" });
    await expect(l.paginationLabel).toHaveText("11–20 of 25");

    // 2. Cambiare una data (page torna a 0) e cliccare 'Filtra'
    await digita(l.dataInizio, "01092026");
    await expect(l.paginationLabel).toHaveText("0–0 of 0");
    await l.filtra.click();

    // expect: Richiesta con page=1&pageSize=10
    await expect.poll(() => lista.length).toBe(4);
    expect(lista[3].query).toMatchObject({ page: "1", pageSize: "10" });
    expect(lista[3].body).toEqual({ init: "2026-09-01", end: null, ordinamento: 1 });
    await expect(l.paginationLabel).toHaveText("1–10 of 25");
  });
});
