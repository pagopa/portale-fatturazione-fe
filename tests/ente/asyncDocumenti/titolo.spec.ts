// spec: specs/ente-asyncDocumenti.md (sezione 1)
// seed: tests/auth.setup.ts

import { test, expect, SELFCARE_URL } from "../../fixtures";
import {
  API, ERRORE_401, ERRORE_500, ROUTE, locators, mockAll, mockLista, openPage, seedSession,
} from "../../utils/asyncDocumentiMock/asyncDocumentiMock";

// Campo data vuoto: placeholder DD/MM/YYYY (value "" oppure placeholder, a seconda della versione del picker)
const VUOTO = /^(DD\/MM\/YYYY)?$/;

test.describe("Titolo e accesso", () => {
  test("Titolo e caricamento iniziale", async ({ page }) => {
    const { lista } = await mockAll(page);

    // 1. Aprire /ente/downloaddocumenti con mock lista (25 documenti, 10 per pagina)
    const l = await openPage(page);

    // expect: Heading 'Download documenti' visibile
    await expect(l.title).toBeVisible();
    // expect: Menu laterale con voce 'Download documenti' evidenziata
    await expect(page.getByRole("navigation").getByRole("button", { name: "Download documenti", exact: true })).toHaveClass(/Mui-selected/);
    // expect: Modale 'Loading...' chiuso a caricamento terminato
    await expect(l.loading).toBeHidden();
    // expect: POST /api/notifiche/richiesta?page=1&pageSize=10 chiamata subito con body di default
    expect(lista).toHaveLength(1);
    expect(lista[0].query).toMatchObject({ page: "1", pageSize: "10" });
    expect(lista[0].body).toEqual({ init: null, end: null, ordinamento: 1 });
    // expect: Griglia con 10 righe e paginatore '1-10 of 25'
    await expect(l.rows).toHaveCount(10);
    await expect(l.paginationLabel).toHaveText("1–10 of 25");
    // expect: 'Filtra' visibile, 'Annulla filtri' assente
    await expect(l.filtra).toBeVisible();
    await expect(l.annulla).toHaveCount(0);

    // 2. Verificare i campi data
    // expect: Campi 'Data inizio' e 'Data fine' visibili, abilitati e vuoti
    for (const campo of [l.dataInizio, l.dataFine]) {
      await expect(campo).toBeVisible();
      await expect(campo).toBeEnabled();
      await expect(campo).toHaveValue(VUOTO);
    }
  });

  test("Dati di fatturazione mancanti: ModalRedirect", async ({ page, context }) => {
    const { lista } = await mockAll(page);
    const l = locators(page);

    // 1. Impostare mainState.datiFatturazione=false in globalStatePF e aprire la pagina
    await seedSession(page, { mainState: { datiFatturazione: false } });
    await page.goto(ROUTE);

    // expect: ModalRedirect con il testo sui dati di fatturazione
    await expect(l.redirectModal).toBeVisible();
    // expect: Nessuna chiamata a POST /api/notifiche/richiesta (differenza rispetto a Notifiche)
    await expect(l.loading).toBeHidden();
    expect(lista).toHaveLength(0);
    // expect: Griglia vuota con 'Non sono presenti documenti'
    await expect(l.empty).toBeVisible();
    await expect(l.rows).toHaveCount(0, { timeout: 1000 });

    // 2. Ripetere con datiFatturazioneNotCompleted=true
    const page2 = await context.newPage();
    const mock2 = await mockAll(page2);
    const l2 = locators(page2);
    await seedSession(page2, { mainState: { datiFatturazione: true, datiFatturazioneNotCompleted: true } }, "not-completed");
    await page2.goto(ROUTE);

    // expect: Stesso modale e stessa assenza di chiamata alla lista
    await expect(l2.redirectModal).toBeVisible();
    await expect(l2.loading).toBeHidden();
    expect(mock2.lista).toHaveLength(0);
    await expect(l2.empty).toBeVisible();
  });

  test("Token scaduto 401 sulla lista", async ({ page }) => {
    // 1. Mockare POST /api/notifiche/richiesta con 401 e aprire la pagina
    await mockLista(page, undefined, 401);
    await page.goto(ROUTE);

    // expect: manageError mostra 'Utente non autenticato. Effettuare nuovamente l'accesso'
    await expect(page.getByText(ERRORE_401)).toBeVisible();
    // expect: Redirect a Selfcare dopo l'alert
    await expect(page).toHaveURL(SELFCARE_URL, { timeout: 10000 });
  });

  test("Contatore messaggi dell'header", async ({ page }) => {
    const countCalls: string[] = [];
    page.on("request", (r) => {
      if (new URL(r.url()).pathname.endsWith(API.count)) countCalls.push(r.method());
    });
    await mockAll(page);

    // 1. Aprire la pagina con il default di fixtures.ts (richiesta/count = 0)
    const l = await openPage(page);
    await expect(l.loading).toBeHidden();

    // expect: GET richiesta/count chiamata dall'header
    await expect.poll(() => countCalls.length).toBeGreaterThan(0);
    expect(countCalls[0]).toBe("GET");
    // expect: nessun errore (contatore a 0 dal default di fixtures)
    await expect(page.getByText(ERRORE_500)).toHaveCount(0);
    await expect(page.getByText(ERRORE_401)).toHaveCount(0);
    await expect(l.title).toBeVisible();
  });
});
