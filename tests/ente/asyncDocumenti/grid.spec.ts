// spec: specs/ente-asyncDocumenti.md (sezione 3)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  API, ERRORE_500, ROUTE, STATI, endsWith, locators as baseLocators, makeDocumenti, mockAll, mockLista, openPage,
} from "../../utils/asyncDocumentiMock/asyncDocumentiMock";

function griglia(page: Page) {
  return {
    ...baseLocators(page),
    headers: page.getByRole("columnheader"),
    sortDataRichiesta: page.getByRole("columnheader", { name: /Data Richiesta/ }).getByRole("button"),
    dettaglio: page.getByRole("table", { name: "purchases" }),
  };
}

// Apre la pagina e attende il caricamento iniziale (prima pagina da 10 righe su 25 documenti)
async function ready(page: Page) {
  await openPage(page);
  const l = griglia(page);
  await expect(l.loading).toBeHidden();
  await expect(l.rows).toHaveCount(10);
  return l;
}

test.describe("Griglia", () => {
  test("Intestazioni e contenuto delle righe", async ({ page }) => {
    await mockAll(page, makeDocumenti(25));

    // 1. Con lista popolata verificare getByRole('columnheader')
    const l = await ready(page);

    // expect: Colonne: (freccia), Data Richiesta, Anno, Mese, Tot. Not., Data Esecuzione, Stato, Letto, (download)
    await expect(l.headers).toHaveCount(9);
    for (const nome of ["Data Richiesta", "Anno", "Mese", "Tot. Not.", "Data Esecuzione", "Stato", "Letto"]) {
      await expect(page.getByRole("columnheader", { name: nome })).toBeVisible();
    }
    // expect: Solo 'Data Richiesta' ha il controllo di sort
    await expect(l.headers.getByRole("button")).toHaveCount(1);
    await expect(l.sortDataRichiesta).toBeVisible();

    // 2. Leggere una riga con dati noti (documento 1: Elaborato, non letto)
    const riga = l.rows.nth(1);

    // expect: Anno, Mese, Tot. Not., date formattate e chip Stato corretti
    await expect(riga.getByRole("cell", { name: "2026-09-02 10:00:00", exact: true })).toBeVisible();
    await expect(riga.getByRole("cell", { name: "2026", exact: true })).toBeVisible();
    await expect(riga.getByRole("cell", { name: "Settembre", exact: true })).toBeVisible();
    await expect(riga.getByRole("cell", { name: "11", exact: true })).toBeVisible();
    await expect(riga.getByRole("cell", { name: "2026-09-02 11:30:00", exact: true })).toBeVisible();
    await expect(riga.getByRole("cell", { name: "Elaborato", exact: true })).toBeVisible();
  });

  test("Chip di stato", async ({ page }) => {
    // 1. Mockare righe con stato Presa in carico, Elaborato, Elaborato no data, Errore
    await mockAll(page, makeDocumenti(25));
    const l = await ready(page);

    // expect: Un chip con il testo corrispondente per ogni riga
    // NB: i colori dei chip non sono asseriti (solo il testo), come indicato dalla spec
    for (let i = 0; i < 4; i++) {
      await expect(l.rows.nth(i).getByRole("cell", { name: STATI[i], exact: true })).toBeVisible();
    }
  });

  test("Icona Letto / Non letto e sfondo riga", async ({ page }) => {
    // 1. Mockare una riga letto=true e una letto=false (makeDocumento: letto = i pari)
    await mockAll(page, makeDocumenti(25));
    const l = await ready(page);
    const letta = l.rows.nth(0);
    const nonLetta = l.rows.nth(1);

    // expect: Riga letta: tooltip 'Letto' e sfondo verde #F0FFF0
    await expect(letta.getByLabel("Letto", { exact: true })).toBeVisible();
    await expect(letta).toHaveCSS("background-color", "rgb(240, 255, 240)");

    // expect: Riga non letta: tooltip 'Non letto' e sfondo standard
    await expect(nonLetta.getByLabel("Non letto", { exact: true })).toBeVisible();
    await expect(nonLetta).not.toHaveCSS("background-color", "rgb(240, 255, 240)");
  });

  test("Stato del pulsante download per ogni stato", async ({ page }) => {
    await mockAll(page, makeDocumenti(25));
    const l = await ready(page);

    // 1. Verificare il pulsante download di ogni riga
    // expect: Elaborato abilitato; Presa in carico, Elaborato no data, Errore disabilitati
    for (let i = 0; i < 10; i++) {
      const download = l.rows.nth(i).getByRole("cell").last().getByRole("button");
      if (STATI[i % 4] === "Elaborato") {
        await expect(download).toBeEnabled();
      } else {
        await expect(download).toBeDisabled();
      }
    }
  });

  test("Riga espandibile 'Filtri Applicati' con tutti i campi", async ({ page }) => {
    await mockAll(page, makeDocumenti(25));
    const l = await ready(page);
    await expect(l.dettaglio).toHaveCount(0);

    // 1. Cliccare la freccia di una riga con json valorizzato
    await l.rows.nth(0).getByRole("button", { name: "expand row" }).click();

    // expect: Sezione 'Filtri Applicati' con colonne Anno, Mese, Tipo Notifica, CAP, IUN, Stato Contestazione e valori del json
    await expect(page.getByText("Filtri Applicati")).toBeVisible();
    await expect(l.dettaglio).toBeVisible();
    await expect(l.dettaglio.getByRole("columnheader")).toHaveText([
      "Anno", "Mese", "Tipo Notifica", "CAP", "IUN", "Stato Contestazione",
    ]);
    await expect(l.dettaglio.getByRole("cell")).toHaveText([
      "2026", "Settembre", "Digitali", "10099", "IUN-0", "Annullata",
    ]);

    // expect: Nuovo click chiude la sezione
    await l.rows.nth(0).getByRole("button", { name: "expand row" }).click();
    await expect(l.dettaglio).toHaveCount(0);
  });

  test("Riga espandibile con campi json null", async ({ page }) => {
    const errori: string[] = [];
    page.on("pageerror", (e) => errori.push(e.message));
    const nullo = null as unknown as number;
    await mockAll(
      page,
      makeDocumenti(25, (i) => {
        if (i === 1) {
          return { json: JSON.stringify({ anno: nullo, mese: nullo, tipoNotifica: nullo, cap: nullo, iun: nullo, statoContestazione: nullo }) };
        }
        if (i === 2) return { json: null };
        if (i === 3) return { json: undefined };
        return {};
      }),
    );

    // 1. Mockare una riga con json a campi null (e una con json assente) ed espanderla
    const l = await ready(page);

    // expect: json con tutti i campi null: nessun errore JS, ogni cella mostra il segnaposto '--'
    await l.rows.nth(1).getByRole("button", { name: "expand row" }).click();
    await expect(l.dettaglio.getByRole("cell")).toHaveText(["--", "--", "--", "--", "--", "--"]);
    await l.rows.nth(1).getByRole("button", { name: "expand row" }).click();
    await expect(l.dettaglio).toHaveCount(0);

    // expect: json null e json assente: element[key] || [] => nessuna riga di dettaglio, solo le intestazioni, nessun crash
    // NB: diverge dalla spec (dubbio "il codice potrebbe non gestirlo"): il codice lo gestisce con `|| []`
    for (const i of [2, 3]) {
      await l.rows.nth(i).getByRole("button", { name: "expand row" }).click();
      await expect(l.dettaglio).toBeVisible();
      await expect(l.dettaglio.getByRole("columnheader")).toHaveCount(6);
      await expect(l.dettaglio.getByRole("cell")).toHaveCount(0);
      await l.rows.nth(i).getByRole("button", { name: "expand row" }).click();
      await expect(l.dettaglio).toHaveCount(0);
    }
    expect(errori).toEqual([]);
    await expect(l.rows).toHaveCount(10);
  });

  test("Ordinamento per Data Richiesta", async ({ page }) => {
    const { lista } = await mockAll(page, makeDocumenti(25));
    const l = await ready(page);
    expect(lista).toHaveLength(1);
    expect(lista[0].body.ordinamento).toBe(1);

    // 1. Cliccare il controllo di sort di 'Data Richiesta'
    await l.sortDataRichiesta.click();

    // expect: Richiesta con ordinamento diverso da 1 (0), page/pageSize correnti
    await expect.poll(() => lista.length).toBe(2);
    expect(lista[1].query).toMatchObject({ page: "1", pageSize: "10" });
    expect(lista[1].body).toMatchObject({ init: null, end: null, ordinamento: 0 });
    // expect: 'Annulla filtri' NON compare per il solo ordinamento
    await expect(l.rows).toHaveCount(10);
    await expect(l.annulla).toHaveCount(0);

    // 2. Cliccare di nuovo
    await l.sortDataRichiesta.click();

    // expect: Nuova richiesta con il valore successivo (toggle 0 -> 1)
    await expect.poll(() => lista.length).toBe(3);
    expect(lista[2].query).toMatchObject({ page: "1", pageSize: "10" });
    expect(lista[2].body.ordinamento).toBe(1);
    await expect(l.annulla).toHaveCount(0);
  });

  test("Stato vuoto", async ({ page }) => {
    // 1. Mockare la lista con {items:[],count:0}
    await mockAll(page, []);
    const l = await openPage(page);
    await expect(l.loading).toBeHidden();

    // expect: Testo 'Non sono presenti documenti'
    await expect(l.empty).toBeVisible();
    await expect(l.rows).toHaveCount(0);
    // expect: Paginatore '0-0 of 0' con next/prev disabilitati
    await expect(l.paginationLabel).toHaveText("0–0 of 0");
    await expect(l.next).toBeDisabled();
    await expect(l.previous).toBeDisabled();
  });

  test("Errore 500 sulla lista", async ({ page }) => {
    // 1. Mockare POST /api/notifiche/richiesta con 500
    await mockLista(page, undefined, 500);
    const l = griglia(page);
    await openPage(page);

    // expect: Messaggio d'errore, 'Loading...' chiuso, griglia vuota
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    await expect(l.loading).toBeHidden();
    await expect(l.empty).toBeVisible();
    await expect(l.rows).toHaveCount(0);

    // 2. Ripristinare il mock e cliccare 'Filtra'
    const lista = await mockLista(page, makeDocumenti(25));
    await l.filtra.click();

    // expect: Griglia ripopolata
    await expect.poll(() => lista.length).toBe(1);
    await expect(l.rows).toHaveCount(10);
    await expect(l.empty).toHaveCount(0);
  });

  test("Errore 404 sulla lista", async ({ page }) => {
    // 1. Mockare la lista con 404
    await mockLista(page, undefined, 404);
    const l = griglia(page);
    await openPage(page);

    // expect: errore gestito da manageError (404 = "La ricerca non ha prodotto risultati")
    await expect(page.getByText("La ricerca non ha prodotto risultati")).toBeVisible();
    // expect: griglia vuota 'Non sono presenti documenti', nessun crash
    await expect(l.loading).toBeHidden();
    await expect(l.empty).toBeVisible();
    await expect(l.rows).toHaveCount(0);
    await expect(l.paginationLabel).toHaveText("0–0 of 0");
  });

  test("Caricamento lento", async ({ page }) => {
    await mockAll(page, makeDocumenti(25));
    // 1. Ritardare la risposta con una promise controllata
    let rilascia!: () => void;
    const gate = new Promise<void>((resolve) => {
      rilascia = resolve;
    });
    await page.route(endsWith(API.lista), async (route) => {
      await gate;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: makeDocumenti(25).slice(0, 10), count: 25 }),
      });
    });
    await page.goto(ROUTE);
    const l = griglia(page);

    // expect: 'Loading...' visibile e bloccante (resto della pagina aria-hidden) fino alla risposta
    await expect(l.loading).toBeVisible();
    await expect(l.filtra).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Filtra", includeHidden: true })).toHaveCount(1);
    await expect(l.rows).toHaveCount(0);

    rilascia();

    // expect: a risposta arrivata il loading scompare e la griglia e' utilizzabile
    await expect(l.loading).toBeHidden();
    await expect(l.rows).toHaveCount(10);
    await expect(l.filtra).toBeEnabled();
  });
});
