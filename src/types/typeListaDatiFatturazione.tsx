export interface ListaDatiFatturazioneProps{
    mainState:any,
    setMainState:any,
}

export interface ResponseDownloadListaFatturazione {
    data:{
        documento:string
    }
}