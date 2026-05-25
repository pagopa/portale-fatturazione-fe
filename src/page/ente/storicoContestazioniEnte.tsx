import { month } from "../../reusableFunction/reusableArrayObj";
import { useEffect, useRef, useState } from "react";
import { manageError } from "../../api/api";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { PathPf } from "../../types/enum";
import { useNavigate } from "react-router";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { getAnniContestazioniSE, getListaStoricoSE, getMesiContestazioniSE, getTipoReportSE, recapContestazioniSE } from "../../api/apiSelfcare/storicoContestazioneSE/api";
import { headersName } from "../../assets/configurations/conf_GridStoricoContestazioni_ente";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import GridView from "../../components/reusableComponents/grid/gridView/gridView";
import { headersNameGridView } from "../../assets/configurations/conf_GridViewStoricoContestazioniEnte";
import { FilterActionButtons, MainBoxStyled, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter, { MainBoxContainer } from "../../components/reusableComponents/mainFilter";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";


      


export interface BodyStoricoContestazioniSE{
  anno:string|null,
  mese:string|null,
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

interface RecapObjContestazioni{
  tipologiaFattura: string
  idFlagContestazione: number
  flagContestazione: string
  totale: number
  totaleNotificheAnalogiche: number
  totaleNotificheDigitali: number  
}

const StoricoEnte : React.FC = () => {

  const mainState = useGlobalStore(state => state.mainState);
  const dispatchMainState = useGlobalStore(state => state.dispatchMainState);

  const token =  mainState.profilo.jwt;
  const profilo =  mainState.profilo;
  const navigate = useNavigate();
  const now = new Date();
  const currentYear = now.getFullYear();  
  const currentMonth = now.getMonth() + 1;

  const { 
    filters,
    updateFilters,
    isInitialRender,
    resetFilters
  } = useSavedFilters(PathPf.STORICO_CONTEST_ENTE,{});

  const handleModifyMainState = (valueObj) => {
    dispatchMainState({
      type:'MODIFY_MAIN_STATE',
      value:valueObj
    });
  };

  const [bodyGetLista,setBodyGetLista] = useState<BodyStoricoContestazioniSE>({
    anno:null,
    mese:null,
    idTipologiaReports:[]
  });

  const [bodyFiltered,setBodyFiltered] = useState<BodyStoricoContestazioniSE>({
    anno:null,
    mese:null,
    idTipologiaReports:[]
  });

  const noYearsAvailable = useRef(false);

  const [valueYears, setValueYears] = useState<string[]>([]);
  const [dataGrid,setDataGrid] = useState<any[]>([]);

  const [listaToMap,setListaToMap] = useState<ContestazioneRowGrid[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalContestazioni, setTotalContestazioni]  = useState(0);
  const [getListaContestazioniRunning, setGetListaContestazioniRunning] = useState(false);
  const [arrayMesi,setArrayMesi] = useState<{descrizione:string,mese:string}[]>([{descrizione:"Dicembre",mese:"12"}]);
  const [tipologieDoc, setTipologieDoc] = useState<TipologieDoc[]>([]);
  const [tipologiaSelcted,setTipologiaSelected] = useState<TipologieDoc[]>([]);
  const [firstYear, setFirstYear] = useState(0);
  const [firstMonth, setFirstMonth] = useState(0);

  const [recapListaNotifiche, setRecapListaNotifiche] = useState<any[]>([]);



  useEffect(()=>{
    getAnni();
  },[]);

  const clearOnChangeFilter = () => {
    setDataGrid([]);
    setPage(0);
    setRowsPerPage(10);
    setTotalContestazioni(0);
  };

  const getAnni = async() => {
    setGetListaContestazioniRunning(true);
    await getAnniContestazioniSE(token,profilo.nonce)
      .then((res)=>{
        setValueYears(res.data.map(el => Number(el)));
        setFirstYear(res.data[0]);
    
        if(isInitialRender.current && Object.keys(filters).length > 0){
          setBodyGetLista(filters.body);
          getListaContestazioni(filters.body,filters.page+1,filters.rows);
          setTipologiaSelected(filters.tipologiaSelcted);
          getMesi(filters.body.anno);
          setPage(filters.page);
          setRowsPerPage(filters.rows);
        }else{
          getMesi(res.data[0]);
        }
        noYearsAvailable.current = false;
      }).catch((err)=>{
        setGetListaContestazioniRunning(false);
        if(err?.response?.request?.status === 404){
          getMesi(currentMonth.toString());
          setFirstYear(currentMonth);
          setValueYears([currentYear.toString()]);
          noYearsAvailable.current = true;
        }else{
          manageError(err,dispatchMainState);
        }
        
      });
  };
  const getMesi = async (anno) => {

    await getMesiContestazioniSE(token, profilo.nonce,anno).then((res)=> {
      const mesiCamelCase = res.data.map(el => {
        el.descrizione = el?.descrizione.charAt(0).toUpperCase() + el.descrizione.slice(1).toLowerCase();
        return el;
      });
      setArrayMesi(mesiCamelCase);
      setFirstMonth(res.data[0].mese);
      if(isInitialRender.current &&  Object.keys(filters|| {}).length === 0){
   
        setBodyGetLista((prev)=> ({...prev, ...{anno:anno,mese:res.data[0].mese }}));
        setBodyFiltered((prev)=> ({...prev, ...{anno:anno,mese:res.data[0].mese }}));
        getListaContestazioni({...bodyGetLista,...{mese:res.data[0].mese,anno:anno}},page+1,rowsPerPage);
      }else{
        setBodyGetLista((prev)=> ({...prev, ...{mese:res.data[0].mese}}));
      }
      
      setGetListaContestazioniRunning(false);
    }).catch((err)=>{
    
      setGetListaContestazioniRunning(false);
      if(err?.response?.request?.status === 404){
        setFirstMonth(currentMonth);
        const currentMonthToArray = {
          mese:currentMonth.toString(),
          descrizione: month[currentMonth-1]
        };
        setArrayMesi([currentMonthToArray]);
       
      }else{
        setArrayMesi([]);
        manageError(err,dispatchMainState); 
      } 
    });
  };
  /*TODO:DA ELIMINARE
  const listaTipoReport = async () =>{
    await getTipoReportSE(token, profilo.nonce).then((res)=>{
      setTipologieDoc(res.data);
    }).catch(((err)=>{
      setTipologieDoc([]);
      manageError(err,dispatchMainState);
    }));
  };
*/
   
  const getListaContestazioni = async (body, pag, rowpag) => {
    setGetListaContestazioniRunning(true);

    try {
      if(!noYearsAvailable.current){
        const resListaStorico = await getListaStoricoSE(token, profilo.nonce, body, pag, rowpag);
        setListaToMap(resListaStorico.data.reports);

        const orderDataCustom = resListaStorico.data.reports.map((obj) => ({
          reportId: obj.reportId,
          dataInserimento: obj.dataInserimento.replace("T", " ").substring(0, 19),
          mese: month[obj.mese - 1],
          anno: obj.anno,
          stato: obj.descrizioneStato,
          idStato: obj.stato,
        }));
        setDataGrid(orderDataCustom);
        setTotalContestazioni(resListaStorico.data.count);
      }

    } catch (err: any) {
      setTotalContestazioni(0);
      setDataGrid([]);
      manageError(err, dispatchMainState);
    }

    // this runs even if the first failed
    try {
      let newBody = body;
      if(noYearsAvailable.current){
        newBody = {...body,...{anno:currentYear.toString(),mese:currentMonth.toString()}};
      }
      const resRecapNotifiche = await recapContestazioniSE(token, profilo.nonce, newBody);
      setRecapListaNotifiche(resRecapNotifiche.data);

    } catch (err: any) {
      manageError(err, dispatchMainState);

    } finally {
      setGetListaContestazioniRunning(false);
      isInitialRender.current = false;
    }
  };

  const handleAnnullaButton = () => {
    setBodyGetLista({
      anno:firstYear.toString(),
      mese:firstMonth.toString() ,
      idTipologiaReports:[]
    });
    setBodyFiltered({
      anno:firstYear.toString(),
      mese:firstMonth.toString() ,
      idTipologiaReports:[]
    });
    getListaContestazioni({
      mese:firstMonth.toString(),
      idTipologiaReports:[],
      anno:firstYear.toString()
    },1,10);
    setTipologiaSelected([]);
    resetFilters();
  };

  const handleFiltra = () => {
    updateFilters({
      pathPage:PathPf.STORICO_CONTEST,
      body:bodyGetLista,
      tipologiaSelcted:tipologiaSelcted,
      page:0,
      rows:10,
    });
    getListaContestazioni(bodyGetLista,page+1,rowsPerPage);
    setBodyFiltered(bodyGetLista);
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
      pathPage:PathPf.STORICO_CONTEST_ENTE,
      body:bodyGetLista,
      tipologiaSelcted:tipologiaSelcted,
      page:0,
      rows:parseInt(event.target.value, 10)
    });
  };

  const handleClickOnDetail = (el) => {    
    navigate(PathPf.STORICO_DETTAGLIO_CONTEST);
    const singleEl = listaToMap.find(elem => elem.reportId === el.id);
    handleModifyMainState({contestazioneSelected:singleEl});
  };  



  const statusAnnulla = (
    bodyGetLista.idTipologiaReports.length > 0 ||
     bodyGetLista.mese?.toString() !== firstMonth.toString() ||
     bodyGetLista.anno?.toString() !== firstYear.toString()
  ) ? "show":"hidden";
  


  return (
    <MainBoxStyled title={"Contestazioni"}>
      <ResponsiveGridContainer >
        <MainFilter 
          filterName={"select_value_string"}
          inputLabel={"Anno"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyGetLista}
          body={bodyGetLista}
          keyDescription={"anno"}
          keyValue={"anno"}
          keyBody={"anno"}
          arrayValues={valueYears}
          extraCodeOnChange={(e)=>{
            setBodyGetLista((prev)=> ({...prev, ...{anno:e.toString()}}));
            getMesi(e.toString());
          }}
          
        />
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
            setBodyGetLista((prev)=> ({...prev, ...{mese:e}})); 
                                 
          }}
        />
      </ResponsiveGridContainer>     
      <FilterActionButtons 
        onButtonFiltra={handleFiltra} 
        onButtonAnnulla={handleAnnullaButton} 
        statusAnnulla={statusAnnulla} 
        actionButton={[
          {variant:"outlined",
            onButtonClick:()=>navigate(PathPf.INIZIO_CONTEST_ENTE),
            label:"Crea Contestazione",
            icon:{name:"add"}
          }]}
      />
      <GridView 
        arrayData={recapListaNotifiche}
        configHeader={headersNameGridView}
        title={`Notifiche ${month[Number(bodyFiltered.mese)-1]} ${bodyFiltered.anno}`}
        noDataMessage={"Non ci sono notifiche da visualizzare"}
        noDataTitle={"Nessun dato disponibile"}
        apiRunning={getListaContestazioniRunning}
      />            
      <div className="mt-5">
        <div className="mt-1 mb-5" style={{ width: '100%'}}>
          <GridCustom
            nameParameterApi='contestazioneEnte'
            elements={dataGrid}
            changePage={handleChangePage}
            changeRow={handleChangeRowsPerPage} 
            total={totalContestazioni}
            page={page}
            rows={rowsPerPage}
            headerNames={headersName}
            apiGet={handleClickOnDetail}
            disabled={getListaContestazioniRunning}
            widthCustomSize="1300px"
            sentenseEmpty="Non ci sono contestazioni da visualizzare"
          />
        </div>
      </div>
      <ModalLoading 
        open={getListaContestazioniRunning} 
        setOpen={setGetListaContestazioniRunning} 
        sentence={'Loading...'}>
      </ModalLoading>
     
    </MainBoxStyled>
  );
};

export default StoricoEnte;