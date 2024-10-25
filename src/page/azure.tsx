import { useMsal } from "@azure/msal-react";
import { useContext, useEffect} from 'react';
import { loginRequest } from '../authConfig';
import {InteractionStatus,
} from "@azure/msal-browser";

import { GlobalContext } from "../store/context/globalContext";

//Pagina di accesso con l'autenticazione AZURE

const Azure : React.FC<any> = () =>{
    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;

    /*if(checkIfUserIsAutenticated === 'PAGOPA'){
        navigate(PathPf.LISTA_DATI_FATTURAZIONE);
    }*/

    const { instance, inProgress, accounts } = useMsal();

    const handleLoginRedirect = async () => {
       
        await  instance.loginRedirect(loginRequest).catch((error) => console.log(error));
    };

    useEffect(()=>{
        if ( inProgress === InteractionStatus.None && mainState.profilo.auth !== 'PAGOPA' ) {

            handleLoginRedirect();
        }

    },[instance, accounts, inProgress]);

    return (
        <>
        </>
    );
};

export default Azure;