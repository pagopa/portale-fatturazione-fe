// spec: specs/ente-asyncDocumenti.md (sezione 6)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  ROUTE, locators, makeDocumenti, mockAll, mockLista, openPage, savedFilters,
} from "../../utils/asyncDocumentiMock/asyncDocumentiMock";
import { mockAll as mockAllNotifiche, ROUTE_ENTE as ROUTE_NOTIFICHE } from "../../utils/notificheMock/notificheMock";
import { selectOption } from "../../utils/ente/docContabiliMock";

const BODY_DEFAULT = { init: null, end: null, ordinamento: 1 };
const ISO = /^\d{4}-\d{2}-\d{2}T/;

function filtri(page: Page) {
  return {
    ...locators(page),
    rowsPerPage: page.getByRole("combobox", { name: /Rows per page/ }).first(),
    sortDataRichiesta: page.getByRole("columnheader", { name: /Data Richiesta/ }).getByRole("button"),
    nav: page.getByRole("navigation"),
  };
}

// Apre la pagina e attende il caricamento iniziale (prima pagina da 10 righe)
async function ready(page: Page) {
  await openPage(page);
  const l = filtri(page);
  await expect(l.loading).toBeHidden();
  await expect(l.rows).toHaveCount(10);
  return l;
}

async function digita(campo: ReturnType<Page["getByRole"]>, valore: string) {
  await campo.click();
  await campo.pressSequentially(valore);
}

// Imposta 01/09/2026 - 10/09/2026 (senza cliccare Filtra)
async function impostaDate(l: ReturnType<typeof filtri>) {
  await digita(l.dataInizio, "01092026");
  await expect(l.dataInizio).toHaveValue("01/09/2026");
  await digita(l.dataFine, "10092026");
  await expect(l.dataFine).toHaveValue("10/09/2026");
}

// Precompila localStorage 'filters' prima del primo caricamento; il flag di sessione evita di sovrascriverlo al reload
async function seedFilters(page: Page, filters: Record<string, unknown>) {
  await page.addInitScript(
    ([f, flag]) => {
      if (location.origin !== "http://localhost:3000" || sessionStorage.getItem(flag as string)) return;
      localStorage.setItem("filters", JSON.stringify(f));
      sessionStorage.setItem(flag as string, "1");
    },
    [filters, "seedFiltriAsyncDocumenti"] as const,
  );
}

test.describe("Persistenza filtri", () => {
  test("Salvataggio dopo il caricamento lista", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // NB: diverge dalla spec ... listaDoc salva 'filters' dopo OGNI caricamento lista, anche il primo senza filtri
    await expect.poll(() => savedFilters(page)).toMatchObject({
      pathPage: ROUTE, page: 0, rows: 10, totalData: 25, body: BODY_DEFAULT,
    });

    // 1. Impostare le date, 'Filtra' e leggere localStorage 'filters'
    await impostaDate(l);
    await l.filtra.click();
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].body).toEqual({ init: "2026-09-01", end: "2026-09-10", ordinamento: 1 });

    // expect: Contiene pathPage '/ente/downloaddocumenti', body, page:0, rows:10, totalData uguale al count
    await expect.poll(async () => (await savedFilters(page))?.body?.init).toMatch(ISO);
    const saved = await savedFilters(page);
    expect(saved).toMatchObject({ pathPage: ROUTE, page: 0, rows: 10, totalData: 25, body: { ordinamento: 1 } });
    // NB: diverge dalla spec ... il body salvato contiene le date come Date serializzate (ISO), non YYYY-MM-DD
    expect(saved.body.end).toMatch(ISO);
  });

  test("Ripristino dopo reload", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);
    await impostaDate(l);
    await l.filtra.click();
    await expect.poll(() => lista.length).toBe(2);
    await expect.poll(async () => (await savedFilters(page))?.body?.init).toMatch(ISO);

    // 1. Dopo il salvataggio ricaricare la pagina
    await page.reload();
    await expect(l.loading).toBeHidden();

    // expect: Lista richiamata subito con le date salvate (YYYY-MM-DD)
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].query).toMatchObject({ page: "1", pageSize: "10" });
    expect(lista[2].body).toEqual({ init: "2026-09-01", end: "2026-09-10", ordinamento: 1 });
    // expect: Date ripristinate nei campi, 'Annulla filtri' visibile
    await expect(l.dataInizio).toHaveValue("01/09/2026");
    await expect(l.dataFine).toHaveValue("10/09/2026");
    await expect(l.annulla).toBeVisible();
    // expect: Paginatore con totalData salvato
    await expect(l.rows).toHaveCount(10);
    await expect(l.paginationLabel).toHaveText("1–10 of 25");
  });

  test("Ripristino di pagina, righe e ordinamento", async ({ page }) => {
    const { lista } = await mockAll(page, makeDocumenti(60));
    const l = await ready(page);

    // 1. Andare a pagina 2, cambiare righe per pagina, ordinare e ricaricare
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("11–20 of 60");
    // NB: diverge da Notifiche ... handleChangeRowsPerPage qui azzera la pagina (page=0)
    await selectOption(page, l.rowsPerPage, "25");
    await expect(l.paginationLabel).toHaveText("1–25 of 60");
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("26–50 of 60");
    await expect(l.rows).toHaveCount(25);
    const prima = lista.length;
    await l.sortDataRichiesta.click();
    await expect.poll(() => lista.length).toBe(prima + 1);
    expect(lista.at(-1)!.query).toMatchObject({ page: "2", pageSize: "25" });
    expect(lista.at(-1)!.body.ordinamento).toBe(0);
    // NB: diverge dalla spec ... il sort chiama listaDoc con page/rows correnti, quindi anche page/rows salvati sono aggiornati
    await expect.poll(() => savedFilters(page)).toMatchObject({ page: 1, rows: 25, body: { ordinamento: 0 } });
    await page.reload();
    await expect(l.loading).toBeHidden();

    // expect: La richiesta iniziale usa page, pageSize e ordinamento salvati
    await expect.poll(() => lista.length).toBe(prima + 2);
    expect(lista.at(-1)!.query).toMatchObject({ page: "2", pageSize: "25" });
    expect(lista.at(-1)!.body).toEqual({ init: null, end: null, ordinamento: 0 });
    await expect(l.paginationLabel).toHaveText("26–50 of 60");
    await expect(l.rowsPerPage).toHaveText("25");
    await expect(l.rows).toHaveCount(25);
  });

  test("Annulla filtri pulisce la persistenza", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Applicare filtri, 'Annulla filtri' e ricaricare
    await impostaDate(l);
    await l.filtra.click();
    await expect.poll(async () => (await savedFilters(page))?.body?.init).toMatch(ISO);
    await l.annulla.click();

    // NB: diverge dalla spec ... resetFilters rimuove 'filters' ma il listaDoc successivo lo riscrive col body di default
    await expect.poll(() => savedFilters(page)).toMatchObject({
      pathPage: ROUTE, page: 0, rows: 10, body: BODY_DEFAULT,
    });
    await expect(l.dataInizio).toHaveValue("");
    await expect(l.dataFine).toHaveValue("");
    await expect(l.annulla).toHaveCount(0);
    const prima = lista.length;
    await page.reload();
    await expect(l.loading).toBeHidden();

    // expect: Nessun filtro attivo, richiesta con body di default, pagina 1 e 10 righe
    await expect.poll(() => lista.length).toBe(prima + 1);
    expect(lista.at(-1)!.query).toMatchObject({ page: "1", pageSize: "10" });
    expect(lista.at(-1)!.body).toEqual(BODY_DEFAULT);
    await expect(l.dataInizio).toHaveValue("");
    await expect(l.dataFine).toHaveValue("");
    await expect(l.annulla).toHaveCount(0);
    await expect(l.rows).toHaveCount(10);
    await expect(l.paginationLabel).toHaveText("1–10 of 25");
  });

  test("Salvataggio dopo errore", async ({ page }) => {
    // la prima chiamata (caricamento iniziale) va a buon fine, la seconda (Filtra) fallisce
    const lista = await mockLista(page, makeDocumenti(25), (n) => (n === 1 ? 200 : 500));
    const l = await ready(page);

    // 1. Mockare la lista con 500 dopo aver impostato le date
    await impostaDate(l);
    await l.filtra.click();
    await expect.poll(() => lista.length).toBe(2);
    await expect(l.loading).toBeHidden();

    // expect: localStorage 'filters' salvato con body corrente, page:0, rows:10, totalData:0
    await expect.poll(() => savedFilters(page)).toMatchObject({
      pathPage: ROUTE, page: 0, rows: 10, totalData: 0, body: { ordinamento: 1 },
    });
    const saved = await savedFilters(page);
    expect(saved.body.init).toMatch(ISO);
    expect(saved.body.end).toMatch(ISO);
    await expect(l.empty).toBeVisible();
  });

  test("Filtri salvati di un altro pathPage o malformati", async ({ page }) => {
    const { lista } = await mockAll(page);

    // 1. Precompilare 'filters' con pathPage di un'altra pagina e aprire la pagina
    await seedFilters(page, {
      pathPage: ROUTE_NOTIFICHE,
      body: { init: "2026-09-01T00:00:00.000Z", end: "2026-09-10T00:00:00.000Z", ordinamento: 0 },
      page: 2,
      rows: 25,
      totalData: 99,
    });
    const l = await ready(page);

    // expect: Filtri ignorati: richiesta con body di default
    expect(lista).toHaveLength(1);
    expect(lista[0].query).toMatchObject({ page: "1", pageSize: "10" });
    expect(lista[0].body).toEqual(BODY_DEFAULT);
    await expect(l.dataInizio).toHaveValue("");
    await expect(l.dataFine).toHaveValue("");
    await expect(l.annulla).toHaveCount(0);
    await expect(l.paginationLabel).toHaveText("1–10 of 25");
    // i filtri dell'altra pagina sono stati rimossi e sostituiti da quelli di questa pagina
    await expect.poll(() => savedFilters(page)).toMatchObject({ pathPage: ROUTE, body: BODY_DEFAULT, totalData: 25 });

    // 2. Precompilare 'filters' con JSON malformato
    await page.evaluate(() => localStorage.setItem("filters", '{"pathPage":"/ente/downloaddocumenti","body":{init:'));
    await page.reload();

    // NB: diverge dalla spec (nessun crash): useSavedFilters fa JSON.parse senza try/catch, la pagina va in crash
    // (schermata bianca); bug applicativo da segnalare
    await expect(l.title).toHaveCount(0);
  });

  test("Navigazione in altra pagina e ritorno", async ({ page }) => {
    const { lista } = await mockAll(page);
    await mockAllNotifiche(page);
    const l = await ready(page);

    // 1. Applicare un filtro, aprire 'Notifiche' dal menu e tornare a 'Download documenti'
    await impostaDate(l);
    await l.filtra.click();
    await expect.poll(() => lista.length).toBe(2);
    await expect.poll(async () => (await savedFilters(page))?.body?.init).toMatch(ISO);
    await l.nav.getByRole("button", { name: "Notifiche", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Notifiche", exact: true })).toBeVisible();
    await expect(l.loading).toBeHidden();

    // expect: I filtri non vengono mischiati con quelli di Notifiche (pathPage diverso)
    // NB: diverge dalla spec: useSavedFilters di Notifiche rimuove i filtri con pathPage diverso e Notifiche
    // salva solo su Filtra, quindi 'filters' resta vuoto
    await expect.poll(() => savedFilters(page)).toBeNull();

    await l.nav.getByRole("button", { name: "Download documenti", exact: true }).click();
    await expect(l.title).toBeVisible();
    await expect(l.loading).toBeHidden();

    // NB: diverge dalla spec (filtri mantenuti): Notifiche ha sostituito 'filters' (pathPage diverso),
    // quindi tornando su Download documenti le date tornano ai default
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].body).toEqual(BODY_DEFAULT);
    await expect(l.dataInizio).toHaveValue("");
    await expect(l.dataFine).toHaveValue("");
    await expect(l.annulla).toHaveCount(0);
    await expect(l.rows).toHaveCount(10);
    await expect.poll(() => savedFilters(page)).toMatchObject({ pathPage: ROUTE, body: BODY_DEFAULT });
  });
});
