// spec: specs/ente-moduloCommessaInserimento.md (sezione 3)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import type { Page } from "@playwright/test";
import {
  CAMPI, REGIONI, TESTO_CAMPI_NULL, VALORI, makeModuloIns, mockDettaglioMode, mockObbligatori, openPage,
} from "../../utils/moduloCommessaInserimentoMock/moduloCommessaInserimentoMock";

type L = Awaited<ReturnType<typeof openPage>>;
type Campo = (typeof CAMPI)[number];

// Compila i campi indicati (tutti stringhe, cosi' si possono provare anche valori non numerici)
async function compila(l: L, valori: Partial<Record<Campo, string>>) {
  for (const [campo, valore] of Object.entries(valori)) {
    await l.campo(campo as Campo).fill(valore);
  }
}

const chiudiModalInfo = (page: Page) => page.getByTestId("CloseIcon").last().click();

test.describe("Form, valori e validazione", () => {
  test("Struttura del form", async ({ page }) => {
    await mockObbligatori(page);

    // 1. Aprire la pagina in modalita' obbligatori
    const l = await openPage(page);

    // expect: Intestazioni 'Territorio nazionale', 'Territorio diverso da nazionale', 'Totale notifiche da processare'
    await expect(page.getByText("Territorio nazionale", { exact: true })).toBeVisible();
    await expect(page.getByText("Territorio diverso da nazionale", { exact: true })).toBeVisible();
    await expect(page.getByText("Totale notifiche da processare", { exact: true })).toBeVisible();

    // expect: Frasi con mese/anno in grassetto
    const frasi = [
      "Numero complessivo delle notifiche da processare in via digitale nel mese di",
      "Numero complessivo delle notifiche da processare in via analogica tramite Raccomandata A/R nel mese di",
      "Numero complessivo delle notifiche da processare in via analogica del tipo notifica ex L. 890/1982 nel mese di",
    ];
    for (const frase of frasi) {
      const riga = page.getByText(frase);
      await expect(riga).toBeVisible();
      await expect(riga.getByText("Ottobre/2026")).toHaveCSS("font-weight", "700");
    }

    // expect: Riga 890: un solo campo (nessun campo internazionale); in totale 5 campi modulo
    await expect(page.getByTestId(/^modulo-/)).toHaveCount(5);
    await expect(l.campo("totaleNotificheAnalogico890Naz")).toBeVisible();
    await expect(page.getByTestId("modulo-totaleNotificheAnalogico890Internaz")).toHaveCount(0);

    // expect: Riga TOTALE e 'Totale Notifiche' AR/890 presenti
    await expect(page.getByText("TOTALE", { exact: true })).toBeVisible();
    await expect(page.getByText("Totale Notifiche", { exact: true })).toBeVisible();
    await expect(l.totaleAr).toBeVisible();
    await expect(l.totale890).toBeVisible();
  });

  test("Digitazione di valori validi e totali calcolati", async ({ page }) => {
    await mockObbligatori(page);
    const l = await openPage(page);

    // 1. Compilare digitale naz 100, int 10, AR naz 20, AR int 2, 890 naz 5
    await compila(l, {
      totaleNotificheDigitaleNaz: "100",
      totaleNotificheDigitaleInternaz: "10",
      totaleNotificheAnalogicoARNaz: "20",
      totaleNotificheAnalogicoARInternaz: "2",
      totaleNotificheAnalogico890Naz: "5",
    });

    // expect: Totale riga digitale 110, AR 22, 890 5
    await expect(page.getByText("110", { exact: true })).toBeVisible();
    await expect(page.getByText("22", { exact: true })).toBeVisible();
    await expect(page.getByText("5", { exact: true })).toBeVisible();
    // expect: TOTALE nazionale 125, internazionale 12, totale notifiche 137
    await expect(page.getByText("125", { exact: true })).toBeVisible();
    await expect(page.getByText("12", { exact: true })).toBeVisible();
    await expect(page.getByText("137", { exact: true })).toBeVisible();
    // expect: 'Totale Notifiche' sotto le regioni: AR 20, 890 5
    await expect(l.totaleAr).toHaveValue("20");
    await expect(l.totale890).toHaveValue("5");
  });

  test("Valore 0 ammesso", async ({ page }) => {
    await mockObbligatori(page);
    const l = await openPage(page);

    // 1. Digitare 0 in tutti i campi
    await compila(l, Object.fromEntries(CAMPI.map((c) => [c, "0"])));

    // expect: Il campo mostra 0 (non vuoto), nessun errore
    for (const c of CAMPI) {
      await expect(l.campo(c)).toHaveValue("0");
      await expect(l.campo(c)).toHaveAttribute("aria-invalid", "false");
    }
    // expect: totali 0
    await expect(l.totaleAr).toHaveValue("0");
    await expect(l.totale890).toHaveValue("0");
  });

  test("Valori negativi rifiutati", async ({ page }) => {
    await mockObbligatori(page);
    const l = await openPage(page);
    const campo = l.campo("totaleNotificheDigitaleNaz");

    // 1. Digitare '-5' in un campo con valore 10
    await campo.fill("10");
    await expect(campo).toHaveValue("10");
    await campo.fill("-5");

    // expect: Il valore resta 10 (onChange ignorato se Number(val)<0)
    await expect(campo).toHaveValue("10");
  });

  test("Valori non numerici e decimali", async ({ page }) => {
    await mockObbligatori(page);
    const l = await openPage(page);
    const campo = l.campo("totaleNotificheDigitaleNaz");
    await campo.fill("10");

    // 1. Digitare 'abc', '1e2', '1.5', ' ' in un campo
    // expect: 'abc': Number('abc') e' NaN, NaN>=0 e' false: ignorato
    await campo.fill("abc");
    await expect(campo).toHaveValue("10");

    // expect: '1e2': accettato e salvato come 100
    // NB: diverge dalla spec solo nella forma: il campo non conserva "1e2", viene riscritto con il numero (100)
    await campo.fill("1e2");
    await expect(campo).toHaveValue("100");

    // expect: '1.5': accettato come 1.5 (nessuna restrizione sugli interi)
    await campo.fill("1.5");
    await expect(campo).toHaveValue("1.5");

    // expect: ' ' : Number(' ')=0, accettato come 0
    await campo.fill(" ");
    await expect(campo).toHaveValue("0");
  });

  test("Svuotare un campo lo riporta a null", async ({ page }) => {
    await mockObbligatori(page);
    const l = await openPage(page);
    const campo = l.campo("totaleNotificheDigitaleNaz");

    // 1. Compilare e poi cancellare il campo
    await compila(l, Object.fromEntries(CAMPI.map((c) => [c, "0"])));
    await campo.fill("7");
    await expect(campo).toHaveValue("7");
    await campo.fill("");

    // expect: Il campo e' vuoto
    await expect(campo).toHaveValue("");
    // expect: la validazione lo considera non valorizzato (Salva mostra il ModalInfo)
    await l.salva.click();
    await expect(page.getByText(TESTO_CAMPI_NULL)).toBeVisible();
    await expect(campo).toHaveAttribute("aria-invalid", "true");
  });

  test("Zeri iniziali e numeri molto grandi", async ({ page }) => {
    const errori: string[] = [];
    page.on("pageerror", (e) => errori.push(e.message));
    await mockObbligatori(page);
    const l = await openPage(page);
    const campo = l.campo("totaleNotificheDigitaleNaz");

    // 1. Digitare '007' e '99999999999999999999'
    // expect: '007' mostrato come 7
    await campo.fill("007");
    await expect(campo).toHaveValue("7");

    // expect: Il numero grande non crasha e i totali restano coerenti
    // NB: Number("99999999999999999999") = 1e20, che String() scrive ancora in forma estesa (la soglia esponenziale e' 1e21)
    await campo.fill("99999999999999999999");
    await expect(campo).toHaveValue("100000000000000000000");
    await expect(page.getByText("100000000000000000000", { exact: true }).first()).toBeVisible();
    expect(errori).toEqual([]);
  });

  test("Validazione: Salva con un campo nullo", async ({ page }) => {
    const { post, datiFatturazione } = await mockObbligatori(page);
    const l = await openPage(page);

    // 1. Modulo singolo con un campo vuoto, cliccare 'Salva'
    await compila(l, {
      totaleNotificheDigitaleNaz: "0",
      totaleNotificheDigitaleInternaz: "0",
      totaleNotificheAnalogicoARNaz: "0",
      totaleNotificheAnalogicoARInternaz: "0",
    });
    await l.salva.click();

    // expect: ModalInfo con 'Attenzione!' e il testo di errore
    await expect(page.getByRole("heading", { name: "Attenzione!" })).toBeVisible();
    await expect(page.getByText(TESTO_CAMPI_NULL)).toBeVisible();
    // expect: Il resto della pagina e' aria-hidden
    await expect(l.salva).toBeHidden();
    // expect: Senza pulsanti 'Annulla'/'Prosegui'
    await expect(page.getByRole("button", { name: "Annulla" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Prosegui" })).toHaveCount(0);
    // expect: Campi null in errore (aria-invalid=true), gli altri no
    await expect(l.campo("totaleNotificheAnalogico890Naz")).toHaveAttribute("aria-invalid", "true");
    await expect(l.campo("totaleNotificheDigitaleNaz")).toHaveAttribute("aria-invalid", "false");
    // expect: Nessuna POST (ne' verifica dati di fatturazione)
    expect(post).toHaveLength(0);
    expect(datiFatturazione.n).toBe(0);

    // 2. Chiudere con la X del modale
    await chiudiModalInfo(page);

    // expect: Modale chiuso; i campi null restano in errore
    await expect(page.getByText(TESTO_CAMPI_NULL)).toHaveCount(0);
    await expect(l.salva).toBeVisible();
    await expect(l.campo("totaleNotificheAnalogico890Naz")).toHaveAttribute("aria-invalid", "true");
  });

  test("Validazione considera solo 5 campi", async ({ page }) => {
    const { post } = await mockObbligatori(page);
    const l = await openPage(page);

    // 1. Compilare tutti i 5 campi (digitale naz/int, AR naz/int, 890)
    await compila(l, Object.fromEntries(CAMPI.map((c) => [c, "0"])));
    await l.salva.click();

    // expect: nessun modale di errore (totaleNotificheDigitale/Analogico non sono controllati)
    await expect(page.getByText(TESTO_CAMPI_NULL)).toHaveCount(0);
    // expect: il salvataggio prosegue (coperture al 100% con totali 0)
    await expect.poll(() => post.length).toBe(1);
  });

  test("errorAnyValueIsEqualNull si azzera", async ({ page }) => {
    await mockObbligatori(page);
    const l = await openPage(page);

    // 1. Provocare l'errore
    await compila(l, {
      totaleNotificheDigitaleNaz: "0",
      totaleNotificheDigitaleInternaz: "0",
      totaleNotificheAnalogicoARInternaz: "0",
      totaleNotificheAnalogico890Naz: "0",
    });
    await l.salva.click();
    await expect(page.getByText(TESTO_CAMPI_NULL)).toBeVisible();
    await chiudiModalInfo(page);
    await expect(l.campo("totaleNotificheAnalogicoARNaz")).toHaveAttribute("aria-invalid", "true");

    // compilare il campo mancante (AR naz 10, senza regioni: copertura < 100) e cliccare 'Salva'
    await l.campo("totaleNotificheAnalogicoARNaz").fill("10");
    await l.salva.click();

    // expect: Gli errori scompaiono (setErrorAnyValueIsEqualNull(false))
    // (compare invece il ModalInfo di copertura, quindi la pagina resta aperta)
    await expect(page.getByText(/La percentale di copertura NON raggiunge il 100%/)).toBeVisible();
    await expect(page.getByText(TESTO_CAMPI_NULL)).toHaveCount(0);
    for (const c of CAMPI) {
      await expect(l.campo(c)).toHaveAttribute("aria-invalid", "false");
    }
  });

  test("Campi disabilitati in sola lettura", async ({ page }) => {
    await mockDettaglioMode(page, {
      modulo: makeModuloIns(2026, 3, {
        ...VALORI,
        stato: "inserito",
        valoriRegione: [{ regione: "Lazio", istatRegione: "12", ar: 5, 890: 2, calcolato: 0, obbligatorio: 0 }],
      }),
    });

    // 1. Aprire un dettaglio con isEditAllow=false
    const l = await openPage(page);
    await expect(l.titoloDettaglio).toBeVisible();

    // expect: Tutti i campi del form, i campi regione, la select e 'Aggiungi regione' sono disabilitati
    for (const c of CAMPI) {
      await expect(l.campo(c)).toBeDisabled();
    }
    await expect(l.regioneAr("12")).toBeDisabled();
    await expect(l.regione890("12")).toBeDisabled();
    // la select MUI disabilitata espone aria-disabled sul combobox
    await expect(l.inserisciRegione.or(page.getByRole("combobox"))).toHaveAttribute("aria-disabled", "true");
    await expect(l.aggiungiRegione).toBeDisabled();

    // expect: I campi 'Totale Notifiche' e percentuali sono sempre disabilitati
    await expect(l.totaleAr).toBeDisabled();
    await expect(l.totale890).toBeDisabled();
    await expect(l.coperturaAr).toBeDisabled();
    await expect(l.copertura890).toBeDisabled();
  });
});

// Evita l'avviso di import non usato quando REGIONI serve solo come riferimento dei dati di mock
void REGIONI;
