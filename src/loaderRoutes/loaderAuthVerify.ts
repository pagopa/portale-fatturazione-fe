import { redirect } from "react-router-dom";
import { getAuthProfilo } from "../api/api";
import { redirect as globalRedirect } from "../api/api";



export async function authVerify({ request }) {

    const globalLocalStorage = localStorage.getItem('globalStatePF') || '{}';
    const result =  JSON.parse(globalLocalStorage);
 
    if(result?.state?.mainState?.authenticated){
        try {
            if ( result?.state?.mainState?.profilo.auth === "PAGOPA") {
                await getAuthProfilo(result?.state?.mainState?.profilo.jwt);
            }else if ( result?.state?.mainState?.profilo.auth === "SELFCARE") {
                await getAuthProfilo(result?.state?.mainState.profilo.jwt);    
            }
        } catch (err) {
            return redirect(globalRedirect);
        }
    } 
    
    return null;
}
