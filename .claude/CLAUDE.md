## Tracciamento CLAUDE (FE-AI_Usage)
Ad ogni utilizzo dell'ai(claudeCode) esegui le istruzioni presenti nel file [instructions/FE AI_Usage.md](instructions/FE%20AI_Usage.md)


## Test E2E (Playwright)
- Importare SEMPRE `test` ed `expect` da `tests/fixtures.ts`, mai da `@playwright/test`
- Non chiamare mai il backend reale: le API sono mockate tramite HAR in `utils/folder-name/`, se non sono mockate crea il mock
- Locator: preferire getByRole / getByLabel / getByTestId, mai selettori CSS o XPath
- Niente `waitForTimeout`: usare le assertion web-first (`await expect(...)`)
- Un file di test per area: titolo, filtri, grid, paginazione, persistenza-filtri
- I piani di test stanno in `specs/`, i test in `tests/folder-name/`
- Pagine testate come ENTE e come ADMIN (test in `tests/condivisi/`):
- [Dati di Fatturazione](../src/pages/prod_pn/areaPersonaleUtenteEnte.tsx) → spec: [specs/datiDiFatturazione.md](../specs/datiDiFatturazione.md)
- [Notifiche](../src/pages/prod_pn/reportDettaglio.tsx) → spec: [specs/notifiche.md](../specs/notifiche.md)
- [Regolare Esecuzione](../src/pages/prod_pn/relUtPa.tsx) → spec: [specs/regolareEsecuzione.md](../specs/regolareEsecuzione.md)
- [Dettaglio Regolare Esecuzione - Documenti Emesssi - Documenti Sospesi](../src/pages/prod_pn/RelPdfUtPa.tsx) → spec: [specs/dettaglioRelEmessiSosapesi.md](../specs/dettaglioRelEmessiSospesi.md), la pagina di dettaglio è utilizzata come dettaglio delle seguenti sezioni "Regolare Esecuzione", "Documenti Contabili Emessi", "Documenti Contabili Sospesi".
- [DettaglioModuloCommessa](../src/pages/prod_pn/moduloCommessaPdf.tsx) → spec: [specs/moduloCommessaPdf.md](../specs/moduloCommessaPdf.md)
- Tutte le altre pagine: test in `tests/ente/` → eseguiti solo come ENTE
- Il ruolo corrente è nella fixture `role` ('ente' | 'admin'): usarla per le asserzioni che cambiano tra ruoli
- [Regolare Esecuzione](../src/pages/prod_pn/relUtPa.tsx) la sezione è visibile solo per gli enti che hanno idTipoContratto === 2
- [API KEY](../src/pages/relUtPa.tsx) lato ente è visibile in base alla response /api/apikey che va a settare i valori all'interno dello globalState/mainData
- Mai fare login nei test: è gestito da `auth.setup.ts`
- Alla creazione del file riguardanti le specifiche ,all'interno della folder [specs/], bisogna aggiugere alla fine del file tutti i possibili bug trovati, come è stato fatto nel file [/spec/areaPersonaleUtenteEnte.md]
