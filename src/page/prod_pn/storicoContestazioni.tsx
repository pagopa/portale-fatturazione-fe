import {  Button, Tooltip,} from "@mui/material";
import { useEffect, useState } from "react";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import { manageError } from "../../api/api";
import { listaEntiNotifichePage } from "../../api/apiSelfcare/notificheSE/api";
import { getListaStorico, getTipoReportCon } from "../../api/apiPagoPa/storicoContestazioni/api";
import { getAnniContestazioni,  getMesiContestazioni} from "../../api/apiPagoPa/notifichePA/api";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { PathPf } from "../../types/enum";
import { useNavigate } from "react-router";
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { headersName } from "../../assets/configurations/config_GridStoricoContestazioni";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import { FilterActionButtons, MainBoxStyled, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";

export interface BodyStoricoContestazioni{
    anno:string,
    mese:string,
    idEnti:string[],
    idTipologiaReports:number[]
}

export interface TipologieDoc {
    idTipologiaReport: number,
    categoriaDocumento: string,
    tipologiaDocumento: string
}

export interface ContestazioneRowGrid {
    reportId: string,
    uniqueId: string,
    json: string,
    anno: number,
    mese: number,
    internalOrganizationId: string,
    contractId: string,
    actualContractId: string,
    utenteId: string,
    prodotto: string,
    stato: number,
    dataInserimento: string,
    dataStepCorrente: string,
    linkDocumento: string,
    storage: string,
    hash: string,
    contentType: string,
    contentLanguage: string,
    tipologiaDocumento: string,
    categoriaDocumento: string,
    ragioneSociale: string
}

const Storico: React.FC = () => {

  const mainState = useGlobalStore(state => state.mainState);
  const dispatchMainState = useGlobalStore(state => state.dispatchMainState); 
    
  const token =  mainState.profilo.jwt;
  const profilo =  mainState.profilo;
  const navigate = useNavigate();

  const { 
    filters,
    updateFilters,
    isInitialRender,
    resetFilters
  } = useSavedFilters(PathPf.STORICO_CONTEST,{});

  const handleModifyMainState = (valueObj) => {
    dispatchMainState({
      type:'MODIFY_MAIN_STATE',
      value:valueObj
    });
  };

  const [bodyGetLista,setBodyGetLista] = useState<BodyStoricoContestazioni>({
    anno:'',
    mese:'',
    idEnti:[],
    idTipologiaReports:[]
  });

  const [valueYears, setValueYears] = useState<string[]>([]);
  const [tipologieDoc, setTipologieDoc] = useState<TipologieDoc[]>([]);
  const [tipologiaSelcted,setTipologiaSelected] = useState<TipologieDoc[]>([]);
  const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
  const [textValue, setTextValue] = useState('');
  const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
  const [statusAnnulla, setStatusAnnulla] = useState('hidden');
  const [dataGrid,setDataGrid] = useState<ContestazioneRowGrid[]>([]);
  const [listaToMap,setListaToMap] = useState<ContestazioneRowGrid[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalContestazioni, setTotalContestazioni]  = useState(0);
  const [getListaContestazioniRunning, setGetListaContestazioniRunning] = useState(false);
  const [arrayMesi,setArrayMesi] = useState<{descrizione:string,mese:string}[]>([]);

  useEffect(()=>{
    listaTipoReport(); 
    getAnni();
  },[]);

  useEffect(()=>{
    if(bodyGetLista.idEnti.length > 0 ||bodyGetLista.idTipologiaReports.length > 0 || bodyGetLista.mese !== ''){
      setStatusAnnulla('show');
    }else{
      setStatusAnnulla('hidden');
    }
  },[bodyGetLista]);

  useEffect(()=>{
    const timer = setTimeout(() => {
      if(textValue.length >= 3){
        listaEntiNotifichePageOnSelect();
      }
    }, 800);
    return () => clearTimeout(timer);
  },[textValue]);

  const clearOnChangeFilter = () => {
    setDataGrid([]);
    setPage(0);
    setRowsPerPage(10);
    setTotalContestazioni(0);
  };

  const getAnni = async() => {
    setGetListaContestazioniRunning(true);
    await getAnniContestazioni(token,profilo.nonce)
      .then((res)=>{
        setValueYears(res.data);
                
        if(isInitialRender.current && Object.keys(filters).length > 0){
                  
          setBodyGetLista(filters.body);
          getListaContestazioni(filters.body,filters.page+1,filters.rows);
          if(filters.body.anno !== null && filters.body.anno !== "9999"){
            getMesi(filters.body.anno);
          }
                   
          setTipologiaSelected(filters.tipologiaSelcted);
          setValueAutocomplete(filters.valueAutocomplete);
          setPage(filters.page);
          setRowsPerPage(filters.rows);
        }else{
          setBodyGetLista((prev)=> ({...prev, ...{anno:"9999"}}));
          getListaContestazioni({...bodyGetLista,...{anno:null}},page+1,rowsPerPage);
          //getMesi("9999");
        }
      }).catch((err)=>{
        setGetListaContestazioniRunning(false);
        manageError(err,dispatchMainState);
      });
  };
  const getMesi = async (anno) => {
    await getMesiContestazioni(token, profilo.nonce,anno).then((res)=> {
      setArrayMesi(res.data);
      if(!isInitialRender.current){
        setGetListaContestazioniRunning(false);
      }
            
    }).catch((err)=>{
      setArrayMesi([]);
      manageError(err,dispatchMainState);  
      if(!isInitialRender.current){
    
        setGetListaContestazioniRunning(false);
      }
    });
  };

  const listaEntiNotifichePageOnSelect = async () =>{
    await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue} ).then((res)=>{
      setDataSelect(res.data);
    }).catch(((err)=>{
      setDataSelect([]);
      manageError(err,dispatchMainState);
    }));
  };

  const listaTipoReport = async () =>{
    await getTipoReportCon(token, profilo.nonce).then((res)=>{
      setTipologieDoc(res.data);
    }).catch(((err)=>{
      setTipologieDoc([]);
      manageError(err,dispatchMainState);
    }));
  };

  const getListaContestazioni = async(body,pag, rowpag) => {
    setGetListaContestazioniRunning(true);
    let newBody = body;
    if(body.anno === "9999" || body.anno === ""|| body.anno === null){
      newBody = {...body,anno:null};
    }
    await getListaStorico(token,profilo.nonce,newBody,pag,rowpag).then((res)=>{
      // ordino i dati in base all'header della grid
      setListaToMap(res.data.reports);
 
      setDataGrid(res.data.reports);
      setTotalContestazioni(res.data.count);
      setGetListaContestazioniRunning(false);
      isInitialRender.current = false;
    }).catch((err)=>{
      setDataGrid([]);
      setTotalContestazioni(0);
      setGetListaContestazioniRunning(false);
      isInitialRender.current = false;
      manageError(err,dispatchMainState);
    });
  };

  const handleAnnullaButton = () => {
    setBodyGetLista({
      anno:"",
      mese:'',
      idEnti:[],
      idTipologiaReports:[]
    });
    setValueAutocomplete([]);
    setDataSelect([]);
    setTipologiaSelected([]);
    getListaContestazioni({
      mese:'',
      idEnti:[],
      idTipologiaReports:[],
      anno:""
    },1,10);
    resetFilters();
  };

  const handleFiltra = () => {
    updateFilters({
      pathPage:PathPf.STORICO_CONTEST,
      body:bodyGetLista,
      textValue:textValue,
      valueAutocomplete,
      tipologiaSelcted:tipologiaSelcted,
      page:0,
      rows:10,
    });
    getListaContestazioni(bodyGetLista,page+1,rowsPerPage);
  };
         
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    const realPage = newPage + 1;
    getListaContestazioni(bodyGetLista,realPage, rowsPerPage);
    setPage(newPage);
    updateFilters({
      pathPage:PathPf.STORICO_CONTEST,
      body:bodyGetLista,
      textValue:textValue,
      valueAutocomplete,
      tipologiaSelcted:tipologiaSelcted,
      page:newPage,
      rows:rowsPerPage
    });
  };
                    
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    const realPage = page + 1;
    getListaContestazioni(bodyGetLista,realPage,parseInt(event.target.value, 10));  
    updateFilters({
      pathPage:PathPf.STORICO_CONTEST,
      body:bodyGetLista,
      textValue:textValue,
      valueAutocomplete,
      tipologiaSelcted:tipologiaSelcted,
      page:0,
      rows:parseInt(event.target.value, 10)
    });
  };

  const handleClickOnDetail = (el) => {    
    navigate(PathPf.STORICO_DETTAGLIO_CONTEST);
    const singleEl = listaToMap.find(elem => elem.reportId === el.reportId);
    //TODO: 30/06 possiamo passare solo l'id tramite uri perche abbiamo aggiunto il servizio di dettaglio nella pagina di dettaglio 
    //salvare tutto l'obj dentro lo state globale è inutile 
    // quando fari refactorig sistema
    if(singleEl){
      handleModifyMainState({contestazioneSelected:singleEl});
    }else{
      //:TODO   mostrare un messaggio di errore
    }
  };  


  return (
    <MainBoxStyled title={"Contestazioni"}>
      <ResponsiveGridContainer >
        <MainFilter 
          filterName={"select_value_with_tutti"}
          inputLabel={"Anno"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyGetLista}
          body={bodyGetLista}
          keyDescription={"anno"}
          keyValue={"anno"}
          keyBody={"anno"}
          arrayValues={valueYears.map(el => el.toString())}
          extraCodeOnChange={(e)=>{
            setBodyGetLista((prev)=> ({...prev, ...{anno:e,mese:''}}));
            if(e !== "9999"){
              setGetListaContestazioniRunning(true);
              getMesi(e);
            }else{
              setArrayMesi([]);
            }
          }}
        ></MainFilter>
        <MainFilter 
          disabled={bodyGetLista.anno === "9999" ||bodyGetLista.anno === null}
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
            setBodyGetLista((prev)=> ({...prev, ...{mese:e}}));  
          }}
        ></MainFilter>
        <MainFilter 
          filterName={"multi_checkbox"}
          inputLabel={"Categoria Doc."}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyGetLista}
          body={bodyGetLista}
          keyCompare={""}
          dataSelect={tipologieDoc}
          valueAutocomplete={tipologiaSelcted}
          setValueAutocomplete={setTipologiaSelected}
          keyDescription={"categoriaDocumento"}
          keyValue={"idTipologiaReport"}
          keyOption='categoriaDocumento'
          keyBody={"idTipologiaReports"}
          hidden={profilo.auth !== 'PAGOPA'}
        />
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
        ></MainFilter>
      </ResponsiveGridContainer>
      <FilterActionButtons 
        onButtonFiltra={handleFiltra} 
        onButtonAnnulla={handleAnnullaButton} 
        statusAnnulla={statusAnnulla}
        actionButton={[{
          onButtonClick:()=> navigate(PathPf.INSERIMENTO_CONTESTAZIONI),
          variant: "outlined",
          icon:{name:"add-action"},
          tooltipMessage:"Contestazioni multiple",
          withText:false
        }]}/>
      <div className="mt-3">
        <GridCustom
          nameParameterApi='contestazionePage'
          elements={dataGrid}
          changePage={handleChangePage}
          changeRow={handleChangeRowsPerPage} 
          total={totalContestazioni}
          page={page}
          rows={rowsPerPage}
          headerNames={headersName}
          apiGet={handleClickOnDetail}
          disabled={getListaContestazioniRunning}
          widthCustomSize="auto"/>
      </div>
      
      <ModalLoading 
        open={getListaContestazioniRunning} 
        setOpen={setGetListaContestazioniRunning} 
        sentence={'Loading...'}>
      </ModalLoading>
    </MainBoxStyled>
  );
};

export default Storico;
