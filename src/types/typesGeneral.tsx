export interface ModalProps {
    setOpen : any,
    open: boolean
}


export interface LocationState {
    pathname?: string;
   
}

export interface LoginProps {
    setCheckProfilo:any,
    setInfoModuloCommessa:any

}

export interface SideNavProps{
    setInfoModuloCommessa:any,
    infoModuloCommessa:any
}

export interface StepperProps {
    indexStepper: number
}

export type TokenObject = {
    accessToken?:string,
    idToken?:string,
}

export type AuthAzureProps = {
    setInfoModuloCommessa:any,
}

export type BodyListaDatiFatturazione = {
    descrizione: string,
    prodotto: string,
    profilo: string
}
