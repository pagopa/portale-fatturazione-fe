// spec: specs/ente-moduloCommessaInserimento.md (sezione 2)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  CAMPI, REGIONI, ROUTE, ROUTE_ELENCO, VALORI, locators, makeModuloIns, mockDettaglioMode, mockListaObbligatori, mockObbligatori,
  mockRegioni, mockVerifica, openPage,
  type MockRegione,
} from "../../utils/moduloCommessaInserimentoMock/moduloCommessaInserimentoMock";
import { mockAll as mockAllElenco } from "../../utils/moduloCommessaElencoMock/moduloCommessaElencoMock";

const NO_INSERIMENTO_COMMESSA = "Al momento non è possibile inserire il modulo commessa. Contattare l'assistenza";
const URL_ELENCO = new RegExp(`${ROUTE_ELENCO}$`);
const URL_INSERIMENTO = new RegExp(`${ROUTE}$`);

// Raccoglie gli errori non gestiti della pagina (crash applicativi)
function pageErrors(page: Page) {
  const errors: Error[] = [];
  page.on("pageerror", (e) => errors.push(e));
  return errors;
}

// La select MUI "Inserisci regione" non ha labelId/name: il combobox non ha nome accessibile ed e' l'unico della pagina
const selectRegione = (page: Page) => page.getByRole("combobox");

// Risposte 200 con body libero (per i casi in cui mancano campi della risposta)
const rispondiLista = (page: Page, body: unknown) =>
  page.route(
    (url) => /\/api\/v2\/modulocommessa\/obbligatori\/lista$/.test(url.pathname),
    (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) }),
  );
const rispondiDettaglio = (page: Page, status: number, body: unknown) =>
  page.route(
    (url) => /\/api\/v2\/modulocommessa\/dettaglio\/\d+\/\d+$/.test(url.pathname),
    (route) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) }),
  );

const lazio = (override: Partial<MockRegione> = {}): MockRegione => ({ regione: "Lazio", istatRegione: "12", ar: null, 890: null, ...override });

test.describe("Caricamento obbligatori e dettaglio", () => {
  test("Obbligatori: lista con piu' moduli e step iniziale", async ({ page }) => {
    // 1. Mockare lista con 3 moduli: mesi 8 e 9 con stato 'inserito' e mese 10 con stato null
    await mockObbligatori(page, {
      moduli: [
        makeModuloIns(2026, 8, { stato: "inserito", ...VALORI }),
        makeModuloIns(2026, 9, { stato: "inserito", ...VALORI }),
        makeModuloIns(2026, 10),
      ],
    });
    const l = await openPage(page);

    // expect: Lo stepper mostra 'Agosto','Settembre','Ottobre'
    await expect(l.titoloObbligatori).toBeVisible();
    await expect(page.getByText("Agosto", { exact: true })).toBeVisible();
    await expect(page.getByText("Settembre", { exact: true })).toBeVisible();
    await expect(page.getByText("Ottobre", { exact: true })).toBeVisible();
    // expect: Step attivo = primo con stato null ('Ottobre/2026' nel Mese/Anno); il primo match e' il paragrafo di Mese/Anno
    await expect(page.getByText("Ottobre/2026", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Agosto/2026", { exact: true })).toHaveCount(0);
    // ultimo step: Avanti disabilitato, Indiero abilitato, label Salva
    await expect(l.avanti).toBeDisabled();
    await expect(l.indietroStep).toBeEnabled();
    await expect(l.salva).toBeVisible();
    // expect: Campi abilitati (isEditAllow=true)
    for (const campo of CAMPI) await expect(l.campo(campo)).toBeEditable();
  });

  test("Obbligatori: un solo modulo, niente stepper ne' Avanti/Indietro", async ({ page }) => {
    // 1. Mockare lista con un solo modulo
    await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)] });
    const l = await openPage(page);

    // expect: Nessuno stepper (steps.length>1 richiesto)
    await expect(l.titoloObbligatori).toBeVisible();
    await expect(page.getByText("Ottobre", { exact: true })).toHaveCount(0);
    // expect: Pulsanti 'Indiero' e 'Avanti' assenti
    await expect(l.indietroStep).toHaveCount(0);
    await expect(l.avanti).toHaveCount(0);
    // expect: Pulsante 'Salva' presente
    await expect(l.salva).toBeVisible();
  });

  test("Obbligatori: tutti i moduli gia' compilati (nessun stato null)", async ({ page }) => {
    const errors = pageErrors(page);

    // 1. Mockare lista con tutti i moduli con stato non null
    await mockObbligatori(page, {
      moduli: [
        makeModuloIns(2026, 8, { stato: "inserito", ...VALORI }),
        makeModuloIns(2026, 9, { stato: "inserito", ...VALORI }),
        makeModuloIns(2026, 10, { stato: "inserito", ...VALORI }),
      ],
    });
    const l = await openPage(page);

    // expect: dataObbligatori=false -> '/ Dettaglio-Inserimento modulo commessa'
    await expect(l.titoloDettaglio).toBeVisible();
    await expect(l.titoloObbligatori).toHaveCount(0);
    // NB: diverge dalla spec (che lascia il comportamento da documentare): findIndex restituisce -1, activeStep=-1,
    // activeCommessa=dataModuli[-1]=undefined: nessuno stepper, Mese/Anno "undefined/undefined", nessun Avanti/Salva
    await expect(page.getByText("Agosto", { exact: true })).toHaveCount(0);
    await expect(page.getByText("undefined/undefined", { exact: true }).first()).toBeVisible();
    await expect(l.avanti).toHaveCount(0);
    await expect(l.salva).toHaveCount(0);
    // expect: Nessun crash applicativo
    expect(errors).toEqual([]);
  });

  test("Obbligatori: lista senza campo 'lista' o vuota", async ({ page }) => {
    const errors = pageErrors(page);
    await mockObbligatori(page);

    // 1. Rispondere con {macrocategoriaVendita:1}
    await rispondiLista(page, { macrocategoriaVendita: 1 });
    const l = await openPage(page);

    // expect: obbligatori=[] -> activeCommessa undefined: pagina senza moduli ma senza crash (titolo dettaglio, nessun Salva/stepper)
    await expect(l.titoloDettaglio).toBeVisible();
    await expect(l.salva).toHaveCount(0);
    await expect(l.avanti).toHaveCount(0);
    await expect(l.campo("totaleNotificheDigitaleNaz")).toHaveValue("");
    expect(errors).toEqual([]);

    // 2. Rispondere con {lista:[]}
    await rispondiLista(page, { lista: [], macrocategoriaVendita: 1 });
    await page.reload();

    // expect: stesso comportamento, nessun crash
    await expect(l.indietroHeader).toBeVisible();
    await expect(l.titoloDettaglio).toBeVisible();
    await expect(l.salva).toHaveCount(0);
    await expect(l.campo("totaleNotificheDigitaleNaz")).toHaveValue("");
    expect(errors).toEqual([]);
  });

  test("Obbligatori: valoriRegione null viene normalizzato a []", async ({ page }) => {
    const errors = pageErrors(page);

    // 1. Mockare un modulo con valoriRegione:null
    await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10, { valoriRegione: null })] });
    const l = await openPage(page);

    // expect: Nessuna riga regione, nessun errore
    await expect(l.titoloObbligatori).toBeVisible();
    await expect(page.getByTestId(/^regione-ar-/)).toHaveCount(0);
    await expect(page.getByText("Regioni", { exact: true })).toHaveCount(0);
    await expect(l.campo("totaleNotificheDigitaleNaz")).toBeEditable();
    expect(errors).toEqual([]);
  });

  test("Obbligatori: regioni gia' presenti nel modulo escluse dalla select", async ({ page }) => {
    // 1. Mockare regioni [Lazio(12), Piemonte(1), Veneto(5)] e un modulo con valoriRegione=[{istatRegione:'12',...}]
    await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10, { valoriRegione: [lazio()] })], regioni: REGIONI });
    const l = await openPage(page);

    // expect: Tabella con la riga Lazio
    await expect(page.getByRole("heading", { name: "Lazio" })).toBeVisible();
    await expect(l.regioneAr("12")).toBeEditable();
    // expect: Aprendo 'Inserisci regione' compaiono solo Piemonte e Veneto
    await selectRegione(page).click();
    await expect(page.getByRole("option")).toHaveText(["Piemonte", "Veneto"]);
  });

  test("Regioni duplicate nella risposta deduplicate per istatRegione", async ({ page }) => {
    // 1. Mockare /regioni con due record con stesso istatRegione (province diverse)
    await mockObbligatori(page, {
      moduli: [makeModuloIns(2026, 10)],
      regioni: [
        lazio({ istatProvincia: "058", provincia: "Roma" }),
        lazio({ istatProvincia: "059", provincia: "Latina" }),
        { regione: "Piemonte", istatRegione: "1", ar: null, 890: null },
      ],
    });
    await openPage(page);

    // expect: La select mostra la regione una sola volta
    await selectRegione(page).click();
    await expect(page.getByRole("option")).toHaveText(["Lazio", "Piemonte"]);
  });

  test("Errore su obbligatori/lista: ritorno all'elenco", async ({ page }) => {
    // 1. verifica=true, obbligatori/lista 500 e aprire la pagina
    await mockAllElenco(page);
    await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)] });
    await mockListaObbligatori(page, [], 3, 500);
    await page.goto(ROUTE);

    // expect: Redirect a /ente/modulicommessa
    await expect(page).toHaveURL(URL_ELENCO);
    // expect: Alert 'Al momento non è possibile inserire il modulo commessa. Contattare l'assistenza'
    await expect(page.getByText(NO_INSERIMENTO_COMMESSA)).toBeVisible();
  });

  test("Errore su verifica: ritorno all'elenco", async ({ page }) => {
    // 1. verifica 500
    await mockAllElenco(page);
    await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)] });
    await mockVerifica(page, true, 500);
    await page.goto(ROUTE);

    // expect: Redirect a /ente/modulicommessa con alert NO_INSERIMENTO_COMMESSA (catch generale)
    await expect(page).toHaveURL(URL_ELENCO);
    await expect(page.getByText(NO_INSERIMENTO_COMMESSA)).toBeVisible();

    // 2. verifica 401
    await mockVerifica(page, true, 401);
    await page.goto(ROUTE);

    // expect: stesso comportamento: il catch generale non usa manageError, quindi nessun logout ma ritorno all'elenco
    await expect(page).toHaveURL(URL_ELENCO);
    await expect(page.getByText(NO_INSERIMENTO_COMMESSA)).toBeVisible();
  });

  test("verifica=false senza stato: ramo dettaglio con infoTrimestreComSelected vuoto", async ({ page }) => {
    // 1. verifica=false con infoTrimestreComSelected={} e aprire la pagina
    await mockAllElenco(page);
    await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)] });
    await mockVerifica(page, false);
    await page.goto(ROUTE);

    // expect: TypeError nel try (infoTrimestreComSelected.moduli di undefined), catch: redirect a /ente/modulicommessa
    await expect(page).toHaveURL(URL_ELENCO);
    // NB: l'alert NO_INSERIMENTO_COMMESSA non e' asserito: prima del TypeError parte GET dettaglio/undefined/undefined (404),
    // il cui manageError sovrascrive apiError con 404; l'alert finale dipende dall'ordine delle risposte
  });

  test("Errore su regioni", async ({ page }) => {
    const errors = pageErrors(page);

    // 1. Regioni 500
    await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)] });
    await mockRegioni(page, REGIONI, 500);
    const rispostaRegioni = page.waitForResponse((r) => r.url().includes("/api/v2/modulocommessa/regioni"));
    await page.goto(ROUTE);
    await rispostaRegioni;

    // expect: manageError gestisce l'errore; loadingData resta true: Skeleton permanente (header e corpo mai mostrati)
    // NB: conferma il probabile bug segnalato dalla spec (setLoadingData(false) solo nel then)
    const l = locators(page);
    await expect(l.indietroHeader).toHaveCount(0);
    await expect(l.titoloObbligatori).toHaveCount(0);
    await expect(l.campo("totaleNotificheDigitaleNaz")).toHaveCount(0);
    await expect(page).toHaveURL(URL_INSERIMENTO);
    expect(errors).toEqual([]);
  });

  test("Dettaglio: source obbligatorio, stato null, modifica true", async ({ page }) => {
    // 1. Mockare dettaglio {lista:[{source:'obbligatorio', stato:null, modifica:true, valoriRegione:[...]}], totali:[], macrocategoriaVendita:3}
    await mockDettaglioMode(page, {
      modulo: makeModuloIns(2026, 3, { source: "obbligatorio", stato: null, modifica: true, valoriRegione: [lazio({ calcolato: 0 })] }),
      macrocategoriaVendita: 3,
    });
    const l = await openPage(page);

    // expect: isEditAllow=true: campi abilitati, bottone 'Salva' visibile
    await expect(l.titoloDettaglio).toBeVisible();
    await expect(page.getByText("Marzo/2026", { exact: true }).first()).toBeVisible();
    for (const campo of CAMPI) await expect(l.campo(campo)).toBeEditable();
    await expect(l.regioneAr("12")).toBeEditable();
    await expect(l.salva).toBeVisible();
    await expect(l.modifica).toHaveCount(0);
  });

  test("Dettaglio: stato valorizzato (non archiviato) in sola lettura", async ({ page }) => {
    // 1. Mockare stato 'inserito', modifica true
    await mockDettaglioMode(page, {
      modulo: makeModuloIns(2026, 3, { stato: "inserito", modifica: true, ...VALORI, valoriRegione: [lazio({ ar: 5, 890: 2, calcolato: 0 })] }),
    });
    const l = await openPage(page);

    // expect: Campi disabilitati, pulsante 'Modifica' visibile
    await expect(l.titoloDettaglio).toBeVisible();
    for (const campo of CAMPI) {
      await expect(l.campo(campo)).toBeDisabled();
      await expect(l.campo(campo)).toHaveValue(String(VALORI[campo]));
    }
    await expect(l.modifica).toBeVisible();
    await expect(l.salva).toHaveCount(0);
    // expect: Le regioni mostrano chip invece del cestino
    await expect(l.regioneAr("12")).toBeDisabled();
    await expect(page.getByText("Inserita manualmente dall’aderente")).toBeVisible();
    await expect(page.getByTestId("DeleteIcon")).toHaveCount(0);
  });

  test("Dettaglio: source archiviato", async ({ page }) => {
    // 1. Mockare source 'archiviato', stato 'inserito', modifica true, con GET configurazione mockato
    await mockDettaglioMode(page, {
      modulo: makeModuloIns(2026, 3, {
        source: "archiviato", stato: "inserito", modifica: true, dataInserimento: "2026-03-10T10:00:00", ...VALORI,
        valoriRegione: [lazio({ ar: 5, 890: 2, calcolato: 0 })],
      }),
    });
    const l = await openPage(page);

    // expect: TerzoContainer visibile con 'TOTALE MODULO COMMESSA NETTO IVA' e 'Data modifica'
    await expect(page.getByText("TOTALE MODULO COMMESSA NETTO IVA")).toBeVisible();
    await expect(page.getByText("Data modifica")).toBeVisible();
    // expect: isEditAllow=false
    for (const campo of CAMPI) await expect(l.campo(campo)).toBeDisabled();
    // expect: Select 'Inserisci regione' e 'Aggiungi regione' assenti
    await expect(selectRegione(page)).toHaveCount(0);
    await expect(l.aggiungiRegione).toHaveCount(0);
    // expect: Pulsanti Salva/Modifica assenti
    await expect(l.salva).toHaveCount(0);
    await expect(l.modifica).toHaveCount(0);
  });

  test("Dettaglio: modifica false forza sola lettura", async ({ page }) => {
    // 1. Mockare stato null, source 'obbligatorio', modifica:false
    await mockAllElenco(page);
    await mockDettaglioMode(page, { modulo: makeModuloIns(2026, 3, { stato: null, source: "obbligatorio", modifica: false }) });
    const l = await openPage(page);

    // expect: isEditAllow=false (la regola !modifica prevale): campi disabilitati, nessun Salva/Modifica
    for (const campo of CAMPI) await expect(l.campo(campo)).toBeDisabled();
    await expect(l.salva).toHaveCount(0);
    await expect(l.modifica).toHaveCount(0);

    // expect: Click su 'Indietro' naviga a /ente/modulicommessa senza modale
    await l.indietroHeader.click();
    await expect(page).toHaveURL(URL_ELENCO);
    await expect(page.getByText("Le modifiche andranno perse")).toHaveCount(0);
  });

  test("Dettaglio: valoriRegione assente normalizzato a []", async ({ page }) => {
    const errors = pageErrors(page);

    // 1. Rispondere senza valoriRegione
    await mockDettaglioMode(page, { modulo: makeModuloIns(2026, 3, { valoriRegione: undefined }) });
    const l = await openPage(page);

    // expect: Nessun crash, nessuna riga regione
    await expect(l.titoloDettaglio).toBeVisible();
    await expect(l.campo("totaleNotificheDigitaleNaz")).toBeEditable();
    await expect(page.getByTestId(/^regione-ar-/)).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("Dettaglio: errori 500, 404 e lista vuota", async ({ page }) => {
    const errors = pageErrors(page);
    await mockDettaglioMode(page);
    const l = locators(page);

    // 1. Dettaglio 500
    await rispondiDettaglio(page, 500, {});
    await page.goto(ROUTE);

    // expect: manageError e Skeleton rimosso, pagina senza dati (campi vuoti e disabilitati, nessun Salva)
    await expect(l.indietroHeader).toBeVisible();
    await expect(l.campo("totaleNotificheDigitaleNaz")).toHaveValue("");
    await expect(l.campo("totaleNotificheDigitaleNaz")).toBeDisabled();
    await expect(l.salva).toHaveCount(0);
    await expect(l.modifica).toHaveCount(0);

    // 2. Dettaglio 404
    await rispondiDettaglio(page, 404, {});
    await page.reload();
    await expect(l.indietroHeader).toBeVisible();
    await expect(l.campo("totaleNotificheDigitaleNaz")).toHaveValue("");
    await expect(l.campo("totaleNotificheDigitaleNaz")).toBeDisabled();
    await expect(l.salva).toHaveCount(0);

    // 3. Dettaglio lista:[]
    await rispondiDettaglio(page, 200, { lista: [], totali: [], macrocategoriaVendita: 3 });
    await page.reload();

    // expect: TypeError su res.valoriRegione nel then, intercettato dal catch (manageError): Skeleton rimosso, pagina senza dati, nessun pageerror
    await expect(l.indietroHeader).toBeVisible();
    await expect(l.campo("totaleNotificheDigitaleNaz")).toHaveValue("");
    await expect(l.campo("totaleNotificheDigitaleNaz")).toBeDisabled();
    await expect(l.salva).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("Profilo di vendita e ModalInfo percentuali (macrocategoriaVendita)", async ({ page }) => {
    const errors = pageErrors(page);
    await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)] });
    const l = locators(page);

    // 1. Caricare con macrocategoriaVendita 1,2,3,4
    for (const macro of [1, 2, 3, 4]) {
      await mockListaObbligatori(page, [makeModuloIns(2026, 10)], macro);
      await page.goto(ROUTE);

      // expect: Il valore e' usato solo per il testo dei modali di copertura: al caricamento nessun modale e nessun errore
      await expect(l.titoloObbligatori).toBeVisible();
      await expect(l.campo("totaleNotificheDigitaleNaz")).toBeEditable();
      await expect(page.getByText("La percentale di copertura NON raggiunge il 100%", { exact: false })).toHaveCount(0);
    }
    expect(errors).toEqual([]);
  });

  test("Tipo contratto PAL/PAC", async ({ page }) => {
    await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10, { idTipoContratto: 1 })] });

    // 1. Mockare idTipoContratto 1 e 2
    await page.goto(ROUTE);

    // expect: 'PAL' per 1
    await expect(page.getByText("Tipo Contratto:")).toBeVisible();
    await expect(page.getByText("PAL", { exact: true })).toBeVisible();

    await mockListaObbligatori(page, [makeModuloIns(2026, 10, { idTipoContratto: 2 })], 3);
    await page.goto(ROUTE);

    // expect: 'PAC' per qualsiasi altro valore
    await expect(page.getByText("PAC", { exact: true })).toBeVisible();
    await expect(page.getByText("PAL", { exact: true })).toHaveCount(0);
  });
});
