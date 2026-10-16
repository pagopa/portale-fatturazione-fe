// spec: specs/ente-moduloCommessaElenco.md (sezione 4)
// seed: tests/auth.setup.ts

import type { Page } from "@playwright/test";
import { test, expect } from "../../fixtures";
import {
  ERRORE_401, ERRORE_500, ROUTE, locators as baseLocators, makeAnno, makeModulo, mockAll, mockLista, openPage,
} from "../../utils/moduloCommessaElencoMock/moduloCommessaElencoMock";

const MESI = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

function griglia(page: Page) {
  return {
    ...baseLocators(page),
    headers: page.getByRole("columnheader"),
    riga: (mese: string, anno = 2026) => page.getByRole("row", { name: new RegExp(`^${mese}\\/${anno} `) }),
  };
}

test.describe("Griglia", () => {
  test("Intestazioni e assenza di paginazione", async ({ page }) => {
    await mockAll(page);

    // 1. Con lista popolata verificare getByRole('columnheader')
    const l = await openPage(page);
    await expect(l.rows).toHaveCount(24);

    // expect: Colonne in ordine, piu' la colonna freccia senza etichetta
    const nomi = [
      "Mese/Anno", "Stato", "Inserimento", "Data inserimento", "Data chiusura", "Tot. Digit.",
      "Tot. Digit. Int.", "Tot. AR.", "Tot. AR. Int.", "Tot. 890.", "Tot. Not.", "",
    ];
    await expect(griglia(page).headers).toHaveCount(nomi.length);
    for (const [i, nome] of nomi.entries()) {
      await expect(griglia(page).headers.nth(i)).toHaveAccessibleName(nome);
    }

    // expect: Nessun controllo di sort
    await expect(griglia(page).headers.getByRole("button")).toHaveCount(0);

    // expect: Nessun paginatore
    await expect(page.getByRole("button", { name: "Go to next page" })).toHaveCount(0);
    await expect(page.getByText("Rows per page")).toHaveCount(0);
  });

  test("Tutte le righe senza limite a 10", async ({ page }) => {
    // 1. Mockare 12 righe
    await mockAll(page, { moduli: makeAnno(2026) });
    let l = await openPage(page);

    // expect: Tutte le righe visibili (nessun troncamento a 10)
    await expect(l.rows).toHaveCount(12);

    // 1. Mockare 36 righe
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await mockAll(page, { moduli: [...makeAnno(2026), ...makeAnno(2025), ...makeAnno(2024)] });
    await page.reload();
    l = baseLocators(page);

    // expect: Tutte le 36 righe visibili contemporaneamente
    await expect(l.rows).toHaveCount(36);
    await expect(page.getByRole("button", { name: "Go to next page" })).toHaveCount(0);
  });

  test("Etichetta Mese/Anno", async ({ page }) => {
    await mockAll(page, { moduli: makeAnno(2026) });

    // 1. Leggere la colonna Mese/Anno per i 12 mesi di 2026
    const l = await openPage(page);
    await expect(l.rows).toHaveCount(12);

    // expect: Gennaio/2026 ... Dicembre/2026 (nome intero + '/' + anno)
    for (const [i, mese] of MESI.entries()) {
      await expect(l.rows.nth(i).getByRole("cell").first()).toHaveText(`${mese}/2026`);
    }
  });

  test("Icona e tooltip Stato per source", async ({ page }) => {
    await mockAll(page, { moduli: makeAnno(2026) });

    // 1. Righe con source obbligatorio, archiviato, facoltativo; passare il mouse sull'icona
    const l = await openPage(page);
    await expect(l.rows).toHaveCount(12);
    const g = griglia(page);

    // expect: Tooltip 'Obbligatorio', 'Archiviato', 'Facoltativo' (prima lettera maiuscola)
    const casi: [string, string][] = [["Gennaio", "Obbligatorio"], ["Febbraio", "Archiviato"], ["Marzo", "Facoltativo"]];
    for (const [mese, stato] of casi) {
      const icona = g.riga(mese).getByLabel(stato, { exact: true });
      await expect(icona).toBeVisible();
      await icona.hover();
      await expect(page.getByRole("tooltip", { name: stato })).toBeVisible();
    }
    // NB: i colori delle icone (#5BB0D5, #A2ADB8, #f7e7bc) non sono asseriti (solo testo del tooltip)
  });

  test("Chip Inserimento", async ({ page }) => {
    // 1. Righe con totaleNotifiche null e valorizzato
    await mockAll(page, {
      moduli: [makeModulo(2026, 1), makeModulo(2026, 4, { totaleNotifiche: null, totaleNotificheDigitaleNaz: null })],
    });
    const l = await openPage(page);
    await expect(l.rows).toHaveCount(2);
    const g = griglia(page);

    // expect: Chip 'Non inserito' se null, 'Inserito' altrimenti
    await expect(g.riga("Gennaio").getByText("Inserito", { exact: true })).toBeVisible();
    await expect(g.riga("Gennaio").getByText("Non inserito")).toHaveCount(0);
    await expect(g.riga("Aprile").getByText("Non inserito", { exact: true })).toBeVisible();
  });

  test("Data chiusura per source", async ({ page }) => {
    // 1. Righe archiviato, facoltativo, obbligatorio con dataChiusura, obbligatorio senza dataChiusura
    await mockAll(page, {
      moduli: [
        makeModulo(2026, 5, { source: "obbligatorio", dataChiusura: "2026-05-15T23:59:59" }),
        makeModulo(2026, 2),
        makeModulo(2026, 3),
        makeModulo(2026, 4, { dataChiusura: null }),
      ],
    });
    const l = await openPage(page);
    await expect(l.rows).toHaveCount(4);
    const g = griglia(page);

    // expect: archiviato '--'
    await expect(g.riga("Febbraio").getByRole("cell").nth(4)).toHaveText("--");
    // expect: facoltativo 'TBD'
    await expect(g.riga("Marzo").getByRole("cell").nth(4)).toHaveText("TBD");
    // expect: obbligatorio con data ISO -> '15-Mag-2026'
    await expect(g.riga("Maggio").getByRole("cell").nth(4)).toHaveText("15-Mag-2026");
    // expect: obbligatorio senza data '--'
    await expect(g.riga("Aprile").getByRole("cell").nth(4)).toHaveText("--");
  });

  test("Data inserimento e totali, anche con valori null", async ({ page }) => {
    // 1. Righe Inserito con tutti i totali e riga Non inserito con totali null
    await mockAll(page, {
      moduli: [
        makeModulo(2026, 1),
        makeModulo(2026, 4, { totaleNotifiche: null, totaleNotificheDigitaleNaz: null }),
      ],
    });
    const l = await openPage(page);
    await expect(l.rows).toHaveCount(2);
    const g = griglia(page);

    // expect: Totali mostrati nelle colonne corrette
    await expect(g.riga("Gennaio")).toHaveAccessibleName("Gennaio/2026 Obbligatorio Inserito 05-Gen-2026 15-Gen-2026 100 10 20 2 5 137");
    const celle = g.riga("Gennaio").getByRole("cell");
    for (const [i, v] of ["Gennaio/2026", "Obbligatorio", "Inserito", "05-Gen-2026", "15-Gen-2026", "100", "10", "20", "2", "5", "137"].entries()) {
      // la cella Stato contiene solo un'icona: il valore e' il nome accessibile (aria-label del tooltip)
      if (i === 1) await expect(celle.nth(i)).toHaveAccessibleName(v);
      else await expect(celle.nth(i)).toHaveText(v);
    }

    // expect: Riga Non inserito: segnaposto '--' senza 'null'/'NaN'
    await expect(g.riga("Aprile")).toHaveAccessibleName("Aprile/2026 Obbligatorio Non inserito 05-Apr-2026 15-Apr-2026 -- 10 20 2 5 --");
    await expect(page.getByText("null")).toHaveCount(0);
    await expect(page.getByText("NaN")).toHaveCount(0);
  });

  test("Lista vuota []", async ({ page }) => {
    // 1. Mockare lista []
    await mockAll(page, { moduli: [] });
    const l = await openPage(page);

    // expect: Caption standard visibile (lista risposta 200)
    await expect(l.captionOk).toBeVisible();
    await expect(l.loading).toBeHidden();

    // expect: Intestazioni presenti, nessuna riga
    await expect(griglia(page).headers).toHaveCount(12);
    await expect(l.rows).toHaveCount(0);

    // expect: Nessun testo di lista vuota (sentenseEmpty non passato)
    await expect(page.getByText(/Non sono presenti/i)).toHaveCount(0);
  });

  test("Errore 500 sulla lista iniziale", async ({ page }) => {
    // 1. Mockare lista 500 (verifica true)
    await mockAll(page, { verifica: true });
    await mockLista(page, undefined, 500);
    const l = await openPage(page);

    // expect: Griglia vuota, errore gestito da manageError
    await expect(page.getByText(ERRORE_500)).toBeVisible();
    await expect(l.rows).toHaveCount(0);

    // expect: 'Loading...' chiuso
    await expect(l.loading).toBeHidden();

    // expect: Caption di finestra chiusa
    await expect(l.captionKo).toBeVisible();

    // expect: Select anni popolata, pulsante Inserisci presente se verifica true
    await expect(l.inserisci).toBeVisible();
    await l.anno.click();
    await expect(page.getByRole("option")).toHaveCount(3);
  });

  test("Errore 404 e 401 sulla lista", async ({ page }) => {
    // 1. Mockare lista 404
    await mockAll(page);
    await mockLista(page, undefined, 404);
    const l = await openPage(page);

    // expect: Griglia vuota, nessun crash
    // NB: il testo dell'errore 404 non e' noto (da confermare): si asserisce solo griglia vuota e pagina integra
    await expect(l.loading).toBeHidden();
    await expect(l.rows).toHaveCount(0);
    await expect(l.title).toBeVisible();

    // 1. Mockare lista 401
    await mockLista(page, undefined, 401);
    await page.reload();

    // expect: Griglia vuota, errore del layout
    await expect(page.getByText(ERRORE_401)).toBeVisible();
    await expect(l.rows).toHaveCount(0);
  });

  test("Caricamento lento", async ({ page }) => {
    // 1. Ritardare la lista con promise controllata
    await mockAll(page, { moduli: makeAnno(2026) });
    let rilascia: () => void = () => {};
    const gate = new Promise<void>((r) => { rilascia = r; });
    await page.route(
      (url) => /\/api\/v2\/modulocommessa\/lista$/.test(url.pathname),
      async (route) => {
        await gate;
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(makeAnno(2026)) });
      },
    );
    await page.goto(ROUTE);
    const l = baseLocators(page);

    // expect: 'Loading...' visibile e bloccante (resto aria-hidden) fino alla risposta
    await expect(l.loading).toBeVisible();
    await expect(l.title).toBeHidden();
    await expect(l.rows).toHaveCount(0);

    rilascia();

    // expect: Dopo la risposta il modale si chiude e le righe compaiono
    await expect(l.loading).toBeHidden();
    await expect(l.title).toBeVisible();
    await expect(l.rows).toHaveCount(12);
  });

  test("Riga con valori limite sui mesi", async ({ page }) => {
    // 1. Mockare meseValidita 1, 9, 10, 12
    await mockAll(page, { moduli: [1, 9, 10, 12].map((m) => makeModulo(2026, m)) });
    const l = await openPage(page);
    await expect(l.rows).toHaveCount(4);

    // expect: Etichette Gennaio, Settembre, Ottobre, Dicembre corrette
    for (const mese of ["Gennaio", "Settembre", "Ottobre", "Dicembre"]) {
      await expect(page.getByRole("cell", { name: `${mese}/2026`, exact: true })).toBeVisible();
    }
  });
});
