# Piano di test - Ente / Download documenti (/ente/downloaddocumenti)

## Application Overview

Piano di test per la pagina "Download documenti" dell'area ente di portale-fatturazione-fe (componente src/page/ente/asyncDocumenti.tsx, rotta /ente/downloaddocumenti, PathPf.ASYNC_DOCUMENTI_ENTE). La pagina e' solo ENTE: i test stanno in tests/ente/asyncDocumenti/ e vengono eseguiti solo come ENTE. Mostra il titolo "Download documenti" (MainBoxStyled), due filtri data (MainFilter date_from_to) "Data inizio" e "Data fine", i pulsanti Filtra / Annulla filtri (FilterActionButtons; Annulla visibile solo se init o end sono valorizzati) e una GridCustom (nameParameterApi asyncDocEnte) con la lista delle richieste di documenti asincroni (export Notifiche). Colonne: freccia collapse, Data Richiesta (ordinabile via headerAction, parametro ordinamento), Anno, Mese, Tot. Not., Data Esecuzione, Stato (chip: Presa in carico, Elaborato, Elaborato no data, Errore), Letto (icona con tooltip "Letto"/"Non letto"), pulsante di download abilitato solo se descrizioneStato === "Elaborato". Le righe con letto=true hanno sfondo verde (#F0FFF0). La riga espandibile "Filtri Applicati" (keyCollapse "json") mostra Anno, Mese, Tipo Notifica, CAP, IUN, Stato Contestazione. Testo vuoto: "Non sono presenti documenti". Paginazione server-side (la pagina invia page+1). Filtri persistiti in localStorage (chiave "filters", hook useSavedFilters). L'app NON e' stata esplorata dal vivo (il browser del planner non e' partito): tutto e' derivato dal codice sorgente (asyncDocumenti.tsx, conf_GridAsyncDocEnte.tsx, gridCustom.tsx e riga collapsible, mainFilter.tsx date_from_to, useSaveFiltersLocalStorage); nomi accessibili e testid vanno confermati con browser_snapshot in fase di implementazione.

### Prerequisiti

- Regole CLAUDE.md: `test`/`expect` SEMPRE da tests/fixtures.ts (mai da @playwright/test); mai backend reale (API mockate, mock in tests/utils/asyncDocumentiMock/); locator solo getByRole / getByLabel / getByTestId (mai CSS/XPath); niente waitForTimeout (assertion web-first); niente login nei test: la sessione e' scritta da tests/auth.setup.ts nello storageState.
- Un file di test per area in tests/ente/asyncDocumenti/: titolo, filtri, grid, paginazione, download, persistenza-filtri. Pagina solo ENTE: la fixture `role` non serve.
- Stato iniziale di ogni scenario: pulito (localStorage senza chiave "filters"), sessione ente San Mauro Torinese con datiFatturazione=true e datiFatturazioneNotCompleted=false.
- tests/fixtures.ts risponde gia' a GET /api/notifiche/richiesta/count con 0; l'header lo chiama al caricamento pagina (verificato). Per verificare l'aggiornamento del contatore dopo il download serve un override specifico (es. 3).
- Fatti DOM noti da altri test del repo: con un modale MUI aperto il resto della pagina e' aria-hidden; il paginatore ha label /^\d+–\d+ of \d+$/; le select MUI di mainFilter non hanno nome accessibile; gli aria-label dei Tooltip finiscono sugli span che avvolgono l'elemento.

### API chiamate dalla pagina (host API_HOST, tutte con query nonce)

- POST /api/notifiche/richiesta?page=&pageSize= con body {init:"YYYY-MM-DD"|null, end:"YYYY-MM-DD"|null, ordinamento:number}; risposta {items:[...], count:N}. La pagina invia page+1. Al caricamento viene chiamata subito con {init:null,end:null,ordinamento:1}, page=1, pageSize=10, salvo filtri salvati. Con datiFatturazione=false o datiFatturazioneNotCompleted=true NON viene chiamata (si apre ModalRedirect). Viene richiamata anche quando cambia statoQueryGetUri (store globale).
- GET /api/notifiche/richiesta/download?idReport=<reportId>: risposta = stringa URL, usata come href di un link con download "Notifiche.csv". Subito dopo la pagina chiama GET /api/notifiche/richiesta/count (aggiorna il contatore header) e ricarica la lista con body/page/rows correnti.
- GET /api/notifiche/richiesta/count: anche dall'header al caricamento (gia' a 0 in fixtures.ts).
- Header/layout gia' coperte da defaultResponses di fixtures.ts: GET /api/auth/profilo, /api/apikey, /api/info-banner.
- Errori via manageError: 500 -> "L'operazione non è andata a buon fine. Si prega di riprovare"; 401 -> "Utente non autenticato. Effettuare nuovamente l'accesso" + redirect a Selfcare. Modali di caricamento: "Loading..." (lista) e "Downloading..." (download).

### Mock da creare (tests/utils/asyncDocumentiMock/)

1. asyncDocumentiMock.ts + asyncDocumentiMockType.ts con `mockAsyncDocumentiBase(page, opts)` che registra lista e download.
2. Generatore di documenti: campi reportId, dataInserimento, anno, mese, dataFine, stato/descrizioneStato, letto, totale notifiche, json (anno, mese, tipoNotifica, cap, iun, statoContestazione). Dataset: 25 e 33 elementi con tutti e 4 gli stati (Presa in carico, Elaborato, Elaborato no data, Errore), mix letto true/false, almeno una riga con json con tutti i campi a null e una con json assente.
3. Lista POST /api/notifiche/richiesta con risposta dipendente da page/pageSize/body (filtro per date e ordinamento) e cattura di query string e body per le asserzioni sul payload.
4. Varianti lista: vuota {items:[],count:0}, 401, 404, 500, risposta ritardata (promise controllata), fallimento solo alla seconda chiamata.
5. Download: GET richiesta/download con 200 (URL stringa, es. blob/data URL), 404, 500; override richiesta/count con 3 e con 500.
6. Sessioni: ente con datiFatturazione=false; ente con datiFatturazioneNotCompleted=true (globalStatePF modificato nello storageState/addInitScript).
7. Helper localStorage "filters" precompilato (tests/utils/filters.ts, gia' esistente: verificare/estendere).

### Note e dubbi da confermare con il team

- Filtra (handleFiltra) usa page e rowsPerPage correnti e NON torna a pagina 1: probabile bug (solo il cambio filtro azzera pagina/righe perche' clearOnChangeFilter svuota la griglia). Lo scenario 2.9 documenta il comportamento attuale.
- Nel flusso download, un errore di GET richiesta/count (o di getNotificheDownloadFromAsync dopo il click sul link) finisce nel catch: il file e' gia' stato richiesto ma la lista non viene ricaricata e compare un errore. Da confermare se voluto (scenario 5.6).
- Con datiFatturazione=false la lista non viene caricata (diverso da Notifiche).
- Il sort salva in localStorage solo body (non page/rows/totalData): dopo un reload possono non coincidere con la griglia.
- Il secondo useEffect su statusQueryGetUri e' marcato "DA VERIFICARE" nel codice: parte anche al primo render se isInitialRender e' false, con rischio di doppia chiamata alla lista.
- Il json della riga espandibile null/assente potrebbe non essere gestito (verificare dal vivo, scenario 3.6).
- Valori esatti di ordinamento (1/2/ulteriore stato) e opzioni di righe per pagina da verificare nel gridCustom.
- Date uguali o invalide in date_from_to: comportamento esatto da verificare dal vivo.
- Le etichette sono ricavate dal codice: confermare con browser_snapshot e aggiungere data-testid dove getByRole/getByLabel non bastano (celle, chip, icona Letto, paginatore).

## Test Scenarios

### 1. Titolo e accesso (tests/ente/asyncDocumenti/titolo.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 1.1. Titolo e caricamento iniziale

**File:** `tests/ente/asyncDocumenti/titolo.spec.ts`

**Steps:**
  1. Aprire /ente/downloaddocumenti con mock lista (25 documenti, 10 per pagina)
    - expect: Heading 'Download documenti' visibile
    - expect: Menu laterale con voce 'Download documenti' evidenziata
    - expect: Modale 'Loading...' visibile e poi chiuso
    - expect: POST /api/notifiche/richiesta?page=1&pageSize=10 chiamata subito con body {init:null,end:null,ordinamento:1}
    - expect: Griglia con 10 righe e paginatore '1-10 of 25'
    - expect: 'Filtra' visibile, 'Annulla filtri' assente
  2. Verificare i campi data
    - expect: Campi 'Data inizio' e 'Data fine' visibili, abilitati e vuoti

#### 1.2. Dati di fatturazione mancanti: ModalRedirect

**File:** `tests/ente/asyncDocumenti/titolo.spec.ts`

**Steps:**
  1. Impostare mainState.datiFatturazione=false in globalStatePF e aprire la pagina
    - expect: ModalRedirect con testo 'Per poter visualizzare la sezione Download Documenti è obbligatorio fornire i seguenti dati di fatturazione:'
    - expect: Nessuna chiamata a POST /api/notifiche/richiesta (differenza rispetto a Notifiche)
    - expect: Griglia vuota con 'Non sono presenti documenti'
  2. Ripetere con datiFatturazioneNotCompleted=true
    - expect: Stesso modale e stessa assenza di chiamata alla lista

#### 1.3. Token scaduto 401 sulla lista

**File:** `tests/ente/asyncDocumenti/titolo.spec.ts`

**Steps:**
  1. Mockare POST /api/notifiche/richiesta con 401 e aprire la pagina
    - expect: manageError mostra 'Utente non autenticato. Effettuare nuovamente l'accesso'
    - expect: Redirect a Selfcare dopo l'alert

#### 1.4. Contatore messaggi dell'header

**File:** `tests/ente/asyncDocumenti/titolo.spec.ts`

**Steps:**
  1. Aprire la pagina con il default di fixtures.ts (richiesta/count = 0)
    - expect: GET richiesta/count chiamata dall'header, nessun errore, contatore a 0

### 2. Filtri (tests/ente/asyncDocumenti/filtri.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 2.1. Presenza e stato iniziale dei filtri

**File:** `tests/ente/asyncDocumenti/filtri.spec.ts`

**Steps:**
  1. Aprire la pagina e cercare 'Data inizio' e 'Data fine' con getByLabel
    - expect: Entrambi presenti e vuoti
    - expect: 'Filtra' abilitato
    - expect: 'Annulla filtri' non visibile

#### 2.2. Selezione di Data inizio svuota la griglia

**File:** `tests/ente/asyncDocumenti/filtri.spec.ts`

**Steps:**
  1. Inserire una Data inizio valida (es. 01/09/2026)
    - expect: 'Annulla filtri' diventa visibile
    - expect: Griglia svuotata (clearOnChangeFilter): 'Non sono presenti documenti', paginatore '0-0 of 0'
    - expect: Nessuna nuova chiamata alla lista finche' non si clicca 'Filtra'

#### 2.3. Filtra con solo Data inizio, solo Data fine, intervallo completo

**File:** `tests/ente/asyncDocumenti/filtri.spec.ts`

**Steps:**
  1. Impostare solo Data inizio e cliccare 'Filtra'
    - expect: Body POST {init:'2026-09-01',end:null,ordinamento:1} (formato YYYY-MM-DD, senza orario)
    - expect: Griglia ripopolata
  2. Impostare solo Data fine e 'Filtra'
    - expect: Body {init:null,end:'YYYY-MM-DD',ordinamento:1}
  3. Impostare entrambe e 'Filtra'
    - expect: Body con init e end valorizzati, righe coerenti col mock

#### 2.4. Validazione intervallo: Data fine precedente a Data inizio

**File:** `tests/ente/asyncDocumenti/filtri.spec.ts`

**Steps:**
  1. Impostare Data inizio 10/09/2026 e Data fine 01/09/2026
    - expect: Campo in stato di errore (aria-invalid/messaggio di mainFilter date_from_to)
    - expect: 'Filtra' disabilitato finche' error e' true
    - expect: Nessuna chiamata alla lista
  2. Correggere Data fine (>= Data inizio)
    - expect: Errore rimosso, 'Filtra' riabilitato

#### 2.5. Validazione intervallo: Data inizio successiva a Data fine e date uguali

**File:** `tests/ente/asyncDocumenti/filtri.spec.ts`

**Steps:**
  1. Impostare prima Data fine, poi una Data inizio successiva
    - expect: Errore e 'Filtra' disabilitato (confronto simmetrico via keyCompare)
  2. Impostare Data inizio = Data fine
    - expect: Nessun errore, 'Filtra' abilitato (da confermare dal vivo)

#### 2.6. Data non valida o campo svuotato

**File:** `tests/ente/asyncDocumenti/filtri.spec.ts`

**Steps:**
  1. Digitare una data incompleta/non valida (es. 32/13/2026)
    - expect: Nessun crash; comportamento di errore/body da confermare dal vivo
  2. Svuotare un campo precedentemente compilato
    - expect: La chiave del body torna null; se entrambi vuoti 'Annulla filtri' scompare

#### 2.7. Annulla filtri

**File:** `tests/ente/asyncDocumenti/filtri.spec.ts`

**Steps:**
  1. Impostare le due date, 'Filtra' e poi 'Annulla filtri'
    - expect: Campi data svuotati, 'Annulla filtri' scompare
    - expect: Nuova POST con body {init:null,end:null,ordinamento:1}, page=1&pageSize=10
    - expect: Stato di errore azzerato
    - expect: localStorage 'filters' resettato

#### 2.8. Annulla filtri riporta a pagina 1 e 10 righe

**File:** `tests/ente/asyncDocumenti/filtri.spec.ts`

**Steps:**
  1. Impostare una data, andare a pagina 2 con 25 righe per pagina e cliccare 'Annulla filtri'
    - expect: Richiesta con page=1&pageSize=10, paginatore '1-10 of N'

#### 2.9. Annulla filtri azzera lo stato di errore delle date

**File:** `tests/ente/asyncDocumenti/filtri.spec.ts`

**Steps:**
  1. Creare un intervallo invalido (Filtra disabilitato; Annulla filtri visibile) e cliccare 'Annulla filtri'
    - expect: Campi vuoti, 'Filtra' riabilitato, lista ricaricata con body di default

#### 2.10. Filtra non resetta la pagina (dubbio)

**File:** `tests/ente/asyncDocumenti/filtri.spec.ts`

**Steps:**
  1. Andare a pagina 2 e cliccare 'Filtra' senza cambiare filtri
    - expect: Comportamento attuale: richiesta con page=2 (handleFiltra usa page e rowsPerPage correnti); se il team conferma che deve essere page=1, aggiornare il test
  2. Cambiare una data (page torna a 0) e cliccare 'Filtra'
    - expect: Richiesta con page=1&pageSize=10

### 3. Griglia (tests/ente/asyncDocumenti/grid.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 3.1. Intestazioni e contenuto delle righe

**File:** `tests/ente/asyncDocumenti/grid.spec.ts`

**Steps:**
  1. Con lista popolata verificare getByRole('columnheader')
    - expect: Colonne: (freccia), Data Richiesta, Anno, Mese, Tot. Not., Data Esecuzione, Stato, Letto, (download)
    - expect: Solo 'Data Richiesta' ha il controllo di sort
  2. Leggere una riga con dati noti
    - expect: Anno, Mese, Tot. Not., date formattate e chip Stato corretti

#### 3.2. Chip di stato

**File:** `tests/ente/asyncDocumenti/grid.spec.ts`

**Steps:**
  1. Mockare righe con stato Presa in carico, Elaborato, Elaborato no data, Errore
    - expect: Un chip con il testo corrispondente per ogni riga
    - expect: Varianti/colori distinti (da confermare dal vivo; asserire il testo)

#### 3.3. Icona Letto / Non letto e sfondo riga

**File:** `tests/ente/asyncDocumenti/grid.spec.ts`

**Steps:**
  1. Mockare una riga letto=true e una letto=false
    - expect: Riga letta: tooltip 'Letto' e sfondo verde #F0FFF0
    - expect: Riga non letta: tooltip 'Non letto' e sfondo standard

#### 3.4. Stato del pulsante download per ogni stato

**File:** `tests/ente/asyncDocumenti/grid.spec.ts`

**Steps:**
  1. Verificare il pulsante download di ogni riga
    - expect: Elaborato: abilitato
    - expect: Presa in carico: disabilitato
    - expect: Elaborato no data: disabilitato
    - expect: Errore: disabilitato

#### 3.5. Riga espandibile 'Filtri Applicati' con tutti i campi

**File:** `tests/ente/asyncDocumenti/grid.spec.ts`

**Steps:**
  1. Cliccare la freccia di una riga con json valorizzato
    - expect: Sezione 'Filtri Applicati' con colonne Anno, Mese, Tipo Notifica, CAP, IUN, Stato Contestazione e valori del json
    - expect: Nuovo click chiude la sezione

#### 3.6. Riga espandibile con campi json null

**File:** `tests/ente/asyncDocumenti/grid.spec.ts`

**Steps:**
  1. Mockare una riga con json a campi null (e una con json assente) ed espanderla
    - expect: Nessun errore JS, celle vuote o segnaposto secondo la conf
    - expect: Nessun crash con json assente (da confermare: il codice potrebbe non gestirlo)

#### 3.7. Ordinamento per Data Richiesta

**File:** `tests/ente/asyncDocumenti/grid.spec.ts`

**Steps:**
  1. Cliccare il controllo di sort di 'Data Richiesta'
    - expect: Richiesta con ordinamento diverso da 1 (valore esatto da gridCustom headerAction), page/pageSize correnti
    - expect: 'Annulla filtri' NON compare per il solo ordinamento (dipende da init/end)
  2. Cliccare di nuovo
    - expect: Nuova richiesta con il valore di ordinamento successivo

#### 3.8. Stato vuoto

**File:** `tests/ente/asyncDocumenti/grid.spec.ts`

**Steps:**
  1. Mockare la lista con {items:[],count:0}
    - expect: Testo 'Non sono presenti documenti'
    - expect: Paginatore '0-0 of 0' con next/prev disabilitati

#### 3.9. Errore 500 sulla lista

**File:** `tests/ente/asyncDocumenti/grid.spec.ts`

**Steps:**
  1. Mockare POST /api/notifiche/richiesta con 500
    - expect: Messaggio 'L'operazione non è andata a buon fine. Si prega di riprovare'
    - expect: 'Loading...' chiuso, griglia vuota
  2. Ripristinare il mock e cliccare 'Filtra'
    - expect: Griglia ripopolata

#### 3.10. Errore 404 sulla lista

**File:** `tests/ente/asyncDocumenti/grid.spec.ts`

**Steps:**
  1. Mockare la lista con 404
    - expect: Griglia vuota 'Non sono presenti documenti', errore gestito da manageError (testo da verificare), nessun crash

#### 3.11. Caricamento lento

**File:** `tests/ente/asyncDocumenti/grid.spec.ts`

**Steps:**
  1. Ritardare la risposta con una promise controllata
    - expect: 'Loading...' visibile e bloccante (resto della pagina aria-hidden) fino alla risposta

### 4. Paginazione (tests/ente/asyncDocumenti/paginazione.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 4.1. Cambio pagina

**File:** `tests/ente/asyncDocumenti/paginazione.spec.ts`

**Steps:**
  1. Mockare count=33 con risposta dipendente da page
    - expect: '1-10 of 33', 'Go to previous page' disabilitato
  2. Cliccare 'Go to next page'
    - expect: Richiesta page=2&pageSize=10 con il body corrente
    - expect: Label '11-20 of 33'
  3. Raggiungere l'ultima pagina
    - expect: 3 righe, '31-33 of 33', 'Go to next page' disabilitato
  4. Tornare indietro
    - expect: Richiesta con la pagina precedente

#### 4.2. Cambio righe per pagina resetta a pagina 1

**File:** `tests/ente/asyncDocumenti/paginazione.spec.ts`

**Steps:**
  1. Andare a pagina 2 e cambiare 'Rows per page' (valori da verificare, es. 10/25/50)
    - expect: Richiesta con page=1&pageSize=<nuovo>
    - expect: Label coerente '1-N of 33'

#### 4.3. La paginazione mantiene le date applicate

**File:** `tests/ente/asyncDocumenti/paginazione.spec.ts`

**Steps:**
  1. Filtrare con Data inizio e Data fine, poi cambiare pagina
    - expect: La richiesta di pagina 2 contiene init ed end nel body

#### 4.4. La paginazione mantiene l'ordinamento

**File:** `tests/ente/asyncDocumenti/paginazione.spec.ts`

**Steps:**
  1. Ordinare per Data Richiesta e cambiare pagina
    - expect: La richiesta contiene l'ordinamento scelto

### 5. Download (tests/ente/asyncDocumenti/download.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 5.1. Download di un documento Elaborato

**File:** `tests/ente/asyncDocumenti/download.spec.ts`

**Steps:**
  1. Mockare GET /api/notifiche/richiesta/download?idReport=<id> con URL stringa e richiesta/count con 3; cliccare il download di una riga Elaborato (page.waitForEvent('download'))
    - expect: 'Downloading...' visibile
    - expect: Richiesta con idReport uguale al reportId della riga
    - expect: Evento download con nome file 'Notifiche.csv'
    - expect: Chiamata a richiesta/count e contatore header a 3
    - expect: Lista ricaricata (nuova POST con page/rows/body correnti); 'Downloading...' si chiude solo dopo
    - expect: La riga risulta letta (sfondo verde) se il mock della ricarica la restituisce letto=true

#### 5.2. Download non possibile per stati diversi da Elaborato

**File:** `tests/ente/asyncDocumenti/download.spec.ts`

**Steps:**
  1. Verificare il pulsante download su righe Presa in carico, Elaborato no data, Errore
    - expect: Pulsante disabilitato, nessuna richiesta a /download

#### 5.3. Download mantiene pagina e filtri

**File:** `tests/ente/asyncDocumenti/download.spec.ts`

**Steps:**
  1. Con filtri date e pagina 2 scaricare un documento
    - expect: La lista ricaricata usa gli stessi body, page e rows

#### 5.4. Errore 500 sul download

**File:** `tests/ente/asyncDocumenti/download.spec.ts`

**Steps:**
  1. Mockare /download con 500
    - expect: Messaggio 'L'operazione non è andata a buon fine. Si prega di riprovare'
    - expect: 'Downloading...' chiuso, nessun file scaricato, nessuna chiamata a richiesta/count o alla lista

#### 5.5. Errore 404 sul download

**File:** `tests/ente/asyncDocumenti/download.spec.ts`

**Steps:**
  1. Mockare /download con 404
    - expect: Errore gestito da manageError (testo da verificare), modale chiuso, nessun file

#### 5.6. Errore su richiesta/count dopo il download

**File:** `tests/ente/asyncDocumenti/download.spec.ts`

**Steps:**
  1. Mockare richiesta/count con 500 dopo un download riuscito
    - expect: Comportamento attuale: il catch mostra l'errore e la lista non viene ricaricata; da confermare con il team

#### 5.7. Errore sul ricaricamento lista dopo il download

**File:** `tests/ente/asyncDocumenti/download.spec.ts`

**Steps:**
  1. Mockare la POST lista con 500 solo alla seconda chiamata
    - expect: listaDoc gestisce l'errore (manageError, griglia vuota), 'Downloading...' si chiude comunque

### 6. Persistenza filtri (tests/ente/asyncDocumenti/persistenza-filtri.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 6.1. Salvataggio dopo il caricamento lista

**File:** `tests/ente/asyncDocumenti/persistenza-filtri.spec.ts`

**Steps:**
  1. Impostare le date, 'Filtra' e leggere localStorage 'filters'
    - expect: Contiene pathPage '/ente/downloaddocumenti', body, page:0, rows:10, totalData uguale al count

#### 6.2. Ripristino dopo reload

**File:** `tests/ente/asyncDocumenti/persistenza-filtri.spec.ts`

**Steps:**
  1. Dopo il salvataggio ricaricare la pagina
    - expect: Date ripristinate nei campi, 'Annulla filtri' visibile
    - expect: Lista richiamata subito con le date salvate (YYYY-MM-DD)
    - expect: Paginatore con totalData salvato

#### 6.3. Ripristino di pagina, righe e ordinamento

**File:** `tests/ente/asyncDocumenti/persistenza-filtri.spec.ts`

**Steps:**
  1. Andare a pagina 2, cambiare righe per pagina, ordinare e ricaricare
    - expect: La richiesta iniziale usa page, pageSize e ordinamento salvati
    - expect: Il sort salva solo il body: page/rows salvati restano quelli dell'ultimo caricamento lista

#### 6.4. Annulla filtri pulisce la persistenza

**File:** `tests/ente/asyncDocumenti/persistenza-filtri.spec.ts`

**Steps:**
  1. Applicare filtri, 'Annulla filtri' e ricaricare
    - expect: Nessun filtro attivo, richiesta con body di default, pagina 1 e 10 righe

#### 6.5. Salvataggio dopo errore

**File:** `tests/ente/asyncDocumenti/persistenza-filtri.spec.ts`

**Steps:**
  1. Mockare la lista con 500 dopo aver impostato le date
    - expect: localStorage 'filters' salvato con body corrente, page:0, rows:10, totalData:0

#### 6.6. Filtri salvati di un altro pathPage o malformati

**File:** `tests/ente/asyncDocumenti/persistenza-filtri.spec.ts`

**Steps:**
  1. Precompilare 'filters' con pathPage di un'altra pagina e aprire la pagina
    - expect: Filtri ignorati: richiesta con body di default
  2. Precompilare 'filters' con JSON malformato o body.init non valido
    - expect: Nessun crash (nel codice non c'e' validazione: da verificare)

#### 6.7. Navigazione in altra pagina e ritorno

**File:** `tests/ente/asyncDocumenti/persistenza-filtri.spec.ts`

**Steps:**
  1. Applicare un filtro, aprire 'Notifiche' dal menu e tornare a 'Download documenti'
    - expect: I filtri non vengono mischiati con quelli di Notifiche (pathPage diverso)
