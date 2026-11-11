// spec: specs/ente-asyncDocumenti.md (sezione 4)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import { locators, makeDocumenti, mockAll, openPage } from "../../utils/asyncDocumentiMock/asyncDocumentiMock";

// Apre la pagina e attende il caricamento iniziale (prima pagina da 10 righe)
async function ready(page: Parameters<typeof openPage>[0]) {
  await openPage(page);
  const l = locators(page);
  await expect(l.loading).toBeHidden();
  await expect(l.rows).toHaveCount(10);
  return {
    ...l,
    rowsPerPage: page.getByRole("combobox").first(),
    sortDataRichiesta: page.getByRole("columnheader", { name: /Data Richiesta/ }).getByRole("button"),
  };
}

test.describe("Paginazione", () => {
  test("Cambio pagina", async ({ page }) => {
    // 1. Mockare count=33 con risposta dipendente da page
    const { lista } = await mockAll(page, makeDocumenti(33));
    const l = await ready(page);

    // expect: '1-10 of 33', 'Go to previous page' disabilitato
    await expect(l.paginationLabel).toHaveText("1–10 of 33");
    await expect(l.previous).toBeDisabled();
    expect(lista).toHaveLength(1);

    // 2. Cliccare 'Go to next page'
    await l.next.click();

    // expect: Richiesta page=2&pageSize=10 con il body corrente; label '11-20 of 33'
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].query).toMatchObject({ page: "2", pageSize: "10" });
    expect(lista[1].body).toEqual(lista[0].body);
    await expect(l.paginationLabel).toHaveText("11–20 of 33");
    await expect(l.rows).toHaveCount(10);
    await expect(l.previous).toBeEnabled();

    // 3. Raggiungere l'ultima pagina
    await l.next.click();
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].query).toMatchObject({ page: "3", pageSize: "10" });
    await expect(l.paginationLabel).toHaveText("21–30 of 33");
    await l.next.click();

    // expect: 3 righe, '31-33 of 33', 'Go to next page' disabilitato
    await expect.poll(() => lista.length).toBe(4);
    expect(lista[3].query).toMatchObject({ page: "4", pageSize: "10" });
    await expect(l.paginationLabel).toHaveText("31–33 of 33");
    await expect(l.rows).toHaveCount(3);
    await expect(l.next).toBeDisabled();

    // 4. Tornare indietro
    await l.previous.click();

    // expect: Richiesta con la pagina precedente
    await expect.poll(() => lista.length).toBe(5);
    expect(lista[4].query).toMatchObject({ page: "3", pageSize: "10" });
    await expect(l.paginationLabel).toHaveText("21–30 of 33");
    await expect(l.rows).toHaveCount(10);
  });

  test("Cambio righe per pagina resetta a pagina 1", async ({ page }) => {
    const { lista } = await mockAll(page, makeDocumenti(33));
    const l = await ready(page);

    // 1. Andare a pagina 2 e cambiare 'Rows per page'
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("11–20 of 33");
    await expect.poll(() => lista.length).toBe(2);
    await l.rowsPerPage.click();
    // opzioni di default di MUI TablePagination (gridCustom non imposta rowsPerPageOptions)
    await expect(page.getByRole("option")).toHaveText(["10", "25", "50", "100"]);
    await page.getByRole("option", { name: "25", exact: true }).click();

    // expect: Richiesta con page=1&pageSize=<nuovo>
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].query).toMatchObject({ page: "1", pageSize: "25" });
    expect(lista[2].body).toEqual(lista[0].body);

    // expect: Label coerente '1-25 of 33'
    await expect(l.paginationLabel).toHaveText("1–25 of 33");
    await expect(l.rows).toHaveCount(25);
  });

  test("La paginazione mantiene le date applicate", async ({ page }) => {
    const { lista } = await mockAll(page, makeDocumenti(33));
    const l = await ready(page);

    // 1. Filtrare con Data inizio e Data fine, poi cambiare pagina
    await l.dataInizio.click();
    await l.dataInizio.pressSequentially("01092026");
    await l.dataFine.click();
    await l.dataFine.pressSequentially("30092026");
    await l.filtra.click();
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].body).toEqual({ init: "2026-09-01", end: "2026-09-30", ordinamento: 1 });
    await expect(l.rows).toHaveCount(10);
    await l.next.click();

    // expect: La richiesta di pagina 2 contiene init ed end nel body
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].query).toMatchObject({ page: "2", pageSize: "10" });
    expect(lista[2].body).toEqual({ init: "2026-09-01", end: "2026-09-30", ordinamento: 1 });
    await expect(l.paginationLabel).toHaveText("11–20 of 33");
  });

  test("La paginazione mantiene l'ordinamento", async ({ page }) => {
    const { lista } = await mockAll(page, makeDocumenti(33));
    const l = await ready(page);

    // 1. Ordinare per Data Richiesta e cambiare pagina
    await l.sortDataRichiesta.click();
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].body).toMatchObject({ ordinamento: 0 });
    expect(lista[1].query).toMatchObject({ page: "1", pageSize: "10" });
    await expect(l.rows).toHaveCount(10);
    await l.next.click();

    // expect: La richiesta contiene l'ordinamento scelto
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].query).toMatchObject({ page: "2", pageSize: "10" });
    expect(lista[2].body).toMatchObject({ ordinamento: 0 });
    await expect(l.paginationLabel).toHaveText("11–20 of 33");
  });
});
