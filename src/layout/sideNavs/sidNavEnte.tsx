import React, { useContext } from 'react';
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
    
    const handleListItemClick = async() => {
        if(((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)||(mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA))){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.DATI_FATTURAZIONE}}));
        }else{
            navigate(PathPf.DATI_FATTURAZIONE);
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
        if(mainState.inserisciModificaCommessa === 'INSERT'&& location.pathname === PathPf.MODULOCOMMESSA){
            console.log('il nulla');
        }else if((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)|| (mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA)){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.LISTA_COMMESSE}}));
        }else{
            //cliccando sulla side nav Modulo commessa e sono un ente qualsiasi
            await getDatiFat();
            await getDatiModuloCommessa(token, profilo.nonce).then((res)=>{
                if(res.data.modifica === true && res.data.moduliCommessa.length === 0 ){
                    handleModifyMainState({
                        inserisciModificaCommessa:'INSERT',
                        statusPageInserimentoCommessa:'mutable',
                        userClickOn:undefined,
                        primoInserimetoCommessa:true,
                        mese:res.data.mese,
                        anno:res.data.anno,
                    });
                    navigate(PathPf.MODULOCOMMESSA);
                }else if(res.data.modifica === true && res.data.moduliCommessa.length > 0 ){
                    handleModifyMainState({
                        inserisciModificaCommessa:'MODIFY',
                        statusPageInserimentoCommessa:'immutable',
                        primoInserimetoCommessa:false});
                    navigate(PathPf.LISTA_COMMESSE);
                }else if(res.data.modifica === false && res.data.moduliCommessa.length === 0){
                    handleModifyMainState({
                        inserisciModificaCommessa:'NO_ACTION',
                        statusPageInserimentoCommessa:'immutable',
                        primoInserimetoCommessa:false});
                    navigate(PathPf.LISTA_COMMESSE);
                }else if(res.data.modifica === false && res.data.moduliCommessa.length > 0){
                    handleModifyMainState({
                        inserisciModificaCommessa:'NO_ACTION',
                        statusPageInserimentoCommessa:'immutable',
                        primoInserimetoCommessa:false}); 
                    navigate(PathPf.LISTA_COMMESSE);
                }
            }).catch((err) =>{
                manageError(err,dispatchMainState);
            });
        }
    };

    const handleListItemClickNotifiche = () => {
        if((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)||(mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA)){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.LISTA_NOTIFICHE}}));
        }else{
            navigate(PathPf.LISTA_NOTIFICHE);
        }
    };

    const handleListItemClickRel = async () => {
        if((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)||(mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA)){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.LISTA_REL}}));
        }else{
            navigate(PathPf.LISTA_REL);
        }
    };

    const handleListItemClickApiKey = async () => {
        if((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)||(mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA)){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.API_KEY_ENTE}}));
        }else{
            navigate(PathPf.API_KEY_ENTE);
        }
    };

    const handleListItemClickContestazioni = () =>{
        if((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)||(mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA)){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.STORICO_CONTEST_ENTE}}));
        }else{
            navigate(PathPf.STORICO_CONTEST_ENTE);
        }
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
                        <ListItemButton selected={selectedIndex === 6} sx={{ pl: 4 }} onClick={handleListItemClickContestazioni}>
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
                    <ListItemText primary="Regolare esecuzione" />
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
    );
};
export default SideNavEnte;