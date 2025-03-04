import React, { useContext } from 'react';
import { useState, useEffect } from 'react';
import {
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Box,
    Divider,
    Collapse
} from '@mui/material';
import { useNavigate, useLocation } from "react-router-dom";
import DnsIcon from '@mui/icons-material/Dns';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import MarkUnreadChatAltIcon from '@mui/icons-material/MarkUnreadChatAlt';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { GlobalContext } from '../../store/context/globalContext';
import { PathPf } from '../../types/enum';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';


const SideNavSend : React.FC = () => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState,setOpenBasicModal_DatFat_ModCom} = globalContextObj;
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);
    
    const handleListItemClick = async() => {
        if(((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)|| (mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA))){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.LISTA_DATI_FATTURAZIONE}}));
        }else{  
            navigate(PathPf.LISTA_DATI_FATTURAZIONE); 
        }
    };

    const handleListItemClickModuloCommessa = async () => {
        if(((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)|| (mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA))){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.LISTA_MODULICOMMESSA}}));
        }else if((mainState.statusPageDatiFatturazione === 'immutable'|| (mainState.statusPageInserimentoCommessa === 'immutable' && location.pathname === PathPf.MODULOCOMMESSA))){
            navigate(PathPf.LISTA_MODULICOMMESSA);
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

    const handleListItemClickBando = async () => {
        if((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)||(mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA)){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.ADESIONE_BANDO}}));
        }else{
            navigate(PathPf.ADESIONE_BANDO);
        }
    }; 

    const handleListItemClickFatturazione = () =>{
        if((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)||(mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA)){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.FATTURAZIONE}}));
        }else{
            navigate(PathPf.FATTURAZIONE);
        }
    };

    const handleListItemClickAccertamenti = () =>{
        if((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)||(mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA)){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.FATTURAZIONE}}));
        }else{
            navigate("/accertamenti");
        }
    };

    const handleListItemClickTiplogiaContratto = () =>{
        if((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)||(mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA)){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.FATTURAZIONE}}));
        }else{
            navigate(PathPf.TIPOLOGIA_CONTRATTO);
        }
    };

    const handleListItemClickListDocEmessi = () =>{
        if((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)||(mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA)){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.FATTURAZIONE}}));
        }else{
            navigate(PathPf.LISTA_DOC_EMESSI);
        }
    };
    
    const currentLocation = location.pathname;

    useEffect(()=>{
        if(currentLocation === PathPf.DATI_FATTURAZIONE){
            setSelectedIndex(0);
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
        }else if(currentLocation === PathPf.ADESIONE_BANDO){
            setSelectedIndex(4);
        }else if(currentLocation === PathPf.FATTURAZIONE){
            setSelectedIndex(5);
        }else if(currentLocation === "/messaggi"){
            setSelectedIndex(null);
        }else if(currentLocation === "/accertamenti"){
            setSelectedIndex(7);
        }else if(currentLocation === PathPf.TIPOLOGIA_CONTRATTO){
            setSelectedIndex(8);
            setOpen(true);
        }else if(currentLocation === PathPf.LISTA_DOC_EMESSI){
            setSelectedIndex(9);
            setOpen2(true);
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
                <ListItemButton selected={selectedIndex === 0} onClick={() => handleListItemClick()}>
                    <ListItemIcon>
                        <DnsIcon fontSize="inherit"></DnsIcon>
                    </ListItemIcon>
                    <ListItemText primary="Dati di fatturazione" />
                    {open ? <ExpandLess onClick={()=> setOpen(false)} /> : <ExpandMore onClick={()=> setOpen(true)} />}
                </ListItemButton>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton selected={selectedIndex === 8} sx={{ pl: 4 }} onClick={() =>handleListItemClickTiplogiaContratto()}>
                            <ListItemIcon>
                                <FormatAlignCenterIcon />
                            </ListItemIcon>
                            <ListItemText primary="Tipologia contratto" />
                        </ListItemButton>
                    </List>
                </Collapse>
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
                <ListItemButton selected={selectedIndex === 3} onClick={() => handleListItemClickRel()}>
                    <ListItemIcon>
                        <ManageAccountsIcon fontSize="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Regolare esecuzione" />
                </ListItemButton>
                <ListItemButton selected={selectedIndex === 4} onClick={() => handleListItemClickBando()}>
                    <ListItemIcon>
                        <AnnouncementIcon fontSize="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Adesione al bando" />
                </ListItemButton>
                <ListItemButton selected={selectedIndex === 5} onClick={() => handleListItemClickFatturazione()}>
                    <ListItemIcon>
                        <ReceiptIcon fontSize="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Documenti emessi" />
                    {open2 ? <ExpandLess onClick={()=> setOpen2(false)} /> : <ExpandMore onClick={()=> setOpen2(true)} />}
                </ListItemButton> 
                <Collapse in={open2} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton selected={selectedIndex === 9} sx={{ pl: 4 }} onClick={() => handleListItemClickListDocEmessi()}>
                            <ListItemIcon>
                                <FormatListBulletedIcon />
                            </ListItemIcon>
                            <ListItemText primary="White list" />
                        </ListItemButton>
                    </List>
                </Collapse> 
                <ListItemButton selected={selectedIndex === 7} onClick={() => handleListItemClickAccertamenti()}>
                    <ListItemIcon>
                        <ManageSearchIcon fontSize="inherit"></ManageSearchIcon>
                    </ListItemIcon>
                    <ListItemText primary="Documenti contabili" />
                </ListItemButton>
            </List>
            <Divider />
        </Box>
    );
};
export default SideNavSend;