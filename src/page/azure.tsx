import { useMsal } from "@azure/msal-react";
import {  useEffect} from 'react';
import { loginRequest } from '../authConfig';
import {InteractionStatus,
} from "@azure/msal-browser";

import Loader from "../components/reusableComponents/loader";
import { useGlobalStore } from "../store/context/useGlobalStore";

//Pagina di accesso con l'autenticazione AZURE

const Azure : React.FC<any> = () =>{
 
    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);

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
            <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
                <div id='loader_on_gate_pages'>
                    <Loader sentence={'Autenticazione in corso...'}></Loader> 
                </div>
            </div>
        </>
    );
};

export default Azure;