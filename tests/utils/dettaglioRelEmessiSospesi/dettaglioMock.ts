// Mock e locator condivisi dal dettaglio src/page/prod_pn/relPdfUtPa.tsx (lato ente):
// stessa pagina per Regolare Esecuzione, Documenti Emessi e Documenti Sospesi, la sezione dipende dall'URL.
// spec: specs/dettaglioRelEmessiSospesi.md
import type { Page } from "@playwright/test";
import { expect } from "../../fixtures";
import { RAGIONE_SOCIALE, seedSession } from "../ente/docContabiliMock";

export { RAGIONE_SOCIALE, seedSession };

export type Section = "rel" | "documentiemessi" | "documentisospesi";

export const SECTIONS: Record<Section, { breadcrumb: string; backUrl: RegExp; labelPdf: string; labelReport: string }> = {
  rel: {
    breadcrumb: "Regolare Esecuzione/",
    backUrl: /\/ente\/listarel$/,
    labelPdf: "Scarica PDF Reg. Es.",
    labelReport: "Scarica report di dettaglio notifiche Reg. Es.",
  },
  documentiemessi: {
    breadcrumb: "Documenti Emessi/",
    backUrl: /\/ente\/docemessi$/,
    labelPdf: "Scarica PDF Doc. Emessi",
    labelReport: "Scarica report di dettaglio notifiche Doc. Emessi",
  },
  documentisospesi: {
    breadcrumb: "Documenti Sospesi/",
    backUrl: /\/ente\/docsospesi$/,
    labelPdf: "Scarica PDF Doc. Sospesi",
    labelReport: "Scarica report di dettaglio notifiche Doc. Sospesi",
  },
};

export const TIPOLOGIE = ["PRIMO SALDO", "SECONDO SALDO", "VAR. SEMESTRALE", "SEM. SOSPESI", "ACCONTO", "ANTICIPO"] as const;

export const API = {
  rel: (id: string) => `/api/rel/ente/${id}`,
  dettaglioEmessi: "/api/fatture/ente/emesse/dettaglio",
  dettaglioSospesi: "/api/fatture/ente/sospese/dettaglio",
  pdfRel: (id: string) => `/api/rel/ente/download/${id}`,
  pdfEmessi: (id: string) => `/api/fatture/ente/emesse/dettaglio/download/${id}`,
  pdfSospesi: (id: string) => `/api/fatture/ente/sospese/dettaglio/download/${id}`,
  reportRel: (id: string) => `/api/rel/ente/righe/${id}`,
  reportSospesi: (id: string) => `/api/rel/ente/sospese/righe/${id}`,
  uploadFirmato: (id: string) => `/api/rel/firma/upload/${id}`,
  downloadFirmato: (id: string) => `/api/rel/firma/download/${id}`,
  logFirmato: "/api/rel/firma/log",
};

export const ID_CONTRATTO = "C-1";
export const ID_ENTE = "729352e9-5bb9-4aff-a6b5-ca0c80c0d3b4";

// customId usato dal report di Emessi/Sospesi: idEnte_idContratto_TIPOLOGIA-CON-TRATTINI_anno_mese
export const customId = (rel: Record<string, unknown>) =>
  `${rel.idEnte}_${rel.idContratto}_${String(rel.tipologiaFattura).replace(/ /g, "-")}_${rel.anno}_${rel.mese}`;

export type MockRel = Record<string, unknown>;

// Dettaglio completo con importi non nulli (iva 22): override per tipologia/sezione
export function makeRel(override: MockRel = {}): MockRel {
  return {
    idTestata: "123",
    idEnte: ID_ENTE,
    ragioneSociale: RAGIONE_SOCIALE,
    dataDocumento: null,
    idDocumento: "DOC-1",
    cup: "CUP-1",
    idContratto: ID_CONTRATTO,
    tipologiaFattura: "PRIMO SALDO",
    anno: 2024,
    mese: 3,
    totaleAnalogico: 100,
    totaleDigitale: 200,
    totaleNotificheAnalogiche: 10,
    totaleNotificheDigitali: 20,
    totale: 300,
    datiFatturazione: true,
    iva: 22,
    totaleAnalogicoIva: 122,
    totaleDigitaleIva: 244,
    totaleIva: 366,
    firmata: "",
    caricata: 0,
    fattureSospese: [],
    accontoAnalogico: 0,
    accontoDigitale: 0,
    anticipoAnalogico: 0,
    anticipoDigitale: 0,
    stornoAnalogico: 0,
    stornoDigitale: 0,
    stornoTotale: 0,
    anticipo_StornoDigitale: 0,
    anticipo_StornoAnalogico: 0,
    anticipo_StornoTotale: 0,
    acconto_StornoDigitale: 0,
    acconto_StornoAnalogico: 0,
    acconto_StornoTotale: 0,
    ...override,
  };
}

const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });
const endsWith = (suffix: string) => (url: URL) => url.pathname.endsWith(suffix);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Stato modificabile durante il test: body, status, ritardo e richieste ricevute
export type MockState = { body: unknown; status: number; delayMs: number; calls: number; requests: { url: string; body: unknown }[] };

async function mockEndpoint(page: Page, suffix: string, body: unknown, options: Partial<MockState> = {}, contentType?: string) {
  const state: MockState = { body, status: 200, delayMs: 0, calls: 0, requests: [], ...options };
  await page.route(endsWith(suffix), async (route, request) => {
    state.calls++;
    let reqBody: unknown = null;
    try { reqBody = request.postDataJSON(); } catch { reqBody = request.postData(); }
    state.requests.push({ url: request.url(), body: reqBody });
    if (state.delayMs) await sleep(state.delayMs);
    if (state.status !== 200) return route.fulfill(json({ detail: "errore" }, state.status));
    if (contentType && typeof state.body === "string") {
      return route.fulfill({ status: 200, contentType, body: state.body });
    }
    return route.fulfill(json(state.body));
  });
  return state;
}

// GET/POST del dettaglio per la sezione indicata
export function mockDettaglio(page: Page, section: Section, rel: MockRel = makeRel(), options: Partial<MockState> = {}) {
  const id = String(rel?.idTestata ?? "123");
  const suffix = section === "rel" ? API.rel(id) : section === "documentiemessi" ? API.dettaglioEmessi : API.dettaglioSospesi;
  return mockEndpoint(page, suffix, rel, options);
}

// POST /api/rel/firma/log -> [{dataEvento}]
export function mockLogFirmato(page: Page, dataEvento = "2024-04-10T10:30:00", options: Partial<MockState> = {}) {
  return mockEndpoint(page, API.logFirmato, dataEvento ? [{ dataEvento }] : [], options);
}

// Download PDF: il BE ritorna HTML che il FE converte in PDF (react-to-pdf)
export function mockPdf(page: Page, section: Section, id = "123", options: Partial<MockState> = {}) {
  const suffix = section === "rel" ? API.pdfRel(id) : section === "documentiemessi" ? API.pdfEmessi(id) : API.pdfSospesi(id);
  return mockEndpoint(page, suffix, "<html><body><h1>PDF di test</h1></body></html>", { delayMs: 300, ...options }, "text/html");
}

// Report CSV: il BE ritorna l'URL del file
export function mockReport(page: Page, section: Section, rel: MockRel = makeRel(), options: Partial<MockState> = {}) {
  const suffix =
    section === "rel" ? API.reportRel(String(rel.idTestata)) :
      section === "documentiemessi" ? API.reportRel(customId(rel)) : API.reportSospesi(customId(rel));
  return mockEndpoint(page, suffix, "data:text/csv;base64,Y29sMSxjb2wyCjEsMgo=", { delayMs: 300, ...options });
}

export function mockUpload(page: Page, id = "123", options: Partial<MockState> = {}) {
  return mockEndpoint(page, API.uploadFirmato(id), {}, { delayMs: 300, ...options });
}

export function mockDownloadFirmato(page: Page, id = "123", options: Partial<MockState> = {}) {
  return mockEndpoint(page, API.downloadFirmato(id), { documento: "JVBERi0xLjQKJSVFT0YK" }, { delayMs: 300, ...options });
}

// Sessione ente con contratto "con requisiti" (necessario per la sezione Regolare Esecuzione)
export const seedTipoContratto = (page: Page, idTipoContratto: 1 | 2) =>
  seedSession(page, { profilo: { idTipoContratto } }, `tipoContratto${idTipoContratto}`);

export const detailUrl = (section: Section, id = "123") => `/ente/fatturapdf/${section}/${id}`;

export function locators(page: Page) {
  // TextDettaglioPdf: riga con etichetta (overline) e valore (caption) senza semantica
  const field = (description: string) =>
    page.locator(".row").filter({ has: page.getByText(description, { exact: true }) }).last();
  return {
    breadcrumb: (section: Section) => page.getByText(SECTIONS[section].breadcrumb, { exact: false }),
    indietro: page.getByRole("button", { name: /Indietro/ }),
    card: (title: string) => page.getByRole("heading", { name: title, exact: true }),
    label: (description: string) => page.getByText(description, { exact: true }),
    value: (description: string) => field(description).locator(".MuiTypography-caption"),
    downloadReport: (section: Section) => page.getByRole("button", { name: SECTIONS[section].labelReport }),
    downloadPdf: (section: Section) => page.getByRole("button", { name: SECTIONS[section].labelPdf }),
    downloadFirmato: page.getByRole("button", { name: "Scarica PDF Firmato" }),
    uploadInput: page.locator("#singleInput input[type=file]"),
    downloading: page.getByText("Downloading..."),
  };
}

// Apre il dettaglio con i mock minimi e attende la fine del caricamento
export async function openDettaglio(page: Page, section: Section, rel: MockRel = makeRel()) {
  const dettaglio = await mockDettaglio(page, section, rel);
  const log = section === "rel" ? await mockLogFirmato(page) : undefined;
  await page.goto(detailUrl(section, String(rel.idTestata ?? "123")));
  const l = locators(page);
  await expect(l.card("Dati di Fatturazione")).toBeVisible();
  return { l, dettaglio, log };
}

// Formato importi usato dalla pagina
export const eur = (n: number) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
