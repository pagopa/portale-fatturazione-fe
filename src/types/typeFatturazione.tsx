
import { Dispatch, SetStateAction } from "react";
import { MainState } from "./typesGeneral";
import { ActionReducerType } from "../reducer/reducerMainState";
export interface BodyFatturazione{
    anno:number,
    mese:number,
    tipologiaFattura:string[],
    idEnti:string[],
    cancellata:boolean
}

export interface FatturazioneProps{
    mainState:MainState,
    dispatchMainState:Dispatch<ActionReducerType>
}

export interface MultiSelectFatturazioneProps{
    setBody:Dispatch<SetStateAction<BodyFatturazione>>,
    list:string[],
    value:string[],
    setValue:Dispatch<SetStateAction<string[]>>,
    clearOnChangeFilter:any
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
    idfattura:number,
    elaborazione:number
}

export interface GridCollapsible{
    data:FattureObj[],
    headerNames:HeaderCollapsible[],
    stato:boolean,
    setOpenConfermaModal:any,
    setOpenResetFilterModal:any,
    monthFilterIsEqualMonthDownload:boolean,
    selected:number[]
    setSelected:any
    updateFilters:any,
    pathPage:string,
    body:any,
    firstRender:boolean,
    infoPageLocalStorage:any,
    upadateOnSelctedChange:any
    //showedData:FattureObj[],
    //setShowedData: Dispatch<SetStateAction<FattureObj[]>>,
}


export type HeaderCollapsible = {
    name:string,
    align:"center" | "inherit" | "left" | "right" | "justify" | undefined,
    id:number
}

export interface ModalSapProps {
    open:{show:boolean,who:number},
    setOpen:any,
    responseTipologiaSap:TipologiaSap[],
    mese:number,
    anno:number,
    dispatchMainState:any,
    getListaFatture:any,
    bodyFatturazioneDownload:BodyFatturazione,
}

export type TipologiaSap = {
    tipologiaFattura: string,
    numeroFatture: number,
    annoRiferimento:number,
    meseRiferimento:number,
    azione:number
}

export interface ModalConfermaRipristinaProps{
    setOpen:any,
    open:boolean,
    onButtonComferma:any,
    filterInfo:BodyFatturazione,
    fattureSelectedArr:any
}

export interface ModalResetFilterProps {
    setOpen:any,
    open:boolean,
    filterInfo:BodyFatturazione,
    getListaFatture:any,
    filterNotExecuted:BodyFatturazione
}
