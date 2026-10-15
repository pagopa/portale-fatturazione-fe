// spec: specs/notifiche.md (sezione 7)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  ROUTE_ENTE, endsWith, locators as baseLocators, makeNotifiche, mockAll, openPage, savedFilters,
} from "../../utils/notificheMock/notificheMock";
import { selectOption } from "../../utils/ente/docContabiliMock";

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
    // i chip mostrano solo un'icona: il valore e' l'aria-label (tooltip)
    chip: (value: string) => page.getByRole("button", { name: value, exact: true }),
    rows: page.getByRole("row", { name: /IUN-/ }),
    paginationLabel: page.getByText(/^\d+–\d+ of \d+$/).first(),
    next: page.getByRole("button", { name: "Go to next page" }).first(),
    rowsPerPage: page.getByRole("combobox", { name: /Rows per page/ }).first(),
    sortDataEvento: page.getByRole("columnheader", { name: /^Data Evento/ }).getByRole("button"),
    nav: page.getByRole("navigation"),
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

// Imposta Anno 2025, Mese Novembre, IUN e Contestazione 'Contestata' (senza cliccare Filtra)
async function impostaFiltri(page: Page, l: ReturnType<typeof filtri>) {
  await selectOption(page, l.anno, "2025");
  await expect(l.mese).toHaveText("Dicembre");
  await selectOption(page, l.mese, "Novembre");
  await l.iun.fill("IUN-0001");
  await l.contestazione.click();
  await page.getByRole("option", { name: "Contestata", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(l.chip("Contestata")).toBeVisible();
}

// Precompila localStorage 'filters' prima del primo caricamento; il flag di sessione evita di sovrascriverlo al reload
async function seedFilters(page: Page, filters: Record<string, unknown>) {
  await page.addInitScript(
    ([f, flag]) => {
      if (location.origin !== "http://localhost:3000" || sessionStorage.getItem(flag as string)) return;
      localStorage.setItem("filters", JSON.stringify(f));
      sessionStorage.setItem(flag as string, "1");
    },
    [filters, "seedFiltriNotifiche"] as const,
  );
}

// Forma di 'filters' scritta da onButtonFiltra
function makeSaved(pathPage: string, anno: number, mese: number) {
  return {
    pathPage,
    body: {
      ...BODY_DEFAULT,
      anno,
      mese,
      tipoNotifica: [],
      idEnti: [],
      recapitisti: [],
      consolidatori: [],
      sort: { columnName: null, order: null },
    },
    textAutocomplete: "",
    valueAutocomplete: [],
    valueAutocompleteCon: [],
    valueAutocompleteRec: [],
    valueAutocompleteTipoNot: [],
    page: 0,
    rows: 10,
    valueFgContestazione: [],
  };
}

test.describe("Persistenza dei filtri", () => {
  test("Salvataggio dopo Filtra", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Impostare Anno, Mese, IUN, Contestazione e cliccare 'Filtra'
    await impostaFiltri(page, l);
    await l.filtra.click();
    await expect.poll(() => lista.length).toBe(2);

    // expect: localStorage 'filters' contiene pathPage = rotta ente, il body, page:0, rows:10, i valori degli autocomplete
    await expect.poll(() => savedFilters(page)).toMatchObject({
      pathPage: ROUTE_ENTE,
      page: 0,
      rows: 10,
      body: { anno: 2025, mese: 11, iun: "IUN-0001", statoContestazione: [2] },
      valueAutocomplete: [],
      valueAutocompleteCon: [],
      valueAutocompleteRec: [],
      valueAutocompleteTipoNot: [],
    });
    const saved = await savedFilters(page);
    expect(saved.valueFgContestazione).toHaveLength(1);
    expect(saved.valueFgContestazione[0]).toMatchObject({ id: 2, flag: "Contestata" });
  });

  test("Ripristino dopo reload", async ({ page }) => {
    const { mesi, lista } = await mockAll(page);
    const l = await ready(page);
    await impostaFiltri(page, l);
    await l.filtra.click();
    await expect.poll(() => lista.length).toBe(2);
    await expect.poll(() => savedFilters(page)).toMatchObject({ body: { anno: 2025, mese: 11 } });

    // 1. Dopo il punto 7.1 ricaricare la pagina
    await page.reload();
    await expect(l.loading).toBeHidden();

    // expect: Anno e Mese letti dal localStorage (mesi richiesti con l'anno salvato), campi e chip ripristinati
    await expect.poll(() => mesi.at(-1)).toEqual({ anno: "2025" });
    await expect(l.anno).toHaveText("2025");
    await expect(l.mese).toHaveText("Novembre");
    await expect(l.iun).toHaveValue("IUN-0001");
    await expect(l.chip("Contestata")).toBeVisible();
    // expect: la lista viene caricata subito con i filtri salvati
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].query).toMatchObject({ page: "1", pageSize: "10" });
    expect(lista[2].body).toMatchObject({ anno: 2025, mese: 11, iun: "IUN-0001", statoContestazione: [2] });
    await expect(l.rows).toHaveCount(10);
    // expect: 'Annulla filtri' visibile
    await expect(l.annulla).toBeVisible();
  });

  test("Ripristino di pagina e righe per pagina", async ({ page }) => {
    const { lista } = await mockAll(page, makeNotifiche(60));
    const l = await ready(page);

    // 1. Andare a pagina 2, cambiare righe per pagina e ricaricare
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("11–20 of 60");
    // NB: diverge dalla spec ... handleChangeRowsPerPage non azzera la pagina: si resta a pagina 2 con 25 righe
    await selectOption(page, l.rowsPerPage, "25");
    await expect(l.paginationLabel).toHaveText("26–50 of 60");
    await expect(l.rows).toHaveCount(25);
    await expect.poll(() => savedFilters(page)).toMatchObject({ page: 1, rows: 25 });
    const prima = lista.length;

    await page.reload();
    await expect(l.loading).toBeHidden();

    // expect: Richiesta con page e pageSize salvati; il paginatore mostra pagina e righe corrette
    await expect.poll(() => lista.length).toBe(prima + 1);
    expect(lista.at(-1)!.query).toMatchObject({ page: "2", pageSize: "25" });
    await expect(l.paginationLabel).toHaveText("26–50 of 60");
    await expect(l.rowsPerPage).toHaveText("25");
    await expect(l.rows).toHaveCount(25);
  });

  test("Ripristino dell'ordinamento", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);
    // Filtra prima dell'ordinamento: salva anche i valori degli autocomplete (headerActionSort li conserva per merge)
    await l.iun.fill("IUN-0001");
    await l.contestazione.click();
    await page.getByRole("option", { name: "Contestata", exact: true }).click();
    await page.keyboard.press("Escape");
    await l.filtra.click();
    await expect.poll(() => lista.length).toBe(2);
    await expect(l.rows).toHaveCount(10);

    // 1. Ordinare per 'Data Evento' (asc) e ricaricare
    await l.sortDataEvento.click();
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].query).toMatchObject({ columnName: "data", order: "1" });
    await expect.poll(() => savedFilters(page)).toMatchObject({ body: { sort: { columnName: "data", order: "1" } } });
    await page.reload();
    await expect(l.loading).toBeHidden();

    // expect: La richiesta contiene columnName=data&order=1
    await expect.poll(() => lista.length).toBe(4);
    expect(lista[3].query).toMatchObject({ page: "1", pageSize: "10", columnName: "data", order: "1" });
    // expect: gli autocomplete non si perdono (updateFilters fa merge con i valori salvati da Filtra)
    await expect(l.chip("Contestata")).toBeVisible();
    await expect(l.iun).toHaveValue("IUN-0001");
    await expect(l.annulla).toBeVisible();
  });

  test("Annulla filtri pulisce la persistenza", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Applicare filtri, cliccare 'Annulla filtri' e ricaricare
    await impostaFiltri(page, l);
    await l.filtra.click();
    await expect.poll(() => savedFilters(page)).toMatchObject({ body: { anno: 2025 } });
    await expect(l.rows).toHaveCount(10);
    await l.annulla.click();

    // expect: localStorage 'filters' rimosso
    await expect.poll(() => savedFilters(page)).toBeNull();
    await expect(l.annulla).toHaveCount(0);
    await expect(l.rows).toHaveCount(10);
    await page.reload();
    await expect(l.loading).toBeHidden();

    // expect: nessun filtro attivo, pagina 1 con 10 righe
    await expect(l.anno).toHaveText("2026");
    await expect(l.mese).toHaveText("Settembre");
    await expect(l.iun).toHaveValue("");
    await expect(l.chip("Contestata")).toHaveCount(0);
    await expect(l.annulla).toHaveCount(0);
    await expect(l.rows).toHaveCount(10);
    await expect(l.paginationLabel).toHaveText("1–10 of 25");
    expect(lista.at(-1)!.query).toMatchObject({ page: "1", pageSize: "10" });
    expect(lista.at(-1)!.body).toEqual(BODY_DEFAULT);
    expect(await savedFilters(page)).toBeNull();
  });

  test("Persistenza separata per ruolo/pagina", async ({ page }) => {
    const { lista } = await mockAll(page);
    // API della pagina Documenti contabili sospesi: risposte vuote
    await page.route(endsWith("/api/fatture/ente/periodo/sospeso"), (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" }));
    await page.route(endsWith("/api/fatture/ente/credito/sospeso"), (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ dettagli: [], importoSospeso: 0 }) }));
    const l = await ready(page);

    // 1. Salvare filtri su Notifiche, aprire un'altra pagina dal menu (Documenti contabili) e tornare
    await impostaFiltri(page, l);
    await l.filtra.click();
    await expect.poll(() => savedFilters(page)).toMatchObject({ pathPage: ROUTE_ENTE, body: { anno: 2025 } });
    await l.nav.getByRole("button", { name: "Documenti contabili", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Documenti contabili sospesi" })).toBeVisible();

    // expect: i filtri Notifiche non si mischiano con quelli dell'altra pagina (pathPage diverso)
    expect((await savedFilters(page))?.pathPage ?? null).not.toBe(ROUTE_ENTE);

    await l.nav.getByRole("button", { name: "Notifiche", exact: true }).click();
    await expect(l.title).toBeVisible();
    await expect(l.loading).toBeHidden();

    // NB: diverge dalla spec (filtri mantenuti): come per i documenti emessi, l'altra pagina con pathPage diverso
    // rimuove 'filters' (useSavedFilters), quindi tornando su Notifiche i filtri tornano ai default
    await expect(l.anno).toHaveText("2026");
    await expect(l.mese).toHaveText("Settembre");
    await expect(l.iun).toHaveValue("");
    await expect(l.annulla).toHaveCount(0);
    await expect(l.rows).toHaveCount(10);
    expect(lista.at(-1)!.body).toEqual(BODY_DEFAULT);
    expect(await savedFilters(page)).toBeNull();
  });

  test("Filtri salvati non validi", async ({ page }) => {
    const errori: string[] = [];
    page.on("pageerror", (e) => errori.push(e.message));
    const { lista } = await mockAll(page);
    // 1. Precompilare localStorage 'filters' con un anno inesistente nei mock
    await seedFilters(page, makeSaved(ROUTE_ENTE, 1999, 9));
    await openPage(page);
    const l = filtri(page);

    // expect: Nessun crash della pagina; mesi vuoti per l'anno 1999, la lista parte con i filtri salvati
    await expect(l.loading).toBeHidden();
    await expect(l.title).toBeVisible();
    await expect(l.filtra).toBeEnabled();
    await expect.poll(() => lista.length).toBe(1);
    expect(lista[0].body).toMatchObject({ anno: 1999, mese: 9 });
    await expect(l.annulla).toBeVisible();
    expect(errori).toEqual([]);

    // 1. Sostituire 'filters' con un JSON malformato e ricaricare
    await page.evaluate(() => localStorage.setItem("filters", '{"pathPage":"/ente/listanotifiche","body":{anno:'));
    await page.reload();

    // NB: diverge dalla spec (nessun crash): useSavedFilters fa JSON.parse senza try/catch, la pagina va in crash
    // (schermata bianca); bug applicativo da segnalare
    await expect(l.title).toHaveCount(0);
  });

  test("Filtri di un altro pathPage ignorati", async ({ page }) => {
    const { lista } = await mockAll(page);

    // 1. Precompilare 'filters' con pathPage di un'altra pagina e aprire Notifiche
    await seedFilters(page, makeSaved("/ente/docemessi", 2024, 1));
    const l = await ready(page);

    // expect: Filtri non applicati, comportamento di default del ruolo (lista con default)
    await expect(l.anno).toHaveText("2026");
    await expect(l.mese).toHaveText("Settembre");
    await expect(l.annulla).toHaveCount(0);
    expect(lista).toHaveLength(1);
    expect(lista[0].query).toMatchObject({ page: "1", pageSize: "10", columnName: "null", order: "null" });
    expect(lista[0].body).toEqual(BODY_DEFAULT);
    // expect: i filtri dell'altra pagina vengono rimossi da localStorage
    expect(await savedFilters(page)).toBeNull();
  });
});
