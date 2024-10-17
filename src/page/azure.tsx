import { useMsal } from "@azure/msal-react";
import { useContext, useEffect} from 'react';
import { loginRequest } from '../authConfig';
import {InteractionStatus,
} from "@azure/msal-browser";
import { AzureLoginProps } from "../types/typesGeneral";
import { GlobalContext } from "../store/context/globalContext";

//Pagina di accesso con l'autenticazione AZURE

const Azure : React.FC<any> = () =>{
    const globalContextObj = useContext(GlobalContext);
    localStorage.clear();
    const handleModifyMainState = (valueObj) => {
        globalContextObj.dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    useEffect(()=>{
        handleModifyMainState({authenticated:false});
    },[]);
    const getProfiloFromLocalStorage = localStorage.getItem('profilo') || '{}';

    const checkIfUserIsAutenticated = JSON.parse(getProfiloFromLocalStorage).auth;

    /*if(checkIfUserIsAutenticated === 'PAGOPA'){
        navigate(PathPf.LISTA_DATI_FATTURAZIONE);
    }*/

    const { instance, inProgress, accounts } = useMsal();

    const handleLoginRedirect = async () => {
       
        await  instance.loginRedirect(loginRequest).catch((error) => console.log(error));
    };

    useEffect(()=>{
        if ( inProgress === InteractionStatus.None && checkIfUserIsAutenticated !== 'PAGOPA' ) {

            handleLoginRedirect();
        }

    },[instance, accounts, inProgress]);

    return (
        <>
        </>
    );
};

export default Azure;