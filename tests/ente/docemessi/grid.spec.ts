// spec: specs/ente-docemessi.md (sezioni 3, 6 e 7)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import {
  ERRORE_500, FATTURE_PERIODO, locators, makeFattura, makeFatture, mockAll, mockContestate, mockDettaglio, mockLista,
  mockPeriodo, openPage, selectOption, SORTABLE_COLUMNS, totaleBackground,
} from "../../utils/docemessi/docEmessiMock";

test.describe("Griglia emessi: dati, ordinamento, dettaglio", () => {
  test("Struttura colonne e formattazione", async ({ page }) => {
    // 1. Mock con almeno una fattura e osservare la tabella emessi
    await mockAll(page, [
      makeFattura(0, { dataFattura: "2024-08-20", identificativo: "09/2024", totale: 1261, split: true, tipoContratto: "PAC" }),
      makeFattura(1, { dataFattura: "2024-10-21", identificativo: "11/2024", totale: 7, split: false, tipoContratto: "PAL" }),
    ]);
    const l = await openPage(page);

    // expect: Colonne: (expand), Data Fattura, Stato, T. Fattura, Ident., Tipo Contratto, Tot., N. Fattura, Tipo Documento, Divisa, M. Pagamento, Split, (azione)
    await expect(l.table.getByRole("columnheader")).toHaveText([
      "", "Data Fattura", "Stato", "T. Fattura", "Ident.", "Tipo Contratto", "Tot.", "N. Fattura", "Tipo Documento", "Divisa", "M. Pagamento", "Split", "",
    ]);
    // expect: Data gg/mm/aaaa, Ident. mm/aaaa, Tot. formato italiano, Split 'Si'/'No'
    const first = l.rows.nth(0).getByRole("cell");
    const second = l.rows.nth(1).getByRole("cell");
    await expect(first.nth(1)).toHaveText("20/08/2024");
    await expect(first.nth(4)).toHaveText("09/2024");
    await expect(first.nth(6)).toHaveText(/^1\.261,00\s€$/);
    await expect(first.nth(11)).toHaveText("Si");
    await expect(second.nth(11)).toHaveText("No");
    // expect: Tipo Contratto lungo troncato con '...' (testo completo nell'aria-label)
    await expect(l.rows.nth(0).getByRole("cell", { name: "PAC - PAL con requisiti" })).toHaveText("PAC - PAL ...");
    await expect(l.rows.nth(1).getByRole("cell", { name: "PAC - PAL senza requisiti" })).toHaveText("PAC - PAL ...");
  });

  test("Espansione riga: Posizioni", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const posizione = (n: number) => ({
      numeroLinea: n, testo: `riga ${n}`, codiceMateriale: `MAT-${n}`, quantita: 1, prezzoUnitario: 10,
      imponibile: 10, periodoRiferimento: "01/2024", periodoFatturazione: "02/2024",
    });
    await mockAll(page, [makeFattura(0, { posizioni: [posizione(2), posizione(1)] }), makeFattura(1, { posizioni: [] })]);
    const l = await openPage(page);
    const expandFirst = l.rows.nth(0).getByRole("button", { name: "expand row" });
    const righePosizioni = page.getByRole("row").filter({ hasText: /^\d+MAT-\d/ });

    // 1. Cliccare il pulsante 'expand row' di una riga con posizioni
    await expandFirst.click();

    // expect: Sotto-tabella 'Posizioni' con le colonne di headersDocumentiEmessiEnteCollapse
    await expect(page.getByText("Posizioni", { exact: true })).toBeVisible();
    for (const header of ["Numero Linea", "Codice Materiale", "Imponibile", "Periodo di riferimento", "Periodo di fatturazione"]) {
      await expect(page.getByRole("columnheader", { name: header })).toBeVisible();
    }
    await expect(righePosizioni).toHaveText([/^1MAT-1/, /^2MAT-2/]);
    // expect: Nuovo click richiude la riga
    await expandFirst.click();
    await expect(page.getByText("Posizioni", { exact: true })).toBeHidden();

    // 2. Espandere una riga con posizioni vuote
    await l.rows.nth(1).getByRole("button", { name: "expand row" }).click();

    // expect: Nessun errore, sotto-tabella vuota
    await expect(righePosizioni).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("Ordinamento colonne (3 stati)", async ({ page }) => {
    // 31 fatture con v = (i * 7 + 5) % 31: ogni colonna cresce con v, la riga e' identificata da Ident. '08/<2000+v>'
    await mockAll(page, makeFatture(31, (i) => {
      const v = (i * 7 + 5) % 31;
      return {
        dataFattura: `${2000 + v}-08-01`, identificativo: `08/${2000 + v}`, totale: v * 10, numero: v + 1,
        tipoDocumento: `TD${String(v).padStart(2, "0")}`,
      };
    }));
    const l = await openPage(page);
    const firstRow = l.rows.first();

    // 1. Per ciascuna colonna ordinabile cliccare l'icona Sort una, due e tre volte
    // expect: 1 click: ascendente, 2: discendente, 3: ritorno all'ordine originale
    for (const column of SORTABLE_COLUMNS) {
      await l.sortButton(column).click();
      await expect(firstRow).toContainText("08/2000");
      await l.sortButton(column).click();
      await expect(firstRow).toContainText("08/2030");
      await expect(l.sortButton(column).getByTestId("ArrowDownwardIcon")).toBeVisible();
      await l.sortButton(column).click();
      await expect(firstRow).toContainText("08/2005");
    }

    // expect: L'ordinamento si applica all'intera lista e non solo alla pagina corrente
    await l.sortButton("Tot.").click();
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("11–20 of 31");
    await expect(firstRow).toContainText("08/2010");
    await l.prev.click();

    // expect: Ordinare una colonna resetta l'indicatore delle altre
    await l.sortButton("Tot.").click();
    await expect(l.sortButton("Tot.").getByTestId("ArrowDownwardIcon")).toBeVisible();
    await l.sortButton("Data Fattura").click();
    await expect(l.sortButton("Tot.").getByTestId("ArrowDownwardIcon")).toHaveCount(0);
    await expect(firstRow).toContainText("08/2000");
  });

  test("Ordinamento disabilitato durante modifica filtri", async ({ page }) => {
    await mockAll(page);
    const l = await openPage(page);
    await l.sortButton("Tot.").click();
    await l.sortButton("Tot.").click();
    await expect(l.sortButton("Tot.").getByTestId("ArrowDownwardIcon")).toBeVisible();

    // 1. Cambiare un filtro senza cliccare Filtra
    await selectOption(page, l.anno, "2024");

    // expect: Griglia svuotata e pulsanti Sort disabilitati con indicatori reimpostati
    await expect(l.empty).toBeVisible();
    for (const column of SORTABLE_COLUMNS) {
      await expect(l.sortButton(column)).toBeDisabled();
      await expect(l.sortButton(column).getByTestId("ArrowDownwardIcon")).toHaveCount(0);
    }
  });

  test("Click su riga apre il dettaglio", async ({ page }) => {
    await mockAll(page);
    await mockDettaglio(page, { tipologiaFattura: "PRIMO SALDO", anno: "2024", mese: "2" });
    const l = await openPage(page);
    await selectOption(page, l.anno, "2024");
    await selectOption(page, l.mese, "Febbraio");
    await l.filtra.click();
    await expect(l.rows).toHaveCount(1);

    // 1. Cliccare sulla cella Data Fattura della riga (fattura id 4, PRIMO SALDO 02/2024)
    await l.rows.first().getByRole("cell").nth(1).click();

    // expect: Navigazione a /ente/fatturapdf/documentiemessi/<idfattura>
    await expect(page).toHaveURL(/\/ente\/fatturapdf\/documentiemessi\/4$/);
    // expect: La pagina dettaglio mostra la fattura corretta (tipologia, anno e mese)
    await expect(page.getByRole("heading", { name: "Dati di Fatturazione" })).toBeVisible();
    await expect(page.getByRole("main").or(page.getByRole("document")).first()).toContainText(/Tipologia Fattura\s*PRIMO SALDO\s*Anno\s*2024\s*Mese\s*Febbraio/);

    // 2. Tornare indietro con il back del browser
    await page.goBack();

    // expect: Pagina emessi ripristina filtri, pagina e ordinamento salvati
    await expect(page).toHaveURL(/\/ente\/docemessi$/);
    await expect(l.anno).toHaveText("2024");
    await expect(l.mese).toHaveText("Febbraio");
    await expect(l.annulla).toBeVisible();
    await expect(l.rows).toHaveCount(1);
  });
});

test.describe("Fatture contestate", () => {
  test("Stato vuoto contestate", async ({ page }) => {
    // 1. Aprire la pagina con 'eliminate' = dettagli []
    await mockAll(page, undefined, []);
    const l = await openPage(page);

    // expect: Titolo 'Fatture Contestate', riga vuota, paginatore '0-0 of 0', tutti i Sort disabilitati
    await expect(page.getByRole("heading", { name: "Fatture Contestate" })).toBeVisible();
    await expect(l.emptyContestate).toBeVisible();
    await expect(l.paginationLabelContestate).toHaveText("0–0 of 0");
    for (const column of SORTABLE_COLUMNS) {
      await expect(l.sortButton(column, l.contestate)).toBeDisabled();
    }
  });

  test("Contestate con dati: righe evidenziate e ordinamento", async ({ page }) => {
    // 1. Mockare 'eliminate' con 3 fatture
    await mockAll(page, FATTURE_PERIODO, makeFatture(3, (i) => ({ identificativo: `C-${i}`, totale: [50, 10, 30][i] })));
    const l = await openPage(page);

    // expect: Righe con sfondo #ffeff1
    await expect(l.rowsContestate).toHaveCount(3);
    for (const background of await l.rowsContestate.evaluateAll((rows) => rows.map((r) => getComputedStyle(r).backgroundColor))) {
      expect(background).toBe("rgb(255, 239, 241)");
    }

    // expect: Ordinamento per colonna funziona sulla sola griglia contestate
    const emessiFirstBefore = await l.rows.first().textContent();
    await l.sortButton("Tot.", l.contestate).click();
    await expect(l.rowsContestate.first()).toContainText("C-1");
    await l.sortButton("Tot.", l.contestate).click();
    await expect(l.rowsContestate.first()).toContainText("C-0");
    expect(await l.rows.first().textContent()).toBe(emessiFirstBefore);
    await expect(l.sortButton("Tot.").getByTestId("ArrowDownwardIcon")).toHaveCount(0);
  });

  test("Le contestate non cambiano con Filtra", async ({ page }) => {
    const { contestate } = await mockAll(page, FATTURE_PERIODO, makeFatture(3, (i) => ({ identificativo: `C-${i}` })));
    const l = await openPage(page);
    await expect(l.rowsContestate).toHaveCount(3);
    expect(contestate.calls()).toBe(1);

    // 1. Con contestate popolate applicare un filtro
    await selectOption(page, l.anno, "2024");
    await l.filtra.click();
    await expect(l.rows).toHaveCount(4);

    // expect: La griglia contestate non viene ricaricata ('eliminate' solo al primo caricamento)
    expect(contestate.calls()).toBe(1);
    await expect(l.rowsContestate).toHaveCount(3);
    await expect(l.paginationLabelContestate).toHaveText("1–3 of 3");
  });
});

test.describe("Stati vuoti ed errori API", () => {
  test("Nessun risultato per filtro", async ({ page }) => {
    // 1. Mockare periodo/emesse con dettagli [] e importo 0 dopo Filtra (nessuna fattura 2025 nel mock)
    await mockAll(page, FATTURE_PERIODO.filter((f) => f._anno !== 2025));
    const l = await openPage(page);
    await selectOption(page, l.anno, "2025");
    await l.filtra.click();

    // expect: messaggio vuoto, totale '--' su grigio, paginatore '0-0 of 0', next/prev e download disabilitati
    await expect(l.empty).toBeVisible();
    await expect(l.totale).toHaveText("--");
    expect(await totaleBackground(l)).toBe("rgb(227, 231, 235)");
    await expect(l.paginationLabel).toHaveText("0–0 of 0");
    await expect(l.next).toBeDisabled();
    await expect(l.prev).toBeDisabled();
    await expect(l.download).toBeDisabled();
  });

  test("Periodo senza dati", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    // 1. Mockare GET periodo con data []
    await mockPeriodo(page, []);
    await mockLista(page);
    await mockContestate(page);
    const l = await openPage(page);

    // expect: Select Anno contiene solo 'Tutti' e nessun errore JS
    await l.anno.click();
    await expect(page.getByRole("option")).toHaveText(["Tutti"]);
    expect(errors).toEqual([]);
  });

  test("Errore 500 su periodo", async ({ page }) => {
    const l = locators(page);
    await mockLista(page);
    await mockContestate(page);

    // 1. Mockare periodo con 500
    await mockPeriodo(page, [], 500);
    await page.goto("/ente/docemessi");

    // expect: manageError visualizzato, loading chiuso, filtri non popolati, pagina utilizzabile
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    await expect(l.loading).toBeHidden();
    await l.anno.click();
    await expect(page.getByRole("option")).toHaveText(["Tutti"]);
    await page.keyboard.press("Escape");
    await expect(l.heading).toBeVisible();
    await expect(l.filtra).toBeEnabled();
  });

  test("Errore 500 su lista emesse", async ({ page }) => {
    const l = locators(page);
    await mockPeriodo(page);
    await mockContestate(page);
    const lista = await mockLista(page);

    // 1. Mockare periodo/emesse con 500
    lista.status = 500;
    await page.goto("/ente/docemessi");

    // expect: Griglia vuota, errore mostrato, modale Loading chiuso
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    await expect(l.loading).toBeHidden();
    await expect(l.empty).toBeVisible();

    // 2. Ripristinare la risposta e cliccare Filtra
    lista.status = 200;
    await l.filtra.click();

    // expect: La griglia si ripopola correttamente
    await expect(l.rows).toHaveCount(6);
    await expect(l.paginationLabel).toHaveText("1–6 of 6");
  });

  test("Errore su lista contestate", async ({ page }) => {
    const l = locators(page);
    await mockPeriodo(page);
    await mockLista(page);

    // 1. Mockare 'eliminate' con 500
    await mockContestate(page, [], 500);
    await page.goto("/ente/docemessi");

    // expect: Errore gestito (alert manageError) e loading chiuso
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    await expect(l.loading).toBeHidden();
    // Comportamento attuale (da confermare con il team, come indicato dalla spec): contestate ed emessi
    // condividono lo stesso try/catch, quindi l'errore blocca anche il caricamento degli emessi
    await expect(l.rowsContestate).toHaveCount(0);
    await expect(l.rows).toHaveCount(0);
  });

  test("Totale negativo", async ({ page }) => {
    // 1. Mockare importo negativo
    await mockPeriodo(page);
    await mockLista(page, FATTURE_PERIODO, -50);
    await mockContestate(page);
    const l = await openPage(page);

    // expect: Formato '-x,xx euro' e sfondo #ffeff1 (il ramo 'totale < 0' e' raggiungibile)
    await expect(l.totale).toHaveText(/^-50,00\s€$/);
    expect(await totaleBackground(l)).toBe("rgb(255, 239, 241)");
  });

  test("Risposta lenta / loading", async ({ page }) => {
    const l = locators(page);
    await mockPeriodo(page);
    await mockContestate(page);
    const lista = await mockLista(page);

    // 1. Ritardare le risposte API di 3s
    lista.delayMs = 3000;
    await page.goto("/ente/docemessi");

    // expect: Modale 'Operazione in corso - Loading...' bloccante visibile finche' le richieste non terminano
    await expect(page.getByText("Operazione in corso")).toBeVisible();
    await expect(l.loading).toBeVisible();
    await expect(l.rows).toHaveCount(0);
    await expect(l.loading).toBeHidden({ timeout: 10000 });
    await expect(l.rows).toHaveCount(6);
  });
});
