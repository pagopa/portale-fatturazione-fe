// spec: specs/dettaglioRelEmessiSospesi.md (sezione 10)
// seed: tests/auth.setup.ts

import { test, expect } from "../../fixtures";
import { mockAll } from "../../utils/docemessi/docEmessiMock";
import {
  API, SECTIONS, detailUrl, locators, makeRel, mockDettaglio, mockLogFirmato, seedTipoContratto,
} from "../../utils/dettaglioRelEmessiSospesi/dettaglioMock";
import type { Section } from "../../utils/dettaglioRelEmessiSospesi/dettaglioMock";

const voceRel = /Regolare esecuzione/i;

test.describe("Sessione e rotte miste", () => {
  test("Rilevamento sezione dall'URL", async ({ page }) => {
    await seedTipoContratto(page, 2);
    const l = locators(page);
    const sezioni: Section[] = ["rel", "documentiemessi", "documentisospesi"];
    const mocks = {
      rel: await mockDettaglio(page, "rel", makeRel()),
      documentiemessi: await mockDettaglio(page, "documentiemessi", makeRel()),
      documentisospesi: await mockDettaglio(page, "documentisospesi", makeRel()),
    };
    await mockLogFirmato(page);

    // 1. Aprire /ente/fatturapdf/rel/1, /ente/fatturapdf/documentiemessi/1 e /ente/fatturapdf/documentisospesi/1
    for (const [i, section] of sezioni.entries()) {
      await page.goto(detailUrl(section, "123"));

      // expect: Ogni URL chiama solo l'API della propria sezione e usa label e back path corretti
      await expect(l.card("Dati di Fatturazione")).toBeVisible();
      await expect(l.breadcrumb(section)).toBeVisible();
      for (const altra of sezioni) {
        expect(mocks[altra].calls, `${section}: chiamate a ${altra}`).toBe(sezioni.indexOf(altra) <= i ? 1 : 0);
      }

      await l.indietro.click();
      await expect(page).toHaveURL(SECTIONS[section].backUrl);
    }
  });

  test("Un ente con idTipoContratto 1 non deve accedere alla REL dal menu", async ({ page }) => {
    await mockAll(page);
    const nav = page.getByRole("navigation");

    await test.step("idTipoContratto 1", async () => {
      // 1. Sessione idTipoContratto 1: aprire /ente/docemessi
      await seedTipoContratto(page, 1);
      await page.goto("/ente/docemessi");

      // expect: La voce 'Regolare Esecuzione' non e' nel menu laterale
      await expect(nav.getByRole("button", { name: "Dati di fatturazione" })).toBeVisible();
      await expect(nav.getByRole("button", { name: voceRel })).toHaveCount(0);
    });

    await test.step("idTipoContratto 2", async () => {
      // 2. Sessione idTipoContratto 2
      await seedTipoContratto(page, 2);
      await page.goto("/ente/docemessi");

      // expect: La voce 'Regolare Esecuzione' e' presente
      await expect(nav.getByRole("button", { name: voceRel })).toBeVisible();
    });
  });

  test("Navigazione dal menu dal dettaglio", async ({ page }) => {
    await seedTipoContratto(page, 2);
    const l = locators(page);
    const dettaglio = await mockDettaglio(page, "documentiemessi", makeRel());
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(detailUrl("documentiemessi"));
    await expect(l.card("Dati di Fatturazione")).toBeVisible();

    // 1. Dal dettaglio cliccare una voce di menu diversa (es. 'Modulo commessa')
    await page.getByRole("navigation").getByRole("button", { name: "Modulo commessa", exact: true }).click();

    // expect: Si naviga senza modali
    await expect(page).toHaveURL(/\/ente\/modulicommessa$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(l.downloading).toHaveCount(0);

    // expect: lo stato di download/upload non persiste tornando indietro
    await page.goBack();
    await expect(page).toHaveURL(/\/ente\/fatturapdf\/documentiemessi\/123$/);
    await expect(l.card("Dati di Fatturazione")).toBeVisible();
    await expect(l.downloading).toHaveCount(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(dettaglio.calls).toBeGreaterThanOrEqual(1);
    expect(errors).toEqual([]);
  });

  test("Cambio sezione senza ricaricare", async ({ page }) => {
    // Bug 20: useEffect([]) in usePageRelDocPdf non reagisce al cambio di :id
    test.fail(true, "Bug 20: il dettaglio viene caricato solo al mount, cambiando :id i dati restano quelli vecchi");
    await seedTipoContratto(page, 2);
    const l = locators(page);
    const richieste: unknown[] = [];
    await page.route((url) => url.pathname.endsWith(API.dettaglioEmessi), (route, request) => {
      const body = request.postDataJSON() as { Idfattura?: string | number };
      richieste.push(body.Idfattura);
      const secondo = String(body.Idfattura) === "456";
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(makeRel({ idTestata: String(body.Idfattura), anno: secondo ? 2023 : 2024 })),
      });
    });
    await page.goto(detailUrl("documentiemessi", "123"));
    await expect(l.card("Dati di Fatturazione")).toBeVisible();
    await expect(l.value("Anno")).toHaveText("2024");

    // 1. Dal dettaglio EMESSI navigare (client-side) a un altro id
    await page.evaluate((url) => {
      window.history.pushState({}, "", url);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }, detailUrl("documentiemessi", "456"));

    // expect: Il nuovo id viene caricato
    await expect(page).toHaveURL(/\/documentiemessi\/456$/);
    await expect(l.value("Anno")).toHaveText("2023");
    expect(richieste.map(String)).toEqual(["123", "456"]);
  });
});
