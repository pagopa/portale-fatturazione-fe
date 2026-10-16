// spec: specs/ente-moduloCommessaInserimento.md (sezione 4)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import type { BrowserContext, Page } from "@playwright/test";
import {
  REGIONI, VALORI, makeModuloIns, mockDettaglioMode, mockObbligatori, openPage,
} from "../../utils/moduloCommessaInserimentoMock/moduloCommessaInserimentoMock";
import type { MockModuloIns, MockRegione } from "../../utils/moduloCommessaInserimentoMock/moduloCommessaInserimentoMock";

type L = Awaited<ReturnType<typeof openPage>>;

// La select MUI "Inserisci regione" (InputLabel senza id: il nome accessibile del combobox non e' garantito)
const selectRegione = (page: Page, l: L) =>
  l.inserisciRegione.or(page.getByLabel("Inserisci regione")).or(page.getByRole("combobox"));

// Apre la select, sceglie le regioni e chiude la listbox con Escape (una listbox aperta rende la pagina aria-hidden)
async function scegliRegioni(page: Page, l: L, nomi: string[]) {
  await selectRegione(page, l).click();
  for (const nome of nomi) {
    await page.getByRole("option", { name: nome }).click();
  }
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
}

const regione = (nome: string, istat: string, extra: Partial<MockRegione> = {}): MockRegione => ({
  regione: nome, istatRegione: istat, ar: null, 890: null, obbligatorio: 0, calcolato: 0, ...extra,
});

// Modulo obbligatorio singolo (Ottobre/2026) con regioni gia' presenti
const moduloConRegioni = (valoriRegione: MockRegione[]) => [makeModuloIns(2026, 10, { valoriRegione })];

// Apre una seconda pagina nello stesso contesto in modalita' dettaglio (le rotte del contesto restano valide)
async function apriDettaglio(context: BrowserContext, modulo: MockModuloIns) {
  const page = await context.newPage();
  await mockDettaglioMode(page, { modulo });
  const l = await openPage(page);
  return { page, l };
}

const cestini = (page: Page) => page.getByTestId("DeleteIcon");

test.describe("Regioni", () => {
  test("Aggiungere una regione", async ({ page }) => {
    await mockObbligatori(page);
    const l = await openPage(page);
    const select = selectRegione(page, l);

    // 1. Con 3 regioni disponibili aprire 'Inserisci regione' e selezionare Piemonte
    // expect: 'Aggiungi regione' disabilitato a select vuota
    await expect(l.aggiungiRegione).toBeDisabled();
    await scegliRegioni(page, l, ["Piemonte"]);
    // expect: abilitato con almeno una selezione, chip Piemonte nella select
    await expect(l.aggiungiRegione).toBeEnabled();
    await expect(select.getByText("Piemonte")).toBeVisible();

    // 2. Cliccare 'Aggiungi regione'
    await l.aggiungiRegione.click();

    // expect: Intestazioni 'Regioni', 'AR Nazionali', '890 Nazionali' compaiono
    await expect(page.getByText("Regioni", { exact: true })).toBeVisible();
    await expect(page.getByText("AR Nazionali", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("890 Nazionali", { exact: true }).first()).toBeVisible();
    // expect: Riga Piemonte con campi AR e 890 vuoti e cestino
    await expect(page.getByRole("heading", { name: "Piemonte" })).toBeVisible();
    await expect(l.regioneAr("1")).toHaveValue("");
    await expect(l.regione890("1")).toHaveValue("");
    await expect(cestini(page)).toHaveCount(1);
    // expect: la selezione e' azzerata e 'Aggiungi regione' torna disabilitato
    await expect(select.getByText("Piemonte")).toHaveCount(0);
    await expect(l.aggiungiRegione).toBeDisabled();
    // expect: Piemonte non e' piu' tra le opzioni
    await select.click();
    await expect(page.getByRole("option", { name: "Piemonte" })).toHaveCount(0);
    await expect(page.getByRole("option", { name: "Lazio" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Veneto" })).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("Aggiungere piu' regioni insieme", async ({ page }) => {
    await mockObbligatori(page);
    const l = await openPage(page);

    // 1. Selezionare 2 regioni e cliccare 'Aggiungi regione'
    await scegliRegioni(page, l, ["Lazio", "Veneto"]);
    await l.aggiungiRegione.click();

    // expect: Due righe aggiunte
    await expect(page.getByRole("heading", { name: "Lazio" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Veneto" })).toBeVisible();
    await expect(l.regioneAr("12")).toBeVisible();
    await expect(l.regioneAr("5")).toBeVisible();
    await expect(cestini(page)).toHaveCount(2);
  });

  test("Cancellare una regione", async ({ page }) => {
    await mockObbligatori(page, {
      moduli: moduloConRegioni([regione("Piemonte", "1"), regione("Veneto", "5")]),
    });
    const l = await openPage(page);

    // Totale AR 10, Piemonte 6 e Veneto 5: somma 11 > 10, errore
    await l.campo("totaleNotificheAnalogicoARNaz").fill("10");
    await l.regioneAr("1").fill("6");
    await l.regioneAr("5").fill("5");
    await expect(l.regioneAr("1")).toHaveAttribute("aria-invalid", "true");
    await expect(l.coperturaAr).toHaveValue("110%");

    // 1. Cliccare il cestino di una riga (il cestino non ha nome accessibile: si usa l'icona, seconda riga = Veneto)
    await cestini(page).nth(1).click();

    // expect: Riga rimossa, regione di nuovo tra le opzioni
    await expect(l.regioneAr("5")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Veneto" })).toHaveCount(0);
    await selectRegione(page, l).click();
    await expect(page.getByRole("option", { name: "Veneto" })).toBeVisible();
    await page.keyboard.press("Escape");
    // expect: Percentuali di copertura ricalcolate, errori AR/890 ricalcolati
    await expect(l.coperturaAr).toHaveValue("60%");
    await expect(l.regioneAr("1")).toHaveAttribute("aria-invalid", "false");
    await expect(l.salva).toBeEnabled();
  });

  test("Regione di appartenenza (obbligatorio=1)", async ({ page }) => {
    await mockObbligatori(page, {
      moduli: moduloConRegioni([
        regione("Veneto", "5", { ar: 3, 890: 1 }),
        regione("Lazio", "12", { obbligatorio: 1 }),
      ]),
    });
    const l = await openPage(page);

    // 1. Mockare un modulo con una regione obbligatorio:1 e una obbligatorio:0
    // expect: La regione obbligatoria e' ordinata per prima (Lazio, anche se nella risposta e' dopo Veneto)
    await expect(page.getByTestId(/^regione-ar-/).first()).toHaveAttribute("data-testid", "regione-ar-12");
    await expect(page.getByTestId(/^regione-ar-/).last()).toHaveAttribute("data-testid", "regione-ar-5");

    // expect: Tooltip 'Regione di appartenenza' sull'icona info (aria-label sullo span che avvolge il pulsante)
    await page.getByLabel("Regione di appartenenza").hover();
    await expect(page.getByRole("tooltip", { name: "Regione di appartenenza" })).toBeVisible();
  });

  test("Regione di appartenenza in sola lettura", async ({ page }) => {
    await mockDettaglioMode(page, {
      modulo: makeModuloIns(2026, 3, {
        ...VALORI,
        stato: "inserito",
        valoriRegione: [regione("Veneto", "5", { ar: 3, 890: 1 }), regione("Lazio", "12", { obbligatorio: 1 })],
      }),
    });
    await openPage(page);

    // expect: In sola lettura il chip 'Regione di appartenenza' se AR e 890 null
    await expect(page.getByText("Regione di appartenenza", { exact: true })).toBeVisible();
    await expect(page.getByText("Inserita manualmente dall’aderente", { exact: true })).toHaveCount(1);
  });

  test("Etichette chip in sola lettura", async ({ page }) => {
    await mockDettaglioMode(page, {
      modulo: makeModuloIns(2026, 3, {
        ...VALORI,
        stato: "inserito",
        valoriRegione: [
          regione("Veneto", "5", { ar: 2, 890: 1, calcolato: 1 }),
          regione("Piemonte", "1", { ar: 3, 890: 1, calcolato: 0 }),
          regione("Lazio", "12", { obbligatorio: 1, calcolato: 0 }),
        ],
      }),
    });

    // 1. Dettaglio in lettura con regioni calcolato=1, calcolato=0 e obbligatoria con valori null
    await openPage(page);

    // expect: calcolato truthy: 'Attribuito dal sistema'
    await expect(page.getByText("Attribuito dal sistema", { exact: true })).toHaveCount(1);
    // expect: calcolato 0: 'Inserita manualmente dall’aderente' (apostrofo tipografico)
    await expect(page.getByText("Inserita manualmente dall’aderente", { exact: true })).toHaveCount(1);
    // expect: obbligatorio=1 con ar e 890 null: 'Regione di appartenenza'
    await expect(page.getByText("Regione di appartenenza", { exact: true })).toHaveCount(1);
    // in lettura nessun cestino
    await expect(cestini(page)).toHaveCount(0);
  });

  test("Valori AR/890 per regione", async ({ page }) => {
    await mockObbligatori(page, { moduli: moduloConRegioni([regione("Piemonte", "1")]) });
    const l = await openPage(page);
    await l.campo("totaleNotificheAnalogicoARNaz").fill("100");
    await l.campo("totaleNotificheAnalogico890Naz").fill("100");
    const ar = l.regioneAr("1");
    const v890 = l.regione890("1");

    // 1. Inserire AR 10 e 890 3 su una regione
    await ar.fill("10");
    await v890.fill("3");
    // expect: 10/3 accettati e mostrati
    await expect(ar).toHaveValue("10");
    await expect(v890).toHaveValue("3");

    // poi 0
    await ar.fill("0");
    await v890.fill("0");
    // expect: 0 accettato e non mostrato come vuoto
    await expect(ar).toHaveValue("0");
    await expect(v890).toHaveValue("0");

    // poi negativo
    await ar.fill("7");
    await ar.fill("-5");
    // expect: Negativo: value=null (campo vuoto)
    await expect(ar).toHaveValue("");

    // poi testo
    await v890.fill("4");
    await expect(v890).toHaveValue("4");
    await v890.fill("abc");
    // expect: testo non numerico: Number('abc')>=0 e' false -> null (campo vuoto)
    // NB: a differenza dei campi del modulo (dove un valore non valido viene ignorato) qui il campo si svuota
    await expect(v890).toHaveValue("");
  });

  test("Errore se la somma regioni AR supera il totale AR", async ({ page }) => {
    // 3 moduli, il primo gia' inserito: si parte dallo step centrale, dove Indiero e Avanti sono abilitati
    await mockObbligatori(page, {
      moduli: [
        makeModuloIns(2026, 8, { stato: "inserito" }),
        makeModuloIns(2026, 9, { valoriRegione: [regione("Piemonte", "1"), regione("Veneto", "5")] }),
        makeModuloIns(2026, 10),
      ],
    });
    const l = await openPage(page);
    await expect(l.indietroStep).toBeEnabled();
    await expect(l.avanti).toBeEnabled();

    // 1. Totale AR naz = 10, regione A AR=6 e regione B AR=5
    await l.campo("totaleNotificheAnalogicoARNaz").fill("10");
    await l.regioneAr("1").fill("6");
    await l.regioneAr("5").fill("5");

    // expect: Campi AR delle regioni in errore (aria-invalid)
    await expect(l.regioneAr("1")).toHaveAttribute("aria-invalid", "true");
    await expect(l.regioneAr("5")).toHaveAttribute("aria-invalid", "true");
    // i campi 890 no
    await expect(l.regione890("1")).toHaveAttribute("aria-invalid", "false");
    // expect: Percentuale copertura AR > 100 con campo in errore
    await expect(l.coperturaAr).toHaveValue("110%");
    await expect(l.coperturaAr).toHaveAttribute("aria-invalid", "true");
    // expect: 'Avanti' e 'Indiero' disabilitati
    await expect(l.avanti).toBeDisabled();
    await expect(l.indietroStep).toBeDisabled();
    // NB: diverge dalla spec: con piu' moduli il pulsante principale si chiama 'Prosegui per salvare' ed e' sempre disabilitato
    // (anche senza errori); il caso 'Salva' disabilitato per errore e' coperto nel test sulla somma 890 (modulo singolo)
    await expect(l.proseguiPerSalvare).toBeDisabled();

    // 2. Correggere B a 4
    await l.regioneAr("5").fill("4");

    // expect: Errore rimosso, bottoni riabilitati
    await expect(l.regioneAr("1")).toHaveAttribute("aria-invalid", "false");
    await expect(l.regioneAr("5")).toHaveAttribute("aria-invalid", "false");
    await expect(l.coperturaAr).toHaveValue("100%");
    await expect(l.avanti).toBeEnabled();
    await expect(l.indietroStep).toBeEnabled();
  });

  test("Errore somma 890 superiore al totale 890", async ({ page }) => {
    await mockObbligatori(page, {
      moduli: moduloConRegioni([regione("Piemonte", "1"), regione("Veneto", "5")]),
    });
    const l = await openPage(page);

    // 1. Totale 890 = 5 e regioni con somma 890 = 6
    await l.campo("totaleNotificheAnalogico890Naz").fill("5");
    await l.regione890("1").fill("3");
    await l.regione890("5").fill("3");

    // expect: Campi 890 in errore, AR no
    await expect(l.regione890("1")).toHaveAttribute("aria-invalid", "true");
    await expect(l.regione890("5")).toHaveAttribute("aria-invalid", "true");
    await expect(l.regioneAr("1")).toHaveAttribute("aria-invalid", "false");
    await expect(l.regioneAr("5")).toHaveAttribute("aria-invalid", "false");
    await expect(l.copertura890).toHaveValue("120%");
    // expect: Salva disabilitato (modulo singolo: Avanti/Indiero non sono presenti)
    await expect(l.salva).toBeDisabled();
    await expect(l.avanti).toHaveCount(0);
    await expect(l.indietroStep).toHaveCount(0);
  });

  test("Errore ricalcolato al cambio del totale", async ({ page }) => {
    await mockObbligatori(page, { moduli: moduloConRegioni([regione("Piemonte", "1")]) });
    const l = await openPage(page);
    const totale = l.campo("totaleNotificheAnalogicoARNaz");

    // 1. Con somma regioni AR=8 e totale AR=10
    await totale.fill("10");
    await l.regioneAr("1").fill("8");
    await expect(l.regioneAr("1")).toHaveAttribute("aria-invalid", "false");

    // abbassare il totale a 5
    await totale.fill("5");
    // expect: Errore comparso a 5
    await expect(l.regioneAr("1")).toHaveAttribute("aria-invalid", "true");

    // poi rialzarlo a 10
    await totale.fill("10");
    // expect: Errore scomparso a 10
    await expect(l.regioneAr("1")).toHaveAttribute("aria-invalid", "false");
  });

  test("Regola errore per regione obbligatoria con valore null", async ({ page }) => {
    await mockObbligatori(page, {
      moduli: moduloConRegioni([
        regione("Lazio", "12", { obbligatorio: 1 }),
        regione("Veneto", "5"),
      ]),
    });
    const l = await openPage(page);

    // 1. In errore AR con una regione obbligatorio=1 e ar=null
    await l.campo("totaleNotificheAnalogicoARNaz").fill("4");
    await l.regioneAr("5").fill("9");

    // expect: Il campo AR della regione obbligatoria con ar null NON e' in errore; le altre si
    await expect(l.regioneAr("5")).toHaveAttribute("aria-invalid", "true");
    await expect(l.regioneAr("12")).toHaveAttribute("aria-invalid", "false");
  });

  test("Copertura AR e 890 calcolata", async ({ page }) => {
    await mockObbligatori(page, {
      moduli: moduloConRegioni([regione("Piemonte", "1"), regione("Veneto", "5")]),
    });
    const l = await openPage(page);
    const totale = l.campo("totaleNotificheAnalogicoARNaz");

    // 1. Totale AR 20 e regioni AR 5+5
    await totale.fill("20");
    await l.regioneAr("1").fill("5");
    await l.regioneAr("5").fill("5");
    // expect: 'Percentuale copertura inserita dell’aderente' AR = 50%
    await expect(page.getByText("Percentuale copertura inserita dell’aderente")).toBeVisible();
    await expect(l.coperturaAr).toHaveValue("50%");

    // 2. Totale AR 0
    await totale.fill("0");
    // expect: Copertura AR = 100%
    await expect(l.coperturaAr).toHaveValue("100%");

    // 3. Totale AR 3 e regioni AR 1
    await totale.fill("3");
    await l.regioneAr("1").fill("1");
    await l.regioneAr("5").fill("");
    // expect: 33% (Math.round)
    await expect(l.coperturaAr).toHaveValue("33%");

    // 4. Totale AR vuoto o null
    await totale.fill("");
    // expect: 0% (coperturaAr falsy)
    await expect(l.coperturaAr).toHaveValue("0%");
  });

  test("Copertura archiviato: manuale vs calcolata", async ({ page, context }) => {
    const archiviato = (valoriRegione: MockRegione[]) =>
      makeModuloIns(2026, 3, {
        ...VALORI,
        stato: "inserito",
        source: "archiviato",
        totaleNotificheAnalogicoARNaz: 100,
        totaleNotificheAnalogico890Naz: 100,
        valoriRegione,
      });
    const l = await (async () => {
      await mockDettaglioMode(page, {
        modulo: archiviato([
          regione("Piemonte", "1", { ar: 30, 890: 20, calcolato: 0 }),
          regione("Veneto", "5", { ar: 70, 890: 80, calcolato: 1 }),
        ]),
      });
      return openPage(page);
    })();

    // 1. Dettaglio archiviato con totale AR 100, regioni calcolato=0 AR 30 e calcolato=1 AR 70
    // expect: 'Percentuale copertura inserita dell’aderente' AR = 30%
    await expect(l.coperturaAr).toHaveValue("30%");
    // expect: 'Percentuale copertura attribuita dal sistema' AR = 70% (100 - manuale)
    await expect(page.getByText("Percentuale copertura attribuita dal sistema")).toBeVisible();
    await expect(l.coperturaSistemaAr).toHaveValue("70%");
    // expect: Idem per 890
    await expect(l.copertura890).toHaveValue("20%");
    await expect(l.coperturaSistema890).toHaveValue("80%");

    // expect: Con valoriRegione vuoto le righe percentuale non sono mostrate
    const vuoto = await apriDettaglio(context, archiviato([]));
    await expect(vuoto.l.coperturaAr).toHaveCount(0);
    await expect(vuoto.page.getByText("Percentuale copertura inserita dell’aderente")).toHaveCount(0);
    await expect(vuoto.page.getByText("Percentuale copertura attribuita dal sistema")).toHaveCount(0);
    await vuoto.page.close();

    // 2. Regioni calcolato assente (undefined)
    // expect: filter(calcolato===0) non conta le regioni: manuale 0% e sistema 100%
    // NB: documenta il comportamento attuale (la spec lo chiede come "documentare")
    const senzaCalcolato = await apriDettaglio(
      context,
      archiviato([{ regione: "Piemonte", istatRegione: "1", ar: 30, 890: 20 }]),
    );
    await expect(senzaCalcolato.l.coperturaAr).toHaveValue("0%");
    await expect(senzaCalcolato.l.coperturaSistemaAr).toHaveValue("100%");
    await expect(senzaCalcolato.page.getByText("Inserita manualmente dall’aderente", { exact: true })).toBeVisible();
    await senzaCalcolato.page.close();
  });

  test("Select regioni: disabilitata in sola lettura e nascosta se archiviato", async ({ page, context }) => {
    // 1. Aprire dettaglio sola lettura
    await mockDettaglioMode(page, {
      modulo: makeModuloIns(2026, 3, { ...VALORI, stato: "inserito" }),
    });
    const l = await openPage(page);

    // expect: Sola lettura: select e 'Aggiungi regione' disabilitati
    await expect(selectRegione(page, l)).toHaveAttribute("aria-disabled", "true");
    await expect(l.aggiungiRegione).toBeDisabled();

    // ... e dettaglio archiviato
    const arch = await apriDettaglio(context, makeModuloIns(2026, 3, { ...VALORI, stato: "inserito", source: "archiviato" }));

    // expect: Archiviato: non presenti
    await expect(arch.l.titoloDettaglio).toBeVisible();
    await expect(arch.page.getByRole("combobox")).toHaveCount(0);
    await expect(arch.l.aggiungiRegione).toHaveCount(0);
    await arch.page.close();
  });

  test("Lista regioni vuota", async ({ page }) => {
    await mockObbligatori(page, { regioni: [] });
    const l = await openPage(page);

    // 1. Mockare /regioni []
    // expect: Select senza opzioni
    await selectRegione(page, l).click();
    await expect(page.getByRole("option")).toHaveCount(0);
    await page.keyboard.press("Escape");
    // expect: 'Aggiungi regione' disabilitato
    await expect(l.aggiungiRegione).toBeDisabled();
  });
});

// REGIONI resta disponibile come riferimento dei dati di default (Lazio "12", Piemonte "1", Veneto "5")
void REGIONI;
