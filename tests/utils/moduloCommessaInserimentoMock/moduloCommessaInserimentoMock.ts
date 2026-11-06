import type { Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import { setRedirectToInsert } from "../moduloCommessaElencoMock/moduloCommessaElencoMock";

export { seedSession, ERRORE_500, ERRORE_401 } from "../ente/docContabiliMock";
export { setRedirectToInsert };

// Pagina ente "Modulo commessa - inserimento/dettaglio" (src/page/ente/moduloCommessaInserimentoUtEn30.tsx)
// spec: specs/ente-moduloCommessaInserimento.md
export const ROUTE = "/ente/modulocommessa";
export const ROUTE_ELENCO = "/ente/modulicommessa";

// page.route con RegExp confronta l'URL completo (con ?nonce=): si confronta solo il pathname
const byPath = (re: RegExp) => (url: URL) => re.test(url.pathname);
const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

export const API = {
  verifica: /\/api\/v2\/modulocommessa\/obbligatori\/verifica$/,
  lista: /\/api\/v2\/modulocommessa\/obbligatori\/lista$/,
  dettaglio: /\/api\/v2\/modulocommessa\/dettaglio\/(\d+)\/(\d+)$/,
  regioni: /\/api\/v2\/modulocommessa\/regioni$/,
  post: /\/api\/v2\/modulocommessa$/,
  datiFatturazione: /\/api\/datifatturazione\/ente$/,
  configurazione: /\/api\/configurazionemodulocommessa$/,
};

export type MockRegione = {
  regione: string;
  istatRegione: string;
  ar: number | null;
  890: number | null;
  obbligatorio?: number;
  calcolato?: number;
  istatProvincia?: string;
  provincia?: string;
};

export type MockModuloIns = {
  annoValidita: number;
  meseValidita: number;
  stato: string | null;
  source: string;
  modifica: boolean;
  idTipoContratto: number;
  totaleNotificheDigitaleNaz: number | null;
  totaleNotificheDigitaleInternaz: number | null;
  totaleNotificheAnalogicoARNaz: number | null;
  totaleNotificheAnalogicoARInternaz: number | null;
  totaleNotificheAnalogico890Naz: number | null;
  totaleNotifiche: number | null;
  valoriRegione: MockRegione[] | null;
  [key: string]: unknown;
};

// Modulo vuoto da compilare (obbligatorio, stato null, modificabile)
export function makeModuloIns(anno: number, mese: number, override: Partial<MockModuloIns> = {}): MockModuloIns {
  return {
    annoValidita: anno,
    meseValidita: mese,
    stato: null,
    source: "obbligatorio",
    modifica: true,
    idTipoContratto: 1,
    totaleNotificheDigitaleNaz: null,
    totaleNotificheDigitaleInternaz: null,
    totaleNotificheAnalogicoARNaz: null,
    totaleNotificheAnalogicoARInternaz: null,
    totaleNotificheAnalogico890Naz: null,
    totaleNotifiche: null,
    valoriRegione: [],
    ...override,
  };
}

// Valori compilati di riferimento: digitale 100/10, AR 20/2, 890 5 (totale 137)
export const VALORI = {
  totaleNotificheDigitaleNaz: 100,
  totaleNotificheDigitaleInternaz: 10,
  totaleNotificheAnalogicoARNaz: 20,
  totaleNotificheAnalogicoARInternaz: 2,
  totaleNotificheAnalogico890Naz: 5,
  totaleNotifiche: 137,
};

export const REGIONI: MockRegione[] = [
  { regione: "Lazio", istatRegione: "12", ar: null, 890: null },
  { regione: "Piemonte", istatRegione: "1", ar: null, 890: null },
  { regione: "Veneto", istatRegione: "5", ar: null, 890: null },
];

export async function mockVerifica(page: Page, valore = true, status = 200) {
  const calls = { n: 0 };
  await page.route(byPath(API.verifica), (route) => {
    calls.n++;
    return route.fulfill(json(status === 200 ? valore : {}, status));
  });
  return calls;
}

// Lista obbligatori (modalita' inserimento obbligatori)
export async function mockListaObbligatori(page: Page, moduli: MockModuloIns[] = [makeModuloIns(2026, 10)], macrocategoriaVendita: unknown = 3, status = 200) {
  const calls = { n: 0 };
  await page.route(byPath(API.lista), (route) => {
    calls.n++;
    return route.fulfill(json(status === 200 ? { lista: moduli, macrocategoriaVendita } : {}, status));
  });
  return calls;
}

// Dettaglio di un modulo: `moduli` puo' essere una funzione (anno, mese, numero chiamata) per risposte diverse (es. dopo il salvataggio)
export async function mockDettaglio(
  page: Page,
  moduli: MockModuloIns | ((anno: number, mese: number, call: number) => MockModuloIns),
  macrocategoriaVendita: unknown = 3,
  status: number | ((call: number) => number) = 200,
) {
  const richieste: string[] = [];
  await page.route(byPath(API.dettaglio), (route, request) => {
    const [, anno, mese] = new URL(request.url()).pathname.match(API.dettaglio) ?? [];
    richieste.push(`${anno}/${mese}`);
    const s = typeof status === "function" ? status(richieste.length) : status;
    if (s !== 200) return route.fulfill(json({}, s));
    const modulo = typeof moduli === "function" ? moduli(Number(anno), Number(mese), richieste.length) : moduli;
    return route.fulfill(json({ lista: [modulo], totali: [], macrocategoriaVendita }));
  });
  return richieste;
}

export async function mockRegioni(page: Page, regioni: MockRegione[] = REGIONI, status = 200) {
  await page.route(byPath(API.regioni), (route) => route.fulfill(json(status === 200 ? regioni : {}, status)));
}

// POST salvataggio: registra i body; ritardo opzionale
export async function mockPost(page: Page, status = 200, body: unknown = {}, ritardoMs = 0) {
  const bodies: unknown[] = [];
  await page.route(byPath(API.post), async (route, request) => {
    if (request.method() !== "POST") return route.fallback();
    bodies.push(request.postDataJSON());
    if (ritardoMs) await new Promise((r) => setTimeout(r, ritardoMs));
    return route.fulfill(json(body, status));
  });
  return bodies;
}

export async function mockDatiFatturazione(page: Page, status = 200) {
  const calls = { n: 0 };
  await page.route(byPath(API.datiFatturazione), (route) => {
    calls.n++;
    return route.fulfill(json(status === 200 ? { idEnte: "729352e9-5bb9-4aff-a6b5-ca0c80c0d3b4" } : {}, status));
  });
  return calls;
}

export async function mockConfigurazione(page: Page) {
  await page.route(byPath(API.configurazione), (route) => route.fulfill(json({ tipoSpedizione: [], categorie: [] })));
}

// Modalita' OBBLIGATORI: verifica=true, infoTrimestreComSelected vuoto (default della sessione)
export async function mockObbligatori(page: Page, opts: { moduli?: MockModuloIns[]; macrocategoriaVendita?: unknown; regioni?: MockRegione[] } = {}) {
  await setRedirectToInsert(page, "false");
  const verifica = await mockVerifica(page, true);
  const lista = await mockListaObbligatori(page, opts.moduli, opts.macrocategoriaVendita ?? 3);
  await mockRegioni(page, opts.regioni);
  const post = await mockPost(page);
  const datiFatturazione = await mockDatiFatturazione(page);
  return { verifica, lista, post, datiFatturazione };
}

// infoTrimestreComSelected per la modalita' DETTAGLIO (come lo imposta la pagina elenco)
export function infoTrimestreSeed(moduli: { anno: number; mese: number }[], indice = 0) {
  const nomi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
  const sel = moduli[indice];
  return {
    meseCommessaSelected: String(sel.mese),
    annoCommessaSelectd: String(sel.anno),
    moduli: moduli.map((m) => ({ id: `${m.mese}/${m.anno}`, meseAnno: `${nomi[m.mese - 1]}/${m.anno}` })),
    quarterSelectedIndex: 0,
    moduloSelectedIndex: indice,
    idTipoContratto: 1,
    prodotto: "prod-pn",
    idEnte: "729352e9-5bb9-4aff-a6b5-ca0c80c0d3b4",
  };
}

// Modalita' DETTAGLIO: seed di infoTrimestreComSelected (prima del goto) + verifica (default false) + dettaglio + regioni
export async function mockDettaglioMode(
  page: Page,
  opts: {
    modulo?: MockModuloIns | ((anno: number, mese: number, call: number) => MockModuloIns);
    moduli?: { anno: number; mese: number }[];
    indice?: number;
    verifica?: boolean;
    macrocategoriaVendita?: unknown;
    regioni?: MockRegione[];
  } = {},
) {
  const moduli = opts.moduli ?? [{ anno: 2026, mese: 3 }];
  await setRedirectToInsert(page, "false");
  await page.addInitScript((info) => {
    if (sessionStorage.getItem("seed-info")) return;
    const s = JSON.parse(localStorage.getItem("globalStatePF") ?? "{}");
    s.state.mainState.infoTrimestreComSelected = info;
    localStorage.setItem("globalStatePF", JSON.stringify(s));
    sessionStorage.setItem("seed-info", "1");
  }, infoTrimestreSeed(moduli, opts.indice ?? 0));
  const verifica = await mockVerifica(page, opts.verifica ?? false);
  const dettaglio = await mockDettaglio(page, opts.modulo ?? ((a, m) => makeModuloIns(a, m)), opts.macrocategoriaVendita ?? 3);
  await mockRegioni(page, opts.regioni);
  const post = await mockPost(page);
  const datiFatturazione = await mockDatiFatturazione(page);
  await mockConfigurazione(page);
  // "Vedi anteprima" porta alla pagina pdf: senza questo mock tornerebbe subito indietro
  await mockPdf(page);
  return { verifica, dettaglio, post, datiFatturazione };
}

// Stato globale persistito
export const mainStatePersistito = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("globalStatePF") ?? "{}")?.state?.mainState);

export const CAMPI = [
  "totaleNotificheDigitaleNaz",
  "totaleNotificheDigitaleInternaz",
  "totaleNotificheAnalogicoARNaz",
  "totaleNotificheAnalogicoARInternaz",
  "totaleNotificheAnalogico890Naz",
] as const;

export const TESTO_CAMPI_NULL = "Tutti i campi del modulo commessa vanno valorizzati, 0 è un valore ammesso.";

export function locators(page: Page) {
  return {
    indietroHeader: page.getByRole("button", { name: "Indietro", exact: true }),
    titoloObbligatori: page.getByText("/ Inserimento moduli commessa OBBLIGATORI"),
    titoloDettaglio: page.getByText("/ Dettaglio-Inserimento modulo commessa"),
    campo: (nome: (typeof CAMPI)[number]) => page.getByTestId(`modulo-${nome}`),
    regioneAr: (istat: string) => page.getByTestId(`regione-ar-${istat}`),
    regione890: (istat: string) => page.getByTestId(`regione-890-${istat}`),
    totaleAr: page.getByTestId("totale-ar"),
    totale890: page.getByTestId("totale-890"),
    coperturaAr: page.getByTestId("copertura-ar"),
    copertura890: page.getByTestId("copertura-890"),
    coperturaSistemaAr: page.getByTestId("copertura-sistema-ar"),
    coperturaSistema890: page.getByTestId("copertura-sistema-890"),
    inserisciRegione: page.getByRole("combobox", { name: "Inserisci regione" }),
    aggiungiRegione: page.getByRole("button", { name: "Aggiungi regione" }),
    // pulsanti dello stepper in basso (label "Indiero" con refuso)
    indietroStep: page.getByRole("button", { name: "Indiero" }),
    avanti: page.getByRole("button", { name: "Avanti" }),
    salva: page.getByRole("button", { name: "Salva", exact: true }),
    modifica: page.getByRole("button", { name: "Modifica", exact: true }),
    proseguiPerSalvare: page.getByRole("button", { name: "Prosegui per salvare" }),
    vediAnteprima: page.getByRole("button", { name: "Vedi anteprima" }),
    loading: page.getByText("Loading..."),
  };
}

export async function openPage(page: Page) {
  await page.goto(ROUTE);
  const l = locators(page);
  await l.indietroHeader.waitFor();
  return l;
}

// Pagina anteprima pdf (/ente/pdfmodulocommessa/<anno>/<mese>): senza GET documento risponde 404 e la pagina torna
// subito a /ente/modulocommessa. Il body e' quello reale registrato nella HAR tests/hars/dettaglioPdfCommessa.
const PDF_BODY = fs.readFileSync(path.join(__dirname, "../../hars/dettaglioPdfCommessa/ba64c7e2c5c3c06335f4861d8eb220b34066578a.json"), "utf-8");
export async function mockPdf(page: Page) {
  const richieste: string[] = [];
  await page.route(byPath(/\/api\/modulocommessa\/documento\/\d+\/\d+$/), (route, request) => {
    richieste.push(new URL(request.url()).pathname.replace(/.*\/documento\//, ""));
    return route.fulfill({ status: 200, contentType: "application/json", body: PDF_BODY });
  });
  return richieste;
}
