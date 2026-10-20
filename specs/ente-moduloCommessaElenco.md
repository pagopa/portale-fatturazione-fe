# Piano di test - Ente / Modulo commessa elenco (/ente/modulicommessa)

## Application Overview

Piano di test per la pagina "Modulo commessa" (elenco moduli) dell'area ente di portale-fatturazione-fe (componente src/page/ente/moduloCommessaElencoUtPa.tsx, rotta /ente/modulicommessa, PathPf.LISTA_COMMESSE). La pagina e' solo ENTE: i test stanno in tests/ente/moduloCommessaElenco/ e vengono eseguiti solo come ENTE. Mostra il titolo "Modulo commessa" (Typography h4), la select MUI "Filtra per anno", i pulsanti "Filtra" / "Annulla filtri",al primo redirect la pagina viene visualizzata (solo se verifica obbligatori = false)  ( se verifica obbligatori = true) c'è il rediret to "ente/modulocommessa" , al click sul button Indietro viene visualizzata la pagina  /ente/modulicommessa  con il pulsante "Inserisci modulo commessa" visibile ,il pulsante "Inserisci modulo commessa" è visible solo quando verifica obbligatori = true, una nota (caption) sul periodo di inserimento e una GridCustom (nameParameterApi modComTrimestrale, config subHeaderNameModComTrimestraleENTE) con paginationVisibile=false: NON c'e' paginazione ne' server ne' client, la griglia mostra tutte le righe restituite. Colonne: Mese/Anno (cliccabile, makeAction), Stato (icona CheckCircle con Tooltip obbligatorio/archiviato/facoltativo), Inserimento (chip "Inserito" se totaleNotifiche !== null, altrimenti "Non inserito"), Data inserimento, Data chiusura (archiviato "--", facoltativo "TBD", altrimenti dataChiusura formattata gg-Mmm-aaaa o "--"), Tot. Digit., Tot. Digit. Int., Tot. AR., Tot. AR. Int., Tot. 890., Tot. Not., freccia (IconButton senza aria-label). Click su cella Mese/Anno o sulla freccia chiama handleClickOnDetail. Il componente NON passa sentenseEmpty alla griglia: con lista vuota non compare alcun testo "Non sono presenti ...". Filtri persistiti in localStorage (chiave "filters", hook useSavedFilters con pathPage /ente/modulicommessa). L'app NON e' stata esplorata dal vivo (il browser del planner non e' stato avviato): tutto e' derivato dal codice (moduloCommessaElencoUtPa.tsx, config_SubGridModComEnte.tsx, typeModuloCommessaElenco.tsx, function.tsx manipulateObjModuloCommessa e transformDateTimeWithNameMonth, api.tsx moduloCommessaSE, gridCustom.tsx, gridCell.tsx, useSaveFiltersLocalStorage.ts, sidNavEnte.tsx); nomi accessibili e testid vanno confermati con browser_snapshot in fase di implementazione.

### Prerequisiti

- Regole CLAUDE.md: `test`/`expect` SEMPRE da tests/fixtures.ts (mai da @playwright/test); mai backend reale (API mockate, mock in tests/utils/moduloCommessaElencoMock/); locator solo getByRole / getByLabel / getByTestId (mai CSS/XPath); niente waitForTimeout (assertion web-first); niente login nei test: la sessione e' scritta da tests/auth.setup.ts nello storageState.
- Un file di test per area in tests/ente/moduloCommessaElenco/: titolo, navigazione (inserimento e redirect), filtri, grid, dettaglio-riga (click su riga), persistenza-filtri. Non esiste il file paginazione (paginationVisibile=false). Pagina solo ENTE: la fixture `role` non serve.
- Stato iniziale di ogni scenario: pulito (localStorage senza chiavi "filters" e "redirectToInsert"), sessione ente con datiFatturazione=true e datiFatturazioneNotCompleted=false. Dove serve, il valore di redirectToInsert va scritto con addInitScript PRIMA del goto.
- tests/fixtures.ts risponde 404 alle API non mockate e mocka gia' profilo, apikey, info-banner e richiesta/count.
- Fatti DOM noti dal repo: con un modale MUI aperto il resto della pagina e' aria-hidden; le select MUI senza labelId non hanno nome accessibile (qui InputLabel non e' collegata: la select e' senza id e senza labelId, quindi si localizza in modo posizionale con getByRole('combobox'); le opzioni con getByRole('option')); gli aria-label dei Tooltip finiscono sugli span che avvolgono l'icona (usare getByLabel); la voce di menu laterale e' getByRole("navigation").getByRole("button", {name}) e quella attiva ha classe Mui-selected; useSaveFiltersLocalStorage fa JSON.parse senza try/catch (crash noto) e rimuove "filters" se pathPage e' diverso.
- Attenzione: il vecchio test usa selettori CSS (`div#filter_anno`, `#nav_modulocommessa`, `td[id*="Mese/Anno"]`, `#chip-N`) che nel componente attuale non risultano (la select non ha id): non riutilizzarli, aggiungere data-testid dove getByRole non basta (celle Mese/Anno, chip, freccia di riga).

### API chiamate dalla pagina (host API_HOST, tutte GET con query nonce)

- GET /api/v2/modulocommessa/obbligatori/verifica?nonce=... risposta booleana (true/false), salvata in isMandatory e usata per mostrare il pulsante "Inserisci modulo commessa".
- GET /api/modulocommessa/anni?nonce=... risposta array di stringhe anno (es. ["2024","2025","2026","2027","2028"], dati di tests/utils/moduloCommessaMock/moduloCommessaMock.ts). Gli errori sono ignorati (catch vuoto).
- GET /api/v2/modulocommessa/lista?nonce=... (senza anno) oppure GET /api/v2/modulocommessa/lista/<anno>?nonce=... (con anno, es. /lista/2026). Risposta array di DataGridCommessa: annoValidita, meseValidita, source (obbligatorio|archiviato|facoltativo), totaleNotifiche, totaleNotificheDigitaleNaz, totaleNotificheDigitaleInternaz, totaleNotificheAnalogicoARNaz, totaleNotificheAnalogicoARInternaz, totaleNotificheAnalogico890Naz, dataInserimento, dataChiusura, modifica, quarter, ecc.
- Header/layout gia' coperti da fixtures.ts: /api/auth/profilo, /api/apikey, /api/info-banner, /api/notifiche/richiesta/count.
- Errori: manageError imposta mainState.apiError (401/404/419/400/403/410/500/409, "Network Error") e il layout mostra il relativo modale/alert; i testi esatti vanno confermati dal vivo (il piano asyncDocumenti riporta per 500 "L'operazione non è andata a buon fine. Si prega di riprovare" e per 401 "Utente non autenticato. Effettuare nuovamente l'accesso" con redirect a Selfcare). Per la verifica restano utili le asserzioni di rete e il fatto che la pagina non vada in crash.
- Flusso al caricamento: se datiFatturazione===false o datiFatturazioneNotCompleted===true si apre ModalRedirect "Per poter inserire il modulo commessa è obbligatorio fornire  i seguenti dati di fatturazione:" (DOPPIO spazio dopo "fornire") e NON parte nessuna API. Altrimenti: Skeleton a tutta pagina (loadingMandatory) -> verifica. Se verifica=true E localStorage redirectToInsert true -> navigate a /ente/modulocommessa (nessuna chiamata a anni/lista). Altrimenti scrive redirectToInsert=false, chiama anni e lista (con valueSelect dei filtri salvati se presenti e isInitialRender), azzera infoTrimestreComSelected, rimuove lo Skeleton, e mostra il pulsante Inserisci se verifica=true. Errore su verifica: skeleton rimosso, manageError.

### Mock da creare (tests/utils/moduloCommessaElencoMock/)

I file HAR in tests/hars/listaCommessa/modulocommessa.har e tests/hars/listaCommessaWithAnno/modulocommessa-2024|2025|2026.har sono letti dal vecchio test con routeFromHAR; i corpi delle risposte sono salvati in file esterni (`_file`, es. d517c86e...json = lista 2026, 15331 byte) che NON sono presenti nel repo: non e' stato possibile leggere i dati reali. Verificare che i file _file esistano in locale; altrimenti rigenerare i dati. In ogni caso i nuovi mock devono essere generati in codice (non da HAR) per poter variare source, null e mesi.

1. moduloCommessaElencoMock.ts + moduloCommessaElencoMockType.ts con `mockModuloCommessaElenco(page, opts)` che registra verifica (opts.verifica true|false|status errore), anni (opts.anni | status errore | ritardo) e lista (con e senza anno), riusando anniModuloCommessaMock e mesiGridTest da tests/utils/moduloCommessaMock/moduloCommessaMock.ts.
2. Generatore di righe lista: 12 mesi per anno con mix di source (obbligatorio, archiviato, facoltativo), righe "Inserito" (totali valorizzati, dataInserimento/dataChiusura ISO) e "Non inserito" (totaleNotifiche null e totali null), mesi a una cifra (1..9) e a due cifre (10..12), dataChiusura assente/null, un caso con source mancante (per il crash 5.9). Dataset per 2024, 2025, 2026 (stessa struttura dei HAR).
3. Cattura delle URL chiamate (lista con/senza anno, numero di chiamate a anni e a lista) per le asserzioni.
4. Varianti: verifica true/false/500/401; anni 500/lista vuota; lista 500/404/401 anche solo alla seconda chiamata; lista vuota []; risposta ritardata con promise controllata (verifica, lista).
5. Sessioni: ente con datiFatturazione=false e con datiFatturazioneNotCompleted=true (globalStatePF modificato via addInitScript/storageState).
6. Helper localStorage: setRedirectToInsert(page, valore | assente | stringa non JSON) e "filters" precompilato (tests/utils/filters.ts se esiste: verificare/estendere), lettura di infoTrimestreComSelected dallo stato globale persistito (globalStatePF) per le asserzioni sul parsing mese/anno.

### Note e dubbi da confermare con il team

- tests/ente/moduloCommessa.spec.ts e' un test VECCHIO: importa da @playwright/test (viola CLAUDE.md), usa routeFromHAR, selettori CSS, console.log, page.pause e waitForLoadState('networkidle'), legge l'auth file a mano. Copre "inserimento non abilitato" (verifica false: filtro anni 2024/2025/2026, Annulla filtri, chip Inserito/Non inserito, click riga e ritorno con Indietro, anteprima pdf) e "inserimento ABILITATO" (verifica true da menu laterale -> /ente/modulocommessa, incompleto). Questo piano lo SOSTITUISCE: i suoi scenari sono ripresi in 3.x, 4.x, 5.x e 2.x; le parti sulla pagina di inserimento e sul pdf (ente/pdfmodulocommessa) vanno in piani separati (moduloCommessaInserimento / pdf). Dopo l'implementazione eliminare il vecchio file.
- PROBABILE BUG: `JSON.parse(localStorage.getItem('redirectToInsert')||"")` lancia SyntaxError se la chiave manca (JSON.parse("")). L'eccezione avviene nel then di verifica, quindi finisce nel catch: loadingMandatory=false, manageError (nessun match, nessun modale), ma isMandatory non viene impostato, redirectToInsert non viene scritto, NON parte ne' anni ne' lista e il pulsante Inserisci non compare: pagina vuota con griglia vuota. In uso reale la chiave viene scritta dal menu laterale (sidNavEnte, redirectToInsert=true quando si clicca la voce da una pagina diversa da /ente/modulocommessa) e da moduloCommessaInserimentoUtEn30; il caso "chiave assente" si presenta con goto diretto dell'URL su profilo pulito (cioe' in tutti i test). Scenario 2.6 documenta il comportamento attuale e va aggiornato quando il bug sara' corretto; di conseguenza TUTTI i test che aprono la pagina direttamente devono prima impostare redirectToInsert=false con addInitScript.
- Stesso crash per valori non JSON in redirectToInsert (es. "abc") e per "filters" malformato (JSON.parse senza try/catch nel hook, nell'initializer di useState: potrebbe far crashare l'intera pagina).
- Filtra non e' disabilitato durante il caricamento e non c'e' guard su richieste concorrenti; Annulla filtri e' visibile solo con anno selezionato (e anche con disabled={valueSelect===''} ridondante).
- Cambiare la select NON svuota la griglia ne' ricarica la lista: la griglia mostra ancora i dati precedenti finche' non si clicca Filtra (diverso da altre pagine con clearOnChangeFilter).
- Annulla filtri richiama resetFilters ma non aggiorna isInitialRender; Filtra invece chiama updateFilters che lo imposta a false. Con filtri salvati il caricamento iniziale usa filters.valueSelect anche se l'anno non e' piu' presente in /anni (la select MUI mostrerebbe un valore fuori opzioni, warning MUI): scenario 6.6.
- Sull'errore della prima chiamata lista, sentenseRef diventa false e la caption "finestra di inserimento chiusa" resta per sempre (anche dopo una lista OK successiva); analogamente se la prima e' OK e le successive falliscono la caption resta quella standard. sentenseRef e' un ref: non scatena il rerender, viene letto al rerender successivo (setGridData/setShowLoadingLista). Scenari 1.6 e 1.7.
- handleClickOnDetail chiama manipulateObjModuloCommessa(el) PRIMA delle condizioni: se source e' null/assente lancia TypeError (el.source.charAt) e nessun ramo viene eseguito. Inoltre se isMandatory e' null (verifica non completata/errore) nessun ramo corrisponde tranne !isMandatory (true per null): click porta a navigate con stato. Scenari 5.8 e 6.x.
- Il ramo isMandatory && source diverso da facoltativo/archiviato/obbligatorio non fa nulla. Il ramo "obbligatorio" naviga senza impostare infoTrimestreComSelected (resta {} per il reset del caricamento).
- Parsing mese/anno: idModuloCommessa = meseValidita + "/" + annoValidita; lunghezza 6 ("3/2026") -> mese slice(0,1), anno slice(2,6); altrimenti ("10/2026", lunghezza 7) -> mese slice(0,2), anno slice(3,7). Funziona solo con anno a 4 cifre e mese senza zero iniziale; con meseValidita=0 o 13 il vettore month[] ha un 13o elemento "Gennaio" (month[12]) quindi mese 13 mostrerebbe "Gennaio/anno".
- La colonna Mese/Anno mostra il nome del mese per esteso ("Gennaio/2026") da month[meseValidita-1], mentre Data chiusura usa il formato abbreviato (es. 15-Mag-2026, objMesiWithZero). Data inserimento usa typeColumn "data": formato esatto da verificare dal vivo.
- Totali null: le celle number non gestite potrebbero mostrare vuoto o "--" (verificare dal vivo, 4.6).
- headerAction e' un console.log; la select anni usa key={Math.random()} (le opzioni vengono ricreate a ogni render: possibile instabilita' del dropdown, verificare che l'apertura resti stabile).
- Le etichette sono ricavate dal codice: confermare con browser_snapshot e aggiungere data-testid dove getByRole/getByLabel non bastano.

## Test Scenarios

### 1. Titolo e accesso (tests/ente/moduloCommessaElenco/titolo.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 1.1. Titolo e caricamento iniziale

**File:** `tests/ente/moduloCommessaElenco/titolo.spec.ts`

**Steps:**
  1. Impostare redirectToInsert=false e mockare verifica=false, anni, lista 2026 (12 righe), aprire /ente/modulicommessa
    - expect: Heading 'Modulo commessa' visibile
    - expect: Voce di menu 'Modulo commessa' evidenziata (Mui-selected)
    - expect: Chiamate GET verifica, anni e lista senza anno, ciascuna una sola volta
    - expect: Modale 'Loading...' visibile e poi chiuso
    - expect: Griglia con 12 righe
    - expect: Pulsante 'Filtra' disabilitato, 'Annulla filtri' assente
    - expect: Pulsante 'Inserisci modulo commessa' assente

#### 1.2. Skeleton durante la verifica obbligatori

**File:** `tests/ente/moduloCommessaElenco/titolo.spec.ts`

**Steps:**
  1. Ritardare la risposta di verifica con una promise controllata e aprire la pagina
    - expect: Heading 'Modulo commessa' NON visibile (Skeleton a tutta pagina)
    - expect: Nessuna chiamata ad anni/lista finche' verifica non risponde
  2. Rilasciare la risposta
    - expect: Skeleton rimosso, heading visibile, lista caricata

#### 1.3. Dati di fatturazione mancanti: ModalRedirect (datiFatturazione=false)

**File:** `tests/ente/moduloCommessaElenco/titolo.spec.ts`

**Steps:**
  1. Impostare mainState.datiFatturazione=false in globalStatePF e aprire la pagina
    - expect: ModalRedirect con testo 'Per poter inserire il modulo commessa è obbligatorio fornire  i seguenti dati di fatturazione:' (doppio spazio, usare normalizzazione/regex)
    - expect: Nessuna chiamata a verifica, anni, lista
    - expect: Skeleton non presente, heading visibile, griglia vuota
    - expect: Resto della pagina aria-hidden mentre il modale e' aperto

#### 1.4. Dati di fatturazione incompleti: datiFatturazioneNotCompleted=true

**File:** `tests/ente/moduloCommessaElenco/titolo.spec.ts`

**Steps:**
  1. Impostare datiFatturazioneNotCompleted=true (datiFatturazione=true) e aprire la pagina
    - expect: Stesso ModalRedirect e stessa assenza di chiamate API

#### 1.5. Caption con lista caricata correttamente

**File:** `tests/ente/moduloCommessaElenco/titolo.spec.ts`

**Steps:**
  1. Aprire la pagina con lista OK
    - expect: Testo 'N.B. il Modulo Commessa per le previsioni dei consumi deve essere inserito dal giorno 1 al giorno 15 di ogni mese' visibile
    - expect: Testo di finestra chiusa assente

#### 1.6. Caption con prima chiamata lista fallita e Skeleton iniziale

**File:** `tests/ente/moduloCommessaElenco/titolo.spec.ts`

**Steps:**
  1. Ritardare la lista, aprire la pagina
    - expect: Nessuna delle due caption visibile (Skeleton testuale) fino alla risposta
  2. Rispondere alla lista con 500
    - expect: Caption 'N.B. Gentile Aderente, non sono presenti moduli commessa inseriti. L'inserimento è possibile solo dal 1° al 15 di ogni mese. La finestra di inserimento è attualmente chiusa. Ritorna dal 1° del prossimo mese per compilare i moduli obbligatori'
    - expect: Griglia vuota

#### 1.7. La caption viene impostata una sola volta (sentenseRef)

**File:** `tests/ente/moduloCommessaElenco/titolo.spec.ts`

**Steps:**
  1. Prima lista 500, poi selezionare un anno e Filtra con lista OK
    - expect: Griglia popolata ma la caption di finestra chiusa resta (comportamento attuale, da confermare)
  2. Caso inverso: prima lista OK, poi Filtra con lista 500
    - expect: Caption standard invariata, griglia svuotata

### 2. Navigazione e inserimento (tests/ente/moduloCommessaElenco/navigazione.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 2.1. verifica=false: pulsante Inserisci assente

**File:** `tests/ente/moduloCommessaElenco/navigazione.spec.ts`

**Steps:**
  1. redirectToInsert=false, verifica false, aprire la pagina
    - expect: 'Inserisci modulo commessa' non presente
    - expect: URL resta /ente/modulicommessa
    - expect: localStorage redirectToInsert === 'false'

#### 2.2. verifica=true e redirectToInsert=false: pulsante visibile e navigazione

**File:** `tests/ente/moduloCommessaElenco/navigazione.spec.ts`

**Steps:**
  1. redirectToInsert=false, verifica true, aprire la pagina
    - expect: Lista e anni caricati
    - expect: 'Inserisci modulo commessa' visibile e abilitato
  2. Cliccare 'Inserisci modulo commessa'
    - expect: URL /ente/modulocommessa
    - expect: Nessuna modifica a infoTrimestreComSelected (resta {})

#### 2.3. verifica=true e redirectToInsert=true: redirect automatico

**File:** `tests/ente/moduloCommessaElenco/navigazione.spec.ts`

**Steps:**
  1. Impostare redirectToInsert=true, verifica true, aprire la pagina
    - expect: URL diventa /ente/modulocommessa
    - expect: Nessuna chiamata ad anni e lista
    - expect: Il pulsante Inserisci non viene mai mostrato (la pagina elenco non si vede)

#### 2.4. verifica=false e redirectToInsert=true: nessun redirect

**File:** `tests/ente/moduloCommessaElenco/navigazione.spec.ts`

**Steps:**
  1. Impostare redirectToInsert=true, verifica false, aprire la pagina
    - expect: Resta su /ente/modulicommessa, lista e anni caricati
    - expect: redirectToInsert riscritto a 'false'
    - expect: Pulsante Inserisci assente

#### 2.5. verifica=true, redirectToInsert=false dopo il primo passaggio

**File:** `tests/ente/moduloCommessaElenco/navigazione.spec.ts`

**Steps:**
  1. Impostare redirectToInsert=true con verifica true (redirect), tornare sulla lista con 'Indietro'/menu dalla pagina inserimento (la chiave diventa false)
    - expect: La seconda visita non fa redirect: lista visibile con pulsante Inserisci

#### 2.6. redirectToInsert assente (clean localStorage): bug JSON.parse

**File:** `tests/ente/moduloCommessaElenco/navigazione.spec.ts`

**Steps:**
  1. Non impostare nessuna chiave, mockare verifica true/false e aprire la pagina via goto
    - expect: Comportamento attuale: SyntaxError nel then di verifica, finisce nel catch; Skeleton rimosso, heading visibile
    - expect: Nessuna chiamata ad anni e lista, nessun pulsante Inserisci, griglia vuota
    - expect: Nessun crash dell'applicazione (nessun error boundary)
    - expect: Scenario da aggiornare quando il bug sara' corretto: atteso lista caricata come con redirectToInsert=false

#### 2.7. redirectToInsert con valore non JSON

**File:** `tests/ente/moduloCommessaElenco/navigazione.spec.ts`

**Steps:**
  1. Impostare redirectToInsert='abc' e aprire la pagina
    - expect: Stesso comportamento di 2.6 (catch, nessuna lista)

#### 2.8. Voce di menu laterale imposta redirectToInsert=true

**File:** `tests/ente/moduloCommessaElenco/navigazione.spec.ts`

**Steps:**
  1. Da un'altra pagina ente (es. /ente/datidifatturazione) con verifica true cliccare getByRole('navigation').getByRole('button',{name:'Modulo commessa'})
    - expect: Redirect automatico a /ente/modulocommessa
  2. Ripetere con verifica false
    - expect: Si resta su /ente/modulicommessa con lista e anni, redirectToInsert a 'false'

#### 2.9. Errore 500 su verifica

**File:** `tests/ente/moduloCommessaElenco/navigazione.spec.ts`

**Steps:**
  1. Mockare verifica con 500 e aprire la pagina
    - expect: Skeleton rimosso, heading visibile
    - expect: manageError attiva il messaggio/modale di errore 500 del layout
    - expect: Nessuna chiamata ad anni e lista, nessun pulsante Inserisci, griglia vuota

#### 2.10. Errore 401 su verifica

**File:** `tests/ente/moduloCommessaElenco/navigazione.spec.ts`

**Steps:**
  1. Mockare verifica con 401
    - expect: Gestione 401 del layout (messaggio 'Utente non autenticato...' e redirect), nessun crash

#### 2.11. infoTrimestreComSelected azzerato al caricamento

**File:** `tests/ente/moduloCommessaElenco/navigazione.spec.ts`

**Steps:**
  1. Precompilare globalStatePF con infoTrimestreComSelected non vuoto, verifica false, aprire la pagina
    - expect: Dopo il caricamento lo stato persistito ha infoTrimestreComSelected = {}

### 3. Filtri (tests/ente/moduloCommessaElenco/filtri.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 3.1. Stato iniziale dei filtri

**File:** `tests/ente/moduloCommessaElenco/filtri.spec.ts`

**Steps:**
  1. Aprire la pagina (verifica false, redirectToInsert=false)
    - expect: Select 'Filtra per anno' (getByRole('combobox')) visibile, senza valore
    - expect: 'Filtra' visibile e disabilitato
    - expect: 'Annulla filtri' non presente

#### 3.2. Opzioni della select anni

**File:** `tests/ente/moduloCommessaElenco/filtri.spec.ts`

**Steps:**
  1. Aprire la select
    - expect: Opzioni (getByRole('option')) 2024, 2025, 2026, 2027, 2028 nell'ordine della risposta anni
    - expect: Apertura stabile (key random)

#### 3.3. Selezione anno: abilita Filtra, non svuota la griglia

**File:** `tests/ente/moduloCommessaElenco/filtri.spec.ts`

**Steps:**
  1. Selezionare 2025
    - expect: Valore '2025' nella select
    - expect: 'Filtra' abilitato, 'Annulla filtri' visibile
    - expect: Griglia ancora con le righe precedenti
    - expect: Nessuna nuova chiamata alla lista fino al click su Filtra

#### 3.4. Filtra con anno

**File:** `tests/ente/moduloCommessaElenco/filtri.spec.ts`

**Steps:**
  1. Selezionare 2024 e cliccare 'Filtra'
    - expect: Chiamata GET /api/v2/modulocommessa/lista/2024?nonce=...
    - expect: Modale 'Loading...' poi chiuso
    - expect: Tutte le righe hanno Mese/Anno con '/2024'
    - expect: localStorage 'filters' contiene valueSelect '2024' e pathPage '/ente/modulicommessa'

#### 3.5. Cambio anno consecutivo 2024 -> 2025 -> 2026

**File:** `tests/ente/moduloCommessaElenco/filtri.spec.ts`

**Steps:**
  1. Filtrare per 2024, 2025 e 2026 in sequenza
    - expect: Una chiamata per anno con URL corrispondente
    - expect: Le righe riflettono ogni volta l'anno scelto
    - expect: filters aggiornato all'ultimo anno

#### 3.6. Annulla filtri

**File:** `tests/ente/moduloCommessaElenco/filtri.spec.ts`

**Steps:**
  1. Filtrare per 2025 e cliccare 'Annulla filtri'
    - expect: Select svuotata
    - expect: 'Annulla filtri' scompare e 'Filtra' disabilitato
    - expect: Chiamata GET /api/v2/modulocommessa/lista senza anno
    - expect: Griglia con lista completa
    - expect: localStorage 'filters' rimosso

#### 3.7. Annulla filtri senza aver premuto Filtra

**File:** `tests/ente/moduloCommessaElenco/filtri.spec.ts`

**Steps:**
  1. Selezionare un anno senza Filtra e cliccare 'Annulla filtri'
    - expect: Select vuota, lista completa ricaricata, nessuna chiave 'filters'

#### 3.8. Filtra per un anno senza moduli (lista vuota)

**File:** `tests/ente/moduloCommessaElenco/filtri.spec.ts`

**Steps:**
  1. Mockare /lista/2028 con []
    - expect: Griglia senza righe, nessun testo di lista vuota (sentenseEmpty non passato), nessun errore

#### 3.9. Errore 500 su anni

**File:** `tests/ente/moduloCommessaElenco/filtri.spec.ts`

**Steps:**
  1. Mockare anni con 500
    - expect: Nessun messaggio di errore (catch vuoto)
    - expect: Lista caricata normalmente
    - expect: Select senza opzioni (nessuna option all'apertura), 'Filtra' disabilitato

#### 3.10. Anni vuoto ([]) e 404 su anni

**File:** `tests/ente/moduloCommessaElenco/filtri.spec.ts`

**Steps:**
  1. Mockare anni [] e poi 404
    - expect: Select senza opzioni, pagina funzionante, nessun errore visibile

#### 3.11. Errore 500 su Filtra

**File:** `tests/ente/moduloCommessaElenco/filtri.spec.ts`

**Steps:**
  1. Mockare /lista/2026 con 500 e cliccare Filtra
    - expect: Griglia svuotata
    - expect: Errore 500 gestito da manageError
    - expect: 'Loading...' chiuso
    - expect: Il filtro risulta comunque salvato in localStorage (updateFilters viene chiamato subito)
  2. Ripristinare il mock e cliccare di nuovo Filtra
    - expect: Griglia ripopolata

### 4. Griglia (tests/ente/moduloCommessaElenco/grid.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 4.1. Intestazioni e assenza di paginazione

**File:** `tests/ente/moduloCommessaElenco/grid.spec.ts`

**Steps:**
  1. Con lista popolata verificare getByRole('columnheader')
    - expect: Colonne in ordine: Mese/Anno, Stato, Inserimento, Data inserimento, Data chiusura, Tot. Digit., Tot. Digit. Int., Tot. AR., Tot. AR. Int., Tot. 890., Tot. Not., colonna freccia senza etichetta
    - expect: Nessun controllo di sort
    - expect: Nessun paginatore (nessun 'Go to next page' ne' 'Rows per page')

#### 4.2. Tutte le righe senza limite a 10

**File:** `tests/ente/moduloCommessaElenco/grid.spec.ts`

**Steps:**
  1. Mockare 12 e poi 36 righe
    - expect: Tutte le righe visibili contemporaneamente (nessun troncamento a 10)

#### 4.3. Etichetta Mese/Anno

**File:** `tests/ente/moduloCommessaElenco/grid.spec.ts`

**Steps:**
  1. Leggere la colonna Mese/Anno per i 12 mesi di 2026
    - expect: Gennaio/2026 ... Dicembre/2026 (nome intero + '/' + anno)

#### 4.4. Icona e tooltip Stato per source

**File:** `tests/ente/moduloCommessaElenco/grid.spec.ts`

**Steps:**
  1. Righe con source obbligatorio, archiviato, facoltativo; passare il mouse sull'icona
    - expect: Tooltip 'Obbligatorio', 'Archiviato', 'Facoltativo' (prima lettera maiuscola)
    - expect: Colori icona #5BB0D5, #A2ADB8, #f7e7bc (da confermare via stile)

#### 4.5. Chip Inserimento

**File:** `tests/ente/moduloCommessaElenco/grid.spec.ts`

**Steps:**
  1. Righe con totaleNotifiche null e valorizzato
    - expect: Chip 'Non inserito' se null, 'Inserito' altrimenti

#### 4.6. Data chiusura per source

**File:** `tests/ente/moduloCommessaElenco/grid.spec.ts`

**Steps:**
  1. Righe archiviato, facoltativo, obbligatorio con dataChiusura, obbligatorio senza dataChiusura
    - expect: archiviato '--'
    - expect: facoltativo 'TBD'
    - expect: obbligatorio con data ISO 2026-05-15T... -> '15-Mag-2026'
    - expect: obbligatorio senza data '--'

#### 4.7. Data inserimento e totali, anche con valori null

**File:** `tests/ente/moduloCommessaElenco/grid.spec.ts`

**Steps:**
  1. Righe Inserito con tutti i totali e riga Non inserito con totali null
    - expect: Totali digit., digit. int., AR, AR int., 890, totale mostrati nelle colonne corrette
    - expect: Riga Non inserito: celle vuote o segnaposto (da confermare dal vivo) senza 'null'/'NaN'
    - expect: Data inserimento coerente al formato della colonna 'data'

#### 4.8. Lista vuota []

**File:** `tests/ente/moduloCommessaElenco/grid.spec.ts`

**Steps:**
  1. Mockare lista []
    - expect: Intestazioni presenti, nessuna riga
    - expect: Nessun testo di lista vuota (documentare)
    - expect: Caption standard visibile (lista risposta 200)

#### 4.9. Errore 500 sulla lista iniziale

**File:** `tests/ente/moduloCommessaElenco/grid.spec.ts`

**Steps:**
  1. Mockare lista 500
    - expect: Griglia vuota, errore gestito da manageError
    - expect: 'Loading...' chiuso
    - expect: Caption di finestra chiusa (vedi 1.6)
    - expect: Select anni comunque popolata, pulsante Inserisci presente se verifica true

#### 4.10. Errore 404 e 401 sulla lista

**File:** `tests/ente/moduloCommessaElenco/grid.spec.ts`

**Steps:**
  1. Mockare lista 404 e poi 401
    - expect: Griglia vuota, errore del layout (testi da confermare), nessun crash

#### 4.11. Caricamento lento

**File:** `tests/ente/moduloCommessaElenco/grid.spec.ts`

**Steps:**
  1. Ritardare la lista con promise controllata
    - expect: 'Loading...' visibile e bloccante (resto aria-hidden) fino alla risposta
    - expect: Dopo la risposta il modale si chiude e le righe compaiono

#### 4.12. Riga con valori limite sui mesi

**File:** `tests/ente/moduloCommessaElenco/grid.spec.ts`

**Steps:**
  1. Mockare meseValidita 1, 9, 10, 12
    - expect: Etichette Gennaio, Settembre, Ottobre, Dicembre corrette

### 5. Click su riga (tests/ente/moduloCommessaElenco/dettaglio-riga.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 5.1. verifica=true, source facoltativo: ModalInfo

**File:** `tests/ente/moduloCommessaElenco/dettaglio-riga.spec.ts`

**Steps:**
  1. verifica true, redirectToInsert=false; cliccare la cella Mese/Anno di una riga facoltativo
    - expect: Modale con testo 'Per inserire i moduli commessa futuri bisogna prima inserire i moduli commessa OBBLIGATORI'
    - expect: URL resta /ente/modulicommessa
    - expect: infoTrimestreComSelected invariato ({})
    - expect: Resto della pagina aria-hidden
  2. Chiudere il modale
    - expect: Modale chiuso, pagina interattiva
  3. Ripetere cliccando la freccia della stessa riga
    - expect: Stesso modale

#### 5.2. verifica=true, source archiviato: navigazione con stato

**File:** `tests/ente/moduloCommessaElenco/dettaglio-riga.spec.ts`

**Steps:**
  1. Cliccare una riga archiviato (es. 3/2026)
    - expect: URL /ente/modulocommessa
    - expect: infoTrimestreComSelected: meseCommessaSelected '3', annoCommessaSelectd '2026', quarterSelectedIndex 0, moduloSelectedIndex 0, idTipoContratto/prodotto/idEnte dal profilo
    - expect: moduli[0]: id '3/2026', meseAnno 'Marzo/2026', stato 'Archiviato', dataChiusura '--'

#### 5.3. verifica=true, source obbligatorio: navigazione senza stato

**File:** `tests/ente/moduloCommessaElenco/dettaglio-riga.spec.ts`

**Steps:**
  1. Cliccare una riga obbligatorio
    - expect: URL /ente/modulocommessa
    - expect: infoTrimestreComSelected resta {} (nessun handleModifyMainState)

#### 5.4. verifica=false: ogni source naviga con stato

**File:** `tests/ente/moduloCommessaElenco/dettaglio-riga.spec.ts`

**Steps:**
  1. Con verifica false cliccare una riga per ciascun source (obbligatorio, archiviato, facoltativo)
    - expect: Nessun modale 'moduli OBBLIGATORI'
    - expect: Navigazione a /ente/modulocommessa con infoTrimestreComSelected valorizzato in tutti e tre i casi
    - expect: dataChiusura nel modulo: 'TBD' per facoltativo, '--' per archiviato, data (parte prima della T) per obbligatorio

#### 5.5. Parsing mese a una cifra (lunghezza 6)

**File:** `tests/ente/moduloCommessaElenco/dettaglio-riga.spec.ts`

**Steps:**
  1. Cliccare righe con mese 1 e mese 9 (verifica false)
    - expect: '1/2026' -> mese '1', anno '2026'
    - expect: '9/2026' -> mese '9', anno '2026'

#### 5.6. Parsing mese a due cifre (lunghezza 7)

**File:** `tests/ente/moduloCommessaElenco/dettaglio-riga.spec.ts`

**Steps:**
  1. Cliccare righe con mese 10, 11 e 12
    - expect: '10/2026' -> mese '10', anno '2026'
    - expect: '12/2026' -> mese '12', anno '2026'
    - expect: Nessun troncamento (es. mese '1' per '10')

#### 5.7. Click da cella Mese/Anno o freccia, non da altre celle

**File:** `tests/ente/moduloCommessaElenco/dettaglio-riga.spec.ts`

**Steps:**
  1. Cliccare il nome del mese e poi, in un altro test, la freccia della stessa riga
    - expect: Entrambi eseguono la stessa azione
    - expect: Click su altre celle (Stato, Inserimento, Totali) non naviga e non apre modali

#### 5.8. Riga con source assente o null

**File:** `tests/ente/moduloCommessaElenco/dettaglio-riga.spec.ts`

**Steps:**
  1. Mockare una riga senza source e cliccarla
    - expect: Comportamento attuale: TypeError in manipulateObjModuloCommessa, nessun ramo eseguito, nessuna navigazione (verificare pageerror)
    - expect: Colonna Stato mostra icona senza tooltip (label vuoto)

#### 5.9. Riga Non inserito: moduli nello stato con '--'

**File:** `tests/ente/moduloCommessaElenco/dettaglio-riga.spec.ts`

**Steps:**
  1. Con verifica false cliccare una riga con totali null
    - expect: moduli[0].inserimento.inserimento 'Non inserito', colore #FB9EAC, totali '--'

#### 5.10. Click su riga con filtro anno attivo e ritorno alla lista

**File:** `tests/ente/moduloCommessaElenco/dettaglio-riga.spec.ts`

**Steps:**
  1. Filtrare per 2026, cliccare una riga, poi tornare alla lista (pulsante 'Indietro' della pagina inserimento)
    - expect: Si torna a /ente/modulicommessa, filtro 2026 ripristinato dai filters salvati e lista /lista/2026 richiamata

### 6. Persistenza filtri (tests/ente/moduloCommessaElenco/persistenza-filtri.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 6.1. Salvataggio dopo Filtra

**File:** `tests/ente/moduloCommessaElenco/persistenza-filtri.spec.ts`

**Steps:**
  1. Selezionare 2026, Filtra e leggere localStorage 'filters'
    - expect: JSON {valueSelect:'2026',pathPage:'/ente/modulicommessa'}

#### 6.2. Selezione senza Filtra non viene salvata

**File:** `tests/ente/moduloCommessaElenco/persistenza-filtri.spec.ts`

**Steps:**
  1. Selezionare un anno senza Filtra e leggere localStorage
    - expect: Nessuna chiave 'filters'

#### 6.3. Ripristino dopo reload

**File:** `tests/ente/moduloCommessaElenco/persistenza-filtri.spec.ts`

**Steps:**
  1. Dopo 6.1 ricaricare la pagina (redirectToInsert=false)
    - expect: Select con '2026', 'Annulla filtri' visibile, 'Filtra' abilitato
    - expect: Prima chiamata lista /lista/2026 (non quella senza anno)
    - expect: Anni caricati, griglia con righe 2026

#### 6.4. Annulla filtri pulisce la persistenza

**File:** `tests/ente/moduloCommessaElenco/persistenza-filtri.spec.ts`

**Steps:**
  1. Filtrare, Annulla filtri e ricaricare
    - expect: Select vuota, lista senza anno, nessuna chiave 'filters'

#### 6.5. Filtri di un altro pathPage vengono scartati

**File:** `tests/ente/moduloCommessaElenco/persistenza-filtri.spec.ts`

**Steps:**
  1. Precompilare 'filters' con pathPage '/ente/notifiche' e aprire la pagina
    - expect: Lista senza anno, select vuota
    - expect: Chiave 'filters' rimossa

#### 6.6. Anno salvato non presente nella lista anni

**File:** `tests/ente/moduloCommessaElenco/persistenza-filtri.spec.ts`

**Steps:**
  1. Salvare valueSelect '2030' non presente in anni e aprire la pagina
    - expect: Chiamata /lista/2030 (comportamento attuale)
    - expect: Nessun crash; select con valore non tra le opzioni (warning MUI), verificare 'Filtra' abilitato

#### 6.7. Filtri malformati

**File:** `tests/ente/moduloCommessaElenco/persistenza-filtri.spec.ts`

**Steps:**
  1. Precompilare 'filters' con JSON non valido
    - expect: Comportamento attuale: JSON.parse senza try/catch nell'initializer del hook -> possibile crash della pagina; documentare e aggiornare dopo il fix
  2. Precompilare 'filters' con pathPage corretto ma senza valueSelect
    - expect: Lista chiamata con valueSelect undefined, cioe' senza anno (URL /lista), nessun crash

#### 6.8. Navigazione verso altra pagina e ritorno

**File:** `tests/ente/moduloCommessaElenco/persistenza-filtri.spec.ts`

**Steps:**
  1. Filtrare per 2026, aprire 'Notifiche' dal menu e tornare a 'Modulo commessa' (verifica false)
    - expect: Il filtro anno viene perso se Notifiche ha sostituito/rimosso 'filters' (pathPage diverso), altrimenti viene ripristinato: confermare il comportamento atteso
    - expect: I filtri non si mischiano tra pagine

#### 6.9. Filtro salvato con redirect verso inserimento

**File:** `tests/ente/moduloCommessaElenco/persistenza-filtri.spec.ts`

**Steps:**
  1. Salvare filters e impostare redirectToInsert=true con verifica true
    - expect: Il redirect a /ente/modulocommessa ha priorita', nessuna lista chiamata
    - expect: 'filters' resta in localStorage
