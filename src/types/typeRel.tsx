import { MainState } from "./typesGeneral";

export interface RelPageProps{
    mainState:MainState,
    setMainState:any,
}

export interface TextRegioneSocialeRelProps{
    values:any,
    setValue: (value:any) => void
}

export interface BodyRel{
    anno:number,
    mese:number,
    tipologiaFatture:number|null,
    ragioneSociale?:string[] | [],
    idContratto: string | null
} 

export interface Rel {
    idTestata: string,
    idEnte: string,
    ragioneSociale: string,
    dataDocumento: string,
    idDocumento: string,
    cup: string,
    idContratto: string,
    tipologiaFattura: string,
    anno: string,
    mese: string,
    totaleAnalogico: number,
    totaleDigitale: string,
    totaleNotificheAnalogiche: number,
    totaleNotificheDigitali: number,
    totale: number
}

