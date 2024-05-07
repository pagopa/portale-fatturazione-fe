export enum Profilo {
    AZURE = 'PAGOPA',
    SELFCARE = 'PA',
    RECAPITISTA = 'REC',
    CONSOLIDATORE = 'CON'
}

export enum PathPf {
    DATI_FATTURAZIONE = '/datidifatturazione', //
    LISTA_DATI_FATTURAZIONE = '/listadatifatturazione',//listadatidifatturazione
    MODULOCOMMESSA = '/modulocommessa', //8
    LISTA_MODULICOMMESSA = '/listamodulicommessa',
    LISTA_COMMESSE = '/modulicommessa',  //4
    PDF_COMMESSA = '/pdfmodulocommessa',//pdf
    LISTA_NOTIFICHE = '/listanotifiche',
    LISTA_REL = '/listarel',
    PDF_REL = '/relpdf',
    ADESIONE_BANDO = '/adesionealbando'
}