import type { Page } from "@playwright/test";
import { docPage, endsWith, MockFattura, mockDownload } from "../ente/docContabiliMock";

export * from "../ente/docContabiliMock";

// Pagina ente "Documenti contabili emessi" (src/page/ente/docConEme.tsx)
export const emessi = docPage({
  route: "/ente/docemessi",
  title: "Documenti contabili emessi",
  stato: "Emessa",
  totaleLabel: "Totale fatturato",
  emptyMessage: "Non sono presenti fatture emesse",
  downloadPrefix: "Documenti emessi",
  importoKey: "importo",
  api: {
    periodo: "/api/fatture/ente/periodo",
    lista: "/api/fatture/ente/periodo/emesse",
    download: "/api/fatture/ente/emesse/download",
    dettaglio: "/api/fatture/ente/emesse/dettaglio",
  },
});

export const API_CONTESTATE = {
  lista: "/api/fatture/ente/eliminate",
  download: "/api/fatture/ente/eliminate/download",
};

export const { api: API, mockPeriodo, mockLista, mockDettaglio, mockDownload: mockDownloadEmessi } = emessi;

// Griglia "Fatture Contestate": caricata una sola volta all'apertura della pagina
export async function mockContestate(page: Page, fatture: MockFattura[] = [], status = 200) {
  let calls = 0;
  await page.route(endsWith(API_CONTESTATE.lista), (route) => {
    calls++;
    return route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(status === 200 ? { dettagli: fatture.map((fattura) => ({ fattura })), importo: 0 } : {}),
    });
  });
  return { calls: () => calls };
}

export const mockDownloadContestate = (page: Page, status = 200) => mockDownload(page, API_CONTESTATE.download, status);

export async function mockAll(page: Page, fatture?: MockFattura[], contestate: MockFattura[] = []) {
  const periodo = await mockPeriodo(page);
  const lista = await mockLista(page, fatture);
  const contestateMock = await mockContestate(page, contestate);
  return { periodo, lista, contestate: contestateMock };
}

export function locators(page: Page) {
  const base = emessi.locators(page);
  // la griglia contestate e' l'ultima tabella della pagina (le sotto-tabelle Posizioni stanno dentro la prima)
  const contestate = page.getByRole("table").last();
  return {
    ...base,
    contestate,
    rowsContestate: contestate.getByRole("row").filter({ hasText: "Emessa" }),
    emptyContestate: page.getByText("Non sono presenti fatture contestate"),
    downloadContestate: page.getByRole("button", { name: "Download risultati contestate" }),
    paginationLabelContestate: page.getByText(/^\d+–\d+ of \d+$/).last(),
    nextContestate: page.getByRole("button", { name: "Go to next page" }).last(),
    prevContestate: page.getByRole("button", { name: "Go to previous page" }).last(),
  };
}

export async function openPage(page: Page) {
  await emessi.openPage(page);
  return locators(page);
}
