// spec: specs/ente-docemessi.md
// seed: tests/auth.setup.ts

import { test, expect } from "@playwright/test";

test.describe("Persistenza filtri e navigazione", () => {
  test("Persistenza di pagina, righe e ordinamento", async ({ page }) => {
    await page.goto("/ente/docemessi");
    await expect(
      page.getByRole("heading", { name: "Documenti contabili emessi" }),
    ).toBeVisible();

    // Paginatore e griglia delle fatture emesse (la prima tabella; la seconda e' quella delle contestate)
    const paginator = page.locator(".MuiTablePagination-root").first();
    const displayedRows = paginator.locator(".MuiTablePagination-displayedRows");
    const rowsPerPageSelect = paginator.getByRole("combobox");
    const nextPage = paginator.getByRole("button", { name: "Go to next page" });
    const emesseRows = page
      .getByRole("table")
      .first()
      .locator("tbody tr")
      .filter({ hasText: "Emessa" });

    await expect(displayedRows).toHaveText(/^1–10 of \d+$/);

    // Ordinare per Tot.
    await page
      .getByRole("columnheader", { name: "Tot." })
      .first()
      .getByRole("button")
      .click();

    // Andare a pagina 2
    await nextPage.click();
    await expect(displayedRows).toHaveText(/^11–\d+ of \d+$/);

    // Cambiare righe per pagina (il cambio righe riporta alla pagina 1)
    await rowsPerPageSelect.click();
    await page.getByRole("option", { name: "25", exact: true }).click();
    await expect(rowsPerPageSelect).toHaveText("25");
    await expect(displayedRows).toHaveText(/^1–25 of \d+$/);

    // Tornare a pagina 2 con 25 righe per pagina
    await nextPage.click();
    await expect(displayedRows).toHaveText(/^26–\d+ of \d+$/);

    const displayedBefore = await displayedRows.textContent();
    const rowsTextBefore = await emesseRows.allTextContents();
    const savedBefore = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("filters") as string),
    );
    expect(savedBefore.page).toBe(1);
    expect(savedBefore.rows).toBe(25);
    const sortBefore = savedBefore.objectSort["Tot."];
    expect(sortBefore).not.toBe(1);

    // Ricaricare la pagina
    await page.reload();

    // expect: stessa pagina, stesse righe per pagina e stesso ordinamento ripristinati
    await expect(displayedRows).toHaveText(displayedBefore as string);
    await expect(rowsPerPageSelect).toHaveText("25");
    await expect(emesseRows).toHaveText(rowsTextBefore);

    const savedAfter = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("filters") as string),
    );
    expect(savedAfter.page).toBe(1);
    expect(savedAfter.rows).toBe(25);
    expect(savedAfter.objectSort["Tot."]).toBe(sortBefore);
  });
});
