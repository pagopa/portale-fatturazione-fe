import { Autocomplete, Checkbox,TextField, Tooltip, Typography } from "@mui/material";
import { Box, Button} from '@mui/material';
import { manageError } from '../api/api';
import { useContext, useEffect, useState } from "react";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { PathPf } from "../types/enum";
import { ElementMultiSelect} from "../types/typeReportDettaglio";
import { GlobalContext } from "../store/context/globalContext";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import DownloadIcon from '@mui/icons-material/Download';
import { downloadOrchestratore, getListaActionMonitoring, getStatiMonitoring } from "../api/apiPagoPa/orchestratore/api";
import { mesiGrid } from "../reusableFunction/reusableArrayObj";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import GridCustom from "../components/reusableComponents/grid/gridCustom";
import ListIcon from '@mui/icons-material/List';
import { it } from "date-fns/locale";
import dayjs from "dayjs";
import useSavedFilters from "../hooks/useSaveFiltersLocalStorage";
import { headersName } from "../assets/configurations/config_GridOrchestratore";
import { saveAs } from "file-saver";
import { formatDateToValidation, isDateInvalid, transformDateTime, transformObjectToArray } from "../reusableFunction/function";
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

interface BodyOrchestratore{
    init: string|null|Date,
    end: string|null|Date,
    stati: number[],
    ordinamento:number
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
    const [getListaLoading, setGetListaLoading] = useState(false);
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [bodyGetLista, setBodyGetLista] = useState<BodyOrchestratore>({ init:new Date(),end:null,stati:[],ordinamento:0});
    const [showLoading,setShowLoading] = useState(false);
    const [valueStati, setValueStati] = useState<{value: number, description: string}[]>([]);
    const [error,setError] = useState(false);

    const { 
        filters,
        updateFilters,
        isInitialRender
    } = useSavedFilters(PathPf.ORCHESTRATORE,{});
    
    useEffect(()=>{
        if(isInitialRender.current && Object.keys(filters).length > 0){
            getListaDati(filters.body,filters.page, filters.rows);
            setValueStati(filters.valueStati);
            setTotalData(filters.totalData);
            setPage(filters.page);
            setRowsPerPage(filters.rows);
            setBodyGetLista({ 
                init:filters.body.init ? new Date(filters.body.init):null,
                end:filters?.body?.end ? new Date(filters.body.end):null,
                stati:filters.body.stati,
                ordinamento:filters.body.ordinamento
            });
        }else{
            getListaDati(bodyGetLista,page, rowsPerPage);
        }
        getStati();
       
    },[]);
    
    const getListaDati = async(bodyData:BodyOrchestratore,page,rows, reset = false) =>{
        setGetListaLoading(true);
        await getListaActionMonitoring(token,profilo.nonce,bodyData, page+1,rows).then((res)=>{
            setTotalData(res.data.count);
            setGetListaLoading(false);
            
            const dataWithID = res.data.items.map((el:DataGridOrchestratore) => {
                el.idOrchestratore = el.tipologia+el.dataEsecuzione;
                return {
                    idOrchestratore:el.idOrchestratore,
                    dataEsecuzione:transformDateTime(el.dataEsecuzione)||"--",
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
                    totalData:0
                });
            }else{
            
                updateFilters({
                    body:bodyData,
                    pathPage:PathPf.ORCHESTRATORE,
                    page:page,
                    rows:rows,
                    valueStati:valueStati,
                    totalData:res.data.count
                });
            }
        }).catch(((err)=>{
            setGridData([]);
            setGetListaLoading(false);
            manageError(err,dispatchMainState);
        })); 
    };


    const downloadListaOrchestratore = async () => {
        setShowLoading(true);
        await downloadOrchestratore(token,profilo.nonce, bodyGetLista).then(response => response.blob()).then((response)=>{
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
        setBodyGetLista({ init:null,end: null,stati:[],ordinamento:0});
        getListaDati({ init:null,end: null,stati:[],ordinamento:0},0, 10,true);
        setDataSelect([]);
        setValueStati([]);
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
        getListaDati({ ...bodyGetLista,...{ordinamento:newParam}},page, rowsPerPage);
        setBodyGetLista({ ...bodyGetLista,...{ordinamento:newParam}});
        updateFilters({
            body:{ ...bodyGetLista,...{ordinamento:newParam}}
        });
    };
    
    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;
 
    return(
        <div className="mx-5">
            <div className="marginTop24 ">
                <Typography variant="h4">Monitoring</Typography>
            </div>
            <div className="row mb-5 mt-5" >
                <div className="col-3">
                    <Box  style={{ width: '80%' }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it} >
                            <DesktopDatePicker
                                label={"Data inizio"}
                                format="dd/MM/yyyy"
                                value={(bodyGetLista.init === ''||bodyGetLista.init === null) ? null : bodyGetLista.init}
                                onChange={(e:any | null)  => {
                                    if(e !== null && !isDateInvalid(e)){
                                        setBodyGetLista(prev => ({...prev,...{init:e}}));
                                        if(bodyGetLista.end !== null && ((formatDateToValidation(e)||0) > (formatDateToValidation(bodyGetLista.end)||0))){
                                            setError(true);
                                        }else{
                                            setError(false);
                                        }
                                    }else{
                                        setBodyGetLista(prev => ({...prev,...{init:null}}));
                                        if(bodyGetLista.end !== null){
                                            setError(true);
                                        }else{
                                            setError(false);
                                        }
                                    }
                                    clearOnChangeFilter();
                                    formatDateToValidation(e);
                                }}
                                slotProps={{
                                    textField: {
                                        error:error,
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Box>
                </div>
                <div className="col-3">
                    <Box style={{ width: '80%' }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
                            <DesktopDatePicker
                                label={"Data fine"}
                                value={(bodyGetLista.end === ''||bodyGetLista.end === null) ? null : bodyGetLista.end}
                                onChange={(e:any | null)  =>{
                                    if(e !== null && !isDateInvalid(e)){
                                        setBodyGetLista(prev => ({...prev,...{end:e}}));
                                        if(bodyGetLista.init !== null && ((formatDateToValidation(e)||0) < (formatDateToValidation(bodyGetLista.init)||0))){
                                            setError(true);
                                        }else if(bodyGetLista.init === null && bodyGetLista.end !== null){
                                            setError(true);
                                        }else{
                                            setError(false);
                                        }
                                    }else{
                                        setBodyGetLista(prev => ({...prev,...{end:null}}));
                                        setError(false);
                                    }
                                    clearOnChangeFilter();
                                }}
                                format="dd/MM/yyyy"
                                slotProps={{
                                    textField: {
                                        error:error,
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Box>
                </div>
                <div className="col-3">
                    <Autocomplete
                        multiple
                        limitTags={1}
                        onChange={(event, value) => {
                            const arrayId = value.map(el => el.value);
                            setBodyGetLista((prev) => ({...prev,...{stati:arrayId}}));
                            setValueStati(value);
                            clearOnChangeFilter();
                        }}
                        id="checkboxes-quarters"
                        options={arrayStati}
                        value={valueStati}
                        disableCloseOnSelect
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                        getOptionLabel={(option:{value: number, description: string}) => {
                            return option.description;}}
                        renderOption={(props, option,{ selected }) =>(
                            <li {...props}>
                                <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{ marginRight: 8 }}
                                    checked={selected}
                                />
                                {option.description}
                            </li>
                        )}
                        style={{ width: '80%',height:'59px'}}
                        renderInput={(params) => {
                            return <TextField {...params}
                                label="Stato" 
                                placeholder="Stato" />;
                        }}
                    />
                </div>
                <div className="col-3 d-flex align-items-center justify-content-center">
                    <Box style={{ width: '50%' }}>
                        <Button 
                            onClick={onButtonFiltra} 
                            disabled={error}
                            variant="contained"> Filtra
                        </Button>
                    </Box>
                    <Box style={{ width: '50%' }}>
                        <Tooltip title="Lista completa">
                            <Button variant="outlined"
                                disabled={bodyGetLista.init === null && bodyGetLista.end === null && bodyGetLista.stati.length === 0}
                                onClick={onButtonAnnulla} >
                                <ListIcon></ListIcon>
                            </Button>
                        </Tooltip>
                    </Box>
                </div>
            </div>
            <div className="marginTop24" style={{display:'flex', justifyContent:'end'}}>
                {
                    gridData.length > 0 &&
                    <Button onClick={downloadListaOrchestratore} disabled={getListaLoading}>
                    Download Risultati
                        <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                    </Button>
                }
            </div>
            <div className="mt-1 mb-5" style={{ width: '100%'}}>
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
            </div>
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
        </div>
    );
}; 
export default ProcessiOrchestartore;