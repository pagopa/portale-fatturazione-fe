import { useEffect, useState } from "react";
import { AutocompleteMultiselect, GridElementListaPsp, OptionMultiselectCheckboxPsp } from "../../types/typeAngraficaPsp";
import { manageError } from "../../api/api";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { saveAs } from "file-saver";
import { PathPf } from '../../types/enum';
import useSavedFilters from '../../hooks/useSaveFiltersLocalStorage';
import GridCustom from '../../components/reusableComponents/grid/gridCustom';
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from '../../components/reusableComponents/layout/mainComponent';
import MainFilter from '../../components/reusableComponents/mainFilter';
import { useGlobalStore } from "../../store/context/useGlobalStore";
import { downloadAppio, getListaAnagraficaAppio, getListaNameAppio, getTipoEnteAppio } from "../../api/apiPagoPa/anagraficaAppio/api";
import { headerAnagraficaAppio } from "../../assets/configurations/conf_GridAnagraficaAppio";
export interface RequestBodyListaAnagraficaAppio{
  institutionIds: string[],
  tipiEnte:string[]
}

interface OptionMultiselectCheckboxTipoEnte{
  id: string,
  name:string
}

const AnagraficaAppio:React.FC = () =>{

  const mainState = useGlobalStore(state => state.mainState);
  const dispatchMainState = useGlobalStore(state => state.dispatchMainState);

  const token =  mainState.profilo.jwt;
  const profilo =  mainState.profilo;
   
  const [gridData, setGridData] = useState<GridElementListaPsp[]>([]);

  const [bodyGetLista, setBodyGetLista] = useState<RequestBodyListaAnagraficaAppio>({
    institutionIds:[],
    tipiEnte:[]
  });
   
  const [getListaLoading, setGetListaLoading] = useState(false);
  const [dataSelect, setDataSelect] = useState<OptionMultiselectCheckboxPsp[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal]  = useState(0);
  const [textValue, setTextValue] = useState<string>('');
  const [valueAutocomplete, setValueAutocomplete] = useState<AutocompleteMultiselect[]>([]);
  const [showLoading,setShowLoading] = useState(false);


  const [valueProfili, setValueProfili] = useState<OptionMultiselectCheckboxTipoEnte[]>([]);
  const [dataSelectProfili, setDataSelectProfili] = useState<OptionMultiselectCheckboxTipoEnte[]>([]);

  const { 
    filters,
    updateFilters,
    resetFilters,
    isInitialRender
  } = useSavedFilters(PathPf.ANAGRAFICAAPPIO,{});
 
  useEffect(()=>{
    if(isInitialRender.current && Object.keys(filters).length === 0){
      getListaAnagraficaAppioGrid(bodyGetLista,page,rowsPerPage);
    }
    getTipoEnte();
  },[]);

  useEffect(()=>{
    const timer = setTimeout(() => {
      if(textValue.length >= 3){ 
        listaNameAppioOnSelect();
      }
    }, 800);
    return () => clearTimeout(timer);
  },[textValue]);

  const getTipoEnte = async () => {
    try{
      const result = await getTipoEnteAppio(token, profilo.nonce);
      const data = result.data.map(el => ({id:el,name:el}));
      setDataSelectProfili(data);
    }catch{
      setDataSelectProfili([]);
    }
  };

  const getListaAnagraficaAppioGrid = async (
    body: RequestBodyListaAnagraficaAppio,
    page: number,
    rowsPerPage: number
  ) => {
    setGetListaLoading(true);
    try {
      const res = await getListaAnagraficaAppio(token, profilo.nonce, body, page+1, rowsPerPage);
      const orderDataCustom = res.data.contratti;
      setGridData(orderDataCustom);
      setTotal(res.data.count);
    } catch (err) {
      setGridData([]);
      setTotal(0);
      manageError(err, dispatchMainState);
    } finally {
      setGetListaLoading(false);
    }
  };

  const listaNameAppioOnSelect = async () =>{
    await getListaNameAppio(token, profilo.nonce, {name:textValue} ).then((res)=>{
      setDataSelect(res.data);
    }).catch(((err)=>{
      manageError(err,dispatchMainState); 
    }));
  };

  const onDownloadButton = async() =>{
    setShowLoading(true);
    await downloadAppio(token,profilo.nonce, bodyGetLista).then(response => response.blob()).then((res) => {
      const fileName = `Anagrafica AppIO.xlsx`;
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
    getListaAnagraficaAppioGrid(bodyGetLista,0,10); 
    updateFilters({
      body:bodyGetLista,
      pathPage:PathPf.ANAGRAFICAAPPIO,
      textValue,
      valueAutocomplete,
      page:0,
      rows:10
    });
  };

  const onButtonAnnulla = () => {
    const newBody = {
      institutionIds:[],
      tipiEnte:[]};
    getListaAnagraficaAppioGrid(newBody,0,10);
    setBodyGetLista(newBody);
    setRowsPerPage(10);
    setPage(0);
    setValueAutocomplete([]);
    setValueProfili([]);
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
    const realPage = newPage;
    getListaAnagraficaAppioGrid(bodyGetLista,realPage, rowsPerPage);
    setPage(newPage);
    updateFilters({
      body:bodyGetLista,
      pathPage:PathPf.ANAGRAFICAAPPIO,
      textValue,
      valueAutocomplete,
      page:newPage,
      rows:rowsPerPage
    });
  };
                
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    const realPage = page;
    getListaAnagraficaAppioGrid(bodyGetLista,realPage,parseInt(event.target.value, 10));
    updateFilters({
      body:bodyGetLista,
      pathPage:PathPf.ANAGRAFICAAPPIO,
      textValue,
      valueAutocomplete,
      page:realPage,
      rows:parseInt(event.target.value, 10)
    });
  };

  const statusAnnulla =
    ( bodyGetLista.institutionIds.length !== 0 ||
      bodyGetLista.tipiEnte.length !== 0
    )
      ? 'show'
      : 'hidden';

  return(
  
    <MainBoxStyled title={"Anagrafica AppIO"}>
      <ResponsiveGridContainer>
        <MainFilter 
          filterName={"multi_checkbox"}
          inputLabel={"Tipo Profilo"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyGetLista}
          body={bodyGetLista}
          dataSelect={dataSelectProfili}
          setTextValue={setTextValue}
          textValue={textValue}
          valueAutocomplete={valueProfili}
          setValueAutocomplete={setValueProfili}
          keyValue={"id"}
          keyDescription='name'
          keyBody={"tipiEnte"}
          extraCodeOnChangeArray={(value)=>{
            const arrayId = value.map(el => el.id);
            setBodyGetLista((prev) => ({...prev,...{tipiEnte:arrayId}}));
            setValueProfili(value);
          }}
          iconMaterial={RenderIcon("person",true)}/>
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
          keyValue={"institutionId"}
          keyBody={"institutionIds"}/>        
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
        }]}/>      
      <GridCustom
        nameParameterApi='contractId'
        elements={gridData}
        changePage={handleChangePage}
        changeRow={handleChangeRowsPerPage}
        total={total}
        page={page}
        rows={rowsPerPage}
        headerNames={headerAnagraficaAppio}
        disabled={getListaLoading}
        widthCustomSize="1200px"
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

