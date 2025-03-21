import { Autocomplete, Checkbox, IconButton, TextField, Typography } from "@mui/material";
import { Box, Button} from '@mui/material';
import { manageError } from '../api/api';
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GridRowParams,GridEventListener,MuiEvent} from '@mui/x-data-grid';
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { PathPf } from "../types/enum";
import { ElementMultiSelect} from "../types/typeReportDettaglio";
import { listaEntiNotifichePage } from "../api/apiSelfcare/notificheSE/api";
import { GlobalContext } from "../store/context/globalContext";
import CircleIcon from '@mui/icons-material/Circle';
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import DownloadIcon from '@mui/icons-material/Download';
import { getListaActionMonitoring, getStatiMonitoring } from "../api/apiPagoPa/orchestratore/api";
import { mesiGrid } from "../reusableFunction/reusableArrayObj";
import { Params } from "../types/typesGeneral";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import GridCustom from "../components/reusableComponents/grid/gridCustom";
import { Data } from "react-csv/lib/core";
import ListIcon from '@mui/icons-material/List';
import { Tooltip } from "react-bootstrap";

export interface DataGridOrchestratore {
    idOrchestratore:string,
    anno: number,
    mese: number,
    tipologia: string,
    fase: string,
    dataEsecuzione: string,
    dataFineContestazioni: string,
    dataFatturazione: string,
    esecuzione: string,
    count: number
}

interface BodyOrchestratore{
    init: string|null|Date,
    end: string|null|Date,
    stati: number[]
}


const ProcessiOrchestartore:React.FC = () =>{
    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj;

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
   
    const navigate = useNavigate();
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const [gridData, setGridData] = useState<DataGridOrchestratore[]>([]);
    const [page, setPage] = useState(0);
    const [totalData, setTotalData]  = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [arrayStati,setArrayStati] = useState<{value: number, description: string}[]>([]);
    const [getListaLoading, setGetListaLoading] = useState(false);
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [bodyGetLista, setBodyGetLista] = useState<BodyOrchestratore>({ init:new Date(),end:null,stati:[]});
    const [textValue, setTextValue] = useState('');
    const [showLoading,setShowLoading] = useState(false);
    const [valueStati, setValueStati] = useState<{value: number, description: string}[]>([]);
   
    console.log({valueStati});

    useEffect(()=>{
        getListaDati(bodyGetLista,page, rowsPerPage);
        getStati();
    },[]);

    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){ 
                listaEntiNotifichePageOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);

    const getListaDati = async(body:BodyOrchestratore,page,rows) =>{
        setGetListaLoading(true);
        await getListaActionMonitoring(token,profilo.nonce,body, page+1,rows).then((res)=>{
            setTotalData(res.data.count);
            setGetListaLoading(false);
           
            const dataWithID = res.data.items.map((el:DataGridOrchestratore) => {
                el.idOrchestratore = el.tipologia+el.dataEsecuzione;
                return {
                    idOrchestratore:el.idOrchestratore,
                    anno:el.anno,
                    mese:mesiGrid[el.mese],
                    tipologia:el.tipologia,
                    fase:el.fase,
                    dataEsecuzione:transformDateTime(el.dataEsecuzione),
                    dataFineContestazioni:transformDateTime(el.dataFineContestazioni),
                    dataFatturazione:transformDateTime(el.dataFatturazione),
                    count:el.count,
                    esecuzione:el.esecuzione
                    
                };
            });
            console.log({dataWithID});
            setGridData(dataWithID);
        }).catch(((err)=>{
            setGridData([]);
            setGetListaLoading(false);
            manageError(err,dispatchMainState);
        })); 
    };

    function transformObjectToArray(obj: Record<string, string>):{value: number, description: string}[]{
        return Object.entries(obj).map(([key, value]) => ({
            value: parseInt(key, 10), // Convert the key to an integer
            description: value
        }));
    }

    function transformDateTime(input: string): string {
        if(input){
            const [datePart, timePart] = input.split("T"); // Split the input into date and time
            const [year, month, day] = datePart.split("-"); // Split the date into components
            return `${day}-${month}-${year} ${timePart}`; // Rearrange and return the formatted string
        }else{
            return "";
        }
    }

    function isDateInvalid(dateInput) {
        const date = new Date(dateInput); // Create a Date object
        return isNaN(date.getTime()); // Check if the date is invalid
    }

    const getStati = async() =>{
        setGetListaLoading(true);
        await getStatiMonitoring(token,profilo.nonce).then((res)=>{
            const result = transformObjectToArray(res.data);
            setArrayStati(result);
            console.log(result);
        }).catch(((err)=>{
            manageError(err,dispatchMainState);
        })); 
    };

    

    // servizio che popola la select con la checkbox
    const listaEntiNotifichePageOnSelect = async () =>{
        await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue}).then((res)=>{
            setDataSelect(res.data);
        }).catch(((err)=>{
            manageError(err,dispatchMainState);  
        }));
    };

  

    let columsSelectedGrid = '';
    const handleOnCellClick = (params:Params) =>{
        columsSelectedGrid  = params.field;
    };

    const handleEvent: GridEventListener<'rowClick'> = (
        params:GridRowParams,
        event: MuiEvent<React.MouseEvent<HTMLElement>>,
    ) => {
        event.preventDefault();
        // l'evento verrà eseguito solo se l'utente farà il clik sul 
        if(columsSelectedGrid  === 'ragioneSociale' || columsSelectedGrid === 'action' ){
            const oldProfilo = mainState.profilo;
            handleModifyMainState({profilo:{...oldProfilo,...{idEnte:params.row.idEnte,prodotto:params.row.prodotto}},nomeEnteClickOn:params.row.ragioneSociale});
            navigate(PathPf.DATI_FATTURAZIONE);
        }
    };


    const clearOnChangeFilter = () => {
        setGridData([]);
        setPage(0);
        setRowsPerPage(10);
    };


    const onButtonFiltra = () => {
        getListaDati(bodyGetLista,0, 10);
        setPage(0);
        setRowsPerPage(10);
    };

    const onButtonAnnulla = () => {
        setBodyGetLista({ init:null,end: null,stati:[]});
        getListaDati({ init:null,end: null,stati:[]},0, 10);
        setDataSelect([]);
        setValueStati([]);
        setPage(0);
        setRowsPerPage(10);
    };


    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        const realPage = newPage;
        getListaDati(bodyGetLista,realPage, rowsPerPage);
        setPage(newPage);
        /*updateFilters({
            body:bodyGetLista,
            pathPage:PathPf.ORCHESTRATORE,
            textValue,
            page:newPage,
            rows:rowsPerPage
        });*/
    };
                
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        const realPage = page;
        getListaDati(bodyGetLista,realPage,parseInt(event.target.value, 10));
        /* updateFilters({
            body:bodyGetLista,
            pathPage:PathPf.ORCHESTRATORE,
            textValue,
            page:realPage,
            rows:parseInt(event.target.value, 10)
        });
        */
    };

    /* let color = "#F2F2F2";
            if(param.row['Esecuzione'] === '1'){
                color = "green";
            }
            return ( <CircleIcon sx={{ color:color, cursor: 'pointer' }}/>);
        }) }, */

    const headersName: {label:string,align:string,width:number|string}[]= [
        {label:'Anno',align:'center',width:'100px'},
        { label: 'Mese',align:'center',width:'100px'},
        { label: 'Tipologia',align:'center',width:'150px' },
        { label: 'Fase',align:'center',width:'150px'},
        { label: 'Data Esecuzione',align:'center',width:'130px' },
        { label: 'Data Fine Cont.',align:'center',width:'130px' },
        { label: 'Data Fat.',align:'center',width:'130px' },
        { label: 'Count',align:'center',width:'80px' },
        { label: 'Esecuzione',align:'center',width:'130px' }];

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;
    console.log({bodyGetLista});
  
    return(
        <div className="mx-5">
            {/*title container start */}
            <div className="marginTop24 ">
                <Typography variant="h4">Monitoring</Typography>
            </div>
            {/*title container end */}
            <div className="row mb-5 mt-5" >
                <div className="col-3">
                    <Box  style={{ width: '80%' }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DesktopDatePicker
                                label={"Data inizio"}
                                format="dd/MM/yyyy"
                                value={bodyGetLista.init === '' ? null : bodyGetLista.init}
                                onChange={(e:any | null)  => {
                                    if(e !== null && !isDateInvalid(e)){
                                        console.log(e);
                                        setBodyGetLista(prev => ({...prev,...{init:e}}));
                                    }else{
                                        setBodyGetLista(prev => ({...prev,...{init:null}}));
                                    }
                                    clearOnChangeFilter();
                                }}
                            />
                        </LocalizationProvider>
                    </Box>
                </div>
                <div className="col-3">
                    <Box style={{ width: '80%' }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DesktopDatePicker
                                label={"Data fine"}
                                value={bodyGetLista.end === '' ? null : bodyGetLista.end}
                                onChange={(e:any | null)  =>{
                                    if(e !== null && !isDateInvalid(e)){
                                        setBodyGetLista(prev => ({...prev,...{end:e}}));
                                    }else{
                                        setBodyGetLista(prev => ({...prev,...{end:null}}));
                                    }
                                    clearOnChangeFilter();
                                }}
                                format="dd/MM/yyyy"
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
                            onClick={() => onButtonFiltra()} 
                            variant="contained"> Filtra
                        </Button>
                    </Box>
                    <Box style={{ width: '50%' }}>
                        <Button variant="outlined"
                            onClick={() => onButtonAnnulla()} >
                            <ListIcon></ListIcon>
                        </Button>
                    </Box>
                </div>
            </div>
            <div className="marginTop24" style={{display:'flex', justifyContent:'end'}}>
                {
                    gridData.length > 0 &&
                <Button 
                    disabled={getListaLoading}
                >
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