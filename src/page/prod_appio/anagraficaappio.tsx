import { useEffect,  useState } from "react";
import { AutocompleteMultiselect, GridElementListaPsp, OptionMultiselectCheckboxPsp, OptionMultiselectCheckboxQarter } from "../../types/typeAngraficaPsp";
import { manageError } from "../../api/api";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { saveAs } from "file-saver";
import { PathPf } from '../../types/enum';
import useSavedFilters from '../../hooks/useSaveFiltersLocalStorage';
import GridCustom from '../../components/reusableComponents/grid/gridCustom';
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from '../../components/reusableComponents/layout/mainComponent';
import MainFilter from '../../components/reusableComponents/mainFilter';
import { useGlobalStore } from "../../store/context/useGlobalStore";
import { headerAnagraficaPsp } from "../../assets/configurations/conf_GridAnagraficaPsp";
import { downloadAppio, getListaAnagraficaAppio, getListaAnniAppio, getListaNameAppio, getListaQuarters } from "../../api/apiPagoPa/anagraficaAppio/api";


export interface RequestBodyListaAnagraficaAppio{
    contractIds: string[],
    year?:string,
    quarters:string[]
}

const AnagraficaAppio:React.FC = () =>{

  const mainState = useGlobalStore(state => state.mainState);
  const dispatchMainState = useGlobalStore(state => state.dispatchMainState);

  const token =  mainState.profilo.jwt;
  const profilo =  mainState.profilo;
   
  const [gridData, setGridData] = useState<GridElementListaPsp[]>([]);

  const [bodyGetLista, setBodyGetLista] = useState<RequestBodyListaAnagraficaAppio>({
    contractIds:[],
    year: '',
    quarters:[]
  });
   

  const [getListaLoading, setGetListaLoading] = useState(false);
  const [dataSelect, setDataSelect] = useState<OptionMultiselectCheckboxPsp[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal]  = useState(0);
  const [textValue, setTextValue] = useState<string>('');
  const [valueAutocomplete, setValueAutocomplete] = useState<AutocompleteMultiselect[]>([]);
  const [showLoading,setShowLoading] = useState(false);
  const [yearOnSelect,setYearOnSelect] = useState<string[]>([]);
  const [year,setYear] = useState<string>('');
  const [dataSelectQuarter, setDataSelectQuarter] = useState<OptionMultiselectCheckboxQarter[]>([]);
  const [valueQuarters, setValueQuarters] = useState<OptionMultiselectCheckboxQarter[]>([]);

  const { 
    filters,
    updateFilters,
    resetFilters,
    isInitialRender
  } = useSavedFilters(PathPf.ANAGRAFICAAPPIO,{});
 
  useEffect(()=>{
    getYears();
  },[]);

  useEffect(()=>{
    const timer = setTimeout(() => {
      if(textValue.length >= 3){ 
        listaNamePspOnSelect();
      }
    }, 800);
    return () => clearTimeout(timer);
  },[textValue]);
    
  const getYears = async () =>{
    setGetListaLoading(true);

    await getListaAnniAppio(token, profilo.nonce).then((res)=>{
      setYearOnSelect(res.data);
      
      if(res.data.length > 0){
        if(isInitialRender.current && Object.keys(filters).length > 0){
          setYear(filters.year);
          getListaAnagraficaAppioGrid(filters.body,filters.page+1,filters.rows);
          getQuarters(filters.year);
        }else{
          setYear(res.data[0]);
          getListaAnagraficaAppioGrid(bodyGetLista,page+1,rowsPerPage);
          getQuarters(res.data[0]);
        }
      }
    }).catch(((err)=>{
      setGetListaLoading(false);
      manageError(err,dispatchMainState); 
    }));
  };
 
  const getQuarters = async (y) =>{
    await getListaQuarters(token, profilo.nonce,{year:y}).then((res)=>{
      setDataSelectQuarter(res.data);
      if(isInitialRender.current && Object.keys(filters).length > 0){
                   
        setValueQuarters(filters.valueQuarters);
        setBodyGetLista(filters.body);
        setTextValue(filters.textValue);
        setValueAutocomplete(filters.valueAutocomplete);
        setPage(filters.page);
        setRowsPerPage(filters.rows);
      }
      setGetListaLoading(false);
      isInitialRender.current = false;
    }).catch(((err)=>{
      isInitialRender.current = false;
      setDataSelectQuarter([]);
      setValueQuarters([]);
      manageError(err,dispatchMainState); 
      setGetListaLoading(false);
    }));
  };

  const getListaAnagraficaAppioGrid = async(body:RequestBodyListaAnagraficaAppio, page:number,rowsPerPage:number) =>{
    setGetListaLoading(true);
    const {year,...newBody} = body;
    await getListaAnagraficaAppio(token, profilo.nonce, newBody,page,rowsPerPage).then(async(res)=>{
      // ordino i dati in base all'header della grid
      const orderDataCustom = res.data.contratti;
      await setGridData(orderDataCustom);
      await setTotal(res.data.count);
      setGetListaLoading(false);
    }).catch(((err)=>{
      setGridData([]);
      setTotal(0);
      setGetListaLoading(false);
      manageError(err,dispatchMainState);       
    })); 
  };

  const listaNamePspOnSelect = async () =>{
    await getListaNameAppio(token, profilo.nonce, {name:textValue} ).then((res)=>{
      setDataSelect(res.data);
    }).catch(((err)=>{
      manageError(err,dispatchMainState); 
    }));
  };

  const onDownloadButton = async() =>{
    setShowLoading(true);
    const {year,...newBody} = bodyGetLista;
    await downloadAppio(token,profilo.nonce, newBody).then(response => response.blob()).then((res) => {
      let fileName = '';
      const stringQuarterSelected = bodyGetLista.quarters.map(el => "Q" + el.slice(5)).join("_");
      const yearSelected = gridData[0].yearQuarter?.slice(0,4);
      if(bodyGetLista.contractIds.length === 1){
        fileName = `Anagrafica AppIO/${gridData[0].name}/${yearSelected}/${stringQuarterSelected}.xlsx`;
      }else{
        fileName = `Anagrafica AppIO/${yearSelected}/${stringQuarterSelected}.xlsx`;
      }
      saveAs( res,fileName );
      setShowLoading(false);
    }).catch(err => {
      setShowLoading(false);
      manageError(err,dispatchMainState);
    });
  };

   
  const onButtonFiltra = () =>{
    setPage(0);
    setRowsPerPage(10);
    getListaAnagraficaAppioGrid(bodyGetLista,1,10); 
    updateFilters(
      {
        body:bodyGetLista,
        pathPage:PathPf.ANAGRAFICAAPPIO,
        textValue,
        valueAutocomplete,
        valueQuarters,
        year,
        page:0,
        rows:10
      });
  };

  const onButtonAnnulla = () => {
    const newBody = {
      contractIds:[],
      year:year,
      quarters:[]};
    getListaAnagraficaAppioGrid(newBody,1,10);
    setBodyGetLista(newBody);
    setRowsPerPage(10);
    setPage(0);
    setDataSelect([]);
    setValueAutocomplete([]);
    setValueQuarters([]);
    resetFilters();
  };

  const clearOnChangeFilter = () => {
    setGridData([]);
    setPage(0);
    setRowsPerPage(10);
    setTotal(0);
  };
  
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    const realPage = newPage + 1;
    getListaAnagraficaAppioGrid(bodyGetLista,realPage, rowsPerPage);
    setPage(newPage);
    updateFilters({
      body:bodyGetLista,
      pathPage:PathPf.ANAGRAFICAAPPIO,
      textValue,
      valueAutocomplete,
      valueQuarters,
      year,
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
    getListaAnagraficaAppioGrid(bodyGetLista,realPage,parseInt(event.target.value, 10));
    updateFilters({
      body:bodyGetLista,
      pathPage:PathPf.ANAGRAFICAAPPIO,
      textValue,
      valueAutocomplete,
      valueQuarters,
      year,
      page:realPage,
      rows:parseInt(event.target.value, 10)
    });
  };

  const statusAnnulla =
  bodyGetLista.contractIds.length !== 0 ||
  bodyGetLista.quarters.length !== 0
    ? 'show'
    : 'hidden';

  return(
  
    <MainBoxStyled title={"Anagrafica AppIO"}>
      <ResponsiveGridContainer>
        <MainFilter 
          filterName={"select_value_nobody"}
          inputLabel={"Anno"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setYear}
          body={year}
          keyDescription={"anno"}
          keyValue={"anno"}
          keyBody={"anno"}
          arrayValues={yearOnSelect}
          defaultValue={year}
          extraCodeOnChange={(e)=>{
            setYear(e);
            setValueQuarters([]);
            setBodyGetLista((prev)=>({...prev,...{quarters:[]}}));
            getQuarters(year);
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
        actionButtonRight={[{
          onButtonClick: () => onDownloadButton(),
          variant: "outlined",
          label: "Download risultati",
          icon:{name:"download"},
          disabled:( gridData.length === 0 || getListaLoading )
        }]}
      />      
      <GridCustom
        nameParameterApi='contractId'
        elements={gridData}
        changePage={handleChangePage}
        changeRow={handleChangeRowsPerPage}
        total={total}
        page={page}
        rows={rowsPerPage}
        headerNames={headerAnagraficaPsp}
        disabled={getListaLoading}
        widthCustomSize="1800px"
        sentenseEmpty={"Nessun dato disponibile"}
      />        
      <ModalLoading 
        open={showLoading} 
        setOpen={setShowLoading}
        sentence={'Downloading...'} />
      <ModalLoading 
        open={getListaLoading} 
        setOpen={setGetListaLoading}
        sentence={'Loading...'} />
    </MainBoxStyled>
       
  );
}; 
export default AnagraficaAppio;

