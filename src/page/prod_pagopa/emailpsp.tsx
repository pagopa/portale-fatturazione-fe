import { AutocompleteMultiselect, OptionMultiselectCheckboxPsp, OptionMultiselectCheckboxQarter } from "../../types/typeAngraficaPsp";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { PathPf } from "../../types/enum";
import { useEffect, useState } from "react";
import { getQuartersDocContabiliPa, getYearsDocContabiliPa } from "../../api/apiPagoPa/documentiContabiliPA/api";
import { manageError } from "../../api/api";
import { getListaNamePsp } from "../../api/apiPagoPa/anagraficaPspPA/api";
import { useGlobalStore } from "../../store/context/useGlobalStore";
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

export type EventoPsp = {
    psp: string;
    tipologia: string;
    anno: number;
    trimestre: string;
    dataEvento: string;
    email: string;
    messaggio: string;
    ragioneSociale: string;
    invio: boolean;
};

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
    const [gridData, setGridData] = useState<EventoPsp[]>([]);
    const [yearOnSelect,setYearOnSelect] = useState<string[]>([]);
    const [valueQuarters, setValueQuarters] = useState<OptionMultiselectCheckboxQarter[]>([]);
    const [dataSelect, setDataSelect] = useState<OptionMultiselectCheckboxPsp[]>([]);
    const [dataSelectQuarter, setDataSelectQuarter] = useState<OptionMultiselectCheckboxQarter[]>([]);
    const [valueAutocomplete, setValueAutocomplete] = useState<AutocompleteMultiselect[]>([]);
    const [textValue, setTextValue] = useState<string>('');
    const [showLoading,setShowLoading] = useState(true);
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
                        setShowLoading(true);
                        setBodyGetLista(filters.body);
                        setFiltersDownload(filters.body);
                       
                        getQuarters(filters.body.year); 
                        getListaMail(filters.body);
                        setValueAutocomplete(filters.valueAutocomplete);
                        setTextValue(filters.textValue);
                        setInfoPageMailPsp(filters?.infoPageMailPsp);
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

    const getQuarters = async (y) =>{
        await getQuartersDocContabiliPa(token, profilo.nonce,{year:y})
            .then((res)=>{
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    setValueQuarters(filters.valueQuarters);
                }else{
                    setValueQuarters([]);
                }
                setDataSelectQuarter(res.data);
                isInitialRender.current = false;
            }).catch(((err)=>{
                isInitialRender.current = false;
                setValueQuarters([]);
                setDataSelectQuarter([]);
                manageError(err,dispatchMainState); 
            }));
    };

    const listaNamePspOnSelect = async (text) =>{
        await getListaNamePsp(token, profilo.nonce, {name:text} )
            .then((res)=>{
                setDataSelect(res.data);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    setValueAutocomplete(filters.valueAutocomplete);
                    
                }
            }).catch(((err)=>{
                setDataSelect([]);
                manageError(err,dispatchMainState); 
            }));
    };

    const getListaMail = async (body) =>{
        await getListaMailPsp( body, token, profilo.nonce, )
            .then((res)=>{
                setGridData(res.data);
                setShowLoading(false);
             
            }).catch(((err)=>{
                setGridData([]);
                setShowLoading(false);
                manageError(err,dispatchMainState); 
            }));
    };

    const onDownloadButton = async() =>{
        setShowLoading(true);
        await downloadListaMailPsp(filtersDownload,token,profilo.nonce).then(response => response.blob()).then((res) => {
            let fileName = '';
            const stringQuarterSelected = filtersDownload.quarters.map(el => "Q" + el.slice(5)).join("_");
            const yearSelected = gridData[0].anno;
            if(filtersDownload.contractIds.length === 1){
                fileName = `Lista Email PSP/${gridData[0]?.ragioneSociale}/${yearSelected}/${stringQuarterSelected}.xlsx`;
            }else{
                fileName = `Lista Email PSP/${yearSelected}/${stringQuarterSelected}.xlsx`;
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
                listaNamePspOnSelect(textValue);
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);


    const onButtonFiltra = () =>{
        setShowLoading(true);
        setInfoPageMailPsp({ page: 0, pageSize: 10 });
        setFiltersDownload(bodyGetLista);
        getListaMail(bodyGetLista); 
        updateFilters(
            {
                body:bodyGetLista,
                pathPage:PathPf.EMAIL_PSP,
                textValue:textValue,
                valueAutocomplete,
                valueQuarters,
                infoPageMailPsp
            });
    };

    const onButtonAnnulla = () => {
        setShowLoading(true);
        setInfoPageMailPsp({ page: 0, pageSize: 10 });
        const newBody = {
            contractIds: [],
            quarters: [],
            year: yearOnSelect[0]};
        getListaMail(newBody);
        setBodyGetLista(newBody);
        setFiltersDownload(newBody);
        setValueAutocomplete([]);
        setValueQuarters([]);
        resetFilters();
    };

    const clearOnChangeFilter = () => {
        setGridData([]);
        setInfoPageMailPsp({ page: 0, pageSize: 10 });
    };

    const onChangePageOrRowGrid = (e) => {
        updateFilters(
            {
                pathPage:PathPf.EMAIL_PSP,
                infoPageMailPsp:e,
                body:bodyGetLista,
                textValue:textValue,
                valueAutocomplete,
                valueQuarters
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
                    extraCodeOnChange={(value)=>{
                        getQuarters(value);
                        setBodyGetLista((prev) => ({...prev,...{year:value,quarters:[]}}));
                    }}
                     
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Trimestre"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    dataSelect={dataSelectQuarter}
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
        
            <DataGrid sx={{
                height:gridData.length < 5 ?"400px" :"auto",
                '& .MuiDataGrid-virtualScroller': {
                    backgroundColor: 'white',
                },
                "& .MuiDataGrid-row": {
                    borderTop: "4px solid #F2F2F2",
                    borderBottom: "2px solid #F2F2F2",
                },
                "& .MuiDataGrid-overlay": {
                    backgroundColor: "white",
                },
            }}
            rowHeight={80}
            rows={gridData} 
            columns={headerMailPsp}
            getRowId={(row) => `${row.messaggio}`}
            onPaginationModelChange={(e)=> onChangePageOrRowGrid(e)}
            paginationModel={infoPageMailPsp}
            pageSizeOptions={[10, 25, 50,100]}
            />
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