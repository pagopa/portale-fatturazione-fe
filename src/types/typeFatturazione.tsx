
import { Dispatch, SetStateAction } from "react";
import { MainState } from "./typesGeneral";
import { ActionReducerType } from "../reducer/reducerMainState";

export interface BodyFatturazione{
    anno:number,
    mese:number,
    tipologiaFattura:string[],
    idEnti:string[]
}

export interface FatturazioneProps{
    mainState:MainState,
    dispatchMainState:Dispatch<ActionReducerType>
}

export interface MultiSelectFatturazioneProps{
    setBody:Dispatch<SetStateAction<BodyFatturazione>>,
    list:string[],
    value:string[],
    setValue:Dispatch<SetStateAction<string[]>>
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
    posizioni:Posizioni[]
}

export interface GridCollapsible{
    data:FattureObj[],
    showedData:FattureObj[],
    setShowedData: Dispatch<SetStateAction<FattureObj[]>>,
    headerNames:HeaderCollapsible[]
}

export type HeaderCollapsible = {
    name:string,
    align:"center" | "inherit" | "left" | "right" | "justify" | undefined,
    id:number
}
