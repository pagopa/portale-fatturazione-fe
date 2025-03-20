import {  Typography } from "@mui/material";
import { Box, FormControl, InputLabel,Select, MenuItem, Button} from '@mui/material';
import { getTipologiaProfilo, manageError, } from '../api/api';
import { BodyGetListaDatiFatturazione } from "../types/typeListaDatiFatturazione";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {BodyListaDatiFatturazione, Params} from '../types/typesGeneral';
import { DataGrid, GridRowParams,GridEventListener,MuiEvent, GridColDef } from '@mui/x-data-grid';
import { getTipologiaProdotto } from "../api/apiSelfcare/moduloCommessaSE/api";
import {  listaDatiFatturazionePagopa } from "../api/apiPagoPa/datiDiFatturazionePA/api";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { PathPf } from "../types/enum";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../types/typeReportDettaglio";
import { listaEntiNotifichePage } from "../api/apiSelfcare/notificheSE/api";
import { GlobalContext } from "../store/context/globalContext";
import useSavedFilters from "../hooks/useSaveFiltersLocalStorage";
import CircleIcon from '@mui/icons-material/Circle';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import DownloadIcon from '@mui/icons-material/Download';


interface DataGrid {
    id:number,
    "Anno": number,
    "Mese": number,
    "TipologiaFattura": string,
    "Fase": string,
    "Data": string,
    "DataF": string,
    "DataFat":string,
    "Esecuzione": string,
    "Count": number
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

    const [prodotti, setProdotti] = useState([{nome:''}]);
    const [profili, setProfili] = useState(['']);
    const [gridData, setGridData] = useState<DataGrid[]>([
        {
            id:1,
            "Anno": 2024,
            "Mese": 12,
            "TipologiaFattura": "SECONDO SALDO",
            "Fase": "REL 2",
            "Data": "2025-03-20T00:00:00.000",
            "DataF": "2025-02-08T00:00:00.000",
            "DataFat":"2025-02-08T00:00:00.000",
            "Esecuzione": "-",
            "Count": 0
        },
        {
            id:2,
            "Anno": 2025,
            "Mese": 4,
            "TipologiaFattura": "ANTICIPO",
            "Fase": "FATT 1",
            "Data": "2025-03-20T00:00:00.000",
            "DataF": "2025-03-20T00:00:00.000",
            "DataFat":"2025-02-08T00:00:00.000",
            "Esecuzione": "1",
            "Count": 0
        },
        {
            id:3,
            "Anno": 2025,
            "Mese": 1,
            "TipologiaFattura": "PRIMO SALDO",
            "Fase": "FATT 2",
            "Data": "2025-03-31T00:00:00.000",
            "DataF": "2025-03-31T00:00:00.000",
            "DataFat":"2025-02-08T00:00:00.000",
            "Esecuzione": "2",
            "Count": 0
        },
        {
            id:4,
            "Anno": 2025,
            "Mese": 2,
            "TipologiaFattura": "PRIMO SALDO",
            "Fase": "REL 1",
            "Data": "2025-04-04T00:00:00.000",
            "DataF": "2025-04-05T00:00:00.000",
            "DataFat":"2025-02-08T00:00:00.000",
            "Esecuzione": "-",
            "Count": 0
        },
        {
            id:5,
            "Anno": 2025,
            "Mese": 2,
            "TipologiaFattura": "PRIMO SALDO",
            "Fase": "FATT 1",
            "Data": "2025-04-05T00:00:00.000",
            "DataF": "2025-04-15T00:00:00.000",
            "DataFat":"2025-02-08T00:00:00.000",
            "Esecuzione": "1",
            "Count": 0
        },
        {
            id:6,
            "Anno": 2025,
            "Mese": 1,
            "TipologiaFattura": "SECONDO SALDO",
            "Fase": "REL 2",
            "Data": "2025-04-22T00:00:00.000",
            "DataF": "2025-03-09T00:00:00.000",
            "DataFat":"2025-02-08T00:00:00.000",
            "Esecuzione": "-",
            "Count": 0
        },
        {
            id:7,
            "Anno": 2025,
            "Mese": 1,
            "TipologiaFattura": "SECONDO SALDO",
            "Fase": "FATT 1",
            "Data": "2025-04-30T00:00:00.000",
            "DataF": "2025-04-30T00:00:00.000",
            "DataFat":"2025-02-08T00:00:00.000",
            "Esecuzione": "1",
            "Count": 0
        },
        {
            id:8,
            "Anno": 2025,
            "Mese": 2,
            "TipologiaFattura": "PRIMO SALDO",
            "Fase": "FATT 2",
            "Data": "2025-04-30T00:00:00.000",
            "DataF": "2025-04-30T00:00:00.000",
            "DataFat":"2025-02-08T00:00:00.000",
            "Esecuzione": "2",
            "Count": 0
        },
        {
            id:9,
            "Anno": 2025,
            "Mese": 2,
            "TipologiaFattura": "SECONDO SALDO",
            "Fase": "REL 2",
            "Data": "2025-05-20T00:00:00.000",
            "DataF": "2025-04-06T00:00:00.000",
            "DataFat":"2025-02-08T00:00:00.000",
            "Esecuzione": "-",
            "Count": 0
        },
        {
            id:10,
            "Anno": 2025,
            "Mese": 2,
            "TipologiaFattura": "SECONDO SALDO",
            "Fase": "FATT 1",
            "Data": "2025-05-31T00:00:00.000",
            "DataF": "2025-05-31T00:00:00.000",
            "DataFat":"2025-02-08T00:00:00.000",
            "Esecuzione": "-",
            "Count": 0
        }
    ]
    );
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [filtersDownload, setFiltersDownload] = useState<BodyGetListaDatiFatturazione>({idEnti:[],prodotto:'',profilo:''});
    const [getListaLoading, setGetListaLoading] = useState(false);
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [bodyGetLista, setBodyGetLista] = useState<BodyGetListaDatiFatturazione>({idEnti:[],prodotto:'',profilo:''});
    const [infoPageListaDatiFat , setInfoPageListaDatiFat] = useState({ page: 0, pageSize: 10 });
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [showLoading,setShowLoading] = useState(false);
    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.LISTA_DATI_FATTURAZIONE,{});


    useEffect(()=>{  
        getProdotti();
        getProfili();
    }, []);

    useEffect(()=>{
        if(bodyGetLista.idEnti?.length  !== 0 || bodyGetLista.prodotto !== '' || bodyGetLista.profilo !== ''){
            setStatusAnnulla('show');
        }else{
            setStatusAnnulla('hidden');
        }
    },[bodyGetLista]);

    

    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){ 
                listaEntiNotifichePageOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);

  

    const getProdotti = async() => {
        await getTipologiaProdotto(token,profilo.nonce )
            .then((res)=>{
                setProdotti(res.data);
               
            })
            .catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
    };

    const getProfili = async() => {
        await getTipologiaProfilo(token,profilo.nonce)
            .then((res)=>{
                setProfili(res.data);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    getListaDatifatturazione(filters.body);
                    setBodyGetLista(filters.body);
                    setTextValue(filters.textValue);
                    setValueAutocomplete(filters.valueAutocomplete);
                    getListaDatifatturazione(filters.body);
                    setFiltersDownload(filters.body);
                    setInfoPageListaDatiFat({page:filters.page,pageSize:filters.rows});
                }else{
                    getListaDatifatturazione(bodyGetLista);
                }
            })
            .catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
    };

    const getListaDatifatturazione = async(body:BodyListaDatiFatturazione) =>{
        setGetListaLoading(true);
        await listaDatiFatturazionePagopa(body ,token,profilo.nonce)
            .then((res)=>{
                setGetListaLoading(false);
                isInitialRender.current = false;
            })
            .catch(((err)=>{
                setGridData([]);
                setGetListaLoading(false);
                manageError(err,dispatchMainState);
                isInitialRender.current = false;
            })); 
    };


    // servizio che popola la select con la checkbox
    const listaEntiNotifichePageOnSelect = async () =>{
        if(profilo.auth === 'PAGOPA'){
            await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue} )
                .then((res)=>{
                    setDataSelect(res.data);
                })
                .catch(((err)=>{
                 
                    manageError(err,dispatchMainState);
                   
                }));
        }
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
        setInfoPageListaDatiFat({ page: 0, pageSize: 10 });
    };


    const onButtonFiltra = () => {
        getListaDatifatturazione(bodyGetLista);
        setInfoPageListaDatiFat({ page: 0, pageSize: 10 });
        setFiltersDownload(bodyGetLista);
        updateFilters(
            {
                body:bodyGetLista,
                pathPage:PathPf.LISTA_DATI_FATTURAZIONE,
                textValue,
                valueAutocomplete,
                page:0,
                rows:10
            });
    };

    const onButtonAnnulla = () => {
        setBodyGetLista({idEnti:[],prodotto:'',profilo:''});
        setInfoPageListaDatiFat({ page: 0, pageSize: 10 });
        getListaDatifatturazione({idEnti:[],prodotto:'',profilo:''});
        setFiltersDownload({idEnti:[],prodotto:'',profilo:''});
        setDataSelect([]);
        setValueAutocomplete([]);
        resetFilters();
    };

    const onChangePageOrRowGrid = (e) => {
        updateFilters(
            {
                body:filtersDownload,
                pathPage:PathPf.LISTA_DATI_FATTURAZIONE,
                textValue,
                valueAutocomplete,
                page:e.page,
                rows:e.pageSize
            });
        setInfoPageListaDatiFat(e);
    };
      
  
  
    const columns: GridColDef[] = [
        { field: 'Anno', headerName: 'Anno', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'center',align:'center'},
        { field: 'Mese', headerName: 'Mese', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center' ,align:'center'},
        { field: 'TipologiaFattura', headerName: 'Tipologia', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',align:'center' },
        { field: 'Fase', headerName: 'Fase', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',align:'center' },
        { field: 'Data', headerName: 'Data Esecuzione', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',align:'center',valueFormatter: (value:{value:string}) =>  value.value !== null ? new Date(value.value).toLocaleString().split(',')[0] : ''},
        { field: 'DataF', headerName: 'Data Fine Cont.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',align:'center',valueFormatter: (value:{value:string}) =>  value.value !== null ? new Date(value.value).toLocaleString().split(',')[0] : '' },
        { field: 'DataFat', headerName: 'Data Fat.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',align:'center',valueFormatter: (value:{value:string}) =>  value.value !== null ? new Date(value.value).toLocaleString().split(',')[0] : '' },
        { field: 'Esecuzione', headerName: 'Esecuzione', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',align:'center',renderCell: ((param) =>{
            let color = "#F2F2F2";
            if(param.row['Esecuzione'] === '1'){
                color = "green";
            }
            return ( <CircleIcon sx={{ color:color, cursor: 'pointer' }}/>);
        }) },
        { field: 'Count', headerName: 'Count', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',align:'center' }
    ];

  
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
                               
                                value={new Date()}
                                onChange={(e:Date | null)  => console.log('ciao')}
                                slotProps={{
                                    textField: {
                                        inputProps: {
                                            placeholder: 'dd/mm/aaaa',
                                        },
                                    },
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
                               
                                value={null}
                                onChange={(e:Date | null)  => console.log('ciao')}
                                slotProps={{
                                    textField: {
                                        inputProps: {
                                            placeholder: 'dd/mm/aaaa',
                                        },
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Box>
                </div>
            </div>
            <div className="d-flex mt-1">
                <div className=" d-flex justify-content-center align-items-center">
                    <div>
                        <Button 
                            onClick={onButtonFiltra} 
                            sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                            variant="contained"> Filtra
                        </Button>
                        {statusAnnulla === 'hidden'? null :
                            <Button
                                onClick={onButtonAnnulla}
                                sx={{marginLeft:'24px'}} >
                        Annulla filtri
                            </Button>}
                    </div>
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
            <div className=" mb-5" style={{ width: '100%'}}>
                <DataGrid sx={{
                    height:'400px',
                    '& .MuiDataGrid-virtualScroller': {
                        backgroundColor: 'white',
                    }
                }}
                pageSizeOptions={[10, 25, 50,100]}
                onPaginationModelChange={(e)=> onChangePageOrRowGrid(e)}
                paginationModel={infoPageListaDatiFat}
                rows={gridData} 
                columns={columns}
                getRowId={(row) => row.id}
                onRowClick={handleEvent}
                onCellClick={handleOnCellClick}
                />
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