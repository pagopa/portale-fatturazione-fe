import { test, expect, Page, Route } from "@playwright/test";
import { anniModuloCommessaMock, mesiGridTest } from "../utils/moduloCommessaMock/moduloCommessaMock";
import path from "path/win32";
import fs from 'fs';

const authFile = path.join(__dirname, "../playwright/.auth/user.json");
const authData = JSON.parse(fs.readFileSync(authFile, 'utf-8'));

// get localStorage value
const localStorageValue = authData.origins[0].localStorage[0].value;
const globalState = JSON.parse(localStorageValue);
const tipoContratto = globalState.state.mainState.profilo.idTipoContratto
const nomeEnte = globalState.state.mainState.profilo.nomeEnte
test.describe("Test Logica Modulo Commessa", () => {
    test("Test modulo commessa , inserimento non abilitato", async ({ page}) => {
        //arrivo sul portale
        await page.goto("ente/datidifatturazione");
        //page.on('request', request => console.log('REQUEST:', request.url()));
        //page.on('response', response => console.log('RESPONSE:', response.url()));
        //click side nav modulo commessa 
        const span = page.locator('#nav_modulocommessa .MuiListItemText-primary');
        await expect(span).toBeVisible();
        await expect(span).toHaveText('Modulo commessa');

            //intercepr api/v2/modulocommessa/obbligatori/verifica
        await page.route("**/api/v2/modulocommessa/obbligatori/verifica**", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(false),
            });   
        });
        await span.click();
    
        //se false arrivo in pagina /ente/modulicommessa
        await page.waitForURL('**/ente/modulicommessa**');
        expect(page.url()).toContain('/ente/modulicommessa');
        
        //intercept /api/modulocommessa/anni  lista anni 
        await page.route("**/api/modulocommessa/anni**", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(anniModuloCommessaMock),
            });   
        });
        //select anno 2024 e click su filtra
        await page.routeFromHAR('./tests/hars/listaCommessaWithAnno/modulocommessa-2024.har', {
            url: '*/**/api/v2/modulocommessa/lista/2024**',
            update: false, // ← true = records and saves the HAR file
        });
        
        await page.routeFromHAR('./tests/hars/listaCommessaWithAnno/modulocommessa-2025.har', {
            url: '*/**/api/v2/modulocommessa/lista/2025**',
            update: false, // ← true = records and saves the HAR file
        });
        
        await page.routeFromHAR('./tests/hars/listaCommessaWithAnno/modulocommessa-2026.har', {
            url: '*/**/api/v2/modulocommessa/lista/2026**',
            update: false, // ← true = records and saves the HAR file
        });
        //controllo che ci siano tutti gli anni
        const annoSelect = page.locator("div#filter_anno");
        await expect(annoSelect).toBeVisible();
        await annoSelect.click();
        for (const annoMock of anniModuloCommessaMock) {
            await expect(page.locator("li", { hasText: annoMock })).toBeVisible();
        }
        // aspetto la response
        const responsePromise = page.waitForResponse('**/api/v2/modulocommessa/lista/2024**');
        
        await page.locator("li", { hasText: "2024" }).click();
        await page.click('button:has-text("Filtra")');
        
        await responsePromise;
        const rows = page.locator('td[id*="Mese/Anno"]').filter({ hasText: /\/2024/ })
        const rowCount = await rows.count();
        
        //contollo che tutte le row abbiano 2024 nella colonna anno/mese
        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            const td = row.locator('td').filter({ hasText: /\/2024/ });
            await expect.soft(td).toBeVisible();
        }
        await annoSelect.click();
        
        const response2 = page.waitForResponse('**/api/v2/modulocommessa/lista/2025**');
        //select anno 2025 e click su filtra
        await page.locator("li", { hasText: "2025" }).click();
        await page.click('button:has-text("Filtra")');
        
        // aspetto la response
        
        await response2
        
        //contollo che tutte le row abbiano 2025 nella colonna anno/mese
        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            const td = row.locator('td').filter({ hasText: /\/2025/ });
            await expect.soft(td).toBeVisible();
        }
        
        //click su annulla filtri 
        const annullaButton = page.locator("button", { hasText: "Annulla Filtri" });
        await expect(annullaButton).toHaveCount(1);
        await annullaButton.click();
        //controllo ce parta l'api con /api/v2/modulocommessa/lista senza query param
        // aspetto la response
        //intercept api/v2/modulocommessa/lista/ con response []
        const [response3] = await Promise.all([
            page.waitForResponse('**/api/v2/modulocommessa/lista**'), 
        ]);
        await response3.json();
        //controllo che annulla button non sia visibile
        await expect(annullaButton).toHaveCount(0);
        
        const resultResponse = await response3.json();
        //check label stato sia corretta
        for (const [index, moduloCommessa] of resultResponse.entries()) {
            if(moduloCommessa.totale === null){
                await expect(page.locator(`#chip-${index} .MuiChip-label`)).toHaveText('Non inserito');
            }else{
                await expect(page.locator(`#chip-${index} .MuiChip-label`)).toHaveText('Inserito');
            }
        }
        
        await page.routeFromHAR('./tests/hars/listaCommessa/modulocommessa.har', {
            url: '*/**/api/v2/modulocommessa/lista**',
            update: false, // ← true = records and saves the HAR file
        });
        await annoSelect.click();
        //select anno 2026 e click su filtra
        const annoWithMakeTest = "2026";
        const responseListaPromise = page.waitForResponse(`**/api/v2/modulocommessa/lista/${annoWithMakeTest}**`) 
        
        await page.locator("li", { hasText: annoWithMakeTest }).click();
        await page.click('button:has-text("Filtra")');
        
        const responseLista = await responseListaPromise;
        await responseLista.json();
        const text = await page.locator('[id="Mese/Anno-0"]').innerText();
        console.log('Text:', text); 
        const meseAnnoTd = page.locator('td').filter({ hasText: text });
        
        await expect(meseAnnoTd).toHaveCount(1);
        await expect(meseAnnoTd).toBeVisible();
        //click sul  modulo commessa  della row 0
        await meseAnnoTd.click();
        
        
        // controllo che arrivo su path /ente/modulocommessa
        await page.waitForURL('**/ente/modulocommessa**');
        expect(page.url()).toContain('/ente/modulocommessa');
        
        await expect(page.locator(`text=${text}`)).toHaveCount(6);
        
        //click sul tasto indietro
        const buttonIndietro = page.locator('button').filter({ hasText: 'Indietro' });
        
        await expect(buttonIndietro).toHaveCount(1);
        const responseListaPromise2 = page.waitForResponse(`**/api/v2/modulocommessa/lista/${annoWithMakeTest}**`);
        
        
        await buttonIndietro.click();
        
        // wait for navigation
        await page.waitForURL('**/ente/modulicommessa**');
        expect(page.url()).toContain('/ente/modulicommessa');
        
        
        const responseLista2 = await responseListaPromise2;
        await responseLista2.json();
        
        
        await clickAndVerifyModuloCommessa(page, 'Inserito', annoWithMakeTest, mesiGridTest,buttonIndietro);
        await clickAndVerifyModuloCommessa(page, 'Non inserito', annoWithMakeTest, mesiGridTest,buttonIndietro);
        
        await page.close();
    });

     test("Test modulo commessa , inserimento ABILILITATO", async ({ page}) => {
         await page.goto("ente/datidifatturazione");
        await page.pause();
        const span = page.locator('#nav_modulocommessa .MuiListItemText-primary');
        await expect(span).toBeVisible();
        await expect(span).toHaveText('Modulo commessa');
          //intercepr api/v2/modulocommessa/obbligatori/verifica
        await page.route("**/api/v2/modulocommessa/obbligatori/verifica**", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(true),
            });   
        });
        await span.click();
       
      
        await page.pause();
        await page.waitForURL('**/ente/modulocommessa**');
        expect(page.url()).toContain('/ente/modulocommessa');
        
        //await expect(page.locator(`text=${text}`)).toHaveCount(6);

     });
});




async function clickAndVerifyModuloCommessa(
    page: Page,
    chipText: string,
    annoWithMakeTest: string,
    mesiGridTest: any[],
    buttonIndietro: any,
    
) {
    
    
    const tds = await page.locator('td').filter({
        has: page.locator('div span', ({ hasText: new RegExp(`^${chipText}$`) }))
    });
    
    const countTd = await tds.count();
    let idArray: string[] = [];
    for (let i = 0; i < countTd; i++) {
        const id = await tds.nth(i).getAttribute('id');
        if (id) {
            console.log({id,chipText,annoWithMakeTest,countTd})
            idArray.push(id.split('-')[1]);
        }
    }
    
    console.log({ idArray,countTd ,chipText});
    // select random element
    const randomElement = idArray[Math.floor(Math.random() * idArray.length)];
    console.log(`TD id:`, idArray, { random: mesiGridTest[randomElement], randomElement });
    
    // click on the random row
    const text2 = await page.locator(`[id="Mese/Anno-${randomElement}"]`).innerText();
    console.log('Text:', text2);
    
    const meseAnnoTd2 = page.locator('td').filter({ hasText: text2 });
    await expect(meseAnnoTd2).toHaveCount(1);
    await expect(meseAnnoTd2).toBeVisible();
    
    const monthNumber = Number(randomElement) + 1;
    
    // setup listeners before click
    const verificaPromise = page.waitForResponse('**/api/v2/modulocommessa/obbligatori/verifica**');
    const responseDettaglioPromise = page.waitForResponse(`**/api/v2/modulocommessa/dettaglio/${annoWithMakeTest}/${monthNumber}**`);
    const responseRegioniPromise = page.waitForResponse(`**/api/v2/modulocommessa/regioni**`);
    
    await meseAnnoTd2.click();
    
    await page.waitForURL('**/ente/modulocommessa**');
    expect(page.url()).toContain('/ente/modulocommessa');
    
    await verificaPromise;
    
    const responseRegioni = await responseRegioniPromise;
    await responseRegioni.json();
    
    const responseDettaglio = await responseDettaglioPromise;
    const dettaglioModuloSelected = await responseDettaglio.json();
    
    if(chipText === 'Non inserito'){
        await expect(page.locator(`text=${text2}`)).toHaveCount(4);
    }else{
        await expect(page.locator(`text=${text2}`)).toHaveCount(6);
    }
    
    
    //controllo che il tipo contratto sia ugiuale a quello della localstorage
    const labelTipoContratto = tipoContratto === 1 ? 'PAL' : 'PAC';
    console.log({tipoContratto});
    await expect(page.locator(`#${labelTipoContratto}`)).toHaveCount(1);
    //Controllo che ci siano le frasi 
    await expect(page.locator('body')).toContainText(`Numero complessivo delle notifiche da processare in via digitale nel mese di ${text2}`);
    await expect(page.locator('body')).toContainText(`Numero complessivo delle notifiche da processare in via analogica tramite Raccomandata A/R nel mese di ${text2}`);
    await expect(page.locator('body')).toContainText(`Numero complessivo delle notifiche da processare in via analogica del tipo notifica ex L. 890/1982 nel mese di ${text2}`);
    await expect(page.locator('body')).toContainText(`Territorio nazionale`);
    await expect(page.locator('body')).toContainText(`Territorio diverso da nazionale`);
    await expect(page.locator('body')).toContainText(`Totale notifiche da processare`);
    await expect(page.locator('text=AR Nazionali')).toHaveCount(2);
    await expect(page.locator('body')).toContainText('AR Nazionali');
    await expect(page.locator('text=890 Nazionali')).toHaveCount(2);
    await expect(page.locator('body')).toContainText('890 Nazionali');
    await expect(page.locator('body')).toContainText(`Totale Notifiche`);
    await expect(page.locator('body')).toContainText(`Percentuale copertura inserita dell’aderente`);
    
    if(dettaglioModuloSelected.lista.length > 0){
        if(dettaglioModuloSelected.lista[0].source === 'archiviato'){
            await expect(page.locator('body')).toContainText(`Percentuale copertura attribuita dal sistema`);
        }
    }
    
    //controllo che ci sia la regione di appartenenza
    //logica da utilizzare nell'inserimento
    if(dettaglioModuloSelected.lista.length > 0){
        const listaModuliCommessa = dettaglioModuloSelected.lista
        
        for(const objRegione of listaModuliCommessa[0].valoriRegione){
            const regione = objRegione.regione;
            console.log({regione});
            await expect(page.locator('h4').filter({ hasText: regione })).toHaveCount(1);
            if(objRegione.obbligatorio === 1){
                await expect(page.locator('text=Regione di appartenenza')).toHaveCount(1);
            }else{
                
                await expect(page.locator('text=Regione di appartenenza')).toHaveCount(0);
            }
        }
        
        //controlo che tutte le textbox siano disabled
        const inputs = page.locator('input');
        const countInputs = await inputs.count();
        
        for (let i = 0; i < countInputs; i++) {
            await expect(inputs.nth(i)).toBeDisabled();
        }
        //TEST PAGINA pdf modulo commessa START
        if(chipText === 'Inserito'){
            const buttonAnteprima = page.locator('button').filter({ hasText: 'Vedi anteprima' });
            await expect(buttonAnteprima).toHaveCount(1);
            console.log({888:annoWithMakeTest,9: monthNumber})
            await page.routeFromHAR('./tests/hars/dettaglioPdfCommessa/dettaglioPdfModuloCommessa2026.har', {
                url: `*/**/api/modulocommessa/documento/${annoWithMakeTest.toString()}/${monthNumber.toString()}**`,
                update: false, // ← true = records and saves the HAR file
            });
            await buttonAnteprima.click();
            
            await page.waitForURL(`**/ente/pdfmodulocommessa/${annoWithMakeTest}/${monthNumber}**`);
            expect(page.url()).toContain('/ente/pdfmodulocommessa');
            await checkLabels(arraylabelsPdf,page)
            
            
            const buttonDownloadPdf = page.locator('button#scarica-pdf-modulocommessa');
            
            await buttonDownloadPdf.waitFor({ state: 'visible' });
            await expect(buttonDownloadPdf).toHaveCount(1);
            
            const [download] = await Promise.all([
                page.waitForEvent("download"),
                buttonDownloadPdf.click(),
            ]);
            
            // Nome atteso del file download
            const filename = download.suggestedFilename();
            await expect(filename).toBe(`Modulo Commessa _${nomeEnte}_${monthNumber}_${annoWithMakeTest}.pdf`);
            
            
            const buttonIndietroOnPdfPage = page.locator('button#indietro-anteprima');
            
            await buttonIndietroOnPdfPage.waitFor({ state: 'visible' });
            await expect(buttonIndietroOnPdfPage).toHaveCount(1);
            
            await buttonIndietroOnPdfPage.click();
            await page.waitForURL('**/ente/modulocommessa**');
            await expect(page.url()).toContain('/ente/modulocommessa');
        }
        //TEST PAGINA pdf modulo commessa end
        
        
        //const responseListaPromise3 = page.waitForResponse(`**/api/v2/modulocommessa/lista/${annoWithMakeTest}**`);
        //click sul button indietro
        await buttonIndietro.click();
        await page.waitForURL('**/ente/modulicommessa**');
        expect(page.url()).toContain('/ente/modulicommessa');
        await page.waitForLoadState('networkidle');
        
        // then wait for grid
        await page.locator('tbody tr').first().waitFor({ state: 'visible' });
        //(await responseListaPromise3).json();
        // wait for the grid to be visible before function returns
        //await page.locator('tbody tr').first().waitFor({ state: 'visible' });
    }; 
}

const checkLabels = async (labels: string[], page: Page) => {
    await Promise.all(
        labels.map(async (label) => {
            console.log({ label });
            await expect.soft(
                page.getByText(label)
            ).toBeVisible();
        })
    );
};

const arraylabelsPdf = [
    "Soggetto aderente",
    "Sede Legale completa",
    "Partita IVA/Codice Fiscale",
    "Cup",
    "Cig",
    "Soggetto Split Payment",
    "PEC",
    "Email riferimento contatti",
    "Data di compilazione",
    "Territorio nazionale",
    "Territorio diverso da nazionale",
    //"Totale notifiche da processare",
    "TOTALE MODULO COMMESSA NETTO IVA",
    "Numero complessivo delle notifiche da processare in via digitale in",
    "Numero complessivo delle notifiche da processare in via analogica tramite Raccomandata A/R in",
    //"Totale notifiche da processare",
    "Notifiche Digitali: Art. 2 comma 6 Anticipo pari al 50% per le notifiche oggetto della commessa di",
    "Notifiche Analogiche: Art. 2 comma 6 Anticipo pari al 50% per le notifiche analogiche oggetto della commessa di",
    "TOTALE MODULO COMMESSA NETTO IVA"
]