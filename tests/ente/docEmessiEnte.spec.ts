import { test, expect, Page, Route } from "@playwright/test";
import path from "path";
import { checkAutocomplete, checkFilter } from "../utils/filters";
import {
  MockListaDoc,
  ResponsePeriodo,
} from "../utils/docEmessiMock/docEmessiMockType";
import {
  mockJsonListaDoc,
  mockJsonPeriodo,
  mockJsonPeriodo2,
} from "../utils/docEmessiMock/docEmessiMock";
const authFile = path.join(__dirname, "../.auth/user.json");

test.describe("Documenti Emessi ENTE", () => {
  const filters = [
    { name: "anno", label: "Anno", type: "form_input" },
    { name: "mese", label: "Mese", type: "form_input" },
    {
      name: "tipologia_fattura",
      label: "Tipologia Fattura",
      type: "autocomplete",
    },
    { name: "data_fattura", label: "Data Fattura", type: "autocomplete" },
  ];

  test("test presenza dei filtri nel DOM", async ({ page }) => {
    // Page exist
    await page.context().storageState({ path: authFile });
    await page.goto("/ente/docemessi");

    const h4 = page.locator("h4", { hasText: "Documenti contabili emessi" });
    await expect(h4).toHaveCount(1);

    for (const filter of filters) {
      if (filter.type === "autocomplete") {
        await checkAutocomplete(page, filter);
      } else {
        await checkFilter(page, filter);
      }
    }

    await page.route("**/api/fatture/ente/periodo/emesse**", async (route) => {
      const mockResponse = {
        data: [],
      };

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockResponse),
      });
    });

    // Trigger the API call: either page reload or button click if SPA triggers on mount
    await page.reload();

    // Now check buttons
    const filterButton = page.locator("button", { hasText: "Filtra" });
    const annullaButton = page.locator("button", { hasText: "Annulla Filtri" });

    // Expectations based on mocked API
    await expect(filterButton).toBeVisible();
    await expect(annullaButton).toHaveCount(0); // hidden
  });

  test("test click button ANNULLA FILTRI", async ({ page }) => {
    CallMockPeriodoDOcumentiEmessiEnte(page, mockJsonPeriodo,"**/api/fatture/ente/periodo**");
    await page.goto("/ente/docemessi");
    const annullaButton = page.locator("button", { hasText: "Annulla Filtri" });
    await expect(annullaButton).toHaveCount(0);

    const annoSelect = page.locator("div#filter_anno");
    const meseSelect = page.locator("div#filter_mese");
    await expect(annoSelect).toBeVisible();

    //Click su filtro anno
    await annoSelect.click();
    await expect(page.locator("li", { hasText: "2024" })).toBeVisible();
    await page.locator("li", { hasText: "2024" }).click();

    await meseSelect.click();
    await expect(page.locator("li", { hasText: "Gennaio" })).toBeVisible();
    await page.locator("li", { hasText: "Gennaio" }).click();

    const autocompleteTipologia = await page.locator(
      "#filter_tipologia_fattura",
    );
    await autocompleteTipologia.click();
    //Seleziono tipologia PRIMO SALDO
    await expect(
      page.getByRole("option", { name: "PRIMO SALDO" }),
    ).toBeVisible();
    await page.getByRole("option", { name: "PRIMO SALDO" }).click();

    await annullaButton.click();
    expect(page.locator('#filter_anno [role="combobox"]')).toHaveText("Tutti");
    expect(page.locator('#filter_mese [role="combobox"]')).toHaveText("Tutti");
    await expect(
      page.locator("#filter_tipologia_fattura .MuiChip-root"),
    ).toHaveCount(0);
    await expect(
      page.locator("#filter_data_fattura .MuiChip-root"),
    ).toHaveCount(0);
    await expect(annullaButton).toHaveCount(0);

    //Click su filtro anno
    await annoSelect.click();
    await expect(page.locator("li", { hasText: "2025" })).toBeVisible();
    await page.locator("li", { hasText: "2025" }).click();

    await autocompleteTipologia.click();
    //Seleziono tipologia PRIMO SALDO
    await expect(
      page.getByRole("option", { name: "PRIMO SALDO" }),
    ).toBeVisible();
    await page.getByRole("option", { name: "PRIMO SALDO" }).click();

    //click DATA
    const autocompleteDataFattura = await page.locator("#filter_data_fattura");
    await autocompleteDataFattura.click();
    //seleziona data 2024-01-24
    await expect(
      page.getByRole("option", { name: "2024-01-24" }),
    ).toBeVisible();
    await page.getByRole("option", { name: "2024-01-24" }).click();

    await annullaButton.click();
    expect(page.locator('#filter_anno [role="combobox"]')).toHaveText("Tutti");
    expect(page.locator('#filter_mese [role="combobox"]')).toHaveText("Tutti");
    await expect(
      page.locator("#filter_tipologia_fattura .MuiChip-root"),
    ).toHaveCount(0);
    await expect(
      page.locator("#filter_data_fattura .MuiChip-root"),
    ).toHaveCount(0);
    await expect(annullaButton).toHaveCount(0);
  });

  test("test click button DOWNLOAD RISULTATI", async ({ page }) => {
    await page.goto("/ente/docemessi");
    //Chiamo api periodo che popola i filtri
    const buttonDownload = page.getByRole("button", {
      name: "Download risultati",
      exact: true,
    });

    CallMockPeriodoDOcumentiEmessiEnte(
      page,
      mockJsonPeriodo,
      "**/api/fatture/ente/periodo**",
    );

    //chiamo api lista che popola la grid
    CallMockListaDE(
      page,
      mockJsonListaDoc,
      "**/api/fatture/ente/periodo/emesse**",
    );

    //Deve essere visibile una row
    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible();
    // Start waiting for the download
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click('button:has-text("Download risultati")'),
    ]);

    // Nome atteso del file download
    const filename = download.suggestedFilename();
    expect(filename).toBe("Documenti emessi_Comune di San Mauro Torinese.xlsx");

    // Optional: save the file to check contents
    const path = await download.path();
    expect(path).not.toBeNull();

    const annoSelect = page.locator("div#filter_anno");
    const meseSelect = page.locator("div#filter_mese");

    await annoSelect.click();
    //Seleziono anno 2023
    await page.locator("li", { hasText: "2023" }).click();

    //il button  è diabled ed é presente solamente un button con la lebel descritta
    await expect(buttonDownload).toHaveCount(1);
    await expect(buttonDownload).toBeDisabled();
    //click su filtra
    await page.click('button:has-text("Filtra")');

    // Click su button download
    const [download2] = await Promise.all([
      page.waitForEvent("download"),
      page.click('button:has-text("Download risultati")'),
    ]);

    // nome atteso del file
    const filename2 = download2.suggestedFilename();
    expect(filename2).toBe(
      "Documenti emessi_Comune di San Mauro Torinese_2023.xlsx",
    );

    // Optional: save the file to check contents
    const path2 = await download.path();
    expect(path2).not.toBeNull();

    await annoSelect.click();
    //Seleziono anno 2024
    await page.locator("li", { hasText: "2024" }).click();
    //Seleziono mese GENNAIO
    await meseSelect.click();
    await page.locator("li", { hasText: "Gennaio" }).click();
    await expect(buttonDownload).toBeDisabled();

    await page.click('button:has-text("Filtra")');
    //CLICK sul button DOWNLOAD
    const [download3] = await Promise.all([
      page.waitForEvent("download"),
      page.click('button:has-text("Download risultati")'),
    ]);
    //Nome del file atteso
    const filename3 = download3.suggestedFilename();
    expect(filename3).toBe(
      "Documenti emessi_Comune di San Mauro Torinese_Gennaio_2024.xlsx",
    );
  });

  test("test logica filtri", async ({ page }) => {
    // 1️⃣ Mock API getPeriodoEmesso
    CallMockPeriodoDOcumentiEmessiEnte(
      page,
      mockJsonPeriodo,
      "**/api/fatture/ente/periodo**",
    );
    //vai page documenti emessi
    await page.goto("/ente/docemessi");
    //Button Annulla deve essere nascosto
    const annullaButton = page.locator("button", { hasText: "Annulla Filtri" });
    await expect(annullaButton).toHaveCount(0);

    const annoSelect = page.locator("div#filter_anno");
    const meseSelect = page.locator("div#filter_mese");
    await expect(annoSelect).toBeVisible();

    //Click su filtro anno
    await annoSelect.click();
    //check se tutti gli anni sono visibili
    const optionYear = ["2023", "2024", "2025"];
    for (const opt of optionYear) {
      await expect(page.locator("li", { hasText: opt })).toBeVisible();
    }
    //Seleziono anno 2023
    await page.locator("li", { hasText: "2023" }).click();

    //Button Annulla deve essere visibile
    await expect(annullaButton).toBeVisible();
    //Seleziono anno Tutti

    //Click su filtro anno
    await annoSelect.click();
    await expect(page.locator("li", { hasText: "Tutti" })).toBeVisible();
    await page.locator("li", { hasText: "Tutti" }).click();
    //Button Annulla filtri deve essere nascosto
    await expect(annullaButton).toHaveCount(0);
    //select mese deve essere disabled
    const CheckMeseDisabled = page.locator('div#filter_mese [role="combobox"]');
    await expect(CheckMeseDisabled).toHaveAttribute("aria-disabled", "true");
    await expect(CheckMeseDisabled).toBeDisabled();

    //Click su filtro anno
    await annoSelect.click();
    await expect(page.locator("li", { hasText: "2024" })).toBeVisible();
    await page.locator("li", { hasText: "2024" }).click();
    //Click su filtro mese e select GENNAIO
    await meseSelect.click();
    //controllo che tutti i mesi siano visibili
    const optionMonth = ["Gennaio"];
    for (const opt of optionMonth) {
      await expect(page.locator("li", { hasText: opt })).toBeVisible();
    }
    await expect(page.locator("li", { hasText: "Gennaio" })).toBeVisible();
    await page.locator("li", { hasText: "Gennaio" }).click();
    //Button Annulla filtri deve essere visibile
    await expect(annullaButton).toBeVisible();

    //CLick select anno
    await annoSelect.click();
    // Seleziono Anno value TUTTI
    await expect(page.locator("li", { hasText: "Tutti" })).toBeVisible();
    await page.locator("li", { hasText: "Tutti" }).click();

    await page.waitForTimeout(300);
    //Click su tipologia
    const autocompleteTipologia = await page.locator(
      "#filter_tipologia_fattura",
    );
    await autocompleteTipologia.click();
    const optiontipologie = ["ACCONTO", "PRIMO SALDO"];
    //controllo che le tipologie sono visibili
    for (const opt of optiontipologie) {
      const locator = page.getByRole("option", { name: opt });
      const count = await locator.count();
      await expect(locator).toBeVisible(); // exactly one of each
    }
    //Seleziono tipologia ACCONTO
    await page.getByRole("option", { name: "ACCONTO" }).click();

    //Seleziono tipologia PRIMO SALDO
    await expect(
      page.getByRole("option", { name: "PRIMO SALDO" }),
    ).toBeVisible();
    await page.getByRole("option", { name: "PRIMO SALDO" }).click();
    await expect(annullaButton).toBeVisible();

    //CLick select anno
    await annoSelect.click();
    //Seleziono anno 2025
    await expect(page.locator("li", { hasText: "2025" })).toBeVisible();
    await page.locator("li", { hasText: "2025" }).click();

    //DISABLED datafattura
    const CheckOnDataStatus = page.locator("#filter_data_fattura");
    await expect(CheckOnDataStatus).toBeDisabled();

    const CheckOnMeseStatus = page.locator('div#filter_mese [role="combobox"]');
    //ENABLED MESE
    await expect(CheckOnMeseStatus).not.toHaveAttribute("aria-disabled");
    //click tipologia
    await autocompleteTipologia.click();
    //Seleziono tipologia PRIMO SALDO
    await expect(
      page.getByRole("option", { name: "PRIMO SALDO" }),
    ).toBeVisible();
    await page.getByRole("option", { name: "PRIMO SALDO" }).click();

    //click DATA
    const autocompleteDataFattura = await page.locator("#filter_data_fattura");
    await autocompleteDataFattura.click();
    //seleziona data 2024-01-24
    await expect(
      page.getByRole("option", { name: "2024-01-24" }),
    ).toBeVisible();
    await page.getByRole("option", { name: "2024-01-24" }).click();
    await expect(annullaButton).toBeVisible();

    //click mese
    await meseSelect.click();
    //Seleziono mese NOVEMBRE
    await expect(page.locator("li", { hasText: "Novembre" })).toBeVisible();
    await page.locator("li", { hasText: "Novembre" }).click();

    //DISABLED datafattura
    await expect(CheckOnDataStatus).toBeDisabled();

    //Clear delle TIPOLOGIE E DATE selezionate
    await expect(
      page.locator("#filter_tipologia_fattura .MuiChip-root"),
    ).toHaveCount(0);
    await expect(
      page.locator("#filter_data_fattura .MuiChip-root"),
    ).toHaveCount(0);
    //DISABLED datafattura
    await expect(CheckOnDataStatus).toBeDisabled();
    await expect(annullaButton).toBeVisible();

    //Select Anno
    await annoSelect.click();
    // Seleziono Anno value tutti
    await expect(page.locator("li", { hasText: "Tutti" })).toBeVisible();
    await page.locator("li", { hasText: "Tutti" }).click();

    //DISABLED datafattura
    await expect(CheckOnDataStatus).toBeDisabled();

    //DISABLED mese
    await expect(CheckMeseDisabled).toHaveAttribute("aria-disabled", "true");
    //Button annulla filtri hidden
    await expect(annullaButton).toHaveCount(0);
  });

  test("test pagination grid EMESSE", async ({ page }) => {
    //vai pagina doc emessi
    await page.goto("/ente/docemessi");
    const allItems = Array.from({ length: 33 }, (_, i) => ({
      fattura: {
        idfattura: i + 1,
        numero: i + 1,
        totale: 100 + i,
        ragioneSociale: `Comune ${i + 1}`,
        dataFattura: "2024-01-01",
        prodotto: "test",
        identificativo: `ID-${i}`,
        istitutioId: "x",
        onboardingTokenID: "x",
        idcontratto: "x",
        tipoDocumento: "TD01",
        tipocontratto: "PAL",
        divisa: "EUR",
        metodoPagamento: "B30",
        causale: "test",
        split: true,
        inviata: 0,
        sollecito: null,
        stato: null,
        datiGeneraliDocumento: [
          {
            tipologia: "ANTICIPO" + i + 1,
            riferimentoNumeroLinea: "",
            idDocumento: "",
            data: "2024-08-06",
            numItem: "",
            codiceCommessaConvenzione: "01_2024",
            CUP: "",
            CIG: null,
          },
        ],
        posizioni: [],
      },
    }));
    const mockListaDocTestPagination: MockListaDoc = {
      dettagli: allItems,
      importo: "3300",
    };
    // chiamata che popola filtri e lista grid - il periodo non servirebbe
    CallMockPeriodoDOcumentiEmessiEnte(
      page,
      mockJsonPeriodo2,
      "**/api/fatture/ente/periodo**",
    );
    CallMockListaDE(
      page,
      mockListaDocTestPagination,
      "**/api/fatture/ente/periodo/emesse**",
    );

    // Select dei buttons paginator della grid emessi e NON contestate
    const pagination = page.locator("#docEmessiEnte-pagination");
    // Locate the "Go to next page" button inside that container
    const nextPageButton = pagination.getByRole("button", {
      name: "Go to next page",
    });
    const prevPageButton = pagination.getByRole("button", {
      name: "Go to previous page",
    });
    //il button per andare alla pagina precedente deve essere disabilitato
    await expect(prevPageButton).toBeDisabled();

    //Seleziono la grid emesse
    const grid = page.locator("#docEmessiEnte > tbody");
    const visibleRows = grid.locator("> tr:visible").filter({
      hasText: "Emessa",
    });
    //dovrei vedere 10 righe per pagina
    const rowCount = await visibleRows.count();
    await expect(visibleRows).toHaveCount(10);

    //controllo che siano effettivamente i primi 10 elementi della lista
    for (let i = 0; i < rowCount; i++) {
      const row = visibleRows.nth(i);
      const rowText = await row.innerText();

      const expectedText = `ID-${i}`;
      await expect(rowText).toContain(expectedText);
    }
    // il button per andare alla pagina successiva deve essere abilitato
    await expect(nextPageButton).toBeEnabled();

    //click sul button per andare alla pagina successiva
    await nextPageButton.click();

    //Check che siano visibili i successivi 10 elementi della lista (11 to 20)
    for (let i = 0; i < rowCount; i++) {
      const row = visibleRows.nth(i);
      const rowText = await row.innerText();
      const expectedText = `ID-${Number(i) + 10}`;
      await expect(rowText).toContain(expectedText);
    }
    // doppio click sul button per andare alla pagina successiva
    await nextPageButton.click();
    await nextPageButton.click();
    //deve essere visibile solamente gli ultimi 3 elementi della lista (31-33)
    await expect(visibleRows).toHaveCount(3);
    //il button per andare alla pagina successiva deve essere disabilitato
    await expect(nextPageButton).toBeDisabled();
  });

  test("test pagination grid CONTESTATE", async ({ page }) => {
    //vai pagina doc emessi
    await page.goto("/ente/docemessi");
    const allItems = Array.from({ length: 33 }, (_, i) => ({
      fattura: {
        idfattura: i + 1,
        numero: i + 1,
        totale: 100 + i,
        ragioneSociale: `Comune ${i + 1}`,
        dataFattura: "2024-01-01",
        prodotto: "test",
        identificativo: `ID-${i}`,
        istitutioId: "x",
        onboardingTokenID: "x",
        idcontratto: "x",
        tipoDocumento: "TD01",
        tipocontratto: "PAL",
        divisa: "EUR",
        metodoPagamento: "B30",
        causale: "test",
        split: true,
        inviata: 0,
        sollecito: null,
        stato: null,
        datiGeneraliDocumento: [
          {
            tipologia: "ANTICIPO" + i + 1,
            riferimentoNumeroLinea: "",
            idDocumento: "",
            data: "2024-08-06",
            numItem: "",
            codiceCommessaConvenzione: "01_2024",
            CUP: "",
            CIG: null,
          },
        ],
        posizioni: [],
      },
    }));
    const mockListaDocTestPagination: MockListaDoc = {
      dettagli: allItems,
      importo: "3300",
    };
    // chiamata che popola filtri e lista grid - il periodo non servirebbe

    CallMockListaDE(
      page,
      mockListaDocTestPagination,
      "**/api/fatture/ente/eliminate**",
    );

    // Select dei buttons paginator della grid emessi e NON contestate
    const pagination = page.locator("#docEmessiEnteContestate-pagination");
    // Locate the "Go to next page" button inside that container
    const nextPageButton = pagination.getByRole("button", {
      name: "Go to next page",
    });
    const prevPageButton = pagination.getByRole("button", {
      name: "Go to previous page",
    });
    //il button per andare alla pagina precedente deve essere disabilitato
    await expect(prevPageButton).toBeDisabled();

    //Seleziono la grid emesse
    const grid = page.locator("#docEmessiEnteContestate > tbody");
    const visibleRows = grid.locator("> tr:visible").filter({
      hasText: "Emessa",
    });
    //dovrei vedere 10 righe per pagina
    const rowCount = await visibleRows.count();
    await expect(visibleRows).toHaveCount(10);

    //controllo che siano effettivamente i primi 10 elementi della lista
    for (let i = 0; i < rowCount; i++) {
      const row = visibleRows.nth(i);
      const rowText = await row.innerText();

      const expectedText = `ID-${i}`;
      await expect(rowText).toContain(expectedText);
    }
    // il button per andare alla pagina successiva deve essere abilitato
    await expect(nextPageButton).toBeEnabled();

    //click sul button per andare alla pagina successiva
    await nextPageButton.click();

    //Check che siano visibili i successivi 10 elementi della lista (11 to 20)
    for (let i = 0; i < rowCount; i++) {
      const row = visibleRows.nth(i);
      const rowText = await row.innerText();
      const expectedText = `ID-${Number(i) + 10}`;
      await expect(rowText).toContain(expectedText);
    }
    // doppio click sul button per andare alla pagina successiva
    await nextPageButton.click();
    await nextPageButton.click();
    //deve essere visibile solamente gli ultimi 3 elementi della lista (31-33)
    await expect(visibleRows).toHaveCount(3);
    //il button per andare alla pagina successiva deve essere disabilitato
    await expect(nextPageButton).toBeDisabled();
  });
  test("test sort filters grid", async ({ page }) => {
    //vai pagina doc emessi
    await page.goto("/ente/docemessi");
    const allItems = Array.from({ length: 31 }, (_, i) => ({
      fattura: {
        idfattura: i + 1,
        numero: i + 1,
        totale: 100 + Number(i),
        ragioneSociale: `Comune ${i + 1}`,
        dataFattura: `${Number(2000) + Number(i)}-08-${Number(i)+1}`,
        prodotto: "test",
        identificativo: `${i}/2024`,
        istitutioId: "x",
        onboardingTokenID: "x",
        idcontratto: "x",
        tipoDocumento: `TD${Number(i) + 1}`,
        tipocontratto: "PAL",
        divisa: "EUR",
        metodoPagamento: "B30",
        causale: "test",
        split: true,
        inviata: 0,
        sollecito: null,
        stato: null,
        datiGeneraliDocumento: [
          {
            tipologia: "ANTICIPO" + (Number(i) + 1),
            riferimentoNumeroLinea: "",
            idDocumento: "",
            data: "2024-08-06",
            numItem: "",
            codiceCommessaConvenzione: "01_2024",
            CUP: "",
            CIG: null,
          },
        ],
        posizioni: [],
      },
    }));
    const mockListaDocTestPagination: MockListaDoc = {
      dettagli: allItems,
      importo: "3300",
    };
    // chiamata che popola la grid doc emessi
    CallMockListaDE(
      page,
      mockListaDocTestPagination,
      "**/api/fatture/ente/periodo/emesse**",
    );
    const table = page.locator("#docEmessiEnte");

    //DATA FATTURA
    // Find the column header by accessible name
    const buttonDataFattura = table.getByRole("columnheader", { name: "Data Fattura" });

    // Click the button inside that header

    await buttonDataFattura.locator("button").click();
      //Seleziono la grid emesse
    const grid = page.locator("#docEmessiEnte > tbody");
    const visibleRows = grid.locator("> tr:visible").filter({
      hasText: "Emessa",
    })
    
    const firstRow = visibleRows.first();
    console.log(await firstRow.innerText());
    await expect(firstRow).toContainText("01/08/2000");

 
    await buttonDataFattura.locator("button").click();
    await expect(firstRow).toContainText("31/08/2030");
   
    await buttonDataFattura.locator("button").click()
    await expect(firstRow).toContainText("01/08/2000");

     const pagination = page.locator("#docEmessiEnte-pagination");
    // Locate the "Go to next page" button inside that container
    const nextPageButton = pagination.getByRole("button", {
      name: "Go to next page",
    });
     const prevPageButton = pagination.getByRole("button", {
      name: "Go to previous page",
    });
    //il button per andare alla pagina precedente deve essere disabilitato
    await expect(prevPageButton).toBeDisabled();
     // il button per andare alla pagina successiva deve essere abilitato
    await expect(nextPageButton).toBeEnabled();

    //click sul button per andare alla pagina successiva
    await nextPageButton.click();
   
    await expect(firstRow).toContainText("11/08/2010");
    await expect(prevPageButton).toBeEnabled();
  
    //IDENTIFICATIVO 
    const buttonIdentificativo = table.getByRole("columnheader", { name: "Ident." });

    await buttonIdentificativo.locator("button").click();

    const visibleRows2 = grid.locator("> tr:visible").filter({
      hasText: "Emessa",
    })
    
    const firstRow2 = visibleRows2.first();
    console.log(2,await firstRow2.innerText());
    await expect(firstRow2).toContainText("0/2024");

    await nextPageButton.click();
     await page.pause()
    await expect(firstRow2).toContainText("20/2024");
 
  });
});

export async function CallMockPeriodoDOcumentiEmessiEnte(
  page: Page,
  customJson: ResponsePeriodo[],
  path: string,
) {
  await page.route(path, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      json: customJson, // ✅ use json, not customJson
    });
  });
}

export async function CallMockListaDE(
  page: Page,
  customJson: MockListaDoc,
  path: string,
) {
  await page.route(path, async (route, request) => {
    //const postData = request.postDataJSON();

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(customJson),
    });
  });
}
