
import { DataGridCommessa } from "./typeModuloCommessaElenco";

export interface ModalProps {
    setOpen : any,
    open: boolean,
    sentence?:string,
    dispatchMainState:any,
    getDatiFat?:any,
    getDatiFatPagoPa?:any,
    handleGetDettaglioModuloCommessa?:any,
    handleGetDettaglioModuloCommessaPagoPa?:any,
    mainState?:MainState
}

export interface Messaggi {
    idEnte: null|string,
    idUtente: string,
    json: string,
    anno: number,
    mese: number,
    prodotto: string,
    gruppoRuolo: string,
    auth: string,
    stato: string,
    dataInserimento: string,
    dataStepCorrente: string,
    linkDocumento: string,
    tipologiaDocumento: string,
    lettura: boolean,
    hash: string,
    data?:string
}

export interface LocationState {
    pathname?: string;
   
}

export interface LoginProps {
    dispatchMainState:any,

}

export interface SideNavProps{
    dispatchMainState:any,
    mainState:MainState,
    setOpenBasicModal_DatFat_ModCom:any
}

export interface StepperProps {
    indexStepper: number
}

export type TokenObject = {
    accessToken?:string,
    idToken?:string,
}

export type AuthAzureProps = {
    dispatchMainState:any,
}

export type BodyListaDatiFatturazione = {
    idEnti:string[],
    prodotto: string,
    profilo: string
}

export type BodyListaModuloCommessa = {
    anno: number | string,
    mese: number | string,
    prodotto: string,
    descrizione: string
}

export interface MainState{
    mese:string,
    anno:string,
    userClickOn:undefined, // se l'utente clicca su un elemento di lista commesse setto GRID
    inserisciModificaCommessa:string |undefined, // INSERT MODIFY  se il sevizio get commessa mi restituisce true []
    statusPageDatiFatturazione:string,
    statusPageInserimentoCommessa:string,
    nonce:string,
    datiFatturazione:boolean, // parametro utilizato in modulo commessa per capire se accettare l'inserimento commessa o fare il redirect t dati fatturazione se non sono stati inseriti
    relSelected:string|null,
    apiError:number|string|null,
    authenticated:boolean,
    badgeContent:number,
    messaggioSelected:null|Messaggi
}

export interface BodyDownloadDatiFatturazione{
    idEnti:string[],
    prodotto: string,
    profilo: string  
}

export  type Params = {
    field:string,
    row:DataGridCommessa
}

export interface BodyDownloadListaCommesse{
    idEnti: string[],
    prodotto: string,
    anno:string|number,
    mese:string| number
}

export interface BodyListaNotifiche{
    anno: number,
    mese: number,
    prodotto: string,
    cap: string|null ,
    profilo: string,
    tipoNotifica: number | null,
    statoContestazione: number[] | [],
    iun:string | null,
    idEnti: string[],  // solo lato PAGOPA
    recipientId:string|null,
    recapitisti:string[],  // solo lato PAGOPA
    consolidatori:string[] // solo lato PAGOPA
}

export interface BodyListaNotificheSelfcare{
    anno: number,
    mese: number,
    prodotto: string,
    cap: string|null ,
    profilo: string,
    tipoNotifica: number | null,
    statoContestazione: number[] | [],
    iun:string | null,
    recipientId:string|null
}
export interface BodyListaNotificheConsolidatore{
    anno: number,
    mese: number,
    prodotto: string,
    cap: string|null ,
    profilo: string,
    tipoNotifica: number | null,
    statoContestazione: number[] | [],
    iun:string | null,
    recipientId:string|null,
    idEnti: string[],
}

type RequestError = {
    status:number,
    statusText: string
}

interface ResponseError {
    request:RequestError
}

export interface ManageErrorResponse{
    message:string,
    response: ResponseError

}

export interface BodyCreateContestazione{
    tipoContestazione: number|null,
    idNotifica: string,
    noteEnte: string
    
}

export interface SelectUltimiDueAnniProps{
    values:any,
    setValue: (value:any) => void,
    getTipologia?:any
}

export interface SelectMeseProps{
    values:{
        anno:number,
        mese:number|null,
        tipologiaFattura?:null| string|string[],
        idEnti?:string[],
        idContratto?:null|string,
        caricata?:null|number,
    },
    setValue: (value:any) => void
    getTipologia?:any
}

export interface MultiSelectBaseProps{
    setBody:any,
    list:any,
    value:string[],
    setValue:any,
    label:string,
    placeholder:string,
}
export interface ErrorPageProps{
    dispatchMainState:any,
    mainState:MainState
}

export enum Profilo {
    AZURE = 'PAGOPA',
    SELFCARE = 'PA',
    RECAPITISTA = 'REC',
    CONSOLIDATORE = 'CON'
}

export interface AzureLoginProps{
    dispatchMainState:any
}

export interface InfoOpen{
    visible:boolean,
    clickOn:string
}
