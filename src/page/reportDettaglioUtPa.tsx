import { Typography } from "@mui/material";
import { } from '@mui/material';
import React , { useState, useEffect} from 'react';
import { TextField,Box, FormControl, InputLabel,Select, MenuItem, Button} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getTipologiaProfilo, manageError} from "../api/api";
import { ReportDettaglioProps, NotificheList, FlagContestazione, Contestazione, ElementMultiSelect, ListaRecCon, OptionMultiselectChackbox  } from "../types/typeReportDettaglio";
import { useNavigate } from "react-router";
import { BodyListaNotifiche } from "../types/typesGeneral";
import ModalContestazione from '../components/reportDettaglio/modalContestazione';
import ModalInfo from "../components/reusableComponents/modals/modalInfo";
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";
import DownloadIcon from '@mui/icons-material/Download';
import MultiSelectStatoContestazione from "../components/reportDettaglio/multiSelectGroupedBy";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import ModalScadenziario from "../components/reportDettaglio/modalScadenziario";
import { downloadNotifche, downloadNotifcheConsolidatore, downloadNotifcheRecapitista, getContestazione, getContestazioneCosolidatore, getContestazioneRecapitista, listaNotifiche, listaNotificheConsolidatore, listaNotificheRecapitista } from "../api/apiSelfcare/notificheSE/api";
import { downloadNotifchePagoPa, getContestazionePagoPa, getTipologiaEntiCompletiPagoPa, listaNotifichePagoPa } from "../api/apiPagoPa/notificheSE/api";
import { getTipologiaProdotto } from "../api/apiSelfcare/moduloCommessaSE/api";
import GridCustom from "../components/reusableComponents/gridCustom";
import ModalRedirect from "../components/commessaInserimento/madalRedirect";
import { saveAs } from "file-saver";
import { deleteFilterToLocalStorageNotifiche, getFiltersFromLocalStorageNotifiche, getProfilo, getStatusApp, getToken, profiliEnti, setFilterToLocalStorageNotifiche } from "../reusableFunctin/actionLocalStorage";
import {mesi, mesiGrid, mesiWithZero, tipoNotifica } from "../reusableFunctin/reusableArrayObj";
import { getCurrentFinancialYear } from "../reusableFunctin/function";

const ReportDettaglio : React.FC<ReportDettaglioProps> = ({mainState,dispatchMainState}) => {

    const token =  getToken();
    const profilo =  getProfilo();
    const navigate = useNavigate();
    const statusApp = getStatusApp();
    const enti = profiliEnti();

    const currentMonth = (new Date()).getMonth() + 1;
    const currString = currentMonth;
    const currentYear = (new Date()).getFullYear();

    const [prodotti, setProdotti] = useState([{nome:''}]);
    const [profili, setProfili] = useState([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [notificheList, setNotificheList] = useState<NotificheList[]>([]);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [listaRecapitista, setListaRecapitisti] = useState<ListaRecCon[]>([]);
    const [listaConsolidatori, setListaConsolidatori] = useState<ListaRecCon[]>([]);
    const [getNotificheWorking, setGetNotificheWorking] = useState(false);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalNotifiche, setTotalNotifiche]  = useState(0);
    const realPageNumber = page + 1;
    const [valueRispostaEnte, setValueRispostaEnte] = useState('');
    const [contestazioneStatic, setContestazioneStatic] = useState();
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [valueFgContestazione, setValueFgContestazione] = useState<FlagContestazione[]>([]);        
    const [open, setOpen] = useState(false);
    const [openModalInfo, setOpenModalInfo] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [showLoadingGrid, setShowLoadingGrid] = useState(false);
    const [showModalScadenziario, setShowModalScadenziario ] = useState(false);   
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
    const [bodyGetLista, setBodyGetLista] = useState<BodyListaNotifiche>({
        profilo:'',
        prodotto:'',
        anno:currentYear,
        mese:currString, 
        tipoNotifica:null,
        statoContestazione:[],
        cap:null,
        iun:null,
        idEnti:[],
        recipientId:null,
        recapitisti:[],
        consolidatori:[]
    });
    const [bodyDownload, setBodyDownload] = useState<BodyListaNotifiche>({
        profilo:'',
        prodotto:'',
        anno:currentYear,
        mese:currString, 
        tipoNotifica:null,
        statoContestazione:[],
        cap:null,
        iun:null,
        idEnti:[],
        recipientId:null,
        recapitisti:[],
        consolidatori:[]
    });
    const [contestazioneSelected, setContestazioneSelected] = useState<Contestazione>({ 
        risposta:true,
        modifica: true,
        chiusura: true,
        contestazione: {
            id: 0,
            tipoContestazione: 0,
            idNotifica: '',
            noteEnte: '',
            noteSend: null,
            noteRecapitista: null,
            noteConsolidatore: null,
            rispostaEnte: '',
            statoContestazione: 0,
            onere: '',
            dataInserimentoEnte: '',
            dataModificaEnte: '',
            dataInserimentoSend: '',
            dataModificaSend: '',
            dataInserimentoRecapitista: '',
            dataModificaRecapitista: '',
            dataInserimentoConsolidatore: '',
            dataModificaConsolidatore: '',
            dataChiusura: '',
            anno: 0,
            mese: 0
        }
    });

    useEffect(() => {
        const result = getFiltersFromLocalStorageNotifiche();
        if(mainState.nonce !== ''){
            if(Object.keys(result).length > 0){
                getProdotti();
                getProfili();
                setBodyGetLista(result.bodyGetLista);
                setTextValue(result.textValue);
                setValueAutocomplete(result.valueAutocomplete);
                setPage(result.page);
                setRowsPerPage(result.rowsPerPage);
                setBodyDownload(result.bodyGetLista);

                if(profilo.profilo === 'SELFCARE'){
                    getlistaNotifiche( result.page + 1, result.rowsPerPage,result.bodyGetLista); 
                }else if(profilo.auth === 'PAGOPA'){
                    getRecapitistConsolidatori();
                    getlistaNotifichePagoPa( result.page + 1, result.rowsPerPage,result.bodyGetLista);
                }
            }
        } 
    }, [mainState.nonce]);

    useEffect(()=>{
        if( 
            bodyGetLista.profilo !== '' ||
                    bodyGetLista.prodotto !== '' ||
                    bodyGetLista.tipoNotifica !== null ||
                    bodyGetLista.statoContestazione.length !== 0 ||
                    bodyGetLista.cap !== null ||
                    bodyGetLista.idEnti?.length !== 0 ||
                    bodyGetLista.mese !== currString ||
                    bodyGetLista.anno !== currentYear||
                    bodyGetLista.recipientId !== null ||
                    bodyGetLista.consolidatori?.length !== 0 ||
                    bodyGetLista.recapitisti?.length !== 0  
        ){
            setStatusAnnulla('show');
        }else{           
            setStatusAnnulla('hidden');
        }
    },[bodyGetLista]);

    useEffect(()=>{
        if(statusApp.datiFatturazione === false){
            setOpenModalRedirect(true);
        }
    },[]);
    
    // Modifico l'oggetto notifica per fare il binding dei dati nel componente GRIDCUSTOM
    let headerNames: string[] = [];
    const notificheListWithOnere = notificheList.map((notifica) =>{
        let newOnere = '';
        if( notifica.onere === 'PA_SEND' ){
            newOnere = 'SEND';
        }else if( notifica.onere === 'PA_REC' ){
            newOnere = 'RECAPITISTA';
        }else if( notifica.onere === 'PA_CON' ){
            newOnere = 'CONSOLIDATORE';
        }else if( notifica.onere === 'GSP_SEND' ){
            newOnere = 'SEND';
        }else if( notifica.onere === 'GSP_REC' ){
            newOnere = 'RECAPITISTA';
        }else if( notifica.onere === 'GSP_CON' ){
            newOnere = 'CONSOLIDATORE';
        }else if( notifica.onere === 'SCP_SEND' ){
            newOnere = 'SEND';
        }else if( notifica.onere === 'SCP_REC' ){
            newOnere = 'RECAPITISTA';
        }else if( notifica.onere === 'SCP_CON' ){
            newOnere = 'CONSOLIDATORE';
        }else if( notifica.onere === 'PSP_SEND' ){
            newOnere = 'SEND';
        }else if( notifica.onere === 'PSP_REC' ){
            newOnere = 'RECAPITISTA';
        }else if( notifica.onere === 'PSP_CON' ){
            newOnere = 'CONSOLIDATORE';
        }else if( notifica.onere === 'AS_SEND' ){
            newOnere = 'SEND';
        }else if( notifica.onere === 'AS_REC' ){
            newOnere = 'RECAPITISTA';
        }else if( notifica.onere === 'AS_CON' ){
            newOnere = 'CONSOLIDATORE';
        }else if( notifica.onere === 'SA_SEND' ){
            newOnere = 'SEND';
        }else if( notifica.onere === 'SA_REC' ){
            newOnere = 'RECAPITISTA';
        }else if( notifica.onere === 'SA_CON' ){
            newOnere = 'CONSOLIDATORE';
        }else if(notifica.onere === 'SEND_PA'){
            newOnere = 'ENTE';
        }else if(notifica.onere === 'SEND_GSP'){
            newOnere = 'ENTE';
        }else if(notifica.onere === 'SEND_SCP'){
            newOnere = 'ENTE';
        }else if(notifica.onere === 'SEND_PSP'){
            newOnere = 'ENTE';
        }else if(notifica.onere === 'SEND_AS'){
            newOnere = 'ENTE';
        }else if(notifica.onere === 'SEND_SA'){
            newOnere = 'ENTE';
        }else if(notifica.onere === 'SEND_SEND'){
            newOnere = 'SEND';
        }else if(notifica.onere === 'SEND_REC'){
            newOnere = 'RECAPITISTA';
        }else if(notifica.onere === 'SEND_CON'){
            newOnere = 'CONSOLIDATORE';
        }else if(notifica.onere === 'REC'){
            newOnere = 'RECAPITISTA';
        }else if(notifica.onere === 'CON'){
            newOnere = 'CONSOLIDATORE';
        }

        const element = {
            idNotifica:notifica.idNotifica,
            contestazione:notifica.contestazione,
            onere:newOnere,
            recipientId:notifica.recipientId,
            anno:notifica.anno,
            mese:mesiGrid[Number(notifica.mese) - 1 ],
            ragioneSociale:notifica.ragioneSociale,
            tipoNotifica:notifica.tipoNotifica,
            iun:notifica.iun,
            dataInvio:new Date(notifica.dataInvio).toISOString().split('T')[0],
            statoEstero:notifica.statoEstero,
            cap:notifica.cap,
            costEuroInCentesimi:(Number(notifica.costEuroInCentesimi) / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" })
        };
        if(profilo.profilo === 'REC' || profilo.profilo === 'CON'){
            headerNames = ['Contestazione', 'Onere', 'Recipient ID','Anno', 'Mese','Tipo Notifica','IUN', 'Data invio','Stato estero', 'CAP', 'Costo', ''];
            const {ragioneSociale, ...result} = element;
            return result;
        }else{
            headerNames = ['Contestazione', 'Onere', 'Recipient ID','Anno', 'Mese','Ragione Sociale', 'Tipo Notifica','IUN', 'Data invio','Stato estero', 'CAP', 'Costo', ''];
            return element;
        }
    });
  
    const onAnnullaFiltri = async () =>{
        const newBody = {
            profilo:'',
            prodotto:'',
            anno:currentYear,
            mese:currString, 
            tipoNotifica:null,
            statoContestazione:[],
            cap:null,
            iun:null,
            idEnti:[],
            recipientId:null,
            recapitisti:[],
            consolidatori:[]

        };
        setStatusAnnulla('hidden');
        setValueFgContestazione([]);
        setDataSelect([]);
        setBodyGetLista(newBody);
        setBodyDownload(newBody);
        deleteFilterToLocalStorageNotifiche();
        const {idEnti, recapitisti, consolidatori, ...body} = newBody;
        if(enti){
            await listaNotifiche(token,mainState.nonce,1,10, body)
                .then((res)=>{
                    setNotificheList(res.data.notifiche);
                    setTotalNotifiche(res.data.count);    
                }).catch((error)=>{
                    manageError(error, navigate,dispatchMainState);
                });
        }else if(profilo.profilo === 'REC'){
            await listaNotificheRecapitista(token,mainState.nonce,1, 10, body)
                .then((res)=>{
                    setNotificheList(res.data.notifiche);
                    setTotalNotifiche(res.data.count);
                    // abilita button filtra e annulla filtri all'arrivo dei dati
                    setGetNotificheWorking(false);
                }).catch((error)=>{
                // abilita button filtra e annulla filtri all'arrivo dei dati
                    setGetNotificheWorking(false);
                    manageError(error, navigate,dispatchMainState);
                });
        }else if(profilo.profilo === 'CON'){
            await listaNotificheConsolidatore(token,mainState.nonce,1, 10, body)
                .then((res)=>{
                    setNotificheList(res.data.notifiche);
                    setTotalNotifiche(res.data.count);
                    // abilita button filtra e annulla filtri all'arrivo dei dati
                    setGetNotificheWorking(false);
                }).catch((error)=>{
                // abilita button filtra e annulla filtri all'arrivo dei dati
                    setGetNotificheWorking(false);
                    manageError(error, navigate,dispatchMainState);
                });
        }else if(profilo.auth === 'PAGOPA'){
            await listaNotifichePagoPa(token,mainState.nonce,1,10, newBody)
                .then((res)=>{
                    setNotificheList(res.data.notifiche);
                    setTotalNotifiche(res.data.count);
                }).catch((error)=>{
                    manageError(error, navigate,dispatchMainState);
                });
        }
    };     

    const getlistaNotifiche = async (nPage:number, nRow:number, bodyParameter) => {
        setShowLoadingGrid(true);
        // elimino idEnti dal paylod della get notifiche lato selfcare
        const {idEnti, recapitisti, consolidatori, ...newBody} = bodyParameter;
        // disable button filtra e annulla filtri nell'attesa dei dati
        setGetNotificheWorking(true);
        if(enti){
            await listaNotifiche(token,mainState.nonce,nPage, nRow, newBody)
                .then((res)=>{
                    setNotificheList(res.data.notifiche);
                    setTotalNotifiche(res.data.count);
                    // abilita button filtra e annulla filtri all'arrivo dei dati
                    setGetNotificheWorking(false);
                    setShowLoadingGrid(false);
                }).catch((error)=>{
                // abilita button filtra e annulla filtri all'arrivo dei dati
                    setGetNotificheWorking(false);
                    setShowLoadingGrid(false);
                    manageError(error, navigate,dispatchMainState);
                });
        }else if(profilo.profilo === 'REC'){
            await listaNotificheRecapitista(token,mainState.nonce,nPage, nRow, newBody)
                .then((res)=>{
                    setNotificheList(res.data.notifiche);
                    setTotalNotifiche(res.data.count);
                    // abilita button filtra e annulla filtri all'arrivo dei dati
                    setGetNotificheWorking(false);
                    setShowLoadingGrid(false);
                }).catch((error)=>{
                    // abilita button filtra e annulla filtri all'arrivo dei dati
                    setGetNotificheWorking(false);
                    setShowLoadingGrid(false);
                    manageError(error, navigate,dispatchMainState);
                });
        }else if(profilo.profilo === 'CON'){
            await listaNotificheConsolidatore(token,mainState.nonce,nPage, nRow,newBody)
                .then((res)=>{
                    setNotificheList(res.data.notifiche);
                    setTotalNotifiche(res.data.count);
                    // abilita button filtra e annulla filtri all'arrivo dei dati
                    setGetNotificheWorking(false);
                    setShowLoadingGrid(false);
                }).catch((error)=>{
                    // abilita button filtra e annulla filtri all'arrivo dei dati
                    setGetNotificheWorking(false);
                    setShowLoadingGrid(false);
                    manageError(error, navigate,dispatchMainState);
                });
        }           
    };

    const getlistaNotifichePagoPa = async (nPage:number, nRow:number, bodyParameter) => {
        // disable button filtra e annulla filtri nell'attesa dei dati
        setGetNotificheWorking(true);
        setShowLoadingGrid(true);
        await listaNotifichePagoPa(token,mainState.nonce,nPage, nRow, bodyParameter)
            .then((res)=>{
                // abilita button filtra e annulla filtri all'arrivo dei dati
                setGetNotificheWorking(false);
                setNotificheList(res.data.notifiche);
                setTotalNotifiche(res.data.count); 
                setShowLoadingGrid(false);
            }).catch((error)=>{
                // abilita button filtra e annulla filtri all'arrivo dei dati
                setGetNotificheWorking(false);
                setShowLoadingGrid(false);
                manageError(error, navigate,dispatchMainState);
            });       
    };

    const onButtonFiltra = () =>{
        setPage(0);
        setRowsPerPage(10);
        setBodyDownload(bodyGetLista);
        setFilterToLocalStorageNotifiche(bodyGetLista,textValue,valueAutocomplete, 0, 10);
        if(profilo.auth === 'SELFCARE'){
            getlistaNotifiche(1, 10,bodyGetLista);
        }else{
            getlistaNotifichePagoPa(1, 10,bodyGetLista);
        }  
    };
                
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        const realPage = newPage + 1;
        if(profilo.auth === 'SELFCARE'){
            getlistaNotifiche(realPage,rowsPerPage, bodyGetLista);
        }else if(profilo.auth === 'PAGOPA'){
            getlistaNotifichePagoPa(realPage,rowsPerPage, bodyGetLista);
        }
        setPage(newPage);
        const result = getFiltersFromLocalStorageNotifiche();
        setFilterToLocalStorageNotifiche(result.bodyGetLista,result.textValue,result.valueAutocomplete, newPage, rowsPerPage);
       
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        const result = getFiltersFromLocalStorageNotifiche();
        setFilterToLocalStorageNotifiche(result.bodyGetLista,result.textValue,result.valueAutocomplete, page, parseInt(event.target.value, 10));
        const realPage = page + 1;
        if(profilo.auth === 'SELFCARE'){
            getlistaNotifiche(realPage,parseInt(event.target.value, 10),bodyGetLista);
        }else if(profilo.auth === 'PAGOPA'){
            getlistaNotifichePagoPa(realPage,parseInt(event.target.value, 10),bodyGetLista);
        }  
                          
    };

    const getRecapitistConsolidatori = async() =>{
        await getTipologiaEntiCompletiPagoPa(token, mainState.nonce, 'REC').then((res)=>{          
            setListaRecapitisti(res.data);
        }).catch(((err)=>{
            manageError(err,navigate,dispatchMainState);
        }));
        await getTipologiaEntiCompletiPagoPa(token, mainState.nonce, 'CON').then((res)=>{          
            setListaConsolidatori(res.data);
        }).catch(((err)=>{
            manageError(err,navigate,dispatchMainState);
        }));
    };
                        
    const getProdotti = async() => {
        await getTipologiaProdotto(token, mainState.nonce )
            .then((res)=>{          
                setProdotti(res.data);
            })
            .catch(((err)=>{
                manageError(err,navigate,dispatchMainState);
            }));
    };
                                            
    const getProfili = async() => {
        await getTipologiaProfilo(token, mainState.nonce )
            .then((res)=>{              
                setProfili(res.data);
            })
            .catch(((err)=>{
                manageError(err,navigate,dispatchMainState);
            }));
    };

    const getContestazioneModal = async(idNotifica:string) =>{
        setShowLoadingGrid(true);
        if(enti){
            await getContestazione(token, mainState.nonce , idNotifica )
                .then((res)=>{
                    //se i tempi di creazione di una contestazione sono scaduti show pop up info
                    if(res.data.modifica === false && res.data.chiusura === false && res.data.contestazione.statoContestazione === 1){
                        setShowLoadingGrid(false);
                        setOpenModalInfo(true);
                    }else{
                    // atrimenti show pop up creazione contestazione
                        setShowLoadingGrid(false);
                        setOpen(true); 
                        setContestazioneSelected(res.data);
                        setContestazioneStatic(res.data);
                        setValueRispostaEnte(res.data.contestazione.rispostaEnte);
                    }           
                })
                .catch(((err)=>{
                    setShowLoadingGrid(false);
                    manageError(err,navigate,dispatchMainState);
                }));
        }else if( profilo.profilo === 'REC'){
            await getContestazioneRecapitista(token, mainState.nonce , idNotifica )
                .then((res)=>{
                    setShowLoadingGrid(false);
                    //se i tempi di creazione di una contestazione sono scaduti show pop up info
                    if(res.data.modifica === false && res.data.chiusura === false && res.data.contestazione.statoContestazione === 1){
                        setOpenModalInfo(true);
                    }else{
                        // atrimenti show pop up creazione contestazione
                        setOpen(true); 
                        setContestazioneSelected(res.data);
                        setContestazioneStatic(res.data);
                    }           
                })
                .catch(((err)=>{
                    setShowLoadingGrid(false);
                    manageError(err,navigate,dispatchMainState);
                }));
        }else if( profilo.profilo === 'CON'){
            await getContestazioneCosolidatore(token, mainState.nonce , idNotifica )
                .then((res)=>{
                    setShowLoadingGrid(false);
                    //se i tempi di creazione di una contestazione sono scaduti show pop up info
                    if(res.data.modifica === false && res.data.chiusura === false && res.data.contestazione.statoContestazione === 1){
                        setOpenModalInfo(true);
                    }else{
                        // atrimenti show pop up creazione contestazione
                        setOpen(true); 
                        setContestazioneSelected(res.data);
                        setContestazioneStatic(res.data);
                    }           
                })
                .catch(((err)=>{
                    setShowLoadingGrid(false);
                    manageError(err,navigate,dispatchMainState);
                }));
        }else if(profilo.auth === 'PAGOPA'){
            await getContestazionePagoPa(token, mainState.nonce , idNotifica ).then((res)=>{
                setShowLoadingGrid(false);
                //se i tempi di creazione di una contestazione sono scaduti show pop up info
                if(res.data.modifica === false && res.data.chiusura === false && res.data.contestazione.statoContestazione === 1){
                    setOpenModalInfo(true);
                }else{
                    // atrimenti show pop up creazione contestazione
                    setOpen(true); 
                    setContestazioneSelected(res.data);
                    setContestazioneStatic(res.data);
                }                 
            }).catch(((err)=>{
                setShowLoadingGrid(false);
                manageError(err,navigate,dispatchMainState);
            }));
        }
    };

    const downloadNotificheOnDownloadButton = async () =>{
        setShowLoading(true);
        if(enti){
            const {idEnti, recapitisti, consolidatori, ...bodyEnti} = bodyDownload;
            await downloadNotifche(token, mainState.nonce,bodyEnti )
                .then((res)=>{
                    saveAs("data:text/plain;base64," + res.data.documento,`Notifiche /${notificheList[0].ragioneSociale}/${mesiWithZero[bodyDownload.mese-1]} /${bodyDownload.anno}.xlsx` );
                    setShowLoading(false);         
                })
                .catch(((err)=>{
                    setShowLoading(false);
                    manageError(err,navigate,dispatchMainState);
                }));
        }else if(profilo.profilo === 'REC'){
            const {idEnti, recapitisti, consolidatori, ...bodyRecapitista} = bodyDownload;
            await downloadNotifcheRecapitista(token, mainState.nonce,bodyRecapitista )
                .then((res)=>{
                    const blob = new Blob([res.data], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.setAttribute('hidden', '');
                    a.setAttribute('href', url);
                    a.setAttribute('download',`Notifiche /${mesiWithZero[bodyDownload.mese-1]} /${bodyDownload.anno}.csv`);
                    document.body.appendChild(a);
                    a.click();
                    setShowLoading(false);
                    document.body.removeChild(a); 
                })
                .catch(((err)=>{
                    manageError(err,navigate,dispatchMainState);
                    setShowLoading(false);
                }));
        }else if(profilo.profilo === 'CON'){
            const { idEnti, recapitisti, consolidatori, ...bodyConsolidatore} = bodyDownload;
            await downloadNotifcheConsolidatore(token, mainState.nonce,bodyConsolidatore )
                .then((res)=>{
                    const blob = new Blob([res.data], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.setAttribute('hidden', '');
                    a.setAttribute('href', url);
                    a.setAttribute('download', `Notifiche /${mesiWithZero[bodyDownload.mese-1]} /${bodyDownload.anno}.csv`);
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setShowLoading(false);
                })
                .catch(((err)=>{
                    manageError(err,navigate,dispatchMainState);
                    setShowLoading(false);
                }));
        }else if(profilo.auth === 'PAGOPA'){
            await downloadNotifchePagoPa(token, mainState.nonce,bodyDownload)
                .then((res)=>{
                    let fileName = `Notifiche /${mesiWithZero[bodyDownload.mese-1]} /${bodyDownload.anno}.csv`;
                    if(bodyDownload.idEnti.length === 1){
                        fileName = `Notifiche /${notificheList[0].ragioneSociale}/${mesiWithZero[bodyDownload.mese-1]} /${bodyDownload.anno}.csv`;
                    }
                    const blob = new Blob([res.data], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.setAttribute('hidden', '');
                    a.setAttribute('href', url);
                    a.setAttribute('download',fileName);
                    document.body.appendChild(a);
                    a.click();
                    setShowLoading(false);
                    document.body.removeChild(a); 
                })
                .catch(((err)=>{
                    manageError(err,navigate,dispatchMainState);
                    setShowLoading(false);
                }));
        }
    }; 
  
    const backgroundColorButtonScadenzario = (profilo.auth === 'PAGOPA' || enti) ? "#0062C3" : 'red';

    return (
        <div className="mx-5">
            {/*title container start */}
            <div className="d-flex   marginTop24 ">
                <div className="col-9">
                    <Typography variant="h4">Report Dettaglio</Typography>
                </div>
                <div className="col-3 ">
                    <Box sx={{width:'80%', marginLeft:'20px', display:'flex', justifyContent:'end'}}  >
                        <Button  style={{
                            backgroundColor:backgroundColorButtonScadenzario
                        }} variant="contained"  onClick={()=> setShowModalScadenziario(true)} >
                            <VisibilityIcon sx={{marginRight:'10px'}}></VisibilityIcon>
                    Scadenzario
                        </Button>
                    </Box>
                </div>
            </div>
            {/*title container end */}
            <div className="mt-5 mb-5 ">
                <div className="row">
                    <div className="col-3   ">
                        <Box sx={{width:'80%'}} >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel
                                    id="sea"
                                >
                            Anno
                                </InputLabel>
                                <Select
                                    id="sea"
                                    label='Seleziona Prodotto'
                                    labelId="search-by-label"
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        setBodyGetLista((prev)=> ({...prev, ...{anno:value}}));
                                    }}
                                    value={bodyGetLista.anno}
                                    disabled={status=== 'immutable' ? true : false}
                                >
                                    {getCurrentFinancialYear().map((el) => (
                                        <MenuItem
                                            key={Math.random()}
                                            value={el}
                                        >
                                            {el}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                    <div className="col-3  ">
                        <Box sx={{width:'80%', marginLeft:'20px'}}  >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel
                                    id="sea"
                                >
                                Mese
                                </InputLabel>
                                <Select
                                    id="sea"
                                    label='Seleziona Prodotto'
                                    labelId="search-by-label"
                                    onChange={(e) =>{
                                        const value = Number(e.target.value);
                                        setBodyGetLista((prev)=> ({...prev, ...{mese:value}}));
                                    }}
                                    value={bodyGetLista.mese}
                                    disabled={status=== 'immutable' ? true : false}
                                >
                                    {mesi.map((el) => (
                                        <MenuItem
                                            key={Math.random()}
                                            value={Object.keys(el)[0].toString()}
                                        >
                                            {Object.values(el)[0]}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                    <div className="col-3  ">
                        <Box sx={{width:'80%', marginLeft:'20px'}} >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel
                                    id="sea"
                                >
                                    Seleziona Prodotto
                                </InputLabel>
                                <Select
                                    id="prodotto"
                                    label='Seleziona Prodotto'
                                    labelId="search-by-label"
                                    onChange={(e) => setBodyGetLista((prev)=> ({...prev, ...{prodotto:e.target.value}}))}
                                    value={bodyGetLista.prodotto}
                                    disabled={status=== 'immutable' ? true : false}
                                >
                                    {prodotti.map((el) => (
                                        <MenuItem
                                            key={Math.random()}
                                            value={el.nome}
                                        >
                                            {el.nome}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                    <div className="col-3 ">
                        <Box sx={{width:'80%',marginLeft:'20px'}} >
                            <TextField
                                fullWidth
                                label='IUN'
                                placeholder='IUN'
                                value={bodyGetLista.iun || ''}
                                onChange={(e) => setBodyGetLista((prev)=>{             
                                    if(e.target.value === ''){
                                        return {...prev, ...{iun:null}};
                                    }else{
                                        return {...prev, ...{iun:e.target.value}};
                                    }
                                } )}            
                            />
                        </Box>
                    </div>
                </div>                                         
                <div className="row mt-5" >           
                    <div className="col-3">
                        <Box sx={{width:'80%'}} >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel
                                    id="sea"
                                >
                                            Tipo Notifica     
                                </InputLabel>
                                <Select
                                    id="sea"
                                    label='Tipo Notifica'
                                    labelId="search-by-label"
                                    onChange={(e) =>{
                                        const value = Number(e.target.value);
                                        setBodyGetLista((prev)=> ({...prev, ...{tipoNotifica:value}}));
                                    }}
                                    value={bodyGetLista.tipoNotifica || ''}        
                                    disabled={status=== 'immutable' ? true : false}
                                >
                                    {tipoNotifica.map((el) => (     
                                        <MenuItem
                                            key={Math.random()}
                                            value={Object.values(el)[0].toString()}
                                        >
                                            {Object.keys(el)[0].toString()}
                                        </MenuItem>      
                                    ))}       
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                    <div className=" col-3 ">
                        <Box sx={{width:'80%', marginLeft:'20px'}} >
                            <MultiSelectStatoContestazione 
                                mainState={mainState}
                                dispatchMainState={dispatchMainState}
                                setBodyGetLista={setBodyGetLista}
                                valueFgContestazione={valueFgContestazione}
                                setValueFgContestazione={setValueFgContestazione}></MultiSelectStatoContestazione>
                        </Box>
                    </div>
                    <div className="col-3 ">
                        <Box sx={{width:'80%', marginLeft:'20px'}} >
                            <TextField
                                fullWidth
                                label='CAP'
                                placeholder='CAP'
                                value={bodyGetLista.cap || ''}
                                onChange={(e) => setBodyGetLista((prev)=>{               
                                    if(e.target.value === ''){
                                        return {...prev, ...{cap:null}};
                                    }else{
                                        return {...prev, ...{cap:e.target.value}};
                                    }
                                } )}
                            />
                        </Box>
                    </div>
                    <div className="col-3 ">
                        <Box sx={{width:'80%',  marginLeft:'20px'}} >
                            <TextField
                                fullWidth
                                label='Recipient ID'
                                placeholder='Recipient ID'
                                value={bodyGetLista.recipientId || ''}
                                onChange={(e) => setBodyGetLista((prev)=>{                
                                    if(e.target.value === ''){
                                        return {...prev, ...{recipientId:null}};
                                    }else{
                                        return {...prev, ...{recipientId:e.target.value}};
                                    }
                                } )}                     
                            />
                        </Box>
                    </div>                         
                </div>
                <div className="row mt-5" >
                    {profilo.auth === 'PAGOPA' &&
                    <div  className="col-3">
                        <MultiselectCheckbox 
                            dispatchMainState={dispatchMainState}
                            mainState={mainState} 
                            setBodyGetLista={setBodyGetLista}
                            setDataSelect={setDataSelect}
                            dataSelect={dataSelect}
                            setTextValue={setTextValue}
                            textValue={textValue}
                            valueAutocomplete={valueAutocomplete}
                            setValueAutocomplete={setValueAutocomplete}
                        ></MultiselectCheckbox>
                    </div>
                    }
                    {profilo.auth === 'PAGOPA' && 
                    <>
                        <div className="col-3">
                            <Box sx={{width:'80%', marginLeft:'20px'}} >
                                <FormControl
                                    fullWidth
                                    size="medium"
                                >
                                    <InputLabel
                                        id="selectCons"
                                    >
                                            Consolidatore     
                                    </InputLabel>
                                    <Select
                                        id="sea"
                                        label='Consolidatore'
                                        labelId="search-by-label"
                                        onChange={(e) =>{
                                            const value = e.target.value;
                                            setBodyGetLista((prev)=> ({...prev, ...{consolidatori:[value]}}));
                                        }}
                                        value={bodyGetLista.consolidatori[0] || ''}        
                                    >
                                        {listaConsolidatori.map((el) => (     
                                            <MenuItem
                                                key={el.idEnte}
                                                value={el.idEnte}
                                            >
                                                {el.descrizione}
                                            </MenuItem>      
                                        ))}       
                                    </Select>
                                </FormControl>
                            </Box>
                        </div>
                        <div className="col-3">
                            <Box sx={{width:'80%', marginLeft:'20px'}} >
                                <FormControl
                                    fullWidth
                                    size="medium"
                                >
                                    <InputLabel
                                        id="selectRecapitista"
                                    >
                                            Recapitista     
                                    </InputLabel>
                                    <Select
                                        id="sea"
                                        label='Recapitista'
                                        labelId="search-by-label"
                                        onChange={(e) =>{
                                            const value = e.target.value;
                                            setBodyGetLista((prev)=> ({...prev, ...{recapitisti:[value]}}));
                                        }}
                                        value={bodyGetLista.recapitisti[0] || ''}        
                                    >
                                        {listaRecapitista.map((el) => (     
                                            <MenuItem
                                                key={el.idEnte}
                                                value={el.idEnte}
                                            >
                                                {el.descrizione}
                                            </MenuItem>      
                                        ))}       
                                    </Select>
                                </FormControl>
                            </Box>
                        </div>
                    </>
                    }
                </div>
                <div className="">
                    <div className="d-flex justify-content-start mt-5">
                        <div className=" d-flex align-items-center justify-content-center h-100">
                            <div>
                                <Button 
                                    onClick={()=> onButtonFiltra()} 
                                    disabled={getNotificheWorking}
                                    variant="contained"> Filtra  
                                </Button>                
                                {statusAnnulla === 'hidden' ? null :
                                    <Button
                                        onClick={()=>{
                                            onAnnullaFiltri();   
                                        } }
                                        disabled={getNotificheWorking}
                                        sx={{marginLeft:'24px'}} >
                                                    Annulla filtri
                                    </Button>
                                }
                            </div>               
                        </div>
                    </div>
                </div>
            </div>
            { notificheList.length > 0  &&
            <div className="marginTop24" style={{display:'flex', justifyContent:'end'}}>
                <div>
                    <Button
                        disabled={getNotificheWorking}
                        onClick={()=> {
                            downloadNotificheOnDownloadButton(); 
                        }}  >
                                  Download Risultati 
                        <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                    </Button>
                </div>           
            </div>
            }            
            <div className="mb-5">
                <GridCustom
                    nameParameterApi='idNotifica'
                    elements={notificheListWithOnere}
                    changePage={handleChangePage}
                    changeRow={handleChangeRowsPerPage} 
                    total={totalNotifiche}
                    page={page}
                    rows={rowsPerPage}
                    headerNames={headerNames}
                    apiGet={getContestazioneModal}
                    disabled={getNotificheWorking}></GridCustom>
            </div>             
            {/* MODAL */}                                 
            <ModalContestazione open={open} 
                setOpen={setOpen} 
                mainState={mainState}
                contestazioneSelected={contestazioneSelected}
                setContestazioneSelected={setContestazioneSelected}
                funGetNotifiche={getlistaNotifiche}
                funGetNotifichePagoPa={getlistaNotifichePagoPa}
                openModalLoading={setShowLoadingGrid}
                page={realPageNumber}
                rows={rowsPerPage}
                valueRispostaEnte={valueRispostaEnte}
                contestazioneStatic={contestazioneStatic}
                dispatchMainState={dispatchMainState}
            ></ModalContestazione>
            <ModalRedirect
                setOpen={setOpenModalRedirect} 
                open={openModalRedirect}
                sentence={`Per poter visualizzare la lista delle Notifiche è obbligatorio fornire i seguenti dati di fatturazione:`}>
            </ModalRedirect>
            <ModalInfo
                open={openModalInfo} 
                setOpen={setOpenModalInfo}
                sentence={'Non è possibile creare una contestazione.'} >
            </ModalInfo>
            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading}
                sentence={'Downloading...'} >
            </ModalLoading>
            <ModalLoading 
                open={showLoadingGrid} 
                setOpen={setShowLoadingGrid}
                sentence={'Loading...'} >
            </ModalLoading>
            <ModalScadenziario
                open={showModalScadenziario} 
                setOpen={setShowModalScadenziario}
                nonce={mainState.nonce}
                profilo={profilo}
                dispatchMainState={dispatchMainState}></ModalScadenziario>                                    
        </div>
    );
};                                        
export default ReportDettaglio;