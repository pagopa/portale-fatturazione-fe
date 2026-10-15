import type { Page } from "@playwright/test";
import { endsWith } from "../ente/docContabiliMock";

export { endsWith, seedSession, savedFilters, ERRORE_500, ERRORE_401 } from "../ente/docContabiliMock";

// Pagina "Notifiche" (src/page/prod_pn/reportDettaglioUtPa.tsx) - spec: specs/notifiche.md
export const ROUTE_ENTE = "/ente/listanotifiche";

export const API = {
  anni: "/api/notifiche/anni",
  mesi: "/api/notifiche/mesi",
  flagContestazione: "/api/tipologia/flagcontestazione",
  prodotto: "/api/tipologia/prodotto",
  tipoProfilo: "/api/tipologia/tipoprofilo",
  scadenziario: "/api/tipologia/scadenziariocontestazioni",
  listaEnte: "/api/notifiche/ente",
  downloadEnte: "/api/v2/notifiche/ente/documento/ricerca",
};

export const ANNI = ["2026", "2025", "2024"];
// Descrizioni in maiuscolo come dall'API: la pagina le converte in 'Settembre'
export const MESI: Record<string, { mese: string; descrizione: string }[]> = {
  "2026": [
    { mese: "9", descrizione: "SETTEMBRE" },
    { mese: "8", descrizione: "AGOSTO" },
    { mese: "7", descrizione: "LUGLIO" },
  ],
  "2025": [
    { mese: "12", descrizione: "DICEMBRE" },
    { mese: "11", descrizione: "NOVEMBRE" },
  ],
  "2024": [{ mese: "1", descrizione: "GENNAIO" }],
};

export const FLAG_CONTESTAZIONE = [
  { id: 1, flag: "Non contestata", descrizione: "Contestazione" },
  { id: 2, flag: "Contestata", descrizione: "Contestazione" },
  { id: 3, flag: "Accettata", descrizione: "Esito" },
  { id: 4, flag: "Rifiutata", descrizione: "Esito" },
];

export const SCADENZIARIO = [
  { meseContestazione: "Settembre", annoContestazione: "2026", dataInizio: "01/10/2026", dataFine: "15/10/2026", chiusuraContestazioni: "20/10/2026", tempoRisposta: "30/10/2026" },
  { meseContestazione: "Agosto", annoContestazione: "2026", dataInizio: "01/09/2026", dataFine: "15/09/2026", chiusuraContestazioni: "20/09/2026", tempoRisposta: "30/09/2026" },
];

export type MockNotifica = {
  idNotifica: string;
  contestazione: boolean;
  statoContestazione: number;
  onere: string;
  recipientId: string;
  anno: string;
  mese: string;
  data: string;
  tipoNotifica: string;
  iun: string;
  dataInvio: string;
  statoEstero: string;
  cap: string;
  costEuroInCentesimi: string;
};

export function makeNotifica(i: number, override: Partial<MockNotifica> = {}): MockNotifica {
  return {
    idNotifica: `ID-NOTIFICA-${i}`,
    contestazione: false,
    statoContestazione: 1,
    onere: "",
    recipientId: `RCP${String(i).padStart(4, "0")}`,
    anno: "2026",
    mese: "9",
    data: `2026-09-${String((i % 28) + 1).padStart(2, "0")}T10:00:00`,
    tipoNotifica: "Digitale",
    iun: `IUN-${String(i).padStart(4, "0")}`,
    dataInvio: "2026-09-01T00:00:00",
    statoEstero: "",
    cap: "10099",
    costEuroInCentesimi: "150",
    ...override,
  };
}

export const makeNotifiche = (n: number, override: (i: number) => Partial<MockNotifica> = () => ({})) =>
  Array.from({ length: n }, (_, i) => makeNotifica(i + 1, override(i + 1)));

const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

export async function mockAnni(page: Page, anni: string[] = ANNI, status = 200) {
  await page.route(endsWith(API.anni), (route) => route.fulfill(json(status === 200 ? anni : {}, status)));
}

// Registra i body {anno} ricevuti
export async function mockMesi(page: Page, mesi = MESI, status = 200) {
  const bodies: { anno: string }[] = [];
  await page.route(endsWith(API.mesi), (route, request) => {
    const body = request.postDataJSON();
    bodies.push(body);
    return route.fulfill(json(status === 200 ? mesi[body.anno] ?? [] : {}, status));
  });
  return bodies;
}

export async function mockScadenziario(page: Page, righe = SCADENZIARIO, status = 200) {
  let calls = 0;
  await page.route(endsWith(API.scadenziario), (route) => {
    calls++;
    return route.fulfill(json(status === 200 ? righe : {}, status));
  });
  return { calls: () => calls };
}

// Lista ente paginata server-side: registra query e body di ogni richiesta
export async function mockListaEnte(page: Page, notifiche: MockNotifica[] = makeNotifiche(25), status = 200) {
  const requests: { query: Record<string, string>; body: Record<string, unknown> }[] = [];
  await page.route(endsWith(API.listaEnte), (route, request) => {
    const url = new URL(request.url());
    const query = Object.fromEntries(url.searchParams);
    requests.push({ query, body: request.postDataJSON() });
    if (status !== 200) return route.fulfill(json({}, status));
    const pageN = Number(query.page) || 1;
    const size = Number(query.pageSize) || 10;
    return route.fulfill(json({ notifiche: notifiche.slice((pageN - 1) * size, pageN * size), count: notifiche.length }));
  });
  return requests;
}

export async function mockBase(page: Page) {
  await page.route(endsWith(API.flagContestazione), (route) => route.fulfill(json(FLAG_CONTESTAZIONE)));
  await page.route(endsWith(API.prodotto), (route) => route.fulfill(json([{ nome: "prod-pn" }])));
  await page.route(endsWith(API.tipoProfilo), (route) => route.fulfill(json([])));
}

// Tutti i mock della pagina con i valori di riferimento
export async function mockAll(page: Page, notifiche?: MockNotifica[]) {
  await mockBase(page);
  await mockAnni(page);
  const mesi = await mockMesi(page);
  const scadenziario = await mockScadenziario(page);
  const lista = await mockListaEnte(page, notifiche);
  return { mesi, scadenziario, lista };
}

export function locators(page: Page) {
  return {
    title: page.getByRole("heading", { name: "Notifiche", exact: true }),
    // il Tooltip MUI mette aria-label sullo <span> che avvolge il bottone icona (senza nome accessibile)
    scadenziarioButton: page.getByLabel("Scadenzario contestazioni").getByRole("button"),
    scadenziarioModal: page.getByRole("presentation").filter({ hasText: "Ente Aderente" }),
    loading: page.getByText("Loading..."),
    filtra: page.getByRole("button", { name: "Filtra" }),
    annulla: page.getByRole("button", { name: "Annulla filtri" }),
    download: page.getByRole("button", { name: "Download risultati" }),
    empty: page.getByText("Non sono presenti notifiche"),
    redirectModal: page.getByText(
      "Per poter visualizzare la lista delle Notifiche è obbligatorio fornire i seguenti dati di fatturazione:",
    ),
  };
}

export async function openPage(page: Page) {
  await page.goto(ROUTE_ENTE);
  const l = locators(page);
  await l.title.waitFor();
  return l;
}
