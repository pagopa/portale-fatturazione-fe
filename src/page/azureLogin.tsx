import { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { useNavigate } from "react-router";

const AzureLogin : React.FC = () =>{


    const navigate = useNavigate();

    const getProfiloFromLocalStorage = localStorage.getItem('profilo') || '{}';

    const checkIfUserIsAutenticated = JSON.parse(getProfiloFromLocalStorage).auth;

    if(checkIfUserIsAutenticated === 'PAGOPA'){
        navigate('/pagopalistadatifatturazione');
    }



    return (
      
        <div className='container d-flex align-items-center justify-content-center ' style={{height: '400px'}}>
            <h1>Sessione terminata</h1>
        
        </div>
            
     
    );
};

export default AzureLogin;