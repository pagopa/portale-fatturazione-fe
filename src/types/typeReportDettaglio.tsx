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
    mese:number,
    statoContestazione:number,
    iun:string,
    costEuroInCentesimi:string,
    dataInvio:string,
    anno:string,
    cap:string,
    statoEstero:string
}

export interface ModalContestazioneProps{
    open:boolean,
    setOpen:any,
    mainState:MainState,
    contestazioneSelected:Contestazione,
    setContestazioneSelected:any,
    funGetNotifiche:any,
    funGetNotifichePagoPa:any
}

export interface FlagContestazione{
    id:number,
    flag:string
}

export interface TipoContestazione{
    
    id: number,
    tipo: string
}

export interface Contestazione {
    modifica: boolean,
    chiusura: boolean,
    contestazione: {
        id: number,
        tipoContestazione: number,
        idNotifica: string,
        noteEnte: string,
        noteSend: null,
        noteRecapitista: string | null,
        noteConsolidatore: string | null,
        rispostaEnte: string,
        statoContestazione: number,
        onere: string,
        dataInserimentoEnte: string,
        dataModificaEnte: string,
        dataInserimentoSend: string,
        dataModificaSend: string,
        dataInserimentoRecapitista: string,
        dataModificaRecapitista: string,
        dataInserimentoConsolidatore: string,
        dataModificaConsolidatore: string,
        dataChiusura: string,
        anno: number,
        mese: number
    }

  
}

export interface ModalBodyContestazione {
    tipoContestazione : number | null,
    noteEnte: string,
    idNotifica:string,
    statoContestazione?: number
}

export interface ModalBodyContestazioneModify {
    idNotifica: string,
    noteEnte?: string,
    rispostaEnte?: string,
    statoContestazione: number
}

export interface BodyListaEnti{
    descrizione:string
}

export interface ElementMultiSelect {
    idEnte: string,
    descrizione: string

}

export interface MultiselectNotificheProps{
    mainState : MainState,
    setBodyGetLista:any,
    setDataSelect:any,
    dataSelect:ElementMultiSelect[] 
}


export interface OptionMultiselectChackbox {
    
    idEnte: string,
    descrizione:string
}

export interface ModalBodyContestazioneModifyPagoPa{
    
    idNotifica?: string,
    onere?: string,
    noteSend?: string | null,
    statoContestazione?: number
      
}


