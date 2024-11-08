import * as React from 'react';
import Alert, { AlertColor } from '@mui/material/Alert';
import { Dispatch, SetStateAction, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { MainState } from '../../../types/typesGeneral';
import { redirect } from '../../../api/api';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@mui/material';
import { useNavigate } from 'react-router';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { PathPf } from '../../../types/enum';
import { ActionReducerType } from '../../../reducer/reducerMainState';
import { GlobalContext } from '../../../store/context/globalContext';


type AlertProps = {
    setVisible:Dispatch<SetStateAction<boolean>>,
    visible:boolean,
    mainState:MainState,
    dispatchMainState:Dispatch<ActionReducerType>
}

const BasicAlerts:React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();


    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState, showAlert, setShowAlert} = globalContextObj;
 
    const profilo = mainState.profilo;

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

  
    let colorAlert:AlertColor = 'success';
    if(mainState.apiError === 401 || mainState.apiError === 403 ){
        colorAlert = 'error';
    }else if(mainState.apiError === 419){
        colorAlert = 'error';
    }else if(mainState.apiError === 500){
        colorAlert = 'error';
    }else if(mainState.apiError === 400){
        colorAlert = 'error';
    }else if(mainState.apiError === 404 || mainState.apiError === '404_DOWNLOAD' || mainState.apiError === 'PRESA'){
        colorAlert = "info";
    }else if(mainState.apiError === "Network Error"){
        colorAlert = 'warning';
    }else if(mainState.apiError === 410){
        colorAlert = 'warning';
    }else if(mainState.apiError === "NO_ENTE_FILTRI_CONTESTAZIONE"){
        colorAlert = 'info';
    }
    
    const [css, setCss] = useState('main_container_alert_component');


    React.useEffect(()=>{
        if(mainState.apiError !== null){
            setShowAlert(true);
        }

    },[mainState.apiError]);

    React.useEffect(()=>{
        if(showAlert === true && mainState.apiError !== null){

            const logout = mainState.apiError === 401 || mainState.apiError === 403 || mainState.apiError === 419;
            setCss('main_container_alert_component_show');
            
            const timer = setTimeout(() => {
    
                setCss('main_container_alert_component_hidden');
                setShowAlert(false);
                
                if(logout){
                    if(profilo.auth === 'PAGOPA'){
                        window.location.href = '/azureLogin';
                    }else{
                        localStorage.clear();
                        window.location.href = redirect;
                    }
                }
            }, 3000);

            return () =>{
                clearTimeout(timer);
                
            }; 
        }
    },[showAlert,mainState.apiError]);

    React.useEffect(()=>{
        if(showAlert === false  && mainState.apiError !== null){
           
            const timer = setTimeout(() => {
                handleModifyMainState({apiError:null});
            }, 500);
            return () =>{
                clearTimeout(timer);
            }; 
        }
    },[showAlert]);

    return createPortal(
        <div className={css}>
            
            <Alert sx={{display:'flex', justifyContent:'center'}} severity={colorAlert}  variant="standard">{t(`errori.${mainState.apiError}`)} 
                {mainState.apiError === 'PRESA_IN_CARICO_DOCUMENTO' &&
                <IconButton sx={{marginLeft:'20px'}} onClick={()=> {
                    setCss('main_container_alert_component_hidden');
                    navigate(PathPf.MESSAGGI);
                } }  color="default">
                    <ArrowForwardIcon fontSize="medium" 
                        sx={{
                            color: '#17324D',
                        }}
                            
                    />
                </IconButton>
                }
            </Alert>
                
          
        </div>,
        document.getElementById("modal-alert")|| document.body
    );
};

export default BasicAlerts;