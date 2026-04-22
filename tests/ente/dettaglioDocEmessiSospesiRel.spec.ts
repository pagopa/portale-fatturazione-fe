import path from "path";
import { test, expect, Page, Route } from "@playwright/test";
import { labelsAcconto, labelsAnticipo, labelsPrimoSaldo, labelsSecondoSaldo, labelsVarSemestrale, mockDettaglioDocEmesso } from "../utils/dettaglioEmessiMock/dettaglioEmessiMock";
import { newAuthDataPac } from "../utils/authEntePac";
import * as fs from "fs";

const authFile = path.join(__dirname, "../.auth/user.json");

test.describe("Test Dettaglio Doc Emessi Sospesi Rel", () => {
    
    //Test anticipo start_______________
    const testCasesAnticipo = [
        {
            testName: "Dettaglio Emessi ANTICIPO",
            apiUrl: "**/api/fatture/ente/emesse/dettaglio**",
            pageUrl: "/ente/fatturapdf/documentiemessi/6458",
            tipologia: "ANTICIPO",
        },
        {
            testName: "Dettaglio Sospesi ANTICIPO",
            apiUrl: "**/api/fatture/ente/sospese/dettaglio**",
            pageUrl: "/ente/fatturapdf/documentisospesi/1234",
            tipologia: "ANTICIPO",
        }
    ];
    
    
    
    for (const { testName, apiUrl, pageUrl, tipologia } of testCasesAnticipo) {
        test(testName, async ({ page }) => {
            
            CallMockGetDettaglioFattura(page, tipologia, apiUrl);
            
            await page.goto(pageUrl);
            
            await checkLabels(labelsAnticipo, page);
        });
    }
    //Test anticipo end_______________
    
    //Test ACCONTO start___________________________________
    
    const testCasesAcconto = [
        {
            testName: "Dettaglio Emessi ACCONTO",
            apiUrl: "**/api/fatture/ente/emesse/dettaglio**",
            pageUrl: "/ente/fatturapdf/documentiemessi/6458",
            tipologia: "ACCONTO",
        },
        {
            testName: "Dettaglio Sospesi ACCONTO",
            apiUrl: "**/api/fatture/ente/sospese/dettaglio**",
            pageUrl: "/ente/fatturapdf/documentisospesi/1234",
            tipologia: "ACCONTO",
        }
    ];
    
    
    
    
    for (const { testName, apiUrl, pageUrl, tipologia } of testCasesAcconto) {
        test(testName, async ({ page }) => {
            
            
            await page.goto("ente/datidifattiurazione");
            await page.evaluate(() => {
                const raw = localStorage.getItem("globalStatePF");
                if (!raw) return;
                
                const globalState = JSON.parse(raw);
                globalState.state.mainState.profilo.idTipoContratto = 2; // ← change here
                
                localStorage.setItem("globalStatePF", JSON.stringify(globalState));
            });
            
            CallMockGetDettaglioFattura(page, tipologia, apiUrl);
            
            await page.goto(pageUrl);
            
            await checkLabels(labelsAcconto, page);
        });
    }
    //Test ACCONTO end___________________________________
    
    
    //Test PRIMO SALDO START___________________________________
    const testCasesPrimoSaldo = [
        {
            testName: "Dettaglio Emessi PRIMO SALDO",
            apiUrl: "**/api/fatture/ente/emesse/dettaglio**",
            pageUrl: "/ente/fatturapdf/documentiemessi/6458",
            tipologia: "PRIMO SALDO",
        },
        {
            testName: "Dettaglio Sospesi PRIMO SALDO",
            apiUrl: "**/api/fatture/ente/sospese/dettaglio**",
            pageUrl: "/ente/fatturapdf/documentisospesi/1234",
            tipologia: "PRIMO SALDO",
        }
    ];
    
    
    for (const { testName, apiUrl, pageUrl, tipologia } of testCasesPrimoSaldo) {
        test(testName, async ({ page }) => {
            CallMockGetDettaglioFattura(page, tipologia, apiUrl);
            
            await page.goto(pageUrl);
            
            await checkLabels(labelsPrimoSaldo, page);
        });
    }
    
    //Test PRIMO SALDO end___________________________________
    
    //Test SECONDO SALDO start___________________________________
    const testCasesSecondoSaldo = [
        {
            testName: "Dettaglio Emessi SECONDO SALDO",
            apiUrl: "**/api/fatture/ente/emesse/dettaglio**",
            pageUrl: "/ente/fatturapdf/documentiemessi/6458",
            tipologia: "SECONDO SALDO",
        },
        {
            testName: "Dettaglio Sospesi SECONDO SALDO",
            apiUrl: "**/api/fatture/ente/sospese/dettaglio**",
            pageUrl: "/ente/fatturapdf/documentisospesi/1234",
            tipologia: "SECONDO SALDO",
        }
    ];
    
    
    
    for (const { testName, apiUrl, pageUrl, tipologia } of testCasesSecondoSaldo) {
        test(testName, async ({ page }) => {
            
            CallMockGetDettaglioFattura(page, tipologia, apiUrl);
            
            await page.goto(pageUrl);
            
            await checkLabels(labelsSecondoSaldo, page);
        });
    }
    
    //Test SECONDO SALDO end___________________________________
    
    //Test Var semestrale start___________________________________
    const testCasesVarSemestrale = [
        {
            testName: "Dettaglio Emessi VAR. SEMESTRALE",
            apiUrl: "**/api/fatture/ente/emesse/dettaglio**",
            pageUrl: "/ente/fatturapdf/documentiemessi/6458",
            tipologia: "VAR. SEMESTRALE",
        },
        {
            testName: "Dettaglio Sospesi VAR. SEMESTRALE",
            apiUrl: "**/api/fatture/ente/sospese/dettaglio**",
            pageUrl: "/ente/fatturapdf/documentisospesi/1234",
            tipologia: "VAR. SEMESTRALE",
        }
    ];
    
    
    
    for (const { testName, apiUrl, pageUrl, tipologia } of testCasesVarSemestrale) {
        test(testName, async ({ page }) => {
            
            CallMockGetDettaglioFattura(page, tipologia, apiUrl);
            
            await page.goto(pageUrl);
            
            await checkLabels(labelsVarSemestrale, page);
        });
    }
    
    //Test Var semestrale end___________________________________
    
    
    //TEST REL START ___________ente PAC
    
    
    
    
    //TEST REL end ___________ente PAC
    
});


test("Dettaglio Rel", async ({ page}) => {
    
    await page.goto("ente/datidifattiurazione");
    await page.evaluate(() => {
        const raw = localStorage.getItem("globalStatePF");
        if (!raw) return;
        
        const globalState = JSON.parse(raw);
        globalState.state.mainState.profilo.idTipoContratto = 2; // ← change here
        
        localStorage.setItem("globalStatePF", JSON.stringify(globalState));
    });
    ;
    
    await test.step("Dettaglio Rel ANTICIPO", async () => {
        CallMockGetDettaglioFattura(page, "ANTICIPO", "**/api/rel/ente/1**");
        await page.goto("/ente/fatturapdf/rel/1");
        await checkLabels(labelsAnticipo, page);
    
    });
    
    await test.step("Dettaglio Rel ACCONTO", async () => {
        CallMockGetDettaglioFattura(page, "ACCONTO", "**/api/rel/ente/1**");
        await page.goto("/ente/fatturapdf/rel/1");
        await checkLabels(labelsAcconto, page);
    });
    
    await test.step("Dettaglio Rel PRIMO SALDO", async () => {
        CallMockGetDettaglioFattura(page, "PRIMO SALDO", "**/api/rel/ente/1**");
        await page.goto("/ente/fatturapdf/rel/1");
        await checkLabels(labelsPrimoSaldo, page);
    });
    
    await test.step("Dettaglio Rel SECONDO SALDO", async () => {
        CallMockGetDettaglioFattura(page, "SECONDO SALDO", "**/api/rel/ente/1**");
        await page.goto("/ente/fatturapdf/rel/1");
        await checkLabels(labelsSecondoSaldo, page);
    });
    
    await test.step("Dettaglio Rel VAR. SEMESTRALE", async () => {
        CallMockGetDettaglioFattura(page, "VAR. SEMESTRALE", "**/api/rel/ente/1**");
        await page.goto("/ente/fatturapdf/rel/1");
        await checkLabels(labelsVarSemestrale, page);
    });
    
    
    
    await page.close();
});


export async function CallMockGetDettaglioFattura(
    page: Page,
    tipologiaFattura: string,
    path: string,
) {
    await page.route(path, async (route) => {
        
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockDettaglioDocEmesso(tipologiaFattura)),
        });
    });
}

const checkLabels = async (labels: string[],page) => {
    for (const label of labels) {
        await expect.soft(
            page.getByText(label, { exact: true })
        ).toBeVisible();
    }
};