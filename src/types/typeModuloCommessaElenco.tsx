export interface ResponseGetAnni {
    response ?: string[]
}

export interface VisualModuliCommessaProps{
    setMainState:any,
    mainState:any,
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
    totaleAnalogico: string
    
}

export interface GetAnniResponse{
    data:string[] 
}

export interface ResponseGetListaCommesse{
    data:DataGridCommessa[]
}