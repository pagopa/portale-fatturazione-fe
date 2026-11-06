// spec: specs/dettaglioRelEmessiSospesi.md (sezione 1)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  API, ID_CONTRATTO, RAGIONE_SOCIALE, SECTIONS, detailUrl, locators as detailLocators, makeRel, mockDettaglio,
  mockLogFirmato, openDettaglio, seedTipoContratto, type Section,
} from "../../utils/dettaglioRelEmessiSospesi/dettaglioMock";
import {
  mockAll as mockAllEmessi, openPage as openPageEmessi, selectOption,
} from "../../utils/docemessi/docEmessiMock";
import { mockAll as mockAllSospesi, openPage as openPageSospesi } from "../../utils/docsospesi/docSospesiMock";

const ALL_SECTIONS: Section[] = ["rel", "documentiemessi", "documentisospesi"];

const LIST_HEADING: Record<Section, string> = {
  rel: "Regolare esecuzione / Documenti di cortesia",
  documentiemessi: "Documenti contabili emessi",
  documentisospesi: "Documenti contabili sospesi",
};

const json = (body: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify(body) });

// Lista Regolare Esecuzione (src/page/prod_pn/relUtPa.tsx): una sola riga PRIMO SALDO, idTestata 123
async function mockRelList(page: Page) {
  const state = { lista: 0 };
  await page.route((url) => url.pathname.endsWith("/api/rel/anni"), (route) => route.fulfill(json([2024])));
  await page.route((url) => url.pathname.endsWith("/api/rel/mesi"), (route) =>
    route.fulfill(json([{ mese: 3, descrizione: "MARZO" }])),
  );
  await page.route((url) => url.pathname.endsWith("/api/rel/tipologiafattura"), (route) =>
    route.fulfill(json(["PRIMO SALDO"])),
  );
  await page.route((url) => url.pathname === "/api/rel/ente", (route) => {
    state.lista++;
    return route.fulfill(
      json({
        relTestate: [{
          idTestata: "123", ragioneSociale: RAGIONE_SOCIALE, tipologiaFattura: "PRIMO SALDO", tipologiaContratto: "PAC",
          firmata: "Non Caricata", idContratto: ID_CONTRATTO, anno: 2024, mese: 3, totaleAnalogico: 100, totaleDigitale: 200,
          totaleNotificheAnalogiche: 10, totaleNotificheDigitali: 20, totale: 300, caricata: 0,
        }],
        count: 1,
      }),
    );
  });
  return state;
}

// Mock della lista di destinazione del pulsante Indietro
async function mockLista(page: Page, section: Section) {
  if (section === "rel") return mockRelList(page);
  return section === "documentiemessi" ? mockAllEmessi(page) : mockAllSospesi(page);
}

// Dettaglio con risposta trattenuta finche' non viene chiamato release()
async function mockDettaglioGated(page: Page, section: Section, rel: Record<string, unknown>) {
  const id = String(rel.idTestata ?? "123");
  const suffix = section === "rel" ? API.rel(id) : section === "documentiemessi" ? API.dettaglioEmessi : API.dettaglioSospesi;
  const state = { calls: 0 };
  let release: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route((url) => url.pathname.endsWith(suffix), async (route) => {
    state.calls++;
    await gate;
    await route.fulfill(json(rel));
  });
  return { state, release: () => release() };
}

test.describe("Titolo, breadcrumb, navigazione e caricamento", () => {
  test("Breadcrumb e pulsante Indietro per ciascuna sezione", async ({ page }) => {
    await seedTipoContratto(page, 2);

    for (const section of ALL_SECTIONS) {
      await test.step(SECTIONS[section].breadcrumb, async () => {
        await mockLista(page, section);

        // 1. Parametrizzare su 3 sezioni: REL, EMESSI, SOSPESI con tipologia PRIMO SALDO
        const { l } = await openDettaglio(page, section, makeRel({ idTestata: "1", tipologiaFattura: "PRIMO SALDO" }));

        // expect: Il NavigatorHeader mostra la sezione seguita da 'Dettaglio' in grassetto
        await expect(page.getByText(SECTIONS[section].breadcrumb, { exact: true })).toBeVisible();
        await expect(page.getByText("Dettaglio", { exact: true })).toBeVisible();
        await expect(page.getByText("Dettaglio", { exact: true })).toHaveCSS("font-weight", "700");
        // expect: Il pulsante 'Indietro' e' visibile
        await expect(l.indietro).toBeVisible();
        // expect: Il heading 'Dati di Fatturazione' e' visibile
        await expect(l.card("Dati di Fatturazione")).toBeVisible();

        // 2. Cliccare 'Indietro'
        await l.indietro.click();

        // expect: URL della lista della sezione
        await expect(page).toHaveURL(SECTIONS[section].backUrl);
        // expect: La pagina lista della sezione e' visualizzata
        await expect(page.getByRole("heading", { name: LIST_HEADING[section] })).toBeVisible();
        await expect(page.getByText("Loading...")).toBeHidden();
        await expect(l.card("Dati di Fatturazione")).toHaveCount(0);
      });
    }
  });

  test("Skeleton durante il caricamento", async ({ page, unmockedApi }) => {
    await seedTipoContratto(page, 2);

    for (const section of ALL_SECTIONS) {
      await test.step(SECTIONS[section].breadcrumb, async () => {
        const rel = makeRel({ idTestata: "1" });
        const l = detailLocators(page);
        if (section === "rel") await mockLogFirmato(page);

        // 1. Mockare l'API di dettaglio con una promise controllata (risposta ritardata) e aprire il dettaglio
        const { state, release } = await mockDettaglioGated(page, section, rel);
        await page.goto(detailUrl(section, "1"));
        await expect.poll(() => state.calls).toBe(1);

        // expect: Viene mostrato lo skeleton (nessun heading 'Dati di Fatturazione', nessun breadcrumb, nessun 'Indietro')
        await expect(l.card("Dati di Fatturazione")).toBeHidden();
        await expect(page.getByText(SECTIONS[section].breadcrumb, { exact: true })).toBeHidden();
        await expect(l.indietro).toBeHidden();
        // expect: Nessun pulsante di download visibile
        await expect(l.downloadReport(section)).toHaveCount(0);
        await expect(l.downloadPdf(section)).toHaveCount(0);
        await expect(l.downloadFirmato).toHaveCount(0);

        // 2. Rilasciare la risposta
        release();

        // expect: Lo skeleton scompare e compaiono breadcrumb e card
        await expect(l.card("Dati di Fatturazione")).toBeVisible();
        await expect(page.getByText(SECTIONS[section].breadcrumb, { exact: true })).toBeVisible();
        await expect(l.indietro).toBeVisible();
        // expect: Una sola chiamata all'API di dettaglio
        expect(state.calls).toBe(1);
      });
    }
    expect(unmockedApi).toEqual([]);
  });

  test("Dettaglio aperto dalla griglia della lista (EMESSI e SOSPESI)", async ({ page }) => {
    const sezioni = [
      { section: "documentiemessi" as const, mockAll: mockAllEmessi, openPage: openPageEmessi, listPath: /\/ente\/docemessi$/ },
      { section: "documentisospesi" as const, mockAll: mockAllSospesi, openPage: openPageSospesi, listPath: /\/ente\/docsospesi$/ },
    ];

    for (const { section, mockAll, openPage, listPath } of sezioni) {
      await test.step(SECTIONS[section].breadcrumb, async () => {
        await mockAll(page);
        const dettaglio = await mockDettaglio(
          page, section, makeRel({ idTestata: "4", tipologiaFattura: "PRIMO SALDO", anno: 2024, mese: 2 }),
        );
        const d = detailLocators(page);
        const l = await openPage(page);

        // 1. Dalla lista cliccare su una riga (fattura id 4, PRIMO SALDO 02/2024)
        await selectOption(page, l.anno, "2024");
        await selectOption(page, l.mese, "Febbraio");
        await l.filtra.click();
        await expect(l.rows).toHaveCount(1);
        await l.rows.first().getByRole("cell").nth(1).click();

        // expect: URL /ente/fatturapdf/<sezione>/<idfattura>
        await expect(page).toHaveURL(new RegExp(`/ente/fatturapdf/${section}/4$`));
        await expect(d.card("Dati di Fatturazione")).toBeVisible();
        // expect: Body della POST di dettaglio { Idfattura: <idfattura> }
        expect(dettaglio.calls).toBe(1);
        expect(String((dettaglio.requests[0].body as { Idfattura: unknown }).Idfattura)).toBe("4");
        // expect: Tipologia, anno e mese corrispondono alla riga selezionata
        await expect(d.value("Tipologia Fattura")).toHaveText("PRIMO SALDO");
        await expect(d.value("Anno")).toHaveText("2024");
        await expect(d.value("Mese")).toHaveText("Febbraio");

        // 2. Cliccare 'Indietro' e poi tornare alla pagina dettaglio con il back del browser
        await d.indietro.click();

        // expect: Si torna alla lista con i filtri persistiti
        await expect(page).toHaveURL(listPath);
        await expect(l.anno).toHaveText("2024");
        await expect(l.mese).toHaveText("Febbraio");
        await expect(l.annulla).toBeVisible();
        await expect(l.rows).toHaveCount(1);

        await page.goBack();

        // expect: Dopo il back del browser il dettaglio viene ricaricato correttamente
        await expect(page).toHaveURL(new RegExp(`/ente/fatturapdf/${section}/4$`));
        await expect(d.card("Dati di Fatturazione")).toBeVisible();
        await expect(d.value("Tipologia Fattura")).toHaveText("PRIMO SALDO");
        expect(dettaglio.calls).toBe(2);
      });
    }
  });

  test("Dettaglio REL aperto dalla lista Regolare Esecuzione (idTipoContratto 2)", async ({ page }) => {
    await seedTipoContratto(page, 2);
    await mockRelList(page);
    const dettaglio = await mockDettaglio(page, "rel", makeRel({ idTestata: "123" }));
    await mockLogFirmato(page);
    const d = detailLocators(page);

    // 1. Con sessione idTipoContratto 2 aprire /ente/listarel (mock lista) e cliccare una riga
    await page.goto("/ente/listarel");
    await expect(page.getByRole("heading", { name: LIST_HEADING.rel })).toBeVisible();
    await page.getByRole("cell", { name: RAGIONE_SOCIALE }).first().click();

    // expect: URL /ente/fatturapdf/rel/<idTestata>
    await expect(page).toHaveURL(/\/ente\/fatturapdf\/rel\/123$/);
    await expect(d.card("Dati di Fatturazione")).toBeVisible();
    // expect: GET /api/rel/ente/<idTestata> chiamata una volta
    expect(dettaglio.calls).toBe(1);
    expect(new URL(dettaglio.requests[0].url).pathname).toBe("/api/rel/ente/123");
    // expect: Breadcrumb 'Regolare Esecuzione/ Dettaglio'
    await expect(page.getByText("Regolare Esecuzione/", { exact: true })).toBeVisible();
    await expect(page.getByText("Dettaglio", { exact: true })).toBeVisible();
    // expect: Voce di menu 'Regolare Esecuzione' evidenziata
    await expect(page.getByRole("navigation").getByRole("button", { name: /Regolare esecuzione/ })).toHaveClass(/Mui-selected/);
  });

  test("Voci di menu evidenziate nelle tre sezioni", async ({ page, unmockedApi }) => {
    const voci = [
      { section: "documentiemessi" as const, selected: "Documenti contabili emessi", other: "Documenti contabili sospesi" },
      { section: "documentisospesi" as const, selected: "Documenti contabili sospesi", other: "Documenti contabili emessi" },
    ];
    const nav = page.getByRole("navigation");

    for (const { section, selected, other } of voci) {
      await test.step(SECTIONS[section].breadcrumb, async () => {
        // 1. Aprire il dettaglio EMESSI e SOSPESI e osservare il menu laterale
        await openDettaglio(page, section, makeRel({ idTestata: "1" }));

        // expect: EMESSI: voce 'Documenti Emessi' selezionata; SOSPESI: voce 'Documenti Sospesi' selezionata
        await expect(nav.getByRole("button", { name: selected })).toHaveClass(/Mui-selected/);
        await expect(nav.getByRole("button", { name: other })).not.toHaveClass(/Mui-selected/);
      });
    }
    expect(unmockedApi).toEqual([]);
  });

  test("Accesso diretto via URL a REL con idTipoContratto 1", async ({ page }) => {
    // Bug 12: la route /ente/fatturapdf/rel/:id non ha guardie (la guardia e' solo sulla lista /ente/listarel),
    // quindi oggi il dettaglio REL e' visibile anche a idTipoContratto 1. Il test descrive il comportamento corretto.
    test.fail();

    // 1. Con sessione idTipoContratto 1 aprire direttamente /ente/fatturapdf/rel/1 con GET /api/rel/ente/1 mockata 200
    await seedTipoContratto(page, 1);
    await mockDettaglio(page, "rel", makeRel({ idTestata: "1" }));
    await mockLogFirmato(page);
    const d = detailLocators(page);
    await page.goto(detailUrl("rel", "1"));

    // expect: la sezione Regolare Esecuzione non e' accessibile a idTipoContratto 1 (redirect, nessun dettaglio)
    await expect(page).not.toHaveURL(/\/ente\/fatturapdf\/rel\//);
    await expect(d.card("Dati di Fatturazione")).toBeHidden();
  });

  test("Ricarica pagina (F5) sul dettaglio", async ({ page, unmockedApi }) => {
    await seedTipoContratto(page, 2);

    for (const section of ALL_SECTIONS) {
      await test.step(SECTIONS[section].breadcrumb, async () => {
        const { l, dettaglio } = await openDettaglio(page, section, makeRel({ idTestata: "1" }));
        await expect(l.value("Soggetto Aderente")).toHaveText(RAGIONE_SOCIALE);
        await expect(l.value("Tipo Contratto")).toHaveText("PAC - PAL con requisiti");
        expect(dettaglio.calls).toBe(1);

        // 1. Sul dettaglio caricato eseguire page.reload()
        await page.reload();

        // expect: la pagina richiama l'API di dettaglio e mostra gli stessi dati (stato reidratato)
        await expect(l.card("Dati di Fatturazione")).toBeVisible();
        await expect(l.value("Soggetto Aderente")).toHaveText(RAGIONE_SOCIALE);
        await expect(l.value("Tipo Contratto")).toHaveText("PAC - PAL con requisiti");
        expect(dettaglio.calls).toBe(2);
        // expect: nessun redirect alla lista
        await expect(page).toHaveURL(new RegExp(`${detailUrl(section, "1")}$`));
        await expect(page.getByText(SECTIONS[section].breadcrumb, { exact: true })).toBeVisible();
      });
    }
    expect(unmockedApi).toEqual([]);
  });

  test("ID inesistente o URL non valido", async ({ page }) => {
    await mockAllEmessi(page);
    const d = detailLocators(page);

    // 1. Aprire /ente/fatturapdf/documentiemessi/999999 con dettaglio 404
    const dettaglio = await mockDettaglio(page, "documentiemessi", makeRel({ idTestata: "999999" }), { status: 404 });
    await page.goto(detailUrl("documentiemessi", "999999"));

    // expect: Si naviga a /ente/docemessi e compare l'errore 404 del layout
    await expect(page).toHaveURL(/\/ente\/docemessi$/);
    await expect(page.getByText("La ricerca non ha prodotto risultati")).toBeVisible();
    await expect(page.getByRole("heading", { name: LIST_HEADING.documentiemessi })).toBeVisible();
    await expect(d.card("Dati di Fatturazione")).toHaveCount(0);
    expect(dettaglio.calls).toBe(1);
  });

  test("ID inesistente o URL non valido: pageFrom non previsto", async ({ page }) => {
    // Bug 14: con pageFrom non previsto `res` e' undefined, il TypeError su res.data finisce nel catch con
    // navigate(undefined) (profilePath non definito) e l'utente resta su un dettaglio vuoto/incoerente.
    // Il test descrive il comportamento corretto: nessun dettaglio mostrato e redirect fuori dall'URL non valido.
    test.fail();
    const chiamate: string[] = [];
    page.on("request", (r) => { if (/\/api\/(rel|fatture)\//.test(r.url())) chiamate.push(`${r.method()} ${new URL(r.url()).pathname}`); });
    const d = detailLocators(page);

    // 2. Aprire /ente/fatturapdf/altro/1 (pageFrom non previsto)
    await page.goto("/ente/fatturapdf/altro/1");

    // expect: nessuna API di dettaglio chiamata, nessun dettaglio mostrato e redirect alla lista
    await expect(page).not.toHaveURL(/\/ente\/fatturapdf\/altro\/1$/);
    await expect(d.card("Dati di Fatturazione")).toBeHidden();
    expect(chiamate).toEqual([]);
  });
});
