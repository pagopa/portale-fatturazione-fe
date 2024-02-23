import { MainState } from "./typesGeneral";

export interface RelPageProps{
    mainState:MainState
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

