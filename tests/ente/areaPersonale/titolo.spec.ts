// spec: specs/areaPersonaleUtenteEnte.md (sezione 1)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import {
  DATI_FATTURAZIONE_DEFAULT, ROUTE, createGate, delayed, locators, mainStatePersistito, mockAreaPersonale, notFound, ok, openPage,
  seedSession,
} from "../../utils/areaPersonaleMock/areaPersonaleMock";

test.describe("Titolo e caricamento", () => {
  test("Skeleton durante il caricamento dei dati", async ({ page }) => {
    const gate = createGate();
    const api = await mockAreaPersonale(page, { get: delayed(ok(DATI_FATTURAZIONE_DEFAULT), gate) });
    const l = locators(page);

    // 1. Mockare GET /api/datifatturazione/ente con una promise controllata (risposta ritardata) e aprire /ente/datidifatturazione
    await page.goto(ROUTE);
    await expect.poll(() => api.get.calls).toBe(1);

    // expect: Viene mostrato lo Skeleton (SuspenseDatiFatturazione); il heading 'Dati di fatturazione' NON e' visibile
    // (lo Skeleton non ha ruolo ne' testid: se ne verifica l'effetto, cioe' l'assenza di titolo e form)
    await expect(l.titolo).toHaveCount(0);
    // expect: Nessun campo del form (CUP, PEC, ...) visibile
    await expect(l.cup).toHaveCount(0);
    await expect(l.pec).toHaveCount(0);
    await expect(l.codiceSdi).toHaveCount(0);
    await expect(l.modifica).toHaveCount(0);
    // expect: Nessuna chiamata a contractCodiceSDI
    expect(api.sdi.calls).toBe(0);

    // 2. Rilasciare la risposta (dati completi)
    gate.release();

    // expect: Lo Skeleton scompare e compare il heading 'Dati di fatturazione' con il form valorizzato
    await expect(l.titolo).toBeVisible();
    await expect(l.cup).toHaveValue("CUP123");
    await expect(l.pec).toHaveValue("pec@test.it");
    await expect(l.codiceSdi).toHaveValue("ABC1234");
    expect(api.sdi.calls).toBe(0);
  });

  test("Titolo in modalita' immutable (dati presenti)", async ({ page }) => {
    const api = await mockAreaPersonale(page);

    // 1. Mockare GET dati fatturazione con dati completi (idDocumento e cup valorizzati) e aprire la pagina
    const l = await openPage(page);

    // expect: Heading h4 'Dati di fatturazione' visibile
    await expect(l.titolo).toBeVisible();
    // expect: Pulsante 'Modifica' visibile (profilo ruolo R/W)
    await expect(l.modifica).toBeVisible();
    // expect: Link 'Indietro' (header) assente
    await expect(l.indietro).toHaveCount(0);
    // expect: Pulsanti 'Indietro' e 'Salva' in fondo alla pagina assenti
    await expect(l.salva).toHaveCount(0);
    // expect: Nessun breadcrumb 'Dati di fatturazione /'
    await expect(l.breadcrumb).toHaveCount(0);
    expect(api.get.calls).toBe(1);
    expect((await mainStatePersistito(page)).statusPageDatiFatturazione).toBe("immutable");
  });

  test("Pulsante Modifica assente per ruolo non R/W", async ({ page }) => {
    await seedSession(page, { profilo: { ruolo: "R" } });
    await mockAreaPersonale(page);

    // 1. Impostare il profilo con ruolo diverso da 'R/W' (globalStatePF via addInitScript/storageState) e aprire la pagina con dati completi
    const l = await openPage(page);

    // expect: Heading 'Dati di fatturazione' visibile
    await expect(l.titolo).toBeVisible();
    // expect: Pulsante 'Modifica' assente (profilo.ruolo !== 'R/W')
    await expect(l.modifica).toHaveCount(0);
    // expect: Tutti i campi disabilitati
    for (const campo of [l.cup, l.pec, l.idDocumento, l.codCommessa, l.codiceSdi, l.emailAmministrativo, l.radioOrdine, l.radioContratto]) {
      await expect(campo).toBeDisabled();
    }
  });

  test("Date primo e ultimo accesso", async ({ page }) => {
    await mockAreaPersonale(page);

    // 1. Aprire la pagina con dati presenti (profilo dataPrimo 2025-11-17, dataUltimo 2026-10-14)
    const l = await openPage(page);

    // expect: Label 'Data primo accesso' e 'Data ultimo accesso' visibili
    await expect(l.labelPrimoAccesso).toBeVisible();
    await expect(l.labelUltimoAccesso).toBeVisible();
    // expect: Accanto a ciascuna compare la data formattata da createDateFromString (formato g/m/aaaa senza zeri iniziali)
    await expect(page.getByText("17/11/2025", { exact: true })).toBeVisible();
    await expect(page.getByText("14/10/2026", { exact: true })).toBeVisible();
  });

  test("Date di accesso assenti quando non ci sono dati di fatturazione", async ({ page }) => {
    const api = await mockAreaPersonale(page, { get: notFound(), sdi: ok({ contractCodiceSDI: "SDI0001" }) });
    const l = locators(page);

    // 1. Mockare GET dati fatturazione 404 e GET contractCodiceSDI 200 e aprire la pagina
    await page.goto(ROUTE);
    await expect(l.heading("Inserisci i dati di fatturazione")).toBeVisible();

    // expect: Label 'Data primo accesso' e 'Data ultimo accesso' presenti ma senza valore (mainState.datiFatturazione false)
    await expect(l.labelPrimoAccesso).toBeVisible();
    await expect(l.labelUltimoAccesso).toBeVisible();
    await expect(page.getByText("17/11/2025", { exact: true })).toHaveCount(0);
    await expect(page.getByText("14/10/2026", { exact: true })).toHaveCount(0);
    expect(api.get.calls).toBe(1);
    expect(api.sdi.calls).toBe(1);
  });
});
