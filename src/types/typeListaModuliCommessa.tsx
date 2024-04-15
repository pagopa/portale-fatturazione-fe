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
        anno:number,
        mese:number
    },
    setBodyGetLista:any
}