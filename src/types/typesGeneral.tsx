import { DataGridCommessa } from "./typeModuloCommessaElenco";
import { BodyRel, Rel } from "./typeRel";

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


export interface LocationState {
    pathname?: string;
   
}

export interface LoginProps {
    setCheckProfilo:any,
    dispatchMainState:any,


}

export interface SideNavProps{
    dispatchMainState:any,
    mainState:any,
    setFilterListaFatturazione:any,
    setFilterListaCommesse:any,
    setInfoPageListaDatiFat:any,
    setInfoPageListaCom:any
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
    // nomeEnteClickOn:string, // lato pagopa sul click della grid lista ModuloCommessa/dati fatturazione vado a soricizzare il nome da mostrare nel dettaglio 
    userClickOn:undefined, // se l'utente clicca su un elemento di lista commesse setto GRID
    inserisciModificaCommessa:string |undefined, // INSERT MODIFY  se il sevizio get commessa mi restituisce true []
    statusPageDatiFatturazione:string,
    statusPageInserimentoCommessa:string,
    nonce:string,
    // idEnte:string,// parametro valorizzato nel caso in cui AUTH sia PAGOPA e venga selezionata una row della lista dati fatturazione
    //prodotto: string,// parametro valorizzato nel caso in cui AUTH sia PAGOPA e venga selezionata una row della lista dati fatturazione
    datiFatturazione:boolean, // parametro utilizato in modulo commessa per capire se accettare l'inserimento commessa o fare il redirect t dati fatturazione se non sono stati inseriti
    relSelected:Rel|null,
    apiError:string // rel selezionata nella grid in page rel
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
    idEnti?: string[],
    recipientId:string|null
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
    setValue: (value:any) => void
}

export interface SelectMeseProps{
    values:BodyRel,
    setValue: (value:any) => void
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






