import { docPage } from "../ente/docContabiliMock";

export * from "../ente/docContabiliMock";

// Pagina ente "Documenti contabili sospesi" (src/page/ente/docContSos.tsx)
export const sospesi = docPage({
  route: "/ente/docsospesi",
  title: "Documenti contabili sospesi",
  stato: "Sospesa",
  totaleLabel: "Credito sospeso",
  emptyMessage: "Non sono presenti fatture sospese",
  downloadPrefix: "Documenti sospesi",
  importoKey: "importoSospeso",
  api: {
    periodo: "/api/fatture/ente/periodo/sospeso",
    lista: "/api/fatture/ente/credito/sospeso",
    download: "/api/fatture/ente/sospese/download",
    dettaglio: "/api/fatture/ente/sospese/dettaglio",
  },
});

export const { api: API, mockPeriodo, mockLista, mockDettaglio, mockDownload, locators, openPage } = sospesi;

export async function mockAll(page: Parameters<typeof mockPeriodo>[0], fatture?: Parameters<typeof mockLista>[1]) {
  const periodo = await mockPeriodo(page);
  const lista = await mockLista(page, fatture);
  return { periodo, lista };
}
