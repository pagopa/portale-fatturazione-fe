
import { MainState } from "./typesGeneral";

export interface BodyFatturazione{
    anno:number,
    mese:number,
    tipologiaFattura:string[],
    idEnti:string[],
    cancellata:boolean
}

export interface FatturazioneProps{
    mainState:MainState,
    dispatchMainState:any
}

export interface MultiSelectFatturazioneProps{
    setBody:any,
    list:any,
    value:string[],
    setValue:any
}

type Posizioni = {
    numerolinea: number,
    testo: string,
    codiceMateriale: string,
    quantita: number,
    prezzoUnitario: number,
    imponibile: number
}

export interface FattureObj {
    id: number,
    totale: number,
    numero: number,
    dataFattura: string,
    prodotto: string,
    identificativo: string,
    tipologiaFattura: string,
    istitutioID: string,
    onboardingTokenID: string,
    ragionesociale: string,
    tipocontratto: string,
    idcontratto: string,
    tipoDocumento: string,
    divisa: string,
    metodoPagamento: string,
    causale: string,
    split: boolean,
    sollecito: string,
    posizioni:Posizioni[],
    inviata:number,
    idfattura:number
}

export interface GridCollapsible{
    data:FattureObj[],
    headerNames:HeaderCollapsible[],
    stato:boolean,
    sendCancellazzioneRispristinoFatture:any
}

export type HeaderCollapsible = {
    name:string,
    align:"center" | "inherit" | "left" | "right" | "justify" | undefined,
    id:number
}

export interface ModalSapProps {
    open:boolean,
    setOpen:any,
    responseTipologiaSap:TipologiaSap[],
    mese:number,
    anno:number,
    dispatchMainState:any
}

export type TipologiaSap = {
    tipologiaFattura: string,
    numeroFatture: number
}
