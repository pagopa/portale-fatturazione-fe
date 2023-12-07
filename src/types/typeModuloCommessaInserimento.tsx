
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
    infoModuloCommessa:any,
    setInfoModuloCommessa:any
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
    totaliModuloCommessa?: ResponsTotaliInsModuloCommessa[],
    setTotale?:any,
    totale:TotaleNazionaleInternazionale
    infoModuloCommessa?:any,
    setInfoModuloCommessa?:any
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

export interface ResponsTotaliInsModuloCommessa {
    idCategoriaSpedizione: number,
    totaleValoreCategoriaSpedizione:number
}

export interface TerzoContainerModCommessa{
    valueTotali:ResponsTotaliInsModuloCommessa[],
    dataModifica:string,
}

export interface ModalDatiFatProps{
    setOpenModalDatiFatturazione:any,
    openModalDatiFatturazione:boolean
}

export interface TextPdfProps{
    description: string,
    value:string,
}

type ContattiPdf ={
    idDatiFatturazione: number,
    email: string
}

type  DatiCommessaPdf = {
    totaleNotifiche: number,
    numeroNotificheNazionali: number,
    numeroNotificheInternazionali: number,
    tipo:string,
    idTipoSpedizione: number
}

export interface DataPdf {
    cup: string,
    cig: string,
    codCommessa: string,
    dataDocumento: string,
    splitPayment: string,
    idDocumento: string,
    map: string,
    tipoCommessa: string,
    prodott: string,
    pec: string,
    dataModifica: string,
    meseAttivita: number,
    contatti: ContattiPdf[],
    descrizione: string,
    partitaIva: string,
    indirizzoCompleto: string,
    datiModuloCommessa: DatiCommessaPdf[]
}

export interface CategorieTotali {
   
    idCategoriaSpedizione: number,
    percentuale: number,
    descrizione: string
    
}

export interface DatiModuloCommessaPdf {
    totaleNotifiche: number,
    numeroNotificheNazionali: number,
    numeroNotificheInternazionali: number,
    tipo:string,
    idTipoSpedizione: number

}
