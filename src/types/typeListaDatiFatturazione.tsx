export interface ListaDatiFatturazioneProps{
    mainState:any,
    dispatchMainState:any,
}

export interface ResponseDownloadListaFatturazione {
    data:{
        documento:string
    }
}