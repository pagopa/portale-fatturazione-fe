# Piano di test - Ente / Dati di fatturazione (/ente/datidifatturazione)

## Application Overview

Piano di test per la pagina "Dati di fatturazione" (Area personale utente ente) di portale-fatturazione-fe (componente src/page/prod_pn/areaPersonaleUtenteEnte.tsx, rotta PathPf.DATI_FATTURAZIONE_EN = /ente/datidifatturazione). La pagina e' testata SOLO come ENTE: i test stanno in tests/ente/areaPersonale/ (un file per area) e la fixture `role` non serve. Il ramo PAGOPA del componente (getDatiFatPagoPa, redirect a LISTA_DATI_FATTURAZIONE, modifyDatiFatturazionePagoPa ecc.) e' fuori scope.

NOTA: il percorso indicato nella richiesta (src/page/prod_pn/areaPersonaleUtenteEnte.tsx) e' quello reale; CLAUDE.md cita src/pages/... Il piano e' derivato dal codice (areaPersonaleUtenteEnte.tsx, components/areaPersonale/{tabAreaPersonaleUtente,pageTitleNavigation,textField,dynamicInsert,data,radio,skeletonDatiFatturazione}.tsx, reusableComponents/modals/{modal,modalInfo,modalLoading}.tsx, api/apiSelfcare/datiDiFatturazioneSE/api.tsx, i18n.js). L'app NON e' stata esplorata dal vivo (richiede sessione Selfcare): nomi accessibili e testid vanno confermati con browser_snapshot in fase di implementazione (vedi sezione Note).

Struttura della pagina (ENTE): PageTitleNavigation (heading h4 'Dati di fatturazione' | 'Modifica dati di fatturazione' | 'Inserisci i dati di fatturazione', pulsante 'Modifica' solo se immutable e profilo.ruolo === 'R/W', link 'Indietro' in alto solo se mutable && datiFatturazione), TabAreaPersonaleUtente con: radio tipoCommessa ("Dati ordine d'acquisto" / "Dati contratto"), CUP, radio "Split Payment" (Si/No), PEC, ID Documento, "Data documento" (DesktopDatePicker dd/MM/yyyy), "Codice Commessa/Convenzione", "Email amministrativo" + pulsante 'Aggiungi Email' (max 3 contatti, edit/delete su icone senza nome accessibile), "Codice univoco o SDI", checkbox notaLegale, "Data primo accesso" / "Data ultimo accesso"; in fondo (solo mutable) pulsanti 'Indietro' e 'Salva'; modali: BasicModal ("Attenzione!" / "Le modifiche andranno perse", 'Annulla' / 'Ok'), ModalInfo ("Attenzione!" con messaggio di errore SDI), ModalLoading ('Operazione in corso' durante il salvataggio, 'Verifica del codice SDI in corso' durante la verifica SDI).

## Test Scenarios

### 1. 1. Titolo e caricamento (tests/ente/areaPersonale/titolo.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 1.1. 1.1. Skeleton durante il caricamento dei dati

**File:** `tests/ente/areaPersonale/titolo.spec.ts`

**Steps:**
  1. Mockare GET /api/datifatturazione/ente con una promise controllata (risposta ritardata) e aprire /ente/datidifatturazione
    - expect: Viene mostrato lo Skeleton (SuspenseDatiFatturazione); il heading 'Dati di fatturazione' NON e' visibile
    - expect: Nessun campo del form (CUP, PEC, ...) visibile
    - expect: Nessuna chiamata a contractCodiceSDI
  2. Rilasciare la risposta (dati completi)
    - expect: Lo Skeleton scompare e compare il heading 'Dati di fatturazione' con il form valorizzato

#### 1.2. 1.2. Titolo in modalita' immutable (dati presenti)

**File:** `tests/ente/areaPersonale/titolo.spec.ts`

**Steps:**
  1. Mockare GET dati fatturazione con dati completi (idDocumento e cup valorizzati) e aprire la pagina
    - expect: Heading h4 'Dati di fatturazione' visibile
    - expect: Pulsante 'Modifica' visibile (profilo ruolo R/W)
    - expect: Link 'Indietro' (header) assente
    - expect: Pulsanti 'Indietro' e 'Salva' in fondo alla pagina assenti
    - expect: Nessun breadcrumb 'Dati di fatturazione /'

#### 1.3. 1.3. Pulsante Modifica assente per ruolo non R/W

**File:** `tests/ente/areaPersonale/titolo.spec.ts`

**Steps:**
  1. Impostare il profilo con ruolo diverso da 'R/W' (globalStatePF via addInitScript/storageState) e aprire la pagina con dati completi
    - expect: Heading 'Dati di fatturazione' visibile
    - expect: Pulsante 'Modifica' assente (profilo.ruolo !== 'R/W')
    - expect: Tutti i campi disabilitati

#### 1.4. 1.4. Date primo e ultimo accesso

**File:** `tests/ente/areaPersonale/titolo.spec.ts`

**Steps:**
  1. Aprire la pagina con dati presenti (profilo dataPrimo 2025-11-17, dataUltimo 2026-10-14)
    - expect: Label 'Data primo accesso' e 'Data ultimo accesso' visibili
    - expect: Accanto a ciascuna compare la data formattata da createDateFromString (formato esatto da confermare dal vivo)

#### 1.5. 1.5. Date di accesso assenti quando non ci sono dati di fatturazione

**File:** `tests/ente/areaPersonale/titolo.spec.ts`

**Steps:**
  1. Mockare GET dati fatturazione 404 e GET contractCodiceSDI 200 e aprire la pagina
    - expect: Label 'Data primo accesso' e 'Data ultimo accesso' presenti ma senza valore (mainState.datiFatturazione false)

### 2. 2. Visualizzazione dati - stato immutable (tests/ente/areaPersonale/visualizzazione.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 2.1. 2.1. Campi valorizzati e disabilitati con GET 200

**File:** `tests/ente/areaPersonale/visualizzazione.spec.ts`

**Steps:**
  1. Mockare GET /api/datifatturazione/ente con tipoCommessa '1', cup 'CUP123', idDocumento 'DOC-1', codCommessa 'COM/1', pec 'pec@test.it', splitPayment true, notaLegale true, codiceSDI 'ABC1234', 2 contatti, dataDocumento valorizzata; aprire la pagina
    - expect: Radio "Dati ordine d'acquisto" selezionata, entrambe le radio disabilitate
    - expect: getByLabel 'CUP' = 'CUP123', 'PEC', 'ID Documento', 'Codice Commessa/Convenzione', 'Codice univoco o SDI' valorizzati e disabilitati
    - expect: Radio 'Si' di Split Payment selezionata e disabilitata
    - expect: 'Data documento' valorizzata (dd/MM/yyyy) e disabilitata
    - expect: Le 2 email contatto sono visibili come testo, senza icone di modifica/eliminazione
    - expect: 'Email amministrativo' e 'Aggiungi Email' disabilitati
    - expect: Checkbox notaLegale selezionata e disabilitata
    - expect: Nessun errore (aria-invalid) su alcun campo
  2. Verificare la rete
    - expect: Una sola GET /api/datifatturazione/ente
    - expect: Nessuna POST/PUT
    - expect: Nessuna chiamata a /api/datifatturazione/codiceSDI (la verifica SDI parte solo in mutable)
    - expect: Nessuna chiamata a contractCodiceSDI
  3. Leggere lo stato persistito (globalStatePF)
    - expect: datiFatturazione true, statusPageDatiFatturazione 'immutable', datiFatturazioneNotCompleted false

#### 2.2. 2.2. Dati completi: cup e idDocumento entrambi vuoti restano immutable

**File:** `tests/ente/areaPersonale/visualizzazione.spec.ts`

**Steps:**
  1. Mockare GET con cup '' e idDocumento ''; aprire la pagina
    - expect: statusPageDatiFatturazione 'immutable' e datiFatturazioneNotCompleted false (idDocumento==='' && cup!=='' e' false)
    - expect: Heading 'Dati di fatturazione'

#### 2.3. 2.3. Dati incompleti: idDocumento vuoto e cup valorizzato forza mutable

**File:** `tests/ente/areaPersonale/visualizzazione.spec.ts`

**Steps:**
  1. Mockare GET con idDocumento '' e cup 'CUP123' (resto valido) e aprire la pagina
    - expect: statusPageDatiFatturazione 'mutable' e datiFatturazioneNotCompleted true nello stato persistito
    - expect: Heading 'Modifica dati di fatturazione'
    - expect: Link 'Indietro' in header e pulsanti 'Indietro' e 'Salva' in fondo visibili
    - expect: Pulsante 'Modifica' assente
    - expect: Campi abilitati
    - expect: Il campo 'ID Documento' e' in errore (obbligatorio perche' cup valorizzato) e 'Salva' risulta disabilitato
    - expect: Il pulsante 'Indietro' in fondo e' abilitato (datiFatturazione true)

#### 2.4. 2.4. Caso inverso: idDocumento valorizzato e cup vuoto resta immutable

**File:** `tests/ente/areaPersonale/visualizzazione.spec.ts`

**Steps:**
  1. Mockare GET con idDocumento 'DOC-1' e cup ''
    - expect: statusPageDatiFatturazione 'immutable' (la condizione richiede idDocumento==='' && cup!=='')
    - expect: Heading 'Dati di fatturazione' e pulsante 'Modifica' visibile

#### 2.5. 2.5. codiceSDI null o vuoto: fallback su contractCodiceSDI

**File:** `tests/ente/areaPersonale/visualizzazione.spec.ts`

**Steps:**
  1. Mockare GET con codiceSDI null e contractCodiceSDI 'CTR9999'
    - expect: Il campo 'Codice univoco o SDI' mostra 'CTR9999'
  2. Ripetere con codiceSDI '' e contractCodiceSDI 'CTR9999'
    - expect: Il campo mostra 'CTR9999'
  3. Ripetere con codiceSDI 'ABC1234' e contractCodiceSDI 'CTR9999'
    - expect: Il campo mostra 'ABC1234' (nessun fallback)
  4. Ripetere con codiceSDI null e contractCodiceSDI null
    - expect: Il campo e' vuoto, nessun crash

#### 2.6. 2.6. Contratto idTipoContratto 2: Split Payment non modificabile

**File:** `tests/ente/areaPersonale/visualizzazione.spec.ts`

**Steps:**
  1. Impostare profilo con idTipoContratto 2 (SELFCARE), dati presenti, aprire la pagina e premere 'Modifica'
    - expect: Le radio 'Si' e 'No' di Split Payment restano disabilitate anche in mutable
    - expect: Le altre radio (tipo ordine) diventano abilitate

#### 2.7. 2.7. Contatti: tre email massimo

**File:** `tests/ente/areaPersonale/visualizzazione.spec.ts`

**Steps:**
  1. Mockare GET con 3 contatti e aprire la pagina
    - expect: Le 3 email sono visibili
    - expect: helperText 'max 0' sotto 'Email amministrativo'

### 3. 3. Nessun dato di fatturazione - GET 404 (tests/ente/areaPersonale/primoInserimento.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 3.1. 3.1. 404 sulla GET: fallback su contractCodiceSDI e form vuoto mutable

**File:** `tests/ente/areaPersonale/primoInserimento.spec.ts`

**Steps:**
  1. Mockare GET /api/datifatturazione/ente con 404 e GET /api/datifatturazione/ente/contractCodiceSDI con { contractCodiceSDI: 'SDI0001' }; aprire la pagina
    - expect: Heading 'Inserisci i dati di fatturazione'
    - expect: Chiamate: GET datifatturazione/ente (1 volta) poi GET contractCodiceSDI (1 volta)
    - expect: Stato persistito: datiFatturazione false, statusPageDatiFatturazione 'mutable'
    - expect: Campo 'Codice univoco o SDI' = 'SDI0001'
    - expect: CUP, PEC, ID Documento, Codice Commessa/Convenzione, Data documento vuoti
    - expect: Nessun pulsante 'Modifica'; nessun link 'Indietro' in header (richiede datiFatturazione true)
    - expect: Pulsante 'Indietro' in fondo visibile ma disabilitato
    - expect: Pulsante 'Salva' visibile e disabilitato
    - expect: Nessun alert d'errore

#### 3.2. 3.2. 404: nessuna tipologia selezionata, campi disabilitati e bordo di errore

**File:** `tests/ente/areaPersonale/primoInserimento.spec.ts`

**Steps:**
  1. Aprire la pagina nel caso 3.1
    - expect: Nessuna radio tipoCommessa selezionata
    - expect: Tutti i campi testo, data, split payment, 'Email amministrativo', 'Aggiungi Email' e checkbox notaLegale disabilitati finche' non si sceglie la tipologia
    - expect: Il blocco radio tipoCommessa ha il bordo rosso di errore (stile, non verificabile con getByRole: eventualmente aggiungere data-testid)
  2. Selezionare la radio "Dati ordine d'acquisto"
    - expect: I campi diventano abilitati (Split Payment, PEC, CUP, ID Documento, Codice Commessa/Convenzione, SDI, Data documento, Email amministrativo, checkbox notaLegale)
    - expect: 'Salva' resta disabilitato

#### 3.3. 3.3. 404 e fallimento della chiamata contractCodiceSDI

**File:** `tests/ente/areaPersonale/primoInserimento.spec.ts`

**Steps:**
  1. Mockare GET dati fatturazione 404 e GET contractCodiceSDI 500
    - expect: Viene mostrato l'errore del layout gestito da manageError ('L'operazione non e' andata a buon fine. Si prega di riprovare')
    - expect: Il caricamento termina (nessuno skeleton infinito)
    - expect: Lo stato mainState non passa a mutable/datiFatturazione false per via di questo ramo (da verificare: il catch non modifica lo stato); la pagina non va in crash

#### 3.4. 3.4. 404 con contractCodiceSDI assente nella risposta

**File:** `tests/ente/areaPersonale/primoInserimento.spec.ts`

**Steps:**
  1. Mockare contractCodiceSDI con body {} (campo mancante)
    - expect: Il campo 'Codice univoco o SDI' e' vuoto, 'Salva' disabilitato, nessun crash

#### 3.5. 3.5. Indietro (header) assente e Indietro (fondo) disabilitato

**File:** `tests/ente/areaPersonale/primoInserimento.spec.ts`

**Steps:**
  1. Aprire la pagina nel caso 3.1 e tentare di cliccare 'Indietro' in fondo
    - expect: Il pulsante e' disabilitato (mainState.datiFatturazione === false): nessun modale 'Attenzione!' si apre

### 4. 4. Errori sul caricamento (tests/ente/areaPersonale/errori-caricamento.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 4.1. 4.1. GET dati fatturazione 500

**File:** `tests/ente/areaPersonale/errori-caricamento.spec.ts`

**Steps:**
  1. Mockare GET datifatturazione/ente con 500 e aprire la pagina
    - expect: Alert/modale di errore 500: "L'operazione non è andata a buon fine. Si prega di riprovare"
    - expect: Nessuna chiamata a contractCodiceSDI (solo il 404 la attiva)
    - expect: Lo skeleton viene rimosso (loadingData false) e viene mostrato il form di default (vuoto) senza crash

#### 4.2. 4.2. GET dati fatturazione 401/403/419/409

**File:** `tests/ente/areaPersonale/errori-caricamento.spec.ts`

**Steps:**
  1. Per ciascuno status: 409 -> "L'operazione non è andata a buon fine"; 403 e 401 -> "Utente non autenticato. Effettuare nuovamente l'accesso" (con redirect a Selfcare gestito dal layout; eseguire 401/403 per ultimi); 419 e 400 -> testo da confermare dal vivo
    - expect: Il testo dell'errore del layout corrisponde allo status (manageError)
    - expect: Nessuna chiamata a contractCodiceSDI
    - expect: La pagina non va in crash

#### 4.3. 4.3. Errore di rete (Network Error)

**File:** `tests/ente/areaPersonale/errori-caricamento.spec.ts`

**Steps:**
  1. Abortire la richiesta GET datifatturazione/ente (route.abort)
    - expect: err.response e' undefined: err?.response?.status !== 404 -> manageError('Network Error'); nessun crash
    - expect: Skeleton rimosso

### 5. 5. Modifica - ingresso e uscita (tests/ente/areaPersonale/modifica.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 5.1. 5.1. Click su Modifica abilita il form

**File:** `tests/ente/areaPersonale/modifica.spec.ts`

**Steps:**
  1. Aprire la pagina con dati completi e cliccare 'Modifica'
    - expect: Heading 'Modifica dati di fatturazione'
    - expect: Pulsante 'Modifica' scompare
    - expect: Compaiono link 'Indietro' in header, breadcrumb 'Dati di fatturazione /' e 'Modifica i dati di fatturazione', pulsanti 'Indietro' e 'Salva' in fondo
    - expect: Tutti i campi (CUP, PEC, ID Documento, Codice Commessa/Convenzione, SDI, Data documento, Email amministrativo, radio, checkbox) abilitati
    - expect: Compaiono le icone modifica/elimina accanto alle email
    - expect: statusPageDatiFatturazione 'mutable' nello stato persistito
    - expect: Nessuna chiamata di rete aggiuntiva eccetto la verifica SDI iniziale (vedi 5.2)

#### 5.2. 5.2. All'ingresso in mutable parte la verifica del codice SDI (primo render)

**File:** `tests/ente/areaPersonale/modifica.spec.ts`

**Steps:**
  1. Mockare POST /api/datifatturazione/codiceSDI con 200 e cliccare 'Modifica'
    - expect: Una POST a codiceSDI con body { codiceSDI: '<valore corrente>' }
    - expect: Nessun ModalInfo e nessun modale 'Verifica del codice SDI in corso'
    - expect: Il campo SDI non e' in errore; 'Salva' abilitato se i dati sono validi e completi
  2. Ripetere con POST codiceSDI 400 { detail: 'Codice SDI non valido' }
    - expect: Nessun ModalInfo (isFirstRender true non apre il popup)
    - expect: Il campo 'Codice univoco o SDI' risulta in errore (aria-invalid true) e 'Salva' disabilitato

#### 5.3. 5.3. Indietro (fondo) apre il modale di conferma

**File:** `tests/ente/areaPersonale/modifica.spec.ts`

**Steps:**
  1. Entrare in modifica e cliccare 'Indietro' in fondo alla pagina
    - expect: Si apre il dialog con heading 'Attenzione!' e testo 'Le modifiche andranno perse'
    - expect: Pulsanti 'Annulla' e 'Ok' visibili
    - expect: La pagina sottostante e' aria-hidden

#### 5.4. 5.4. Indietro (header) apre lo stesso modale

**File:** `tests/ente/areaPersonale/modifica.spec.ts`

**Steps:**
  1. Entrare in modifica e cliccare il link 'Indietro' in alto
    - expect: Si apre il modale 'Attenzione!' / 'Le modifiche andranno perse' (clickOn INDIETRO_BUTTON)

#### 5.5. 5.5. Annulla chiude il modale e mantiene le modifiche

**File:** `tests/ente/areaPersonale/modifica.spec.ts`

**Steps:**
  1. Entrare in modifica, modificare PEC in 'nuova@test.it', cliccare 'Indietro' e poi 'Annulla'
    - expect: Il modale si chiude
    - expect: Il campo PEC mantiene 'nuova@test.it'
    - expect: Si resta in modalita' mutable (heading 'Modifica dati di fatturazione')
    - expect: Nessuna nuova GET datifatturazione/ente

#### 5.6. 5.6. Ok ripristina i dati originali e torna in sola lettura

**File:** `tests/ente/areaPersonale/modifica.spec.ts`

**Steps:**
  1. Entrare in modifica, modificare PEC, cliccare 'Indietro' e poi 'Ok'
    - expect: Il modale si chiude
    - expect: Viene richiamata GET datifatturazione/ente (getDatiFat) e il form torna ai valori del server (PEC originale)
    - expect: statusPageDatiFatturazione 'immutable', heading 'Dati di fatturazione', pulsante 'Modifica' visibile, pulsanti Indietro/Salva assenti
    - expect: NB: handleEsci esegue anche navigate(open.clickOn) con valore 'INDIETRO_BUTTON' (percorso relativo) ma open.clickOn non e' ancora azzerato nella closure: verificare dal vivo che l'URL resti /ente/datidifatturazione. Se cambia (es. /ente/INDIETRO_BUTTON) e' un bug da segnalare

#### 5.7. 5.7. Chiusura del modale con Escape

**File:** `tests/ente/areaPersonale/modifica.spec.ts`

**Steps:**
  1. Aprire il modale 'Attenzione!' e premere Escape
    - expect: Il modale si chiude (handleClose), si resta in mutable con i dati modificati

#### 5.8. 5.8. Navigazione dal menu laterale in modalita' mutable

**File:** `tests/ente/areaPersonale/modifica.spec.ts`

**Steps:**
  1. Entrare in modifica e cliccare una voce del menu laterale (es. 'Modulo commessa')
    - expect: Si apre il modale 'Attenzione!' con clickOn = path della voce
    - expect: 'Ok': navigazione alla pagina scelta, stato torna immutable
    - expect: Ripetendo con 'Annulla': si resta sulla pagina dei dati di fatturazione

### 6. 6. Validazione campi (tests/ente/areaPersonale/validazione.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 6.1. 6.1. Stato di partenza: form valido e Salva abilitato in modifica

**File:** `tests/ente/areaPersonale/validazione.spec.ts`

**Steps:**
  1. Aprire con dati completi validi, mockare POST codiceSDI 200 e cliccare 'Modifica'
    - expect: Nessun campo in errore
    - expect: Pulsante 'Salva' abilitato

#### 6.2. 6.2. PEC non valida

**File:** `tests/ente/areaPersonale/validazione.spec.ts`

**Steps:**
  1. In modifica scrivere in 'PEC' 'non-una-mail'
    - expect: Il campo PEC e' in errore (aria-invalid true)
    - expect: 'Salva' disabilitato
  2. Correggere in 'pec@test.it'
    - expect: Errore rimosso, 'Salva' di nuovo abilitato

#### 6.3. 6.3. PEC vuota

**File:** `tests/ente/areaPersonale/validazione.spec.ts`

**Steps:**
  1. In modifica svuotare 'PEC'
    - expect: Campo in errore, 'Salva' disabilitato (pec === '' e/o validazione fallita)

#### 6.4. 6.4. CUP: lunghezza massima e caratteri speciali

**File:** `tests/ente/areaPersonale/validazione.spec.ts`

**Steps:**
  1. Scrivere in 'CUP' 16 caratteri alfanumerici
    - expect: Il campo accetta al massimo 15 caratteri (maxLength)
  2. Scrivere 'CUP-12!' (caratteri non alfanumerici)
    - expect: Il campo CUP e' in errore e 'Salva' disabilitato (solo [a-zA-Z0-9] consentiti)

#### 6.5. 6.5. CUP e ID Documento reciprocamente obbligatori

**File:** `tests/ente/areaPersonale/validazione.spec.ts`

**Steps:**
  1. Partire da cup '' e idDocumento ''; scrivere solo 'CUP123' nel CUP
    - expect: 'ID Documento' diventa obbligatorio e in errore
    - expect: Anche 'Data documento' diventa required
    - expect: 'Salva' disabilitato
  2. Scrivere 'DOC-1' in 'ID Documento'
    - expect: Errori di CUP/ID Documento rimossi; resta richiesta la 'Data documento' (se mancante errore) e 'Salva' abilitato solo con data valida
  3. Svuotare di nuovo il CUP lasciando l'ID Documento
    - expect: Il CUP e' in errore e 'Salva' disabilitato
  4. Svuotare entrambi
    - expect: Nessun errore, 'Data documento' non obbligatoria, 'Salva' abilitato

#### 6.6. 6.6. ID Documento: lunghezza massima e caratteri

**File:** `tests/ente/areaPersonale/validazione.spec.ts`

**Steps:**
  1. Scrivere 21 caratteri in 'ID Documento'
    - expect: maxLength 20: il campo tronca a 20 caratteri
  2. Scrivere 'DOC_1.2/3-4' e poi 'DOC@1'
    - expect: Il primo e' accettato (consentiti . / _ - e spazi); il secondo mette il campo in errore e disabilita 'Salva'

#### 6.7. 6.7. Data documento: valida, fuori range, non valida

**File:** `tests/ente/areaPersonale/validazione.spec.ts`

**Steps:**
  1. Con CUP e ID Documento valorizzati digitare in 'Data documento' '15/03/2026'
    - expect: Nessun errore, 'Salva' abilitato
  2. Digitare '15/03/1999' e poi '15/03/2126'
    - expect: Il campo e' in errore (anno < 2000 o > 2125) e 'Salva' disabilitato
  3. Cancellare la data con CUP/ID valorizzati
    - expect: Campo in errore, 'Salva' disabilitato
  4. Cancellare la data con CUP e ID Documento vuoti
    - expect: Nessun errore, dataDocumento null inviata come null

#### 6.8. 6.8. Codice Commessa/Convenzione: lunghezza e caratteri

**File:** `tests/ente/areaPersonale/validazione.spec.ts`

**Steps:**
  1. Scrivere 101 caratteri nel campo 'Codice Commessa/Convenzione'
    - expect: maxLength 100: troncato
  2. Scrivere 'COM/1_a-b.c' e poi 'COM#1'
    - expect: Il primo e' accettato, il secondo e' in errore e disabilita 'Salva'
  3. Lasciare il campo vuoto
    - expect: Campo facoltativo: nessun errore, 'Salva' abilitato

#### 6.9. 6.9. Email amministrativo: formato, duplicati, limite di 3

**File:** `tests/ente/areaPersonale/validazione.spec.ts`

**Steps:**
  1. Scrivere 'non-mail' in 'Email amministrativo'
    - expect: Il campo e' in errore e 'Aggiungi Email' disabilitato
  2. Scrivere 'uno@test.it' e cliccare 'Aggiungi Email'
    - expect: L'email compare nell'elenco con icone modifica/elimina; il campo si svuota; helperText 'max 2'
  3. Riscrivere 'uno@test.it' (duplicato)
    - expect: Campo in errore e 'Aggiungi Email' disabilitato
  4. Aggiungere altre due email diverse
    - expect: Con 3 contatti 'Email amministrativo' e 'Aggiungi Email' sono disabilitati, helperText 'max 0'

#### 6.10. 6.10. Contatti: modifica ed eliminazione

**File:** `tests/ente/areaPersonale/validazione.spec.ts`

**Steps:**
  1. Con 2 contatti cliccare l'icona di modifica del primo (aggiungere data-testid, le icone non hanno nome accessibile)
    - expect: L'email viene rimossa dall'elenco e riportata nel campo 'Email amministrativo'
  2. Cliccare l'icona elimina del secondo contatto
    - expect: L'email viene rimossa dall'elenco
  3. Eliminare tutti i contatti
    - expect: Il campo 'Email amministrativo' e' in errore (arrElement vuoto), 'Salva' disabilitato

#### 6.11. 6.11. Codice SDI: maiuscolo automatico, lunghezza e caratteri

**File:** `tests/ente/areaPersonale/validazione.spec.ts`

**Steps:**
  1. Scrivere 'abc1234' in 'Codice univoco o SDI'
    - expect: Il valore diventa 'ABC1234' (toUpperCase)
  2. Scrivere 8 caratteri
    - expect: maxLength 7: troncato a 7
  3. Scrivere 'AB-123'
    - expect: Dopo 1500 ms di debounce non parte la POST (regex ^[A-Z0-9]*$ fallisce), il campo e' in errore, il modale 'Verifica del codice SDI in corso' si chiude, 'Salva' disabilitato

#### 6.12. 6.12. Salva disabilitato se codice SDI vuoto o null

**File:** `tests/ente/areaPersonale/validazione.spec.ts`

**Steps:**
  1. In modifica svuotare 'Codice univoco o SDI'
    - expect: 'Salva' disabilitato; campo in errore (required)
  2. Caso 404 con contractCodiceSDI null (SDI null) e tutti gli altri dati compilati
    - expect: 'Salva' disabilitato finche' non si compila l'SDI

#### 6.13. 6.13. Salva disabilitato senza notaLegale

**File:** `tests/ente/areaPersonale/validazione.spec.ts`

**Steps:**
  1. Con tutti gli altri campi validi, deselezionare la checkbox notaLegale
    - expect: 'Salva' disabilitato
  2. Riselezionare la checkbox
    - expect: 'Salva' abilitato

#### 6.14. 6.14. Salva disabilitato senza contatti

**File:** `tests/ente/areaPersonale/validazione.spec.ts`

**Steps:**
  1. Nel caso primo inserimento compilare tutto tranne le email
    - expect: 'Salva' disabilitato; dopo aver aggiunto una email valida diventa abilitato

#### 6.15. 6.15. Checkbox notaLegale non attivabile senza tipologia

**File:** `tests/ente/areaPersonale/validazione.spec.ts`

**Steps:**
  1. Nel caso 404 (tipoCommessa vuoto) ispezionare la checkbox
    - expect: La checkbox e' disabilitata finche' non si seleziona una tipologia di ordine

#### 6.16. 6.16. Cambio tipologia ordine

**File:** `tests/ente/areaPersonale/validazione.spec.ts`

**Steps:**
  1. In modifica selezionare "Dati contratto"
    - expect: La radio e' selezionata; i nuovi contatti inseriti dopo avranno tipo = '2' (verificabile nel body dell'invio)

### 7. 7. Verifica codice SDI (tests/ente/areaPersonale/verificaSdi.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 7.1. 7.1. Verifica SDI con esito positivo

**File:** `tests/ente/areaPersonale/verificaSdi.spec.ts`

**Steps:**
  1. In modifica mockare POST /api/datifatturazione/codiceSDI con ritardo controllato, scrivere 'ABC1234' in 'Codice univoco o SDI'
    - expect: Subito dopo la digitazione 'Salva' diventa disabilitato (flag SDI true)
    - expect: Dopo il debounce di 1500 ms compare il modale con heading 'Verifica del codice SDI in corso' e 'Attendere la fine del processo'
    - expect: La POST ha body { codiceSDI: 'ABC1234' }
  2. Rilasciare la risposta 200
    - expect: Il modale si chiude
    - expect: Il campo non e' in errore e 'Salva' torna abilitato (se il resto e' valido)

#### 7.2. 7.2. Verifica SDI con esito negativo

**File:** `tests/ente/areaPersonale/verificaSdi.spec.ts`

**Steps:**
  1. Mockare POST codiceSDI con 400 { detail: 'Codice SDI non valido' } e scrivere un nuovo SDI
    - expect: Il modale 'Verifica...' si chiude
    - expect: Si apre ModalInfo con heading 'Attenzione!' e testo 'Codice SDI non valido'
    - expect: Campo SDI in errore e 'Salva' disabilitato
  2. Chiudere il ModalInfo (icona di chiusura o Escape; il click sul backdrop e' ignorato)
    - expect: Il modale si chiude e il campo resta in errore

#### 7.3. 7.3. Debounce: digitazioni rapide generano una sola POST

**File:** `tests/ente/areaPersonale/verificaSdi.spec.ts`

**Steps:**
  1. Digitare lentamente 'A','B','C' con intervalli < 1500 ms
    - expect: Una sola POST a codiceSDI con il valore finale 'ABC'

#### 7.4. 7.4. Digitazione SDI con tipologia non selezionata

**File:** `tests/ente/areaPersonale/verificaSdi.spec.ts`

**Steps:**
  1. Nel caso 404 senza tipoCommessa tentare di scrivere nel campo SDI
    - expect: Il campo e' disabilitato, nessuna POST

#### 7.5. 7.5. Errore 500 sulla verifica SDI

**File:** `tests/ente/areaPersonale/verificaSdi.spec.ts`

**Steps:**
  1. Mockare POST codiceSDI con 500 e body {} e scrivere un SDI
    - expect: err.response.data.detail e' undefined: si apre comunque ModalInfo (frase vuota o di default da verificare) senza crash

### 8. 8. Salvataggio (tests/ente/areaPersonale/salvataggio.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 8.1. 8.1. Modifica di dati esistenti (PUT)

**File:** `tests/ente/areaPersonale/salvataggio.spec.ts`

**Steps:**
  1. Aprire la pagina con dati completi, mockare PUT /api/datifatturazione con 200, POST codiceSDI 200 e GET dati con valori aggiornati dopo la PUT; cliccare 'Modifica', cambiare PEC e aggiungere una email, cliccare 'Salva'
    - expect: Appare il modale 'Operazione in corso' con 'Loading...' durante la PUT (ritardare la risposta)
    - expect: Una sola PUT /api/datifatturazione con body = datiFatturazione corrente + dataDocumento in formato ISO locale (toLocalISOString) oppure null
    - expect: Nessuna POST /api/datifatturazione
    - expect: Dopo la PUT viene richiamata GET datifatturazione/ente
    - expect: Compare l'alert di successo 'Dati di fatturazione inseriti' (SAVE_DATIFATTURAZIONE_OK)
    - expect: Pagina in immutable: heading 'Dati di fatturazione', 'Modifica' visibile, Indietro/Salva assenti, valori aggiornati
    - expect: Stato: statusPageDatiFatturazione 'immutable', datiFatturazioneNotCompleted false

#### 8.2. 8.2. Primo inserimento (POST)

**File:** `tests/ente/areaPersonale/salvataggio.spec.ts`

**Steps:**
  1. Caso 404; selezionare "Dati ordine d'acquisto", compilare PEC 'pec@test.it', aggiungere email 'ref@test.it', spuntare notaLegale, mantenere SDI da contratto (POST codiceSDI 200), cliccare 'Salva'
    - expect: Una sola POST /api/datifatturazione con body { tipoCommessa:'1', splitPayment:true, cup:'', notaLegale:true, idDocumento:'', codCommessa:'', contatti:[{tipo:'1',email:'ref@test.it'}], dataDocumento:null, pec:'pec@test.it', codiceSDI:'<sdi>' } senza idEnte e prodotto
    - expect: Nessuna PUT
    - expect: Dopo la POST: GET datifatturazione/ente richiamata (ora con dati)
    - expect: Alert 'Dati di fatturazione inseriti'
    - expect: Stato: datiFatturazione true, statusPageDatiFatturazione 'immutable', datiFatturazioneNotCompleted false
    - expect: Heading 'Dati di fatturazione' e pulsante 'Modifica' visibile

#### 8.3. 8.3. Salvataggio con CUP, ID Documento e data

**File:** `tests/ente/areaPersonale/salvataggio.spec.ts`

**Steps:**
  1. Compilare CUP, ID Documento e Data documento '15/03/2026' e salvare
    - expect: Il body contiene cup, idDocumento e dataDocumento in formato ISO locale (senza spostamento di fuso: giorno 2026-03-15)

#### 8.4. 8.4. Completamento di dati incompleti (cup senza idDocumento)

**File:** `tests/ente/areaPersonale/salvataggio.spec.ts`

**Steps:**
  1. GET con cup 'CUP123' e idDocumento ''; compilare 'ID Documento' e 'Data documento' e salvare
    - expect: PUT inviata, poi alla GET successiva con dati completi stato 'immutable'
    - expect: datiFatturazioneNotCompleted torna false

#### 8.5. 8.5. Errore sulla PUT con detail

**File:** `tests/ente/areaPersonale/salvataggio.spec.ts`

**Steps:**
  1. Mockare PUT con 500 { detail: 'Dettaglio errore backend' } e salvare
    - expect: Il modale 'Operazione in corso' si chiude
    - expect: Alert d'errore con il testo 'Dettaglio errore backend'
    - expect: Si resta in mutable con i dati modificati (heading 'Modifica dati di fatturazione')
    - expect: Nessuna GET successiva a datifatturazione/ente
    - expect: Nessun alert di successo

#### 8.6. 8.6. Errore sulla POST con detail

**File:** `tests/ente/areaPersonale/salvataggio.spec.ts`

**Steps:**
  1. Caso 404; mockare POST /api/datifatturazione con 409 { detail: 'Dati gia presenti' } e salvare
    - expect: Alert d'errore 'Dati gia presenti'
    - expect: Stato resta mutable, datiFatturazione false, 'Indietro' ancora disabilitato

#### 8.7. 8.7. Errore senza detail

**File:** `tests/ente/areaPersonale/salvataggio.spec.ts`

**Steps:**
  1. Mockare PUT/POST con 500 body {}
    - expect: Alert con il testo di default "L'operazione non è andata a buon fine. Contattare l'assistenza" (message undefined), nessun crash

#### 8.8. 8.8. Errori di autenticazione sul salvataggio (401, 403)

**File:** `tests/ente/areaPersonale/salvataggio.spec.ts`

**Steps:**
  1. Mockare PUT con 403 e poi 401 (per ultimi)
    - expect: Alert "Utente non autenticato. Effettuare nuovamente l'accesso" e successivo redirect a Selfcare

#### 8.9. 8.9. Errore di rete sulla PUT (senza response)

**File:** `tests/ente/areaPersonale/salvataggio.spec.ts`

**Steps:**
  1. Abortire la richiesta PUT
    - expect: err.response e' undefined: il catch lancia TypeError su err.response.status; il modale 'Operazione in corso' si chiude (setOpenModalLoading(false) eseguito prima) ma nessun alert viene mostrato. Documentare il comportamento come probabile bug (unhandled rejection)

#### 8.10. 8.10. Doppio click su Salva

**File:** `tests/ente/areaPersonale/salvataggio.spec.ts`

**Steps:**
  1. Mockare la PUT con ritardo e fare dblclick su 'Salva'
    - expect: Il modale 'Operazione in corso' blocca il secondo click; una sola PUT

#### 8.11. 8.11. GET di ricarica fallita dopo il salvataggio

**File:** `tests/ente/areaPersonale/salvataggio.spec.ts`

**Steps:**
  1. PUT 200 e la GET successiva 500
    - expect: Compare l'alert 'Dati di fatturazione inseriti' ma anche l'errore 500 del layout; pagina senza crash

#### 8.12. 8.12. Persistenza dopo reload

**File:** `tests/ente/areaPersonale/salvataggio.spec.ts`

**Steps:**
  1. Dopo un salvataggio riuscito eseguire page.reload()
    - expect: Il form viene ricaricato con la GET e mostra i valori salvati in modalita' immutable

#### 8.13. 8.13. Body della PUT include tutti i campi dello state

**File:** `tests/ente/areaPersonale/salvataggio.spec.ts`

**Steps:**
  1. Modificare un solo campo e salvare
    - expect: Il body PUT contiene id, idEnte, dataCreazione, dataModifica, contractCodiceSDI, map, prodotto (spread di datiFatturazione) oltre ai campi modificati: confermare con il team che sia voluto

### 9. 9. Interazione con altre pagine (tests/ente/areaPersonale/navigazione.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 9.1. 9.1. Accesso dalla voce di menu 'Dati di fatturazione'

**File:** `tests/ente/areaPersonale/navigazione.spec.ts`

**Steps:**
  1. Aprire la home ente e cliccare nel menu laterale la voce 'Dati di fatturazione'
    - expect: URL /ente/datidifatturazione, voce di menu evidenziata (Mui-selected), heading 'Dati di fatturazione'

#### 9.2. 9.2. Navigazione dal menu in modalita' immutable senza modale

**File:** `tests/ente/areaPersonale/navigazione.spec.ts`

**Steps:**
  1. In stato immutable cliccare un'altra voce di menu
    - expect: Si naviga direttamente, nessun modale 'Attenzione!'

#### 9.3. 9.3. Primo accesso senza dati: redirect forzato da altre pagine

**File:** `tests/ente/areaPersonale/navigazione.spec.ts`

**Steps:**
  1. Con datiFatturazione=false aprire /ente/modulicommessa
    - expect: Compare il ModalRedirect con la richiesta dei dati di fatturazione; confermando si arriva a /ente/datidifatturazione in modalita' mutable (inserimento)

#### 9.4. 9.4. Salvataggio completato sblocca il modulo commessa

**File:** `tests/ente/areaPersonale/navigazione.spec.ts`

**Steps:**
  1. Dopo il salvataggio del caso 8.2 aprire /ente/modulicommessa
    - expect: Non compare ModalRedirect (datiFatturazione true e datiFatturazioneNotCompleted false)

## Possibili bug individuati (da verificare dal vivo)

Rilevati dalla lettura del codice, non ancora confermati nell'app. Per ognuno, il test va scritto sul comportamento corretto atteso e marcato `test.fail()` finché il bug non è risolto.

| # | Bug | Dove | Comportamento atteso | Scenario |
|---|-----|------|----------------------|----------|
| 1 | Su errore di rete durante il salvataggio (nessuna `response`), il catch esegue `err.response.status` → TypeError, nessun alert mostrato (unhandled rejection) | `src/page/prod_pn/areaPersonaleUtenteEnte.tsx` catch di insert/modify (righe ~250, ~267, ~299, ~317) | Viene mostrato un alert di errore generico | Salvataggio - errore di rete |
| 2 | Click su "Ok" nel modale "Attenzione!" aperto da Indietro: `handleEsci` esegue `navigate(open.clickOn)` con `'INDIETRO_BUTTON'` come path relativo. Confermato in 5.6: l'app passa da `/ente/datidifatturazione/INDIETRO_BUTTON`, il router riporta a `/ente/datidifatturazione` e la pagina si ricarica (3 GET invece di 2) | `BasicModal` (`components/reusableComponents/modals/modal`) | L'URL resta `/ente/datidifatturazione`, la pagina torna immutable | Modifica - Indietro → Ok |
| 3 | GET dati fatturazione 404 seguita da errore su `contractCodiceSDI`: `handleModifyMainState` non viene chiamato, lo stato non passa a `mutable` e il form resta inutilizzabile | `getDatiFat`, catch di `getSdi` (righe ~141-168) | Il form è comunque editabile (vuoto) e viene mostrato l'errore | Primo inserimento - contractCodiceSDI fallisce |
| 4 | La PUT invia l'intero stato `datiFatturazione` (`id`, `idEnte`, `contractCodiceSDI`, `map`, `dataCreazione`, ...) invece dei soli campi modificabili | `modifyDatiFatturazione` (riga ~256) | Body con i soli campi del form (da confermare con il BE) | Salvataggio - body PUT |
| 5 | Le icone modifica/elimina dei contatti email non hanno nome accessibile; lo stesso per l'indicatore di errore (bordo rosso) della tipologia di ordine | `components/areaPersonale/tabAreaPersonaleUtente` | `aria-label` o `data-testid` presenti per localizzarli con getByRole/getByTestId | Validazione - contatti email |
| 6 | I due RadioGroup (tipologia ordine e Split Payment) condividono `name="row-radio-buttons-group"`: il browser li tratta come un unico gruppo nativo, quindi selezionando Split Payment "Si" la radio "Dati ordine d'acquisto" risulta non selezionata (confermato in 2.1) | `src/components/areaPersonale/radio.tsx` riga 37 | Ogni gruppo ha un `name` univoco ed entrambe le selezioni restano attive | Visualizzazione - 2.1 |
| 7 | Su 401/403 durante il salvataggio l'alert mostra il `detail` del BE (o il fallback `errori.400`) invece di "Utente non autenticato. Effettuare nuovamente l'accesso"; su 403 l'alert è verde (successo). Il redirect a Selfcare avviene comunque (confermato in 8.8) | `setErrorAlert` nei catch di insert/modify + `alert.tsx` | Messaggio `errori.<status>` con alert di errore | Salvataggio - 8.8 |
