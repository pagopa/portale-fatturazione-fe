import { DataGridCommessa } from "./typeModuloCommessaElenco";
export interface ModalProps {
    setOpen : any,
    open: boolean
}


export interface LocationState {
    pathname?: string;
   
}

export interface LoginProps {
    setCheckProfilo:any,
    setMainState:any

}

export interface SideNavProps{
    setMainState:any,
    mainState:any
}

export interface StepperProps {
    indexStepper: number
}

export type TokenObject = {
    accessToken?:string,
    idToken?:string,
}

export type AuthAzureProps = {
    setMainState:any,
}

export type BodyListaDatiFatturazione = {
    descrizione: string,
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
    modifica:undefined, // se la commessa selezionata è modificabile
    userClickOn:undefined, // se l'utente clicca su un elemento di lista commesse setto GRID
    inserisciModificaCommessa:string |undefined, // INSERT MODIFY  se il sevizio get commessa mi restituisce true []
    action:string, // le action possono essere HIDE_MODULO_COMMESSA / SHOW_MODULO_COMMESSA / DATI_FATTURAZIOne
    statusPageDatiFatturazione:string,
    statusPageInserimentoCommessa:string,
    path:string,
    nonce:string,
    indexStepper:0, // in che pat sono al momento del reload?
    idEnte:string,// parametro valorizzato nel caso in cui AUTH sia PAGOPA e venga selezionata una row della lista dati fatturazione
    prodotto: string,// parametro valorizzato nel caso in cui AUTH sia PAGOPA e venga selezionata una row della lista dati fatturazione
    datiFatturazione:boolean // parametro utilizato in modulo commessa per capire se accettare l'inserimento commessa o fare il redirect t dati fatturazione se non sono stati inseriti
}

export interface BodyDownloadDatiFatturazione{
    descrizione: string,
    prodotto: string,
    profilo: string  
}

export  type Params = {
    field:string,
    row:DataGridCommessa
}


export interface BodyDownloadListaCommesse{
    descrizione: string,
    prodotto: string,
    anno:string,
    mese:string 
}

export interface BodyListaNotifiche{
    anno: number,
    mese: number,
    prodotto: string,
    cap: string|null ,
    profilo: string,
    tipoNotifica: number | null,
    statoContestazione: number | null,
    iun:string | null,
    idEnti?: string[]
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




