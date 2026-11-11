// spec: specs/ente-docemessi.md (sezioni 1 e 9)
// seed: tests/auth.setup.ts

import { test, expect, SELFCARE_URL } from "../../fixtures";
import {
  API, API_CONTESTATE, ERRORE_401, localStorageKeys, locators, makeFatture, mockAll, openPage, seedSession, totaleBackground,
} from "../../utils/docemessi/docEmessiMock";

test.describe("Accesso, sessione e controllo ruolo", () => {
  test("Caricamento pagina con sessione valida", async ({ page }) => {
    const l = locators(page);

    // 1. Con storageState di tests/playwright/.auth/user.json aprire /ente/docemessi
    const { periodo, lista, contestate } = await mockAll(page);
    await page.goto("/ente/docemessi");
    await expect(l.heading).toBeVisible();
    await expect(page.getByRole("heading", { name: "Comune di San Mauro Torinese" })).toBeVisible();
    await expect(l.nav.getByRole("button", { name: "Documenti contabili emessi" })).toHaveClass(/Mui-selected/);
    await expect(l.loading).toBeHidden();
    expect(periodo.calls()).toBe(1);
    expect(lista.bodies).toHaveLength(1);
    expect(contestate.calls()).toBe(1);

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

  test.describe(() => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("Accesso senza autenticazione", async ({ page }) => {
      const apiCalls: string[] = [];
      page.on("request", (r) => { if (r.url().includes("/api/fatture/ente/")) apiCalls.push(r.url()); });

      // 1. In contesto senza storageState (localStorage vuoto) aprire /ente/docemessi
      await page.goto("/ente/docemessi");

      // expect: L'utente non vede dati di fatturazione e viene reindirizzato al login Selfcare
      await expect(page).toHaveURL(SELFCARE_URL);
      expect(apiCalls).toHaveLength(0);
    });
  });

  test("Dati di fatturazione mancanti: modale di redirect", async ({ page }) => {
    const l = locators(page);
    const { periodo } = await mockAll(page);

    // 1. Impostare in globalStatePF mainState.datiFatturazione=false e aprire la pagina
    await seedSession(page, { mainState: { datiFatturazione: false } });
    await page.goto("/ente/docemessi");

    // expect: Compare ModalRedirect, nessuna chiamata a periodo, griglie vuote
    await expect(page.getByText("Per poter visualizzare il dettaglio dei Documenti EMESSI è obbligatorio fornire i seguenti dati di fatturazione")).toBeVisible();
    expect(periodo.calls()).toBe(0);
    await expect(l.rows).toHaveCount(0);
    await expect(l.rowsContestate).toHaveCount(0);
  });

  test("Profilo non ente (ruolo diverso) sulla stessa rotta", async ({ page }) => {
    await test.step("PagoPA", async () => {
      // Il token salvato e' di un utente Selfcare: le API PagoPA lo rifiutano con 401 (profilo escluso)
      await page.route((url) => !url.hostname.includes("localhost") && url.pathname.includes("/api/") && !url.pathname.endsWith("/api/auth/profilo"), (route) =>
        route.fulfill({ status: 401, contentType: "application/json", body: "{}" }),
      );
      await seedSession(page, { profilo: { auth: "PAGOPA", prodotto: "prod-pn" }, mainState: { prodotti: [{ prodotto: "prod-pn" }] } }, "pagopa");

      // 1. Con profilo PagoPA navigare direttamente a /ente/docemessi
      await page.goto("/ente/docemessi");

      // expect: utente PagoPA rediretto alla pagina di login Azure
      await expect(page).toHaveURL(/\/azureLogin$/, { timeout: 15000 });
      await page.unrouteAll({ behavior: "ignoreErrors" });
    });

    await test.step("Recapitista con token scaduto", async () => {
      for (const suffix of [API.periodo, API.lista, API_CONTESTATE.lista]) {
        await page.route((url) => url.pathname.endsWith(suffix), (route) =>
          route.fulfill({ status: 401, contentType: "application/json", body: "{}" }),
        );
      }
      await seedSession(page, { profilo: { profilo: "REC" } }, "rec");

      // 1. Con profilo Recapitista e token scaduto navigare direttamente a /ente/docemessi
      await page.goto("/ente/docemessi");

      // expect: logout e redirect a Selfcare
      await expect(page.getByText(ERRORE_401)).toBeVisible();
      await expect(page).toHaveURL(SELFCARE_URL, { timeout: 10000 });
      expect(await localStorageKeys(page)).not.toContain("globalStatePF");
    });
  });

  test("Token scaduto / 401 sulle API", async ({ page }) => {
    // 1. Mockare con page.route le API periodo ed emesse con status 401 e aprire la pagina
    for (const suffix of [API.periodo, API.lista]) {
      await page.route((url) => url.pathname.endsWith(suffix), (route) =>
        route.fulfill({ status: 401, contentType: "application/json", body: "{}" }),
      );
    }
    await page.goto("/ente/docemessi");

    // expect: alert "Utente non autenticato. Effettuare nuovamente l'accesso"
    await expect(page.getByText(ERRORE_401)).toBeVisible();
    // expect: dopo l'alert redirect a Selfcare, sessione e filtri rimossi
    await expect(page).toHaveURL(SELFCARE_URL, { timeout: 10000 });
    expect(await localStorageKeys(page)).not.toContain("globalStatePF");
    expect(await localStorageKeys(page)).not.toContain("filters");
  });
});

test.describe("Navigazione e layout", () => {
  test("Navigazione dal menu laterale", async ({ page }) => {
    const l = locators(page);
    await mockAll(page);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const docContabili = l.nav.getByRole("button", { name: "Documenti contabili", exact: true });

    // 1. Da un'altra pagina ente aprire 'Documenti contabili' e poi 'Documenti contabili emessi'
    await page.goto("/ente/datidifatturazione");
    await docContabili.click();
    await l.nav.getByRole("button", { name: "Documenti contabili emessi" }).click();

    // expect: URL /ente/docemessi, titolo corretto, voce di menu attiva
    await expect(page).toHaveURL(/\/ente\/docemessi$/);
    await expect(l.heading).toBeVisible();
    await expect(l.nav.getByRole("button", { name: "Documenti contabili emessi" })).toHaveClass(/Mui-selected/);
    await expect(l.loading).toBeHidden();

    // 2. Cliccare le altre voci
    // expect: Ogni voce porta alla propria rotta senza errori
    const voci: [string, RegExp][] = [
      ["Dati di fatturazione", /\/ente\/datidifatturazione$/],
      ["Modulo commessa", /\/ente\/modulicommessa$/],
      ["Notifiche", /\/ente\/listanotifiche$/],
      ["Documenti contabili sospesi", /\/ente\/docsospesi$/],
      ["Download documenti", /\/ente\/downloaddocumenti$/],
    ];
    for (const [voce, url] of voci) {
      if (voce === "Documenti contabili sospesi" && !(await l.nav.getByRole("button", { name: voce }).isVisible())) {
        await docContabili.click();
      }
      await l.nav.getByRole("button", { name: voce, exact: true }).click();
      await expect(page).toHaveURL(url);
    }
    expect(errors).toEqual([]);
  });

  test("Pulsante Esci", async ({ page }) => {
    await mockAll(page);
    await openPage(page);

    // 1. Cliccare 'Esci' nell'header
    await page.getByRole("button", { name: "Esci" }).click();

    // expect: Sessione terminata, localStorage pulito e redirect alla login Selfcare
    await expect(page).toHaveURL(SELFCARE_URL);
    expect(await localStorageKeys(page)).not.toContain("globalStatePF");
    expect(await localStorageKeys(page)).not.toContain("filters");

    // expect: riaprire /ente/docemessi richiede nuova autenticazione
    await page.goto("/ente/docemessi");
    await expect(page).toHaveURL(SELFCARE_URL);
  });

  test("Banner informativo", async ({ page }) => {
    await mockAll(page);

    // 1. Aprire la pagina con GET /api/info-banner che ritorna testo
    const day = 24 * 60 * 60 * 1000;
    await page.route((url) => url.pathname.endsWith("/api/info-banner"), (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "1",
          dataInizio: new Date(Date.now() - day).toISOString(),
          dataFine: new Date(Date.now() + day).toISOString(),
          testo: "<p>Gentile Aderente, banner di test</p>",
          visibile: true,
        }),
      }),
    );
    await openPage(page);

    // expect: Banner 'Gentile Aderente...' visibile
    await expect(page.getByText("Gentile Aderente, banner di test")).toBeVisible();
  });

  test("Accessibilita' di base", async ({ page }) => {
    await mockAll(page, makeFatture(15));
    const l = await openPage(page);

    // 1. Navigare con Tab su filtri, Filtra, Sort, paginatore
    // expect: Anno -> Tipologia (Mese e Data disabilitati saltati) -> Filtra
    await l.anno.focus();
    await page.keyboard.press("Tab");
    await expect(l.tipologia).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(l.filtra).toBeFocused();

    // expect: aria-label 'Go to next page' / 'expand row'
    await expect(l.next).toHaveAttribute("aria-label", "Go to next page");
    await expect(l.rows.first().getByRole("button", { name: "expand row" })).toBeVisible();

    // expect: Sort e paginatore raggiungibili, pulsanti disabilitati non raggiungibili
    await l.sortButton("Tot.").focus();
    await expect(l.sortButton("Tot.")).toBeFocused();
    await l.next.focus();
    await expect(l.next).toBeFocused();
    await expect(l.prev).toBeDisabled();
    await l.prev.focus();
    await expect(l.prev).not.toBeFocused();
  });
});
