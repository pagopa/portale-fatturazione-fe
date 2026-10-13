# Piano di test - Ente / Documenti contabili emessi (/ente/docemessi)

## Application Overview

Piano di test per la pagina "Documenti contabili emessi" dell'area ente di portale-fatturazione-fe (http://localhost:3000/ente/docemessi). La pagina ha 4 filtri (Anno, Mese, Tipologia Fattura multiselect, Data Fattura multiselect), pulsanti Filtra / Annulla filtri, riquadro "Totale fatturato", griglia "emessi" (#docEmessiEnte, ordinabile, paginata lato client, righe espandibili con Posizioni, click su riga porta al dettaglio /pdf rel ente), pulsante "Download risultati", e griglia "Fatture Contestate" (#docEmessiEnteContestate) con proprio download e paginazione. API: GET /api/fatture/ente/periodo, POST /api/fatture/ente/eliminate, POST /api/fatture/ente/periodo/emesse, download xlsx. I filtri sono persistiti in localStorage (chiave "filters", hook useSavedFilters). Setup sessione: tests/auth.setup.ts (progetto "setup") scrive globalStatePF in localStorage e lo storageState in tests/playwright/.auth/user.json; i test usano baseURL e mock via page.route (tests/utils/docEmessiMock). Tutti gli scenari partono da stato pulito: sessione ente autenticata (San Mauro Torinese, datiFatturazione=true), localStorage "filters" rimosso. Osservato dal vivo con dati reali dev: 26 emessi (anni 2024 e 2025, tipologie ANTICIPO / PRIMO SALDO), totale 25.374,90 EUR, contestate vuote. Etichetta del pulsante reale: "Annulla filtri" (nascosto finche' nessun filtro e' attivo).

## Test Scenarios

### 1. Accesso, sessione e controllo ruolo

**Seed:** `tests/auth.setup.ts`

#### 1.1. Caricamento pagina con sessione valida

**File:** `tests/ente/docemessi/accesso.spec.ts`

**Steps:**
  1. Con storageState di tests/playwright/.auth/user.json aprire /ente/docemessi
    - expect: Titolo h4 'Documenti contabili emessi' visibile
    - expect: Header mostra 'Comune di San Mauro Torinese' e menu laterale con 'Documenti contabili emessi' evidenziato
    - expect: Il modale 'Loading...' compare e poi scompare
    - expect: Chiamate periodo, eliminate, periodo/emesse rispondono 200
  2. Verificare lo stato iniziale dei controlli
    - expect: Anno = Tutti (abilitato), Mese = Tutti (disabilitato), Tipologia Fattura abilitato e vuoto, Data Fattura disabilitato
    - expect: Pulsante 'Filtra' visibile, 'Annulla filtri' assente
    - expect: Totale fatturato mostra l'importo (non '--') con sfondo verde se > 0
    - expect: Griglia emessi mostra max 10 righe e paginatore '1-10 of N'; 'Download risultati' abilitato

#### 1.2. Accesso senza autenticazione

**File:** `tests/ente/docemessi/accesso.spec.ts`

**Steps:**
  1. In contesto senza storageState (localStorage vuoto) aprire /ente/docemessi
    - expect: L'utente non vede dati di fatturazione
    - expect: Viene reindirizzato al login/auth oppure alla pagina di errore (comportamento da confermare: non verificato dal vivo)

#### 1.3. Dati di fatturazione mancanti: modale di redirect

**File:** `tests/ente/docemessi/accesso.spec.ts`

**Steps:**
  1. Impostare in globalStatePF mainState.datiFatturazione=false (oppure datiFatturazioneNotCompleted=true) e aprire la pagina
    - expect: Compare ModalRedirect con testo 'Per poter visualizzare il dettaglio dei Documenti EMESSI e' obbligatorio fornire i seguenti dati di fatturazione'
    - expect: Non viene chiamata GET /api/fatture/ente/periodo
    - expect: Griglie vuote

#### 1.4. Profilo non ente (ruolo diverso) sulla stessa rotta

**File:** `tests/ente/docemessi/accesso.spec.ts`

**Steps:**
  1. Con profilo di altro ruolo (es. PagoPA/Recapitista) navigare direttamente a /ente/docemessi
    - expect: La rotta non espone dati dell'ente (redirect o errore) - comportamento da definire con il team, non verificato

#### 1.5. Token scaduto / 401 sulle API

**File:** `tests/ente/docemessi/accesso.spec.ts`

**Steps:**
  1. Mockare con page.route le API periodo ed emesse con status 401 e aprire la pagina
    - expect: manageError gestisce l'errore (redirect a pagina errore/login o messaggio)
    - expect: Il loading si chiude e non resta bloccato
    - expect: Griglia vuota

### 2. Presenza e logica dei filtri

**Seed:** `tests/auth.setup.ts`

#### 2.1. Presenza dei filtri nel DOM

**File:** `tests/ente/docemessi/filtri.spec.ts`

**Steps:**
  1. Aprire la pagina
    - expect: Esistono #filter_anno, #filter_mese, #filter_tipologia_fattura, #filter_data_fattura

#### 2.2. Opzioni Anno popolate dall'API periodo

**File:** `tests/ente/docemessi/filtri.spec.ts`

**Steps:**
  1. Mock periodo con anni 2023, 2024, 2025 e aprire il select Anno
    - expect: Opzioni: Tutti, 2023, 2024, 2025 (dal vivo: Tutti, 2025, 2024)

#### 2.3. Selezione Anno abilita Mese e mostra Annulla filtri

**File:** `tests/ente/docemessi/filtri.spec.ts`

**Steps:**
  1. Selezionare Anno 2024
    - expect: Mese diventa abilitato con soli i mesi dell'anno
    - expect: Appare 'Annulla filtri'
    - expect: Griglia e totale vengono svuotati (clearOnChangeFilter): totale '--', 'Download risultati' disabilitato
  2. Riselezionare Anno = Tutti
    - expect: Mese torna disabilitato a Tutti, Tipologia e Data azzerate
    - expect: 'Annulla filtri' scompare

#### 2.4. Filtro Mese con nomi dei mesi

**File:** `tests/ente/docemessi/filtri.spec.ts`

**Steps:**
  1. Selezionare Anno 2024 e aprire Mese
    - expect: Le opzioni sono nomi italiani (es. Gennaio) e 'Tutti'
  2. Selezionare Gennaio
    - expect: Tipologie limitate a quelle presenti per anno+mese
    - expect: Data Fattura resta disabilitata (mese != Tutti)

#### 2.5. Cascata Tipologia -> Data Fattura

**File:** `tests/ente/docemessi/filtri.spec.ts`

**Steps:**
  1. Con Anno=2024 e Mese=Tutti selezionare una tipologia (es. PRIMO SALDO)
    - expect: Chip tipologia visibile
    - expect: Data Fattura si abilita con le sole date relative a anno+tipologia
  2. Selezionare una data (es. 2024-01-24) e poi deselezionare la tipologia
    - expect: Data Fattura torna disabilitata e priva di chip

#### 2.6. Cambio Anno/Mese azzera selezioni dipendenti

**File:** `tests/ente/docemessi/filtri.spec.ts`

**Steps:**
  1. Selezionare anno, tipologia e data; poi cambiare anno
    - expect: Chip di Tipologia e Data azzerati, Mese a Tutti
  2. Selezionare anno, tipologia; poi scegliere un mese
    - expect: Tipologie e date azzerate, Data Fattura disabilitata

#### 2.7. Multiselezione tipologie

**File:** `tests/ente/docemessi/filtri.spec.ts`

**Steps:**
  1. Aprire Tipologia Fattura e selezionare ACCONTO/ANTICIPO e PRIMO SALDO
    - expect: Due chip presenti
    - expect: Le date proposte sono l'unione delle date per le due tipologie senza duplicati
  2. Rimuovere un chip
    - expect: Rimane un solo chip e le date si aggiornano

#### 2.8. Filtra con singolo filtro (Anno)

**File:** `tests/ente/docemessi/filtri.spec.ts`

**Steps:**
  1. Selezionare Anno 2025 e cliccare 'Filtra'
    - expect: Richiesta POST periodo/emesse con body {anno:2025, mese:9999, tipologiaFattura:[], dataFattura:[]}
    - expect: Griglia contiene solo fatture 2025, paginatore e totale aggiornati
    - expect: 'Download risultati' abilitato

#### 2.9. Filtra con filtri combinati

**File:** `tests/ente/docemessi/filtri.spec.ts`

**Steps:**
  1. Selezionare Anno, Tipologia e Data e cliccare Filtra
    - expect: Body POST contiene anno, tipologiaFattura e dataFattura selezionati
    - expect: Tutte le righe hanno T. Fattura e data coerenti; tornano a pagina 1 ('1-n of m')
  2. Selezionare Anno + Mese e cliccare Filtra
    - expect: Body POST con mese numerico e tipologiaFattura vuoto; righe del solo mese

#### 2.10. Annulla filtri

**File:** `tests/ente/docemessi/filtri.spec.ts`

**Steps:**
  1. Impostare Anno, Mese, Tipologia e cliccare 'Annulla filtri'
    - expect: Anno e Mese = Tutti, nessun chip su Tipologia/Data
    - expect: 'Annulla filtri' scompare
    - expect: Viene richiamata la lista senza filtri (POST con anno 9999, mese 9999) e la griglia mostra tutti gli emessi a pagina 1
    - expect: localStorage 'filters' resettato

#### 2.11. Filtra senza selezionare nulla

**File:** `tests/ente/docemessi/filtri.spec.ts`

**Steps:**
  1. Cliccare 'Filtra' con tutti i filtri a Tutti
    - expect: Griglia mostra l'elenco completo, nessun errore in console

#### 2.12. Validazione input: ricerca testuale nell'autocomplete

**File:** `tests/ente/docemessi/filtri.spec.ts`

**Steps:**
  1. Digitare nel campo Tipologia Fattura un testo inesistente (es. 'zzz') e uno con caratteri speciali (<script>, %)
    - expect: Dropdown mostra messaggio di nessuna opzione, nessun chip creato, nessun errore JS

### 3. Griglia emessi: dati, ordinamento, dettaglio

**Seed:** `tests/auth.setup.ts`

#### 3.1. Struttura colonne e formattazione

**File:** `tests/ente/docemessi/griglia.spec.ts`

**Steps:**
  1. Mock con almeno una fattura e osservare la tabella #docEmessiEnte
    - expect: Colonne: (expand), Data Fattura, Stato, T. Fattura, Ident., Tipo Contratto, Tot., N. Fattura, Tipo Documento, Divisa, M. Pagamento, Split, (azione)
    - expect: Data in formato gg/mm/aaaa, Ident. mm/aaaa, Tot. con formato italiano '1.261,00 euro', Split 'Si'/'No'
    - expect: Tipo Contratto lungo viene troncato con '...'

#### 3.2. Espansione riga: Posizioni

**File:** `tests/ente/docemessi/griglia.spec.ts`

**Steps:**
  1. Cliccare il pulsante 'expand row' di una riga con posizioni
    - expect: Compare sotto-tabella 'Posizioni' con le colonne di headersDocumentiEmessiEnteCollapse
    - expect: Nuovo click richiude la riga
  2. Espandere una riga con posizioni vuote
    - expect: Nessun errore, sotto-tabella vuota o assente

#### 3.3. Ordinamento colonne (3 stati)

**File:** `tests/ente/docemessi/griglia.spec.ts`

**Steps:**
  1. Per ciascuna colonna ordinabile (Data Fattura, Ident., Tot., N. Fattura, Tipo Documento) cliccare l'icona Sort una, due e tre volte
    - expect: 1 click: ascendente, 2: discendente, 3: ritorno all'ordine originale
    - expect: L'ordinamento si applica all'intera lista e non solo alla pagina corrente
    - expect: Ordinare una colonna resetta l'indicatore delle altre

#### 3.4. Ordinamento disabilitato durante modifica filtri

**File:** `tests/ente/docemessi/griglia.spec.ts`

**Steps:**
  1. Cambiare un filtro senza cliccare Filtra
    - expect: Griglia svuotata e pulsanti Sort disabilitati/indicatori reimpostati (come in test sort esistente)

#### 3.5. Click su riga apre il dettaglio

**File:** `tests/ente/docemessi/griglia.spec.ts`

**Steps:**
  1. Cliccare sulla cella Data Fattura (cursore pointer) di una riga
    - expect: Navigazione a /ente/pdf-rel o PathPf.PDF_REL_EN + '/documentiemessi/<idfattura>' (verificare path esatto)
    - expect: La pagina dettaglio mostra la fattura corretta
  2. Tornare indietro con il back del browser
    - expect: Pagina emessi ripristina filtri, pagina e ordinamento salvati

### 4. Paginazione

**Seed:** `tests/auth.setup.ts`

#### 4.1. Paginazione griglia emessi (33 elementi mock)

**File:** `tests/ente/docemessi/paginazione.spec.ts`

**Steps:**
  1. Mockare periodo/emesse con 33 fatture e aprire la pagina
    - expect: 10 righe, 'Go to previous page' disabilitato, label '1-10 of 33'
  2. Click su 'Go to next page' fino all'ultima pagina
    - expect: Pagine mostrano ID-10..19, 20..29, quindi 3 righe (30-32)
    - expect: Next disabilitato all'ultima pagina, label '31-33 of 33'

#### 4.2. Cambio righe per pagina

**File:** `tests/ente/docemessi/paginazione.spec.ts`

**Steps:**
  1. Portarsi a pagina 2 e cambiare 'Rows per page' (valori disponibili da verificare, es. 10/25/50)
    - expect: Si torna a pagina 1 con il nuovo numero di righe
    - expect: Label coerente con il totale

#### 4.3. Paginazione griglia contestate indipendente

**File:** `tests/ente/docemessi/paginazione.spec.ts`

**Steps:**
  1. Mockare POST /api/fatture/ente/eliminate con 33 elementi e usare #docEmessiEnteContestate-pagination
    - expect: Stesso comportamento della griglia emessi
    - expect: La paginazione della griglia emessi non cambia

#### 4.4. Paginazione azzerata dopo Filtra e Annulla

**File:** `tests/ente/docemessi/paginazione.spec.ts`

**Steps:**
  1. Andare a pagina 2, cliccare Filtra e poi Annulla filtri
    - expect: Dopo ogni azione si torna a pagina 1 e si vede '1-10 of N'

### 5. Download

**Seed:** `tests/auth.setup.ts`

#### 5.1. Download risultati senza filtri

**File:** `tests/ente/docemessi/download.spec.ts`

**Steps:**
  1. Con dati in griglia cliccare 'Download risultati'
    - expect: Modale 'Downloading...' compare e scompare
    - expect: Evento download con nome file 'Documenti emessi_<Ragione sociale>.xlsx' (nel codice 'Documenti emessi/<RS>.xlsx' sanitizzato dal browser)
    - expect: Il body della richiesta di download usa anno/mese 9999

#### 5.2. Nome file con anno e con anno+mese

**File:** `tests/ente/docemessi/download.spec.ts`

**Steps:**
  1. Filtrare per Anno 2023 e scaricare
    - expect: Nome file '...<RS>_2023.xlsx'
  2. Filtrare per Anno 2024 + Gennaio e scaricare
    - expect: Nome file '...<RS>_Gennaio_2024.xlsx'

#### 5.3. Download usa i filtri applicati e non quelli solo selezionati

**File:** `tests/ente/docemessi/download.spec.ts`

**Steps:**
  1. Applicare Filtra con Anno 2025, poi cambiare Anno a 2024 senza Filtra
    - expect: 'Download risultati' e' disabilitato (griglia svuotata dal cambio filtro)
  2. Cliccare Filtra e scaricare
    - expect: Il file si riferisce al 2024

#### 5.4. Pulsante download disabilitato con griglia vuota

**File:** `tests/ente/docemessi/download.spec.ts`

**Steps:**
  1. Mockare lista emesse con dettagli [] e aprire la pagina
    - expect: 'Download risultati' disabilitato, messaggio 'Non sono presenti fatture emesse'

#### 5.5. Errore API di download

**File:** `tests/ente/docemessi/download.spec.ts`

**Steps:**
  1. Mockare l'endpoint di download con 500 e cliccare Download
    - expect: Modale 'Downloading...' si chiude
    - expect: Viene mostrato l'errore tramite manageError, nessun file scaricato

#### 5.6. Download fatture contestate

**File:** `tests/ente/docemessi/download.spec.ts`

**Steps:**
  1. Mockare 'eliminate' con almeno una fattura e cliccare 'Download risultati contestate'
    - expect: File 'Documenti contestati/<RS>.xlsx' scaricato
    - expect: Il body ha anno/mese null e array vuoti (non dipende dai filtri)
  2. Con contestate vuote verificare il pulsante
    - expect: 'Download risultati contestate' disabilitato

### 6. Fatture contestate

**Seed:** `tests/auth.setup.ts`

#### 6.1. Stato vuoto contestate

**File:** `tests/ente/docemessi/contestate.spec.ts`

**Steps:**
  1. Aprire la pagina con 'eliminate' = dettagli []
    - expect: Titolo 'Fatture Contestate', riga 'Non sono presenti fatture contestate', paginatore '0-0 of 0', tutti i pulsanti Sort disabilitati (osservato dal vivo)

#### 6.2. Contestate con dati: righe evidenziate e ordinamento

**File:** `tests/ente/docemessi/contestate.spec.ts`

**Steps:**
  1. Mockare 'eliminate' con 3 fatture
    - expect: Righe con sfondo #ffeff1
    - expect: Ordinamento per colonna funziona sulla sola griglia contestate

#### 6.3. Le contestate non cambiano con Filtra

**File:** `tests/ente/docemessi/contestate.spec.ts`

**Steps:**
  1. Con contestate popolate applicare un filtro
    - expect: La griglia contestate non viene ricaricata (la chiamata 'eliminate' avviene solo al primo caricamento)

### 7. Stati vuoti ed errori API

**Seed:** `tests/auth.setup.ts`

#### 7.1. Nessun risultato per filtro

**File:** `tests/ente/docemessi/errori.spec.ts`

**Steps:**
  1. Mockare periodo/emesse con dettagli [] e importo 0 dopo Filtra
    - expect: Messaggio 'Non sono presenti fatture emesse'
    - expect: Totale '--' con sfondo grigio #E3E7EB
    - expect: Paginatore '0-0 of 0' con next/prev disabilitati
    - expect: Download disabilitato

#### 7.2. Periodo senza dati

**File:** `tests/ente/docemessi/errori.spec.ts`

**Steps:**
  1. Mockare GET periodo con data []
    - expect: Select Anno contiene solo 'Tutti' e nessun errore JS

#### 7.3. Errore 500 su periodo

**File:** `tests/ente/docemessi/errori.spec.ts`

**Steps:**
  1. Mockare periodo con 500
    - expect: manageError visualizzato, loading chiuso, filtri non popolati, pagina utilizzabile

#### 7.4. Errore 500 su lista emesse

**File:** `tests/ente/docemessi/errori.spec.ts`

**Steps:**
  1. Mockare periodo/emesse con 500
    - expect: Griglia vuota, errore mostrato, modale Loading chiuso
  2. Ripristinare la risposta e cliccare Filtra
    - expect: La griglia si ripopola correttamente

#### 7.5. Errore su lista contestate

**File:** `tests/ente/docemessi/errori.spec.ts`

**Steps:**
  1. Mockare 'eliminate' con 500
    - expect: Errore gestito: nel codice l'errore blocca anche il caricamento degli emessi (stesso try/catch) - verificare il comportamento atteso con il team

#### 7.6. Totale negativo

**File:** `tests/ente/docemessi/errori.spec.ts`

**Steps:**
  1. Mockare importo negativo
    - expect: Nota: nel codice il ramo 'totale < 0' (sfondo #ffeff1) e' irraggiungibile perche' il controllo > 0 /=== 0 viene prima solo per i positivi; verificare colore e formato '-x,xx euro'

#### 7.7. Risposta lenta / loading

**File:** `tests/ente/docemessi/errori.spec.ts`

**Steps:**
  1. Ritardare le risposte API di 3s
    - expect: Modale 'Operazione in corso - Loading...' bloccante visibile finche' le richieste non terminano

### 8. Persistenza filtri e navigazione

**Seed:** `tests/auth.setup.ts`

#### 8.1. Persistenza dei filtri dopo reload

**File:** `tests/ente/docemessi/persistenza.spec.ts`

**Steps:**
  1. Selezionare Anno 2025 + tipologia, cliccare Filtra e ricaricare la pagina
    - expect: localStorage 'filters' contiene pathPage '/ente/docemessi' e body con i filtri
    - expect: Dopo il reload filtri, griglia, pagina e totale sono ripristinati e 'Annulla filtri' visibile

#### 8.2. Persistenza di pagina, righe e ordinamento

**File:** `tests/ente/docemessi/persistenza.spec.ts`

**Steps:**
  1. Ordinare per Tot., andare a pagina 2, cambiare righe e ricaricare
    - expect: Stessa pagina, stesse righe per pagina e stesso ordinamento ripristinati

#### 8.3. Persistenza navigando in altra pagina e tornando

**File:** `tests/ente/docemessi/persistenza.spec.ts`

**Steps:**
  1. Applicare un filtro, aprire 'Documenti contabili sospesi' dal menu e tornare a 'Documenti contabili emessi'
    - expect: Filtri riapplicati o resettati secondo il comportamento di useSavedFilters (i filtri sono legati a pathPage: non devono essere mischiati con quelli di docsospesi)

#### 8.4. Annulla filtri pulisce la persistenza

**File:** `tests/ente/docemessi/persistenza.spec.ts`

**Steps:**
  1. Applicare filtro, cliccare Annulla filtri e ricaricare
    - expect: Nessun filtro attivo dopo il reload

#### 8.5. Filtri salvati non piu' validi

**File:** `tests/ente/docemessi/persistenza.spec.ts`

**Steps:**
  1. Impostare in localStorage 'filters' un anno non presente nel periodo (es. 1999) o JSON malformato e aprire la pagina
    - expect: Nessun crash della pagina (da verificare: nel codice nessun controllo di validita')

### 9. Navigazione e layout

**Seed:** `tests/auth.setup.ts`

#### 9.1. Navigazione dal menu laterale

**File:** `tests/ente/docemessi/navigazione.spec.ts`

**Steps:**
  1. Da un'altra pagina ente aprire 'Documenti contabili' e poi 'Documenti contabili emessi'
    - expect: URL /ente/docemessi, titolo corretto, voce di menu attiva
  2. Cliccare le altre voci (Dati di fatturazione, Modulo commessa, Notifiche, Documenti contabili sospesi, Download documenti)
    - expect: Ogni voce porta alla propria rotta senza errori

#### 9.2. Pulsante Esci

**File:** `tests/ente/docemessi/navigazione.spec.ts`

**Steps:**
  1. Cliccare 'Esci' nell'header
    - expect: Sessione terminata, localStorage pulito/redirect alla pagina di login; riaprire /ente/docemessi richiede nuova autenticazione

#### 9.3. Banner informativo

**File:** `tests/ente/docemessi/navigazione.spec.ts`

**Steps:**
  1. Aprire la pagina con GET /api/info-banner che ritorna testo
    - expect: Banner 'Gentile Aderente...' visibile (osservato dal vivo)

#### 9.4. Accessibilita' di base

**File:** `tests/ente/docemessi/navigazione.spec.ts`

**Steps:**
  1. Navigare con Tab su filtri, Filtra, Sort, paginatore
    - expect: Ordine di focus logico, aria-label 'Go to next page'/'expand row', pulsanti disabilitati non raggiungibili
