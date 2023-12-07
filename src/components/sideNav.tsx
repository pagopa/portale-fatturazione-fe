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
import {useAxios, url, menageError, getDatiModuloCommessa} from '../api/api';
import { SideNavProps } from '../types/typesGeneral';
import { info } from 'console';

const SideNavComponent: React.FC<SideNavProps> = ({setInfoModuloCommessa, infoModuloCommessa}) => {

    const navigate = useNavigate();
    const location : any = useLocation();

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    

    const {...getCheckCommessaCurrentMonth} = useAxios({});
    const getCommessa = () =>{
        getCheckCommessaCurrentMonth.fetchData({
            method: 'GET',
            url: `${url}/api/modulocommessa`,
            headers: {
                Authorization: 'Bearer ' + token
            }});
    };

 
    useEffect(()=>{
        if(token !== undefined){
            getCommessa();
        }

    },[token, infoModuloCommessa.action]);
  

  
    
    useEffect(()=>{
        menageError(getCheckCommessaCurrentMonth, navigate);
    },[getCheckCommessaCurrentMonth.error]);


    
    useEffect(()=>{
        // se non ci sono commesse inserite nel mese corrente e posso insrirle
        if(getCheckCommessaCurrentMonth?.response?.modifica === true && getCheckCommessaCurrentMonth?.response?.moduliCommessa?.length === 0 ){
            setInfoModuloCommessa((prev:any)=>({
                ...prev,
                ...{
                    inserisciModificaCommessa:'INSERT',
                    statusPageInserimentoCommessa:'mutable',
                    modifica:true
                }}));
            // ci sono commesse inserite nel mese corrente e posso modificarle
        }else if(getCheckCommessaCurrentMonth?.response?.modifica === true && getCheckCommessaCurrentMonth?.response?.moduliCommessa?.length > 0){
            setInfoModuloCommessa((prev:any)=>({ 
                ...prev,
                ...{
                    inserisciModificaCommessa:'MODIFY',
                    statusPageInserimentoCommessa:'immutable',
                    modifica:true}}));
        }
    },[getCheckCommessaCurrentMonth.response]);
   
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
        console.log({getCheckCommessaCurrentMonth});
        if(getCheckCommessaCurrentMonth?.response?.modifica === true && getCheckCommessaCurrentMonth?.response?.moduliCommessa.length === 0 ){
           
            const newState = {
                path:'/8',
                mese:getCheckCommessaCurrentMonth?.response.mese,
                anno:getCheckCommessaCurrentMonth?.response.anno
            };
            localStorage.setItem('statusApplication', JSON.stringify(newState));
          
            navigate('/8');
        }else{
            const newState = {
                path:'/4',
                mese:getCheckCommessaCurrentMonth?.response.mese,
                anno:getCheckCommessaCurrentMonth?.response.anno
            };
            localStorage.setItem('statusApplication', JSON.stringify(newState));
           
            navigate('/4');
        }

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
            {(location.pathname === '/error' ||location.pathname === '/auth') ? null :
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
                        {/* 
                        <ListItemButton selected={selectedIndex === 2} onClick={() => handleListItemClick(2,'/8')}>
                            <ListItemIcon>
                                <PlaylistRemoveIcon fontSize="inherit" />
                            </ListItemIcon>
                            <ListItemText primary="Contestazioni" />
                        </ListItemButton>
                        */}
                    </List>
                    <Divider />
                </Box>
            }
        </>

    );
};
export default SideNavComponent;