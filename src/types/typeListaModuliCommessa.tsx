export interface ListaModuliCommessaProps{
    mainState:any,
    dispatchMainState:any,
    setInfoPageListaCom:any,
    infoPageListaCom:{
        page: number,
        pageSize: number },
    bodyGetLista:{
        descrizione:string,
        prodotto:string,
        anno:string,
        mese:string
    },
    setBodyGetLista:any
}