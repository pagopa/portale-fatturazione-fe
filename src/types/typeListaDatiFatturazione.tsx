export interface ListaDatiFatturazioneProps{
    mainState:any,
    dispatchMainState:any,
    setBodyGetLista:any,
    bodyGetLista:{
        descrizione:string,
        prodotto:string,
        profilo:string
    },
    infoPageListaDatiFat:{
        page: number, 
        pageSize: number
    },
    setInfoPageListaDatiFat:any
}
export interface ResponseDownloadListaFatturazione {
    data:{
        documento:string
    }
}