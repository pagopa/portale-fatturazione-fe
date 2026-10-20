# Piano di test - Ente / Modulo commessa inserimento e dettaglio (/ente/modulocommessa)

## Application Overview

Piano di test per la pagina "Modulo commessa - inserimento/dettaglio" dell'area ente di portale-fatturazione-fe (componente src/page/ente/moduloCommessaInserimentoUtEn30.tsx, rotta /ente/modulocommessa, PathPf.MODULOCOMMESSA_EN). La pagina e' solo ENTE: i test stanno in tests/ente/moduloCommessaInserimento/, un file per area, e vengono eseguiti solo come ENTE (la fixture `role` non serve). La logica sta in src/hooks/useSaveModifyModuloCommessa.ts (whoInvokeHook "ENTE"); la UI nei componenti di src/components/commessaInserimentoTrimestrale/ (mainComponentInserimentoCommessa, stepperModCommessa, primo/secondo/terzoContainerTrimestrale, rowInserimentoCommessaTrimestrale, inserisciRegioniModCommessa) e nei modali ModalAlert, BasicModal, ModalInfo, ModalRedirect, ModalLoading. La pagina ha due modalita'. (A) Inserimento OBBLIGATORI (isObbligatorioLayout=true): verifica=true e infoTrimestreComSelected vuoto; carica la lista dei moduli obbligatori (uno step per modulo, titolo step = nome del mese), isEditAllow=true, si compilano i valori e si avanza con Avanti; il salvataggio e' unico alla fine (POST con tutti i moduli) e poi redirect a /ente/datidifatturazione. (B) Dettaglio/modifica di un singolo modulo (infoTrimestreComSelected valorizzato dalla pagina elenco): GET dettaglio/<anno>/<mese>, isEditAllow dipende da source/stato/modifica; pulsanti Modifica/Salva; Avanti/Indietro caricano il modulo adiacente da infoTrimestreComSelected.moduli. Header: pulsante "Indietro" (ButtonNaked), caption "Modulo commessa", e "/ Inserimento moduli commessa OBBLIGATORI" (dataObbligatori) oppure "/ Dettaglio-Inserimento modulo commessa". Corpo: riga Mese/Anno + Tipo Contratto (PAL se idTipoContratto===1, altrimenti PAC), 3 righe di input (digitale, analogico A/R, 890; nazionale e diverso da nazionale; 890 ha solo il nazionale) con totali per riga e riga TOTALE, select multipla "Inserisci regione" + "Aggiungi regione" (nascosta se source archiviato), tabella regioni con campi AR/890 e cestino (isEditAllow) oppure chip (sola lettura), riga "Totale Notifiche" AR/890, righe "Percentuale copertura inserita dell'aderente" e, per archiviato, "Percentuale copertura attribuita dal sistema"; per archiviato con stato non null anche TerzoContainer (importi, richiede GET configurazione). Footer: Indietro/Avanti (label con refuso "Indiero"), Salva/Modifica/Prosegui per salvare, Vedi anteprima. L'app NON e' stata esplorata dal vivo in questa sessione (il browser del planner non e' disponibile): tutto e' derivato dal codice; i fatti gia' verificati sull'app reale dal team (mount, verifica, lista, regioni, ModalAlert, redirect su errore lista, dettaglio con modifica:false) sono incorporati nei prerequisiti e nei casi. Nomi accessibili e testid vanno confermati con browser_snapshot in fase di implementazione; i TextField MUI non hanno label ne' id: servono data-testid (o localizzazione posizionale per riga) per i campi numerici.

### Prerequisiti

- Regole CLAUDE.md: `test`/`expect` SEMPRE da tests/fixtures.ts; mai backend reale (fixtures.ts risponde 404 alle API non mockate); locator solo getByRole / getByLabel / getByTestId; niente waitForTimeout; niente login (sessione da tests/auth.setup.ts).
- Un file di test per area in tests/ente/moduloCommessaInserimento/: titolo, caricamento, form, regioni, stepper, salvataggio, navigazione. Pagina solo ENTE.
- Mock in tests/utils/moduloCommessaInserimentoMock/, estendendo o riusando mockInserimento e mockDettaglioInserimento di tests/utils/moduloCommessaElencoMock/moduloCommessaElencoMock.ts.
- redirectToInsert va scritto con addInitScript prima del goto (la pagina lo riscrive a false al mount).
- Stato per la modalita' dettaglio: seedSession (tests/utils/ente/docContabiliMock.ts) con infoTrimestreComSelected (annoCommessaSelectd, meseCommessaSelected, moduloSelectedIndex, moduli[{id:'3/2026', meseAnno:'Marzo/2026'}], idEnte, prodotto, idTipoContratto), oppure click sulla riga dell'elenco.
- Con un modale MUI aperto il resto della pagina e' aria-hidden.
- Le TextField non hanno label: usare i data-testid (sull'<input>, verificati dal vivo):
  - campi modulo (editabili se modifica): `modulo-totaleNotificheDigitaleNaz`, `modulo-totaleNotificheDigitaleInternaz`, `modulo-totaleNotificheAnalogicoARNaz`, `modulo-totaleNotificheAnalogicoARInternaz`, `modulo-totaleNotificheAnalogico890Naz`;
  - regioni (editabili se isEditAllow): `regione-ar-<istatRegione>`, `regione-890-<istatRegione>`;
  - sola lettura: `totale-ar`, `totale-890`, `copertura-ar`, `copertura-890`, e per archiviato `copertura-sistema-ar`, `copertura-sistema-890`.

### API chiamate dalla pagina (host API_HOST, tutte con query nonce)

- GET /api/v2/modulocommessa/obbligatori/verifica: booleano.
- GET /api/v2/modulocommessa/obbligatori/lista: {lista, macrocategoriaVendita} (modalita' obbligatori, verifica=true e infoTrimestreComSelected vuoto).
- GET /api/v2/modulocommessa/dettaglio/<anno>/<mese>: {lista:[modulo], totali, macrocategoriaVendita} (modalita' dettaglio).
- GET /api/v2/modulocommessa/regioni: array {regione, istatRegione, ...}.
- POST /api/v2/modulocommessa: array; ogni elemento con anno, mese, moduliCommessa (3 voci: idTipoSpedizione 1=AR, 2=890, 3=digitale) e valoriRegione.
- GET /api/datifatturazione/ente: solo prima del salvataggio.
- GET configurazione commessa (getDatiConfigurazioneCommessa): solo per archiviato con stato non null (TerzoContainer); URL esatto da verificare.

### Mock da creare (tests/utils/moduloCommessaInserimentoMock/)

1. moduloCommessaInserimentoMock.ts con opzioni per: verifica; lista obbligatori (n moduli, stato null o valorizzato, valoriRegione); dettaglio (source, stato, modifica, totaleNotifiche, valoriRegione con calcolato/obbligatorio, macrocategoriaVendita 1..4 e ""); regioni (anche duplicati).
2. POST con cattura del body e status configurabile (200, 500 con {detail}, 401/403/404/409) e ritardo.
3. datifatturazione/ente (200, 404, 500) e configurazione commessa.
4. Secondo GET dettaglio dopo il salvataggio con risposta diversa dalla prima.
5. Rotta pdf /ente/pdfmodulocommessa/... (solo per verificare la navigazione).
6. Helper seedInfoTrimestre, lettura di globalStatePF e helper per i campi per riga.

### Note e dubbi da confermare con il team

- Fatti gia' verificati dal vivo (test dell'elenco): con obbligatori/lista [{annoValidita:2026, meseValidita:10, stato:null, valoriRegione:[], totale:null}] e regioni [] la pagina mostra "Indietro" e "/ Inserimento moduli commessa OBBLIGATORI"; Indietro con isEditAllow=true apre "Attenzione!" (Annulla / Ok), Ok torna a /ente/modulicommessa; se obbligatori/lista fallisce si torna subito all'elenco (NO_INSERIMENTO_COMMESSA); in dettaglio con modifica:false Indietro torna all'elenco senza modale.
- "Prosegui per salvare" e' sempre disabilitato: il disabled usa la stessa condizione che assegna la label.
- Copertura <100 con macrocategoriaVendita fuori da 1-4 (es. "" o 0): VERIFICATO DAL VIVO, il ramo else di avantiFunction chiama handleNext: Avanti passa allo step successivo SENZA alcun avviso sulla copertura (lacuna, non blocco).
- Errore su regioni: setLoadingData(false) e' solo nel then, lo Skeleton resta per sempre.
- Dettaglio con infoTrimestreComSelected vuoto e verifica=false: lettura di .moduli di undefined, TypeError nel catch generale e ritorno all'elenco con NO_INSERIMENTO_COMMESSA.
- Obbligatori senza moduli con stato null: findIndex -> activeStep=-1; con lista vuota activeCommessa e' undefined (comportamento non definito). Dettaglio con lista:[]: TypeError su res.valoriRegione.
- POST: totaleNotifiche per idTipoSpedizione 1 e 3 usa totaleNotificheAnalogico/totaleNotificheDigitale, mai ricalcolati dal form (possono arrivare a 0). Il tipo PostModuloCommessa dichiara valoriRegioni ma il codice invia valoriRegione.
- Validazione numerica: accetta decimali ("1.5") e notazione esponenziale ("1e2"), " " vale 0; isAnyValueOfModuloEqualNull controlla solo 5 campi.
- errorArRegioni / error890Regioni sono globali e non si ricalcolano al cambio step.
- Testi: bottone "Indiero" (refuso); modali copertura con doppio spazio e refuso "allla"; ModalRedirect con doppio spazio dopo "fornire"; tooltip dei bottoni stepper disabilitati = false.
- Vedi anteprima: totaleNotifiche !== null e' vero anche con undefined, quindi con il campo mancante il pulsante appare.
- Dopo il salvataggio: obbligatori -> redirect a /ente/datidifatturazione; dettaglio -> reload con isCallAfterSaveData (activeCommessa letto da una closure, fragile). Sul 500 della POST si naviga all'elenco perdendo i dati inseriti.
- onAddRegioniButton / onDeleteSingleRegione / onChangeModuloValue ricompongono dataModuli con slice: possono cambiare l'ordine dei moduli quando sono piu' di uno.
- Codice morto: checkifRegioneHasBothValuesNull (pagina e mainComponentInserimentoCommessa, commento 06/03/26), nessuno scenario.
- BasicModal: open e' {visible, clickOn}; alcune combinazioni non hanno ramo e "Ok" non fa nulla; testo uguale a ModalAlert ("Attenzione!" / "Le modifiche andranno perse"). Apertura dal menu laterale dedotta dal codice.
- Da confermare dal vivo: testo dell'alert su 500 (err.response.data.detail via setErrorAlert). Il piano e' derivato dal codice (browser del planner non avviato).

## Test Scenarios

### 1. Titolo e accesso (tests/ente/moduloCommessaInserimento/titolo.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 1.1. Intestazione in modalita' obbligatori

**File:** `tests/ente/moduloCommessaInserimento/titolo.spec.ts`

**Steps:**
  1. Mockare verifica=true, obbligatori/lista con un modulo {annoValidita:2026, meseValidita:10, stato:null, valoriRegione:[], totale:null} e regioni [] (mockInserimento), impostare redirectToInsert=false e aprire /ente/modulocommessa
    - expect: Pulsante 'Indietro' visibile
    - expect: Testo 'Modulo commessa' (caption) visibile
    - expect: Testo '/ Inserimento moduli commessa OBBLIGATORI' visibile e '/ Dettaglio-Inserimento modulo commessa' assente
    - expect: Riga 'Mese/Anno:' con 'Ottobre/2026' e 'Tipo Contratto:'
    - expect: Skeleton presente durante il caricamento e poi rimosso

#### 1.2. Intestazione in modalita' dettaglio

**File:** `tests/ente/moduloCommessaInserimento/titolo.spec.ts`

**Steps:**
  1. Seed di infoTrimestreComSelected (annoCommessaSelectd '2026', meseCommessaSelected '3', moduloSelectedIndex 0, moduli [{id:'3/2026', meseAnno:'Marzo/2026'}]) e mock dettaglio con un modulo, aprire la pagina
    - expect: Testo '/ Dettaglio-Inserimento modulo commessa' visibile, '/ Inserimento moduli commessa OBBLIGATORI' assente
    - expect: Chiamata GET /api/v2/modulocommessa/dettaglio/2026/3 e nessuna chiamata a obbligatori/lista
    - expect: 'Marzo/2026' nella riga Mese/Anno

#### 1.3. Chiamate al mount e redirectToInsert

**File:** `tests/ente/moduloCommessaInserimento/titolo.spec.ts`

**Steps:**
  1. Impostare redirectToInsert='true' e aprire la pagina
    - expect: Una sola chiamata a obbligatori/verifica
    - expect: localStorage redirectToInsert === 'false' dopo il mount

#### 1.4. Dati di fatturazione mancanti: ModalRedirect

**File:** `tests/ente/moduloCommessaInserimento/titolo.spec.ts`

**Steps:**
  1. seedSession con mainState.datiFatturazione=false e aprire la pagina
    - expect: ModalRedirect con 'Attenzione!' e il testo 'Per poter inserire il modulo commessa è obbligatorio fornire  i seguenti dati di fatturazione:' (doppio spazio, usare regex)
    - expect: Elenco: 'Selezionare una delle voci "Dati ordine di acquisto" o "Dati contratto"', 'Split Payment', 'Indirizzo mail PEC', 'Codice SDI', 'Indirizzo mail di riferimento', 'Accettazione del disclaimer sul codice degli appalti'
    - expect: Pulsante 'Vai ai dati di fatturazione'
    - expect: Il resto della pagina e' aria-hidden
  2. Cliccare 'Vai ai dati di fatturazione'
    - expect: URL /ente/datidifatturazione

#### 1.5. ModalRedirect con datiFatturazioneNotCompleted e chiusura

**File:** `tests/ente/moduloCommessaInserimento/titolo.spec.ts`

**Steps:**
  1. seedSession con datiFatturazione=false e datiFatturazioneNotCompleted=true, aprire la pagina
    - expect: Nel modale compare solo la voce 'Id Documento'
  2. Premere Escape
    - expect: Il modale si chiude (reason escapeKeyDown)
  3. Riaprire il modale e cliccare sul backdrop
    - expect: Il modale resta aperto (backdropClick ignorato)

#### 1.6. datiFatturazione true: nessun ModalRedirect

**File:** `tests/ente/moduloCommessaInserimento/titolo.spec.ts`

**Steps:**
  1. Aprire la pagina con sessione standard
    - expect: Testo 'Per poter inserire il modulo commessa' assente

#### 1.7. BasicModal impostato a mutable in modalita' obbligatori

**File:** `tests/ente/moduloCommessaInserimento/titolo.spec.ts`

**Steps:**
  1. Aprire la pagina in modalita' obbligatori e leggere globalStatePF
    - expect: mainState.statusPageInserimentoCommessa === 'mutable'
    - expect: BasicModal ('Attenzione!' / 'Le modifiche andranno perse') non visibile (il suo open e' l'oggetto openBasicModal_DatFat_ModCom, visible assente)

### 2. Caricamento obbligatori e dettaglio (tests/ente/moduloCommessaInserimento/caricamento.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 2.1. Obbligatori: lista con piu' moduli e step iniziale

**File:** `tests/ente/moduloCommessaInserimento/caricamento.spec.ts`

**Steps:**
  1. Mockare lista con 3 moduli: mesi 8 e 9 con stato 'inserito' e mese 10 con stato null
    - expect: Lo stepper mostra 'Agosto','Settembre','Ottobre' (step label = month[meseValidita-1])
    - expect: Step attivo = primo con stato null ('Ottobre/2026' nel Mese/Anno)
    - expect: Campi abilitati (isEditAllow=true)

#### 2.2. Obbligatori: un solo modulo, niente stepper ne' Avanti/Indietro

**File:** `tests/ente/moduloCommessaInserimento/caricamento.spec.ts`

**Steps:**
  1. Mockare lista con un solo modulo
    - expect: Nessuno stepper (steps.length>1 richiesto)
    - expect: Pulsanti 'Indiero' e 'Avanti' assenti
    - expect: Pulsante 'Salva' presente

#### 2.3. Obbligatori: tutti i moduli gia' compilati (nessun stato null)

**File:** `tests/ente/moduloCommessaInserimento/caricamento.spec.ts`

**Steps:**
  1. Mockare lista con tutti i moduli con stato non null
    - expect: Comportamento attuale: findIndex restituisce -1, activeStep=-1 (documentare: stepper e Mese/Anno con dataModuli[-1]); testo '/ Dettaglio-Inserimento modulo commessa' (dataObbligatori=false)
    - expect: Nessun crash applicativo (verificare pageerror)

#### 2.4. Obbligatori: lista senza campo 'lista' o vuota

**File:** `tests/ente/moduloCommessaInserimento/caricamento.spec.ts`

**Steps:**
  1. Rispondere con {macrocategoriaVendita:1} e poi con {lista:[]}
    - expect: obbligatori=[]: activeCommessa undefined; la pagina non deve andare in crash (documentare il comportamento attuale: probabile pagina vuota o errore sull'accesso a activeCommessa)

#### 2.5. Obbligatori: valoriRegione null viene normalizzato a []

**File:** `tests/ente/moduloCommessaInserimento/caricamento.spec.ts`

**Steps:**
  1. Mockare un modulo con valoriRegione:null
    - expect: Nessuna riga regione, nessun errore

#### 2.6. Obbligatori: regioni gia' presenti nel modulo escluse dalla select

**File:** `tests/ente/moduloCommessaInserimento/caricamento.spec.ts`

**Steps:**
  1. Mockare regioni [Lazio(12), Piemonte(1), Veneto(5)] e un modulo con valoriRegione=[{istatRegione:'12',...}]
    - expect: Tabella con la riga Lazio
    - expect: Aprendo 'Inserisci regione' compaiono solo Piemonte e Veneto

#### 2.7. Regioni duplicate nella risposta deduplicate per istatRegione

**File:** `tests/ente/moduloCommessaInserimento/caricamento.spec.ts`

**Steps:**
  1. Mockare /regioni con due record con stesso istatRegione (province diverse)
    - expect: La select mostra la regione una sola volta

#### 2.8. Errore su obbligatori/lista: ritorno all'elenco

**File:** `tests/ente/moduloCommessaInserimento/caricamento.spec.ts`

**Steps:**
  1. verifica=true, obbligatori/lista 500 e aprire la pagina
    - expect: Redirect a /ente/modulicommessa
    - expect: Alert 'Al momento non è possibile inserire il modulo commessa. Contattare l'assistenza'

#### 2.9. Errore su verifica: ritorno all'elenco

**File:** `tests/ente/moduloCommessaInserimento/caricamento.spec.ts`

**Steps:**
  1. verifica 500 (poi 401)
    - expect: Redirect a /ente/modulicommessa con alert NO_INSERIMENTO_COMMESSA (catch generale)

#### 2.10. verifica=false senza stato: ramo dettaglio con infoTrimestreComSelected vuoto

**File:** `tests/ente/moduloCommessaInserimento/caricamento.spec.ts`

**Steps:**
  1. verifica=false con infoTrimestreComSelected={} e aprire la pagina
    - expect: Va nel ramo else: legge infoTrimestreComSelected.moduli di undefined -> TypeError nel try, catch: redirect a /ente/modulicommessa con alert NO_INSERIMENTO_COMMESSA (comportamento attuale da confermare)

#### 2.11. Errore su regioni

**File:** `tests/ente/moduloCommessaInserimento/caricamento.spec.ts`

**Steps:**
  1. Regioni 500
    - expect: manageError gestisce l'errore; loadingData resta true: Skeleton permanente (probabile bug: setLoadingData(false) solo nel then)

#### 2.12. Dettaglio: source obbligatorio, stato null, modifica true

**File:** `tests/ente/moduloCommessaInserimento/caricamento.spec.ts`

**Steps:**
  1. Mockare dettaglio {lista:[{source:'obbligatorio', stato:null, modifica:true, valoriRegione:[...]}], totali:[], macrocategoriaVendita:3}
    - expect: isEditAllow=true: campi abilitati, bottone 'Salva' visibile

#### 2.13. Dettaglio: stato valorizzato (non archiviato) in sola lettura

**File:** `tests/ente/moduloCommessaInserimento/caricamento.spec.ts`

**Steps:**
  1. Mockare stato 'inserito', modifica true
    - expect: Campi disabilitati, pulsante 'Modifica' visibile
    - expect: Le regioni mostrano chip invece del cestino

#### 2.14. Dettaglio: source archiviato

**File:** `tests/ente/moduloCommessaInserimento/caricamento.spec.ts`

**Steps:**
  1. Mockare source 'archiviato', stato 'inserito', modifica true, con GET configurazione mockato (getDatiConfigurazioneCommessa)
    - expect: isEditAllow=false
    - expect: Select 'Inserisci regione' e 'Aggiungi regione' assenti
    - expect: TerzoContainer visibile con 'TOTALE MODULO COMMESSA NETTO IVA' e 'Data modifica'
    - expect: Pulsanti Salva/Modifica assenti

#### 2.15. Dettaglio: modifica false forza sola lettura

**File:** `tests/ente/moduloCommessaInserimento/caricamento.spec.ts`

**Steps:**
  1. Mockare stato null, source 'obbligatorio', modifica:false
    - expect: isEditAllow=false (la regola !modifica prevale)
    - expect: Campi disabilitati, nessun Salva/Modifica
    - expect: Click su 'Indietro' naviga a /ente/modulicommessa senza modale

#### 2.16. Dettaglio: valoriRegione assente normalizzato a []

**File:** `tests/ente/moduloCommessaInserimento/caricamento.spec.ts`

**Steps:**
  1. Rispondere senza valoriRegione
    - expect: Nessun crash, nessuna riga regione

#### 2.17. Dettaglio: errori 500, 404 e lista vuota

**File:** `tests/ente/moduloCommessaInserimento/caricamento.spec.ts`

**Steps:**
  1. Dettaglio 500 / 404 / lista:[]
    - expect: 500/404: manageError e Skeleton rimosso, pagina senza dati
    - expect: lista vuota: TypeError su res.valoriRegione (lista[0] undefined) nel then, finisce nel catch con manageError (documentare)

#### 2.18. Profilo di vendita e ModalInfo percentuali (macrocategoriaVendita)

**File:** `tests/ente/moduloCommessaInserimento/caricamento.spec.ts`

**Steps:**
  1. Caricare con macrocategoriaVendita 1,2,3,4
    - expect: Il valore e' usato solo per il testo dei modali di copertura (vedi suite salvataggio e stepper)

#### 2.19. Tipo contratto PAL/PAC

**File:** `tests/ente/moduloCommessaInserimento/caricamento.spec.ts`

**Steps:**
  1. Mockare idTipoContratto 1 e 2
    - expect: 'PAL' per 1, 'PAC' per qualsiasi altro valore

### 3. Form, valori e validazione (tests/ente/moduloCommessaInserimento/form.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 3.1. Struttura del form

**File:** `tests/ente/moduloCommessaInserimento/form.spec.ts`

**Steps:**
  1. Aprire la pagina in modalita' obbligatori
    - expect: Intestazioni 'Territorio nazionale', 'Territorio diverso da nazionale', 'Totale notifiche da processare'
    - expect: Frasi: 'Numero complessivo delle notifiche da processare in via digitale nel mese di', '... in via analogica tramite Raccomandata A/R nel mese di', '... del tipo notifica ex L. 890/1982 nel mese di' seguite da mese/anno in grassetto
    - expect: Riga 890: un solo campo (nessun campo internazionale)
    - expect: Riga TOTALE e 'Totale Notifiche' AR/890 presenti

#### 3.2. Digitazione di valori validi e totali calcolati

**File:** `tests/ente/moduloCommessaInserimento/form.spec.ts`

**Steps:**
  1. Compilare digitale naz 100, int 10, AR naz 20, AR int 2, 890 naz 5
    - expect: Totale riga digitale 110, AR 22, 890 5
    - expect: TOTALE nazionale 125 (digitale naz + AR naz + 890), internazionale 12 (digitale int + AR int), totale notifiche 137
    - expect: 'Totale Notifiche' sotto le regioni: AR 20, 890 5

#### 3.3. Valore 0 ammesso

**File:** `tests/ente/moduloCommessaInserimento/form.spec.ts`

**Steps:**
  1. Digitare 0 in tutti i campi
    - expect: Il campo mostra 0 (non vuoto), totali 0, nessun errore

#### 3.4. Valori negativi rifiutati

**File:** `tests/ente/moduloCommessaInserimento/form.spec.ts`

**Steps:**
  1. Digitare '-5' in un campo con valore 10
    - expect: Il valore resta 10 (onChange ignorato se Number(val)<0)

#### 3.5. Valori non numerici e decimali

**File:** `tests/ente/moduloCommessaInserimento/form.spec.ts`

**Steps:**
  1. Digitare 'abc', '1e2', '1.5', ' ' in un campo
    - expect: 'abc': Number('abc') e' NaN, NaN>=0 e' false: ignorato
    - expect: '1e2': accettato e salvato come 100 (documentare)
    - expect: '1.5': accettato come 1.5 (nessuna restrizione sugli interi, probabile bug)
    - expect: ' ' : Number(' ')=0, accettato come 0

#### 3.6. Svuotare un campo lo riporta a null

**File:** `tests/ente/moduloCommessaInserimento/form.spec.ts`

**Steps:**
  1. Compilare e poi cancellare il campo
    - expect: Il campo e' vuoto e la validazione lo considera non valorizzato (Avanti/Salva mostrano il ModalInfo)

#### 3.7. Zeri iniziali e numeri molto grandi

**File:** `tests/ente/moduloCommessaInserimento/form.spec.ts`

**Steps:**
  1. Digitare '007' e '99999999999999999999'
    - expect: '007' mostrato come 7
    - expect: Il numero grande non crasha e i totali restano coerenti (possibile notazione esponenziale)

#### 3.8. Validazione: Salva con un campo nullo

**File:** `tests/ente/moduloCommessaInserimento/form.spec.ts`

**Steps:**
  1. Modulo singolo con un campo vuoto, cliccare 'Salva'
    - expect: ModalInfo con icona errore, 'Attenzione!' e 'Tutti i campi del modulo commessa vanno valorizzati, 0 è un valore ammesso.'
    - expect: Senza pulsanti 'Annulla'/'Prosegui' (buttonIsVisible false)
    - expect: Campi null in errore (bordo rosso, aria-invalid=true)
    - expect: Nessuna POST
  2. Chiudere con la X del modale
    - expect: Modale chiuso; i campi null restano in errore finche' non si salva/avanza con valori validi

#### 3.9. Validazione considera solo 5 campi

**File:** `tests/ente/moduloCommessaInserimento/form.spec.ts`

**Steps:**
  1. Compilare tutti i 5 campi (digitale naz/int, AR naz/int, 890)
    - expect: isAnyValueOfModuloEqualNull=false: nessun modale di errore (totaleNotificheDigitale/Analogico non sono controllati)

#### 3.10. errorAnyValueIsEqualNull si azzera

**File:** `tests/ente/moduloCommessaInserimento/form.spec.ts`

**Steps:**
  1. Provocare l'errore, compilare i campi mancanti e cliccare 'Salva' (o 'Avanti')
    - expect: Gli errori scompaiono (setErrorAnyValueIsEqualNull(false))

#### 3.11. Campi disabilitati in sola lettura

**File:** `tests/ente/moduloCommessaInserimento/form.spec.ts`

**Steps:**
  1. Aprire un dettaglio con isEditAllow=false
    - expect: Tutti i campi del form, i campi regione, la select e 'Aggiungi regione' sono disabilitati
    - expect: I campi 'Totale Notifiche' e percentuali sono sempre disabilitati

### 4. Regioni (tests/ente/moduloCommessaInserimento/regioni.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 4.1. Aggiungere una regione

**File:** `tests/ente/moduloCommessaInserimento/regioni.spec.ts`

**Steps:**
  1. Con 3 regioni disponibili aprire 'Inserisci regione' e selezionare Piemonte
    - expect: 'Aggiungi regione' abilitato solo con almeno una selezione (disabilitato a select vuota)
    - expect: Chip Piemonte nella select
  2. Cliccare 'Aggiungi regione'
    - expect: Intestazioni 'Regioni', 'AR Nazionali', '890 Nazionali' compaiono
    - expect: Riga Piemonte con campi AR e 890 vuoti e cestino
    - expect: Piemonte non e' piu' tra le opzioni; la selezione e' azzerata

#### 4.2. Aggiungere piu' regioni insieme

**File:** `tests/ente/moduloCommessaInserimento/regioni.spec.ts`

**Steps:**
  1. Selezionare 2 regioni e cliccare 'Aggiungi regione'
    - expect: Due righe aggiunte

#### 4.3. Cancellare una regione

**File:** `tests/ente/moduloCommessaInserimento/regioni.spec.ts`

**Steps:**
  1. Cliccare il cestino di una riga
    - expect: Riga rimossa, regione di nuovo tra le opzioni
    - expect: Percentuali di copertura ricalcolate, errori AR/890 ricalcolati

#### 4.4. Regione di appartenenza (obbligatorio=1)

**File:** `tests/ente/moduloCommessaInserimento/regioni.spec.ts`

**Steps:**
  1. Mockare un modulo con una regione obbligatorio:1 e una obbligatorio:0
    - expect: La regione obbligatoria e' ordinata per prima
    - expect: Tooltip 'Regione di appartenenza' sull'icona info
    - expect: In sola lettura il chip 'Regione di appartenenza' se AR e 890 null

#### 4.5. Etichette chip in sola lettura

**File:** `tests/ente/moduloCommessaInserimento/regioni.spec.ts`

**Steps:**
  1. Dettaglio in lettura con regioni calcolato=1, calcolato=0 e obbligatoria con valori null
    - expect: calcolato truthy: 'Attribuito dal sistema'
    - expect: calcolato 0/assente: 'Inserita manualmente dall’aderente' (apostrofo tipografico)
    - expect: obbligatorio=1 con ar e 890 null: 'Regione di appartenenza'

#### 4.6. Valori AR/890 per regione

**File:** `tests/ente/moduloCommessaInserimento/regioni.spec.ts`

**Steps:**
  1. Inserire AR 10 e 890 3 su una regione, poi 0, poi negativo e testo
    - expect: 10/3 e 0 accettati e mostrati
    - expect: Negativo: value=null (campo vuoto); testo non numerico: Number('abc')>=0 e' false -> null
    - expect: Il valore 0 non viene mostrato come vuoto

#### 4.7. Errore se la somma regioni AR supera il totale AR

**File:** `tests/ente/moduloCommessaInserimento/regioni.spec.ts`

**Steps:**
  1. Totale AR naz = 10, regione A AR=6 e regione B AR=5
    - expect: Campi AR delle regioni in errore (aria-invalid)
    - expect: Percentuale copertura AR > 100 con campo in errore
    - expect: 'Avanti', 'Indiero' e 'Salva' disabilitati
  2. Correggere B a 4
    - expect: Errore rimosso, bottoni riabilitati

#### 4.8. Errore somma 890 superiore al totale 890

**File:** `tests/ente/moduloCommessaInserimento/regioni.spec.ts`

**Steps:**
  1. Totale 890 = 5 e regioni con somma 890 = 6
    - expect: Campi 890 in errore, AR no
    - expect: Avanti/Indiero/Salva disabilitati

#### 4.9. Errore ricalcolato al cambio del totale

**File:** `tests/ente/moduloCommessaInserimento/regioni.spec.ts`

**Steps:**
  1. Con somma regioni AR=8 e totale AR=10 abbassare il totale a 5, poi rialzarlo a 10
    - expect: Errore comparso a 5 e scomparso a 10

#### 4.10. Regola errore per regione obbligatoria con valore null

**File:** `tests/ente/moduloCommessaInserimento/regioni.spec.ts`

**Steps:**
  1. In errore AR con una regione obbligatorio=1 e ar=null
    - expect: Il campo della regione obbligatoria con ar null NON e' in errore; le altre si

#### 4.11. Copertura AR e 890 calcolata

**File:** `tests/ente/moduloCommessaInserimento/regioni.spec.ts`

**Steps:**
  1. Totale AR 20 e regioni AR 5+5
    - expect: 'Percentuale copertura inserita dell’aderente' AR = 50%
  2. Totale AR 0
    - expect: Copertura AR = 100%
  3. Totale AR 3 e regioni AR 1
    - expect: 33% (Math.round)
  4. Totale AR vuoto o null
    - expect: 0% (coperturaAr falsy)

#### 4.12. Copertura archiviato: manuale vs calcolata

**File:** `tests/ente/moduloCommessaInserimento/regioni.spec.ts`

**Steps:**
  1. Dettaglio archiviato con totale AR 100, regioni calcolato=0 AR 30 e calcolato=1 AR 70
    - expect: 'Percentuale copertura inserita dell’aderente' AR = 30%
    - expect: 'Percentuale copertura attribuita dal sistema' AR = 70% (100 - manuale)
    - expect: Idem per 890
    - expect: Con valoriRegione vuoto le righe percentuale non sono mostrate
  2. Regioni calcolato assente (undefined)
    - expect: filter(calcolato===0) non conta le regioni: manuale 0% e sistema 100% (documentare)

#### 4.13. Select regioni: disabilitata in sola lettura e nascosta se archiviato

**File:** `tests/ente/moduloCommessaInserimento/regioni.spec.ts`

**Steps:**
  1. Aprire dettaglio sola lettura e dettaglio archiviato
    - expect: Sola lettura: select e 'Aggiungi regione' disabilitati
    - expect: Archiviato: non presenti

#### 4.14. Lista regioni vuota

**File:** `tests/ente/moduloCommessaInserimento/regioni.spec.ts`

**Steps:**
  1. Mockare /regioni []
    - expect: Select senza opzioni, 'Aggiungi regione' disabilitato

### 5. Stepper obbligatori (tests/ente/moduloCommessaInserimento/stepper.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 5.1. Etichette e disabilitazioni al primo step

**File:** `tests/ente/moduloCommessaInserimento/stepper.spec.ts`

**Steps:**
  1. Mockare 3 moduli obbligatori tutti con stato null
    - expect: Stepper con tre step; 'Indiero' disabilitato e senza tooltip
    - expect: 'Avanti' abilitato, tooltip 'Avanti' all'hover
    - expect: Il label del pulsante a sinistra e' 'Indiero' (refuso)

#### 5.2. Avanti con campi null

**File:** `tests/ente/moduloCommessaInserimento/stepper.spec.ts`

**Steps:**
  1. Cliccare 'Avanti' senza compilare
    - expect: ModalInfo 'Tutti i campi del modulo commessa vanno valorizzati, 0 è un valore ammesso.'
    - expect: Resta sullo step 1, campi null in errore

#### 5.3. Avanti con copertura al 100%

**File:** `tests/ente/moduloCommessaInserimento/stepper.spec.ts`

**Steps:**
  1. Compilare lo step con coperture 100% (totale AR/890 = 0) e cliccare 'Avanti'
    - expect: Si passa allo step 2 senza modale; step 2 evidenziato
    - expect: mainState.statusPageInserimentoCommessa === 'mutable'
    - expect: I dati dello step 1 restano memorizzati tornando indietro

#### 5.4. Avanti con copertura <100 (macrocategoria 3 o 4)

**File:** `tests/ente/moduloCommessaInserimento/stepper.spec.ts`

**Steps:**
  1. macrocategoriaVendita=3, totale AR 10 senza regioni, cliccare 'Avanti'
    - expect: ModalInfo 'La percentale di copertura NON raggiunge il 100%. Tramite dati ISTAT le notifiche restanti saranno integrate sulle regione italiane in base alla percentuale della Popolazione Residente.' con 'Annulla' e 'Prosegui'
  2. Cliccare 'Annulla'
    - expect: Resta sullo step 1
  3. Riaprire e cliccare 'Prosegui'
    - expect: Passaggio allo step 2

#### 5.5. Avanti con copertura <100 (macrocategoria 1 o 2)

**File:** `tests/ente/moduloCommessaInserimento/stepper.spec.ts`

**Steps:**
  1. macrocategoriaVendita=1 (poi 2)
    - expect: Testo 'La percentale di copertura NON raggiunge il 100%. Le notifiche restanti saranno integrate sulla regione di appartenenza.'

#### 5.6. Copertura <100 con macrocategoria diversa da 1-4

**File:** `tests/ente/moduloCommessaInserimento/stepper.spec.ts`

**Steps:**
  1. macrocategoriaVendita='' o 0 con copertura <100, cliccare 'Avanti'
    - expect: Nessun modale: handleNext non viene chiamato (nessuno dei tre rami lo invoca), resta sullo step 1 (probabile bug da confermare)

#### 5.7. Indiero in modalita' obbligatori

**File:** `tests/ente/moduloCommessaInserimento/stepper.spec.ts`

**Steps:**
  1. Allo step 2 cliccare 'Indiero'
    - expect: Nessun modale (isObbligatorioLayout), si torna allo step 1 con i valori digitati
    - expect: errorAnyValueIsEqualNull azzerato

#### 5.8. Ultimo step

**File:** `tests/ente/moduloCommessaInserimento/stepper.spec.ts`

**Steps:**
  1. Raggiungere l'ultimo step
    - expect: 'Avanti' disabilitato e senza tooltip
    - expect: 'Indiero' abilitato con tooltip 'Indietro'
    - expect: Label del pulsante principale = 'Salva' (activeStep+1 non < steps.length)

#### 5.9. Bottoni disabilitati con errori regioni

**File:** `tests/ente/moduloCommessaInserimento/stepper.spec.ts`

**Steps:**
  1. Provocare errorArRegioni (poi error890Regioni)
    - expect: 'Indiero' e 'Avanti' disabilitati anche con step intermedio
  2. Cambiare step con errore nello step precedente
    - expect: Gli stati errorArRegioni/error890Regioni sono globali: non vengono ricalcolati al cambio step (documentare)

#### 5.10. Salva nei step intermedi: label e disabilitazione

**File:** `tests/ente/moduloCommessaInserimento/stepper.spec.ts`

**Steps:**
  1. Allo step 1 di 3
    - expect: Label 'Prosegui per salvare' con variant text
    - expect: Il pulsante e' disabilitato (disabled se isObbligatorioLayout && activeStep+1 < steps.length): un pulsante etichettato 'Prosegui per salvare' non e' cliccabile (probabile incoerenza)

#### 5.11. Step con un solo modulo

**File:** `tests/ente/moduloCommessaInserimento/stepper.spec.ts`

**Steps:**
  1. Un solo modulo
    - expect: Nessun Avanti/Indiero, Salva abilitato

#### 5.12. Tooltip dei bottoni stepper

**File:** `tests/ente/moduloCommessaInserimento/stepper.spec.ts`

**Steps:**
  1. Hover su 'Indiero' e 'Avanti' abilitati
    - expect: Tooltip 'Indietro' e 'Avanti'; sui bottoni disabilitati title=false e nessun tooltip

#### 5.13. Dettaglio: Avanti/Indiero tra moduli con ModalAlert

**File:** `tests/ente/moduloCommessaInserimento/stepper.spec.ts`

**Steps:**
  1. Seed infoTrimestreComSelected con moduli [{id:'3/2026'},{id:'4/2026'}] e moduloSelectedIndex 0; dettaglio mockato con stato null/modifica true (isEditAllow); cliccare 'Avanti'
    - expect: ModalAlert 'Attenzione!' 'Le modifiche andranno perse'
    - expect: Annulla chiude il modale e resta sul modulo
    - expect: Ok: GET dettaglio/2026/4, step 2, statusPageInserimentoCommessa 'immutable'

#### 5.14. Dettaglio in sola lettura: Avanti/Indiero senza modale

**File:** `tests/ente/moduloCommessaInserimento/stepper.spec.ts`

**Steps:**
  1. Dettaglio con isEditAllow=false e 2 moduli, cliccare 'Avanti' e poi 'Indiero'
    - expect: Nessun modale; chiamate al dettaglio del modulo adiacente (/dettaglio/2026/4 poi /dettaglio/2026/3)
    - expect: Il blocco di avantiFunction controlla !openModalAlert: documentare

#### 5.15. Dettaglio: Indiero con ModalAlert

**File:** `tests/ente/moduloCommessaInserimento/stepper.spec.ts`

**Steps:**
  1. Dal secondo modulo in modifica cliccare 'Indiero'
    - expect: ModalAlert; Ok torna al primo modulo con GET dettaglio

#### 5.16. Indiero a step 0 nel dettaglio

**File:** `tests/ente/moduloCommessaInserimento/stepper.spec.ts`

**Steps:**
  1. Al primo modulo
    - expect: 'Indiero' disabilitato

### 6. Salvataggio (tests/ente/moduloCommessaInserimento/salvataggio.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 6.1. Label del pulsante: Modifica / Salva / Prosegui per salvare

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. Verificare la label nei casi: isEditAllow=false e stato non null; isEditAllow=false e stato null; isEditAllow=true singolo; obbligatori con step intermedio
    - expect: 'Modifica' (isEditAllow false, stato non null)
    - expect: 'Salva' (stato null anche con isEditAllow false: la label e' Salva ma il click abilita la modifica)
    - expect: 'Salva' (isEditAllow true)
    - expect: 'Prosegui per salvare' (isEditAllow && obbligatori && non ultimo step), variant text e disabilitato

#### 6.2. Pulsante Salva/Modifica nascosto: archiviato

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. Dettaglio con source archiviato e modifica true
    - expect: Nessun pulsante Salva/Modifica

#### 6.3. Pulsante Salva/Modifica nascosto: modifica false

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. Dettaglio con modifica false (non archiviato)
    - expect: Nessun pulsante Salva/Modifica

#### 6.4. Modifica abilita la modifica

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. Dettaglio stato 'inserito', modifica true, cliccare 'Modifica'
    - expect: Campi abilitati, label 'Salva'
    - expect: statusPageInserimentoCommessa 'mutable'
    - expect: Nessuna chiamata di rete
    - expect: 'Vedi anteprima' sparisce (isEditAllow true)

#### 6.5. Salva modulo singolo (obbligatori): POST e redirect

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. Compilare digitale 100/10, AR 20/2, 890 5 con copertura 100% (totali regione coerenti) e cliccare 'Salva'
    - expect: GET /api/datifatturazione/ente prima della POST
    - expect: POST /api/v2/modulocommessa?nonce=... con body array [{anno:2026, mese:10, moduliCommessa:[{numeroNotificheNazionali:20,numeroNotificheInternazionali:2,idTipoSpedizione:1,totaleNotifiche:<totaleNotificheAnalogico||0>},{numeroNotificheNazionali:5,numeroNotificheInternazionali:0,idTipoSpedizione:2,totaleNotifiche:5},{numeroNotificheNazionali:100,numeroNotificheInternazionali:10,idTipoSpedizione:3,totaleNotifiche:<totaleNotificheDigitale||0>}], valoriRegione:[...]}]
    - expect: 'Loading...' visibile durante la POST e poi chiuso
    - expect: Alert 'Modulo commessa inserito'
    - expect: Redirect a /ente/datidifatturazione
    - expect: statusPageInserimentoCommessa 'immutable'

#### 6.6. Body POST con totaleNotificheAnalogico/Digitale non inviati dal form

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. Mock lista senza totaleNotificheAnalogico e totaleNotificheDigitale, salvare
    - expect: totaleNotifiche per idTipoSpedizione 1 e 3 e' 0 (i totali non sono ricalcolati dal form: probabile bug o calcolo lato server)

#### 6.7. Salva con piu' moduli obbligatori: unica POST

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. Compilare 3 moduli con Avanti, all'ultimo cliccare 'Salva'
    - expect: Una sola POST con 3 elementi (uno per modulo, anno/mese corretti)

#### 6.8. Salva con valoriRegione

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. Aggiungere Piemonte con AR 5, 890 2 e salvare
    - expect: Il body valoriRegione contiene l'oggetto regione con regione, istatRegione, ar:5, 890:2 (chiave 'valoriRegione'; il tipo PostModuloCommessa dichiara 'valoriRegioni': verificare con il backend)

#### 6.9. Salva con copertura <100 (macrocategoria 3/4 e 1/2)

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. Totali valorizzati e regioni insufficienti, cliccare 'Salva'
    - expect: ModalInfo (3/4): 'La percentale di copertura NON raggiunge il 100%. Le notifiche restanti  saranno integrate sulle regioni Italiane in base allla percentuale di residenza fornite tramite dati ISTAT.' (doppio spazio e refuso 'allla')
    - expect: ModalInfo (1/2): 'La percentale di copertura NON raggiunge il 100%. Le notifiche restanti  saranno integrate sulla regione di appartenenza.'
    - expect: Annulla: nessuna POST. Prosegui: parte la POST

#### 6.10. Salva con campo null (modulo singolo)

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. Cliccare 'Salva' con un campo vuoto
    - expect: ModalInfo errore, nessuna chiamata a datifatturazione ne' POST

#### 6.11. Salva in modalita' dettaglio: ricarica dopo il salvataggio

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. Dettaglio stato null modifica true, compilare e 'Salva'; mockare il secondo GET dettaglio con stato 'inserito', totaleNotifiche valorizzato
    - expect: POST con un solo modulo (anno/mese del modulo attivo)
    - expect: Alert 'Modulo commessa inserito'
    - expect: Nuovo GET /dettaglio/<anno>/<mese> (isCallAfterSaveData=true) e nessun redirect a datifatturazione
    - expect: isEditAllow=false: campi disabilitati, label 'Modifica', compare 'Vedi anteprima'

#### 6.12. Modifica di un modulo gia' inserito e salvataggio

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. Dettaglio 'inserito' modifica true: 'Modifica', cambiare un valore, 'Salva'
    - expect: POST con il valore aggiornato
    - expect: Dopo il reload isEditAllow=false

#### 6.13. Errore 500 sulla POST con setErrorAlert

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. POST 500 con body {detail:'Dettaglio errore backend'}
    - expect: 'Loading...' chiuso
    - expect: statusPageInserimentoCommessa 'immutable'
    - expect: Alert d'errore con il messaggio err.response.data.detail (setErrorAlert, testo da confermare dal vivo)
    - expect: Redirect a /ente/modulicommessa

#### 6.14. Errore 500 con detail assente

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. POST 500 con body {}
    - expect: setErrorAlert riceve message undefined; nessun crash; redirect all'elenco

#### 6.15. Altri errori sulla POST (401, 403, 404, 409)

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. POST con ciascuno status
    - expect: manageError gestisce lo status del layout
    - expect: Redirect a /ente/modulicommessa

#### 6.16. GET datifatturazione/ente 404

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. Mockare /api/datifatturazione/ente con 404 e salvare
    - expect: Nessuna POST
    - expect: Modale Loading chiuso, mainState.datiFatturazione=false
    - expect: Redirect a /ente/datidifatturazione

#### 6.17. GET datifatturazione/ente 500

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. Mockare con 500
    - expect: Nessuna POST, errore del layout, redirect a /ente/modulicommessa

#### 6.18. Errore su reload dopo il salvataggio

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. POST ok e secondo GET dettaglio 500
    - expect: manageError e Skeleton rimosso; l'alert 'Modulo commessa inserito' e' comunque stato emesso

#### 6.19. Doppio click su Salva

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. Cliccare due volte rapidamente 'Salva' con POST ritardata
    - expect: Il modale Loading blocca il secondo click (aria-hidden); verificare che la POST sia una sola

#### 6.20. Salva disabilitato con errori regioni

**File:** `tests/ente/moduloCommessaInserimento/salvataggio.spec.ts`

**Steps:**
  1. Provocare errorArRegioni
    - expect: 'Salva' disabilitato, nessuna POST

### 7. Navigazione (tests/ente/moduloCommessaInserimento/navigazione.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 7.1. Indietro header con isEditAllow: ModalAlert e conferma

**File:** `tests/ente/moduloCommessaInserimento/navigazione.spec.ts`

**Steps:**
  1. Obbligatori (isEditAllow=true), cliccare 'Indietro' in alto
    - expect: ModalAlert: heading 'Attenzione!', 'Le modifiche andranno perse', pulsanti 'Annulla' e 'Ok'
    - expect: Resto della pagina aria-hidden
  2. Cliccare 'Ok'
    - expect: URL /ente/modulicommessa

#### 7.2. Indietro header: Annulla resta sulla pagina

**File:** `tests/ente/moduloCommessaInserimento/navigazione.spec.ts`

**Steps:**
  1. Aprire il ModalAlert e cliccare 'Annulla'
    - expect: Modale chiuso, URL invariato, valori digitati conservati

#### 7.3. Indietro header chiude il modale con Escape

**File:** `tests/ente/moduloCommessaInserimento/navigazione.spec.ts`

**Steps:**
  1. Premere Escape sul ModalAlert
    - expect: Modale chiuso, nessuna navigazione

#### 7.4. Indietro header in sola lettura: nessun modale

**File:** `tests/ente/moduloCommessaInserimento/navigazione.spec.ts`

**Steps:**
  1. Dettaglio con modifica false, cliccare 'Indietro'
    - expect: Navigazione diretta a /ente/modulicommessa, nessun modale

#### 7.5. Ritorno all'elenco ricarica l'elenco

**File:** `tests/ente/moduloCommessaInserimento/navigazione.spec.ts`

**Steps:**
  1. Dopo 'Indietro' mockare l'elenco
    - expect: L'elenco chiama lista e azzera infoTrimestreComSelected

#### 7.6. Vedi anteprima: visibilita'

**File:** `tests/ente/moduloCommessaInserimento/navigazione.spec.ts`

**Steps:**
  1. Verificare i casi: totaleNotifiche valorizzato e isEditAllow=false; totaleNotifiche null; isEditAllow=true
    - expect: 'Vedi anteprima' visibile solo con totaleNotifiche !== null && !isEditAllow && !loadingData
    - expect: Assente con totaleNotifiche null (modulo non inserito) e con isEditAllow=true
    - expect: totaleNotifiche undefined (campo mancante) -> undefined !== null e' true: anteprima visibile (documentare)

#### 7.7. Vedi anteprima: navigazione e stato

**File:** `tests/ente/moduloCommessaInserimento/navigazione.spec.ts`

**Steps:**
  1. Cliccare 'Vedi anteprima' sul modulo 3/2026
    - expect: URL /ente/pdfmodulocommessa/2026/3 (PathPf.PDF_COMMESSA_EN, per profilo non PAGOPA)
    - expect: infoTrimestreComSelected: annoCommessaSelectd '2026', meseCommessaSelected '3', moduloSelectedIndex = activeStep, altri campi conservati

#### 7.8. Vedi anteprima su modulo di indice > 0

**File:** `tests/ente/moduloCommessaInserimento/navigazione.spec.ts`

**Steps:**
  1. Andare al secondo modulo e cliccare 'Vedi anteprima'
    - expect: moduloSelectedIndex = 1 e URL del secondo modulo

#### 7.9. Ritorno dal pdf al dettaglio

**File:** `tests/ente/moduloCommessaInserimento/navigazione.spec.ts`

**Steps:**
  1. Dal pdf (mockato) tornare indietro
    - expect: La pagina ricarica il dettaglio del modulo selezionato

#### 7.10. Voce di menu laterale con modifiche in corso

**File:** `tests/ente/moduloCommessaInserimento/navigazione.spec.ts`

**Steps:**
  1. Con statusPageInserimentoCommessa 'mutable' cliccare una voce del menu (es. Notifiche)
    - expect: BasicModal 'Attenzione!' 'Le modifiche andranno perse' (se la sidenav imposta openBasicModal_DatFat_ModCom con visible e clickOn)
    - expect: 'Annulla' lo chiude; 'Ok' esegue handleEsci: navigate(clickOn) e statusPage 'immutable'

#### 7.11. BasicModal: Ok con clickOn INDIETRO_BUTTON

**File:** `tests/ente/moduloCommessaInserimento/navigazione.spec.ts`

**Steps:**
  1. Forzare openBasicModal con clickOn 'INDIETRO_BUTTON' e inserisciModificaCommessa 'MODIFY' / 'INSERT'
    - expect: MODIFY: handleGetDettaglioModuloCommessa ricarica la pagina
    - expect: INSERT: navigazione a /ente/modulicommessa
    - expect: Altri casi (nessun ramo soddisfatto) non fanno nulla e il modale resta aperto (documentare)

#### 7.12. Accesso diretto senza sessione di inserimento

**File:** `tests/ente/moduloCommessaInserimento/navigazione.spec.ts`

**Steps:**
  1. verifica=false, infoTrimestreComSelected={} e goto diretto
    - expect: Vedi caso del ramo dettaglio senza stato (caricamento): redirect all'elenco con alert

#### 7.13. Reload della pagina in dettaglio

**File:** `tests/ente/moduloCommessaInserimento/navigazione.spec.ts`

**Steps:**
  1. Ricaricare la pagina in dettaglio
    - expect: globalStatePF e' persistito: la pagina ricarica il dettaglio dello stesso modulo

#### 7.14. Header e pulsanti durante il caricamento

**File:** `tests/ente/moduloCommessaInserimento/navigazione.spec.ts`

**Steps:**
  1. Ritardare lista/dettaglio
    - expect: Skeleton al posto di header e corpo, nessun Indietro/Avanti/Salva fino al termine
