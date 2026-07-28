import React from 'react';
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
import { useNavigate, useLocation } from "react-router-dom";
import DnsIcon from '@mui/icons-material/Dns';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import MarkUnreadChatAltIcon from '@mui/icons-material/MarkUnreadChatAlt';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { PathPf } from '../../types/enum';
import DownloadIcon from '@mui/icons-material/Download';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useGlobalStore } from '../../store/context/useGlobalStore';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PageviewIcon from '@mui/icons-material/Pageview';


const SideNavEnte: React.FC = () => {

  const mainState = useGlobalStore(state => state.mainState);
  const setOpenBasicModal_DatFat_ModCom = useGlobalStore(state => state.setOpenBasicModal_DatFat_ModCom);
  const mainData = useGlobalStore(state => state.mainData);
  const relIsVisible = mainState?.profilo?.idTipoContratto === 2;


    
  const navigate = useNavigate();
  const location = useLocation();
 
  //const [openContestazioni, setOpenContestazioni] = useState(false);
  const [openDocContabili, setOpenDocContabili] = useState(false);
    
  const handleListItemClick = async(pathToGo) => {
    if(pathToGo === PathPf.LISTA_COMMESSE && location.pathname !== PathPf.MODULOCOMMESSA_EN ){
      localStorage.setItem('redirectToInsert',JSON.stringify(true));
    }
    if(((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE_EN)||(mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA_EN))){
      setOpenBasicModal_DatFat_ModCom({visible:true,clickOn:pathToGo});
    }else if(location.pathname === PathPf.MODULOCOMMESSA_EN && pathToGo === PathPf.LISTA_COMMESSE){
      return;
    }else{
      navigate(pathToGo);
    } 
  };


  const currentLocation = location.pathname;

  
  useEffect(()=>{
    if(
      currentLocation === PathPf.DOCUMENTI_SOSPESI ||
         currentLocation === PathPf.DOCUMENTI_EMESSI ||
         currentLocation.includes("ente/fatturapdf/documentisospesi")||
         currentLocation.includes("ente/fatturapdf/documentiemessi")||
         currentLocation.includes("ente/fatturapdf/rel")){
      setOpenDocContabili(true);
    }
  },[]);


  return (
    <Box sx={{
      height: '100%',
      maxWidth: 360,
      backgroundColor: 'background.paper',
    }}
    >
      <List component="nav">
        <><ListItemButton selected={currentLocation === PathPf.DATI_FATTURAZIONE_EN } onClick={() => handleListItemClick(PathPf.DATI_FATTURAZIONE_EN)}>
          <ListItemIcon>
            <DnsIcon fontSize="inherit"></DnsIcon>
          </ListItemIcon>
          <ListItemText primary="Dati di fatturazione" />
        </ListItemButton>
        <ListItemButton selected={currentLocation === PathPf.LISTA_COMMESSE || currentLocation === PathPf.MODULOCOMMESSA_EN || currentLocation.includes(PathPf.PDF_COMMESSA_EN)} onClick={() =>handleListItemClick(PathPf.LISTA_COMMESSE)}>
          <ListItemIcon>
            <ViewModuleIcon fontSize="inherit" />
          </ListItemIcon>
          <ListItemText primary="Modulo commessa" />
        </ListItemButton></>
        <ListItemButton selected={currentLocation === PathPf.LISTA_NOTIFICHE_EN} onClick={() => handleListItemClick(PathPf.LISTA_NOTIFICHE_EN)}>
          <ListItemIcon>
            <MarkUnreadChatAltIcon fontSize="inherit" />
          </ListItemIcon>
          <ListItemText primary="Notifiche" />
        </ListItemButton>
        {relIsVisible && 
          <ListItemButton selected={currentLocation === PathPf.LISTA_REL_EN || currentLocation.includes("ente/fatturapdf/rel")} onClick={()=>handleListItemClick(PathPf.LISTA_REL_EN)}>
            <ListItemIcon>
              <ManageAccountsIcon fontSize="inherit" />
            </ListItemIcon>
            <Box className="ms-3" display="flex" flexDirection="column">
              <ListItemText primary="Regolare esecuzione /" />
              <ListItemText primary="Documenti di cortesia" />
            </Box>
          </ListItemButton>
        }
        <ListItemButton selected={false} onClick={()=>{
          setOpenDocContabili(true);
          handleListItemClick(PathPf.DOCUMENTI_SOSPESI);}}>
          <ListItemIcon>
            <PageviewIcon fontSize="inherit" />
          </ListItemIcon>
          <ListItemText primary="Documenti contabili" />
          {openDocContabili ? 
            <IconButton onClick={(e)=> {
              e.stopPropagation();
              setOpenDocContabili(false);
            }}  size="small">
              <ExpandLess fontSize="inherit"  />
            </IconButton>:
            <IconButton onClick={(e)=>{
              e.stopPropagation();
              setOpenDocContabili(true);
            } }  size="small">
              <ExpandMore fontSize="inherit"  />
            </IconButton>}
        </ListItemButton>
        <Collapse in={openDocContabili} timeout="auto" unmountOnExit>
          <ListItemButton sx={{ pl: 4 }} selected={currentLocation === PathPf.DOCUMENTI_SOSPESI || currentLocation.includes("ente/fatturapdf/documentisospesi")} onClick={()=>handleListItemClick(PathPf.DOCUMENTI_SOSPESI)}>
            <ListItemIcon>
              <FileCopyIcon fontSize="inherit" />
            </ListItemIcon>
            <Box className="ms-3" display="flex" flexDirection="column">
              <ListItemText primary="Documenti contabili sospesi" />
            </Box>
          </ListItemButton>
          <ListItemButton sx={{ pl: 4 }} selected={currentLocation === PathPf.DOCUMENTI_EMESSI || currentLocation.includes("ente/fatturapdf/documentiemessi")} onClick={()=>handleListItemClick(PathPf.DOCUMENTI_EMESSI)}>
            <ListItemIcon>
              <DescriptionIcon fontSize="inherit" />
            </ListItemIcon>
            <Box className="ms-3" display="flex" flexDirection="column">
              <ListItemText primary="Documenti contabili emessi" />
            </Box>
          </ListItemButton>
        </Collapse>
        <ListItemButton selected={currentLocation === PathPf.ASYNC_DOCUMENTI_ENTE} onClick={() => handleListItemClick(PathPf.ASYNC_DOCUMENTI_ENTE)}>
          <ListItemIcon>
            <DownloadIcon fontSize="inherit"/>
          </ListItemIcon>
          <ListItemText primary="Download documenti"/>
        </ListItemButton>
        {mainData.apiKeyPage.visible &&
          <ListItemButton selected={currentLocation === PathPf.API_KEY_ENTE} onClick={() => handleListItemClick(PathPf.API_KEY_ENTE)}>
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