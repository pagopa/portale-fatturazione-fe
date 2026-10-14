## Test E2E (Playwright)
- Importare SEMPRE `test` ed `expect` da `tests/fixtures.ts`, mai da `@playwright/test`
- Non chiamare mai il backend reale: le API sono mockate tramite HAR in `utils/folder-name/`, se non sono mockate crea il mock
- Locator: preferire getByRole / getByLabel / getByTestId, mai selettori CSS o XPath
- Niente `waitForTimeout`: usare le assertion web-first (`await expect(...)`)
- Un file di test per area: titolo, filtri, grid, paginazione, persistenza-filtri
- I piani di test stanno in `specs/`, i test in `tests/folder-name/`