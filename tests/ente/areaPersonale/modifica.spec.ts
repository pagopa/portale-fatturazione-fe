// spec: specs/areaPersonaleUtenteEnte.md
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  DATI_FATTURAZIONE_DEFAULT, ROUTE, error, locators, mainStatePersistito, mockAreaPersonale, openPage,
} from "../../utils/areaPersonaleMock/areaPersonaleMock";
import { mockAll as mockModuloCommessaElenco, ROUTE as ROUTE_MODULI_COMMESSA } from "../../utils/moduloCommessaElencoMock/moduloCommessaElencoMock";

// Helper locali (il mock condiviso non va modificato)
// BasicModal e' un MUI <Modal> (non <Dialog>): niente role="dialog", si localizza tramite il titolo h2
const titoloModale = (page: Page) => page.getByRole("heading", { name: "Attenzione!", exact: true });
const modale = titoloModale;
const testoModale = (page: Page) => page.getByText("Le modifiche andranno perse", { exact: true });
const annullaModale = (page: Page) => page.getByRole("button", { name: "Annulla", exact: true });
const okModale = (page: Page) => page.getByRole("button", { name: "Ok", exact: true });
// "Indietro" in modifica compare due volte, entrambi <button> senza attributi distintivi:
// il primo e' quello in header (PageTitleNavigation), l'ultimo quello in fondo alla pagina
const indietroHeader = (page: Page) => page.getByRole("button", { name: "Indietro", exact: true }).first();
const indietroFondo = (page: Page) => page.getByRole("button", { name: "Indietro", exact: true }).last();

async function entraInModifica(page: Page) {
  const l = await openPage(page);
  await l.modifica.click();
  await expect(l.heading("Modifica dati di fatturazione")).toBeVisible();
  return l;
}

test.describe("Modifica - ingresso e uscita", () => {
  test("Click su Modifica abilita il form", async ({ page }) => {
    const api = await mockAreaPersonale(page);

    // 1. Aprire la pagina con dati completi e cliccare 'Modifica'
    const l = await openPage(page);
    await l.modifica.click();

    // expect: Heading 'Modifica dati di fatturazione'
    await expect(l.heading("Modifica dati di fatturazione")).toBeVisible();
    // expect: Pulsante 'Modifica' scompare
    await expect(l.modifica).toHaveCount(0);
    // expect: link 'Indietro' in header, breadcrumb, pulsanti 'Indietro' e 'Salva' in fondo
    await expect(indietroHeader(page)).toBeVisible();
    await expect(l.breadcrumb).toBeVisible();
    await expect(page.getByText("Modifica i dati di fatturazione", { exact: true })).toBeVisible();
    await expect(l.indietro).toHaveCount(2);
    await expect(indietroFondo(page)).toBeVisible();
    await expect(l.salva).toBeVisible();
    // expect: Tutti i campi abilitati
    for (const campo of [l.cup, l.pec, l.idDocumento, l.codCommessa, l.codiceSdi, l.emailAmministrativo, l.radioOrdine, l.radioContratto]) {
      await expect(campo).toBeEnabled();
    }
    await expect(page.getByRole("checkbox")).not.toHaveCount(0);
    for (const cb of await page.getByRole("checkbox").all()) await expect(cb).toBeEnabled();
    // expect: icone modifica/elimina accanto alle email (senza nome accessibile, vedi bug #5): non verificabili con getByRole
    // expect: statusPageDatiFatturazione 'mutable' nello stato persistito
    await expect.poll(async () => (await mainStatePersistito(page)).statusPageDatiFatturazione).toBe("mutable");
    // expect: Nessuna chiamata di rete aggiuntiva eccetto la verifica SDI iniziale
    await expect.poll(() => api.verificaSdi.calls).toBe(1);
    expect(api.get.calls).toBe(1);
    expect(api.sdi.calls).toBe(0);
    expect(api.modify.calls).toBe(0);
    expect(api.insert.calls).toBe(0);
  });

  test("All'ingresso in mutable parte la verifica del codice SDI (primo render)", async ({ page }) => {
    // 1. Mockare POST /api/datifatturazione/codiceSDI con 200 e cliccare 'Modifica'
    let api = await mockAreaPersonale(page);
    let l = await entraInModifica(page);

    // expect: Una POST a codiceSDI con body { codiceSDI: '<valore corrente>' }
    await expect.poll(() => api.verificaSdi.calls).toBe(1);
    expect(api.verificaSdi.bodies[0]).toEqual({ codiceSDI: DATI_FATTURAZIONE_DEFAULT.codiceSDI });
    // expect: Nessun ModalInfo e nessun modale 'Verifica del codice SDI in corso'
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(titoloModale(page)).toHaveCount(0);
    await expect(page.getByText("Verifica del codice SDI in corso")).toHaveCount(0);
    // expect: Il campo SDI non e' in errore; 'Salva' abilitato
    await expect(l.codiceSdi).not.toHaveAttribute("aria-invalid", "true");
    await expect(l.salva).toBeEnabled();

    // 2. Ripetere con POST codiceSDI 400 { detail: 'Codice SDI non valido' }
    await page.unrouteAll({ behavior: "ignoreErrors" });
    api = await mockAreaPersonale(page, { verificaSdi: error(400, { detail: "Codice SDI non valido" }) });
    // si riparte da immutable (stato persistito) per ripetere il primo render
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem("globalStatePF") ?? "{}");
      s.state.mainState.statusPageDatiFatturazione = "immutable";
      localStorage.setItem("globalStatePF", JSON.stringify(s));
    });
    l = await entraInModifica(page);
    await expect.poll(() => api.verificaSdi.calls).toBe(1);

    // expect: Nessun ModalInfo (isFirstRender true non apre il popup)
    await expect(page.getByRole("dialog")).toHaveCount(0);
    // expect: Il campo 'Codice univoco o SDI' in errore e 'Salva' disabilitato
    await expect(l.codiceSdi).toHaveAttribute("aria-invalid", "true");
    await expect(l.salva).toBeDisabled();
  });

  test("Indietro (fondo) apre il modale di conferma", async ({ page }) => {
    await mockAreaPersonale(page);
    const l = await entraInModifica(page);

    // 1. Entrare in modifica e cliccare 'Indietro' in fondo alla pagina
    await indietroFondo(page).click();

    // expect: dialog con heading 'Attenzione!' e testo 'Le modifiche andranno perse'
    await expect(titoloModale(page)).toBeVisible();
    await expect(testoModale(page)).toBeVisible();
    // expect: Pulsanti 'Annulla' e 'Ok' visibili
    await expect(annullaModale(page)).toBeVisible();
    await expect(okModale(page)).toBeVisible();
    // expect: La pagina sottostante e' aria-hidden (non piu' esposta all'albero di accessibilita')
    await expect(l.salva).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Salva", exact: true, includeHidden: true })).toHaveCount(1);
  });

  test("Indietro (header) apre lo stesso modale", async ({ page }) => {
    await mockAreaPersonale(page);
    await entraInModifica(page);

    // 1. Entrare in modifica e cliccare il link 'Indietro' in alto
    await indietroHeader(page).click();

    // expect: Si apre il modale 'Attenzione!' / 'Le modifiche andranno perse'
    await expect(titoloModale(page)).toBeVisible();
    await expect(testoModale(page)).toBeVisible();
  });

  test("Annulla chiude il modale e mantiene le modifiche", async ({ page }) => {
    const api = await mockAreaPersonale(page);
    const l = await entraInModifica(page);

    // 1. Entrare in modifica, modificare PEC in 'nuova@test.it', cliccare 'Indietro' e poi 'Annulla'
    await l.pec.fill("nuova@test.it");
    await indietroFondo(page).click();
    await expect(titoloModale(page)).toBeVisible();
    await annullaModale(page).click();

    // expect: Il modale si chiude
    await expect(modale(page)).toHaveCount(0);
    // expect: Il campo PEC mantiene 'nuova@test.it'
    await expect(l.pec).toHaveValue("nuova@test.it");
    // expect: Si resta in modalita' mutable
    await expect(l.heading("Modifica dati di fatturazione")).toBeVisible();
    // expect: Nessuna nuova GET datifatturazione/ente
    expect(api.get.calls).toBe(1);
  });

  test("Ok ripristina i dati originali e torna in sola lettura", async ({ page }) => {
    // BUG #2 (confermato): handleEsci (ramo enti) esegue navigate(open.clickOn) con 'INDIETRO_BUTTON' come path relativo:
    // la SPA va su /ente/datidifatturazione/INDIETRO_BUTTON e il router la riporta su /ente/datidifatturazione.
    // L'URL finale e' corretto, ma la pagina viene rimontata e la GET dati fatturazione parte 2 volte invece di 1.
    test.fail();
    const api = await mockAreaPersonale(page);
    const l = await entraInModifica(page);

    // 1. Entrare in modifica, modificare PEC, cliccare 'Indietro' e poi 'Ok'
    await l.pec.fill("nuova@test.it");
    await indietroFondo(page).click();
    await expect(titoloModale(page)).toBeVisible();
    const urlVisitati: string[] = [];
    page.on("framenavigated", (frame) => frame === page.mainFrame() && urlVisitati.push(new URL(frame.url()).pathname));
    await okModale(page).click();

    // expect: Il modale si chiude
    await expect(modale(page)).toHaveCount(0);
    // expect: URL resta /ente/datidifatturazione, senza passare da /INDIETRO_BUTTON (bug #2)
    await expect(page).toHaveURL(new RegExp(`${ROUTE}$`));
    expect(urlVisitati.filter((u) => u.includes("INDIETRO_BUTTON"))).toEqual([]);
    // expect: Viene richiamata GET datifatturazione/ente (getDatiFat) una sola volta
    await expect.poll(() => api.get.calls).toBe(2);
    // expect: torna immutable con PEC originale
    await expect(l.titolo).toBeVisible();
    await expect(l.pec).toHaveValue(DATI_FATTURAZIONE_DEFAULT.pec);
    await expect(l.modifica).toBeVisible();
    await expect(l.indietro).toHaveCount(0);
    await expect(l.salva).toHaveCount(0);
    expect((await mainStatePersistito(page)).statusPageDatiFatturazione).toBe("immutable");
  });

  test("Chiusura del modale con Escape", async ({ page }) => {
    await mockAreaPersonale(page);
    const l = await entraInModifica(page);
    await l.pec.fill("nuova@test.it");

    // 1. Aprire il modale 'Attenzione!' e premere Escape
    await indietroFondo(page).click();
    await expect(titoloModale(page)).toBeVisible();
    await page.keyboard.press("Escape");

    // expect: Il modale si chiude, si resta in mutable con i dati modificati
    await expect(modale(page)).toHaveCount(0);
    await expect(l.heading("Modifica dati di fatturazione")).toBeVisible();
    await expect(l.pec).toHaveValue("nuova@test.it");
  });

  test("Navigazione dal menu laterale in modalita' mutable", async ({ page }) => {
    await mockAreaPersonale(page);
    await mockModuloCommessaElenco(page);
    const l = await entraInModifica(page);
    const voceMenu = page.getByRole("button", { name: "Modulo commessa" });

    // 1. Entrare in modifica e cliccare una voce del menu laterale ('Modulo commessa') -> 'Annulla'
    await voceMenu.click();
    // expect: Si apre il modale 'Attenzione!'
    await expect(titoloModale(page)).toBeVisible();
    await annullaModale(page).click();
    // expect: con 'Annulla' si resta sulla pagina dei dati di fatturazione
    await expect(modale(page)).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`${ROUTE}$`));
    await expect(l.heading("Modifica dati di fatturazione")).toBeVisible();

    // 2. Ripetere con 'Ok'
    await voceMenu.click();
    await expect(titoloModale(page)).toBeVisible();
    await okModale(page).click();

    // expect: navigazione alla pagina scelta, stato torna immutable
    await expect(page).toHaveURL(new RegExp(`${ROUTE_MODULI_COMMESSA}$`));
    await expect(page.getByRole("heading", { name: "Modulo commessa", exact: true })).toBeVisible();
    expect((await mainStatePersistito(page)).statusPageDatiFatturazione).toBe("immutable");
  });
});
