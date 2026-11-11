# Piano di test - Admin / Invio a SAP (/send/inviofatture)

## Application Overview

Piano di test per la pagina "Invio a SAP" di portale-fatturazione-fe (componente src/page/prod_pn/invioFatture.tsx, rotta PathPf.JSON_TO_SAP = /send/inviofatture, PathRoutePf.JSON_TO_SAP = inviofatture). Voce di menu: SideNavSend > Fatturazione > Gestione Fatture > "Invio a SAP". Il dettaglio (src/page/prod_pn/invioFattureDetails.tsx, /send/inviofatturedettaglio/:id) e' fuori scope.

RUOLO E COLLOCAZIONE DEI TEST. La pagina NON e' nell'elenco delle pagine condivise ENTE/ADMIN di CLAUDE.md. Dal router (src/router/route.tsx) la rotta vive sotto il ramo "send" protetto da authVerifyIsLoggedSend (src/loaderRoutes/loaderAuthVerify.ts): raggiungibile SOLO dall'ADMIN PagoPA (profilo.auth === 'PAGOPA', prodotto 'prod-pn'). Un profilo auth 'SELFCARE' (ENTE) viene reindirizzato a /ente/datidifatturazione; un profilo PAGOPA con prodotto 'prod-pagopa' viene reindirizzato a /pn/anagraficapsp (PathPf.ANAGRAFICAPSP). I test stanno quindi in tests/admin/invioFatture/ (nuova cartella: non esistono test admin-only) e NON in tests/condivisi/ ne' in tests/ente/. La fixture `role` citata in CLAUDE.md non e' presente in tests/fixtures.ts: non serve perche' la pagina e' solo admin.

SESSIONE ADMIN (prerequisito, da creare). tests/auth.setup.ts scrive solo la sessione ENTE (tests/playwright/.auth/user.json, helper tests/utils/ente/sessioneEnte.ts, profilo auth 'SELFCARE'). Con quella sessione /send/inviofatture rimanda all'area ente. Per questi test creare: (a) tests/utils/admin/sessioneAdmin.ts con globalStatePFAdmin() (stessa forma di globalStatePFEnte ma profilo { auth:'PAGOPA', prodotto:'prod-pn', ruolo:'R/W', profilo:'PA', jwt/nonce fittizi, idEnte:'' } e mainState.prodotti non vuoto, es. [{ prodotto:'prod-pn', ... }]); (b) in auth.setup.ts un secondo setup che scrive tests/playwright/.auth/admin.json (nessuna chiamata al backend, nessun login nei test); (c) nei test `test.use({ storageState: 'tests/playwright/.auth/admin.json' })`. Il login non va mai fatto nei test.

API DA MOCKARE (tests/fixtures.ts risponde 404 e annota 'unmocked-api' alle API non mockate; i mock di default coprono solo auth/profilo, apikey, info-banner, notifiche/*/count, notifiche/richiesta/verifica). Mock specifici con page.route; convenzione del repo: helper TypeScript in tests/utils/<area>Mock/ (HAR in tests/hars/ solo se si registra un flusso reale). Nuovo helper: tests/utils/invioFattureMock/invioFattureMock.ts con mockAll(page, opzioni), openPage(page), locators(page), savedFilters(page) (legge localStorage 'filtersNested_1'), seedFilters(page, ...).
 1. GET /api/fatture/invio/sap/multiplo?nonce=... (getListaJsonFatturePagoPa) - lista righe { tipologiaFattura, statoInvio, numeroFatture, annoRiferimento, meseRiferimento, importo, fatture[] } - DA CREARE. Dataset base: righe 2026 con statoInvio 0 (Da inviare), 2 (Elaborazione), 3 (Inviate), 4 (Re-Inviata), tipologie ANTICIPO, ACCONTO, PRIMO SALDO, SECONDO SALDO, VAR. SEMESTRALE, SEM. SOSPESI, piu' righe 2025/2027 (che il codice scarta) e un dataset >10 righe 2026.
 2. POST /api/fatture/invio/sap/multiplo/periodo?nonce=... (sendListaJsonFatturePagoPa, dettaglio fatture di un periodo, body { annoRiferimento, meseRiferimento, tipologiaFattura }) - risposta array di { idFattura, tipologiaFattura, idEnte, ragioneSociale, annoRiferimento, meseRiferimento, importo, dataFattura, dataGenerazione, ... } - DA CREARE (con variante >10 elementi per la paginazione del collapse, e 500).
 3. POST /api/fatture/pagopa/non-inviate/report?nonce=... (downloadReportRelNonFatturate, usa fetch non axios, body { tipologiaFattura: null | string[] }) - risposta binaria application/zip (200) e varianti 404/500 - DA CREARE.
 4. PUT /api/fatture/invio/sap/multiplo?nonce=... (invioListaJsonFatturePagoPa): oggi NON e' raggiungibile dalla UI (vedi bug 3). Da mockare comunque (200/500) e registrare le chiamate, per documentare che non parte mai; i test sul comportamento atteso dopo l'invio vanno scritti come test.fail()/test.fixme.
 Shell dell'admin: eventuali chiamate di header/side nav (es. messaggi, info-banner) non mockate rispondono 404 e vengono annotate dalla fixture; aggiungere un mock vuoto se disturbano.

STRUTTURA DELLA PAGINA (da codice). NavigatorHeader ("Documenti Contabili Emessi/" + "Invio a SAP", backPath PathPf.FATTURAZIONE). Filtri (MainFilter): "Anno" (select con 2025/2026/2027, default 2026), "Mese" (select senza opzioni, arrayMonths sempre vuoto), "Tipologia Fattura" (multiselect con checkbox: 'Tutte' + tipologie uniche ricavate dalla response in Title Case, ordine ORDER), "Tipologia Invio" (select: 'Tutte' id 3 default, 'Re-inviate' id 1). Pulsante "Filtra" (onButtonFiltra fa solo console.log), "Annulla filtri" nascosto (statusAnnulla='hidden'). ActionTopGrid: contatore "N Selezionate" (se N>0) e pulsanti "Download Fatture Re-inviate" (disabilitato se Tipologia Invio = Tutte) e "Download Risultati" (disabilitato se lista vuota). GridCustom con colonne: checkbox, espandi riga (aria-label 'expand row'), Tipologia Fattura (cliccabile), Stato Invio (chip con tooltip: Da inviare / Elaborazione / Inviate / Re-Inviata), Numero Fatture, Anno Riferimento, Mese Riferimento, Importo. Riga espansa "Dettaglio Fatture": filtri "Ragione Sociale", "Numero Fattura", "Data Fattura" (debounce 2000 ms, minimo 3 caratteri), pulsante "Generazione Json" (abilitato solo con selezione valida) e tabella con colonne checkbox, N. Fattura, T. Fattura, Stato Invio, Ragione Sociale, Importo, FK ID Doc., D. Fat., D. Ultima Gen., File JSON (icona che copia il nome file, snackbar 'Nome del file copiato!'), Date Invio (apre dialog "Storico Invio"), con paginazione client-side a 10 righe. Modale "Fatture Selezionate" (larghezza 1200px, icona di chiusura, contatore, colonne Ragione Sociale/Anno Riferimento/Mese Riferimento/Tipologia Fattura/N. Invio e, solo se almeno una fattura ha statoInvio !== 0, N. Doc. Di Storno e Nota). Dialog "Storico Invio" (DialogInfo + DilogContentList). Loader modali: 'Loading...' e 'Downloading...'.

COMPORTAMENTI SPECIFICI DA CONOSCERE PRIMA DI SCRIVERE I TEST (tutti derivati dal codice): (1) getLista antepone SEMPRE due righe fittizie ("idFat":"mock": PRIMO SALDO 6 fatture e SECONDO SALDO 1 fattura, anno 2026 mese 12, statoInvio 3) alle righe reali dell'anno 2026 e fa slice(0,10): la lista mostra al massimo 10 righe, le prime due sono mock; le righe 2025/2027 non compaiono mai. (2) Le righe mock non chiamano l'API di dettaglio ma usano le fatture hardcoded (6 + 1, stati 3 e 4). (3) Le righe reali, all'espansione, chiamano POST .../multiplo/periodo e ricevono statoInvio e fileJson ('FatturePagoPa_01012026_1230.json' se statoInvio !== 0, altrimenti '--') ereditati dalla riga padre. (4) Si possono selezionare solo fatture dello stesso gruppo anno/mese/tipologia; le righe con statoInvio 2 hanno checkbox disabilitata. (5) Filtra/Annulla non fanno nulla; qualunque cambio di filtro (Anno, Tipologia Fattura) svuota la lista (clearOnChangeFilter) senza ricaricarla. (6) La pagina non ha un pulsante di invio: onButtonInvia/invioListaJsonFatturePagoPa non e' mai richiamata.

CONVENZIONI DEL PIANO: i nomi accessibili sono derivati dal codice; i select MUI non hanno labelId/testid quindi, come in tests/condivisi/notifiche/filtri.spec.ts, vanno individuati per posizione (getByRole('combobox').nth(n): 0 Anno, 1 Mese, 2 Tipologia Invio; il multiselect Tipologia Fattura e' un autocomplete) o, meglio, aggiungendo data-testid alla fase di implementazione (vedi bug 22). NOTA: l'esplorazione dal vivo e' stata solo parziale (sessione admin iniettata via localStorage, l'esecuzione di ulteriore codice Playwright in pagina e' stata interrotta): i nomi accessibili, il testo esatto di heading/alert e i comportamenti marcati "da verificare" vanno confermati con browser_snapshot in fase di implementazione. Tutti gli scenari partono da stato pulito (localStorage senza 'filtersNested_1') e sono indipendenti.

## Test Scenarios

### 1. 1. Accesso e titolo (tests/admin/invioFatture/titolo.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 1.1. 1.1. Accesso admin e titolo pagina

**File:** `tests/admin/invioFatture/titolo.spec.ts`

**Steps:**
  1. Con sessione admin (storageState admin.json) mockare GET /api/fatture/invio/sap/multiplo con il dataset base e aprire /send/inviofatture
    - expect: URL resta /send/inviofatture
    - expect: Il NavigatorHeader mostra 'Documenti Contabili Emessi/' e 'Invio a SAP' (confermare dal vivo se heading o testo)
    - expect: Una sola GET a /api/fatture/invio/sap/multiplo con nonce nella query e header Authorization 'Bearer <jwt>'
    - expect: Visibili: filtri Anno, Mese, Tipologia Fattura, Tipologia Invio, pulsante 'Filtra', pulsanti 'Download Fatture Re-inviate' e 'Download Risultati', grid con le intestazioni previste
    - expect: Il pulsante 'Annulla filtri' NON e' presente
    - expect: Nessuna chiamata a endpoint non mockati (annotazione 'unmocked-api' assente)

#### 1.2. 1.2. Voce di menu 'Invio a SAP' nella side nav admin

**File:** `tests/admin/invioFatture/titolo.spec.ts`

**Steps:**
  1. Aprire /send/inviofatture e osservare la side nav
    - expect: La sezione Fatturazione e la sotto-sezione Gestione Fatture sono espanse (SideNavSend apre openSezioneFatturazione e openGestioneFatture)
    - expect: La voce 'Invio a SAP' e' evidenziata (Mui-selected)
  2. Da /send/fatturazione (pagina Fatturazione) cliccare la voce di menu 'Invio a SAP'
    - expect: Si arriva a /send/inviofatture e la lista viene caricata

#### 1.3. 1.3. Un ENTE non puo' accedere alla pagina

**File:** `tests/admin/invioFatture/titolo.spec.ts`

**Steps:**
  1. Con la sessione ENTE (storageState user.json di default) aprire /send/inviofatture
    - expect: authVerifyIsLoggedSend reindirizza a /ente/datidifatturazione
    - expect: Nessuna chiamata a /api/fatture/invio/sap/multiplo
    - expect: La pagina 'Invio a SAP' non e' visibile

#### 1.4. 1.4. Admin del prodotto prod-pagopa reindirizzato

**File:** `tests/admin/invioFatture/titolo.spec.ts`

**Steps:**
  1. Impostare un profilo PAGOPA con prodotto 'prod-pagopa' e aprire /send/inviofatture
    - expect: Redirect a /pn/anagraficapsp
    - expect: Nessuna chiamata alle API di invio SAP

#### 1.5. 1.5. Utente non autenticato (negativo)

**File:** `tests/admin/invioFatture/titolo.spec.ts`

**Steps:**
  1. Rimuovere globalStatePF (o impostare authenticated:false) e aprire /send/inviofatture
    - expect: Redirect al login (globalRedirect, in test la pagina Selfcare mockata della fixture)
    - expect: Nessuna chiamata alle API

#### 1.6. 1.6. Link di ritorno del NavigatorHeader

**File:** `tests/admin/invioFatture/titolo.spec.ts`

**Steps:**
  1. Cliccare il link/icona di ritorno del NavigatorHeader (backPath PathPf.FATTURAZIONE)
    - expect: Si naviga a /send/fatturazione
    - expect: Nessun modale di conferma

### 2. 2. Filtri (tests/admin/invioFatture/filtri.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 2.1. 2.1. Valori di default dei filtri

**File:** `tests/admin/invioFatture/filtri.spec.ts`

**Steps:**
  1. Aprire la pagina con il dataset base
    - expect: Anno = 2026
    - expect: Mese senza valore selezionato
    - expect: Tipologia Fattura senza chip selezionati
    - expect: Tipologia Invio = 'Tutte'
    - expect: 'Download Fatture Re-inviate' disabilitato (tipoInvio 3)

#### 2.2. 2.2. Opzioni del select Anno

**File:** `tests/admin/invioFatture/filtri.spec.ts`

**Steps:**
  1. Aprire il select Anno
    - expect: Sono presenti esattamente le opzioni 2025, 2026, 2027 (array hardcoded)

#### 2.3. 2.3. Il select Mese non ha opzioni

**File:** `tests/admin/invioFatture/filtri.spec.ts`

**Steps:**
  1. Aprire il select Mese
    - expect: Il menu non contiene opzioni (arrayMonths sempre []). Documentare come bug 11: il filtro e' inutilizzabile
    - expect: Nessuna chiamata di rete

#### 2.4. 2.4. Opzioni di Tipologia Fattura derivate dalla response e ordinate

**File:** `tests/admin/invioFatture/filtri.spec.ts`

**Steps:**
  1. Mockare la lista con tipologie in ordine casuale (SEM. SOSPESI, ANTICIPO, VAR. SEMESTRALE, SECONDO SALDO, ACCONTO, PRIMO SALDO, ANTICIPO duplicato) e aprire il multiselect Tipologia Fattura
    - expect: Opzioni uniche in Title Case ordinate secondo ORDER: Tutte, Anticipo, Acconto, Primo Saldo, Secondo Saldo, Var. Semestrale, Sem. Sospesi
    - expect: Nessun duplicato
  2. Aggiungere alla response una tipologia non prevista (es. 'ALTRA')
    - expect: La nuova tipologia compare in fondo alla lista (rank = ORDER.length)

#### 2.5. 2.5. Tipologie calcolate su tutti gli anni, non solo sul 2026

**File:** `tests/admin/invioFatture/filtri.spec.ts`

**Steps:**
  1. Mockare una tipologia presente solo nell'anno 2025 e aprire il multiselect
    - expect: La tipologia compare tra le opzioni anche se nessuna riga 2026 la usa (bug 14)

#### 2.6. 2.6. Selezione multipla di Tipologia Fattura

**File:** `tests/admin/invioFatture/filtri.spec.ts`

**Steps:**
  1. Selezionare 'Anticipo' e 'Acconto' dal multiselect
    - expect: Compaiono i due chip selezionati
    - expect: La lista di righe si svuota ('Nessuna fattura disponibile') per via di clearOnChangeFilter, senza nuova GET
    - expect: Il body interno bodyFatturazione.tipologiaFattura contiene i valori (non osservabile dalla rete: nessuna chiamata)
  2. Deselezionare un chip
    - expect: Il chip scompare, la lista resta vuota

#### 2.7. 2.7. Cambio di Anno svuota la lista senza ricaricarla

**File:** `tests/admin/invioFatture/filtri.spec.ts`

**Steps:**
  1. Selezionare Anno = 2025
    - expect: Il select mostra 2025
    - expect: La grid mostra la riga vuota 'Nessuna fattura disponibile'
    - expect: Nessuna nuova GET a /api/fatture/invio/sap/multiplo (bug 5)
  2. Cliccare 'Filtra'
    - expect: Non parte nessuna chiamata e la grid resta vuota (onButtonFiltra e' un console.log) - comportamento atteso: ricarica della lista filtrata. Scrivere come test.fail()

#### 2.8. 2.8. Tipologia Invio: opzioni e abilitazione di Download Re-inviate

**File:** `tests/admin/invioFatture/filtri.spec.ts`

**Steps:**
  1. Aprire il select Tipologia Invio
    - expect: Opzioni 'Tutte' e 'Re-inviate'
  2. Selezionare 'Re-inviate'
    - expect: Il pulsante 'Download Fatture Re-inviate' diventa abilitato
    - expect: La lista NON si svuota ne' viene ricaricata (clearOnChangeFilter e' un no-op, bug 6)
  3. Tornare su 'Tutte'
    - expect: 'Download Fatture Re-inviate' torna disabilitato

#### 2.9. 2.9. Pulsante Filtra non produce effetti

**File:** `tests/admin/invioFatture/filtri.spec.ts`

**Steps:**
  1. Intercettare console e rete, impostare Tipologia Invio 'Re-inviate' e cliccare 'Filtra'
    - expect: Nessuna chiamata di rete
    - expect: In console 'Filtra button clicked' (bug 4)
    - expect: La grid non cambia; localStorage 'filtersNested_1' non viene scritto (collegato a 6.1)

#### 2.10. 2.10. Pulsante Annulla filtri assente

**File:** `tests/admin/invioFatture/filtri.spec.ts`

**Steps:**
  1. Modificare Anno e Tipologia Invio
    - expect: Il pulsante 'Annulla filtri' non compare mai (statusAnnulla='hidden'), quindi non c'e' modo di ripristinare i filtri senza reload (bug 4)

#### 2.11. 2.11. Il filtro Tipologia Fattura non filtra la grid

**File:** `tests/admin/invioFatture/filtri.spec.ts`

**Steps:**
  1. Selezionare solo 'Anticipo' e ricaricare la lista con reload senza filtri
    - expect: Il valore `tipologia` (usato da getLista/downloadReport) resta 'Tutte': il multiselect aggiorna solo valueMulitselectTipologie e bodyFatturazione, mai `tipologia` (bug 7)
    - expect: Documentare con test.fail(): atteso che la selezione influenzi lista e download

### 3. 3. Grid - righe principali (tests/admin/invioFatture/grid.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 3.1. 3.1. Intestazioni, righe mock e righe reali

**File:** `tests/admin/invioFatture/grid.spec.ts`

**Steps:**
  1. Aprire la pagina con 3 righe reali 2026 (PRIMO SALDO stato 0, ANTICIPO stato 2, ACCONTO stato 3) e 2 righe 2025/2027
    - expect: Intestazioni: Tipologia Fattura, Stato Invio, Numero Fatture, Anno Riferimento, Mese Riferimento, Importo (piu' colonne checkbox ed espansione senza label)
    - expect: Le prime 2 righe sono le mock: PRIMO SALDO (6 fatture, Dicembre, 2026, 11,00 euro) e SECONDO SALDO (1 fattura, Dicembre, 2026, 100,00 euro) entrambe 'Inviate'
    - expect: Seguono le 3 righe reali 2026; le righe 2025 e 2027 NON sono visibili
    - expect: Totale righe = 5

#### 3.2. 3.2. Massimo 10 righe (slice) con mock incluse

**File:** `tests/admin/invioFatture/grid.spec.ts`

**Steps:**
  1. Mockare 15 righe 2026
    - expect: Sono visibili 10 righe: 2 mock + 8 reali; le restanti 7 non sono raggiungibili da UI (bug 2 e 8)

#### 3.3. 3.3. Formattazione delle celle

**File:** `tests/admin/invioFatture/grid.spec.ts`

**Steps:**
  1. Verificare una riga reale con importo 1234.5 e meseRiferimento 5
    - expect: Importo '1.234,50 €' (formato de-DE, valuta EUR)
    - expect: Mese 'Maggio' (mesiGrid)
    - expect: Importo 0 o null mostra '--'
    - expect: Numero fatture null mostra '--'

#### 3.4. 3.4. Chip Stato Invio e relativo tooltip

**File:** `tests/admin/invioFatture/grid.spec.ts`

**Steps:**
  1. Verificare la colonna Stato Invio per statoInvio 0, 2, 3 e 4 sulle righe principali
    - expect: 0: chip 'Da inviare' (tooltip 'Da inviare')
    - expect: 2: chip 'Elaborazione' (tooltip 'La fatture sono in elaborazione')
    - expect: 3: chip 'Inviate' (tooltip 'La fattura sono state inviate')
    - expect: 4: chip 'Re-Inviata' (tooltip 'La fattura sono state re-inviate')
    - expect: Segnalare nel report i refusi grammaticali dei tooltip delle righe principali (bug 20)
  2. Mockare statoInvio 1 (valore non gestito) e 99
    - expect: Il chip e' vuoto (label '') senza crash (bug 21)

#### 3.5. 3.5. Ordinamento colonne Anno/Mese non ha effetto

**File:** `tests/admin/invioFatture/grid.spec.ts`

**Steps:**
  1. Cliccare l'intestazione ordinabile 'Anno Riferimento' e poi 'Mese Riferimento'
    - expect: L'ordine delle righe non cambia (headerAction e' una funzione vuota) e non parte nessuna chiamata (bug 9). Scrivere come test.fail(): atteso ordinamento asc/desc

#### 3.6. 3.6. Click su Tipologia Fattura

**File:** `tests/admin/invioFatture/grid.spec.ts`

**Steps:**
  1. Senza alcuna selezione cliccare sul nome della tipologia di una riga (cella con stile link)
    - expect: Si apre il modale 'Fatture Selezionate' con contatore 0 e tabella vuota (apiGet = setOpenModalFatture(true)), invece della navigazione al dettaglio prevista da handleGetDetails/PathPf.JSON_TO_SAP_DETAILS (bug 17)
    - expect: L'URL non cambia

#### 3.7. 3.7. Griglia vuota

**File:** `tests/admin/invioFatture/grid.spec.ts`

**Steps:**
  1. Mockare GET lista con []
    - expect: Le 2 righe mock vengono comunque mostrate (bug 2)
    - expect: 'Download Risultati' resta abilitato (listaFatture non e' mai vuota)
  2. Cambiare l'Anno per svuotare la lista
    - expect: Compare 'Nessuna fattura disponibile'
    - expect: 'Download Risultati' diventa disabilitato (lista vuota)

#### 3.8. 3.8. Errore 500 sul caricamento della lista (negativo)

**File:** `tests/admin/invioFatture/grid.spec.ts`

**Steps:**
  1. Mockare GET lista con 500 e aprire la pagina
    - expect: Alert di errore del layout (manageError): "L'operazione non e' andata a buon fine. Si prega di riprovare" (testo da confermare)
    - expect: Grid vuota con 'Nessuna fattura disponibile' (le mock row NON compaiono perche' sono aggiunte solo nel then)
    - expect: Filtri visibili, nessun crash

#### 3.9. 3.9. Errori 401/403 e errore di rete sul caricamento (negativo)

**File:** `tests/admin/invioFatture/grid.spec.ts`

**Steps:**
  1. Mockare GET lista con 403, poi 401 (per ultimi, provocano redirect) e infine abortire la richiesta
    - expect: Alert coerente con lo status via manageError, nessun crash
    - expect: Con route.abort: err.response undefined, 'Network Error' gestito senza schermata bianca

#### 3.10. 3.10. Doppio clic su Filtra / lista caricata una sola volta

**File:** `tests/admin/invioFatture/grid.spec.ts`

**Steps:**
  1. Aprire la pagina e contare le GET
    - expect: Una sola GET /api/fatture/invio/sap/multiplo al primo render (l'effetto dipende da [tipologia])

### 4. 4. Grid - riga espansa, filtri del collapse e paginazione del dettaglio (tests/admin/invioFatture/grid-collapse.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 4.1. 4.1. Espansione di una riga mock

**File:** `tests/admin/invioFatture/grid-collapse.spec.ts`

**Steps:**
  1. Cliccare il pulsante 'expand row' della riga mock PRIMO SALDO
    - expect: Compare il titolo 'Dettaglio Fatture' con i filtri 'Ragione Sociale', 'Numero Fattura', 'Data Fattura' e il pulsante 'Generazione Json' disabilitato
    - expect: Nessuna POST a .../multiplo/periodo (riga mock)
    - expect: Tabella con 6 righe (id 1111-1116); colonne N. Fattura, T. Fattura, Stato Invio, Ragione Sociale, Importo, FK ID Doc., D. Fat., D. Ultima Gen., File JSON, Date Invio
    - expect: Chip per fattura: 1111,1113,1116 'Inviata'; 1112,1114,1115 'Re-Inviata'
    - expect: FK ID Doc. mostra '--' (colonna senza keyValue)
    - expect: D. Fat. e D. Ultima Gen. formattate (data con nome del mese / data-ora)
    - expect: Paginazione del dettaglio non necessaria (6 < 10)
  2. Cliccare di nuovo 'expand row'
    - expect: La riga si chiude (Collapse unmountOnExit): i filtri non sono piu' nel DOM

#### 4.2. 4.2. Espansione di una riga reale: chiamata dettaglio e loader

**File:** `tests/admin/invioFatture/grid-collapse.spec.ts`

**Steps:**
  1. Mockare POST .../multiplo/periodo con risposta ritardata e espandere la riga reale PRIMO SALDO 2026/5 (statoInvio 0)
    - expect: Durante l'attesa compare il loader 'Caricamento...' nella tabella del dettaglio e la paginazione del dettaglio non e' visibile
    - expect: Body della POST = { annoRiferimento: 2026, meseRiferimento: 5, tipologiaFattura: 'PRIMO SALDO' }
    - expect: Header Authorization presente e nonce nella query
  2. Rilasciare la risposta con 2 fatture
    - expect: Il loader scompare e compaiono 2 righe
    - expect: Lo statoInvio di ogni fattura e' quello della riga padre ('Da inviare'); la colonna File JSON mostra un'icona DISABILITATA (statoInvio 0, fileJson '--')

#### 4.3. 4.3. File JSON: copia del nome file

**File:** `tests/admin/invioFatture/grid-collapse.spec.ts`

**Steps:**
  1. Concedere i permessi clipboard, espandere la riga mock PRIMO SALDO e cliccare l'icona File JSON della fattura 1111 (Inviata)
    - expect: Il clipboard contiene 'FatturePagoPa_01012026_1230.json'
    - expect: Compare lo snackbar 'Nome del file copiato!' che sparisce dopo ~2 s
    - expect: Il tooltip dell'icona mostra il nome del file
  2. Espandere una riga reale con statoInvio 2 e osservare l'icona
    - expect: L'icona File JSON e' disabilitata per statoInvio 2 e 0

#### 4.4. 4.4. Filtro Ragione Sociale con debounce e minimo 3 caratteri

**File:** `tests/admin/invioFatture/grid-collapse.spec.ts`

**Steps:**
  1. Espandere la riga mock PRIMO SALDO e digitare 'Re' in Ragione Sociale
    - expect: Dopo il debounce la tabella NON viene filtrata (6 righe), nessun loader residuo (minimo 3 caratteri)
  2. Digitare 'Reg' e poi 'Puglia'
    - expect: Durante il debounce (2000 ms) compare il loader 'Caricamento...'
    - expect: Al termine restano le 5 fatture 'Regione Puglia' (match case-insensitive, includes)
    - expect: Usare le assertion web-first con timeout >= 3 s, niente waitForTimeout
  3. Digitare 'zzzz'
    - expect: Tabella dettaglio senza righe e senza messaggio di vuoto dedicato (verificare)
  4. Svuotare il campo
    - expect: Tornano le 6 fatture originali

#### 4.5. 4.5. Filtro Numero Fattura

**File:** `tests/admin/invioFatture/grid-collapse.spec.ts`

**Steps:**
  1. Digitare '111' e poi '1112'
    - expect: '111' e' accettato (3 caratteri): vengono mostrate le fatture il cui id contiene '111' (tutte e 6); '1112' ne mostra 1
  2. Digitare '11'
    - expect: Nessun filtro applicato (meno di 3 caratteri)
  3. Digitare lettere ('abc')
    - expect: Nessuna riga (verificare se il campo accetta caratteri non numerici)

#### 4.6. 4.6. Filtro Data Fattura

**File:** `tests/admin/invioFatture/grid-collapse.spec.ts`

**Steps:**
  1. Selezionare una data corrispondente alle fatture (es. 10/02/2025 per le righe mock) tramite il date picker
    - expect: Dopo il debounce restano solo le fatture con la stessa data (confronto toDateString)
    - expect: Nessun errore nel campo
  2. Selezionare una data senza fatture
    - expect: Nessuna riga
  3. Cancellare la data
    - expect: Tornano tutte le fatture

#### 4.7. 4.7. Combinazione dei filtri e reset alla riapertura

**File:** `tests/admin/invioFatture/grid-collapse.spec.ts`

**Steps:**
  1. Applicare Ragione Sociale 'Puglia' e Numero Fattura '1114', chiudere e riaprire la riga
    - expect: Con entrambi i filtri 1 sola fattura (1114)
    - expect: Alla riapertura i campi sono vuoti e la tabella mostra di nuovo tutte le fatture originali (6) sulla riga mock; per le righe reali viene rifatta la POST

#### 4.8. 4.8. Debounce: digitazioni rapide generano un solo filtro

**File:** `tests/admin/invioFatture/grid-collapse.spec.ts`

**Steps:**
  1. Digitare lentamente 'P','u','g' con intervalli < 2000 ms
    - expect: Il filtro viene applicato una sola volta, con il valore finale

#### 4.9. 4.9. Chiusura del collapse durante il debounce

**File:** `tests/admin/invioFatture/grid-collapse.spec.ts`

**Steps:**
  1. Digitare 'Puglia' e chiudere subito la riga prima di 2 s
    - expect: Il loader viene spento (cleanup onLoading(false)), nessun errore in console, nessun filtro applicato

#### 4.10. 4.10. Paginazione client-side del dettaglio

**File:** `tests/admin/invioFatture/grid-collapse.spec.ts`

**Steps:**
  1. Espandere una riga reale la cui POST dettaglio restituisce 25 fatture
    - expect: Prima pagina con 10 righe e paginazione del dettaglio '1–10 of 25'
  2. Cliccare 'Go to next page'
    - expect: Seconda pagina '11–20 of 25' con 10 righe
    - expect: Il pulsante precedente e' abilitato
  3. Andare all'ultima pagina
    - expect: '21–25 of 25' con 5 righe, 'next' disabilitato
  4. Cambiare le righe per pagina a 25
    - expect: Tornano a pagina 1 con 25 righe
  5. Su pagina 2 applicare un filtro che riduce i risultati a 3
    - expect: La pagina corrente non esiste piu' e il dettaglio torna alla pagina 1 (useEffect su totalCollapse)

#### 4.11. 4.11. Piu' righe espanse contemporaneamente

**File:** `tests/admin/invioFatture/grid-collapse.spec.ts`

**Steps:**
  1. Espandere due righe reali una dopo l'altra
    - expect: Entrambe restano aperte con i propri dati
    - expect: Verificare che il flag collapseDataLoading (unico per tutta la pagina) non faccia comparire il loader su entrambe le righe e non lasci il loader infinito su una delle due (bug 16)

#### 4.12. 4.12. Errore 500 sul dettaglio di una riga reale (negativo)

**File:** `tests/admin/invioFatture/grid-collapse.spec.ts`

**Steps:**
  1. Mockare POST .../multiplo/periodo con 500 ed espandere una riga reale
    - expect: Compare l'alert 'Dettaglio momentaneamente non disponibile' (ERROR_LIST_JSON_TO_SAP)
    - expect: L'URL resta /send/inviofatture (navigate alla stessa rotta)
    - expect: Il loader del dettaglio scompare e la riga risulta vuota
    - expect: Nessun crash; la lista principale resta

#### 4.13. 4.13. Riga reale con dettaglio vuoto

**File:** `tests/admin/invioFatture/grid-collapse.spec.ts`

**Steps:**
  1. Mockare POST dettaglio con [] ed espandere
    - expect: Tabella senza righe, 'Generazione Json' disabilitato, nessun crash. Selezionando la checkbox di riga non si seleziona nulla

### 5. 5. Grid - selezione con checkbox (tests/admin/invioFatture/grid-selezione.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 5.1. 5.1. Selezione di una singola fattura nel collapse

**File:** `tests/admin/invioFatture/grid-selezione.spec.ts`

**Steps:**
  1. Espandere la riga mock PRIMO SALDO e spuntare la checkbox della fattura 1111
    - expect: La checkbox e' spuntata
    - expect: Il contatore sopra la grid mostra '1  Selezionate'
    - expect: 'Generazione Json' diventa abilitato
    - expect: La checkbox della riga principale NON e' spuntata (non tutte selezionate)
  2. Deselezionare la stessa checkbox
    - expect: Contatore sparisce (placeholder nascosto), 'Generazione Json' disabilitato

#### 5.2. 5.2. Selezione di tutte le fatture dalla checkbox della riga principale (riga aperta)

**File:** `tests/admin/invioFatture/grid-selezione.spec.ts`

**Steps:**
  1. Espandere la riga mock PRIMO SALDO e spuntare la checkbox della riga principale
    - expect: Tutte le 6 checkbox del dettaglio risultano spuntate
    - expect: Contatore '6  Selezionate'
    - expect: La checkbox principale e' spuntata
  2. Deselezionare la checkbox principale
    - expect: Tutte le checkbox del dettaglio deselezionate, contatore a zero

#### 5.3. 5.3. Selezione dalla checkbox della riga principale con riga chiusa (riga reale)

**File:** `tests/admin/invioFatture/grid-selezione.spec.ts`

**Steps:**
  1. Mockare dettaglio con 3 fatture per la riga reale ANTICIPO (stato 0) e spuntare la checkbox della riga principale a riga chiusa
    - expect: La riga si espande da sola (onToggleRow)
    - expect: Viene eseguita la POST .../multiplo/periodo
    - expect: Al termine le 3 fatture risultano selezionate e il contatore mostra '3  Selezionate'
    - expect: Verificare nessuna race condition tra getAsyncDetails(...,true) e manageCheckbox (bug 12): le 3 checkbox figurano spuntate in modo coerente anche con la risposta ritardata

#### 5.4. 5.4. Selezione dalla checkbox della riga principale con riga chiusa (riga mock)

**File:** `tests/admin/invioFatture/grid-selezione.spec.ts`

**Steps:**
  1. Spuntare la checkbox principale della riga mock PRIMO SALDO a riga chiusa
    - expect: La riga si espande, nessuna POST, le 6 fatture risultano selezionate, contatore '6  Selezionate'

#### 5.5. 5.5. La checkbox principale si sincronizza con la selezione manuale

**File:** `tests/admin/invioFatture/grid-selezione.spec.ts`

**Steps:**
  1. Spuntare una per una le 6 checkbox della riga mock PRIMO SALDO
    - expect: Dopo l'ultima la checkbox principale diventa spuntata
  2. Deselezionare una fattura
    - expect: La checkbox principale torna non spuntata, contatore '5  Selezionate'

#### 5.6. 5.6. Una sola combinazione anno/mese/tipologia selezionabile

**File:** `tests/admin/invioFatture/grid-selezione.spec.ts`

**Steps:**
  1. Selezionare una fattura di PRIMO SALDO e poi osservare le checkbox della riga SECONDO SALDO (stesso anno e mese, tipologia diversa)
    - expect: Le checkbox (principale e del dettaglio) delle altre combinazioni risultano disabilitate
    - expect: Quelle del gruppo selezionato restano abilitate
  2. Deselezionare l'ultima fattura selezionata
    - expect: Tutte le checkbox tornano abilitate (eccetto quelle di statoInvio 2)

#### 5.7. 5.7. Righe in Elaborazione non selezionabili

**File:** `tests/admin/invioFatture/grid-selezione.spec.ts`

**Steps:**
  1. Osservare la riga ANTICIPO con statoInvio 2 e, espandendola, le sue fatture
    - expect: La checkbox principale e quelle del dettaglio sono disabilitate
    - expect: Il pulsante 'Generazione Json' di quella riga resta disabilitato

#### 5.8. 5.8. Selezione mista Inviate / Re-Inviata nello stesso gruppo

**File:** `tests/admin/invioFatture/grid-selezione.spec.ts`

**Steps:**
  1. Nella riga mock PRIMO SALDO selezionare la fattura 1111 (Inviata) e la 1112 (Re-Inviata)
    - expect: Entrambe selezionabili, contatore '2  Selezionate'

#### 5.9. 5.9. Selezione e filtri del collapse

**File:** `tests/admin/invioFatture/grid-selezione.spec.ts`

**Steps:**
  1. Selezionare 2 fatture, poi filtrare per una Ragione Sociale che ne nasconde una
    - expect: Il contatore continua a mostrare le selezioni complessive (2)
    - expect: La riga nascosta resta selezionata e ricomparendo e' ancora spuntata

#### 5.10. 5.10. Selezione e paginazione del dettaglio

**File:** `tests/admin/invioFatture/grid-selezione.spec.ts`

**Steps:**
  1. Riga con 25 fatture: selezionare una fattura in pagina 1, andare a pagina 2 e tornare
    - expect: La selezione resta, la checkbox principale non e' spuntata
  2. Spuntare la checkbox principale
    - expect: Sono selezionate tutte le 25 fatture (anche di altre pagine), contatore '25  Selezionate'

#### 5.11. 5.11. La selezione sopravvive allo svuotamento della lista (negativo)

**File:** `tests/admin/invioFatture/grid-selezione.spec.ts`

**Steps:**
  1. Selezionare 2 fatture e poi cambiare l'Anno (la lista si svuota)
    - expect: Il contatore '2  Selezionate' resta visibile pur non essendoci righe (elementsSelected non viene azzerato da clearOnChangeFilter) (bug 13)
    - expect: Atteso: selezione azzerata. Scrivere come test.fail()

#### 5.12. 5.12. Selezione di righe con dettaglio privo di anno/mese (negativo)

**File:** `tests/admin/invioFatture/grid-selezione.spec.ts`

**Steps:**
  1. Mockare il dettaglio della riga reale SENZA annoRiferimento/meseRiferimento nelle fatture (solo idFattura, tipologiaFattura, ragioneSociale...) e spuntare la checkbox principale a riga chiusa
    - expect: manageStateCheckbox confronta annoRiferimento/meseRiferimento/tipologiaFattura sugli elementi selezionati (resCollapseDetails): documentare se la checkbox principale e le righe risultano spuntate o meno, e che gli elementi selezionati compaiano nel modale con Anno/Mese vuoti (bug 12)

### 6. 6. Modale 'Fatture Selezionate' (tests/admin/invioFatture/modale-fatture-selezionate.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 6.1. 6.1. Apertura dal pulsante Generazione Json

**File:** `tests/admin/invioFatture/modale-fatture-selezionate.spec.ts`

**Steps:**
  1. Espandere la riga mock PRIMO SALDO, selezionare le fatture 1111 e 1113 (entrambe stato 3) e cliccare 'Generazione Json'
    - expect: Si apre il dialog con titolo 'Fatture Selezionate' e contatore 2
    - expect: Colonne: Ragione Sociale, Anno Riferimento, Mese Riferimento, Tipologia Fattura, N. Invio, N. Doc. Di Storno, Nota
    - expect: Righe con ragione sociale (Regione Lombardia / Regione Puglia), anno 2026, mese 12, tipologia PRIMO SALDO
    - expect: La colonna N. Invio mostra il valore numerico grezzo di statoInvio ('3') invece di un testo (bug 18)
    - expect: Campi 'N. documento di storno' e 'Nota' presenti per ogni riga

#### 6.2. 6.2. Colonne Storno e Nota nascoste con solo fatture 'Da inviare'

**File:** `tests/admin/invioFatture/modale-fatture-selezionate.spec.ts`

**Steps:**
  1. Selezionare solo fatture con statoInvio 0 (riga reale) e aprire il modale
    - expect: Le colonne 'N. Doc. Di Storno' e 'Nota' NON sono presenti
    - expect: Resta la tabella con le prime 5 colonne
  2. Selezionare fatture con statoInvio 4 (mock) e aprire il modale
    - expect: Le colonne 'N. Doc. Di Storno' e 'Nota' sono presenti

#### 6.3. 6.3. Campi N. documento di storno e Nota editabili per riga

**File:** `tests/admin/invioFatture/modale-fatture-selezionate.spec.ts`

**Steps:**
  1. Con 2 righe selezionate scrivere 'DOC-1' nel campo storno della prima riga e 'nota uno' nel campo Nota della seconda
    - expect: I valori restano nei rispettivi campi (stato locale componentValues per riga)
    - expect: Il tasto Invio non inserisce un a capo (onKeyDown preventDefault)
    - expect: Il campo si espande quando ha il focus (maxRows illimitato) e torna a una riga al blur
  2. Chiudere e riaprire il modale
    - expect: I valori inseriti sono persi (nessuna persistenza: numeroDocStorno/nota di pagina non sono mai aggiornati, bug 19)

#### 6.4. 6.4. NotaTextField sotto la tabella

**File:** `tests/admin/invioFatture/modale-fatture-selezionate.spec.ts`

**Steps:**
  1. Aprire il modale e provare a scrivere nel campo di nota sotto la tabella (NotaTextField)
    - expect: Il campo e' montato con value fisso '' e non e' collegato ad alcuno stato: il testo non cambia/nessun effetto (bug 19)

#### 6.5. 6.5. Chiusura del modale

**File:** `tests/admin/invioFatture/modale-fatture-selezionate.spec.ts`

**Steps:**
  1. Cliccare l'icona di chiusura (X)
    - expect: Il modale si chiude, le selezioni restano e il contatore sopra la grid e' invariato
  2. Riaprire e premere Escape
    - expect: Il modale si chiude (MainModalComponent)

#### 6.6. 6.6. Scroll oltre 10 righe

**File:** `tests/admin/invioFatture/modale-fatture-selezionate.spec.ts`

**Steps:**
  1. Selezionare 12 fatture e aprire il modale
    - expect: Contatore 12
    - expect: Altezza massima 400px con scroll verticale e header sticky

#### 6.7. 6.7. Nessun pulsante di invio nel modale (negativo / bug)

**File:** `tests/admin/invioFatture/modale-fatture-selezionate.spec.ts`

**Steps:**
  1. Aprire il modale con una selezione valida e cercare un pulsante di conferma/invio
    - expect: Nessun pulsante (showButton=false): non parte alcuna PUT /api/fatture/invio/sap/multiplo; il flusso 'Invio a SAP' non e' completabile da UI (bug 3)
    - expect: Scrivere un test.fail(): atteso pulsante di conferma che invoca la PUT con body [{annoRiferimento, meseRiferimento, tipologiaFattura}] e mostra l'alert SEND_JSON_SAP_OK

#### 6.8. 6.8. Modale aperto senza selezione

**File:** `tests/admin/invioFatture/modale-fatture-selezionate.spec.ts`

**Steps:**
  1. Cliccare il nome della tipologia in una riga senza selezioni
    - expect: Il modale si apre con contatore 0 e senza righe; nessun errore in console

#### 6.9. 6.9. Pulsante Generazione Json disabilitato senza selezione o con gruppo diverso

**File:** `tests/admin/invioFatture/modale-fatture-selezionate.spec.ts`

**Steps:**
  1. Espandere due righe e selezionare una fattura nella prima
    - expect: 'Generazione Json' della prima riga abilitato
    - expect: 'Generazione Json' della seconda riga disabilitato (selezione di un altro gruppo)

### 7. 7. Dialog 'Storico Invio' (tests/admin/invioFatture/storico-invio.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 7.1. 7.1. Apertura per fattura Inviata

**File:** `tests/admin/invioFatture/storico-invio.spec.ts`

**Steps:**
  1. Espandere la riga mock PRIMO SALDO e cliccare l'icona 'Date di invio' della fattura 1111 (statoInvio 3)
    - expect: Si apre il dialog 'Storico Invio'
    - expect: Contiene 1 nota con data '01/12/2026 - 01:20:00' e testo 'Lorem Ipsum is simply dummy text...' (dato fittizio: bug 15)
    - expect: Nessuna chiamata di rete

#### 7.2. 7.2. Apertura per fattura Re-Inviata

**File:** `tests/admin/invioFatture/storico-invio.spec.ts`

**Steps:**
  1. Cliccare l'icona 'Date di invio' della fattura 1112 (statoInvio 4)
    - expect: Il dialog mostra 3 note con date 01/12/2026 - 01:20:00, 02/12/2026 - 02:20:00, 03/12/2026 - 03:20:00 (dato fittizio)
    - expect: Tra le note c'e' un divisore (Divider) tranne che dopo l'ultima

#### 7.3. 7.3. Icona disabilitata per fatture Da inviare

**File:** `tests/admin/invioFatture/storico-invio.spec.ts`

**Steps:**
  1. Espandere una riga reale con statoInvio 0 e osservare la colonna Date Invio
    - expect: L'icona e' disabilitata, il click non apre il dialog

#### 7.4. 7.4. Chiusura e reset del contenuto

**File:** `tests/admin/invioFatture/storico-invio.spec.ts`

**Steps:**
  1. Aprire il dialog, chiuderlo (pulsante di chiusura o Escape) e riaprirlo per un'altra fattura
    - expect: Il dialog si chiude
    - expect: Alla riapertura il contenuto corrisponde alla nuova fattura (clearAction svuota infoReinvio)
    - expect: Nessuna sovrapposizione di note precedenti

#### 7.5. 7.5. Elenco lungo con scroll

**File:** `tests/admin/invioFatture/storico-invio.spec.ts`

**Steps:**
  1. Verificare lo stile della lista (maxHeight 400)
    - expect: Con molte note la lista scrolla senza far crescere il dialog. Con i dati fittizi (max 3 note) non e' riproducibile: marcare come test.fixme finche' lo storico non arriva da API

#### 7.6. 7.6. Messaggio per storico vuoto

**File:** `tests/admin/invioFatture/storico-invio.spec.ts`

**Steps:**
  1. Non raggiungibile da UI (le note sono sempre generate): documentare
    - expect: Il testo 'Nessuna DATA disponibile.' non e' mostrabile; il messaggio dovrebbe dire 'Nessuna data disponibile' (bug 15)

### 8. 8. Download (tests/admin/invioFatture/download.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 8.1. 8.1. Download Risultati con tipologia 'Tutte'

**File:** `tests/admin/invioFatture/download.spec.ts`

**Steps:**
  1. Mockare POST /api/fatture/pagopa/non-inviate/report con uno zip (ritardato) e cliccare 'Download Risultati'
    - expect: Compare il modale 'Downloading...'
    - expect: Body della richiesta = { tipologiaFattura: null }, header Authorization e Content-type application/json
    - expect: Download del file con suggestedFilename 'Lista Report Non Inviate.zip'
    - expect: Il modale 'Downloading...' si chiude (finally)

#### 8.2. 8.2. Download Fatture Re-inviate

**File:** `tests/admin/invioFatture/download.spec.ts`

**Steps:**
  1. Selezionare Tipologia Invio 'Re-inviate' e cliccare 'Download Fatture Re-inviate'
    - expect: Parte la STESSA richiesta di 8.1 (stesso endpoint e stesso body { tipologiaFattura: null }) e lo stesso nome file 'Lista Report Non Inviate.zip' (bug 1): atteso un report diverso per le re-inviate
    - expect: Scrivere come test.fail() l'assert che body/nome file differiscano da 'Download Risultati'

#### 8.3. 8.3. 'Download Fatture Re-inviate' disabilitato con Tipologia Invio 'Tutte'

**File:** `tests/admin/invioFatture/download.spec.ts`

**Steps:**
  1. Aprire la pagina con i default
    - expect: Il pulsante e' disabilitato e il click non invia richieste

#### 8.4. 8.4. Download con tipologia salvata (nome file con '/')

**File:** `tests/admin/invioFatture/download.spec.ts`

**Steps:**
  1. Precompilare localStorage 'filtersNested_1' con tipologiaInvio 'Primo Saldo' (vedi 10.2) e cliccare 'Download Risultati'
    - expect: Body = { tipologiaFattura: ['Primo Saldo'] } (Title Case, mentre le righe usano MAIUSCOLO: da verificare con il BE, bug 7)
    - expect: Il nome file proposto contiene un '/': 'Lista Report Non Inviate/Primo Saldo.zip' - il browser lo sanifica e il nome risulta alterato (es. 'Lista Report Non Inviate_Primo Saldo.zip') (bug 10)

#### 8.5. 8.5. Download con risposta non ok (negativo)

**File:** `tests/admin/invioFatture/download.spec.ts`

**Steps:**
  1. Mockare POST report con 404 poi 500
    - expect: Nessun file scaricato
    - expect: Alert di errore di download (manageErrorDownload '404')
    - expect: Il modale 'Downloading...' si chiude e la pagina resta usabile

#### 8.6. 8.6. Download con errore di rete (negativo)

**File:** `tests/admin/invioFatture/download.spec.ts`

**Steps:**
  1. Abortire la richiesta (route.abort)
    - expect: Il catch gestisce l'errore con lo stesso alert e il modale si chiude

#### 8.7. 8.7. Doppio clic su Download

**File:** `tests/admin/invioFatture/download.spec.ts`

**Steps:**
  1. Mockare la risposta ritardata e fare doppio click su 'Download Risultati'
    - expect: Il modale 'Downloading...' blocca il secondo click: una sola richiesta

#### 8.8. 8.8. Download Risultati con lista svuotata

**File:** `tests/admin/invioFatture/download.spec.ts`

**Steps:**
  1. Cambiare l'Anno per svuotare la lista
    - expect: 'Download Risultati' disabilitato; nessuna richiesta

### 9. 9. Paginazione della grid principale (tests/admin/invioFatture/paginazione.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 9.1. 9.1. Paginatore principale sempre a zero

**File:** `tests/admin/invioFatture/paginazione.spec.ts`

**Steps:**
  1. Aprire la pagina con il dataset base (5 righe)
    - expect: Il TablePagination principale mostra '0–0 of 0' (total={count} con count=0), anche se la grid ha 5 righe (bug 8)
    - expect: I pulsanti 'Go to previous page' e 'Go to next page' sono disabilitati
    - expect: Atteso: '1–5 of 5'. Scrivere come test.fail()

#### 9.2. 9.2. Piu' di 10 righe: nessuna paginazione e righe in eccesso nascoste

**File:** `tests/admin/invioFatture/paginazione.spec.ts`

**Steps:**
  1. Mockare 25 righe 2026
    - expect: La grid mostra 10 righe (slice(0,10)) e il paginatore non permette di raggiungere le altre 15 (bug 8). Atteso: '1–10 of 27' con navigazione

#### 9.3. 9.3. Cambio righe per pagina

**File:** `tests/admin/invioFatture/paginazione.spec.ts`

**Steps:**
  1. Cambiare le righe per pagina a 25 dal combobox del paginatore
    - expect: Il valore viene scelto ma le righe visibili restano 10 (infoPage aggiornato, page/rowsPerPage no) e non parte alcuna chiamata (bug 8)

#### 9.4. 9.4. Selezione e paginazione indipendenti dalla pagina principale

**File:** `tests/admin/invioFatture/paginazione.spec.ts`

**Steps:**
  1. Selezionare fatture e provare a cambiare pagina/righe
    - expect: La selezione non viene alterata dal cambio di righe per pagina; il contatore resta invariato

#### 9.5. 9.5. Paginatore del dettaglio distinto da quello principale

**File:** `tests/admin/invioFatture/paginazione.spec.ts`

**Steps:**
  1. Espandere una riga con 25 fatture
    - expect: Nella pagina compaiono due paginatori: principale '0–0 of 0' e del dettaglio '1–10 of 25'. Usare locator limitati alla regione (riga di collapse) per non confonderli (CLAUDE.md: getByRole)

### 10. 10. Persistenza dei filtri (tests/admin/invioFatture/persistenza-filtri.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 10.1. 10.1. Nessun salvataggio dopo la modifica di filtri/selezioni

**File:** `tests/admin/invioFatture/persistenza-filtri.spec.ts`

**Steps:**
  1. Impostare Tipologia Invio 'Re-inviate', cliccare 'Filtra', selezionare una fattura e leggere localStorage
    - expect: La chiave 'filtersNested_1' NON esiste: updateFilters non viene mai richiamato (bug 22 e 6.x). Atteso: pathPage '/inviofatture' con tipologiaInvio, selectedInvio, rowSelectionModelInvio, infoPageInvio. Scrivere come test.fail()
  2. Ricaricare la pagina
    - expect: I filtri tornano ai default (Anno 2026, Tipologia Invio 'Tutte') e la selezione e' persa

#### 10.2. 10.2. Ripristino da localStorage precompilato

**File:** `tests/admin/invioFatture/persistenza-filtri.spec.ts`

**Steps:**
  1. Precompilare con addInitScript (con flag di sessione per non sovrascrivere al reload) localStorage 'filtersNested_1' = { pathPage:'/inviofatture', tipologiaInvio:'Primo Saldo', selectedInvio:[...], rowSelectionModelInvio:[], infoPageInvio:{page:0,pageSize:10} } e aprire la pagina
    - expect: La GET lista parte con i filtri salvati (getLista(filters.tipologiaInvio))
    - expect: Dopo la risposta tipologia = 'Primo Saldo' e selected/infoPage vengono ripristinati senza errori in console
    - expect: La UI dei filtri (Anno, Tipologia Fattura, Tipologia Invio) NON riflette i valori salvati (non sono letti dai filtri) (bug 22)
    - expect: Le selezioni di riga (elementsSelected, contatore) NON sono ripristinate: restano a 0 (bug 22)

#### 10.3. 10.3. Filtri di un altro pathPage ignorati e rimossi

**File:** `tests/admin/invioFatture/persistenza-filtri.spec.ts`

**Steps:**
  1. Precompilare 'filtersNested_1' con pathPage '/gestionefatture' (o altro) e aprire la pagina
    - expect: Comportamento di default (GET lista, filtri a default)
    - expect: La chiave 'filtersNested_1' viene rimossa da localStorage

#### 10.4. 10.4. JSON malformato in localStorage (negativo)

**File:** `tests/admin/invioFatture/persistenza-filtri.spec.ts`

**Steps:**
  1. Impostare 'filtersNested_1' = '{"pathPage":' e ricaricare
    - expect: JSON.parse senza try/catch: la pagina va in crash (schermata bianca / error boundary). Segnalare come bug 23 (stesso comportamento di useSavedFilters in tests/condivisi/notifiche/persistenza-filtri.spec.ts)
    - expect: Scrivere il test sul comportamento atteso (pagina funzionante con default) come test.fail()

#### 10.5. 10.5. Filtri salvati con campi mancanti (negativo)

**File:** `tests/admin/invioFatture/persistenza-filtri.spec.ts`

**Steps:**
  1. Precompilare 'filtersNested_1' = { pathPage:'/inviofatture' } (senza altri campi) e aprire la pagina
    - expect: Nessun crash; viene chiamato getLista(undefined) e setTipologia(undefined)/setSelected(undefined)/setInfoPage(undefined); verificare che `tipologia` undefined non produca body anomalo nel download ({ tipologiaFattura: [undefined] } -> null in JSON) (bug 22)

#### 10.6. 10.6. Persistenza separata tra pagine (cambio pagina)

**File:** `tests/admin/invioFatture/persistenza-filtri.spec.ts`

**Steps:**
  1. Precompilare 'filtersNested_1' per /inviofatture, navigare da side nav a 'Gestione Fatture' e tornare a 'Invio a SAP'
    - expect: Verificare se la chiave viene rimossa dall'altra pagina (pathPage diverso) e se tornando sulla pagina vengono usati i default; documentare il comportamento reale

#### 10.7. 10.7. Reload mantiene la lista ma non lo stato espanso

**File:** `tests/admin/invioFatture/persistenza-filtri.spec.ts`

**Steps:**
  1. Espandere una riga e selezionare una fattura, poi page.reload()
    - expect: Le righe tornano chiuse e senza selezione; la GET lista viene rifatta una volta

### 11. 11. Navigazione e robustezza (tests/admin/invioFatture/navigazione.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 11.1. 11.1. Nessun errore in console al primo render

**File:** `tests/admin/invioFatture/navigazione.spec.ts`

**Steps:**
  1. Aprire la pagina e registrare pageerror e console.error
    - expect: Nessun pageerror
    - expect: Annotare i console.log residui ({elementsSelected}, {event}, {obj}) (bug 24) e gli eventuali warning React sulle key

#### 11.2. 11.2. Struttura delle key delle note (warning React)

**File:** `tests/admin/invioFatture/navigazione.spec.ts`

**Steps:**
  1. Aprire 'Storico Invio' con 3 note
    - expect: Le key dei Box sono `${el}-{index}` = '[object Object]-{index}' per tutte le note: warning di key duplicata in console (bug 25). Non influisce sul rendering

#### 11.3. 11.3. Navigazione fuori dalla pagina con selezione attiva

**File:** `tests/admin/invioFatture/navigazione.spec.ts`

**Steps:**
  1. Selezionare delle fatture e cliccare un'altra voce della side nav
    - expect: Si naviga senza modale di conferma (nessun blocco su modifiche non salvate); tornando alla pagina la selezione e' persa

#### 11.4. 11.4. Ricarica della lista dopo errore

**File:** `tests/admin/invioFatture/navigazione.spec.ts`

**Steps:**
  1. Fallire la GET lista (500) e poi correggere il mock e ricaricare
    - expect: La pagina carica correttamente la lista alla seconda apertura

### 12. 12. Possibili bug individuati (da verificare dal vivo)

**Seed:** `tests/auth.setup.ts`

#### 12.1. 12.1. Elenco bug (la numerazione e' richiamata negli scenari sopra)

**File:** `specs/invioFatture.md`

**Steps:**
  1. Bug 1 - 'Download Fatture Re-inviate' e 'Download Risultati' richiamano la stessa funzione downloadReport (stesso endpoint /api/fatture/pagopa/non-inviate/report, stesso body, stesso nome file). Dove: src/page/prod_pn/invioFatture.tsx, actionButtonRight (~riga 703-717)
    - expect: Atteso: due azioni distinte (report re-inviate e risultati) con nome file coerente. Scenario 8.2
  2. Bug 2 - getLista antepone SEMPRE due righe fittizie ('idFat':'mock', PRIMO SALDO e SECONDO SALDO 2026/12) alla response, filtra le righe reali a annoRiferimento === 2026 e fa slice(0,10). Dove: getLista (~righe 103-214)
    - expect: Atteso: mostrare i soli dati reali (tutti gli anni e righe) filtrati dai filtri. Scenari 3.1, 3.2, 3.7
  3. Bug 3 - Flusso di invio irraggiungibile: onButtonInvia/invioListaJsonFatturePagoPa (PUT /api/fatture/invio/sap/multiplo) non e' collegata ad alcun pulsante; il modale 'Fatture Selezionate' ha showButton=false e 'Generazione Json' si limita ad aprire il modale. Dove: invioFatture.tsx (onButtonInvia ~266, ModalContentFattureSelezionate ~816)
    - expect: Atteso: pulsante di conferma nel modale che invia la selezione e mostra SEND_JSON_SAP_OK. Scenario 6.7
  4. Bug 4 - onButtonFiltra e onButtonAnnulla fanno solo console.log; statusAnnulla='hidden' nasconde 'Annulla filtri'. Dove: ~righe 338-344 e 536
    - expect: Atteso: Filtra ricarica la lista con anno/mese/tipologia/tipoInvio, Annulla filtri ripristina i default. Scenari 2.7, 2.9, 2.10
  5. Bug 5 - Qualsiasi cambio di Anno o Tipologia Fattura esegue clearOnChangeFilter => setListaFatture([]) e non ricarica la lista (callLista.current e' scritto ma mai letto): la grid resta vuota fino al reload
    - expect: Atteso: lista ricaricata o mantenuta. Scenari 2.6, 2.7, 3.7
  6. Bug 6 - Filtro 'Tipologia Invio' con clearOnChangeFilter={() => {}} (no-op) incoerente con gli altri filtri e senza effetto sulla lista: cambia solo l'abilitazione di 'Download Fatture Re-inviate'
    - expect: Atteso: filtro applicato alla lista. Scenario 2.8
  7. Bug 7 - Il multiselect Tipologia Fattura aggiorna valueMulitselectTipologie/bodyFatturazione ma non `tipologia`, l'unico valore usato da getLista, da downloadReport e dall'effetto [tipologia]: il filtro non ha effetto. Inoltre i valori sono in Title Case (toTitleCase) mentre le righe e il report usano MAIUSCOLO (es. 'PRIMO SALDO'); ORDER richiede capitalizzazione esatta (nuove tipologie finiscono in fondo, commento ATTENZIONE nel codice)
    - expect: Atteso: selezione che filtra e viene inviata nel formato atteso dal BE. Scenari 2.4, 2.11, 8.4
  8. Bug 8 - Paginazione principale rotta: total={count} con count=0 (setCount mai chiamato), page={page}/rows={rowsPerPage} mai aggiornati (changePage/changeRow aggiornano solo infoPage), slice(0,10) lato dati. Il paginatore mostra '0–0 of 0'
    - expect: Atteso: paginazione coerente con il numero di righe. Scenari 9.1-9.3
  9. Bug 9 - Ordinamento per Anno/Mese Riferimento inefficace: headerAction e' una funzione vuota (headerActionSort) mentre le colonne sono marcate headerActionSort:true; objectSort e gridData non vengono usati
    - expect: Atteso: ordinamento. Scenario 3.5
  10. Bug 10 - Nome zip con '/' nel titolo: `Lista Report Non Inviate/${tipologia}.zip` (saveAs); il '/' viene sostituito/rimosso dal browser e il nome risulta alterato
    - expect: Atteso: nome file senza '/', es. 'Lista Report Non Inviate - Primo Saldo.zip'. Scenario 8.4
  11. Bug 11 - arrayMonths e' sempre [] (getMesi commentato): il select Mese non ha opzioni ed extraCodeOnChange non fa nulla
    - expect: Atteso: mesi selezionabili e filtro funzionante. Scenario 2.3
  12. Bug 12 - Logica checkbox riga principale incoerente e a rischio race: manageCheckbox confronta statoInvio solo in checkLengthOfCollapse/verifyIfSelected ma non nel ramo else; a riga chiusa vengono eseguiti sia getAsyncDetails(element,true) (setElementSelected(resCollapseDetails) con oggetti API grezzi, senza garanzia di annoRiferimento/meseRiferimento) sia manageCheckbox (setElementSelected delle fatture ancora vuote). manageStateCheckbox main-row confronta statoInvio, il ramo collapse no; `disabled` usa elementsSelected (closure) invece di elementsSel; il confronto statoInvio fallisce se le fatture hanno stato diverso dalla riga (statoInvio del dettaglio sovrascritto dal padre)
    - expect: Atteso: stato di selezione deterministico. Scenari 5.3, 5.12
  13. Bug 13 - La selezione (elementsSelected, contatore 'N Selezionate') non viene azzerata quando la lista viene svuotata/cambiano i filtri
    - expect: Atteso: selezione azzerata. Scenario 5.11
  14. Bug 14 - Le tipologie del filtro sono calcolate su res.data completo (tutti gli anni) anche se la grid mostra solo il 2026
    - expect: Atteso: tipologie coerenti con l'anno selezionato. Scenario 2.5
  15. Bug 15 - showPopUpAction produce note fittizie ('Lorem Ipsum...', date 01..03/12/2026) invece di leggere lo storico degli invii; il messaggio vuoto e' 'Nessuna DATA disponibile.' (maiuscolo anomalo)
    - expect: Atteso: storico reale dall'API. Scenari 7.1, 7.2, 7.6
  16. Bug 16 - collapseDataLoading e' un unico booleano di pagina (inizialmente true) condiviso da tutte le righe e dai filtri del collapse: espansioni concorrenti o filtri possono mostrare il loader su altre righe; per le righe mock viene resettato solo nel ramo else
    - expect: Atteso: loading per riga. Scenari 4.9, 4.11
  17. Bug 17 - handleEvent/handleGetDetails/navigate a PathPf.JSON_TO_SAP_DETAILS non sono collegati: il click sulla Tipologia Fattura (makeAction) apre il modale 'Fatture Selezionate' invece del dettaglio; codice morto (handleGetDetails, handleEvent, handleOnCellClick, statoFattura, TextField/Typography/ListItem imports)
    - expect: Atteso: coerenza tra click e destinazione. Scenario 3.6
  18. Bug 18 - Nel modale la colonna 'N. Invio' mostra il numero grezzo di statoInvio (0/2/3/4) invece di un testo/numero di invio
    - expect: Atteso: etichetta leggibile. Scenario 6.1
  19. Bug 19 - Campi del modale non collegati: numeroDocStorno/nota di pagina non sono mai usati; NotaTextField e' reso con value fisso '' (non editabile/non collegato); i valori per riga sono solo locali a ElementToProcessComponent e non vengono inviati; i componenti Storno/Nota usano useState dentro funzioni invocate in render (rischio violazione regole degli hook)
    - expect: Atteso: valori inviati con la PUT. Scenari 6.3, 6.4
  20. Bug 20 - Refusi nei tooltip dei chip della riga principale: 'La fatture sono in elaborazione', 'La fattura sono state inviate/re-inviate'
    - expect: Atteso: concordanza grammaticale. Scenario 3.4
  21. Bug 21 - Valori di statoInvio non gestiti (es. 1) producono un chip senza label
    - expect: Atteso: etichetta di fallback. Scenario 3.4
  22. Bug 22 - Persistenza filtri non funzionante: useSavedFiltersNested('/inviofatture') non viene mai scritto (updateFilters mai chiamato, solo resetFilters); il ripristino legge filters.tipologiaInvio, selectedInvio, rowSelectionModelInvio, infoPageInvio che nessuno salva; isInitialRender non diventa mai false; i valori ripristinati non aggiornano UI dei filtri ne' elementsSelected (solo selected/rowSelectionModel, stati inutilizzati). Mancano inoltre data-testid/aria-label sui select dei filtri (difficile usare getByRole/getByTestId)
    - expect: Atteso: filtri e selezione persistiti e ripristinati. Scenari 10.1, 10.2, 10.5
  23. Bug 23 - JSON.parse di 'filtersNested_1' senza try/catch: un valore malformato manda in crash la pagina
    - expect: Atteso: fallback ai default. Scenario 10.4
  24. Bug 24 - console.log lasciati nel codice di produzione: console.log({elementsSelected}) nel render (log a ogni render), console.log({obj}) in showPopUpAction, console.log({event}) in gridCell checkbox, 'Filtra/Annulla button clicked'
    - expect: Atteso: nessun log. Scenario 11.1
  25. Bug 25 - Key errata in DilogContentList: `${el}-{index}` (manca il $ davanti a {index}, e el e' un oggetto => '[object Object]-{index}') e GridCustom usa key `${index}-${Object.values(element)[0]}` che per le righe mock usa 'mock'
    - expect: Atteso: key univoche e stabili. Scenario 11.2
  26. Bug 26 - Dati dettaglio sovrascritti: handleGetDetailsRowCollapsed assegna a ogni fattura statoInvio e fileJson della riga padre (fileJson hardcoded 'FatturePagoPa_01012026_1230.json'); le fatture Re-Inviate o con stato diverso non sono distinguibili per le righe reali; colonna 'FK ID Doc.' senza keyValue (sempre '--'); date mock incoerenti con l'anno di riferimento (dataFattura 2025-02-10 per annoRiferimento 2026) e importo riga mock (11) diverso dalla somma delle fatture
    - expect: Atteso: stato/file per singola fattura dall'API. Scenari 4.2, 4.3
  27. Bug 27 - NavigatorHeader mostra 'Documenti Contabili Emessi/' come pagina di provenienza mentre la voce di menu e' sotto Fatturazione > Gestione Fatture, e la pagina di dettaglio usa 'Documenti emessi/Inserimento fatture/'; backPath PathPf.FATTURAZIONE
    - expect: Atteso: breadcrumb coerente con la navigazione. Scenario 1.6
  28. Bug 28 - L'anno predefinito '2026' e le opzioni [2025,2026,2027] sono hardcoded; il body usa anno stringa ('2026') mentre gli altri valori sono numerici
    - expect: Atteso: anni derivati dai dati/dal servizio e tipi coerenti. Scenario 2.2
