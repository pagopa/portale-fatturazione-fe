// spec: specs/ente-docsospesi.md (sezione 2)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import {
  mockAll, openPage, removeChip, selectDate, selectOption, selectTipologie,
} from "../../utils/docsospesi/docSospesiMock";

test.describe("Presenza e logica dei filtri", () => {
  test("Presenza dei filtri", async ({ page }) => {
    await mockAll(page);

    // 1. Con mock di riferimento aprire la pagina
    const l = await openPage(page);

    // expect: Visibili le label e i campi Anno, Mese, Tipologia Fattura, Data Fattura
    for (const label of ["Anno", "Mese", "Tipologia Fattura", "Data Fattura"]) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }
    await expect(l.anno).toBeVisible();
    await expect(l.mese).toBeVisible();
    await expect(l.tipologia).toBeVisible();
    await expect(l.dataFattura).toBeVisible();
    // expect: Pulsante 'Filtra' visibile, 'Annulla filtri' assente
    await expect(l.filtra).toBeVisible();
    await expect(l.annulla).toHaveCount(0);
  });

  test("Opzioni Anno popolate dall'API periodo/sospeso", async ({ page }) => {
    await mockAll(page);
    const l = await openPage(page);

    // 1. Con mock di riferimento aprire il select Anno
    await l.anno.click();

    // expect: Opzioni nell'ordine: Tutti, 2023, 2024, 2025
    await expect(page.getByRole("option")).toHaveText(["Tutti", "2023", "2024", "2025"]);
  });

  test("Selezione Anno abilita Mese e mostra Annulla filtri", async ({ page }) => {
    await mockAll(page);
    const l = await openPage(page);

    // 1. Selezionare Anno 2024
    await selectOption(page, l.anno, "2024");

    // expect: Mese abilitato con opzioni Tutti, Gennaio, Febbraio, Marzo
    await expect(l.mese).not.toHaveAttribute("aria-disabled", "true");
    await l.mese.click();
    await expect(page.getByRole("option")).toHaveText(["Tutti", "Gennaio", "Febbraio", "Marzo"]);
    await page.keyboard.press("Escape");
    // expect: Appare 'Annulla filtri'
    await expect(l.annulla).toBeVisible();
    // expect: Griglia svuotata, Credito sospeso '--', 'Download risultati' disabilitato
    await expect(l.empty).toBeVisible();
    await expect(l.totale).toHaveText("--");
    await expect(l.download).toBeDisabled();

    // 2. Riselezionare Anno = Tutti
    await selectOption(page, l.anno, "Tutti");

    // expect: Mese torna disabilitato a Tutti, nessun chip; 'Annulla filtri' scompare
    await expect(l.mese).toHaveText("Tutti");
    await expect(l.mese).toHaveAttribute("aria-disabled", "true");
    await expect(l.annulla).toHaveCount(0);
  });

  test("Filtro Mese con nomi dei mesi", async ({ page }) => {
    await mockAll(page);
    const l = await openPage(page);

    // 1. Selezionare Anno 2024 e aprire Mese
    await selectOption(page, l.anno, "2024");
    await l.mese.click();

    // expect: Opzioni con nomi italiani dei mesi presenti per l'anno e 'Tutti'
    await expect(page.getByRole("option")).toHaveText(["Tutti", "Gennaio", "Febbraio", "Marzo"]);

    // 2. Selezionare Gennaio
    await page.getByRole("option", { name: "Gennaio" }).click();

    // expect: Tipologie limitate a ACCONTO e PRIMO SALDO
    await l.tipologia.click();
    await expect(page.getByRole("option")).toHaveText(["ACCONTO", "PRIMO SALDO"]);
    await page.keyboard.press("Escape");
    // expect: Data Fattura resta disabilitata
    await expect(l.dataFattura).toBeDisabled();
  });

  test("Cascata Tipologia -> Data Fattura", async ({ page }) => {
    await mockAll(page);
    const l = await openPage(page);

    // 1. Con Anno=2024 e Mese=Tutti selezionare PRIMO SALDO
    await selectOption(page, l.anno, "2024");
    await selectTipologie(page, l, "PRIMO SALDO");

    // expect: Un chip con aria-label 'PRIMO SALDO'
    await expect(l.chip("PRIMO SALDO")).toBeVisible();
    // expect: Data Fattura abilitata con le sole date 2024-01-24 e 2024-02-20
    await expect(l.dataFattura).toBeEnabled();
    await l.dataFattura.click();
    await expect(page.getByRole("option")).toHaveText(["2024-01-24", "2024-02-20"]);
    await page.keyboard.press("Escape");

    // 2. Selezionare 2024-01-24 e poi rimuovere il chip della tipologia
    await selectDate(page, l, "2024-01-24");
    await expect(l.chip("2024-01-24")).toBeVisible();
    await removeChip(l, "PRIMO SALDO");

    // expect: Data Fattura torna disabilitata e senza chip
    await expect(l.chip("PRIMO SALDO")).toHaveCount(0);
    await expect(l.dataFattura).toBeDisabled();
    await expect(l.chip("2024-01-24")).toHaveCount(0);
  });

  test("Cambio Anno/Mese azzera selezioni dipendenti", async ({ page }) => {
    await mockAll(page);
    const l = await openPage(page);

    // 1. Selezionare Anno 2024, tipologia PRIMO SALDO e data 2024-01-24; poi cambiare Anno in 2023
    await selectOption(page, l.anno, "2024");
    await selectTipologie(page, l, "PRIMO SALDO");
    await selectDate(page, l, "2024-01-24");
    await expect(l.chip("2024-01-24")).toBeVisible();
    await selectOption(page, l.anno, "2023");

    // expect: Chip di Tipologia e Data azzerati, Mese = Tutti
    await expect(l.chip("PRIMO SALDO")).toHaveCount(0);
    await expect(l.chip("2024-01-24")).toHaveCount(0);
    await expect(l.mese).toHaveText("Tutti");

    // 2. Selezionare Anno 2024, tipologia ACCONTO; poi scegliere Mese Gennaio
    await selectOption(page, l.anno, "2024");
    await selectTipologie(page, l, "ACCONTO");
    await expect(l.chip("ACCONTO")).toBeVisible();
    await selectOption(page, l.mese, "Gennaio");

    // expect: Tipologie e date azzerate, Data Fattura disabilitata
    await expect(l.chip("ACCONTO")).toHaveCount(0);
    await expect(l.dataFattura).toBeDisabled();
  });

  test("Multiselezione tipologie", async ({ page }) => {
    await mockAll(page);
    const l = await openPage(page);
    await selectOption(page, l.anno, "2024");

    // 1. Con Anno 2024 selezionare ACCONTO e PRIMO SALDO
    await selectTipologie(page, l, "ACCONTO", "PRIMO SALDO");

    // expect: Due chip (aria-label ACCONTO e PRIMO SALDO)
    await expect(l.chip("ACCONTO")).toBeVisible();
    await expect(l.chip("PRIMO SALDO")).toBeVisible();
    // expect: Date proposte = unione senza duplicati
    await l.dataFattura.focus();
    await l.dataFattura.press("ArrowDown");
    await expect(page.getByRole("option")).toHaveText(["2024-01-24", "2024-02-20", "2024-03-10"]);
    await page.keyboard.press("Escape");

    // 2. Rimuovere il chip ACCONTO
    await removeChip(l, "ACCONTO");

    // expect: Rimane il solo chip PRIMO SALDO e le date diventano 2024-01-24, 2024-02-20
    await expect(l.chip("ACCONTO")).toHaveCount(0);
    await expect(l.chip("PRIMO SALDO")).toBeVisible();
    await l.dataFattura.focus();
    await l.dataFattura.press("ArrowDown");
    await expect(page.getByRole("option")).toHaveText(["2024-01-24", "2024-02-20"]);
  });

  test("Filtra con singolo filtro (Anno)", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await openPage(page);

    // 1. Selezionare Anno 2025 e cliccare 'Filtra'
    await selectOption(page, l.anno, "2025");
    await l.filtra.click();

    // expect: POST credito/sospeso con body { anno: 2025, mese: null, tipologiaFattura: [], dataFattura: [] }
    await expect.poll(() => lista.bodies.at(-1)).toEqual({ anno: 2025, mese: null, tipologiaFattura: [], dataFattura: [] });
    // expect: Una sola riga (20/05/2025), paginatore '1–1 of 1', Credito sospeso aggiornato
    await expect(l.rows).toHaveCount(1);
    await expect(l.rows.first()).toContainText("20/05/2025");
    await expect(l.paginationLabel).toHaveText("1–1 of 1");
    await expect(l.totale).toHaveText(/^105,00\s€$/);
    // expect: 'Download risultati' abilitato
    await expect(l.download).toBeEnabled();
  });

  test("Filtra con filtri combinati", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await openPage(page);

    // 1. Selezionare Anno 2024, tipologia PRIMO SALDO, data 2024-01-24 e cliccare Filtra
    await selectOption(page, l.anno, "2024");
    await selectTipologie(page, l, "PRIMO SALDO");
    await selectDate(page, l, "2024-01-24");
    await l.filtra.click();

    // expect: Body con anno 2024, mese null, tipologiaFattura e dataFattura selezionati
    await expect.poll(() => lista.bodies.at(-1)).toEqual({ anno: 2024, mese: null, tipologiaFattura: ["PRIMO SALDO"], dataFattura: ["2024-01-24"] });
    // expect: Righe coerenti, pagina 1
    await expect(l.rows).toHaveCount(1);
    await expect(l.rows.first()).toContainText("PRIMO SALDO");
    await expect(l.rows.first()).toContainText("24/01/2024");
    await expect(l.paginationLabel).toHaveText("1–1 of 1");

    // 2. Selezionare Mese Febbraio e cliccare Filtra
    await selectOption(page, l.mese, "Febbraio");
    await l.filtra.click();

    // expect: Body con mese 2 e tipologiaFattura vuoto; solo righe di febbraio 2024
    await expect.poll(() => lista.bodies.at(-1)).toEqual({ anno: 2024, mese: 2, tipologiaFattura: [], dataFattura: [] });
    await expect(l.rows).toHaveCount(1);
    await expect(l.rows.first()).toContainText("02/2024");
  });

  test("Annulla filtri", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await openPage(page);

    // 1. Impostare Anno 2024, Mese Gennaio, tipologia ACCONTO, cliccare Filtra e poi 'Annulla filtri'
    await selectOption(page, l.anno, "2024");
    await selectOption(page, l.mese, "Gennaio");
    await selectTipologie(page, l, "ACCONTO");
    await l.filtra.click();
    await expect(l.rows).toHaveCount(1);
    await l.annulla.click();

    // expect: Anno e Mese = Tutti, nessun chip, 'Annulla filtri' scompare
    await expect(l.anno).toHaveText("Tutti");
    await expect(l.mese).toHaveText("Tutti");
    await expect(l.chip("ACCONTO")).toHaveCount(0);
    await expect(l.annulla).toHaveCount(0);
    // expect: POST con anno e mese null e array vuoti; tutte le 6 fatture a pagina 1
    await expect.poll(() => lista.bodies.at(-1)).toEqual({ anno: null, mese: null, tipologiaFattura: [], dataFattura: [] });
    await expect(l.rows).toHaveCount(6);
    await expect(l.paginationLabel).toHaveText("1–6 of 6");
    // expect: localStorage 'filters' rimosso
    expect(await page.evaluate(() => localStorage.getItem("filters"))).toBeNull();
  });

  test("Filtra senza selezionare nulla", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await mockAll(page);
    const l = await openPage(page);

    // 1. Cliccare 'Filtra' con tutti i filtri a Tutti
    await l.filtra.click();

    // expect: Griglia con l'elenco completo, nessun errore JS
    await expect(l.rows).toHaveCount(6);
    await expect(l.paginationLabel).toHaveText("1–6 of 6");
    expect(errors).toEqual([]);
  });

  test("Ricerca testuale nell'autocomplete", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await mockAll(page);
    const l = await openPage(page);

    // 1. Digitare in Tipologia Fattura 'zzz', poi '<script>', poi '%'
    for (const text of ["zzz", "<script>", "%"]) {
      await l.tipologia.fill(text);

      // expect: Messaggio 'No options', nessun chip creato con Enter, nessun errore JS
      await expect(page.getByText("No options")).toBeVisible();
      await expect(page.getByRole("option")).toHaveCount(0);
      await l.tipologia.press("Enter");
      await expect(l.chip(text)).toHaveCount(0);
    }
    expect(errors).toEqual([]);
  });
});
