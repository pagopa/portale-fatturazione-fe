// spec: specs/ente-moduloCommessaInserimento.md (sezione 7)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  API, ROUTE, VALORI, locators, mainStatePersistito, makeModuloIns, mockDettaglioMode, mockObbligatori, mockVerifica, openPage,
  setRedirectToInsert,
} from "../../utils/moduloCommessaInserimentoMock/moduloCommessaInserimentoMock";
import type { MockModuloIns } from "../../utils/moduloCommessaInserimentoMock/moduloCommessaInserimentoMock";
import {
  infoTrimestre, locators as locatoriElenco, mockAnni, mockLista as mockListaElenco, mockVerifica as mockVerificaElenco,
} from "../../utils/moduloCommessaElencoMock/moduloCommessaElencoMock";

const URL_ELENCO = /\/ente\/modulicommessa$/;
const URL_INSERIMENTO = /\/ente\/modulocommessa$/;
const NO_INSERIMENTO = "Al momento non è possibile inserire il modulo commessa. Contattare l'assistenza";

// Trattiene una chiamata API finche' il test non chiama la funzione restituita, poi la passa al mock gia' registrato
async function ritarda(page: Page, re: RegExp) {
  let rilascia = () => {};
  const gate = new Promise<void>((resolve) => {
    rilascia = resolve;
  });
  await page.route(
    (url) => re.test(url.pathname),
    async (route) => {
      await gate;
      await route.fallback();
    },
  );
  return rilascia;
}

// Mock della pagina elenco (destinazione di "Indietro"): registrati dopo il caricamento dell'inserimento
async function mockElenco(page: Page) {
  await mockVerificaElenco(page, false);
  await mockAnni(page);
  return mockListaElenco(page);
}

// Modulo gia' inserito (sola lettura per default), con totaleNotifiche valorizzato
const inserito = (anno: number, mese: number, override: Partial<MockModuloIns> = {}) =>
  makeModuloIns(anno, mese, { stato: "inserito", ...VALORI, ...override });

const ALERT = (page: Page) => page.getByRole("heading", { name: "Attenzione!" });
const OK = (page: Page) => page.getByRole("button", { name: "Ok", exact: true });
const ANNULLA = (page: Page) => page.getByRole("button", { name: "Annulla", exact: true });

test.describe("Navigazione", () => {
  test("Indietro header con isEditAllow: ModalAlert e conferma", async ({ page }) => {
    await mockObbligatori(page);
    const l = await openPage(page);
    await mockElenco(page);

    // 1. Obbligatori (isEditAllow=true), cliccare 'Indietro' in alto
    await l.indietroHeader.click();

    // expect: ModalAlert: heading 'Attenzione!', 'Le modifiche andranno perse', pulsanti 'Annulla' e 'Ok'
    await expect(ALERT(page)).toBeVisible();
    await expect(page.getByText("Le modifiche andranno perse")).toBeVisible();
    await expect(ANNULLA(page)).toBeVisible();
    await expect(OK(page)).toBeVisible();
    // expect: Resto della pagina aria-hidden
    await expect(l.indietroHeader).toHaveCount(0);

    // 2. Cliccare 'Ok'
    await OK(page).click();

    // expect: URL /ente/modulicommessa
    await expect(page).toHaveURL(URL_ELENCO);
    await expect(locatoriElenco(page).title).toBeVisible();
  });

  test("Indietro header: Annulla resta sulla pagina", async ({ page }) => {
    await mockObbligatori(page);
    const l = await openPage(page);

    // (valore digitato prima di aprire il modale)
    await l.campo("totaleNotificheDigitaleNaz").fill("100");

    // 1. Aprire il ModalAlert e cliccare 'Annulla'
    await l.indietroHeader.click();
    await expect(ALERT(page)).toBeVisible();
    await ANNULLA(page).click();

    // expect: Modale chiuso, URL invariato, valori digitati conservati
    await expect(ALERT(page)).toHaveCount(0);
    await expect(page).toHaveURL(URL_INSERIMENTO);
    await expect(l.indietroHeader).toBeVisible();
    await expect(l.campo("totaleNotificheDigitaleNaz")).toHaveValue("100");
  });

  test("Indietro header chiude il modale con Escape", async ({ page }) => {
    await mockObbligatori(page);
    const l = await openPage(page);

    // 1. Premere Escape sul ModalAlert
    await l.indietroHeader.click();
    await expect(ALERT(page)).toBeVisible();
    await page.keyboard.press("Escape");

    // expect: Modale chiuso, nessuna navigazione
    await expect(ALERT(page)).toHaveCount(0);
    await expect(page).toHaveURL(URL_INSERIMENTO);
    await expect(l.indietroHeader).toBeVisible();
  });

  test("Indietro header in sola lettura: nessun modale", async ({ page }) => {
    await mockDettaglioMode(page, { modulo: (a, m) => makeModuloIns(a, m, { stato: "inserito", modifica: false }) });
    const l = await openPage(page);
    await mockElenco(page);

    // 1. Dettaglio con modifica false, cliccare 'Indietro'
    await l.indietroHeader.click();

    // expect: Navigazione diretta a /ente/modulicommessa, nessun modale
    await expect(page).toHaveURL(URL_ELENCO);
    await expect(locatoriElenco(page).title).toBeVisible();
    await expect(ALERT(page)).toHaveCount(0);
  });

  test("Ritorno all'elenco ricarica l'elenco", async ({ page }) => {
    await mockDettaglioMode(page, { modulo: (a, m) => makeModuloIns(a, m, { stato: "inserito", modifica: false }) });
    const l = await openPage(page);
    // infoTrimestreComSelected e' valorizzato dalla pagina di dettaglio
    expect(await infoTrimestre(page)).toMatchObject({ annoCommessaSelectd: "2026", meseCommessaSelected: "3" });
    const lista = await mockElenco(page);

    // 1. Dopo 'Indietro' mockare l'elenco
    await l.indietroHeader.click();

    // expect: L'elenco chiama lista e azzera infoTrimestreComSelected
    await expect(page).toHaveURL(URL_ELENCO);
    await expect.poll(() => lista.length).toBe(1);
    await expect(locatoriElenco(page).rows).toHaveCount(24);
    await expect.poll(() => infoTrimestre(page)).toEqual({});
  });

  test("Vedi anteprima: visibilita'", async ({ page }) => {
    let variante: Partial<MockModuloIns> = {};
    await mockDettaglioMode(page, { modulo: (a, m) => makeModuloIns(a, m, variante) });
    const l = locators(page);

    // 1. Verificare i casi: totaleNotifiche valorizzato e isEditAllow=false; totaleNotifiche null; isEditAllow=true
    // caso A: totaleNotifiche valorizzato e isEditAllow=false
    variante = { stato: "inserito", ...VALORI };
    await page.goto(ROUTE);
    await expect(l.modifica).toBeVisible();
    // expect: 'Vedi anteprima' visibile solo con totaleNotifiche !== null && !isEditAllow && !loadingData
    await expect(l.vediAnteprima).toBeVisible();

    // caso B: totaleNotifiche null (modulo non inserito), isEditAllow=false
    variante = { stato: "inserito", ...VALORI, totaleNotifiche: null };
    await page.reload();
    await expect(l.modifica).toBeVisible();
    // expect: Assente con totaleNotifiche null
    await expect(l.vediAnteprima).toHaveCount(0);

    // caso C: isEditAllow=true (stato null, modifica true)
    variante = { stato: null };
    await page.reload();
    await expect(l.salva).toBeVisible();
    // expect: Assente con isEditAllow=true
    await expect(l.vediAnteprima).toHaveCount(0);

    // caso D: campo totaleNotifiche mancante nella risposta
    variante = { stato: "inserito", ...VALORI, totaleNotifiche: undefined };
    await page.reload();
    await expect(l.modifica).toBeVisible();
    // expect: undefined !== null e' true: anteprima visibile
    // NB: comportamento attuale, coerente con la spec (documentato come possibile difetto)
    await expect(l.vediAnteprima).toBeVisible();
  });

  test("Vedi anteprima: navigazione e stato", async ({ page }) => {
    await mockDettaglioMode(page, { modulo: (a, m) => inserito(a, m), moduli: [{ anno: 2026, mese: 3 }] });
    const l = await openPage(page);

    // 1. Cliccare 'Vedi anteprima' sul modulo 3/2026
    await expect(l.vediAnteprima).toBeVisible();
    await l.vediAnteprima.click();

    // expect: URL /ente/pdfmodulocommessa/2026/3 (PathPf.PDF_COMMESSA_EN, per profilo non PAGOPA)
    await expect(page).toHaveURL(/\/ente\/pdfmodulocommessa\/2026\/3$/);
    // expect: infoTrimestreComSelected: annoCommessaSelectd '2026', meseCommessaSelected '3', moduloSelectedIndex = activeStep, altri campi conservati
    await expect
      .poll(async () => (await mainStatePersistito(page))?.infoTrimestreComSelected)
      .toMatchObject({
        annoCommessaSelectd: "2026",
        meseCommessaSelected: "3",
        moduloSelectedIndex: 0,
        idEnte: "729352e9-5bb9-4aff-a6b5-ca0c80c0d3b4",
        prodotto: "prod-pn",
        idTipoContratto: 1,
        moduli: [{ id: "3/2026", meseAnno: "Marzo/2026" }],
      });
  });

  test("Vedi anteprima su modulo di indice > 0", async ({ page }) => {
    const { dettaglio } = await mockDettaglioMode(page, {
      modulo: (a, m) => inserito(a, m),
      moduli: [{ anno: 2026, mese: 3 }, { anno: 2026, mese: 4 }],
    });
    const l = await openPage(page);

    // 1. Andare al secondo modulo e cliccare 'Vedi anteprima'
    await expect(page.getByText("Marzo/2026", { exact: true }).first()).toBeVisible();
    await l.avanti.click();
    await expect(page.getByText("Aprile/2026", { exact: true }).first()).toBeVisible();
    expect(dettaglio).toEqual(["2026/3", "2026/4"]);
    await expect(l.vediAnteprima).toBeVisible();
    await l.vediAnteprima.click();

    // expect: moduloSelectedIndex = 1 e URL del secondo modulo
    await expect(page).toHaveURL(/\/ente\/pdfmodulocommessa\/2026\/4$/);
    await expect
      .poll(async () => (await mainStatePersistito(page))?.infoTrimestreComSelected)
      .toMatchObject({ annoCommessaSelectd: "2026", meseCommessaSelected: "4", moduloSelectedIndex: 1 });
  });

  test("Ritorno dal pdf al dettaglio", async ({ page }) => {
    const { dettaglio } = await mockDettaglioMode(page, {
      modulo: (a, m) => inserito(a, m),
      moduli: [{ anno: 2026, mese: 3 }, { anno: 2026, mese: 4 }],
      indice: 1,
    });
    const l = await openPage(page);
    await expect(page.getByText("Aprile/2026", { exact: true }).first()).toBeVisible();
    await l.vediAnteprima.click();
    await expect(page).toHaveURL(/\/ente\/pdfmodulocommessa\/2026\/4$/);

    // 1. Dal pdf (mockato) tornare indietro
    await page.goBack();

    // expect: La pagina ricarica il dettaglio del modulo selezionato
    await expect(page).toHaveURL(URL_INSERIMENTO);
    await expect(l.indietroHeader).toBeVisible();
    await expect(page.getByText("Aprile/2026", { exact: true }).first()).toBeVisible();
    expect(dettaglio).toEqual(["2026/4", "2026/4"]);
    // lo stepper conserva il modulo selezionato (secondo step) e quindi 'Indiero' e' abilitato
    await expect(l.indietroStep).toBeEnabled();
    await expect(l.avanti).toBeDisabled();
  });

  test("Voce di menu laterale con modifiche in corso", async ({ page }) => {
    await mockObbligatori(page);
    await openPage(page);
    await expect.poll(async () => (await mainStatePersistito(page))?.statusPageInserimentoCommessa).toBe("mutable");
    const voce = page.getByRole("navigation").getByRole("button", { name: "Notifiche", exact: true });

    // 1. Con statusPageInserimentoCommessa 'mutable' cliccare una voce del menu (es. Notifiche)
    await voce.click();

    // expect: BasicModal 'Attenzione!' 'Le modifiche andranno perse'
    await expect(ALERT(page)).toBeVisible();
    await expect(page.getByText("Le modifiche andranno perse")).toBeVisible();

    // expect: 'Annulla' lo chiude
    await ANNULLA(page).click();
    await expect(ALERT(page)).toHaveCount(0);
    await expect(page).toHaveURL(URL_INSERIMENTO);

    // expect: 'Ok' esegue handleEsci: navigate(clickOn) e statusPage 'immutable'
    await voce.click();
    await expect(ALERT(page)).toBeVisible();
    await OK(page).click();
    await expect(page).toHaveURL(/\/ente\/listanotifiche$/);
    await expect.poll(async () => (await mainStatePersistito(page))?.statusPageInserimentoCommessa).toBe("immutable");
  });

  // NB: non pilotabile dalla UI. clickOn 'INDIETRO_BUTTON' non viene mai impostato: il menu laterale passa solo il path di destinazione
  // e mainState.inserisciModificaCommessa ('MODIFY' / 'INSERT') non e' modificabile da nessuna azione dell'utente nella pagina
  // (richiederebbe di forzare lo stato interno di useGlobalStore).
  test.fixme("BasicModal: Ok con clickOn INDIETRO_BUTTON", async () => {
    // 1. Forzare openBasicModal con clickOn 'INDIETRO_BUTTON' e inserisciModificaCommessa 'MODIFY' / 'INSERT'
    // expect: MODIFY: handleGetDettaglioModuloCommessa ricarica la pagina
    // expect: INSERT: navigazione a /ente/modulicommessa
    // expect: Altri casi (nessun ramo soddisfatto) non fanno nulla e il modale resta aperto
  });

  test("Accesso diretto senza sessione di inserimento", async ({ page }) => {
    await setRedirectToInsert(page, "false");
    // infoTrimestreComSelected={} (default della sessione) e verifica=false
    await mockVerificaElenco(page, false);
    await mockAnni(page);
    await mockListaElenco(page);
    // La pagina chiama anche dettaglio/undefined/undefined: la richiesta resta sospesa cosi' il suo 404 non sovrascrive l'alert
    await page.route(
      (url) => url.pathname.endsWith("/dettaglio/undefined/undefined"),
      () => {},
    );

    // 1. verifica=false, infoTrimestreComSelected={} e goto diretto
    await page.goto(ROUTE);

    // expect: Vedi caso del ramo dettaglio senza stato (caricamento): redirect all'elenco con alert
    await expect(page).toHaveURL(URL_ELENCO);
    await expect(page.getByText(NO_INSERIMENTO)).toBeVisible();
    await expect(locatoriElenco(page).title).toBeVisible();
  });

  test("Reload della pagina in dettaglio", async ({ page }) => {
    const { dettaglio } = await mockDettaglioMode(page, { modulo: (a, m) => inserito(a, m), moduli: [{ anno: 2026, mese: 3 }] });
    const l = await openPage(page);
    await expect(page.getByText("Marzo/2026", { exact: true }).first()).toBeVisible();
    expect(dettaglio).toEqual(["2026/3"]);

    // 1. Ricaricare la pagina in dettaglio
    await page.reload();

    // expect: globalStatePF e' persistito: la pagina ricarica il dettaglio dello stesso modulo
    await expect(l.indietroHeader).toBeVisible();
    await expect(l.titoloDettaglio).toBeVisible();
    await expect(page.getByText("Marzo/2026", { exact: true }).first()).toBeVisible();
    expect(dettaglio).toEqual(["2026/3", "2026/3"]);
  });

  test("Header e pulsanti durante il caricamento (obbligatori)", async ({ page }) => {
    await mockObbligatori(page, { moduli: [makeModuloIns(2026, 8), makeModuloIns(2026, 9)] });
    const rilascia = await ritarda(page, API.lista);
    const l = locators(page);

    // 1. Ritardare lista
    const richiesta = page.waitForRequest((r) => API.lista.test(new URL(r.url()).pathname));
    await page.goto(ROUTE);
    await richiesta;

    // expect: Skeleton al posto di header e corpo, nessun Indietro/Avanti/Salva fino al termine
    await expect(l.indietroHeader).toHaveCount(0);
    await expect(l.titoloObbligatori).toHaveCount(0);
    await expect(l.indietroStep).toHaveCount(0);
    await expect(l.avanti).toHaveCount(0);
    await expect(l.salva).toHaveCount(0);
    await expect(l.proseguiPerSalvare).toHaveCount(0);
    await expect(page.getByText("Mese/Anno:")).toHaveCount(0);

    rilascia();
    await expect(l.indietroHeader).toBeVisible();
    await expect(l.avanti).toBeVisible();
    await expect(l.indietroStep).toBeVisible();
    await expect(page.getByText("Mese/Anno:")).toBeVisible();
  });

  test("Header e pulsanti durante il caricamento (dettaglio)", async ({ page }) => {
    await mockDettaglioMode(page, { modulo: (a, m) => inserito(a, m), moduli: [{ anno: 2026, mese: 3 }, { anno: 2026, mese: 4 }] });
    const rilascia = await ritarda(page, API.dettaglio);
    const l = locators(page);

    // 1. Ritardare dettaglio
    const richiesta = page.waitForRequest((r) => API.dettaglio.test(new URL(r.url()).pathname));
    await page.goto(ROUTE);
    await richiesta;

    // expect: Skeleton al posto di header e corpo, nessun Indietro/Avanti/Modifica fino al termine
    await expect(l.indietroHeader).toHaveCount(0);
    await expect(l.titoloDettaglio).toHaveCount(0);
    await expect(l.avanti).toHaveCount(0);
    await expect(l.modifica).toHaveCount(0);
    await expect(l.vediAnteprima).toHaveCount(0);
    await expect(page.getByText("Mese/Anno:")).toHaveCount(0);

    rilascia();
    await expect(l.indietroHeader).toBeVisible();
    await expect(l.avanti).toBeVisible();
    await expect(l.modifica).toBeVisible();
    await expect(l.vediAnteprima).toBeVisible();
    await expect(page.getByText("Marzo/2026", { exact: true }).first()).toBeVisible();
  });
});
