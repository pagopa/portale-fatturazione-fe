import { MainState } from "./typesGeneral";

export interface RelPageProps{
    mainState:MainState,
    dispatchMainState:any,
    bodyRel:BodyRel,
    setBodyRel:any,
    page:number,
    setPage:any,
    rowsPerPage:number,
    setRowsPerPage:any
}
export interface TextRegioneSocialeRelProps{
    values:any,
    setValue: (value:any) => void
}

export interface BodyRel{
    anno:number,
    mese:number,
    tipologiaFattura:string|null,
    idEnti?:string[] | [],
    idContratto: string | null,
    caricata: number|null
} 

export interface Rel {
    idTestata: string,
    idEnte: string,
    caricata:number,
    ragioneSociale: string,
    dataDocumento: string,
    idDocumento: string,
    cup: string,
    idContratto: string,
    tipologiaFattura: string,
    anno: string,
    mese: string,
    totaleAnalogico: number,
    totaleDigitale: number,
    totaleNotificheAnalogiche: number,
    totaleNotificheDigitali: number,
    totale: number,
    iva:number,
    totaleAnalogicoIva:number,
    totaleDigitaleIva:number,
    totaleIva:number
}

export interface BodyRelLog {
    anno: number,
    mese: number,
    tipologiaFattura: string,
    idContratto: string,
    idEnte?:string
}

