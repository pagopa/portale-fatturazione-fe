export type Contatti = {
    email: string,
    tipo: number
}
export interface DatiFatturazione{
    tipoCommessa:string,
    splitPayment:boolean,
    cup: string,
    cig:string,
    idDocumento:string,
    codCommessa:string,
    contatti: Contatti[],
    dataCreazione:string,
    dataModifica:string,
    dataDocumento:string,
    pec:string,
}

export interface DatiFatturazionePost{
    tipoCommessa:string,
    splitPayment:boolean,
    cup: string,
    cig:string,
    idDocumento:string,
    codCommessa:string,
    contatti: Contatti[],
    dataDocumento:string,
    pec:string,
}
export interface AreaPersonaleContext {
    statusPage: string,
    datiFatturazione:DatiFatturazione, 
    setDatiFatturazione?:any,
    setStatusPage?:any,
    setStatusBottmConferma?:any,
    user?:string


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




