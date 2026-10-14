// spec: specs/ente-docsospesi.md (sezione 8)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import type { Page } from "@playwright/test";
import { makeFatture, mockAll, openPage, selectOption, selectTipologie } from "../../utils/docsospesi/docSospesiMock";

const savedFilters = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("filters") ?? "null"));

test.describe("Persistenza filtri e navigazione", () => {
  test("Persistenza dei filtri dopo reload", async ({ page }) => {
    await mockAll(page);
    const l = await openPage(page);

    // 1. Selezionare Anno 2024 + tipologia PRIMO SALDO, cliccare Filtra e ricaricare
    await selectOption(page, l.anno, "2024");
    await selectTipologie(page, l, "PRIMO SALDO");
    await l.filtra.click();
    await expect(l.rows).toHaveCount(2);

    // expect: localStorage 'filters' con pathPage '/ente/docsospesi' e body con i filtri
    const before = await savedFilters(page);
    expect(before.pathPage).toBe("/ente/docsospesi");
    expect(before.body).toMatchObject({ anno: 2024, tipologiaFattura: ["PRIMO SALDO"] });

    await page.reload();

    // expect: Anno, chip, griglia, paginatore e Credito sospeso ripristinati, 'Annulla filtri' visibile
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

    // 1. Cambiare righe per pagina, ordinare per Tot., andare a pagina 2 e ricaricare
    await selectOption(page, l.rowsPerPage, "25");
    await l.sortButton("Tot.").click();
    await l.sortButton("Tot.").click();
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("26–33 of 33");
    const firstRowBefore = await l.rows.first().textContent();

    await page.reload();

    // expect: Stessa pagina, stesse righe per pagina e stesso ordinamento dopo il reload
    await expect(l.loading).toBeHidden();
    await expect(l.paginationLabel).toHaveText("26–33 of 33");
    await expect(l.rows).toHaveCount(8);
    await expect(l.sortButton("Tot.").getByTestId("ArrowDownwardIcon")).toBeVisible();
    expect(await l.rows.first().textContent()).toBe(firstRowBefore);
  });

  test("Filtri separati tra sospesi ed emessi", async ({ page }) => {
    await mockAll(page);
    // API della pagina emessi: risposte vuote
    await page.route((url) => url.pathname.endsWith("/api/fatture/ente/periodo"), (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" }));
    await page.route((url) => /\/api\/fatture\/ente\/(periodo\/emesse|eliminate)$/.test(url.pathname), (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ dettagli: [], importo: 0 }) }));
    const l = await openPage(page);

    // 1. Applicare un filtro, aprire 'Documenti contabili emessi' dal menu e tornare a 'Documenti contabili sospesi'
    await selectOption(page, l.anno, "2024");
    await l.filtra.click();
    await expect(l.annulla).toBeVisible();
    await l.nav.getByRole("button", { name: "Documenti contabili emessi" }).click();
    await expect(page.getByRole("heading", { name: "Documenti contabili emessi" })).toBeVisible();

    // expect: I filtri non vengono applicati alla pagina emessi (pathPage diverso)
    await expect(page.getByRole("combobox").first()).toHaveText("Tutti");
    await expect(l.annulla).toHaveCount(0);
    expect((await savedFilters(page))?.pathPage).not.toBe("/ente/docsospesi");

    await l.nav.getByRole("button", { name: "Documenti contabili sospesi" }).click();

    // expect: Tornando su sospesi i filtri non sono piu' presenti
    await expect(l.heading).toBeVisible();
    await expect(l.loading).toBeHidden();
    await expect(l.anno).toHaveText("Tutti");
    await expect(l.annulla).toHaveCount(0);
    await expect(l.rows).toHaveCount(6);
  });

  test("Annulla filtri pulisce la persistenza", async ({ page }) => {
    await mockAll(page);
    const l = await openPage(page);

    // 1. Applicare un filtro, cliccare Annulla filtri e ricaricare
    await selectOption(page, l.anno, "2025");
    await l.filtra.click();
    await expect(l.rows).toHaveCount(1);
    await l.annulla.click();
    await expect(l.rows).toHaveCount(6);
    await page.reload();

    // expect: Nessun filtro attivo dopo il reload, 'Annulla filtri' assente
    await expect(l.loading).toBeHidden();
    await expect(l.anno).toHaveText("Tutti");
    await expect(l.annulla).toHaveCount(0);
    await expect(l.rows).toHaveCount(6);
  });

  // BUG APP: src/hooks/useSaveFiltersLocalStorage.ts fa JSON.parse di 'filters' senza try/catch: con JSON
  // malformato la pagina va in crash (schermata bianca). Il passo 1 (anno 1999) e' gestito correttamente.
  // Atteso dalla spec 8.5: nessun crash e filtri di default. Asserzioni invariate.
  test.fixme("Filtri salvati non piu' validi", async ({ page }) => {
    await mockAll(page);
    const l = await openPage(page);

    // 1. Impostare 'filters' con pathPage '/ente/docsospesi' e anno 1999, poi ricaricare
    await page.evaluate(() => localStorage.setItem("filters", JSON.stringify({
      pathPage: "/ente/docsospesi",
      body: { anno: 1999, mese: 9999, tipologiaFattura: [], dataFattura: [] },
      page: 0,
      rows: 10,
      objectSort: { "Data Fattura": 1, "Ident.": 1, "Tot.": 1, "N. Fattura": 1, "Tipo Documento": 1 },
    })));
    await page.reload();

    // expect: Nessun crash, griglia vuota, 'Annulla filtri' visibile
    await expect(l.heading).toBeVisible();
    await expect(l.empty).toBeVisible();
    await expect(l.annulla).toBeVisible();

    // 2. Impostare 'filters' con JSON malformato e ricaricare
    await page.evaluate(() => localStorage.setItem("filters", '{"pathPage":"/ente/docsospesi","body":{anno:'));
    await page.reload();

    // expect: Nessun crash e filtri di default
    await expect(l.heading).toBeVisible();
    await expect(l.anno).toHaveText("Tutti");
  });
});
