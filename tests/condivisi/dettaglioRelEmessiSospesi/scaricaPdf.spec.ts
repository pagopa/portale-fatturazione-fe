// spec: specs/dettaglioRelEmessiSospesi.md (sezione 6)
// seed: tests/auth.setup.ts

import type { Page, Route } from "@playwright/test";
import { test, expect, SELFCARE_URL } from "../../fixtures";
import {
  makeRel, mockDettaglio, mockPdf, detailUrl, locators, openDettaglio, RAGIONE_SOCIALE, type Section,
} from "../../utils/dettaglioRelEmessiSospesi/dettaglioMock";

const PDF_SECTIONS = ["documentiemessi", "documentisospesi"] as const satisfies readonly Section[];
const CON_PDF = ["PRIMO SALDO", "SECONDO SALDO"];
const SENZA_PDF = ["VAR. SEMESTRALE", "SEM. SOSPESI", "ACCONTO", "ANTICIPO"];

// Conta i download avviati dal browser
function trackDownloads(page: Page) {
  const files: string[] = [];
  page.on("download", (d) => files.push(d.suggestedFilename()));
  return files;
}

test.describe("Scarica PDF (REL, Doc. Emessi, Doc. Sospesi)", () => {
  test("Doc. Emessi/Sospesi: pulsante PDF solo per PRIMO e SECONDO SALDO", async ({ page }) => {
    for (const section of PDF_SECTIONS) {
      // 1. EMESSI e SOSPESI con PRIMO SALDO e SECONDO SALDO
      for (const tipologiaFattura of CON_PDF) {
        const { l } = await openDettaglio(page, section, makeRel({ tipologiaFattura }));

        // expect: pulsante 'Scarica PDF Doc. ...' visibile (SOSPESI larghezza 274px)
        await expect(l.downloadPdf(section)).toBeVisible();
        await expect(l.downloadPdf(section)).toHaveCSS("width", "274px");
      }

      // 2. EMESSI e SOSPESI con VAR. SEMESTRALE, SEM. SOSPESI, ACCONTO, ANTICIPO
      for (const tipologiaFattura of SENZA_PDF) {
        const { l } = await openDettaglio(page, section, makeRel({ tipologiaFattura }));

        // expect: nessun pulsante 'Scarica PDF ...', nessun upload e nessun 'Scarica PDF Firmato'
        await expect(l.downloadPdf(section)).toHaveCount(0);
        await expect(page.getByRole("button", { name: /Scarica PDF/ })).toHaveCount(0);
        await expect(l.uploadInput).toHaveCount(0);
        await expect(l.downloadFirmato).toHaveCount(0);
      }
    }
  });

  test("Download PDF Doc. Emessi", async ({ page }) => {
    const files = trackDownloads(page);
    const { l } = await openDettaglio(page, "documentiemessi", makeRel());
    const pdf = await mockPdf(page, "documentiemessi", "123", { body: "<h1>Fattura</h1>" });

    // 1. Mock GET download con HTML e ritardo; cliccare 'Scarica PDF Doc. Emessi'
    const downloadPromise = page.waitForEvent("download");
    await l.downloadPdf("documentiemessi").click();

    // expect: Compare 'Downloading...'
    await expect(l.downloading).toBeVisible();

    // expect: GET con id = idfattura dell'URL
    const download = await downloadPromise;
    expect(pdf.calls).toBe(1);
    expect(new URL(pdf.requests[0].url).pathname).toMatch(/\/download\/123$/);

    // expect: Evento download con filename 'Documenti Emessi/<ragioneSociale>/<Mese 2 cifre>/<anno>.pdf' ('/' sostituiti dal browser)
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.pdf$/);
    expect(filename).toContain("Documenti Emessi");
    expect(filename).toContain(RAGIONE_SOCIALE);
    expect(filename).toContain("03");
    expect(filename).toContain("2024");
    expect(files).toHaveLength(1);

    // expect: ModalLoading chiuso a fine generazione
    await expect(l.downloading).toBeHidden();
  });

  test("Download PDF Doc. Sospesi", async ({ page }) => {
    const files = trackDownloads(page);
    const { l } = await openDettaglio(page, "documentisospesi", makeRel());
    const pdf = await mockPdf(page, "documentisospesi", "123", { body: "<h1>Fattura</h1>" });

    // 1. Mock GET download sospese; cliccare 'Scarica PDF Doc. Sospesi'
    const downloadPromise = page.waitForEvent("download");
    await l.downloadPdf("documentisospesi").click();

    // expect: Stesso comportamento di 6.2 con prefisso 'Documenti Sospesi'
    await expect(l.downloading).toBeVisible();
    const download = await downloadPromise;
    expect(pdf.calls).toBe(1);
    expect(new URL(pdf.requests[0].url).pathname).toMatch(/\/sospese\/dettaglio\/download\/123$/);
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.pdf$/);
    expect(filename).toContain("Documenti Sospesi");
    expect(filename).toContain(RAGIONE_SOCIALE);
    expect(filename).toContain("03");
    expect(filename).toContain("2024");
    expect(files).toHaveLength(1);
    await expect(l.downloading).toBeHidden();
  });

  test("Errore sul download PDF (404, 500, 401, rete)", async ({ page }) => {
    const files = trackDownloads(page);
    const { l } = await openDettaglio(page, "documentiemessi", makeRel());
    const pdf = await mockPdf(page, "documentiemessi", "123", { delayMs: 0 });
    const button = l.downloadPdf("documentiemessi");

    // 1. Mockare il download con 404, 500 e abort, poi 401 per ultimo
    for (const status of [404, 500]) {
      await test.step(`status ${status}`, async () => {
        pdf.status = status;
        const before = pdf.calls;
        await button.click();
        await expect.poll(() => pdf.calls).toBe(before + 1);

        // expect: ModalLoading chiuso, nessun download avviato, pulsante riutilizzabile
        await expect(l.downloading).toBeHidden();
        await expect(button).toBeEnabled();
        expect(files).toHaveLength(0);
      });
    }

    await test.step("errore di rete", async () => {
      const before = pdf.calls;
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      // matcher e handler devono essere gli stessi oggetti usati in unroute, altrimenti l'abort resta attivo
      const isPdfUrl = (url: URL) => url.pathname.endsWith("/dettaglio/download/123");
      const abortRoute = (route: Route) => route.abort();
      await page.route(isPdfUrl, abortRoute);
      await button.click();

      // expect: nessun crash, modale chiuso, nessun download
      await expect(l.downloading).toBeHidden();
      await expect(button).toBeEnabled();
      await expect(l.card("Dati di Fatturazione")).toBeVisible();
      expect(pdf.calls).toBe(before);
      expect(files).toHaveLength(0);
      expect(errors).toEqual([]);
      await page.unroute(isPdfUrl, abortRoute);
    });

    await test.step("il pulsante resta riutilizzabile", async () => {
      pdf.status = 200;
      const downloadPromise = page.waitForEvent("download");
      await button.click();
      await downloadPromise;
      await expect(l.downloading).toBeHidden();
    });

    await test.step("status 401", async () => {
      pdf.status = 401;
      await button.click();

      // expect: modale chiuso, nessun nuovo download, sessione terminata con redirect a Selfcare
      await expect(page).toHaveURL(SELFCARE_URL, { timeout: 10000 });
      expect(files).toHaveLength(1);
    });
  });

  test("Download PDF con risposta vuota", async ({ page }) => {
    const { l } = await openDettaglio(page, "documentiemessi", makeRel());
    const pdf = await mockPdf(page, "documentiemessi", "123", { body: "" });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    // 1. Mock con body vuoto (200)
    await l.downloadPdf("documentiemessi").click();
    await expect.poll(() => pdf.calls).toBe(1);

    // expect: il ModalLoading 'Downloading...' non resta bloccato e la pagina resta utilizzabile (bug 11)
    await expect(l.downloading).toBeHidden();
    await expect(l.downloadPdf("documentiemessi")).toBeEnabled();
    await expect(l.card("Dati di Fatturazione")).toBeVisible();
  });

  test("Nome file con mese fuori range", async ({ page }) => {
    // bug 11: il nome file contiene 'undefined' al posto del mese (mesiWithZero[mese-1]); atteso un nome valido
    test.fail();
    const rel = makeRel({ mese: 13 });
    await mockDettaglio(page, "documentiemessi", rel);
    await mockPdf(page, "documentiemessi", "123", { delayMs: 0 });
    await page.goto(detailUrl("documentiemessi"));
    const l = locators(page);
    await expect(l.card("Dati di Fatturazione")).toBeVisible();

    // 1. Mock mese '13' e scarica PDF
    const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
    await l.downloadPdf("documentiemessi").click();
    const download = await downloadPromise;

    // expect: il nome file non contiene 'undefined'
    expect(download.suggestedFilename()).not.toContain("undefined");
  });
});
