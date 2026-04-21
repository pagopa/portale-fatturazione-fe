import path from "path";
import { test, expect, Page, Route } from "@playwright/test";
import { mockDettaglioDocEmesso } from "../utils/dettaglioEmessiMock/dettaglioEmessiMock";

const authFile = path.join(__dirname, "../.auth/user.json");

test.describe("Test Dettaglio Doc Emessi Sospesi Rel", () => {

  

    test("Dettaglio Documenti emessiSospesi ANTICIPO", async ({ page }) => {
         await page.route("**/api/fatture/ente/emesse/dettaglio/**", (route) => {
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(mockDettaglioDocEmesso("ANTICIPO")),
            });
        });
        await page.goto("/ente/fatturapdf/documentiemessi/6458");
        //await expect(page.getByText("ANTICIPO")).toBeVisible();

    });
    test("Dettaglio Documenti emessiSospesi ACCONTO", async ({ page }) => {

    });
    test("Dettaglio Documenti emessiSospesi PRIMO SALDO", async ({ page }) => {

    });
    test("Dettaglio Documenti emessiSospesi SECONDO SALDO", async ({ page }) => {

    });
    test("Dettaglio Documenti emessiSospesi VAR. SEMESTRALE", async ({ page }) => {

    });


    test("Dettaglio Rel ANTICIPO", async ({ page }) => {

    });
    test("Dettaglio Rel ACCONTO", async ({ page }) => {

    });
    test("Dettaglio Rel PRIMO SALDO", async ({ page }) => {

    });
    test("Dettaglio Rel SECONDO SALDO", async ({ page }) => {

    });
    test("Dettaglio Rel VAR. SEMESTRALE", async ({ page }) => {

    });
    
});
