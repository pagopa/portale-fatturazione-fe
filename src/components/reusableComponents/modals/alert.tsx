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

const BasicAlerts:React.FC <any> =  ({setVisible , visible}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj; 

    const [showAlert, setShowAlert] = useState(false);

    const handleModifyMainState = (valueObj) => {
        globalContextObj.dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    React.useEffect(()=>{
        if(mainState.apiError !== null){
            setShowAlert(true);
        }
    }, [mainState.apiError]);
  
    let colorAlert:AlertColor = 'success';
    if(globalContextObj.mainState.apiError === 401 || globalContextObj.mainState.apiError === 403 ){
        colorAlert = 'error';
    }else if(globalContextObj.mainState.apiError === 419){
        colorAlert = 'error';
    }else if(globalContextObj.mainState.apiError === 500){
        colorAlert = 'error';
    }else if(globalContextObj.mainState.apiError === 400){
        colorAlert = 'error';
    }else if(globalContextObj.mainState.apiError === 404 || globalContextObj.mainState.apiError === '404_DOWNLOAD' || globalContextObj.mainState.apiError === 'PRESA'){
        colorAlert = "info";
    }else if(globalContextObj.mainState.apiError === "Network Error"){
        colorAlert = 'warning';
    }else if(globalContextObj.mainState.apiError === 410){
        colorAlert = 'warning';
    }
    
    const [css, setCss] = useState('main_container_alert_component');

    React.useEffect(()=>{



        if(visible === true && globalContextObj.mainState.apiError !== null){

            const logout = globalContextObj.mainState.apiError === 401 || globalContextObj.mainState.apiError === 403 || globalContextObj.mainState.apiError === 419;
            setCss('main_container_alert_component_show');
            const timer = setTimeout(() => {
    
                setCss('main_container_alert_component_hidden');
                setVisible(false);

                if(logout){
                    localStorage.clear();
                    window.location.href = redirect;
                }
                
            }, 8000);

            return () =>{
                clearTimeout(timer);
                
            }; 
        }
        
    },[visible]);

    React.useEffect(()=>{
        if(visible === false  && globalContextObj.mainState.apiError !== null){
           
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
            
            <Alert sx={{display:'flex', justifyContent:'center'}} severity={colorAlert}  variant="standard">{globalContextObj.mainState.apiError && '500' }
                {globalContextObj.mainState.apiError === 'PRESA_IN_CARICO_DOCUMENTO' &&
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