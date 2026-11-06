// spec: specs/ente-docsospesi.md (sezioni 1 e 9)
// seed: tests/auth.setup.ts

import { test, expect, SELFCARE_URL } from "../../fixtures";
import {
  API, totaleBackground, localStorageKeys, locators, makeFatture, mockAll, mockLista, mockPeriodo, openPage, seedSession,
} from "../../utils/docsospesi/docSospesiMock";

test.describe("Accesso, sessione e controllo ruolo", () => {
  test("Caricamento pagina con sessione valida e dati mock", async ({ page }) => {
    const l = locators(page);

    // 1. Mockare periodo/sospeso e credito/sospeso con il mock di riferimento e aprire /ente/docsospesi
    const { periodo, lista } = await mockAll(page);
    await page.goto("/ente/docsospesi");
    await expect(l.heading).toBeVisible();
    await expect(page.getByRole("heading", { name: "Comune di San Mauro Torinese" })).toBeVisible();
    await expect(l.nav.getByRole("button", { name: "Documenti contabili sospesi" })).toHaveClass(/Mui-selected/);
    await expect(l.loading).toBeHidden();
    expect(periodo.calls()).toBe(1);
    expect(lista.bodies).toHaveLength(1);

    // 2. Verificare lo stato iniziale dei controlli
    await expect(l.anno).toHaveText("Tutti");
    await expect(l.anno).not.toHaveAttribute("aria-disabled", "true");
    await expect(l.mese).toHaveText("Tutti");
    await expect(l.mese).toHaveAttribute("aria-disabled", "true");
    await expect(l.tipologia).toBeEnabled();
    await expect(l.dataFattura).toBeDisabled();
    await expect(l.filtra).toBeVisible();
    await expect(l.annulla).toHaveCount(0);
    await expect(l.totale).toHaveText(/^615,00\s€$/);
    expect(await totaleBackground(l)).toBe("rgb(242, 250, 242)");
    await expect(l.rows).toHaveCount(6);
    await expect(l.paginationLabel).toHaveText("1–6 of 6");
    await expect(l.download).toBeEnabled();
  });

  test("Ente senza fatture sospese (periodo 404, comportamento reale dev)", async ({ page }) => {
    const l = locators(page);
    // 1. Mockare GET periodo/sospeso con 404 e aprire la pagina
    await mockPeriodo(page, [], 404);
    const lista = await mockLista(page);
    await page.goto("/ente/docsospesi");

    await expect(l.heading).toBeVisible();
    await expect(page.getByText("La ricerca non ha prodotto risultati")).toBeVisible();
    await expect(l.loading).toBeHidden();
    await expect(l.empty).toBeVisible();
    await expect(l.paginationLabel).toHaveText("0–0 of 0");
    await expect(l.next).toBeDisabled();
    await expect(l.prev).toBeDisabled();
    await expect(l.totale).toHaveText("--");
    expect(await totaleBackground(l)).toBe("rgb(227, 231, 235)");
    await expect(l.download).toBeDisabled();
    expect(lista.bodies).toHaveLength(0);
    await l.anno.click();
    await expect(page.getByRole("option")).toHaveText(["Tutti"]);
    await page.keyboard.press("Escape");
    await l.tipologia.click();
    await expect(page.getByText("No options")).toBeVisible();
  });

  test.describe(() => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("Accesso senza autenticazione", async ({ page }) => {
      const apiCalls: string[] = [];
      page.on("request", (r) => { if (r.url().includes("/api/fatture/ente/")) apiCalls.push(r.url()); });

      // 1. In un contesto senza storageState aprire /ente/docsospesi
      await page.goto("/ente/docsospesi");

      // expect: Redirect alla login Selfcare, nessuna chiamata alle API fatture
      await expect(page).toHaveURL(SELFCARE_URL);
      expect(apiCalls).toHaveLength(0);
    });
  });

  test("Dati di fatturazione mancanti: modale di redirect", async ({ page }) => {
    const l = locators(page);
    const { periodo } = await mockAll(page);
    // Testo attuale del modale: cita 'Documenti EMESSI' anche nella pagina sospesi (difetto di testo segnalato nella spec)
    const modal = page.getByText("è obbligatorio fornire i seguenti dati di fatturazione");

    // 1. Impostare mainState.datiFatturazione=false e aprire la pagina
    await seedSession(page, { mainState: { datiFatturazione: false } }, "step1");
    await page.goto("/ente/docsospesi");
    await expect(modal).toBeVisible();
    expect(periodo.calls()).toBe(0);
    await expect(l.rows).toHaveCount(0);

    // 2. Ripetere con datiFatturazioneNotCompleted=true
    await seedSession(page, { mainState: { datiFatturazione: true, datiFatturazioneNotCompleted: true } }, "step2");
    await page.reload();
    await expect(modal).toBeVisible();
    expect(periodo.calls()).toBe(0);
    await expect(l.rows).toHaveCount(0);
  });

  test("Profilo PagoPA sulla rotta ente", async ({ page }) => {
    // Il token salvato e' di un utente Selfcare: le API PagoPA lo rifiutano con 401 (profilo escluso)
    await page.route((url) => url.pathname.includes("/api/") && !url.pathname.endsWith("/api/auth/profilo"), (route) =>
      route.request().url().startsWith("http://localhost") ? route.fallback()
        : route.fulfill({ status: 401, contentType: "application/json", body: "{}" }),
    );
    await seedSession(page, { profilo: { auth: "PAGOPA", prodotto: "prod-pn" }, mainState: { prodotti: [{ prodotto: "prod-pn" }] } });

    // 1. Con profilo PagoPA navigare direttamente a /ente/docsospesi
    await page.goto("/ente/docsospesi");

    // expect: L'utente PagoPA viene rediretto alla pagina /azureLogin
    await expect(page).toHaveURL(/\/azureLogin$/, { timeout: 15000 });
  });

  test("Token scaduto / 401 sulle API (ente e recapitista)", async ({ page }) => {
    const alert = page.getByText("Utente non autenticato. Effettuare nuovamente l'accesso");
    for (const suffix of [API.periodo, API.lista]) {
      await page.route((url) => url.pathname.endsWith(suffix), (route) =>
        route.fulfill({ status: 401, contentType: "application/json", body: "{}" }),
      );
    }

    // 1. Aprire la pagina con profilo ente e API in 401
    await page.goto("/ente/docsospesi");
    await expect(alert).toBeVisible();
    await expect(page).toHaveURL(SELFCARE_URL, { timeout: 10000 });
    expect(await localStorageKeys(page)).not.toContain("globalStatePF");
    expect(await localStorageKeys(page)).not.toContain("filters");

    // 2. Ripetere con profilo Recapitista
    await seedSession(page, { profilo: { profilo: "REC" } }, "rec");
    await page.goto("/ente/docsospesi");
    await expect(alert).toBeVisible();
    await expect(page).toHaveURL(SELFCARE_URL, { timeout: 10000 });
    expect(await localStorageKeys(page)).not.toContain("globalStatePF");
  });
});

test.describe("Navigazione e layout", () => {
  test("Navigazione dal menu laterale", async ({ page }) => {
    const l = locators(page);
    await mockAll(page);
    const docContabili = l.nav.getByRole("button", { name: "Documenti contabili", exact: true });

    // 1. Da /ente/datidifatturazione cliccare 'Documenti contabili'
    await page.goto("/ente/datidifatturazione");
    await docContabili.click();

    // expect: Sottomenu aperto e navigazione a /ente/docsospesi, titolo e voce evidenziata
    await expect(page).toHaveURL(/\/ente\/docsospesi$/);
    await expect(l.heading).toBeVisible();
    await expect(l.nav.getByRole("button", { name: "Documenti contabili sospesi" })).toHaveClass(/Mui-selected/);
    await expect(l.nav.getByRole("button", { name: "Documenti contabili emessi" })).toBeVisible();

    // 2. Cliccare l'icona di chiusura del sottomenu
    await docContabili.getByRole("button").click();

    // expect: Il sottomenu si chiude senza cambiare pagina
    await expect(l.nav.getByRole("button", { name: "Documenti contabili sospesi" })).toBeHidden();
    await expect(page).toHaveURL(/\/ente\/docsospesi$/);
  });

  test("Pulsante Esci", async ({ page }) => {
    await mockAll(page);
    await openPage(page);

    // 1. Cliccare 'Esci' nell'header
    await page.getByRole("button", { name: "Esci" }).click();

    // expect: globalStatePF e filters rimossi, redirect a Selfcare
    await expect(page).toHaveURL(SELFCARE_URL);
    expect(await localStorageKeys(page)).not.toContain("globalStatePF");
    expect(await localStorageKeys(page)).not.toContain("filters");

    // expect: Riaprire /ente/docsospesi richiede di nuovo l'autenticazione
    await page.goto("/ente/docsospesi");
    await expect(page).toHaveURL(SELFCARE_URL);
  });

  test("Accessibilita' di base", async ({ page }) => {
    await mockAll(page, makeFatture(15));
    const l = await openPage(page);

    // 1. Navigare con Tab dal campo Anno
    // expect: Anno -> Tipologia Fattura (Mese e Data disabilitati saltati) -> Filtra
    await l.anno.focus();
    await page.keyboard.press("Tab");
    await expect(l.tipologia).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(l.filtra).toBeFocused();

    // expect: 'expand row', Sort e 'Go to next page' raggiungibili; 'Go to previous page' disabilitato non riceve focus
    await l.rows.first().getByRole("button", { name: "expand row" }).focus();
    await expect(l.rows.first().getByRole("button", { name: "expand row" })).toBeFocused();
    await l.sortButton("Tot.").focus();
    await expect(l.sortButton("Tot.")).toBeFocused();
    await l.next.focus();
    await expect(l.next).toBeFocused();
    await expect(l.prev).toBeDisabled();
    await l.prev.focus();
    await expect(l.prev).not.toBeFocused();
  });
});
