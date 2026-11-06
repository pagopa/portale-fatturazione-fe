import type { Page } from "@playwright/test";
import { endsWith } from "../ente/docContabiliMock";

export { endsWith, seedSession, savedFilters, ERRORE_500, ERRORE_401 } from "../ente/docContabiliMock";

// Pagina ente "Download documenti" (src/page/ente/asyncDocumenti.tsx) - spec: specs/ente-asyncDocumenti.md
export const ROUTE = "/ente/downloaddocumenti";

export const API = {
  lista: "/api/notifiche/richiesta",
  download: "/api/notifiche/richiesta/download",
  count: "/api/notifiche/richiesta/count",
};

export const STATI = ["Presa in carico", "Elaborato", "Elaborato no data", "Errore"] as const;
export type Stato = (typeof STATI)[number];

export type MockDocumento = {
  reportId: number;
  dataInserimento: string;
  anno: number;
  mese: number;
  count: number;
  dataFine: string | null;
  stato: number;
  descrizioneStato: Stato;
  letto: boolean;
  // stringa JSON (la riga espandibile fa JSON.parse) oppure null/assente
  json?: string | null;
};

export function makeDocumento(i: number, override: Partial<MockDocumento> = {}): MockDocumento {
  const stato = (i % 4) as 0 | 1 | 2 | 3;
  return {
    reportId: 1000 + i,
    dataInserimento: `2026-09-${String((i % 28) + 1).padStart(2, "0")}T10:00:00`,
    anno: 2026,
    mese: 9,
    count: 10 + i,
    dataFine: `2026-09-${String((i % 28) + 1).padStart(2, "0")}T11:30:00`,
    stato,
    descrizioneStato: STATI[stato],
    letto: i % 2 === 0,
    json: JSON.stringify({ anno: 2026, mese: 9, tipoNotifica: 1, cap: "10099", iun: `IUN-${i}`, statoContestazione: [1] }),
    ...override,
  };
}

export const makeDocumenti = (n: number, override: (i: number) => Partial<MockDocumento> = () => ({})) =>
  Array.from({ length: n }, (_, i) => makeDocumento(i, override(i)));

const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

export type ListaRequest = { query: Record<string, string>; body: { init: string | null; end: string | null; ordinamento: number } };

// Lista paginata server-side (POST /api/notifiche/richiesta): registra query e body di ogni richiesta.
// `status` puo' essere una funzione del numero di chiamata (1-based) per simulare errori solo su alcune chiamate.
export async function mockLista(
  page: Page,
  documenti: MockDocumento[] = makeDocumenti(25),
  status: number | ((call: number) => number) = 200,
) {
  const requests: ListaRequest[] = [];
  await page.route(endsWith(API.lista), (route, request) => {
    const query = Object.fromEntries(new URL(request.url()).searchParams);
    requests.push({ query, body: request.postDataJSON() });
    const s = typeof status === "function" ? status(requests.length) : status;
    if (s !== 200) return route.fulfill(json({}, s));
    const p = Number(query.page) || 1;
    const size = Number(query.pageSize) || 10;
    return route.fulfill(json({ items: documenti.slice((p - 1) * size, p * size), count: documenti.length }));
  });
  return requests;
}

// GET /api/notifiche/richiesta/download?idReport=: risponde con un data URL (il link scarica 'Notifiche.csv')
export async function mockDownload(page: Page, status = 200) {
  const idReport: string[] = [];
  await page.route(endsWith(API.download), (route, request) => {
    idReport.push(new URL(request.url()).searchParams.get("idReport") ?? "");
    return route.fulfill(json(status === 200 ? "data:text/csv;charset=utf-8,a%2Cb%0A1%2C2" : {}, status));
  });
  return idReport;
}

// richiesta/count: l'header lo chiama anche al caricamento. Finche' non e' "armato" risponde 0 e non conta.
export async function mockCount(page: Page, valore = 3, status = 200) {
  const count = { n: 0, armed: false };
  await page.route(endsWith(API.count), (route) => {
    if (!count.armed) return route.fulfill(json(0));
    count.n++;
    return route.fulfill(json(status === 200 ? valore : {}, status));
  });
  return count;
}

export async function mockAll(page: Page, documenti?: MockDocumento[]) {
  const lista = await mockLista(page, documenti);
  return { lista };
}

export function locators(page: Page) {
  return {
    title: page.getByRole("heading", { name: "Download documenti", exact: true }),
    dataInizio: page.getByRole("textbox", { name: "Data inizio" }),
    dataFine: page.getByRole("textbox", { name: "Data fine" }),
    loading: page.getByText("Loading..."),
    downloading: page.getByText("Downloading..."),
    filtra: page.getByRole("button", { name: "Filtra" }),
    annulla: page.getByRole("button", { name: "Annulla filtri" }),
    empty: page.getByText("Non sono presenti documenti"),
    // righe dati (ogni riga e' seguita da una riga collapse vuota)
    rows: page.getByRole("row").filter({ has: page.getByRole("button", { name: "expand row" }) }),
    paginationLabel: page.getByText(/^\d+–\d+ of \d+$/).first(),
    next: page.getByRole("button", { name: "Go to next page" }),
    previous: page.getByRole("button", { name: "Go to previous page" }),
    redirectModal: page.getByText(
      "Per poter visualizzare la sezione Download Documenti è obbligatorio fornire i seguenti dati di fatturazione:",
    ),
  };
}

export async function openPage(page: Page) {
  await page.goto(ROUTE);
  const l = locators(page);
  await l.title.waitFor();
  return l;
}
