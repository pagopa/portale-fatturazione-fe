import * as React from 'react';
import Alert, { AlertColor } from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { MainState } from '../../types/typesGeneral';
import { redirect } from '../../api/api';
import { getProfilo } from '../../reusableFunctin/actionLocalStorage';
import { useNavigate } from 'react-router';

type AlertProps = {
    setVisible:any,
    visible:boolean,
    mainState:MainState,
    dispatchMainState:any
}

const BasicAlerts:React.FC <AlertProps> =  ({setVisible , visible, mainState, dispatchMainState}) => {
    const profilo =  getProfilo();
    const navigate = useNavigate();

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    let sentenceAlert = '';
    let colorAlert:AlertColor = 'success';
    if(mainState.apiError === 401 || mainState.apiError === 403 ){
        sentenceAlert =  "Gentile utente non è autenticato.";
        colorAlert = 'error';
    }else if(mainState.apiError === 419){
        sentenceAlert =  "Gentile utente la sesione è scaduta. ";
        colorAlert = 'warning';
    }else if(mainState.apiError === 500){
        sentenceAlert =  "Gentile utente l'operazione non è stata eseguita. Contatti l'amministratore";
        colorAlert = 'error';
    }else if(mainState.apiError === 400){
        sentenceAlert =  "Richiesta non eseguita. Contatti l'amministratore";
        colorAlert = 'error';
    }else if(mainState.apiError === 404){
        sentenceAlert =  "Non ci sono risultati per la ricerca eseguita";
        colorAlert = "info";
    }else if(mainState.apiError === "Network Error"){
        sentenceAlert =  "La connessione Internet risulta offline";
        colorAlert = 'warning';
    }
    
    const [css, setCss] = useState('main_container_alert_component');

    React.useEffect(()=>{
        if(visible === true && mainState.apiError !== null){

            const logout = mainState.apiError === 401 || mainState.apiError === 403 || mainState.apiError === 419;
            setCss('main_container_alert_component_show');
            const timer = setTimeout(() => {
    
                setCss('main_container_alert_component_hidden');
                setVisible(false);

                if(logout){
                    window.location.href = redirect;
                }
                
            }, 6000);

            return () =>{
                clearTimeout(timer);
                
            }; 
        }
    },[visible]);

    React.useEffect(()=>{
        if(visible === false  && mainState.apiError !== null){
           
            const timer = setTimeout(() => {
                handleModifyMainState({apiError:null});
            }, 500);
            return () =>{
                clearTimeout(timer);
            }; 
        }
    },[visible]);

    return createPortal(
        <div className={css}>
            <Stack sx={{ width: '100%' }} spacing={2}>
                <Alert severity={colorAlert}  variant="standard">{sentenceAlert}</Alert>
            </Stack>
        </div>,
        document.getElementById("modal-alert")|| document.body
    );
};

export default BasicAlerts;