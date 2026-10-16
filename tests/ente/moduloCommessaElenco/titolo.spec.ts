// spec: specs/ente-moduloCommessaElenco.md (sezione 1)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import {
  API, CAPTION_KO, CAPTION_OK, ROUTE, locators, makeAnno, mockAll, mockLista, openPage, seedSession,
} from "../../utils/moduloCommessaElencoMock/moduloCommessaElencoMock";

const byPath = (re: RegExp) => (url: URL) => re.test(url.pathname);

test.describe("Titolo e accesso", () => {
  test("Titolo e caricamento iniziale", async ({ page }) => {
    const { verifica, anni, lista } = await mockAll(page, { verifica: false, moduli: makeAnno(2026) });

    // 1. Impostare redirectToInsert=false e mockare verifica=false, anni, lista 2026 (12 righe), aprire /ente/modulicommessa
    const l = await openPage(page);

    // expect: Heading 'Modulo commessa' visibile
    await expect(l.title).toBeVisible();
    // expect: Voce di menu 'Modulo commessa' evidenziata (Mui-selected)
    await expect(page.getByRole("navigation").getByRole("button", { name: "Modulo commessa", exact: true })).toHaveClass(/Mui-selected/);
    // expect: Modale 'Loading...' chiuso a caricamento terminato
    await expect(l.loading).toBeHidden();
    // expect: Chiamate verifica, anni e lista (senza anno), ciascuna una sola volta
    await expect.poll(() => lista.length).toBe(1);
    expect(lista[0]).toBe("");
    expect(verifica.n).toBe(1);
    expect(anni.n).toBe(1);
    // expect: Griglia con 12 righe
    await expect(l.rows).toHaveCount(12);
    // expect: 'Filtra' disabilitato, 'Annulla filtri' assente
    await expect(l.filtra).toBeDisabled();
    await expect(l.annulla).toHaveCount(0);
    // expect: 'Inserisci modulo commessa' assente
    await expect(l.inserisci).toHaveCount(0);
  });

  test("Skeleton durante la verifica obbligatori", async ({ page }) => {
    const { anni, lista } = await mockAll(page);
    const l = locators(page);

    // 1. Ritardare la risposta di verifica con una promise controllata e aprire la pagina
    let rilascia!: () => void;
    const gate = new Promise<void>((resolve) => (rilascia = resolve));
    let chiamate = 0;
    await page.route(byPath(API.verifica), async (route) => {
      chiamate++;
      await gate;
      await route.fulfill({ status: 200, contentType: "application/json", body: "false" });
    });
    await page.goto(ROUTE);

    // expect: Heading NON visibile (Skeleton a tutta pagina)
    await expect.poll(() => chiamate).toBe(1);
    await expect(l.title).toHaveCount(0);
    // expect: Nessuna chiamata ad anni/lista finche' verifica non risponde
    expect(anni.n).toBe(0);
    expect(lista).toHaveLength(0);

    // 2. Rilasciare la risposta
    rilascia();

    // expect: Skeleton rimosso, heading visibile, lista caricata
    await expect(l.title).toBeVisible();
    await expect.poll(() => lista.length).toBe(1);
    await expect(l.rows).toHaveCount(24);
  });

  test("Dati di fatturazione mancanti: ModalRedirect (datiFatturazione=false)", async ({ page }) => {
    const { verifica, anni, lista } = await mockAll(page);
    const l = locators(page);

    // 1. Impostare mainState.datiFatturazione=false in globalStatePF e aprire la pagina
    await seedSession(page, { mainState: { datiFatturazione: false } });
    await page.goto(ROUTE);

    // expect: ModalRedirect con testo sui dati di fatturazione (prefisso: nel testo c'e' un doppio spazio)
    await expect(l.redirectModal).toBeVisible();
    // expect: Skeleton non presente, heading visibile (ma nascosto agli screen reader dal modale), griglia vuota
    await expect(page.getByRole("heading", { name: "Modulo commessa", exact: true, includeHidden: true })).toBeVisible();
    await expect(l.rows).toHaveCount(0);
    // expect: Nessuna chiamata a verifica, anni, lista
    expect(verifica.n).toBe(0);
    expect(anni.n).toBe(0);
    expect(lista).toHaveLength(0);
    // expect: Resto della pagina aria-hidden mentre il modale e' aperto
    await expect(l.title).toHaveCount(0);
  });

  test("Dati di fatturazione incompleti: datiFatturazioneNotCompleted=true", async ({ page }) => {
    const { verifica, anni, lista } = await mockAll(page);
    const l = locators(page);

    // 1. Impostare datiFatturazioneNotCompleted=true (datiFatturazione=true) e aprire la pagina
    await seedSession(page, { mainState: { datiFatturazione: true, datiFatturazioneNotCompleted: true } });
    await page.goto(ROUTE);

    // expect: Stesso ModalRedirect e stessa assenza di chiamate API
    await expect(l.redirectModal).toBeVisible();
    await expect(page.getByRole("heading", { name: "Modulo commessa", exact: true, includeHidden: true })).toBeVisible();
    await expect(l.rows).toHaveCount(0);
    expect(verifica.n).toBe(0);
    expect(anni.n).toBe(0);
    expect(lista).toHaveLength(0);
  });

  test("Caption con lista caricata correttamente", async ({ page }) => {
    await mockAll(page);

    // 1. Aprire la pagina con lista OK
    const l = await openPage(page);

    // expect: Testo 'N.B. il Modulo Commessa ... ogni mese' visibile
    await expect(l.captionOk).toBeVisible();
    await expect(page.getByText(CAPTION_OK)).toBeVisible();
    // expect: Testo di finestra chiusa assente
    await expect(l.captionKo).toHaveCount(0);
  });

  test("Caption con prima chiamata lista fallita e Skeleton iniziale", async ({ page }) => {
    await mockAll(page);
    const l = locators(page);

    // 1. Ritardare la lista, aprire la pagina
    let rilascia!: () => void;
    const gate = new Promise<void>((resolve) => (rilascia = resolve));
    let chiamate = 0;
    await page.route(byPath(API.lista), async (route) => {
      chiamate++;
      await gate;
      await route.fulfill({ status: 500, contentType: "application/json", body: "{}" });
    });
    await page.goto(ROUTE);

    // expect: Nessuna delle due caption visibile (Skeleton testuale) fino alla risposta
    // (con il modale 'Loading...' aperto l'app e' aria-hidden: heading con includeHidden)
    await expect(page.getByRole("heading", { name: "Modulo commessa", exact: true, includeHidden: true })).toBeVisible();
    await expect.poll(() => chiamate).toBe(1);
    await expect(l.captionOk).toHaveCount(0);
    await expect(l.captionKo).toHaveCount(0);

    // 2. Rispondere alla lista con 500
    rilascia();

    // expect: Caption di finestra chiusa
    await expect(l.captionKo).toBeVisible();
    await expect(page.getByText(CAPTION_KO)).toBeVisible();
    await expect(l.captionOk).toHaveCount(0);
    // expect: Griglia vuota
    await expect(l.rows).toHaveCount(0);
  });

  test("La caption viene impostata una sola volta (sentenseRef)", async ({ page }) => {
    await mockAll(page);
    const l = locators(page);
    const seleziona2026 = async () => {
      await l.anno.click();
      await page.getByRole("option", { name: "2026" }).click();
    };

    // 1. Prima lista 500, poi selezionare un anno e Filtra con lista OK
    const lista1 = await mockLista(page, undefined, (call) => (call === 1 ? 500 : 200));
    await openPage(page);
    await expect(l.captionKo).toBeVisible();
    await expect(l.rows).toHaveCount(0);
    await seleziona2026();
    await l.filtra.click();

    // expect: Griglia popolata ma la caption di finestra chiusa resta
    await expect.poll(() => lista1).toEqual(["", "2026"]);
    await expect(l.rows).toHaveCount(12);
    await expect(l.captionKo).toBeVisible();
    await expect(l.captionOk).toHaveCount(0);

    // 2. Caso inverso: prima lista OK, poi Filtra con lista 500
    await page.evaluate(() => localStorage.removeItem("filters"));
    const lista2 = await mockLista(page, undefined, (call) => (call === 1 ? 200 : 500));
    await page.goto(ROUTE);
    await expect(l.captionOk).toBeVisible();
    await expect(l.rows).toHaveCount(24);
    await seleziona2026();
    await l.filtra.click();

    // expect: Caption standard invariata, griglia svuotata
    await expect.poll(() => lista2).toEqual(["", "2026"]);
    await expect(l.rows).toHaveCount(0);
    await expect(l.captionOk).toBeVisible();
    await expect(l.captionKo).toHaveCount(0);
  });
});
