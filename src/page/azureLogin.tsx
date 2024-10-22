import { useContext, useEffect } from "react";
import { Typography } from "@mui/material";
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import { AzureLoginProps } from "../types/typesGeneral";
import { GlobalContext } from "../store/context/globalContext";

// pagina visulizzata nel caso in cui l'utenete PagoPa procede con il logOut
// l'utente PagoPa potrà riaccedere tramite questa pagina

const AzureLogin : React.FC<any> = () =>{
    const globalContextObj = useContext(GlobalContext); 

    const handleModifyMainState = (valueObj) => {
        globalContextObj.dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
    localStorage.clear();


   
  

    return (
      
        <div className='container d-flex align-items-center justify-content-center ' style={{height: '400px'}}>
            <Typography variant="h1">Accedi all'Area Riservata di PagoPA <ArrowCircleUpIcon fontSize="large"></ArrowCircleUpIcon></Typography>
        
        </div>
     
    );
};

export default AzureLogin;