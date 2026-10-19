// spec: specs/areaPersonaleUtenteEnte.md
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  DatiFatturazioneMock, ROUTE, locators, makeDatiFatturazione, mockAreaPersonale, notFound, ok, openPage,
} from "../../utils/areaPersonaleMock/areaPersonaleMock";

// Debounce SDI 1500ms + risposta: timeout generoso per le assertion che dipendono dalla verifica
const SDI_TIMEOUT = { timeout: 5000 };

const extra = (page: Page) => ({
  dataDocumento: page.getByRole("textbox", { name: "Data documento" }),
  notaLegale: page.getByRole("checkbox", { name: /Gli accordi di adesione a SEND/ }),
  modaleVerificaSdi: page.getByText("Verifica del codice SDI in corso"),
  helper: (testo: string) => page.getByText(testo, { exact: true }),
});

/** apre la pagina con dati presenti e passa in modifica, attendendo la verifica iniziale dello SDI */
async function apriInModifica(page: Page, dati: Partial<DatiFatturazioneMock> = {}) {
  const api = await mockAreaPersonale(page, { get: ok(makeDatiFatturazione(dati)) });
  const l = await openPage(page);
  await l.modifica.click();
  await expect(l.heading("Modifica dati di fatturazione")).toBeVisible();
  await expect.poll(() => api.verificaSdi.calls).toBe(1);
  return { api, l, x: extra(page) };
}

/** primo inserimento: GET 404, contractCodiceSDI dal mock */
async function apriPrimoInserimento(page: Page, contractCodiceSDI: string | null) {
  const api = await mockAreaPersonale(page, { get: notFound(), sdi: ok({ contractCodiceSDI }) });
  const l = locators(page);
  await page.goto(ROUTE);
  await expect(l.heading("Inserisci i dati di fatturazione")).toBeVisible();
  return { api, l, x: extra(page) };
}

async function digitaData(page: Page, valore: string) {
  const campo = extra(page).dataDocumento;
  await campo.click();
  await campo.press("Control+a");
  await campo.pressSequentially(valore.replace(/\//g, ""));
}

async function cancellaData(page: Page) {
  const campo = extra(page).dataDocumento;
  await campo.click();
  await campo.press("Control+a");
  await campo.press("Backspace");
}

test.describe("Validazione campi", () => {
  test("Stato di partenza: form valido e Salva abilitato in modifica", async ({ page }) => {
    // 1. Aprire con dati completi validi, mockare POST codiceSDI 200 e cliccare 'Modifica'
    const { l, x } = await apriInModifica(page);

    // expect: Nessun campo in errore
    for (const campo of [l.cup, l.pec, l.idDocumento, l.codCommessa, l.codiceSdi, l.emailAmministrativo, x.dataDocumento]) {
      await expect(campo).toHaveAttribute("aria-invalid", "false");
    }
    // expect: Pulsante 'Salva' abilitato
    await expect(l.salva).toBeEnabled();
  });

  test("PEC non valida", async ({ page }) => {
    const { l } = await apriInModifica(page);
    await expect(l.salva).toBeEnabled();

    // 1. In modifica scrivere in 'PEC' 'non-una-mail'
    await l.pec.fill("non-una-mail");

    // expect: Il campo PEC e' in errore (aria-invalid true)
    await expect(l.pec).toHaveAttribute("aria-invalid", "true");
    // expect: 'Salva' disabilitato
    await expect(l.salva).toBeDisabled();

    // 2. Correggere in 'pec@test.it'
    await l.pec.fill("pec@test.it");

    // expect: Errore rimosso, 'Salva' di nuovo abilitato
    await expect(l.pec).toHaveAttribute("aria-invalid", "false");
    await expect(l.salva).toBeEnabled();
  });

  test("PEC vuota", async ({ page }) => {
    const { l } = await apriInModifica(page);
    await expect(l.salva).toBeEnabled();

    // 1. In modifica svuotare 'PEC'
    await l.pec.fill("");

    // expect: Campo in errore, 'Salva' disabilitato (pec === '' e/o validazione fallita)
    await expect(l.pec).toHaveAttribute("aria-invalid", "true");
    await expect(l.salva).toBeDisabled();
  });

  test("CUP: lunghezza massima e caratteri speciali", async ({ page }) => {
    const { l } = await apriInModifica(page);

    // 1. Scrivere in 'CUP' 16 caratteri alfanumerici
    await l.cup.fill("");
    await l.cup.pressSequentially("ABCDEFGHIJ123456");

    // expect: Il campo accetta al massimo 15 caratteri (maxLength)
    await expect(l.cup).toHaveAttribute("maxlength", "15");
    await expect(l.cup).toHaveValue("ABCDEFGHIJ12345");
    await expect(l.cup).toHaveAttribute("aria-invalid", "false");
    await expect(l.salva).toBeEnabled();

    // 2. Scrivere 'CUP-12!' (caratteri non alfanumerici)
    await l.cup.fill("CUP-12!");

    // expect: Il campo CUP e' in errore e 'Salva' disabilitato (solo [a-zA-Z0-9] consentiti)
    await expect(l.cup).toHaveAttribute("aria-invalid", "true");
    await expect(l.salva).toBeDisabled();
  });

  test("CUP e ID Documento reciprocamente obbligatori", async ({ page }) => {
    const { l, x } = await apriInModifica(page, { cup: "", idDocumento: "", dataDocumento: null });
    await expect(l.salva).toBeEnabled();

    // 1. Partire da cup '' e idDocumento ''; scrivere solo 'CUP123' nel CUP
    await l.cup.fill("CUP123");

    // expect: 'ID Documento' diventa obbligatorio e in errore
    await expect(l.idDocumento).toHaveAttribute("required", "");
    await expect(l.idDocumento).toHaveAttribute("aria-invalid", "true");
    // expect: Anche 'Data documento' diventa required
    await expect(x.dataDocumento).toHaveAttribute("required", "");
    // expect: 'Salva' disabilitato
    await expect(l.salva).toBeDisabled();

    // 2. Scrivere 'DOC-1' in 'ID Documento'
    await l.idDocumento.fill("DOC-1");

    // expect: Errori di CUP/ID Documento rimossi; resta richiesta la 'Data documento' (se mancante errore) e 'Salva' abilitato solo con data valida
    await expect(l.cup).toHaveAttribute("aria-invalid", "false");
    await expect(l.idDocumento).toHaveAttribute("aria-invalid", "false");
    await expect(x.dataDocumento).toHaveAttribute("aria-invalid", "true");
    await expect(l.salva).toBeDisabled();
    await digitaData(page, "15/03/2026");
    await expect(x.dataDocumento).toHaveAttribute("aria-invalid", "false");
    await expect(l.salva).toBeEnabled();
    await cancellaData(page);
    await expect(x.dataDocumento).toHaveAttribute("aria-invalid", "true");
    await expect(l.salva).toBeDisabled();

    // 3. Svuotare di nuovo il CUP lasciando l'ID Documento
    await l.cup.fill("");

    // expect: Il CUP e' in errore e 'Salva' disabilitato
    await expect(l.cup).toHaveAttribute("aria-invalid", "true");
    await expect(l.salva).toBeDisabled();

    // 4. Svuotare entrambi
    await l.idDocumento.fill("");

    // expect: Nessun errore, 'Data documento' non obbligatoria, 'Salva' abilitato
    await expect(l.cup).toHaveAttribute("aria-invalid", "false");
    await expect(l.idDocumento).toHaveAttribute("aria-invalid", "false");
    await expect(x.dataDocumento).toHaveAttribute("aria-invalid", "false");
    await expect(x.dataDocumento).not.toHaveAttribute("required", "");
    await expect(l.salva).toBeEnabled();
  });

  test("ID Documento: lunghezza massima e caratteri", async ({ page }) => {
    const { l } = await apriInModifica(page);

    // 1. Scrivere 21 caratteri in 'ID Documento'
    await l.idDocumento.fill("");
    await l.idDocumento.pressSequentially("ABCDEFGHIJ12345678901");

    // expect: maxLength 20: il campo tronca a 20 caratteri
    await expect(l.idDocumento).toHaveAttribute("maxlength", "20");
    await expect(l.idDocumento).toHaveValue("ABCDEFGHIJ1234567890");

    // 2. Scrivere 'DOC_1.2/3-4' e poi 'DOC@1'
    await l.idDocumento.fill("DOC_1.2/3-4");

    // expect: Il primo e' accettato (consentiti . / _ - e spazi); il secondo mette il campo in errore e disabilita 'Salva'
    await expect(l.idDocumento).toHaveAttribute("aria-invalid", "false");
    await expect(l.salva).toBeEnabled();
    await l.idDocumento.fill("DOC@1");
    await expect(l.idDocumento).toHaveAttribute("aria-invalid", "true");
    await expect(l.salva).toBeDisabled();
  });

  test("Data documento: valida, fuori range, non valida", async ({ page }) => {
    const { api, l, x } = await apriInModifica(page);

    // 1. Con CUP e ID Documento valorizzati digitare in 'Data documento' '15/03/2026'
    await digitaData(page, "15/03/2026");

    // expect: Nessun errore, 'Salva' abilitato
    await expect(x.dataDocumento).toHaveValue("15/03/2026");
    await expect(x.dataDocumento).toHaveAttribute("aria-invalid", "false");
    await expect(l.salva).toBeEnabled();

    // 2. Digitare '15/03/1999' e poi '15/03/2126'
    await digitaData(page, "15/03/1999");

    // expect: Il campo e' in errore (anno < 2000 o > 2125) e 'Salva' disabilitato
    await expect(x.dataDocumento).toHaveAttribute("aria-invalid", "true");
    await expect(l.salva).toBeDisabled();
    await digitaData(page, "15/03/2126");
    await expect(x.dataDocumento).toHaveAttribute("aria-invalid", "true");
    await expect(l.salva).toBeDisabled();

    // 3. Cancellare la data con CUP/ID valorizzati
    await cancellaData(page);

    // expect: Campo in errore, 'Salva' disabilitato
    await expect(x.dataDocumento).toHaveAttribute("aria-invalid", "true");
    await expect(l.salva).toBeDisabled();

    // 4. Cancellare la data con CUP e ID Documento vuoti
    await l.cup.fill("");
    await l.idDocumento.fill("");
    await cancellaData(page);

    // expect: Nessun errore, dataDocumento null inviata come null
    await expect(x.dataDocumento).toHaveAttribute("aria-invalid", "false");
    await expect(l.salva).toBeEnabled();
    await l.salva.click();
    await expect.poll(() => api.modify.calls).toBe(1);
    expect((api.modify.bodies[0] as { dataDocumento: unknown }).dataDocumento).toBeNull();
  });

  test("Codice Commessa/Convenzione: lunghezza e caratteri", async ({ page }) => {
    const { l } = await apriInModifica(page);

    // 1. Scrivere 101 caratteri nel campo 'Codice Commessa/Convenzione'
    await l.codCommessa.fill("");
    await l.codCommessa.pressSequentially("A".repeat(101));

    // expect: maxLength 100: troncato
    await expect(l.codCommessa).toHaveAttribute("maxlength", "100");
    await expect(l.codCommessa).toHaveValue("A".repeat(100));

    // 2. Scrivere 'COM/1_a-b.c' e poi 'COM#1'
    await l.codCommessa.fill("COM/1_a-b.c");

    // expect: Il primo e' accettato, il secondo e' in errore e disabilita 'Salva'
    await expect(l.codCommessa).toHaveAttribute("aria-invalid", "false");
    await expect(l.salva).toBeEnabled();
    await l.codCommessa.fill("COM#1");
    await expect(l.codCommessa).toHaveAttribute("aria-invalid", "true");
    await expect(l.salva).toBeDisabled();

    // 3. Lasciare il campo vuoto
    await l.codCommessa.fill("");

    // expect: Campo facoltativo: nessun errore, 'Salva' abilitato
    await expect(l.codCommessa).toHaveAttribute("aria-invalid", "false");
    await expect(l.salva).toBeEnabled();
  });

  test("Email amministrativo: formato, duplicati, limite di 3", async ({ page }) => {
    const { l, x } = await apriInModifica(page, { contatti: [] });

    // 1. Scrivere 'non-mail' in 'Email amministrativo'
    await l.emailAmministrativo.fill("non-mail");

    // expect: Il campo e' in errore e 'Aggiungi Email' disabilitato
    await expect(l.emailAmministrativo).toHaveAttribute("aria-invalid", "true");
    await expect(l.aggiungiEmail).toBeDisabled();

    // 2. Scrivere 'uno@test.it' e cliccare 'Aggiungi Email'
    await l.emailAmministrativo.fill("uno@test.it");
    await l.aggiungiEmail.click();

    // expect: L'email compare nell'elenco con icone modifica/elimina; il campo si svuota; helperText 'max 2'
    // (le icone non hanno nome accessibile, bug #5: si verifica solo l'email in elenco)
    await expect(page.getByText("uno@test.it", { exact: true })).toBeVisible();
    await expect(l.emailAmministrativo).toHaveValue("");
    await expect(x.helper("max 2")).toBeVisible();

    // 3. Riscrivere 'uno@test.it' (duplicato)
    await l.emailAmministrativo.fill("uno@test.it");

    // expect: Campo in errore e 'Aggiungi Email' disabilitato
    await expect(l.emailAmministrativo).toHaveAttribute("aria-invalid", "true");
    await expect(l.aggiungiEmail).toBeDisabled();

    // 4. Aggiungere altre due email diverse
    await l.emailAmministrativo.fill("due@test.it");
    await l.aggiungiEmail.click();
    await expect(x.helper("max 1")).toBeVisible();
    await l.emailAmministrativo.fill("tre@test.it");
    await l.aggiungiEmail.click();

    // expect: Con 3 contatti 'Email amministrativo' e 'Aggiungi Email' sono disabilitati, helperText 'max 0'
    await expect(x.helper("max 0")).toBeVisible();
    await expect(l.emailAmministrativo).toBeDisabled();
    await expect(l.aggiungiEmail).toBeDisabled();
  });

  // Le icone modifica/elimina dei contatti (IconButton in dynamicInsert.tsx) non hanno nome accessibile ne' data-testid
  // (bug #5): non sono raggiungibili con getByRole/getByLabel/getByTestId. Serve aggiungere ad es.
  // data-testid="contatto-modifica-<email>" / "contatto-elimina-<email>" (o aria-label) per abilitare il test.
  test.fixme("Contatti: modifica ed eliminazione", async ({ page }) => {
    const { l } = await apriInModifica(page);

    // 1. Con 2 contatti cliccare l'icona di modifica del primo (aggiungere data-testid, le icone non hanno nome accessibile)
    await page.getByTestId("contatto-modifica-uno@test.it").click();

    // expect: L'email viene rimossa dall'elenco e riportata nel campo 'Email amministrativo'
    await expect(page.getByText("uno@test.it", { exact: true })).toHaveCount(0);
    await expect(l.emailAmministrativo).toHaveValue("uno@test.it");

    // 2. Cliccare l'icona elimina del secondo contatto
    await page.getByTestId("contatto-elimina-due@test.it").click();

    // expect: L'email viene rimossa dall'elenco
    await expect(page.getByText("due@test.it", { exact: true })).toHaveCount(0);

    // 3. Eliminare tutti i contatti
    await l.emailAmministrativo.fill("");

    // expect: Il campo 'Email amministrativo' e' in errore (arrElement vuoto), 'Salva' disabilitato
    await expect(l.emailAmministrativo).toHaveAttribute("aria-invalid", "true");
    await expect(l.salva).toBeDisabled();
  });

  test("Codice SDI: maiuscolo automatico, lunghezza e caratteri", async ({ page }) => {
    const { api, l, x } = await apriInModifica(page);

    // 1. Scrivere 'abc1234' in 'Codice univoco o SDI'
    await l.codiceSdi.fill("abc1234");

    // expect: Il valore diventa 'ABC1234' (toUpperCase)
    await expect(l.codiceSdi).toHaveValue("ABC1234");
    await expect.poll(() => api.verificaSdi.calls, SDI_TIMEOUT).toBe(2);
    await expect(l.salva).toBeEnabled(SDI_TIMEOUT);

    // 2. Scrivere 8 caratteri
    await l.codiceSdi.fill("");
    await l.codiceSdi.pressSequentially("ABCD1234");

    // expect: maxLength 7: troncato a 7
    await expect(l.codiceSdi).toHaveAttribute("maxlength", "7");
    await expect(l.codiceSdi).toHaveValue("ABCD123");
    await expect.poll(() => api.verificaSdi.calls, SDI_TIMEOUT).toBe(3);
    await expect(l.salva).toBeEnabled(SDI_TIMEOUT);

    // 3. Scrivere 'AB-123'
    await l.codiceSdi.fill("AB-123");

    // expect: Dopo 1500 ms di debounce non parte la POST (regex ^[A-Z0-9]*$ fallisce), il campo e' in errore, il modale 'Verifica del codice SDI in corso' si chiude, 'Salva' disabilitato
    await expect(l.codiceSdi).toHaveAttribute("aria-invalid", "true", SDI_TIMEOUT);
    await expect(x.modaleVerificaSdi).toBeHidden(SDI_TIMEOUT);
    await expect(l.salva).toBeDisabled();
    expect(api.verificaSdi.calls).toBe(3);
  });

  test("Salva disabilitato se codice SDI vuoto o null", async ({ page }) => {
    await test.step("SDI svuotato in modifica", async () => {
      const { l } = await apriInModifica(page);
      await expect(l.salva).toBeEnabled();

      // 1. In modifica svuotare 'Codice univoco o SDI'
      await l.codiceSdi.fill("");

      // expect: 'Salva' disabilitato; campo in errore (required)
      await expect(l.salva).toBeDisabled();
      await expect(l.codiceSdi).toHaveAttribute("required", "");
      await expect(l.codiceSdi).toHaveAttribute("aria-invalid", "true", SDI_TIMEOUT);
      await expect(l.salva).toBeDisabled();
    });

    await test.step("Primo inserimento con SDI null", async () => {
      await page.unrouteAll({ behavior: "ignoreErrors" });
      // 2. Caso 404 con contractCodiceSDI null (SDI null) e tutti gli altri dati compilati
      const { api, l, x } = await apriPrimoInserimento(page, null);
      await l.radioOrdine.check();
      await l.pec.fill("pec@test.it");
      await l.emailAmministrativo.fill("uno@test.it");
      await l.aggiungiEmail.click();
      await x.notaLegale.check();

      // expect: 'Salva' disabilitato finche' non si compila l'SDI
      await expect(l.codiceSdi).toHaveValue("");
      await expect(l.salva).toBeDisabled();
      await l.codiceSdi.fill("ABC1234");
      await expect.poll(() => api.verificaSdi.bodies.at(-1), SDI_TIMEOUT).toMatchObject({ codiceSDI: "ABC1234" });
      await expect(l.salva).toBeEnabled(SDI_TIMEOUT);
    });
  });

  test("Salva disabilitato senza notaLegale", async ({ page }) => {
    const { l, x } = await apriInModifica(page);
    await expect(l.salva).toBeEnabled();

    // 1. Con tutti gli altri campi validi, deselezionare la checkbox notaLegale
    await x.notaLegale.uncheck();

    // expect: 'Salva' disabilitato
    await expect(l.salva).toBeDisabled();

    // 2. Riselezionare la checkbox
    await x.notaLegale.check();

    // expect: 'Salva' abilitato
    await expect(l.salva).toBeEnabled();
  });

  test("Salva disabilitato senza contatti", async ({ page }) => {
    // 1. Nel caso primo inserimento compilare tutto tranne le email
    const { l, x } = await apriPrimoInserimento(page, "SDI0001");
    await l.radioOrdine.check();
    await l.pec.fill("pec@test.it");
    await x.notaLegale.check();
    await expect(l.codiceSdi).toHaveValue("SDI0001");

    // expect: 'Salva' disabilitato; dopo aver aggiunto una email valida diventa abilitato
    await expect(l.salva).toBeDisabled();
    await l.emailAmministrativo.fill("uno@test.it");
    await l.aggiungiEmail.click();
    await expect(l.salva).toBeEnabled(SDI_TIMEOUT);
  });

  test("Checkbox notaLegale non attivabile senza tipologia", async ({ page }) => {
    // 1. Nel caso 404 (tipoCommessa vuoto) ispezionare la checkbox
    const { l, x } = await apriPrimoInserimento(page, "SDI0001");

    // expect: La checkbox e' disabilitata finche' non si seleziona una tipologia di ordine
    await expect(x.notaLegale).toBeDisabled();
    await expect(x.notaLegale).not.toBeChecked();
    await l.radioOrdine.check();
    await expect(x.notaLegale).toBeEnabled();
  });

  test("Cambio tipologia ordine", async ({ page }) => {
    const { api, l } = await apriInModifica(page);

    // 1. In modifica selezionare "Dati contratto"
    await l.radioContratto.check();

    // expect: La radio e' selezionata; i nuovi contatti inseriti dopo avranno tipo = '2' (verificabile nel body dell'invio)
    await expect(l.radioContratto).toBeChecked();
    await expect(l.radioOrdine).not.toBeChecked();
    await l.emailAmministrativo.fill("tre@test.it");
    await l.aggiungiEmail.click();
    await expect(page.getByText("tre@test.it", { exact: true })).toBeVisible();
    await l.salva.click();
    await expect.poll(() => api.modify.calls).toBe(1);
    const body = api.modify.bodies[0] as { tipoCommessa: string; contatti: { email: string; tipo: unknown }[] };
    expect(body.tipoCommessa).toBe("2");
    expect(body.contatti).toContainEqual({ email: "tre@test.it", tipo: "2" });
  });
});
