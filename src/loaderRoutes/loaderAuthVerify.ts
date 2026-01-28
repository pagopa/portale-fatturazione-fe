import { redirect } from "react-router-dom";
import { getAuthProfilo } from "../api/api";
import { redirect as globalRedirect } from "../api/api";
import { redirectAZ as globalRedirectAZ } from "../api/api";
import { apiKeyPageAvailable } from "../page/auth";
import { useGlobalStore } from "../store/context/useGlobalStore";



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

    if(globalLocalStorage === "{}"){
        return redirect(globalRedirect);
    } 

   
    if(result?.state?.mainState?.profilo.auth === "PAGOPA"){
        return redirect(globalRedirect);
    }
                
    return null;
}

export async function authVerifyIsLoggedSend({ request }) {

    const globalLocalStorage = localStorage.getItem('globalStatePF') || '{}';
    const result =  JSON.parse(globalLocalStorage);

    if(globalLocalStorage === "{}"){
        return redirect(globalRedirect);
    } 

    if(result?.state?.mainState?.profilo.auth === "SELFCARE" || result?.state?.mainState?.profilo.prodotto === "prod-pagopa"){
        return redirect(globalRedirect);
    }
                
    return null;
}

export async function authVerifyIsLoggedProdPn({ request }) {

    const globalLocalStorage = localStorage.getItem('globalStatePF') || '{}';
    const result =  JSON.parse(globalLocalStorage);

    if(globalLocalStorage === "{}"){
        return redirect(globalRedirect);
    } 

    if(result?.state?.mainState?.profilo.auth === "SELFCARE" || result?.state?.mainState?.profilo.prodotto === "prod-pn"){
        return redirect(globalRedirect);
    }
                
    return null;
}