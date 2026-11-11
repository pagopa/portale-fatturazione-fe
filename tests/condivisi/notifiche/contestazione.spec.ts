// spec: specs/notifiche.md (sezione 4)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  ERRORE_500, locators as baseLocators, mockAll, openPage,
} from "../../utils/notificheMock/notificheMock";

// ---------------------------------------------------------------------------------------------
// Mock locali delle API di contestazione (ruolo ENTE)
//  - GET  /api/notifiche/contestazione/{idNotifica}
//  - POST /api/notifiche/contestazione  (crea)
//  - PUT  /api/notifiche/contestazione  (modifica / annulla / rispondi)
//  - GET  /api/tipologia/tipocontestazione
// ---------------------------------------------------------------------------------------------
const ID = "ID-NOTIFICA-1";

const TIPI_CONTESTAZIONE = [
  { id: 1, tipo: "Ritardo nella consegna" },
  { id: 2, tipo: "Dati errati" },
  { id: 3, tipo: "Notifica non ricevuta" },
  { id: 9, tipo: "Mancato rispetto degli SLA (mera segnalazione)" },
  { id: 10, tipo: "Contestazione generica" },
];

type DatiContestazione = {
  id: number;
  tipoContestazione: number;
  idNotifica: string;
  noteEnte: string;
  noteSend: string | null;
  noteRecapitista: string | null;
  noteConsolidatore: string | null;
  rispostaEnte: string | null;
  statoContestazione: number;
  onere: string;
  dataInserimentoEnte: string;
  dataModificaEnte: string;
  dataInserimentoSend: string;
  dataModificaSend: string;
  dataInserimentoRecapitista: string;
  dataModificaRecapitista: string;
  dataInserimentoConsolidatore: string;
  dataModificaConsolidatore: string;
  dataChiusura: string;
  anno: number;
  mese: number;
};

type RispostaContestazione = {
  risposta: boolean;
  modifica: boolean;
  chiusura: boolean;
  contestazione: DatiContestazione;
};

function makeContestazione(
  flags: { modifica: boolean; risposta?: boolean; chiusura?: boolean },
  dati: Partial<DatiContestazione> = {},
): RispostaContestazione {
  return {
    risposta: flags.risposta ?? true,
    modifica: flags.modifica,
    chiusura: flags.chiusura ?? false,
    contestazione: {
      id: 1,
      tipoContestazione: 0,
      idNotifica: ID,
      noteEnte: "",
      noteSend: null,
      noteRecapitista: null,
      noteConsolidatore: null,
      rispostaEnte: null,
      statoContestazione: 1,
      onere: "",
      dataInserimentoEnte: "",
      dataModificaEnte: "",
      dataInserimentoSend: "",
      dataModificaSend: "",
      dataInserimentoRecapitista: "",
      dataModificaRecapitista: "",
      dataInserimentoConsolidatore: "",
      dataModificaConsolidatore: "",
      dataChiusura: "",
      anno: 2026,
      mese: 9,
      ...dati,
    },
  };
}

// Stati usati nei test (ENTE)
// stato 7: l'ente ha risposto a SEND; 'Risposta' modificabile, bottone 'Modifica Risposta' (PUT)
const statoRispostaEnte = () =>
  makeContestazione(
    { modifica: true },
    { statoContestazione: 7, tipoContestazione: 2, noteEnte: "Nota ente originale", rispostaEnte: "Risposta ente originale" },
  );
// stato 3: contestazione aperta dall'ente; 'Note Contestazione' modificabile, 'Annulla Contestazione' (PUT)
const statoContestata = () =>
  makeContestazione(
    { modifica: true },
    { statoContestazione: 3, tipoContestazione: 2, noteEnte: "Nota ente contestata" },
  );
// stato 1: contestazione da creare
const statoDaCreare = () => makeContestazione({ modifica: true }, { statoContestazione: 1 });

type Salvataggio = { method: string; url: string; body: Record<string, unknown> };

async function mockContestazione(page: Page, payload: RispostaContestazione) {
  const ctl = {
    payload,
    getStatus: 200,
    saveStatus: 200,
    gets: [] as string[],
    saves: [] as Salvataggio[],
  };
  const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

  await page.route(
    (url) => url.pathname.includes("/api/notifiche/contestazione/"),
    (route, request) => {
      ctl.gets.push(request.url());
      if (ctl.getStatus !== 200) return route.fulfill(json({}, ctl.getStatus));
      return route.fulfill(json(ctl.payload));
    },
  );
  // POST (crea) e PUT (modifica) condividono il path senza id: si distingue con il metodo
  await page.route(
    (url) => url.pathname.endsWith("/api/notifiche/contestazione"),
    (route, request) => {
      ctl.saves.push({ method: request.method(), url: request.url(), body: request.postDataJSON() });
      if (ctl.saveStatus !== 200) return route.fulfill(json({}, ctl.saveStatus));
      return route.fulfill(json({}));
    },
  );
  await page.route(
    (url) => url.pathname.endsWith("/api/tipologia/tipocontestazione"),
    (route) => route.fulfill(json(TIPI_CONTESTAZIONE)),
  );
  return ctl;
}

// Locator della pagina e del modale
function filtri(page: Page) {
  return {
    ...baseLocators(page),
    rows: page.getByRole("row", { name: /IUN-/ }),
    paginationLabel: page.getByText(/^\d+–\d+ of \d+$/).first(),
    // la riga e' identificata dal bottone Event ID (aria-label = idNotifica)
    row: (idNotifica: string) =>
      page.getByRole("row").filter({ has: page.getByRole("button", { name: idNotifica, exact: true }) }),
    // il modale e' aperto solo dalla cella 'Contestazione' (makeAction) o dalla freccia finale della riga
    // (ultimo bottone della riga, dopo il bottone Event ID); il click sulla riga non fa nulla
    arrow: (idNotifica: string) =>
      page
        .getByRole("row")
        .filter({ has: page.getByRole("button", { name: idNotifica, exact: true }) })
        .getByRole("button")
        .last(),
    // ModalContestazione
    modalTitle: page.getByRole("heading", { name: "Contestazione", exact: true }),
    modalTitleCrea: page.getByRole("heading", { name: "Crea contestazione", exact: true }),
    // ModalInfo
    infoTitle: page.getByRole("heading", { name: "Attenzione!" }),
    infoText: page.getByText("Non è possibile creare una contestazione."),
    // il Select MUI non ha un nome accessibile (InputLabel senza labelId): nel modale c'e' un solo combobox
    tipo: page.getByRole("combobox"),
    note: page.getByRole("textbox", { name: "Note Contestazione" }),
    risposta: page.getByRole("textbox", { name: "Risposta" }),
    crea: page.getByRole("button", { name: "Crea Contestazione" }),
    annullaContestazione: page.getByRole("button", { name: "Annulla Contestazione" }),
    modificaRisposta: page.getByRole("button", { name: "Modifica Risposta" }),
    modificaNota: page.getByRole("button", { name: "Modifica Nota" }),
  };
}

// Apre la pagina e attende il caricamento iniziale della lista ente (prima pagina da 10 righe)
async function ready(page: Page) {
  await openPage(page);
  const l = filtri(page);
  await expect(l.loading).toBeHidden();
  await expect(l.rows).toHaveCount(10);
  return l;
}

test.describe("Contestazione", () => {
  test("Click su riga: apertura ModalContestazione", async ({ page }) => {
    const { lista } = await mockAll(page);
    const ctl = await mockContestazione(page, statoRispostaEnte());
    const l = await ready(page);

    // 1. Mockare la GET contestazione con modifica=true e cliccare una riga
    await l.arrow(ID).click();

    // expect: Richiesta con l'idNotifica della riga
    await expect.poll(() => ctl.gets.length).toBe(1);
    expect(new URL(ctl.gets[0]).pathname).toMatch(/\/api\/notifiche\/contestazione\/ID-NOTIFICA-1$/);

    // expect: ModalContestazione aperto con i dati della contestazione; ENTE: campo risposta ente valorizzato da rispostaEnte
    await expect(l.modalTitle).toBeVisible();
    await expect(l.infoText).toHaveCount(0);
    await expect(l.tipo).toHaveText("Dati errati");
    await expect(l.note).toHaveValue("Nota ente originale");
    await expect(l.risposta).toHaveValue("Risposta ente originale");
    await expect(l.modificaRisposta).toBeEnabled();

    // expect: Modale 'Loading...' scompare
    await expect(l.loading).toBeHidden();
    // l'apertura del modale non ricarica la lista e non salva nulla
    expect(lista).toHaveLength(1);
    expect(ctl.saves).toHaveLength(0);
  });

  test("Contestazione scaduta: ModalInfo", async ({ page }) => {
    const { lista } = await mockAll(page);
    const ctl = await mockContestazione(
      page,
      makeContestazione({ modifica: false, chiusura: false }, { statoContestazione: 1 }),
    );
    const l = await ready(page);

    // 1. Mockare la GET con modifica=false, chiusura=false, statoContestazione=1 e cliccare una riga
    await l.arrow(ID).click();
    await expect.poll(() => ctl.gets.length).toBe(1);

    // expect: ModalInfo con testo 'Non è possibile creare una contestazione.'
    await expect(l.infoTitle).toBeVisible();
    await expect(l.infoText).toBeVisible();
    // expect: ModalContestazione NON aperto
    await expect(l.modalTitle).toHaveCount(0);
    await expect(l.modalTitleCrea).toHaveCount(0);
    await expect(l.crea).toHaveCount(0);
    await expect(l.loading).toBeHidden();

    // 2. Chiudere il ModalInfo (l'icona di chiusura e' un svg senza ruolo: si usa Escape, gestito da onClose)
    await page.keyboard.press("Escape");

    // expect: Modale chiuso, griglia invariata
    await expect(l.infoText).toHaveCount(0);
    await expect(l.infoTitle).toHaveCount(0);
    await expect(l.rows).toHaveCount(10);
    expect(lista).toHaveLength(1);
    expect(ctl.saves).toHaveLength(0);
  });

  test("modifica=false/chiusura=false con stato diverso da 1", async ({ page }) => {
    await mockAll(page);
    const ctl = await mockContestazione(
      page,
      makeContestazione(
        { modifica: false, chiusura: false },
        { statoContestazione: 2, tipoContestazione: 2, noteEnte: "Nota ente annullata", rispostaEnte: null },
      ),
    );
    const l = await ready(page);

    // 1. Mockare modifica=false, chiusura=false, statoContestazione=2 e cliccare una riga
    await l.arrow(ID).click();
    await expect.poll(() => ctl.gets.length).toBe(1);

    // expect: Si apre ModalContestazione, NON il ModalInfo
    await expect(l.modalTitle).toBeVisible();
    await expect(l.infoText).toHaveCount(0);
    await expect(l.infoTitle).toHaveCount(0);

    // expect (dal codice): tipo e note in sola lettura con i valori della contestazione
    await expect(l.tipo).toHaveText("Dati errati");
    await expect(l.note).toHaveValue("Nota ente annullata");
    await expect(l.note).toHaveAttribute("readonly", "");
    // 'Risposta' non e' mostrata: stato 2 con rispostaEnte null
    await expect(l.risposta).toHaveCount(0);
    // nessuna azione disponibile per l'ente: ne' creazione, ne' annullo, ne' modifica/risposta
    await expect(l.crea).toHaveCount(0);
    await expect(l.annullaContestazione).toHaveCount(0);
    await expect(l.modificaRisposta).toHaveCount(0);
    await expect(l.modificaNota).toHaveCount(0);
    await expect(page.getByRole("button")).toHaveCount(0);
  });

  test("Errore sulla GET contestazione", async ({ page }) => {
    await mockAll(page);
    const ctl = await mockContestazione(page, statoRispostaEnte());
    ctl.getStatus = 500;
    const l = await ready(page);

    // 1. Mockare la GET contestazione con 500 e cliccare una riga
    await l.arrow(ID).click();
    await expect.poll(() => ctl.gets.length).toBe(1);

    // expect: manageError visualizzato, loading chiuso, nessun modale contestazione aperto
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    await expect(l.loading).toBeHidden();
    await expect(l.modalTitle).toHaveCount(0);
    await expect(l.modalTitleCrea).toHaveCount(0);
    await expect(l.infoText).toHaveCount(0);
    await expect(l.rows).toHaveCount(10);
  });

  test("Chiusura del ModalContestazione senza salvare", async ({ page }) => {
    const { lista } = await mockAll(page);
    const ctl = await mockContestazione(page, statoRispostaEnte());
    const l = await ready(page);

    // 1. Aprire il modale, modificare un campo e chiudere/annullare
    await l.arrow(ID).click();
    await expect(l.modalTitle).toBeVisible();
    await expect(l.risposta).toHaveValue("Risposta ente originale");
    await l.risposta.fill("Risposta modificata non salvata");
    await expect(l.risposta).toHaveValue("Risposta modificata non salvata");
    // l'icona di chiusura e' un svg senza ruolo: si chiude con Escape (onClose -> handleClose)
    await page.keyboard.press("Escape");

    // expect: Nessuna chiamata PUT/POST
    await expect(l.modalTitle).toHaveCount(0);
    await expect(l.rows).toHaveCount(10);
    expect(ctl.saves).toHaveLength(0);
    expect(lista).toHaveLength(1);

    // expect: riaprendo la stessa riga i valori sono quelli originali
    await l.arrow(ID).click();
    await expect.poll(() => ctl.gets.length).toBe(2);
    await expect(l.modalTitle).toBeVisible();
    await expect(l.risposta).toHaveValue("Risposta ente originale");
    await expect(l.note).toHaveValue("Nota ente originale");
    expect(ctl.saves).toHaveLength(0);
  });

  test("Salvataggio contestazione e ricarico lista", async ({ page }) => {
    const { lista } = await mockAll(page);
    const ctl = await mockContestazione(page, statoDaCreare());
    const l = await ready(page);

    // 1. Aprire il modale, compilare i campi e salvare (creazione: POST /api/notifiche/contestazione)
    await l.arrow(ID).click();
    await expect(l.modalTitleCrea).toBeVisible();
    // 'Crea Contestazione' e' disabilitato finche' 'Note Contestazione' e' vuota
    await expect(l.crea).toBeDisabled();
    // in creazione sono nascosti i tipi 1 (Ritardo nella consegna), 9 e 10
    await l.tipo.click();
    await expect(page.getByRole("option", { name: "Dati errati" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Ritardo nella consegna" })).toHaveCount(0);
    await expect(page.getByRole("option", { name: "Contestazione generica" })).toHaveCount(0);
    await page.getByRole("option", { name: "Dati errati" }).click();
    await expect(l.tipo).toHaveText("Dati errati");
    await l.note.fill("Notifica con dati errati");
    await expect(l.crea).toBeEnabled();
    await l.crea.click();

    // expect: Richiesta con il body atteso, modale chiuso, lista ricaricata con page/rows correnti
    await expect.poll(() => ctl.saves.length).toBe(1);
    expect(ctl.saves[0].method).toBe("POST");
    expect(ctl.saves[0].body).toEqual({ idNotifica: ID, tipoContestazione: 2, noteEnte: "Notifica con dati errati" });
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].query).toMatchObject({ page: "1", pageSize: "10" });
    await expect(l.modalTitleCrea).toHaveCount(0);
    await expect(l.loading).toBeHidden();
    await expect(l.rows).toHaveCount(10);

    // 2. Annullare una contestazione aperta (stato 3: PUT /api/notifiche/contestazione con statoContestazione=2)
    ctl.payload = statoContestata();
    await l.arrow(ID).click();
    await expect(l.modalTitle).toBeVisible();
    await expect(l.note).toHaveValue("Nota ente contestata");
    await expect(l.modificaNota).toBeEnabled();
    await l.annullaContestazione.click();
    await expect.poll(() => ctl.saves.length).toBe(2);
    expect(ctl.saves[1].method).toBe("PUT");
    expect(ctl.saves[1].body).toEqual({ idNotifica: ID, statoContestazione: 2 });
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].query).toMatchObject({ page: "1", pageSize: "10" });
    await expect(l.modalTitle).toHaveCount(0);
    await expect(l.loading).toBeHidden();

    // 3. Modificare la risposta dell'ente e salvare (PUT con mock 200)
    ctl.payload = statoRispostaEnte();
    await l.arrow(ID).click();
    await expect(l.modalTitle).toBeVisible();
    await l.risposta.fill("Risposta ente aggiornata");
    await l.modificaRisposta.click();

    // expect: Richiesta con il body atteso, modale chiuso, lista ricaricata
    await expect.poll(() => ctl.saves.length).toBe(3);
    expect(ctl.saves[2].method).toBe("PUT");
    expect(ctl.saves[2].body).toEqual({
      idNotifica: ID,
      noteEnte: "Nota ente originale",
      rispostaEnte: "Risposta ente aggiornata",
      statoContestazione: 7,
    });
    await expect.poll(() => lista.length).toBe(4);
    expect(lista[3].query).toMatchObject({ page: "1", pageSize: "10" });
    await expect(l.modalTitle).toHaveCount(0);
    await expect(l.loading).toBeHidden();

    // 4. Ripetere con PUT 500
    ctl.saveStatus = 500;
    await l.arrow(ID).click();
    await expect(l.modalTitle).toBeVisible();
    await l.risposta.fill("Risposta che fallisce");
    await l.modificaRisposta.click();

    // expect: Errore gestito, la griglia non viene corrotta (modale chiuso, loading chiuso, nessun ricarico lista)
    await expect.poll(() => ctl.saves.length).toBe(4);
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    await expect(l.loading).toBeHidden();
    await expect(l.modalTitle).toHaveCount(0);
    await expect(l.rows).toHaveCount(10);
    expect(lista).toHaveLength(4);
  });
});
