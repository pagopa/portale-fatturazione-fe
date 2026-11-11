// spec: specs/areaPersonaleUtenteEnte.md
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  locators, mainStatePersistito, makeDatiFatturazione, mockAreaPersonale, ok, openPage, seedSession,
} from "../../utils/areaPersonaleMock/areaPersonaleMock";

const NOTA_LEGALE = /Gli accordi di adesione a SEND/;

// Registra tutte le richieste /api/ per verificare metodi ed endpoint chiamati
function trackApi(page: Page) {
  const requests: { method: string; path: string }[] = [];
  page.on("request", (req) => {
    const url = new URL(req.url());
    if (url.pathname.includes("/api/")) requests.push({ method: req.method(), path: url.pathname });
  });
  return requests;
}

const splitSi = (page: Page) => page.getByRole("radio", { name: "Si", exact: true });
const splitNo = (page: Page) => page.getByRole("radio", { name: "No", exact: true });

test.describe("Visualizzazione dati - stato immutable", () => {
  test("Campi valorizzati e disabilitati con GET 200", async ({ page }) => {
    // BUG (nuovo, non nel registro 'Possibili bug'): i RadioGroup di tipo ordine e Split Payment condividono
    // name="row-radio-buttons-group" (components/areaPersonale/radio.tsx), quindi il browser li tratta come un unico
    // gruppo nativo e selezionando 'Si' la radio "Dati ordine d'acquisto" risulta non selezionata.
    test.fail();
    const requests = trackApi(page);
    const api = await mockAreaPersonale(page, { get: ok(makeDatiFatturazione()) });

    // 1. Mockare GET /api/datifatturazione/ente con dati completi; aprire la pagina
    const l = await openPage(page);

    // soft: il resto del test continua a verificare gli altri campi nonostante il bug sopra
    await expect.soft(l.radioOrdine).toBeChecked();
    await expect(l.radioOrdine).toBeDisabled();
    await expect(l.radioContratto).toBeDisabled();
    const valori: [ReturnType<typeof page.getByLabel>, string][] = [
      [l.cup, "CUP123"], [l.pec, "pec@test.it"], [l.idDocumento, "DOC-1"], [l.codCommessa, "COM/1"], [l.codiceSdi, "ABC1234"],
    ];
    for (const [campo, valore] of valori) {
      await expect(campo).toHaveValue(valore);
      await expect(campo).toBeDisabled();
      await expect(campo).not.toHaveAttribute("aria-invalid", "true");
    }
    await expect(splitSi(page)).toBeChecked();
    await expect(splitSi(page)).toBeDisabled();
    await expect(splitNo(page)).toBeDisabled();
    const dataDocumento = page.getByLabel("Data documento");
    await expect(dataDocumento).toHaveValue("15/03/2026");
    await expect(dataDocumento).toBeDisabled();
    await expect(page.getByText("uno@test.it", { exact: true })).toBeVisible();
    await expect(page.getByText("due@test.it", { exact: true })).toBeVisible();
    // icone modifica/elimina senza nome accessibile (bug #5): in immutable non c'e' alcun pulsante icona
    await expect(page.getByTestId("EditIcon")).toHaveCount(0);
    await expect(page.getByTestId("DeleteIcon")).toHaveCount(0);
    await expect(l.emailAmministrativo).toBeDisabled();
    await expect(l.aggiungiEmail).toBeDisabled();
    const nota = page.getByRole("checkbox", { name: NOTA_LEGALE });
    await expect(nota).toBeChecked();
    await expect(nota).toBeDisabled();
    await expect(l.emailAmministrativo).not.toHaveAttribute("aria-invalid", "true");

    // 2. Verificare la rete
    expect(api.get.calls).toBe(1);
    expect(requests.filter((r) => /\/api\/datifatturazione\/ente$/.test(r.path) && r.method === "GET")).toHaveLength(1);
    expect(requests.filter((r) => r.method === "POST" || r.method === "PUT")).toHaveLength(0);
    expect(api.verificaSdi.calls).toBe(0);
    expect(requests.filter((r) => r.path.endsWith("/api/datifatturazione/codiceSDI"))).toHaveLength(0);
    expect(api.sdi.calls).toBe(0);

    // 3. Leggere lo stato persistito (globalStatePF)
    const stato = await mainStatePersistito(page);
    expect(stato.datiFatturazione).toBe(true);
    expect(stato.statusPageDatiFatturazione).toBe("immutable");
    expect(stato.datiFatturazioneNotCompleted).toBe(false);
  });

  test("Dati completi: cup e idDocumento entrambi vuoti restano immutable", async ({ page }) => {
    await mockAreaPersonale(page, { get: ok(makeDatiFatturazione({ cup: "", idDocumento: "" })) });

    // 1. Mockare GET con cup '' e idDocumento ''; aprire la pagina
    const l = await openPage(page);

    await expect(l.titolo).toBeVisible();
    await expect.poll(async () => (await mainStatePersistito(page)).statusPageDatiFatturazione).toBe("immutable");
    expect((await mainStatePersistito(page)).datiFatturazioneNotCompleted).toBe(false);
  });

  test("Dati incompleti: idDocumento vuoto e cup valorizzato forza mutable", async ({ page }) => {
    await mockAreaPersonale(page, { get: ok(makeDatiFatturazione({ idDocumento: "", cup: "CUP123" })) });

    // 1. Mockare GET con idDocumento '' e cup 'CUP123' (resto valido) e aprire la pagina
    const l = await openPage(page, "Modifica dati di fatturazione");

    await expect.poll(async () => (await mainStatePersistito(page)).statusPageDatiFatturazione).toBe("mutable");
    expect((await mainStatePersistito(page)).datiFatturazioneNotCompleted).toBe(true);
    // header 'Indietro' + pulsante 'Indietro' in fondo
    await expect(l.indietro.or(page.getByRole("link", { name: "Indietro" }))).not.toHaveCount(0);
    await expect(l.salva).toBeVisible();
    await expect(l.modifica).toHaveCount(0);
    for (const campo of [l.cup, l.pec, l.codCommessa, l.codiceSdi, l.radioOrdine, l.radioContratto]) {
      await expect(campo).toBeEnabled();
    }
    await expect(l.idDocumento).toBeEnabled();
    await expect(l.idDocumento).toHaveAttribute("aria-invalid", "true");
    await expect(l.salva).toBeDisabled();
    await expect(l.indietro.last()).toBeEnabled();
  });

  test("Caso inverso: idDocumento valorizzato e cup vuoto resta immutable", async ({ page }) => {
    await mockAreaPersonale(page, { get: ok(makeDatiFatturazione({ idDocumento: "DOC-1", cup: "" })) });

    // 1. Mockare GET con idDocumento 'DOC-1' e cup ''
    const l = await openPage(page);

    await expect.poll(async () => (await mainStatePersistito(page)).statusPageDatiFatturazione).toBe("immutable");
    await expect(l.titolo).toBeVisible();
    await expect(l.modifica).toBeVisible();
  });

  test("codiceSDI null o vuoto: fallback su contractCodiceSDI", async ({ page }) => {
    const api = await mockAreaPersonale(page, { get: ok(makeDatiFatturazione({ codiceSDI: null, contractCodiceSDI: "CTR9999" })) });
    const l = locators(page);

    // 1. Mockare GET con codiceSDI null e contractCodiceSDI 'CTR9999'
    await openPage(page);
    await expect(l.codiceSdi).toHaveValue("CTR9999");

    // 2. Ripetere con codiceSDI '' e contractCodiceSDI 'CTR9999'
    api.get.reply(ok(makeDatiFatturazione({ codiceSDI: "", contractCodiceSDI: "CTR9999" })));
    await openPage(page);
    await expect(l.codiceSdi).toHaveValue("CTR9999");

    // 3. Ripetere con codiceSDI 'ABC1234' e contractCodiceSDI 'CTR9999'
    api.get.reply(ok(makeDatiFatturazione({ codiceSDI: "ABC1234", contractCodiceSDI: "CTR9999" })));
    await openPage(page);
    await expect(l.codiceSdi).toHaveValue("ABC1234");

    // 4. Ripetere con codiceSDI null e contractCodiceSDI null
    api.get.reply(ok(makeDatiFatturazione({ codiceSDI: null, contractCodiceSDI: null })));
    await openPage(page);
    await expect(l.codiceSdi).toHaveValue("");
    await expect(l.cup).toHaveValue("CUP123");
  });

  test("Contratto idTipoContratto 2: Split Payment non modificabile", async ({ page }) => {
    await seedSession(page, { profilo: { idTipoContratto: 2, auth: "SELFCARE" } });
    await mockAreaPersonale(page);

    // 1. Impostare profilo con idTipoContratto 2 (SELFCARE), dati presenti, aprire la pagina e premere 'Modifica'
    const l = await openPage(page);
    await l.modifica.click();
    await expect(l.heading("Modifica dati di fatturazione")).toBeVisible();

    await expect(splitSi(page)).toBeDisabled();
    await expect(splitNo(page)).toBeDisabled();
    await expect(l.radioOrdine).toBeEnabled();
    await expect(l.radioContratto).toBeEnabled();
  });

  test("Contatti: tre email massimo", async ({ page }) => {
    const contatti = [
      { email: "uno@test.it", tipo: 1 },
      { email: "due@test.it", tipo: 1 },
      { email: "tre@test.it", tipo: 1 },
    ];
    await mockAreaPersonale(page, { get: ok(makeDatiFatturazione({ contatti })) });

    // 1. Mockare GET con 3 contatti e aprire la pagina
    const l = await openPage(page);

    for (const { email } of contatti) await expect(page.getByText(email, { exact: true })).toBeVisible();
    await expect(l.emailAmministrativo).toHaveAccessibleDescription("max 0");
  });
});

