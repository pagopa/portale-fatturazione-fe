import { test, expect, Page, Route } from "@playwright/test";
import {
    checkAutocomplete,
    checkFilter,
    testSortFilter,
} from "../utils/filters";
import { mockJsonListaDocSospeso, mockJsonPeriodoSospeso, mockJsonPeriodoSospeso2 } from "../utils/docSospesiMock/dosSospesiMock";
import { MockListaDoc, ResponsePeriodo } from "../utils/docSospesiMock/type";

import path from "path";

const authFile = path.join(__dirname, "../.auth/user.json");

test.describe("Test Dettaglio Doc Emessi Sospesi Rel", () => {});

test.describe("Documenti SOSPESI ENTE", () => {
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
        await page.goto("/ente/docsospesi");
    
        //chiamo api lista che popola la grid
        CallMockListaDE(
            page,
            mockJsonListaDocSospeso,
            "**/api/fatture/ente/credito/sospeso**",
        );

    

        const h4 = page.locator("h4", { hasText: "Documenti contabili sospesi" });
        await expect(h4).toHaveCount(1);
  
        for (const filter of filters) {
            if (filter.type === "autocomplete") {
                await checkAutocomplete(page, filter);
            } else {
                await checkFilter(page, filter);
            }
        }



        // Now check buttons
        const filterButton = page.locator("button", { hasText: "Filtra" });
        const annullaButton = page.locator("button", { hasText: "Annulla Filtri" });

        // Expectations based on mocked API
        await expect(filterButton).toBeVisible();
        await expect(annullaButton).toHaveCount(0); // hidden
    });

    test("test click button ANNULLA FILTRI", async ({ page }) => {
        CallMockPeriodoDOcumentiSospesiEnte(
            page,
            mockJsonPeriodoSospeso,
            "**/api/fatture/ente/periodo/sospeso**",
        );
        await page.goto("/ente/docsospesi");
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
        await page.goto("/ente/docsospesi");
        //Chiamo api periodo che popola i filtri
        const buttonDownload = page.getByRole("button", {
            name: "Download risultati",
            exact: true,
        });

        CallMockPeriodoDOcumentiSospesiEnte(
            page,
            mockJsonPeriodoSospeso,
            "**/api/fatture/ente/periodo/sospeso**",
        );

        //chiamo api lista che popola la grid
        CallMockListaDE(
            page,
            mockJsonListaDocSospeso,
            "**/api/fatture/ente/credito/sospeso**",
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
        expect(filename).toBe("Documenti sospesi_Comune di San Mauro Torinese.xlsx");

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
            "Documenti sospesi_Comune di San Mauro Torinese_2023.xlsx",
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
            "Documenti sospesi_Comune di San Mauro Torinese_Gennaio_2024.xlsx",
        );
    });

    test("test logica filtri", async ({ page }) => {
    // 1️⃣ Mock API getPeriodoEmesso
        CallMockPeriodoDOcumentiSospesiEnte(
            page,
            mockJsonPeriodoSospeso,
            "**/api/fatture/ente/periodo/sospeso**",
        );
        //vai page documenti emessi
        await page.goto("/ente/docsospesi");
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

        //test RELOAD PAGE
        //Click su filtro anno
        await annoSelect.click();
        //Seleziono anno 2023
        await page.locator("li", { hasText: "2023" }).click();

        await meseSelect.click();
        await expect(page.locator("li", { hasText: "Settembre" })).toBeVisible();
        await page.locator("li", { hasText: "Settembre" }).click();

        await autocompleteTipologia.click();
        await expect(
            page.getByRole("option", { name: "SECONDO SALDO" }),
        ).toBeVisible();
        await page.getByRole("option", { name: "SECONDO SALDO" }).click();
        await page.click('button:has-text("Filtra")');
        await page.reload();

        await meseSelect.click();
        await expect(page.locator("li", { hasText: "Tutti" })).toBeVisible();
        await page.locator("li", { hasText: "Tutti" }).click();

        await autocompleteTipologia.click();
        await expect(
            page.getByRole("option", { name: "SECONDO SALDO" }),
        ).toBeVisible();
        await page.getByRole("option", { name: "SECONDO SALDO" }).click();

        await autocompleteDataFattura.click();
    
        await expect(
            page.getByRole("option", { name: "2026-02-01" }),
        ).toBeVisible();
        await page.getByRole("option", { name: "2026-02-01" }).click();

        await page.click('button:has-text("Filtra")');
        await page.reload();
   
    });

    test("test pagination grid SOSPESE", async ({ page }) => {
    //vai pagina doc emessi
        await page.goto("/ente/docsospesi");
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
            importoSospeso: "3300",
        };
        // chiamata che popola filtri e lista grid - il periodo non servirebbe
        CallMockPeriodoDOcumentiSospesiEnte(
            page,
            mockJsonPeriodoSospeso2,
            "**/api/fatture/ente/periodo/sospeso**",
        );
        CallMockListaDE(
            page,
            mockListaDocTestPagination,
            "**/api/fatture/ente/credito/sospeso**",
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
            hasText: "Sospesa",
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
        await page.goto("/ente/docsospesi");
        const allItems = Array.from({ length: 31 }, (_, i) => ({
            fattura: {
                idfattura: i + 1,
                numero: i + 1,
                totale: Number(i),
                ragioneSociale: `Comune ${i + 1}`,
                dataFattura: `${Number(2000) + Number(i)}-08-${Number(i) + 1}`,
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
                        tipologia: i % 2 === 0 ? "ANTICIPO" : "PRIMO SALDO",
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
            importoSospeso: "3300",
        };
        CallMockPeriodoDOcumentiSospesiEnte(
            page,
            mockJsonPeriodoSospeso2,
            "**/api/fatture/ente/periodo/sospeso**",
        );
        // chiamata che popola la grid doc emessi
        CallMockListaDE(
            page,
            mockListaDocTestPagination,
            "**/api/fatture/ente/credito/sospeso**",
        );

        const table = page.locator("#docEmessiEnte");
        await expect(table).toBeVisible();
        const grid = page.locator("#docEmessiEnte > tbody");
        const pagination = page.locator("#docEmessiEnte-pagination");

        await testSortFilter({
            page: page,
            table: table,
            grid: grid,
            pagination: pagination,
            columnName: "Data Fattura",
            expectedValues: ["01/08/2000", "31/08/2030", "01/08/2000", "11/08/2010"],
            hasText:"Sospesa"
        });
        await page.click('button:has-text("Filtra")');

        await testSortFilter({
            page: page,
            table: table,
            grid: grid,
            pagination: pagination,
            columnName: "Ident.",
            expectedValues: ["0/2024", "30/2024", "0/2024", "10/2024"],
            hasText:"Sospesa"
        });
        await page.click('button:has-text("Filtra")');
        await testSortFilter({
            page: page,
            table: table,
            grid: grid,
            pagination: pagination,
            columnName: "Tot.",
            expectedValues: ["0", "30", "0", "10"],
            hasText:"Sospesa"
        });
        await page.click('button:has-text("Filtra")');

        await testSortFilter({
            page: page,
            table: table,
            grid: grid,
            pagination: pagination,
            columnName: "N. Fattura",
            expectedValues: ["1", "31", "1", "11"],
            hasText:"Sospesa"
        });
        await page.click('button:has-text("Filtra")');
        await testSortFilter({
            page: page,
            table: table,
            grid: grid,
            pagination: pagination,
            columnName: "Tipo Documento",
            expectedValues: ["TD1", "TD31", "TD1", "TD11"],
            hasText:"Sospesa"
        });
        await page.click('button:has-text("Filtra")');

        //seleziono filtro  anticipo
        const autocompleteTipologia = await page.locator(
            "#filter_tipologia_fattura",
        );
        await autocompleteTipologia.click();
        const optiontipologie = ["ANTICIPO", "PRIMO SALDO"];
        //controllo che le tipologie sono visibili
        for (const opt of optiontipologie) {
            const locator = page.getByRole("option", { name: opt });
            const count = await locator.count();
            await expect(locator).toBeVisible(); // exactly one of each
        }
        //Seleziono tipologia ACCONTO
        await page.getByRole("option", { name: "ANTICIPO" }).click();
        //controllo che i filtri header siano disabled
        const headers = table.locator("thead tr th");

        const count = await headers.count();

        for (let i = 0; i < count; i++) {
            const th = headers.nth(i);

            const text = await th.innerText();

            // skip empty headers
            if (!text.trim()) continue;

            const sortButton = th.locator("button");

            // skip non-sortable columns
            if ((await sortButton.count()) === 0) continue;

            const icon = th.locator('[data-testid="ArrowUpwardIcon"]');

            await expect(icon).toBeVisible();
        }
        // click su filtra
        await page.click('button:has-text("Filtra")');
        //vado nella seconda pagina
        const nextPageButton = pagination.getByRole("button", {
            name: "Go to next page",
        });

        await nextPageButton.click();
        // controlllo che gli elementi siano 3 / 4
        const visibleRows = grid.locator("> tr:visible").filter({
            hasText: "Sospesa",
        });
  
        expect(await visibleRows.count()).toBe(6);

        // doppio click su sort data
        const header = table.getByRole("columnheader", { name: "Data Fattura" });
        await expect(header).toHaveCount(1);
        const buttonDataFattura = header.locator("button");

        // controllo che l'ordinamento sia corretto anche nella seconda pagina
        const getFirstRow = grid
            .locator("> tr:visible")
            .filter({ hasText: "Sospesa" })
            .first();

        await buttonDataFattura.click();
        await buttonDataFattura.click();
        await expect(getFirstRow).toContainText("11/08/2010");
        //click su sort tipo documento
        const headerTipodoc = table.getByRole("columnheader", {
            name: "Tipo Documento",
        });
        await expect(headerTipodoc).toHaveCount(1);
        const buttonTipoDocumento = headerTipodoc.locator("button");
        await buttonTipoDocumento.click();
        //check che l'icona di dat sia ArrowUpwardIcon

        // Make sure it exists
        await expect(header).toHaveCount(1);
        // Check that the button inside it has the icon
        const icon = header.locator('button [data-testid="ArrowUpwardIcon"]');

        await expect(icon).toBeVisible();
        //controllo l'ordinamento
        await expect(getFirstRow).toContainText("TD21");
        // click annulla filtri
        const annullaButton = page.locator("button", { hasText: "Annulla Filtri" });
        await annullaButton.click();
        //check che le rows siano 10
        expect(await visibleRows.count()).toBe(10);

        // Check della label nel componente pagination
        const displayedRows = pagination.locator(
            "p.MuiTablePagination-displayedRows",
        );

        // check che ci siano tutti gli elementi
        await expect(displayedRows).toHaveText("1–10 of 31");
    });

});

export async function CallMockPeriodoDOcumentiSospesiEnte(
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

    await page.route(path, async (route, request) => {
    // read POST body
        const postData = request.postDataJSON();

        // extract filters
        const tipologie: string[] = postData?.tipologiaFattura || [];

        // filter the data
        let filtered = customJson.dettagli;

        if (tipologie.length > 0) {
            filtered = filtered.filter((item) =>
                item.fattura.datiGeneraliDocumento.some((d) =>
                    tipologie.some((tipo) =>
                        d.tipologia?.toUpperCase().includes(tipo.toUpperCase()),
                    ),
                ),
            );
        }

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                ...customJson,
                dettagli: filtered,
            }),
        });
    });
}
