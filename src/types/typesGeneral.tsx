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

export interface mainState{
    mese:'',
    anno:'',
    modifica:undefined, // se la commessa selezionata è modificabile
    userClickOn:undefined, // se l'utente clicca su un elemento di lista commesse setto GRID
    inserisciModificaCommessa:undefined, // INSERT MODIFY  se il sevizio get commessa mi restituisce true []
    action:'DATI_FATTURAZIONE', // le action possono essere HIDE_MODULO_COMMESSA / SHOW_MODULO_COMMESSA / DATI_FATTURAZIOne
    statusPageDatiFatturazione:'immutable',
    statusPageInserimentoCommessa:'immutable',
    path:'/',
    nonce:'',
    indexStepper:0, // in che pat sono al momento del reload?
    idEnte:'',// parametro valorizzato nel caso in cui AUTH sia PAGOPA e venga selezionata una row della lista dati fatturazione
    prodotto: '',// parametro valorizzato nel caso in cui AUTH sia PAGOPA e venga selezionata una row della lista dati fatturazione
}
