// spec: specs/ente-moduloCommessaElenco.md (sezione 5)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  ROUTE, TESTO_FACOLTATIVO, infoTrimestre, locators as baseLocators, makeModulo, mockAll, mockDettaglioInserimento, openPage,
  type MockModulo,
} from "../../utils/moduloCommessaElencoMock/moduloCommessaElencoMock";

const URL_INSERIMENTO = /\/ente\/modulocommessa$/;

function griglia(page: Page) {
  return {
    ...baseLocators(page),
    riga: (mese: string, anno = 2026) => page.getByRole("row", { name: new RegExp(`^${mese}\\/${anno} `) }),
  };
}

// Apre la pagina con i moduli indicati e attende le righe
async function ready(page: Page, opts: { verifica: boolean; moduli: MockModulo[] }) {
  await mockAll(page, opts);
  await openPage(page);
  const l = griglia(page);
  await expect(l.rows).toHaveCount(opts.moduli.length);
  return l;
}

// Profilo persistito nello stato globale (per idTipoContratto/prodotto/idEnte)
const profilo = (page: Page) =>
  page.evaluate(() => {
    const p = JSON.parse(localStorage.getItem("globalStatePF") ?? "{}")?.state?.mainState?.profilo ?? {};
    return { idTipoContratto: p.idTipoContratto, prodotto: p.prodotto, idEnte: p.idEnte };
  });

test.describe("Click su riga", () => {
  test("verifica=true, source facoltativo: ModalInfo", async ({ page }) => {
    // 1. verifica true, redirectToInsert=false; cliccare la cella Mese/Anno di una riga facoltativo
    const l = await ready(page, { verifica: true, moduli: [makeModulo(2026, 3)] });
    await l.riga("Marzo").getByRole("cell", { name: "Marzo/2026", exact: true }).click();

    // expect: Modale con il testo sui moduli OBBLIGATORI
    await expect(page.getByText(TESTO_FACOLTATIVO)).toBeVisible();
    // expect: URL resta /ente/modulicommessa
    await expect(page).toHaveURL(/\/ente\/modulicommessa$/);
    // expect: infoTrimestreComSelected invariato ({})
    await expect.poll(() => infoTrimestre(page)).toEqual({});
    // expect: Resto della pagina aria-hidden
    await expect(l.title).toBeHidden();

    // 2. Chiudere il modale
    await page.keyboard.press("Escape");

    // expect: Modale chiuso, pagina interattiva
    await expect(page.getByText(TESTO_FACOLTATIVO)).toBeHidden();
    await expect(l.title).toBeVisible();

    // 3. Ripetere cliccando la freccia della stessa riga
    await l.riga("Marzo").getByRole("cell").last().getByRole("button").click();

    // expect: Stesso modale
    await expect(page.getByText(TESTO_FACOLTATIVO)).toBeVisible();
    await expect(page).toHaveURL(/\/ente\/modulicommessa$/);
  });

  test("verifica=true, source archiviato: navigazione con stato", async ({ page }) => {
    // 1. Cliccare una riga archiviato (es. 3/2026)
    const l = await ready(page, { verifica: true, moduli: [makeModulo(2026, 3, { source: "archiviato" })] });
    await l.riga("Marzo").getByRole("cell", { name: "Marzo/2026", exact: true }).click();

    // expect: URL /ente/modulocommessa
    await expect(page).toHaveURL(URL_INSERIMENTO);

    // expect: infoTrimestreComSelected valorizzato con mese/anno e indici
    await expect.poll(async () => (await infoTrimestre(page))?.meseCommessaSelected).toBe("3");
    const info = await infoTrimestre(page);
    const p = await profilo(page);
    expect(info).toMatchObject({
      meseCommessaSelected: "3",
      annoCommessaSelectd: "2026",
      quarterSelectedIndex: 0,
      moduloSelectedIndex: 0,
      idTipoContratto: p.idTipoContratto,
      prodotto: p.prodotto,
      idEnte: p.idEnte,
    });

    // expect: moduli[0]: id '3/2026', meseAnno 'Marzo/2026', stato 'Archiviato', dataChiusura '--'
    expect(info.moduli).toHaveLength(1);
    expect(info.moduli[0]).toMatchObject({ id: "3/2026", meseAnno: "Marzo/2026", stato: "Archiviato", dataChiusura: "--" });
  });

  test("verifica=true, source obbligatorio: navigazione senza stato", async ({ page }) => {
    // 1. Cliccare una riga obbligatorio
    const l = await ready(page, { verifica: true, moduli: [makeModulo(2026, 1)] });
    await l.riga("Gennaio").getByRole("cell", { name: "Gennaio/2026", exact: true }).click();

    // expect: URL /ente/modulocommessa
    await expect(page).toHaveURL(URL_INSERIMENTO);

    // expect: infoTrimestreComSelected resta {} (nessun handleModifyMainState)
    await expect.poll(() => infoTrimestre(page)).toEqual({});
  });

  test("verifica=false: ogni source naviga con stato", async ({ page }) => {
    const moduli = [makeModulo(2026, 1), makeModulo(2026, 2), makeModulo(2026, 3)];
    await mockAll(page, { verifica: false, moduli });

    const casi = [
      { mese: "Gennaio", n: "1", stato: "Obbligatorio", chiusura: "2026-01-15" },
      { mese: "Febbraio", n: "2", stato: "Archiviato", chiusura: "--" },
      { mese: "Marzo", n: "3", stato: "Facoltativo", chiusura: "TBD" },
    ];
    for (const c of casi) {
      // 1. Con verifica false cliccare una riga per ciascun source
      const l = await openPage(page).then(() => griglia(page));
      await expect(l.rows).toHaveCount(3);
      await l.riga(c.mese).getByRole("cell", { name: `${c.mese}/2026`, exact: true }).click();

      // expect: Nessun modale 'moduli OBBLIGATORI'
      await expect(page.getByText(TESTO_FACOLTATIVO)).toHaveCount(0);

      // expect: Navigazione a /ente/modulocommessa con infoTrimestreComSelected valorizzato
      await expect(page).toHaveURL(URL_INSERIMENTO);
      await expect.poll(async () => (await infoTrimestre(page))?.meseCommessaSelected).toBe(c.n);

      // expect: dataChiusura nel modulo: TBD / -- / data prima della T
      const info = await infoTrimestre(page);
      expect(info.moduli[0]).toMatchObject({ stato: c.stato, dataChiusura: c.chiusura });
    }
  });

  test("Parsing mese a una cifra (lunghezza 6)", async ({ page }) => {
    await mockAll(page, { verifica: false, moduli: [makeModulo(2026, 1), makeModulo(2026, 9)] });

    for (const [mese, n] of [["Gennaio", "1"], ["Settembre", "9"]]) {
      // 1. Cliccare righe con mese 1 e mese 9 (verifica false)
      await openPage(page);
      const l = griglia(page);
      await expect(l.rows).toHaveCount(2);
      await l.riga(mese).getByRole("cell", { name: `${mese}/2026`, exact: true }).click();

      // expect: '1/2026' -> mese '1', '9/2026' -> mese '9', anno '2026'
      await expect(page).toHaveURL(URL_INSERIMENTO);
      await expect.poll(async () => (await infoTrimestre(page))?.meseCommessaSelected).toBe(n);
      expect(await infoTrimestre(page)).toMatchObject({ meseCommessaSelected: n, annoCommessaSelectd: "2026" });
    }
  });

  test("Parsing mese a due cifre (lunghezza 7)", async ({ page }) => {
    await mockAll(page, { verifica: false, moduli: [makeModulo(2026, 10), makeModulo(2026, 11), makeModulo(2026, 12)] });

    for (const [mese, n] of [["Ottobre", "10"], ["Novembre", "11"], ["Dicembre", "12"]]) {
      // 1. Cliccare righe con mese 10, 11 e 12
      await openPage(page);
      const l = griglia(page);
      await expect(l.rows).toHaveCount(3);
      await l.riga(mese).getByRole("cell", { name: `${mese}/2026`, exact: true }).click();

      // expect: '10/2026' -> mese '10', anno '2026' (nessun troncamento)
      await expect(page).toHaveURL(URL_INSERIMENTO);
      await expect.poll(async () => (await infoTrimestre(page))?.meseCommessaSelected).toBe(n);
      expect(await infoTrimestre(page)).toMatchObject({ meseCommessaSelected: n, annoCommessaSelectd: "2026" });
    }
  });

  test("Click da cella Mese/Anno o freccia, non da altre celle", async ({ page }) => {
    await mockAll(page, { verifica: false, moduli: [makeModulo(2026, 3)] });

    // 1. Cliccare il nome del mese
    await openPage(page);
    let l = griglia(page);
    await expect(l.rows).toHaveCount(1);
    await l.riga("Marzo").getByRole("cell", { name: "Marzo/2026", exact: true }).click();
    await expect(page).toHaveURL(URL_INSERIMENTO);
    await expect.poll(async () => (await infoTrimestre(page))?.meseCommessaSelected).toBe("3");
    const daMese = await infoTrimestre(page);

    // 1. Poi cliccare la freccia della stessa riga
    await page.goto(ROUTE);
    l = griglia(page);
    await expect(l.rows).toHaveCount(1);
    await l.riga("Marzo").getByRole("cell").last().getByRole("button").click();

    // expect: Entrambi eseguono la stessa azione
    await expect(page).toHaveURL(URL_INSERIMENTO);
    await expect.poll(async () => (await infoTrimestre(page))?.meseCommessaSelected).toBe("3");
    expect(await infoTrimestre(page)).toEqual(daMese);
  });

  test("Click su altre celle non naviga e non apre modali", async ({ page }) => {
    // 1. Click su celle Stato, Inserimento, date e totali (verifica true, riga facoltativo)
    const l = await ready(page, { verifica: true, moduli: [makeModulo(2026, 3)] });
    const celle = l.riga("Marzo").getByRole("cell");

    // expect: Click su altre celle (Stato, Inserimento, Totali) non naviga e non apre modali
    for (let i = 1; i <= 10; i++) {
      await celle.nth(i).click();
    }
    await expect(page).toHaveURL(/\/ente\/modulicommessa$/);
    await expect(page.getByText(TESTO_FACOLTATIVO)).toHaveCount(0);
    await expect(l.title).toBeVisible();
    await expect.poll(() => infoTrimestre(page)).toEqual({});
  });

  test("Riga con source assente o null", async ({ page }) => {
    // 1. Mockare una riga senza source e cliccarla
    const l = await ready(page, { verifica: false, moduli: [makeModulo(2026, 3, { source: null })] });

    // expect: Colonna Stato mostra icona senza tooltip (label vuoto)
    await expect(l.riga("Marzo")).toBeVisible();
    await expect(l.riga("Marzo").getByLabel("Obbligatorio")).toHaveCount(0);
    await expect(l.riga("Marzo").getByLabel("Archiviato")).toHaveCount(0);
    await expect(l.riga("Marzo").getByLabel("Facoltativo")).toHaveCount(0);

    await l.riga("Marzo").getByRole("cell", { name: "Marzo/2026", exact: true }).click();

    // expect: nessuna navigazione, nessun modale
    // NB: manipulateObjModuloCommessa lancia TypeError (el.source.charAt) PRIMA dei rami: nessun ramo viene eseguito.
    // Il pageerror non e' asserito perche' il comportamento dell'errore in un event handler React dipende dalla build.
    await expect(page).toHaveURL(/\/ente\/modulicommessa$/);
    await expect(page.getByText(TESTO_FACOLTATIVO)).toHaveCount(0);
    await expect(l.title).toBeVisible();
    await expect.poll(() => infoTrimestre(page)).toEqual({});
  });

  test("Riga Non inserito: moduli nello stato con '--'", async ({ page }) => {
    // 1. Con verifica false cliccare una riga con totali null
    const l = await ready(page, {
      verifica: false,
      moduli: [makeModulo(2026, 4, {
        totaleNotifiche: null,
        totaleNotificheDigitaleNaz: null,
        totaleNotificheDigitaleInternaz: null,
        totaleNotificheAnalogicoARNaz: null,
        totaleNotificheAnalogicoARInternaz: null,
        totaleNotificheAnalogico890Naz: null,
      })],
    });
    await l.riga("Aprile").getByRole("cell", { name: "Aprile/2026", exact: true }).click();
    await expect(page).toHaveURL(URL_INSERIMENTO);
    await expect.poll(async () => (await infoTrimestre(page))?.meseCommessaSelected).toBe("4");

    // expect: moduli[0].inserimento 'Non inserito', colore #FB9EAC, totali '--'
    const info = await infoTrimestre(page);
    expect(info.moduli[0].inserimento).toEqual({ inserimento: "Non inserito", color: "#FB9EAC" });
    expect(info.moduli[0]).toMatchObject({
      totaleDig: "--",
      totaleNotificheDigitaleInternaz: "--",
      totaleAR: "--",
      totaleARInt: "--",
      totaleAnalogico890Naz: "--",
      totale: "--",
    });
  });

  test("Click su riga con filtro anno attivo e ritorno alla lista", async ({ page }) => {
    // 1. Filtrare per 2026
    const moduli = [makeModulo(2026, 1), makeModulo(2025, 1)];
    const { lista } = await mockAll(page, { verifica: false, moduli });
    await mockDettaglioInserimento(page);
    const l = await openPage(page).then(() => griglia(page));
    await expect(l.rows).toHaveCount(2);
    await l.anno.click();
    await page.getByRole("option", { name: "2026" }).click();
    await l.filtra.click();
    await expect(l.rows).toHaveCount(1);
    expect(lista).toContain("2026");

    // 1. Cliccare una riga
    await l.riga("Gennaio").getByRole("cell", { name: "Gennaio/2026", exact: true }).click();
    await expect(page).toHaveURL(URL_INSERIMENTO);

    // 1. Tornare alla lista con il pulsante 'Indietro' della pagina inserimento (modulo non modificabile: nessun modale)
    const prima = lista.length;
    await page.getByRole("button", { name: "Indietro", exact: true }).click();

    // expect: Si torna a /ente/modulicommessa, filtro 2026 ripristinato e /lista/2026 richiamata
    await expect(page).toHaveURL(/\/ente\/modulicommessa$/);
    await expect(l.title).toBeVisible();
    await expect(l.anno).toHaveText("2026");
    await expect.poll(() => lista.slice(prima)).toContain("2026");
    await expect(l.rows).toHaveCount(1);
  });
});
