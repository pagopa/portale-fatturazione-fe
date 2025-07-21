import React, { useContext, useRef } from 'react';
import { useState, useEffect } from 'react';
import {
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Box,
    Divider,
    IconButton,
    Collapse
} from '@mui/material';
import { useNavigate, useLocation } from "react-router-dom";
import DnsIcon from '@mui/icons-material/Dns';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import MarkUnreadChatAltIcon from '@mui/icons-material/MarkUnreadChatAlt';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { GlobalContext } from '../../store/context/globalContext';
import { PathPf } from '../../types/enum';
import { getDatiModuloCommessa } from '../../api/apiSelfcare/moduloCommessaSE/api';
import { getDatiFatturazione } from '../../api/apiSelfcare/datiDiFatturazioneSE/api';
import { manageError } from '../../api/api';
import DownloadIcon from '@mui/icons-material/Download';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import GavelIcon from '@mui/icons-material/Gavel';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const SideNavEnte: React.FC = () => {

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState,setOpenBasicModal_DatFat_ModCom,mainData} = globalContextObj;
    const navigate = useNavigate();
    const location = useLocation();
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;



    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
    const [openContestazioni, setOpenContestazioni] = useState(false);
    
    const handleListItemClick = async(pathToGo) => {
        if(pathToGo === PathPf.LISTA_COMMESSE && location.pathname !== PathPf.MODULOCOMMESSA ){
            localStorage.setItem('redirectToInsert',JSON.stringify(true));
        }
        if(((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)||(mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA))){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:pathToGo}}));
        }else if(location.pathname === PathPf.MODULOCOMMESSA && pathToGo === PathPf.LISTA_COMMESSE){
            return;
        }else{
            navigate(pathToGo);
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


    const currentLocation = location.pathname;

    useEffect(()=>{
        if(currentLocation === PathPf.DATI_FATTURAZIONE){
            setSelectedIndex(0);
        }else if(currentLocation === PathPf.LISTA_COMMESSE){
            setSelectedIndex(1);
        }else if(currentLocation === PathPf.MODULOCOMMESSA){
            setSelectedIndex(1);
        }else if(currentLocation === PathPf.LISTA_DATI_FATTURAZIONE){
            setSelectedIndex(0);
        }else if(currentLocation === PathPf.LISTA_MODULICOMMESSA){
            setSelectedIndex(1);
        }else if(currentLocation === PathPf.PDF_COMMESSA){
            setSelectedIndex(1);
        }else if(currentLocation === PathPf.LISTA_NOTIFICHE){
            setSelectedIndex(2);
        }else if(currentLocation === PathPf.LISTA_REL){
            setSelectedIndex(3);
        }else if(currentLocation === PathPf.PDF_REL){
            setSelectedIndex(3);
        }else if(currentLocation ===  PathPf.API_KEY_ENTE){
            setSelectedIndex(5);
        }else if(currentLocation === "/messaggi"){
            setSelectedIndex(null);
        }else if(currentLocation === "/accertamenti"){
            setSelectedIndex(7);
        }else if(currentLocation === PathPf.ASYNC_DOCUMENTI_ENTE){
            setSelectedIndex(8);
        }else if(currentLocation === PathPf.STORICO_CONTEST_ENTE || currentLocation === PathPf.STORICO_DETTAGLIO_CONTEST|| currentLocation === PathPf.INSERIMENTO_CONTESTAZIONI_ENTE){
            setSelectedIndex(6);
            setOpenContestazioni(true);
        }

        if(openContestazioni && (currentLocation !== PathPf.STORICO_CONTEST_ENTE && currentLocation !== PathPf.LISTA_NOTIFICHE && currentLocation !== PathPf.STORICO_DETTAGLIO_CONTEST && currentLocation !== PathPf.INSERIMENTO_CONTESTAZIONI_ENTE )){
            setOpenContestazioni(false);
        }
    },[currentLocation]);

    return (
        <Box sx={{
            height: '100%',
            maxWidth: 360,
            backgroundColor: 'background.paper',
        }}
        >
            <List component="nav" aria-label="main piattaforma-notifiche sender">
                <><ListItemButton selected={selectedIndex === 0} onClick={() => handleListItemClick(PathPf.DATI_FATTURAZIONE)}>
                    <ListItemIcon>
                        <DnsIcon fontSize="inherit"></DnsIcon>
                    </ListItemIcon>
                    <ListItemText primary="Dati di fatturazione" />
                </ListItemButton>
                <ListItemButton selected={selectedIndex === 1} onClick={() =>handleListItemClick(PathPf.LISTA_COMMESSE)}>
                    <ListItemIcon>
                        <ViewModuleIcon fontSize="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Modulo commessa" />
                </ListItemButton></>
                <ListItemButton selected={selectedIndex === 2} onClick={() => handleListItemClick(PathPf.LISTA_NOTIFICHE)}>
                    <ListItemIcon>
                        <MarkUnreadChatAltIcon fontSize="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Notifiche" />
                </ListItemButton>
                <ListItemButton selected={selectedIndex === 3} onClick={()=>handleListItemClick(PathPf.LISTA_REL)}>
                    <ListItemIcon>
                        <ManageAccountsIcon fontSize="inherit" />
                    </ListItemIcon>
                    <Box className="ms-3" display="flex" flexDirection="column">
                        <ListItemText primary="Regolare esecuzione /" />
                        <ListItemText primary="Documenti di cortesia" />
                    </Box>
                </ListItemButton>
                <ListItemButton selected={selectedIndex === 8} onClick={() => handleListItemClick(PathPf.ASYNC_DOCUMENTI_ENTE)}>
                    <ListItemIcon>
                        <DownloadIcon fontSize="inherit"/>
                    </ListItemIcon>
                    <ListItemText primary="Download documenti"/>
                </ListItemButton>
                {mainData.apiKeyPage.visible &&
                <ListItemButton selected={selectedIndex === 5} onClick={() => handleListItemClick(PathPf.API_KEY_ENTE)}>
                    <ListItemIcon>
                        <VpnKeyIcon fontSize="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="API key"/>
                </ListItemButton>}
            </List>
            <Divider />
        </Box>
    );
};
export default SideNavEnte;

/*

 <Box sx={{
            height: '100%',
            maxWidth: 360,
            backgroundColor: 'background.paper',
        }}
        >
            <List component="nav" aria-label="main piattaforma-notifiche sender">
                <><ListItemButton selected={selectedIndex === 0} onClick={() => handleListItemClick()}>
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
                </ListItemButton></>
                <ListItemButton selected={selectedIndex === 2} onClick={() => handleListItemClickNotifiche()}>
                    <ListItemIcon>
                        <MarkUnreadChatAltIcon fontSize="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Notifiche" />
                    {openContestazioni ? 
                        <IconButton onClick={()=> setOpenContestazioni(false)}  size="small">
                            <ExpandLess fontSize="inherit"  />
                        </IconButton>:
                        <IconButton onClick={()=> setOpenContestazioni(true)}  size="small">
                            <ExpandMore fontSize="inherit"  />
                        </IconButton>}
                </ListItemButton>
                <Collapse in={openContestazioni} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton selected={selectedIndex === 6} sx={{ pl: 4 }} onClick={() =>handleListItemClick(PathPf.STORICO_CONTEST_ENTE)}>
                            <ListItemIcon>
                                <GavelIcon />
                            </ListItemIcon>
                            <ListItemText primary="Contestazioni" />
                        </ListItemButton>
                    </List>
                </Collapse>
                <ListItemButton selected={selectedIndex === 3} onClick={() => handleListItemClickRel()}>
                    <ListItemIcon>
                        <ManageAccountsIcon fontSize="inherit" />
                    </ListItemIcon>
                   <ListItemText primary="Regolare esecuzione / Documenti di cortesia" />
                </ListItemButton>
                {mainData.apiKeyPage.visible &&
                <ListItemButton selected={selectedIndex === 5} onClick={() => handleListItemClickApiKey()}>
                    <ListItemIcon>
                        <VpnKeyIcon fontSize="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="API key"/>
                </ListItemButton>}
            </List>
            <Divider />
        </Box>
*/