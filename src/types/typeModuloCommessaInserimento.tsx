
export type ModuliCommessa = {
    numeroNotificheNazionali: number,
    numeroNotificheInternazionali : number,
    idTipoSpedizione: number,
    totaleNotifiche:number

}

export interface DatiCommessa  {
    moduliCommessa : ModuliCommessa[]
}
export  interface ModuloCommessaInserimentoProps{
    meseAnnoModuloCommessa:any
}
export interface TotaleNazionaleInternazionale{
    totaleNazionale:number,
    totaleInternazionale:number,
    totaleNotifiche:number
}

export interface InsModuloCommessaContext {
    datiCommessa: DatiCommessa,
    setDatiCommessa?: any,
    setDisableContinua?:any,
    statusModuloCommessa?:string,
    totaliModuloCommessa?: ResponsTotaliInsModuloCommessa[],
    setTotale?:any,
    totale:TotaleNazionaleInternazionale
}
export interface RowInsComProps {
    sentence : string,
    textBoxHidden : boolean
    idTipoSpedizione:number,
    rowNumber : number
}

export interface DataTotaleObj {
    digitaleNazionale:number,
    digitaleInternazionale:number,
    analogicoNazionale:number,
    analogicoInternazionale:number,
    analNotificaNazionale:number,
    analNotificaInternazionale:number,

}

export type ResponsTotaliInsModuloCommessa = {
    idCategoriaSpedizione: number,
    totaleValoreCategoriaSpedizione:number
}

export interface TerzoContainerModCommessa{
    valueTotali:ResponsTotaliInsModuloCommessa[]
}

