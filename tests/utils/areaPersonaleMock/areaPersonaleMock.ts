// Mock condiviso della pagina ente "Dati di fatturazione" (src/page/prod_pn/areaPersonaleUtenteEnte.tsx)
// spec: specs/areaPersonaleUtenteEnte.md
//
// USO RAPIDO
//   const api = await mockAreaPersonale(page);                                   // GET 200 con DATI_FATTURAZIONE_DEFAULT
//   const api = await mockAreaPersonale(page, { get: notFound(), sdi: ok({ contractCodiceSDI: "SDI0001" }) }); // primo inserimento
//   const api = await mockAreaPersonale(page, { get: [ok(vecchi), ok(nuovi)] }); // risposte in sequenza (l'ultima si ripete): GET dopo il salvataggio
//   const gate = createGate(); await mockAreaPersonale(page, { get: delayed(ok(DATI_FATTURAZIONE_DEFAULT), gate) }); ... gate.release();
//   api.get.reply(error(500));                                                   // cambia la risposta a meta' test (anche array)
//   api.get.calls / api.modify.bodies / api.verificaSdi.bodies[0]                // chiamate e body catturati
//   await openPage(page)                                                         // page.goto + attesa heading (con 404/errori usare page.goto)
//   await seedSession(page, { profilo: { ruolo: "R", idTipoContratto: 2 } });    // PRIMA del goto; accetta anche mainState (default ruolo "R/W", idTipoContratto 1)
//   await mainStatePersistito(page)                                              // lettura di globalStatePF.mainState
// Ogni endpoint (get, sdi, verificaSdi, insert, modify) espone { calls, bodies, reply() }.
// Reply: ok(body) | notFound() | error(status, body) | abort() | delayed(reply, gate). Default: tutto 200.

import type { Page, Route } from "@playwright/test";
import { expect } from "../../fixtures";
import { seedSession } from "../ente/docContabiliMock";

export { seedSession };

export const ROUTE = "/ente/datidifatturazione";
export const ERRORE_500 = "L'operazione non è andata a buon fine. Si prega di riprovare";
export const ERRORE_401 = "Utente non autenticato. Effettuare nuovamente l'accesso";

// page.route con RegExp confronta l'URL completo (con ?nonce=): si confronta solo il pathname
export const API = {
  get: /\/api\/datifatturazione\/ente$/,
  sdi: /\/api\/datifatturazione\/ente\/contractCodiceSDI$/,
  verificaSdi: /\/api\/datifatturazione\/codiceSDI$/,
  salva: /\/api\/datifatturazione$/, // POST = insert, PUT = modify
};

export type Contatto = { email: string; tipo: number | string };
export type DatiFatturazioneMock = {
  id: number;
  map: string | null;
  idEnte: string;
  tipoCommessa: string;
  splitPayment: boolean;
  cup: string;
  idDocumento: string;
  codCommessa: string;
  contatti: Contatto[];
  dataCreazione: string;
  dataModifica: string;
  dataDocumento: string | null;
  pec: string;
  notaLegale: boolean;
  prodotto: string;
  codiceSDI: string | null;
  contractCodiceSDI: string | null;
};

// Dati di fatturazione completi e validi
export const DATI_FATTURAZIONE_DEFAULT: DatiFatturazioneMock = {
  id: 1,
  map: null,
  idEnte: "729352e9-5bb9-4aff-a6b5-ca0c80c0d3b4",
  tipoCommessa: "1",
  splitPayment: true,
  cup: "CUP123",
  idDocumento: "DOC-1",
  codCommessa: "COM/1",
  contatti: [
    { email: "uno@test.it", tipo: 1 },
    { email: "due@test.it", tipo: 1 },
  ],
  dataCreazione: "2025-11-17T09:25:48.533",
  dataModifica: "2026-01-10T10:00:00",
  dataDocumento: "2026-03-15T00:00:00",
  pec: "pec@test.it",
  notaLegale: true,
  prodotto: "prod-pn",
  codiceSDI: "ABC1234",
  contractCodiceSDI: "CTR9999",
};

export const makeDatiFatturazione = (override: Partial<DatiFatturazioneMock> = {}): DatiFatturazioneMock => ({
  ...DATI_FATTURAZIONE_DEFAULT,
  ...override,
});

// ---- Risposte -------------------------------------------------------------------------------------------------

export type Gate = { promise: Promise<void>; release: () => void };
export type Reply = { status?: number; body?: unknown; abort?: boolean; gate?: Gate };

export function createGate(): Gate {
  let release = () => {};
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

export const ok = (body: unknown = {}): Reply => ({ status: 200, body });
export const notFound = (body: unknown = {}): Reply => ({ status: 404, body });
export const error = (status: number, body: unknown = {}): Reply => ({ status, body });
export const abort = (): Reply => ({ abort: true });
// La risposta viene trattenuta finche' non si chiama gate.release()
export const delayed = (reply: Reply, gate: Gate): Reply => ({ ...reply, gate });

// ---- Endpoint -------------------------------------------------------------------------------------------------

export type Endpoint = {
  /** numero di richieste ricevute */
  calls: number;
  /** body JSON delle richieste (undefined se la richiesta non ha body, es. GET) */
  bodies: unknown[];
  /** sostituisce la risposta (o la sequenza di risposte) e riparte dalla prima */
  reply: (replies: Reply | Reply[]) => void;
};

type InternalEndpoint = Endpoint & { next: () => Reply };

function makeEndpoint(initial: Reply | Reply[]): InternalEndpoint {
  let queue = Array.isArray(initial) ? initial : [initial];
  let index = 0;
  return {
    calls: 0,
    bodies: [] as unknown[],
    reply: (replies: Reply | Reply[]) => {
      queue = Array.isArray(replies) ? replies : [replies];
      index = 0;
    },
    // la risposta n-esima e' queue[n]; dopo l'ultima si ripete l'ultima
    next: () => queue[Math.min(index++, queue.length - 1)],
  };
}

async function respond(route: Route, reply: Reply) {
  if (reply.gate) await reply.gate.promise;
  if (reply.abort) return route.abort("failed");
  return route.fulfill({ status: reply.status ?? 200, contentType: "application/json", body: JSON.stringify(reply.body ?? {}) });
}

async function register(page: Page, re: RegExp, method: string, endpoint: InternalEndpoint) {
  await page.route(
    (url) => re.test(url.pathname),
    (route, request) => {
      if (request.method() !== method) return route.fallback();
      endpoint.calls++;
      endpoint.bodies.push(request.postData() ? request.postDataJSON() : undefined);
      return respond(route, endpoint.next());
    },
  );
}

export type AreaPersonaleOptions = {
  /** GET /api/datifatturazione/ente (default: 200 con DATI_FATTURAZIONE_DEFAULT) */
  get?: Reply | Reply[];
  /** GET /api/datifatturazione/ente/contractCodiceSDI (default: 200 { contractCodiceSDI: "SDI0001" }) */
  sdi?: Reply | Reply[];
  /** POST /api/datifatturazione/codiceSDI (default: 200); per l'errore: error(400, { detail: "..." }) */
  verificaSdi?: Reply | Reply[];
  /** POST /api/datifatturazione (primo inserimento, default: 200) */
  insert?: Reply | Reply[];
  /** PUT /api/datifatturazione (modifica, default: 200) */
  modify?: Reply | Reply[];
};

export async function mockAreaPersonale(page: Page, opts: AreaPersonaleOptions = {}) {
  const get = makeEndpoint(opts.get ?? ok(DATI_FATTURAZIONE_DEFAULT));
  const sdi = makeEndpoint(opts.sdi ?? ok({ contractCodiceSDI: "SDI0001" }));
  const verificaSdi = makeEndpoint(opts.verificaSdi ?? ok());
  const insert = makeEndpoint(opts.insert ?? ok());
  const modify = makeEndpoint(opts.modify ?? ok());

  await register(page, API.get, "GET", get);
  await register(page, API.sdi, "GET", sdi);
  await register(page, API.verificaSdi, "POST", verificaSdi);
  await register(page, API.salva, "POST", insert);
  await register(page, API.salva, "PUT", modify);

  return { get, sdi, verificaSdi, insert, modify };
}

export type AreaPersonaleApi = Awaited<ReturnType<typeof mockAreaPersonale>>;

// ---- Locator / helper -----------------------------------------------------------------------------------------

export function locators(page: Page) {
  return {
    // h4: 'Dati di fatturazione' | 'Modifica dati di fatturazione' | 'Inserisci i dati di fatturazione'
    heading: (nome: string) => page.getByRole("heading", { name: nome, exact: true }),
    titolo: page.getByRole("heading", { name: "Dati di fatturazione", exact: true }),
    modifica: page.getByRole("button", { name: "Modifica", exact: true }),
    indietro: page.getByRole("button", { name: "Indietro", exact: true }),
    salva: page.getByRole("button", { name: "Salva", exact: true }),
    breadcrumb: page.getByText("Dati di fatturazione /"),
    cup: page.getByLabel("CUP"),
    pec: page.getByLabel("PEC"),
    idDocumento: page.getByLabel("ID Documento"),
    codCommessa: page.getByLabel("Codice Commessa/Convenzione"),
    codiceSdi: page.getByLabel("Codice univoco o SDI"),
    emailAmministrativo: page.getByLabel("Email amministrativo"),
    aggiungiEmail: page.getByRole("button", { name: "Aggiungi Email" }),
    radioOrdine: page.getByRole("radio", { name: "Dati ordine d'acquisto" }),
    radioContratto: page.getByRole("radio", { name: "Dati contratto" }),
    labelPrimoAccesso: page.getByText("Data primo accesso", { exact: true }),
    labelUltimoAccesso: page.getByText("Data ultimo accesso", { exact: true }),
  };
}

/** goto + attesa del titolo (solo per i casi con dati: con 404/errori usare page.goto) */
export async function openPage(page: Page, titolo = "Dati di fatturazione") {
  await page.goto(ROUTE);
  const l = locators(page);
  await expect(l.heading(titolo)).toBeVisible();
  return l;
}

// Stato globale persistito
export const mainStatePersistito = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("globalStatePF") ?? "{}")?.state?.mainState);
