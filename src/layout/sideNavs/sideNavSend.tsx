import React, { useContext } from 'react';
import { useState, useEffect } from 'react';
import {
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Box,
    Divider,
    Collapse,
    IconButton
} from '@mui/material';
import { useNavigate, useLocation, Outlet } from "react-router-dom";
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
import GavelIcon from '@mui/icons-material/Gavel';
import DvrIcon from '@mui/icons-material/Dvr';
import BatchPredictionIcon from '@mui/icons-material/BatchPrediction';


const SideNavSend : React.FC = () => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState,setOpenBasicModal_DatFat_ModCom} = globalContextObj;
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);
    const [openContestazioni, setOpenContestazioni] = useState(false);
    const [openModPrevisonale, setOpenModPrevisonale] = useState(false);
    
    
    const handleListItemClick = async(pathToGo) => {
        if(((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)||(mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA))){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:pathToGo}}));
        }else{
            navigate(pathToGo);
        } 
    };
    
    const currentLocation = location.pathname;

    useEffect(()=>{
        console.log({currentLocation});
        if(currentLocation === PathPf.DATI_FATTURAZIONE){
            setSelectedIndex(0);
        }else if(currentLocation === PathPf.MODULOCOMMESSA){
            setSelectedIndex(1);
        }else if(currentLocation === PathPf.LISTA_MODULICOMMESSA){
            if( mainState.infoTrimestreComSelected?.from === PathPf.LISTA_MODULICOMMESSA_PREVISONALE){
                setSelectedIndex(12);
            }else{
                setSelectedIndex(1);
            }
            
        }else if(currentLocation === PathPf.LISTA_DATI_FATTURAZIONE){
            setSelectedIndex(0);
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
        }else if(currentLocation === "messaggi"){
            setSelectedIndex(null);
        }else if(currentLocation === PathPf.ACCERTAMENTI){
            setSelectedIndex(7);
        }else if(currentLocation === PathPf.TIPOLOGIA_CONTRATTO){
            setSelectedIndex(8);
            setOpen(true);
        }else if(currentLocation === PathPf.LISTA_DOC_EMESSI){
            setSelectedIndex(9);
            setOpen2(true);
        }else if(currentLocation === PathPf.JSON_TO_SAP){
            setSelectedIndex(5);
        }else if(currentLocation.toLowerCase().includes("/inviofatturedettaglio/")){
            setSelectedIndex(5);
        }else if(currentLocation === PathPf.STORICO_CONTEST || currentLocation === PathPf.STORICO_DETTAGLIO_CONTEST|| currentLocation === PathPf.INSERIMENTO_CONTESTAZIONI){
            setOpenContestazioni(true);
            setSelectedIndex(10);
        }else if(currentLocation === PathPf.ORCHESTRATORE){
            setSelectedIndex(11);
        }else if(currentLocation === PathPf.LISTA_MODULICOMMESSA_PREVISONALE ){
            setSelectedIndex(12);
        }

        if(open2 && (currentLocation !== PathPf.LISTA_DOC_EMESSI && currentLocation !== PathPf.FATTURAZIONE)){
            setOpen2(false);
        }
        if(open && (currentLocation !== PathPf.TIPOLOGIA_CONTRATTO && currentLocation !== PathPf.LISTA_DATI_FATTURAZIONE)){
            setOpen(false);
        }
        if(openContestazioni && (currentLocation !== PathPf.STORICO_CONTEST && currentLocation !== PathPf.LISTA_NOTIFICHE && currentLocation !== PathPf.STORICO_DETTAGLIO_CONTEST && currentLocation !== PathPf.INSERIMENTO_CONTESTAZIONI )){
            setOpenContestazioni(false);
        }
        if(openModPrevisonale && (currentLocation !== PathPf.LISTA_MODULICOMMESSA_PREVISONALE && currentLocation !== PathPf.LISTA_MODULICOMMESSA && currentLocation !== PathPf.MODULOCOMMESSA )){
            setOpenModPrevisonale(false);
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
                <ListItemButton selected={selectedIndex === 0} onClick={() => handleListItemClick(PathPf.LISTA_DATI_FATTURAZIONE)}>
                    <ListItemIcon>
                        <DnsIcon fontSize="inherit"></DnsIcon>
                    </ListItemIcon>
                    <ListItemText primary="Dati di fatturazione" />
                    {open ? 
                        <IconButton onClick={(e)=>{
                            e.stopPropagation();
                            setOpen(false);
                        } }  size="small">
                            <ExpandLess fontSize="inherit" />
                        </IconButton>  :
                        <IconButton  onClick={(e)=>{
                            e.stopPropagation();
                            setOpen(true);
                        } }  size="small">
                            <ExpandMore fontSize="inherit"/>
                        </IconButton> }
                </ListItemButton>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton selected={selectedIndex === 8} sx={{ pl: 4 }} onClick={() =>handleListItemClick(PathPf.TIPOLOGIA_CONTRATTO)}>
                            <ListItemIcon>
                                <FormatAlignCenterIcon fontSize="inherit" />
                            </ListItemIcon>
                            <ListItemText primary="Tipologia contratto" />
                        </ListItemButton>
                    </List>
                </Collapse>
                <ListItemButton selected={selectedIndex === 12} onClick={() => handleListItemClick(PathPf.LISTA_MODULICOMMESSA_PREVISONALE)}>
                    <ListItemIcon>
                        <BatchPredictionIcon fontSize="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Modulo commessa previsionale" />
                    {openModPrevisonale ? 
                        <IconButton onClick={(e)=> {
                            e.stopPropagation();
                            setOpenModPrevisonale(false);
                        }}  size="small">
                            <ExpandLess fontSize="inherit"  />
                        </IconButton>:
                        <IconButton onClick={(e)=>{
                            e.stopPropagation();
                            setOpenModPrevisonale(true);
                        } }  size="small">
                            <ExpandMore fontSize="inherit"  />
                        </IconButton>}
                </ListItemButton>
                <Collapse in={openModPrevisonale} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton selected={selectedIndex === 1} sx={{ pl: 4 }} onClick={() => handleListItemClick(PathPf.LISTA_MODULICOMMESSA)}>
                            <ListItemIcon>
                                <ViewModuleIcon fontSize="inherit" />
                            </ListItemIcon>
                            <ListItemText primary="Modulo commessa fatturabile" />
                        </ListItemButton>
                    </List>
                </Collapse>
                <ListItemButton selected={selectedIndex === 2} onClick={() => handleListItemClick(PathPf.LISTA_NOTIFICHE)}>
                    <ListItemIcon>
                        <MarkUnreadChatAltIcon fontSize="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Notifiche" />
                    {openContestazioni ? 
                        <IconButton onClick={(e)=> {
                            e.stopPropagation();
                            setOpenContestazioni(false);
                        }}  size="small">
                            <ExpandLess fontSize="inherit"  />
                        </IconButton>:
                        <IconButton onClick={(e)=>{
                            e.stopPropagation();
                            setOpenContestazioni(true);
                        } }  size="small">
                            <ExpandMore fontSize="inherit"  />
                        </IconButton>}
                </ListItemButton>
                <Collapse in={openContestazioni} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton selected={selectedIndex === 10} sx={{ pl: 4 }} onClick={() => handleListItemClick(PathPf.STORICO_CONTEST)}>
                            <ListItemIcon>
                                <GavelIcon />
                            </ListItemIcon>
                            <ListItemText primary="Contestazioni" />
                        </ListItemButton>
                    </List>
                </Collapse>
                <ListItemButton selected={selectedIndex === 3} onClick={() => handleListItemClick(PathPf.LISTA_REL)}>
                    <ListItemIcon>
                        <ManageAccountsIcon fontSize="inherit" />
                    </ListItemIcon>
                    <Box className="ms-3" display="flex" flexDirection="column">
                        <ListItemText primary="Regolare esecuzione /" />
                        <ListItemText primary="Documenti di cortesia" />
                    </Box>
                </ListItemButton>
                <ListItemButton selected={selectedIndex === 4} onClick={() => handleListItemClick(PathPf.ADESIONE_BANDO)}>
                    <ListItemIcon>
                        <AnnouncementIcon fontSize="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Adesione al bando" />
                </ListItemButton>
                <ListItemButton selected={selectedIndex === 5} onClick={() => handleListItemClick(PathPf.FATTURAZIONE)}>
                    <ListItemIcon>
                        <ReceiptIcon fontSize="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Documenti emessi" />
                    {open2 ? 
                        <IconButton onClick={(e)=>{
                            e.stopPropagation();
                            setOpen2(false);
                        } }  size="small">
                            <ExpandLess fontSize="inherit" />
                        </IconButton>  :
                        <IconButton  onClick={(e)=>{
                            e.stopPropagation();
                            setOpen2(true);
                        } }  size="small">
                            <ExpandMore fontSize="inherit"/>
                        </IconButton>}
                </ListItemButton> 
                <Collapse in={open2} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton selected={selectedIndex === 9} sx={{ pl: 4 }} onClick={() => handleListItemClick(PathPf.LISTA_DOC_EMESSI)}>
                            <ListItemIcon>
                                <FormatListBulletedIcon fontSize="inherit" />
                            </ListItemIcon>
                            <ListItemText primary="White list" />
                        </ListItemButton>
                    </List>
                </Collapse> 
                <ListItemButton selected={selectedIndex === 7} onClick={() => handleListItemClick("accertamenti")}>
                    <ListItemIcon>
                        <ManageSearchIcon fontSize="inherit"></ManageSearchIcon>
                    </ListItemIcon>
                    <ListItemText primary="Documenti contabili" />
                </ListItemButton>
                <ListItemButton selected={selectedIndex === 11} onClick={() => handleListItemClick(PathPf.ORCHESTRATORE)}>
                    <ListItemIcon>
                        <DvrIcon fontSize="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Monitoring" />
                </ListItemButton>
            </List>
            <Divider />
        </Box>
    );
};
export default SideNavSend;