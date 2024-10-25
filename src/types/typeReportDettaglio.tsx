import { Dispatch, SetStateAction } from "react";
import { BodyListaNotifiche, MainState } from "./typesGeneral";
import { ActionReducerType } from "../reducer/reducerMainState";
import { BodyFatturazione } from "./typeFatturazione";
import { BodyDownloadModuliCommessa } from "./typeListaModuliCommessa";
import { BodyRel } from "./typeRel";
import { BodyGetListaDatiFatturazione } from "./typeListaDatiFatturazione";


export interface ReportDettaglioProps {
    mainState:MainState,
    dispatchMainState:Dispatch<ActionReducerType>,
}

export interface NotificheList{
    idNotifica:string
    ragioneSociale?:string,
    codiceFiscale?:string,
    contestazione:boolean,
    tipoNotifica:string,
    mese:number|string,
    statoContestazione?:number,
    iun:string,
    costEuroInCentesimi:string,
    dataInvio:string,
    anno:string,
    cap:string,
    statoEstero:string,
    onere:string,
    recipientId:string
}

export interface MultiSelectGroupedByProps{
    mainState:MainState,
    setBodyGetLista:Dispatch<SetStateAction<BodyListaNotifiche>>,
    setValueFgContestazione:Dispatch<SetStateAction<FlagContestazione[]>>,
    valueFgContestazione: FlagContestazione[],
    dispatchMainState:Dispatch<ActionReducerType>,
}

export interface ModalContestazioneProps{
    open:boolean,
    setOpen:Dispatch<SetStateAction<boolean>>,
    mainState:MainState,
    contestazioneSelected:Contestazione,
    setContestazioneSelected:Dispatch<SetStateAction<Contestazione>>,
    funGetNotifiche:(page:number, row:number,body:BodyListaNotifiche)=> void,
    funGetNotifichePagoPa:(page:number, row:number,body:BodyListaNotifiche)=> void,
    openModalLoading:Dispatch<SetStateAction<boolean>>,
    page:number,
    rows:number,
    valueRispostaEnte:string,
    contestazioneStatic:Contestazione,
    dispatchMainState:Dispatch<ActionReducerType>,
}

export interface FlagContestazione{
    id:number,
    flag:string,
    descrizione:string
}

export interface TipoContestazione{
    
    id: number,
    tipo: string
}

export interface Contestazione {
    risposta?:boolean,
    modifica?: boolean,
    chiusura?: boolean,
    accetta?:boolean,
    contestazione: {
        id: number,
        tipoContestazione: number|null,
        idNotifica: string,
        noteEnte: string,
        noteSend: string|null,
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
    statoContestazione: number,
    onere?:string
}

export interface BodyListaEnti{
    descrizione:string
}

export interface ElementMultiSelect {
    idEnte: string,
    descrizione: string

}

export interface MultiselectNotificheProps{
    setBodyGetLista:Dispatch<SetStateAction<BodyListaNotifiche>>|Dispatch<SetStateAction<BodyFatturazione>>|Dispatch<SetStateAction<BodyGetListaDatiFatturazione>>|Dispatch<SetStateAction<BodyDownloadModuliCommessa>>|Dispatch<SetStateAction<BodyRel>>,  //{idEnti:[],prodotto:'',profilo:''}|BodyDownloadModuliCommessa|BodyRel
    dataSelect:ElementMultiSelect[] ,
    setTextValue:Dispatch<SetStateAction<string>>,
    valueAutocomplete:OptionMultiselectChackbox[],
    setValueAutocomplete:Dispatch<SetStateAction<OptionMultiselectChackbox[]>> ,
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

export interface ListaRecCon {
    idEnte: string,
    descrizione: string
}


