import { Dispatch, SetStateAction } from "react";
import { InfoOpen, MainState } from "./typesGeneral";

export interface SuccesResponseGetDatiFatturazione {
    data:DatiFatturazione
}

export type Contatti = {
    email: string,
    tipo: number
}

export interface AreaPersonaleProps{ 
    mainState:MainState,
    dispatchMainState:any,
    open:InfoOpen,
    setOpen:any
}

export interface DatiFatturazione{
    id:number,
    map:null|string,
    idEnte:string,
    tipoCommessa:string,
    splitPayment:boolean,
    cup:string,
    idDocumento:string,
    codCommessa:string,
    contatti: Contatti[]|[],
    dataCreazione:string,
    dataModifica:string,
    dataDocumento: null | string,
    pec:string,
    notaLegale:boolean,
    prodotto:string,
    codiceSDI:string|null,
    contractCodiceSDI:string|null
}

export interface DatiFatturazionePost{
    tipoCommessa:string,
    splitPayment:boolean,
    cup: string,
    idDocumento:string,
    codCommessa:string,
    contatti: Contatti[],
    dataDocumento:string|null,
    pec:string,
    notaLegale:boolean,
    codiceSDI:string|null
}

export interface DatiFatturazionePostPagopa {
    tipoCommessa:string,
    splitPayment:boolean,
    cup: string,
    idDocumento:string,
    codCommessa:string,
    contatti: Contatti[],
    dataDocumento:string|null,
    pec:string,
    notaLegale:boolean,
    prodotto:string,
    idEnte:string,
    codiceSDI:string|null
}
export interface AreaPersonaleContext {
    datiFatturazione:DatiFatturazione, 
    setDatiFatturazione?:any,
    dispatchMainState?:any,
    setStatusButtonConferma?:any,
    user?:string,
    mainState?:any
   


}

export type OptinsRadio = {
    id: string|boolean,
    descrizione: string 
}

type ObjectValidationTextArea = {
    max:number,
    validation:string,
}


export interface TextFieldProps {
    helperText : string,
    label : string,
    placeholder : string,
    fullWidth : boolean,
    value : string,
    keyObject:string,
    dataValidation:ObjectValidationTextArea 
    required:boolean,
    mainState:MainState,
    setDatiFatturazione:any,
    setStatusButtonConferma:any,
    datiFatturazione:DatiFatturazione

}

export interface RadioComponentProps {
    valueRadio? : string | boolean
    label?: string,
    options:OptinsRadio[],
    keyObject:string,
    mainState:MainState,
    datiFatturazione:DatiFatturazione, 
    setDatiFatturazione?:any,

}

export interface DataProps {
    dataLabel: string,
    formatDate: string,
    mainState:MainState,
    setDatiFatturazione:any,
    datiFatturazione:DatiFatturazione
}

export interface Email {
    tipo?: number;
    email?: string
}

export interface DynamicInsertProps {
    status: string,
    arrElement: Email[],
    setData: any,
    datiFatturazione:DatiFatturazione,
    mainState:MainState
}


export interface StateEnableConferma {
    CUP:boolean,
    CIG:boolean,
    'Mail Pec':boolean,
    'ID Documento':boolean,
    "Codice Commessa/Convenzione":boolean,
    'SDI':boolean
}




