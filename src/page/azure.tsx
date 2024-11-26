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

    const handleModifyMainState = (valueObj) => {
        globalContextObj.dispatchMainState({
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