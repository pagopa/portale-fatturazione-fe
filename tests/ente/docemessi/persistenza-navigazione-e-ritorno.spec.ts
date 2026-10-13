// spec: specs/ente-docemessi.md
// seed: tests/auth.setup.ts

import { test, expect } from "@playwright/test";

test.describe("Persistenza filtri e navigazione", () => {
  test("Persistenza navigando in altra pagina e tornando", async ({ page }) => {
    await page.goto("/ente/docemessi");
    await expect(page.getByText("1–10 of 26").first()).toBeVisible();

    const annoCombobox = page.getByRole("combobox").first();
    const annulla = page.getByRole("button", { name: "Annulla filtri" });
    const getFilters = () =>
      page.evaluate(() => localStorage.getItem("filters"));

    // Applicare un filtro
    await annoCombobox.click();
    await page.getByRole("option", { name: "2025" }).click();
    await page.getByRole("button", { name: "Filtra", exact: true }).click();
    await expect(annulla).toBeVisible();
    await expect(annoCombobox).toHaveText("2025");

    // Aprire 'Documenti contabili sospesi' dal menu laterale
    await page
      .getByRole("button", { name: "Documenti contabili sospesi" })
      .click();
    await expect(page).toHaveURL(/\/ente\/docsospesi$/);
    await expect(
      page.getByRole("heading", { name: "Documenti contabili sospesi" }),
    ).toBeVisible();

    // Osservato: i filtri di docemessi non si mischiano con quelli di docsospesi
    // (nessun filtro 'filters' salvato, Anno = Tutti, nessun 'Annulla filtri')
    await expect(annoCombobox).toHaveText("Tutti");
    await expect(annulla).toHaveCount(0);
    expect(await getFilters()).toBeNull();

    // Tornare a 'Documenti contabili emessi'
    await page
      .getByRole("button", { name: "Documenti contabili emessi" })
      .click();
    await expect(page).toHaveURL(/\/ente\/docemessi$/);
    await expect(page.getByText("of 26").first()).toBeVisible();

    // Osservato: navigando via menu i filtri vengono RESETTATI (non riapplicati)
    await expect(annoCombobox).toHaveText("Tutti");
    await expect(annulla).toHaveCount(0);
    await expect(page.getByText("1–10 of 26").first()).toBeVisible();

    const saved = JSON.parse((await getFilters()) as string);
    expect(saved.pathPage).toBe("/ente/docemessi");
    expect(saved.body.anno).toBe(9999);
    expect(saved.body.tipologiaFattura).toEqual([]);
  });
});
