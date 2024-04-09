export interface ListaDatiFatturazioneProps{
    mainState:any,
    dispatchMainState:any,
    setBodyGetLista:any,
    bodyGetLista:{
        descrizione:string,
        prodotto:string,
        profilo:string
    }
}
export interface ResponseDownloadListaFatturazione {
    data:{
        documento:string
    }
}