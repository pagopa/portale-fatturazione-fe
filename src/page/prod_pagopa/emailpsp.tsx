import { AutocompleteMultiselect, OptionMultiselectCheckboxPsp, OptionMultiselectCheckboxQarter } from "../../types/typeAngraficaPsp";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { PathPf } from "../../types/enum";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useEffect, useState } from "react";
import { getQuartersDocContabiliPa, getYearsDocContabiliPa } from "../../api/apiPagoPa/documentiContabiliPA/api";
import { manageError } from "../../api/api";
import { getListaNamePsp } from "../../api/apiPagoPa/anagraficaPspPA/api";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { downloadListaMailPsp, getListaMailPsp } from "../../api/apiPagoPa/mailPsp/api";
import { saveAs } from "file-saver";
import { DataGrid } from "@mui/x-data-grid";
import { headerMailPsp } from "../../assets/configurations/conf_GridMailPsp";

export interface RequestBodyMailPsp{
    contractIds: string[],
    quarters: string[],
    year: string
}

const EmailPsp:React.FC = () => {

    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
   
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.EMAIL_PSP,{});

    const [bodyGetLista, setBodyGetLista] = useState<RequestBodyMailPsp>({
        contractIds: [],
        quarters: [],
        year: ''
    });
    const [filtersDownload, setFiltersDownload] = useState<RequestBodyMailPsp>({
        contractIds: [],
        quarters: [],
        year: ''
    });
    const [gridData, setGridData] = useState<any[]>([]);
    const [yearOnSelect,setYearOnSelect] = useState<string[]>([]);
    const [valueQuarters, setValueQuarters] = useState<OptionMultiselectCheckboxQarter[]>([]);
    const [dataSelect, setDataSelect] = useState<OptionMultiselectCheckboxPsp[]>([]);
    const [dataSelectQuarter, setDataSelectQuarter] = useState<OptionMultiselectCheckboxQarter[]>([]);
    const [valueAutocomplete, setValueAutocomplete] = useState<AutocompleteMultiselect[]>([]);
    const [textValue, setTextValue] = useState<string>('');
    const [showLoading,setShowLoading] = useState(false);
    const [infoPageMailPsp , setInfoPageMailPsp] = useState({ page: 0, pageSize: 10 });
  
    const [getListaLoading, setGetListaLoading] = useState(false);

    useEffect(()=>{
        getYears();
    }, []);

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
                        // getListaKpiGrid(filters.body);
                        setValueQuarters(filters.valueQuarters);
                        //setPage(filters.page);
                        //setRowsPerPage(filters.rows);
                        getQuarters(filters.body.year);
    
                            
                    }else{
                        setBodyGetLista((prev) => ({...prev,...{year:res.data[0]}}));
                        setFiltersDownload((prev) => ({...prev,...{year:res.data[0]}}));
                        getListaMail({...bodyGetLista,...{year:res.data[0]}});
                        getQuarters(res.data[0]);  
                    }
                }
            }).catch(((err)=>{
                manageError(err,dispatchMainState); 
            }));
    };


    console.log({gridData});

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

    const listaNamePspOnSelect = async () =>{
        await getListaNamePsp(token, profilo.nonce, {name:textValue} )
            .then((res)=>{
                setDataSelect(res.data);
            }).catch(((err)=>{
                setDataSelect([]);
                manageError(err,dispatchMainState); 
            }));
    };

    const getListaMail = async (body) =>{
        await getListaMailPsp( body, token, profilo.nonce, )
            .then((res)=>{
                setGridData(res.data);
             
            }).catch(((err)=>{
                setGridData([]);
                manageError(err,dispatchMainState); 
            }));
    };

    const onDownloadButton = async() =>{
        setShowLoading(true);
        await downloadListaMailPsp(filtersDownload,token,profilo.nonce).then(response => response.blob()).then((res) => {
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

    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){ 
                listaNamePspOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);

    
    const clearOnChangeFilter = () => {
        console.log("clear");
    };

       
    const onButtonFiltra = () =>{
        setFiltersDownload(bodyGetLista);
        getListaMail(bodyGetLista); 
        updateFilters(
            {
                body:bodyGetLista,
                pathPage:PathPf.EMAIL_PSP,
                textValue,
                valueAutocomplete,
                valueQuarters,
                yearOnSelect
            });
    };

    const onButtonAnnulla = () => {
        const newBody = {
            contractIds: [],
            quarters: [],
            year: yearOnSelect[0]};
        getListaMail(newBody);
        setBodyGetLista(newBody);
        setFiltersDownload(newBody);
        setDataSelect([]);
        setValueAutocomplete([]);
        setValueQuarters([]);
        resetFilters();
    };


    const onChangePageOrRowGrid = (e) => {
        updateFilters(
            {
                body:bodyGetLista,
                pathPage:PathPf.EMAIL_PSP,
                textValue,
                valueAutocomplete,
                page:e.page,
                rows:e.pageSize
            });
        setInfoPageMailPsp(e);
    };

            
    const statusAnnulla = bodyGetLista.contractIds.length > 0 || bodyGetLista.quarters.length > 0 ? "show":"hidden";


    return (
        <MainBoxStyled title={"Invio email PSP"}>
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
                    extraCodeOnChangeArray={(value)=>{
                        setBodyGetLista((prev) => ({...prev,...{anno:value}}));
                        setValueQuarters([]);
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
            <div className="mt-1 mb-5" style={{ width: '100%'}}>
                <DataGrid sx={{
                    minHeight:"400px",
                    '& .MuiDataGrid-virtualScroller': {
                        backgroundColor: 'white',
                    },
                    "& .MuiDataGrid-row": {
                        borderTop: "4px solid #F2F2F2",
                        borderBottom: "2px solid #F2F2F2",
                    }
                }}
                rowHeight={80}
                rows={gridData} 
                columns={headerMailPsp}
                getRowId={(row) => `${row.messaggio}`}
                onPaginationModelChange={(e)=> onChangePageOrRowGrid(e)}
                paginationModel={infoPageMailPsp}
                pageSizeOptions={[10, 25, 50,100]}
                />
            </div> 
                      
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

export default EmailPsp;