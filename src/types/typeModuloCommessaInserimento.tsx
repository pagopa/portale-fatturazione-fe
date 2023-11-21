
export type ModuliCommessa = {
    numeroNotificheNazionali: number,
    numeroNotificheInternazionali : number,
    idTipoSpedizione: number

}

export interface DatiCommessa  {
    moduliCommessa : ModuliCommessa[]
}

export interface InsModuloCommessaContext {
    datiCommessa: DatiCommessa,
    setDatiCommessa?: any,
    setDisableContinua?:any
}
export interface RowInsComProps {
    sentence : string,
    textBoxHidden : boolean
    idTipoSpedizione:number,
    setInputTotale:any, 
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

