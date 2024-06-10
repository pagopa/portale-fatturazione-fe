import { useEffect } from "react";
import { Typography } from "@mui/material";
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import { AzureLoginProps } from "../types/typesGeneral";

// pagina visulizzata nel caso in cui l'utenete PagoPa procede con il logOut
// l'utente PagoPa potrà riaccedere tramite questa pagina

const AzureLogin : React.FC<AzureLoginProps> = ({ dispatchMainState}) =>{

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    useEffect(()=>{
        handleModifyMainState({authenticated:false});
    },[]);

    localStorage.clear();

    /*
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
  */
    return (
      
        <div className='container d-flex align-items-center justify-content-center ' style={{height: '400px'}}>
            <Typography variant="h1">Accedi all'Area Riservata di PagoPA <ArrowCircleUpIcon fontSize="large"></ArrowCircleUpIcon></Typography>
        
        </div>
     
    );
};

export default AzureLogin;