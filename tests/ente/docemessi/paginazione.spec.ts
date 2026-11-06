// spec: specs/ente-docemessi.md (sezione 4)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import { FATTURE_PERIODO, makeFatture, mockAll, openPage, selectOption } from "../../utils/docemessi/docEmessiMock";

const rowIds = (ids: number[]) => ids.map((id) => new RegExp(`ID-${id}(?!\\d)`));
const range = (start: number, length: number) => Array.from({ length }, (_, i) => start + i);

test.describe("Paginazione", () => {
  test("Paginazione griglia emessi (33 elementi mock)", async ({ page }) => {
    // 1. Mockare periodo/emesse con 33 fatture e aprire la pagina
    await mockAll(page, makeFatture(33));
    const l = await openPage(page);

    // expect: 10 righe, 'Go to previous page' disabilitato, label '1-10 of 33'
    await expect(l.rows).toHaveCount(10);
    await expect(l.prev).toBeDisabled();
    await expect(l.paginationLabel).toHaveText("1–10 of 33");

    // 2. Click su 'Go to next page' fino all'ultima pagina
    // expect: Pagine mostrano ID-10..19, 20..29, quindi 3 righe (30-32)
    for (const start of [10, 20]) {
      await l.next.click();
      await expect(l.rows).toHaveText(rowIds(range(start, 10)));
    }
    await l.next.click();
    await expect(l.rows).toHaveText(rowIds([30, 31, 32]));

    // expect: Next disabilitato all'ultima pagina, label '31-33 of 33'
    await expect(l.next).toBeDisabled();
    await expect(l.paginationLabel).toHaveText("31–33 of 33");
  });

  test("Cambio righe per pagina", async ({ page }) => {
    await mockAll(page, makeFatture(33));
    const l = await openPage(page);

    // 1. Portarsi a pagina 2 e cambiare 'Rows per page'
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("11–20 of 33");
    await selectOption(page, l.rowsPerPage, "25");

    // expect: Si torna a pagina 1 con il nuovo numero di righe e label coerente con il totale
    await expect(l.rows).toHaveCount(25);
    await expect(l.rows.first()).toContainText("ID-0");
    await expect(l.paginationLabel).toHaveText("1–25 of 33");
  });

  test("Paginazione griglia contestate indipendente", async ({ page }) => {
    // 1. Mockare POST /api/fatture/ente/eliminate con 33 elementi e usare la paginazione delle contestate
    await mockAll(page, FATTURE_PERIODO, makeFatture(33));
    const l = await openPage(page);

    // expect: Stesso comportamento della griglia emessi
    await expect(l.rowsContestate).toHaveCount(10);
    await expect(l.prevContestate).toBeDisabled();
    await expect(l.paginationLabelContestate).toHaveText("1–10 of 33");
    await l.nextContestate.click();
    await expect(l.rowsContestate.first()).toContainText("ID-10");
    await l.nextContestate.click();
    await l.nextContestate.click();
    await expect(l.rowsContestate).toHaveText(rowIds([30, 31, 32]));
    await expect(l.nextContestate).toBeDisabled();
    await expect(l.paginationLabelContestate).toHaveText("31–33 of 33");

    // expect: La paginazione della griglia emessi non cambia
    await expect(l.paginationLabel).toHaveText("1–6 of 6");
    await expect(l.rows).toHaveCount(6);
  });

  test("Paginazione azzerata dopo Filtra e Annulla", async ({ page }) => {
    await mockAll(page, makeFatture(33));
    const l = await openPage(page);

    // 1. Andare a pagina 2, cliccare Filtra e poi Annulla filtri
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("11–20 of 33");
    await l.filtra.click();
    // expect: Dopo Filtra si torna a pagina 1
    await expect(l.paginationLabel).toHaveText("1–10 of 33");

    // 'Annulla filtri' compare solo con un filtro attivo: le 33 fatture mock sono del 2024
    await selectOption(page, l.anno, "2024");
    await l.filtra.click();
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("11–20 of 33");
    await l.annulla.click();

    // expect: Dopo Annulla filtri si torna a pagina 1
    await expect(l.paginationLabel).toHaveText("1–10 of 33");
    await expect(l.rows.first()).toContainText("ID-0");
  });
});
