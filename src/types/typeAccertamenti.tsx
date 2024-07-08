export interface BodyAccertamenti{
    anno:number,
    mese:null|number,
    tipologiaFattura:string[]|[],
    idEnti:string[]|[]
}

export interface Accertamento{
    idReport: number,
    json: string
    anno: number,
    mese: number,
    prodotto: string,
    stato: string,
    dataInserimento: string,
    dataStepCorrente: string,
    linkDocumento: string,
    tipologiaDocumento: string,
    descrizione: string,
    hash: string,
    contentType: string,
    contentLanguage: string
    
}