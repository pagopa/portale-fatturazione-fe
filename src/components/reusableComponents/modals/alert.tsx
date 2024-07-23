import * as React from 'react';
import Alert, { AlertColor } from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { MainState } from '../../../types/typesGeneral';
import { redirect } from '../../../api/api';
import { useTranslation } from 'react-i18next';


type AlertProps = {
    setVisible:any,
    visible:boolean,
    mainState:MainState,
    dispatchMainState:any
}

const BasicAlerts:React.FC <AlertProps> =  ({setVisible , visible, mainState, dispatchMainState}) => {
    const { t, i18n } = useTranslation();

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
    }else if(mainState.apiError === 'FATTURA_SOSPESA_RIPRISTINATA'){
        colorAlert = 'success';
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
                    localStorage.clear();
                    window.location.href = redirect;
                }
                
            }, 4000);

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
                <Alert severity={colorAlert}  variant="standard">{mainState.apiError && t(`errori.${mainState.apiError}`)}</Alert>
                
            </Stack>
        </div>,
        document.getElementById("modal-alert")|| document.body
    );
};

export default BasicAlerts;