// spec: specs/ente-docsospesi.md (sezione 5)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import { mockAll, mockDownload, openPage, RAGIONE_SOCIALE, selectOption } from "../../utils/docsospesi/docSospesiMock";

const PREFIX = `Documenti sospesi_${RAGIONE_SOCIALE}`;

test.describe("Download", () => {
  test("Download risultati senza filtri", async ({ page }) => {
    await mockAll(page);
    const bodies = await mockDownload(page);
    const l = await openPage(page);

    // 1. Con dati in griglia cliccare 'Download risultati'
    const downloadPromise = page.waitForEvent("download");
    await l.download.click();

    // expect: Modale 'Downloading...' compare e scompare
    await expect(page.getByText("Downloading...")).toBeVisible();
    const download = await downloadPromise;
    await expect(page.getByText("Downloading...")).toBeHidden();
    // expect: File 'Documenti sospesi_Comune di San Mauro Torinese.xlsx'
    expect(download.suggestedFilename()).toBe(`${PREFIX}.xlsx`);
    // expect: Body { anno: null, mese: null, tipologiaFattura: [], dataFattura: [] }
    expect(bodies[0]).toEqual({ anno: null, mese: null, tipologiaFattura: [], dataFattura: [] });
  });

  test("Nome file con anno e con anno+mese", async ({ page }) => {
    await mockAll(page);
    await mockDownload(page);
    const l = await openPage(page);

    // 1. Filtrare per Anno 2023 e scaricare
    await selectOption(page, l.anno, "2023");
    await l.filtra.click();
    let downloadPromise = page.waitForEvent("download");
    await l.download.click();

    // expect: File 'Documenti sospesi_<RS>_2023.xlsx'
    expect((await downloadPromise).suggestedFilename()).toBe(`${PREFIX}_2023.xlsx`);

    // 2. Filtrare per Anno 2024 + Gennaio e scaricare
    await selectOption(page, l.anno, "2024");
    await selectOption(page, l.mese, "Gennaio");
    await l.filtra.click();
    downloadPromise = page.waitForEvent("download");
    await l.download.click();

    // expect: File 'Documenti sospesi_<RS>_Gennaio_2024.xlsx'
    expect((await downloadPromise).suggestedFilename()).toBe(`${PREFIX}_Gennaio_2024.xlsx`);
  });

  test("Download usa i filtri applicati e non quelli solo selezionati", async ({ page }) => {
    await mockAll(page);
    const bodies = await mockDownload(page);
    const l = await openPage(page);

    // 1. Filtrare per Anno 2025, poi cambiare Anno in 2024 senza Filtra
    await selectOption(page, l.anno, "2025");
    await l.filtra.click();
    await expect(l.download).toBeEnabled();
    await selectOption(page, l.anno, "2024");

    // expect: 'Download risultati' disabilitato (griglia svuotata)
    await expect(l.download).toBeDisabled();

    // 2. Cliccare Filtra e scaricare
    await l.filtra.click();
    const downloadPromise = page.waitForEvent("download");
    await l.download.click();

    // expect: Body con anno 2024 e file '..._2024.xlsx'
    expect((await downloadPromise).suggestedFilename()).toBe(`${PREFIX}_2024.xlsx`);
    expect(bodies.at(-1)).toMatchObject({ anno: 2024, mese: null });
  });

  test("Pulsante download disabilitato con griglia vuota", async ({ page }) => {
    // 1. Mockare credito/sospeso con dettagli [] e aprire la pagina
    await mockAll(page, []);
    const l = await openPage(page);

    // expect: 'Download risultati' disabilitato e messaggio 'Non sono presenti fatture sospese'
    await expect(l.download).toBeDisabled();
    await expect(l.empty).toBeVisible();
  });

  // BUG APP: downloadFattureSospeseEnte (src/api/apiSelfcare/documentiSospesiSE/api.ts) usa fetch, che non rigetta
  // su HTTP 500: docContSos.tsx salva il body di errore come .xlsx e manageError non viene chiamato.
  // Atteso dalla spec 5.5: alert di errore e nessun file scaricato. Asserzioni invariate.
  test.fixme("Errore API di download", async ({ page }) => {
    await mockAll(page);
    // 1. Mockare sospese/download con status 500 e cliccare Download
    await mockDownload(page, 500);
    const l = await openPage(page);
    let downloaded = false;
    page.on("download", () => { downloaded = true; });
    await l.download.click();

    // expect: Modale 'Downloading...' si chiude
    await expect(page.getByText("Downloading...")).toBeHidden();
    // expect: Alert di errore manageError e nessun file scaricato
    await expect(page.getByText("L'operazione non è andata a buon fine. Si prega di riprovare")).toBeVisible();
    expect(downloaded).toBe(false);
  });
});
