// spec: specs/ente-moduloCommessaElenco.md (sezione 3)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  CAPTION_OK, ROUTE, locators, makeAnno, mockAll, mockAnni, mockLista, mockVerifica, openPage, savedFilters,
  setRedirectToInsert,
} from "../../utils/moduloCommessaElencoMock/moduloCommessaElencoMock";

// Dataset con tre anni: 36 righe senza filtro, 12 per anno
const TRE_ANNI = [...makeAnno(2026), ...makeAnno(2025), ...makeAnno(2024)];

// Apre la pagina e attende il caricamento iniziale della lista
async function ready(page: Page, righe = 24) {
  const l = await openPage(page);
  await expect(l.loading).toBeHidden();
  await expect(l.rows).toHaveCount(righe);
  return l;
}

async function selezionaAnno(page: Page, l: ReturnType<typeof locators>, anno: string) {
  await l.anno.click();
  await page.getByRole("option", { name: anno, exact: true }).click();
  await expect(l.anno).toHaveText(anno);
}

// Righe della griglia con Mese/Anno dell'anno indicato
const righeAnno = (page: Page, anno: string) =>
  locators(page).rows.filter({ has: page.getByRole("cell", { name: new RegExp(`/${anno}$`) }) });

test.describe("Filtri", () => {
  test("Stato iniziale dei filtri", async ({ page }) => {
    await mockAll(page);

    // 1. Aprire la pagina (verifica false, redirectToInsert=false)
    const l = await ready(page);

    // expect: Select 'Filtra per anno' visibile, senza valore
    await expect(l.anno).toBeVisible();
    // expect: 'Filtra' visibile e disabilitato
    await expect(l.filtra).toBeVisible();
    await expect(l.filtra).toBeDisabled();
    // expect: 'Annulla filtri' non presente
    await expect(l.annulla).toHaveCount(0);
  });

  test("Opzioni della select anni", async ({ page }) => {
    await mockAll(page);
    const l = await ready(page);

    // 1. Aprire la select
    await l.anno.click();

    // expect: Opzioni nell'ordine della risposta anni
    // NB: diverge dalla spec: il mock anni restituisce 2026, 2025, 2024 (non 2024..2028)
    await expect(page.getByRole("option")).toHaveText(["2026", "2025", "2024"]);
    // expect: Apertura stabile (key random): le opzioni restano visibili
    await expect(page.getByRole("option", { name: "2025", exact: true })).toBeVisible();
  });

  test("Selezione anno: abilita Filtra, non svuota la griglia", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Selezionare 2025
    await selezionaAnno(page, l, "2025");

    // expect: Valore '2025' nella select (verificato in selezionaAnno)
    // expect: 'Filtra' abilitato, 'Annulla filtri' visibile
    await expect(l.filtra).toBeEnabled();
    await expect(l.annulla).toBeVisible();
    // expect: Griglia ancora con le righe precedenti
    await expect(l.rows).toHaveCount(24);
    // expect: Nessuna nuova chiamata alla lista fino al click su Filtra
    expect(lista).toEqual([""]);
  });

  test("Filtra con anno", async ({ page }) => {
    const { lista } = await mockAll(page, { moduli: TRE_ANNI });
    const l = await ready(page, 36);

    // 1. Selezionare 2024 e cliccare 'Filtra'
    await selezionaAnno(page, l, "2024");
    await l.filtra.click();

    // expect: Chiamata GET /api/v2/modulocommessa/lista/2024
    await expect.poll(() => lista).toEqual(["", "2024"]);
    // expect: Modale 'Loading...' poi chiuso
    await expect(l.loading).toBeHidden();
    // expect: Tutte le righe hanno Mese/Anno con '/2024'
    await expect(l.rows).toHaveCount(12);
    await expect(righeAnno(page, "2024")).toHaveCount(12);
    // expect: localStorage 'filters' contiene valueSelect '2024' e pathPage '/ente/modulicommessa'
    await expect.poll(() => savedFilters(page)).toEqual({ valueSelect: "2024", pathPage: ROUTE });
  });

  test("Cambio anno consecutivo 2024 -> 2025 -> 2026", async ({ page }) => {
    const { lista } = await mockAll(page, { moduli: TRE_ANNI });
    const l = await ready(page, 36);

    // 1. Filtrare per 2024, 2025 e 2026 in sequenza
    for (const [i, anno] of ["2024", "2025", "2026"].entries()) {
      await selezionaAnno(page, l, anno);
      await l.filtra.click();
      // expect: Una chiamata per anno con URL corrispondente
      await expect.poll(() => lista.length).toBe(i + 2);
      expect(lista[i + 1]).toBe(anno);
      // expect: Le righe riflettono ogni volta l'anno scelto
      await expect(l.loading).toBeHidden();
      await expect(l.rows).toHaveCount(12);
      await expect(righeAnno(page, anno)).toHaveCount(12);
    }

    // expect: filters aggiornato all'ultimo anno
    await expect.poll(() => savedFilters(page)).toEqual({ valueSelect: "2026", pathPage: ROUTE });
  });

  test("Annulla filtri", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Filtrare per 2025 e cliccare 'Annulla filtri'
    await selezionaAnno(page, l, "2025");
    await l.filtra.click();
    await expect(l.rows).toHaveCount(12);
    await expect.poll(() => savedFilters(page)).toMatchObject({ valueSelect: "2025" });
    await l.annulla.click();

    // expect: 'Annulla filtri' scompare e 'Filtra' disabilitato
    await expect(l.annulla).toHaveCount(0);
    await expect(l.filtra).toBeDisabled();
    // expect: Select svuotata (senza anno selezionato Filtra e' disabilitato)
    await expect(l.anno).not.toHaveText(/\d{4}/);
    // expect: Chiamata GET /api/v2/modulocommessa/lista senza anno
    await expect.poll(() => lista).toEqual(["", "2025", ""]);
    // expect: Griglia con lista completa
    await expect(l.rows).toHaveCount(24);
    // expect: localStorage 'filters' rimosso
    await expect.poll(() => savedFilters(page)).toBeNull();
  });

  test("Annulla filtri senza aver premuto Filtra", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Selezionare un anno senza Filtra e cliccare 'Annulla filtri'
    await selezionaAnno(page, l, "2025");
    await l.annulla.click();

    // expect: Select vuota, lista completa ricaricata, nessuna chiave 'filters'
    await expect(l.annulla).toHaveCount(0);
    await expect(l.filtra).toBeDisabled();
    await expect(l.anno).not.toHaveText(/\d{4}/);
    await expect.poll(() => lista).toEqual(["", ""]);
    await expect(l.rows).toHaveCount(24);
    expect(await savedFilters(page)).toBeNull();
  });

  test("Filtra per un anno senza moduli (lista vuota)", async ({ page }) => {
    // nessun modulo 2024: /lista/2024 risponde []
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Mockare la lista vuota per l'anno e Filtra
    // NB: diverge dalla spec: gli anni disponibili sono 2026, 2025, 2024 (non 2028); l'anno 2024 non ha moduli nel mock
    await selezionaAnno(page, l, "2024");
    await l.filtra.click();
    await expect.poll(() => lista).toEqual(["", "2024"]);
    await expect(l.loading).toBeHidden();

    // expect: Griglia senza righe
    await expect(l.rows).toHaveCount(0);
    // expect: Nessun testo di lista vuota (sentenseEmpty non passato) e nessun errore
    await expect(page.getByText(/Non sono presenti/)).toHaveCount(0);
    await expect(l.captionOk).toBeVisible();
    await expect(l.title).toBeVisible();
  });

  test("Errore 500 su anni", async ({ page }) => {
    await mockAll(page);
    // le route registrate dopo prevalgono: anni risponde 500
    await mockAnni(page, [], 500);

    // 1. Mockare anni con 500
    const l = await ready(page);

    // expect: lista caricata normalmente
    await expect(l.captionOk).toBeVisible();
    // expect: nessun messaggio di errore (catch vuoto). L'Alert globale resta nel DOM nascosto: verificare la visibilita', non il conteggio
    await expect(page.getByText(/non è andata a buon fine/i)).toBeHidden();
    // expect: Select senza opzioni, 'Filtra' disabilitato
    await expect(l.filtra).toBeDisabled();
    await l.anno.click();
    await expect(page.getByRole("option")).toHaveCount(0);
  });

  test("Anni vuoto ([]) e 404 su anni", async ({ page }) => {
    await mockAll(page);
    await mockAnni(page, []);

    // 1. Mockare anni [] e poi 404
    const l = await ready(page);
    await expect(l.captionOk).toBeVisible();
    await l.anno.click();
    // expect: Select senza opzioni, pagina funzionante, nessun errore visibile
    await expect(page.getByRole("option")).toHaveCount(0);
    // il listbox vuoto resta aperto e rende aria-hidden la pagina: chiuderlo prima di verificare Filtra
    await page.keyboard.press("Escape");
    await expect(l.filtra).toBeDisabled();

    await mockAnni(page, [], 404);
    await page.reload();
    await expect(l.title).toBeVisible();
    await expect(l.loading).toBeHidden();
    await expect(l.rows).toHaveCount(24);
    await l.anno.click();
    await expect(page.getByRole("option")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(l.filtra).toBeDisabled();
    await expect(page.getByText(/non è andata a buon fine/i)).toBeHidden();
  });

  test("Errore 500 su Filtra", async ({ page }) => {
    // la seconda chiamata (Filtra) fallisce, le altre vanno a buon fine
    await setRedirectToInsert(page, "false");
    await mockVerifica(page, false);
    await mockAnni(page);
    const lista = await mockLista(page, undefined, (n) => (n === 2 ? 500 : 200));
    const l = await ready(page);

    // 1. Mockare /lista/2026 con 500 e cliccare Filtra
    await selezionaAnno(page, l, "2026");
    await l.filtra.click();
    await expect.poll(() => lista).toEqual(["", "2026"]);

    // expect: 'Loading...' chiuso
    await expect(l.loading).toBeHidden();
    // expect: Griglia svuotata
    await expect(l.rows).toHaveCount(0);
    // expect: Il filtro risulta comunque salvato in localStorage (updateFilters viene chiamato subito)
    await expect.poll(() => savedFilters(page)).toEqual({ valueSelect: "2026", pathPage: ROUTE });
    // NB: la caption resta quella standard: sentenseRef e' impostato dalla prima chiamata (OK) e non cambia piu'
    await expect(l.captionOk).toBeVisible();

    // 2. Ripristinare il mock e cliccare di nuovo Filtra
    await l.filtra.click();
    await expect.poll(() => lista).toEqual(["", "2026", "2026"]);
    // expect: Griglia ripopolata
    await expect(l.rows).toHaveCount(12);
  });
});
