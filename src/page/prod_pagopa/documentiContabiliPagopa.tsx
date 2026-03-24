import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { manageError } from "../../api/api";
import { AutocompleteMultiselect, OptionMultiselectCheckboxQarter, OptionMultiselectCheckboxPsp, } from "../../types/typeAngraficaPsp";
import { getListaNamePsp } from "../../api/apiPagoPa/anagraficaPspPA/api";
import { DocContabili, RequestBodyListaDocContabiliPagopa } from "../../types/typeDocumentiContabili";
import { downloadDocContabili, downloadFinancialReportDocContabili, getListaDocumentiContabiliPa, getQuartersDocContabiliPa, getYearsDocContabiliPa } from "../../api/apiPagoPa/documentiContabiliPA/api";
import CollapsibleTablePa from "../../components/reusableComponents/grid/gridCollapsible/gridCustomCollapsiblePa";
import { HeaderCollapsible } from "../../types/typeFatturazione";
import RowBase from "../../components/reusableComponents/grid/gridCollapsible/rowBase";
import { PathPf } from "../../types/enum";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { useGlobalStore } from "../../store/context/useGlobalStore";


const DocumentiContabili:React.FC = () =>{

    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
 
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const [gridData, setGridData] = useState<DocContabili[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [filtersDownload, setFiltersDownload] = useState<RequestBodyListaDocContabiliPagopa>({
        contractIds:[],
        membershipId: '',
        recipientId: '',
        abi: '',
        quarters:[],
        year:''
    });

    const [bodyGetLista, setBodyGetLista] = useState<RequestBodyListaDocContabiliPagopa>({
        contractIds:[],
        membershipId: '',
        recipientId: '',
        abi: '',
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
    const [dataPaginated,setDataPaginated] = useState<DocContabili[]>([]);
    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.DOCUMENTICONTABILI,{});
    
    useEffect(()=>{
        getYears();
    }, []);
   
    useEffect(()=>{
        let from = 0;
        if(page === 0){
            from = 0;
        }else{
            from = page * rowsPerPage;
        }
        setDataPaginated(gridData.slice(from, rowsPerPage + from));
    }, [page,rowsPerPage,gridData]);

   
    useEffect(()=>{
        if(bodyGetLista.contractIds.length  !== 0 || bodyGetLista.membershipId !== '' || bodyGetLista.recipientId !== ''|| bodyGetLista.abi !== '' || bodyGetLista.quarters.length > 0){
            setStatusAnnulla('show');
        }else{
            setStatusAnnulla('hidden');
        }
    },[bodyGetLista]);
   
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

    useEffect(()=>{
        if(bodyGetLista.year !== '' && !isInitialRender.current){
            setValueQuarters([]);
            setBodyGetLista((prev)=>({...prev,...{quarters:[]}}));
            getQuarters(bodyGetLista.year);
        }
    },[bodyGetLista.year]);

    const getListaDocGrid = async(body:RequestBodyListaDocContabiliPagopa) =>{
        setGetListaLoading(true);
        await getListaDocumentiContabiliPa(token, profilo.nonce, body)
            .then((res)=>{
                const dataWithNewId = res.data.financialReports.map(el => {
                    el.id = el.id.toString()+el.yearQuarter;
                    return el;
                });
                setGridData(dataWithNewId);
                setCount(dataWithNewId.length);
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
                        getListaDocGrid(filters.body);
                        setValueQuarters(filters.valueQuarters);
                        setPage(filters.page);
                        setRowsPerPage(filters.rows);
                        getQuarters(filters.body.year);
                       
                    }else{
                        setBodyGetLista((prev) => ({...prev,...{year:res.data[0]}}));
                        setFiltersDownload((prev) => ({...prev,...{year:res.data[0]}}));
                        getListaDocGrid({...bodyGetLista,...{year:res.data[0]}});
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
        await downloadDocContabili(token,profilo.nonce, filtersDownload).then(response =>{
            if(response.status !== 200){
                setShowLoading(false);
                manageError({response:{request:{status:Number(response.status)}},message:''},dispatchMainState);
            }else{
                return response.blob();
            }
        }).then((res) => {
            let fileName = '';
            const stringQuarterSelected = filtersDownload.quarters.map(el => "Q" + el.slice(5)).join("_");
            if(filtersDownload.contractIds.length === 1){
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

    const onDownloadReportButton =  async() =>{
        setShowLoading(true);
        await downloadFinancialReportDocContabili(token,profilo.nonce, filtersDownload).then((response) =>{
            if(response.status !== 200){
                setShowLoading(false);
                manageError({response:{request:{status:Number(response.status)}},message:''},dispatchMainState);
            }else{
                return response.blob();
            }
        }).then((res) => {
            let fileName = '';
            const stringQuarterSelected = filtersDownload.quarters.map(el => "Q" + el.slice(5)).join("_");
            if(filtersDownload.contractIds.length === 1){
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
        setFiltersDownload(bodyGetLista);
        getListaDocGrid(bodyGetLista); 
        setPage(0);
        setRowsPerPage(10);
    };

    const onUpdateFiltersGrid = (page, rows) => {
        updateFilters({
            page:page,
            rows:rows,
            pathPage:PathPf.DOCUMENTICONTABILI,
            body:bodyGetLista,
            textValue:textValue,
            valueAutocomplete:valueAutocomplete,
            valueQuarters:valueQuarters,
        });
    };

    const onButtonAnnulla = () => {
        const newBody = {
            contractIds:[],
            membershipId: '',
            recipientId: '',
            abi: '',
            quarters:[],
            year:yearOnSelect[0]};
        getListaDocGrid(newBody);
        setBodyGetLista(newBody);
        setFiltersDownload(newBody);
        setDataSelect([]);
        setValueAutocomplete([]);
        setValueQuarters([]);
        setPage(0);
        setRowsPerPage(10);
        resetFilters();
    };
   
    const headersObjGrid : HeaderCollapsible[] = [
        {name:"",align:"left",id:1},
        {name:"Nome PSP",align:"left",id:2},
        {name:"ID Contratto",align:"center",id:3},
        {name:"Numero",align:"center",id:5},
        {name:"Trimestre",align:"center",id:4},
        {name:"Data",align:"center",id:6},
        {name:"Arrow",align:"center",id:7}];
      
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
                    onButtonClick: () => onDownloadButton(),
                    variant: "outlined",
                    label: "Download risultati",
                    icon:{name:"download" },
                    disabled:( gridData.length === 0 || getListaLoading )
                },{
                    onButtonClick: () => onDownloadReportButton(),
                    variant: "outlined",
                    label: "Download Financial Report",
                    icon:{name:"download" },
                    disabled:( gridData.length === 0 || getListaLoading )
                }]}
            />      
            <CollapsibleTablePa 
                headerNames={headersObjGrid}
                setPage={setPage}
                page={page}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                count={count}
                dataPaginated={dataPaginated}
                RowComponent={RowBase}
                updateFilters={onUpdateFiltersGrid}
                body={filtersDownload}
            ></CollapsibleTablePa>
              
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
export default DocumentiContabili;

