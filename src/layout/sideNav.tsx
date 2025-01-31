import React, { useContext } from 'react';
import { useState, useEffect } from 'react';
import {
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Box,
    Divider
} from '@mui/material';
import { useNavigate, useLocation } from "react-router-dom";
import DnsIcon from '@mui/icons-material/Dns';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import MarkUnreadChatAltIcon from '@mui/icons-material/MarkUnreadChatAlt';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import YoutubeSearchedForIcon from '@mui/icons-material/YoutubeSearchedFor';
import { manageError } from '../api/api';
import { getDatiFatturazione } from '../api/apiSelfcare/datiDiFatturazioneSE/api';
import { getDatiModuloCommessa } from '../api/apiSelfcare/moduloCommessaSE/api';
import { profiliEnti } from '../reusableFunction/actionLocalStorage';
import { PathPf } from '../types/enum';
import { GlobalContext } from '../store/context/globalContext';


const SideNavComponent: React.FC = () => {

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState,setOpenBasicModal_DatFat_ModCom} = globalContextObj;

    const navigate = useNavigate();
    const location = useLocation();
    const enti = profiliEnti(mainState);
  

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };




    const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
    
    const handleListItemClick = async() => {
        
        if(((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)|| (mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA)) && profilo.auth === 'PAGOPA'){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.LISTA_DATI_FATTURAZIONE}}));
   
        }else if(((mainState.statusPageDatiFatturazione === 'immutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)|| (mainState.statusPageInserimentoCommessa === 'immutable' && location.pathname === PathPf.MODULOCOMMESSA)) && profilo.auth === 'PAGOPA'){
           
            navigate(PathPf.LISTA_DATI_FATTURAZIONE);
            
        }else if(((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)|| (mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA)) && enti){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.DATI_FATTURAZIONE}}));
          
        }else if(profilo.auth === 'PAGOPA'){
            localStorage.removeItem("filtersModuliCommessa");
            localStorage.removeItem("pageRowListaModuliCommessa");
            localStorage.removeItem("filtersRel");
            localStorage.removeItem("filtersNotifiche");
            navigate(PathPf.LISTA_DATI_FATTURAZIONE);
            
        }else if(enti){
            localStorage.removeItem("filtersModuliCommessa");
            localStorage.removeItem("pageRowListaModuliCommessa");
            localStorage.removeItem("filtersRel");
            localStorage.removeItem("filtersNotifiche");
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
        if(((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)|| (mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA))&& profilo.auth === 'PAGOPA'){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.LISTA_MODULICOMMESSA}}));
        }else if((mainState.statusPageDatiFatturazione === 'immutable'|| (mainState.statusPageInserimentoCommessa === 'immutable' && location.pathname === PathPf.MODULOCOMMESSA)) && profilo.auth === 'PAGOPA'){
            navigate(PathPf.LISTA_MODULICOMMESSA);
            localStorage.removeItem("filtersRel");
            localStorage.removeItem("filtersListaDatiFatturazione");
            localStorage.removeItem("pageRowListaDatiFatturazione");
            localStorage.removeItem("filtersNotifiche");
        }else if((mainState.inserisciModificaCommessa === 'INSERT'&& location.pathname === PathPf.MODULOCOMMESSA) && enti){
            console.log('il nulla');
        }else if(((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)|| (mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA)) && enti){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.LISTA_COMMESSE}}));
        }else if(enti){
            //cliccando sulla side nav Modulo commessa e sono un ente qualsiasi
            localStorage.removeItem("filtersRel");
            localStorage.removeItem("filtersListaDatiFatturazione");
            localStorage.removeItem("pageRowListaDatiFatturazione");
            localStorage.removeItem("filtersNotifiche");
            
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
            localStorage.removeItem("filtersModuliCommessa");
            localStorage.removeItem("pageRowListaModuliCommessa");
            localStorage.removeItem("filtersRel");
            localStorage.removeItem("filtersListaDatiFatturazione");
            localStorage.removeItem("pageRowListaDatiFatturazione");
            navigate(PathPf.LISTA_NOTIFICHE);
        }
    };

    const handleListItemClickRel = async () => {
        if((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)||(mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA)){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.LISTA_REL}}));
        }else{
            localStorage.removeItem("filtersModuliCommessa");
            localStorage.removeItem("pageRowListaModuliCommessa");
            localStorage.removeItem("filtersListaDatiFatturazione");
            localStorage.removeItem("pageRowListaDatiFatturazione");
            localStorage.removeItem("filtersNotifiche");
            navigate(PathPf.LISTA_REL);
        }
    };

    const handleListItemClickBando = async () => {
        if((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)||(mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA)){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.ADESIONE_BANDO}}));
        }else{
            localStorage.removeItem("filtersRel");
            localStorage.removeItem("filtersListaDatiFatturazione");
            localStorage.removeItem("pageRowListaDatiFatturazione");
            localStorage.removeItem("filtersNotifiche");
            localStorage.removeItem("filtersModuliCommessa");
            localStorage.removeItem("pageRowListaModuliCommessa");
            navigate(PathPf.ADESIONE_BANDO);
        }
    }; 

    const handleListItemClickFatturazione = () =>{
        if((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)||(mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA)){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.FATTURAZIONE}}));
        }else{
            localStorage.removeItem("filtersRel");
            localStorage.removeItem("filtersListaDatiFatturazione");
            localStorage.removeItem("pageRowListaDatiFatturazione");
            localStorage.removeItem("filtersNotifiche");
            localStorage.removeItem("filtersModuliCommessa");
            localStorage.removeItem("pageRowListaModuliCommessa");
            navigate(PathPf.FATTURAZIONE);
        }
        
    };

    const handleListItemClickStorico = () =>{
        if((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)||(mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA)){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.FATTURAZIONE}}));
        }else{
            localStorage.removeItem("filtersRel");
            localStorage.removeItem("filtersListaDatiFatturazione");
            localStorage.removeItem("pageRowListaDatiFatturazione");
            localStorage.removeItem("filtersNotifiche");
            localStorage.removeItem("filtersModuliCommessa");
            localStorage.removeItem("pageRowListaModuliCommessa");
            navigate(PathPf.STORICO_CONTEST);
        }
        
    };

    /*
    const handleListItemClickCentroMessaggi = () =>{
        navigate("/centromessaggi");
    };
    */

    const handleListItemClickAccertamenti = () =>{
        navigate("/accertamenti");
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
        }else if(currentLocation === PathPf.ADESIONE_BANDO){
            setSelectedIndex(4);
        }else if(currentLocation === PathPf.FATTURAZIONE){
            setSelectedIndex(5);
        }else if(currentLocation === "/messaggi"){
            setSelectedIndex(null);
        }else if(currentLocation === "/accertamenti"){
            setSelectedIndex(7);
        }else if(currentLocation === PathPf.STORICO_CONTEST){
            setSelectedIndex(8);
        }
    },[currentLocation]);

   
    const hideShowSidenav = location.pathname === '/auth' ||
                            location.pathname === '/azure' ||
                            location.pathname === '/auth/azure'||
                            location.pathname === '/azureLogin'||
                            !profilo.auth;

    const recOrConsIsLogged = profilo.profilo === 'REC' || profilo.profilo ==='CON';

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
                        {!recOrConsIsLogged &&
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
                        <ListItemButton selected={selectedIndex === 8} onClick={() => handleListItemClickStorico()}>
                            <ListItemIcon>
                                <YoutubeSearchedForIcon fontSize="inherit" />
                            </ListItemIcon>
                            <ListItemText primary="Contestazioni" />
                        </ListItemButton>
                        {!recOrConsIsLogged &&
                        <>
                            <ListItemButton selected={selectedIndex === 3} onClick={() => handleListItemClickRel()}>
                                <ListItemIcon>
                                    <ManageAccountsIcon fontSize="inherit" />
                                </ListItemIcon>
                                <ListItemText primary="Regolare esecuzione" />
                            </ListItemButton>
                            {profilo.auth === 'PAGOPA' && 
                            <>
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
                                </ListItemButton>
                              
                                <ListItemButton selected={selectedIndex === 7} onClick={() => handleListItemClickAccertamenti()}>
                                    <ListItemIcon>
                                        <ManageSearchIcon fontSize="inherit"></ManageSearchIcon>
                                    </ListItemIcon>
                                    <ListItemText primary="Documenti contabili" />
                                </ListItemButton>
                            </>}
                        </>
                        }
                    </List>
                    <Divider />
                </Box>
            }
        </>

    );
};
export default SideNavComponent;