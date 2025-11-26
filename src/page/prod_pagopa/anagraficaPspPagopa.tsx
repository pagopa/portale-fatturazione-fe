import { useContext, useEffect,  useState } from "react";
import { AutocompleteMultiselect, GridElementListaPsp, OptionMultiselectCheckboxPsp, OptionMultiselectCheckboxQarter, RequestBodyListaAnagraficaPsp } from "../../types/typeAngraficaPsp";
import { downloadPsp, getListaAnagraficaPsp, getListaAnniPsp, getListaNamePsp, getListaQuarters } from "../../api/apiPagoPa/anagraficaPspPA/api";
import { manageError } from "../../api/api";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { saveAs } from "file-saver";
import { GlobalContext } from '../../store/context/globalContext';
import { PathPf } from '../../types/enum';
import useSavedFilters from '../../hooks/useSaveFiltersLocalStorage';
import GridCustom from '../../components/reusableComponents/grid/gridCustom';
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from '../../components/reusableComponents/layout/mainComponent';
import MainFilter from '../../components/reusableComponents/mainFilter';


const AnagraficaPsp:React.FC = () =>{

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

   
    const [gridData, setGridData] = useState<GridElementListaPsp[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [filtersDownload, setFiltersDownload] = useState<RequestBodyListaAnagraficaPsp>({
        contractIds:[],
        membershipId: '',
        recipientId: '',
        abi: '',
        quarters:[]});
    const [bodyGetLista, setBodyGetLista] = useState<RequestBodyListaAnagraficaPsp>({
        contractIds:[],
        membershipId: '',
        recipientId: '',
        abi: '',
        quarters:[]
    });
   

    const [getListaLoading, setGetListaLoading] = useState(false);
    const [dataSelect, setDataSelect] = useState<OptionMultiselectCheckboxPsp[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalPsp, setTotalPsp]  = useState(0);
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
    } = useSavedFilters(PathPf.ANAGRAFICAPSP,{});
 
    useEffect(()=>{
        getYears();
    },[]);

    useEffect(()=>{
        if(year !== '' && !isInitialRender.current){
            setValueQuarters([]);
            setBodyGetLista((prev)=>({...prev,...{quarters:[]}}));
            getQuarters(year);
        }
    },[year]);

    useEffect(()=>{
        if( bodyGetLista.contractIds.length  !== 0 ||
            bodyGetLista.membershipId !== '' ||
            bodyGetLista.recipientId !== ''||
            bodyGetLista.abi !== ''||
            bodyGetLista.quarters.length !== 0
        ){ setStatusAnnulla('show');
        }else{
            setStatusAnnulla('hidden');
        }

        
    },[bodyGetLista]);

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

        await getListaAnniPsp(token, profilo.nonce)
            .then((res)=>{
                setYearOnSelect(res.data);
                if(res.data.length > 0){
                    if(isInitialRender.current && Object.keys(filters).length > 0){
                        setYear(filters.year);
                        getListaAnagraficaPspGrid(filters.body,filters.page+1,filters.rows);
                        getQuarters(filters.year);
                    }else{
                        setYear(res.data[0]);
                        getListaAnagraficaPspGrid(bodyGetLista,page+1,rowsPerPage);
                        getQuarters(res.data[0]);
                    }
                }
            }).catch(((err)=>{
                setGetListaLoading(false);
                manageError(err,dispatchMainState); 
            }));
    };
 
    const getQuarters = async (y) =>{
        await getListaQuarters(token, profilo.nonce,{year:y})
            .then((res)=>{
                setDataSelectQuarter(res.data);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                   
                    setValueQuarters(filters.valueQuarters);
                    setBodyGetLista(filters.body);
                    setFiltersDownload(filters.body);
                    setTextValue(filters.textValue);
                    setValueAutocomplete(filters.valueAutocomplete);
                    setPage(filters.page);
                    setRowsPerPage(filters.rows);
                    setFiltersDownload(filters.body);
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

    const getListaAnagraficaPspGrid = async(body:RequestBodyListaAnagraficaPsp, page:number,rowsPerPage:number) =>{
        setGetListaLoading(true);
        await getListaAnagraficaPsp(token, profilo.nonce, body,page,rowsPerPage)
            .then(async(res)=>{
                // ordino i dati in base all'header della grid
                const orderDataCustom = res.data.psPs.map((obj)=>{
                    // inserire come prima chiave l'id se non si vuol renderlo visibile nella grid
                    // 'id serve per la chiamata get dettaglio dell'elemento selezionato nella grid
                    return {
                        contractId:obj.contractId,
                        documentName:obj.name,
                        contractId2:obj.contractId,
                        yearQuarter:obj.yearQuarter,
                        providerNames:obj.providerNames||"--",
                        pecMail:obj.pecMail||"--",
                        sdiCode:obj.sdiCode||"--",
                        abi:obj.abi||"--",
                        referenteFatturaMail:obj.referenteFatturaMail||"--",
                        signedDate:new Date(obj.signedDate).toISOString().split('T')[0],
                    };
                });
                await setGridData(orderDataCustom);
                await setTotalPsp(res.data.count);
                setGetListaLoading(false);
            })
            .catch(((err)=>{
                setGridData([]);
                setTotalPsp(0);
                setGetListaLoading(false);
                manageError(err,dispatchMainState);
              
            })); 
    };


    // servizio che popola la select con la checkbox
    const listaNamePspOnSelect = async () =>{
        await getListaNamePsp(token, profilo.nonce, {name:textValue} )
            .then((res)=>{
                setDataSelect(res.data);
            })
            .catch(((err)=>{
                manageError(err,dispatchMainState); 
            }));
    };

    const onDownloadButton = async() =>{
        setShowLoading(true);
        await downloadPsp(token,profilo.nonce, filtersDownload).then(response => response.blob()).then((res) => {
            let fileName = '';
            const stringQuarterSelected = filtersDownload.quarters.map(el => "Q" + el.slice(5)).join("_");
            const yearSelected = gridData[0].yearQuarter?.slice(0,4);
            if(filtersDownload.contractIds.length === 1){
                fileName = `Anagrafica PSP/${gridData[0].documentName}/${yearSelected}/${stringQuarterSelected}.xlsx`;
            }else{
                fileName = `Anagrafica PSP/${yearSelected}/${stringQuarterSelected}.xlsx`;
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
        setFiltersDownload(bodyGetLista);
        getListaAnagraficaPspGrid(bodyGetLista,1,10); 
        updateFilters(
            {
                body:bodyGetLista,
                pathPage:PathPf.ANAGRAFICAPSP,
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
            membershipId: '',
            recipientId: '',
            abi: '',
            quarters:[]};
        getListaAnagraficaPspGrid(newBody,1,10);
        setBodyGetLista(newBody);
        setFiltersDownload(newBody);
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
        setTotalPsp(0);
    };
  


    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        const realPage = newPage + 1;
        getListaAnagraficaPspGrid(filtersDownload,realPage, rowsPerPage);
        setPage(newPage);
        updateFilters({
            body:filtersDownload,
            pathPage:PathPf.ANAGRAFICAPSP,
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
        getListaAnagraficaPspGrid(filtersDownload,realPage,parseInt(event.target.value, 10));
        updateFilters({
            body:filtersDownload,
            pathPage:PathPf.ANAGRAFICAPSP,
            textValue,
            valueAutocomplete,
            valueQuarters,
            year,
            page:realPage,
            rows:parseInt(event.target.value, 10)
        });
    };

    return(
  
        <MainBoxStyled title={"Anagrafica PSP"}>
            <ResponsiveGridContainer >
                <MainFilter 
                    filterName={"select_value"}
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
                    inputLabel={"Codice ABI"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyValue={"abi"}
                    keyDescription={"abi"}
                    keyBody={"abi"}
                ></MainFilter>
                   
            </ResponsiveGridContainer>
            <FilterActionButtons 
                onButtonFiltra={onButtonFiltra} 
                onButtonAnnulla={onButtonAnnulla} 
                statusAnnulla={statusAnnulla} 
            ></FilterActionButtons>
            <ActionTopGrid
                actionButtonRight={[{
                    onButtonClick: () => onDownloadButton,
                    variant: "outlined",
                    label: "Download risultati",
                    icon:{name:"download" },
                    disabled:( gridData.length === 0 || getListaLoading )
                }]}
            />      
            <GridCustom
                nameParameterApi='contractId'
                elements={gridData}
                changePage={handleChangePage}
                changeRow={handleChangeRowsPerPage}
                total={totalPsp}
                page={page}
                rows={rowsPerPage}
                headerNames={['Nome PSP', 'ID Contratto', 'Trimestre', 'Nome Fornitore', 'E-mail PEC', 'Codice SDI', 'Codice ABI', 'E-Mail Ref. Fattura', 'Data', '']}
                disabled={getListaLoading}
                widthCustomSize="2000px"></GridCustom>
                
            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading}
                sentence={'Downloading...'} >
            </ModalLoading>
            <ModalLoading 
                open={getListaLoading} 
                setOpen={setGetListaLoading}
                sentence={'Loading...'} >
            </ModalLoading>
        </MainBoxStyled>
       
    );
}; 
export default AnagraficaPsp;

