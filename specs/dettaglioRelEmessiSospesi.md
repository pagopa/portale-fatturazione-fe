# Piano di test - Ente / Dettaglio Regolare Esecuzione, Documenti Emessi, Documenti Sospesi (/ente/fatturapdf/:pageFrom/:id)

## Application Overview

Piano di test per la pagina di dettaglio di portale-fatturazione-fe (componente src/page/prod_pn/relPdfUtPa.tsx, hook src/hooks/usePageRelDocPdf.ts, route PathRoutePf.PDF_REL + "/:pageFrom/:id" in src/router/route.tsx riga ~177). La stessa pagina e' il dettaglio di tre sezioni ENTE (profilo.auth === "SELFCARE"), scelte dall'URL: Regolare Esecuzione /ente/fatturapdf/rel/:idTestata (back PathPf.LISTA_REL_EN = /ente/listarel, header "Regolare Esecuzione/", la voce di menu e la sezione sono visibili solo per idTipoContratto === 2), Documenti Contabili Emessi /ente/fatturapdf/documentiemessi/:idfattura (back PathPf.DOCUMENTI_EMESSI = /ente/docemessi, header "Documenti Emessi/"), Documenti Contabili Sospesi /ente/fatturapdf/documentisospesi/:idfattura (back PathPf.DOCUMENTI_SOSPESI = /ente/docsospesi, header "Documenti Sospesi/"). Il ramo ADMIN/PAGOPA (/send/fatturapdf/..., idEnte e idTipoContratto in URL, showComponentPdfAdmin, Scarica PDF Firmato lato admin) e' FUORI SCOPE di questo piano: qui si testa solo l'ENTE, quindi i test stanno in tests/condivisi/dettaglioRelEmessiSospesi/ ma verranno eseguiti col solo ruolo ente (la fixture `role` non e' ancora in tests/fixtures.ts: se serve va aggiunta, altrimenti le asserzioni sono solo ente).

NOTA: l'app NON e' stata esplorata dal vivo (richiede sessione Selfcare): il piano e' derivato dal codice (relPdfUtPa.tsx, usePageRelDocPdf.ts, navigatorHeader, textDettaglioPdf, skeletonRelPdf, modalUploadPdf, modalLoading, api/apiSelfcare/relSE/api.tsx, api/apiSelfcare/documentiSospesiSE/api.ts, api/api.tsx manageError / manageErrorDownload, i18n.js). Nomi accessibili, testid e formato esatto delle date vanno confermati con browser_snapshot in fase di implementazione.

STRUTTURA DELLA PAGINA: (1) NavigatorHeader: pulsante 'Indietro' + testo "<Sezione>/" + "Dettaglio" in grassetto; (2) pulsante testuale report (se showButtonDownloadReport): "Scarica report di dettaglio notifiche Reg. Es." | "... Doc. Emessi" | "... Doc. Sospesi"; (3) card 'Dati di Fatturazione' (Soggetto Aderente, Tipologia Fattura, Anno, Mese, Tipo Contratto, ID Documento, Cup); (4) card 'Numero Notifiche' (N. Notifiche Digitali / Analogiche / N. Totale Notifiche), nascosta per ANTICIPO; (5) card 'Posizione Imponibile'; (6) card 'Posizione Ivato' (IVA, Ivato Digitale, Ivato Analogico, Totale Ivato, Ivato da Fatturare); (7) card 'Elenco Fatture Emesse' solo se fattureSospese non vuoto (tabella: Data Fattura, Tipo Documento, Metodo Pagamento, Totale Fattura Imponibile €); (8) azioni in fondo; (9) ModalLoading 'Downloading...' e ModalUploadPdf ('Operazione andata a buon fine' / "L'inserimento del documento è stato completato" / 'Ok'). Le coppie etichetta/valore (TextDettaglioPdf) sono Typography overline + caption senza ruolo semantico: servono data-testid o locator getByText con etichetta esatta + valore adiacente (da concordare con il team; vedi bug 18).

API DA MOCKARE (base `${VITE_APP_URL}/api`, query ?nonce=<nonce>; i mock si registrano con page.route sull'host API, mai backend reale; token e nonce fittizi da tests/utils/ente/sessioneEnte.ts):
- REL: GET /api/rel/ente/{id} (getSingleRel); GET /api/rel/ente/download/{id} (getRelPdf, res.data = stringa HTML); GET /api/rel/ente/righe/{id} (getRelExel, res.data = URL del file); POST /api/rel/firma/log body {anno, mese, tipologiaFattura, idContratto} senza idEnte (getLogRelDocumentoFirmato, risposta [{dataEvento}]), chiamata solo se datiFatturazione === true; GET /api/rel/firma/download/{id} (getRelPdfFirmato, {documento: base64}); POST /api/rel/firma/upload/{idTestata} multipart (uploadPdfRel).
- EMESSI: POST /api/fatture/ente/emesse/dettaglio body {Idfattura} (getDettaglioFatturaEmessa); GET /api/fatture/ente/emesse/dettaglio/download/{id} (getDocumentiEmessiPdf, HTML); report: GET /api/rel/ente/righe/{customId} con customId = `${idEnte}_${idContratto}_${tipologiaFattura con spazi->'-'}_${anno}_${mese}` (getRelExel, riuso dell'endpoint REL).
- SOSPESI: POST /api/fatture/ente/sospese/dettaglio body {Idfattura} (getDettaglioFatturaSospesa); GET /api/fatture/ente/sospese/dettaglio/download/{id} (getDocumentiSospesiPdf, HTML); report: GET /api/rel/ente/sospese/righe/{customId} (getSospesiReportExel).
- Default gia' gestite da tests/fixtures.ts: /api/auth/profilo, /api/apikey, /api/info-banner, contatori notifiche. Le API non mockate rispondono 404 e vengono annotate come unmocked-api.

MOCK ESISTENTI E MANCANTI: esistono `mockDettaglio(page, rel)` in tests/utils/ente/docContabiliMock.ts (docPage(config).mockDettaglio, usa POST *dettaglio con default iva 0, tutti i totali a 0, fattureSospese []), tests/utils/docemessi/docEmessiMock.ts e tests/utils/docsospesi/docSospesiMock.ts (mockDettaglio per la navigazione dalla griglia), tests/utils/dettaglioEmessiMock/dettaglioEmessiMock.ts (mockDettaglioDocEmesso(tipologia) con le label ATTESE per tipologia, ORMAI OBSOLETE: usano 'Iva', 'Totale Imponibile Analogico', 'Acconto Analogico' mentre la UI attuale ha 'IVA', 'Imponibile Analogico', ecc.; vanno riallineate), tests/utils/docEmessiMock/* e tests/utils/docSospesiMock/* (duplicati dei precedenti: consolidare). Convenzione del repo: page.route (non HAR) + seedSession() per modificare globalStatePF (per idTipoContratto 2). DA CREARE: tests/utils/dettaglioRelEmessiSospesi/dettaglioMock.ts con (a) factory `makeRel(override)` con tutti i campi (anche anticipoAnalogico/Digitale, stornoTotale, anticipo_Storno*, acconto_Storno*, fattureSospese) e preset per tipologia PRIMO SALDO, SECONDO SALDO, VAR. SEMESTRALE, SEM. SOSPESI, ACCONTO, ANTICIPO; (b) mock GET /api/rel/ente/{id}; (c) mock log firma; (d) mock download PDF HTML REL/emessi/sospesi (GET .../download/{id}) con ritardo controllato; (e) mock report righe REL/emessi/sospesi (res.data = URL/blob) con 200 e 404/500; (f) mock upload firma POST /api/rel/firma/upload/{id} (200, 4xx/5xx, ritardo) e GET /api/rel/firma/download/{id} con {documento: base64 di un PDF minimo}; (g) helper `openDettaglio(page, section, id)` e locator condivisi (breadcrumb, coppia etichetta/valore, card per heading, downloadReport, scaricaPdf, scaricaPdfFirmato, fileInput); (h) estensione di sessioneEnte con idTipoContratto 2 (REL richiede idTipoContratto 2).

CONVENZIONI: importare test ed expect da tests/fixtures.ts; locator getByRole/getByLabel/getByTestId; nessun waitForTimeout; mai login nei test (auth.setup.ts); formato valuta de-DE EUR (es. '1.234,50 €' con spazio non separabile: usare regex /1\.234,50\s€/); i file PDF generati (generatePDF di react-to-pdf, saveAs di file-saver) si verificano con page.waitForEvent('download') e suggestedFilename.

## Test Scenarios

### 1. 1. Titolo, breadcrumb, navigazione e caricamento (tests/condivisi/dettaglioRelEmessiSospesi/titolo.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 1.1. 1.1. Breadcrumb e pulsante Indietro per ciascuna sezione

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/titolo.spec.ts`

**Steps:**
  1. Parametrizzare su 3 sezioni: REL (/ente/fatturapdf/rel/1, sessione idTipoContratto 2, GET /api/rel/ente/1), EMESSI (/ente/fatturapdf/documentiemessi/1, POST emesse/dettaglio), SOSPESI (/ente/fatturapdf/documentisospesi/1, POST sospese/dettaglio) con tipologia PRIMO SALDO
    - expect: Il NavigatorHeader mostra 'Regolare Esecuzione/' | 'Documenti Emessi/' | 'Documenti Sospesi/' seguito da 'Dettaglio' in grassetto
    - expect: Il pulsante 'Indietro' e' visibile
    - expect: Il heading 'Dati di Fatturazione' e' visibile
  2. Cliccare 'Indietro'
    - expect: URL /ente/listarel (REL), /ente/docemessi (EMESSI), /ente/docsospesi (SOSPESI)
    - expect: La pagina lista della sezione e' visualizzata

#### 1.2. 1.2. Skeleton durante il caricamento

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/titolo.spec.ts`

**Steps:**
  1. Mockare l'API di dettaglio con una promise controllata (risposta ritardata) e aprire il dettaglio (per ogni sezione)
    - expect: Viene mostrato SkeletonRelPdf (nessun heading 'Dati di Fatturazione', nessun breadcrumb, nessun pulsante 'Indietro')
    - expect: Nessun pulsante di download visibile
  2. Rilasciare la risposta
    - expect: Lo skeleton scompare e compaiono breadcrumb e card
    - expect: Una sola chiamata all'API di dettaglio

#### 1.3. 1.3. Dettaglio aperto dalla griglia della lista (EMESSI e SOSPESI)

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/titolo.spec.ts`

**Steps:**
  1. Dalla lista /ente/docemessi (mock lista + dettaglio) cliccare su una riga; ripetere con /ente/docsospesi
    - expect: URL /ente/fatturapdf/documentiemessi/<idfattura> o /ente/fatturapdf/documentisospesi/<idfattura>
    - expect: Body della POST di dettaglio { Idfattura: <idfattura> }
    - expect: Tipologia, anno e mese corrispondono alla riga selezionata
  2. Cliccare 'Indietro' e poi tornare alla pagina dettaglio con il back del browser
    - expect: Si torna alla lista con i filtri persistiti
    - expect: Dopo il back del browser il dettaglio viene ricaricato correttamente

#### 1.4. 1.4. Dettaglio REL aperto dalla lista Regolare Esecuzione (idTipoContratto 2)

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/titolo.spec.ts`

**Steps:**
  1. Con sessione idTipoContratto 2 aprire /ente/listarel (mock lista) e cliccare una riga
    - expect: URL /ente/fatturapdf/rel/<idTestata> (relUtPa naviga con `${PDF_REL_EN}/rel/${idTestata}`)
    - expect: GET /api/rel/ente/<idTestata> chiamata una volta
    - expect: Breadcrumb 'Regolare Esecuzione/ Dettaglio'
    - expect: Voce di menu 'Regolare Esecuzione' evidenziata (currentLocation include 'ente/fatturapdf/rel')

#### 1.5. 1.5. Voci di menu evidenziate nelle tre sezioni

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/titolo.spec.ts`

**Steps:**
  1. Aprire il dettaglio EMESSI e SOSPESI e osservare il menu laterale
    - expect: EMESSI: voce 'Documenti Emessi' selezionata; SOSPESI: voce 'Documenti Sospesi' selezionata (selected se currentLocation include 'ente/fatturapdf/documentiemessi|documentisospesi')

#### 1.6. 1.6. Accesso diretto via URL a REL con idTipoContratto 1

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/titolo.spec.ts`

**Steps:**
  1. Con sessione idTipoContratto 1 (default PROFILO_ENTE) aprire direttamente /ente/fatturapdf/rel/1 con GET /api/rel/ente/1 mockata 200
    - expect: Comportamento atteso: la sezione Regolare Esecuzione non e' accessibile a idTipoContratto 1 (nessun dettaglio, redirect o errore)
    - expect: Comportamento attuale da verificare: la route non ha guardie, il dettaglio viene mostrato (vedi bug 12)

#### 1.7. 1.7. Ricarica pagina (F5) sul dettaglio

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/titolo.spec.ts`

**Steps:**
  1. Sul dettaglio caricato eseguire page.reload()
    - expect: Lo stato (globalStatePF) viene reidratato, la pagina richiama l'API di dettaglio e mostra gli stessi dati
    - expect: Nessun redirect alla lista

#### 1.8. 1.8. ID inesistente o URL non valido

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/titolo.spec.ts`

**Steps:**
  1. Aprire /ente/fatturapdf/documentiemessi/999999 con dettaglio 404
    - expect: Si naviga a /ente/docemessi e compare l'errore 404 del layout (vedi sezione 9)
  2. Aprire /ente/fatturapdf/altro/1 (pageFrom non previsto)
    - expect: Nessuna API di dettaglio chiamata con risposta valida: res undefined -> TypeError su res.data nel try, catch con navigate(profilePath) (profilePath undefined): documentare il comportamento reale (probabile pagina bianca/bug 14)

### 2. 2. Card Dati di Fatturazione e Numero Notifiche (tests/condivisi/dettaglioRelEmessiSospesi/datiFatturazione.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 2.1. 2.1. Dati di Fatturazione valorizzati

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/datiFatturazione.spec.ts`

**Steps:**
  1. Mock con ragioneSociale 'Comune di San Mauro Torinese', tipologiaFattura 'PRIMO SALDO', anno '2024', mese '2', idDocumento 'DOC-1', cup 'CUP123' (per ogni sezione)
    - expect: Soggetto Aderente = 'Comune di San Mauro Torinese'
    - expect: Tipologia Fattura = 'PRIMO SALDO'
    - expect: Anno = '2024'
    - expect: Mese = 'Febbraio' (month[mese-1])
    - expect: ID Documento = 'DOC-1' e Cup = 'CUP123'

#### 2.2. 2.2. ID Documento e Cup assenti mostrano '--'

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/datiFatturazione.spec.ts`

**Steps:**
  1. Mock con idDocumento null/'' e cup null/''
    - expect: ID Documento = '--' e Cup = '--'

#### 2.3. 2.3. Tipo Contratto in base a idTipoContratto del profilo

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/datiFatturazione.spec.ts`

**Steps:**
  1. Sessione idTipoContratto 1 (EMESSI/SOSPESI)
    - expect: Tipo Contratto = 'PAC - PAL senza requisiti'
  2. Sessione idTipoContratto 2 (REL, EMESSI, SOSPESI)
    - expect: Tipo Contratto = 'PAC - PAL con requisiti'
  3. Sessione con idTipoContratto assente/undefined
    - expect: Il testo mostrato e' 'PAC - PAL con requisiti' (Number(undefined) !== 1): documentare (bug 8)

#### 2.4. 2.4. Mese per tutti i 12 valori e valori fuori range

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/datiFatturazione.spec.ts`

**Steps:**
  1. Parametrizzare mese da '1' a '12'
    - expect: Il mese e' mostrato in italiano (Gennaio ... Dicembre)
  2. Mese '0', '13' e null
    - expect: Il valore e' vuoto, nessun crash

#### 2.5. 2.5. Numero Notifiche visibile per tutte le tipologie tranne ANTICIPO

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/datiFatturazione.spec.ts`

**Steps:**
  1. Mock con totaleNotificheDigitali 10 e totaleNotificheAnalogiche 5 per PRIMO SALDO, SECONDO SALDO, VAR. SEMESTRALE, SEM. SOSPESI, ACCONTO
    - expect: Heading 'Numero Notifiche' visibile
    - expect: N. Notifiche Digitali = 10, N. Notifiche Analogiche = 5, N. Totale Notifiche = 15 (somma calcolata dal FE)
  2. Mock tipologia ANTICIPO (EMESSI e SOSPESI)
    - expect: Heading 'Numero Notifiche' ASSENTE
    - expect: Le card 'Dati di Fatturazione', 'Posizione Imponibile', 'Posizione Ivato' restano visibili

#### 2.6. 2.6. Notifiche a zero o stringhe numeriche

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/datiFatturazione.spec.ts`

**Steps:**
  1. Mock con totaleNotificheDigitali '3' (stringa) e totaleNotificheAnalogiche null
    - expect: N. Totale Notifiche = 3 (Number(null) = 0), nessun NaN

#### 2.7. 2.7. Elenco Fatture Emesse visibile solo con fattureSospese non vuoto

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/datiFatturazione.spec.ts`

**Steps:**
  1. Mock con fattureSospese: []
    - expect: Heading 'Elenco Fatture Emesse' assente
  2. Mock con 2 fatture { idFattura, dataFattura '2024-03-15T00:00:00', tipoDocumento 'TD01', metodoPagamento 'MP05', totaleFatturaImponibile 1234.5 } e { dataFattura null, tipoDocumento null, metodoPagamento null, totaleFatturaImponibile null }
    - expect: Heading 'Elenco Fatture Emesse' visibile con due tabelle (una per fattura) con intestazioni 'Data Fattura', 'Tipo Documento', 'Metodo Pagamento', 'Totale Fattura Imponibile €'
    - expect: Fattura 1: data '2024-03-15' (formato en-CA), 'TD01', 'MP05', importo '1.234,50 €'
    - expect: Fattura 2: tutte le celle '--'
    - expect: Una fattura con totaleFatturaImponibile 0 mostra '0,00 €' (non '--')

#### 2.8. 2.8. Elenco Fatture Emesse e data a cavallo del fuso orario

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/datiFatturazione.spec.ts`

**Steps:**
  1. Mock con dataFattura '2024-03-15T23:30:00Z' e contesto browser con timezone Europe/Rome e poi America/Los_Angeles
    - expect: Verificare che il giorno mostrato sia coerente col dato (new Date(...).toLocaleDateString('en-CA') dipende dal fuso: possibile slittamento, vedi bug 13)

### 3. 3. Visibilita' campi per tipologia fattura e tipo contratto (tests/condivisi/dettaglioRelEmessiSospesi/campiPerTipologia.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 3.1. 3.1. PRIMO SALDO / SECONDO SALDO / VAR. SEMESTRALE / SEM. SOSPESI in EMESSI e SOSPESI (idTipoContratto 1)

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/campiPerTipologia.spec.ts`

**Steps:**
  1. Parametrizzare le 4 tipologie, sezioni EMESSI e SOSPESI, idTipoContratto 1
    - expect: Posizione Imponibile mostra: Storno Digitale, Storno Analogico, Totale Storno, Imponibile Digitale, Imponibile Analogico, Totale Imponibile, Imponibile da Fatturare
    - expect: NON compaiono: Anticipo/Acconto Digitale/Analogico, righe 'Storno Anticipo ...' e 'Storno Acconto ...'
    - expect: Posizione Ivato mostra: IVA, Ivato Digitale, Ivato Analogico, Totale Ivato, Ivato da Fatturare

#### 3.2. 3.2. ACCONTO con idTipoContratto 1

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/campiPerTipologia.spec.ts`

**Steps:**
  1. Mock ACCONTO con accontoAnalogico 200 e accontoDigitale 100, sezione EMESSI/SOSPESI, idTipoContratto 1
    - expect: Le righe 'Acconto Digitale' e 'Acconto Analogico' sono ASSENTI (richiedono idTipoContratto 2)
    - expect: Righe Storno e Imponibile Digitale/Analogico assenti
    - expect: Totale Imponibile = somma acconti (300,00 €) e Imponibile da Fatturare presente
    - expect: Posizione Ivato completa con Ivato da Fatturare

#### 3.3. 3.3. ACCONTO con idTipoContratto 2

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/campiPerTipologia.spec.ts`

**Steps:**
  1. Stesso mock con sessione idTipoContratto 2 (EMESSI)
    - expect: Compaiono 'Acconto Digitale' = 100,00 € e 'Acconto Analogico' = 200,00 €
    - expect: Totale Imponibile = 300,00 €

#### 3.4. 3.4. ANTICIPO (EMESSI e SOSPESI)

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/campiPerTipologia.spec.ts`

**Steps:**
  1. Mock ANTICIPO con anticipoAnalogico 100, anticipoDigitale 50, iva 22
    - expect: 'Numero Notifiche' assente
    - expect: Righe 'Anticipo Digitale' = 50,00 € e 'Anticipo Analogico' = 100,00 €
    - expect: Totale Imponibile = 150,00 €; 'Imponibile da Fatturare' ASSENTE
    - expect: Posizione Ivato: Ivato Digitale = 61,00 €, Ivato Analogico = 122,00 €, Totale Ivato = 183,00 €; 'Ivato da Fatturare' ASSENTE
    - expect: Nessuna riga Storno / Imponibile Digitale / Imponibile Analogico

#### 3.5. 3.5. Regolare Esecuzione (idTipoContratto 2): righe storno anticipo/acconto

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/campiPerTipologia.spec.ts`

**Steps:**
  1. Mock REL PRIMO SALDO con anticipo_StornoDigitale -10, anticipo_StornoAnalogico -20, anticipo_StornoTotale -30, acconto_StornoDigitale -1, acconto_StornoAnalogico -2, acconto_StornoTotale -3, stornoTotale -33
    - expect: Compaiono 'Storno Anticipo Digitale/Analogico', 'Totale Storno Anticipo', 'Storno Acconto Digitale/Analogico', 'Totale Storno Acconto' con i valori in formato EUR
    - expect: NON compaiono 'Storno Digitale', 'Storno Analogico', 'Totale Storno' (solo non-REL)
    - expect: Imponibile Digitale/Analogico e Totale Imponibile visibili
    - expect: Campi mancanti nel mock -> '0,00 €'

#### 3.6. 3.6. REL: ANTICIPO e ACCONTO

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/campiPerTipologia.spec.ts`

**Steps:**
  1. Mock REL con tipologia ACCONTO (idTipoContratto 2) e ANTICIPO
    - expect: ACCONTO: righe 'Acconto Digitale/Analogico' visibili, nessuna riga Imponibile Digitale/Analogico
    - expect: ANTICIPO: righe 'Anticipo Digitale/Analogico' NON visibili in REL (anticipo_..._IsVisible richiede !isRel), 'Numero Notifiche' assente, 'Imponibile da Fatturare' assente
    - expect: Documentare cosa mostra il pulsante report in ANTICIPO REL (vedi bug 1)

#### 3.7. 3.7. Imponibile da Fatturare e Ivato da Fatturare per idTipoContratto 2

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/campiPerTipologia.spec.ts`

**Steps:**
  1. Mock PRIMO SALDO con sessione idTipoContratto 2 nelle tre sezioni
    - expect: EMESSI: 'Ivato da Fatturare' visibile
    - expect: SOSPESI: 'Ivato da Fatturare' ASSENTE (profilePath diverso da DOCUMENTI_EMESSI/FATTURAZIONE)
    - expect: REL: 'Ivato da Fatturare' ASSENTE
    - expect: 'Imponibile da Fatturare' sempre visibile (tranne ANTICIPO)
    - expect: Verificare con il team se la regola e' voluta (vedi bug 3)
  2. Stesso mock con idTipoContratto 1
    - expect: 'Ivato da Fatturare' visibile in tutte le sezioni

#### 3.8. 3.8. Tipologia fattura sconosciuta o assente

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/campiPerTipologia.spec.ts`

**Steps:**
  1. Mock con tipologiaFattura 'ALTRO'
    - expect: Nessun crash; Tipologia Fattura = 'ALTRO'; Posizione Imponibile mostra solo Totale Imponibile e Imponibile da Fatturare; Totale Ivato = totaleIva del backend
  2. Mock con tipologiaFattura null / campo mancante (come tests/utils/dettaglioEmessiMock se null)
    - expect: Comportamento atteso: pagina renderizzata senza crash
    - expect: Comportamento attuale da verificare: TypeError su rel.tipologiaFattura.toUpperCase() nel render (bug 2)

### 4. 4. Totali calcolati dal FE e formattazione EUR (tests/condivisi/dettaglioRelEmessiSospesi/importi.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 4.1. 4.1. Totali PRIMO SALDO con storni (EMESSI)

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/importi.spec.ts`

**Steps:**
  1. Mock PRIMO SALDO: totaleAnalogico 100, totaleDigitale 50, stornoAnalogico -10, stornoDigitale -5, iva 22, totaleAnalogicoIva 122, totaleDigitaleIva 61, totaleIva 999 (volutamente diverso)
    - expect: Imponibile Digitale 50,00 €, Imponibile Analogico 100,00 €, Totale Imponibile 150,00 €
    - expect: Storno Digitale -5,00 €, Storno Analogico -10,00 €, Totale Storno -15,00 €
    - expect: Imponibile da Fatturare 135,00 € (storno + imponibile)
    - expect: IVA '22 %', Ivato Digitale 61,00 €, Ivato Analogico 122,00 €
    - expect: Totale Ivato 183,00 € (= analogico + digitale, NON totaleIva del BE)
    - expect: Ivato da Fatturare 164,70 € (135 * 1,22)

#### 4.2. 4.2. Totale Ivato per SEM. SOSPESI e VAR. SEMESTRALE

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/importi.spec.ts`

**Steps:**
  1. Mock VAR. SEMESTRALE e SEM. SOSPESI con totaleAnalogicoIva 10, totaleDigitaleIva 5, totaleIva 99
    - expect: Totale Ivato 15,00 € (somma calcolata) per entrambe

#### 4.3. 4.3. Totale Ivato per tipologia non gestita usa totaleIva del backend

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/importi.spec.ts`

**Steps:**
  1. Mock tipologia 'ALTRO' con totaleIva 99,5 e totaleAnalogicoIva/DigitaleIva 10 e 5
    - expect: Totale Ivato 99,50 €, Ivato Analogico 10,00 €, Ivato Digitale 5,00 €

#### 4.4. 4.4. ACCONTO: totali calcolati dagli acconti

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/importi.spec.ts`

**Steps:**
  1. Mock ACCONTO con accontoAnalogico 200, accontoDigitale 100, iva 22, storni 0
    - expect: Totale Imponibile 300,00 €; Imponibile da Fatturare 300,00 €
    - expect: Ivato Analogico 244,00 €, Ivato Digitale 122,00 €, Totale Ivato 366,00 €, Ivato da Fatturare 366,00 €

#### 4.5. 4.5. ANTICIPO: totali calcolati dagli anticipi

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/importi.spec.ts`

**Steps:**
  1. Mock ANTICIPO con anticipoAnalogico 100, anticipoDigitale 50, iva 22
    - expect: Totale Imponibile 150,00 €; Ivato Analogico 122,00 €, Ivato Digitale 61,00 €, Totale Ivato 183,00 €

#### 4.6. 4.6. IVA di default 22 quando iva e' 0 o null

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/importi.spec.ts`

**Steps:**
  1. Mock ACCONTO con iva 0 (poi null) e accontoAnalogico 100
    - expect: I calcoli usano 22 (Ivato Analogico 122,00 €)
    - expect: La riga 'IVA' mostra '0 %' (o 'null %'): incoerenza tra valore mostrato e valore usato (bug 6)
  2. Mock con iva 10 e PRIMO SALDO
    - expect: IVA '10 %', Ivato da Fatturare = Imponibile da Fatturare * 1,10

#### 4.7. 4.7. REL: Imponibile da Fatturare usa stornoTotale

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/importi.spec.ts`

**Steps:**
  1. Mock REL PRIMO SALDO (idTipoContratto 2) con totaleAnalogico 100, totaleDigitale 50, stornoTotale -30, stornoAnalogico -999, stornoDigitale -999
    - expect: Imponibile da Fatturare 120,00 € (stornoDigitale/Analogico ignorati in REL)
    - expect: Totale Imponibile 150,00 €

#### 4.8. 4.8. Formato valuta de-DE

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/importi.spec.ts`

**Steps:**
  1. Mock con totaleAnalogico 1234567.891, valori negativi e 0
    - expect: '1.234.567,89 €' (separatore migliaia '.', decimali ',', simbolo dopo, spazio non separabile)
    - expect: Negativi '-15,00 €'
    - expect: Zero '0,00 €'

#### 4.9. 4.9. Valori non numerici o stringhe

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/importi.spec.ts`

**Steps:**
  1. Mock con totaleAnalogico '10.5' (stringa), totaleDigitale null, storni undefined
    - expect: Nessun 'NaN' in pagina: Totale Imponibile 10,50 €
  2. Mock con totaleAnalogicoIva null e tipologia PRIMO SALDO
    - expect: Ivato Analogico: verificare che non vada in crash (null.toLocaleString su digitaleIvatoCalcolatoByFront se campo null con tipologia non gestita, vedi bug 7)

#### 4.10. 4.10. Arrotondamenti

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/importi.spec.ts`

**Steps:**
  1. Mock ACCONTO con accontoAnalogico 0.01 e iva 22
    - expect: Ivato Analogico 0,01 € (0,0122 arrotondato a 2 decimali): verificare coerenza tra somma delle parti mostrate e Totale Ivato

### 5. 5. Report di dettaglio notifiche (tests/condivisi/dettaglioRelEmessiSospesi/reportDettaglio.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 5.1. 5.1. Etichetta del pulsante report per sezione

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/reportDettaglio.spec.ts`

**Steps:**
  1. Aprire il dettaglio PRIMO SALDO nelle tre sezioni
    - expect: REL: pulsante 'Scarica report di dettaglio notifiche Reg. Es.'
    - expect: EMESSI: 'Scarica report di dettaglio notifiche Doc. Emessi'
    - expect: SOSPESI: 'Scarica report di dettaglio notifiche Doc. Sospesi'
    - expect: Il pulsante e' allineato a destra sopra le card ed e' abilitato

#### 5.2. 5.2. Visibilita' per tipologia (showButtonDownloadReport)

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/reportDettaglio.spec.ts`

**Steps:**
  1. EMESSI e SOSPESI con PRIMO SALDO, SECONDO SALDO, VAR. SEMESTRALE, SEM. SOSPESI
    - expect: Pulsante report visibile
  2. EMESSI e SOSPESI con ACCONTO e ANTICIPO
    - expect: Pulsante report ASSENTE
  3. REL con ACCONTO (idTipoContratto 2)
    - expect: Pulsante report visibile (la condizione 'doc page && ACCONTO' non si applica a REL)
  4. REL con ANTICIPO
    - expect: Comportamento atteso (intento del codice): visibile in REL; comportamento attuale per precedenza operatori `a && b || c`: assente. Test marcato test.fail() finche' non corretto (bug 1)

#### 5.3. 5.3. Download report REL (200)

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/reportDettaglio.spec.ts`

**Steps:**
  1. Mock GET /api/rel/ente/righe/<id> con ritardo e risposta; cliccare il pulsante e attendere l'evento download
    - expect: Compare ModalLoading con 'Downloading...' durante la chiamata
    - expect: Una GET /api/rel/ente/righe/<idTestata>?nonce=...
    - expect: Download con nome '<ragioneSociale>_<mese>_<anno>.csv' (mese numerico, es. 'Comune di San Mauro Torinese_2_2024.csv'; vedi bug 10)
    - expect: Il modale si chiude e il pulsante resta abilitato

#### 5.4. 5.4. Download report EMESSI usa customId e endpoint REL

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/reportDettaglio.spec.ts`

**Steps:**
  1. Mock tipologia 'PRIMO SALDO', idEnte 'ENTE1', idContratto 'CTR1', anno '2024', mese '2'; cliccare il report
    - expect: GET /api/rel/ente/righe/ENTE1_CTR1_PRIMO-SALDO_2024_2 (spazi sostituiti da '-')
    - expect: Download CSV avviato

#### 5.5. 5.5. Download report SOSPESI usa endpoint sospese

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/reportDettaglio.spec.ts`

**Steps:**
  1. Cliccare il report nel dettaglio SOSPESI con tipologia 'SECONDO SALDO'
    - expect: GET /api/rel/ente/sospese/righe/<idEnte>_<idContratto>_SECONDO-SALDO_<anno>_<mese>

#### 5.6. 5.6. Report non disponibile (404) per ciascuna sezione

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/reportDettaglio.spec.ts`

**Steps:**
  1. Mockare il report con 404 e cliccare
    - expect: REL: errore 'Il report di dettaglio notifiche Regolare Esecuzione non è disponibile. Contattare l'assistenza'
    - expect: EMESSI: '... Documenti Emessi non è disponibile. Contattare l'assistenza'
    - expect: SOSPESI: '... Documenti Sospesi non è disponibile. Contattare l'assistenza'
    - expect: ModalLoading chiuso
    - expect: Pulsante report DISABILITATO (disableButtonDettaglioNot)

#### 5.7. 5.7. Errore 500/401/rete sul report

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/reportDettaglio.spec.ts`

**Steps:**
  1. Mockare il report con 500, poi 401 e poi route.abort
    - expect: Qualsiasi errore mostra lo stesso messaggio 'report non disponibile' e disabilita definitivamente il pulsante (nessuna distinzione per status, nessun retry, vedi bug 9)

#### 5.8. 5.8. Doppio click sul report

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/reportDettaglio.spec.ts`

**Steps:**
  1. Mock con ritardo e dblclick sul pulsante
    - expect: Una sola GET (il ModalLoading blocca il secondo click)

#### 5.9. 5.9. Report con tipologiaFattura null

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/reportDettaglio.spec.ts`

**Steps:**
  1. EMESSI con tipologiaFattura null (se la pagina non va in crash prima)
    - expect: rel.tipologiaFattura.replace lancia TypeError dentro il try -> viene mostrato 'report non disponibile' pur senza aver chiamato il BE (bug 2)

### 6. 6. Scarica PDF (REL, Doc. Emessi, Doc. Sospesi) (tests/condivisi/dettaglioRelEmessiSospesi/scaricaPdf.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 6.1. 6.1. Doc. Emessi/Sospesi: pulsante PDF solo per PRIMO e SECONDO SALDO

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/scaricaPdf.spec.ts`

**Steps:**
  1. EMESSI e SOSPESI con PRIMO SALDO e SECONDO SALDO
    - expect: EMESSI: pulsante 'Scarica PDF Doc. Emessi' visibile; SOSPESI: 'Scarica PDF Doc. Sospesi' visibile, larghezza 274px, in fondo alla pagina
  2. EMESSI e SOSPESI con VAR. SEMESTRALE, SEM. SOSPESI, ACCONTO, ANTICIPO
    - expect: Nessun pulsante 'Scarica PDF ...'
    - expect: Nessun input di upload e nessun 'Scarica PDF Firmato'

#### 6.2. 6.2. Download PDF Doc. Emessi

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/scaricaPdf.spec.ts`

**Steps:**
  1. Mock GET /api/fatture/ente/emesse/dettaglio/download/<id> con HTML '<h1>Fattura</h1>' e ritardo; cliccare 'Scarica PDF Doc. Emessi'
    - expect: Compare 'Downloading...'
    - expect: GET con id = idfattura dell'URL
    - expect: Evento download con filename 'Documenti Emessi/<ragioneSociale>/<Mese 2 cifre>/<anno>.pdf' (verificare il nome reale: contiene '/' che i browser sostituiscono)
    - expect: ModalLoading chiuso a fine generazione

#### 6.3. 6.3. Download PDF Doc. Sospesi

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/scaricaPdf.spec.ts`

**Steps:**
  1. Mock GET /api/fatture/ente/sospese/dettaglio/download/<id>; cliccare 'Scarica PDF Doc. Sospesi'
    - expect: Stesso comportamento di 6.2 con prefisso 'Documenti Sospesi'

#### 6.4. 6.4. Errore sul download PDF (404, 500, 401, rete)

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/scaricaPdf.spec.ts`

**Steps:**
  1. Mockare il download con 404, 500, 401 (per ultimo) e abort
    - expect: ModalLoading chiuso
    - expect: Errore del layout coerente con lo status (manageError); rete: nessun apiError, nessun crash
    - expect: Nessun download avviato
    - expect: Il pulsante resta riutilizzabile

#### 6.5. 6.5. Download PDF con risposta vuota

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/scaricaPdf.spec.ts`

**Steps:**
  1. Mock con body vuoto (200)
    - expect: Comportamento da documentare: res.data vuoto -> PDF vuoto/errore generatePDF; verificare che il ModalLoading 'Downloading...' non resti bloccato (bug 11)

#### 6.6. 6.6. Nome file con mese fuori range

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/scaricaPdf.spec.ts`

**Steps:**
  1. Mock mese '13' o null e scarica PDF
    - expect: Nome file con 'undefined' al posto del mese (mesiWithZero[mese-1]) - documentare

### 7. 7. Regolare Esecuzione: azioni in fondo alla pagina (tests/condivisi/dettaglioRelEmessiSospesi/relAzioni.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 7.1. 7.1. Azioni visibili solo se totale imponibile > 0 e tipologia non semestrale

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/relAzioni.spec.ts`

**Steps:**
  1. REL (idTipoContratto 2) PRIMO SALDO con totaleAnalogico 100 e totaleDigitale 0
    - expect: Visibili: pulsante 'Scarica PDF Reg. Es.' e SingleFileInput con label 'Inserisci PDF Reg. Es. firmato'
  2. REL con totaleAnalogico 0 e totaleDigitale 0
    - expect: Nessuna azione in fondo (nessun Scarica PDF, nessun upload)
  3. REL con totaleAnalogico 100 e tipologia 'VAR. SEMESTRALE' (e 'SEM. SOSPESI' se contiene SEMESTRALE: verificare, vedi bug 5)
    - expect: Nessuna azione in fondo (tipologia contiene 'SEMESTRALE')
  4. REL con tipologia 'SEM. SOSPESI'
    - expect: Documentare: il nome non contiene 'SEMESTRALE', quindi le azioni compaiono (da confermare con il team se voluto)
  5. REL con ACCONTO/ANTICIPO e totale > 0
    - expect: Azioni visibili (il vincolo e' solo su totale e SEMESTRALE); si osserva che totaleAnalogico+totaleDigitale non include acconto/anticipo (bug 15)

#### 7.2. 7.2. Download PDF Regolare Esecuzione

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/relAzioni.spec.ts`

**Steps:**
  1. Mock GET /api/rel/ente/download/<id> con HTML e ritardo; cliccare 'Scarica PDF Reg. Es.'
    - expect: 'Downloading...' visibile
    - expect: Download filename 'Regolare Esecuzione/<ragioneSociale>/<mese>/<anno>.pdf'
    - expect: Modale chiuso a fine operazione
  2. Ripetere con 500 e 404
    - expect: Errore layout coerente e modale chiuso

#### 7.3. 7.3. SingleFileInput: etichetta in base a rel.caricata

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/relAzioni.spec.ts`

**Steps:**
  1. Mock REL con caricata 0
    - expect: Label dropzone 'Inserisci PDF Reg. Es. firmato'
    - expect: 'Scarica PDF Firmato' assente
  2. Mock REL con caricata 1
    - expect: Label 'Reinserisci nuovo PDF Reg. Es. firmato'
    - expect: 'Scarica PDF Firmato' visibile
  3. Mock REL con caricata 2
    - expect: Label 'Reinserisci nuovo PDF Reg. Es. firmato'
    - expect: 'Scarica PDF Firmato' ASSENTE (visibile solo con caricata === 1): verificare se voluto (bug 16)

#### 7.4. 7.4. Upload PDF valido

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/relAzioni.spec.ts`

**Steps:**
  1. Mock POST /api/rel/firma/upload/<idTestata> 200 con ritardo, GET dettaglio successivo con caricata 1; caricare un file 'firmato.pdf' (setInputFiles sull'input file)
    - expect: Durante l'upload il SingleFileInput e' in loading
    - expect: Una POST multipart con campo 'file' = firmato.pdf e Content-type multipart/form-data
    - expect: Compare ModalUploadPdf con 'Operazione andata a buon fine' e "L'inserimento del documento è stato completato"
    - expect: Il dettaglio viene ricaricato (GET /api/rel/ente/<id> chiamata di nuovo) e la label diventa 'Reinserisci nuovo PDF Reg. Es. firmato'
    - expect: Compare 'Scarica PDF Firmato'
    - expect: Il file selezionato viene azzerato (setFile(null))
  2. Cliccare 'Ok' nel modale
    - expect: Il modale si chiude

#### 7.5. 7.5. Upload di un file non PDF

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/relAzioni.spec.ts`

**Steps:**
  1. Caricare 'immagine.png' o 'documento.docx' (drop o setInputFiles)
    - expect: Compare la rejectedLabel 'Tipo file non supportato'
    - expect: Nessuna POST di upload
    - expect: Nessun ModalUploadPdf
  2. Caricare poi un PDF valido
    - expect: L'upload parte regolarmente

#### 7.6. 7.6. Errore di upload (400, 413, 500, 401, rete)

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/relAzioni.spec.ts`

**Steps:**
  1. Mockare l'upload con 500 e caricare un PDF
    - expect: Il SingleFileInput passa in stato di errore (errorUpload)
    - expect: Errore layout 500 coerente
    - expect: Nessun ModalUploadPdf
    - expect: File azzerato; si puo' ritentare e al secondo tentativo errorUpload viene azzerato (setErrorUpload(false))
  2. Ripetere con 400, 413, 401 (ultimo) e route.abort
    - expect: Nessun crash; gestione per status (manageError); rete: nessun apiError

#### 7.7. 7.7. Rimozione del file selezionato

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/relAzioni.spec.ts`

**Steps:**
  1. Se il componente mantiene il file (value=file) premere l'azione di rimozione
    - expect: onFileRemoved -> file null, nessuna chiamata di rete

#### 7.8. 7.8. Upload che rimpiazza un file gia' caricato

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/relAzioni.spec.ts`

**Steps:**
  1. Mock caricata 1 con log firma e caricare un nuovo PDF
    - expect: La POST parte, il dettaglio e il log firma vengono richiamati e la data in 'Scarica PDF Firmato' viene aggiornata (verificare la race con la GET di dettaglio, bug 17)

#### 7.9. 7.9. Scarica PDF Firmato con data ultimo aggiornamento

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/relAzioni.spec.ts`

**Steps:**
  1. Mock REL caricata 1, datiFatturazione true, anno '2024', mese '2', POST /api/rel/firma/log -> [{dataEvento:'2024-03-20T10:30:00'}]
    - expect: Body log { anno: 2024, mese: 2, tipologiaFattura, idContratto } SENZA idEnte
    - expect: Sotto 'Scarica PDF Firmato' compare la data formattata da createDateFromString (formato da confermare dal vivo)
  2. Cliccare 'Scarica PDF Firmato' con GET /api/rel/firma/download/<id> -> { documento: <base64 PDF> }
    - expect: 'Downloading...' visibile e poi chiuso
    - expect: Download con nome 'REL firmata/<ragioneSociale>/<mese 2 cifre>/<anno>.pdf'

#### 7.10. 7.10. Data firmato assente o log non disponibile

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/relAzioni.spec.ts`

**Steps:**
  1. Log firma con 404, [] e 500; poi dettaglio con datiFatturazione false
    - expect: Nessuna data mostrata, nessun errore visibile (catch silenzioso), 'Scarica PDF Firmato' resta visibile se caricata === 1
    - expect: Con datiFatturazione false/null la POST di log non parte (bug 19)

#### 7.11. 7.11. Errore su Scarica PDF Firmato

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/relAzioni.spec.ts`

**Steps:**
  1. Mockare la GET firma/download con 404, 500 e 401
    - expect: Modale 'Downloading...' chiuso, errore layout coerente, nessun download

#### 7.12. 7.12. Layout delle azioni in fondo

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/relAzioni.spec.ts`

**Steps:**
  1. REL caricata 1 con totale > 0
    - expect: Ordine da sinistra a destra: 'Scarica PDF Reg. Es.', input upload, 'Scarica PDF Firmato' (+ data)
    - expect: Con caricata 0 non c'e' il terzo blocco

### 8. 8. Modale Downloading (tests/condivisi/dettaglioRelEmessiSospesi/modalLoading.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 8.1. 8.1. Modale Downloading... durante i download

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/modalLoading.spec.ts`

**Steps:**
  1. Per ciascuna azione (report, PDF, PDF firmato) ritardare la risposta
    - expect: Dialog con testo 'Downloading...' visibile e la pagina sottostante non cliccabile
    - expect: A completamento il modale scompare

#### 8.2. 8.2. Chiusura del modale con Escape durante il download

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/modalLoading.spec.ts`

**Steps:**
  1. Premere Escape mentre il modale e' aperto
    - expect: Documentare il comportamento di ModalLoading (setOpen disponibile): se si chiude, il download prosegue comunque

#### 8.3. 8.3. Modale non visibile al primo render

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/modalLoading.spec.ts`

**Steps:**
  1. Aprire il dettaglio
    - expect: 'Downloading...' non presente nel DOM

### 9. 9. Errori di caricamento del dettaglio (tests/condivisi/dettaglioRelEmessiSospesi/errori-caricamento.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 9.1. 9.1. 404 sul dettaglio

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/errori-caricamento.spec.ts`

**Steps:**
  1. Per ciascuna sezione mockare l'API di dettaglio con 404
    - expect: Redirect a /ente/listarel | /ente/docemessi | /ente/docsospesi (navigate(profilePath))
    - expect: Errore del layout per 404 (manageError, apiError 404)
    - expect: Nessuna card del dettaglio mostrata
    - expect: Lo skeleton non resta visibile nella lista

#### 9.2. 9.2. 500 sul dettaglio

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/errori-caricamento.spec.ts`

**Steps:**
  1. Mockare il dettaglio con 500
    - expect: Redirect alla lista + errore 'L'operazione non è andata a buon fine. Si prega di riprovare'

#### 9.3. 9.3. 409, 419, 400, 410, 403

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/errori-caricamento.spec.ts`

**Steps:**
  1. Parametrizzare gli status (403 per ultimo)
    - expect: Redirect alla lista e messaggio coerente con lo status (manageError); testi 419/400/410 da confermare dal vivo

#### 9.4. 9.4. 401 / 403 non autenticato

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/errori-caricamento.spec.ts`

**Steps:**
  1. Mockare il dettaglio con 401 (eseguire per ultimo)
    - expect: Messaggio 'Utente non autenticato. Effettuare nuovamente l'accesso' e successivo redirect a Selfcare gestito dal layout

#### 9.5. 9.5. Errore di rete

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/errori-caricamento.spec.ts`

**Steps:**
  1. route.abort() sull'API di dettaglio
    - expect: Redirect alla lista; err.response undefined -> nessun apiError impostato (nessun messaggio visibile), nessun crash, skeleton rimosso

#### 9.6. 9.6. Risposta 200 con body vuoto o malformato

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/errori-caricamento.spec.ts`

**Steps:**
  1. Mockare il dettaglio con 200 e body {} oppure null
    - expect: Con {} la pagina deve renderizzare con valori di default senza crash (tipologiaFattura undefined -> bug 2)
    - expect: Con null: setRel(null) -> TypeError nel render; documentare

#### 9.7. 9.7. Dettaglio REL: log firma fallito non blocca la pagina

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/errori-caricamento.spec.ts`

**Steps:**
  1. GET dettaglio REL 200 con datiFatturazione true e POST log firma 500
    - expect: Il dettaglio e' mostrato, nessun redirect, nessun messaggio d'errore, nessuna data

#### 9.8. 9.8. Mancanza della sessione (profilo non Selfcare/jwt assente)

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/errori-caricamento.spec.ts`

**Steps:**
  1. Svuotare il localStorage (globalStatePF) e aprire il dettaglio
    - expect: Il layout reindirizza all'accesso/non autenticato e non vengono fatte chiamate di dettaglio con token vuoto

### 10. 10. Sessione e rotte miste (tests/condivisi/dettaglioRelEmessiSospesi/accesso.spec.ts)

**Seed:** `tests/auth.setup.ts`

#### 10.1. 10.1. Rilevamento sezione dall'URL

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/accesso.spec.ts`

**Steps:**
  1. Aprire /ente/fatturapdf/rel/1, /ente/fatturapdf/documentiemessi/1 e /ente/fatturapdf/documentisospesi/1
    - expect: Ogni URL chiama solo l'API della propria sezione (nessuna chiamata alle altre due) e usa label e back path corretti

#### 10.2. 10.2. Un ente con idTipoContratto 1 non deve accedere alla REL dal menu

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/accesso.spec.ts`

**Steps:**
  1. Sessione idTipoContratto 1: aprire /ente/docemessi
    - expect: La voce 'Regolare Esecuzione' non e' nel menu laterale
  2. Sessione idTipoContratto 2
    - expect: La voce 'Regolare Esecuzione' e' presente

#### 10.3. 10.3. Navigazione dal menu dal dettaglio

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/accesso.spec.ts`

**Steps:**
  1. Dal dettaglio cliccare una voce di menu diversa (es. 'Modulo commessa')
    - expect: Si naviga senza modali; lo stato di download/upload non persiste tornando indietro

#### 10.4. 10.4. Cambio sezione senza ricaricare

**File:** `tests/condivisi/dettaglioRelEmessiSospesi/accesso.spec.ts`

**Steps:**
  1. Dal dettaglio EMESSI navigare (page.goto client-side) a un altro id
    - expect: Il nuovo id viene caricato; se i dati restano quelli vecchi la useEffect([]) non reagisce al cambio di parametro (bug 20)

## Possibili bug individuati (da verificare dal vivo)

Rilevati dalla lettura del codice, non ancora confermati nell'app. Per ognuno, il test va scritto sul comportamento corretto atteso e marcato `test.fail()` finché il bug non è risolto.

| # | Bug | Dove | Comportamento atteso | Scenario |
|---|-----|------|----------------------|----------|
| 1 | Precedenza operatori in showButtonDownloadReport: `(isDoc && ACCONTO) || ANTICIPO` invece di `isDoc && (ACCONTO || ANTICIPO)`. In REL con tipologia ANTICIPO il pulsante report viene nascosto; il ramo PAGOPA/SELFCARE e' duplicato | `src/page/prod_pn/relPdfUtPa.tsx` righe ~110-126 | Nascondere il report solo nelle pagine Documenti Emessi/Sospesi per ACCONTO e ANTICIPO; in REL resta visibile | 5.2 |
| 2 | `rel.tipologiaFattura.toUpperCase()` (righe ~103, 130, 137, 182) e `.replace()` in `downloadReportDettaglio` lanciano TypeError se il BE restituisce `tipologiaFattura` null/undefined (es. mock dettaglioEmessiMock con campi null): pagina bianca. In `downloadReportDettaglio` l'errore cade nel catch e mostra "report non disponibile" senza chiamata | `relPdfUtPa.tsx` ~130/137; `usePageRelDocPdf.ts` ~126 | Uso di `rel.tipologiaFattura?.toUpperCase()` / default stringa vuota, nessun crash | 3.8, 5.9, 9.6 |
| 3 | `ivato_da_fatturare_IsVisible` per idTipoContratto 2: nascosto in tutte le pagine tranne DOCUMENTI_EMESSI e FATTURAZIONE, quindi anche in REL e DOCUMENTI_SOSPESI. Regola non documentata e con confronto su `profilePath` | `relPdfUtPa.tsx` righe ~260-263 | Regola esplicita e confermata dal prodotto (probabilmente nascondere solo in REL) | 3.7 |
| 4 | Report Doc. Emessi: usa `getRelExel` (endpoint REL `/api/rel/ente/righe/{customId}`), commento "PROBBILMENTE DA SOSTITUIRE". Inoltre `window.URL.revokeObjectURL(response.data)` su una stringa non-blob | `usePageRelDocPdf.ts` righe ~130-132, 156 | Endpoint dedicato ai documenti emessi, revoke solo per blob URL | 5.4 |
| 5 | Il controllo "semestrale" usa `includes("SEMESTRALE")`: "VAR. SEMESTRALE" e' escluso, ma "SEM. SOSPESI" no, quindi in REL compaiono Scarica PDF/upload per SEM. SOSPESI | `relPdfUtPa.tsx` righe ~130, 137 | Escludere in modo esplicito tutte le tipologie semestrali (anche SEM. SOSPESI) se previsto | 7.1 |
| 6 | IVA: la riga mostra `mainObj.iva + " %"` (0 %, null %, undefined %) ma i calcoli usano `iva||22`: valore mostrato incoerente con quello usato | `relPdfUtPa.tsx` righe ~280-295, 362 | Mostrare 22 % quando si usa il default, oppure calcolare con 0 | 4.6 |
| 7 | Possibile crash/NaN: per tipologie non gestite `analogicoIvatoCalcolatoByFront`/`digitaleIvatoCalcolatoByFront` sono `totaleAnalogicoIva`/`totaleDigitaleIva` non convertiti con Number (null -> `null.toLocaleString` TypeError) | `relPdfUtPa.tsx` righe ~272-275, 363-365 | Conversione con Number(x||0) come per gli altri campi | 4.9 |
| 8 | Tipo Contratto: `idTipoContrattoBasedOnProfile === 1 ? "senza requisiti" : "con requisiti"`: con idTipoContratto assente/NaN mostra "con requisiti". Il campo `tipologiaContratto` ("PAL") del BE viene ignorato | `relPdfUtPa.tsx` righe ~155, 309 | Gestire il valore mancante e/o usare il dato del BE | 2.3 |
| 9 | Qualsiasi errore sul report (500, 401, rete) mostra "report non disponibile" e disabilita per sempre il pulsante (`setDisableButtonDettaglioNot(true)`), senza usare `manageError` | `usePageRelDocPdf.ts` righe ~158-167 | Distinguere 404 da altri errori e permettere il retry | 5.6, 5.7 |
| 10 | Nome del CSV `${ragioneSociale}_${mese}_${anno}.csv` con mese numerico non zero-padded, a differenza dei PDF; la ragione sociale puo' contenere caratteri non validi | `usePageRelDocPdf.ts` riga ~150 | Nome coerente con i PDF | 5.3 |
| 11 | `toDoOnDownloadPdf` imposta `setShowDownloading(false)` solo se esiste il wrapper `file_download_rel`; se `generatePDF` fallisce o il wrapper manca il modale "Downloading..." resta aperto (nessun finally). Il nome file contiene "/" e `mesiWithZero[mese-1]` puo' essere undefined | `usePageRelDocPdf.ts` righe ~172-261 | try/finally che chiude sempre il modale, nome file valido | 6.5, 6.6 |
| 12 | La route `/ente/fatturapdf/rel/:id` non e' protetta: un ente con idTipoContratto 1 (sezione REL non visibile) puo' aprire il dettaglio REL via URL diretto | `src/router/route.tsx` riga ~177 | Redirect/403 per enti con idTipoContratto !== 2 | 1.6 |
| 13 | Elenco Fatture Emesse: `new Date(dataFattura).toLocaleDateString("en-CA")` dipende dal fuso orario (possibile slittamento di un giorno) e usa il formato yyyy-mm-dd, diverso dal resto dell'app (dd/MM/yyyy). Intestazione "Totale Fattura Imponibile €" con valore gia' formattato in € | `relPdfUtPa.tsx` righe ~388, 393-398 | Formato data coerente e senza dipendenza dal fuso | 2.7, 2.8 |
| 14 | `pageFrom` non previsto o incoerente con l'URL: `res` undefined -> TypeError su `res.data`, catch con `navigate(undefined)`; `whoInvoke` e profilePath dedotti con `pathname.includes("rel")/("ente")/("send")` (fragili) | `usePageRelDocPdf.ts` righe ~77-117; `relPdfUtPa.tsx` righe ~35-63 | Validazione di pageFrom e redirect alla lista | 1.8 |
| 15 | Le azioni REL (PDF, upload, firmato) dipendono da `totaleAnalogico + totaleDigitale > 0`, che non include acconto/anticipo ne' gli storni; una REL con soli importi di acconto non mostra le azioni | `relPdfUtPa.tsx` righe ~99, 137 | Condizione basata sull'importo realmente dovuto | 7.1 |
| 16 | `dropzoneLabel` considera `caricata` 1 o 2, ma "Scarica PDF Firmato" appare solo con `caricata === 1`: con caricata 2 si invita a "reinserire" un file non scaricabile | `relPdfUtPa.tsx` righe ~130, 202 | Coerenza tra le due condizioni | 7.3 |
| 17 | `uploadPdf`: `getRel(rel.idTestata)` e' chiamato senza await e imposta `loadingDettaglio` true (skeleton a schermo intero) anche se lo status non e' 200; `getDateLastDownloadPdfFirmato` parte in parallelo con valori vecchi (race); se il reload fallisce `getRel` fa navigate(profilePath) via dalla pagina | `usePageRelDocPdf.ts` righe ~263-289 | Reload solo dopo successo, senza skeleton a schermo intero, data firmato aggiornata dopo il reload | 7.4, 7.8 |
| 18 | I valori di TextDettaglioPdf sono Typography overline/caption senza relazione semantica etichetta-valore e senza data-testid: i test devono usare testo adiacente | `src/components/commessaPdf/textDettaglioPdf.tsx` | data-testid o struttura dl/dt/dd | Tutti |
| 19 | Il log della data del firmato viene richiesto solo se `datiFatturazione === true` e `pageFrom === "rel"`; un REL con caricata 1 e datiFatturazione false non mostra mai la data. `res.data[0].dataEvento` con array vuoto lancia un errore ingoiato dal catch | `usePageRelDocPdf.ts` righe ~97, 239-243 | Data mostrata in base a `caricata`, gestione array vuoto | 7.9, 7.10 |
| 20 | `useEffect(..., [])` carica il dettaglio solo al mount: cambiando `:id`/`:pageFrom` sulla stessa istanza i dati restano quelli vecchi (mancano le dipendenze) | `usePageRelDocPdf.ts` righe ~73-75 | Dipendenza da rowId/pageFrom | 10.4 |
| 21 | Mock esistenti: `tests/utils/dettaglioEmessiMock` contiene label obsolete (Iva, Totale Imponibile Analogico, Acconto Analogico) non piu' presenti nella UI; il mock `mockDettaglio` di docContabiliMock ha iva 0 e totali 0; cartelle duplicate (docEmessiMock/docemessi, docSospesiMock/docsospesi) | `tests/utils/*` | Un solo set di mock aggiornato | Mock |
| 22 | L'array `month` ha 13 elementi (l'ultimo e' "Gennaio"): con `mese: 13` la card mostra "Gennaio" invece di un valore vuoto | `src/reusableFunction/reusableArrayObj.tsx` + `relPdfUtPa.tsx` riga 308 | Mese fuori range mostra valore vuoto | 2.4 (test.fail in datiFatturazione.spec.ts) |
