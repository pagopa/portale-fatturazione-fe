import React from 'react';
import { useState, useEffect } from 'react';
import {
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Box,
    Divider,
} from '@mui/material';
import { useNavigate, useLocation } from "react-router-dom";
import DnsIcon from '@mui/icons-material/Dns';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import {manageError} from '../../api/api';
import MarkUnreadChatAltIcon from '@mui/icons-material/MarkUnreadChatAlt';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { SideNavProps } from '../../types/typesGeneral';
import { getDatiFatturazione } from '../../api/apiSelfcare/datiDiFatturazioneSE/api';
import { getDatiModuloCommessa } from '../../api/apiSelfcare/moduloCommessaSE/api';


const SideNavComponent: React.FC<SideNavProps> = ({dispatchMainState, mainState}) => {

    const navigate = useNavigate();
    const location = useLocation();

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;
   
    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
  

    const [selectedIndex, setSelectedIndex] = useState(0);

    
    const handleListItemClick = async() => {

        if(profilo.auth === 'PAGOPA'){
           
            navigate('/pagopalistadatifatturazione');
        }else{
            navigate('/');
            /*
            if(mainState.datiFatturazione === true){
                handleModifyMainState({
                    action:'DATI_FATTURAZIONE',
                    statusPageDatiFatturazione:'immutable'
                });
                localStorage.setItem('statusApplication', JSON.stringify(mainState));
            }
           */
        }
        
    };

    // Lato self care
    // chiamata per capire se i dati fatturazione sono stati inseriti
    // SI.... riesco ad inserire modulo commessa
    //No.... redirect dati fatturazione
    // tutto gestito sul button 'continua' in base al parametro datiFatturazione del main state

    // nella page moduloCommessInserimento questa function viene applicata sia lato selfcare che pago pa poichè se si è loggati come Pago pa
    // viene mostrata la grid lista commesse , solo nel momento in cui l'utente va a selezionare un comune potrà essere eseguita la
    // chiamata con i parametri necessari (id ente)
    const getDatiFat = async () =>{
      
        await getDatiFatturazione(token,profilo.nonce).then(( ) =>{ 
            
            handleModifyMainState({datiFatturazione:true});
         

        }).catch(err =>{
          
            if(err?.response?.status === 404){
                handleModifyMainState({datiFatturazione:false});
              
            }
           
           
        });

    };

    const handleListItemClickModuloCommessa = async () => {
       
        if(profilo.auth === 'PAGOPA'){
            //cliccando sulla side nav Modulo commessa e sono l'ente PAGOPA
            navigate('/pagopalistamodulicommessa');

        }else{
            //cliccando sulla side nav Modulo commessa e sono un ente qualsiasi
            await getDatiFat();
            await getDatiModuloCommessa(token, profilo.nonce).then((res)=>{

                if(res.data.modifica === true && res.data.moduliCommessa.length === 0 ){
                    handleModifyMainState({
                        inserisciModificaCommessa:'INSERT',
                        statusPageInserimentoCommessa:'mutable',
                        userClickOn:undefined,
                        primoInserimetoCommessa:true
                    });
                 
                    const newState = {
                        mese:res.data.mese,
                        anno:res.data.anno,
                        inserisciModificaCommessa:'INSERT',
                        datiFatturazione:mainState.datiFatturazione,
                        userClickOn:undefined,
                        primoInserimetoCommessa:true
                    };

                    const statusApp = localStorage.getItem('statusApplication')||'{}';
                    const parseStatusApp = JSON.parse(statusApp);
            
                    localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                        ...newState}));
                 
                    navigate('/8');
                }else if(res.data.modifica === true && res.data.moduliCommessa.length > 0 ){
    
                    handleModifyMainState({
                        inserisciModificaCommessa:'MODIFY',
                        statusPageInserimentoCommessa:'immutable',
                        primoInserimetoCommessa:false});
    
                    const newState = {
                        inserisciModificaCommessa:'MODIFY',
                        datiFatturazione:mainState.datiFatturazione,
                        primoInserimetoCommessa:false
                    };
                    const statusApp = localStorage.getItem('statusApplication')||'{}';
                    const parseStatusApp = JSON.parse(statusApp);
            
                    localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                        ...newState}));
                   
                    navigate('/4');
                }else if(res.data.modifica === false && res.data.moduliCommessa.length === 0){

                    handleModifyMainState({
                        inserisciModificaCommessa:'NO_ACTION',
                        statusPageInserimentoCommessa:'immutable',
                        primoInserimetoCommessa:false});
                
                    const newState = {
                        inserisciModificaCommessa:'NO_ACTION',
                        datiFatturazione:mainState.datiFatturazione,
                        primoInserimetoCommessa:false
                    };
                    const statusApp = localStorage.getItem('statusApplication')||'{}';
                    const parseStatusApp = JSON.parse(statusApp);
            
                    localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                        ...newState}));
                   
                    navigate('/4');
                }else if(res.data.modifica === false && res.data.moduliCommessa.length > 0){
                    handleModifyMainState({
                        inserisciModificaCommessa:'NO_ACTION',
                        statusPageInserimentoCommessa:'immutable',
                        primoInserimetoCommessa:false}); 

                    const newState = {
                        inserisciModificaCommessa:'NO_ACTION',
                        datiFatturazione:mainState.datiFatturazione,
                        primoInserimetoCommessa:false
                    };
                    const statusApp = localStorage.getItem('statusApplication')||'{}';
                    const parseStatusApp = JSON.parse(statusApp);
            
                    localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                        ...newState}));
                   
                    navigate('/4');
                }
    
            }).catch((err) =>{
                manageError(err, navigate);
            });
            
        }
    };

    const handleListItemClickNotifiche = () => {

        navigate('/notifiche');
    };

    const handleListItemClickRel = async () => {
        navigate('/rel');
     
    };
    
    const currentLocation = location.pathname;

    useEffect(()=>{
        if(currentLocation === '/'){
            setSelectedIndex(0);
        }else if(currentLocation === '/4'){
            setSelectedIndex(1);
        }else if(currentLocation === '/8'){
            setSelectedIndex(1);
        }else if(currentLocation === '/pagopalistadatifatturazione'){
            setSelectedIndex(0);
        }else if(currentLocation === '/pagopalistamodulicommessa'){
            setSelectedIndex(1);
        }else if(currentLocation === '/pdf'){
            setSelectedIndex(1);
        }else if(currentLocation === '/notifiche'){
            setSelectedIndex(2);
        }else if(currentLocation === '/rel'){
            setSelectedIndex(3);
        }else if(currentLocation === '/relpdf'){
            setSelectedIndex(3);
        }
        
    },[currentLocation]);
   
    const hideShowSidenav = location.pathname === '/auth' ||
                            location.pathname === '/azure' ||
                            location.pathname === '/auth/azure'||
                            location.pathname === '/azureLogin'||
                            !profilo.auth;


   

    return (
        <>
            {hideShowSidenav ? null :
                <Box sx={{
                    height: '100%',
                    maxWidth: 360,
                    backgroundColor: 'background.paper',
                }}
                >
                    <List component="nav" aria-label="main piattaforma-notifiche sender">
                        {profilo.profilo !== 'REC' &&
                        <><ListItemButton selected={selectedIndex === 0} onClick={() => handleListItemClick()}>
                            <ListItemIcon>
                                <DnsIcon fontSize="inherit"></DnsIcon>

                            </ListItemIcon>
                            <ListItemText primary="Dati di fatturazione" />
                        </ListItemButton><ListItemButton selected={selectedIndex === 1} onClick={() => handleListItemClickModuloCommessa()}>
                            <ListItemIcon>
                                <ViewModuleIcon fontSize="inherit" />
                            </ListItemIcon>
                            <ListItemText primary="Modulo commessa" />
                        </ListItemButton></>
                        }
                        <ListItemButton selected={selectedIndex === 2} onClick={() => handleListItemClickNotifiche()}>
                            <ListItemIcon>
                           
                                <MarkUnreadChatAltIcon fontSize="inherit" />
                            </ListItemIcon>
                            <ListItemText primary="Notifiche" />
                        </ListItemButton>
                        {profilo.profilo !== 'REC' &&
                        <ListItemButton selected={selectedIndex === 3} onClick={() => handleListItemClickRel()}>
                            <ListItemIcon>
                                <ManageAccountsIcon fontSize="inherit" />
                            </ListItemIcon>
                            <ListItemText primary="Regolare Esecuzione" />
                        </ListItemButton>
                        }
                    </List>
                    <Divider />
                </Box>
            }
        </>
       

    );
};
export default SideNavComponent;