// spec: specs/ente-docsospesi.md (sezione 4)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import { makeFatture, mockAll, openPage, selectOption } from "../../utils/docsospesi/docSospesiMock";

test.describe("Paginazione", () => {
  test("Paginazione con 33 fatture", async ({ page }) => {
    // 1. Mockare 33 fatture e aprire la pagina
    await mockAll(page, makeFatture(33));
    const l = await openPage(page);

    // expect: 10 righe, 'Go to previous page' disabilitato, label '1–10 of 33'
    await expect(l.rows).toHaveCount(10);
    await expect(l.prev).toBeDisabled();
    await expect(l.paginationLabel).toHaveText("1–10 of 33");

    // 2. Cliccare 'Go to next page' fino all'ultima pagina
    // expect: Pagine con ID-10..19, ID-20..29, poi 3 righe ID-30..32
    for (const start of [10, 20]) {
      await l.next.click();
      await expect(l.rows).toHaveText(Array.from({ length: 10 }, (_, i) => new RegExp(`ID-${start + i}(?!\\d)`)));
    }
    await l.next.click();
    await expect(l.rows).toHaveText([/ID-30(?!\d)/, /ID-31(?!\d)/, /ID-32(?!\d)/]);

    // expect: Next disabilitato all'ultima pagina, label '31–33 of 33'
    await expect(l.next).toBeDisabled();
    await expect(l.paginationLabel).toHaveText("31–33 of 33");
  });

  test("Cambio righe per pagina", async ({ page }) => {
    await mockAll(page, makeFatture(33));
    const l = await openPage(page);

    // 1. Andare a pagina 2 e scegliere 25 in 'Rows per page'
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("11–20 of 33");
    await selectOption(page, l.rowsPerPage, "25");

    // expect: Si torna a pagina 1 con 25 righe, label '1–25 of 33'
    await expect(l.rows).toHaveCount(25);
    await expect(l.rows.first()).toContainText("ID-0");
    await expect(l.paginationLabel).toHaveText("1–25 of 33");
  });

  test("Paginazione azzerata dopo Filtra e Annulla", async ({ page }) => {
    await mockAll(page, makeFatture(33));
    const l = await openPage(page);

    // 1. Andare a pagina 2 e cliccare Filtra
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("11–20 of 33");
    await l.filtra.click();

    // expect: Label '1–10 of 33'
    await expect(l.paginationLabel).toHaveText("1–10 of 33");

    // 2. Selezionare un anno, Filtra, andare a pagina 2 e cliccare Annulla filtri (le 33 fatture mock sono del 2024)
    await selectOption(page, l.anno, "2024");
    await l.filtra.click();
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("11–20 of 33");
    await l.annulla.click();

    // expect: Label '1–10 of 33' e prima riga ID-0
    await expect(l.paginationLabel).toHaveText("1–10 of 33");
    await expect(l.rows.first()).toContainText("ID-0");
  });
});
