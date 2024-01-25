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
import MarkUnreadChatAltIcon from '@mui/icons-material/MarkUnreadChatAlt';
import { getDatiModuloCommessa, getAuthProfilo, manageError} from '../../api/api';
import { MainState, SideNavProps } from '../../types/typesGeneral';


const SideNavComponent: React.FC<SideNavProps> = ({setMainState, mainState}) => {

    const navigate = useNavigate();
    const location = useLocation();

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;
   
    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

   

    // questa chiamata viene eseguita esclusivamente se l'utenete fa un reload page cosi da inserire nuovamente il NONCE nel DOM
    const getProfiloToGetNonce = async () =>{
        await getAuthProfilo(profilo.jwt)
            .then((res) =>{
            
                setMainState((prev:MainState)=>({...prev, ...{nonce:res?.data.nonce}}));
           
              
            }).catch(()=>{

                navigate('/error');
            });
    };
    // eseguiamo la get a riga 21 solo se il value dell'input(nonce) nel Dom è non c'è e controlliamo che nella local storage sia settatto il profilo
    // Object.values(profilo).length !== 0 viene fatto solo per far si che la chiamanta non venga fatta al primo rendering
    // in quel caso il get profilo viene chiamato nella page auth
  
    useEffect(()=>{
        /*
        const x = Object.values(profilo).length;
   */

        if(mainState.nonce === '' && Object.values(profilo).length !== 0){
          
            getProfiloToGetNonce();
        }
         
    },[mainState.nonce]);

    

  

    const getCommessa = async () =>{
        await getDatiModuloCommessa(token, mainState.nonce).then((res)=>{

            if(res.data.modifica === true && res.data.moduliCommessa.length === 0 ){
              
                setMainState((prev:MainState)=>({
                    ...prev,
                    ...{
                        inserisciModificaCommessa:'INSERT',
                        statusPageInserimentoCommessa:'mutable',
                        modifica:true
                    }}));

               
                // ci sono commesse inserite nel mese corrente e posso modificarle
            }else if(res.data.modifica === true && res.data.moduliCommessa.length > 0){
             
             
                setMainState((prev:MainState)=>({ 
                    ...prev,
                    ...{
                        inserisciModificaCommessa:'MODIFY',
                        statusPageInserimentoCommessa:'immutable',
                        modifica:true}}));
            }else if(res.data.modifica === false ){
              
                setMainState((prev:MainState)=>({ 
                    ...prev,
                    ...{
                        inserisciModificaCommessa:'NO_ACTION',
                        statusPageInserimentoCommessa:'immutable',
                        modifica:false}}));
            }

            const getProfilo = localStorage.getItem('profilo') || '{}';
            const profilo =  JSON.parse(getProfilo);
            const newProfilo = {...profilo, ...{idTipoContratto:res.data.idTipoContratto}};

            const string = JSON.stringify(newProfilo);
            localStorage.setItem('profilo', string);

        }).catch((err)=>{
            manageError(err, navigate);
            // menageError(err.response.status, navigate);
            
        });
    };

   
    useEffect(()=>{
        if(token !== undefined && mainState.nonce !== '' && profilo.auth !== 'PAGOPA' ){
            getCommessa();
        }
    },[token,mainState.nonce]);

  

  
    const getProfiloFromLocalStorage = localStorage.getItem('profilo') || '{}';

    const checkIfUserIsAutenticated = JSON.parse(getProfiloFromLocalStorage).auth;
  

 
    
   

    

    const [selectedIndex, setSelectedIndex] = useState(0);
    const handleListItemClick = () => {

        if(checkIfUserIsAutenticated === 'PAGOPA'){
            navigate('/pagopalistadatifatturazione');
        }else{
            navigate('/');
            
            setMainState((prev:MainState)=>({ 
                ...prev,
                ...{
                    action:'DATI_FATTURAZIONE',
                    statusPageDatiFatturazione:'immutable'
                }}));
    
            localStorage.setItem('statusApplication', JSON.stringify(mainState));
        }
        
    };


    const handleListItemClickModuloCommessa = async () => {
       
        if(profilo.auth === 'PAGOPA'){
            //cliccando sulla side nav Modulo commessa e sono l'ente PAGOPA
            navigate('/pagopalistamodulicommessa');

        }else{
            //cliccando sulla side nav Modulo commessa e sono un ente qualsiasi

            await getDatiModuloCommessa(token, mainState.nonce).then((res)=>{

                if(res.data.modifica === true && res.data.moduliCommessa.length === 0 ){
                    setMainState((prev:MainState)=>({
                        ...prev,
                        ...{
                            inserisciModificaCommessa:'INSERT',
                            statusPageInserimentoCommessa:'mutable',
                            modifica:true
                        }}));
               
                    const newState = {
                        path:'/8',
                        mese:res.data.mese,
                        anno:res.data.anno,
                        inserisciModificaCommessa:'INSERT'
                    };
                    localStorage.setItem('statusApplication', JSON.stringify(newState));
                  
                    navigate('/8');
                }else if(res.data.modifica === true && res.data.moduliCommessa.length > 0 ){
    
                    setMainState((prev:MainState)=>({ 
                        ...prev,
                        ...{
                            inserisciModificaCommessa:'MODIFY',
                            statusPageInserimentoCommessa:'immutable',
                            modifica:true}}));
    
                    const newState = {
                        path:'/4',
                        mese:res.data.mese,
                        anno:res.data.anno,
                        inserisciModificaCommessa:'MODIFY'
                    };
                    localStorage.setItem('statusApplication', JSON.stringify(newState));
                   
                    navigate('/4');
                }else if(res.data.modifica === false && res.data.moduliCommessa.length === 0){
                    setMainState((prev:MainState)=>({ 
                        ...prev,
                        ...{
                            inserisciModificaCommessa:'NO_ACTION',
                            statusPageInserimentoCommessa:'immutable',
                            modifica:false}}));
    
                    const newState = {
                        path:'/4',
                        mese:res.data.mese,
                        anno:res.data.anno,
                        inserisciModificaCommessa:'NO_ACTION'
                    };
                    localStorage.setItem('statusApplication', JSON.stringify(newState));
                   
                    navigate('/4');
                }else if(res.data.modifica === false && res.data.moduliCommessa.length > 0){
                    setMainState((prev:MainState)=>({ 
                        ...prev,
                        ...{
                            inserisciModificaCommessa:'NO_ACTION',
                            statusPageInserimentoCommessa:'immutable',
                            modifica:false}})); 
                    const newState = {
                        path:'/8',
                        mese:res.data.mese,
                        anno:res.data.anno,
                        inserisciModificaCommessa:'NO_ACTION'
                    };
                    localStorage.setItem('statusApplication', JSON.stringify(newState));
                   
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
        }
        
    },[currentLocation]);

    
   
    const hideShowSidenav = location.pathname === '/auth' ||
                            location.pathname === '/azure' ||
                            location.pathname === '/auth/azure'||
                            location.pathname === '/azureLogin';
                           
 


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
                        <ListItemButton selected={selectedIndex === 0} onClick={() => handleListItemClick()}>
                            <ListItemIcon>
                                <DnsIcon fontSize="inherit"></DnsIcon>
                      
                            </ListItemIcon>
                            <ListItemText primary="Dati di fatturazione" />
                        </ListItemButton>
                        <ListItemButton selected={selectedIndex === 1} onClick={() => handleListItemClickModuloCommessa()}>
                            <ListItemIcon>
                                <ViewModuleIcon fontSize="inherit" />
                            </ListItemIcon>
                            <ListItemText primary="Modulo commessa" />
                        </ListItemButton>

                        <ListItemButton selected={selectedIndex === 2} onClick={() => handleListItemClickNotifiche()}>
                            <ListItemIcon>
                           
                                <MarkUnreadChatAltIcon fontSize="inherit" />
                            </ListItemIcon>
                            <ListItemText primary="Notifiche" />
                        </ListItemButton>
                       
                    </List>
                    <Divider />
                </Box>
            }
        </>

    );
};
export default SideNavComponent;