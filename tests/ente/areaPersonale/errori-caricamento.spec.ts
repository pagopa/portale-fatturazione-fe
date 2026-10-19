// spec: specs/areaPersonaleUtenteEnte.md
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect, SELFCARE_URL } from "../../fixtures";
import {
  ERRORE_401, ERRORE_500, ROUTE, abort, error, locators, mockAreaPersonale,
} from "../../utils/areaPersonaleMock/areaPersonaleMock";

// Testi i18n (src/i18n.js, errori.*) mostrati dall'alert del layout (BasicAlerts) via manageError
const ERRORE_409 = "L'operazione non è andata a buon fine";
const ERRORE_400 = "L'operazione non è andata a buon fine. Contattare l'assistenza";
const ERRORE_419 = "Sessione scaduta. Effettuare nuovamente l'accesso";
const ERRORE_RETE = "La connessione Internet risulta non attiva";

const alertErrore = (page: Page, testo: string) =>
  page.getByRole("alert").filter({ hasText: new RegExp(`^${testo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) });

// Con 401/403/419 l'alert rimuove globalStatePF e fa redirect a Selfcare (mockato dalla fixture):
// questo init script ripristina la sessione salvata al successivo caricamento di localhost.
async function ripristinaSessioneDopoLogout(page: Page) {
  await page.goto(ROUTE);
  const raw = await page.evaluate(() => localStorage.getItem("globalStatePF"));
  await page.addInitScript((r) => {
    if (location.origin === "http://localhost:3000" && r && !localStorage.getItem("globalStatePF")) {
      localStorage.setItem("globalStatePF", r);
    }
  }, raw);
}

// Form di default dopo l'errore: nessun crash, skeleton rimosso
async function verificaFormSenzaCrash(page: Page) {
  const l = locators(page);
  await expect(l.cup).toBeVisible();
  await expect(l.cup).toHaveValue("");
  await expect(l.pec).toHaveValue("");
  await expect(l.codiceSdi).toBeVisible();
}

test.describe("Errori sul caricamento", () => {
  test("GET dati fatturazione 500", async ({ page }) => {
    const api = await mockAreaPersonale(page, { get: error(500) });

    // 1. Mockare GET datifatturazione/ente con 500 e aprire la pagina
    await page.goto(ROUTE);
    await expect.poll(() => api.get.calls).toBe(1);

    // expect: Alert di errore 500
    await expect(alertErrore(page, ERRORE_500)).toBeVisible();
    // expect: Lo skeleton viene rimosso e viene mostrato il form di default (vuoto) senza crash
    await verificaFormSenzaCrash(page);
    // expect: Nessuna chiamata a contractCodiceSDI
    expect(api.sdi.calls).toBe(0);
  });

  test("GET dati fatturazione 401/403/419/409", async ({ page }) => {
    // 5 caricamenti, di cui 3 con alert di 3,5s prima del redirect
    test.setTimeout(90_000);
    const api = await mockAreaPersonale(page, { get: error(409) });

    // 1. Per ciascuno status verificare il testo di manageError (401/403/419 per ultimi: fanno logout + redirect a Selfcare)
    const casi: { status: number; testo: string; logout: boolean }[] = [
      { status: 409, testo: ERRORE_409, logout: false },
      { status: 400, testo: ERRORE_400, logout: false },
      { status: 419, testo: ERRORE_419, logout: true },
      { status: 403, testo: ERRORE_401, logout: true },
      { status: 401, testo: ERRORE_401, logout: true },
    ];
    await ripristinaSessioneDopoLogout(page);

    for (const { status, testo, logout } of casi) {
      await test.step(`status ${status}`, async () => {
        api.get.reply(error(status));
        api.get.calls = 0;
        api.sdi.calls = 0;
        await page.goto(ROUTE);
        await expect.poll(() => api.get.calls).toBeGreaterThanOrEqual(1);

        // expect: Il testo dell'errore del layout corrisponde allo status (manageError)
        await expect(alertErrore(page, testo)).toBeVisible();
        // expect: La pagina non va in crash
        await verificaFormSenzaCrash(page);
        // expect: Nessuna chiamata a contractCodiceSDI
        expect(api.sdi.calls).toBe(0);

        if (logout) {
          // expect: redirect a Selfcare (mockato, nessun sito esterno reale)
          await expect(page).toHaveURL(SELFCARE_URL, { timeout: 10_000 });
        }
      });
    }
  });

  test("Errore di rete (Network Error)", async ({ page }) => {
    const api = await mockAreaPersonale(page, { get: abort() });

    // 1. Abortire la richiesta GET datifatturazione/ente (route.abort)
    await page.goto(ROUTE);
    await expect.poll(() => api.get.calls).toBe(1);

    // expect: manageError('Network Error') -> alert 'La connessione Internet risulta non attiva'
    await expect(alertErrore(page, ERRORE_RETE)).toBeVisible();
    // expect: Skeleton rimosso, nessun crash
    await verificaFormSenzaCrash(page);
    expect(api.sdi.calls).toBe(0);
  });
});
