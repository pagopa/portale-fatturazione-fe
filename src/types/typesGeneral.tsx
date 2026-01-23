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
    //dispatchMainState:any,
}

export type BodyListaDatiFatturazione = {
    idEnti:string[],
    prodotto: string,
    profilo: string,
    idTipoContratto: number|null,
    page: number,
    size: number
}

export type BodyListaModuloCommessa = {
    anno: number | string,
    mese: number | string,
    idTipoContratto: number|null,
    descrizione?: string,
    idEnti:string[],
}

export interface MainState{
    mese:string,
    anno:string,
    userClickOn:undefined, // se l'utente clicca su un elemento di lista commesse setto GRID
    inserisciModificaCommessa:string |undefined, // INSERT MODIFY  se il sevizio get commessa mi restituisce true []
    statusPageDatiFatturazione:string,
    statusPageInserimentoCommessa:string,
    primoInserimetoCommessa:boolean,
    nomeEnteClickOn:string,
    datiFatturazione:boolean, // parametro utilizato in modulo commessa per capire se accettare l'inserimento commessa o fare il redirect t dati fatturazione se non sono stati inseriti
    relSelected:{
        nomeEnteClickOn:string,
        mese:number,
        anno:number,
        idElement:string,
        id:string
    },
    apiError:number|string|null,
    authenticated:boolean,
    badgeContent:number,
    messaggioSelected:null|Messaggi
    prodotti:ProfiloObject[],
    profilo:any,
    docContabileSelected:{key:string},
    infoTrimestreComSelected:any,
    appVersion:string,
    datiFatturazioneNotCompleted:boolean
}

export type ProfiloObject = {
    idTipoContratto: any,
    prodotto: string,
    idEnte: null,
    profilo: string,
    email: string,
    ruolo: string,
    descrizioneRuolo: string,
    gruppoRuolo: string,
    nomeEnte: null|string,
    nonce: string,
    valido: string,
    jwt: string,
    auth: string
}

export interface BodyDownloadDatiFatturazione{
    idEnti:string[],
    prodotto: string,
    profilo: string  
}

export  type Params = {
    field:string,
    row:any
}

export interface BodyDownloadListaCommesse{
    idEnti: string[],
    idTipoContratto:number|null,
    anno:string|number,
    mese:string| number
}

export interface BodyListaNotifiche{
    anno: number|null,
    mese: number|null,
    prodotto: string,
    cap: string|null ,
    profilo: string,
    tipoNotifica: number[],
    statoContestazione: number[] | [],
    iun:string | null,
    idEnti: string[],  // solo lato PAGOPA
    recipientId:string|null,
    recapitisti:{idEnte:string,descrizione:string}[],  // solo lato PAGOPA
    consolidatori:{idEnte:string,descrizione:string}[] // solo lato PAGOPA
}

export interface BodyListaNotificheSelfcare{
    anno: number|null,
    mese: number|null,
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
    statusText?: string
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
    getTipologia?:any,
    clearOnChangeFilter?:any
}

export interface SelectMeseProps{
    values:{
        anno:number|null,
        mese:number|null,
        tipologiaFattura?:null| string|string[],
        idEnti?:string[],
        idContratto?:null|string,
        caricata?:null|number,
    },
    setValue: (value:any) => void
    getTipologia?:any,
    clearOnChangeFilter?:any
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


export type JwtUser = {
    id: string;
    name?: string;
    surname?: string;
    email?: string;
};

export type LangCode = "it" | "en";
export type LinkType = "internal" | "external";
export type FooterLinksType = {
    label: string;
    href?: string;
    ariaLabel: string;
    linkType: LinkType;
    onClick?: () => void;
};

export type PreLoginFooterSingleSectionType = {
    title?: string;
    links: Array<FooterLinksType>;
};

export type PreLoginFooterSocialLink = {
    icon: string;
    /** the url to witch the user will be redirect */
    href?: string;
    title: string;
    ariaLabel: string;
    /** if defined it will override the href behavior */
    onClick?: () => void;
};

export type PreLoginFooterLinksType = {
    aboutUs: PreLoginFooterSingleSectionType;
    resources: PreLoginFooterSingleSectionType;
    followUs: {
        title: string;
        socialLinks: Array<PreLoginFooterSocialLink>;
        links: Array<FooterLinksType>;
    };
};

