import { useEffect, useState } from "react";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { manageError, manageErrorDownload } from "../../api/api";
import { AutocompleteMultiselect, OptionMultiselectCheckboxQarter, OptionMultiselectCheckboxPsp, } from "../../types/typeAngraficaPsp";
import { getListaNamePsp } from "../../api/apiPagoPa/anagraficaPspPA/api";
import {getQuartersDocContabiliPa, getYearsDocContabiliPa } from "../../api/apiPagoPa/documentiContabiliPA/api";
import ModalMatriceKpi from "../../components/reusableComponents/modals/modalMatriceKpi";
import { kpiObj, RequestBodyKpi } from "../../types/typeKpi";
import { downloadKpiList, getListaKpi } from "../../api/apiPagoPa/kpi/api";
import { saveAs } from "file-saver";
import { PathPf } from "../../types/enum";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import { headersKpiCollapse } from "../../assets/configurations/conf_GridKpi";
import { headersKpi } from "../../assets/configurations/conf_GridKpi";

const KpiPagamenti:React.FC = () =>{
  const mainState = useGlobalStore(state => state.mainState);
  const dispatchMainState = useGlobalStore(state => state.dispatchMainState);

   
  const token =  mainState.profilo.jwt;
  const profilo =  mainState.profilo;
  const { 
    filters,
    updateFilters,
    resetFilters,
    isInitialRender
  } = useSavedFilters(PathPf.KPI,{});

  const [gridData, setGridData] = useState<kpiObj[]>([]);
  const [filtersDownload, setFiltersDownload] = useState<RequestBodyKpi>({
    contractIds: [],
    membershipId: '',
    recipientId: '',
    providerName: '',
    quarters: [],
    year: ''
  });

  const [bodyGetLista, setBodyGetLista] = useState<RequestBodyKpi>({
    contractIds: [],
    membershipId: '',
    recipientId: '',
    providerName: '',
    quarters: [],
    year: ''
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
  const [showPopUpMatrice,setShowPopUpMatrice] = useState(false);
  const [count, setCount] = useState(0);
  const [dataPaginated,setDataPaginated] = useState<kpiObj[]>([]);

  useEffect(()=>{
    getYears();
  }, []);

  useEffect(()=>{
    const timer = setTimeout(() => {
      if(textValue.length >= 3){ 
        listaNamePspOnSelect();
      }
    }, 800);
    return () => clearTimeout(timer);
  },[textValue]);


  const getListaKpiGrid = async(body:RequestBodyKpi) =>{
    setGetListaLoading(true);
    await getListaKpi(token, profilo.nonce, body)
      .then((res)=>{
        const data = res.data.kpiPagamentiScontoReports;
        setGridData(data);
        setDataPaginated(data.slice(0, rowsPerPage));
        setCount(res.data.count);
        setGetListaLoading(false);
      }).catch(((err)=>{
        setGridData([]);
        setCount(0);
        setGetListaLoading(false);
        manageError(err,dispatchMainState);
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
    await getYearsDocContabiliPa(token, profilo.nonce)
      .then((res)=>{
        setYearOnSelect(res.data);
        if(res.data.length > 0){
          if(isInitialRender.current && Object.keys(filters).length > 0){
            setBodyGetLista(filters.body);
            setFiltersDownload(filters.body);
            setValueAutocomplete(filters.valueAutocomplete);
            setTextValue(filters.textValue);
            getListaKpiGrid(filters.body);
            setValueQuarters(filters.valueQuarters);
            setPage(filters.page);
            setRowsPerPage(filters.rows);
            getQuarters(filters.body.year);

                        
          }else{
            setBodyGetLista((prev) => ({...prev,...{year:res.data[0]}}));
            setFiltersDownload((prev) => ({...prev,...{year:res.data[0]}}));
            getListaKpiGrid({...bodyGetLista,...{year:res.data[0]}});
            getQuarters(res.data[0]);
                      
          }
        }
      }).catch(((err)=>{
        manageError(err,dispatchMainState); 
      }));
  };

  const getQuarters = async (y) =>{
    await getQuartersDocContabiliPa(token, profilo.nonce,{year:y})
      .then((res)=>{
        setDataSelectQuarter(res.data);
        isInitialRender.current = false;
      }).catch(((err)=>{
        isInitialRender.current = false;
        setValueQuarters([]);
        setDataSelectQuarter([]);
        manageError(err,dispatchMainState); 
      }));
  };

  const onDownloadButton = async() =>{
    setShowLoading(true);
    await downloadKpiList(token,profilo.nonce, filtersDownload).then(response =>{
      if (response.ok) {
        return response.blob();
      }
      throw '404';
    }).then((res) => {
      let fileName = '';
      const stringQuarterSelected = filtersDownload.quarters.map(el => "Q" + el.slice(5)).join("_");
      if(filtersDownload.contractIds.length === 1){
        fileName = `Lista pagamenti KPI/${gridData[0].name}/${filtersDownload.year}/${stringQuarterSelected}.xlsx`;
      }else{
        fileName = `Lista pagamenti KPI/${filtersDownload.year}/${stringQuarterSelected}.xlsx`;
      }
      saveAs( res,fileName );
      setShowLoading(false);
    }).catch(err => {
      setShowLoading(false);
      manageErrorDownload('404',dispatchMainState);
    });
  };

  const clearOnChangeFilter = () => {
    setGridData([]);
    setPage(0);
    setRowsPerPage(10);
    setCount(0);
  };

  const onButtonFiltra = () =>{
    updateFilters(
      {
        body:bodyGetLista,
        pathPage:PathPf.KPI,
        textValue,
        valueAutocomplete,
        valueQuarters,
        page:0,
        rows:10
      });
    setFiltersDownload(bodyGetLista);
    getListaKpiGrid(bodyGetLista); 
    setPage(0);
    setRowsPerPage(10);
  };

  const onButtonAnnulla = () => {            
    const newBody = {
      contractIds:[],
      membershipId: '',
      recipientId: '',
      providerName: '',
      quarters:[],
      year:yearOnSelect[0]};
    getListaKpiGrid(newBody);
    setBodyGetLista(newBody);
    setFiltersDownload(newBody);
    setDataSelect([]);
    setValueAutocomplete([]);
    setValueQuarters([]);
    setPage(0);
    setRowsPerPage(10);
    resetFilters();
  };

  const onUpdateFiltersGrid = (page, rows) => {
    updateFilters({
      page:page,
      rows:rows,
      pathPage:PathPf.KPI,
      body:bodyGetLista,
      textValue:textValue,
      valueAutocomplete:valueAutocomplete,
      valueQuarters:valueQuarters,
    });
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


  const handleOnDownloadLink = (url,name) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    //saveAs(url,name);     
  };

  const statusAnnulla =
  bodyGetLista.contractIds.length !== 0 ||
  bodyGetLista.membershipId !== '' ||
  bodyGetLista.recipientId !== '' ||
  bodyGetLista.providerName !== '' ||
  bodyGetLista.quarters.length > 0
    ? 'show'
    : 'hidden';
   
  return(
    <MainBoxStyled title={"KPI Pagamenti"} actionButton={[{
      onButtonClick: () => setShowPopUpMatrice(true),
      variant: "outlined",
      withText:true,
      label:"Matrice KPI"
    }]}>
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
          extraCodeOnChange={()=>{
            setValueQuarters([]);
            setBodyGetLista((prev)=>({...prev,...{quarters:[]}}));
            getQuarters(bodyGetLista.year);
          }}
        ></MainFilter>
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
          iconMaterial={RenderIcon("date",true)}
        ></MainFilter>
        <MainFilter 
          filterName={"multi_checkbox"}
          inputLabel={"Nome PSP"}
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
          keyBody={"contractIds"}
        ></MainFilter>
        <MainFilter 
          filterName={"input_text"}
          inputLabel={"Membership ID"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyGetLista}
          body={bodyGetLista}
          keyValue={"membershipId"}
          keyDescription={"membershipId"}
          keyBody={"membershipId"}
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
        ></MainFilter>
        <MainFilter 
          filterName={"input_text"}
          inputLabel={"Provider name/ID"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyGetLista}
          body={bodyGetLista}
          keyValue={"providerName"}
          keyDescription={"providerName"}
          keyBody={"providerName"}
        ></MainFilter>
                                           
      </ResponsiveGridContainer>
      <FilterActionButtons 
        onButtonFiltra={onButtonFiltra} 
        onButtonAnnulla={onButtonAnnulla} 
        statusAnnulla={statusAnnulla} 
      ></FilterActionButtons>
      <ActionTopGrid
        actionButtonRight={[{
          onButtonClick: () => onDownloadButton(),
          variant: "outlined",
          label: "Download risultati",
          icon:{name:"download" },
          disabled:( gridData.length === 0 || getListaLoading )
        }]}
      />      
             
      <GridCustom
        nameParameterApi='xxxx'
        elements={dataPaginated}
        changePage={handleChangePage}
        changeRow={handleChangeRowsPerPage}
        setAction={handleOnDownloadLink}
        total={count}
        page={page}
        rows={rowsPerPage}
        headerNames={headersKpi}
        headerNamesCollapse={headersKpiCollapse}
        disabled={getListaLoading}
        widthCustomSize="1200px"
        sentenseEmpty={"Nessun dato disponibile"}
        keyCollapse={"posizioni"}
        titleRowCollapse={"Posizioni"}
      /> 
      <ModalLoading 
        open={showLoading} 
        setOpen={setShowLoading}
        sentence={'Downloading...'} />
      <ModalLoading 
        open={getListaLoading} 
        setOpen={setGetListaLoading}
        sentence={'Loading...'} />
      <ModalMatriceKpi 
        open={showPopUpMatrice} 
        setOpen={setShowPopUpMatrice}
        anni={yearOnSelect}
        setShowLoading={setShowLoading}/>
    </MainBoxStyled>
       
  );
}; 
export default KpiPagamenti;

