export type Contatti = {
    email: string,
    tipo: number
}

export interface AreaPersonaleProps{ 
    infoModuloCommessa?:any,
    setInfoModuloCommessa:any
}
export interface DatiFatturazione{
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
    notaLegale:boolean
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
export interface AreaPersonaleContext {
    datiFatturazione:DatiFatturazione, 
    setDatiFatturazione?:any,
    setInfoModuloCommessa?:any,
    setStatusBottmConferma?:any,
    user?:string,
    infoModuloCommessa?:any
   


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




