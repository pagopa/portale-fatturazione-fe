import { Dispatch } from "react";
import { DataPdf } from "./typeModuloCommessaInserimento";
import { MainState } from "./typesGeneral";
import { ActionReducerType } from "../reducer/reducerMainState";

export interface ListaModuliCommessaProps{
    mainState:MainState,
    dispatchMainState:Dispatch<ActionReducerType>
}


export interface BodyDownloadModuliCommessa{
    idEnti:string[],
    idTipoContratto:number|null,
    anno:number|string,
    mese:number|string
}

export interface GridElementListaCommesse {
    modifica: boolean
    annoValidita: number
    meseValidita: number
    idEnte: string
    idTipoContratto: number,
    ragioneSociale:string,
    stato: string
    prodotto: string
    totale: number
    dataInserimento: string
    dataChiusura: string
    dataChiusuraLegale: string
    totaleDigitaleNaz: number
    totaleDigitaleInternaz: number
    totaleAnalogicoARNaz: number
    totaleAnalogicoARInternaz: number
    totaleAnalogico890Naz: number
    totaleNotificheDigitaleNaz: number
    totaleNotificheDigitaleInternaz: number
    totaleNotificheAnalogicoARNaz: number
    totaleNotificheAnalogicoARInternaz: number
    totaleNotificheAnalogico890Naz: number
    totaleNotificheDigitale: number
    totaleNotificheAnalogico: number
    totaleNotifiche: number
    source: string
    quarter: string
    valoriRegione: ValoriRegione[]
}

export interface ValoriRegione {
    "890": number
    provincia: any
    regione: string
    istatProvincia: any
    istatRegione: string
    ar: number
    isRegione: number
    calcolato: number
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