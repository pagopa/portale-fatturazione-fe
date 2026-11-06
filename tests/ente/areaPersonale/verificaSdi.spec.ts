// spec: specs/areaPersonaleUtenteEnte.md
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  AreaPersonaleApi, AreaPersonaleOptions, ROUTE, createGate, delayed, error, locators, mockAreaPersonale, notFound, ok, openPage,
} from "../../utils/areaPersonaleMock/areaPersonaleMock";

// Helper locale: apre la pagina, entra in modifica e attende la verifica SDI "di primo render"
// (al passaggio a mutable il campo SDI valida il valore esistente con una POST a codiceSDI).
async function apriInModifica(page: Page, opts: AreaPersonaleOptions = {}) {
  const api = await mockAreaPersonale(page, opts);
  const l = await openPage(page);
  await l.modifica.click();
  await expect(l.heading("Modifica dati di fatturazione")).toBeVisible();
  await expect.poll(() => api.verificaSdi.calls).toBe(1);
  await expect(l.salva).toBeEnabled();
  return { api, l, baseline: api.verificaSdi.calls };
}

const modaleVerifica = (page: Page) => page.getByRole("heading", { name: "Verifica del codice SDI in corso" });
const modaleInfo = (page: Page) => page.getByRole("heading", { name: "Attenzione!" });
const ultimoBody = (api: AreaPersonaleApi) => api.verificaSdi.bodies[api.verificaSdi.bodies.length - 1];

test.describe("Verifica codice SDI", () => {
  test("Verifica SDI con esito positivo", async ({ page }) => {
    const { api, l, baseline } = await apriInModifica(page);
    const gate = createGate();
    api.verificaSdi.reply(delayed(ok(), gate));

    // 1. In modifica mockare POST /api/datifatturazione/codiceSDI con ritardo controllato, scrivere 'ABC1234' in 'Codice univoco o SDI'
    await l.codiceSdi.fill("");
    await l.codiceSdi.fill("ABC1234");
    // expect: Subito dopo la digitazione 'Salva' diventa disabilitato
    await expect(l.salva).toBeDisabled();
    // expect: Dopo il debounce compare il modale di verifica
    await expect(modaleVerifica(page)).toBeVisible();
    await expect(page.getByText("Attendere la fine del processo")).toBeVisible();
    // expect: La POST ha body { codiceSDI: 'ABC1234' }
    await expect.poll(() => api.verificaSdi.calls).toBe(baseline + 1);
    expect(ultimoBody(api)).toEqual({ codiceSDI: "ABC1234" });

    // 2. Rilasciare la risposta 200
    gate.release();
    // expect: Il modale si chiude
    await expect(modaleVerifica(page)).toHaveCount(0);
    // expect: Il campo non e' in errore e 'Salva' torna abilitato
    await expect(l.codiceSdi).toHaveAttribute("aria-invalid", "false");
    await expect(l.salva).toBeEnabled();
  });

  test("Verifica SDI con esito negativo", async ({ page }) => {
    const { api, l, baseline } = await apriInModifica(page);
    api.verificaSdi.reply(error(400, { detail: "Codice SDI non valido" }));

    // 1. Mockare POST codiceSDI con 400 { detail: 'Codice SDI non valido' } e scrivere un nuovo SDI
    await l.codiceSdi.fill("XYZ9876");
    await expect.poll(() => api.verificaSdi.calls).toBe(baseline + 1);
    // expect: Il modale 'Verifica...' si chiude
    await expect(modaleVerifica(page)).toHaveCount(0);
    // expect: Si apre ModalInfo con heading 'Attenzione!' e testo 'Codice SDI non valido'
    await expect(modaleInfo(page)).toBeVisible();
    await expect(page.getByText("Codice SDI non valido")).toBeVisible();
    // expect: Campo SDI in errore e 'Salva' disabilitato
    // (con un modale MUI aperto lo sfondo e' aria-hidden: 'Salva' si verifica dopo la chiusura, al passo 2)
    await expect(l.codiceSdi).toHaveAttribute("aria-invalid", "true");

    // 2. Chiudere il ModalInfo (Escape)
    await page.keyboard.press("Escape");
    // expect: Il modale si chiude e il campo resta in errore
    await expect(modaleInfo(page)).toHaveCount(0);
    await expect(l.codiceSdi).toHaveAttribute("aria-invalid", "true");
    await expect(l.salva).toBeDisabled();
  });

  test("Debounce: digitazioni rapide generano una sola POST", async ({ page }) => {
    const { api, l, baseline } = await apriInModifica(page);

    // 1. Digitare lentamente 'A','B','C' con intervalli < 1500 ms
    await l.codiceSdi.clear();
    await l.codiceSdi.pressSequentially("ABC", { delay: 800 });
    // expect: Una sola POST a codiceSDI con il valore finale 'ABC'
    await expect.poll(() => api.verificaSdi.calls).toBe(baseline + 1);
    expect(ultimoBody(api)).toEqual({ codiceSDI: "ABC" });
    await expect(modaleVerifica(page)).toHaveCount(0);
    // nessuna POST ulteriore dopo l'ultima digitazione
    await expect(l.salva).toBeEnabled();
    expect(api.verificaSdi.calls).toBe(baseline + 1);
  });

  test("Digitazione SDI con tipologia non selezionata", async ({ page }) => {
    const api = await mockAreaPersonale(page, { get: notFound(), sdi: ok({ contractCodiceSDI: "SDI0001" }) });
    const l = locators(page);

    // 1. Nel caso 404 senza tipoCommessa tentare di scrivere nel campo SDI
    await page.goto(ROUTE);
    await expect(l.heading("Inserisci i dati di fatturazione")).toBeVisible();
    await expect(l.codiceSdi).toHaveValue("SDI0001");
    const baseline = api.verificaSdi.calls;
    // expect: Il campo e' disabilitato, nessuna POST
    await expect(l.codiceSdi).toBeDisabled();
    await expect(l.codiceSdi).not.toBeEditable();
    await expect(modaleVerifica(page)).toHaveCount(0);
    expect(api.verificaSdi.calls).toBe(baseline);
  });

  test("Errore 500 sulla verifica SDI", async ({ page }) => {
    const { api, l, baseline } = await apriInModifica(page);
    api.verificaSdi.reply(error(500, {}));

    // 1. Mockare POST codiceSDI con 500 e body {} e scrivere un SDI
    await l.codiceSdi.fill("ERR5000");
    await expect.poll(() => api.verificaSdi.calls).toBe(baseline + 1);
    // expect: si apre comunque ModalInfo (frase vuota) senza crash
    await expect(modaleVerifica(page)).toHaveCount(0);
    await expect(modaleInfo(page)).toBeVisible();
    await expect(l.codiceSdi).toHaveAttribute("aria-invalid", "true");
    await page.keyboard.press("Escape");
    await expect(modaleInfo(page)).toHaveCount(0);
    await expect(l.salva).toBeDisabled();
    await expect(l.heading("Modifica dati di fatturazione")).toBeVisible();
  });
});
