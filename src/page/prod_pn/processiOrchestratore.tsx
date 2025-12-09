import { Autocomplete, Checkbox,TextField, Tooltip, Typography } from "@mui/material";
import { Box, Button} from '@mui/material';
import { useContext, useEffect, useState } from "react";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import DownloadIcon from '@mui/icons-material/Download';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import ListIcon from '@mui/icons-material/List';
import { it } from "date-fns/locale";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { GlobalContext } from "../../store/context/globalContext";
import { manageError } from "../../api/api";
import { getListaActionMonitoring, downloadOrchestratore, getStatiMonitoring, getTipologieMonitoring, getFasiMonitoring } from "../../api/apiPagoPa/orchestratore/api";

import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { transformDateTimeWithNameMonth, transformDateTime, transformObjectToArray, isDateInvalid, formatDateToValidation } from "../../reusableFunction/function";
import { mesiGrid } from "../../reusableFunction/reusableArrayObj";
import { PathPf } from "../../types/enum";
import { ElementMultiSelect } from "../../types/typeReportDettaglio";
import { headersName } from "../../assets/configurations/config_GridOrchestratore";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";

export interface DataGridOrchestratore {
    idOrchestratore:string,
    anno: number,
    mese: number,
    tipologia: string,
    fase: string,
    dataEsecuzione: string ,
    dataFineContestazioni: string,
    dataFatturazione: string,
    esecuzione: string,
    count: number
}

export interface BodyOrchestratore{
    init: string|null|Date,
    end: string|null|Date,
    stati: number[],
    ordinamento:number,
    tipologie:string[],
    fasi:string[]
}

const ProcessiOrchestartore:React.FC = () =>{
    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj;
    
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    
    const [gridData, setGridData] = useState<DataGridOrchestratore[]>([]);
    const [page, setPage] = useState(0);
    const [totalData, setTotalData]  = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [arrayStati,setArrayStati] = useState<{value: number, description: string}[]>([]);
    const [arrayTipologie,setArrayTipologie] = useState<{value: number, description: string}[]>([]);
    const [arrayFasi,setArrayFasi] = useState<{value: number, description: string}[]>([]);
    const [getListaLoading, setGetListaLoading] = useState(false);
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [bodyGetLista, setBodyGetLista] = useState<BodyOrchestratore>({ init:new Date(),end:null,stati:[],ordinamento:0,tipologie:[],fasi:[]});
    const [showLoading,setShowLoading] = useState(false);
    const [valueStati, setValueStati] = useState<{value: number, description: string}[]>([]);
    const [valueTipologie, setValueTipologie] = useState<{value: number, description: string}[]>([]);
    const [valueFasi, setValueFasi] = useState<{value: number, description: string}[]>([]);
    const [error,setError] = useState(false);

    const disableListaCompletaButton = bodyGetLista.init === null && bodyGetLista.end === null && bodyGetLista.stati.length === 0 && bodyGetLista.tipologie.length === 0 && bodyGetLista.fasi.length === 0;
    const { 
        filters,
        updateFilters,
        isInitialRender
    } = useSavedFilters(PathPf.ORCHESTRATORE,{});
    
    useEffect(()=>{
        if(isInitialRender.current && Object.keys(filters).length > 0){
            getListaDati(filters.body,filters.page, filters.rows);
            setValueStati(filters.valueStati);
            setValueFasi(filters.valueFasi);
            setValueTipologie(filters.valueTipologie);
            setTotalData(filters.totalData);
            setPage(filters.page);
            setRowsPerPage(filters.rows);
            setBodyGetLista({ 
                init:filters?.body?.init,
                end:filters?.body?.end,
                stati:filters.body.stati,
                ordinamento:filters.body.ordinamento,
                tipologie:filters.body.tipologie,
                fasi:filters.body.fasi
            });
        }else{
            getListaDati(bodyGetLista,page, rowsPerPage);
        }
        getStati();
        getTipologie();
        getFasi();
       
    },[]);
    
    const getListaDati = async(bodyData:BodyOrchestratore,page,rows, reset = false) =>{
        setGetListaLoading(true);
        let  bodyWitoutTime:BodyOrchestratore = {
            ...bodyData,
            init:bodyData.init ?dayjs(bodyData.init).format("YYYY-MM-DD") : null,
            end:bodyData.end ?dayjs(bodyData.end).format("YYYY-MM-DD") :null,
        };
        if(reset){
            bodyWitoutTime = { init:null,end:null,stati:[],ordinamento:0,tipologie:[],fasi:[]};
        }else if(isInitialRender.current &&  Object.keys(filters).length > 0 ){
            bodyWitoutTime = {
                ...filters.body,
                init:filters.body.init !== null ? dayjs(filters.body.init).format("YYYY-MM-DD") : null,
                end:filters.body.end !== null ? dayjs(filters.body.end).format("YYYY-MM-DD") :null,
            };
        }else if(isInitialRender.current &&  !Object.keys(filters).length ){
            bodyWitoutTime = {
                ...bodyData,
                init:bodyData.init ?dayjs(bodyData.init).format("YYYY-MM-DD") : dayjs(new Date()).format("YYYY-MM-DD"),
                end:bodyData.end ?dayjs(bodyData.end).format("YYYY-MM-DD") :null,
            };
        }

        await getListaActionMonitoring(token,profilo.nonce,bodyWitoutTime, page+1,rows).then((res)=>{
            setTotalData(res.data.count);
            setGetListaLoading(false);
            
            const dataWithID = res.data.items.map((el:DataGridOrchestratore) => {
                el.idOrchestratore = el.tipologia+el.dataEsecuzione;
                return {
                    idOrchestratore:el.idOrchestratore,
                    dataEsecuzione:transformDateTimeWithNameMonth(el.dataEsecuzione)||"--",
                    anno:el.anno,
                    mese:mesiGrid[el.mese],
                    tipologia:el.tipologia,
                    fase:el.fase,
                    dataFineContestazioni:transformDateTime(el.dataFineContestazioni)||"--",
                    dataFatturazione:transformDateTime(el.dataFatturazione)||"--",
                    counter:el.count||'--',
                    esecuzione:el.esecuzione
                };
            });
            setGridData(dataWithID);
            if(reset){
                updateFilters({
                    body:bodyData,
                    pathPage:PathPf.ORCHESTRATORE,
                    page:0,
                    rows:10,
                    valueStati:[],
                    valueFasi:[],
                    valueTipologie:[],
                    totalData:0
                });
            }else{
            
                updateFilters({
                    body:bodyData,
                    pathPage:PathPf.ORCHESTRATORE,
                    page:page,
                    rows:rows,
                    valueStati:valueStati,
                    valueFasi:valueFasi,
                    valueTipologie:valueTipologie,
                    totalData:res.data.count
                });
            }
            isInitialRender.current = false;
        }).catch(((err)=>{
            setGridData([]);
            setGetListaLoading(false);
            manageError(err,dispatchMainState);
            isInitialRender.current = false;
            if(reset){
                updateFilters({
                    body:bodyData,
                    pathPage:PathPf.ORCHESTRATORE,
                    page:0,
                    rows:10,
                    valueStati:[],
                    valueFasi:[],
                    valueTipologie:[],
                    totalData:0
                });
            }else{
                updateFilters({
                    body:bodyData,
                    pathPage:PathPf.ORCHESTRATORE,
                    page:page,
                    rows:rows,
                    valueStati:valueStati,
                    valueFasi:valueFasi,
                    valueTipologie:valueTipologie,
                    totalData:0
                });
            }
        })); 
    };

    const downloadListaOrchestratore = async () => {
        setShowLoading(true);
        const bodyWitoutTime:BodyOrchestratore = {
            ...bodyGetLista,
            init:bodyGetLista.init ?dayjs(bodyGetLista.init).format("YYYY-MM-DD") : new Date(),
            end:bodyGetLista.end ?dayjs(bodyGetLista.end).format("YYYY-MM-DD") :null,
        };
        await downloadOrchestratore(token,profilo.nonce, bodyWitoutTime).then(response => response.blob()).then((response)=>{
            let title = `Lista processi.xlsx`;
            if(bodyGetLista.init && !bodyGetLista.end){
                title = `Lista processi/Data inzio:${dayjs(new Date(bodyGetLista.init)).format("DD-MM-YYYY")}.xlsx`;
            }else if(bodyGetLista.end && bodyGetLista.init){
                title = `Lista processi/Data inzio:${dayjs(new Date(bodyGetLista.init)).format("DD-MM-YYYY")}/Data fine:${dayjs(new Date(bodyGetLista.end)).format("DD-MM-YYYY")}.xlsx`;
            }     
            saveAs(response,title);
            setShowLoading(false);
        }).catch(((err)=>{
            setShowLoading(false);
            manageError(err,dispatchMainState);
        }));
    };
    
    const getStati = async() =>{
        setGetListaLoading(true);
        await getStatiMonitoring(token,profilo.nonce).then((res)=>{
            const result = transformObjectToArray(res.data);
            setArrayStati(result);
        }).catch(((err)=>{
            setArrayStati([]);
            manageError(err,dispatchMainState);
        })); 
    };

    const getTipologie = async() =>{
        setGetListaLoading(true);
        await getTipologieMonitoring(token,profilo.nonce).then((res)=>{
            const result = transformObjectToArray(res.data);
            setArrayTipologie(result);
        }).catch(((err)=>{
            setArrayTipologie([]);
            manageError(err,dispatchMainState);
        })); 
    };

    const getFasi = async() =>{
        setGetListaLoading(true);
        await getFasiMonitoring(token,profilo.nonce).then((res)=>{
            const result = transformObjectToArray(res.data);
            setArrayFasi(result);
        }).catch(((err)=>{
            setArrayFasi([]);
            manageError(err,dispatchMainState);
        })); 
    };

    const clearOnChangeFilter = () => {
        setGridData([]);
        setPage(0);
        setTotalData(0);
        setRowsPerPage(10);
    };
    
    const onButtonFiltra = () => {
        getListaDati(bodyGetLista,0, 10);
        setPage(0);
        setRowsPerPage(10);
    };
    
    const onButtonAnnulla = () => {
        setBodyGetLista({ init:null,end: null,stati:[],ordinamento:0,tipologie:[],fasi:[]});
        getListaDati({ init:null,end: null,stati:[],ordinamento:0,tipologie:[],fasi:[]},0, 10,true);
        setDataSelect([]);
        setValueStati([]);
        setValueTipologie([]);
        setValueFasi([]);
        setPage(0);
        setRowsPerPage(10);
        setError(false);
    };
    
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        const realPage = newPage;
        getListaDati(bodyGetLista,realPage, rowsPerPage);
        setPage(newPage);
        updateFilters({
            page:newPage
        });
    };
    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
       
        getListaDati(bodyGetLista,0,parseInt(event.target.value, 10));
        updateFilters({
            page:0,
            rows:parseInt(event.target.value, 10)
        });
    };


    const headerAction = (newParam) => {
        getListaDati({...bodyGetLista,...{ordinamento:newParam}},page, rowsPerPage);
        setBodyGetLista({ ...bodyGetLista,...{ordinamento:newParam}});
        updateFilters({
            body:{ ...bodyGetLista,...{ordinamento:newParam}}
        });
    };
 
    return(
        <MainBoxStyled title={"Monitoring"}>
            <ResponsiveGridContainer >
                <MainFilter 
                    filterName={"date_from_to"}
                    inputLabel={"Data inizio"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyValue={"init"}
                    keyDescription="start"
                    keyCompare={"end"}
                    error={error}
                    setError={setError}
                    keyBody="init"
                ></MainFilter>
                <MainFilter 
                    filterName={"date_from_to"}
                    inputLabel={"Data fine"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyValue={"end"}
                    keyDescription="end"
                    keyCompare={"init"}
                    error={error}
                    setError={setError}
                    keyBody="end"
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Stato"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    valueAutocomplete={valueStati}
                    setValueAutocomplete={setValueStati}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    dataSelect={arrayStati}
                    keyDescription={"description"}
                    keyBody={"stati"}
                    keyValue={"value"}
                    fontSize="0.875rem"
                    iconMaterial={RenderIcon("status",true)}
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Tipologia"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    valueAutocomplete={valueTipologie}
                    setValueAutocomplete={setValueTipologie}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    dataSelect={arrayTipologie}
                    keyDescription={"description"}
                    keyValue={"value"}
                    keyBody={"tipologie"}
                    extraCodeOnChangeArray={(e)=>{
                        const arrayDesc = e.map(el => el.description);
                        setBodyGetLista((prev) => ({...prev,...{tipologie:arrayDesc}}));
                        setValueTipologie(e);
                    }}     
                    fontSize="0.875rem"  
                    iconMaterial={RenderIcon("typology",true)}   
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Fase"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    valueAutocomplete={valueFasi}
                    setValueAutocomplete={setValueFasi}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    dataSelect={arrayFasi}
                    keyDescription={"description"}
                    keyValue={"value"}
                    keyBody={"fasi"}
                    extraCodeOnChangeArray={(e)=>{
                        const arrayDesc = e.map((el) => el.description);
                        setBodyGetLista((prev) => ({...prev,...{fasi:arrayDesc}}));
                        setValueFasi(e);
                    }}
                    fontSize="0.875rem" 
                    iconMaterial={RenderIcon("fase",true)}
                ></MainFilter>
            </ResponsiveGridContainer>
            <FilterActionButtons 
                onButtonFiltra={onButtonFiltra} 
                onButtonAnnulla={onButtonAnnulla} 
                statusAnnulla={(disableListaCompletaButton)? "hidden":"show"} 
                disabled={error}
                annullaButtonOptional={{
                    onButtonClick:onButtonAnnulla,
                    variant: "outlined",
                    icon:{name:"list"},
                    disabled:(disableListaCompletaButton||error)
                }}
            ></FilterActionButtons>
            <ActionTopGrid
                actionButtonRight={[{
                    onButtonClick:downloadListaOrchestratore,
                    variant: "outlined",
                    label: "Download Risultati",
                    icon:{name:"download"},
                    disabled:(gridData.length === 0||getListaLoading)
                }]}/>
            <GridCustom
                nameParameterApi='idOrchestratore'
                elements={gridData}
                changePage={handleChangePage}
                changeRow={handleChangeRowsPerPage} 
                total={totalData}
                page={page}
                rows={rowsPerPage}
                headerNames={headersName}
                disabled={getListaLoading}
                widthCustomSize="auto"
                body={bodyGetLista}
                headerAction={headerAction}
            ></GridCustom>
            <ModalLoading 
                open={getListaLoading} 
                setOpen={setGetListaLoading}
                sentence={'Loading...'} >
            </ModalLoading>
            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading}
                sentence={'Downloading...'} >
            </ModalLoading>
        </MainBoxStyled>
     
    );
}; 
export default ProcessiOrchestartore;