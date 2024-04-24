import { Typography } from "@mui/material";
import { Box, FormControl, InputLabel,Select, MenuItem, TextField, Button} from '@mui/material';
import { getTipologiaProfilo, manageError, redirect} from '../api/api';
import { BodyGetListaDatiFatturazione, GridElementListaFatturazione, ListaDatiFatturazioneProps, ResponseDownloadListaFatturazione } from "../types/typeListaDatiFatturazione";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {BodyListaDatiFatturazione, Params} from '../types/typesGeneral';
import { DataGrid, GridRowParams,GridEventListener,MuiEvent, GridColDef } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import { getTipologiaProdotto } from "../api/apiSelfcare/moduloCommessaSE/api";
import { downloadDocumentoListaDatiFatturazionePagoPa, listaDatiFatturazionePagopa } from "../api/apiPagoPa/datiDiFatturazionePA/api";
import useIsTabActive from "../reusableFunctin/tabIsActiv";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { PathPf } from "../types/enum";
import { profiliEnti } from "../reusableFunctin/profilo";
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../types/typeReportDettaglio";

const PagoPaListaDatiFatturazione:React.FC<ListaDatiFatturazioneProps> = ({mainState}) =>{
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);


    const setFilterToLocalStorage = () => {
        localStorage.setItem("filtersListaDatiFatturazione", JSON.stringify({bodyGetLista,textValue,valueAutocomplete}));
    }; 

    const setInfoPageToLocalStorage = (info) => {
        localStorage.setItem("pageRowListaDatiFatturazione", JSON.stringify(info));
    };

    const deleteFilterToLocalStorage = () => {
        localStorage.removeItem("filtersListaDatiFatturazione");
    }; 

    const getFiltersFromLocalStorage = () => {
        const filtri = localStorage.getItem('filtersListaDatiFatturazione') || '{}';
        const result =  JSON.parse(filtri);
        return result;
    };

    const getInfoPageFromLocalStorage = () => {
        const infoPage = localStorage.getItem('pageRowListaDatiFatturazione') || '{}';
        const result =  JSON.parse(infoPage);
        return result;
    };

   
    
    const tabActive = useIsTabActive();
    useEffect(()=>{
        if(tabActive === true && (mainState.nonce !== profilo.nonce)){
            window.location.href = redirect;
        }
    },[tabActive, mainState.nonce]);
   

    const navigate = useNavigate();
    const enti = profiliEnti();

    const [prodotti, setProdotti] = useState([{nome:''}]);
    const [profili, setProfili] = useState(['']);
    

    const [gridData, setGridData] = useState<GridElementListaFatturazione[]>([]);

    const [statusAnnulla, setStatusAnnulla] = useState('hidden');

    const [filtersDownload, setFiltersDownload] = useState<BodyGetListaDatiFatturazione>({idEnti:[],prodotto:'',profilo:''});

    const [getListaLoading, setGetListaLoading] = useState(false);

    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);

    const [bodyGetLista, setBodyGetLista] = useState({idEnti:[],prodotto:'',profilo:''});
    const [infoPageListaDatiFat , setInfoPageListaDatiFat] = useState({ page: 0, pageSize: 100 });

    const [textValue, setTextValue] = useState('');

    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);

    // al primo reload se torno inditro da dettaglio dati tturazione ho gli stessi filtri per il download

    useEffect(()=>{

        const result = getFiltersFromLocalStorage();
        const infoPageResult = getInfoPageFromLocalStorage();
        if(mainState.nonce !== ''){
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
        }
    }, [mainState.nonce]);


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

    const getProdotti = async() => {
        await getTipologiaProdotto(token,mainState.nonce )
            .then((res)=>{
               
                setProdotti(res.data);
            })
            .catch(((err)=>{
                manageError(err,navigate);
            }));
    };

    const getProfili = async() => {
        await getTipologiaProfilo(token,mainState.nonce)
            .then((res)=>{
               
                setProfili(res.data);
            })
            .catch(((err)=>{
                manageError(err,navigate);
            }));
    };

    const getListaDatifatturazione = async(body:BodyListaDatiFatturazione) =>{
        setGetListaLoading(true);
        await listaDatiFatturazionePagopa(body ,token,mainState.nonce)
            .then((res)=>{
              
                setGridData(res.data);
                setGetListaLoading(false);
            })
            .catch(((err)=>{
                setGridData([]);
                setGetListaLoading(false);
                manageError(err,navigate);
            })); 
    };

    

    const onDownloadButton = async() =>{
        setShowLoading(true);
        await downloadDocumentoListaDatiFatturazionePagoPa(token,mainState.nonce, filtersDownload).then((res:ResponseDownloadListaFatturazione) => {
          
            let fileName = `Lista dati di fatturazione.xlsx`;
            if(gridData.length === 1){
                fileName = `Dati di fatturazione / ${gridData[0]?.ragioneSociale}.xlsx`;
            }
            //const url = window.URL.createObjectURL(res.data.documento);
            const link = document.createElement('a');
            link.href = "data:text/plain;base64," + res.data.documento;
         
            link.setAttribute('download', fileName); //or any other extension
            document.body.appendChild(link);
          
            link.click();
            document.body.removeChild(link);
            setShowLoading(false);
        }).catch(err => {
          
            manageError(err,navigate);
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

            localStorage.setItem('profilo', JSON.stringify({
                ...profilo,
                ...{
                    idEnte:params.row.idEnte,
                    prodotto:params.row.prodotto,
                }
            }));

            const string = JSON.stringify({nomeEnteClickOn:params.row.ragioneSociale});
            localStorage.setItem('statusApplication', string);

            navigate(PathPf.DATI_FATTURAZIONE);
        }
       
    };
      
    const columns: GridColDef[] = [
        { field: 'ragioneSociale', headerName: 'Ragione Sociale', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:any) => <a className="mese_alidita text-primary fw-bolder" href="/">{param.row.ragioneSociale}</a>},
        { field: 'cup', headerName: 'Cup', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'splitPayment', headerName: 'Split payment', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'idDocumento', headerName: 'ID. Documento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataDocumento', headerName: 'Data Documento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'codCommessa', headerName: 'Cod. Commessa', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataCreazione', headerName: 'Data Primo Acc.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataModifica', headerName: 'Data Ultimo Acc.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        {
            field: 'action',
            headerName: '',
            sortable: false,
            width:70,
            headerAlign: 'left',
            disableColumnMenu :true,
            renderCell: (() => (
    
                <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} onClick={() => console.log('Show page details')} />
    
            )
            ),
        }

    ];

    const [showLoading,setShowLoading] = useState(false);

    return(
        <div className="mx-5">
            {/*title container start */}
            <div className="marginTop24 ">
                <Typography variant="h4">Lista Dati Fatturazione</Typography>
            </div>
            {/*title container end */}
        
            <div className="d-flex mb-5 marginTop24" >
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
                                //IconComponent={SearchIcon}
                    
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
                <div className="col-3 me-3">
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
                                //IconComponent={SearchIcon}
                    
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
            </div>
            <div className="d-flex" >
                <div  className="col-3">
                    <MultiselectCheckbox 
                        mainState={mainState} 
                        setBodyGetLista={setBodyGetLista}
                        setDataSelect={setDataSelect}
                        dataSelect={dataSelect}
                        setTextValue={setTextValue}
                        textValue={textValue}
                        valueAutocomplete={valueAutocomplete}
                        setValueAutocomplete={setValueAutocomplete}
                    ></MultiselectCheckbox>
                </div>
                <div className=" d-flex justify-content-center align-items-center">
                    <div>
                        <Button 
                            onClick={()=>{
                                getListaDatifatturazione(bodyGetLista);
                                setInfoPageListaDatiFat({ page: 0, pageSize: 100 });
                                setFiltersDownload(bodyGetLista);
                                setFilterToLocalStorage();
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