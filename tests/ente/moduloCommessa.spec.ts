import { test, expect, Page, Route } from "@playwright/test";
import { anniModuloCommessaMock, mesiGridTest } from "../utils/moduloCommessaMock/moduloCommessaMock";
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
        await span.click();
        //intercepr api/v2/modulocommessa/obbligatori/verifica
        await page.route("**/api/v2/modulocommessa/obbligatori/verifica**", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(false),
            });   
        });
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
        
        await page.locator("li", { hasText: "2024" }).click();
        await page.click('button:has-text("Filtra")');
        
        
        // aspetto la response
        const [response] = await Promise.all([
            page.waitForResponse('**/api/v2/modulocommessa/lista/2024**'), 
        ]);
        await response.json();
        
        const rows = page.locator('tbody > tr.MuiTableRow-root');
        const rowCount = await rows.count();
        
        //contollo che tutte le row abbiano 2024 nella colonna anno/mese
        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            const td = row.locator('td').filter({ hasText: /\/2024/ });
            await expect.soft(td).toBeVisible();
        }
        await annoSelect.click();
        
        
        //select anno 2025 e click su filtra
        await page.locator("li", { hasText: "2025" }).click();
        await page.click('button:has-text("Filtra")');
        
        // aspetto la response
        const [response2] = await Promise.all([
            page.waitForResponse('**/api/v2/modulocommessa/lista/2025**'), 
        ]);
        await response2.json();
        
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
        await page.locator("li", { hasText: annoWithMakeTest }).click();
        await page.click('button:has-text("Filtra")');
        await Promise.all([
            page.waitForResponse(`**/api/v2/modulocommessa/lista/${annoWithMakeTest}**`), 
        ]);
        
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
        await buttonIndietro.click();
        // controllo che arrivo su path /ente/modulocommessa/lista
        await page.waitForURL('**/ente/modulicommessa**');
        expect(page.url()).toContain('/ente/modulicommessa');
        
        await Promise.all([
            page.waitForResponse(`**/api/v2/modulocommessa/lista/${annoWithMakeTest}**`), 
        ]);
        
        //cerco tutte le row con NON inserito
        const tds = page.locator('td').filter({
            has: page.locator('div span', { hasText: 'Non inserito' })
        });
        
        const count = await tds.count();
        let idArray: string[] = [];
        for (let i = 0; i < count; i++) {
            const id = await tds.nth(i).getAttribute('id');
            if(id){
                idArray.push(id.split('-')[1]);
            }
            
        }
        //Seleziono un mese random tra quelli con stato NON inserito
        const randomElement = idArray[Math.floor(Math.random() * idArray.length)];
        console.log(`TD id:`, idArray,{random:mesiGridTest[randomElement],randomElement});
        
        ////click su un modulo commessa NON inserito della grid
        const text2 = await page.locator(`[id="Mese/Anno-${randomElement}"]`).innerText();
        console.log('Text:', text2); 
        const meseAnnoTd2 = page.locator('td').filter({ hasText: text2 });
        
        await expect(meseAnnoTd2).toHaveCount(1);
        await expect(meseAnnoTd2).toBeVisible();
        //click sul  modulo commessa  della row mesiGridTest[randomElement]
        page.waitForResponse('**/api/v2/modulocommessa/obbligatori/verifica**');
        page.waitForResponse(`**/api/v2/modulocommessa/lista/${annoWithMakeTest}/${Number(randomElement)+1}**`);
        
        await meseAnnoTd2.click();
        
        
        await page.waitForURL('**/ente/modulocommessa**');
        expect(page.url()).toContain('/ente/modulocommessa');
        
        
        await page.pause();
        //controllo che ci sia la label mese/anno e che cia sia lo stesso mese e anno della row selezionata
        await expect(page.locator(`text=${text2}`)).toHaveCount(4);
        
        //controllo che il tipo contratto sia ugiuale a quello della localstorage
        //controllo che ci sia la regione di appartenenza
        //controllo su tutte le label
        //controlo che tutte le textbox siano disabled
        
        //click sul button indietro
        // controllo che arrivo su path /ente/modulocommessa/lista
        
        //click su un modulo commessa INSERITO della grid
        //controllo che le textbox siano disabilitate
        //Click sul button vedi anteprima
        //arrivo sul path /ente/pdfmodulocommessa/2024/8
        //controllo su tette le label
        
    });
    
    test("Test frase da mostrare all'utente", async ({ page}) => {
        // constollo che la frase sia "N.B. Gentile Aderente, non sono presenti moduli commessa inseriti. L'inserimento è possibile solo dal 1° al 15 di ogni mese. La finestra di inserimento è attualmente chiusa. Ritorna dal 1° del prossimo mese per compilare i moduli obbligatori"
        //click  su filtra 
        //intercept intercept api/v2/modulocommessa/lista/ con dei dati
        // constollo che la frase sia  "N.B. il Modulo Commessa per le previsioni dei consumi deve essere inserito dal giorno 1 al giorno 15 di ogni mese"
        //_________________________________________
    });
    
    
});