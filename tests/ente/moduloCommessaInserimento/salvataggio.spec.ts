// spec: specs/ente-moduloCommessaInserimento.md (sezione 6)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect, API_HOST } from "../../fixtures";
import {
  CAMPI, TESTO_CAMPI_NULL, VALORI, locators, makeModuloIns, mainStatePersistito, mockDatiFatturazione, mockDettaglioMode, mockObbligatori,
  mockPost, openPage,
} from "../../utils/moduloCommessaInserimentoMock/moduloCommessaInserimentoMock";
import type { MockModuloIns } from "../../utils/moduloCommessaInserimentoMock/moduloCommessaInserimentoMock";
import { mockAnni, mockLista } from "../../utils/moduloCommessaElencoMock/moduloCommessaElencoMock";

type L = ReturnType<typeof locators>;
type Campo = (typeof CAMPI)[number];
type BodyPost = {
  anno: number;
  mese: number;
  moduliCommessa: { numeroNotificheNazionali: number; numeroNotificheInternazionali: number; idTipoSpedizione: number; totaleNotifiche: number }[];
  valoriRegione: unknown[];
  valoriRegioni?: unknown;
}[];

const URL_ELENCO = /\/ente\/modulicommessa$/;
const URL_DATI_FATTURAZIONE = /\/ente\/datidifatturazione$/;
const ALERT_SALVATAGGIO = "Modulo commessa inserito";

const TESTO_COPERTURA_3_4 = /La percentale di copertura NON raggiunge il 100%\.\s+Le notifiche restanti\s+saranno integrate sulle regioni Italiane in base allla percentuale di residenza fornite tramite dati ISTAT\./;
const TESTO_COPERTURA_1_2 = /La percentale di copertura NON raggiunge il 100%\.\s+Le notifiche restanti\s+saranno integrate sulla regione di appartenenza\./;

const meseAnno = (page: Page, testo: string) => page.getByText(testo, { exact: true }).first();
const attenzione = (page: Page) => page.getByRole("heading", { name: "Attenzione!" });

// Compila i 5 campi del modulo (default 0: con totale AR/890 = 0 la copertura e' 100% e non compare il modale di copertura)
async function compila(l: L, valori: Partial<Record<Campo, number>> = {}) {
  for (const c of CAMPI) await l.campo(c).fill(String(valori[c] ?? 0));
}

// Modulo gia' compilato con copertura 100% (digitale 100/10, AR e 890 a 0)
const COMPILATO = {
  totaleNotificheDigitaleNaz: 100,
  totaleNotificheDigitaleInternaz: 10,
  totaleNotificheAnalogicoARNaz: 0,
  totaleNotificheAnalogicoARInternaz: 0,
  totaleNotificheAnalogico890Naz: 0,
};

async function aggiungiRegione(page: Page, l: L, nome: string) {
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: nome }).click();
  await page.keyboard.press("Escape");
  await l.aggiungiRegione.click();
}

// Richieste API in ordine di arrivo ("METHOD /path")
function traccia(page: Page) {
  const richieste: string[] = [];
  page.on("request", (req) => {
    if (API_HOST.test(req.url())) richieste.push(`${req.method()} ${new URL(req.url()).pathname}`);
  });
  return richieste;
}

// Evita che l'elenco (destinazione del redirect su errore) sovrascriva l'alert con un 404
async function mockElenco(page: Page) {
  await mockAnni(page);
  await mockLista(page);
}

test.describe("Salvataggio", () => {
  test("Label del pulsante: Modifica / Salva / Prosegui per salvare", async ({ page }) => {
    // 1. Verificare la label nei casi: obbligatori con step intermedio; stato non null; stato null (singolo)
    // Caso obbligatori con step intermedio
    await mockObbligatori(page, { moduli: [8, 9, 10].map((m) => makeModuloIns(2026, m)) });
    const l = await openPage(page);

    // expect: 'Prosegui per salvare' (isEditAllow && obbligatori && non ultimo step), variant text e disabilitato
    await expect(l.proseguiPerSalvare).toBeVisible();
    await expect(l.proseguiPerSalvare).toHaveClass(/MuiButton-text/);
    await expect(l.proseguiPerSalvare).toBeDisabled();
    await expect(l.salva).toHaveCount(0);

    // Passa alla modalita' dettaglio: il modulo restituito dal mock e' quello corrente
    let modulo: MockModuloIns = makeModuloIns(2026, 3, { stato: "inserito", ...VALORI });
    await mockDettaglioMode(page, { modulo: () => modulo });

    // expect: 'Modifica' (isEditAllow false, stato non null)
    await page.reload();
    await l.indietroHeader.waitFor();
    await expect(l.titoloDettaglio).toBeVisible();
    await expect(l.modifica).toBeVisible();
    await expect(l.salva).toHaveCount(0);

    // expect: 'Salva' (isEditAllow true)
    modulo = makeModuloIns(2026, 3, COMPILATO);
    await page.reload();
    await l.indietroHeader.waitFor();
    await expect(l.salva).toBeVisible();
    await expect(l.salva).toBeEnabled();
    await expect(l.modifica).toHaveCount(0);

    // expect: 'Salva' anche con isEditAllow false e stato null (dopo il salvataggio il mock restituisce ancora stato null)
    // il click (isEditAllow true) salva; il dettaglio ricaricato ha ancora stato null:
    // campi disabilitati (isCallAfterSaveData) ma label ancora 'Salva' (activeCommessa.stato === null)
    await l.salva.click();
    await expect(l.campo("totaleNotificheDigitaleNaz")).toBeDisabled();
    await expect(l.salva).toBeVisible();
    await expect(l.modifica).toHaveCount(0);
  });

  test("Pulsante Salva/Modifica nascosto: archiviato", async ({ page }) => {
    // NB: stato null per evitare il TerzoContainer (richiede totali e configurazione), la regola del pulsante dipende solo da source
    await mockDettaglioMode(page, { modulo: (a, m) => makeModuloIns(a, m, { source: "archiviato", stato: null, modifica: true }) });

    // 1. Dettaglio con source archiviato e modifica true
    const l = await openPage(page);

    // expect: nessun pulsante Salva/Modifica
    await expect(l.titoloDettaglio).toBeVisible();
    await expect(l.salva).toHaveCount(0);
    await expect(l.modifica).toHaveCount(0);
    await expect(l.proseguiPerSalvare).toHaveCount(0);
  });

  test("Pulsante Salva/Modifica nascosto: modifica false", async ({ page }) => {
    await mockDettaglioMode(page, { modulo: (a, m) => makeModuloIns(a, m, { modifica: false }) });

    // 1. Dettaglio con modifica false (non archiviato)
    const l = await openPage(page);

    // expect: nessun pulsante Salva/Modifica
    await expect(l.titoloDettaglio).toBeVisible();
    await expect(l.salva).toHaveCount(0);
    await expect(l.modifica).toHaveCount(0);
  });

  test("Modifica abilita la modifica", async ({ page }) => {
    const { post, datiFatturazione } = await mockDettaglioMode(page, { modulo: (a, m) => makeModuloIns(a, m, { stato: "inserito", ...VALORI }) });
    const l = await openPage(page);
    await expect(l.campo("totaleNotificheDigitaleNaz")).toBeDisabled();
    await expect(l.vediAnteprima).toBeVisible();
    const richieste = traccia(page);

    // 1. Dettaglio stato 'inserito', modifica true, cliccare 'Modifica'
    await l.modifica.click();

    // expect: campi abilitati, label 'Salva'
    for (const c of CAMPI) await expect(l.campo(c)).toBeEnabled();
    await expect(l.salva).toBeVisible();
    await expect(l.modifica).toHaveCount(0);
    // expect: statusPageInserimentoCommessa 'mutable'
    await expect.poll(async () => (await mainStatePersistito(page)).statusPageInserimentoCommessa).toBe("mutable");
    // expect: 'Vedi anteprima' sparisce (isEditAllow true)
    await expect(l.vediAnteprima).toHaveCount(0);
    // expect: nessuna chiamata di rete
    expect(richieste).toEqual([]);
    expect(post).toHaveLength(0);
    expect(datiFatturazione.n).toBe(0);
  });

  test("Salva modulo singolo (obbligatori): POST e redirect", async ({ page }) => {
    await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10, { totaleNotificheAnalogico: 22, totaleNotificheDigitale: 110 })] });
    // POST ritardata per vedere il modale Loading
    const post = await mockPost(page, 200, {}, 800);
    const l = await openPage(page);
    const richieste = traccia(page);

    // 1. Compilare digitale 100/10, AR 20/2, 890 5 con copertura 100% (regione che copre i totali) e cliccare 'Salva'
    await compila(l, {
      totaleNotificheDigitaleNaz: 100,
      totaleNotificheDigitaleInternaz: 10,
      totaleNotificheAnalogicoARNaz: 20,
      totaleNotificheAnalogicoARInternaz: 2,
      totaleNotificheAnalogico890Naz: 5,
    });
    await aggiungiRegione(page, l, "Lazio");
    await l.regioneAr("12").fill("20");
    await l.regione890("12").fill("5");
    await expect(l.coperturaAr).toHaveValue("100%");
    await expect(l.copertura890).toHaveValue("100%");
    await l.salva.click();

    // expect: 'Loading...' visibile durante la POST e poi chiuso
    await expect(l.loading).toBeVisible();
    // expect: alert 'Modulo commessa inserito'
    await expect(page.getByText(ALERT_SALVATAGGIO, { exact: true })).toBeVisible();
    await expect(l.loading).toBeHidden();
    // expect: redirect a /ente/datidifatturazione
    await expect(page).toHaveURL(URL_DATI_FATTURAZIONE);
    // expect: GET /api/datifatturazione/ente prima della POST
    expect(richieste.indexOf("GET /api/datifatturazione/ente")).toBeGreaterThanOrEqual(0);
    expect(richieste.indexOf("GET /api/datifatturazione/ente")).toBeLessThan(richieste.indexOf("POST /api/v2/modulocommessa"));
    // expect: POST con body array a un elemento
    expect(post).toHaveLength(1);
    expect(post[0]).toEqual([
      {
        anno: 2026,
        mese: 10,
        moduliCommessa: [
          { numeroNotificheNazionali: 20, numeroNotificheInternazionali: 2, idTipoSpedizione: 1, totaleNotifiche: 22 },
          { numeroNotificheNazionali: 5, numeroNotificheInternazionali: 0, idTipoSpedizione: 2, totaleNotifiche: 5 },
          { numeroNotificheNazionali: 100, numeroNotificheInternazionali: 10, idTipoSpedizione: 3, totaleNotifiche: 110 },
        ],
        valoriRegione: [{ regione: "Lazio", istatRegione: "12", ar: 20, 890: 5 }],
      },
    ]);
    // expect: statusPageInserimentoCommessa 'immutable'
    await expect.poll(async () => (await mainStatePersistito(page)).statusPageInserimentoCommessa).toBe("immutable");
  });

  test("Body POST con totaleNotificheAnalogico/Digitale non inviati dal form", async ({ page }) => {
    // 1. Mock lista senza totaleNotificheAnalogico e totaleNotificheDigitale, salvare
    const { post } = await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)] });
    const l = await openPage(page);
    await compila(l, { totaleNotificheDigitaleNaz: 100, totaleNotificheDigitaleInternaz: 10 });
    await l.salva.click();
    await expect(page).toHaveURL(URL_DATI_FATTURAZIONE);

    // expect: totaleNotifiche per idTipoSpedizione 1 e 3 e' 0 (i totali non sono ricalcolati dal form)
    // NB: probabile bug o calcolo lato server: il totale digitale 110 non viene inviato
    const body = post[0] as BodyPost;
    expect(post).toHaveLength(1);
    expect(body[0].moduliCommessa).toEqual([
      { numeroNotificheNazionali: 0, numeroNotificheInternazionali: 0, idTipoSpedizione: 1, totaleNotifiche: 0 },
      { numeroNotificheNazionali: 0, numeroNotificheInternazionali: 0, idTipoSpedizione: 2, totaleNotifiche: 0 },
      { numeroNotificheNazionali: 100, numeroNotificheInternazionali: 10, idTipoSpedizione: 3, totaleNotifiche: 0 },
    ]);
  });

  test("Salva con piu' moduli obbligatori: unica POST", async ({ page }) => {
    const { post, datiFatturazione } = await mockObbligatori(page, { moduli: [8, 9, 10].map((m) => makeModuloIns(2026, m)) });
    const l = await openPage(page);

    // 1. Compilare 3 moduli con Avanti, all'ultimo cliccare 'Salva'
    await compila(l, { totaleNotificheDigitaleNaz: 1 });
    await l.avanti.click();
    await expect(meseAnno(page, "Settembre/2026")).toBeVisible();
    await compila(l, { totaleNotificheDigitaleNaz: 2 });
    await l.avanti.click();
    await expect(meseAnno(page, "Ottobre/2026")).toBeVisible();
    await compila(l, { totaleNotificheDigitaleNaz: 3 });
    await l.salva.click();
    await expect(page).toHaveURL(URL_DATI_FATTURAZIONE);

    // expect: una sola POST con 3 elementi (uno per modulo, anno/mese corretti)
    expect(post).toHaveLength(1);
    // la pagina /ente/datidifatturazione richiama datifatturazione/ente al mount: conta almeno 1
    expect(datiFatturazione.n).toBeGreaterThanOrEqual(1);
    const body = post[0] as BodyPost;
    expect(body).toHaveLength(3);
    expect(body.map((m) => [m.anno, m.mese])).toEqual([[2026, 8], [2026, 9], [2026, 10]]);
    expect(body.map((m) => m.moduliCommessa[2].numeroNotificheNazionali)).toEqual([1, 2, 3]);
  });

  test("Salva con valoriRegione", async ({ page }) => {
    const { post } = await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)] });
    const l = await openPage(page);

    // 1. Aggiungere Piemonte con AR 5, 890 2 e salvare
    await compila(l, { totaleNotificheAnalogicoARNaz: 5, totaleNotificheAnalogico890Naz: 2 });
    await aggiungiRegione(page, l, "Piemonte");
    await l.regioneAr("1").fill("5");
    await l.regione890("1").fill("2");
    await l.salva.click();
    await expect(page).toHaveURL(URL_DATI_FATTURAZIONE);

    // expect: il body valoriRegione contiene l'oggetto regione con regione, istatRegione, ar:5, 890:2
    expect(post).toHaveLength(1);
    const body = post[0] as BodyPost;
    expect(body[0].valoriRegione).toEqual([{ regione: "Piemonte", istatRegione: "1", ar: 5, 890: 2 }]);
    // NB: la chiave inviata e' 'valoriRegione', il tipo PostModuloCommessa dichiara 'valoriRegioni': verificare con il backend
    expect(body[0]).not.toHaveProperty("valoriRegioni");
  });

  test("Salva con copertura <100 (macrocategoria 3/4 e 1/2)", async ({ page }) => {
    const { post, datiFatturazione } = await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)], macrocategoriaVendita: 3 });
    const l = await openPage(page);

    // 1. Totali valorizzati e regioni insufficienti (totale AR 10, nessuna regione), cliccare 'Salva'
    await compila(l, { totaleNotificheAnalogicoARNaz: 10 });
    await l.salva.click();

    // expect: ModalInfo (3/4) con il testo di copertura (doppio spazio e refuso 'allla')
    await expect(page.getByText(TESTO_COPERTURA_3_4)).toBeVisible();
    // expect: Annulla: nessuna POST
    await page.getByRole("button", { name: "Annulla" }).click();
    await expect(attenzione(page)).toHaveCount(0);
    expect(post).toHaveLength(0);
    expect(datiFatturazione.n).toBe(0);
    // expect: Prosegui: parte la POST
    await l.salva.click();
    await expect(page.getByText(TESTO_COPERTURA_3_4)).toBeVisible();
    await page.getByRole("button", { name: "Prosegui", exact: true }).click();
    await expect(page).toHaveURL(URL_DATI_FATTURAZIONE);
    expect(post).toHaveLength(1);

    // macrocategoria 4 (stesso testo) e 1/2 (testo sulla regione di appartenenza): Annulla, nessuna POST
    for (const [macro, testo] of [[4, TESTO_COPERTURA_3_4], [1, TESTO_COPERTURA_1_2], [2, TESTO_COPERTURA_1_2]] as const) {
      const m = await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)], macrocategoriaVendita: macro });
      const l2 = await openPage(page);
      await compila(l2, { totaleNotificheAnalogicoARNaz: 10 });
      await l2.salva.click();
      await expect(page.getByText(testo)).toBeVisible();
      await page.getByRole("button", { name: "Annulla" }).click();
      await expect(attenzione(page)).toHaveCount(0);
      expect(m.post).toHaveLength(0);
    }
  });

  test("Salva con campo null (modulo singolo)", async ({ page }) => {
    const { post, datiFatturazione } = await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)] });
    const l = await openPage(page);

    // 1. Cliccare 'Salva' con un campo vuoto
    await compila(l, { totaleNotificheDigitaleNaz: 5 });
    await l.campo("totaleNotificheAnalogico890Naz").clear();
    await l.salva.click();

    // expect: ModalInfo errore, nessuna chiamata a datifatturazione ne' POST
    await expect(attenzione(page)).toBeVisible();
    await expect(page.getByText(TESTO_CAMPI_NULL)).toBeVisible();
    expect(datiFatturazione.n).toBe(0);
    expect(post).toHaveLength(0);
    await page.keyboard.press("Escape");
    await expect(l.campo("totaleNotificheAnalogico890Naz")).toHaveAttribute("aria-invalid", "true");
    expect(post).toHaveLength(0);
  });

  test("Salva in modalita' dettaglio: ricarica dopo il salvataggio", async ({ page }) => {
    const ctx = { post: [] as unknown[] };
    // secondo GET dettaglio (dopo la POST) con stato 'inserito' e totaleNotifiche valorizzato
    const mocks = await mockDettaglioMode(page, {
      modulo: (a, m) =>
        ctx.post.length === 0
          ? makeModuloIns(a, m)
          : makeModuloIns(a, m, { stato: "inserito", ...VALORI, totaleNotificheAnalogicoARNaz: 0, totaleNotificheAnalogico890Naz: 0 }),
    });
    ctx.post = mocks.post;
    const l = await openPage(page);

    // 1. Dettaglio stato null modifica true, compilare e 'Salva'
    await compila(l, COMPILATO);
    await l.salva.click();

    // expect: alert 'Modulo commessa inserito'
    await expect(page.getByText(ALERT_SALVATAGGIO, { exact: true })).toBeVisible();
    // expect: POST con un solo modulo (anno/mese del modulo attivo)
    expect(mocks.post).toHaveLength(1);
    const body = mocks.post[0] as BodyPost;
    expect(body).toHaveLength(1);
    expect([body[0].anno, body[0].mese]).toEqual([2026, 3]);
    expect(body[0].moduliCommessa[2].numeroNotificheNazionali).toBe(100);
    // expect: nuovo GET /dettaglio/<anno>/<mese> e nessun redirect a datifatturazione
    await expect.poll(() => mocks.dettaglio.length).toBeGreaterThanOrEqual(2);
    expect(mocks.dettaglio.at(-1)).toBe("2026/3");
    await expect(page).toHaveURL(/\/ente\/modulocommessa$/);
    // expect: isEditAllow=false: campi disabilitati, label 'Modifica', compare 'Vedi anteprima'
    await expect(l.modifica).toBeVisible();
    for (const c of CAMPI) await expect(l.campo(c)).toBeDisabled();
    await expect(l.vediAnteprima).toBeVisible();
  });

  test("Modifica di un modulo gia' inserito e salvataggio", async ({ page }) => {
    const ctx = { post: [] as unknown[] };
    const mocks = await mockDettaglioMode(page, {
      modulo: (a, m) =>
        makeModuloIns(a, m, {
          stato: "inserito",
          ...COMPILATO,
          totaleNotifiche: 110,
          ...(ctx.post.length > 0 ? { totaleNotificheDigitaleNaz: 150 } : {}),
        }),
    });
    ctx.post = mocks.post;
    const l = await openPage(page);

    // 1. Dettaglio 'inserito' modifica true: 'Modifica', cambiare un valore, 'Salva'
    await l.modifica.click();
    await l.campo("totaleNotificheDigitaleNaz").fill("150");
    await l.salva.click();

    // expect: POST con il valore aggiornato
    await expect.poll(() => mocks.post.length).toBe(1);
    const body = mocks.post[0] as BodyPost;
    expect(body[0].moduliCommessa[2]).toMatchObject({ numeroNotificheNazionali: 150, numeroNotificheInternazionali: 10, idTipoSpedizione: 3 });
    // expect: dopo il reload isEditAllow=false
    await expect(l.modifica).toBeVisible();
    await expect(l.campo("totaleNotificheDigitaleNaz")).toBeDisabled();
    await expect(l.campo("totaleNotificheDigitaleNaz")).toHaveValue("150");
  });

  test("Errore 500 sulla POST con setErrorAlert", async ({ page }) => {
    await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)] });
    await mockElenco(page);
    const post = await mockPost(page, 500, { detail: "Dettaglio errore backend" });
    const l = await openPage(page);

    // 1. POST 500 con body {detail:'Dettaglio errore backend'}
    await compila(l);
    await l.salva.click();

    // expect: alert d'errore con il messaggio err.response.data.detail (setErrorAlert)
    await expect(page.getByText("Dettaglio errore backend", { exact: true })).toBeVisible();
    // expect: 'Loading...' chiuso
    await expect(l.loading).toBeHidden();
    // expect: redirect a /ente/modulicommessa
    await expect(page).toHaveURL(URL_ELENCO);
    expect(post).toHaveLength(1);
    // expect: statusPageInserimentoCommessa 'immutable'
    await expect.poll(async () => (await mainStatePersistito(page)).statusPageInserimentoCommessa).toBe("immutable");
  });

  test("Errore 500 con detail assente", async ({ page }) => {
    await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)] });
    await mockElenco(page);
    const post = await mockPost(page, 500, {});
    const l = await openPage(page);

    // 1. POST 500 con body {}
    await compila(l);
    await l.salva.click();

    // expect: setErrorAlert riceve message undefined: l'alert mostra il testo di default errori.400, nessun crash
    await expect(page.getByText("L'operazione non è andata a buon fine. Contattare l'assistenza", { exact: true })).toBeVisible();
    // expect: redirect all'elenco
    await expect(page).toHaveURL(URL_ELENCO);
    expect(post).toHaveLength(1);
  });

  test("Altri errori sulla POST (401, 403, 404, 409)", async ({ page }) => {
    // 401 e 403 per ultimi: l'alert innesca il logout dopo 3.5 secondi
    const casi = [
      [404, "La ricerca non ha prodotto risultati"],
      [409, "L'operazione non è andata a buon fine"],
      [403, "Utente non autenticato. Effettuare nuovamente l'accesso"],
      [401, "Utente non autenticato. Effettuare nuovamente l'accesso"],
    ] as const;

    for (const [status, testo] of casi) {
      // 1. POST con ciascuno status
      await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)] });
      await mockElenco(page);
      const post = await mockPost(page, status, {});
      const l = await openPage(page);
      await compila(l);
      await l.salva.click();

      // expect: manageError gestisce lo status del layout
      await expect(page.getByText(testo, { exact: true })).toBeVisible();
      // expect: redirect a /ente/modulicommessa
      await expect(page).toHaveURL(URL_ELENCO);
      expect(post).toHaveLength(1);
    }
  });

  test("GET datifatturazione/ente 404", async ({ page }) => {
    const { post } = await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)] });
    const datiFatturazione = await mockDatiFatturazione(page, 404);
    const l = await openPage(page);

    // 1. Mockare /api/datifatturazione/ente con 404 e salvare
    await compila(l);
    await l.salva.click();

    // expect: redirect a /ente/datidifatturazione
    await expect(page).toHaveURL(URL_DATI_FATTURAZIONE);
    // expect: nessuna POST
    // il salvataggio chiama datifatturazione/ente una volta; la pagina /ente/datidifatturazione lo richiama al mount
    expect(datiFatturazione.n).toBeGreaterThanOrEqual(1);
    expect(post).toHaveLength(0);
    // expect: modale Loading chiuso, mainState.datiFatturazione=false
    await expect(l.loading).toBeHidden();
    await expect.poll(async () => (await mainStatePersistito(page)).datiFatturazione).toBe(false);
  });

  test("GET datifatturazione/ente 500", async ({ page }) => {
    const { post } = await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)] });
    await mockElenco(page);
    const datiFatturazione = await mockDatiFatturazione(page, 500);
    const l = await openPage(page);

    // 1. Mockare con 500
    await compila(l);
    await l.salva.click();

    // expect: errore del layout, redirect a /ente/modulicommessa
    await expect(page.getByText("L'operazione non è andata a buon fine. Si prega di riprovare", { exact: true })).toBeVisible();
    await expect(page).toHaveURL(URL_ELENCO);
    // expect: nessuna POST
    expect(datiFatturazione.n).toBe(1);
    expect(post).toHaveLength(0);
  });

  test("Errore su reload dopo il salvataggio", async ({ page }) => {
    const mocks = await mockDettaglioMode(page, { modulo: (a, m) => makeModuloIns(a, m, COMPILATO) });
    // il secondo GET dettaglio (dopo la POST) risponde 500 con ritardo, cosi' l'alert di successo resta visibile
    let chiamate = 0;
    await page.route(/\/api\/v2\/modulocommessa\/dettaglio\//, async (route) => {
      chiamate++;
      if (chiamate === 1) return route.fallback();
      await new Promise((r) => setTimeout(r, 1500));
      return route.fulfill({ status: 500, contentType: "application/json", body: "{}" });
    });
    const l = await openPage(page);

    // 1. POST ok e secondo GET dettaglio 500
    await compila(l, COMPILATO);
    await l.salva.click();

    // expect: l'alert 'Modulo commessa inserito' e' stato emesso
    await expect(page.getByText(ALERT_SALVATAGGIO, { exact: true })).toBeVisible();
    expect(mocks.post).toHaveLength(1);
    // expect: manageError (alert 500) e Skeleton rimosso
    await expect(page.getByText("L'operazione non è andata a buon fine. Si prega di riprovare", { exact: true })).toBeVisible();
    await expect(l.indietroHeader).toBeVisible();
    expect(chiamate).toBe(2);
  });

  test("Doppio click su Salva", async ({ page }) => {
    const { datiFatturazione } = await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)] });
    // POST ritardata
    const post = await mockPost(page, 200, {}, 1500);
    const l = await openPage(page);
    await compila(l);

    // 1. Cliccare due volte rapidamente 'Salva' con POST ritardata
    await l.salva.dblclick();

    // expect: il modale Loading blocca il secondo click; la POST e' una sola
    await expect(l.loading).toBeVisible();
    await expect(page).toHaveURL(URL_DATI_FATTURAZIONE);
    expect(post).toHaveLength(1);
    // la pagina /ente/datidifatturazione richiama datifatturazione/ente al mount: conta almeno 1
    expect(datiFatturazione.n).toBeGreaterThanOrEqual(1);
  });

  test("Salva disabilitato con errori regioni", async ({ page }) => {
    const { post, datiFatturazione } = await mockObbligatori(page, { moduli: [makeModuloIns(2026, 10)] });
    const l = await openPage(page);

    // 1. Provocare errorArRegioni
    await compila(l);
    await aggiungiRegione(page, l, "Lazio");
    await l.campo("totaleNotificheAnalogicoARNaz").fill("10");
    await l.regioneAr("12").fill("15");

    // expect: 'Salva' disabilitato, nessuna POST
    await expect(l.regioneAr("12")).toHaveAttribute("aria-invalid", "true");
    await expect(l.salva).toBeDisabled();
    expect(post).toHaveLength(0);
    expect(datiFatturazione.n).toBe(0);
    await expect(attenzione(page)).toHaveCount(0);
  });
});
