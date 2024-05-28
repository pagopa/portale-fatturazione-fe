import { MainState } from "./typesGeneral";

export interface BodyFatturazione{
    anno:number,
    mese:number,
    tipologiaFattura:string
}

export interface FatturazioneProps{
    mainState:MainState,
    dispatchMainState:any
}