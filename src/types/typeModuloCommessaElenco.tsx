import { Dispatch, SetStateAction } from "react";
import { ActionReducerType } from "../reducer/reducerMainState";
import { MainState } from "./typesGeneral";

export interface ResponseGetAnni {
    response ?: string[]
}

export interface VisualModuliCommessaProps{
    dispatchMainState:Dispatch<ActionReducerType>
    mainState:MainState,
    valueSelect:string,
    setValueSelect:Dispatch<SetStateAction<string>>
}

export interface DataGridCommessa{
    id?:number,
    modifica: boolean,
    annoValidita: number,
    meseValidita: number,
    idEnte: string,
    idTipoContratto: number,
    stato: string,
    prodotto: string,
    totale: string,
    dataModifica: string,
    totaleDigitale: string,
    totaleAnalogico: string,
    moduli?:any[]
    
}

export interface GetAnniResponse{
    data:string[] 
}

export interface ResponseGetListaCommesse{
    data:DataGridCommessa[]
}