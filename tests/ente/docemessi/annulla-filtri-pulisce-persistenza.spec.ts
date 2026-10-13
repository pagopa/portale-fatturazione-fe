// spec: specs/ente-docemessi.md
// seed: tests/auth.setup.ts

import { test, expect } from "@playwright/test";

test.describe("Persistenza filtri e navigazione", () => {
  test("Annulla filtri pulisce la persistenza", async ({ page }) => {
    await page.goto("/ente/docemessi");
    await expect(page.getByText("1–10 of 26").first()).toBeVisible();

    const annoCombobox = page.getByRole("combobox").first();
    const annulla = page.getByRole("button", { name: "Annulla filtri" });
    const pagination = page.locator(".MuiTablePagination-displayedRows").first();
    const getFilters = () =>
      page.evaluate(() => localStorage.getItem("filters"));

    // Applicare un filtro
    await annoCombobox.click();
    await page.getByRole("option", { name: "2025" }).click();
    await page.getByRole("button", { name: "Filtra", exact: true }).click();
    await expect(annulla).toBeVisible();
    expect(JSON.parse((await getFilters()) as string).body.anno).toBe(2025);

    // Cliccare 'Annulla filtri'
    await annulla.click();
    await expect(annulla).toHaveCount(0);
    await expect(annoCombobox).toHaveText("Tutti");
    // Osservato: la chiave 'filters' viene rimossa dal localStorage
    await expect.poll(getFilters).toBeNull();

    // Ricaricare la pagina
    await page.reload();

    // expect: nessun filtro attivo dopo il reload
    await expect(page.getByText("of 26").first()).toBeVisible();
    await expect(annoCombobox).toHaveText("Tutti");
    await expect(annulla).toHaveCount(0);
    await expect(pagination).toHaveText("1–10 of 26");

    // Eventuale stato ri-salvato dopo il reload contiene solo i valori di default
    const saved = await getFilters();
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      expect(parsed.body.anno).toBe(9999);
      expect(parsed.body.mese).toBe(9999);
      expect(parsed.body.tipologiaFattura).toEqual([]);
      expect(parsed.body.dataFattura).toEqual([]);
    }
  });
});
