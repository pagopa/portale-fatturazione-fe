// spec: specs/ente-moduloCommessaInserimento.md (sezione 5)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  CAMPI, TESTO_CAMPI_NULL, VALORI, locators, makeModuloIns, mainStatePersistito, mockDettaglioMode, mockObbligatori, openPage,
} from "../../utils/moduloCommessaInserimentoMock/moduloCommessaInserimentoMock";

type L = ReturnType<typeof locators>;
type Campo = (typeof CAMPI)[number];

// 3 moduli obbligatori (agosto, settembre, ottobre 2026), tutti con stato null
const moduli3 = () => [8, 9, 10].map((m) => makeModuloIns(2026, m));

const TESTO_COPERTURA_3_4 = /La percentale di copertura NON raggiunge il 100%\.\s+Tramite dati ISTAT le notifiche restanti\s+saranno integrate sulle regione italiane in base alla percentuale della Popolazione Residente\./;
const TESTO_COPERTURA_1_2 = /La percentale di copertura NON raggiunge il 100%\.\s+Le notifiche restanti\s+saranno integrate sulla regione di appartenenza\./;

const meseAnno = (page: Page, testo: string) => page.getByText(testo, { exact: true }).first();
const attenzione = (page: Page) => page.getByRole("heading", { name: "Attenzione!" });
const URL_ELENCO = /\/ente\/modulicommessa$/;

// Compila i 5 campi del modulo (default 0: con totale AR/890 = 0 la copertura e' 100%)
async function compila(l: L, valori: Partial<Record<Campo, number>> = {}) {
  for (const c of CAMPI) await l.campo(c).fill(String(valori[c] ?? 0));
}

// Aggiunge una regione dalla select multipla "Inserisci regione"
async function aggiungiRegione(page: Page, l: L, nome: string) {
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: nome }).click();
  await page.keyboard.press("Escape");
  await l.aggiungiRegione.click();
}

// Riapre la pagina in modalita' obbligatori con una macrocategoriaVendita diversa
async function riapri(page: Page, macro: unknown, moduli = moduli3()) {
  await mockObbligatori(page, { moduli, macrocategoriaVendita: macro });
  return openPage(page);
}

test.describe("Stepper obbligatori", () => {
  test("Etichette e disabilitazioni al primo step", async ({ page }) => {
    await mockObbligatori(page, { moduli: moduli3() });

    // 1. Mockare 3 moduli obbligatori tutti con stato null
    const l = await openPage(page);

    // expect: Stepper con tre step
    await expect(page.getByText("Agosto", { exact: true })).toBeVisible();
    await expect(page.getByText("Settembre", { exact: true })).toBeVisible();
    await expect(page.getByText("Ottobre", { exact: true })).toBeVisible();
    await expect(meseAnno(page, "Agosto/2026")).toBeVisible();
    // expect: il label del pulsante a sinistra e' 'Indiero' (refuso), disabilitato e senza tooltip
    await expect(l.indietroStep).toBeVisible();
    await expect(l.indietroStep).toBeDisabled();
    await l.indietroStep.hover({ force: true });
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    // expect: 'Avanti' abilitato, tooltip 'Avanti' all'hover
    await expect(l.avanti).toBeEnabled();
    await l.avanti.hover();
    await expect(page.getByRole("tooltip")).toHaveText("Avanti");
  });

  test("Avanti con campi null", async ({ page }) => {
    await mockObbligatori(page, { moduli: moduli3() });
    const l = await openPage(page);

    // 1. Cliccare 'Avanti' senza compilare
    await l.avanti.click();

    // expect: ModalInfo con il testo dei campi da valorizzare
    await expect(attenzione(page)).toBeVisible();
    await expect(page.getByText(TESTO_CAMPI_NULL)).toBeVisible();
    // expect: nessun pulsante Annulla/Prosegui nel modale
    await expect(page.getByRole("button", { name: "Prosegui", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Annulla" })).toHaveCount(0);
    // expect: resta sullo step 1, campi null in errore
    await page.keyboard.press("Escape");
    await expect(attenzione(page)).toHaveCount(0);
    await expect(meseAnno(page, "Agosto/2026")).toBeVisible();
    for (const c of CAMPI) await expect(l.campo(c)).toHaveAttribute("aria-invalid", "true");
  });

  test("Avanti con copertura al 100%", async ({ page }) => {
    await mockObbligatori(page, { moduli: moduli3() });
    const l = await openPage(page);

    // 1. Compilare lo step con coperture 100% (totale AR/890 = 0) e cliccare 'Avanti'
    await compila(l, { totaleNotificheDigitaleNaz: 7 });
    await expect(l.coperturaAr).toHaveValue("100%");
    await expect(l.copertura890).toHaveValue("100%");
    await l.avanti.click();

    // expect: si passa allo step 2 senza modale
    await expect(meseAnno(page, "Settembre/2026")).toBeVisible();
    await expect(meseAnno(page, "Agosto/2026")).toHaveCount(0);
    await expect(attenzione(page)).toHaveCount(0);
    // expect: mainState.statusPageInserimentoCommessa === 'mutable'
    await expect.poll(async () => (await mainStatePersistito(page)).statusPageInserimentoCommessa).toBe("mutable");
    // expect: i dati dello step 1 restano memorizzati tornando indietro
    await l.indietroStep.click();
    await expect(meseAnno(page, "Agosto/2026")).toBeVisible();
    await expect(l.campo("totaleNotificheDigitaleNaz")).toHaveValue("7");
  });

  test("Avanti con copertura <100 (macrocategoria 3 o 4)", async ({ page }) => {
    await mockObbligatori(page, { moduli: moduli3(), macrocategoriaVendita: 3 });
    const l = await openPage(page);

    // 1. macrocategoriaVendita=3, totale AR 10 senza regioni, cliccare 'Avanti'
    await compila(l, { totaleNotificheAnalogicoARNaz: 10 });
    await l.avanti.click();

    // expect: ModalInfo con il testo di copertura e i pulsanti 'Annulla' e 'Prosegui'
    await expect(page.getByText(TESTO_COPERTURA_3_4)).toBeVisible();
    await expect(page.getByRole("button", { name: "Annulla" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Prosegui", exact: true })).toBeVisible();

    // 2. Cliccare 'Annulla'
    await page.getByRole("button", { name: "Annulla" }).click();

    // expect: resta sullo step 1
    await expect(attenzione(page)).toHaveCount(0);
    await expect(meseAnno(page, "Agosto/2026")).toBeVisible();

    // 3. Riaprire e cliccare 'Prosegui'
    await l.avanti.click();
    await expect(page.getByText(TESTO_COPERTURA_3_4)).toBeVisible();
    await page.getByRole("button", { name: "Prosegui", exact: true }).click();

    // expect: passaggio allo step 2
    await expect(meseAnno(page, "Settembre/2026")).toBeVisible();

    // macrocategoriaVendita=4: stesso testo
    const l4 = await riapri(page, 4);
    await compila(l4, { totaleNotificheAnalogicoARNaz: 10 });
    await l4.avanti.click();
    await expect(page.getByText(TESTO_COPERTURA_3_4)).toBeVisible();
  });

  test("Avanti con copertura <100 (macrocategoria 1 o 2)", async ({ page }) => {
    await mockObbligatori(page, { moduli: moduli3(), macrocategoriaVendita: 1 });
    const l = await openPage(page);

    // 1. macrocategoriaVendita=1 (poi 2)
    await compila(l, { totaleNotificheAnalogicoARNaz: 10 });
    await l.avanti.click();
    await expect(page.getByText(TESTO_COPERTURA_1_2)).toBeVisible();
    await expect(page.getByText(TESTO_COPERTURA_3_4)).toHaveCount(0);

    const l2 = await riapri(page, 2);
    await compila(l2, { totaleNotificheAnalogico890Naz: 4 });
    await l2.avanti.click();
    await expect(page.getByText(TESTO_COPERTURA_1_2)).toBeVisible();
  });

  test("Copertura <100 con macrocategoria diversa da 1-4", async ({ page }) => {
    await mockObbligatori(page, { moduli: moduli3(), macrocategoriaVendita: "" });
    const l = await openPage(page);

    // 1. macrocategoriaVendita='' o 0 con copertura <100, cliccare 'Avanti'
    await compila(l, { totaleNotificheAnalogicoARNaz: 10 });
    await expect(l.coperturaAr).toHaveValue("0%");
    await l.avanti.click();

    // expect: nessun modale di copertura
    // NB: diverge dalla spec: il ramo else di avantiFunction chiama handleNext, quindi con macrocategoria fuori da 1-4
    // si passa allo step successivo SENZA avviso sulla copertura <100 (lacuna da segnalare, non un blocco)
    await expect.poll(async () => (await mainStatePersistito(page)).statusPageInserimentoCommessa).toBe("mutable");
    await expect(attenzione(page)).toHaveCount(0);
    await expect(meseAnno(page, "Settembre/2026")).toBeVisible();
    await expect(meseAnno(page, "Agosto/2026")).toHaveCount(0);

    // stesso comportamento con macrocategoriaVendita = 0
    const l0 = await riapri(page, 0);
    await compila(l0, { totaleNotificheAnalogicoARNaz: 10 });
    await l0.avanti.click();
    await expect(attenzione(page)).toHaveCount(0);
    await expect(meseAnno(page, "Settembre/2026")).toBeVisible();
    await expect(meseAnno(page, "Agosto/2026")).toHaveCount(0);
  });

  test("Indiero in modalita' obbligatori", async ({ page }) => {
    await mockObbligatori(page, { moduli: moduli3() });
    const l = await openPage(page);
    await compila(l, { totaleNotificheDigitaleNaz: 7 });
    await l.avanti.click();
    await expect(meseAnno(page, "Settembre/2026")).toBeVisible();

    // Provoca l'errore campi null allo step 2 (da azzerare con Indiero)
    await l.avanti.click();
    await expect(page.getByText(TESTO_CAMPI_NULL)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(attenzione(page)).toHaveCount(0);
    await expect(l.campo("totaleNotificheDigitaleNaz")).toHaveAttribute("aria-invalid", "true");

    // 1. Allo step 2 cliccare 'Indiero'
    await l.indietroStep.click();

    // expect: nessun modale, si torna allo step 1 con i valori digitati
    await expect(attenzione(page)).toHaveCount(0);
    await expect(meseAnno(page, "Agosto/2026")).toBeVisible();
    await expect(l.campo("totaleNotificheDigitaleNaz")).toHaveValue("7");
    // expect: errorAnyValueIsEqualNull azzerato (rientrando nello step 2 i campi non sono in errore)
    await l.avanti.click();
    await expect(meseAnno(page, "Settembre/2026")).toBeVisible();
    await expect(l.campo("totaleNotificheDigitaleNaz")).toHaveAttribute("aria-invalid", "false");
  });

  test("Ultimo step", async ({ page }) => {
    await mockObbligatori(page, { moduli: moduli3() });
    const l = await openPage(page);

    // 1. Raggiungere l'ultimo step
    await compila(l);
    await l.avanti.click();
    await expect(meseAnno(page, "Settembre/2026")).toBeVisible();
    await compila(l);
    await l.avanti.click();
    await expect(meseAnno(page, "Ottobre/2026")).toBeVisible();

    // expect: 'Avanti' disabilitato e senza tooltip
    await expect(l.avanti).toBeDisabled();
    await l.avanti.hover({ force: true });
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    // expect: 'Indiero' abilitato con tooltip 'Indietro'
    await expect(l.indietroStep).toBeEnabled();
    await l.indietroStep.hover();
    await expect(page.getByRole("tooltip")).toHaveText("Indietro");
    // expect: label del pulsante principale = 'Salva'
    await expect(l.salva).toBeVisible();
    await expect(l.salva).toBeEnabled();
    await expect(l.proseguiPerSalvare).toHaveCount(0);
  });

  test("Bottoni disabilitati con errori regioni", async ({ page }) => {
    await mockObbligatori(page, { moduli: moduli3() });
    const l = await openPage(page);
    await compila(l);
    await l.avanti.click();
    await expect(meseAnno(page, "Settembre/2026")).toBeVisible();

    // 1. Provocare errorArRegioni (poi error890Regioni)
    await aggiungiRegione(page, l, "Lazio");
    await l.campo("totaleNotificheAnalogicoARNaz").fill("10");
    await l.regioneAr("12").fill("15");

    // expect: 'Indiero' e 'Avanti' disabilitati anche con step intermedio
    await expect(l.indietroStep).toBeDisabled();
    await expect(l.avanti).toBeDisabled();
    await expect(l.proseguiPerSalvare).toBeDisabled();
    await l.regioneAr("12").fill("5");
    await expect(l.indietroStep).toBeEnabled();
    await expect(l.avanti).toBeEnabled();

    await l.campo("totaleNotificheAnalogico890Naz").fill("5");
    await l.regione890("12").fill("8");
    await expect(l.indietroStep).toBeDisabled();
    await expect(l.avanti).toBeDisabled();
    await l.regione890("12").fill("4");
    await expect(l.indietroStep).toBeEnabled();
    await expect(l.avanti).toBeEnabled();

    // 2. Cambiare step con errore nello step precedente
    // NB: errorArRegioni/error890Regioni sono globali e non si ricalcolano al cambio step, ma con l'errore attivo
    // 'Indiero' e 'Avanti' sono disabilitati: dalla UI non si puo' cambiare step finche' l'errore c'e'.
    await l.regioneAr("12").fill("15");
    await expect(l.indietroStep).toBeDisabled();
    await expect(l.avanti).toBeDisabled();
    await expect(meseAnno(page, "Settembre/2026")).toBeVisible();
  });

  test("Salva nei step intermedi: label e disabilitazione", async ({ page }) => {
    await mockObbligatori(page, { moduli: moduli3() });
    const l = await openPage(page);

    // 1. Allo step 1 di 3
    // expect: label 'Prosegui per salvare' con variant text
    await expect(l.proseguiPerSalvare).toBeVisible();
    await expect(l.proseguiPerSalvare).toHaveClass(/MuiButton-text/);
    // expect: il pulsante e' disabilitato
    // NB: bug confermato dal vivo: il pulsante etichettato 'Prosegui per salvare' non e' mai cliccabile (la spec lo segnala come incoerenza)
    await expect(l.proseguiPerSalvare).toBeDisabled();
    await expect(l.salva).toHaveCount(0);
  });

  test("Step con un solo modulo", async ({ page }) => {
    await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)] });

    // 1. Un solo modulo
    const l = await openPage(page);

    // expect: nessun Avanti/Indiero, Salva abilitato
    await expect(l.salva).toBeEnabled();
    await expect(l.avanti).toHaveCount(0);
    await expect(l.indietroStep).toHaveCount(0);
    await expect(l.proseguiPerSalvare).toHaveCount(0);
  });

  test("Tooltip dei bottoni stepper", async ({ page }) => {
    await mockObbligatori(page, { moduli: moduli3() });
    const l = await openPage(page);
    await compila(l);
    await l.avanti.click();
    await expect(meseAnno(page, "Settembre/2026")).toBeVisible();

    // 1. Hover su 'Indiero' e 'Avanti' abilitati
    // il tooltip precedente resta nel DOM durante la dissolvenza: cercarli per nome
    await l.indietroStep.hover();
    await expect(page.getByRole("tooltip", { name: "Indietro" })).toBeVisible();
    await l.avanti.hover();
    await expect(page.getByRole("tooltip", { name: "Avanti" })).toBeVisible();

    // expect: sui bottoni disabilitati nessun tooltip (title=false)
    await l.indietroStep.click();
    await expect(meseAnno(page, "Agosto/2026")).toBeVisible();
    await l.indietroStep.hover({ force: true });
    await expect(page.getByRole("tooltip", { name: "Indietro" })).toHaveCount(0);
  });

  test("Dettaglio: Avanti/Indiero tra moduli con ModalAlert", async ({ page }) => {
    const { dettaglio } = await mockDettaglioMode(page, { moduli: [{ anno: 2026, mese: 3 }, { anno: 2026, mese: 4 }], indice: 0 });
    const l = await openPage(page);

    // 1. Seed infoTrimestreComSelected con 2 moduli, dettaglio con stato null/modifica true (isEditAllow); cliccare 'Avanti'
    await expect(page.getByText("Marzo", { exact: true })).toBeVisible();
    await expect(page.getByText("Aprile", { exact: true })).toBeVisible();
    await expect(meseAnno(page, "Marzo/2026")).toBeVisible();
    await expect.poll(() => dettaglio).toContain("2026/3");
    await l.avanti.click();

    // expect: ModalAlert 'Attenzione!' 'Le modifiche andranno perse'
    await expect(attenzione(page)).toBeVisible();
    await expect(page.getByText("Le modifiche andranno perse")).toBeVisible();
    // expect: Annulla chiude il modale e resta sul modulo
    await page.getByRole("button", { name: "Annulla" }).click();
    await expect(attenzione(page)).toHaveCount(0);
    await expect(meseAnno(page, "Marzo/2026")).toBeVisible();
    expect(dettaglio).not.toContain("2026/4");
    // expect: Ok: GET dettaglio/2026/4, step 2, statusPageInserimentoCommessa 'immutable'
    await l.avanti.click();
    await page.getByRole("button", { name: "Ok", exact: true }).click();
    await expect.poll(() => dettaglio).toContain("2026/4");
    await expect(meseAnno(page, "Aprile/2026")).toBeVisible();
    await expect(meseAnno(page, "Marzo/2026")).toHaveCount(0);
    await expect.poll(async () => (await mainStatePersistito(page)).statusPageInserimentoCommessa).toBe("immutable");
  });

  test("Dettaglio in sola lettura: Avanti/Indiero senza modale", async ({ page }) => {
    const { dettaglio } = await mockDettaglioMode(page, {
      modulo: (a, m) => makeModuloIns(a, m, { stato: "inserito", ...VALORI }),
      moduli: [{ anno: 2026, mese: 3 }, { anno: 2026, mese: 4 }],
    });
    const l = await openPage(page);

    // 1. Dettaglio con isEditAllow=false e 2 moduli, cliccare 'Avanti' e poi 'Indiero'
    await expect(l.modifica).toBeVisible();
    await l.avanti.click();

    // expect: nessun modale; chiamata al dettaglio del modulo adiacente (/dettaglio/2026/4)
    // NB: avantiFunction controlla !openModalAlert: in sola lettura il modale non viene mai aperto
    await expect(attenzione(page)).toHaveCount(0);
    await expect.poll(() => dettaglio.at(-1)).toBe("2026/4");
    await expect(meseAnno(page, "Aprile/2026")).toBeVisible();

    await l.indietroStep.click();
    await expect(attenzione(page)).toHaveCount(0);
    await expect.poll(() => dettaglio.at(-1)).toBe("2026/3");
    await expect(meseAnno(page, "Marzo/2026")).toBeVisible();
  });

  test("Dettaglio: Indiero con ModalAlert", async ({ page }) => {
    const { dettaglio } = await mockDettaglioMode(page, { moduli: [{ anno: 2026, mese: 3 }, { anno: 2026, mese: 4 }], indice: 1 });
    const l = await openPage(page);

    // 1. Dal secondo modulo in modifica cliccare 'Indiero'
    await expect(meseAnno(page, "Aprile/2026")).toBeVisible();
    await expect.poll(() => dettaglio).toContain("2026/4");
    await l.indietroStep.click();

    // expect: ModalAlert; Ok torna al primo modulo con GET dettaglio
    await expect(attenzione(page)).toBeVisible();
    await expect(page.getByText("Le modifiche andranno perse")).toBeVisible();
    await page.getByRole("button", { name: "Ok", exact: true }).click();
    await expect.poll(() => dettaglio).toContain("2026/3");
    await expect(meseAnno(page, "Marzo/2026")).toBeVisible();
  });

  test("Indiero a step 0 nel dettaglio", async ({ page }) => {
    await mockDettaglioMode(page, { moduli: [{ anno: 2026, mese: 3 }, { anno: 2026, mese: 4 }], indice: 0 });

    // 1. Al primo modulo
    const l = await openPage(page);

    // expect: 'Indiero' disabilitato
    await expect(meseAnno(page, "Marzo/2026")).toBeVisible();
    await expect(l.indietroStep).toBeDisabled();
    await expect(l.avanti).toBeEnabled();
  });
});
