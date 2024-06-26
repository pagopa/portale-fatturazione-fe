import { TableCellProps } from "@mui/material";
import { MainState } from "./typesGeneral";

export interface BodyFatturazione{
    anno:number,
    mese:number,
    tipologiaFattura:string[],
    idEnti:string[]
}

export interface FatturazioneProps{
    mainState:MainState,
    dispatchMainState:any
}



type Posizioni = {
    numerolinea: number,
    testo: string,
    codiceMateriale: string,
    quantita: number,
    prezzoUnitario: number,
    imponibile: number
}

export interface FattureObj {
    id: number,
    totale: number,
    numero: number,
    dataFattura: string,
    prodotto: string,
    identificativo: string,
    tipologiaFattura: string,
    istitutioID: string,
    onboardingTokenID: string,
    ragionesociale: string,
    tipocontratto: string,
    idcontratto: string,
    tipoDocumento: string,
    divisa: string,
    metodoPagamento: string,
    causale: string,
    split: boolean,
    sollecito: string,
    posizioni:Posizioni[]
}

export interface GridCollapsible{
    data:FattureObj[],
    showedData:FattureObj[],
    setShowedData:any,
    headerNames:HeaderCollapsible[]
}

export type HeaderCollapsible = {
    name:string,
    align:"center" | "inherit" | "left" | "right" | "justify" | undefined,
    id:number
}
