import { Typography } from "@mui/material";
import React , { useState, useEffect, useContext, useRef} from 'react';
import { TextField,Box, FormControl, InputLabel,Select, MenuItem, Button} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getTipologiaProfilo, manageError} from "../api/api";
import {  NotificheList, FlagContestazione, Contestazione, ElementMultiSelect, ListaRecCon, OptionMultiselectChackbox  } from "../types/typeReportDettaglio";
import { BodyListaNotifiche } from "../types/typesGeneral";
import ModalContestazione from '../components/reportDettaglio/modalContestazione';
import ModalInfo from "../components/reusableComponents/modals/modalInfo";
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";
import DownloadIcon from '@mui/icons-material/Download';
import MultiSelectStatoContestazione from "../components/reportDettaglio/multiSelectGroupedBy";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import ModalScadenziario from "../components/reportDettaglio/modalScadenziario";
import { downloadNotifche, downloadNotifcheConsolidatore, downloadNotifcheRecapitista, getContestazione, getContestazioneCosolidatore, getContestazioneRecapitista, listaEntiNotifichePage, listaEntiNotifichePageConsolidatore, listaNotifiche, listaNotificheConsolidatore, listaNotificheRecapitista } from "../api/apiSelfcare/notificheSE/api";
import { downloadNotifchePagoPa, getAnniNotifiche, getContestazionePagoPa, getMesiNotifiche, getTipologiaEntiCompletiPagoPa, listaNotifichePagoPa } from "../api/apiPagoPa/notifichePA/api";
import { getTipologiaProdotto } from "../api/apiSelfcare/moduloCommessaSE/api";
import GridCustom from "../components/reusableComponents/grid/gridCustom";
import ModalRedirect from "../components/commessaInserimento/madalRedirect";
import { profiliEnti} from "../reusableFunction/actionLocalStorage";
import { mesiGrid, mesiWithZero, tipoNotifica } from "../reusableFunction/reusableArrayObj";
import { GlobalContext } from "../store/context/globalContext";
import { PathPf } from "../types/enum";

const ReportDettaglio : React.FC = () => {
    const globalContextObj = useContext(GlobalContext);
    const {
        dispatchMainState,
        mainState,
        setOpenModalInfo,
        openModalInfo
    } = globalContextObj;

    const enti = profiliEnti(mainState);
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const filters = JSON.parse(localStorage.getItem('filters')|| '{}') ;
    const isInitialRender = useRef(true);
 
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
    const [contestazioneStatic, setContestazioneStatic] = useState<Contestazione>({ 
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
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [valueFgContestazione, setValueFgContestazione] = useState<FlagContestazione[]>([]);       
    const [open, setOpen] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [showLoadingGrid, setShowLoadingGrid] = useState(false);
    const [showModalScadenziario, setShowModalScadenziario ] = useState(false);   
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
    const [bodyGetLista, setBodyGetLista] = useState<BodyListaNotifiche>({
        profilo:'',
        prodotto:'',
        anno:0,
        mese:0, 
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
        anno:0,
        mese:0, 
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

    const [arrayAnni,setArrayAnni] = useState<number[]>([]);
    const [arrayMesi,setArrayMesi] = useState<{mese:number,descrizione:string}[]>([]);

    useEffect(() => {
        if(Object.keys(filters).length > 0 && filters.pathPage === PathPf.LISTA_NOTIFICHE){
            funInitialRender(filters.body, true);
        }else{
            funInitialRender(bodyGetLista, false);
        }
        //per prendere i dati dalla local fai una seconda funzione inital render
        
        /*
        const result = getFiltersFromLocalStorageNotifiche();
        
        getProdotti();
        getAnni();
        if(Object.keys(result).length > 0 ){
       
            getProfili();
            setBodyGetLista(result.bodyGetLista);
            setTextValue(result.textValue);
            setValueAutocomplete(result.valueAutocomplete);
            setValueFgContestazione(result.valueFgContestazione);
            setPage(result.page);
            setRowsPerPage(result.rowsPerPage);
            setBodyDownload(result.bodyGetLista);

            if(profilo.auth === 'SELFCARE' && mainState.datiFatturazione === true){
                getlistaNotifiche( result.page + 1, result.rowsPerPage,result.bodyGetLista); 
            }else if(profilo.auth === 'PAGOPA'){
                getRecapitistConsolidatori();
                getlistaNotifichePagoPa( result.page + 1, result.rowsPerPage,result.bodyGetLista);
            }
        }else{
            if(profilo.auth === 'SELFCARE' && mainState.datiFatturazione === true){
                
                getlistaNotifiche( page + 1, rowsPerPage,bodyGetLista); 
            }else if(profilo.auth === 'PAGOPA'){
                console.log(bodyGetLista,'ecco la');
                getRecapitistConsolidatori();
                getlistaNotifichePagoPa( page + 1, rowsPerPage,bodyGetLista);
            }
        }
        */
    }, []);

  

    ////////////////////////////////////////////
   


    useEffect(()=>{
        if((bodyGetLista.anno !== 0) &&  (isInitialRender.current === false)){
            getMesi(bodyGetLista.anno.toString());
        }
    },[bodyGetLista.anno]);
   

    const funInitialRender = async(newBody, dataFromLocalStorage) => {
        setGetNotificheWorking(true);
        getProdotti();
        getProfili();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {idEnti, recapitisti, consolidatori, ...body} = newBody;
        await getAnniNotifiche(token, profilo.nonce).then(async(resAnno)=> {
            const allYearToNumber = resAnno.data.map( el => Number(el));
            let annoToSet = resAnno.data[0];
            if(dataFromLocalStorage){
                annoToSet = filters.body.anno;
            }
            setArrayAnni(allYearToNumber);
            if(resAnno.data.length > 0){
                await getMesiNotifiche(token, profilo.nonce,{anno:annoToSet?.toString()}).then(async(resMese)=> {
                    /*const makeCamelCaseMonth = res.data.map(el =>{
                el.descrizione = el.descrizione.charAt(0).toUpperCase() + el.descrizione.slice(1).toLowerCase();
                return el;
            } );*/
                    setArrayMesi(resMese.data);
                    let meseToSet = resMese.data[0].mese;
                    let page = 1;
                    let row = 10;
                  
                    if(profilo.auth === 'SELFCARE' && mainState.datiFatturazione === true){
                        await getlistaNotifiche( page, row,{...body,...{mese:Number(meseToSet),anno:Number(annoToSet)}}); 
                    }else if((profilo.auth === 'SELFCARE') && (profilo.profilo === 'CON' || profilo.profilo === 'REC')){
                        await getlistaNotifiche( page, row,{...body,...{mese:Number(meseToSet),anno:Number(annoToSet)}});
                    }else if(profilo.auth === 'PAGOPA'){
                        await getlistaNotifichePagoPa( page, row,{...newBody,...{mese:Number(meseToSet),anno:Number(annoToSet)}});
                        await getRecapitistConsolidatori();
                    }
                    // reset del body sia list che download
                    setBodyGetLista({...newBody,...{mese:Number(meseToSet),anno:Number(annoToSet)}});
                    setBodyDownload({...newBody,...{mese:Number(meseToSet),anno:Number(annoToSet)}});
                    if(dataFromLocalStorage){
                        setTextValue(filters.textAutocomplete);
                        setValueAutocomplete(filters.valueAutocomplete);
                        setValueFgContestazione(filters.valueFgContestazione);
                        setPage(filters.page);
                        setRowsPerPage(filters.row);
    
                        meseToSet = filters.body.mese;
                        page = filters.page;
                        row = filters.row;
                    }
                }).catch((err)=>{
                    manageError(err,dispatchMainState);
                    setGetNotificheWorking(false);
                });
            }
        //getire l'assenza di mesi
        }).catch((err)=>{
            setGetNotificheWorking(false);
            manageError(err,dispatchMainState);
        });
    };
    ///////////////////////////////////////////////////
    useEffect(()=>{
        if( 
            bodyGetLista.profilo !== '' ||
                    bodyGetLista.prodotto !== '' ||
                    bodyGetLista.tipoNotifica !== null ||
                    bodyGetLista.statoContestazione.length !== 0 ||
                    bodyGetLista.cap !== null ||
                    bodyGetLista.idEnti?.length !== 0 ||
                    bodyGetLista.mese !== Number(arrayMesi[0]?.mese) ||
                    bodyGetLista.anno !== arrayAnni[0]||
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
        if((mainState.datiFatturazione === false || mainState.datiFatturazioneNotCompleted) && enti){
            setOpenModalRedirect(true);
        }
    },[]);

    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue?.length >= 3){
                listaEntiNotifichePageOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);

    const getAnni = async () => {
        setGetNotificheWorking(true);
        await getAnniNotifiche(token, profilo.nonce).then((res)=> {
            const allYearToNumber = res.data.map( el => Number(el));
            setArrayAnni(allYearToNumber);
            if(res.data.length > 0){
                setBodyGetLista((prev)=> ({...prev, ...{anno:allYearToNumber[0]}}));
            }
        }).catch((err)=>{
            setGetNotificheWorking(false);
            manageError(err,dispatchMainState);
        
        });
    };

    const getMesi = async (anno) => {
        await getMesiNotifiche(token, profilo.nonce,{anno}).then((res)=> {
            /*const makeCamelCaseMonth = res.data.map(el =>{
                el.descrizione = el.descrizione.charAt(0).toUpperCase() + el.descrizione.slice(1).toLowerCase();
                return el;
            } );*/
            setArrayMesi(res.data);
            if(res.data.length > 0){
                setBodyGetLista((prev)=> ({...prev, ...{mese:Number(res.data[0].mese)}}));
            }  
            setGetNotificheWorking(false);
        }).catch((err)=>{
            manageError(err,dispatchMainState);
            setGetNotificheWorking(false);
        });
    };

    // servizio che popola la select con la checkbox
    const listaEntiNotifichePageOnSelect = async () =>{
        if(profilo.profilo === 'CON'){
            await listaEntiNotifichePageConsolidatore(token, profilo.nonce, {descrizione:textValue} )
                .then((res)=>{
                    setDataSelect(res.data);
                })
                .catch(((err)=>{
                    manageError(err,dispatchMainState);
                }));
        }else if(profilo.auth === 'PAGOPA'){
            await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue} )
                .then((res)=>{
                    setDataSelect(res.data);
                })
                .catch(((err)=>{
                    manageError(err,dispatchMainState);
                }));
        }
    };

    // Modifico l'oggetto notifica per fare il binding dei dati nel componente GRIDCUSTOM
    let headerNames: string[] = [];
    const notificheListWithOnere = notificheList.map((notifica:NotificheList) =>{
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
            mese:mesiGrid[Number(notifica.mese)],
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {ragioneSociale, ...result} = element;
            return result;
        }else{
            headerNames = ['Contestazione', 'Onere', 'Recipient ID','Anno', 'Mese','Ragione Sociale', 'Tipo Notifica','IUN', 'Data invio','Stato estero', 'CAP', 'Costo', ''];
            return element;
        }
    });

    const onAnnullaFiltri = async () =>{
        // to make call equal on initial render
        localStorage.removeItem("filters");
        isInitialRender.current = true;
        funInitialRender({
            profilo:'',
            prodotto:'',
            anno:0,
            mese:0,
            tipoNotifica:null,
            statoContestazione:[],
            cap:null,
            iun:null,
            idEnti:[],
            recipientId:null,
            recapitisti:[],
            consolidatori:[]
        },false);
        setStatusAnnulla('hidden');
        setValueFgContestazione([]);
        setDataSelect([]);
        setValueAutocomplete([]);
        setPage(0);
        setRowsPerPage(10);
        /*
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {idEnti, recapitisti, consolidatori, ...body} = newBody;
        if(enti){
            await listaNotifiche(token,profilo.nonce,1,10, body)
                .then((res)=>{
                    setNotificheList(res.data.notifiche);
                    setTotalNotifiche(res.data.count); 
                    setGetNotificheWorking(false);   
                }).catch((error)=>{
                    setNotificheList([]);
                    setTotalNotifiche(0);
                    setGetNotificheWorking(false);
                    manageError(error, dispatchMainState);
                });
        }else if(profilo.profilo === 'REC'){
            await listaNotificheRecapitista(token,profilo.nonce,1, 10, body)
                .then((res)=>{
                    setNotificheList(res.data.notifiche);
                    setTotalNotifiche(res.data.count);
                    // abilita button filtra e annulla filtri all'arrivo dei dati
                    setGetNotificheWorking(false);
                }).catch((error)=>{
                // abilita button filtra e annulla filtri all'arrivo dei dati
                    setGetNotificheWorking(false);
                    setNotificheList([]);
                    setTotalNotifiche(0);
                    manageError(error, dispatchMainState);
                });
        }else if(profilo.profilo === 'CON'){
            await listaNotificheConsolidatore(token,profilo.nonce,1, 10, body)
                .then((res)=>{
                    setNotificheList(res.data.notifiche);
                    setTotalNotifiche(res.data.count);
                    // abilita button filtra e annulla filtri all'arrivo dei dati
                    setGetNotificheWorking(false);
                }).catch((error)=>{
                // abilita button filtra e annulla filtri all'arrivo dei dati
                    setGetNotificheWorking(false);
                    setNotificheList([]);
                    setTotalNotifiche(0);
                    manageError(error, dispatchMainState);
                });
        }else if(profilo.auth === 'PAGOPA'){
            await listaNotifichePagoPa(token,profilo.nonce,1,10, newBody)
                .then((res)=>{
                    setNotificheList(res.data.notifiche);
                    setTotalNotifiche(res.data.count);
                    setGetNotificheWorking(false);
                }).catch((error)=>{
                    setNotificheList([]);
                    setTotalNotifiche(0);
                    setGetNotificheWorking(false);
                    manageError(error, dispatchMainState);
                });
        }
                */
    };     

    const getlistaNotifiche = async (nPage:number, nRow:number, bodyParameter) => {
        // elimino idEnti dal paylod della get notifiche lato selfcare
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {idEnti, recapitisti, consolidatori, ...newBody} = bodyParameter;
        // disable button filtra e annulla filtri nell'attesa dei dati
        setShowLoadingGrid(true);
        setGetNotificheWorking(true);
        if(enti){
            await listaNotifiche(token,profilo.nonce,nPage, nRow, newBody)
                .then((res)=>{
                    setNotificheList(res.data.notifiche);
                    setTotalNotifiche(res.data.count);
                    // abilita button filtra e annulla filtri all'arrivo dei dati
                    setGetNotificheWorking(false);
                    setShowLoadingGrid(false);
                }).catch((error)=>{
                // abilita button filtra e annulla filtri all'arrivo dei dati
                    if(error?.response?.status === 404){
                        setNotificheList([]);
                        setTotalNotifiche(0);
                    }
                    setGetNotificheWorking(false);
                    setShowLoadingGrid(false);
                    manageError(error, dispatchMainState);
                });
        }else if(profilo.profilo === 'REC'){
            await listaNotificheRecapitista(token,profilo.nonce,nPage, nRow, newBody)
                .then((res)=>{
                    setNotificheList(res.data.notifiche);
                    setTotalNotifiche(res.data.count);
                    // abilita button filtra e annulla filtri all'arrivo dei dati
                    setGetNotificheWorking(false);
                    setShowLoadingGrid(false);
                }).catch((error)=>{
                    // abilita button filtra e annulla filtri all'arrivo dei dati
                    if(error?.response?.status === 404){
                        setNotificheList([]);
                        setTotalNotifiche(0);
                    }
                    setGetNotificheWorking(false);
                    setShowLoadingGrid(false);
                    manageError(error, dispatchMainState);
                });
        }else if(profilo.profilo === 'CON'){
            await listaNotificheConsolidatore(token,profilo.nonce,nPage, nRow,newBody)
                .then((res)=>{
                    setNotificheList(res.data.notifiche);
                    setTotalNotifiche(res.data.count);
                    // abilita button filtra e annulla filtri all'arrivo dei dati
                    setGetNotificheWorking(false);
                    setShowLoadingGrid(false);
                }).catch((error)=>{
                    // abilita button filtra e annulla filtri all'arrivo dei dati
                    if(error?.response?.status === 404){
                        setNotificheList([]);
                        setTotalNotifiche(0);
                    }
                    setGetNotificheWorking(false);
                    setShowLoadingGrid(false);
                    manageError(error, dispatchMainState);
                });
        }           
    };

    const getlistaNotifichePagoPa = async (nPage:number, nRow:number, bodyParameter) => {
        // disable button filtra e annulla filtri nell'attesa dei dati
        setGetNotificheWorking(true);
        setShowLoadingGrid(true);
        await listaNotifichePagoPa(token,profilo.nonce,nPage, nRow, bodyParameter)
            .then((res)=>{
                // abilita button filtra e annulla filtri all'arrivo dei dati
                setGetNotificheWorking(false);
                setNotificheList(res.data.notifiche);
                setTotalNotifiche(res.data.count); 
                setShowLoadingGrid(false);
            }).catch((error)=>{
                // abilita button filtra e annulla filtri all'arrivo dei dati
                setNotificheList([]);
                setTotalNotifiche(0);
                setGetNotificheWorking(false);
                setShowLoadingGrid(false);
                manageError(error, dispatchMainState);
            });       
    };

    const onButtonFiltra = () =>{
        setPage(0);
        setRowsPerPage(10);
        setBodyDownload(bodyGetLista);
        localStorage.setItem("filters", JSON.stringify({
            pathPage:PathPf.LISTA_NOTIFICHE,
            body:bodyGetLista,
            textAutocomplete:textValue,
            valueAutocomplete:valueAutocomplete,
            page:1,
            row:10,
            valueFgContestazione:valueFgContestazione
        }));
        //setFilterToLocalStorageNotifiche(bodyGetLista,textValue,valueAutocomplete, 0, 10,valueFgContestazione);
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
        localStorage.setItem("filters", JSON.stringify({
            pathPage:PathPf.LISTA_NOTIFICHE,
            body:bodyDownload,
            textValue,
            valueAutocomplete,
            page:realPage,
            row:rowsPerPage,
            valueFgContestazione
        }));
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        localStorage.setItem("filters", JSON.stringify({
            pathPage:PathPf.LISTA_NOTIFICHE,
            body:bodyDownload,
            textValue,
            valueAutocomplete,
            page,
            row:parseInt(event.target.value, 10),
            valueFgContestazione
        }));
        const realPage = page + 1;
        if(profilo.auth === 'SELFCARE'){
            getlistaNotifiche(realPage,parseInt(event.target.value, 10),bodyGetLista);
        }else if(profilo.auth === 'PAGOPA'){
            getlistaNotifichePagoPa(realPage,parseInt(event.target.value, 10),bodyGetLista);
        }  
                          
    };

    const getRecapitistConsolidatori = async() =>{
        await getTipologiaEntiCompletiPagoPa(token, profilo.nonce, 'REC').then((res)=>{     
            setListaRecapitisti(res.data);
        }).catch(((err)=>{
            manageError(err,dispatchMainState);
        }));
        await getTipologiaEntiCompletiPagoPa(token, profilo.nonce, 'CON').then((res)=>{          
            setListaConsolidatori(res.data);
        }).catch(((err)=>{
            manageError(err,dispatchMainState);
        }));
    };
                        
    const getProdotti = async() => {
        await getTipologiaProdotto(token, profilo.nonce )
            .then((res)=>{          
                setProdotti(res.data);
            })
            .catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
    };
                                            
    const getProfili = async() => {
        await getTipologiaProfilo(token, profilo.nonce )
            .then((res)=>{              
                setProfili(res.data);
            })
            .catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
    };

    const getContestazioneModal = async(el) =>{
        const idNotifica = el.id;
        setShowLoadingGrid(true);
        if(enti){
            await getContestazione(token, profilo.nonce , idNotifica)
                .then((res)=>{
                    //se i tempi di creazione di una contestazione sono scaduti show pop up info
                    if(res.data.modifica === false && res.data.chiusura === false && res.data.contestazione.statoContestazione === 1){
                        setShowLoadingGrid(false);
                        setOpenModalInfo({open:true,sentence:'Non è possibile creare una contestazione.'});
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
                    manageError(err,dispatchMainState);
                }));
        }else if( profilo.profilo === 'REC'){
            await getContestazioneRecapitista(token, profilo.nonce , idNotifica )
                .then((res)=>{
                    setShowLoadingGrid(false);
                    //se i tempi di creazione di una contestazione sono scaduti show pop up info
                    if(res.data.modifica === false && res.data.chiusura === false && res.data.contestazione.statoContestazione === 1){
                        setOpenModalInfo({open:true,sentence:'Non è possibile creare una contestazione.'});
                    }else{
                        // atrimenti show pop up creazione contestazione
                        setOpen(true); 
                        setContestazioneSelected(res.data);
                        setContestazioneStatic(res.data);
                    }           
                })
                .catch(((err)=>{
                    setShowLoadingGrid(false);
                    manageError(err,dispatchMainState);
                }));
        }else if( profilo.profilo === 'CON'){
            await getContestazioneCosolidatore(token, profilo.nonce , idNotifica )
                .then((res)=>{
                    setShowLoadingGrid(false);
                    //se i tempi di creazione di una contestazione sono scaduti show pop up info
                    if(res.data.modifica === false && res.data.chiusura === false && res.data.contestazione.statoContestazione === 1){
                        setOpenModalInfo({open:true,sentence:'Non è possibile creare una contestazione.'});
                    }else{
                        // atrimenti show pop up creazione contestazione
                        setOpen(true); 
                        setContestazioneSelected(res.data);
                        setContestazioneStatic(res.data);
                    }           
                })
                .catch(((err)=>{
                    setShowLoadingGrid(false);
                    manageError(err,dispatchMainState);
                }));
        }else if(profilo.auth === 'PAGOPA'){
            await getContestazionePagoPa(token, profilo.nonce , idNotifica ).then((res)=>{
                setShowLoadingGrid(false);
                //se i tempi di creazione di una contestazione sono scaduti show pop up info
                if(res.data.modifica === false && res.data.chiusura === false && res.data.contestazione.statoContestazione === 1){
                    setOpenModalInfo({open:true,sentence:'Non è possibile creare una contestazione.'});
                }else{
                    // atrimenti show pop up creazione contestazione
                    setOpen(true); 
                    setContestazioneSelected(res.data);
                    setContestazioneStatic(res.data);
                }                 
            }).catch(((err)=>{
                setShowLoadingGrid(false);
                manageError(err,dispatchMainState);
            }));
        }
    };

    const downloadNotificheOnDownloadButton = async () =>{
        setShowLoading(true);
        if(enti){
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {idEnti, recapitisti, consolidatori, ...bodyEnti} = bodyDownload;
            await downloadNotifche(token, profilo.nonce,bodyEnti )
                .then((res)=>{
                    const blob = new Blob([res.data], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.setAttribute('hidden', '');
                    a.setAttribute('href', url);
                    a.setAttribute('download',`Notifiche /${notificheList[0].ragioneSociale}/${mesiWithZero[bodyDownload.mese-1]} /${bodyDownload.anno}.csv`);
                    document.body.appendChild(a);
                    a.click();
                    setShowLoading(false);
                    document.body.removeChild(a);        
                })
                .catch(((err)=>{
                    setShowLoading(false);
                    manageError(err,dispatchMainState);
                }));
        }else if(profilo.profilo === 'REC'){
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {idEnti, recapitisti, consolidatori, ...bodyRecapitista} = bodyDownload;
            await downloadNotifcheRecapitista(token, profilo.nonce,bodyRecapitista )
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
                    manageError(err,dispatchMainState);
                    setShowLoading(false);
                }));
        }else if(profilo.profilo === 'CON'){
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { idEnti, recapitisti, consolidatori, ...bodyConsolidatore} = bodyDownload;
            await downloadNotifcheConsolidatore(token, profilo.nonce,bodyConsolidatore )
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
                    manageError(err,dispatchMainState);
                    setShowLoading(false);
                }));
        }else if(profilo.auth === 'PAGOPA'){
            await downloadNotifchePagoPa(token, profilo.nonce,bodyDownload)
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
                    manageError(err,dispatchMainState);
                    setShowLoading(false);
                }));
        }
    }; 
 
    const backgroundColorButtonScadenzario = (profilo.auth === 'PAGOPA' || enti) ? "#0062C3" : 'red';
  
    return (
        <div className="mx-5">
            {/*title container start */}
            <div className="d-flex marginTop24 ">
                <div className="col-9">
                    <Typography variant="h4">Notifiche</Typography>
                </div>
                <div className="col-3 ">
                    <Box sx={{width:'80%', marginLeft:'20px', display:'flex', justifyContent:'end'}}  >
                        <Button  style={{
                            width:'160px',
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
                                <InputLabel>
                            Anno
                                </InputLabel>
                                <Select
                                    id="sea"
                                    label='Seleziona Prodotto'
                                    labelId="search-by-label"
                                    onChange={(e) => {
                                        if (isInitialRender.current) {
                                            isInitialRender.current = false; 
                                        }
                                        const value = Number(e.target.value);
                                        setBodyGetLista((prev)=> ({...prev, ...{anno:value}}));  
                                    }}
                                    value={bodyGetLista.anno||''}
                                >
                                    {arrayAnni.map((el) => (
                                        <MenuItem
                                            key={Math.random()}
                                            value={el}>
                                            {el}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                    <div className="col-3">
                        <Box sx={{width:'80%', marginLeft:'20px'}}  >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel>
                                Mese
                                </InputLabel>
                                <Select
                                    label='Seleziona Mese'
                                    onChange={(e) =>{
                                        const value = Number(e.target.value);
                                        setBodyGetLista((prev)=> ({...prev, ...{mese:value}}));
                                    }}
                                    value={bodyGetLista.mese||''}
                                >
                                    {arrayMesi.map((el) =>{
                                        return(
                                            <MenuItem
                                                key={el.mese}
                                                value={el.mese}
                                            >
                                                {el.descrizione}
                                            </MenuItem>
                                        );
                                    })}
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
                                <InputLabel>
                                    Seleziona Prodotto
                                </InputLabel>
                                <Select
                                    id="prodotto_notifiche"
                                    label='Seleziona Prodotto'
                                    labelId="search-by-label_notifiche"
                                    onChange={(e) => setBodyGetLista((prev)=> ({...prev, ...{prodotto:e.target.value}}))}
                                    value={bodyGetLista.prodotto}
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
                                <InputLabel>
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
                        <Box sx={{width:'80%', marginLeft:'20px'}}>
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
                            setBodyGetLista={setBodyGetLista}
                            dataSelect={dataSelect}
                            setTextValue={setTextValue}
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
                                    <InputLabel>
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
                setOpen={setOpenModalInfo}/>
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
                nonce={profilo.nonce}
                dispatchMainState={dispatchMainState}></ModalScadenziario>                                    
        </div>
    );
};                                        
export default ReportDettaglio;