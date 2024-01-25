import { MainState } from "./typesGeneral";

export interface ReportDettaglioProps {
    mainState:any,
}

export interface NotificheList{
    idNotifica:string
    ragioneSociale:string,
    codiceFiscale:string,
    contestazione:boolean,
    tipoNotifica:string,
    mese:number
}

export interface ModalContestazioneProps{
    open:boolean,
    setOpen:any,
    mainState:MainState
}

export interface FlagContestazione{
    id:number,
    flag:string
}

export interface TipoContestazione{
    
    id: number,
    tipo: string
}