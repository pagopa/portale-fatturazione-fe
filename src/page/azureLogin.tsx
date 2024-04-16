import { useEffect } from "react";
import { useNavigate } from "react-router";
import { PathPf } from "../types/enum";

// pagina visulizzata nel caso in cui l'utenete PagoPa procede con il logOut
// l'utente PagoPa potrà riaccedere tramite questa pagina

const AzureLogin : React.FC = () =>{

    const navigate = useNavigate();

    const getProfiloFromLocalStorage = localStorage.getItem('profilo') || '{}';

    const checkIfUserIsAutenticated = JSON.parse(getProfiloFromLocalStorage).auth;
   
    useEffect(()=>{
        if(checkIfUserIsAutenticated === 'PAGOPA'){
            navigate(PathPf.LISTA_DATI_FATTURAZIONE);
        }
        if(checkIfUserIsAutenticated === 'SELFCARE'){
            localStorage.removeItem('profilo');
            localStorage.removeItem('token');
        }
    },[checkIfUserIsAutenticated]);
  
    return (
      
        <div className='container d-flex align-items-center justify-content-center ' style={{height: '400px'}}>
            <h1>Sessione terminata</h1>
        
        </div>
     
    );
};

export default AzureLogin;