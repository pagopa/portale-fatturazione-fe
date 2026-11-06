// spec: specs/areaPersonaleUtenteEnte.md (sezione 9)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  DATI_FATTURAZIONE_DEFAULT, ROUTE, locators, mainStatePersistito, mockAreaPersonale, notFound, ok, openPage, seedSession,
} from "../../utils/areaPersonaleMock/areaPersonaleMock";
import {
  ROUTE as ROUTE_MODULI, locators as locatorsModuli, mockAll as mockModuliCommessa,
} from "../../utils/moduloCommessaElencoMock/moduloCommessaElencoMock";

const SDI = "SDI0001";

// Voce del menu laterale ente (ListItemButton MUI = role "button")
const voceMenu = (page: Page, nome: string) => page.getByRole("button", { name: nome, exact: true });
const menuDatiFatturazione = (page: Page) => voceMenu(page, "Dati di fatturazione");
const menuModuloCommessa = (page: Page) => voceMenu(page, "Modulo commessa");
const modaleAttenzione = (page: Page) => page.getByRole("heading", { name: "Attenzione!" });

test.describe("Interazione con altre pagine", () => {
  test("Accesso dalla voce di menu 'Dati di fatturazione'", async ({ page }) => {
    // la home ente (/ente) reindirizza gia' ai dati di fatturazione: si parte dall'elenco moduli commessa
    await mockAreaPersonale(page);
    await mockModuliCommessa(page);
    await page.goto(ROUTE_MODULI);
    await expect(locatorsModuli(page).title).toBeVisible();

    // 1. Aprire la home ente e cliccare nel menu laterale la voce 'Dati di fatturazione'
    await menuDatiFatturazione(page).click();

    // expect: URL /ente/datidifatturazione, voce di menu evidenziata (Mui-selected), heading 'Dati di fatturazione'
    await expect(page).toHaveURL(new RegExp(`${ROUTE}$`));
    await expect(menuDatiFatturazione(page)).toHaveClass(/Mui-selected/);
    await expect(menuModuloCommessa(page)).not.toHaveClass(/Mui-selected/);
    await expect(locators(page).titolo).toBeVisible();
  });

  test("Navigazione dal menu in modalita' immutable senza modale", async ({ page }) => {
    await mockAreaPersonale(page);
    await mockModuliCommessa(page);
    await openPage(page);
    expect((await mainStatePersistito(page)).statusPageDatiFatturazione).toBe("immutable");

    // 1. In stato immutable cliccare un'altra voce di menu
    await menuModuloCommessa(page).click();

    // expect: Si naviga direttamente, nessun modale 'Attenzione!'
    await expect(page).toHaveURL(new RegExp(`${ROUTE_MODULI}$`));
    await expect(locatorsModuli(page).title).toBeVisible();
    await expect(modaleAttenzione(page)).toHaveCount(0);
  });

  test("Primo accesso senza dati: redirect forzato da altre pagine", async ({ page }) => {
    await seedSession(page, { mainState: { datiFatturazione: false, datiFatturazioneNotCompleted: false } });
    await mockAreaPersonale(page, { get: notFound(), sdi: ok({ contractCodiceSDI: SDI }) });
    await mockModuliCommessa(page);

    // 1. Con datiFatturazione=false aprire /ente/modulicommessa
    await page.goto(ROUTE_MODULI);

    // expect: Compare il ModalRedirect con la richiesta dei dati di fatturazione
    await expect(modaleAttenzione(page)).toBeVisible();
    await expect(locatorsModuli(page).redirectModal).toBeVisible();
    const vai = page.getByRole("button", { name: "Vai ai dati di fatturazione" });
    await expect(vai).toBeVisible();

    // expect: confermando si arriva a /ente/datidifatturazione in modalita' mutable (inserimento)
    await vai.click();
    await expect(page).toHaveURL(new RegExp(`${ROUTE}$`));
    const l = locators(page);
    await expect(l.heading("Inserisci i dati di fatturazione")).toBeVisible();
    await expect(l.salva).toBeVisible();
    // in inserimento i campi testuali restano disabilitati finche' non si sceglie la tipologia: la radio e' abilitata
    await expect(l.radioOrdine).toBeEnabled();
    expect((await mainStatePersistito(page)).statusPageDatiFatturazione).toBe("mutable");
  });

  test("Salvataggio completato sblocca il modulo commessa", async ({ page }) => {
    const salvati = { ...DATI_FATTURAZIONE_DEFAULT, contatti: [{ email: "ref@test.it", tipo: 1 }], cup: "", idDocumento: "", codCommessa: "", dataDocumento: null, codiceSDI: SDI, contractCodiceSDI: SDI };
    await seedSession(page, { mainState: { datiFatturazione: false, datiFatturazioneNotCompleted: false } });
    const api = await mockAreaPersonale(page, { get: [notFound(), ok(salvati)], sdi: ok({ contractCodiceSDI: SDI }) });
    await mockModuliCommessa(page);

    // Precondizione (caso 8.2): primo inserimento con salvataggio POST
    await page.goto(ROUTE);
    const l = locators(page);
    await expect(l.heading("Inserisci i dati di fatturazione")).toBeVisible();
    await l.radioOrdine.check();
    await l.pec.fill("pec@test.it");
    await l.emailAmministrativo.fill("ref@test.it");
    await l.aggiungiEmail.click();
    await page.getByRole("checkbox").last().check();
    await l.salva.click();
    await expect.poll(() => api.insert.calls).toBe(1);
    await expect(l.titolo).toBeVisible();
    await expect.poll(async () => (await mainStatePersistito(page)).datiFatturazione).toBe(true);

    // 1. Dopo il salvataggio del caso 8.2 aprire /ente/modulicommessa
    await menuModuloCommessa(page).click();
    await expect(page).toHaveURL(new RegExp(`${ROUTE_MODULI}$`));
    await expect(locatorsModuli(page).title).toBeVisible();

    // expect: Non compare ModalRedirect (datiFatturazione true e datiFatturazioneNotCompleted false)
    const stato = await mainStatePersistito(page);
    expect(stato.datiFatturazione).toBe(true);
    expect(stato.datiFatturazioneNotCompleted).toBe(false);
    await expect(locatorsModuli(page).redirectModal).toHaveCount(0);
    await expect(modaleAttenzione(page)).toHaveCount(0);
  });
});
