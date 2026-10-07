import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { manageError } from "../../api/api";
import { AutocompleteMultiselect, OptionMultiselectCheckboxQarter, OptionMultiselectCheckboxPsp, } from "../../types/typeAngraficaPsp";
import { getListaNamePsp } from "../../api/apiPagoPa/anagraficaPspPA/api";
import { PathPf } from "../../types/enum";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import { useNavigate } from "react-router-dom";
import { downloadDocContabiliAppio, getListaDocumentiContabiliAppio, getQuartersDocContabiliAppio, getYearsDocContabiliAppio } from "../../api/apiPagoPa/documentiemessiAppio/api";
import { headersDocContabiliAppio, headersDocContabiliAppioCollapse } from "../../assets/configurations/conf_GridDocContabiliAppio";

export interface BodyDocContabiliAppiio {
  contractIds:string[],
    quarters:string[],
    year:string
}


const DocumentiContabiliAppio:React.FC = () =>{

  const mainState = useGlobalStore(state => state.mainState);
  const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
 
  const token =  mainState.profilo.jwt;
  const profilo =  mainState.profilo;
  const navigate = useNavigate();

  const [gridData, setGridData] = useState<any[]>([]);

  const [bodyGetLista, setBodyGetLista] = useState<BodyDocContabiliAppiio>({
    contractIds:[],
    quarters:[],
    year:''
  });

  const [getListaLoading, setGetListaLoading] = useState(false);
  const [dataSelect, setDataSelect] = useState<OptionMultiselectCheckboxPsp[]>([]);
  const [dataSelectQuarter, setDataSelectQuarter] = useState<OptionMultiselectCheckboxQarter[]>([]);
  const [valueQuarters, setValueQuarters] = useState<OptionMultiselectCheckboxQarter[]>([]);
  const [textValue, setTextValue] = useState<string>('');
  const [valueAutocomplete, setValueAutocomplete] = useState<AutocompleteMultiselect[]>([]);
  const [showLoading,setShowLoading] = useState(false);
  const [yearOnSelect,setYearOnSelect] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState(0);
  const [dataPaginated,setDataPaginated] = useState<any[]>([]);
  const { 
    filters,
    updateFilters,
    resetFilters,
    isInitialRender
  } = useSavedFilters(PathPf.DOCUMENTICONTABILIAPPIO,{});
    
  useEffect(()=>{
    getYears();
  }, []);
   
   
  const clearOnChangeFilter = () => {
    setGridData([]);
    setPage(0);
    setRowsPerPage(10);
    setCount(0);
  };

  useEffect(()=>{
    const timer = setTimeout(() => {
      if(textValue.length >= 3){ 
        listaNamePspOnSelect();
      }
    }, 800);
    return () => clearTimeout(timer);
  },[textValue]);

  const getListaDocGrid = async(body:BodyDocContabiliAppiio) =>{
    setGetListaLoading(true);
    await getListaDocumentiContabiliAppio(token, profilo.nonce, body)
      .then((res)=>{
        
        const data = res.data.financialReports;/*.map((el,i) =>{
          el.name = `Ente AppIO - ${i}`;
          el.contractId = `con-app-io-${i}`; 
          return el;
        });*/
        setGridData(data);
        setCount(data.length);
        if(isInitialRender.current && Object.keys(filters).length > 0){
          const rows = filters?.rows || 10;
          const page = filters?.page || 0;
          const start = page * rows;
          const end = start + rows;
          setDataPaginated(data.slice(start, end));
          isInitialRender.current = false;
        }else{
          setDataPaginated(data.slice(0, 10));
        }
        setGetListaLoading(false); 
      }).catch(((err)=>{
        setGridData([]);
        setDataPaginated([]);
        setCount(0);
        setGetListaLoading(false);
        manageError(err,dispatchMainState);
        if(isInitialRender.current && Object.keys(filters).length > 0){
          isInitialRender.current = false;
        }
      })); 
  };


  // servizio che popola la select con la checkbox
  const listaNamePspOnSelect = async () =>{
    await getListaNamePsp(token, profilo.nonce, {name:textValue} )
      .then((res)=>{
        setDataSelect(res.data);
      }).catch(((err)=>{
        manageError(err,dispatchMainState); 
      }));
  };

  const getYears = async () =>{
    await getYearsDocContabiliAppio(token, profilo.nonce)
      .then((res)=>{
        setYearOnSelect(res.data);
        if(res.data.length > 0){
          if(isInitialRender.current && Object.keys(filters).length > 0){
            setBodyGetLista(filters.body);
            setValueAutocomplete(filters.valueAutocomplete);
            setTextValue(filters.textValue);
            getListaDocGrid(filters.body);
            setValueQuarters(filters.valueQuarters);
            setPage(filters.page);
            setRowsPerPage(filters.rows);
            getQuarters(filters.body.year);
                       
          }else{
            setBodyGetLista((prev) => ({...prev,...{year:res.data[0]}}));
            getListaDocGrid({...bodyGetLista,...{year:res.data[0]}});
            getQuarters(res.data[0]);
                        
          }
        }
      }).catch(((err)=>{
        manageError(err,dispatchMainState); 
      }));
  };

  const getQuarters = async (y) =>{
    await getQuartersDocContabiliAppio(token, profilo.nonce,{year:y}).then((res)=>{
      setDataSelectQuarter(res.data);
    }).catch(((err)=>{
      setValueQuarters([]);
      setDataSelectQuarter([]);
      manageError(err,dispatchMainState); 
    }));
  };


  const onDownloadButton = async() =>{
    setShowLoading(true);
    await downloadDocContabiliAppio(token,profilo.nonce, bodyGetLista).then(response =>{
      if(response.status !== 200){
        setShowLoading(false);
        manageError({response:{request:{status:Number(response.status)}},message:''},dispatchMainState);
      }else{
        return response.blob();
      }
    }).then((res) => {
      let fileName = '';
      const stringQuarterSelected = bodyGetLista.quarters.map(el => "Q" + el.slice(5)).join("_");
      if(bodyGetLista.contractIds.length === 1){
        fileName = `Documenti contabili/${gridData[0].name}/${gridData[0].riferimentoData.substring(0, 4)}/${stringQuarterSelected}.xlsx`;
      }else{
        fileName = `Documenti contabili/${gridData[0].riferimentoData.substring(0, 4)}/${stringQuarterSelected}.xlsx`;
      }
      saveAs( res,fileName );
      setShowLoading(false);
    }).catch(err => {
      setShowLoading(false);
      manageError(err,dispatchMainState);
    });
  };
  /* :TODO da eliminare
  const onDownloadReportButton =  async() =>{
    setShowLoading(true);
    await downloadFinancialReportDocContabiliAppio(token,profilo.nonce, bodyGetLista).then((response) =>{
      if(response.status !== 200){
        setShowLoading(false);
        manageError({response:{request:{status:Number(response.status)}},message:''},dispatchMainState);
      }else{
        return response.blob();
      }
    }).then((res) => {
      let fileName = '';
      const stringQuarterSelected = bodyGetLista.quarters.map(el => "Q" + el.slice(5)).join("_");
      if(bodyGetLista.contractIds.length === 1){
        fileName = `Financial report PF/${gridData[0].name}/${gridData[0].yearQuarter.substring(0, 4)}/${stringQuarterSelected}.xlsx`;
      }else{
        fileName = `Financial report PF/${gridData[0].yearQuarter.substring(0, 4)}/${stringQuarterSelected}.xlsx`;
      }
      saveAs( res,fileName );
      setShowLoading(false);
    }).catch(err => {
      manageError(err,dispatchMainState);
    });
  };
*/
  const onButtonFiltra = () =>{
    updateFilters(
      {
        body:bodyGetLista,
        pathPage:PathPf.DOCUMENTICONTABILI,
        textValue:textValue,
        valueAutocomplete:valueAutocomplete,
        valueQuarters:valueQuarters,
        page:0,
        rows:10
      });
    getListaDocGrid(bodyGetLista); 
    setPage(0);
    setRowsPerPage(10);
  };

  const onUpdateFiltersGrid = (page, rows) => {
    updateFilters({
      page:page,
      rows:rows,
      pathPage:PathPf.DOCUMENTICONTABILIAPPIO,
      body:bodyGetLista,
      textValue:textValue,
      valueAutocomplete:valueAutocomplete,
      valueQuarters:valueQuarters,
    });
  };

  const onButtonAnnulla = () => {
    const newBody = {
      contractIds:[],
      quarters:[],
      year:yearOnSelect[0]};
    getListaDocGrid(newBody);
    setBodyGetLista(newBody);
    setDataSelect([]);
    setValueAutocomplete([]);
    setValueQuarters([]);
    setPage(0);
    setRowsPerPage(10);
    resetFilters();
  };


  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
          
    const start = newPage * rowsPerPage;
    const end = start + rowsPerPage;
       
    const elementsToShow = gridData.slice(start, end);
    setDataPaginated(elementsToShow);
  
    onUpdateFiltersGrid(newPage,rowsPerPage);
  };
                          
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newRows = parseInt(event.target.value, 10);
  
    setRowsPerPage(newRows);
    setPage(0);
  
    const elementsToShow = gridData.slice(0, newRows);
    setDataPaginated(elementsToShow);
    onUpdateFiltersGrid(0, newRows);
  };


  const handleGoToDetail = (row) => {  
    dispatchMainState({
      type:'MODIFY_MAIN_STATE',
      value:{docContabileSelected:{key:`${row.contractId}|${row.yearQuarter}|${row.numero}`}}
    });
    navigate(PathPf.DETTAGLIO_DOC_CONTABILE);
  };
   
  const statusAnnulla =
  bodyGetLista.contractIds.length !== 0 ||
  bodyGetLista.quarters.length > 0
    ? 'show'
    : 'hidden';

  return(
    <MainBoxStyled title={"Documenti contabili"}>
      <ResponsiveGridContainer >
        <MainFilter 
          filterName={"select_value_string"}
          inputLabel={"Anno"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyGetLista}
          body={bodyGetLista}
          keyDescription={"year"}
          keyValue={"year"}
          keyBody={"year"}
          arrayValues={yearOnSelect}
          extraCodeOnChange={(e)=>{
            setValueQuarters([]);
            setBodyGetLista((prev)=>({...prev,...{year:e,quarters:[]}}));
            getQuarters(bodyGetLista.year);
          }}/>
        <MainFilter 
          filterName={"multi_checkbox"}
          inputLabel={"Trimestre"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyGetLista}
          body={bodyGetLista}
          dataSelect={dataSelectQuarter}
          setTextValue={setTextValue}
          textValue={textValue}
          valueAutocomplete={valueQuarters}
          setValueAutocomplete={setValueQuarters}
          keyDescription={"quarter"}
          keyValue={"value"}
          keyBody={"quarters"}
          extraCodeOnChangeArray={(value)=>{
            const arrayId = value.map(el => el.value);
            setBodyGetLista((prev) => ({...prev,...{quarters:arrayId}}));
            setValueQuarters(value);
          }}
          iconMaterial={RenderIcon("date",true)}/>
        <MainFilter 
          filterName={"multi_checkbox"}
          inputLabel={"Ente"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyGetLista}
          body={bodyGetLista}
          dataSelect={dataSelect}
          setTextValue={setTextValue}
          textValue={textValue}
          valueAutocomplete={valueAutocomplete}
          setValueAutocomplete={setValueAutocomplete}
          keyDescription={"name"}
          keyValue={"contractId"}
          keyBody={"contractIds"}/>         
      </ResponsiveGridContainer>
      <FilterActionButtons 
        onButtonFiltra={onButtonFiltra} 
        onButtonAnnulla={onButtonAnnulla} 
        statusAnnulla={statusAnnulla} />
      <ActionTopGrid
        actionButtonRight={ [{
          onButtonClick: () => onDownloadButton(),
          variant: "outlined",
          label: "Download risultati",
          icon:{name:"download" },
          disabled:( gridData.length === 0 || getListaLoading )
        }] }/>       
      <GridCustom
        nameParameterApi='xxxx'
        elements={dataPaginated}
        changePage={handleChangePage}
        changeRow={handleChangeRowsPerPage}
        apiGet={handleGoToDetail}
        total={count}
        page={page}
        rows={rowsPerPage}
        headerNames={headersDocContabiliAppio}
        headerNamesCollapse={headersDocContabiliAppioCollapse}
        disabled={getListaLoading}
        widthCustomSize="800px"
        sentenseEmpty={"Nessun dato disponibile"}
        keyCollapse={"posizioni"}
        titleRowCollapse={"Posizioni"}/> 
      <ModalLoading 
        open={showLoading} 
        setOpen={setShowLoading}
        sentence={'Downloading...'}/>
      <ModalLoading 
        open={getListaLoading} 
        setOpen={setGetListaLoading}
        sentence={'Loading...'} />
    </MainBoxStyled>
  );
}; 
export default DocumentiContabiliAppio;

