// spec: specs/dettaglioRelEmessiSospesi.md (sezione 2)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import {
  RAGIONE_SOCIALE, SECTIONS, makeRel, openDettaglio, seedSession, seedTipoContratto,
  type MockRel, type Section,
} from "../../utils/dettaglioRelEmessiSospesi/dettaglioMock";

const ALL_SECTIONS = Object.keys(SECTIONS) as Section[];
const MESI = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

// La sezione REL richiede idTipoContratto 2; per le altre si puo' forzare il tipo contratto della sessione
async function open(page: Parameters<typeof openDettaglio>[0], section: Section, rel: MockRel, tipoContratto?: 1 | 2) {
  if (section === "rel") await seedTipoContratto(page, 2);
  else if (tipoContratto) await seedTipoContratto(page, tipoContratto);
  return openDettaglio(page, section, rel);
}

test.describe("Card Dati di Fatturazione e Numero Notifiche", () => {
  test("Dati di Fatturazione valorizzati", async ({ page, unmockedApi }) => {
    for (const section of ALL_SECTIONS) {
      // 1. Mock con ragioneSociale 'Comune di San Mauro Torinese', tipologiaFattura 'PRIMO SALDO', anno '2024', mese '2', idDocumento 'DOC-1', cup 'CUP123' (per ogni sezione)
      const rel = makeRel({
        ragioneSociale: RAGIONE_SOCIALE, tipologiaFattura: "PRIMO SALDO", anno: 2024, mese: 2, idDocumento: "DOC-1", cup: "CUP123",
      });
      const { l } = await open(page, section, rel);

      await expect(l.card("Dati di Fatturazione")).toBeVisible();
      await expect(l.value("Soggetto Aderente")).toHaveText("Comune di San Mauro Torinese");
      await expect(l.value("Tipologia Fattura")).toHaveText("PRIMO SALDO");
      await expect(l.value("Anno")).toHaveText("2024");
      await expect(l.value("Mese")).toHaveText("Febbraio");
      await expect(l.value("ID Documento")).toHaveText("DOC-1");
      await expect(l.value("Cup")).toHaveText("CUP123");
    }
    expect(unmockedApi).toEqual([]);
  });

  test("ID Documento e Cup assenti mostrano '--'", async ({ page }) => {
    // 1. Mock con idDocumento null/'' e cup null/''
    for (const assente of [null, ""]) {
      const { l } = await open(page, "documentiemessi", makeRel({ idDocumento: assente, cup: assente }));

      await expect(l.value("ID Documento")).toHaveText("--");
      await expect(l.value("Cup")).toHaveText("--");
    }
  });

  test("Tipo Contratto in base a idTipoContratto del profilo", async ({ page }) => {
    // 1. Sessione idTipoContratto 1 (EMESSI/SOSPESI)
    for (const section of ["documentiemessi", "documentisospesi"] as const) {
      const { l } = await open(page, section, makeRel(), 1);
      await expect(l.value("Tipo Contratto")).toHaveText("PAC - PAL senza requisiti");
    }
  });

  test("Tipo Contratto con idTipoContratto 2", async ({ page }) => {
    // 2. Sessione idTipoContratto 2 (REL, EMESSI, SOSPESI)
    for (const section of ALL_SECTIONS) {
      const { l } = await open(page, section, makeRel(), 2);
      await expect(l.value("Tipo Contratto")).toHaveText("PAC - PAL con requisiti");
    }
  });

  test("Tipo Contratto con idTipoContratto assente", async ({ page }) => {
    // 3. Sessione con idTipoContratto assente/undefined
    // Comportamento attuale documentato (bug 8): Number(undefined) !== 1, quindi 'con requisiti'
    // null (e non undefined, che JSON.stringify scarta lasciando il valore di default 1): Number(null) = 0 !== 1
    await seedSession(page, { profilo: { idTipoContratto: null } }, "tipoContrattoAssente");
    const { l } = await openDettaglio(page, "documentiemessi", makeRel());

    await expect(l.value("Tipo Contratto")).toHaveText("PAC - PAL con requisiti");
  });

  test("Mese per tutti i 12 valori e valori fuori range", async ({ page }) => {
    // 1. Parametrizzare mese da '1' a '12'
    for (const [i, nome] of MESI.entries()) {
      const { l } = await open(page, "documentiemessi", makeRel({ mese: i + 1 }));
      await expect(l.value("Mese")).toHaveText(nome);
    }

    // 2. Mese '0' e null
    for (const mese of [0, null]) {
      const { l } = await open(page, "documentiemessi", makeRel({ mese }));
      await expect(l.value("Mese")).toHaveText("");
      await expect(l.card("Dati di Fatturazione")).toBeVisible();
    }
  });

  test("Mese 13 fuori range mostra valore vuoto", async ({ page }) => {
    // Bug non in elenco: l'array `month` di reusableArrayObj.tsx ha 13 elementi (l'ultimo e' 'Gennaio'),
    // quindi mese 13 mostra 'Gennaio' invece di un valore vuoto.
    test.fail();

    // 2. Mese '13'
    const { l } = await open(page, "documentiemessi", makeRel({ mese: 13 }));
    await expect(l.value("Mese")).toHaveText("");
  });

  test("Numero Notifiche visibile per tutte le tipologie tranne ANTICIPO", async ({ page }) => {
    // 17 combinazioni sezione/tipologia: oltre il timeout di default
    test.slow();
    // 1. Mock con totaleNotificheDigitali 10 e totaleNotificheAnalogiche 5 per PRIMO SALDO, SECONDO SALDO, VAR. SEMESTRALE, SEM. SOSPESI, ACCONTO
    for (const section of ALL_SECTIONS) {
      for (const tipologiaFattura of ["PRIMO SALDO", "SECONDO SALDO", "VAR. SEMESTRALE", "SEM. SOSPESI", "ACCONTO"]) {
        const { l } = await open(page, section, makeRel({ tipologiaFattura, totaleNotificheDigitali: 10, totaleNotificheAnalogiche: 5 }));

        await expect(l.card("Numero Notifiche")).toBeVisible();
        await expect(l.value("N. Notifiche Digitali")).toHaveText("10");
        await expect(l.value("N. Notifiche Analogiche")).toHaveText("5");
        await expect(l.value("N. Totale Notifiche")).toHaveText("15");
      }
    }

    // 2. Mock tipologia ANTICIPO (EMESSI e SOSPESI)
    for (const section of ["documentiemessi", "documentisospesi"] as const) {
      const { l } = await open(page, section, makeRel({ tipologiaFattura: "ANTICIPO", anticipoAnalogico: 100, anticipoDigitale: 50 }));

      await expect(l.card("Numero Notifiche")).toHaveCount(0);
      await expect(l.card("Dati di Fatturazione")).toBeVisible();
      await expect(l.card("Posizione Imponibile")).toBeVisible();
      await expect(l.card("Posizione Ivato")).toBeVisible();
    }
  });

  test("Notifiche a zero o stringhe numeriche", async ({ page }) => {
    // 1. Mock con totaleNotificheDigitali '3' (stringa) e totaleNotificheAnalogiche null
    const { l } = await open(page, "documentiemessi", makeRel({ totaleNotificheDigitali: "3", totaleNotificheAnalogiche: null }));

    await expect(l.value("N. Totale Notifiche")).toHaveText("3");
    await expect(page.getByText("NaN")).toHaveCount(0);
  });

  test("Elenco Fatture Emesse visibile solo con fattureSospese non vuoto", async ({ page, unmockedApi }) => {
    // 1. Mock con fattureSospese: []
    const { l } = await open(page, "documentiemessi", makeRel({ fattureSospese: [] }));
    await expect(l.card("Elenco Fatture Emesse")).toHaveCount(0);

    // 2. Mock con 2 fatture (piu' una con totale 0) in ogni sezione
    const fattureSospese = [
      { idFattura: 1, dataFattura: "2024-03-15T00:00:00", tipoDocumento: "TD01", metodoPagamento: "MP05", totaleFatturaImponibile: 1234.5 },
      { idFattura: 2, dataFattura: null, tipoDocumento: null, metodoPagamento: null, totaleFatturaImponibile: null },
      { idFattura: 3, dataFattura: null, tipoDocumento: null, metodoPagamento: null, totaleFatturaImponibile: 0 },
    ];
    for (const section of ALL_SECTIONS) {
      const { l: l2 } = await open(page, section, makeRel({ fattureSospese }));
      const tabelle = page.getByRole("table");

      await expect(l2.card("Elenco Fatture Emesse")).toBeVisible();
      await expect(tabelle).toHaveCount(3);
      await expect(tabelle.first().getByRole("columnheader")).toHaveText([
        "Data Fattura", "Tipo Documento", "Metodo Pagamento", "Totale Fattura Imponibile €",
      ]);
      await expect(tabelle.nth(0).getByRole("cell")).toHaveText(["2024-03-15", "TD01", "MP05", /^1\.234,50\s€$/]);
      await expect(tabelle.nth(1).getByRole("cell")).toHaveText(["--", "--", "--", "--"]);
      await expect(tabelle.nth(2).getByRole("cell")).toHaveText(["--", "--", "--", /^0,00\s€$/]);
    }
    expect(unmockedApi).toEqual([]);
  });

  test.describe("Elenco Fatture Emesse e data a cavallo del fuso orario", () => {
    const fatture = [
      { idFattura: 1, dataFattura: "2024-03-15T23:30:00Z", tipoDocumento: "TD01", metodoPagamento: "MP05", totaleFatturaImponibile: 10 },
    ];

    test.describe("Europe/Rome", () => {
      test.use({ timezoneId: "Europe/Rome" });

      test("Fuso Europe/Rome", async ({ page }) => {
        // Bug 13: toLocaleDateString('en-CA') dipende dal fuso; 23:30Z del 15 diventa il 16 a Roma
        test.fail();

        // 1. Mock con dataFattura '2024-03-15T23:30:00Z' e contesto browser con timezone Europe/Rome
        await open(page, "documentiemessi", makeRel({ fattureSospese: fatture }));
        await expect(page.getByRole("table").first().getByRole("cell").first()).toHaveText("2024-03-15");
      });
    });

    test.describe("America/Los_Angeles", () => {
      test.use({ timezoneId: "America/Los_Angeles" });

      test("Fuso America/Los_Angeles", async ({ page }) => {
        // 1. Mock con dataFattura '2024-03-15T23:30:00Z' e contesto browser con timezone America/Los_Angeles
        await open(page, "documentiemessi", makeRel({ fattureSospese: fatture }));
        await expect(page.getByRole("table").first().getByRole("cell").first()).toHaveText("2024-03-15");
      });
    });
  });
});
