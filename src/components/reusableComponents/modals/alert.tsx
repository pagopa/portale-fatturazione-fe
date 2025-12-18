import * as React from 'react';
import Alert, { AlertColor } from '@mui/material/Alert';
import { Dispatch, SetStateAction, useState } from 'react';
import { createPortal } from 'react-dom';
import { MainState } from '../../../types/typesGeneral';
import { redirect } from '../../../api/api';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@mui/material';
import { useNavigate } from 'react-router';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { PathPf } from '../../../types/enum';
import { ActionReducerType } from '../../../reducer/reducerMainState';
import { useGlobalStore } from '../../../store/context/useGlobalStore';


type AlertProps = {
    setVisible:Dispatch<SetStateAction<boolean>>,
    visible:boolean,
    mainState:MainState,
    dispatchMainState:Dispatch<ActionReducerType>
}

const BasicAlerts:React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
    const setErrorAlert = useGlobalStore(state => state.setErrorAlert);
    const errorAlert = useGlobalStore(state => state.errorAlert);
    const setShowAlert = useGlobalStore(state => state.setShowAlert);
    const showAlert = useGlobalStore(state => state.showAlert);

  
 
    const profilo = mainState.profilo;

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };


    let colorAlert:AlertColor = 'success'; 

    if(mainState.apiError === 400 || errorAlert.error === 400 || mainState.apiError === 500 || errorAlert.error === 500||mainState.apiError === 419 || errorAlert.error === 419||mainState.apiError === 401 || mainState.apiError === 403|| errorAlert.error === 401){
        colorAlert = 'error';
    }else if(mainState.apiError === 404 ||errorAlert.error === 404|| mainState.apiError === '404_DOWNLOAD' || mainState.apiError === 'PRESA_IN_CARICO_DOCUMENTO'|| mainState.apiError === '404_NO_CONTESTAZIONI'||mainState.apiError === 'PRESA'|| mainState.apiError === '404_RIGHE_ID'|| mainState.apiError === 'PRESA'||mainState.apiError === "SAVE_KEY_OK"||mainState.apiError === "NO_ENTE_FILTRI_CONTESTAZIONE"){
        colorAlert = "info";
    }else if(mainState.apiError === 400 || errorAlert.error === 400 || mainState.apiError === "CREAT_KEY_KO" || mainState.apiError === "REGEN_KEY_KO"||mainState.apiError === "SAVE_KEY_KO"){
        colorAlert = 'error';
    }else if(mainState.apiError === 410 || errorAlert.error === 410|| errorAlert.error === 409||(mainState.apiError||'').slice(0,2) === 'NO'){
        colorAlert = 'error';
    }else if(mainState.apiError === "Network Error"|| mainState.apiError === 'ERRORE_MANUALE'|| mainState.apiError === "ERROR_LIST_JSON_TO_SAP"||mainState.apiError === "NO_OPERAZIONE"|| mainState.apiError === "DOWNLOAD_NOTIFICHE_DOUBLE_REQUEST"){
        colorAlert = 'warning';
    }else if(!mainState.apiError && !errorAlert.error){
        colorAlert = 'warning';
    }else if(mainState.apiError === "FORMAT_FILE_ERROR" || mainState.apiError === "NO_INSERIMENTO_COMMESSA"){
        colorAlert = 'error';
    }

    const [css, setCss] = useState('main_container_alert_component');


    React.useEffect(()=>{
        if(mainState.apiError !== null || errorAlert.error !== 0){
            setShowAlert(true);
        }
    },[mainState.apiError,errorAlert.error]);

    React.useEffect(()=>{
        if(showAlert === true && (mainState.apiError !== null || errorAlert.error !== 0)){
            const logout = mainState.apiError === 401 || mainState.apiError === 403 || mainState.apiError === 419|| errorAlert.error === 401 || errorAlert.error === 403 || errorAlert.error === 419 ;
            setCss('main_container_alert_component_show');
            const timer = setTimeout(() => {
                setCss('main_container_alert_component_hidden');
                setShowAlert(false);
                if(logout){
                    if(profilo.auth === 'PAGOPA'){
                        window.location.href = '/azureLogin';
                    }else{
                        localStorage.removeItem("globalStatePF");
                        localStorage.removeItem("filters");
                        window.location.href = redirect;
                    }
                }
            }, 3500);
            return () =>{
                clearTimeout(timer);
            }; 
        }
        if(mainState.apiError === null){
            setCss('main_container_alert_component');
        }
    },[showAlert,mainState.apiError,errorAlert]);

    React.useEffect(()=>{
        if(showAlert === false  && (mainState.apiError !== null || errorAlert.error !== 0)){
            const timer = setTimeout(() => {
                if(mainState.apiError !== null){
                    handleModifyMainState({apiError:null});
                }else if( errorAlert.error !== 0){
                    setErrorAlert({error:0,message:''});
                }
            }, 500);
            return () =>{
                clearTimeout(timer);
            }; 
        }
    },[showAlert]);
    //versione OK nel caso di merge
    //<Alert sx={{display:'flex', justifyContent:'center'}} severity={colorAlert}  variant="standard">{mainState.apiError !== null ? t(`errori.${mainState.apiError}`, {defaultValue:t(`errori.400`)}) : errorAlert.message ? errorAlert.message : t(`errori.400`)} 

    // const test = mainState.apiError ||'';

    //const checkIfShowMessageDirectly =  test.toString().slice(0,4) !== '409_';

    let conditionalPath =  PathPf.ASYNC_DOCUMENTI_ENTE; 
    if(profilo.auth === 'PAGOPA'  && mainState.profilo.prodotto === "prod-pn"){
        conditionalPath =  PathPf.MESSAGGI;
    }else if(profilo.auth === 'PAGOPA'  && mainState.profilo.prodotto === "prod-pagopa"){
        conditionalPath =  PathPf.MESSAGGIPN;
    }

    return createPortal(
        <div className={css}>
            <Alert sx={{display:'flex', justifyContent:'center'}} severity={colorAlert}  variant="standard">{mainState.apiError !== null ? t(`errori.${mainState.apiError}`, {defaultValue:t(`errori.400`)}) : errorAlert.message ? errorAlert.message : t(`errori.400`)} 
                {(mainState.apiError === 'PRESA_IN_CARICO_DOCUMENTO'|| mainState.apiError === 'PRESA_IN_CARICO_DOCUMENTO_ENTE') &&
                <IconButton sx={{marginLeft:'20px'}} onClick={()=> {
                    setCss('main_container_alert_component_hidden');
                    navigate(conditionalPath);
                }}  color="default">
                    <ArrowForwardIcon fontSize="medium" sx={{color: '#17324D'}}/>
                </IconButton>
                }
            </Alert>
        </div>,
        document.getElementById("modal-alert")|| document.body
    );
};
export default BasicAlerts;