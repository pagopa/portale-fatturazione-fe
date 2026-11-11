// spec: specs/ente-moduloCommessaElenco.md (sezione 6)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  ROUTE, ROUTE_INSERIMENTO, locators, mockAll, openPage, savedFilters,
} from "../../utils/moduloCommessaElencoMock/moduloCommessaElencoMock";
import { mockAll as mockAllNotifiche } from "../../utils/notificheMock/notificheMock";

async function ready(page: Page, righe = 24) {
  const l = await openPage(page);
  await expect(l.loading).toBeHidden();
  await expect(l.rows).toHaveCount(righe);
  return { ...l, nav: page.getByRole("navigation") };
}

async function selezionaAnno(page: Page, l: ReturnType<typeof locators>, anno: string) {
  await l.anno.click();
  await page.getByRole("option", { name: anno, exact: true }).click();
  await expect(l.anno).toHaveText(anno);
}

// Precompila localStorage 'filters' (stringa grezza) prima del primo caricamento; il flag di sessione evita di sovrascriverlo al reload
async function seedFilters(page: Page, raw: string) {
  await page.addInitScript(
    ([r, flag]) => {
      if (location.origin !== "http://localhost:3000" || sessionStorage.getItem(flag)) return;
      localStorage.setItem("filters", r);
      sessionStorage.setItem(flag, "1");
    },
    [raw, "seedFiltriModuloCommessaElenco"] as const,
  );
}

test.describe("Persistenza filtri", () => {
  test("Salvataggio dopo Filtra", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Selezionare 2026, Filtra e leggere localStorage 'filters'
    await selezionaAnno(page, l, "2026");
    await l.filtra.click();
    await expect.poll(() => lista).toEqual(["", "2026"]);

    // expect: JSON {valueSelect:'2026',pathPage:'/ente/modulicommessa'}
    await expect.poll(() => savedFilters(page)).toEqual({ valueSelect: "2026", pathPage: ROUTE });
  });

  test("Selezione senza Filtra non viene salvata", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Selezionare un anno senza Filtra e leggere localStorage
    await selezionaAnno(page, l, "2025");

    // expect: Nessuna chiave 'filters'
    expect(lista).toEqual([""]);
    expect(await savedFilters(page)).toBeNull();
  });

  test("Ripristino dopo reload", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);
    await selezionaAnno(page, l, "2026");
    await l.filtra.click();
    await expect.poll(() => savedFilters(page)).toEqual({ valueSelect: "2026", pathPage: ROUTE });

    // 1. Dopo il salvataggio ricaricare la pagina (redirectToInsert=false)
    await page.reload();
    await expect(l.title).toBeVisible();
    await expect(l.loading).toBeHidden();

    // expect: Prima chiamata lista /lista/2026 (non quella senza anno)
    await expect.poll(() => lista).toEqual(["", "2026", "2026"]);
    // expect: Select con '2026', 'Annulla filtri' visibile, 'Filtra' abilitato
    await expect(l.anno).toHaveText("2026");
    await expect(l.annulla).toBeVisible();
    await expect(l.filtra).toBeEnabled();
    // expect: Anni caricati, griglia con righe 2026
    await l.anno.click();
    await expect(page.getByRole("option")).toHaveText(["2026", "2025", "2024"]);
    await page.keyboard.press("Escape");
    await expect(l.rows).toHaveCount(12);
    await expect(
      l.rows.filter({ has: page.getByRole("cell", { name: /\/2026$/ }) }),
    ).toHaveCount(12);
  });

  test("Annulla filtri pulisce la persistenza", async ({ page }) => {
    const { lista } = await mockAll(page);
    const l = await ready(page);

    // 1. Filtrare, Annulla filtri e ricaricare
    await selezionaAnno(page, l, "2026");
    await l.filtra.click();
    await expect.poll(() => savedFilters(page)).toMatchObject({ valueSelect: "2026" });
    await l.annulla.click();
    await expect.poll(() => lista).toEqual(["", "2026", ""]);
    await expect.poll(() => savedFilters(page)).toBeNull();
    await page.reload();
    await expect(l.title).toBeVisible();
    await expect(l.loading).toBeHidden();

    // expect: Select vuota, lista senza anno, nessuna chiave 'filters'
    await expect.poll(() => lista).toEqual(["", "2026", "", ""]);
    await expect(l.rows).toHaveCount(24);
    await expect(l.annulla).toHaveCount(0);
    await expect(l.filtra).toBeDisabled();
    expect(await savedFilters(page)).toBeNull();
  });

  test("Filtri di un altro pathPage vengono scartati", async ({ page }) => {
    const { lista } = await mockAll(page);

    // 1. Precompilare 'filters' con pathPage '/ente/notifiche' e aprire la pagina
    await seedFilters(page, JSON.stringify({ valueSelect: "2025", pathPage: "/ente/notifiche" }));
    const l = await ready(page);

    // expect: Lista senza anno, select vuota
    expect(lista).toEqual([""]);
    await expect(l.annulla).toHaveCount(0);
    await expect(l.filtra).toBeDisabled();
    // expect: Chiave 'filters' rimossa
    await expect.poll(() => savedFilters(page)).toBeNull();
  });

  test("Anno salvato non presente nella lista anni", async ({ page }) => {
    const { lista } = await mockAll(page);

    // 1. Salvare valueSelect '2030' non presente in anni e aprire la pagina
    await seedFilters(page, JSON.stringify({ valueSelect: "2030", pathPage: ROUTE }));
    const l = await openPage(page);
    await expect(l.loading).toBeHidden();

    // expect: Chiamata /lista/2030 (comportamento attuale)
    await expect.poll(() => lista).toEqual(["2030"]);
    // expect: Nessun crash; 'Filtra' abilitato
    await expect(l.title).toBeVisible();
    await expect(l.rows).toHaveCount(0);
    await expect(l.filtra).toBeEnabled();
    await expect(l.annulla).toBeVisible();
    // NB: il valore 2030 non e' tra le opzioni, la select non mostra alcun anno
    await l.anno.click();
    await expect(page.getByRole("option")).toHaveText(["2026", "2025", "2024"]);
  });

  test("Filtri malformati", async ({ page }) => {
    const { lista } = await mockAll(page);

    // 1. Precompilare 'filters' con JSON non valido
    await seedFilters(page, '{"valueSelect":"2026",pathPage:');
    await page.goto(ROUTE);

    // NB: diverge dalla spec (possibile crash): useSavedFilters fa JSON.parse senza try/catch e la pagina va in crash
    // (schermata bianca); bug applicativo da segnalare
    await expect(page.getByRole("heading", { name: "Modulo commessa", exact: true })).toHaveCount(0);
    expect(lista).toHaveLength(0);

    // 2. Precompilare 'filters' con pathPage corretto ma senza valueSelect
    await page.evaluate(() => localStorage.setItem("filters", JSON.stringify({ pathPage: "/ente/modulicommessa" })));
    await page.reload();
    const l = locators(page);
    await expect(l.title).toBeVisible();
    await expect(l.loading).toBeHidden();

    // expect: Lista chiamata senza anno (URL /lista), nessun crash
    await expect.poll(() => lista).toEqual([""]);
    await expect(l.rows).toHaveCount(24);
    // NB: valueSelect resta undefined (non ''): il controllo disabled={valueSelect === ''} e' falso,
    // quindi 'Filtra' e' abilitato e 'Annulla filtri' visibile pur senza anno
    await expect(l.filtra).toBeEnabled();
    await expect(l.annulla).toBeVisible();
  });

  test("Navigazione verso altra pagina e ritorno", async ({ page }) => {
    const { lista } = await mockAll(page);
    await mockAllNotifiche(page);
    const l = await ready(page);

    // 1. Filtrare per 2026, aprire 'Notifiche' dal menu e tornare a 'Modulo commessa' (verifica false)
    await selezionaAnno(page, l, "2026");
    await l.filtra.click();
    await expect.poll(() => lista).toEqual(["", "2026"]);
    await expect.poll(() => savedFilters(page)).toMatchObject({ valueSelect: "2026" });
    await l.nav.getByRole("button", { name: "Notifiche", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Notifiche", exact: true })).toBeVisible();
    await expect(l.loading).toBeHidden();

    // expect: I filtri non si mischiano tra pagine
    // NB: diverge dalla spec: useSavedFilters di Notifiche rimuove i filtri con pathPage diverso e Notifiche
    // salva solo su Filtra, quindi 'filters' resta vuoto
    await expect.poll(() => savedFilters(page)).toBeNull();

    await l.nav.getByRole("button", { name: "Modulo commessa", exact: true }).click();
    await expect(l.title).toBeVisible();
    await expect(l.loading).toBeHidden();

    // NB: diverge dalla spec (filtro ripristinato): Notifiche ha rimosso 'filters', quindi il filtro anno e' perso
    // e la lista viene richiamata senza anno
    await expect.poll(() => lista).toEqual(["", "2026", ""]);
    await expect(l.rows).toHaveCount(24);
    await expect(l.annulla).toHaveCount(0);
    await expect(l.filtra).toBeDisabled();
    expect(await savedFilters(page)).toBeNull();
  });

  test("Filtro salvato con redirect verso inserimento", async ({ page }) => {
    // verifica true e redirectToInsert=true
    const { lista, anni } = await mockAll(page, { verifica: true, redirect: "true" });

    // 1. Salvare filters e impostare redirectToInsert=true con verifica true
    await seedFilters(page, JSON.stringify({ valueSelect: "2026", pathPage: ROUTE }));
    await page.goto(ROUTE);

    // expect: Il redirect a /ente/modulocommessa ha priorita'
    await expect(page).toHaveURL(new RegExp(`${ROUTE_INSERIMENTO}$`));
    // expect: nessuna lista chiamata
    expect(lista).toHaveLength(0);
    expect(anni.n).toBe(0);
    // expect: 'filters' resta in localStorage
    expect(await savedFilters(page)).toEqual({ valueSelect: "2026", pathPage: ROUTE });
  });
});
