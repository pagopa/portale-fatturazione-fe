// spec: specs/dettaglioRelEmessiSospesi.md (sezione 7)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import { ERRORE_401, ERRORE_500 } from "../../utils/ente/docContabiliMock";
import {
  API, detailUrl, locators, makeRel, mockDettaglio, mockDownloadFirmato, mockLogFirmato, mockPdf, mockUpload, seedTipoContratto,
  type MockRel,
} from "../../utils/dettaglioRelEmessiSospesi/dettaglioMock";

const MSG_404 = "La ricerca non ha prodotto risultati";
const LABEL_INSERISCI = "Inserisci PDF Reg. Es. firmato";
const LABEL_REINSERISCI = "Reinserisci nuovo PDF Reg. Es. firmato";
const PDF_FILE = { name: "firmato.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n%%EOF\n") };

// Apre il dettaglio REL (idTipoContratto 2) con i mock minimi; il log firma e' opzionale
async function openRel(page: Page, rel: MockRel = makeRel(), logDate: string | null = "2024-04-10T10:30:00") {
  await seedTipoContratto(page, 2);
  const dettaglio = await mockDettaglio(page, "rel", rel);
  const log = await mockLogFirmato(page, logDate ?? "");
  await page.goto(detailUrl("rel", String(rel.idTestata ?? "123")));
  const l = locators(page);
  await expect(l.card("Dati di Fatturazione")).toBeVisible();
  return { l, dettaglio, log };
}

const modalOk = (page: Page) => page.getByText("Operazione andata a buon fine");

test.describe("Regolare Esecuzione: azioni in fondo alla pagina", () => {
  test("Azioni visibili solo se totale imponibile > 0 e tipologia non semestrale", async ({ page }) => {
    // 1. REL (idTipoContratto 2) PRIMO SALDO con totaleAnalogico 100 e totaleDigitale 0
    const { l, dettaglio } = await openRel(page, makeRel({ totaleAnalogico: 100, totaleDigitale: 0 }));
    await expect(l.downloadPdf("rel")).toBeVisible();
    await expect(page.getByText(LABEL_INSERISCI)).toBeVisible();
    await expect(l.uploadInput).toHaveCount(1);

    // 2. REL con totaleAnalogico 0 e totaleDigitale 0
    dettaglio.body = makeRel({ totaleAnalogico: 0, totaleDigitale: 0 });
    await page.reload();
    await expect(l.card("Dati di Fatturazione")).toBeVisible();
    await expect(l.downloadPdf("rel")).toHaveCount(0);
    await expect(l.uploadInput).toHaveCount(0);
    await expect(page.getByText(LABEL_INSERISCI)).toHaveCount(0);

    // 3. REL con totaleAnalogico 100 e tipologia 'VAR. SEMESTRALE'
    dettaglio.body = makeRel({ totaleAnalogico: 100, tipologiaFattura: "VAR. SEMESTRALE" });
    await page.reload();
    await expect(l.card("Dati di Fatturazione")).toBeVisible();
    await expect(l.downloadPdf("rel")).toHaveCount(0);
    await expect(l.uploadInput).toHaveCount(0);
  });

  test("Azioni visibili per REL con tipologia ACCONTO e ANTICIPO e totale > 0", async ({ page }) => {
    // 5. REL con ACCONTO/ANTICIPO e totale > 0
    const { l, dettaglio } = await openRel(page, makeRel({ tipologiaFattura: "ACCONTO" }));
    await expect(l.downloadPdf("rel")).toBeVisible();
    await expect(l.uploadInput).toHaveCount(1);

    dettaglio.body = makeRel({ tipologiaFattura: "ANTICIPO" });
    await page.reload();
    await expect(l.card("Dati di Fatturazione")).toBeVisible();
    await expect(l.downloadPdf("rel")).toBeVisible();
    await expect(l.uploadInput).toHaveCount(1);
  });

  test("SEM. SOSPESI in REL non mostra le azioni (bug 5)", async ({ page }) => {
    test.fail(true, "Bug 5: il controllo includes('SEMESTRALE') non esclude 'SEM. SOSPESI', le azioni compaiono");

    // 4. REL con tipologia 'SEM. SOSPESI'
    const { l } = await openRel(page, makeRel({ tipologiaFattura: "SEM. SOSPESI" }));
    await expect(l.downloadPdf("rel")).toHaveCount(0);
    await expect(l.uploadInput).toHaveCount(0);
  });

  test("REL con soli importi di acconto mostra le azioni (bug 15)", async ({ page }) => {
    test.fail(true, "Bug 15: le azioni dipendono solo da totaleAnalogico + totaleDigitale, che esclude acconto/anticipo");

    // 5. REL con ACCONTO e solo importi di acconto
    const { l } = await openRel(
      page,
      makeRel({ tipologiaFattura: "ACCONTO", totaleAnalogico: 0, totaleDigitale: 0, accontoAnalogico: 100, accontoDigitale: 200 }),
    );
    await expect(l.downloadPdf("rel")).toBeVisible();
    await expect(l.uploadInput).toHaveCount(1);
  });

  test("Download PDF Regolare Esecuzione", async ({ page }) => {
    // 1. Mock GET /api/rel/ente/download/<id> con HTML e ritardo; cliccare 'Scarica PDF Reg. Es.'
    const { l } = await openRel(page, makeRel({ ragioneSociale: "Comune Test", mese: 3, anno: 2024 }));
    const pdf = await mockPdf(page, "rel");
    const downloadPromise = page.waitForEvent("download");
    await l.downloadPdf("rel").click();

    // expect: 'Downloading...' visibile
    await expect(l.downloading).toBeVisible();

    // expect: Download filename 'Regolare Esecuzione/<ragioneSociale>/<mese>/<anno>.pdf'
    // (Chromium sostituisce i '/' del nome suggerito)
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/Regolare Esecuzione.*Comune Test.*03.*2024\.pdf$/);
    expect(pdf.calls).toBe(1);

    // expect: Modale chiuso a fine operazione
    await expect(l.downloading).toBeHidden();

    // 2. Ripetere con 500 e 404
    const scaricati: string[] = [];
    page.on("download", (d) => scaricati.push(d.suggestedFilename()));
    pdf.status = 500;
    await l.downloadPdf("rel").click();
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    await expect(l.downloading).toBeHidden();

    pdf.status = 404;
    await l.downloadPdf("rel").click();
    await expect(page.getByText(MSG_404)).toBeVisible();
    await expect(l.downloading).toBeHidden();
    expect(pdf.calls).toBe(3);
    expect(scaricati).toHaveLength(0);
  });

  test("SingleFileInput: etichetta in base a rel.caricata", async ({ page }) => {
    // 1. Mock REL con caricata 0
    const { l, dettaglio } = await openRel(page, makeRel({ caricata: 0 }));
    await expect(page.getByText(LABEL_INSERISCI)).toBeVisible();
    await expect(page.getByText(LABEL_REINSERISCI)).toHaveCount(0);
    await expect(l.downloadFirmato).toHaveCount(0);

    // 2. Mock REL con caricata 1
    dettaglio.body = makeRel({ caricata: 1 });
    await page.reload();
    await expect(page.getByText(LABEL_REINSERISCI)).toBeVisible();
    await expect(page.getByText(LABEL_INSERISCI)).toHaveCount(0);
    await expect(l.downloadFirmato).toBeVisible();
  });

  test("Con caricata 2 'Scarica PDF Firmato' e' coerente con l'etichetta Reinserisci (bug 16)", async ({ page }) => {
    test.fail(true, "Bug 16: con caricata 2 la label invita a reinserire ma 'Scarica PDF Firmato' e' assente (visibile solo con caricata === 1)");

    // 3. Mock REL con caricata 2
    const { l } = await openRel(page, makeRel({ caricata: 2 }));
    await expect(page.getByText(LABEL_REINSERISCI)).toBeVisible();
    await expect(l.downloadFirmato).toBeVisible();
  });

  test("Upload PDF valido", async ({ page }) => {
    // 1. Mock POST upload 200 con ritardo, GET dettaglio successivo con caricata 1; caricare 'firmato.pdf'
    const { l, dettaglio } = await openRel(page, makeRel({ caricata: 0 }));
    const upload = await mockUpload(page);
    await expect(l.downloadFirmato).toHaveCount(0);
    dettaglio.body = makeRel({ caricata: 1 });
    // l'URL ha la query ?nonce=..., si confronta quindi il pathname
    const requestPromise = page.waitForRequest((r) => r.method() === "POST" && new URL(r.url()).pathname.endsWith(API.uploadFirmato("123")));
    await l.uploadInput.setInputFiles(PDF_FILE);

    // expect: Una POST multipart con campo 'file' = firmato.pdf e Content-type multipart/form-data
    const request = await requestPromise;
    expect(request.headers()["content-type"]).toContain("multipart/form-data");
    const body = request.postData() ?? "";
    expect(body).toContain('name="file"');
    expect(body).toContain('filename="firmato.pdf"');

    // expect: Compare ModalUploadPdf con 'Operazione andata a buon fine' e "L'inserimento del documento è stato completato"
    await expect(modalOk(page)).toBeVisible();
    await expect(page.getByText("L'inserimento del documento è stato completato")).toBeVisible();
    expect(upload.calls).toBe(1);

    // expect: Il dettaglio viene ricaricato e la label diventa 'Reinserisci nuovo PDF Reg. Es. firmato'
    expect(dettaglio.calls).toBeGreaterThanOrEqual(2);
    await expect(page.getByText(LABEL_REINSERISCI)).toBeVisible();

    // 2. Cliccare 'Ok' nel modale
    await page.getByRole("button", { name: "Ok", exact: true }).click();

    // expect: Il modale si chiude
    await expect(modalOk(page)).toBeHidden();

    // expect: Compare 'Scarica PDF Firmato' (con il modale aperto il resto della pagina e' aria-hidden, quindi si verifica dopo la chiusura)
    await expect(l.downloadFirmato).toBeVisible();
  });

  test("Upload di un file non PDF", async ({ page }) => {
    // 1. Caricare 'immagine.png'
    const { l } = await openRel(page, makeRel({ caricata: 0 }));
    const upload = await mockUpload(page);
    // SingleFileInput verifica il tipo solo nel drop (handleDrop/verifyAccept); la selezione dal file picker
    // (change) non controlla 'accept' ed e' delegata al browser: si simula quindi un drag&drop di un PNG
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(new File(["png"], "immagine.png", { type: "image/png" }));
      return dt;
    });
    await page.getByTestId("loadFromPc").dispatchEvent("drop", { dataTransfer });

    // expect: Compare la rejectedLabel 'Tipo file non supportato'; nessuna POST; nessun ModalUploadPdf
    await expect(page.getByText("Tipo file non supportato")).toBeVisible();
    expect(upload.calls).toBe(0);
    await expect(modalOk(page)).toHaveCount(0);

    // 2. Caricare poi un PDF valido
    await l.uploadInput.setInputFiles(PDF_FILE);

    // expect: L'upload parte regolarmente
    await expect(modalOk(page)).toBeVisible();
    expect(upload.calls).toBe(1);
  });

  test("Errore di upload (400, 413, 500, 401, rete)", async ({ page }) => {
    const { l } = await openRel(page, makeRel({ caricata: 0 }));
    const upload = await mockUpload(page, "123", { status: 500 });

    // 1. Mockare l'upload con 500 e caricare un PDF
    await l.uploadInput.setInputFiles(PDF_FILE);

    // expect: Errore layout 500 coerente, nessun ModalUploadPdf
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    await expect(modalOk(page)).toHaveCount(0);
    expect(upload.calls).toBe(1);

    // expect: si puo' ritentare e il secondo tentativo va a buon fine
    upload.status = 200;
    await l.uploadInput.setInputFiles(PDF_FILE);
    await expect(modalOk(page)).toBeVisible();
    expect(upload.calls).toBe(2);
    await page.getByRole("button", { name: "Ok", exact: true }).click();
    await expect(modalOk(page)).toBeHidden();

    // 2. Ripetere con 400, 413, 401 (ultimo): nessun crash, nessun modale di successo
    for (const status of [400, 413, 401]) {
      upload.status = status;
      const before = upload.calls;
      await l.uploadInput.setInputFiles(PDF_FILE);
      await expect.poll(() => upload.calls).toBe(before + 1);
      await expect(modalOk(page)).toHaveCount(0);
      await expect(l.card("Dati di Fatturazione")).toBeVisible();
    }
    await expect(page.getByText(ERRORE_401)).toBeVisible();
  });

  test("Errore di rete sull'upload", async ({ page }) => {
    const { l } = await openRel(page, makeRel({ caricata: 0 }));
    let chiamate = 0;
    await page.route((url) => url.pathname.endsWith(API.uploadFirmato("123")), (route) => {
      chiamate++;
      return route.abort();
    });

    // 2. Ripetere con route.abort
    await l.uploadInput.setInputFiles(PDF_FILE);

    // expect: Nessun crash, nessun ModalUploadPdf
    await expect.poll(() => chiamate).toBe(1);
    await expect(modalOk(page)).toHaveCount(0);
    await expect(l.card("Dati di Fatturazione")).toBeVisible();
    await expect(l.uploadInput).toHaveCount(1);
  });

  test("Rimozione del file selezionato", async () => {
    test.fixme(true, "Non automatizzabile: uploadPdf parte subito alla selezione e il file in state resta null (setFile(null)), quindi non esiste un file selezionato da rimuovere nella UI");

    // 1. Se il componente mantiene il file (value=file) premere l'azione di rimozione
  });

  test("Upload che rimpiazza un file gia' caricato", async ({ page }) => {
    // 1. Mock caricata 1 con log firma e caricare un nuovo PDF
    const { l, dettaglio, log } = await openRel(page, makeRel({ caricata: 1, anno: "2024", mese: "2" }), "2024-03-20T10:30:00");
    const upload = await mockUpload(page);
    await expect(page.getByText("20/3/2024", { exact: true })).toBeVisible();
    const logPrima = log.calls;
    const dettaglioPrima = dettaglio.calls;
    log.body = [{ dataEvento: "2024-05-15T09:00:00" }];
    await l.uploadInput.setInputFiles(PDF_FILE);

    // expect: La POST parte, il dettaglio e il log firma vengono richiamati
    await expect(modalOk(page)).toBeVisible();
    expect(upload.calls).toBe(1);
    expect(dettaglio.calls).toBeGreaterThan(dettaglioPrima);
    expect(log.calls).toBeGreaterThan(logPrima);

    // expect: la data in 'Scarica PDF Firmato' viene aggiornata
    await expect(page.getByText("15/5/2024", { exact: true })).toBeVisible();
    await expect(page.getByText("20/3/2024", { exact: true })).toHaveCount(0);
    // con il modale aperto il resto della pagina e' aria-hidden: si chiude prima di cercare il pulsante per ruolo
    await page.getByRole("button", { name: "Ok", exact: true }).click();
    await expect(l.downloadFirmato).toBeVisible();
  });

  test("Scarica PDF Firmato con data ultimo aggiornamento", async ({ page }) => {
    // 1. Mock REL caricata 1, datiFatturazione true, anno '2024', mese '2', POST log
    const { l, log } = await openRel(
      page,
      makeRel({ caricata: 1, datiFatturazione: true, anno: "2024", mese: "2", ragioneSociale: "Comune Test" }),
      "2024-03-20T10:30:00",
    );

    // expect: Body log { anno, mese, tipologiaFattura, idContratto } SENZA idEnte
    expect(log.requests[0].body).toEqual({ anno: 2024, mese: 2, tipologiaFattura: "PRIMO SALDO", idContratto: "C-1" });

    // expect: Sotto 'Scarica PDF Firmato' compare la data formattata (d/M/yyyy)
    await expect(l.downloadFirmato).toBeVisible();
    await expect(page.getByText("20/3/2024", { exact: true })).toBeVisible();

    // 2. Cliccare 'Scarica PDF Firmato'
    const firmato = await mockDownloadFirmato(page);
    const downloadPromise = page.waitForEvent("download");
    await l.downloadFirmato.click();

    // expect: 'Downloading...' visibile e poi chiuso
    await expect(l.downloading).toBeVisible();

    // expect: Download con nome 'REL firmata/<ragioneSociale>/<mese 2 cifre>/<anno>.pdf'
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/REL firmata.*Comune Test.*02.*2024\.pdf$/);
    expect(firmato.calls).toBe(1);
    await expect(l.downloading).toBeHidden();
  });

  test("Data firmato assente o log non disponibile", async ({ page }) => {
    // 1. Log firma con 404, [] e 500
    const { l, log } = await openRel(page, makeRel({ caricata: 1 }), null);

    // [] : nessuna data
    await expect(l.downloadFirmato).toBeVisible();
    await expect(page.getByText(/^\d{1,2}\/\d{1,2}\/\d{4}$/)).toHaveCount(0);

    for (const status of [404, 500]) {
      log.status = status;
      await page.reload();
      await expect(l.card("Dati di Fatturazione")).toBeVisible();

      // expect: Nessuna data, nessun errore visibile (catch silenzioso), 'Scarica PDF Firmato' resta visibile
      await expect(l.downloadFirmato).toBeVisible();
      await expect(page.getByText(/^\d{1,2}\/\d{1,2}\/\d{4}$/)).toHaveCount(0);
      await expect(page.getByText(ERRORE_500)).toHaveCount(0);
      await expect(page.getByText(MSG_404)).toHaveCount(0);
    }
  });

  test("Con datiFatturazione false la data del firmato viene comunque mostrata (bug 19)", async ({ page }) => {
    test.fail(true, "Bug 19: il log firma viene richiesto solo se datiFatturazione === true, quindi la data non compare");

    // 1. Dettaglio con caricata 1 e datiFatturazione false
    const { l } = await openRel(page, makeRel({ caricata: 1, datiFatturazione: false }), "2024-03-20T10:30:00");
    await expect(l.downloadFirmato).toBeVisible();
    await expect(page.getByText("20/3/2024", { exact: true })).toBeVisible();
  });

  test("Errore su Scarica PDF Firmato", async ({ page }) => {
    const { l } = await openRel(page, makeRel({ caricata: 1 }));
    const firmato = await mockDownloadFirmato(page);
    const scaricati: string[] = [];
    page.on("download", (d) => scaricati.push(d.suggestedFilename()));

    // 1. Mockare la GET firma/download con 404, 500 e 401
    const casi: [number, string][] = [[404, MSG_404], [500, ERRORE_500], [401, ERRORE_401]];
    for (const [status, messaggio] of casi) {
      firmato.status = status;
      await l.downloadFirmato.click();

      // expect: Modale 'Downloading...' chiuso, errore layout coerente, nessun download
      await expect(page.getByText(messaggio)).toBeVisible();
      await expect(l.downloading).toBeHidden();
    }
    expect(firmato.calls).toBe(3);
    expect(scaricati).toHaveLength(0);
  });

  test("Layout delle azioni in fondo", async ({ page }) => {
    // 1. REL caricata 1 con totale > 0
    const { l, dettaglio } = await openRel(page, makeRel({ caricata: 1 }));
    await expect(l.downloadFirmato).toBeVisible();

    // expect: Ordine da sinistra a destra: 'Scarica PDF Reg. Es.', input upload, 'Scarica PDF Firmato'
    const pdf = await l.downloadPdf("rel").boundingBox();
    const upload = await page.locator("#singleInput").boundingBox();
    const firmato = await l.downloadFirmato.boundingBox();
    expect(pdf && upload && firmato).toBeTruthy();
    expect(pdf!.x + pdf!.width).toBeLessThanOrEqual(upload!.x + 1);
    expect(upload!.x + upload!.width).toBeLessThanOrEqual(firmato!.x + 1);

    // expect: Con caricata 0 non c'e' il terzo blocco
    dettaglio.body = makeRel({ caricata: 0 });
    await page.reload();
    await expect(l.downloadPdf("rel")).toBeVisible();
    await expect(l.uploadInput).toHaveCount(1);
    await expect(l.downloadFirmato).toHaveCount(0);
  });
});
