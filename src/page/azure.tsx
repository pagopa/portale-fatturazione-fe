import { useMsal } from "@azure/msal-react";
import { useEffect} from 'react';
import { loginRequest } from '../authConfig';
import {InteractionStatus,
} from "@azure/msal-browser";
import { useNavigate } from "react-router";

//Pagina di accesso con l'autenticazione AZURE

const Azure : React.FC = () =>{

    const navigate = useNavigate();

    const getProfiloFromLocalStorage = localStorage.getItem('profilo') || '{}';

    const checkIfUserIsAutenticated = JSON.parse(getProfiloFromLocalStorage).auth;

    if(checkIfUserIsAutenticated === 'PAGOPA'){
        navigate('/pagopalistadatifatturazione');
    }

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