export enum Profilo {
    AZURE = 'PAGOPA',
    SELFCARE = 'PA',
    RECAPITISTA = 'REC',
    CONSOLIDATORE = 'CON'
}

export enum PathPf {

   

    //NEW logic
    DATI_FATTURAZIONE = "/send/datidifatturazione", 
    LISTA_DATI_FATTURAZIONE = "/send/listadatifatturazione",
    LISTA_MODULICOMMESSA = "/send/listamodulicommessa",
    TIPOLOGIA_CONTRATTO = "/send/tipologiacontratto",
    LISTA_MODULICOMMESSA_PREVISONALE="/send/listacommessaprevisionale",
    LISTA_NOTIFICHE = "/send/listanotifiche",
    INSERIMENTO_CONTESTAZIONI = "/send/contestazioni",
    STORICO_CONTEST = "/send/storico",
    STORICO_DETTAGLIO_CONTEST = "/send/dettagliocontestazione",
    MODULOCOMMESSA = "/send/modulocommessa", 
    PDF_COMMESSA = "/send/pdfmodulocommessa",
    LISTA_REL = "/send/listarel",
    PDF_REL = "/send/relpdf",
    ADESIONE_BANDO = "/send/adesionealbando",
    FATTURAZIONE = "/send/fatturazione",
    LISTA_DOC_EMESSI = "/send/listadocemessi",
    JSON_TO_SAP = "/send/inviofatture",
    JSON_TO_SAP_DETAILS = "/send/inviofatturedettaglio/:id",
    ORCHESTRATORE = "/send/orchestratore",
    MESSAGGI = "/send/messaggi",
    ACCERTAMENTI = "/send/accertamenti",

    //psp
    ANAGRAFICAPSP = "/pn/anagraficapsp",
    DOCUMENTICONTABILI = "/pn/documenticontabilipagopa",
    DETTAGLIO_DOC_CONTABILE = "/pn/dettagliodoccontabile",
    KPI = '/pn/kpipagamenti',
    EMAIL_PSP = "/pn/emailpsp",
    MESSAGGIPN = "/pn/messaggi",

    //ENTE
    ASYNC_DOCUMENTI_ENTE = "/ente/downloaddocumenti",
    LISTA_COMMESSE = "/ente/modulicommessa", 
    API_KEY_ENTE = "/ente/apikeys",
    STORICO_CONTEST_ENTE = "/ente/storicoente",
    INSERIMENTO_CONTESTAZIONI_ENTE = "/ente/contestazioniente",
    FATTURAZIONE_EN = "/ente/fatturazione",
    DATI_FATTURAZIONE_EN = "/ente/datidifatturazione", 
    LISTA_REL_EN = "/ente/listarel",
    PDF_REL_EN = "/ente/relpdf",
    LISTA_NOTIFICHE_EN = "/ente/listanotifiche",
    MODULOCOMMESSA_EN = "/ente/modulocommessa", 
    PDF_COMMESSA_EN = "/ente/pdfmodulocommessa",
    LISTA_STORICO_DOCUMENTI = "/ente/storicodoc",
    DOCUMENTI_EMESSI = "/ente/docemessi",
    DOCUMENTI_SOSPESI = "/ente/docsospesi",

    //REC CON
    LISTA_NOTIFICHE_REC_CON = "/reccon/listanotifiche"
}

export enum PathRoutePf {
    

    
    //NEW logic
    DATI_FATTURAZIONE = "datidifatturazione", 
    LISTA_DATI_FATTURAZIONE = "listadatifatturazione",
    LISTA_MODULICOMMESSA = "listamodulicommessa",
    TIPOLOGIA_CONTRATTO = "tipologiacontratto",
    LISTA_MODULICOMMESSA_PREVISONALE="listacommessaprevisionale",
    LISTA_NOTIFICHE = "listanotifiche",
    INSERIMENTO_CONTESTAZIONI = "contestazioni",
    STORICO_CONTEST = "storico",
    STORICO_DETTAGLIO_CONTEST = "dettagliocontestazione",
    MODULOCOMMESSA = "modulocommessa", 
    PDF_COMMESSA = "pdfmodulocommessa",
    LISTA_REL = "listarel",
    PDF_REL = "relpdf",
    ADESIONE_BANDO = "adesionealbando",
    FATTURAZIONE = "fatturazione",
    LISTA_DOC_EMESSI = "listadocemessi",
    JSON_TO_SAP = "inviofatture",
    JSON_TO_SAP_DETAILS = "inviofatturedettaglio/:id",
    ORCHESTRATORE = "orchestratore",
    MESSAGGI = "messaggi",
    ACCERTAMENTI = "accertamenti",

    ANAGRAFICAPSP = "anagraficapsp",
    DOCUMENTICONTABILI = "documenticontabilipagopa",
    DETTAGLIO_DOC_CONTABILE = "dettagliodoccontabile",
    KPI = 'kpipagamenti',
    MESSAGGIPN = "messaggi",
    EMAIL_PSP = "emailpsp",

    LISTA_COMMESSE = "modulicommessa",
    ASYNC_DOCUMENTI_ENTE = "downloaddocumenti",
    API_KEY_ENTE = "apikeys",
    STORICO_CONTEST_ENTE = "storicoente",
    INSERIMENTO_CONTESTAZIONI_ENTE = "contestazioniente",
  
    LISTA_STORICO_DOCUMENTI = "storicodoc",
    DOCUMENTI_EMESSI = "docemessi",
    DOCUMENTI_SOSPESI = "docsospesi",

    
}