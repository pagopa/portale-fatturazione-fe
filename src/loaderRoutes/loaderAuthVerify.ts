import { redirect } from "react-router-dom";
import { getAuthProfilo } from "../api/api";
import { redirect as globalRedirect } from "../api/api";
import { apiKeyPageAvailable } from "../page/auth";
import { useGlobalStore } from "../store/context/useGlobalStore";
import { PathPf } from "../types/enum";



export async function authVerify({ request }) {

    const globalLocalStorage = localStorage.getItem('globalStatePF') || '{}';
    const result =  JSON.parse(globalLocalStorage);
    const { setMainData } = useGlobalStore.getState();

 
    if(result?.state?.mainState?.authenticated){
        try {
            if ( result?.state?.mainState?.profilo.auth === "PAGOPA") {
                await getAuthProfilo(result?.state?.mainState?.profilo.jwt);
            }else if ( result?.state?.mainState?.profilo.auth === "SELFCARE") {
                await getAuthProfilo(result?.state?.mainState.profilo.jwt); 
                await apiKeyPageAvailable(result?.state?.mainState.profilo.jwt, result?.state?.mainState.profilo.nonce,setMainData);   
            }
        } catch (err) {
            localStorage.clear();
            /*Probabilmete da eliminare
            if(result?.state?.mainState?.profilo.auth === "PAGOPA"){
                return redirect(globalRedirectAZ);
            }else{
                return redirect(globalRedirect);
            }*/
                
            
        }
    } 
    
    return null;
}


export async function authVerifyIsLoggedEnte({ request }) {

    const globalLocalStorage = localStorage.getItem('globalStatePF') || '{}';
    const result =  JSON.parse(globalLocalStorage);
    if(globalLocalStorage === "{}" || result?.state?.mainState?.authenticated === false){
        return redirect(globalRedirect);
    } 

   
    if(result?.state?.mainState?.authenticated === true && result?.state?.mainState?.profilo.auth === "PAGOPA" && result?.state?.mainState?.prodotti.length > 0  &&  result?.state?.mainState?.profilo.prodotto === "prod-pn"){
        return redirect(PathPf.LISTA_DATI_FATTURAZIONE);
    }

    if(result?.state?.mainState?.authenticated === true && result?.state?.mainState?.profilo.auth === "PAGOPA" && result?.state?.mainState?.prodotti.length > 0  &&  result?.state?.mainState?.profilo.prodotto === "prod-pagopa"){
        return redirect(PathPf.ANAGRAFICAPSP);
    }
                
    return null;
}

export async function authVerifyIsLoggedSend({ request }) {

    const globalLocalStorage = localStorage.getItem('globalStatePF') || '{}';
    const result =  JSON.parse(globalLocalStorage);

    if(globalLocalStorage === "{}"|| result?.state?.mainState?.authenticated === false){
        return redirect(globalRedirect);
    } 

    if(result?.state?.mainState?.profilo.auth === "SELFCARE"){
        return redirect(PathPf.DATI_FATTURAZIONE_EN);
    }

    if(result?.state?.mainState?.profilo.prodotto === "prod-pagopa"){
        return redirect(PathPf.ANAGRAFICAPSP);
    }
                
    return null;
}

export async function authVerifyIsLoggedProdPn({ request }) {

    const globalLocalStorage = localStorage.getItem('globalStatePF') || '{}';
    const result =  JSON.parse(globalLocalStorage);

    if(globalLocalStorage === "{}"|| result?.state?.mainState?.authenticated === false){
        return redirect(globalRedirect);
    } 


    if(result?.state?.mainState?.authenticated === true && result?.state?.mainState?.profilo.auth === "SELFCARE"){
        return redirect(PathPf.DATI_FATTURAZIONE_EN);
    }

    if(result?.state?.mainState?.authenticated === true && result?.state?.mainState?.profilo.prodotto === "prod-pn"){
        return redirect(PathPf.LISTA_DATI_FATTURAZIONE);
    }
                
    return null;
}


export async function authVerifyIfEnteAllowRelSection({ request }) {

    const globalLocalStorage = localStorage.getItem('globalStatePF') || '{}';
    const result =  JSON.parse(globalLocalStorage);
  
    if(globalLocalStorage === "{}" || result?.state?.mainState?.profilo?.idTipoContratto === 2){
        return null;
    }else{
        return redirect(PathPf.DATI_FATTURAZIONE_EN);
    }
}

export async function authVerifyPageProdotto() {

    const globalLocalStorage = localStorage.getItem('globalStatePF') || '{}';
    const result =  JSON.parse(globalLocalStorage);

    if(globalLocalStorage === "{}"|| result?.state?.mainState?.authenticated === false){
        return redirect(globalRedirect);
    }  
    if( result?.state?.mainState?.authenticated === true && result?.state?.mainState?.profilo.auth === "SELFCARE"){
        return redirect(PathPf.DATI_FATTURAZIONE_EN);
    }  
            
    return null;
}