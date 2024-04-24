import { DataPdf } from "./typeModuloCommessaInserimento"

export interface ListaModuliCommessaProps{
    mainState:any,
    dispatchMainState:any
}


export interface BodyDownloadModuliCommessa{
    idEnti:string[],
    prodotto:string,
    anno:number|string,
    mese:number
}

export interface GridElementListaCommesse {
    key: string,
    idEnte: string,
    ragioneSociale: string,
    codiceFiscale: string,
    prodotto: string,
    tipoSpedizioneDigitale: string,
    numeroNotificheNazionaliDigitale:number,
    numeroNotificheInternazionaliDigitale: number,
    tipoSpedizioneAnalogicoAR: string,
    numeroNotificheNazionaliAnalogicoAR: number,
    numeroNotificheInternazionaliAnalogicoAR: number,
    tipoSpedizioneAnalogico890: string,
    numeroNotificheNazionaliAnalogico890:number,
    numeroNotificheInternazionaliAnalogico890:number,
    totaleCategoriaAnalogico: number,
    totaleCategoriaDigitale: number,
    anno: number,
    mese:number,
    totaleAnalogicoLordo: number,
    totaleDigitaleLordo: number,
    totaleLordo: number,
    idTipoContratto:number,
    stato: string
}

export interface DatiCommessaPdf {
    totaleNotifiche?: number,
    numeroNotificheNazionali?: number,
    numeroNotificheInternazionali?: number,
    tipo?: string,
    idTipoSpedizione?: number
}

export interface ResponseGetPdfPagoPa {
    data:DataPdf
}