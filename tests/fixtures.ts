import { test as base, expect } from "@playwright/test";

// Backend del portale (VITE_APP_URL) e login Selfcare (VITE_APP_REDIRECT)
export const API_HOST = /https:\/\/api\.[a-z.]*portalefatturazione\.pagopa\.it\/api\//;
export const SELFCARE_URL = /https:\/\/(uat\.)?selfcare\.pagopa\.it\//;

// Risposte di default per le API comuni a tutte le pagine (auth, header, banner).
// I mock specifici di un test, registrati con page.route, hanno la precedenza su questi.
const defaultResponses: { path: RegExp; body: unknown }[] = [
  { path: /\/api\/auth\/profilo$/, body: {} },
  { path: /\/api\/apikey$/, body: [] },
  { path: /\/api\/info-banner$/, body: { visibile: false } },
  { path: /\/api\/notifiche\/richiesta\/count$/, body: 0 },
  { path: /\/api\/notifiche\/recapitista\/richiesta\/count$/, body: 0 },
  { path: /\/api\/notifiche\/richiesta\/verifica$/, body: {} },
];

export const test = base.extend<{ unmockedApi: string[] }>({
  // Nessun test chiama il backend reale: le API non mockate rispondono 404 e vengono registrate
  unmockedApi: [
    async ({ context }, use, testInfo) => {
      const unmocked: string[] = [];
      await context.route(SELFCARE_URL, (route) =>
        route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>selfcare</body></html>" }),
      );
      await context.route(API_HOST, (route) => {
        const { pathname } = new URL(route.request().url());
        const known = defaultResponses.find((r) => r.path.test(pathname));
        if (known) {
          return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(known.body) });
        }
        unmocked.push(`${route.request().method()} ${pathname}`);
        return route.fulfill({ status: 404, contentType: "application/json", body: "{}" });
      });
      await use(unmocked);
      if (unmocked.length > 0) {
        testInfo.annotations.push({ type: "unmocked-api", description: unmocked.join(", ") });
      }
    },
    { auto: true },
  ],
});

export { expect };
