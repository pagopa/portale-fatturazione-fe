// spec: specs/dettaglioRelEmessiSospesi.md (sezione 8)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import {
  makeRel, mockDownloadFirmato, mockPdf, mockReport, openDettaglio, seedTipoContratto,
} from "../../utils/dettaglioRelEmessiSospesi/dettaglioMock";

// REL con PDF firmato caricato: mostra report, Scarica PDF e Scarica PDF Firmato
const rel = makeRel({ caricata: 1 });

test.describe("Modale Downloading", () => {
  test.beforeEach(async ({ page }) => {
    await seedTipoContratto(page, 2);
  });

  test("Modale Downloading... durante i download", async ({ page }) => {
    const report = await mockReport(page, "rel", rel, { delayMs: 1500 });
    const pdf = await mockPdf(page, "rel", "123", { delayMs: 1500 });
    const firmato = await mockDownloadFirmato(page, "123", { delayMs: 1500 });
    const { l } = await openDettaglio(page, "rel", rel);

    // 1. Per ciascuna azione (report, PDF, PDF firmato) ritardare la risposta
    // Report di dettaglio notifiche
    const downloadReport = page.waitForEvent("download");
    await l.downloadReport("rel").click();
    await expect(l.downloading).toBeVisible();
    // la pagina sottostante non e' cliccabile
    await expect(l.downloadPdf("rel").click({ trial: true, timeout: 1000 })).rejects.toThrow();
    await downloadReport;
    await expect(l.downloading).toBeHidden();
    expect(report.calls).toBe(1);

    // Scarica PDF Reg. Es.
    await l.downloadPdf("rel").first().click();
    await expect(l.downloading).toBeVisible();
    await expect(l.downloadFirmato.click({ trial: true, timeout: 1000 })).rejects.toThrow();
    await expect(l.downloading).toBeHidden();
    expect(pdf.calls).toBe(1);

    // Scarica PDF Firmato
    const downloadFirmato = page.waitForEvent("download");
    await l.downloadFirmato.click();
    await expect(l.downloading).toBeVisible();
    await expect(l.downloadReport("rel").click({ trial: true, timeout: 1000 })).rejects.toThrow();
    await downloadFirmato;
    await expect(l.downloading).toBeHidden();
    expect(firmato.calls).toBe(1);
  });

  test("Chiusura del modale con Escape durante il download", async ({ page }) => {
    const report = await mockReport(page, "rel", rel, { delayMs: 2000 });
    const { l } = await openDettaglio(page, "rel", rel);

    // 1. Premere Escape mentre il modale e' aperto
    const download = page.waitForEvent("download");
    await l.downloadReport("rel").click();
    await expect(l.downloading).toBeVisible();
    await page.keyboard.press("Escape");

    // Comportamento attuale: ModalLoading si chiude con Escape (setOpen(false)) ma il download prosegue
    await expect(l.downloading).toBeHidden();
    await download;
    expect(report.calls).toBe(1);
    await expect(l.downloading).toBeHidden();
  });

  test("Modale non visibile al primo render", async ({ page }) => {
    // 1. Aprire il dettaglio
    const { l } = await openDettaglio(page, "rel", rel);
    await expect(l.downloading).toHaveCount(0);
  });
});
