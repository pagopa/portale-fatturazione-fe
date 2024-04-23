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
import {getAuthProfilo, manageError} from '../../api/api';
import MarkUnreadChatAltIcon from '@mui/icons-material/MarkUnreadChatAlt';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { SideNavProps } from '../../types/typesGeneral';
import { getDatiFatturazione } from '../../api/apiSelfcare/datiDiFatturazioneSE/api';
import { getDatiModuloCommessa } from '../../api/apiSelfcare/moduloCommessaSE/api';
import { PathPf } from '../../types/enum';


const SideNavComponent: React.FC<SideNavProps> = ({dispatchMainState, mainState}) => {

    const navigate = useNavigate();
    const location = useLocation();

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;
   
    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);


    

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };



    // questa chiamata viene eseguita esclusivamente se l'utenete fa un reload page cosi da inserire nuovamente il NONCE nel DOM
    const getProfiloToGetNonce = async () =>{
    
        await getAuthProfilo(profilo.jwt)
            .then((res) =>{
                handleModifyMainState({nonce:res?.data.nonce});
            
            }).catch(()=>{

                navigate('/error');
            });
    };
    // eseguiamo la get a riga 21 solo se il value dell'input(nonce) nel Dom è non c'è e controlliamo che nella local storage sia settatto il profilo
    // Object.values(profilo).length !== 0 viene fatto solo per far si che la chiamanta non venga fatta al primo rendering
    // in quel caso il get profilo viene chiamato nella page auth
  
    useEffect(()=>{

        if(mainState.nonce === '' && Object.values(profilo).length !== 0 && location.pathname !== '/auth' ){
          
            getProfiloToGetNonce();
        }
         
    },[mainState.nonce]);
  

    const [selectedIndex, setSelectedIndex] = useState(0);

    
    const handleListItemClick = async() => {
        localStorage.removeItem("filtersModuliCommessa");
        localStorage.removeItem("pageRowListaModuliCommessa");
        localStorage.removeItem("filtersRel");
        if(profilo.auth === 'PAGOPA'){
           
            // setFilterListaFatturazione({descrizione:'',prodotto:'',profilo:''});
            //setInfoPageListaDatiFat({ page: 0, pageSize: 100 });
           
            navigate(PathPf.LISTA_DATI_FATTURAZIONE);
        }else{
            navigate(PathPf.DATI_FATTURAZIONE);
            /*
            if(mainState.datiFatturazione === true){
                handleModifyMainState({
                    action:'DATI_FATTURAZIONE',
                    statusPageDatiFatturazione:'immutable'
                });
                localStorage.setItem('statusApplication', JSON.stringify(mainState));
            }
           */
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
        const statusApp = localStorage.getItem('statusApplication')||'{}';
        const parseStatusApp = JSON.parse(statusApp);
        await getDatiFatturazione(token,mainState.nonce).then(( ) =>{ 
            
            handleModifyMainState({datiFatturazione:true});
            //localStorage.setItem('statusApplication', JSON.stringify(mainState));
            
            
            localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                ...{datiFatturazione:true}}));

        }).catch(err =>{
          
            if(err?.response?.status === 404){
                handleModifyMainState({datiFatturazione:false});
                localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                    ...{datiFatturazione:false}}));
            }
           
           
        });

    };
    
    const currentYear = (new Date()).getFullYear();

    let currString;
    //creo un array di oggetti con tutti i mesi 

    if((new Date()).getMonth() === 11){
        currString = '1';
    }else{
        const currentMonth = (new Date()).getMonth() + 2;
        currString = currentMonth.toString();
    }

    const handleListItemClickModuloCommessa = async () => {
      
        localStorage.removeItem("filtersRel");
        localStorage.removeItem("filtersListaDatiFatturazione");
        localStorage.removeItem("pageRowListaDatiFatturazione");
        if(profilo.auth === 'PAGOPA'){
        
            //cliccando sulla side nav Modulo commessa e sono l'ente PAGOPA
            navigate(PathPf.LISTA_MODULICOMMESSA);

        }else{
            //cliccando sulla side nav Modulo commessa e sono un ente qualsiasi
            await getDatiFat();
            await getDatiModuloCommessa(token, mainState.nonce).then((res)=>{
                console.log('pttptptp', res.data);
                if(res.data.modifica === true && res.data.moduliCommessa.length === 0 ){
                  
                    handleModifyMainState({
                        inserisciModificaCommessa:'INSERT',
                        statusPageInserimentoCommessa:'mutable',
                        userClickOn:undefined,
                        primoInserimetoCommessa:true
                    });
                 
                    const newState = {
                        mese:res.data.mese,
                        anno:res.data.anno,
                        inserisciModificaCommessa:'INSERT',
                        //datiFatturazione:mainState.datiFatturazione,
                        userClickOn:undefined,
                        primoInserimetoCommessa:true
                    };

                    const statusApp = localStorage.getItem('statusApplication')||'{}';
                    const parseStatusApp = JSON.parse(statusApp);
            
                    localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                        ...newState}));
                 
                    navigate(PathPf.MODULOCOMMESSA);
                }else if(res.data.modifica === true && res.data.moduliCommessa.length > 0 ){
    
                    handleModifyMainState({
                        inserisciModificaCommessa:'MODIFY',
                        statusPageInserimentoCommessa:'immutable',
                        primoInserimetoCommessa:false});
    
                    const newState = {
                        inserisciModificaCommessa:'MODIFY',
                        // datiFatturazione:mainState.datiFatturazione,
                        primoInserimetoCommessa:false
                    };
                    const statusApp = localStorage.getItem('statusApplication')||'{}';
                    const parseStatusApp = JSON.parse(statusApp);
            
                    localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                        ...newState}));
                   
                    navigate(PathPf.LISTA_COMMESSE);
                }else if(res.data.modifica === false && res.data.moduliCommessa.length === 0){

                    handleModifyMainState({
                        inserisciModificaCommessa:'NO_ACTION',
                        statusPageInserimentoCommessa:'immutable',
                        primoInserimetoCommessa:false});
                
                    const newState = {
                        inserisciModificaCommessa:'NO_ACTION',
                        //datiFatturazione:mainState.datiFatturazione,
                        primoInserimetoCommessa:false
                    };
                    const statusApp = localStorage.getItem('statusApplication')||'{}';
                    const parseStatusApp = JSON.parse(statusApp);
            
                    localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                        ...newState}));
                   
                    navigate(PathPf.LISTA_COMMESSE);
                }else if(res.data.modifica === false && res.data.moduliCommessa.length > 0){
                    handleModifyMainState({
                        inserisciModificaCommessa:'NO_ACTION',
                        statusPageInserimentoCommessa:'immutable',
                        primoInserimetoCommessa:false}); 

                    const newState = {
                        inserisciModificaCommessa:'NO_ACTION',
                        // datiFatturazione:mainState.datiFatturazione,
                        primoInserimetoCommessa:false
                    };
                    const statusApp = localStorage.getItem('statusApplication')||'{}';
                    const parseStatusApp = JSON.parse(statusApp);
            
                    localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                        ...newState}));
                   
                    navigate(PathPf.LISTA_COMMESSE);
                }
    
            }).catch((err) =>{
                manageError(err, navigate);
            });
            
        }
    };

    const handleListItemClickNotifiche = () => {
        localStorage.removeItem("filtersModuliCommessa");
        localStorage.removeItem("pageRowListaModuliCommessa");
        localStorage.removeItem("filtersRel");
        localStorage.removeItem("filtersListaDatiFatturazione");
        localStorage.removeItem("pageRowListaDatiFatturazione");
        navigate(PathPf.LISTA_NOTIFICHE);
    };

    const handleListItemClickRel = async () => {
        localStorage.removeItem("filtersModuliCommessa");
        localStorage.removeItem("pageRowListaModuliCommessa");
        localStorage.removeItem("filtersListaDatiFatturazione");
        localStorage.removeItem("pageRowListaDatiFatturazione");
        navigate(PathPf.LISTA_REL);
     
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
                        {!recOrConsIsLogged &&
                        <ListItemButton selected={selectedIndex === 3} onClick={() => handleListItemClickRel()}>
                            <ListItemIcon>
                                <ManageAccountsIcon fontSize="inherit" />
                            </ListItemIcon>
                            <ListItemText primary="Regolare Esecuzione" />
                        </ListItemButton>
                        }
                    </List>
                    <Divider />
                </Box>
            }
        </>
       

    );
};
export default SideNavComponent;