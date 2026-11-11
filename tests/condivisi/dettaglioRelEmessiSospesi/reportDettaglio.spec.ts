// spec: specs/dettaglioRelEmessiSospesi.md (sezione 5)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import {
  RAGIONE_SOCIALE, SECTIONS, customId, makeRel, mockReport, openDettaglio, seedTipoContratto, type Section,
} from "../../utils/dettaglioRelEmessiSospesi/dettaglioMock";

const SECTION_LIST: Section[] = ["rel", "documentiemessi", "documentisospesi"];

const MSG_404: Record<Section, string> = {
  rel: "Il report di dettaglio notifiche Regolare Esecuzione non è disponibile. Contattare l'assistenza",
  documentiemessi: "Il report di dettaglio notifiche Documenti Emessi non è disponibile. Contattare l'assistenza",
  documentisospesi: "Il report di dettaglio notifiche Documenti Sospesi non è disponibile. Contattare l'assistenza",
};

test.describe("Report di dettaglio notifiche", () => {
  test.beforeEach(async ({ page }) => {
    await seedTipoContratto(page, 2);
  });

  test("Etichetta del pulsante report per sezione", async ({ page }) => {
    // 1. Aprire il dettaglio PRIMO SALDO nelle tre sezioni
    for (const section of SECTION_LIST) {
      await test.step(section, async () => {
        const { l } = await openDettaglio(page, section, makeRel({ tipologiaFattura: "PRIMO SALDO" }));

        // expect: etichetta specifica della sezione, pulsante abilitato
        await expect(l.downloadReport(section)).toBeVisible();
        await expect(l.downloadReport(section)).toHaveText(SECTIONS[section].labelReport);
        await expect(l.downloadReport(section)).toBeEnabled();
        await page.unrouteAll({ behavior: "ignoreErrors" });
      });
    }
  });

  test("Visibilita' per tipologia (showButtonDownloadReport)", async ({ page }) => {
    // 1. EMESSI e SOSPESI con PRIMO SALDO, SECONDO SALDO, VAR. SEMESTRALE, SEM. SOSPESI
    for (const section of ["documentiemessi", "documentisospesi"] as Section[]) {
      for (const tipologiaFattura of ["PRIMO SALDO", "SECONDO SALDO", "VAR. SEMESTRALE", "SEM. SOSPESI"]) {
        await test.step(`${section} ${tipologiaFattura}`, async () => {
          const { l } = await openDettaglio(page, section, makeRel({ tipologiaFattura }));
          // expect: pulsante report visibile
          await expect(l.downloadReport(section)).toBeVisible();
          await page.unrouteAll({ behavior: "ignoreErrors" });
        });
      }

      // 2. EMESSI e SOSPESI con ACCONTO e ANTICIPO
      for (const tipologiaFattura of ["ACCONTO", "ANTICIPO"]) {
        await test.step(`${section} ${tipologiaFattura}`, async () => {
          const { l } = await openDettaglio(page, section, makeRel({ tipologiaFattura }));
          // expect: pulsante report assente
          await expect(l.downloadReport(section)).toHaveCount(0);
          await page.unrouteAll({ behavior: "ignoreErrors" });
        });
      }
    }

    // 3. REL con ACCONTO (idTipoContratto 2)
    const { l } = await openDettaglio(page, "rel", makeRel({ tipologiaFattura: "ACCONTO" }));
    // expect: pulsante report visibile
    await expect(l.downloadReport("rel")).toBeVisible();
  });

  test("Visibilita' report REL con ANTICIPO", async ({ page }) => {
    // Bug 1: precedenza operatori `a && b || c` nasconde il report anche in REL con ANTICIPO
    test.fail(true, "Bug 1: showButtonDownloadReport usa `(doc && ACCONTO) || ANTICIPO`, il report REL ANTICIPO e' nascosto");

    // 4. REL con ANTICIPO
    const { l } = await openDettaglio(page, "rel", makeRel({ tipologiaFattura: "ANTICIPO" }));

    // expect: comportamento atteso: pulsante report visibile in REL
    await expect(l.downloadReport("rel")).toBeVisible();
  });

  test("Download report REL (200)", async ({ page }) => {
    const rel = makeRel({ mese: 2, anno: 2024 });
    const report = await mockReport(page, "rel", rel);
    const { l } = await openDettaglio(page, "rel", rel);

    // 1. Mock GET /api/rel/ente/righe/<id> con ritardo e risposta; cliccare il pulsante e attendere l'evento download
    const downloadPromise = page.waitForEvent("download");
    await l.downloadReport("rel").click();

    // expect: compare ModalLoading 'Downloading...' durante la chiamata
    await expect(l.downloading).toBeVisible();
    const download = await downloadPromise;

    // expect: una GET /api/rel/ente/righe/<idTestata>?nonce=...
    expect(report.calls).toBe(1);
    expect(report.requests[0].url).toMatch(/\/api\/rel\/ente\/righe\/123\?nonce=/);

    // expect: nome file '<ragioneSociale>_<mese>_<anno>.csv'
    expect(download.suggestedFilename()).toBe(`${RAGIONE_SOCIALE}_2_2024.csv`);

    // expect: il modale si chiude e il pulsante resta abilitato
    await expect(l.downloading).toBeHidden();
    await expect(l.downloadReport("rel")).toBeEnabled();
  });

  test("Download report EMESSI usa customId e endpoint REL", async ({ page }) => {
    const rel = makeRel({ tipologiaFattura: "PRIMO SALDO", idEnte: "ENTE1", idContratto: "CTR1", anno: 2024, mese: 2 });
    const report = await mockReport(page, "documentiemessi", rel);
    const { l } = await openDettaglio(page, "documentiemessi", rel);

    // 1. Mock tipologia 'PRIMO SALDO', idEnte 'ENTE1', idContratto 'CTR1', anno '2024', mese '2'; cliccare il report
    const downloadPromise = page.waitForEvent("download");
    await l.downloadReport("documentiemessi").click();

    // expect: GET /api/rel/ente/righe/ENTE1_CTR1_PRIMO-SALDO_2024_2 (spazi sostituiti da '-')
    await downloadPromise;
    expect(customId(rel)).toBe("ENTE1_CTR1_PRIMO-SALDO_2024_2");
    expect(report.calls).toBe(1);
    expect(new URL(report.requests[0].url).pathname).toMatch(/\/api\/rel\/ente\/righe\/ENTE1_CTR1_PRIMO-SALDO_2024_2$/);
  });

  test("Download report SOSPESI usa endpoint sospese", async ({ page }) => {
    const rel = makeRel({ tipologiaFattura: "SECONDO SALDO" });
    const report = await mockReport(page, "documentisospesi", rel);
    const { l } = await openDettaglio(page, "documentisospesi", rel);

    // 1. Cliccare il report nel dettaglio SOSPESI con tipologia 'SECONDO SALDO'
    const downloadPromise = page.waitForEvent("download");
    await l.downloadReport("documentisospesi").click();

    // expect: GET /api/rel/ente/sospese/righe/<idEnte>_<idContratto>_SECONDO-SALDO_<anno>_<mese>
    await downloadPromise;
    expect(report.calls).toBe(1);
    expect(new URL(report.requests[0].url).pathname).toMatch(
      new RegExp(`/api/rel/ente/sospese/righe/${rel.idEnte}_${rel.idContratto}_SECONDO-SALDO_${rel.anno}_${rel.mese}$`),
    );
  });

  test("Report non disponibile (404) per ciascuna sezione", async ({ page }) => {
    // 1. Mockare il report con 404 e cliccare
    for (const section of SECTION_LIST) {
      await test.step(section, async () => {
        const rel = makeRel({ tipologiaFattura: "PRIMO SALDO" });
        await mockReport(page, section, rel, { status: 404 });
        const { l } = await openDettaglio(page, section, rel);
        await l.downloadReport(section).click();

        // expect: messaggio di errore specifico della sezione
        await expect(page.getByText(MSG_404[section])).toBeVisible();
        // expect: ModalLoading chiuso
        await expect(l.downloading).toBeHidden();
        // expect: pulsante report disabilitato
        await expect(l.downloadReport(section)).toBeDisabled();
        await page.unrouteAll({ behavior: "ignoreErrors" });
      });
    }
  });

  test("Errore 500/401/rete sul report", async ({ page }) => {
    // 1. Mockare il report con 500, poi 401 e poi route.abort
    for (const mode of [500, 401, "abort"] as const) {
      await test.step(String(mode), async () => {
        const rel = makeRel({ tipologiaFattura: "PRIMO SALDO" });
        const report = await mockReport(page, "documentiemessi", rel, mode === "abort" ? {} : { status: mode });
        if (mode === "abort") {
          await page.route((url) => url.pathname.includes("/api/rel/ente/righe/"), (route) => route.abort());
        }
        const { l } = await openDettaglio(page, "documentiemessi", rel);
        await l.downloadReport("documentiemessi").click();

        // expect: stesso messaggio 'report non disponibile' e pulsante disabilitato
        await expect(page.getByText(MSG_404.documentiemessi)).toBeVisible();
        await expect(l.downloading).toBeHidden();
        await expect(l.downloadReport("documentiemessi")).toBeDisabled();
        if (mode !== "abort") expect(report.calls).toBe(1);
        await page.unrouteAll({ behavior: "ignoreErrors" });
      });
    }
  });

  test("Doppio click sul report", async ({ page }) => {
    const rel = makeRel();
    const report = await mockReport(page, "rel", rel, { delayMs: 1000 });
    const { l } = await openDettaglio(page, "rel", rel);

    // 1. Mock con ritardo e dblclick sul pulsante
    const downloadPromise = page.waitForEvent("download");
    await l.downloadReport("rel").dblclick({ noWaitAfter: true }).catch(() => undefined);
    await downloadPromise;

    // expect: una sola GET (il ModalLoading blocca il secondo click)
    expect(report.calls).toBe(1);
  });

  test("Report con tipologiaFattura null", async ({ page }) => {
    test.fixme(true, "Non verificabile dal vivo: con tipologiaFattura null il render va in TypeError (toUpperCase) prima di mostrare il pulsante (bug 2)");

    // 1. EMESSI con tipologiaFattura null
    const rel = makeRel({ tipologiaFattura: null });
    const report = await mockReport(page, "documentiemessi", rel);
    const { l } = await openDettaglio(page, "documentiemessi", rel);
    await l.downloadReport("documentiemessi").click();

    // expect: comportamento corretto: nessun messaggio 'report non disponibile' fuorviante
    await expect(page.getByText(MSG_404.documentiemessi)).toBeHidden();
    expect(report.calls).toBeLessThanOrEqual(1);
  });
});
