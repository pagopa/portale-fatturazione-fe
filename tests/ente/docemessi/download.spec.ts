// spec: specs/ente-docemessi.md (sezione 5)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import {
  ERRORE_500, FATTURE_PERIODO, makeFatture, mockAll, mockDownloadContestate, mockDownloadEmessi, openPage, RAGIONE_SOCIALE, selectOption,
} from "../../utils/docemessi/docEmessiMock";

const PREFIX = `Documenti emessi_${RAGIONE_SOCIALE}`;

test.describe("Download", () => {
  test("Download risultati senza filtri", async ({ page }) => {
    await mockAll(page);
    const bodies = await mockDownloadEmessi(page);
    const l = await openPage(page);

    // 1. Con dati in griglia cliccare 'Download risultati'
    const downloadPromise = page.waitForEvent("download");
    await l.download.click();

    // expect: Modale 'Downloading...' compare e scompare
    await expect(page.getByText("Downloading...")).toBeVisible();
    const download = await downloadPromise;
    await expect(page.getByText("Downloading...")).toBeHidden();
    // expect: Nome file 'Documenti emessi_<Ragione sociale>.xlsx'
    expect(download.suggestedFilename()).toBe(`${PREFIX}.xlsx`);
    // expect: Il body usa anno/mese 9999 (inviati come null dal client)
    expect(bodies[0]).toEqual({ anno: null, mese: null, tipologiaFattura: [], dataFattura: [] });
  });

  test("Nome file con anno e con anno+mese", async ({ page }) => {
    await mockAll(page);
    await mockDownloadEmessi(page);
    const l = await openPage(page);

    // 1. Filtrare per Anno 2023 e scaricare
    await selectOption(page, l.anno, "2023");
    await l.filtra.click();
    let downloadPromise = page.waitForEvent("download");
    await l.download.click();

    // expect: Nome file '...<RS>_2023.xlsx'
    expect((await downloadPromise).suggestedFilename()).toBe(`${PREFIX}_2023.xlsx`);

    // 2. Filtrare per Anno 2024 + Gennaio e scaricare
    await selectOption(page, l.anno, "2024");
    await selectOption(page, l.mese, "Gennaio");
    await l.filtra.click();
    downloadPromise = page.waitForEvent("download");
    await l.download.click();

    // expect: Nome file '...<RS>_Gennaio_2024.xlsx'
    expect((await downloadPromise).suggestedFilename()).toBe(`${PREFIX}_Gennaio_2024.xlsx`);
  });

  test("Download usa i filtri applicati e non quelli solo selezionati", async ({ page }) => {
    await mockAll(page);
    const bodies = await mockDownloadEmessi(page);
    const l = await openPage(page);

    // 1. Applicare Filtra con Anno 2025, poi cambiare Anno a 2024 senza Filtra
    await selectOption(page, l.anno, "2025");
    await l.filtra.click();
    await expect(l.download).toBeEnabled();
    await selectOption(page, l.anno, "2024");

    // expect: 'Download risultati' disabilitato (griglia svuotata dal cambio filtro)
    await expect(l.download).toBeDisabled();

    // 2. Cliccare Filtra e scaricare
    await l.filtra.click();
    const downloadPromise = page.waitForEvent("download");
    await l.download.click();

    // expect: Il file si riferisce al 2024
    expect((await downloadPromise).suggestedFilename()).toBe(`${PREFIX}_2024.xlsx`);
    expect(bodies.at(-1)).toMatchObject({ anno: 2024, mese: null });
  });

  test("Pulsante download disabilitato con griglia vuota", async ({ page }) => {
    // 1. Mockare lista emesse con dettagli [] e aprire la pagina
    await mockAll(page, []);
    const l = await openPage(page);

    // expect: 'Download risultati' disabilitato, messaggio 'Non sono presenti fatture emesse'
    await expect(l.download).toBeDisabled();
    await expect(l.empty).toBeVisible();
  });

  // BUG APP: downloadFattureEmesseEnte (src/api/apiSelfcare/documentiSospesiSE/api.ts) usa fetch, che non
  // rigetta su HTTP 500: docConEme.tsx salva comunque il body di errore come .xlsx e manageError non viene chiamato.
  // Atteso dalla spec 5.5: errore mostrato e nessun file scaricato. Asserzioni invariate.
  test.fixme("Errore API di download", async ({ page }) => {
    await mockAll(page);
    // 1. Mockare l'endpoint di download con 500 e cliccare Download
    await mockDownloadEmessi(page, 500);
    const l = await openPage(page);
    let downloaded = false;
    page.on("download", () => { downloaded = true; });
    await l.download.click();

    // expect: Modale 'Downloading...' si chiude
    await expect(page.getByText("Downloading...")).toBeHidden();
    // expect: Viene mostrato l'errore tramite manageError, nessun file scaricato
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    expect(downloaded).toBe(false);
  });

  test("Download fatture contestate", async ({ page }) => {
    // 1. Mockare 'eliminate' con almeno una fattura e cliccare 'Download risultati contestate'
    await mockAll(page, FATTURE_PERIODO, makeFatture(1));
    const bodies = await mockDownloadContestate(page);
    const l = await openPage(page);
    const downloadPromise = page.waitForEvent("download");
    await l.downloadContestate.click();

    // expect: File 'Documenti contestati_<RS>.xlsx' scaricato
    expect((await downloadPromise).suggestedFilename()).toBe(`Documenti contestati_${RAGIONE_SOCIALE}.xlsx`);
    // expect: Il body ha anno/mese null e array vuoti (non dipende dai filtri)
    expect(bodies[0]).toEqual({ anno: null, mese: null, tipologiaFattura: [], dataFattura: [] });

    // 2. Con contestate vuote verificare il pulsante
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await mockAll(page, FATTURE_PERIODO, []);
    await openPage(page);

    // expect: 'Download risultati contestate' disabilitato
    await expect(l.downloadContestate).toBeDisabled();
  });
});
