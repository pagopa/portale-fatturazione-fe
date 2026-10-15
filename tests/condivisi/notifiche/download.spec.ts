// spec: specs/notifiche.md (sezione 6)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  API, ERRORE_500, ROUTE_ENTE, endsWith, locators as baseLocators, makeNotifiche, mockAll, mockListaEnte, openPage,
} from "../../utils/notificheMock/notificheMock";

const API_COUNT = "/api/notifiche/richiesta/count";

// Messaggi da src/i18n.js
const MSG_PRESA_IN_CARICO = "Azione presa in carico. Visualizza lo stato di elaborazione";
const MSG_DOPPIA_RICHIESTA = "Attendi l'esecuzione della richiesta precedente";
const MSG_NO_OPERAZIONE = "Al momento non è possibile effettuare l'operazione";
const MSG_400 = "L'operazione non è andata a buon fine. Contattare l'assistenza";

// Body di default del download ente: idEnti/recapitisti/consolidatori/sort rimossi, tipoNotifica [] diventa null
const BODY_DEFAULT = {
  profilo: "",
  prodotto: "",
  anno: 2026,
  mese: 9,
  tipoNotifica: null,
  statoContestazione: [],
  cap: null,
  iun: null,
  recipientId: null,
};

// Locator della pagina: stessi pattern di grid.spec.ts e filtri.spec.ts
function filtri(page: Page) {
  return {
    ...baseLocators(page),
    iun: page.getByRole("textbox", { name: "IUN", exact: true }),
    rows: page.getByRole("row", { name: /IUN-/ }),
    elaborazione: page.getByText("Elaborazione in corso"),
    // badge del contatore messaggi nell'header (MUI Badge: span con il numero)
    badge: (n: number) => page.getByText(String(n), { exact: true }),
  };
}

// Apre la pagina e attende il caricamento iniziale della lista ente (prima pagina da 10 righe)
async function ready(page: Page) {
  await openPage(page);
  const l = filtri(page);
  await expect(l.loading).toBeHidden();
  await expect(l.rows).toHaveCount(10);
  return l;
}

// Mock del download ente: registra i body ricevuti; con gate la risposta resta in attesa finche' non viene rilasciata
async function mockDownloadEnte(page: Page, status = 200, body: unknown = { statusQueryGetUri: "http://localhost/status" }, gate?: Promise<void>) {
  const bodies: Record<string, unknown>[] = [];
  await page.route(endsWith(API.downloadEnte), async (route, request) => {
    bodies.push(request.postDataJSON());
    if (gate) await gate;
    return route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  });
  return bodies;
}

// Mock del contatore messaggi (registrato dopo quello della fixture, quindi prevale).
// L'header chiama richiesta/count anche al caricamento: finche' non e' "armato" risponde 0 e non conta.
async function mockCount(page: Page, status: number, valore: number) {
  const chiamate = { n: 0, armed: false };
  await page.route(endsWith(API_COUNT), (route) => {
    if (!chiamate.armed) return route.fulfill({ status: 200, contentType: "application/json", body: "0" });
    chiamate.n++;
    return route.fulfill({ status, contentType: "application/json", body: JSON.stringify(status === 200 ? valore : {}) });
  });
  return chiamate;
}

test.describe("Download", () => {
  test("Download disabilitato con lista vuota o in caricamento", async ({ page }) => {
    // 1. Admin al primo render, oppure ente con lista vuota
    await mockAll(page, []);
    const vuota = await openPage(page);
    await expect(vuota.loading).toBeHidden();
    await expect(vuota.empty).toBeVisible();

    // expect: 'Download risultati' disabilitato
    await expect(vuota.download).toBeDisabled();

    // 2. Durante il caricamento (risposta lista ritardata)
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await mockAll(page);
    let rilascia!: () => void;
    const gate = new Promise<void>((resolve) => {
      rilascia = resolve;
    });
    await page.route(endsWith(API.listaEnte), async (route) => {
      await gate;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ notifiche: makeNotifiche(25).slice(0, 10), count: 25 }),
      });
    });
    await page.goto(ROUTE_ENTE);
    const l = filtri(page);

    // expect: Disabilitato finche' la risposta non arriva (il modale Loading rende aria-hidden il resto della pagina)
    await expect(l.loading).toBeVisible();
    await expect(page.getByRole("button", { name: "Download risultati", includeHidden: true })).toBeDisabled();
    rilascia();

    // expect: poi abilitato se la lista ha righe
    await expect(l.loading).toBeHidden();
    await expect(l.rows).toHaveCount(10);
    await expect(l.download).toBeEnabled();
  });

  test("Download asincrono: presa in carico", async ({ page }) => {
    await mockAll(page);
    let rilascia!: () => void;
    const gate = new Promise<void>((resolve) => {
      rilascia = resolve;
    });
    const richieste = await mockDownloadEnte(page, 200, { statusQueryGetUri: "http://localhost/status" }, gate);
    const count = await mockCount(page, 200, 3);
    const scaricati: string[] = [];
    page.on("download", (d) => scaricati.push(d.suggestedFilename()));
    const l = await ready(page);
    await expect(l.badge(3)).toHaveCount(0);

    // 1. Mockare POST /api/v2/notifiche/ente/documento/ricerca con 200 {statusQueryGetUri:'...'} e GET /api/notifiche/richiesta/count con 3, poi cliccare 'Download risultati'
    count.armed = true;
    await l.download.click();

    // expect: Modale 'Elaborazione in corso' visibile e poi chiuso
    await expect(l.elaborazione).toBeVisible();
    rilascia();
    await expect(l.elaborazione).toBeHidden();

    // expect: Body della richiesta = filtri applicati (senza idEnti/recapitisti/consolidatori/sort; tipoNotifica singolo o null)
    expect(richieste).toHaveLength(1);
    expect(richieste[0]).toEqual(BODY_DEFAULT);
    expect(richieste[0]).not.toHaveProperty("idEnti");
    expect(richieste[0]).not.toHaveProperty("recapitisti");
    expect(richieste[0]).not.toHaveProperty("consolidatori");
    expect(richieste[0]).not.toHaveProperty("sort");

    // expect: Messaggio di 'presa in carico' (PRESA_IN_CARICO_DOCUMENTO_ENTE) visibile
    await expect(page.getByText(MSG_PRESA_IN_CARICO)).toBeVisible();

    // expect: Viene chiamata GET /api/notifiche/richiesta/count e il contatore messaggi dell'header si aggiorna a 3
    await expect(l.badge(3)).toBeVisible();
    expect(count.n).toBe(1);

    // expect: Nessun file scaricato direttamente
    expect(scaricati).toHaveLength(0);
  });

  test("Download ente: errore nel conteggio messaggi ignorato", async ({ page }) => {
    await mockAll(page);
    await mockDownloadEnte(page);
    const count = await mockCount(page, 500, 0);
    const l = await ready(page);

    // 1. Mockare download 200 e richiesta/count con 500
    count.armed = true;
    await l.download.click();

    // expect: Presa in carico mostrata comunque, nessun errore visibile aggiuntivo
    await expect(page.getByText(MSG_PRESA_IN_CARICO)).toBeVisible();
    await expect.poll(() => count.n).toBe(1);
    await expect(l.elaborazione).toBeHidden();
    await expect(page.getByText(ERRORE_500)).toHaveCount(0);
    await expect(page.getByText(MSG_PRESA_IN_CARICO)).toBeVisible();
    await expect(l.badge(3)).toHaveCount(0);
  });

  test("Download ente status 300: richiesta doppia", async ({ page }) => {
    await mockAll(page);
    await mockDownloadEnte(page, 300, {});
    const count = await mockCount(page, 200, 3);
    const l = await ready(page);

    // 1. Mockare il download con status 300
    count.armed = true;
    await l.download.click();

    // expect: Messaggio DOWNLOAD_NOTIFICHE_DOUBLE_REQUEST (richiesta gia' presa in carico), modale 'Elaborazione in corso' chiuso, nessuna chiamata a richiesta/count
    await expect(page.getByText(MSG_DOPPIA_RICHIESTA)).toBeVisible();
    await expect(l.elaborazione).toBeHidden();
    await expect(page.getByText(MSG_PRESA_IN_CARICO)).toHaveCount(0);
    expect(count.n).toBe(0);
  });

  test("Download ente status 404", async ({ page }) => {
    await mockAll(page);
    await mockDownloadEnte(page, 404, {});
    const count = await mockCount(page, 200, 3);
    const l = await ready(page);

    // 1. Mockare il download con status 404
    count.armed = true;
    await l.download.click();

    // expect: Messaggio generato da managePresaInCarico(400) (testo da verificare in src/api/api.tsx), modale chiuso
    // managePresaInCarico(400) imposta apiError=400: testo errori.400 di src/i18n.js
    await expect(page.getByText(MSG_400)).toBeVisible();
    await expect(l.elaborazione).toBeHidden();
    await expect(page.getByText(MSG_DOPPIA_RICHIESTA)).toHaveCount(0);
    await expect(page.getByText(MSG_NO_OPERAZIONE)).toHaveCount(0);
    expect(count.n).toBe(0);
  });

  test("Download ente status 400", async ({ page }) => {
    await mockAll(page);
    await mockDownloadEnte(page, 400, {});
    const count = await mockCount(page, 200, 3);
    const l = await ready(page);

    // 1. Mockare il download con status 400
    count.armed = true;
    await l.download.click();

    // expect: Messaggio NO_OPERAZIONE, diverso dai messaggi di 300 e 404; modale chiuso
    await expect(page.getByText(MSG_NO_OPERAZIONE)).toBeVisible();
    await expect(l.elaborazione).toBeHidden();
    await expect(page.getByText(MSG_DOPPIA_RICHIESTA)).toHaveCount(0);
    await expect(page.getByText(MSG_400)).toHaveCount(0);
    expect(count.n).toBe(0);
  });

  test("Download ente errore generico 500", async ({ page }) => {
    await mockAll(page);
    await mockDownloadEnte(page, 500, {});
    const l = await ready(page);

    // 1. Mockare il download con status 500
    await l.download.click();

    // expect: Errore gestito da manageError, modale chiuso; 'Download risultati' disabilitato di conseguenza (apiError !== null)
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    await expect(l.elaborazione).toBeHidden();
    await expect(l.download).toBeDisabled();
    // dopo la scomparsa dell'alert il download torna utilizzabile
    await expect(l.download).toBeEnabled({ timeout: 10000 });
  });

  test("Il download usa i filtri applicati", async ({ page }) => {
    const { lista } = await mockAll(page);
    const richieste = await mockDownloadEnte(page);
    await mockCount(page, 200, 3);
    const l = await ready(page);

    // 1. Applicare 'Filtra' con IUN='A' e scaricare; poi cambiare IUN senza Filtra
    await l.iun.fill("A");
    await l.filtra.click();
    await expect.poll(() => lista.length).toBe(2);
    await expect(l.rows).toHaveCount(10);
    await l.download.click();

    // expect: Il primo download usa iun='A'
    await expect.poll(() => richieste.length).toBe(1);
    expect(richieste[0]).toEqual({ ...BODY_DEFAULT, iun: "A" });
    await expect(l.elaborazione).toBeHidden();
    await expect(page.getByText(MSG_PRESA_IN_CARICO)).toBeVisible();

    await l.iun.fill("B");

    // expect: dopo la modifica 'Download risultati' e' disabilitato (griglia svuotata) fino a nuovo Filtra
    await expect(l.rows).toHaveCount(0);
    await expect(l.download).toBeDisabled();
    expect(richieste).toHaveLength(1);

    await l.filtra.click();
    await expect.poll(() => lista.length).toBe(3);
    await expect(l.rows).toHaveCount(10);
    await expect(l.download).toBeEnabled();
  });
});
