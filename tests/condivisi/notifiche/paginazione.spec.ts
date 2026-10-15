// spec: specs/notifiche.md (sezione 5)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import { locators as baseLocators, makeNotifiche, mockAll, openPage } from "../../utils/notificheMock/notificheMock";

// Locator della griglia: stessi pattern di filtri.spec.ts
function filtri(page: Page) {
  return {
    ...baseLocators(page),
    iun: page.getByRole("textbox", { name: "IUN", exact: true }),
    rows: page.getByRole("row", { name: /IUN-/ }),
    paginationLabel: page.getByText(/^\d+–\d+ of \d+$/).first(),
    next: page.getByRole("button", { name: "Go to next page" }).first(),
    previous: page.getByRole("button", { name: "Go to previous page" }).first(),
    rowsPerPage: page.getByRole("combobox", { name: /Rows per page/ }).first(),
    sortDataEvento: page.getByRole("columnheader", { name: /^Data Evento/ }).getByRole("button"),
  };
}

// Apre la pagina e attende il caricamento iniziale della lista ente (prima pagina da 10 righe)
async function ready(page: Page) {
  await openPage(page);
  const l = filtri(page);
  await expect(l.loading).toBeHidden();
  await expect(l.rows).toHaveCount(10);
  return l;
}

test.describe("Paginazione", () => {
  test("Cambio pagina", async ({ page }) => {
    // 1. Mockare la lista con count=33 (10 righe per pagina)
    const { lista } = await mockAll(page, makeNotifiche(33));
    const l = await ready(page);

    // expect: '1-10 of 33', 'Go to previous page' disabilitato
    await expect(l.paginationLabel).toHaveText("1–10 of 33");
    await expect(l.previous).toBeDisabled();
    expect(lista).toHaveLength(1);

    // 2. Cliccare 'Go to next page'
    await l.next.click();

    // expect: Richiesta con page=2&pageSize=10 usando il body applicato (bodyDownload); label '11-20 of 33'
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].query).toMatchObject({ page: "2", pageSize: "10" });
    expect(lista[1].body).toEqual(lista[0].body);
    await expect(l.paginationLabel).toHaveText("11–20 of 33");
    await expect(l.rows).toHaveCount(10);
    await expect(l.previous).toBeEnabled();

    // 3. Raggiungere l'ultima pagina (33 elementi da 10 = 4 pagine)
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

  test("Cambio righe per pagina", async ({ page }) => {
    const { lista } = await mockAll(page, makeNotifiche(33));
    const l = await ready(page);
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("11–20 of 33");

    // 1. Aprire 'Rows per page' e scegliere un valore diverso da 10
    await l.rowsPerPage.click();
    // opzioni di default di MUI TablePagination (gridCustom non imposta rowsPerPageOptions)
    await expect(page.getByRole("option")).toHaveText(["10", "25", "50", "100"]);
    await page.getByRole("option", { name: "25", exact: true }).click();

    // expect: Richiesta con pageSize=<nuovo valore> e stessa pagina corrente
    // NB: diverge dalla spec: handleChangeRowsPerPage non azzera la pagina, quindi la richiesta resta page=2 (da confermare col team)
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].query).toMatchObject({ page: "2", pageSize: "25" });
    // expect: label coerente col totale (pagina 2 da 25 righe: dalla 26 alla 33)
    await expect(l.rowsPerPage).toHaveText("25");
    await expect(l.paginationLabel).toHaveText("26–33 of 33");
    await expect(l.rows).toHaveCount(8);
  });

  test("La paginazione usa i filtri applicati, non quelli solo selezionati", async ({ page }) => {
    const { lista } = await mockAll(page, makeNotifiche(33));
    const l = await ready(page);

    // 1. Applicare 'Filtra' con IUN='A'
    await l.iun.fill("A");
    await l.filtra.click();
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].body).toMatchObject({ iun: "A" });
    await expect(l.rows).toHaveCount(10);

    // poi digitare IUN='B' senza Filtra (la griglia viene svuotata)
    await l.iun.fill("B");
    await expect(l.empty).toBeVisible();
    await expect(l.rows).toHaveCount(0);
    expect(lista).toHaveLength(2);

    // e riapplicare Filtra con 'A' e cambiare pagina
    await l.iun.fill("A");
    await l.filtra.click();
    await expect.poll(() => lista.length).toBe(3);
    await expect(l.rows).toHaveCount(10);
    await l.next.click();

    // expect: La richiesta di pagina 2 contiene il body applicato dell'ultimo Filtra
    await expect.poll(() => lista.length).toBe(4);
    expect(lista[3].query).toMatchObject({ page: "2", pageSize: "10" });
    expect(lista[3].body).toMatchObject({ iun: "A" });
    expect(lista[3].body).toEqual(lista[2].body);
    await expect(l.paginationLabel).toHaveText("11–20 of 33");
  });

  test("Pagina 1 dopo ogni cambio filtro/ordinamento", async ({ page }) => {
    const { lista } = await mockAll(page, makeNotifiche(33));
    const l = await ready(page);

    // 1. Andare a pagina 2, cambiare l'ordinamento di 'Data Evento'
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("11–20 of 33");
    await expect.poll(() => lista.length).toBe(2);
    await l.sortDataEvento.click();

    // expect: Richiesta con page=1&pageSize=10
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].query).toMatchObject({ page: "1", pageSize: "10", columnName: "data", order: "1" });
    await expect(l.paginationLabel).toHaveText("1–10 of 33");
    await expect(l.rows).toHaveCount(10);

    // 2. Andare a pagina 2, cliccare 'Annulla filtri'
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("11–20 of 33");
    await expect.poll(() => lista.length).toBe(4);
    await l.annulla.click();

    // expect: Pagina 1 con 10 righe
    await expect.poll(() => lista.length).toBe(5);
    expect(lista[4].query).toMatchObject({ page: "1", pageSize: "10", columnName: "null", order: "null" });
    await expect(l.paginationLabel).toHaveText("1–10 of 33");
    await expect(l.rows).toHaveCount(10);
    await expect(l.annulla).toHaveCount(0);
  });
});
