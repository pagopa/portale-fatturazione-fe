// spec: specs/ente-docemessi.md
// seed: tests/auth.setup.ts

import { test, expect } from "@playwright/test";

test.describe("Persistenza filtri e navigazione", () => {
  // BUG APP: con 'filters' in localStorage malformato la pagina va in crash (schermata bianca)
  // perche' src/hooks/useSaveFiltersLocalStorage.ts (riga 8) fa JSON.parse senza try/catch.
  // Atteso dalla spec 8.5: nessun crash. Il test fallisce sull'ultimo step (heading non visibile).
  test.fixme("Filtri salvati non più validi", async ({ page }) => {
    const heading = page.getByRole("heading", {
      name: "Documenti contabili emessi",
    });
    const annoCombobox = page.getByRole("combobox").first();

    // Aprire la pagina una prima volta per posizionarsi sull'origine dell'app
    await page.goto("/ente/docemessi");
    await expect(heading).toBeVisible();

    // Impostare in localStorage 'filters' un anno non presente nel periodo (1999)
    await page.evaluate(() =>
      localStorage.setItem(
        "filters",
        JSON.stringify({
          pathPage: "/ente/docemessi",
          body: { anno: 1999, mese: 9999, tipologiaFattura: [], dataFattura: [] },
          page: 0,
          rows: 10,
          pageContestate: 0,
          rowsPerPageContestate: 10,
          objectSort: {
            "Data Fattura": 1,
            "Ident.": 1,
            "Tot.": 1,
            "N. Fattura": 1,
            "Tipo Documento": 1,
          },
          objectSortContestate: {
            "Data Fattura": 1,
            "Ident.": 1,
            "Tot.": 1,
            "N. Fattura": 1,
            "Tipo Documento": 1,
          },
        }),
      ),
    );
    await page.reload();

    // expect: nessun crash della pagina con anno non valido.
    // Osservato: la pagina resta utilizzabile, la select Anno mostra 1999 (valore
    // fuori range, warning MUI in console), la griglia e' vuota, "Annulla filtri" visibile.
    await expect(heading).toBeVisible();
    await expect(annoCombobox).toHaveText("1999");
    await expect(page.getByText("Non sono presenti fatture emesse")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Annulla filtri" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Filtra", exact: true })).toBeVisible();

    // Impostare in localStorage 'filters' un JSON malformato
    await page.evaluate(() =>
      localStorage.setItem(
        "filters",
        '{"pathPage":"/ente/docemessi","body":{anno:',
      ),
    );
    await page.reload();

    // expect: nessun crash della pagina con JSON malformato.
    // Comportamento effettivo: schermata bianca (SyntaxError in JSON.parse); atteso: pagina
    // funzionante con filtri di default. Asserzioni invariate.
    await expect(heading).toBeVisible();
    await expect(annoCombobox).toHaveText("Tutti");
  });
});
