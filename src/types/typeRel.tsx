import { Dispatch, SetStateAction } from "react";
import { MainState } from "./typesGeneral";
import { ActionReducerType } from "../reducer/reducerMainState";

export interface RelPageProps{
    mainState:MainState,
    dispatchMainState:Dispatch<ActionReducerType>
}
export interface RelPagePdfProps{
    mainState:MainState,
    dispatchMainState:Dispatch<ActionReducerType>
}
export interface TextRegioneSocialeRelProps{
    values:BodyRel,
    setValue: Dispatch<SetStateAction<BodyRel>>
}

export interface BodyRel{
    anno:number,
    mese:number,
    tipologiaFattura:string|null,
    idEnti:string[] | [],
    idContratto: string | null,
    caricata: number|null,
    idTipoContratto:number|null
} 

export interface BodyRelSelfcare{
    anno:number,
    mese:number,
    tipologiaFattura:string|null,
    idContratto: string | null,
    caricata: number|null
}
export interface Rel {
    idTestata: string,
    idEnte: string,
    caricata:number,
    ragioneSociale: string,
    dataDocumento: string |null,
    idDocumento: string,
    cup: string,
    datiFatturazione:boolean
    idContratto: string,
    tipologiaFattura: string,
    anno: string,
    mese: string,
    totaleAnalogico: number,
    totaleDigitale: number,
    totaleNotificheAnalogiche: number,
    totaleNotificheDigitali: number,
    totale: number,
    iva:number,
    totaleAnalogicoIva:number,
    totaleDigitaleIva:number,
    totaleIva:number,
    firmata:string|null,
    tipologiaContratto:string|null
}

export interface BodyRelLog {
    anno: number,
    mese: number,
    tipologiaFattura: string,
    idContratto: string,
    idEnte?:string
}


