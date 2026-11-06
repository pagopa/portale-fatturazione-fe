// spec: specs/ente-moduloCommessaElenco.md (sezione 2)
// seed: tests/auth.setup.ts

import { test, expect, SELFCARE_URL } from "../../fixtures";
import {
  ERRORE_401, ERRORE_500, ROUTE, infoTrimestre, locators, mockAll, mockInserimento, mockVerifica, openPage, seedSession,
} from "../../utils/moduloCommessaElencoMock/moduloCommessaElencoMock";

const URL_INSERIMENTO = /\/ente\/modulocommessa$/;
const URL_ELENCO = /\/ente\/modulicommessa$/;
const redirectToInsert = (page: import("@playwright/test").Page) => page.evaluate(() => localStorage.getItem("redirectToInsert"));

test.describe("Navigazione e inserimento", () => {
  test("verifica=false: pulsante Inserisci assente", async ({ page }) => {
    const { lista } = await mockAll(page, { verifica: false, redirect: "false" });

    // 1. redirectToInsert=false, verifica false, aprire la pagina
    const l = await openPage(page);
    await expect.poll(() => lista.length).toBe(1);
    await expect(l.rows).toHaveCount(24);

    // expect: 'Inserisci modulo commessa' non presente
    await expect(l.inserisci).toHaveCount(0);
    // expect: URL resta /ente/modulicommessa
    await expect(page).toHaveURL(URL_ELENCO);
    // expect: localStorage redirectToInsert === 'false'
    expect(await redirectToInsert(page)).toBe("false");
  });

  test("verifica=true e redirectToInsert=false: pulsante visibile e navigazione", async ({ page }) => {
    const { anni, lista } = await mockAll(page, { verifica: true, redirect: "false" });

    // 1. redirectToInsert=false, verifica true, aprire la pagina
    const l = await openPage(page);

    // expect: Lista e anni caricati
    await expect.poll(() => lista.length).toBe(1);
    expect(anni.n).toBe(1);
    await expect(l.rows).toHaveCount(24);
    // expect: 'Inserisci modulo commessa' visibile e abilitato
    await expect(l.inserisci).toBeVisible();
    await expect(l.inserisci).toBeEnabled();

    // 2. Cliccare 'Inserisci modulo commessa'
    await l.inserisci.click();

    // expect: URL /ente/modulocommessa
    await expect(page).toHaveURL(URL_INSERIMENTO);
    // expect: Nessuna modifica a infoTrimestreComSelected (resta {})
    expect(await infoTrimestre(page)).toEqual({});
  });

  test("verifica=true e redirectToInsert=true: redirect automatico", async ({ page }) => {
    const { verifica, anni, lista } = await mockAll(page, { verifica: true, redirect: "true" });
    const l = locators(page);

    // 1. Impostare redirectToInsert=true, verifica true, aprire la pagina
    await page.goto(ROUTE);

    // expect: URL diventa /ente/modulocommessa
    await expect(page).toHaveURL(URL_INSERIMENTO);
    // expect: Nessuna chiamata ad anni e lista
    expect(verifica.n).toBe(1);
    expect(anni.n).toBe(0);
    expect(lista).toHaveLength(0);
    // expect: Il pulsante Inserisci non viene mai mostrato (la pagina elenco non si vede)
    await expect(l.inserisci).toHaveCount(0);
    await expect(l.rows).toHaveCount(0);
  });

  test("verifica=false e redirectToInsert=true: nessun redirect", async ({ page }) => {
    const { anni, lista } = await mockAll(page, { verifica: false, redirect: "true" });

    // 1. Impostare redirectToInsert=true, verifica false, aprire la pagina
    const l = await openPage(page);

    // expect: Resta su /ente/modulicommessa, lista e anni caricati
    await expect(page).toHaveURL(URL_ELENCO);
    await expect.poll(() => lista.length).toBe(1);
    expect(anni.n).toBe(1);
    await expect(l.rows).toHaveCount(24);
    // expect: redirectToInsert riscritto a 'false'
    expect(await redirectToInsert(page)).toBe("false");
    // expect: Pulsante Inserisci assente
    await expect(l.inserisci).toHaveCount(0);
  });

  test("verifica=true, redirectToInsert=false dopo il primo passaggio", async ({ page }) => {
    const { anni, lista } = await mockAll(page, { verifica: true, redirect: "true" });
    await mockInserimento(page);
    const l = locators(page);

    // 1. Primo accesso con redirectToInsert=true e verifica true: redirect alla pagina di inserimento
    await page.goto(ROUTE);
    await expect(page).toHaveURL(URL_INSERIMENTO);
    expect(lista).toHaveLength(0);
    // la chiave e' riscritta a 'false' dalla pagina di inserimento al montaggio (moduloCommessaInserimentoUtEn30)
    await expect.poll(() => redirectToInsert(page)).toBe("false");

    // 2. Cliccare 'Indietro' nella pagina di inserimento e confermare il modale 'Attenzione!' con 'Ok'
    await page.getByRole("button", { name: "Indietro", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Attenzione!" })).toBeVisible();
    await page.getByRole("button", { name: "Ok", exact: true }).click();

    // expect: La seconda visita non fa redirect: lista visibile con pulsante Inserisci
    await expect(page).toHaveURL(URL_ELENCO);
    await expect(l.inserisci).toBeVisible();
    await expect.poll(() => lista.length).toBe(1);
    expect(anni.n).toBe(1);
    await expect(l.rows).toHaveCount(24);
  });

  test("redirectToInsert assente (clean localStorage): bug JSON.parse", async ({ page }) => {
    const { verifica, anni, lista } = await mockAll(page, { verifica: true, redirect: null });
    const l = locators(page);

    // 1. Non impostare nessuna chiave, mockare verifica true e aprire la pagina via goto
    await page.goto(ROUTE);

    // expect: SyntaxError nel then di verifica -> catch; Skeleton rimosso, heading visibile
    // NB: comportamento attuale (bug noto), da aggiornare quando JSON.parse("") sara' corretto
    await expect(l.title).toBeVisible();
    await expect.poll(() => verifica.n).toBe(1);
    // expect: Nessuna chiamata ad anni e lista, nessun pulsante Inserisci, griglia vuota
    expect(anni.n).toBe(0);
    expect(lista).toHaveLength(0);
    await expect(l.inserisci).toHaveCount(0);
    await expect(l.rows).toHaveCount(0);
    // expect: Nessun crash dell'applicazione
    await expect(page).toHaveURL(URL_ELENCO);
    await expect(l.filtra).toBeVisible();
  });

  test("redirectToInsert con valore non JSON", async ({ page }) => {
    const { verifica, anni, lista } = await mockAll(page, { verifica: true, redirect: "abc" });
    const l = locators(page);

    // 1. Impostare redirectToInsert='abc' e aprire la pagina
    await page.goto(ROUTE);

    // expect: Stesso comportamento di 2.6 (catch, nessuna lista)
    await expect(l.title).toBeVisible();
    await expect.poll(() => verifica.n).toBe(1);
    expect(anni.n).toBe(0);
    expect(lista).toHaveLength(0);
    await expect(l.inserisci).toHaveCount(0);
    await expect(l.rows).toHaveCount(0);
    await expect(page).toHaveURL(URL_ELENCO);
  });

  test("Voce di menu laterale imposta redirectToInsert=true", async ({ page }) => {
    const { anni, lista } = await mockAll(page, { verifica: true, redirect: "false" });
    const l = locators(page);
    const menu = page.getByRole("navigation").getByRole("button", { name: "Modulo commessa", exact: true });

    // 1. Da un'altra pagina ente con verifica true cliccare la voce 'Modulo commessa'
    await page.goto("/ente/datidifatturazione");
    await menu.click();

    // expect: Redirect automatico a /ente/modulocommessa
    await expect(page).toHaveURL(URL_INSERIMENTO);
    expect(anni.n).toBe(0);
    expect(lista).toHaveLength(0);

    // 2. Ripetere con verifica false
    await mockVerifica(page, false);
    await page.goto("/ente/datidifatturazione");
    await menu.click();

    // expect: Si resta su /ente/modulicommessa con lista e anni, redirectToInsert a 'false'
    await expect(page).toHaveURL(URL_ELENCO);
    await expect(l.rows).toHaveCount(24);
    expect(anni.n).toBe(1);
    expect(lista).toEqual([""]);
    await expect(l.inserisci).toHaveCount(0);
    expect(await redirectToInsert(page)).toBe("false");
  });

  test("Errore 500 su verifica", async ({ page }) => {
    const { anni, lista } = await mockAll(page);
    const l = locators(page);

    // 1. Mockare verifica con 500 e aprire la pagina
    const verifica = await mockVerifica(page, false, 500);
    await page.goto(ROUTE);

    // expect: Skeleton rimosso, heading visibile
    await expect(l.title).toBeVisible();
    // expect: manageError attiva il messaggio di errore 500 del layout
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    // expect: Nessuna chiamata ad anni e lista, nessun pulsante Inserisci, griglia vuota
    expect(verifica.n).toBe(1);
    expect(anni.n).toBe(0);
    expect(lista).toHaveLength(0);
    await expect(l.inserisci).toHaveCount(0);
    await expect(l.rows).toHaveCount(0);
  });

  test("Errore 401 su verifica", async ({ page }) => {
    const { anni, lista } = await mockAll(page);

    // 1. Mockare verifica con 401
    const verifica = await mockVerifica(page, false, 401);
    await page.goto(ROUTE);

    // expect: Gestione 401 del layout (messaggio e redirect a Selfcare), nessun crash
    await expect(page.getByText(ERRORE_401)).toBeVisible();
    expect(verifica.n).toBe(1);
    expect(anni.n).toBe(0);
    expect(lista).toHaveLength(0);
    await expect(page).toHaveURL(SELFCARE_URL, { timeout: 10000 });
  });

  test("infoTrimestreComSelected azzerato al caricamento", async ({ page }) => {
    const { lista } = await mockAll(page, { verifica: false });

    // 1. Precompilare globalStatePF con infoTrimestreComSelected non vuoto, verifica false, aprire la pagina
    await seedSession(page, { mainState: { infoTrimestreComSelected: { meseCommessaSelected: "5", annoCommessaSelectd: "2026" } } });
    await openPage(page);
    await expect.poll(() => lista.length).toBe(1);

    // expect: Dopo il caricamento lo stato persistito ha infoTrimestreComSelected = {}
    await expect.poll(() => infoTrimestre(page)).toEqual({});
  });
});
