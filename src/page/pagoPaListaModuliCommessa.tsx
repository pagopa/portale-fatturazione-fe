import { BodyDownloadModuliCommessa, GridElementListaCommesse, ListaModuliCommessaProps } from "../types/typeListaModuliCommessa";
import { Params } from "../types/typesGeneral";
import { Typography } from "@mui/material";
import { Box, FormControl, InputLabel,Select, MenuItem, Button} from '@mui/material';
import { manageError } from '../api/api';
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { DataGrid, GridRowParams,GridEventListener,MuiEvent, GridColDef} from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import { getTipologiaProdotto } from "../api/apiSelfcare/moduloCommessaSE/api";
import { downloadDocumentoListaModuloCommessaPagoPa, listaModuloCommessaPagopa } from "../api/apiPagoPa/moduloComessaPA/api";
import { saveAs } from "file-saver";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { PathPf } from "../types/enum";
import { deleteFilterToLocalStorageCommessa, getFiltersFromLocalStorageCommessa, getInfoPageFromLocalStorageCommessa, getProfilo, getToken, profiliEnti, setFilterToLocalStorageCommessa, setInfoPageToLocalStorageCommessa } from "../reusableFunction/actionLocalStorage";
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../types/typeReportDettaglio";
import { currentMonth, getCurrentFinancialYear } from "../reusableFunction/function";
import { currentYear, mesi, mesiGrid, mesiWithZero } from "../reusableFunction/reusableArrayObj";
import { listaEntiNotifichePage } from "../api/apiSelfcare/notificheSE/api";
import { GlobalContext } from "../store/context/globalContext";


const PagoPaListaModuliCommessa:React.FC = () =>{
    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState} = globalContextObj;
    
    const token =  getToken();
    const profilo =  getProfilo();
    const navigate = useNavigate();
    const enti = profiliEnti();
    const currString = currentMonth();

    const [prodotti, setProdotti] = useState([{nome:''}]);
    const [gridData, setGridData] = useState<GridElementListaCommesse[]>([]);
    const [bodyGetLista, setBodyGetLista] = useState<BodyDownloadModuliCommessa>({idEnti:[],prodotto:'', anno:currentYear, mese:currString});
    const [infoPageListaCom , setInfoPageListaCom] = useState({ page: 0, pageSize: 100 });
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [bodyDownload, setBodyDownload] = useState<BodyDownloadModuliCommessa>({idEnti:[],prodotto:'', anno:currentYear, mese:currString});
    const [showLoading,setShowLoading] = useState(false);

    useEffect(()=>{
        const result = getFiltersFromLocalStorageCommessa();
        const infoPageResult = getInfoPageFromLocalStorageCommessa();
       
        getProdotti();
        if(Object.keys(result).length > 0){
            setBodyGetLista(result.bodyGetLista);
            setTextValue(result.textValue);
            setValueAutocomplete(result.valueAutocomplete);
            getListaCommesse(result.bodyGetLista);
            setBodyDownload(result.bodyGetLista);
        }else{
            getListaCommesse(bodyGetLista);
        }
        if(infoPageResult.page > 0){
            setInfoPageListaCom(infoPageResult);
        }
        
    }, []);
 
    useEffect(()=>{
        if(token === undefined){
            window.location.href = '/azureLogin';
        }else if(profilo.auth === 'PAGOPA'){
            // se un utente ha già selezionato un elemento nella grid avrà in memoria l'idEnte, per errore se andrà nella pagina '/8'
        // modificando a mano l'url andrà a modificare il modulo commessa dell'ultima commessa  selezionata
            delete profilo.idEnte;
            const newProfilo = profilo; 
            localStorage.setItem('profilo', JSON.stringify(newProfilo));
        }else if(enti){
            navigate(PathPf.DATI_FATTURAZIONE);
        }
    },[]);

    useEffect(()=>{
        if( bodyGetLista.prodotto !== '' || bodyGetLista?.idEnti.length !== 0 ){
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
        await getTipologiaProdotto(token, profilo.nonce )
            .then((res)=>{
                setProdotti(res.data);
            })
            .catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
    };

    const getListaCommesse = async(body) =>{
        await listaModuloCommessaPagopa(body ,token, profilo.nonce)
            .then((res)=>{
                setGridData(res.data);
            })
            .catch((err)=>{
                setGridData([]);
                manageError(err,dispatchMainState);
            }); 
    };

    const getListaCommesseOnAnnulla = async() =>{
        await listaModuloCommessaPagopa({descrizione:'',prodotto:'', anno:currentYear, mese:currString} ,token, profilo.nonce)
            .then((res)=>{
                setBodyGetLista({idEnti:[],prodotto:'', anno:currentYear, mese:currString});
                setGridData(res.data);
            })
            .catch((err)=>{
                manageError(err,dispatchMainState);
            }); 
    };

    const listaEntiNotifichePageOnSelect = async () =>{
        if(profilo.auth === 'PAGOPA'){
            await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue} )
                .then((res)=>{
                    setDataSelect(res.data) ;
                })
                .catch(((err)=>{
                    manageError(err,dispatchMainState);
                }));
        }
    };

    const downloadExelListaCommessa = async () =>{
        setShowLoading(true);
        await downloadDocumentoListaModuloCommessaPagoPa(token, profilo.nonce,bodyDownload)
            .then((res)=>{
                let fileName = `Moduli Commessa/${mesiWithZero[Number(bodyDownload.mese) -1]}/${bodyDownload.anno}.xlsx`;
                if(gridData.length === 1){
                    fileName = `Modulo Commessa/${gridData[0]?.ragioneSociale} /${mesiWithZero[Number(bodyDownload.mese) -1]}/${bodyDownload.anno}.xlsx`;
                }
                saveAs("data:text/plain;base64," + res.data.documento,fileName);
                setShowLoading(false);
            })
            .catch((err)=>{
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
        // l'evento verrà eseguito solo se l'utente farà il clik sul  mese e action
        if(columsSelectedGrid  === 'regioneSociale' ||columsSelectedGrid  === 'action' ){
            const newState = {
                mese:params.row.mese,
                anno:params.row.anno,
                userClickOn:'GRID',
                inserisciModificaCommessa:"MODIFY",
                nomeEnteClickOn:params.row.ragioneSociale
            };
            const string = JSON.stringify(newState);
            localStorage.setItem('statusApplication', string);

            const newProfilo = {...profilo,...{
                idTipoContratto: params.row.idTipoContratto,
                prodotto:params.row.prodotto,
                idEnte:params.row.idEnte
            }};
            const stringProfilo = JSON.stringify(newProfilo);
            localStorage.setItem('profilo', stringProfilo);
            navigate(PathPf.MODULOCOMMESSA);
        }
    };

    const columns: GridColDef[] = [
        { field: 'regioneSociale', headerName: 'Ragione Sociale', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:{row:GridElementListaCommesse}) => <a className="mese_alidita text-primary fw-bolder" href="/8">{param.row.ragioneSociale}</a>},
        { field: 'mese', headerName: 'Mese', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:{row:GridElementListaCommesse}) => <div className="MuiDataGrid-cellContent" title={mesiGrid[param.row.mese]} role="presentation">{mesiGrid[param.row.mese]}</div>},
        { field: 'prodotto', headerName: 'Prodotto', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'numeroNotificheNazionaliDigitale', headerName: 'Num. Not. Naz.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'tipoSpedizioneAnalogicoAR', headerName: 'Tipo spediz. Analog.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'numeroNotificheInternazionaliDigitale', headerName: 'Num. Not. Int.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'numeroNotificheNazionaliAnalogicoAR', headerName: 'Num. Not. Naz. AR', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'numeroNotificheInternazionaliAnalogicoAR', headerName: 'Num. Not. Int. AR', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'numeroNotificheNazionaliAnalogico890', headerName: 'Num. Not. Naz. 890', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'numeroNotificheInternazionaliAnalogico890', headerName: 'Num. Not. Naz. AR 890', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'totaleAnalogicoLordo', headerName: 'Tot. Spedizioni A.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left',  valueFormatter: ({ value }) => value.toLocaleString("de-DE", { style: "currency", currency: "EUR" })},
        { field: 'totaleDigitaleLordo', headerName: 'Tot. Spedizioni D', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left', valueFormatter: ({ value }) => value.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) },
        {field: 'action', headerName: '',sortable: false, width:70,headerAlign: 'left',disableColumnMenu :true, renderCell: (() => (<ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} onClick={() => console.log('Show page details')} /> ) ),}
    ];

    return (
        <div className="mx-5">
            <div className="marginTop24 ">
                <Typography variant="h4">Lista Modulo Commessa</Typography>
            </div>
            <div className="mb-5 mt-5 marginTop24" >
                <div className="row">

                
                    <div className="col-3">
                        <Box sx={{ width: '80%' }}>
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel
                                    id="sea"
                                >
                                Anno
                                </InputLabel>
                                <Select
                                    id="sea"
                                    label='Seleziona Prodotto'
                                    labelId="search-by-label"
                                    onChange={(e) =>  setBodyGetLista((prev)=> ({...prev, ...{anno:e.target.value}}))}
                                    value={bodyGetLista.anno}
                                    disabled={status=== 'immutable' ? true : false}
                                >
                                    {getCurrentFinancialYear().map((el) => (
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
                
                    <div className="col-3">
                        <Box sx={{ width: '80%' }}>
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel
                                    id="sea"
                                >
                                Mese
                                </InputLabel>
                                <Select
                                    id="sea"
                                    label='Seleziona Prodotto'
                                    labelId="search-by-label"
                                    onChange={(e) =>{
                                        setBodyGetLista((prev)=> ({...prev, ...{mese:e.target.value}}));
                                    }}
                                    value={bodyGetLista.mese}
                                    disabled={status=== 'immutable' ? true : false}
                                >
                                    {mesi.map((el) => (
                                        <MenuItem
                                            key={Math.random()}
                                            value={Object.keys(el)[0].toString()}
                                        >
                                            {Object.values(el)[0]}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                    <div className="col-3 ">
                        <Box sx={{ width: '80%' }}>
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
                                    value={bodyGetLista.prodotto}
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
            </div>
            <div className="d-flex" >
                
                <div className=" d-flex justify-content-center align-items-center">
                    <div>
                        <Button 
                            onClick={()=>{
                                setInfoPageListaCom({ page: 0, pageSize: 100 });
                                setInfoPageToLocalStorageCommessa({ page: 0, pageSize: 100 });
                                getListaCommesse(bodyGetLista);
                                setBodyDownload(bodyGetLista);
                                setFilterToLocalStorageCommessa(bodyGetLista,textValue,valueAutocomplete);
                            } } 
                            sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                            variant="contained"> Filtra
                        </Button>
                        {statusAnnulla === 'hidden' ? null :
                            <Button
                                onClick={()=>{
                                    setInfoPageListaCom({ page: 0, pageSize: 100 });
                                    setInfoPageToLocalStorageCommessa({ page: 0, pageSize: 100 });
                                    getListaCommesseOnAnnulla();
                                    setBodyDownload({idEnti:[],prodotto:'', anno:currentYear, mese:currString});
                                    setDataSelect([]);
                                    deleteFilterToLocalStorageCommessa();
                                    setValueAutocomplete([]);
                                } }
                                sx={{marginLeft:'24px'}} >
                    Annulla filtri
                            </Button>
                        }
                    </div>
                </div>
            </div>
            {/* grid */}
            <div className="marginTop24" style={{display:'flex', justifyContent:'end'}}>
                {gridData.length > 0 &&
                <Button onClick={()=>downloadExelListaCommessa() } >
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
                rows={gridData} 
                columns={columns}
                getRowId={(row) => row?.key}
                onRowClick={handleEvent}
                onCellClick={handleOnCellClick}
                onPaginationModelChange={(e)=>{setInfoPageListaCom(e); setInfoPageToLocalStorageCommessa(e);}}
                paginationModel={infoPageListaCom}
                />
            </div>
            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading}
                sentence={'Downloading...'} >
            </ModalLoading>
        </div>
    );
};
export default PagoPaListaModuliCommessa;