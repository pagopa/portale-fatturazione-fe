// spec: specs/notifiche.md (sezione 1)
// seed: tests/auth.setup.ts

import { test, expect, SELFCARE_URL } from "../../fixtures";
import {
  ERRORE_401, ERRORE_500, locators, mockAll, mockAnni, mockBase, mockListaEnte, mockMesi, mockScadenziario, openPage, seedSession,
  ROUTE_ENTE, SCADENZIARIO,
} from "../../utils/notificheMock/notificheMock";

test.describe("Titolo e accesso", () => {
  test("Titolo e pulsante Scadenzario contestazioni", async ({ page }) => {
    const { lista } = await mockAll(page);

    // 1. Aprire la rotta del ruolo (ente: /ente/listanotifiche) con tutti i mock base
    await page.goto(ROUTE_ENTE);
    const l = locators(page);

    // expect: Heading 'Notifiche' visibile
    await expect(l.title).toBeVisible();
    // expect: Pulsante icona 'Scadenzario contestazioni' visibile e abilitato
    await expect(l.scadenziarioButton).toBeVisible();
    await expect(l.scadenziarioButton).toBeEnabled();
    // expect: Il modale 'Loading...' compare e poi scompare
    await expect(l.loading).toBeHidden();
    expect(lista.length).toBeGreaterThan(0);
    // expect: Menu laterale con voce 'Notifiche' evidenziata
    await expect(page.getByRole("navigation").getByRole("button", { name: "Notifiche", exact: true })).toHaveClass(/Mui-selected/);

    // 2. Verificare gli elementi fissi
    // expect: Pulsanti 'Filtra' e 'Download risultati' visibili; 'Annulla filtri' assente
    await expect(l.filtra).toBeVisible();
    await expect(l.download).toBeVisible();
    await expect(l.annulla).toHaveCount(0);
  });

  test("Apertura e chiusura del modale Scadenzario contestazioni", async ({ page }) => {
    const { scadenziario } = await mockAll(page);
    const l = await openPage(page);
    await expect(l.loading).toBeHidden();

    // 1. Con mock di tipologia/scadenziariocontestazioni cliccare il pulsante 'Scadenzario contestazioni'
    await l.scadenziarioButton.click();

    // expect: ModalScadenziario aperto con i dati mockati
    const modal = page.getByRole("heading", { name: "Scadenzario contestazioni" });
    await expect(modal).toBeVisible();
    await expect(page.getByText("Ente Aderente")).toBeVisible();
    for (const riga of SCADENZIARIO) {
      await expect(page.getByRole("cell", { name: riga.meseContestazione, exact: true })).toBeVisible();
      await expect(page.getByRole("cell", { name: riga.dataInizio })).toBeVisible();
    }
    // expect: Richiesta GET /api/tipologia/scadenziariocontestazioni effettuata (alla mount della pagina)
    expect(scadenziario.calls()).toBe(1);

    // 2. Chiudere il modale
    await page.keyboard.press("Escape");

    // expect: Il modale non e' piu' visibile e la pagina sottostante e' invariata
    await expect(modal).toBeHidden();
    await expect(l.title).toBeVisible();
    await expect(l.scadenziarioButton).toBeVisible();
    await expect(l.filtra).toBeVisible();
    await expect(l.annulla).toHaveCount(0);
    expect(scadenziario.calls()).toBe(1);
  });

  test("Scadenzario con errore API", async ({ page }) => {
    await mockBase(page);
    await mockAnni(page);
    await mockMesi(page);
    await mockListaEnte(page);
    // 1. Mockare scadenziariocontestazioni con 500 e aprire il modale
    const scadenziario = await mockScadenziario(page, [], 500);
    const l = await openPage(page);

    // expect: Errore gestito da manageError (la chiamata parte alla mount)
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    expect(scadenziario.calls()).toBe(1);

    await l.scadenziarioButton.click();

    // expect: nessun crash, il modale e la pagina restano utilizzabili
    await expect(page.getByRole("heading", { name: "Scadenzario contestazioni" })).toBeVisible();
    await expect(page.getByText("Ente Aderente")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("heading", { name: "Scadenzario contestazioni" })).toBeHidden();
    await expect(l.title).toBeVisible();
    await expect(l.filtra).toBeVisible();
  });

  test("Ente con dati di fatturazione mancanti: ModalRedirect", async ({ page, context }) => {
    const { mesi, lista } = await mockAll(page);
    const l = locators(page);

    // 1. Impostare in globalStatePF mainState.datiFatturazione=false e aprire /ente/listanotifiche
    await seedSession(page, { mainState: { datiFatturazione: false } });
    await page.goto(ROUTE_ENTE);

    // expect: Compare ModalRedirect con il testo sui dati di fatturazione
    await expect(l.redirectModal).toBeVisible();
    // expect: Non viene chiamata POST /api/notifiche/ente (lista non caricata): griglia vuota
    await expect.poll(() => mesi.length).toBe(1);
    await expect(l.loading).toBeHidden();
    expect(lista).toHaveLength(0);
    await expect(page.getByRole("row", { name: /IUN-/ })).toHaveCount(0);

    // 2. Ripetere con datiFatturazioneNotCompleted=true
    const page2 = await context.newPage();
    const mock2 = await mockAll(page2);
    const l2 = locators(page2);
    await seedSession(page2, { mainState: { datiFatturazione: true, datiFatturazioneNotCompleted: true } }, "not-completed");
    await page2.goto(ROUTE_ENTE);

    // expect: Stesso modale
    await expect(l2.redirectModal).toBeVisible();
    await expect(l2.loading).toBeHidden();
    // NB: diverge dalla spec: funInitialRender verifica solo datiFatturazione, quindi con
    // datiFatturazioneNotCompleted=true la lista viene comunque caricata (da confermare col team)
    await expect.poll(() => mock2.lista.length).toBe(1);
  });

  test("Token scaduto / 401 sulle API", async ({ page }) => {
    await mockBase(page);
    await mockAnni(page);
    await mockMesi(page);
    await mockScadenziario(page);

    // 1. Mockare la lista notifiche con 401 e aprire la pagina
    // (notifiche/anni con 401 non passa da manageError: viene solo loggato "Error NOTIFICHE")
    await mockListaEnte(page, undefined, 401);
    await page.goto("/ente/listanotifiche");

    // expect: Alert "Utente non autenticato. Effettuare nuovamente l'accesso" (manageError)
    await expect(page.getByText(ERRORE_401)).toBeVisible();
    // expect: redirect a Selfcare per il ruolo ente
    await expect(page).toHaveURL(SELFCARE_URL, { timeout: 10000 });
  });
});
