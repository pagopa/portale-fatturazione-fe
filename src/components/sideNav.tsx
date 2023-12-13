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
import { getDatiModuloCommessa, getAuthProfilo} from '../api/api';
import { SideNavProps } from '../types/typesGeneral';


const SideNavComponent: React.FC<SideNavProps> = ({setInfoModuloCommessa, infoModuloCommessa}) => {

    const navigate = useNavigate();
    const location : any = useLocation();

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;
   
    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

   

    // questa chiamata viene eseguita esclusivamente se l'utenete fa un reload page cosi da inserire nuovamente il NONCE nel DOM
    const getProfiloToGetNonce = async () =>{
        await getAuthProfilo(profilo.jwt)
            .then((res) =>{
            
                setInfoModuloCommessa((prev:any)=>({...prev, ...{nonce:res?.data.nonce}}));
           
              
            }).catch(()=>{

                navigate('/error');
            });
    };
    // eseguiamo la get a riga 21 solo se il value dell'input(nonce) nel Dom è non c'è e controlliamo che nella local storage sia settatto il profilo
    // Object.values(profilo).length !== 0 viene fatto solo per far si che la chiamanta non venga fatta al primo rendering
    // in quel caso il get profilo viene chiamato nella page auth
  
    useEffect(()=>{
        
        
        if(infoModuloCommessa.nonce === '' && Object.values(profilo).length !== 0){
           
            getProfiloToGetNonce();
        }
         
    },[infoModuloCommessa.nonce]);

    

  

    const getCommessa = async () =>{
        await getDatiModuloCommessa(token, infoModuloCommessa.nonce).then((res)=>{

            if(res.data.modifica === true && res.data.moduliCommessa.length === 0 ){
           
                setInfoModuloCommessa((prev:any)=>({
                    ...prev,
                    ...{
                        inserisciModificaCommessa:'INSERT',
                        statusPageInserimentoCommessa:'mutable',
                        modifica:true
                    }}));
                // ci sono commesse inserite nel mese corrente e posso modificarle
            }else if(res.data.modifica === true && res.data.moduliCommessa.length > 0){
             
               
                setInfoModuloCommessa((prev:any)=>({ 
                    ...prev,
                    ...{
                        inserisciModificaCommessa:'MODIFY',
                        statusPageInserimentoCommessa:'immutable',
                        modifica:true}}));
            }else if(res.data.modifica === false ){
                setInfoModuloCommessa((prev:any)=>({ 
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
          
            if(err.response.status === 401){
                navigate('/error');
            }else if(err.response.status === 419){
                navigate('/error');
            }
            // menageError(err.response.status, navigate);
            
        });
    };

   
    useEffect(()=>{
        if(token !== undefined && infoModuloCommessa.nonce !== '' ){
            getCommessa();
        }
    },[token,infoModuloCommessa.nonce]);
  

 
    
   

    

    const [selectedIndex, setSelectedIndex] = useState(0);
    const handleListItemClick = (index : number, route : string) => {
        navigate(route);
        setSelectedIndex(index);
        setInfoModuloCommessa((prev:any)=>({ 
            ...prev,
            ...{
                action:'DATI_FATTURAZIONE',
                statusPageDatiFatturazione:'immutable'
            }}));

        localStorage.setItem('statusApplication', JSON.stringify(infoModuloCommessa));
    };


    const handleListItemClickModuloCommessa = async (index : number,) => {
       
        setSelectedIndex(index);
      

        await getDatiModuloCommessa(token, infoModuloCommessa.nonce).then((res)=>{

            if(res.data.modifica === true && res.data.moduliCommessa.length === 0 ){
           
                const newState = {
                    path:'/8',
                    mese:res.data.mese,
                    anno:res.data.anno,
                    inserisciModificaCommessa:'INSERT'
                };
                localStorage.setItem('statusApplication', JSON.stringify(newState));
              
                navigate('/8');
            }else if(res.data.modifica === true && res.data.moduliCommessa.length > 0 ){
                const newState = {
                    path:'/4',
                    mese:res.data.mese,
                    anno:res.data.anno,
                    inserisciModificaCommessa:'MODIFY'
                };
                localStorage.setItem('statusApplication', JSON.stringify(newState));
               
                navigate('/4');
            }else if(res.data.modifica === false && res.data.moduliCommessa.length === 0){
                const newState = {
                    path:'/4',
                    mese:res.data.mese,
                    anno:res.data.anno,
                    inserisciModificaCommessa:'NO_ACTION'
                };
                localStorage.setItem('statusApplication', JSON.stringify(newState));
               
                navigate('/4');
            }else if(res.data.modifica === false && res.data.moduliCommessa.length > 0){
                const newState = {
                    path:'/8',
                    mese:res.data.mese,
                    anno:res.data.anno,
                    inserisciModificaCommessa:'NO_ACTION'
                };
                localStorage.setItem('statusApplication', JSON.stringify(newState));
               
                navigate('/8');
            }

        }).catch((err) =>{
            if(err.response.status === 401){
                navigate('/error');
            }else if(err.response.status === 419){
                navigate('/error');
            }
        });
       

    };

    

    const currentLocation = location.pathname;

    useEffect(()=>{
        if(currentLocation === '/'){
            setSelectedIndex(0);
        }else if(currentLocation === '/4'){
            setSelectedIndex(1);
        }else if(currentLocation === '/8'){
            setSelectedIndex(2);
        }
        
    },[currentLocation]);

    
   

 


    return (
        <>
            {(location.pathname === '/error'||location.pathname === '/auth') ? null :
                <Box sx={{
                    height: '100%',
                    maxWidth: 360,
                    backgroundColor: 'background.paper',
                }}
                >
                    <List component="nav" aria-label="main piattaforma-notifiche sender">
                        <ListItemButton selected={selectedIndex === 0} onClick={() => handleListItemClick(0,'/')}>
                            <ListItemIcon>
                                <DnsIcon fontSize="inherit"></DnsIcon>
                      
                            </ListItemIcon>
                            <ListItemText primary="Dati di fatturazione" />
                        </ListItemButton>
                        <ListItemButton selected={selectedIndex === 1} onClick={() => handleListItemClickModuloCommessa(1)}>
                            <ListItemIcon>
                                <ViewModuleIcon fontSize="inherit" />
                            </ListItemIcon>
                            <ListItemText primary="Modulo commessa" />
                        </ListItemButton>
                       
                    </List>
                    <Divider />
                </Box>
            }
        </>

    );
};
export default SideNavComponent;