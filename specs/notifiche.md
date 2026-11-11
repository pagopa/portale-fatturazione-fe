# Piano di test - Notifiche (ENTE e ADMIN)

## Application Overview

Piano di test per la pagina "Notifiche" di portale-fatturazione-fe (componente src/page/prod_pn/reportDettaglioUtPa.tsx, importato come ReportDettaglio in src/router/route.tsx). Rotte: ENTE /ente/listanotifiche (PathPf.LISTA_NOTIFICHE_EN, auth SELFCARE, profilo PA), ADMIN /send/listanotifiche (PathPf.LISTA_NOTIFICHE, auth PAGOPA). La pagina e' testata come ENTE e come ADMIN: i test stanno in tests/condivisi/notifiche/ e usano la fixture `role` ('ente' | 'admin') per le asserzioni che cambiano tra ruoli. Titolo "Notifiche" con pulsante icona "Scadenzario contestazioni" (apre ModalScadenziario); filtri Anno, Mese, IUN, Tipo notifica (ENTE select singola, ADMIN multi checkbox), Contestazione (multi checkbox raggruppata per descrizione), CAP, Recipient ID e solo ADMIN Rag. Soc. Ente (autocomplete dopo 3 caratteri con debounce 800 ms), Consolidatore, Recapitista; pulsanti Filtra / Annulla filtri (visibile solo se i filtri differiscono dal default); "Download risultati"; griglia GridCustom con ordinamento server-side su "Data Evento" (asc -> desc -> nessuno) e paginazione server-side; click su riga = caricamento contestazione (ModalInfo o ModalContestazione). Filtri persistiti in localStorage con useSavedFilters (chiave profilePath). Nota: le sezioni REC/CON (profili Recapitista/Consolidatore, path /reccon/listanotifiche) sono nel componente ma fuori ambito di questo piano. Regole CLAUDE.md: `test`/`expect` SEMPRE da tests/fixtures.ts; mai backend reale (API mockate con page.route / HAR; fixtures.ts risponde 404 e annota `unmocked-api` alle API non mockate); locator solo getByRole / getByLabel / getByTestId; niente waitForTimeout (usare assertion web-first, per il debounce di 800 ms usare expect con timeout oppure page.clock); niente login nei test (tests/auth.setup.ts scrive globalStatePF nello storageState). Stato iniziale di ogni scenario: pulito (localStorage senza chiave "filters"), sessione ente San Mauro Torinese con datiFatturazione=true e datiFatturazioneNotCompleted=false, oppure sessione admin PAGOPA. Le etichette e i ruoli sono ricavati dal codice sorgente; l'app in esecuzione non e' stata esplorata dal vivo (richiede sessione/mock): in fase di implementazione confermare con browser_snapshot i nomi accessibili reali e aggiungere data-testid dove getByRole/getByLabel non bastano (es. celle griglia, chip, paginatore).

## Prerequisiti infrastrutturali (da creare)

- Fixture `role` ('ente' | 'admin') in tests/fixtures.ts: oggi NON esiste. Va aggiunta (es. projects Playwright "ente" e "admin" con storageState diversi, `role` letta da `testInfo.project.use` o option fixture).
- Sessione ADMIN: oggi esiste solo tests/utils/ente/sessioneEnte.ts. Creare tests/utils/admin/sessioneAdmin.ts (profilo {auth:"PAGOPA", profilo:"PAGOPA" o equivalente non REC/CON, jwt/nonce fittizi}) e uno storageState dedicato (es. tests/playwright/.auth/admin.json) scritto da tests/auth.setup.ts (senza chiamate al backend). Aggiornare playwright.config con i due progetti per tests/condivisi.
- Mock condivisi in tests/utils/notificheMock/notificheMock.ts (+ notificheMockType.ts) sul pattern di tests/utils/docEmessiMock: funzioni `mockNotificheBase(page, role, opts)`, `mockListaNotifiche`, `mockContestazione`, `mockDownload`. Le HAR in tests/hars/ seguono il pattern di listaCommessa; per questa pagina si consigliano mock page.route parametrizzabili (servono body diversi per paginazione, errori, debounce).

## API chiamate dalla pagina (host API_HOST, tutte con query nonce)

Comuni a ENTE e ADMIN (caricamento iniziale, in questo ordine/in parallelo):
- GET /api/tipologia/flagcontestazione (filtro Contestazione)
- GET /api/notifiche/anni (opzioni Anno)
- POST /api/notifiche/mesi body {anno:"<anno>"} (opzioni Mese; richiamata a ogni cambio Anno)
- GET /api/tipologia/prodotti (getTipologiaProdotto, path esatto da verificare in src/api/apiSelfcare/moduloCommessaSE/api) - risposta usata solo per stato interno
- GET /api/tipologia/profili (getTipologiaProfilo, path esatto da verificare in src/api/api.tsx) - idem
- Header/layout (gia' coperte da defaultResponses di fixtures.ts): GET /api/auth/profilo, /api/apikey, /api/info-banner, /api/notifiche/richiesta/count

Solo ENTE:
- POST /api/notifiche/ente?page=&pageSize=&columnName=&order= (lista; body senza idEnti/recapitisti/consolidatori/sort, tipoNotifica singolo numero o null; risposta {notifiche:[...], count:N}; 404 => lista vuota + manageError)
- GET /api/notifiche/contestazione/{idNotifica} (apertura contestazione)
- PUT /api/notifiche/contestazione (modifica nel ModalContestazione) e POST /api/notifiche/contestazione (creazione), GET /api/tipologia/tipocontestazione (select tipo nel modale)
- POST /api/v2/notifiche/ente/documento/ricerca (download asincrono; risposta {statusQueryGetUri}); 300, 404, 400 gestiti singolarmente
- GET /api/notifiche/richiesta/count (refresh contatore messaggi dopo il download; gia' di default a 0 in fixtures: per verificare l'aggiornamento serve un mock specifico, es. 3)
- GET /api/tipologia/scadenziariocontestazioni (ModalScadenziario)

Solo ADMIN:
- POST /api/notifiche/pagopa?page=&pageSize=&columnName=&order= (lista; body completo con idEnti/recapitisti/consolidatori, tipoNotifica array)
- POST /api/tipologia/enti/completi body {descrizione} (autocomplete Rag. Soc. Ente, dopo >=3 caratteri e 800 ms)
- POST /api/tipologia/enti/fornitori body {tipo:'REC'} e {tipo:'CON'} (liste Recapitista e Consolidatore; chiamate dopo il caricamento iniziale)
- GET /api/notifiche/pagopa/contestazione/{idNotifica}
- PUT /api/notifiche/pagopa/contestazione (modifica nel ModalContestazione)
- POST /api/notifiche/pagopa/documento/ricerca?binary=false (download CSV, responseType arraybuffer)
- GET /api/tipologia/scadenziariocontestazioni

## Mock da creare (riepilogo)

Esistenti riutilizzabili: defaultResponses di tests/fixtures.ts (profilo, apikey, info-banner, richiesta/count, richiesta/verifica) e pattern di tests/utils/docEmessiMock. Da creare:
1. flagcontestazione (almeno 2 gruppi di descrizione con 2 flag ciascuno)
2. notifiche/anni (es. [2026, 2025, 2024]) e notifiche/mesi per anno (es. 2026 -> mesi 9,8,7 descrizione in maiuscolo come da API; 2025 -> mesi diversi) + variante anni [] + variante 500
3. prodotti e profili (risposta minima)
4. ENTE: POST notifiche/ente con 25+ notifiche (tutte le colonne, almeno un record con contestazione valorizzata), varianti: lista vuota {notifiche:[],count:0}, 404, 500, risposta che dipende da page/pageSize/order per verificare query string e body; cattura del body per asserzioni sul payload
5. ADMIN: POST notifiche/pagopa stesse varianti, con ragioneSociale in ogni riga
6. contestazione ente e pagopa: (a) modifica=true; (b) modifica=false, chiusura=false, statoContestazione=1 (scaduta -> ModalInfo); (c) modifica=false, chiusura=false, statoContestazione != 1; (d) 500
7. ENTE download: POST v2/notifiche/ente/documento/ricerca con 200 {statusQueryGetUri}, 300, 404, 400 e 500; notifiche/richiesta/count con valore non zero (dopo download)
8. ADMIN download: POST pagopa/documento/ricerca?binary=false con 200 (CSV come arraybuffer, header Content-Type text/csv) e 500
9. tipologia/enti/completi (risposta dipendente da descrizione, con almeno 2 enti; variante vuota), tipologia/enti/fornitori per REC e CON
10. tipologia/scadenziariocontestazioni (lista con almeno 2 righe + variante 500), tipologia/tipocontestazione
11. Sessioni: ente con datiFatturazione=false; ente con datiFatturazioneNotCompleted=true; admin PAGOPA; localStorage "filters" precompilato (helper in tests/utils/filters.ts, gia' esistente, da verificare/estendere)

## Test Scenarios

### 1. Titolo e accesso (tests/condivisi/notifiche/titolo.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 1.1. Titolo e pulsante Scadenzario contestazioni [both]

**File:** `tests/condivisi/notifiche/titolo.spec.ts`

**Steps:**
  1. Aprire la rotta del ruolo (ente: /ente/listanotifiche, admin: /send/listanotifiche) con tutti i mock base
    - expect: Heading 'Notifiche' visibile
    - expect: Pulsante icona con nome/tooltip 'Scadenzario contestazioni' visibile e abilitato
    - expect: Il modale 'Loading...' compare e poi scompare
    - expect: Menu laterale con voce 'Notifiche' evidenziata
  2. Verificare gli elementi fissi
    - expect: Pulsanti 'Filtra' e 'Download risultati' visibili; 'Annulla filtri' assente

#### 1.2. Apertura e chiusura del modale Scadenzario contestazioni [both]

**File:** `tests/condivisi/notifiche/titolo.spec.ts`

**Steps:**
  1. Con mock di tipologia/scadenziariocontestazioni cliccare il pulsante 'Scadenzario contestazioni'
    - expect: ModalScadenziario aperto con i dati mockati
    - expect: Richiesta GET /api/tipologia/scadenziariocontestazioni effettuata
  2. Chiudere il modale
    - expect: Il modale non e' piu' visibile e la pagina sottostante e' invariata

#### 1.3. Scadenzario con errore API [both]

**File:** `tests/condivisi/notifiche/titolo.spec.ts`

**Steps:**
  1. Mockare scadenziariocontestazioni con 500 e aprire il modale
    - expect: Errore gestito da manageError, nessun crash, il modale e la pagina restano utilizzabili

#### 1.4. Ente con dati di fatturazione mancanti: ModalRedirect [ente]

**File:** `tests/condivisi/notifiche/titolo.spec.ts`

**Steps:**
  1. Impostare in globalStatePF mainState.datiFatturazione=false e aprire /ente/listanotifiche
    - expect: Compare ModalRedirect con testo 'Per poter visualizzare la lista delle Notifiche è obbligatorio fornire i seguenti dati di fatturazione:'
    - expect: Non viene chiamata POST /api/notifiche/ente (lista non caricata): griglia vuota
  2. Ripetere con datiFatturazioneNotCompleted=true
    - expect: Stesso modale, stessa assenza di chiamata alla lista

#### 1.5. Admin non vede il ModalRedirect [admin]

**File:** `tests/condivisi/notifiche/titolo.spec.ts`

**Steps:**
  1. Con sessione admin e datiFatturazione=false aprire /send/listanotifiche
    - expect: Il modale di redirect non compare (la condizione richiede profilo ente)

#### 1.6. Token scaduto / 401 sulle API [both]

**File:** `tests/condivisi/notifiche/titolo.spec.ts`

**Steps:**
  1. Mockare GET notifiche/anni con 401 e aprire la pagina
    - expect: Alert 'Utente non autenticato. Effettuare nuovamente l'accesso' (manageError) e redirect secondo il ruolo (ente: Selfcare, admin: da verificare)

### 2. Filtri (tests/condivisi/notifiche/filtri.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 2.1. Caricamento iniziale: anni, mesi, lista [both]

**File:** `tests/condivisi/notifiche/filtri.spec.ts`

**Steps:**
  1. Aprire la pagina con mock anni [2026,2025,2024], mesi del 2026 e lista
    - expect: Ordine delle chiamate: notifiche/anni, poi notifiche/mesi con body {anno:"2026"} (primo anno)
    - expect: Anno preselezionato = primo anno, Mese = primo mese restituito, con descrizione in formato 'Maiuscola iniziale + minuscole' (es. 'Settembre')
    - expect: ENTE: POST /api/notifiche/ente chiamata subito con page=1, pageSize=10 e body {anno, mese, tipoNotifica:null, statoContestazione:[], cap:null, iun:null, recipientId:null}; la griglia mostra le righe
    - expect: ADMIN: NESSUNA chiamata a POST /api/notifiche/pagopa al primo render; griglia vuota con 'Non sono presenti notifiche'; 'Download risultati' disabilitato
    - expect: ADMIN: chiamate a tipologia/enti/fornitori per REC e CON
    - expect: 'Annulla filtri' assente

#### 2.2. Presenza dei filtri per ruolo [both]

**File:** `tests/condivisi/notifiche/filtri.spec.ts`

**Steps:**
  1. Verificare i controlli con getByLabel/getByRole
    - expect: Per entrambi: Anno, Mese, IUN, Tipo notifica, Contestazione, CAP, Recipient ID
    - expect: ENTE: Tipo notifica e' una select singola; NON esistono Rag. Soc. Ente, Consolidatore, Recapitista
    - expect: ADMIN: Tipo notifica e' un multi checkbox (autocomplete con chip), esistono anche Rag. Soc. Ente, Consolidatore, Recapitista
    - expect: In ogni ruolo esiste una sola istanza visibile di 'Tipo notifica' (l'altra e' hidden)

#### 2.3. Opzioni di Anno e Mese [both]

**File:** `tests/condivisi/notifiche/filtri.spec.ts`

**Steps:**
  1. Aprire il select Anno
    - expect: Opzioni uguali ai valori mockati (2026, 2025, 2024)
  2. Aprire il select Mese
    - expect: Opzioni = mesi mockati per l'anno selezionato, con nome italiano e iniziale maiuscola

#### 2.4. Cambio Anno ricarica i mesi e svuota la griglia [both]

**File:** `tests/condivisi/notifiche/filtri.spec.ts`

**Steps:**
  1. Con griglia popolata (ente: automatico; admin: dopo Filtra) selezionare Anno 2025
    - expect: Richiesta POST notifiche/mesi con body {anno:"2025"}
    - expect: Mese impostato sul primo mese dell'anno 2025 e opzioni aggiornate
    - expect: Griglia svuotata ('Non sono presenti notifiche'), paginatore azzerato, 'Download risultati' disabilitato
    - expect: Nessuna nuova chiamata alla lista finche' non si clicca 'Filtra'
    - expect: 'Annulla filtri' visibile

#### 2.5. Cambio Mese svuota la griglia [both]

**File:** `tests/condivisi/notifiche/filtri.spec.ts`

**Steps:**
  1. Selezionare un mese diverso dal primo
    - expect: Griglia svuotata, pagina 1 e 10 righe, 'Annulla filtri' visibile

#### 2.6. Filtro IUN, CAP, Recipient ID [both]

**File:** `tests/condivisi/notifiche/filtri.spec.ts`

**Steps:**
  1. Digitare IUN, CAP e Recipient ID e cliccare 'Filtra'
    - expect: Il body della lista (ente: /notifiche/ente, admin: /notifiche/pagopa) contiene iun, cap e recipientId valorizzati
  2. Svuotare i campi e cliccare 'Filtra'
    - expect: Il body contiene iun:null, cap:null, recipientId:null (stringa vuota convertita in null)

#### 2.7. Input con valori speciali [both]

**File:** `tests/condivisi/notifiche/filtri.spec.ts`

**Steps:**
  1. Inserire in IUN '<script>alert(1)</script>' e in CAP spazi/lettere/testo molto lungo, poi 'Filtra'
    - expect: Nessun errore JS, nessun alert, la richiesta parte con il testo come stringa (comportamento di validazione CAP da confermare con il team: nel codice non c'e' validazione)

#### 2.8. Tipo notifica singolo [ente]

**File:** `tests/condivisi/notifiche/filtri.spec.ts`

**Steps:**
  1. Selezionare un tipo di notifica dalla select e cliccare 'Filtra'
    - expect: Il body di POST /api/notifiche/ente contiene tipoNotifica come numero singolo (non array)
  2. Riportare la select al valore vuoto e 'Filtra'
    - expect: tipoNotifica:null

#### 2.9. Tipo notifica multi checkbox [admin]

**File:** `tests/condivisi/notifiche/filtri.spec.ts`

**Steps:**
  1. Aprire 'Tipo notifica' e selezionare due opzioni
    - expect: Due chip visibili; 'Annulla filtri' visibile
  2. Cliccare 'Filtra'
    - expect: Il body di POST /api/notifiche/pagopa contiene tipoNotifica con i due id (array)
  3. Rimuovere un chip
    - expect: Resta un chip e il body successivo contiene un solo id

#### 2.10. Contestazione multi checkbox raggruppata [both]

**File:** `tests/condivisi/notifiche/filtri.spec.ts`

**Steps:**
  1. Aprire 'Contestazione'
    - expect: Opzioni raggruppate per 'descrizione' (intestazioni di gruppo) con i flag mockati
  2. Selezionare due flag di gruppi diversi e 'Filtra'
    - expect: Chip visibili; statoContestazione nel body contiene gli id selezionati
  3. Deselezionare un flag
    - expect: Un solo chip rimasto

#### 2.11. Autocomplete Rag. Soc. Ente: soglia di 3 caratteri e debounce [admin]

**File:** `tests/condivisi/notifiche/filtri.spec.ts`

**Steps:**
  1. Digitare 2 caratteri in 'Rag. Soc. Ente' e attendere oltre 800 ms (usare page.clock o expect con timeout, mai waitForTimeout)
    - expect: Nessuna richiesta POST /api/tipologia/enti/completi
  2. Digitare il terzo carattere
    - expect: Dopo ~800 ms parte UNA sola richiesta con body {descrizione:'<testo>'}; le opzioni mockate sono mostrate
  3. Digitare rapidamente piu' caratteri
    - expect: Il debounce evita richieste intermedie (una sola richiesta per il testo finale)
  4. Selezionare un ente
    - expect: Chip con la descrizione; dopo 'Filtra' il body contiene idEnti con l'idEnte selezionato

#### 2.12. Autocomplete senza risultati o in errore [admin]

**File:** `tests/condivisi/notifiche/filtri.spec.ts`

**Steps:**
  1. Mockare enti/completi con lista vuota e digitare 'zzz'
    - expect: Messaggio di nessuna opzione, nessun chip
  2. Mockare enti/completi con 500
    - expect: Errore gestito da manageError, pagina utilizzabile

#### 2.13. Consolidatore e Recapitista [admin]

**File:** `tests/condivisi/notifiche/filtri.spec.ts`

**Steps:**
  1. Aprire 'Consolidatore' e 'Recapitista'
    - expect: Opzioni = risposte mockate di enti/fornitori con tipo CON e REC
  2. Selezionare un consolidatore e un recapitista e 'Filtra'
    - expect: Il body contiene consolidatori e recapitisti con gli idEnte selezionati

#### 2.14. Visibilita' di 'Annulla filtri' [both]

**File:** `tests/condivisi/notifiche/filtri.spec.ts`

**Steps:**
  1. Stato iniziale (filtri di default)
    - expect: 'Annulla filtri' non visibile
  2. Modificare un qualsiasi filtro (Anno diverso dal primo, Mese diverso dal primo, IUN, CAP, Recipient ID, Contestazione, Tipo notifica, ordinamento attivo; admin anche Rag. Soc., Consolidatore, Recapitista)
    - expect: Per ciascuno 'Annulla filtri' diventa visibile
  3. Riportare il filtro al valore di default
    - expect: 'Annulla filtri' scompare (per i campi testo svuotati)

#### 2.15. Filtra torna a pagina 1 con 10 righe [both]

**File:** `tests/condivisi/notifiche/filtri.spec.ts`

**Steps:**
  1. Andare a pagina 2 con 25 righe per pagina e cliccare 'Filtra'
    - expect: Richiesta con page=1&pageSize=10; il paginatore mostra '1-10 of N'

#### 2.16. Filtra ADMIN carica la lista [admin]

**File:** `tests/condivisi/notifiche/filtri.spec.ts`

**Steps:**
  1. Dal primo render (griglia vuota) cliccare 'Filtra'
    - expect: POST /api/notifiche/pagopa?page=1&pageSize=10&columnName=null&order=null con anno e mese di default
    - expect: Griglia popolata, 'Download risultati' abilitato

#### 2.17. Annulla filtri ripristina i default [both]

**File:** `tests/condivisi/notifiche/filtri.spec.ts`

**Steps:**
  1. Impostare filtri (Anno, Mese, IUN, Contestazione, admin anche Rag. Soc.) e cliccare 'Annulla filtri'
    - expect: Anno/Mese tornano al primo anno/mese, campi testo e chip azzerati, pagina 1 e 10 righe
    - expect: Vengono richiamate notifiche/anni e notifiche/mesi (stesso flusso del primo render)
    - expect: ENTE: lista ricaricata con filtri di default; ADMIN: la lista NON viene ricaricata per effetto di isInitialRender (da verificare: la griglia puo' restare/diventare vuota)
    - expect: 'Annulla filtri' scompare

#### 2.18. Filtri senza anni disponibili [both]

**File:** `tests/condivisi/notifiche/filtri.spec.ts`

**Steps:**
  1. Mockare notifiche/anni con []
    - expect: Select Anno senza opzioni, nessuna chiamata a mesi/lista, nessun errore, loading chiuso

#### 2.19. Errore su anni o mesi [both]

**File:** `tests/condivisi/notifiche/filtri.spec.ts`

**Steps:**
  1. Mockare notifiche/anni con 500
    - expect: Loading chiuso, filtri non popolati, pagina utilizzabile (errore solo in console: 'Error NOTIFICHE')
  2. Mockare notifiche/mesi con 500 dopo il cambio Anno
    - expect: manageError visualizzato e loading chiuso

### 3. Griglia (tests/condivisi/notifiche/grid.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 3.1. Intestazioni per ruolo [both]

**File:** `tests/condivisi/notifiche/grid.spec.ts`

**Steps:**
  1. Con lista popolata verificare le colonne con getByRole('columnheader')
    - expect: ENTE: Contestazione, Event ID, Onere, Recipient ID, Anno, Mese, Data Evento, Tipo Notifica, IUN, Data Postalizzazione, Stato estero, CAP, Costo, colonna freccia vuota
    - expect: ADMIN: come ENTE ma con 'Ragione Sociale' dopo Data Evento e 'Stato Estero' (E maiuscola)
    - expect: ENTE non ha la colonna 'Ragione Sociale'

#### 3.2. Formattazione e contenuto delle righe [both]

**File:** `tests/condivisi/notifiche/grid.spec.ts`

**Steps:**
  1. Osservare una riga con dati noti
    - expect: Mese come nome, Data Evento in formato data-ora, Data Postalizzazione solo data, Costo formattato da centesimi in euro, Onere tradotto da getOnereLabel
    - expect: Valori nulli resi senza errori

#### 3.3. Stato vuoto [both]

**File:** `tests/condivisi/notifiche/grid.spec.ts`

**Steps:**
  1. Mockare lista con {notifiche:[],count:0} e cliccare 'Filtra' (admin) o aprire pagina (ente)
    - expect: Testo 'Non sono presenti notifiche'; paginatore '0-0 of 0'; 'Download risultati' disabilitato

#### 3.4. Ordinamento server-side su Data Evento [both]

**File:** `tests/condivisi/notifiche/grid.spec.ts`

**Steps:**
  1. Cliccare il pulsante di sort di 'Data Evento' (1 click)
    - expect: Richiesta con columnName=data&order=1 (asc), pagina 1, 10 righe; 'Annulla filtri' visibile
  2. Secondo click
    - expect: Richiesta con columnName=data&order=2 (desc)
  3. Terzo click
    - expect: Richiesta con columnName=null&order=null (nessun ordinamento)
  4. Verificare che sono ordinabili solo le colonne con headerActionSort
    - expect: Solo 'Data Evento' ha il controllo di sort

#### 3.5. Griglia disabilitata durante il caricamento [both]

**File:** `tests/condivisi/notifiche/grid.spec.ts`

**Steps:**
  1. Ritardare la risposta della lista (route con delay controllato da una promise)
    - expect: Modale 'Loading...' visibile; 'Filtra', 'Annulla filtri' e 'Download risultati' non utilizzabili finche' la risposta non arriva

#### 3.6. Errore 500 sulla lista [both]

**File:** `tests/condivisi/notifiche/grid.spec.ts`

**Steps:**
  1. Mockare la lista con 500
    - expect: manageError visualizzato, loading chiuso, griglia vuota, 'Download risultati' disabilitato (apiError !== null)
  2. Ripristinare il mock e cliccare 'Filtra'
    - expect: Griglia ripopolata (verificare la riabilitazione del download dopo errore)

#### 3.7. Errore 404 sulla lista [ente]

**File:** `tests/condivisi/notifiche/grid.spec.ts`

**Steps:**
  1. Mockare POST /api/notifiche/ente con 404
    - expect: Lista vuota, count 0, 'Non sono presenti notifiche', manageError gestito

#### 3.8. Link Event ID / snackbar [both]

**File:** `tests/condivisi/notifiche/grid.spec.ts`

**Steps:**
  1. Interagire con la cella Event ID (colonna di tipo snackbar)
    - expect: Comportamento di copia/snackbar da verificare dal vivo (nessun navigation)

### 4. Contestazione dal click sulla riga (tests/condivisi/notifiche/contestazione.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 4.1. Click su riga: apertura ModalContestazione [both]

**File:** `tests/condivisi/notifiche/contestazione.spec.ts`

**Steps:**
  1. Mockare la GET contestazione (ente: /api/notifiche/contestazione/{id}, admin: /api/notifiche/pagopa/contestazione/{id}) con modifica=true e cliccare una riga
    - expect: Richiesta con l'idNotifica della riga
    - expect: ModalContestazione aperto con i dati della contestazione; ENTE: campo risposta ente valorizzato da rispostaEnte
    - expect: Modale 'Loading...' scompare

#### 4.2. Contestazione scaduta: ModalInfo [both]

**File:** `tests/condivisi/notifiche/contestazione.spec.ts`

**Steps:**
  1. Mockare la GET con modifica=false, chiusura=false, statoContestazione=1 e cliccare una riga
    - expect: ModalInfo con testo 'Non è possibile creare una contestazione.'
    - expect: ModalContestazione NON aperto
  2. Chiudere il ModalInfo
    - expect: Modale chiuso, griglia invariata

#### 4.3. modifica=false/chiusura=false con stato diverso da 1 [both]

**File:** `tests/condivisi/notifiche/contestazione.spec.ts`

**Steps:**
  1. Mockare modifica=false, chiusura=false, statoContestazione=2 e cliccare una riga
    - expect: Si apre ModalContestazione (in sola lettura/azioni limitate; da verificare dal vivo), NON il ModalInfo

#### 4.4. Errore sulla GET contestazione [both]

**File:** `tests/condivisi/notifiche/contestazione.spec.ts`

**Steps:**
  1. Mockare la GET contestazione con 500 e cliccare una riga
    - expect: manageError visualizzato, loading chiuso, nessun modale contestazione aperto

#### 4.5. Chiusura del ModalContestazione senza salvare [both]

**File:** `tests/condivisi/notifiche/contestazione.spec.ts`

**Steps:**
  1. Aprire il modale, modificare un campo e chiudere/annullare
    - expect: Nessuna chiamata PUT/POST; riaprendo la stessa riga i valori sono quelli originali

#### 4.6. Salvataggio contestazione e ricarico lista [both]

**File:** `tests/condivisi/notifiche/contestazione.spec.ts`

**Steps:**
  1. Aprire il modale, compilare i campi e salvare con mock PUT 200 (ente: /api/notifiche/contestazione, admin: /api/notifiche/pagopa/contestazione)
    - expect: Richiesta con il body atteso, modale chiuso, lista ricaricata con page/rows correnti (funGetNotifiche / funGetNotifichePagoPa)
  2. Ripetere con PUT 500
    - expect: Errore gestito, la griglia non viene corrotta (dettaglio dei campi del modale da definire leggendo src/components/reportDettaglio/modalContestazione)

### 5. Paginazione (tests/condivisi/notifiche/paginazione.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 5.1. Cambio pagina [both]

**File:** `tests/condivisi/notifiche/paginazione.spec.ts`

**Steps:**
  1. Mockare la lista con count=33 (10 righe per pagina) e, per admin, cliccare 'Filtra'
    - expect: '1-10 of 33', 'Go to previous page' disabilitato
  2. Cliccare 'Go to next page'
    - expect: Richiesta con page=2&pageSize=10 usando il body applicato (bodyDownload); label '11-20 of 33'
  3. Raggiungere l'ultima pagina
    - expect: 3 righe, '31-33 of 33', 'Go to next page' disabilitato
  4. Tornare indietro
    - expect: Richiesta con la pagina precedente

#### 5.2. Cambio righe per pagina [both]

**File:** `tests/condivisi/notifiche/paginazione.spec.ts`

**Steps:**
  1. Aprire 'Rows per page' e scegliere un valore diverso da 10 (valori disponibili da verificare)
    - expect: Richiesta con pageSize=<nuovo valore> e stessa pagina corrente (nel codice il numero di pagina non viene azzerato: verificare il comportamento atteso con il team); label coerente col totale

#### 5.3. La paginazione usa i filtri applicati, non quelli solo selezionati [both]

**File:** `tests/condivisi/notifiche/paginazione.spec.ts`

**Steps:**
  1. Applicare 'Filtra' con IUN='A', poi digitare IUN='B' senza Filtra (la griglia viene svuotata) e riapplicare Filtra con 'A' e cambiare pagina
    - expect: La richiesta di pagina 2 contiene il body applicato dell'ultimo Filtra

#### 5.4. Pagina 1 dopo ogni cambio filtro/ordinamento [both]

**File:** `tests/condivisi/notifiche/paginazione.spec.ts`

**Steps:**
  1. Andare a pagina 2, cambiare l'ordinamento di 'Data Evento'
    - expect: Richiesta con page=1&pageSize=10
  2. Andare a pagina 2, cliccare 'Annulla filtri'
    - expect: Pagina 1 con 10 righe

### 6. Download (tests/condivisi/notifiche/download.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 6.1. Download disabilitato con lista vuota o in caricamento [both]

**File:** `tests/condivisi/notifiche/download.spec.ts`

**Steps:**
  1. Admin al primo render, oppure ente con lista vuota
    - expect: 'Download risultati' disabilitato
  2. Durante il caricamento (risposta lista ritardata)
    - expect: Disabilitato finche' la risposta non arriva, poi abilitato se la lista ha righe

#### 6.2. Download asincrono: presa in carico [ente]

**File:** `tests/condivisi/notifiche/download.spec.ts`

**Steps:**
  1. Mockare POST /api/v2/notifiche/ente/documento/ricerca con 200 {statusQueryGetUri:'...'} e GET /api/notifiche/richiesta/count con 3, poi cliccare 'Download risultati'
    - expect: Modale 'Elaborazione in corso' visibile e poi chiuso
    - expect: Body della richiesta = filtri applicati (senza idEnti/recapitisti/consolidatori/sort; tipoNotifica singolo o null)
    - expect: Messaggio di 'presa in carico' (PRESA_IN_CARICO_DOCUMENTO_ENTE) visibile
    - expect: Viene chiamata GET /api/notifiche/richiesta/count e il contatore messaggi dell'header si aggiorna a 3
    - expect: Nessun file scaricato direttamente

#### 6.3. Download ente: errore nel conteggio messaggi ignorato [ente]

**File:** `tests/condivisi/notifiche/download.spec.ts`

**Steps:**
  1. Mockare download 200 e richiesta/count con 500
    - expect: Presa in carico mostrata comunque, nessun errore visibile aggiuntivo

#### 6.4. Download ente status 300: richiesta doppia [ente]

**File:** `tests/condivisi/notifiche/download.spec.ts`

**Steps:**
  1. Mockare il download con status 300
    - expect: Messaggio DOWNLOAD_NOTIFICHE_DOUBLE_REQUEST (richiesta gia' presa in carico), modale 'Elaborazione in corso' chiuso, nessuna chiamata a richiesta/count

#### 6.5. Download ente status 404 [ente]

**File:** `tests/condivisi/notifiche/download.spec.ts`

**Steps:**
  1. Mockare il download con status 404
    - expect: Messaggio generato da managePresaInCarico(400) (testo da verificare in src/api/api.tsx), modale chiuso

#### 6.6. Download ente status 400 [ente]

**File:** `tests/condivisi/notifiche/download.spec.ts`

**Steps:**
  1. Mockare il download con status 400
    - expect: Messaggio NO_OPERAZIONE, diverso dai messaggi di 300 e 404; modale chiuso

#### 6.7. Download ente errore generico 500 [ente]

**File:** `tests/condivisi/notifiche/download.spec.ts`

**Steps:**
  1. Mockare il download con status 500
    - expect: Errore gestito da manageError, modale chiuso; 'Download risultati' disabilitato di conseguenza (apiError !== null)

#### 6.8. Download CSV [admin]

**File:** `tests/condivisi/notifiche/download.spec.ts`

**Steps:**
  1. Dopo 'Filtra', mockare POST /api/notifiche/pagopa/documento/ricerca?binary=false con CSV e cliccare 'Download risultati' (attendere page.waitForEvent('download'))
    - expect: Modale 'Downloading...' visibile e poi chiuso
    - expect: Evento download con nome file 'Notifiche /<Mese> /<anno>.csv' (sanitizzato dal browser)
    - expect: Body della richiesta senza sort, con idEnti/recapitisti/consolidatori
  2. Filtrare per un solo ente (Rag. Soc. Ente con 1 chip) e scaricare
    - expect: Nome file 'Notifiche/<ragioneSociale prima riga>/<Mese>/<anno>.csv'

#### 6.9. Errore sul download CSV [admin]

**File:** `tests/condivisi/notifiche/download.spec.ts`

**Steps:**
  1. Mockare il download pagopa con 500
    - expect: manageError visualizzato, 'Downloading...' chiuso, nessun file scaricato

#### 6.10. Il download usa i filtri applicati [both]

**File:** `tests/condivisi/notifiche/download.spec.ts`

**Steps:**
  1. Applicare 'Filtra' con IUN='A' e scaricare; poi cambiare IUN senza Filtra
    - expect: Il primo download usa iun='A'; dopo la modifica 'Download risultati' e' disabilitato (griglia svuotata) fino a nuovo Filtra

### 7. Persistenza dei filtri (tests/condivisi/notifiche/persistenza-filtri.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 7.1. Salvataggio dopo Filtra [both]

**File:** `tests/condivisi/notifiche/persistenza-filtri.spec.ts`

**Steps:**
  1. Impostare Anno, Mese, IUN, Contestazione (admin anche Rag. Soc. e Tipo notifica multi) e cliccare 'Filtra'
    - expect: localStorage 'filters' contiene pathPage = rotta del ruolo (ente '/ente/listanotifiche', admin '/send/listanotifiche'), il body, page:0, rows:10, i valori degli autocomplete

#### 7.2. Ripristino dopo reload [both]

**File:** `tests/condivisi/notifiche/persistenza-filtri.spec.ts`

**Steps:**
  1. Dopo il punto 7.1 ricaricare la pagina
    - expect: Anno e Mese letti dal localStorage (mesi richiesti con l'anno salvato), campi e chip ripristinati
    - expect: ENTE e ADMIN: la lista viene caricata subito (per admin ora la chiamata c'e' perche' esistono filtri salvati)
    - expect: 'Annulla filtri' visibile

#### 7.3. Ripristino di pagina e righe per pagina [both]

**File:** `tests/condivisi/notifiche/persistenza-filtri.spec.ts`

**Steps:**
  1. Andare a pagina 2, cambiare righe per pagina e ricaricare
    - expect: Richiesta con page e pageSize salvati; il paginatore mostra pagina e righe corrette

#### 7.4. Ripristino dell'ordinamento [both]

**File:** `tests/condivisi/notifiche/persistenza-filtri.spec.ts`

**Steps:**
  1. Ordinare per 'Data Evento' (asc) e ricaricare
    - expect: La richiesta contiene columnName=data&order=1; nota: updateFilters dell'ordinamento salva solo body/page/rows (gli autocomplete non vengono salvati in quel punto: verificare se si perdono al reload)

#### 7.5. Annulla filtri pulisce la persistenza [both]

**File:** `tests/condivisi/notifiche/persistenza-filtri.spec.ts`

**Steps:**
  1. Applicare filtri, cliccare 'Annulla filtri' e ricaricare
    - expect: localStorage 'filters' rimosso/svuotato; nessun filtro attivo, pagina 1 con 10 righe; ADMIN: griglia vuota come al primo render

#### 7.6. Persistenza separata per ruolo/pagina [both]

**File:** `tests/condivisi/notifiche/persistenza-filtri.spec.ts`

**Steps:**
  1. Salvare filtri su Notifiche, aprire un'altra pagina dal menu (es. Documenti contabili emessi) e tornare
    - expect: Filtri Notifiche mantenuti e non mischiati con quelli dell'altra pagina (pathPage diverso)

#### 7.7. Filtri salvati non validi [both]

**File:** `tests/condivisi/notifiche/persistenza-filtri.spec.ts`

**Steps:**
  1. Precompilare localStorage 'filters' con un anno inesistente nei mock oppure JSON malformato e aprire la pagina
    - expect: Nessun crash della pagina (nel codice non c'e' validazione: comportamento da verificare, es. mesi con 404/lista vuota)

#### 7.8. Filtri di un altro pathPage ignorati [both]

**File:** `tests/condivisi/notifiche/persistenza-filtri.spec.ts`

**Steps:**
  1. Precompilare 'filters' con pathPage di un'altra pagina e aprire Notifiche
    - expect: Filtri non applicati, comportamento di default del ruolo (ente: lista con default; admin: griglia vuota)

## Note e comportamenti da confermare con il team

- ADMIN: dopo 'Annulla filtri' la lista non viene ricaricata perche' funInitialRender imposta isInitialRender.current=true prima della chiamata e la condizione admin richiede filtri salvati (resetFilters viene eseguito dopo): verificare il comportamento reale.
- handleChangeRowsPerPage non azzera la pagina corrente e invia page+1: confermare se e' voluto.
- Le richieste di lista usano la stringa 'null' nella query (columnName=null&order=null) quando non c'e' ordinamento.
- Nome file download ADMIN con un solo ente usa notificheList[0].ragioneSociale (puo' non coincidere con l'ente filtrato se la lista e' vuota: rischio errore).
- Il file e' stato scritto senza esplorazione dal vivo dell'app: nomi accessibili e testid vanno validati in fase di implementazione.

