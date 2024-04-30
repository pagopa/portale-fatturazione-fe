import { useMsal } from "@azure/msal-react";
import { useEffect} from 'react';
import { loginRequest } from '../authConfig';
import {InteractionStatus,
} from "@azure/msal-browser";
import { useNavigate } from "react-router";
import { PathPf } from "../types/enum";
import { AzureLoginProps } from "../types/typesGeneral";

//Pagina di accesso con l'autenticazione AZURE

const Azure : React.FC<AzureLoginProps> = ({dispatchMainState}) =>{

    localStorage.clear();
    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
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