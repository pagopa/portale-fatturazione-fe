import { Dispatch, SetStateAction } from "react";
import { MainState } from "./typesGeneral";
import { ActionReducerType } from "../reducer/reducerMainState";

export interface Asseverazione {
    idEnte: string|null,
    ragioneSociale: string,
    prodotto: string|null,
    idTipoContratto: number,
    tipoContratto: string|null,
    asseverazione: boolean|null,
    calcoloAsseverazione: boolean|null,
    dataAsseverazione: string|null,
    dataAnagrafica: string|null,
    tipoAsseverazione: string|null,
    tipoCalcoloAsseverazione: string|null,
    timestamp: string|null,
    idUtente: string|null,
    descrizione:string|null
}
export interface AdesioneBandoProps{
    mainState:MainState,
    dispatchMainState:Dispatch<ActionReducerType>
}