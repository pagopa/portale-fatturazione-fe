import * as React from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { useState } from 'react';

type AlertProps = {
    typeAlert : any,
    setVisible:any,
    visible:boolean
}

const BasicAlerts:React.FC <AlertProps> =  ({typeAlert, setVisible , visible}) => {




    const [css, setCss] = useState('main_container_alert_component');

    React.useEffect(()=>{
  
        if(visible === true){

            setCss('main_container_alert_component_show');
            const timer = setTimeout(() => {
         
           
                setCss('main_container_alert_component_hidden');
                setVisible(false);
            }, 8000);
            return () =>{
                clearTimeout(timer);
            }; 
    
        }
      
    },[visible]);

  
    return (
        <div className={css}>
            <Stack sx={{ width: '100%' }} spacing={2}>
                <Alert severity={typeAlert}  variant="standard">INTERNAL SERVER ERROR: L'operazione non è andata a buon fine</Alert>
            </Stack>
        </div>
    );
};

export default BasicAlerts;