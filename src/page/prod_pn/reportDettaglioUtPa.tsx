import React , { useState, useEffect, useContext} from 'react';
import { getTipologiaProfilo, manageError, managePresaInCarico} from "../../api/api";
import {NotificheList, FlagContestazione, Contestazione, ElementMultiSelect, ListaRecCon, OptionMultiselectChackbox, OptionMultiselectChackboxTipoNot  } from "../../types/typeReportDettaglio";
import { BodyListaNotifiche, BodyListaNotificheSelfcare } from "../../types/typesGeneral";
import ModalContestazione from '../../components/reportDettaglio/modalContestazione';
import ModalInfo from "../../components/reusableComponents/modals/modalInfo";
import { getAnniNotifiche, getMesiNotifiche, listaNotifichePagoPa, getTipologiaEntiCompletiPagoPa, getContestazionePagoPa, downloadNotifchePagoPa } from "../../api/apiPagoPa/notifichePA/api";
import { getTipologiaProdotto } from "../../api/apiSelfcare/moduloCommessaSE/api";
import { listaEntiNotifichePageConsolidatore, listaEntiNotifichePage, listaNotifiche, listaNotificheRecapitista, listaNotificheConsolidatore, getContestazione, getContestazioneRecapitista, getContestazioneCosolidatore, downloadNotifche, downloadNotifcheRecapitista, downloadNotifcheConsolidatore, getMessaggiCountEnte, flagContestazione } from "../../api/apiSelfcare/notificheSE/api";
import ModalRedirect from "../../components/commessaInserimento/madalRedirect";
import ModalScadenziario from "../../components/reportDettaglio/modalScadenziario";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { profiliEnti } from "../../reusableFunction/actionLocalStorage";
import { mesiGrid, mesiWithZero, tipoNotifica } from "../../reusableFunction/reusableArrayObj";

import { PathPf } from "../../types/enum";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { useGlobalStore } from '../../store/context/useGlobalStore';




const ReportDettaglio : React.FC = () => {
 
    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
    const setCountMessages = useGlobalStore(state => state.setCountMessages);

    const setOpenModalInfo = useGlobalStore(state => state.setOpenModalInfo);
    const openModalInfo = useGlobalStore(state => state.openModalInfo);
    const setStatusQueryGetUri = useGlobalStore(state => state.setStatusQueryGetUri);


    const enti = profiliEnti(mainState);
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    let profilePath; 

    if(profilo.auth === 'PAGOPA'&& profilo.profilo !== "REC" && profilo.profilo !== "CON"){
        profilePath = PathPf.LISTA_NOTIFICHE;
    }else if(profilo.auth === 'PAGOPA' && profilo.profilo === "REC" || profilo.profilo === "CON"){
        profilePath = PathPf.LISTA_NOTIFICHE_REC_CON;
    }else{
        profilePath = PathPf.LISTA_NOTIFICHE_EN;
    }
   
    const [prodotti, setProdotti] = useState([{nome:''}]);
    const [profili, setProfili] = useState([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [notificheList, setNotificheList] = useState<NotificheList[]>([]);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [valueAutocompleteCon, setValueAutocompleteCon] = useState<OptionMultiselectChackbox[]>([]);
    const [valueAutocompleteRec, setValueAutocompleteRec] = useState<OptionMultiselectChackbox[]>([]);
    const [valueAutocompleteTipoNot, setValueAutocompleteTipoNot] = useState<OptionMultiselectChackboxTipoNot[]>([]);
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
            anno: null,
            mese: 0
        }
    });
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [valueFgContestazione, setValueFgContestazione] = useState<FlagContestazione[]>([]);       
    const [open, setOpen] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [showLoadingGrid, setShowLoadingGrid] = useState(true);
    const [showModalScadenziario, setShowModalScadenziario ] = useState(false);   
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
    const [fgContestazione, setFgContestazione] = useState<FlagContestazione[]>([]);
    const [bodyGetLista, setBodyGetLista] = useState<BodyListaNotifiche>({
        profilo:"",
        prodotto:"",
        anno:null,
        mese:null, 
        tipoNotifica:[],
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
        anno:null,
        mese:null, 
        tipoNotifica:[],
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
            anno: null,
            mese: 0
        }
    });
    const [arrayAnni,setArrayAnni] = useState<number[]>([]);
    const [arrayMesi,setArrayMesi] = useState<{mese:number,descrizione:string}[]>([]);
    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(profilePath,{});
    
    useEffect(() => {
        if(isInitialRender.current && Object.keys(filters).length > 0){
            funInitialRender(filters.body, true);
        }else{
            funInitialRender(bodyGetLista, false);
            isInitialRender.current = false;
        }
    }, []);
    
    const funInitialRender = async (newBody, dataFromLocalStorage) => {
        try {
            setGetNotificheWorking(true);

            // Fire these in parallel (not awaiting each)
            getProdotti();
            getProfili();
            getFlagContestazione();

            // Remove unused keys
            const { idEnti, recapitisti, consolidatori, ...body } = newBody;

            const resAnno = await getAnniNotifiche(token, profilo.nonce);
            const allYearToNumber = resAnno.data.map(Number);
            setArrayAnni(allYearToNumber);

            if (resAnno.data.length === 0) {
                setGetNotificheWorking(false);
                return;
            }

            const annoToSet = dataFromLocalStorage ? filters.body.anno : resAnno.data[0];

            const resMese = await getMesiNotifiche(token, profilo.nonce, {
                anno: annoToSet.toString(),
            });

            const camelCaseMonth = resMese.data.map(el => ({
                ...el,
                descrizione:
                el.descrizione.charAt(0).toUpperCase() +
                el.descrizione.slice(1).toLowerCase(),
            }));

            setArrayMesi(camelCaseMonth);

            const meseToSet = dataFromLocalStorage
                ? filters.body.mese
                : camelCaseMonth[0].mese;

            const page = dataFromLocalStorage ? filters.page + 1 : 1;
            const row = dataFromLocalStorage ? filters.rows : 10;

            const newBodyWithDates = {
                ...newBody,
                mese: Number(meseToSet),
                anno: Number(annoToSet),
            };

            setBodyGetLista(newBodyWithDates);
            setBodyDownload(newBodyWithDates);

            
          
            if (profilo.auth === "SELFCARE" && mainState.datiFatturazione) {
                await getlistaNotifiche(page, row, {
                    ...body,
                    mese: Number(meseToSet),
                    anno: Number(annoToSet),
                });
            } else if (
                profilo.auth === "SELFCARE" &&
            (profilo.profilo === "CON" || profilo.profilo === "REC")
            ) {
                await getlistaNotifiche(page, row, {
                    ...body,
                    mese: Number(meseToSet),
                    anno: Number(annoToSet),
                });
            } else if (profilo.auth === "PAGOPA") {
                await getlistaNotifichePagoPa(page, row, newBodyWithDates);
                await getRecapitistConsolidatori();
            }
            // Restore filters only if needed
            if (dataFromLocalStorage) {
                setTextValue(filters.textAutocomplete);
                setValueAutocomplete(filters.valueAutocomplete);
                setValueFgContestazione(filters.valueFgContestazione);
                setValueAutocompleteCon(filters.valueAutocompleteCon);
                setValueAutocompleteRec(filters.valueAutocompleteRec);
                setValueAutocompleteTipoNot(filters.valueAutocompleteTipoNot);
              
                setPage(filters.page);
                setRowsPerPage(filters.rows);
            }

        } catch (err) {
            console.log("Error NOTIFICHE");
        } finally {
            setGetNotificheWorking(false);
        }
    };
    
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

    const getFlagContestazione =  async() => {
        await flagContestazione(token, profilo.nonce ).then((res)=>{
            setFgContestazione(res.data);                
        }).catch(((err)=>{
            manageError(err,dispatchMainState);
        }));
    };
    
    const getMesi = async (anno) => {
        await getMesiNotifiche(token, profilo.nonce,{anno}).then((res)=> {

            const camelCaseMonth = res.data.map((el) =>{
                el.descrizione = el?.descrizione.charAt(0).toUpperCase() + el.descrizione.slice(1).toLowerCase();
                return el;
            });
         
            setArrayMesi(camelCaseMonth);
            if(camelCaseMonth.length > 0){
                setBodyGetLista((prev)=> ({...prev, ...{mese:Number(camelCaseMonth[0].mese)}}));
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
            await listaEntiNotifichePageConsolidatore(token, profilo.nonce, {descrizione:textValue} ).then((res)=>{
                setDataSelect(res.data);
            }).catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
        }else if(profilo.auth === 'PAGOPA'){
            await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue} ).then((res)=>{
                setDataSelect(res.data);
            }).catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
        }
    };
    
    // Modifico l'oggetto notifica per fare il binding dei dati nel componente GRIDCUSTOM
    let headerNames: string[] = [];
    const notificheListWithOnere = notificheList.map((notifica:NotificheList) =>{
        let newOnere = '--';
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
            recipientId:notifica.recipientId||"--",
            anno:notifica.anno,
            mese:mesiGrid[Number(notifica.mese)],
            ragioneSociale:notifica.ragioneSociale,
            tipoNotifica:notifica.tipoNotifica||"--",
            iun:notifica.iun||"--",
            dataInvio:new Date(notifica.dataInvio).toISOString().split('T')[0],
            statoEstero:notifica.statoEstero||"--",
            cap:notifica.cap||"--",
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
    
    const onAnnullaFiltri = () =>{
        // to make call equal on initial render
        funInitialRender({
            profilo:'',
            prodotto:'',
            anno:null,
            mese:null,
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
        setValueAutocompleteCon([]);
        setValueAutocompleteRec([]);
        setValueAutocompleteTipoNot([]);
        setPage(0);
        setRowsPerPage(10);
        resetFilters();
    };     
    
    const getlistaNotifiche = async (nPage:number, nRow:number, bodyParameter = bodyGetLista) => {
        // elimino idEnti dal paylod della get notifiche lato selfcare
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {idEnti, recapitisti, consolidatori, ...newBody} = bodyParameter;
        // disable button filtra e annulla filtri nell'attesa dei dati
        setShowLoadingGrid(true);
        setGetNotificheWorking(true);
        const bodyTipoNotificaNumberOrNull: BodyListaNotificheSelfcare = {
            ...newBody,
            tipoNotifica: Array.isArray(newBody.tipoNotifica)
                ? newBody.tipoNotifica[0] ?? null
                : newBody.tipoNotifica ?? null,
        };

        if(enti){
           
            await listaNotifiche(token,profilo.nonce,nPage, nRow, bodyTipoNotificaNumberOrNull).then((res)=>{
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
            await listaNotificheRecapitista(token,profilo.nonce,nPage, nRow, bodyTipoNotificaNumberOrNull).then((res)=>{
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
            await listaNotificheConsolidatore(token,profilo.nonce,nPage, nRow,bodyTipoNotificaNumberOrNull).then((res)=>{
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
        isInitialRender.current = false;      
    };
    
    const getlistaNotifichePagoPa = async (nPage:number, nRow:number, bodyParameter = bodyGetLista) => {
        // disable button filtra e annulla filtri nell'attesa dei dati
        setGetNotificheWorking(true);
        setShowLoadingGrid(true);
        await listaNotifichePagoPa(token,profilo.nonce,nPage, nRow, bodyParameter).then((res)=>{
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
        isInitialRender.current = false;   
    };
    
    const clearOnChangeFilter = () => {
        setNotificheList([]);
        setPage(0);
        setRowsPerPage(10);  
        setTotalNotifiche(0); 
    };
    
    const onButtonFiltra = () =>{
        setPage(0);
        setRowsPerPage(10);
        setBodyDownload(bodyGetLista);

        updateFilters({
            pathPage:profilePath,
            body:bodyGetLista,
            textAutocomplete:textValue,
            valueAutocomplete:valueAutocomplete,
            valueAutocompleteCon:valueAutocompleteCon,
            valueAutocompleteRec:valueAutocompleteRec,
            valueAutocompleteTipoNot:valueAutocompleteTipoNot,
            page:0,
            rows:10,
            valueFgContestazione:valueFgContestazione
        });
        if(profilo.auth === 'SELFCARE'){
            getlistaNotifiche(1, 10,bodyGetLista);
        }else{
            getlistaNotifichePagoPa(1, 10,bodyGetLista);
        }  
        isInitialRender.current = false;
        
    };
    
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        const realPage = newPage + 1;
        if(profilo.auth === 'SELFCARE'){
            getlistaNotifiche(realPage,rowsPerPage, bodyDownload);
        }else if(profilo.auth === 'PAGOPA'){
            getlistaNotifichePagoPa(realPage,rowsPerPage, bodyDownload);
        }
        setPage(newPage);
        updateFilters({
            pathPage:profilePath,
            body:bodyDownload,
            textValue,
            valueAutocomplete,
            valueAutocompleteCon:valueAutocompleteCon,
            valueAutocompleteRec:valueAutocompleteRec,
            valueAutocompleteTipoNot:valueAutocompleteTipoNot,
            page:newPage,
            rows:rowsPerPage,
            valueFgContestazione
        });
    };
    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        updateFilters({
            pathPage:profilePath,
            body:bodyDownload,
            textValue,
            valueAutocomplete,
            valueAutocompleteCon:valueAutocompleteCon,
            valueAutocompleteRec:valueAutocompleteRec,
            valueAutocompleteTipoNot:valueAutocompleteTipoNot,
            page,
            rows:parseInt(event.target.value, 10),
            valueFgContestazione
        });
        const realPage = page + 1;
        if(profilo.auth === 'SELFCARE'){
            getlistaNotifiche(realPage,parseInt(event.target.value, 10),bodyDownload);
        }else if(profilo.auth === 'PAGOPA'){
            getlistaNotifichePagoPa(realPage,parseInt(event.target.value, 10),bodyDownload);
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
        await getTipologiaProdotto(token, profilo.nonce ).then((res)=>{          
            setProdotti(res.data);
        }).catch(((err)=>{
            manageError(err,dispatchMainState);
        }));
    };
    
    const getProfili = async() => {
        await getTipologiaProfilo(token, profilo.nonce ).then((res)=>{              
            setProfili(res.data);
        }).catch(((err)=>{
            manageError(err,dispatchMainState);
        }));
    };
    
    const getContestazioneModal = async(el) =>{
        const idNotifica = el.id;
        setShowLoadingGrid(true);
        if(enti){
            await getContestazione(token, profilo.nonce , idNotifica).then((res)=>{
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
            }).catch(((err)=>{
                setShowLoadingGrid(false);
                manageError(err,dispatchMainState);
            }));
        }else if( profilo.profilo === 'REC'){
            await getContestazioneRecapitista(token, profilo.nonce , idNotifica ).then((res)=>{
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
        }else if( profilo.profilo === 'CON'){
            await getContestazioneCosolidatore(token, profilo.nonce , idNotifica ).then((res)=>{
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
            const {idEnti, recapitisti, consolidatori, ...bodyEnti} = bodyDownload; 
            // eslint-disable-next-line @typescript-eslint/no-unused-vars  

            const bodyTipoNotificaNumberOrNull: BodyListaNotificheSelfcare = {
                ...bodyEnti,
                tipoNotifica: Array.isArray(bodyEnti.tipoNotifica)
                    ? bodyEnti.tipoNotifica[0] ?? null
                    : bodyEnti.tipoNotifica ?? null,
            };
            await downloadNotifche(token, profilo.nonce,bodyTipoNotificaNumberOrNull ).then(async(res)=>{
                setShowLoading(false); 
                setStatusQueryGetUri([res?.data?.statusQueryGetUri]);
                managePresaInCarico('PRESA_IN_CARICO_DOCUMENTO_ENTE',dispatchMainState);
                await getMessaggiCountEnte(token,profilo.nonce).then((res)=>{
                    const numMessaggi = res.data;
                    setCountMessages(numMessaggi);
                }).catch((err)=>{
                    return;
                });
            }).catch(((err)=>{
                setShowLoading(false);
                if(err?.response?.request?.status === 300){
                    managePresaInCarico("DOWNLOAD_NOTIFICHE_DOUBLE_REQUEST",dispatchMainState);
                }else if(err?.response?.request?.status === 404){
                    managePresaInCarico(400,dispatchMainState);
                }else if(err?.response?.request?.status === 400){
                    managePresaInCarico('NO_OPERAZIONE',dispatchMainState);
                }else{
                    manageError(err,dispatchMainState);
                }
            }));
          
          
        }else if(profilo.profilo === 'REC'){
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {idEnti, recapitisti, consolidatori, ...bodyRecapitista} = bodyDownload;
            const bodyTipoNotificaNumberOrNull: BodyListaNotificheSelfcare = {
                ...bodyRecapitista,
                tipoNotifica: Array.isArray(bodyRecapitista.tipoNotifica)
                    ? bodyRecapitista.tipoNotifica[0] ?? null
                    : bodyRecapitista.tipoNotifica ?? null,
            };
            await downloadNotifcheRecapitista(token, profilo.nonce,bodyTipoNotificaNumberOrNull ).then((res)=>{
                const blob = new Blob([res.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('hidden', '');
                a.setAttribute('href', url);
                a.setAttribute('download',`Notifiche /${mesiWithZero[(bodyDownload?.mese||0)-1]} /${bodyDownload.anno}.csv`);
                document.body.appendChild(a);
                a.click();
                setShowLoading(false);
                document.body.removeChild(a); 
            }).catch(((err)=>{
                manageError(err,dispatchMainState);
                setShowLoading(false);
            }));
        }else if(profilo.profilo === 'CON'){
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { idEnti, recapitisti, consolidatori, ...bodyConsolidatore} = bodyDownload;
            const bodyTipoNotificaNumberOrNull: BodyListaNotificheSelfcare = {
                ...bodyConsolidatore,
                tipoNotifica: Array.isArray(bodyConsolidatore.tipoNotifica)
                    ? bodyConsolidatore.tipoNotifica[0] ?? null
                    : bodyConsolidatore.tipoNotifica ?? null,
            };
            await downloadNotifcheConsolidatore(token, profilo.nonce,bodyTipoNotificaNumberOrNull ).then((res)=>{
                const blob = new Blob([res.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('hidden', '');
                a.setAttribute('href', url);
                a.setAttribute('download', `Notifiche /${mesiWithZero[(bodyDownload?.mese||0)-1]} /${bodyDownload.anno}.csv`);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setShowLoading(false);
            }).catch(((err)=>{
                manageError(err,dispatchMainState);
                setShowLoading(false);
            }));
        }else if(profilo.auth === 'PAGOPA'){
            await downloadNotifchePagoPa(token, profilo.nonce,bodyDownload).then((res)=>{
                let fileName = `Notifiche /${mesiWithZero[(bodyDownload?.mese||0)-1]} /${bodyDownload.anno}.csv`;
                if(bodyDownload.idEnti.length === 1){
                    fileName = `Notifiche /${notificheList[0].ragioneSociale}/${mesiWithZero[(bodyDownload?.mese||0)-1]} /${bodyDownload.anno}.csv`;
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
            }).catch(((err)=>{
                manageError(err,dispatchMainState);
                setShowLoading(false);
            }));
        }
    }; 
    
    
    return (
      
        <MainBoxStyled title={"Notifiche"} actionButton={[{
            onButtonClick: () => setShowModalScadenziario(true),
            variant: "outlined",
            icon:{name:"event_note", sx:{} },
            withText:false,
            tooltipMessage:"Scadenzario contestazioni"
        }]}>
            <ResponsiveGridContainer >
                <MainFilter 
                    filterName={"select_value_string"} 
                    inputLabel={"Anno"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyValue={"anno"}
                    keyDescription='anno'
                    keyBody={"anno"}
                    arrayValues={arrayAnni}
                    extraCodeOnChange={(e)=>{
                        isInitialRender.current = false;
                        const value = Number(e);
                        setBodyGetLista((prev)=> ({...prev, ...{anno:value}}));  
                        getMesi(e.toString());
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_key_value"}
                    inputLabel={"Mese"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyValue={"mese"}
                    keyDescription='descrizione'
                    keyBody={"mese"}
                    arrayValues={arrayMesi}
                    extraCodeOnChange={(e)=>{
                        const value = Number(e);
                        setBodyGetLista((prev)=> ({...prev, ...{mese:value}}));
                      
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"input_text"}
                    inputLabel={"IUN"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyDescription='iun'
                    keyBody={"iun"}
                    keyValue={"iun"} //ad input text non viene utilizzata
                    extraCodeOnChange={(e)=>{
                        setBodyGetLista((prev)=>{             
                            if(e === ''){
                                return {...prev, ...{iun:null}};
                            }else{
                                return {...prev, ...{iun:e}};
                            }
                        });
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_key_value"}
                    inputLabel={"Tipo notifica"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    extraCodeOnChange={(e)=>{
                        setBodyGetLista((prev)=>{             
                            if(e === '' || e === null){
                                return {...prev, ...{tipoNotifica:[]}};
                            }else{
                                return {...prev, ...{tipoNotifica:[Number(e)]}};
                            }
                        });
                    }}
                    body={bodyGetLista}
                    keyValue={"id"}
                    keyDescription='name'
                    keyBody={"tipoNotifica"}
                    hidden={profilo.auth === 'PAGOPA'}
                    arrayValues={tipoNotifica}
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Tipo notifica"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    valueAutocomplete={valueAutocompleteTipoNot}
                    setValueAutocomplete={setValueAutocompleteTipoNot}
                    keyDescription={"name"}
                    keyValue={"id"}
                    keyOption='name'
                    iconMaterial={RenderIcon("type-not",true)}
                    keyCompare={""}
                    dataSelect={tipoNotifica}
                    setTextValue={setTextValue}
                    hidden={profilo.auth !== 'PAGOPA'}
                    arrayValues={tipoNotifica}
                    keyBody={"tipoNotifica"}
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Contestazione"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    keyCompare={""}
                    dataSelect={fgContestazione}
                    body={bodyGetLista}
                    setTextValue={setTextValue}
                    textValue={textValue}
                    valueAutocomplete={valueFgContestazione}
                    setValueAutocomplete={setValueFgContestazione}
                    keyDescription={"flag"}
                    arrayValues={fgContestazione}
                    keyValue={"id"}
                    keyOption='flag'
                    groupByKey={"descrizione"}
                    keyBody={"statoContestazione"}
                    iconMaterial={RenderIcon("invoice",true)}
                ></MainFilter>
                <MainFilter 
                    filterName={"input_text"}
                    inputLabel={"CAP"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyValue={"cap"}
                    keyDescription={"cap"}
                    keyBody={"cap"}
                    extraCodeOnChange={(e)=>{
                        setBodyGetLista((prev)=>{             
                            if(e === ''){
                                return {...prev, ...{cap:null}};
                            }else{
                                return {...prev, ...{cap:e}};
                            }
                        });
                    }}
                    defaultValue={""}
                ></MainFilter>
                <MainFilter 
                    filterName={"input_text"}
                    inputLabel={"Recipient ID"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyValue={"recipientId"}
                    keyDescription={"recipientId"}
                    keyBody={"recipientId"}
                    extraCodeOnChange={(e)=>{
                        setBodyGetLista((prev)=>{             
                            if(e === ''){
                                return {...prev, ...{recipientId:null}};
                            }else{
                                return {...prev, ...{recipientId:e}};
                            }
                        });
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Rag. Soc. Ente"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyCompare={""}
                    dataSelect={dataSelect}
                    setTextValue={setTextValue}
                    textValue={textValue}
                    valueAutocomplete={valueAutocomplete}
                    setValueAutocomplete={setValueAutocomplete}
                    keyDescription={"descrizione"}
                    keyValue={"idEnte"}
                    keyOption='descrizione'
                    keyBody={"idEnti"}
                    hidden={profilo.auth !== 'PAGOPA'}
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Consolidatore"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    valueAutocomplete={valueAutocompleteCon}
                    setValueAutocomplete={setValueAutocompleteCon}
                    keyDescription={"descrizione"}
                    keyValue={"idEnte"}
                    keyOption='descrizione'
                    iconMaterial={RenderIcon("person",true)}
                    keyCompare={""}
                    dataSelect={listaConsolidatori}
                    hidden={profilo.auth !== 'PAGOPA'}
                    arrayValues={listaConsolidatori}
                    keyBody={"consolidatori"}
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Recapitista"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    valueAutocomplete={valueAutocompleteRec}
                    setValueAutocomplete={setValueAutocompleteRec}
                    keyDescription={"descrizione"}
                    keyValue={"idEnte"}
                    keyOption='descrizione'
                    iconMaterial={RenderIcon("person",true)}
                    keyCompare={""}
                    dataSelect={listaRecapitista}
                    hidden={profilo.auth !== 'PAGOPA'}
                    arrayValues={listaRecapitista}
                    keyBody={"recapitisti"}
                ></MainFilter>
            </ResponsiveGridContainer>
            <FilterActionButtons 
                onButtonFiltra={onButtonFiltra} 
                onButtonAnnulla={onAnnullaFiltri} 
                statusAnnulla={statusAnnulla} 
            ></FilterActionButtons>
            <ActionTopGrid
                actionButtonRight={[{
                    onButtonClick: () => downloadNotificheOnDownloadButton(),
                    variant: "outlined",
                    label: "Download risultati",
                    icon:{name:"download" },
                    disabled:(notificheList.length === 0 || getNotificheWorking|| mainState.apiError !== null)
                }]}
            />      
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
                disabled={getNotificheWorking}
                widthCustomSize="2000px"></GridCustom>                        
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
                sentence={profilo.auth === "PAGOPA"?'Downloading...':"Elaborazione in corso"} >
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
        </MainBoxStyled>
    );
};                                        
export default ReportDettaglio;


