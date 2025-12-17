import {Navigate, Route} from "react-router";
import { PathPf } from "../types/enum";
import { useGlobalStore } from "../store/context/useGlobalStore";

export function RoleBasedIndexRedirect() {

    const mainState = useGlobalStore(state => state?.mainState);
    console.log({mainState});
    if(mainState?.profilo?.prodotto && mainState?.profilo?.auth){
        if (mainState.profilo.prodotto === "prod-pagopa") {
            return <Navigate to={PathPf.ANAGRAFICAPSP} replace />;
        }

        if (mainState.profilo.prodotto === "prod-pn" &&  mainState.profilo.auth === "PAGOPA") {
            return <Navigate to={PathPf.LISTA_DATI_FATTURAZIONE} replace />;
        }

        if (mainState.profilo.prodotto === "prod-pn" &&  mainState.profilo.auth === "SELFCARE") {
           
            return <Navigate to={PathPf.DATI_FATTURAZIONE_EN} replace />;
        }
    }
 

    return <Navigate to="/azureLogin" replace />;
}

