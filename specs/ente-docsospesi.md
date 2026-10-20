# Piano di test - Ente / Documenti contabili sospesi (/ente/docsospesi)

## Application Overview

Piano di test per la pagina "Documenti contabili sospesi" dell'area ente di portale-fatturazione-fe (http://localhost:3000/ente/docsospesi), componente `src/page/ente/docContSos.tsx`. La pagina ha 4 filtri (Anno, Mese, Tipologia Fattura multiselect, Data Fattura multiselect), pulsanti Filtra / Annulla filtri, riquadro "Credito sospeso", pulsante "Download risultati" e una griglia di fatture sospese (ordinabile e paginata lato client, righe espandibili con "Posizioni", click sulla Data Fattura porta al dettaglio). A differenza di /ente/docemessi non c'e' la griglia "Fatture Contestate".

API: GET /api/fatture/ente/periodo/sospeso (popola i filtri), POST /api/fatture/ente/credito/sospeso (lista, risposta `{ dettagli: [{ fattura }], importoSospeso }`), POST /api/fatture/ente/sospese/download (xlsx, chiamata con fetch). Il client converte anno/mese 9999 in null prima di inviare il body. I filtri sono persistiti in localStorage (chiave "filters", pathPage "/ente/docsospesi", hook useSavedFilters).

Setup sessione: tests/auth.setup.ts (progetto "setup") scrive globalStatePF in localStorage e lo storageState in tests/playwright/.auth/user.json. Tutti gli scenari partono da stato pulito: sessione ente autenticata (Comune di San Mauro Torinese, datiFatturazione=true), localStorage "filters" rimosso.

Osservato dal vivo (dev, 14/10/2026): per questo ente GET periodo/sospeso risponde 404, la lista non viene richiesta, la griglia mostra "Non sono presenti fatture sospese", Credito sospeso '--', Anno contiene solo 'Tutti' e Tipologia nessuna opzione. Per questo gli scenari con dati usano mock via page.route.

Il DOM non ha id sui filtri ne' sulla griglia (nameParameterApi e' 'docEmessiEnte', copiato dalla pagina emessi): usare locator per ruolo/label (combobox Anno = primo combobox, Mese = secondo, Tipologia Fattura e Data Fattura per nome; tabella = getByRole('table')). I chip delle multiselect mostrano solo un'icona: il valore e' nell'aria-label del chip.

Mock di riferimento per gli scenari (periodo/sospeso):
- 2023 / Settembre / SECONDO SALDO / 2023-10-15
- 2024 / Gennaio / ACCONTO / 2024-01-24
- 2024 / Gennaio / PRIMO SALDO / 2024-01-24
- 2024 / Febbraio / PRIMO SALDO / 2024-02-20
- 2024 / Marzo / ACCONTO / 2024-03-10
- 2025 / Maggio / ANTICIPO / 2025-05-20

Il mock di credito/sospeso restituisce una fattura per ogni riga del periodo e filtra in base al body (anno, mese, tipologiaFattura, dataFattura), con importoSospeso pari alla somma dei totali.

## Test Scenarios

Organizzazione (CLAUDE.md): un file di test per area in `tests/ente/docsospesi/`, mock in `tests/utils/docsospesi/`, `test`/`expect` importati da `tests/fixtures.ts` (che blocca ogni chiamata al backend reale).

### 1. Accesso, sessione e controllo ruolo

**Seed:** `tests/auth.setup.ts`

#### 1.1. Caricamento pagina con sessione valida e dati mock

**File:** `tests/ente/docsospesi/titolo.spec.ts`

**Steps:**
  1. Mockare periodo/sospeso e credito/sospeso con il mock di riferimento e aprire /ente/docsospesi
    - expect: Titolo h4 'Documenti contabili sospesi' visibile
    - expect: Header mostra 'Comune di San Mauro Torinese' e la voce di menu 'Documenti contabili sospesi' e' evidenziata (Mui-selected)
    - expect: Il modale 'Loading...' compare e poi scompare
    - expect: Chiamate GET periodo/sospeso e POST credito/sospeso eseguite una volta ciascuna
  2. Verificare lo stato iniziale dei controlli
    - expect: Anno = Tutti (abilitato), Mese = Tutti (disabilitato), Tipologia Fattura abilitato e senza chip, Data Fattura disabilitato
    - expect: Pulsante 'Filtra' visibile, 'Annulla filtri' assente
    - expect: Riquadro 'Credito sospeso' con importo in formato italiano (es. '615,00 €') e sfondo verde #F2FAF2
    - expect: Griglia con 6 righe, colonna Stato = 'Sospesa', paginatore '1–6 of 6', 'Download risultati' abilitato

#### 1.2. Ente senza fatture sospese (periodo 404, comportamento reale dev)

**File:** `tests/ente/docsospesi/titolo.spec.ts`

**Steps:**
  1. Senza mock (oppure mockando GET periodo/sospeso con 404) aprire la pagina
    - expect: Griglia con il messaggio 'Non sono presenti fatture sospese' e paginatore '0–0 of 0' con next/prev disabilitati
    - expect: Credito sospeso '--' con sfondo grigio #E3E7EB, 'Download risultati' disabilitato
    - expect: Select Anno contiene solo 'Tutti', Tipologia Fattura non ha opzioni
    - expect: POST credito/sospeso non viene chiamata (l'errore sul periodo interrompe il caricamento)
    - expect: Il modale 'Loading...' si chiude e la pagina resta utilizzabile
    - expect: Viene mostrato l'alert di manageError per il 404 ('La ricerca non ha prodotto risultati') - da confermare con il team se l'alert e' desiderato per un ente senza sospesi

#### 1.3. Accesso senza autenticazione

**File:** `tests/ente/docsospesi/titolo.spec.ts`

**Steps:**
  1. In un contesto senza storageState (localStorage vuoto) aprire /ente/docsospesi, con la pagina Selfcare intercettata
    - expect: Redirect alla login Selfcare (VITE_APP_REDIRECT)
    - expect: Nessuna chiamata alle API /api/fatture/ente/

#### 1.4. Dati di fatturazione mancanti: modale di redirect

**File:** `tests/ente/docsospesi/titolo.spec.ts`

**Steps:**
  1. Impostare in globalStatePF mainState.datiFatturazione=false e aprire la pagina
    - expect: Compare ModalRedirect con testo sui dati di fatturazione obbligatori
    - expect: Non viene chiamata GET periodo/sospeso
    - expect: Griglia vuota
    - expect: Nota: il testo del modale cita 'Documenti EMESSI' anche in questa pagina (copiato da docemessi) - segnalare come difetto di testo
  2. Ripetere con datiFatturazioneNotCompleted=true
    - expect: Stesso comportamento del passo 1

#### 1.5. Profilo PagoPA sulla rotta ente

**File:** `tests/ente/docsospesi/titolo.spec.ts`

**Steps:**
  1. Con profilo PagoPA (profilo.auth='PAGOPA', prodotto 'prod-pn') navigare direttamente a /ente/docsospesi
    - expect: L'utente PagoPA viene rediretto alla pagina /azureLogin

#### 1.6. Token scaduto / 401 sulle API (ente e recapitista)

**File:** `tests/ente/docsospesi/titolo.spec.ts`

**Steps:**
  1. Mockare periodo/sospeso e credito/sospeso con status 401 e aprire la pagina con profilo ente
    - expect: Alert 'Utente non autenticato. Effettuare nuovamente l'accesso'
    - expect: Dopo l'alert redirect a Selfcare, globalStatePF e filters rimossi dal localStorage
  2. Ripetere con profilo Recapitista (profilo.profilo='REC')
    - expect: Stesso comportamento: alert, logout e redirect a Selfcare

### 2. Presenza e logica dei filtri

**Seed:** `tests/auth.setup.ts`

#### 2.1. Presenza dei filtri

**File:** `tests/ente/docsospesi/filtri.spec.ts`

**Steps:**
  1. Con mock di riferimento aprire la pagina
    - expect: Visibili le label e i campi Anno, Mese, Tipologia Fattura, Data Fattura
    - expect: Pulsante 'Filtra' visibile, 'Annulla filtri' assente

#### 2.2. Opzioni Anno popolate dall'API periodo/sospeso

**File:** `tests/ente/docsospesi/filtri.spec.ts`

**Steps:**
  1. Con mock di riferimento aprire il select Anno
    - expect: Opzioni nell'ordine: Tutti, 2023, 2024, 2025 (anni unici nell'ordine di risposta)

#### 2.3. Selezione Anno abilita Mese e mostra Annulla filtri

**File:** `tests/ente/docsospesi/filtri.spec.ts`

**Steps:**
  1. Selezionare Anno 2024
    - expect: Mese abilitato con opzioni Tutti, Gennaio, Febbraio, Marzo
    - expect: Appare 'Annulla filtri'
    - expect: Griglia svuotata (clearOnChangeFilter): 'Non sono presenti fatture sospese', Credito sospeso '--', 'Download risultati' disabilitato
  2. Riselezionare Anno = Tutti
    - expect: Mese torna disabilitato a Tutti, nessun chip su Tipologia e Data
    - expect: 'Annulla filtri' scompare

#### 2.4. Filtro Mese con nomi dei mesi

**File:** `tests/ente/docsospesi/filtri.spec.ts`

**Steps:**
  1. Selezionare Anno 2024 e aprire Mese
    - expect: Opzioni con nomi italiani dei mesi presenti per l'anno e 'Tutti'
  2. Selezionare Gennaio
    - expect: Tipologie limitate a ACCONTO e PRIMO SALDO
    - expect: Data Fattura resta disabilitata (mese diverso da Tutti)

#### 2.5. Cascata Tipologia -> Data Fattura

**File:** `tests/ente/docsospesi/filtri.spec.ts`

**Steps:**
  1. Con Anno=2024 e Mese=Tutti selezionare PRIMO SALDO
    - expect: Un chip con aria-label 'PRIMO SALDO'
    - expect: Data Fattura abilitata con le sole date 2024-01-24 e 2024-02-20
  2. Selezionare 2024-01-24 e poi rimuovere il chip della tipologia
    - expect: Data Fattura torna disabilitata e senza chip

#### 2.6. Cambio Anno/Mese azzera selezioni dipendenti

**File:** `tests/ente/docsospesi/filtri.spec.ts`

**Steps:**
  1. Selezionare Anno 2024, tipologia PRIMO SALDO e data 2024-01-24; poi cambiare Anno in 2023
    - expect: Chip di Tipologia e Data azzerati, Mese = Tutti
  2. Selezionare Anno 2024, tipologia ACCONTO; poi scegliere Mese Gennaio
    - expect: Tipologie e date azzerate, Data Fattura disabilitata

#### 2.7. Multiselezione tipologie

**File:** `tests/ente/docsospesi/filtri.spec.ts`

**Steps:**
  1. Con Anno 2024 selezionare ACCONTO e PRIMO SALDO
    - expect: Due chip (aria-label ACCONTO e PRIMO SALDO)
    - expect: Date proposte = unione senza duplicati: 2024-01-24, 2024-02-20, 2024-03-10
  2. Rimuovere il chip ACCONTO
    - expect: Rimane il solo chip PRIMO SALDO e le date diventano 2024-01-24, 2024-02-20

#### 2.8. Filtra con singolo filtro (Anno)

**File:** `tests/ente/docsospesi/filtri.spec.ts`

**Steps:**
  1. Selezionare Anno 2025 e cliccare 'Filtra'
    - expect: POST credito/sospeso con body { anno: 2025, mese: null, tipologiaFattura: [], dataFattura: [] }
    - expect: Una sola riga (Data Fattura 20/05/2025), paginatore '1–1 of 1', Credito sospeso aggiornato
    - expect: 'Download risultati' abilitato

#### 2.9. Filtra con filtri combinati

**File:** `tests/ente/docsospesi/filtri.spec.ts`

**Steps:**
  1. Selezionare Anno 2024, tipologia PRIMO SALDO, data 2024-01-24 e cliccare Filtra
    - expect: Body con anno 2024, mese null, tipologiaFattura ['PRIMO SALDO'], dataFattura ['2024-01-24']
    - expect: Righe coerenti (T. Fattura PRIMO SALDO, data 24/01/2024), pagina 1
  2. Selezionare Mese Febbraio e cliccare Filtra
    - expect: Body con mese 2 e tipologiaFattura vuoto; solo righe di febbraio 2024

#### 2.10. Annulla filtri

**File:** `tests/ente/docsospesi/filtri.spec.ts`

**Steps:**
  1. Impostare Anno 2024, Mese Gennaio, tipologia ACCONTO, cliccare Filtra e poi 'Annulla filtri'
    - expect: Anno e Mese = Tutti, nessun chip, 'Annulla filtri' scompare
    - expect: POST credito/sospeso con anno e mese null e array vuoti; griglia con tutte le 6 fatture a pagina 1
    - expect: localStorage 'filters' rimosso

#### 2.11. Filtra senza selezionare nulla

**File:** `tests/ente/docsospesi/filtri.spec.ts`

**Steps:**
  1. Cliccare 'Filtra' con tutti i filtri a Tutti
    - expect: Griglia con l'elenco completo, nessun errore JS (escludere errori di risorse di API esterne alla pagina)

#### 2.12. Ricerca testuale nell'autocomplete

**File:** `tests/ente/docsospesi/filtri.spec.ts`

**Steps:**
  1. Digitare in Tipologia Fattura 'zzz', poi '<script>', poi '%'
    - expect: Messaggio 'No options', nessun chip creato con Enter, nessun errore JS

### 3. Griglia sospesi: dati, ordinamento, dettaglio

**Seed:** `tests/auth.setup.ts`

#### 3.1. Struttura colonne e formattazione

**File:** `tests/ente/docsospesi/grid.spec.ts`

**Steps:**
  1. Mockare due fatture (split true / false, tipoContratto PAC / PAL) e osservare la tabella
    - expect: Colonne: (expand), Data Fattura, Stato, T. Fattura, Ident., Tipo Contratto, Tot., N. Fattura, Tipo Documento, Divisa, M. Pagamento, Split, (azione)
    - expect: Stato = 'Sospesa' su ogni riga
    - expect: Data gg/mm/aaaa, Ident. mm/aaaa, Tot. '1.261,00 €', Split 'Si'/'No'
    - expect: Tipo Contratto troncato 'PAC - PAL ...' con aria-label 'PAC - PAL con requisiti' / 'PAC - PAL senza requisiti'

#### 3.2. Espansione riga: Posizioni

**File:** `tests/ente/docsospesi/grid.spec.ts`

**Steps:**
  1. Cliccare 'expand row' su una riga con 2 posizioni
    - expect: Sotto-tabella 'Posizioni' con colonne Numero Linea, Codice Materiale, Imponibile, Periodo di riferimento, Periodo di fatturazione
    - expect: Posizioni ordinate per numeroLinea
    - expect: Nuovo click richiude la riga
  2. Espandere una riga con posizioni []
    - expect: Nessun errore JS, nessuna riga di posizione

#### 3.3. Ordinamento colonne (3 stati)

**File:** `tests/ente/docsospesi/grid.spec.ts`

**Steps:**
  1. Con 31 fatture in ordine non ordinato, per Data Fattura, Ident., Tot., N. Fattura, Tipo Documento cliccare Sort una, due e tre volte
    - expect: 1 click ascendente, 2 click discendente (icona ArrowDownward), 3 click ordine originale
  2. Ordinare per Tot. e passare a pagina 2
    - expect: L'ordinamento si applica all'intera lista (pagina 2 continua la sequenza), label '11–20 of 31'
  3. Ordinare Tot. discendente e poi cliccare Sort su Data Fattura
    - expect: L'indicatore di Tot. torna neutro

#### 3.4. Ordinamento disabilitato durante modifica filtri

**File:** `tests/ente/docsospesi/grid.spec.ts`

**Steps:**
  1. Ordinare per Tot., poi cambiare Anno senza Filtra
    - expect: Griglia svuotata, tutti i pulsanti Sort disabilitati e indicatori reimpostati

#### 3.5. Click su riga apre il dettaglio

**File:** `tests/ente/docsospesi/grid.spec.ts`

**Steps:**
  1. Cliccare la cella Data Fattura della prima riga
    - expect: Navigazione a /ente/fatturapdf/documentisospesi/<idfattura>
    - expect: Voce di menu 'Documenti contabili sospesi' ancora evidenziata
    - expect: La pagina dettaglio mostra 'Dati di Fatturazione' con tipologia, anno e mese della riga (richiede mock o dati reali dell'API dettaglio sospesi)
  2. Tornare indietro con il back del browser
    - expect: Filtri, pagina e ordinamento ripristinati da localStorage

### 4. Paginazione

**Seed:** `tests/auth.setup.ts`

#### 4.1. Paginazione con 33 fatture

**File:** `tests/ente/docsospesi/paginazione.spec.ts`

**Steps:**
  1. Mockare 33 fatture e aprire la pagina
    - expect: 10 righe, 'Go to previous page' disabilitato, label '1–10 of 33'
  2. Cliccare 'Go to next page' fino all'ultima pagina
    - expect: Pagine con ID-10..19, ID-20..29, poi 3 righe ID-30..32
    - expect: Next disabilitato all'ultima pagina, label '31–33 of 33'

#### 4.2. Cambio righe per pagina

**File:** `tests/ente/docsospesi/paginazione.spec.ts`

**Steps:**
  1. Andare a pagina 2 e scegliere 25 in 'Rows per page'
    - expect: Si torna a pagina 1 con 25 righe, label '1–25 of 33'

#### 4.3. Paginazione azzerata dopo Filtra e Annulla

**File:** `tests/ente/docsospesi/paginazione.spec.ts`

**Steps:**
  1. Andare a pagina 2 e cliccare Filtra
    - expect: Label '1–10 of 33'
  2. Selezionare un anno, Filtra, andare a pagina 2 e cliccare Annulla filtri
    - expect: Label '1–10 of 33' e prima riga ID-0

### 5. Download

**Seed:** `tests/auth.setup.ts`

#### 5.1. Download risultati senza filtri

**File:** `tests/ente/docsospesi/download.spec.ts`

**Steps:**
  1. Con dati in griglia cliccare 'Download risultati' (endpoint sospese/download mockato con un xlsx e un breve ritardo)
    - expect: Modale 'Downloading...' compare e scompare
    - expect: File 'Documenti sospesi_Comune di San Mauro Torinese.xlsx'
    - expect: Body della richiesta { anno: null, mese: null, tipologiaFattura: [], dataFattura: [] }

#### 5.2. Nome file con anno e con anno+mese

**File:** `tests/ente/docsospesi/download.spec.ts`

**Steps:**
  1. Filtrare per Anno 2023 e scaricare
    - expect: File 'Documenti sospesi_<RS>_2023.xlsx'
  2. Filtrare per Anno 2024 + Gennaio e scaricare
    - expect: File 'Documenti sospesi_<RS>_Gennaio_2024.xlsx'

#### 5.3. Download usa i filtri applicati e non quelli solo selezionati

**File:** `tests/ente/docsospesi/download.spec.ts`

**Steps:**
  1. Filtrare per Anno 2025, poi cambiare Anno in 2024 senza Filtra
    - expect: 'Download risultati' disabilitato (griglia svuotata)
  2. Cliccare Filtra e scaricare
    - expect: Body con anno 2024 e file '..._2024.xlsx'

#### 5.4. Pulsante download disabilitato con griglia vuota

**File:** `tests/ente/docsospesi/download.spec.ts`

**Steps:**
  1. Mockare credito/sospeso con dettagli [] e aprire la pagina
    - expect: 'Download risultati' disabilitato e messaggio 'Non sono presenti fatture sospese'

#### 5.5. Errore API di download

**File:** `tests/ente/docsospesi/download.spec.ts`

**Steps:**
  1. Mockare sospese/download con status 500 e cliccare Download
    - expect: Modale 'Downloading...' si chiude
    - expect: Alert di errore manageError e nessun file scaricato
    - expect: Nota: downloadFattureSospeseEnte usa fetch, che non rigetta su HTTP 500; come per /ente/docemessi e' probabile che venga salvato il body di errore come .xlsx senza alert (difetto noto)

### 6. Riquadro Credito sospeso

**Seed:** `tests/auth.setup.ts`

#### 6.1. Credito sospeso positivo, zero e negativo

**File:** `tests/ente/docsospesi/grid.spec.ts`

**Steps:**
  1. Mockare importoSospeso = 615
    - expect: Valore '615,00 €', sfondo #F2FAF2
  2. Mockare importoSospeso = 0
    - expect: Valore '--', sfondo #E3E7EB
  3. Mockare importoSospeso = -50
    - expect: Valore '-50,00 €', sfondo #ffeff1

#### 6.2. Etichetta del riquadro

**File:** `tests/ente/docsospesi/grid.spec.ts`

**Steps:**
  1. Aprire la pagina e filtrare per Anno 2024 + Gennaio
    - expect: L'etichetta resta 'Credito sospeso' (la variabile labelAmount con anno/mese e' calcolata nel codice ma non usata nel render: da confermare con il team se l'etichetta dovrebbe includere il periodo)

### 7. Stati vuoti ed errori API

**Seed:** `tests/auth.setup.ts`

#### 7.1. Nessun risultato per filtro

**File:** `tests/ente/docsospesi/grid.spec.ts`

**Steps:**
  1. Con un mock senza fatture 2025 selezionare Anno 2025 e cliccare Filtra
    - expect: 'Non sono presenti fatture sospese', Credito sospeso '--', paginatore '0–0 of 0', next/prev e Download disabilitati

#### 7.2. Errore 500 su periodo/sospeso

**File:** `tests/ente/docsospesi/grid.spec.ts`

**Steps:**
  1. Mockare GET periodo/sospeso con 500
    - expect: Alert 'L'operazione non è andata a buon fine. Si prega di riprovare', loading chiuso
    - expect: Anno con sola opzione 'Tutti', pagina utilizzabile ('Filtra' abilitato)
    - expect: POST credito/sospeso non chiamata

#### 7.3. Errore 500 su credito/sospeso e ripristino

**File:** `tests/ente/docsospesi/grid.spec.ts`

**Steps:**
  1. Mockare POST credito/sospeso con 500
    - expect: Alert di errore, loading chiuso, griglia vuota
  2. Ripristinare la risposta corretta e cliccare Filtra
    - expect: Griglia ripopolata con 6 righe

#### 7.4. Risposta lenta / loading

**File:** `tests/ente/docsospesi/grid.spec.ts`

**Steps:**
  1. Ritardare di 3s la risposta di credito/sospeso
    - expect: Modale 'Operazione in corso - Loading...' visibile finche' la richiesta non termina, poi griglia popolata

### 8. Persistenza filtri e navigazione

**Seed:** `tests/auth.setup.ts`

#### 8.1. Persistenza dei filtri dopo reload

**File:** `tests/ente/docsospesi/persistenza-filtri.spec.ts`

**Steps:**
  1. Selezionare Anno 2024 + tipologia PRIMO SALDO, cliccare Filtra e ricaricare
    - expect: localStorage 'filters' con pathPage '/ente/docsospesi' e body con i filtri
    - expect: Dopo il reload Anno, chip, griglia, paginatore e Credito sospeso ripristinati, 'Annulla filtri' visibile

#### 8.2. Persistenza di pagina, righe e ordinamento

**File:** `tests/ente/docsospesi/persistenza-filtri.spec.ts`

**Steps:**
  1. Con 33 fatture ordinare per Tot., andare a pagina 2, cambiare righe per pagina e ricaricare
    - expect: Stessa pagina, stesse righe per pagina e stesso ordinamento dopo il reload

#### 8.3. Filtri separati tra sospesi ed emessi

**File:** `tests/ente/docsospesi/persistenza-filtri.spec.ts`

**Steps:**
  1. Applicare un filtro su /ente/docsospesi, aprire 'Documenti contabili emessi' dal menu e tornare a 'Documenti contabili sospesi'
    - expect: I filtri non vengono applicati alla pagina emessi (pathPage diverso)
    - expect: Tornando su sospesi i filtri non sono piu' presenti (useSavedFilters rimuove 'filters' quando pathPage non corrisponde)

#### 8.4. Annulla filtri pulisce la persistenza

**File:** `tests/ente/docsospesi/persistenza-filtri.spec.ts`

**Steps:**
  1. Applicare un filtro, cliccare Annulla filtri e ricaricare
    - expect: Nessun filtro attivo dopo il reload, 'Annulla filtri' assente

#### 8.5. Filtri salvati non piu' validi

**File:** `tests/ente/docsospesi/persistenza-filtri.spec.ts`

**Steps:**
  1. Impostare in localStorage 'filters' con pathPage '/ente/docsospesi' e anno 1999, poi ricaricare
    - expect: Nessun crash, griglia vuota, 'Annulla filtri' visibile
  2. Impostare 'filters' con JSON malformato e ricaricare
    - expect: Nessun crash e filtri di default (nota: useSaveFiltersLocalStorage fa JSON.parse senza try/catch, stesso difetto noto di /ente/docemessi)

### 9. Navigazione e layout

**Seed:** `tests/auth.setup.ts`

#### 9.1. Navigazione dal menu laterale

**File:** `tests/ente/docsospesi/titolo.spec.ts`

**Steps:**
  1. Da /ente/datidifatturazione cliccare 'Documenti contabili'
    - expect: Il sottomenu si apre e si naviga a /ente/docsospesi (la voce padre porta direttamente ai sospesi)
    - expect: Titolo 'Documenti contabili sospesi', voce di menu evidenziata
  2. Cliccare l'icona di chiusura del sottomenu
    - expect: Il sottomenu si chiude senza cambiare pagina

#### 9.2. Pulsante Esci

**File:** `tests/ente/docsospesi/titolo.spec.ts`

**Steps:**
  1. Cliccare 'Esci' nell'header
    - expect: globalStatePF e filters rimossi, redirect a Selfcare
    - expect: Riaprire /ente/docsospesi richiede di nuovo l'autenticazione

#### 9.3. Accessibilita' di base

**File:** `tests/ente/docsospesi/titolo.spec.ts`

**Steps:**
  1. Con 15 fatture navigare con Tab dal campo Anno
    - expect: Focus su Anno, poi Tipologia Fattura (Mese e Data disabilitati saltati), poi Filtra
    - expect: Pulsanti 'expand row', Sort e 'Go to next page' raggiungibili; 'Go to previous page' disabilitato non riceve focus
