import { BodyDownloadModuliCommessa, GridElementListaCommesse } from "../../types/typeListaModuliCommessa";
import { Params } from "../../types/typesGeneral";
import { Typography } from "@mui/material";
import { Box, FormControl, InputLabel,Select, MenuItem, Button} from '@mui/material';
import { manageError } from '../../api/api';
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { DataGrid, GridRowParams,GridEventListener,MuiEvent} from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import { getTipologiaProdotto } from "../../api/apiSelfcare/moduloCommessaSE/api";
import { anniMesiModuliCommessa, downloadDocumentoListaModuloCommessaPagoPa, listaModuloCommessaPagopa } from "../../api/apiPagoPa/moduloComessaPA/api";
import { saveAs } from "file-saver";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { PathPf } from "../../types/enum";
import MultiselectCheckbox from "../../components/reportDettaglio/multiSelectCheckbox";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import { mesiGrid, mesiWithZero } from "../../reusableFunction/reusableArrayObj";
import { listaEntiNotifichePage } from "../../api/apiSelfcare/notificheSE/api";
import { GlobalContext } from "../../store/context/globalContext";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { headerNameListaModuliCommessaSEND } from "../../assets/configurations/conf_GridListaModuliCommessaSend";


const PagoPaListaModuliCommessa:React.FC = () =>{
    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();


    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

   
    const [prodotti, setProdotti] = useState([{nome:''}]);
    const [gridData, setGridData] = useState<GridElementListaCommesse[]>([]);
    const [bodyGetLista, setBodyGetLista] = useState<BodyDownloadModuliCommessa>({idEnti:[],prodotto:'', anno:0, mese:0});
    const [infoPageListaCom , setInfoPageListaCom] = useState({ page: 0, pageSize: 10 });
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [bodyDownload, setBodyDownload] = useState<BodyDownloadModuliCommessa>({idEnti:[],prodotto:'', anno:0, mese:0});
    const [showLoading,setShowLoading] = useState(false);

    const [years,setYears] = useState<number[]>([]);
    const [monthsCommessa,setMonthsCommessa] = useState<{[key:number]:number[]}>({});
    const [yearMonths, setYearMonths] = useState<number[]>([]);
   

    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.LISTA_MODULICOMMESSA,{});

    useEffect(()=>{
        getAnniMesi();
    }, []);
  
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


    const getAnniMesi = async() => {
        await anniMesiModuliCommessa(token, profilo.nonce).then(async(res)=>{
            const allAnni = res.data.map((item: { anno: number }) => item.anno);
            const anni:number[] = Array.from(new Set(allAnni));
            const mesi = res.data.reduce((acc, { anno, mese }) => {
                if (!acc[anno]) {
                    acc[anno] = [];
                }
                acc[anno].push(mese);
                return acc;
            }, {});
            
            setMonthsCommessa(mesi);
            setYears(anni);
            if(isInitialRender.current && Object.keys(filters).length > 0){
                const firstYear = filters.body.anno;
                setYearMonths(mesi[firstYear]);
                await getProdotti(firstYear,mesi[firstYear][0]);

            }else{
                const firstYear = anni[0];
                setYearMonths(mesi[firstYear]);
                await getProdotti(firstYear,mesi[firstYear][0]);
            }   
        }).catch((err)=>{
            manageError(err,dispatchMainState);
        });
    };

    const getProdotti = async(y,m) => {
        await getTipologiaProdotto(token, profilo.nonce)
            .then((res)=>{
                setProdotti(res.data);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    setBodyGetLista(filters.body);
                    setTextValue(filters.textValue);
                    setValueAutocomplete(filters.valueAutocomplete);
                    getListaCommesse(filters.body);
                    setBodyDownload(filters.body);
                    setInfoPageListaCom({page:filters.page,pageSize:filters.rows});
                }else{
                    setBodyGetLista({...bodyGetLista,anno:y,mese:m});
                    setBodyDownload({...bodyGetLista,anno:y,mese:m});
                    getListaCommesse({...bodyGetLista,anno:y,mese:m});
                    isInitialRender.current = false;
                }
            }).catch(((err)=>{
                isInitialRender.current = false;
                manageError(err,dispatchMainState);
            }));
    };

    const getListaCommesse = async(body) =>{
        await listaModuloCommessaPagopa(body ,token, profilo.nonce)
            .then((res)=>{
               
                setGridData(res.data);
                isInitialRender.current = false;
            }).catch((err)=>{
                setGridData([]);
                manageError(err,dispatchMainState);
                isInitialRender.current = false;
            }); 
    };

    const getListaCommesseOnAnnulla = async() =>{
        const firstYear = years[0];
        
        await listaModuloCommessaPagopa({descrizione:'',prodotto:'', anno:firstYear, mese:monthsCommessa[firstYear][0]||0} ,token, profilo.nonce)
            .then((res)=>{
                setBodyGetLista({idEnti:[],prodotto:'', anno:firstYear, mese:monthsCommessa[firstYear][0]||0});
                setGridData(res.data);
            }).catch((err)=>{
                manageError(err,dispatchMainState);
            }); 
    };

    const listaEntiNotifichePageOnSelect = async () =>{
        if(profilo.auth === 'PAGOPA'){
            await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue} )
                .then((res)=>{
                    setDataSelect(res.data) ;
                }).catch(((err)=>{
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
            }).catch((err)=>{
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
        if(columsSelectedGrid  === 'regioneSociale' || columsSelectedGrid  === 'action' ){
            const oldProfilo = mainState.profilo;
            handleModifyMainState({profilo:{...oldProfilo,...{
                idTipoContratto: params.row.idTipoContratto,
                prodotto:params.row.prodotto,
                idEnte:params.row.idEnte,
               
            }},
            mese:params.row.mese,
            anno:params.row.anno,
            userClickOn:'GRID',
            inserisciModificaCommessa:"MODIFY",
            nomeEnteClickOn:params.row.ragioneSociale});
            navigate(PathPf.MODULOCOMMESSA);
        }
    };

    const onChangePageOrRowGrid = (e) => {
        updateFilters(
            {
                body:bodyDownload,
                pathPage:PathPf.LISTA_MODULICOMMESSA,
                textValue,
                valueAutocomplete,
                page:e.page,
                rows:e.pageSize
            });
        setInfoPageListaCom(e);
    };


    const clearOnChangeFilter = () => {
        setGridData([]);
        setInfoPageListaCom({ page: 0, pageSize: 10 });  
    };

    const onButtonFiltra = () => {
        setInfoPageListaCom({ page: 0, pageSize: 10 });
        getListaCommesse(bodyGetLista);
        setBodyDownload(bodyGetLista);
        updateFilters(
            {
                body:bodyGetLista,
                pathPage:PathPf.LISTA_MODULICOMMESSA,
                textValue,
                valueAutocomplete,
                page:0,
                rows:10
            });
    };

    const onButtonAnnulla = () =>{
        const firstYear = years[0];
        setInfoPageListaCom({ page: 0, pageSize: 10 });
        getListaCommesseOnAnnulla();
        setBodyGetLista({idEnti:[],prodotto:'', anno:firstYear, mese:monthsCommessa[firstYear][0]});
        setBodyDownload({idEnti:[],prodotto:'', anno:firstYear, mese:monthsCommessa[firstYear][0]});
        setDataSelect([]);
        setValueAutocomplete([]);
        resetFilters();
    };


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
                                <InputLabel>
                                Anno
                                </InputLabel>
                                <Select
                                    id="sea"
                                    label='Seleziona Prodotto'
                                    onChange={(e) =>{
                                        clearOnChangeFilter();
                                        setYearMonths(monthsCommessa[Number(e.target.value)]);
                                        setBodyGetLista((prev)=> ({...prev, ...{anno:Number(e.target.value),mese:monthsCommessa[Number(e.target.value)][0]}}));
                                    }  }
                                    value={bodyGetLista.anno||""}
                                >
                                    {years.map((el) => (
                                        <MenuItem
                                            key={Math.random()}
                                            value={el||""}
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
                                <InputLabel>
                                Mese
                                </InputLabel>
                                <Select
                                    id="sea"
                                    label='Seleziona Prodotto'
                                    labelId="search-by-label"
                                    onChange={(e) =>{
                                        setBodyGetLista((prev)=> ({...prev, ...{mese:Number(e.target.value)}}));
                                        clearOnChangeFilter();
                                    }}
                                    value={bodyGetLista.mese||""}
                                >
                                    {yearMonths?.map((el) => (
                                        <MenuItem
                                            key={Math.random()}
                                            value={el||""}
                                        >
                                            {mesiGrid[el]||""}
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
                                <InputLabel>
                                Seleziona Prodotto
                                </InputLabel>
                                <Select
                                    id="sea"
                                    label='Seleziona Prodotto'
                                    labelId="search-by-label"
                                    onChange={(e) =>{
                                        clearOnChangeFilter();
                                        setBodyGetLista((prev)=> ({...prev, ...{prodotto:e.target.value}}));
                                    }}
                                    value={bodyGetLista.prodotto||""}
                                >
                                    {prodotti.map((el) => (
                                        <MenuItem
                                            key={Math.random()}
                                            value={el.nome||""}
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
                            clearOnChangeFilter={clearOnChangeFilter}
                        ></MultiselectCheckbox>
                    </div>
                </div>
            </div>
            <div className="d-flex" >
                <div className=" d-flex justify-content-center align-items-center">
                    <div>
                        <Button 
                            onClick={onButtonFiltra} 
                            sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                            variant="contained"> Filtra
                        </Button>
                        {statusAnnulla === 'hidden' ? null :
                            <Button
                                onClick={onButtonAnnulla}
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
                <Button onClick={downloadExelListaCommessa} >
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
                columns={headerNameListaModuliCommessaSEND}
                getRowId={(row) => `${row.idEnte}_${row.meseValidita}_${row.annoValidita}`}
                onRowClick={handleEvent}
                onCellClick={handleOnCellClick}
                onPaginationModelChange={(e)=> onChangePageOrRowGrid(e)}
                paginationModel={infoPageListaCom}
                pageSizeOptions={[10, 25, 50,100]}
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