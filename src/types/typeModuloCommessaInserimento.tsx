import { Dispatch, SetStateAction } from "react";
import { InfoOpen, MainState } from "./typesGeneral";
import { ActionReducerType } from "../reducer/reducerMainState";

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
    mainState:MainState,
    dispatchMainState:Dispatch<ActionReducerType>,
    open:InfoOpen,
    setOpen:Dispatch<SetStateAction<InfoOpen>>
}
export interface TotaleNazionaleInternazionale{
    totaleNazionale:number,
    totaleInternazionale:number,
    totaleNotifiche:number
}

export interface SecondoContainerProps{
    totale:TotaleNazionaleInternazionale,
    mainState:MainState,
    dispatchMainState:Dispatch<ActionReducerType>,
    setDatiCommessa:Dispatch<SetStateAction<DatiCommessa>>,
    datiCommessa:DatiCommessa
}
export interface RowInsComProps {
    sentence : string,
    textBoxHidden : boolean
    idTipoSpedizione:number,
    rowNumber : number,
    setDatiCommessa:Dispatch<SetStateAction<DatiCommessa>>,
    datiCommessa:DatiCommessa,
    mainState:MainState
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
    mainState:MainState
}

export interface ModalDatiFatProps{
    setOpenModalDatiFatturazione:Dispatch<SetStateAction<boolean>>,
    openModalDatiFatturazione:boolean
}

export interface TextPdfProps{
    description: string,
    value:string|number,
}

type ContattiPdf ={
    idDatiFatturazione: number,
    email: string
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
    datiModuloCommessa: DatiModuloCommessaPdf[],
    datiModuloCommessaCosti: DatiCommessaCosti[],
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
export interface DatiCommessaCosti{
    Totale:string,
    descrizione: string
}

export interface ModComPdfProps{
    mainState: MainState,
    dispatchMainState:Dispatch<ActionReducerType>,
}

export interface PrimoContainerInsComProps{
    dispatchMainState?:Dispatch<ActionReducerType>,
}

export  interface ArrayTipologieCommesse {
    id: number,
    descrizione: string,
    tipo: string,
    tipoSpedizione: [
        {
            id: number,
            descrizione: string,
            tipo: string
        },
        {
            id: number,
            descrizione: string,
            tipo: string
        }
    ]
}


export interface ResponseCategorieSpedizione {
    data:ArrayTipologieCommesse[]
}


export interface ResponseDownloadPdf {
    data: string
}

export interface TotaleModuloCommessaNotifica {
    totaleNumeroNotificheNazionali: number,
    totaleNumeroNotificheInternazionali: number,
    totaleNumeroNotificheDaProcessare: number,
    totale: number
    
}
export    interface ResponseDettaglioModuloCommessa {
    data:{
        idTipoContratto: number,
        modifica: boolean,
        anno: number,
        mese: number,
        dataModifica: string,
        moduliCommessa:ModuliCommessa[],
        totaleModuloCommessaNotifica: TotaleModuloCommessaNotifica,
        totale:ResponsTotaliInsModuloCommessa[]
    }

}

export interface ModalConfermaInsProps{
    setOpen:Dispatch<SetStateAction<boolean>>,
    open:boolean,
    onButtonComfermaPopUp:() => void,
    mainState:MainState
}