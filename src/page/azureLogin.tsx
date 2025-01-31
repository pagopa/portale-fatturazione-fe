import { useContext, useEffect } from "react";
import { Typography } from "@mui/material";
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import { GlobalContext } from "../store/context/globalContext";

// pagina visulizzata nel caso in cui l'utenete PagoPa procede con il logOut
// l'utente PagoPa potrà riaccedere tramite questa pagina

const AzureLogin : React.FC<any> = () =>{
    const globalContextObj = useContext(GlobalContext); 
    const {dispatchMainState} = globalContextObj;

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    useEffect(()=>{
        handleModifyMainState({
            authenticated:false,
            profilo:{},
            prodotti:[],
            mese:'',
            anno:'',
            nomeEnteClickOn:'',
            datiFatturazione:false,// l'ente ha i dati di fatturazione?
            userClickOn:undefined, // se l'utente clicca su un elemento di lista commesse setto GRID
            inserisciModificaCommessa:undefined, // INSERT MODIFY  se il sevizio get commessa mi restituisce true []
            primoInserimetoCommessa:true,// la commessa mese corrente è stata inserita?
            statusPageDatiFatturazione:'immutable',
            statusPageInserimentoCommessa:'immutable',
            relSelected:{
                nomeEnteClickOn:'',
                mese:0,
                anno:0,
                idElement:''
            },
            apiError:null,
            badgeContent:0,
            messaggioSelected:null
        });

    },[]);


   
  

    return (
      
        <div className='container d-flex align-items-center justify-content-center ' style={{height: '400px'}}>
            <Typography variant="h1">Accedi all'Area Riservata di PagoPA <ArrowCircleUpIcon fontSize="large"></ArrowCircleUpIcon></Typography>
        
        </div>
     
    );
};

export default AzureLogin;