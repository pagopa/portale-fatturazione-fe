import { MainState } from "./typesGeneral";

export interface BodyFatturazione{
    anno:number,
    mese:number,
    tipologiaFattura:string[],
    idEnti:string[]
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
