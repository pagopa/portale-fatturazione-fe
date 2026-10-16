// spec: specs/ente-moduloCommessaInserimento.md (sezione 1)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  API, ROUTE, locators, mainStatePersistito, makeModuloIns, mockDettaglioMode, mockListaObbligatori, mockObbligatori, openPage,
  seedSession, setRedirectToInsert,
} from "../../utils/moduloCommessaInserimentoMock/moduloCommessaInserimentoMock";

// Trattiene una chiamata API finche' il test non chiama la funzione restituita, poi la passa al mock gia' registrato
async function ritarda(page: Page, re: RegExp) {
  let rilascia = () => {};
  const gate = new Promise<void>((resolve) => {
    rilascia = resolve;
  });
  await page.route(
    (url) => re.test(url.pathname),
    async (route) => {
      await gate;
      await route.fallback();
    },
  );
  return rilascia;
}

const FRASE_REDIRECT = /Per poter inserire il modulo commessa è obbligatorio fornire\s+i seguenti dati di fatturazione:/;

// Pulsante "Indietro" dell'header anche quando il resto della pagina e' aria-hidden (modale MUI aperto)
const indietroNascosto = (page: Page) => page.getByRole("button", { name: "Indietro", exact: true, includeHidden: true });

test.describe("Titolo e accesso", () => {
  test("Intestazione in modalita' obbligatori", async ({ page }) => {
    await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)], macrocategoriaVendita: "", regioni: [] });
    const rilascia = await ritarda(page, API.lista);
    const l = locators(page);

    // 1. Mockare verifica=true, obbligatori/lista con un modulo {annoValidita:2026, meseValidita:10, stato:null, valoriRegione:[], totale:null} e regioni [] (mockInserimento), impostare redirectToInsert=false e aprire /ente/modulocommessa
    const richiestaLista = page.waitForRequest((r) => API.lista.test(new URL(r.url()).pathname));
    await page.goto(ROUTE);
    await richiestaLista;

    // expect: Skeleton presente durante il caricamento (header, pulsanti e titolo non ancora renderizzati)
    await expect(l.indietroHeader).toHaveCount(0);
    await expect(l.titoloObbligatori).toHaveCount(0);

    // expect: Skeleton rimosso al termine del caricamento
    rilascia();
    await expect(l.indietroHeader).toBeVisible();

    // expect: Testo 'Modulo commessa' (caption) visibile (la stessa etichetta e' nel menu laterale: la caption e' l'ultima occorrenza)
    await expect(page.getByText("Modulo commessa", { exact: true }).last()).toBeVisible();
    // expect: Testo '/ Inserimento moduli commessa OBBLIGATORI' visibile e '/ Dettaglio-Inserimento modulo commessa' assente
    await expect(l.titoloObbligatori).toBeVisible();
    await expect(l.titoloDettaglio).toHaveCount(0);
    // expect: Riga 'Mese/Anno:' con 'Ottobre/2026' e 'Tipo Contratto:' (il mese/anno compare anche in grassetto nelle frasi dei campi: prima occorrenza)
    await expect(page.getByText("Mese/Anno:")).toBeVisible();
    await expect(page.getByText("Ottobre/2026", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Tipo Contratto:")).toBeVisible();
    await expect(page.getByText("PAL", { exact: true })).toBeVisible();
  });

  test("Intestazione in modalita' dettaglio", async ({ page }) => {
    const { verifica, dettaglio } = await mockDettaglioMode(page, { moduli: [{ anno: 2026, mese: 3 }] });
    const lista = await mockListaObbligatori(page);
    const l = locators(page);

    // 1. Seed di infoTrimestreComSelected (annoCommessaSelectd '2026', meseCommessaSelected '3', moduloSelectedIndex 0, moduli [{id:'3/2026', meseAnno:'Marzo/2026'}]) e mock dettaglio con un modulo, aprire la pagina
    await openPage(page);

    // expect: Testo '/ Dettaglio-Inserimento modulo commessa' visibile, '/ Inserimento moduli commessa OBBLIGATORI' assente
    await expect(l.titoloDettaglio).toBeVisible();
    await expect(l.titoloObbligatori).toHaveCount(0);
    // expect: Chiamata GET /api/v2/modulocommessa/dettaglio/2026/3 e nessuna chiamata a obbligatori/lista
    expect(dettaglio).toEqual(["2026/3"]);
    expect(verifica.n).toBe(1);
    expect(lista.n).toBe(0);
    // expect: 'Marzo/2026' nella riga Mese/Anno
    await expect(page.getByText("Mese/Anno:")).toBeVisible();
    await expect(page.getByText("Marzo/2026", { exact: true }).first()).toBeVisible();
  });

  test("Chiamate al mount e redirectToInsert", async ({ page }) => {
    // redirectToInsert='true' prima del caricamento (la prima init script vince: quella di mockObbligatori, 'false', viene ignorata)
    await setRedirectToInsert(page, "true");
    const { verifica, lista } = await mockObbligatori(page);

    // 1. Impostare redirectToInsert='true' e aprire la pagina
    await openPage(page);

    // expect: Una sola chiamata a obbligatori/verifica (e quindi una sola a obbligatori/lista)
    expect(verifica.n).toBe(1);
    expect(lista.n).toBe(1);
    // expect: localStorage redirectToInsert === 'false' dopo il mount
    await expect.poll(() => page.evaluate(() => localStorage.getItem("redirectToInsert"))).toBe("false");
  });

  test("Dati di fatturazione mancanti: ModalRedirect", async ({ page }) => {
    await seedSession(page, { mainState: { datiFatturazione: false } });
    await mockObbligatori(page);
    const l = locators(page);

    // 1. seedSession con mainState.datiFatturazione=false e aprire la pagina
    await page.goto(ROUTE);

    // expect: ModalRedirect con 'Attenzione!' e il testo 'Per poter inserire il modulo commessa è obbligatorio fornire  i seguenti dati di fatturazione:' (doppio spazio)
    await expect(page.getByRole("heading", { name: "Attenzione!" })).toBeVisible();
    await expect(page.getByText(FRASE_REDIRECT)).toBeVisible();
    // expect: Elenco dei dati mancanti
    await expect(page.getByText('Selezionare una delle voci "Dati ordine di acquisto" o "Dati contratto"', { exact: true })).toBeVisible();
    for (const voce of ["Split Payment", "Indirizzo mail PEC", "Codice SDI", "Indirizzo mail di riferimento", "Accettazione del disclaimer sul codice degli appalti"]) {
      await expect(page.getByText(voce, { exact: true })).toBeVisible();
    }
    await expect(page.getByText("Id Documento", { exact: true })).toHaveCount(0);
    // expect: Pulsante 'Vai ai dati di fatturazione'
    await expect(page.getByRole("button", { name: "Vai ai dati di fatturazione" })).toBeVisible();
    // expect: Il resto della pagina e' aria-hidden (il pulsante Indietro esiste ma non e' esposto)
    await expect(indietroNascosto(page)).toBeVisible();
    await expect(l.indietroHeader).toHaveCount(0);

    // 2. Cliccare 'Vai ai dati di fatturazione'
    await page.getByRole("button", { name: "Vai ai dati di fatturazione" }).click();

    // expect: URL /ente/datidifatturazione
    await expect(page).toHaveURL(/\/ente\/datidifatturazione$/);
  });

  test("ModalRedirect con datiFatturazioneNotCompleted e chiusura", async ({ page }) => {
    await seedSession(page, { mainState: { datiFatturazione: false, datiFatturazioneNotCompleted: true } });
    await mockObbligatori(page);
    const l = locators(page);

    // 1. seedSession con datiFatturazione=false e datiFatturazioneNotCompleted=true, aprire la pagina
    await page.goto(ROUTE);

    // expect: Nel modale compare solo la voce 'Id Documento'
    await expect(page.getByRole("heading", { name: "Attenzione!" })).toBeVisible();
    await expect(page.getByText(FRASE_REDIRECT)).toBeVisible();
    await expect(page.getByText("Id Documento", { exact: true })).toBeVisible();
    await expect(page.getByText("Split Payment", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Codice SDI", { exact: true })).toHaveCount(0);
    await expect(indietroNascosto(page)).toBeVisible();

    // 2. Premere Escape
    await page.keyboard.press("Escape");

    // expect: Il modale si chiude (reason escapeKeyDown) e la pagina torna accessibile
    await expect(page.getByRole("heading", { name: "Attenzione!" })).toHaveCount(0);
    await expect(page.getByText("Id Documento", { exact: true })).toHaveCount(0);
    await expect(l.indietroHeader).toBeVisible();

    // 3. Riaprire il modale (reload: la sessione resta con datiFatturazione=false) e cliccare sul backdrop
    await page.reload();
    await expect(page.getByRole("heading", { name: "Attenzione!" })).toBeVisible();
    await page.mouse.click(5, 5);

    // expect: Il modale resta aperto (backdropClick ignorato)
    // NB: dopo il click sul backdrop il focus esce dal modale e Escape non lo chiude piu' (verificato dal vivo)
    await expect(page.getByRole("heading", { name: "Attenzione!" })).toBeVisible();
    await expect(page.getByText("Id Documento", { exact: true })).toBeVisible();
  });

  test("datiFatturazione true: nessun ModalRedirect", async ({ page }) => {
    await mockObbligatori(page);

    // 1. Aprire la pagina con sessione standard
    await openPage(page);

    // expect: Testo 'Per poter inserire il modulo commessa' assente
    await expect(page.getByText("Per poter inserire il modulo commessa")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Vai ai dati di fatturazione" })).toHaveCount(0);
  });

  test("BasicModal impostato a mutable in modalita' obbligatori", async ({ page }) => {
    await mockObbligatori(page);

    // 1. Aprire la pagina in modalita' obbligatori e leggere globalStatePF
    await openPage(page);

    // expect: mainState.statusPageInserimentoCommessa === 'mutable'
    await expect.poll(async () => (await mainStatePersistito(page))?.statusPageInserimentoCommessa).toBe("mutable");
    // expect: BasicModal ('Attenzione!' / 'Le modifiche andranno perse') non visibile (open e' l'oggetto openBasicModal_DatFat_ModCom, visible assente)
    await expect(page.getByRole("heading", { name: "Attenzione!" })).toHaveCount(0);
    await expect(page.getByText("Le modifiche andranno perse")).toHaveCount(0);
  });
});
