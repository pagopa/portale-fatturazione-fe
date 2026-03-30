import { test, expect, Page, Route } from "@playwright/test";
import path from "path";
import { checkAutocomplete, checkFilter } from "../utils/filters";
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

  test("test click button Annula Filtri", async ({ page }) => {
    CallMockPeriodoDOcumentiEmessiEnte(page);
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
    CallMockPeriodoDOcumentiEmessiEnte(page);
    CallMockListaDE(page)

    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
    // Start waiting for the download
    const [download] = await Promise.all([
      page.waitForEvent("download"), 
      page.click('button:has-text("Download risultati")'), 
    ]);

    // Get suggested filename
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

    await page.click('button:has-text("Filtra")');

    // Start waiting for the download
    const [download2] = await Promise.all([
      page.waitForEvent("download"), 
      page.click('button:has-text("Download risultati")'), 
    ]);

    // Get suggested filename
    const filename2 = download2.suggestedFilename();
    expect(filename2).toBe("Documenti emessi_Comune di San Mauro Torinese_2023.xlsx"); 

    // Optional: save the file to check contents
    const path2 = await download.path();
    expect(path2).not.toBeNull();
  });






  test("test logica filtri", async ({ page }) => {
    // 1️⃣ Mock API getPeriodoEmesso
    CallMockPeriodoDOcumentiEmessiEnte(page);
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
});

export async function CallMockPeriodoDOcumentiEmessiEnte(page: Page) {
  await page.route("**/api/fatture/ente/periodo**", async (route) => {
    const json = [
      {
        anno: 2023,
        tipologiaFattura: "SECONDO SALDO",
        dataFattura: "2026-02-01",
        mese: 9,
      },
      {
        anno: 2025,
        tipologiaFattura: "PRIMO SALDO",
        dataFattura: "2024-01-24",
        mese: 10,
      },
      {
        anno: 2025,
        tipologiaFattura: "PRIMO SALDO",
        dataFattura: "2024-01-24",
        mese: 11,
      },
      {
        anno: 2024,
        tipologiaFattura: "ACCONTO",
        dataFattura: "2025-02-03",
        mese: 1,
      },
      {
        anno: 2024,
        tipologiaFattura: "PRIMO SALDO",
        dataFattura: "2025-02-03",
        mese: 1,
      },
    ];
    await route.fulfill({ json });
  });
}


export async function CallMockListaDE(page: Page) {

  await page.route("**/api/fatture/ente/periodo/emesse**", async (route, request) => {
  const postData = request.postDataJSON();
  const mockData = [{
    "fattura": {
        "totale": 1261,
        "numero": 3559,
        "idfattura": 10220,
        "dataFattura": "2024-08-20",
        "prodotto": "prod-pn",
        "identificativo": "09/2024",
        "istitutioId": "729352e9-5bb9-4aff-a6b5-ca0c80c0d3b4",
        "onboardingTokenID": "85d72d7c-5955-408b-8d0d-f2c39fcacc82",
        "ragioneSociale": "Comune di San Mauro Torinese",
        "idcontratto": "85d72d7c-5955-408b-8d0d-f2c39fcacc82",
        "tipoDocumento": "TD01",
        "tipocontratto": "PAL",
        "divisa": "EUR",
        "metodoPagamento": "B30",
        "causale": "prod-pn ANTICIPO",
        "split": true,
        "inviata": 0,
        "sollecito": null,
        "stato": null,
        "datiGeneraliDocumento": [
            {
                "tipologia": "ANTICIPO",
                "riferimentoNumeroLinea": "",
                "idDocumento": "",
                "data": "2024-08-06",
                "numItem": "",
                "codiceCommessaConvenzione": "01_2024",
                "CUP": "",
                "CIG": null
            }
        ],
        "posizioni": [
            {
                "numeroLinea": 1,
                "testo": "",
                "codiceMateriale": "ANTICIPO ND 50%",
                "quantita": 1,
                "prezzoUnitario": 350,
                "imponibile": 350,
                "periodoRiferimento": "09/2024",
                "periodoFatturazione": "09/2024"
            },
            {
                "numeroLinea": 2,
                "testo": "",
                "codiceMateriale": "ANTICIPO NA 50%",
                "quantita": 1,
                "prezzoUnitario": 911,
                "imponibile": 911,
                "periodoRiferimento": "09/2024",
                "periodoFatturazione": "09/2024"
            }
        ]
    }
}
    ];

  console.log(postData); // 👈 super useful for debugging

  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockData),
  });
});

}
