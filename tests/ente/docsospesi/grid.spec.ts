// spec: specs/ente-docsospesi.md (sezioni 3, 6 e 7)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import {
  totaleBackground, FATTURE_PERIODO, locators, makeFattura, makeFatture, mockAll, mockDettaglio, mockLista,
  mockPeriodo, openPage, selectOption, SORTABLE_COLUMNS,
} from "../../utils/docsospesi/docSospesiMock";

const ERRORE_500 = "L'operazione non è andata a buon fine. Si prega di riprovare";

test.describe("Griglia sospesi: dati, ordinamento, dettaglio", () => {
  test("Struttura colonne e formattazione", async ({ page }) => {
    // 1. Mockare due fatture (split true / false, tipoContratto PAC / PAL) e osservare la tabella
    await mockAll(page, [
      makeFattura(0, { dataFattura: "2024-08-20", identificativo: "09/2024", totale: 1261, split: true, tipoContratto: "PAC" }),
      makeFattura(1, { dataFattura: "2024-10-21", identificativo: "11/2024", totale: 7, split: false, tipoContratto: "PAL" }),
    ]);
    const l = await openPage(page);

    // expect: Colonne nell'ordine previsto
    await expect(l.table.getByRole("columnheader")).toHaveText([
      "", "Data Fattura", "Stato", "T. Fattura", "Ident.", "Tipo Contratto", "Tot.", "N. Fattura", "Tipo Documento", "Divisa", "M. Pagamento", "Split", "",
    ]);
    const first = l.rows.nth(0).getByRole("cell");
    const second = l.rows.nth(1).getByRole("cell");
    // expect: Stato = 'Sospesa' su ogni riga
    await expect(first.nth(2)).toHaveText("Sospesa");
    await expect(second.nth(2)).toHaveText("Sospesa");
    // expect: Data gg/mm/aaaa, Ident. mm/aaaa, Tot. '1.261,00 €', Split 'Si'/'No'
    await expect(first.nth(1)).toHaveText("20/08/2024");
    await expect(first.nth(4)).toHaveText("09/2024");
    await expect(first.nth(6)).toHaveText(/^1\.261,00\s€$/);
    await expect(first.nth(11)).toHaveText("Si");
    await expect(second.nth(11)).toHaveText("No");
    // expect: Tipo Contratto troncato con il testo completo nell'aria-label
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

    // 1. Cliccare 'expand row' su una riga con 2 posizioni
    await expandFirst.click();

    // expect: Sotto-tabella 'Posizioni' con le colonne previste
    await expect(page.getByText("Posizioni", { exact: true })).toBeVisible();
    for (const header of ["Numero Linea", "Codice Materiale", "Imponibile", "Periodo di riferimento", "Periodo di fatturazione"]) {
      await expect(page.getByRole("columnheader", { name: header })).toBeVisible();
    }
    // expect: Posizioni ordinate per numeroLinea
    const righePosizioni = page.getByRole("row").filter({ hasText: /^\d+MAT-\d/ });
    await expect(righePosizioni).toHaveText([/^1MAT-1/, /^2MAT-2/]);
    // expect: Nuovo click richiude la riga
    await expandFirst.click();
    await expect(page.getByText("Posizioni", { exact: true })).toBeHidden();

    // 2. Espandere una riga con posizioni []
    await l.rows.nth(1).getByRole("button", { name: "expand row" }).click();

    // expect: Nessun errore JS, nessuna riga di posizione
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

    // 1. Per ogni colonna ordinabile cliccare Sort una, due e tre volte
    for (const column of SORTABLE_COLUMNS) {
      await l.sortButton(column).click();
      await expect(firstRow).toContainText("08/2000");
      await l.sortButton(column).click();
      await expect(firstRow).toContainText("08/2030");
      await expect(l.sortButton(column).getByTestId("ArrowDownwardIcon")).toBeVisible();
      await l.sortButton(column).click();
      await expect(firstRow).toContainText("08/2005");
    }

    // 2. Ordinare per Tot. e passare a pagina 2
    await l.sortButton("Tot.").click();
    await l.next.click();
    await expect(l.paginationLabel).toHaveText("11–20 of 31");
    await expect(firstRow).toContainText("08/2010");
    await l.prev.click();

    // 3. Ordinare Tot. discendente e poi cliccare Sort su Data Fattura
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

    // 1. Cambiare Anno senza Filtra
    await selectOption(page, l.anno, "2024");

    // expect: Griglia svuotata, Sort disabilitati e indicatori reimpostati
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

    // 1. Cliccare la cella Data Fattura della prima riga (fattura id 4, PRIMO SALDO 02/2024)
    await l.rows.first().getByRole("cell").nth(1).click();

    // expect: Navigazione a /ente/fatturapdf/documentisospesi/<idfattura>
    await expect(page).toHaveURL(/\/ente\/fatturapdf\/documentisospesi\/4$/);
    // expect: Voce di menu 'Documenti contabili sospesi' evidenziata
    await expect(l.nav.getByRole("button", { name: "Documenti contabili sospesi" })).toHaveClass(/Mui-selected/);
    // expect: Il dettaglio mostra tipologia, anno e mese della riga
    await expect(page.getByRole("heading", { name: "Dati di Fatturazione" })).toBeVisible();
    await expect(page.getByRole("main").or(page.getByRole("document")).first()).toContainText(/Tipologia Fattura\s*PRIMO SALDO\s*Anno\s*2024\s*Mese\s*Febbraio/);

    // 2. Tornare indietro con il back del browser
    await page.goBack();

    // expect: Filtri, pagina e ordinamento ripristinati da localStorage
    await expect(page).toHaveURL(/\/ente\/docsospesi$/);
    await expect(l.anno).toHaveText("2024");
    await expect(l.mese).toHaveText("Febbraio");
    await expect(l.annulla).toBeVisible();
    await expect(l.rows).toHaveCount(1);
  });
});

test.describe("Riquadro Credito sospeso", () => {
  test("Credito sospeso positivo, zero e negativo", async ({ page }) => {
    await mockPeriodo(page);
    const lista = await mockLista(page, FATTURE_PERIODO, 615);
    const l = locators(page);

    // 1. Mockare importoSospeso = 615
    await openPage(page);
    // expect: Valore '615,00 €', sfondo #F2FAF2
    await expect(l.totale).toHaveText(/^615,00\s€$/);
    expect(await totaleBackground(l)).toBe("rgb(242, 250, 242)");

    // 2. Mockare importoSospeso = 0
    lista.importo = 0;
    await openPage(page);
    // expect: Valore '--', sfondo #E3E7EB
    await expect(l.totale).toHaveText("--");
    expect(await totaleBackground(l)).toBe("rgb(227, 231, 235)");

    // 3. Mockare importoSospeso = -50
    lista.importo = -50;
    await openPage(page);
    // expect: Valore '-50,00 €', sfondo #ffeff1
    await expect(l.totale).toHaveText(/^-50,00\s€$/);
    expect(await totaleBackground(l)).toBe("rgb(255, 239, 241)");
  });

  test("Etichetta del riquadro", async ({ page }) => {
    await mockAll(page);
    const l = await openPage(page);

    // 1. Aprire la pagina e filtrare per Anno 2024 + Gennaio
    await selectOption(page, l.anno, "2024");
    await selectOption(page, l.mese, "Gennaio");
    await l.filtra.click();
    await expect(l.rows).toHaveCount(2);

    // expect: L'etichetta resta 'Credito sospeso' (labelAmount non e' usata nel render)
    await expect(l.totaleLabel).toBeVisible();
    await expect(page.getByText(/^Totale fatturato/)).toHaveCount(0);
  });
});

test.describe("Stati vuoti ed errori API", () => {
  test("Nessun risultato per filtro", async ({ page }) => {
    await mockPeriodo(page);
    await mockLista(page, FATTURE_PERIODO.filter((f) => f._anno !== 2025));
    const l = await openPage(page);

    // 1. Con un mock senza fatture 2025 selezionare Anno 2025 e cliccare Filtra
    await selectOption(page, l.anno, "2025");
    await l.filtra.click();

    // expect: messaggio vuoto, Credito '--', paginatore '0–0 of 0', next/prev e Download disabilitati
    await expect(l.empty).toBeVisible();
    await expect(l.totale).toHaveText("--");
    await expect(l.paginationLabel).toHaveText("0–0 of 0");
    await expect(l.next).toBeDisabled();
    await expect(l.prev).toBeDisabled();
    await expect(l.download).toBeDisabled();
  });

  test("Errore 500 su periodo/sospeso", async ({ page }) => {
    const l = locators(page);
    // 1. Mockare GET periodo/sospeso con 500
    await mockPeriodo(page, [], 500);
    const lista = await mockLista(page);
    await page.goto("/ente/docsospesi");

    // expect: Alert di errore, loading chiuso
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    await expect(l.loading).toBeHidden();
    // expect: Anno con sola opzione 'Tutti', pagina utilizzabile
    await l.anno.click();
    await expect(page.getByRole("option")).toHaveText(["Tutti"]);
    await page.keyboard.press("Escape");
    await expect(l.filtra).toBeEnabled();
    // expect: POST credito/sospeso non chiamata
    expect(lista.bodies).toHaveLength(0);
  });

  test("Errore 500 su credito/sospeso e ripristino", async ({ page }) => {
    const l = locators(page);
    await mockPeriodo(page);
    const lista = await mockLista(page);

    // 1. Mockare POST credito/sospeso con 500
    lista.status = 500;
    await page.goto("/ente/docsospesi");

    // expect: Alert di errore, loading chiuso, griglia vuota
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    await expect(l.loading).toBeHidden();
    await expect(l.empty).toBeVisible();

    // 2. Ripristinare la risposta corretta e cliccare Filtra
    lista.status = 200;
    await l.filtra.click();

    // expect: Griglia ripopolata con 6 righe
    await expect(l.rows).toHaveCount(6);
    expect(lista.bodies).toHaveLength(2);
  });

  // BUG APP: al primo caricamento docContSos.tsx chiama setShowLoadingGrid(false) (riga 202) prima che la
  // POST credito/sospeso termini, perche' getlistaFatturazione(bodyFatturazione) e' chiamata senza il flag
  // isCalledOnFiltraButton (in docConEme.tsx e' true). Il modale Loading si chiude mentre la lista e' ancora in caricamento.
  // Atteso dalla spec 7.4: modale visibile finche' la richiesta non termina. Asserzioni invariate.
  test.fixme("Risposta lenta / loading", async ({ page }) => {
    const l = locators(page);
    await mockPeriodo(page);
    const lista = await mockLista(page);

    // 1. Ritardare di 3s la risposta di credito/sospeso
    lista.delayMs = 3000;
    await page.goto("/ente/docsospesi");

    // expect: Modale 'Operazione in corso - Loading...' visibile finche' la richiesta non termina, poi griglia popolata
    await expect(page.getByText("Operazione in corso")).toBeVisible();
    await expect(l.loading).toBeVisible();
    await expect(l.loading).toBeHidden({ timeout: 10000 });
    await expect(l.rows).toHaveCount(6);
  });
});
