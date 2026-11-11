// Mock e locator condivisi dalle pagine ente "Documenti contabili" (docemessi, docsospesi):
// stessi filtri, stessa griglia, cambiano solo API, etichette e chiave dell'importo.
import fs from "fs";
import path from "path";
import type { Page } from "@playwright/test";
import { expect } from "../../fixtures";

export const RAGIONE_SOCIALE = "Comune di San Mauro Torinese";
export const SORTABLE_COLUMNS = ["Data Fattura", "Ident.", "Tot.", "N. Fattura", "Tipo Documento"];
export const ERRORE_500 = "L'operazione non è andata a buon fine. Si prega di riprovare";
export const ERRORE_401 = "Utente non autenticato. Effettuare nuovamente l'accesso";

export type Periodo = { anno: number; mese: number; tipologiaFattura: string; dataFattura: string };

// Mock di riferimento delle spec ente-docemessi / ente-docsospesi:
// 2023 -> Settembre / SECONDO SALDO, 2024 -> Gennaio, Febbraio, Marzo / ACCONTO, PRIMO SALDO, 2025 -> Maggio / ANTICIPO
export const PERIODO: Periodo[] = [
  { anno: 2023, mese: 9, tipologiaFattura: "SECONDO SALDO", dataFattura: "2023-10-15" },
  { anno: 2024, mese: 1, tipologiaFattura: "ACCONTO", dataFattura: "2024-01-24" },
  { anno: 2024, mese: 1, tipologiaFattura: "PRIMO SALDO", dataFattura: "2024-01-24" },
  { anno: 2024, mese: 2, tipologiaFattura: "PRIMO SALDO", dataFattura: "2024-02-20" },
  { anno: 2024, mese: 3, tipologiaFattura: "ACCONTO", dataFattura: "2024-03-10" },
  { anno: 2025, mese: 5, tipologiaFattura: "ANTICIPO", dataFattura: "2025-05-20" },
];

export type MockFattura = Record<string, unknown> & {
  idfattura: number;
  totale: number;
  dataFattura: string;
  datiGeneraliDocumento: { tipologia: string }[];
  _anno: number;
  _mese: number;
};

export function makeFattura(i: number, override: Partial<MockFattura> = {}): MockFattura {
  return {
    idfattura: i + 1,
    numero: 1000 + i,
    totale: 100 + i,
    ragioneSociale: RAGIONE_SOCIALE,
    dataFattura: "2024-01-24",
    prodotto: "prod-pn",
    identificativo: `ID-${i}`,
    istitutioId: "x",
    tipoDocumento: "TD01",
    tipoContratto: "PAC",
    divisa: "EUR",
    metodoPagamento: "B30",
    causale: "test",
    split: true,
    inviata: 0,
    datiGeneraliDocumento: [{ tipologia: "PRIMO SALDO" }],
    posizioni: [],
    _anno: 2024,
    _mese: 1,
    ...override,
  };
}

export function makeFatture(n: number, override: (i: number) => Partial<MockFattura> = () => ({})): MockFattura[] {
  return Array.from({ length: n }, (_, i) => makeFattura(i, override(i)));
}

// Una fattura per ogni riga del periodo (totali 100..105, somma 615)
export const FATTURE_PERIODO: MockFattura[] = PERIODO.map((p, i) =>
  makeFattura(i, {
    dataFattura: p.dataFattura,
    identificativo: `${String(p.mese).padStart(2, "0")}/${p.anno}`,
    datiGeneraliDocumento: [{ tipologia: p.tipologiaFattura }],
    _anno: p.anno,
    _mese: p.mese,
  }),
);

const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });
export const endsWith = (suffix: string) => (url: URL) => url.pathname.endsWith(suffix);

export async function fulfillStatus(page: Page, suffix: string, status: number) {
  await page.route(endsWith(suffix), (route) => route.fulfill(json({}, status)));
}

// Endpoint di download (fetch): xlsx fittizio con breve ritardo, registra i body
export async function mockDownload(page: Page, suffix: string, status = 200) {
  const bodies: Record<string, unknown>[] = [];
  await page.route(endsWith(suffix), async (route, request) => {
    bodies.push(request.postDataJSON());
    await new Promise((r) => setTimeout(r, 500));
    await route.fulfill({
      status,
      contentType: status === 200 ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/json",
      body: status === 200 ? "xlsx" : "{}",
    });
  });
  return bodies;
}

// Sessione ente salvata da tests/auth.setup.ts, letta per ricostruire globalStatePF con un profilo diverso
function savedGlobalState(): string {
  const storage = JSON.parse(fs.readFileSync(path.join(__dirname, "../../playwright/.auth/user.json"), "utf-8"));
  const origin = storage.origins.find((o: { origin: string }) => o.origin === "http://localhost:3000");
  return origin.localStorage.find((i: { name: string }) => i.name === "globalStatePF").value;
}

// Imposta (una sola volta per pagina e chiave) globalStatePF con le modifiche indicate a mainState / profilo
export async function seedSession(
  page: Page,
  patch: { mainState?: Record<string, unknown>; profilo?: Record<string, unknown> },
  key = "seed",
) {
  await page.addInitScript(
    ([raw, p, flag]) => {
      if (location.origin !== "http://localhost:3000" || sessionStorage.getItem(flag)) return;
      const state = JSON.parse(raw);
      Object.assign(state.state.mainState, p.mainState ?? {});
      state.state.mainState.profilo = { ...state.state.mainState.profilo, ...(p.profilo ?? {}) };
      localStorage.setItem("globalStatePF", JSON.stringify(state));
      sessionStorage.setItem(flag, "1");
    },
    [savedGlobalState(), patch, key] as const,
  );
}

export async function localStorageKeys(page: Page) {
  const storage = await page.context().storageState();
  const localhost = storage.origins.find((o) => o.origin === "http://localhost:3000");
  return (localhost?.localStorage ?? []).map((item) => item.name);
}

export const savedFilters = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("filters") ?? "null"));

export type DocPageConfig = {
  route: string;
  title: string;
  stato: string;
  totaleLabel: string;
  emptyMessage: string;
  downloadPrefix: string;
  importoKey: "importo" | "importoSospeso";
  api: { periodo: string; lista: string; download: string; dettaglio: string };
};

export function docPage(config: DocPageConfig) {
  const { api } = config;

  async function mockPeriodo(page: Page, data: Periodo[] = PERIODO, status = 200) {
    let calls = 0;
    await page.route(endsWith(api.periodo), (route) => {
      calls++;
      return route.fulfill(json(status === 200 ? data : {}, status));
    });
    return { calls: () => calls };
  }

  // Simula il backend: filtra le fatture in base al body della POST.
  // `state` permette di cambiare fatture/importo/status/ritardo durante il test.
  async function mockLista(page: Page, fatture: MockFattura[] = FATTURE_PERIODO, importo?: number) {
    const state = { fatture, importo, status: 200, delayMs: 0, bodies: [] as Record<string, unknown>[] };
    await page.route(endsWith(api.lista), async (route, request) => {
      const body = request.postDataJSON() ?? {};
      state.bodies.push(body);
      if (state.delayMs) await new Promise((r) => setTimeout(r, state.delayMs));
      if (state.status !== 200) return route.fulfill(json({}, state.status));
      const filtered = state.fatture.filter(
        (f) =>
          (body.anno == null || f._anno === body.anno) &&
          (body.mese == null || f._mese === body.mese) &&
          (!body.tipologiaFattura?.length || body.tipologiaFattura.includes(f.datiGeneraliDocumento[0].tipologia)) &&
          (!body.dataFattura?.length || body.dataFattura.includes(f.dataFattura)),
      );
      const totale = state.importo ?? filtered.reduce((acc, f) => acc + f.totale, 0);
      return route.fulfill(json({ dettagli: filtered.map((fattura) => ({ fattura })), [config.importoKey]: totale }));
    });
    return state;
  }

  async function mockDettaglio(page: Page, rel: Record<string, unknown>) {
    await page.route(endsWith(api.dettaglio), (route) =>
      route.fulfill(
        json({
          idTestata: "1", idEnte: "x", ragioneSociale: RAGIONE_SOCIALE, dataDocumento: null, idDocumento: "", cup: "",
          idContratto: "", totaleAnalogico: 0, totaleDigitale: 0, totaleNotificheAnalogiche: 0, totaleNotificheDigitali: 0,
          totale: 0, datiFatturazione: false, iva: 0, totaleAnalogicoIva: 0, totaleDigitaleIva: 0, totaleIva: 0,
          firmata: "", caricata: 0, fattureSospese: [], accontoAnalogico: 0, accontoDigitale: 0, stornoAnalogico: 0,
          stornoDigitale: 0, ...rel,
        }),
      ),
    );
  }

  function locators(page: Page) {
    const table = page.getByRole("table").first();
    const columnHeader = (column: string, inTable = table) =>
      inTable.getByRole("columnheader", { name: `${column}Sort`, exact: true });
    return {
      heading: page.getByRole("heading", { name: config.title }),
      nav: page.getByRole("navigation"),
      anno: page.getByRole("combobox").nth(0),
      mese: page.getByRole("combobox").nth(1),
      tipologia: page.getByRole("combobox", { name: "Tipologia Fattura" }),
      dataFattura: page.getByRole("combobox", { name: "Data Fattura" }),
      // i chip mostrano solo un'icona: il valore e' l'aria-label (tooltip)
      chip: (value: string) => page.getByRole("button", { name: value, exact: true }),
      filtra: page.getByRole("button", { name: "Filtra", exact: true }),
      annulla: page.getByRole("button", { name: "Annulla filtri" }),
      totaleLabel: page.getByText(config.totaleLabel, { exact: true }),
      totale: page.getByRole("heading", { level: 6 }).filter({ hasText: /^(--|-?[\d.]+,\d{2}\s€)$/ }),
      download: page.getByRole("button", { name: "Download risultati", exact: true }),
      table,
      rows: table.getByRole("row").filter({ hasText: config.stato }),
      empty: page.getByText(config.emptyMessage),
      paginationLabel: page.getByText(/^\d+–\d+ of \d+$/).first(),
      next: page.getByRole("button", { name: "Go to next page" }).first(),
      prev: page.getByRole("button", { name: "Go to previous page" }).first(),
      rowsPerPage: page.getByRole("combobox", { name: /Rows per page/ }).first(),
      loading: page.getByText("Loading..."),
      columnHeader,
      sortButton: (column: string, inTable = table) => columnHeader(column, inTable).getByRole("button"),
    };
  }

  async function openPage(page: Page) {
    await page.goto(config.route);
    const l = locators(page);
    await expect(l.heading).toBeVisible();
    await expect(l.loading).toBeHidden();
    return l;
  }

  return {
    config,
    api,
    mockPeriodo,
    mockLista,
    mockDettaglio,
    mockDownload: (page: Page, status = 200) => mockDownload(page, api.download, status),
    locators,
    openPage,
  };
}

export type DocLocators = ReturnType<ReturnType<typeof docPage>["locators"]>;

// Colore di sfondo del riquadro del totale (Paper che contiene l'etichetta)
export async function totaleBackground(l: DocLocators) {
  return l.totaleLabel.evaluate((el) => getComputedStyle(el.parentElement as HTMLElement).backgroundColor);
}

export async function selectOption(page: Page, combobox: ReturnType<Page["getByRole"]>, option: string) {
  await combobox.click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

export async function selectTipologie(page: Page, l: DocLocators, ...values: string[]) {
  await l.tipologia.click();
  for (const v of values) await page.getByRole("option", { name: v, exact: true }).click();
  await page.keyboard.press("Escape");
}

// Apre Data Fattura da tastiera: dopo un cambio di tipologia la label animata copre l'input
export async function openDate(l: DocLocators) {
  await l.dataFattura.focus();
  await l.dataFattura.press("ArrowDown");
}

export async function selectDate(page: Page, l: DocLocators, ...values: string[]) {
  await openDate(l);
  for (const v of values) await page.getByRole("option", { name: v, exact: true }).click();
  await page.keyboard.press("Escape");
}

// Rimuove un chip da tastiera (Delete sul chip attiva onDelete)
export async function removeChip(l: DocLocators, value: string) {
  await l.chip(value).focus();
  await l.chip(value).press("Delete");
}
