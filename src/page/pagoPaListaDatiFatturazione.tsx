import {  Typography } from "@mui/material";
import { Box, FormControl, InputLabel,Select, MenuItem, Button} from '@mui/material';
import { getTipologiaProfilo, manageError, } from '../api/api';
import { BodyGetListaDatiFatturazione, GridElementListaFatturazione, ListaDatiFatturazioneProps, ResponseDownloadListaFatturazione } from "../types/typeListaDatiFatturazione";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {BodyListaDatiFatturazione, Params} from '../types/typesGeneral';
import { DataGrid, GridRowParams,GridEventListener,MuiEvent, GridColDef } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import { getTipologiaProdotto } from "../api/apiSelfcare/moduloCommessaSE/api";
import { downloadDocumentoListaDatiFatturazionePagoPa, listaDatiFatturazionePagopa } from "../api/apiPagoPa/datiDiFatturazionePA/api";
import { saveAs } from "file-saver";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { PathPf } from "../types/enum";
import { deleteFilterToLocalStorage, getFiltersFromLocalStorage, getInfoPageFromLocalStorage, getProfilo, getToken, profiliEnti, setFilterToLocalStorage, setInfoPageToLocalStorage, setInfoToProfiloLoacalStorage } from "../reusableFunction/actionLocalStorage";
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../types/typeReportDettaglio";
import { listaEntiNotifichePage } from "../api/apiSelfcare/notificheSE/api";


const PagoPaListaDatiFatturazione:React.FC<ListaDatiFatturazioneProps> = ({mainState, dispatchMainState}) =>{
    const token =  getToken();
    const profilo =  getProfilo();
    const navigate = useNavigate();
    const enti = profiliEnti();

    const [prodotti, setProdotti] = useState([{nome:''}]);
    const [profili, setProfili] = useState(['']);
    const [gridData, setGridData] = useState<GridElementListaFatturazione[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [filtersDownload, setFiltersDownload] = useState<BodyGetListaDatiFatturazione>({idEnti:[],prodotto:'',profilo:''});
    const [getListaLoading, setGetListaLoading] = useState(false);
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [bodyGetLista, setBodyGetLista] = useState<BodyGetListaDatiFatturazione>({idEnti:[],prodotto:'',profilo:''});
    const [infoPageListaDatiFat , setInfoPageListaDatiFat] = useState({ page: 0, pageSize: 100 });
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [showLoading,setShowLoading] = useState(false);

    // al primo reload se torno inditro da dettaglio dati tturazione ho gli stessi filtri per il download
    
    useEffect(()=>{
        const result = getFiltersFromLocalStorage();
        const infoPageResult = getInfoPageFromLocalStorage();
       
        getProdotti();
        getProfili();
        if(Object.keys(result).length > 0){
            setBodyGetLista(result.bodyGetLista);
            setTextValue(result.textValue);
            setValueAutocomplete(result.valueAutocomplete);
            getListaDatifatturazione(result.bodyGetLista);
            setFiltersDownload(result.bodyGetLista);
        }else{
            getListaDatifatturazione(bodyGetLista);
        }
        if(infoPageResult.page > 0){
            setInfoPageListaDatiFat(infoPageResult);
        }
        
    }, []);

    useEffect(()=>{
        if(token === undefined){
            window.location.href = '/azureLogin';
        }else if(profilo.auth === 'PAGOPA'){
            // se un utente ha già selezionato un elemento nella grid avrà in memoria l'idEnte, per errore se andrà nella pagina '/'
        // modificando a mano l'url andrà a modificare i dati fatturazione dell'ultimo utente selezionato
            delete profilo.idEnte;
            const newProfilo = profilo; 
            localStorage.setItem('profilo', JSON.stringify(newProfilo));
        }else if(enti){
            navigate(PathPf.DATI_FATTURAZIONE);
        }
    },[]);



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
            })
            .catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
    };

    const getListaDatifatturazione = async(body:BodyListaDatiFatturazione) =>{
        setGetListaLoading(true);
        await listaDatiFatturazionePagopa(body ,token,profilo.nonce)
            .then((res)=>{
                setGridData(res.data);
                setGetListaLoading(false);
            })
            .catch(((err)=>{
                setGridData([]);
                setGetListaLoading(false);
                manageError(err,dispatchMainState);
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

    const onDownloadButton = async() =>{
        setShowLoading(true);
        await downloadDocumentoListaDatiFatturazionePagoPa(token,profilo.nonce, filtersDownload).then((res:ResponseDownloadListaFatturazione) => {
            let fileName = `Lista dati di fatturazione.xlsx`;
            if(gridData.length === 1){
                fileName = `Dati di fatturazione / ${gridData[0]?.ragioneSociale}.xlsx`;
            }
            saveAs("data:text/plain;base64," + res.data.documento,fileName);
            setShowLoading(false);
        }).catch(err => {
            manageError(err,dispatchMainState);
        });
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
            setInfoToProfiloLoacalStorage(profilo,{
                idEnte:params.row.idEnte,
                prodotto:params.row.prodotto,
            });
            const string = JSON.stringify({nomeEnteClickOn:params.row.ragioneSociale});
            localStorage.setItem('statusApplication', string);
            navigate(PathPf.DATI_FATTURAZIONE);
        }
    };
      
    const columns: GridColDef[] = [
        { field: 'ragioneSociale', headerName: 'Ragione Sociale', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:any) => <a className="mese_alidita text-primary fw-bolder" href="/">{param.row.ragioneSociale}</a>},
        { field: 'cup', headerName: 'CUP', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'splitPayment', headerName: 'Split payment', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'idDocumento', headerName: 'ID Documento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataDocumento', headerName: 'Data Documento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left',valueFormatter: (value:any) =>  value.value !== null ? new Date(value.value).toLocaleString().split(',')[0] : ''},
        { field: 'codCommessa', headerName: 'Cod. Commessa', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataCreazione', headerName: 'Data Primo Acc.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left',valueFormatter: (value:{value:string}) =>  value.value !== null ? new Date(value.value).toLocaleString().split(',')[0] : ''},
        { field: 'dataModifica', headerName: 'Data Ultimo Acc.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left',valueFormatter: (value:{value:string}) =>  value.value !== null ? new Date(value.value).toLocaleString().split(',')[0] : '' },
        {field: 'action', headerName: '',sortable: false,width:70,headerAlign: 'left',disableColumnMenu :true,renderCell: (() => ( <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }}/>)),}
    ];

    return(
        <div className="mx-5">
            {/*title container start */}
            <div className="marginTop24 ">
                <Typography variant="h4">Lista Dati Fatturazione</Typography>
            </div>
            {/*title container end */}
            <div className="row mb-5 mt-5" >
                <div className="col-3">
                    <Box  style={{ width: '80%' }}>
                        <FormControl
                            fullWidth
                            size="medium"
                        >
                            <InputLabel
                                id="sea"
                            >
                                Seleziona Prodotto
                            </InputLabel>
                            <Select
                                id="sea"
                                label='Seleziona Prodotto'
                                labelId="search-by-label"
                                onChange={(e) => setBodyGetLista((prev)=> ({...prev, ...{prodotto:e.target.value}}))}
                                value={bodyGetLista.prodotto || ''}
                                disabled={status=== 'immutable' ? true : false}
                            >
                                {prodotti.map((el) => (
                                    <MenuItem
                                        key={Math.random()}
                                        value={el.nome}
                                    >
                                        {el.nome}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </div>
                <div className="col-3">
                    <Box style={{ width: '80%' }}>
                        <FormControl
                            fullWidth
                            size="medium"
                        >
                            <InputLabel
                                id="sea"
                            >
                                Seleziona Profilo
                            </InputLabel>
                            <Select
                                id="sea"
                                label='Seleziona Profilo'
                                labelId="search-by-label"
                                onChange={(e) =>  setBodyGetLista((prev)=> ({...prev, ...{profilo:e.target.value}}))}
                                value={bodyGetLista.profilo}
                                disabled={status=== 'immutable' ? true : false}
                            >
                                {profili.map((el) => (
                                    <MenuItem
                                        key={Math.random()}
                                        value={el}
                                    >
                                        {el}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </div>
                <div  className="col-3">
                    <MultiselectCheckbox 
                        setBodyGetLista={setBodyGetLista}
                        dataSelect={dataSelect}
                        setTextValue={setTextValue}
                        valueAutocomplete={valueAutocomplete}
                        setValueAutocomplete={setValueAutocomplete}
                    ></MultiselectCheckbox>
                </div>
            </div>
            <div className="d-flex" >
              
                <div className=" d-flex justify-content-center align-items-center">
                    <div>
                        <Button 
                            onClick={()=>{
                                getListaDatifatturazione(bodyGetLista);
                                setInfoPageListaDatiFat({ page: 0, pageSize: 100 });
                                setFiltersDownload(bodyGetLista);
                                setFilterToLocalStorage(bodyGetLista,textValue,valueAutocomplete);
                                setInfoPageToLocalStorage({ page: 0, pageSize: 100 }); 
                            } } 
                            sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                            variant="contained"> Filtra
                        </Button>
                        {statusAnnulla === 'hidden'? null :
                            <Button
                                onClick={()=>{
                                    setBodyGetLista({idEnti:[],prodotto:'',profilo:''});
                                    setInfoPageListaDatiFat({ page: 0, pageSize: 100 });
                                    setInfoPageToLocalStorage({ page: 0, pageSize: 100 });
                                    getListaDatifatturazione({idEnti:[],prodotto:'',profilo:''});
                                    setFiltersDownload({idEnti:[],prodotto:'',profilo:''});
                                    setDataSelect([]);
                                    setValueAutocomplete([]);
                                    deleteFilterToLocalStorage();
                                } }
                                sx={{marginLeft:'24px'}} >
                        Annulla filtri
                            </Button>}
                    </div>
                </div>
            </div>
            {/* grid */}
            <div className="marginTop24" style={{display:'flex', justifyContent:'end'}}>
                {
                    gridData.length > 0 &&
                <Button onClick={() =>onDownloadButton()}
                    disabled={getListaLoading}
                >
                Download Risultati
                    <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                </Button>
                }
            </div>
            <div className="mt-1 mb-5" style={{ width: '100%'}}>
                <DataGrid sx={{
                    height:'400px',
                    '& .MuiDataGrid-virtualScroller': {
                        backgroundColor: 'white',
                    }
                }}
                onPaginationModelChange={(e)=>{
                    setInfoPageListaDatiFat(e); setInfoPageToLocalStorage(e);}}
                paginationModel={infoPageListaDatiFat}
                rows={gridData} 
                columns={columns}
                getRowId={(row) => row.key}
                onRowClick={handleEvent}
                onCellClick={handleOnCellClick}
                />
            </div>
            <div>
            </div>
            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading}
                sentence={'Downloading...'} >
            </ModalLoading>
        </div>
    );
}; 
export default PagoPaListaDatiFatturazione;