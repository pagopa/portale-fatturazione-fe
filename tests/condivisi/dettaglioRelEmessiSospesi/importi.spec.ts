// spec: specs/dettaglioRelEmessiSospesi.md (sezione 4)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import { eur, makeRel, openDettaglio, seedTipoContratto } from "../../utils/dettaglioRelEmessiSospesi/dettaglioMock";

test.describe("Totali calcolati dal FE e formattazione EUR", () => {
  test("Totali PRIMO SALDO con storni (EMESSI)", async ({ page }) => {
    await seedTipoContratto(page, 1);

    // 1. Mock PRIMO SALDO con storni e totaleIva volutamente diverso
    const { l } = await openDettaglio(page, "documentiemessi", makeRel({
      tipologiaFattura: "PRIMO SALDO",
      totaleAnalogico: 100, totaleDigitale: 50,
      stornoAnalogico: -10, stornoDigitale: -5,
      iva: 22, totaleAnalogicoIva: 122, totaleDigitaleIva: 61, totaleIva: 999,
    }));
    await expect(l.value("Imponibile Digitale")).toHaveText(eur(50));
    await expect(l.value("Imponibile Analogico")).toHaveText(eur(100));
    await expect(l.value("Totale Imponibile")).toHaveText(eur(150));
    await expect(l.value("Storno Digitale")).toHaveText(eur(-5));
    await expect(l.value("Storno Analogico")).toHaveText(eur(-10));
    await expect(l.value("Totale Storno")).toHaveText(eur(-15));
    await expect(l.value("Imponibile da Fatturare")).toHaveText(eur(135));
    await expect(l.value("IVA")).toHaveText("22 %");
    await expect(l.value("Ivato Digitale")).toHaveText(eur(61));
    await expect(l.value("Ivato Analogico")).toHaveText(eur(122));
    await expect(l.value("Totale Ivato")).toHaveText(eur(183));
    await expect(l.value("Ivato da Fatturare")).toHaveText(eur(164.7));
  });

  test("Totale Ivato per SEM. SOSPESI e VAR. SEMESTRALE", async ({ page }) => {
    await seedTipoContratto(page, 1);

    // 1. Mock VAR. SEMESTRALE e SEM. SOSPESI con totaleIva diverso dalla somma
    for (const tipologiaFattura of ["VAR. SEMESTRALE", "SEM. SOSPESI"]) {
      const { l } = await openDettaglio(page, "documentiemessi", makeRel({
        tipologiaFattura, totaleAnalogicoIva: 10, totaleDigitaleIva: 5, totaleIva: 99,
      }));
      await expect(l.value("Tipologia Fattura")).toHaveText(tipologiaFattura);
      await expect(l.value("Totale Ivato")).toHaveText(eur(15));
    }
  });

  test("Totale Ivato per tipologia non gestita usa totaleIva del backend", async ({ page }) => {
    await seedTipoContratto(page, 1);

    // 1. Mock tipologia 'ALTRO' con totaleIva 99,5
    const { l } = await openDettaglio(page, "documentiemessi", makeRel({
      tipologiaFattura: "ALTRO", totaleIva: 99.5, totaleAnalogicoIva: 10, totaleDigitaleIva: 5,
    }));
    await expect(l.value("Totale Ivato")).toHaveText(eur(99.5));
    await expect(l.value("Ivato Analogico")).toHaveText(eur(10));
    await expect(l.value("Ivato Digitale")).toHaveText(eur(5));
  });

  test("ACCONTO: totali calcolati dagli acconti", async ({ page }) => {
    await seedTipoContratto(page, 1);

    // 1. Mock ACCONTO con accontoAnalogico 200, accontoDigitale 100, iva 22, storni 0
    const { l } = await openDettaglio(page, "documentiemessi", makeRel({
      tipologiaFattura: "ACCONTO", accontoAnalogico: 200, accontoDigitale: 100, iva: 22,
      stornoAnalogico: 0, stornoDigitale: 0, stornoTotale: 0,
    }));
    await expect(l.value("Totale Imponibile")).toHaveText(eur(300));
    await expect(l.value("Imponibile da Fatturare")).toHaveText(eur(300));
    await expect(l.value("Ivato Analogico")).toHaveText(eur(244));
    await expect(l.value("Ivato Digitale")).toHaveText(eur(122));
    await expect(l.value("Totale Ivato")).toHaveText(eur(366));
    await expect(l.value("Ivato da Fatturare")).toHaveText(eur(366));
  });

  test("ANTICIPO: totali calcolati dagli anticipi", async ({ page }) => {
    await seedTipoContratto(page, 1);

    // 1. Mock ANTICIPO con anticipoAnalogico 100, anticipoDigitale 50, iva 22
    const { l } = await openDettaglio(page, "documentiemessi", makeRel({
      tipologiaFattura: "ANTICIPO", anticipoAnalogico: 100, anticipoDigitale: 50, iva: 22,
    }));
    await expect(l.value("Totale Imponibile")).toHaveText(eur(150));
    await expect(l.value("Ivato Analogico")).toHaveText(eur(122));
    await expect(l.value("Ivato Digitale")).toHaveText(eur(61));
    await expect(l.value("Totale Ivato")).toHaveText(eur(183));
    await expect(l.label("Imponibile da Fatturare")).toHaveCount(0);
    await expect(l.label("Ivato da Fatturare")).toHaveCount(0);
  });

  test("IVA di default 22 quando iva e' 0 o null", async ({ page }) => {
    await seedTipoContratto(page, 1);

    // 1. Mock ACCONTO con iva 0 (poi null) e accontoAnalogico 100: i calcoli usano 22
    for (const iva of [0, null]) {
      const { l } = await openDettaglio(page, "documentiemessi", makeRel({
        tipologiaFattura: "ACCONTO", accontoAnalogico: 100, accontoDigitale: 0, iva,
      }));
      await expect(l.value("Ivato Analogico")).toHaveText(eur(122));
      await expect(l.value("Totale Ivato")).toHaveText(eur(122));
    }

    // 2. Mock con iva 10 e PRIMO SALDO
    const { l } = await openDettaglio(page, "documentiemessi", makeRel({
      tipologiaFattura: "PRIMO SALDO", iva: 10, totaleAnalogico: 100, totaleDigitale: 50,
      stornoAnalogico: -10, stornoDigitale: -5,
    }));
    await expect(l.value("IVA")).toHaveText("10 %");
    await expect(l.value("Imponibile da Fatturare")).toHaveText(eur(135));
    await expect(l.value("Ivato da Fatturare")).toHaveText(eur(148.5));
  });

  test("IVA di default 22: la riga IVA mostra il valore usato nei calcoli (bug 6)", async ({ page }) => {
    test.fail(true, "Bug 6: la riga IVA mostra '0 %' ma i calcoli usano 22");
    await seedTipoContratto(page, 1);

    // 1. Mock ACCONTO con iva 0 e accontoAnalogico 100
    const { l } = await openDettaglio(page, "documentiemessi", makeRel({
      tipologiaFattura: "ACCONTO", accontoAnalogico: 100, accontoDigitale: 0, iva: 0,
    }));
    await expect(l.value("Ivato Analogico")).toHaveText(eur(122));
    await expect(l.value("IVA")).toHaveText("22 %");
  });

  test("REL: Imponibile da Fatturare usa stornoTotale", async ({ page }) => {
    await seedTipoContratto(page, 2);

    // 1. Mock REL PRIMO SALDO con stornoTotale -30 e storno analogico/digitale diversi
    const { l } = await openDettaglio(page, "rel", makeRel({
      tipologiaFattura: "PRIMO SALDO", totaleAnalogico: 100, totaleDigitale: 50,
      stornoTotale: -30, stornoAnalogico: -999, stornoDigitale: -999,
    }));
    await expect(l.value("Imponibile da Fatturare")).toHaveText(eur(120));
    await expect(l.value("Totale Imponibile")).toHaveText(eur(150));
    await expect(l.label("Storno Digitale")).toHaveCount(0);
    await expect(l.label("Storno Analogico")).toHaveCount(0);
  });

  test("Formato valuta de-DE", async ({ page }) => {
    await seedTipoContratto(page, 1);

    // 1. Mock con totaleAnalogico 1234567.891, valori negativi e 0
    const { l } = await openDettaglio(page, "documentiemessi", makeRel({
      tipologiaFattura: "PRIMO SALDO", totaleAnalogico: 1234567.891, totaleDigitale: 0,
      stornoAnalogico: -15, stornoDigitale: 0,
    }));
    await expect(l.value("Imponibile Analogico")).toHaveText(eur(1234567.891));
    await expect(l.value("Imponibile Analogico")).toHaveText("1.234.567,89 €");
    await expect(l.value("Storno Analogico")).toHaveText("-15,00 €");
    await expect(l.value("Storno Digitale")).toHaveText("0,00 €");
    await expect(l.value("Imponibile Digitale")).toHaveText("0,00 €");
  });

  test("Valori non numerici o stringhe", async ({ page }) => {
    await seedTipoContratto(page, 1);

    // 1. Mock con totaleAnalogico '10.5' (stringa), totaleDigitale null, storni undefined
    const { l } = await openDettaglio(page, "documentiemessi", makeRel({
      tipologiaFattura: "PRIMO SALDO", totaleAnalogico: "10.5", totaleDigitale: null,
      stornoAnalogico: undefined, stornoDigitale: undefined,
    }));
    await expect(l.value("Totale Imponibile")).toHaveText(eur(10.5));
    await expect(l.value("Imponibile Digitale")).toHaveText(eur(0));
    await expect(l.value("Totale Storno")).toHaveText(eur(0));
    await expect(page.getByText("NaN")).toHaveCount(0);
  });

  test("Valori non numerici: totaleAnalogicoIva null non manda in crash la pagina (bug 7)", async ({ page }) => {
    test.fail(true, "Bug 7: null.toLocaleString su analogicoIvatoCalcolatoByFront/digitaleIvatoCalcolatoByFront non convertiti con Number");
    await seedTipoContratto(page, 1);

    // 2. Mock con totaleAnalogicoIva null e tipologia PRIMO SALDO
    const { l } = await openDettaglio(page, "documentiemessi", makeRel({
      tipologiaFattura: "PRIMO SALDO", totaleAnalogicoIva: null, totaleDigitaleIva: 61,
    }));
    await expect(l.value("Ivato Analogico")).toHaveText(eur(0));
    await expect(l.value("Totale Ivato")).toHaveText(eur(61));
  });

  test("Arrotondamenti", async ({ page }) => {
    await seedTipoContratto(page, 1);

    // 1. Mock ACCONTO con accontoAnalogico 0.01 e iva 22
    const { l } = await openDettaglio(page, "documentiemessi", makeRel({
      tipologiaFattura: "ACCONTO", accontoAnalogico: 0.01, accontoDigitale: 0, iva: 22,
    }));
    await expect(l.value("Ivato Analogico")).toHaveText(eur(0.0122));
    await expect(l.value("Ivato Analogico")).toHaveText("0,01 €");
    await expect(l.value("Ivato Digitale")).toHaveText("0,00 €");
    await expect(l.value("Totale Ivato")).toHaveText("0,01 €");
  });
});
