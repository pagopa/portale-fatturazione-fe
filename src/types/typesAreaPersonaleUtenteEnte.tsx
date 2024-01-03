export interface SuccesResponseGetDatiFatturazione {
    data:DatiFatturazione
}

export type Contatti = {
    email: string,
    tipo: number
}

export interface AreaPersonaleProps{ 
    mainState?:any,
    setMainState:any
}
export interface DatiFatturazione{
    id?:string,
    idEnte:string,
    map?:string
    tipoCommessa:string,
    splitPayment:boolean,
    cup: string,
    idDocumento:string,
    codCommessa:string,
    contatti: Contatti[],
    dataCreazione:string,
    dataModifica:string,
    dataDocumento:string | null,
    pec:string,
    notaLegale:boolean,
    prodotto?:string,
}

    

export interface DatiFatturazionePost{
    tipoCommessa:string,
    splitPayment:boolean,
    cup: string,
    idDocumento:string,
    codCommessa:string,
    contatti: Contatti[],
    dataDocumento:string,
    pec:string,
    notaLegale:boolean
}

export interface DatiFatturazionePostPagopa {
    tipoCommessa:string,
    splitPayment:boolean,
    cup: string,
    idDocumento:string,
    codCommessa:string,
    contatti: Contatti[],
    dataDocumento:string| null,
    pec:string,
    notaLegale:boolean,
    prodotto:string,
    idEnte:string
}
export interface AreaPersonaleContext {
    datiFatturazione:DatiFatturazione, 
    setDatiFatturazione?:any,
    setMainState?:any,
    setStatusBottmConferma?:any,
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
    required:boolean

}

export interface RadioComponentProps {
    valueRadio? : string | boolean
    label?: string,
    options:OptinsRadio[],
    keyObject:string,

}

export interface DataProps {
    dataLabel: string,
    formatDate: string,
}

export interface Email {
    tipo?: number;
    email?: string
}

export interface DynamicInsertProps {
    status: string,
    arrElement: Email[],
    setData: any
}


export interface StateEnableConferma {
    CUP:boolean,
    CIG:boolean,
    'Mail Pec':boolean,
    'ID Documento':boolean,
    "Codice. Commessa/Convenzione":boolean,
}




