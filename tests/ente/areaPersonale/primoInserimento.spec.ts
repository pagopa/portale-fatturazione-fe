// spec: specs/areaPersonaleUtenteEnte.md
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  ERRORE_500, ROUTE, error, locators, mainStatePersistito, mockAreaPersonale, notFound, ok,
} from "../../utils/areaPersonaleMock/areaPersonaleMock";

const INSERISCI = "Inserisci i dati di fatturazione";

// Helper locali (non presenti nel mock condiviso)
function extra(page: Page) {
  return {
    dataDocumento: page.getByLabel("Data documento"),
    splitSi: page.getByRole("radio", { name: "Si", exact: true }),
    splitNo: page.getByRole("radio", { name: "No", exact: true }),
    notaLegale: page.getByRole("checkbox", { name: /Gli accordi di adesione a SEND/ }),
    attenzione: page.getByText("Attenzione!"),
    erroreGenerico: page.getByText(ERRORE_500),
  };
}

async function apriPrimoInserimento(page: Page, sdi = ok({ contractCodiceSDI: "SDI0001" })) {
  const api = await mockAreaPersonale(page, { get: notFound(), sdi });
  await page.goto(ROUTE);
  const l = locators(page);
  return { api, l, x: extra(page) };
}

test.describe("Nessun dato di fatturazione - GET 404", () => {
  test("404 sulla GET: fallback su contractCodiceSDI e form vuoto mutable", async ({ page }) => {
    // 1. Mockare GET /api/datifatturazione/ente con 404 e GET contractCodiceSDI con { contractCodiceSDI: 'SDI0001' }; aprire la pagina
    const { api, l, x } = await apriPrimoInserimento(page);

    await expect(l.heading(INSERISCI)).toBeVisible();
    expect(api.get.calls).toBe(1);
    await expect.poll(() => api.sdi.calls).toBe(1);
    await expect.poll(async () => (await mainStatePersistito(page))?.statusPageDatiFatturazione).toBe("mutable");
    expect((await mainStatePersistito(page)).datiFatturazione).toBe(false);
    await expect(l.codiceSdi).toHaveValue("SDI0001");
    for (const campo of [l.cup, l.pec, l.idDocumento, l.codCommessa, x.dataDocumento]) {
      await expect(campo).toHaveValue("");
    }
    await expect(l.modifica).toHaveCount(0);
    // un solo 'Indietro' (quello in fondo): il link in header richiede datiFatturazione true
    await expect(l.indietro).toHaveCount(1);
    await expect(l.indietro).toBeVisible();
    await expect(l.indietro).toBeDisabled();
    await expect(l.salva).toBeVisible();
    await expect(l.salva).toBeDisabled();
    await expect(x.erroreGenerico).toHaveCount(0);
  });

  test("404: nessuna tipologia selezionata, campi disabilitati e bordo di errore", async ({ page }) => {
    // 1. Aprire la pagina nel caso 3.1
    const { l, x } = await apriPrimoInserimento(page);
    await expect(l.heading(INSERISCI)).toBeVisible();
    await expect(l.codiceSdi).toHaveValue("SDI0001");

    await expect(l.radioOrdine).not.toBeChecked();
    await expect(l.radioContratto).not.toBeChecked();
    const campi = [l.cup, l.pec, l.idDocumento, l.codCommessa, l.codiceSdi, x.dataDocumento, x.splitSi, x.splitNo,
      l.emailAmministrativo, l.aggiungiEmail, x.notaLegale];
    for (const campo of campi) await expect(campo).toBeDisabled();
    // bordo rosso della tipologia: solo stile, senza ruolo/testid (bug #5) -> non verificabile

    // 2. Selezionare la radio "Dati ordine d'acquisto"
    await l.radioOrdine.check();

    await expect(l.radioOrdine).toBeChecked();
    for (const campo of [l.cup, l.pec, l.idDocumento, l.codCommessa, l.codiceSdi, x.dataDocumento, x.splitSi, x.splitNo,
      l.emailAmministrativo, x.notaLegale]) {
      await expect(campo).toBeEnabled();
    }
    await expect(l.salva).toBeDisabled();
  });

  test("404 e fallimento della chiamata contractCodiceSDI", async ({ page }) => {
    // Bug #3 (Possibili bug): il catch di getSdi non porta lo stato a mutable, il form resta inutilizzabile.
    test.fail();

    // 1. Mockare GET dati fatturazione 404 e GET contractCodiceSDI 500
    const { api, l, x } = await apriPrimoInserimento(page, error(500));

    await expect(x.erroreGenerico.first()).toBeVisible();
    await expect.poll(() => api.sdi.calls).toBe(1);
    // caricamento terminato: form visibile, nessun crash
    await expect(l.cup).toBeVisible();
    // comportamento atteso: form comunque editabile (vuoto) in primo inserimento
    await expect(l.heading(INSERISCI)).toBeVisible();
    await expect(l.salva).toBeVisible();
  });

  test("404 con contractCodiceSDI assente nella risposta", async ({ page }) => {
    // 1. Mockare contractCodiceSDI con body {} (campo mancante)
    const { api, l, x } = await apriPrimoInserimento(page, ok({}));

    await expect(l.heading(INSERISCI)).toBeVisible();
    await expect.poll(() => api.sdi.calls).toBe(1);
    await expect(l.codiceSdi).toHaveValue("");
    await expect(l.salva).toBeDisabled();
    await expect(x.erroreGenerico).toHaveCount(0);
  });

  test("Indietro (header) assente e Indietro (fondo) disabilitato", async ({ page }) => {
    // 1. Aprire la pagina nel caso 3.1 e tentare di cliccare 'Indietro' in fondo
    const { l, x } = await apriPrimoInserimento(page);
    await expect(l.heading(INSERISCI)).toBeVisible();

    await expect(l.indietro).toHaveCount(1);
    await expect(l.indietro).toBeDisabled();
    await l.indietro.click({ force: true });
    await expect(x.attenzione).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`${ROUTE}$`));
  });
});
