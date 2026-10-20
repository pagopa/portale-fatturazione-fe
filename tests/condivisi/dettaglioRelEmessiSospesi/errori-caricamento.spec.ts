// spec: specs/dettaglioRelEmessiSospesi.md (sezione 9)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect, SELFCARE_URL } from "../../fixtures";
import {
  API, SECTIONS, detailUrl, locators, makeRel, mockDettaglio, mockLogFirmato, seedTipoContratto,
  type MockRel, type Section,
} from "../../utils/dettaglioRelEmessiSospesi/dettaglioMock";
import { ERRORE_401, ERRORE_500, localStorageKeys } from "../../utils/ente/docContabiliMock";

const SEZIONI: Section[] = ["rel", "documentiemessi", "documentisospesi"];

const MESSAGGI = {
  404: "La ricerca non ha prodotto risultati",
  409: "L'operazione non è andata a buon fine",
  400: "L'operazione non è andata a buon fine. Contattare l'assistenza",
  410: "La risorsa non è più disponibile",
  419: "Sessione scaduta. Effettuare nuovamente l'accesso",
  403: ERRORE_401,
  401: ERRORE_401,
  500: ERRORE_500,
  rete: "La connessione Internet risulta non attiva",
};

const detailSuffix = (section: Section, id = "123") =>
  section === "rel" ? API.rel(id) : section === "documentiemessi" ? API.dettaglioEmessi : API.dettaglioSospesi;

// Dopo il redirect la lista chiama le sue API (non mockate qui): rispondono con lo stesso errore del dettaglio,
// cosi' l'alert mostrato non viene sovrascritto da un 404 della lista
async function mockListe(page: Page, status: number | "abort") {
  // include anche le API di filtro della lista REL (/api/rel/anni): se non mockate rispondono 404 e sovrascrivono l'alert
  await page.route((url) => /^\/api\/(rel|fatture)\//.test(url.pathname), (route) =>
    status === "abort"
      ? route.abort()
      : route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ detail: "errore" }) }),
  );
}

async function apriConErrore(page: Page, section: Section, status: number | "abort") {
  await mockListe(page, status);
  if (status === "abort") {
    await page.route((url) => url.pathname.endsWith(detailSuffix(section)), (route) => route.abort());
  } else {
    await mockDettaglio(page, section, makeRel(), { status });
  }
  await page.goto(detailUrl(section));
}

test.describe("Errori di caricamento del dettaglio", () => {
  test("404 sul dettaglio", async ({ page }) => {
    const l = locators(page);
    await seedTipoContratto(page, 2);

    for (const section of SEZIONI) {
      await test.step(section, async () => {
        await page.unrouteAll({ behavior: "ignoreErrors" });

        // 1. Per ciascuna sezione mockare l'API di dettaglio con 404
        await apriConErrore(page, section, 404);

        // expect: Redirect alla lista della sezione
        await expect(page).toHaveURL(SECTIONS[section].backUrl);
        // expect: Errore del layout per 404
        await expect(page.getByText(MESSAGGI[404], { exact: true }).first()).toBeVisible();
        // expect: Nessuna card del dettaglio mostrata
        await expect(l.card("Dati di Fatturazione")).toHaveCount(0);
      });
    }
  });

  test("500 sul dettaglio", async ({ page }) => {
    const l = locators(page);
    await seedTipoContratto(page, 2);

    for (const section of SEZIONI) {
      await test.step(section, async () => {
        await page.unrouteAll({ behavior: "ignoreErrors" });

        // 1. Mockare il dettaglio con 500
        await apriConErrore(page, section, 500);

        // expect: Redirect alla lista + errore
        await expect(page).toHaveURL(SECTIONS[section].backUrl);
        await expect(page.getByText(MESSAGGI[500], { exact: true }).first()).toBeVisible();
        await expect(l.card("Dati di Fatturazione")).toHaveCount(0);
      });
    }
  });

  test("409, 410, 400 sul dettaglio", async ({ page }) => {
    const l = locators(page);
    await seedTipoContratto(page, 2);

    // 1. Parametrizzare gli status (419 e 403, che eseguono il logout, sono nei test successivi)
    for (const status of [409, 410, 400] as const) {
      await test.step(`status ${status}`, async () => {
        await page.unrouteAll({ behavior: "ignoreErrors" });
        await apriConErrore(page, "documentiemessi", status);

        // expect: Redirect alla lista e messaggio coerente con lo status
        await expect(page).toHaveURL(SECTIONS.documentiemessi.backUrl);
        await expect(page.getByText(MESSAGGI[status], { exact: true }).first()).toBeVisible();
        await expect(l.card("Dati di Fatturazione")).toHaveCount(0);
      });
    }
  });

  test("419 sul dettaglio: sessione scaduta e logout", async ({ page }) => {
    await seedTipoContratto(page, 2);

    // 1. Mockare il dettaglio con 419
    await apriConErrore(page, "rel", 419);

    // expect: Redirect alla lista, messaggio di sessione scaduta e successivo redirect a Selfcare
    await expect(page.getByText(MESSAGGI[419], { exact: true }).first()).toBeVisible();
    await expect(page).toHaveURL(SELFCARE_URL, { timeout: 10000 });
    expect(await localStorageKeys(page)).not.toContain("globalStatePF");
  });

  test("403 sul dettaglio: utente non autenticato", async ({ page }) => {
    await seedTipoContratto(page, 2);

    // 1. Mockare il dettaglio con 403 (eseguire per ultimo: provoca il logout)
    await apriConErrore(page, "documentisospesi", 403);

    // expect: Messaggio di utente non autenticato e redirect a Selfcare
    await expect(page.getByText(MESSAGGI[403], { exact: true }).first()).toBeVisible();
    await expect(page).toHaveURL(SELFCARE_URL, { timeout: 10000 });
    expect(await localStorageKeys(page)).not.toContain("globalStatePF");
  });

  test("401 non autenticato", async ({ page }) => {
    await seedTipoContratto(page, 2);

    // 1. Mockare il dettaglio con 401 (eseguire per ultimo)
    await apriConErrore(page, "rel", 401);

    // expect: Messaggio 'Utente non autenticato. Effettuare nuovamente l'accesso'
    await expect(page.getByText(MESSAGGI[401], { exact: true }).first()).toBeVisible();
    // expect: successivo redirect a Selfcare gestito dal layout, sessione e filtri rimossi
    await expect(page).toHaveURL(SELFCARE_URL, { timeout: 10000 });
    expect(await localStorageKeys(page)).not.toContain("globalStatePF");
    expect(await localStorageKeys(page)).not.toContain("filters");
  });

  test("Errore di rete", async ({ page }) => {
    const l = locators(page);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await seedTipoContratto(page, 2);

    for (const section of SEZIONI) {
      await test.step(section, async () => {
        await page.unrouteAll({ behavior: "ignoreErrors" });

        // 1. route.abort() sull'API di dettaglio
        await apriConErrore(page, section, "abort");

        // expect: Redirect alla lista, nessun crash, nessuna card del dettaglio
        await expect(page).toHaveURL(SECTIONS[section].backUrl);
        await expect(l.card("Dati di Fatturazione")).toHaveCount(0);
        // expect: axios segnala "Network Error" e il layout mostra il messaggio di connessione assente
        await expect(page.getByText(MESSAGGI.rete, { exact: true }).first()).toBeVisible();
      });
    }
    expect(errors).toEqual([]);
  });

  // Bug 2: tipologiaFattura undefined -> rel.tipologiaFattura.toUpperCase() lancia TypeError (pagina bianca)
  test("Risposta 200 con body vuoto {}", async ({ page }) => {
    test.fail(true, "Bug 2: rel.tipologiaFattura.toUpperCase() con tipologiaFattura undefined lancia TypeError");
    const l = locators(page);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await seedTipoContratto(page, 2);
    await mockDettaglio(page, "documentiemessi", {} as MockRel);

    // 1. Mockare il dettaglio con 200 e body {}
    await page.goto(detailUrl("documentiemessi"));

    // expect: la pagina renderizza con valori di default senza crash
    await expect(l.card("Dati di Fatturazione")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("Risposta 200 con body null", async ({ page }) => {
    const l = locators(page);
    await seedTipoContratto(page, 2);
    await mockListe(page, 500);
    await mockDettaglio(page, "documentiemessi", null as unknown as MockRel);

    // 1. Mockare il dettaglio con 200 e body null
    await page.goto(detailUrl("documentiemessi"));

    // expect: res.data null -> TypeError intercettato dal catch di getRel: ritorno alla lista senza card del dettaglio
    await expect(page).toHaveURL(SECTIONS.documentiemessi.backUrl);
    await expect(l.card("Dati di Fatturazione")).toHaveCount(0);
  });

  test("Dettaglio REL: log firma fallito non blocca la pagina", async ({ page }) => {
    const l = locators(page);
    await seedTipoContratto(page, 2);
    await mockDettaglio(page, "rel", makeRel({ datiFatturazione: true, caricata: 1, firmata: "firmata" }));
    const log = await mockLogFirmato(page, "", { status: 500 });

    // 1. GET dettaglio REL 200 con datiFatturazione true e POST log firma 500
    await page.goto(detailUrl("rel"));

    // expect: Il dettaglio e' mostrato, nessun redirect
    await expect(l.card("Dati di Fatturazione")).toBeVisible();
    await expect(page).toHaveURL(/\/ente\/fatturapdf\/rel\/123$/);
    expect(log.calls).toBe(1);
    // expect: nessun messaggio d'errore
    await expect(page.getByText(MESSAGGI[500], { exact: true })).toHaveCount(0);
    await expect(page.getByText(MESSAGGI[401], { exact: true })).toHaveCount(0);
  });

  test.describe(() => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("Mancanza della sessione", async ({ page }) => {
      const apiCalls: string[] = [];
      page.on("request", (r) => {
        if (/\/api\/(rel|fatture)\/ente\//.test(r.url())) apiCalls.push(r.url());
      });

      // 1. Svuotare il localStorage (globalStatePF) e aprire il dettaglio
      await page.goto(detailUrl("documentiemessi"));

      // expect: Il layout reindirizza all'accesso e non vengono fatte chiamate di dettaglio con token vuoto
      await expect(page).toHaveURL(SELFCARE_URL);
      expect(apiCalls).toHaveLength(0);
    });
  });
});
