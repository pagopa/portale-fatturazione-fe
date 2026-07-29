import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { BodyFatturazione, FattureObj, TipologiaSap} from "../../types/typeFatturazione";
import { manageError, manageErrorDownload, managePresaInCarico } from "../../api/api";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import { listaEntiNotifichePage } from "../../api/apiSelfcare/notificheSE/api";
import {  useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { month, statoInvio } from "../../reusableFunction/reusableArrayObj";
import ModalSap from "../../components/fatturazione/modalSap";
import { useNavigate } from "react-router";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { PathPf } from "../../types/enum";
import { downloadFatturePagopa, downloadFattureReportPagopa, fattureCancellazioneRipristinoPagoPa, fattureTipologiaSapPa, getAnniDocEmessiPagoPa, getFatturazionePagoPa, getMesiDocEmessiPagoPa, getTipologieContratto, getTipologieFaPagoPa, getTipologieFaPagoPaWithData } from "../../api/apiPagoPa/fatturazionePA/api";
import { getMessaggiCount } from "../../api/apiPagoPa/centroMessaggi/api";
import ModalConfermaRipristina from "../../components/fatturazione/modalConfermaRipristina";
import ModalResetFilter from "../../components/fatturazione/modalResetFilter";
import {  headersObjGridDocemessiSend, headersObjGridDocemessiSendCollapse } from "../../assets/configurations/config_GridFatturazione";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import ModalInfo from "../../components/reusableComponents/modals/modalInfo";

import { gestioneFattureInserisci } from "../../api/apiPagoPa/gestioneFatturePA/api";
import { formatDate } from "../../reusableFunction/function";
import { ElementToProcessComponent } from "./gestioneFatture";
import { ManageErrorResponse } from "../../types/typesGeneral";



const Fatturazione : React.FC = () =>{
  const mainState = useGlobalStore(state => state.mainState);
  const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
  const setCountMessages = useGlobalStore(state => state.setCountMessages);


  const token =  mainState.profilo.jwt;
  const profilo =  mainState.profilo;
  const callLista = useRef(true);
  const callAnnulla = useRef(false);
  const navigate = useNavigate();
  const profilePath = PathPf.FATTURAZIONE;


  const [firstYearMonth, setFirstYearMonth] = useState<number[]>([]);
  const [gridData, setGridData] = useState<FattureObj[]>([]);
  const [arrayYears,setArrayYears] = useState<number[]>([]);
  const [arrayMonths,setArrayMonths] = useState<{mese:string,descrizione:string}[]>([]);
  const [showLoadingGrid,setShowLoadingGrid] = useState(false);
  const [showDownloading,setShowDownloading] = useState(false);
  const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
  const [textValue, setTextValue] = useState('');
  const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
  const [tipologie, setTipologie] = useState<string[]>([]);
  const [valueMulitselectTipologie, setValueMultiselectTipologie] = useState<string[]>([]);
  const [disableButtonSap, setDisableButtonSap] = useState<boolean>(true);
  const [disableButtonReset, setDisableButtonReset] = useState<boolean>(true);
  const [openSapModal, setOpenSapModal] = useState<{who:number,show:boolean}>({who:0,show:false});
  const [openConfermaModal,setOpenConfermaModal] = useState(false);
  const [openResetFilterModal,setOpenResetFilterModal] = useState(false);
  const [responseTipologieSap, setResponseTipologieSap] = useState<TipologiaSap[]>([]);
  const [fattureSelected, setFattureSelected] = useState<number[]>([]);
  const [dateTipologie, setDateTipologie] = useState<string[]>([]);
  const [valueMulitselectDateTipologie, setValueMultiselectDateTipologie] = useState<string[]>([]);
  const [arrayContratti, setArrayContratto] = useState<{id:number,descrizione:string}[]>([{id:3,descrizione:"Tutti"}]);
  const [openModalInfo, setOpenModalInfo] = useState<{open:boolean,sentence:React.ReactNode,buttonIsVisible?:boolean|null,labelButton?:string,actionButton?:()=>void,icon?:React.ElementType }>({open:false, sentence:''});
  const [textAreaValue, setTextAreaValue] = useState<string>('');


  const [elementSelected, setElementSelected] = useState<any>(null);
  const [actionCalled, setActionCalled] = useState<string>("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState(0);
  const [showedData, setShowedData] = useState<FattureObj[]>([]);

   
  const [bodyFatturazione, setBodyFatturazione] = useState<BodyFatturazione>({
    anno:"",
    mese:"",
    tipologiaFattura:[],
    idEnti:[],
    cancellata:false,
    idTipoContratto:null,
    inviata:3
  });

  const [bodyFatturazioneDownload, setBodyFatturazioneDownload] = useState<BodyFatturazione>({
    anno:"",
    mese:"",
    tipologiaFattura:[],
    idEnti:[],
    cancellata:false,
    idTipoContratto:null,
    inviata:3
  });

  const { 
    filters,
    updateFilters,
    resetFilters,
    isInitialRender
  } = useSavedFilters(profilePath,{});

  useEffect(()=>{
    getAnni();
    getContratti(); 
  },[]);

   
   
  useEffect(()=>{
    const timer = setTimeout(() => {
      if(textValue.length >= 3){
        listaEntiNotifichePageOnSelect();
      }
    }, 800);
    return () => clearTimeout(timer);
  },[textValue]);

  //:TODO useEffect da elkiminare
  useEffect(()=>{
    if(bodyFatturazione.anno && bodyFatturazione.mese && !isInitialRender.current){
      getDateTipologieFatturazione(bodyFatturazione);
      setValueMultiselectDateTipologie([]);
    }else if(isInitialRender.current && Object.keys(filters).length > 0){
      getDateTipologieFatturazione(filters.body);
    }else if(isInitialRender.current && bodyFatturazione.anno && bodyFatturazione.mese ){
      getDateTipologieFatturazione(bodyFatturazione);
    }
  },[bodyFatturazione]);
    
  const getAnni = async() => {
    setShowLoadingGrid(true);
    await getAnniDocEmessiPagoPa(token, profilo.nonce).then((res)=>{
      const arrayNumber = res.data.map(el => Number(el.toString()));
      setArrayYears(arrayNumber);
      if(arrayNumber.length > 0 && isInitialRender.current){
        setFirstYearMonth((prev) => ([...prev,arrayNumber[0]]));
      }
      if(isInitialRender.current && Object.keys(filters).length > 0){
        getMesi(filters.body.anno?.toString());
      }else{
        getMesi(res.data[0]);
      }   
    }).catch((err)=>{
      setArrayYears([]);
      setShowLoadingGrid(false);
      manageError(err,dispatchMainState);
    });
  };

  const getContratti = async() => {
    await getTipologieContratto(token, profilo.nonce).then((res)=>{
      setArrayContratto([{id:3,descrizione:"Tutti"}, ...res.data]);
    }).catch(()=>{
      setArrayContratto([]);
    });
  };
   
  const getMesi = async(year) =>{
    await getMesiDocEmessiPagoPa(token, profilo.nonce,{anno:year}).then((res)=>{    
      const mesiCamelCase = res.data.map(el => {
        el.descrizione = el?.descrizione.charAt(0).toUpperCase() + el.descrizione.slice(1).toLowerCase();
        return el;
      });
      if(mesiCamelCase.length > 0 && isInitialRender.current){
        setFirstYearMonth((prev) => ([...prev,Number(mesiCamelCase[0].mese)]));
      }
      setArrayMonths(mesiCamelCase);
      if(isInitialRender.current && Object.keys(filters).length > 0){
        setBodyFatturazione(filters.body);
        setBodyFatturazioneDownload(filters.body);
        setValueAutocomplete(filters.valueAutocomplete);
        setTextValue(filters.textValue);
        setValueMultiselectTipologie(filters.valueMulitselectTipologie);
        setFattureSelected(filters.fattureSelected);
        getlistaFatturazione(filters.body);
      }else{
        setBodyFatturazione({anno:Number(year),mese:mesiCamelCase[0].mese, tipologiaFattura:[],cancellata:false,idEnti:[],idTipoContratto:null,inviata:3});
        getTipologieFatturazione(Number(year),Number(mesiCamelCase[0]?.mese),false);
        setValueMultiselectTipologie([]);
        if(callLista.current){
          getlistaFatturazione({...bodyFatturazione,...{anno:Number(year),mese:mesiCamelCase[0].mese, tipologiaFattura:[],cancellata:false,idEnti:[],idTipoContratto:null}});
        } 
               
      }
    }).catch((err)=>{
      setArrayMonths([]);
      setBodyFatturazione((prev)=> ({...prev,...{mese:0}}));
      setShowLoadingGrid(false);
      manageError(err,dispatchMainState);
    });
  };

  const getTipologieFatturazione =  async(anno,mese,cancellata) => {
    await getTipologieFaPagoPa(token, profilo.nonce, {anno:anno,mese:mese,cancellata:cancellata}  )
      .then((res)=>{
        setTipologie(res.data);
      }).catch((()=>{
        setTipologie([]);
      }));
    isInitialRender.current = false;
  };

  const getDateTipologieFatturazione =  async(body) => {
    await getTipologieFaPagoPaWithData(token, profilo.nonce, body)
      .then((res)=>{
        const result = res.data.map((el)=>{
          return el.tipologiaFattura+"-"+el.dataFattura?.split("T")[0];
        });
        setDateTipologie(result);
            
        if(isInitialRender.current && Object.keys(filters).length > 0){
          setValueMultiselectDateTipologie(filters.valueMulitselectDateTipologie);
        }
      }).catch((()=>{
        setDateTipologie([]);
      }));
  };
  //TODO : la stessa funzione è utilizzata nei doc emessi lato ente , valutare se procedere con renderizzazione
  //delle row tramite file config
  const funcToMapElements = (obj:any) => {
    return obj.map((obj, index) => ({
      idFattura:obj.idfattura,
      id: obj.identificativo ?? index,
      istitutioID:obj.istitutioID,
      inviata:obj.inviata,
      arrow: '',
      ragioneSociale: obj.ragionesociale || '--',
      action:'action',
      dataFattura: obj.dataFattura
        ?  new Date(obj.dataFattura).toLocaleDateString('it-IT')
        : '--',
      stato: 'Emessa',
      tipologiaFattura: obj.tipologiaFattura || "--",
      identificativo: obj.identificativo,
      tipocontratto: obj.tipocontratto === 'PAL'
        ? 'PAC - PAL senza requisiti'
        : 'PAC - PAL con requisiti',
      totale: obj.totale.toLocaleString('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }),
      numero: obj.numero,
      tipoDocumento: obj.tipoDocumento,
      divisa: obj.divisa,
      metodoPagamento: obj.metodoPagamento,
      split: obj.split ? 'Si' : 'No',
      //nota:"qui ci sarà la nota",
      arrowDetails: 'arrowDetails',
      posizioni:obj?.posizioni ? obj?.posizioni.map(el => ({
        numerolinea: el.numerolinea,
        codiceMateriale: el.codiceMateriale,
        imponibile:el.imponibile.toLocaleString("de-DE", { style: "currency", currency: "EUR" })  || '--',
        periodoRiferimento: el.periodoRiferimento
          ? el.periodoRiferimento : '--', 
        periodoFatturazione:el?.periodoFatturazione || '--',
      }))?.sort((a, b) => (a.numerolinea ?? 0) - (b.numerolinea ?? 0)):[],
    }));
  };

  const getlistaFatturazione = async (bodyToModify) => {
    let body = bodyToModify;
    if(body.inviata === 3){
      body =  {...bodyToModify,inviata:null};
    }else if(body.inviata === 4){
      body =  {...bodyToModify,inviata:0};
    }
    setShowLoadingGrid(true);
    setDisableButtonSap(true);
    await  getFatturazionePagoPa(token,profilo.nonce,body).then((res)=>{

      let dataString = valueMulitselectDateTipologie.map(el =>  el.split("-").slice(1).join("-"));
            
      if(isInitialRender.current && Object.keys(filters).length > 0){
        dataString = filters?.valueMulitselectDateTipologie.map(el =>  el.split("-").slice(1).join("-"));
        setPage(filters.page||0);
        setRowsPerPage(filters.rows||10);
      }else if( callAnnulla.current ){
        dataString = [];
        setPage(0);
        setRowsPerPage(10);
      }else if( callLista.current){
        dataString = valueMulitselectDateTipologie.map(el =>  el.split("-").slice(1).join("-"));
        setPage(0);
        setRowsPerPage(10);
      }else{
        setPage(0);
        setRowsPerPage(10);
      }
       
      let data: FattureObj[] = [];
      if(dataString.length === 0){
        data = res.data.map(el => el?.fattura);
      }else{
        data = res.data.map(el => el?.fattura).filter(obj => dataString.includes(obj.dataFattura));
      } 
    
      const customObjData : FattureObj[] = funcToMapElements(data);
    
      setCount(customObjData?.length || 0);
      setGridData(customObjData);

      let elementsToShow:FattureObj[] = [];
      if(isInitialRender.current && Object.keys(filters).length > 0){
        elementsToShow = customObjData.slice(filters?.page||0, filters.rows||10);
      }else if(callLista.current || callAnnulla.current){
        elementsToShow = customObjData.slice(0, 10);
      }else{
        elementsToShow = customObjData.slice(page, rowsPerPage);
      }

      
      setShowedData(elementsToShow);
      setShowLoadingGrid(false);
      setBodyFatturazioneDownload(body);
      callAnnulla.current = false;
    }).catch((error)=>{
      if(error?.response?.status === 404){
        setGridData([]);
        setShowedData([]);
        setPage(0);
        setRowsPerPage(10);
      }
      setBodyFatturazioneDownload(body);
      setShowLoadingGrid(false);
      manageError(error, dispatchMainState);
      callAnnulla.current = false;

    
    });  
    getTipologieFattureInvioSap(body.anno,body.mese);
    if(isInitialRender.current){
      getTipologieFatturazione(body.anno,body.mese, body.cancellata);
    }
  };

  const getCount = async () =>{
    await getMessaggiCount(token,profilo.nonce).then((res)=>{
      const numMessaggi = res.data;
      setCountMessages(numMessaggi);
    }).catch(()=>{
      return;
    });
  };


  const sendCancellazzioneRispristinoFatture = async () =>{
    await fattureCancellazioneRipristinoPagoPa(token,profilo.nonce,{idFatture:fattureSelected,cancellazione:!bodyFatturazioneDownload.cancellata}).then(()=>{
      getlistaFatturazione(bodyFatturazioneDownload);
      managePresaInCarico('FATTURA_SOSPESA_RIPRISTINATA',dispatchMainState);
      getCount();
    }).catch((error)=>{
      getlistaFatturazione(bodyFatturazioneDownload);
      manageError(error, dispatchMainState);
    });      
  };

  const listaEntiNotifichePageOnSelect = async () =>{
    if(profilo.auth === 'PAGOPA'){
      await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue}).then((res)=>{
        setDataSelect(res.data);
      }).catch(((err)=>{
        manageError(err,dispatchMainState);
      }));
    }
  };

  const downloadListaFatturazione = async () => {
    let body = bodyFatturazioneDownload;
    if(body.inviata === 3){
      body =  {...bodyFatturazioneDownload,inviata:null};
    }else if(body.inviata === 4){
      body =  {...bodyFatturazioneDownload,inviata:0};
    }
    setShowDownloading(true);
    await downloadFatturePagopa(token,profilo.nonce, body).then(response => response.blob()).then((response)=>{
      let title = `Lista fatturazione/${month[(body.mese||0) - 1]}/${body.anno}.xlsx`;
      if(body.idEnti.length === 1 && gridData[0]){
        title = `Lista fatturazione/ ${gridData[0]?.ragioneSociale}/${month[(body.mese||0)  - 1]}/${body.anno}.xlsx`;
      }
      saveAs(response,title);
      setShowDownloading(false);
    }).catch(((err)=>{
      setShowDownloading(false);
      manageError(err,dispatchMainState);
    }));
  };

  const downloadListaReportFatturazione = async () => {
    let body = bodyFatturazioneDownload;
    if(body.inviata === 3){
      body =  {...bodyFatturazioneDownload,inviata:null};
    }else if(body.inviata === 4){
      body =  {...bodyFatturazioneDownload,inviata:0};
    }
    setShowDownloading(true);
    await downloadFattureReportPagopa(token,profilo.nonce, body).then((response)=>{
      if (response.ok) {
        return response.blob();
      }
      throw '404';
    }).then((response)=>{
      let title = `Lista report/${month[(body.mese||0)  - 1]}/${body.anno}.zip`;
      if(body.idEnti.length === 1 && gridData[0]){
        title = `Lista report/ ${gridData[0]?.ragioneSociale}/${month[(body.mese||0)  - 1]}/${body.anno}.zip`;
      }
      saveAs(response,title);
      setShowDownloading(false);
    }).catch((()=>{
      setShowDownloading(false);
      manageErrorDownload('404',dispatchMainState);
    }));
  };

  const fattureSelectedArr = () =>{
    return fattureSelected.map((el)=>{
      return gridData.filter((obj:FattureObj) => obj.idfattura === el ).pop();
    });
  };
 

  const getTipologieFattureInvioSap = async(anno,mese) =>{
    await fattureTipologiaSapPa(token, profilo.nonce, {anno,mese} ).then((res)=>{
      const anableInvioSap = res.data?.filter((el)=> el.azione === 0).length;
      const anableReset = res.data?.filter((el)=> el.azione === 1).length;
      if(anableInvioSap > 0){
        setDisableButtonSap(false);
      }else{
        setDisableButtonSap(true);
      }
      if(anableReset > 0){
        setDisableButtonReset(false);
      }else{
        setDisableButtonReset(true);
      }
      setResponseTipologieSap(res.data);
    }).catch((()=>{
      setDisableButtonSap(true);
      setDisableButtonReset(true);
      setResponseTipologieSap([]);
    }));
  };

  const onButtonSap = (who) => {
    setOpenSapModal((prev)=>({...prev,...{show:true,who}}));
  };

  const clearOnChangeFilter = () => {
    setGridData([]);
    setFattureSelected([]);  
    setDisableButtonSap(true);
    setDisableButtonReset(true); 
  };

  const onButtonFiltra = () => {
    updateFilters({
      pathPage:profilePath,
      body:bodyFatturazione,
      textValue:textValue,
      valueAutocomplete,
      fattureSelected:fattureSelected,
      valueMulitselectTipologie:valueMulitselectTipologie,
      valueMulitselectDateTipologie:valueMulitselectDateTipologie,
      page:0,
      rows:10,
    });
    getlistaFatturazione(bodyFatturazione);
    callLista.current = true;
  };

  const onButtonAnnulla = () => {
    callAnnulla.current = true;
    callLista.current = true;
    resetFilters();
    getAnni();
    setBodyFatturazione({
      anno:arrayYears[0],
      mese:0,
      tipologiaFattura:[],
      idEnti:[],
      cancellata:false,
      idTipoContratto:null,
      inviata:3
    });
    setBodyFatturazioneDownload({
      anno:arrayYears[0],
      mese:0,
      tipologiaFattura:[],
      idEnti:[],
      cancellata:false,
      idTipoContratto:null,
      inviata:3
    });
    setDataSelect([]);
    setValueMultiselectTipologie([]);
    setValueAutocomplete([]);
        
  };
    
  const upadateOnSelctedChange = (page,rowsPerPage) =>{
    updateFilters({
      pathPage:profilePath,
      body:bodyFatturazione,
      textValue:textValue,
      valueAutocomplete,
      fattureSelected:fattureSelected,
      valueMulitselectTipologie:valueMulitselectTipologie,
      valueMulitselectDateTipologie:valueMulitselectDateTipologie,
      page:page,
      rows:rowsPerPage,
    });
  };


  const handleGoToDetail = async(el) => {
    let idTipoContratto = 0;
    if(el.tipocontratto === "PAC - PAL senza requisiti"){
      idTipoContratto = 1;
    }else if(el.tipocontratto === "PAC - PAL con requisiti"){
      idTipoContratto = 2;
    }
    if(idTipoContratto !== 0){
      navigate(`${PathPf.PDF_REL}/documentiemessi/${el.idFattura}/${el.istitutioID}/${idTipoContratto}`);
    }
  }; 


  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
          
    const start = newPage * rowsPerPage;
    const end = start + rowsPerPage;
       
    const elementsToShow = gridData.slice(start, end);
    setShowedData(elementsToShow);
  
    upadateOnSelctedChange(newPage,rowsPerPage);
  };
                          
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newRows = parseInt(event.target.value, 10);
  
    setRowsPerPage(newRows);
    setPage(0);
  
    const elementsToShow = gridData.slice(0, newRows);
    setShowedData(elementsToShow);
    upadateOnSelctedChange(0,newRows);
  };

    
  const keyValueObjModalInfo = [
    {
      key:"ragioneSociale",
      label:"Ragione Sociale"
    },
    {
      key:"dataFattura",
      label:"Data Fattura"
    },
    {
      key:"tipologiaFattura",
      label:"Tipologia Fattura"
    }
  ];
    
  const showPopUpAction = (obj, action) => {  
   
    setElementSelected(obj);
    setActionCalled(action);
    if(action === "posticipa"){
      setOpenModalInfo({open:true, sentence: <ElementToProcessComponent obj={obj} keyValueObj={keyValueObjModalInfo} title={<>Sei sicuro di voler <strong>Posticipare</strong> la seguente fattura?</>} />,buttonIsVisible:true,labelButton:"Prosegui",actionButton:() => console.log("ripristina")});
    }else if(action === "annulla eliminazione"){
      setOpenModalInfo({open:true, sentence: <ElementToProcessComponent obj={obj} keyValueObj={keyValueObjModalInfo} title={<>Sei sicuro di voler <strong>Annullare</strong> l'eliminazione della seguente fattura?</>} />,buttonIsVisible:true,labelButton:"Prosegui",actionButton:() => console.log("ANNULLA")});
    }
  };

  


  const azioneApi = async () => {
    setShowLoadingGrid(true);

    try {
   
      let actionToApi = "";
      if (actionCalled === "posticipa") {
        actionToApi = "posticipa";
      }else if (actionCalled === "annulla eliminazione" ||actionCalled === "annulla") {
        actionToApi = "elimina";
      }

      if (!elementSelected) return;
      const [day, month, year] = elementSelected.dataFattura.split("/");

      const bodyApi = {
        mese: parseInt(month, 10).toString(),
        anno: year.toString(),
        tipologiaFattura: elementSelected.tipologiaFattura,
        azione: actionToApi,
        idFattura: elementSelected.idFattura,
        idEnte: elementSelected.istitutioID,
        nota: {
          data: formatDate(new Date()),
          testo: textAreaValue
        }
      };

      await gestioneFattureInserisci(
        token,
        profilo.nonce,
        bodyApi
      );

      await getlistaFatturazione(bodyFatturazione);

      managePresaInCarico(
        "INSER_DELETE_WHITE_LIST",
        dispatchMainState
      );

    } catch (err) {
      manageError(err as ManageErrorResponse, dispatchMainState);

    } finally {
      setShowLoadingGrid(false);
    }
  };

  const regex = /^(?=.{15,500}$)(\S+\s+){2,}\S+$/;

  function isValidText(str) {
    return regex.test(str.trim());
  }

  function isValidText2(str: string): boolean {
    const trimmed = str.trim();
    if (!trimmed) return false;

    const words = trimmed.match(/[A-Za-zÀ-ÖØ-öø-ÿ]+/g) || [];
    return words.length >= 3;
  }
    

  const statusAnnulla = bodyFatturazione.idEnti.length !== 0 || 
     bodyFatturazione.tipologiaFattura.length !== 0 ||
     bodyFatturazione.cancellata === true ||
     bodyFatturazione.idTipoContratto !== null ||
     bodyFatturazione.anno !== firstYearMonth[0] ||
     Number(bodyFatturazione.mese) !== firstYearMonth[1]  ? "show" :"hidden";


  return (
    <MainBoxStyled title={"Documenti contabili emessi"}>
      <ResponsiveGridContainer >
        <MainFilter 
          filterName={"select_value_string"}
          inputLabel={"Anno"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyFatturazione}
          body={bodyFatturazione}
          keyDescription={"anno"}
          keyValue={"anno"}
          keyBody={"anno"}
          arrayValues={arrayYears}
          extraCodeOnChange={(e)=>{
            callLista.current = false; 
            getMesi(e.toString());
            setDataSelect([]);
            setValueMultiselectTipologie([]);
            setValueAutocomplete([]);
          }}
        ></MainFilter>
        <MainFilter 
          filterName={"select_key_value"}
          inputLabel={"Mese"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyFatturazione}
          body={bodyFatturazione}
          keyValue={"mese"}
          keyDescription='descrizione'
          keyBody={"mese"}
          defaultValue={""}
          arrayValues={arrayMonths}
          extraCodeOnChange={(e)=>{
            const value = Number(e);
            setBodyFatturazione((prev)=> ({...prev, ...{mese:value,tipologiaFattura:[]}}));
            getTipologieFatturazione(bodyFatturazione.anno,value,bodyFatturazione.cancellata);
            setValueMultiselectTipologie([]);            
          }}
        ></MainFilter>
        <MainFilter 
          filterName={"select_key_value"}
          inputLabel={"Stato"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyFatturazione}
          body={bodyFatturazione}
          keyValue={"id"}
          keyDescription='descrizione'
          keyBody={"cancellata"}
          defaultValue={""}
          arrayValues={[{id:1,descrizione:"Fatturate"},{id:2,descrizione:"Non fatturate"}]}
          extraCodeOnChange={(e)=>{
                      
            const value = Number(e) === 1 ? false : true;
            setBodyFatturazione((prev)=>({...prev,...{cancellata:value,tipologiaFattura:[]}}));
            getTipologieFatturazione(bodyFatturazione.anno,bodyFatturazione.mese,value);
            setValueMultiselectTipologie([]);       
          }}
        ></MainFilter>
        <MainFilter 
          filterName={"multi_checkbox"}
          inputLabel={"Tipologia Fattura"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyFatturazione}
          body={bodyFatturazione}
          dataSelect={tipologie}
          valueAutocomplete={valueMulitselectTipologie}
          setValueAutocomplete={setValueMultiselectTipologie}
          keyDescription={"tipologiaFattura"}
          keyValue={"tipologiaFattura"}
          keyBody={"tipologiaFattura"}
          extraCodeOnChangeArray={(e)=>{
            setValueMultiselectTipologie(e);
            setBodyFatturazione((prev) => ({...prev,...{tipologiaFattura:e}}));
          }}
          iconMaterial={RenderIcon("invoice",true)}
                    
        ></MainFilter>
        <MainFilter 
          filterName={"multi_checkbox"}
          inputLabel={"Rag. Soc. Ente"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyFatturazione}
          body={bodyFatturazione}
          dataSelect={dataSelect}
          setTextValue={setTextValue}
          textValue={textValue}
          valueAutocomplete={valueAutocomplete}
          setValueAutocomplete={setValueAutocomplete}
          keyDescription={"descrizione"}
          keyValue={"idEnte"}
          keyBody={"idEnti"}
        ></MainFilter>
        <MainFilter 
          filterName={"multi_checkbox"}
          inputLabel={"Data Fattura"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyFatturazione}
          body={bodyFatturazione}
          dataSelect={dateTipologie}
          valueAutocomplete={valueMulitselectDateTipologie}
          setValueAutocomplete={setValueMultiselectDateTipologie}
          keyDescription={"dataFattura"}
          keyValue={"tipologiaFattura"}
          keyBody={"dataFattura"}
          extraCodeOnChangeArray={(e)=>{
            setValueMultiselectDateTipologie(e);
          }}
          iconMaterial={RenderIcon("date",true)}
        ></MainFilter>
        <MainFilter 
          filterName={"select_key_value"}
          inputLabel={"Tipologia contratto"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyFatturazione}
          body={bodyFatturazione}
          keyDescription={"descrizione"}
          keyBody={"idTipoContratto"}
          keyValue={"id"}
          arrayValues={arrayContratti}
          defaultValue={"3"}
          extraCodeOnChange={(e)=>{
            const val = (Number(e) === 3) ? null : Number(e);
            setBodyFatturazione((prev)=>({...prev,...{idTipoContratto:val}}));
          }}
          iconMaterial={RenderIcon("contract")}
        ></MainFilter>
        <MainFilter 
          filterName={"select_key_value"}
          inputLabel={"Stato Invio"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyFatturazione}
          body={bodyFatturazione}
          keyValue={"id"}
          keyDescription='description'
          keyBody={"inviata"}
          arrayValues={statoInvio}
          defaultValue={""}
          extraCodeOnChange={(e)=>{ 
            const value = Number(e);
            setBodyFatturazione((prev)=>({...prev,...{inviata:value}}));
          }}
        ></MainFilter>
      </ResponsiveGridContainer>
      <FilterActionButtons 
        onButtonFiltra={onButtonFiltra} 
        onButtonAnnulla={onButtonAnnulla} 
        statusAnnulla={statusAnnulla} 
        actionButton={[
          {
            onButtonClick: () => onButtonSap(0),
            variant: "outlined",
            icon:{name:"preview" },
            disabled:disableButtonSap,
            tooltipMessage:"Invia a SAP",
            withText:false
          },{
            onButtonClick: () => navigate(PathPf.JSON_TO_SAP),
            variant: "outlined",
            icon:{name:"iso_share" },
            tooltipMessage:"Invio fatture",
            withText:false
          },
              
        ]}
      />
      <ActionTopGrid
        actionButtonRight={[{
          onButtonClick:downloadListaReportFatturazione,
          variant: "outlined",
          label: "Download Report",
          icon:{name:"download"},
          disabled:(gridData.length === 0)
        },{
          onButtonClick:downloadListaFatturazione,
          variant: "outlined",
          label: "Download Risultati",
          icon:{name:"download"},
          disabled:(gridData.length === 0)
        }]}/>

      <GridCustom
        nameParameterApi='docEmessiSend'
        elements={showedData}
        changePage={handleChangePage}
        changeRow={handleChangeRowsPerPage} 
        total={count}
        page={page}
        rows={rowsPerPage}
        headerNames={headersObjGridDocemessiSend}
        headerNamesCollapse={headersObjGridDocemessiSendCollapse}
        apiGet={handleGoToDetail}
        disabled={showLoadingGrid}
        widthCustomSize="2000px"
        setOpenModalAction={showPopUpAction}
        sentenseEmpty={"Non sono presenti Regolari esecuzioni/Documenti di cortesia"}
      />  
      <ModalLoading 
        open={showLoadingGrid} 
        setOpen={setShowLoadingGrid}
        sentence={'Loading...'} />
      <ModalLoading 
        open={showDownloading} 
        setOpen={setShowDownloading}
        sentence={'Downloading...'} />     
      <ModalSap
        open={openSapModal} 
        setOpen={setOpenSapModal}
        responseTipologiaSap={responseTipologieSap}
        mese={bodyFatturazioneDownload.mese||0}
        anno={bodyFatturazioneDownload.anno||0}
        dispatchMainState={dispatchMainState}
        getListaFatture={getlistaFatturazione}
        bodyFatturazioneDownload={bodyFatturazioneDownload}/>
      <ModalConfermaRipristina 
        setOpen={setOpenConfermaModal}
        open={openConfermaModal}
        filterInfo={bodyFatturazioneDownload}
        onButtonComferma={sendCancellazzioneRispristinoFatture}
        fattureSelectedArr={fattureSelectedArr}/>
      <ModalResetFilter
        setOpen={setOpenResetFilterModal}
        open={openResetFilterModal}
        filterInfo={bodyFatturazioneDownload}
        filterNotExecuted={bodyFatturazione}
        getListaFatture={getlistaFatturazione}/>
      <ModalInfo 
        setOpen={setOpenModalInfo}
        open={openModalInfo}
        width={800}
        textAreaValue={textAreaValue}
        setTextAreaValue={setTextAreaValue}
        externalActionButton={azioneApi}
        errorTextInput={!isValidText2(textAreaValue) || !isValidText(textAreaValue)}
      />
    </MainBoxStyled>   
  );
};

export default Fatturazione;