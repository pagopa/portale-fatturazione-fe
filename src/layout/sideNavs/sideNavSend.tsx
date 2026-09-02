import React, { useEffect } from 'react';
import { useState } from 'react';
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
import AnnouncementIcon from '@mui/icons-material/Announcement';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { PathPf } from '../../types/enum';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GavelIcon from '@mui/icons-material/Gavel';
import DvrIcon from '@mui/icons-material/Dvr';
import BatchPredictionIcon from '@mui/icons-material/BatchPrediction';
import { useGlobalStore } from '../../store/context/useGlobalStore';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DescriptionIcon from '@mui/icons-material/Description';
import SendIcon from '@mui/icons-material/Send';

const SideNavSend : React.FC = () => {

  const mainState = useGlobalStore(state => state.mainState);
  const setOpenBasicModal_DatFat_ModCom = useGlobalStore(state => state.setOpenBasicModal_DatFat_ModCom);
   
  const navigate = useNavigate();
  const location = useLocation();
  const currentLocation = location.pathname;

  const [openSezioneDatiFatturazione, setOpenSezioneDatiFatturazione] = useState(false);
  const [openSezioneFatturazione, setOpenSezioneFatturazione] = useState(false);
  const [openContestazioni, setOpenContestazioni] = useState(false);
  const [openModPrevisonale, setOpenModPrevisonale] = useState(false);


  useEffect(()=>{
    if(currentLocation === PathPf.TIPOLOGIA_CONTRATTO || currentLocation === PathPf.DATI_FATTURAZIONE){
      setOpenSezioneDatiFatturazione(true);
    }else if(
      currentLocation === PathPf.DOCUMENTI_SOSPESI_SEND ||
       currentLocation === PathPf.FATTURAZIONE ||
       currentLocation === PathPf.GESTIONE_FATTURE ||
       currentLocation === PathPf.JSON_TO_SAP ||
       currentLocation === PathPf.JSON_TO_SAP_DETAILS ||
       currentLocation.includes("send/fatturapdf/documentisospesi")||
       currentLocation.includes("send/fatturapdf/documentiemessi")||
       currentLocation.includes("send/fatturapdf/rel")){
      setOpenSezioneFatturazione(true);
    }else if(currentLocation === PathPf.STORICO_CONTEST || currentLocation === PathPf.STORICO_DETTAGLIO_CONTEST || currentLocation === PathPf.INSERIMENTO_CONTESTAZIONI){
      setOpenContestazioni(true);
    }else if(currentLocation === PathPf.LISTA_MODULICOMMESSA || currentLocation === PathPf.MODULOCOMMESSA || currentLocation === PathPf.PDF_COMMESSA){
      setOpenModPrevisonale(true);
    }
  },[]);
    
    
  const handleListItemClick = async(pathToGo) => {
    if(((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)||(mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA))){
      setOpenBasicModal_DatFat_ModCom({visible:true,clickOn:pathToGo});
    }else{
      navigate(pathToGo);
    } 
  };
    
  return (
    <Box sx={{
      height: '100%',
      maxWidth: 360,
      backgroundColor: 'background.paper',
    }}
    >
      <List component="nav" aria-label="main piattaforma-notifiche sender">
        <ListItemButton selected={currentLocation === PathPf.LISTA_DATI_FATTURAZIONE || currentLocation === PathPf.DATI_FATTURAZIONE} onClick={() => handleListItemClick(PathPf.LISTA_DATI_FATTURAZIONE)}>
          <ListItemIcon>
            <DnsIcon fontSize="inherit"></DnsIcon>
          </ListItemIcon>
          <ListItemText primary="Dati di fatturazione" />
          {openSezioneDatiFatturazione  ? 
            <IconButton onClick={(e)=>{
              e.stopPropagation();
              setOpenSezioneDatiFatturazione(false);
             
            } }  size="small">
              <ExpandLess fontSize="inherit" />
            </IconButton>  :
            <IconButton  onClick={(e)=>{
              e.stopPropagation();
              setOpenSezioneDatiFatturazione(true);
             
              setOpenSezioneFatturazione(false);
              setOpenContestazioni(false);
              setOpenModPrevisonale(false);
            } }  size="small">
              <ExpandMore fontSize="inherit"/>
            </IconButton> }
        </ListItemButton>
        <Collapse in={openSezioneDatiFatturazione} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton selected={currentLocation === PathPf.TIPOLOGIA_CONTRATTO} sx={{ pl: 4 }} onClick={() =>handleListItemClick(PathPf.TIPOLOGIA_CONTRATTO)}>
              <ListItemIcon>
                <FormatAlignCenterIcon fontSize="inherit" />
              </ListItemIcon>
              <ListItemText primary="Tipologia contratto" />
            </ListItemButton>
          </List>
        </Collapse>
        <ListItemButton 
          selected={
            currentLocation === PathPf.LISTA_MODULICOMMESSA_PREVISONALE ||
            ((currentLocation === PathPf.MODULOCOMMESSA || currentLocation === PathPf.PDF_COMMESSA) && mainState.infoTrimestreComSelected.from === "/send/listacommessaprevisionale")} 
          onClick={() => handleListItemClick(PathPf.LISTA_MODULICOMMESSA_PREVISONALE)}>
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
              setOpenSezioneDatiFatturazione(false);
              setOpenSezioneFatturazione(false);
              setOpenContestazioni(false);
            } }  size="small">
              <ExpandMore fontSize="inherit"  />
            </IconButton>}
        </ListItemButton>
        <Collapse in={openModPrevisonale} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton 
              selected={
                currentLocation === PathPf.LISTA_MODULICOMMESSA ||
              ((currentLocation === PathPf.MODULOCOMMESSA || currentLocation === PathPf.PDF_COMMESSA) && mainState.infoTrimestreComSelected.from === "/send/listamodulicommessa")} sx={{ pl: 4 }} onClick={() => handleListItemClick(PathPf.LISTA_MODULICOMMESSA)}>
              <ListItemIcon>
                <ViewModuleIcon fontSize="inherit" />
              </ListItemIcon>
              <ListItemText primary="Modulo commessa fatturabile" />
            </ListItemButton>
          </List>
        </Collapse>
        <ListItemButton 
          selected={currentLocation === PathPf.LISTA_NOTIFICHE} onClick={() => handleListItemClick(PathPf.LISTA_NOTIFICHE)}>
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
              setOpenSezioneDatiFatturazione(false);
              setOpenSezioneFatturazione(false);
              setOpenModPrevisonale(false);
            } }  size="small">
              <ExpandMore fontSize="inherit"  />
            </IconButton>}
        </ListItemButton>
        <Collapse in={openContestazioni} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton 
              selected={
                currentLocation === PathPf.STORICO_CONTEST ||
               currentLocation === PathPf.STORICO_DETTAGLIO_CONTEST ||
                currentLocation === PathPf.INSERIMENTO_CONTESTAZIONI
              } sx={{ pl: 4 }} onClick={() => handleListItemClick(PathPf.STORICO_CONTEST)}>
              <ListItemIcon>
                <GavelIcon />
              </ListItemIcon>
              <ListItemText primary="Contestazioni" />
            </ListItemButton>
          </List>
        </Collapse>
        <ListItemButton
          selected={
            currentLocation === PathPf.LISTA_REL || currentLocation.includes("send/fatturapdf/rel")
          } 
          onClick={() => handleListItemClick(PathPf.LISTA_REL)}>
          <ListItemIcon>
            <ManageAccountsIcon fontSize="inherit" />
          </ListItemIcon>
          <Box className="ms-3" display="flex" flexDirection="column">
            <ListItemText primary="Regolare esecuzione /" />
            <ListItemText primary="Documenti di cortesia" />
          </Box>
        </ListItemButton>
        <ListItemButton selected={currentLocation === PathPf.ADESIONE_BANDO} onClick={() => handleListItemClick(PathPf.ADESIONE_BANDO)}>
          <ListItemIcon>
            <AnnouncementIcon fontSize="inherit" />
          </ListItemIcon>
          <ListItemText primary="Adesione al bando" />
        </ListItemButton>
        <ListItemButton selected={currentLocation === PathPf.LISTA_STORICO_DOCUMENTI_SEND} onClick={() => handleListItemClick(PathPf.LISTA_STORICO_DOCUMENTI_SEND)}>
          <ListItemIcon>
            <ReceiptIcon fontSize="inherit" />
          </ListItemIcon>
          <ListItemText primary="Report Documenti contabili" />
          {openSezioneFatturazione ? 
            <IconButton onClick={(e)=>{
              e.stopPropagation();
              setOpenSezioneFatturazione(false);
            } }  size="small">
              <ExpandLess fontSize="inherit" />
            </IconButton>  :
            <IconButton  onClick={(e)=>{
              e.stopPropagation();
              setOpenSezioneFatturazione(true);
              setOpenSezioneDatiFatturazione(false);
              setOpenContestazioni(false);
              setOpenModPrevisonale(false);
            } }  size="small">
              <ExpandMore fontSize="inherit"/>
            </IconButton>}
        </ListItemButton> 
        <Collapse in={openSezioneFatturazione} timeout="auto" unmountOnExit>
          <ListItemButton sx={{ pl: 4 }} 
            selected={
              currentLocation === PathPf.DOCUMENTI_SOSPESI_SEND || currentLocation.includes("send/fatturapdf/documentisospesi")
            } 
            onClick={()=> handleListItemClick(PathPf.DOCUMENTI_SOSPESI_SEND)}>
            <ListItemIcon>
              <FileCopyIcon fontSize="inherit" />
            </ListItemIcon>
            <Box className="ms-3" display="flex" flexDirection="column">
              <ListItemText primary="Documenti contabili sospesi" />
            </Box>
          </ListItemButton>
          <ListItemButton sx={{ pl: 4 }} 
            selected={
              currentLocation === PathPf.FATTURAZIONE || 
              currentLocation.includes("send/fatturapdf/documentiemessi") //||
              //currentLocation.includes(PathPf.JSON_TO_SAP)
            } 
            onClick={()=> handleListItemClick(PathPf.FATTURAZIONE)}>
            <ListItemIcon>
              <DescriptionIcon fontSize="inherit" />
            </ListItemIcon>
            <Box className="ms-3" display="flex" flexDirection="column">
              <ListItemText primary="Documenti contabili emessi" />
            </Box>
          </ListItemButton>
          <List component="div" disablePadding>
            <ListItemButton selected={currentLocation === PathPf.GESTIONE_FATTURE} sx={{ pl: 4 }} onClick={() => handleListItemClick(PathPf.GESTIONE_FATTURE)}>
              <ListItemIcon>
                <FormatListBulletedIcon fontSize="inherit" />
              </ListItemIcon>
              <ListItemText primary="Gestione Fatture" />
            </ListItemButton>
          </List>
          <List component="div" disablePadding>
            <ListItemButton selected={currentLocation === PathPf.JSON_TO_SAP} sx={{ pl: 4 }} onClick={() => handleListItemClick(PathPf.JSON_TO_SAP)}>
              <ListItemIcon>
                <SendIcon fontSize="inherit" />
              </ListItemIcon>
              <ListItemText primary="Generazione JSON" />
            </ListItemButton>
          </List>
        </Collapse> 
        <ListItemButton selected={currentLocation === "/send/accertamenti"} onClick={() => handleListItemClick("/send/accertamenti")}>
          <ListItemIcon>
            <ManageSearchIcon fontSize="inherit"></ManageSearchIcon>
          </ListItemIcon>
          <ListItemText primary="Documenti contabili" />
        </ListItemButton>
        <ListItemButton selected={currentLocation === PathPf.ORCHESTRATORE} onClick={() => handleListItemClick(PathPf.ORCHESTRATORE)}>
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