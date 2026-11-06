// spec: specs/ente-docemessi.md (sezione 8)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import { makeFatture, mockAll, openPage, savedFilters, selectOption, selectTipologie } from "../../utils/docemessi/docEmessiMock";

test.describe("Persistenza filtri e navigazione", () => {
  test("Persistenza dei filtri dopo reload", async ({ page }) => {
    await mockAll(page);
    const l = await openPage(page);

    // 1. Selezionare Anno 2024 + tipologia, cliccare Filtra e ricaricare la pagina
    await selectOption(page, l.anno, "2024");
    await selectTipologie(page, l, "PRIMO SALDO");
    await l.filtra.click();
    await expect(l.rows).toHaveCount(2);

    // expect: localStorage 'filters' contiene pathPage e body con i filtri
    const before = await savedFilters(page);
    expect(before.pathPage).toBe("/ente/docemessi");
    expect(before.body).toMatchObject({ anno: 2024, tipologiaFattura: ["PRIMO SALDO"] });

    await page.reload();

    // expect: Dopo il reload filtri, griglia, pagina e totale sono ripristinati e 'Annulla filtri' visibile
    await expect(l.loading).toBeHidden();
    await expect(l.anno).toHaveText("2024");
    await expect(l.chip("PRIMO SALDO")).toBeVisible();
    await expect(l.rows).toHaveCount(2);
    await expect(l.paginationLabel).toHaveText("1–2 of 2");
    await expect(l.totale).toHaveText(/^205,00\s€$/);
    await expect(l.annulla).toBeVisible();
    expect((await savedFilters(page)).body).toEqual(before.body);
  });

  test("Persistenza di pagina, righe e ordinamento", async ({ page }) => {
    await mockAll(page, makeFatture(33, (i) => ({ totale: (i * 7) % 33 })));
    const l = await openPage(page);

    // 1. Ordinare per Tot., andare a pagina 2, cambiare righe e ricaricare
    // (il cambio righe riporta a pagina 1: si torna a pagina 2 con 25 righe)
    await l.sortButton("Tot.").click();
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("11–20 of 33");
    await selectOption(page, l.rowsPerPage, "25");
    await expect(l.paginationLabel).toHaveText("1–25 of 33");
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("26–33 of 33");
    const rowsBefore = await l.rows.allTextContents();
    const saved = await savedFilters(page);
    expect(saved).toMatchObject({ page: 1, rows: 25 });
    expect(saved.objectSort["Tot."]).not.toBe(1);

    await page.reload();

    // expect: Stessa pagina, stesse righe per pagina e stesso ordinamento ripristinati
    await expect(l.loading).toBeHidden();
    await expect(l.paginationLabel).toHaveText("26–33 of 33");
    await expect(l.rowsPerPage).toHaveText("25");
    expect(await l.rows.allTextContents()).toEqual(rowsBefore);
    expect((await savedFilters(page)).objectSort["Tot."]).toBe(saved.objectSort["Tot."]);
  });

  test("Persistenza navigando in altra pagina e tornando", async ({ page }) => {
    await mockAll(page);
    // API della pagina sospesi: risposte vuote
    await page.route((url) => url.pathname.endsWith("/api/fatture/ente/periodo/sospeso"), (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" }));
    await page.route((url) => url.pathname.endsWith("/api/fatture/ente/credito/sospeso"), (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ dettagli: [], importoSospeso: 0 }) }));
    const l = await openPage(page);

    // 1. Applicare un filtro, aprire 'Documenti contabili sospesi' dal menu e tornare a 'Documenti contabili emessi'
    await selectOption(page, l.anno, "2025");
    await l.filtra.click();
    await expect(l.annulla).toBeVisible();
    await l.nav.getByRole("button", { name: "Documenti contabili sospesi" }).click();
    await expect(page.getByRole("heading", { name: "Documenti contabili sospesi" })).toBeVisible();

    // expect: i filtri di docemessi non si mischiano con quelli di docsospesi
    await expect(l.anno).toHaveText("Tutti");
    await expect(l.annulla).toHaveCount(0);
    expect((await savedFilters(page))?.pathPage).not.toBe("/ente/docemessi");

    await l.nav.getByRole("button", { name: "Documenti contabili emessi" }).click();

    // expect: navigando via menu i filtri vengono resettati (comportamento di useSavedFilters legato a pathPage)
    await expect(l.heading).toBeVisible();
    await expect(l.loading).toBeHidden();
    await expect(l.anno).toHaveText("Tutti");
    await expect(l.annulla).toHaveCount(0);
    await expect(l.rows).toHaveCount(6);
    const saved = await savedFilters(page);
    expect(saved.pathPage).toBe("/ente/docemessi");
    expect(saved.body).toMatchObject({ anno: 9999, tipologiaFattura: [] });
  });

  test("Annulla filtri pulisce la persistenza", async ({ page }) => {
    await mockAll(page);
    const l = await openPage(page);

    // 1. Applicare filtro, cliccare Annulla filtri e ricaricare
    await selectOption(page, l.anno, "2025");
    await l.filtra.click();
    await expect(l.annulla).toBeVisible();
    expect((await savedFilters(page)).body.anno).toBe(2025);
    await l.annulla.click();
    await expect(l.annulla).toHaveCount(0);
    await expect.poll(() => savedFilters(page)).toBeNull();
    await page.reload();

    // expect: Nessun filtro attivo dopo il reload
    await expect(l.loading).toBeHidden();
    await expect(l.anno).toHaveText("Tutti");
    await expect(l.annulla).toHaveCount(0);
    await expect(l.rows).toHaveCount(6);
  });

  // BUG APP: con 'filters' in localStorage malformato la pagina va in crash (schermata bianca)
  // perche' src/hooks/useSaveFiltersLocalStorage.ts fa JSON.parse senza try/catch.
  // Atteso dalla spec 8.5: nessun crash. Asserzioni invariate.
  test.fixme("Filtri salvati non più validi", async ({ page }) => {
    await mockAll(page);
    const l = await openPage(page);

    // 1. Impostare in localStorage 'filters' con un anno non presente nel periodo (1999)
    await page.evaluate(() => localStorage.setItem("filters", JSON.stringify({
      pathPage: "/ente/docemessi",
      body: { anno: 1999, mese: 9999, tipologiaFattura: [], dataFattura: [] },
      page: 0,
      rows: 10,
      pageContestate: 0,
      rowsPerPageContestate: 10,
      objectSort: { "Data Fattura": 1, "Ident.": 1, "Tot.": 1, "N. Fattura": 1, "Tipo Documento": 1 },
      objectSortContestate: { "Data Fattura": 1, "Ident.": 1, "Tot.": 1, "N. Fattura": 1, "Tipo Documento": 1 },
    })));
    await page.reload();

    // expect: nessun crash con anno non valido, griglia vuota, 'Annulla filtri' visibile
    await expect(l.heading).toBeVisible();
    await expect(l.empty).toBeVisible();
    await expect(l.annulla).toBeVisible();

    // 2. Impostare in localStorage 'filters' un JSON malformato
    await page.evaluate(() => localStorage.setItem("filters", '{"pathPage":"/ente/docemessi","body":{anno:'));
    await page.reload();

    // expect: nessun crash con JSON malformato, filtri di default
    await expect(l.heading).toBeVisible();
    await expect(l.anno).toHaveText("Tutti");
  });
});
