// spec: specs/areaPersonaleUtenteEnte.md
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  DATI_FATTURAZIONE_DEFAULT, ERRORE_401, ERRORE_500, ROUTE, createGate, delayed, error, abort, locators, mainStatePersistito,
  makeDatiFatturazione, mockAreaPersonale, notFound, ok, openPage,
} from "../../utils/areaPersonaleMock/areaPersonaleMock";

const SUCCESSO = "Dati di fatturazione inseriti";
const ERRORE_DEFAULT = "L'operazione non è andata a buon fine. Contattare l'assistenza";

// ---- helper locali ---------------------------------------------------------------------------------------------
const alert = (page: Page) => page.getByRole("alert");
const modaleLoading = (page: Page) => page.getByText("Operazione in corso");
const notaLegale = (page: Page) => page.getByRole("checkbox");
const dataDocumento = (page: Page) => page.getByLabel("Data documento");

async function entraInModifica(page: Page) {
  const l = await openPage(page);
  await l.modifica.click();
  await expect(l.heading("Modifica dati di fatturazione")).toBeVisible();
  return l;
}

async function aggiungiEmail(page: Page, email: string) {
  const l = locators(page);
  await l.emailAmministrativo.fill(email);
  await l.aggiungiEmail.click();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
}

async function compilaData(page: Page, ddmmyyyy: string) {
  const campo = dataDocumento(page);
  await campo.click();
  await campo.press("Control+a");
  await campo.press("Backspace");
  await campo.pressSequentially(ddmmyyyy.replace(/\//g, ""));
  await expect(campo).toHaveValue(ddmmyyyy);
}

test.describe("Salvataggio", () => {
  test("Modifica di dati esistenti (PUT)", async ({ page }) => {
    const gate = createGate();
    const aggiornati = makeDatiFatturazione({
      pec: "nuova@test.it",
      contatti: [...DATI_FATTURAZIONE_DEFAULT.contatti, { email: "tre@test.it", tipo: 1 }],
    });
    const api = await mockAreaPersonale(page, {
      get: [ok(DATI_FATTURAZIONE_DEFAULT), ok(aggiornati)],
      modify: delayed(ok(), gate),
    });

    // 1. Aprire la pagina, 'Modifica', cambiare PEC, aggiungere una email e cliccare 'Salva'
    const l = await entraInModifica(page);
    await l.pec.fill("nuova@test.it");
    await aggiungiEmail(page, "tre@test.it");
    await l.salva.click();

    // expect: modale 'Operazione in corso' durante la PUT
    await expect(modaleLoading(page)).toBeVisible();
    await expect(page.getByText("Loading...")).toBeVisible();
    gate.release();

    // expect: alert di successo e pagina in immutable con valori aggiornati
    await expect(alert(page)).toContainText(SUCCESSO);
    await expect(l.titolo).toBeVisible();
    await expect(modaleLoading(page)).toHaveCount(0);
    await expect(l.modifica).toBeVisible();
    await expect(l.salva).toHaveCount(0);
    await expect(l.indietro).toHaveCount(0);
    await expect(l.pec).toHaveValue("nuova@test.it");
    await expect(page.getByText("tre@test.it", { exact: true })).toBeVisible();

    // expect: una sola PUT, nessuna POST, GET richiamata dopo la PUT
    expect(api.modify.calls).toBe(1);
    expect(api.insert.calls).toBe(0);
    await expect.poll(() => api.get.calls).toBe(2);
    const body = api.modify.bodies[0] as Record<string, unknown>;
    // nota: il contatto aggiunto dalla UI ha tipo stringa "1", quelli caricati dalla GET restano numerici
    expect(body).toMatchObject({
      pec: "nuova@test.it",
      contatti: [...DATI_FATTURAZIONE_DEFAULT.contatti, { email: "tre@test.it", tipo: "1" }],
      dataDocumento: "2026-03-15T00:00:00.000Z",
    });

    // expect: stato persistito
    const stato = await mainStatePersistito(page);
    expect(stato.statusPageDatiFatturazione).toBe("immutable");
    expect(stato.datiFatturazioneNotCompleted).toBe(false);
  });

  test("Primo inserimento (POST)", async ({ page }) => {
    const salvati = makeDatiFatturazione({
      cup: "", idDocumento: "", codCommessa: "", dataDocumento: null, pec: "pec@test.it",
      contatti: [{ email: "ref@test.it", tipo: 1 }], codiceSDI: "SDI0001",
    });
    const api = await mockAreaPersonale(page, { get: [notFound(), ok(salvati)], sdi: ok({ contractCodiceSDI: "SDI0001" }) });
    const l = locators(page);

    // 1. Caso 404: selezionare ordine d'acquisto, PEC, email, notaLegale, SDI da contratto e 'Salva'
    await page.goto(ROUTE);
    await expect(l.heading("Inserisci i dati di fatturazione")).toBeVisible();
    await l.radioOrdine.check();
    await l.pec.fill("pec@test.it");
    await aggiungiEmail(page, "ref@test.it");
    await notaLegale(page).check();
    await expect(l.codiceSdi).toHaveValue("SDI0001");
    await expect(l.salva).toBeEnabled();
    await l.salva.click();

    // expect: alert di successo, heading 'Dati di fatturazione' e 'Modifica' visibili
    await expect(alert(page)).toContainText(SUCCESSO);
    await expect(l.titolo).toBeVisible();
    await expect(l.modifica).toBeVisible();

    // expect: una sola POST con body senza idEnte e prodotto, nessuna PUT, GET ricaricata
    expect(api.insert.calls).toBe(1);
    expect(api.modify.calls).toBe(0);
    await expect.poll(() => api.get.calls).toBe(2);
    expect(api.insert.bodies[0]).toEqual({
      tipoCommessa: "1",
      splitPayment: true,
      cup: "",
      notaLegale: true,
      idDocumento: "",
      codCommessa: "",
      contatti: [{ tipo: "1", email: "ref@test.it" }],
      dataDocumento: null,
      pec: "pec@test.it",
      codiceSDI: "SDI0001",
    });

    const stato = await mainStatePersistito(page);
    expect(stato.datiFatturazione).toBe(true);
    expect(stato.statusPageDatiFatturazione).toBe("immutable");
    expect(stato.datiFatturazioneNotCompleted).toBe(false);
  });

  test("Salvataggio con CUP, ID Documento e data", async ({ page }) => {
    const api = await mockAreaPersonale(page, { get: ok(makeDatiFatturazione({ cup: "", idDocumento: "", dataDocumento: null })) });

    // 1. Compilare CUP, ID Documento e Data documento '15/03/2026' e salvare
    const l = await entraInModifica(page);
    await l.cup.fill("CUPNEW1");
    await l.idDocumento.fill("DOCNEW1");
    await compilaData(page, "15/03/2026");
    await l.salva.click();
    await expect(alert(page)).toContainText(SUCCESSO);

    // expect: body con cup, idDocumento e dataDocumento ISO locale del 2026-03-15
    expect(api.modify.calls).toBe(1);
    expect(api.modify.bodies[0]).toMatchObject({ cup: "CUPNEW1", idDocumento: "DOCNEW1" });
    expect((api.modify.bodies[0] as { dataDocumento: string }).dataDocumento).toMatch(/^2026-03-15T/);
  });

  test("Completamento di dati incompleti (cup senza idDocumento)", async ({ page }) => {
    const incompleti = makeDatiFatturazione({ cup: "CUP123", idDocumento: "", dataDocumento: null });
    const api = await mockAreaPersonale(page, { get: [ok(incompleti), ok(DATI_FATTURAZIONE_DEFAULT)] });
    const l = locators(page);

    // 1. GET con cup valorizzato e idDocumento vuoto: la pagina parte in mutable
    await page.goto(ROUTE);
    await expect(l.heading("Modifica dati di fatturazione")).toBeVisible();
    await l.idDocumento.fill("DOC-1");
    await compilaData(page, "15/03/2026");
    await l.salva.click();

    // expect: PUT inviata, poi con la GET completa stato immutable
    await expect(alert(page)).toContainText(SUCCESSO);
    await expect(l.titolo).toBeVisible();
    expect(api.modify.calls).toBe(1);
    await expect.poll(() => api.get.calls).toBe(2);
    // expect: datiFatturazioneNotCompleted torna false
    const stato = await mainStatePersistito(page);
    expect(stato.statusPageDatiFatturazione).toBe("immutable");
    expect(stato.datiFatturazioneNotCompleted).toBe(false);
  });

  test("Errore sulla PUT con detail", async ({ page }) => {
    const api = await mockAreaPersonale(page, { modify: error(500, { detail: "Dettaglio errore backend" }) });

    // 1. PUT 500 con detail e salvare
    const l = await entraInModifica(page);
    await l.pec.fill("modificata@test.it");
    await l.salva.click();

    // expect: modale chiuso, alert con il detail, resta mutable con i dati modificati
    await expect(alert(page)).toContainText("Dettaglio errore backend");
    await expect(modaleLoading(page)).toHaveCount(0);
    await expect(l.heading("Modifica dati di fatturazione")).toBeVisible();
    await expect(l.pec).toHaveValue("modificata@test.it");
    await expect(alert(page)).not.toContainText(SUCCESSO);
    // expect: nessuna GET successiva
    expect(api.modify.calls).toBe(1);
    expect(api.get.calls).toBe(1);
  });

  test("Errore sulla POST con detail", async ({ page }) => {
    const api = await mockAreaPersonale(page, { get: notFound(), insert: error(409, { detail: "Dati gia presenti" }) });
    const l = locators(page);

    // 1. Caso 404, POST 409 con detail e salvare
    await page.goto(ROUTE);
    await expect(l.heading("Inserisci i dati di fatturazione")).toBeVisible();
    await l.radioOrdine.check();
    await l.pec.fill("pec@test.it");
    await aggiungiEmail(page, "ref@test.it");
    await notaLegale(page).check();
    await l.salva.click();

    // expect: alert 'Dati gia presenti', resta mutable, datiFatturazione false, Indietro disabilitato
    await expect(alert(page)).toContainText("Dati gia presenti");
    await expect(l.heading("Inserisci i dati di fatturazione")).toBeVisible();
    await expect(l.indietro).toBeDisabled();
    expect(api.insert.calls).toBe(1);
    const stato = await mainStatePersistito(page);
    expect(stato.statusPageDatiFatturazione).toBe("mutable");
    expect(stato.datiFatturazione).toBe(false);
  });

  test("Errore senza detail", async ({ page }) => {
    await mockAreaPersonale(page, { modify: error(500, {}) });

    // 1. PUT 500 con body {} e salvare
    const l = await entraInModifica(page);
    await l.salva.click();

    // expect: alert con il testo di default, nessun crash
    await expect(alert(page)).toContainText(ERRORE_DEFAULT);
    await expect(l.heading("Modifica dati di fatturazione")).toBeVisible();
  });

  for (const status of [403, 401]) {
    test(`Errori di autenticazione sul salvataggio (401, 403) - ${status}`, async ({ page }) => {
      // BUG: il catch fa setErrorAlert({ error: status, message: detail }) e alert.tsx mostra errorAlert.message
      // oppure il fallback errori.400 ("...Contattare l'assistenza"), mai t(`errori.${status}`): il testo
      // 'Utente non autenticato' non compare (per 403 l'alert ha anche severity success). Il redirect avviene.
      test.fail();
      await mockAreaPersonale(page, { modify: error(status, {}) });

      // 1. PUT con errore di autenticazione e salvare
      const l = await entraInModifica(page);
      await l.salva.click();

      // expect: alert 'Utente non autenticato' e redirect a Selfcare (intercettato dalla fixture)
      await expect(alert(page)).toBeVisible();
      await expect.soft(alert(page)).toContainText(ERRORE_401);
      await expect(page).toHaveURL(/selfcare\.pagopa\.it/, { timeout: 10_000 });
    });
  }

  test("Errore di rete sulla PUT (senza response)", async ({ page }) => {
    // BUG #1: il catch fa err.response.status con response undefined -> TypeError, nessun alert.
    // Il test asserisce il comportamento corretto (alert di errore) ed e' marcato come fallimento atteso.
    test.fail();
    const api = await mockAreaPersonale(page, { modify: abort() });

    // 1. Abortire la PUT
    const l = await entraInModifica(page);
    await l.salva.click();

    // expect: il modale si chiude e compare un alert d'errore
    await expect.poll(() => api.modify.calls).toBe(1);
    await expect(modaleLoading(page)).toHaveCount(0);
    await expect(l.heading("Modifica dati di fatturazione")).toBeVisible();
    await expect(alert(page)).toBeVisible({ timeout: 3000 });
  });

  test("Doppio click su Salva", async ({ page }) => {
    const gate = createGate();
    const api = await mockAreaPersonale(page, { modify: delayed(ok(), gate) });

    // 1. PUT ritardata e dblclick su 'Salva'
    const l = await entraInModifica(page);
    await l.salva.dblclick({ force: true }).catch(() => {});
    await expect(modaleLoading(page)).toBeVisible();
    gate.release();

    // expect: una sola PUT
    await expect(alert(page)).toContainText(SUCCESSO);
    expect(api.modify.calls).toBe(1);
  });

  test("GET di ricarica fallita dopo il salvataggio", async ({ page }) => {
    // la GET di ricarica viene trattenuta: altrimenti il suo 500 sovrascrive subito (stesso mainState.apiError)
    // l'alert di successo, che non risulta mai visibile
    const gate = createGate();
    const api = await mockAreaPersonale(page, { get: [ok(DATI_FATTURAZIONE_DEFAULT), delayed(error(500), gate)] });

    // 1. PUT 200 e GET successiva 500
    const l = await entraInModifica(page);
    await l.salva.click();

    // expect: alert di successo poi errore 500, pagina senza crash
    await expect(alert(page)).toContainText(SUCCESSO);
    await expect.poll(() => api.get.calls).toBe(2);
    gate.release();
    await expect(alert(page)).toContainText(ERRORE_500);
    await expect(l.titolo).toBeVisible();
  });

  test("Persistenza dopo reload", async ({ page }) => {
    const aggiornati = makeDatiFatturazione({ pec: "salvata@test.it" });
    await mockAreaPersonale(page, { get: [ok(DATI_FATTURAZIONE_DEFAULT), ok(aggiornati)] });

    // 1. Salvataggio riuscito poi page.reload()
    const l = await entraInModifica(page);
    await l.pec.fill("salvata@test.it");
    await l.salva.click();
    await expect(alert(page)).toContainText(SUCCESSO);
    await page.reload();

    // expect: form ricaricato in immutable con i valori salvati
    await expect(l.titolo).toBeVisible();
    await expect(l.modifica).toBeVisible();
    await expect(l.pec).toHaveValue("salvata@test.it");
    await expect(l.pec).toBeDisabled();
  });

  test("Body della PUT include tutti i campi dello state", async ({ page }) => {
    const api = await mockAreaPersonale(page);

    // 1. Modificare un solo campo e salvare
    const l = await entraInModifica(page);
    await l.codCommessa.fill("COM/2");
    await l.salva.click();
    await expect(alert(page)).toContainText(SUCCESSO);

    // expect: BUG #4 (da confermare con il BE): il body PUT e' lo spread dell'intero state datiFatturazione,
    // inclusi id, idEnte, dataCreazione, dataModifica, contractCodiceSDI, map, prodotto.
    expect(api.modify.bodies[0]).toEqual({
      ...DATI_FATTURAZIONE_DEFAULT,
      codCommessa: "COM/2",
      dataDocumento: expect.stringMatching(/^2026-03-15T/),
    });
  });
});
