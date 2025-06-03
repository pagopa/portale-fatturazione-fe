export enum Profilo {
    AZURE = 'PAGOPA',
    SELFCARE = 'PA',
    RECAPITISTA = 'REC',
    CONSOLIDATORE = 'CON'
}

export enum PathPf {
    DATI_FATTURAZIONE = "/datidifatturazione", 
    LISTA_DATI_FATTURAZIONE = "/listadatifatturazione",
    MODULOCOMMESSA = "/modulocommessa", 
    LISTA_MODULICOMMESSA = "/listamodulicommessa",
    LISTA_COMMESSE = "/modulicommessa", 
    PDF_COMMESSA = "/pdfmodulocommessa",
    LISTA_NOTIFICHE = "/listanotifiche",
    LISTA_REL = "/listarel",
    PDF_REL = "/relpdf",
    ADESIONE_BANDO = "/adesionealbando",
    FATTURAZIONE = "/fatturazione",
    MESSAGGI = "/messaggi",
    ANAGRAFICAPSP = "/anagraficapsp",
    DOCUMENTICONTABILI = "/documenticontabilipagopa",
    DETTAGLIO_DOC_CONTABILE = "/dettagliodoccontabile",
    INSERIMENTO_CONTESTAZIONI = "/contestazioni",
    STORICO_CONTEST = "/storico",
    KPI = '/kpipagamenti',
    TIPOLOGIA_CONTRATTO = "/tipologiacontratto",
    LISTA_DOC_EMESSI = "/listadocemessi",
    JSON_TO_SAP = "/inviofatture",
    JSON_TO_SAP_DETAILS = "/inviofatturedettaglio/:id",
    STORICO_DETTAGLIO_CONTEST = "/dettagliocontestazione",
    ORCHESTRATORE = "/orchestratore",
    API_KEY_ENTE = "/apikeys"
}