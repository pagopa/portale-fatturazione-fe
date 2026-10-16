import type { Page } from "@playwright/test";

export { seedSession, savedFilters, ERRORE_500, ERRORE_401 } from "../ente/docContabiliMock";

// Pagina ente "Modulo commessa" - elenco (src/page/ente/moduloCommessaElencoUtPa.tsx) - spec: specs/ente-moduloCommessaElenco.md
export const ROUTE = "/ente/modulicommessa";
export const ROUTE_INSERIMENTO = "/ente/modulocommessa";

// page.route con RegExp confronta l'URL completo (con ?nonce=): si confronta solo il pathname
const byPath = (re: RegExp) => (url: URL) => re.test(url.pathname);

export const API = {
  verifica: /\/api\/v2\/modulocommessa\/obbligatori\/verifica$/,
  anni: /\/api\/modulocommessa\/anni$/,
  // lista senza anno: /lista ; con anno: /lista/<anno>
  lista: /\/api\/v2\/modulocommessa\/lista(\/\d+)?$/,
};

export const ANNI = ["2026", "2025", "2024"];

export type Source = "obbligatorio" | "archiviato" | "facoltativo";

export type MockModulo = {
  id: number;
  modifica: boolean;
  annoValidita: number;
  meseValidita: number;
  idEnte: string;
  idTipoContratto: number;
  stato: string;
  prodotto: string;
  source: Source | null;
  dataInserimento: string | null;
  dataChiusura: string | null;
  totaleNotificheDigitaleNaz: number | null;
  totaleNotificheDigitaleInternaz: number | null;
  totaleNotificheAnalogicoARNaz: number | null;
  totaleNotificheAnalogicoARInternaz: number | null;
  totaleNotificheAnalogico890Naz: number | null;
  totaleNotifiche: number | null;
};

const SOURCES: Source[] = ["obbligatorio", "archiviato", "facoltativo"];

// Modulo per anno/mese; source ciclica (mese 1 obbligatorio, 2 archiviato, 3 facoltativo, ...), inserito di default
export function makeModulo(anno: number, mese: number, override: Partial<MockModulo> = {}): MockModulo {
  return {
    id: anno * 100 + mese,
    modifica: false,
    annoValidita: anno,
    meseValidita: mese,
    idEnte: "729352e9-5bb9-4aff-a6b5-ca0c80c0d3b4",
    idTipoContratto: 1,
    stato: "",
    prodotto: "prod-pn",
    source: SOURCES[(mese - 1) % 3],
    dataInserimento: `${anno}-${String(mese).padStart(2, "0")}-05T10:00:00`,
    dataChiusura: `${anno}-${String(mese).padStart(2, "0")}-15T23:59:59`,
    totaleNotificheDigitaleNaz: 100,
    totaleNotificheDigitaleInternaz: 10,
    totaleNotificheAnalogicoARNaz: 20,
    totaleNotificheAnalogicoARInternaz: 2,
    totaleNotificheAnalogico890Naz: 5,
    totaleNotifiche: 137,
    ...override,
  };
}

// 12 moduli per anno (mesi 1..12)
export const makeAnno = (anno: number, override: (mese: number) => Partial<MockModulo> = () => ({})) =>
  Array.from({ length: 12 }, (_, i) => makeModulo(anno, i + 1, override(i + 1)));

const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

// redirectToInsert va impostato prima del caricamento: senza la chiave la pagina fa JSON.parse("") e non carica nulla (bug noto).
// `valore` = stringa grezza da scrivere (es. "false", "true", "abc"); null = chiave assente.
export async function setRedirectToInsert(page: Page, valore: string | null = "false") {
  await page.addInitScript((v) => {
    if (sessionStorage.getItem("seed-redirect")) return;
    if (v === null) localStorage.removeItem("redirectToInsert");
    else localStorage.setItem("redirectToInsert", v);
    sessionStorage.setItem("seed-redirect", "1");
  }, valore);
}

export async function mockVerifica(page: Page, valore: boolean = false, status = 200) {
  const calls = { n: 0 };
  await page.route(byPath(API.verifica), (route) => {
    calls.n++;
    return route.fulfill(json(status === 200 ? valore : {}, status));
  });
  return calls;
}

export async function mockAnni(page: Page, anni: string[] = ANNI, status = 200) {
  const calls = { n: 0 };
  await page.route(byPath(API.anni), (route) => {
    calls.n++;
    return route.fulfill(json(status === 200 ? anni : {}, status));
  });
  return calls;
}

// Lista: senza anno restituisce tutti i moduli, con anno solo quelli dell'anno. Registra l'anno richiesto ("" = senza anno).
// `status` puo' essere una funzione del numero di chiamata (1-based).
export async function mockLista(
  page: Page,
  moduli: MockModulo[] = [...makeAnno(2026), ...makeAnno(2025)],
  status: number | ((call: number) => number) = 200,
) {
  const anni: string[] = [];
  await page.route(byPath(API.lista), (route, request) => {
    const anno = new URL(request.url()).pathname.match(/\/lista\/(\d+)$/)?.[1] ?? "";
    anni.push(anno);
    const s = typeof status === "function" ? status(anni.length) : status;
    if (s !== 200) return route.fulfill(json({}, s));
    return route.fulfill(json(anno ? moduli.filter((m) => String(m.annoValidita) === anno) : moduli));
  });
  return anni;
}

export async function mockAll(page: Page, opts: { verifica?: boolean; moduli?: MockModulo[]; redirect?: string | null } = {}) {
  await setRedirectToInsert(page, opts.redirect === undefined ? "false" : opts.redirect);
  const verifica = await mockVerifica(page, opts.verifica ?? false);
  const anni = await mockAnni(page);
  const lista = await mockLista(page, opts.moduli);
  return { verifica, anni, lista };
}

// infoTrimestreComSelected dallo stato globale persistito
export const infoTrimestre = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("globalStatePF") ?? "{}")?.state?.mainState?.infoTrimestreComSelected);

export const CAPTION_OK = "N.B. il Modulo Commessa per le previsioni dei consumi deve essere inserito dal giorno 1 al giorno 15 di ogni mese";
export const CAPTION_KO =
  "N.B. Gentile Aderente, non sono presenti moduli commessa inseriti. L'inserimento è possibile solo dal 1° al 15 di ogni mese. La finestra di inserimento è attualmente chiusa. Ritorna dal 1° del prossimo mese per compilare i moduli obbligatori";
export const TESTO_FACOLTATIVO = "Per inserire i moduli commessa futuri bisogna prima inserire i moduli commessa OBBLIGATORI";

export function locators(page: Page) {
  return {
    title: page.getByRole("heading", { name: "Modulo commessa", exact: true }),
    // la select MUI non ha labelId: unico combobox della pagina
    anno: page.getByRole("combobox").first(),
    filtra: page.getByRole("button", { name: "Filtra" }),
    annulla: page.getByRole("button", { name: "Annulla filtri" }),
    inserisci: page.getByRole("button", { name: "Inserisci modulo commessa" }),
    loading: page.getByText("Loading..."),
    captionOk: page.getByText(CAPTION_OK),
    captionKo: page.getByText(CAPTION_KO),
    rows: page.getByRole("row").filter({ has: page.getByRole("cell", { name: /^[A-Za-z]+\/\d{4}$/ }) }),
    redirectModal: page.getByText("Per poter inserire il modulo commessa è obbligatorio fornire"),
  };
}

export async function openPage(page: Page) {
  await page.goto(ROUTE);
  const l = locators(page);
  await l.title.waitFor();
  return l;
}

// Pagina di inserimento (/ente/modulocommessa) con verifica=true: per mostrare il pulsante "Indietro" servono
// obbligatori/lista e regioni; senza questi mock la pagina torna subito all'elenco (NO_INSERIMENTO_COMMESSA).
export async function mockInserimento(page: Page) {
  await page.route(byPath(/\/api\/v2\/modulocommessa\/obbligatori\/lista$/), (route) =>
    route.fulfill(json({ lista: [{ annoValidita: 2026, meseValidita: 10, stato: null, valoriRegione: [], totale: null }], macrocategoriaVendita: "" })),
  );
  await page.route(byPath(/\/api\/v2\/modulocommessa\/regioni$/), (route) => route.fulfill(json([])));
}

// Pagina di inserimento aperta dal click su una riga (infoTrimestreComSelected valorizzato): carica il dettaglio del modulo.
// modifica=false -> isEditAllow=false: "Indietro" torna all'elenco senza modale di conferma.
export async function mockDettaglioInserimento(page: Page) {
  await page.route(byPath(/\/api\/v2\/modulocommessa\/dettaglio\/\d+\/\d+$/), (route, request) => {
    const [, anno, mese] = new URL(request.url()).pathname.match(/\/dettaglio\/(\d+)\/(\d+)$/) ?? [];
    return route.fulfill(
      json({
        lista: [{ annoValidita: Number(anno), meseValidita: Number(mese), stato: "inserito", source: "obbligatorio", modifica: false, valoriRegione: [] }],
        totali: [],
        macrocategoriaVendita: "",
      }),
    );
  });
  await page.route(byPath(/\/api\/v2\/modulocommessa\/regioni$/), (route) => route.fulfill(json([])));
}
