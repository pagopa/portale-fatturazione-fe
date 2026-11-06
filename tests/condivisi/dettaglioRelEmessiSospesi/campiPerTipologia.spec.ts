// spec: specs/dettaglioRelEmessiSospesi.md (sezione 3)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import {
  eur, locators, makeRel, openDettaglio, seedTipoContratto, SECTIONS, TIPOLOGIE,
  type Section,
} from "../../utils/dettaglioRelEmessiSospesi/dettaglioMock";

type L = ReturnType<typeof locators>;

const DOC_SECTIONS: Section[] = ["documentiemessi", "documentisospesi"];
const ALL_SECTIONS: Section[] = ["rel", "documentiemessi", "documentisospesi"];
const SALDI = TIPOLOGIE.slice(0, 4); // PRIMO SALDO, SECONDO SALDO, VAR. SEMESTRALE, SEM. SOSPESI

const ACCONTO_ROWS = ["Acconto Digitale", "Acconto Analogico"];
const ANTICIPO_ROWS = ["Anticipo Digitale", "Anticipo Analogico"];
const STORNO_ROWS = ["Storno Digitale", "Storno Analogico", "Totale Storno"];
const STORNO_REL_ROWS = [
  "Storno Anticipo Digitale", "Storno Anticipo Analogico", "Totale Storno Anticipo",
  "Storno Acconto Digitale", "Storno Acconto Analogico", "Totale Storno Acconto",
];
const IMPONIBILE_ROWS = ["Imponibile Digitale", "Imponibile Analogico"];

const expectVisible = async (l: L, names: string[]) => {
  for (const name of names) await expect(l.label(name), name).toBeVisible();
};
const expectHidden = async (l: L, names: string[]) => {
  for (const name of names) await expect(l.label(name), name).toHaveCount(0);
};

test.describe("Visibilita' campi per tipologia fattura e tipo contratto", () => {
  // 3.1 PRIMO SALDO / SECONDO SALDO / VAR. SEMESTRALE / SEM. SOSPESI in EMESSI e SOSPESI (idTipoContratto 1)
  for (const section of DOC_SECTIONS) {
    for (const tipologia of SALDI) {
      test(`3.1 ${tipologia} in ${section} con idTipoContratto 1`, async ({ page }) => {
        await seedTipoContratto(page, 1);

        // 1. Parametrizzare le 4 tipologie, sezioni EMESSI e SOSPESI, idTipoContratto 1
        const { l } = await openDettaglio(page, section, makeRel({ tipologiaFattura: tipologia }));

        // Posizione Imponibile
        await expectVisible(l, [...STORNO_ROWS, ...IMPONIBILE_ROWS, "Totale Imponibile", "Imponibile da Fatturare"]);
        await expectHidden(l, [...ACCONTO_ROWS, ...ANTICIPO_ROWS, ...STORNO_REL_ROWS]);
        // Posizione Ivato
        await expectVisible(l, ["IVA", "Ivato Digitale", "Ivato Analogico", "Totale Ivato", "Ivato da Fatturare"]);
      });
    }
  }

  // 3.2 ACCONTO con idTipoContratto 1
  for (const section of DOC_SECTIONS) {
    test(`3.2 ACCONTO in ${section} con idTipoContratto 1`, async ({ page }) => {
      await seedTipoContratto(page, 1);

      // 1. Mock ACCONTO con accontoAnalogico 200 e accontoDigitale 100, sezione EMESSI/SOSPESI, idTipoContratto 1
      const { l } = await openDettaglio(
        page, section, makeRel({ tipologiaFattura: "ACCONTO", accontoAnalogico: 200, accontoDigitale: 100 }),
      );

      await expectHidden(l, [...ACCONTO_ROWS, ...STORNO_ROWS, ...IMPONIBILE_ROWS, ...ANTICIPO_ROWS]);
      await expect(l.value("Totale Imponibile")).toHaveText(eur(300));
      await expect(l.label("Imponibile da Fatturare")).toBeVisible();
      await expectVisible(l, ["IVA", "Ivato Digitale", "Ivato Analogico", "Totale Ivato", "Ivato da Fatturare"]);
    });
  }

  // 3.3 ACCONTO con idTipoContratto 2
  test("3.3 ACCONTO in documentiemessi con idTipoContratto 2", async ({ page }) => {
    await seedTipoContratto(page, 2);

    // 1. Stesso mock con sessione idTipoContratto 2 (EMESSI)
    const { l } = await openDettaglio(
      page, "documentiemessi", makeRel({ tipologiaFattura: "ACCONTO", accontoAnalogico: 200, accontoDigitale: 100 }),
    );

    await expect(l.value("Acconto Digitale")).toHaveText(eur(100));
    await expect(l.value("Acconto Analogico")).toHaveText(eur(200));
    await expect(l.value("Totale Imponibile")).toHaveText(eur(300));
  });

  // 3.4 ANTICIPO (EMESSI e SOSPESI)
  for (const section of DOC_SECTIONS) {
    test(`3.4 ANTICIPO in ${section}`, async ({ page }) => {
      await seedTipoContratto(page, 1);

      // 1. Mock ANTICIPO con anticipoAnalogico 100, anticipoDigitale 50, iva 22
      const { l } = await openDettaglio(
        page, section, makeRel({ tipologiaFattura: "ANTICIPO", anticipoAnalogico: 100, anticipoDigitale: 50, iva: 22 }),
      );

      await expect(l.card("Numero Notifiche")).toHaveCount(0);
      await expect(l.value("Anticipo Digitale")).toHaveText(eur(50));
      await expect(l.value("Anticipo Analogico")).toHaveText(eur(100));
      await expect(l.value("Totale Imponibile")).toHaveText(eur(150));
      await expect(l.label("Imponibile da Fatturare")).toHaveCount(0);
      await expect(l.value("Ivato Digitale")).toHaveText(eur(61));
      await expect(l.value("Ivato Analogico")).toHaveText(eur(122));
      await expect(l.value("Totale Ivato")).toHaveText(eur(183));
      await expect(l.label("Ivato da Fatturare")).toHaveCount(0);
      await expectHidden(l, [...STORNO_ROWS, ...IMPONIBILE_ROWS]);
    });
  }

  // 3.5 Regolare Esecuzione (idTipoContratto 2): righe storno anticipo/acconto
  test("3.5 Regolare Esecuzione: righe storno anticipo/acconto", async ({ page }) => {
    await seedTipoContratto(page, 2);

    // 1. Mock REL PRIMO SALDO con storni anticipo/acconto e stornoTotale -33
    const { l } = await openDettaglio(page, "rel", makeRel({
      tipologiaFattura: "PRIMO SALDO",
      anticipo_StornoDigitale: -10, anticipo_StornoAnalogico: -20, anticipo_StornoTotale: -30,
      acconto_StornoDigitale: -1, acconto_StornoAnalogico: -2, acconto_StornoTotale: -3,
      stornoTotale: -33,
    }));

    await expect(l.value("Storno Anticipo Digitale")).toHaveText(eur(-10));
    await expect(l.value("Storno Anticipo Analogico")).toHaveText(eur(-20));
    await expect(l.value("Totale Storno Anticipo")).toHaveText(eur(-30));
    await expect(l.value("Storno Acconto Digitale")).toHaveText(eur(-1));
    await expect(l.value("Storno Acconto Analogico")).toHaveText(eur(-2));
    await expect(l.value("Totale Storno Acconto")).toHaveText(eur(-3));
    await expectHidden(l, STORNO_ROWS);
    await expectVisible(l, [...IMPONIBILE_ROWS, "Totale Imponibile"]);
  });

  test("3.5 Regolare Esecuzione: campi storno mancanti mostrano 0,00", async ({ page }) => {
    await seedTipoContratto(page, 2);

    // 1. (campi mancanti nel mock) -> '0,00 €'
    const rel = makeRel({ tipologiaFattura: "PRIMO SALDO" });
    for (const key of [
      "anticipo_StornoDigitale", "anticipo_StornoAnalogico", "anticipo_StornoTotale",
      "acconto_StornoDigitale", "acconto_StornoAnalogico", "acconto_StornoTotale",
    ]) delete rel[key];
    const { l } = await openDettaglio(page, "rel", rel);

    for (const name of STORNO_REL_ROWS) await expect(l.value(name), name).toHaveText(eur(0));
  });

  // 3.6 REL: ANTICIPO e ACCONTO
  test("3.6 REL ACCONTO (idTipoContratto 2)", async ({ page }) => {
    await seedTipoContratto(page, 2);

    // 1. Mock REL con tipologia ACCONTO
    const { l } = await openDettaglio(
      page, "rel", makeRel({ tipologiaFattura: "ACCONTO", accontoAnalogico: 200, accontoDigitale: 100 }),
    );

    await expectVisible(l, ACCONTO_ROWS);
    await expectHidden(l, IMPONIBILE_ROWS);
  });

  test("3.6 REL ANTICIPO (idTipoContratto 2)", async ({ page }) => {
    await seedTipoContratto(page, 2);

    // 1. Mock REL con tipologia ANTICIPO
    const { l } = await openDettaglio(
      page, "rel", makeRel({ tipologiaFattura: "ANTICIPO", anticipoAnalogico: 100, anticipoDigitale: 50 }),
    );

    await expectHidden(l, ANTICIPO_ROWS);
    await expect(l.card("Numero Notifiche")).toHaveCount(0);
    await expect(l.label("Imponibile da Fatturare")).toHaveCount(0);
  });

  test("3.6 REL ANTICIPO: pulsante report visibile (bug 1)", async ({ page }) => {
    // Bug 1: precedenza operatori in showButtonDownloadReport, in REL con ANTICIPO il pulsante viene nascosto
    test.fail();
    await seedTipoContratto(page, 2);

    // 1. Documentare cosa mostra il pulsante report in ANTICIPO REL: atteso visibile
    const { l } = await openDettaglio(page, "rel", makeRel({ tipologiaFattura: "ANTICIPO" }));

    await expect(l.downloadReport("rel")).toBeVisible();
  });

  // 3.7 Imponibile da Fatturare e Ivato da Fatturare per idTipoContratto 2
  // Regola attuale (bug 3, da confermare con il team): con idTipoContratto 2 "Ivato da Fatturare" solo in EMESSI
  for (const section of ALL_SECTIONS) {
    test(`3.7 Da Fatturare in ${section} con idTipoContratto 2`, async ({ page }) => {
      await seedTipoContratto(page, 2);

      // 1. Mock PRIMO SALDO con sessione idTipoContratto 2 nelle tre sezioni
      const { l } = await openDettaglio(page, section, makeRel({ tipologiaFattura: "PRIMO SALDO" }));

      await expect(l.label("Imponibile da Fatturare")).toBeVisible();
      if (section === "documentiemessi") {
        await expect(l.label("Ivato da Fatturare")).toBeVisible();
      } else {
        await expect(l.label("Ivato da Fatturare")).toHaveCount(0);
      }
    });

    test(`3.7 Da Fatturare in ${section} con idTipoContratto 1`, async ({ page }) => {
      await seedTipoContratto(page, 1);

      // 2. Stesso mock con idTipoContratto 1
      const { l } = await openDettaglio(page, section, makeRel({ tipologiaFattura: "PRIMO SALDO" }));

      await expect(l.label("Imponibile da Fatturare")).toBeVisible();
      await expect(l.label("Ivato da Fatturare")).toBeVisible();
    });
  }

  // 3.8 Tipologia fattura sconosciuta o assente
  test("3.8 Tipologia fattura sconosciuta", async ({ page }) => {
    await seedTipoContratto(page, 1);

    // 1. Mock con tipologiaFattura 'ALTRO'
    const { l } = await openDettaglio(
      page, "documentiemessi", makeRel({ tipologiaFattura: "ALTRO", totaleIva: 99.5 }),
    );

    await expect(l.value("Tipologia Fattura")).toHaveText("ALTRO");
    await expectVisible(l, ["Totale Imponibile", "Imponibile da Fatturare"]);
    await expectHidden(l, [...STORNO_ROWS, ...IMPONIBILE_ROWS, ...ACCONTO_ROWS, ...ANTICIPO_ROWS]);
    await expect(l.value("Totale Ivato")).toHaveText(eur(99.5));
  });

  test("3.8 Tipologia fattura null: nessun crash (bug 2)", async ({ page }) => {
    // Bug 2: rel.tipologiaFattura.toUpperCase() lancia TypeError con tipologiaFattura null
    test.fail();
    await seedTipoContratto(page, 1);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    // 2. Mock con tipologiaFattura null
    const { l } = await openDettaglio(page, "documentiemessi", makeRel({ tipologiaFattura: null }));

    // expect: pagina renderizzata senza crash
    await expect(l.card("Dati di Fatturazione")).toBeVisible();
    expect(errors).toEqual([]);
  });
});

// Riferimento a SECTIONS per la documentazione delle etichette delle sezioni
void SECTIONS;
