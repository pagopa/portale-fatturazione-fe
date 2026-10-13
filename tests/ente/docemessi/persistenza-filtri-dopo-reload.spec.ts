// spec: specs/ente-docemessi.md
// seed: tests/auth.setup.ts

import { test, expect } from "@playwright/test";

test.describe("Persistenza filtri e navigazione", () => {
  test("Persistenza dei filtri dopo reload", async ({ page }) => {
    await page.goto("/ente/docemessi");
    await expect(
      page.getByRole("heading", { name: "Documenti contabili emessi" }),
    ).toBeVisible();
    await expect(page.getByText("Operazione in corso")).toBeHidden();

    const annoCombobox = page.getByRole("combobox").first();
    const pagination = page.locator(".MuiTablePagination-displayedRows").first();
    const annulla = page.getByRole("button", { name: "Annulla filtri" });

    // Selezionare Anno 2025 + una tipologia
    await annoCombobox.click();
    await page.getByRole("option", { name: "2025" }).click();
    await page.getByRole("combobox", { name: "Tipologia Fattura" }).click();
    await page.getByRole("option", { name: "ANTICIPO" }).click();

    // Cliccare Filtra
    await page.getByRole("button", { name: "Filtra", exact: true }).click();
    await expect(annulla).toBeVisible();
    await expect(pagination).not.toHaveText("0–0 of 0");

    // expect: localStorage 'filters' contiene pathPage e body con i filtri
    const savedBefore = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("filters") as string),
    );
    expect(savedBefore.pathPage).toBe("/ente/docemessi");
    expect(savedBefore.body.anno).toBe(2025);
    expect(savedBefore.body.tipologiaFattura).toEqual(["ANTICIPO"]);

    const paginationBefore = await pagination.textContent();
    const totaleLocator = page
      .getByText("Totale fatturato")
      .locator("xpath=following-sibling::*[1]");
    const totaleBefore = await totaleLocator.textContent();

    // Ricaricare la pagina
    await page.reload();

    // expect: dopo il reload filtri, griglia, pagina e totale sono ripristinati
    await expect(annoCombobox).toHaveText("2025");
    await expect(
      page.getByRole("button", { name: "ANTICIPO", exact: true }),
    ).toBeVisible();
    await expect(pagination).toHaveText(paginationBefore as string);
    await expect(totaleLocator).toHaveText(totaleBefore as string);
    await expect(annulla).toBeVisible();

    const savedAfter = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("filters") as string),
    );
    expect(savedAfter.pathPage).toBe("/ente/docemessi");
    expect(savedAfter.body).toEqual(savedBefore.body);
  });
});
