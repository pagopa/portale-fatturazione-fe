export interface ListaDatiFatturazioneProps{
    mainState:any,
    dispatchMainState:any,
}
export interface ResponseDownloadListaFatturazione {
    data:{
        documento:string
    }
}

export interface BodyGetListaDatiFatturazione {
    idEnti:string[],
    prodotto:string,
    profilo:string
}

export interface GridElementListaFatturazione {
    key: string,
    ragioneSociale: string,
    idEnte: string,
    prodotto: string,
    profilo: string,
    id: number,
    tipoCommessa:string,
    cup: string,
    codCommessa: string,
    dataDocumento: string,
    splitPayment: boolean,
    idDocumento: string,
    map: string,
    pec: string,
    notaLegale: boolean,
    dataCreazione: string,
    dataModifica: string
    
}