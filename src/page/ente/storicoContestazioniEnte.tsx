import { Box, Button, FormControl, InputLabel, MenuItem, Select, Tooltip, Typography } from "@mui/material";
import { month } from "../../reusableFunction/reusableArrayObj";
import { useContext, useEffect, useState } from "react";
import { manageError } from "../../api/api";
import { GlobalContext } from "../../store/context/globalContext";
import { getListaStorico} from "../../api/apiPagoPa/storicoContestazioni/api";
import { getAnniContestazioni,  getMesiContestazioni} from "../../api/apiPagoPa/notifichePA/api";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { PathPf } from "../../types/enum";
import { useNavigate } from "react-router";
import NoteAddIcon from '@mui/icons-material/NoteAdd';

import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { headersName } from "../../assets/configurations/config_GridStoricoContestazioni";

export interface BodyStoricoContestazioni{
    anno:string,
    mese:string,
    idEnti:string[],
    idTipologiaReports:number[]
}

export interface TipologieDoc {
    idTipologiaReport: number,
    categoriaDocumento: string,
    tipologiaDocumento: string
}

export interface ContestazioneRowGrid {
    reportId: string,
    uniqueId: string,
    json: string,
    anno: number,
    mese: number,
    internalOrganizationId: string,
    contractId: string,
    actualContractId: string,
    utenteId: string,
    prodotto: string,
    stato: number,
    dataInserimento: string,
    dataStepCorrente: string,
    linkDocumento: string,
    storage: string,
    hash: string,
    contentType: string,
    contentLanguage: string,
    tipologiaDocumento: string,
    categoriaDocumento: string,
    ragioneSociale: string
}

const StoricoEnte = () => {

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();

    const { 
        filters,
        updateFilters,
        isInitialRender,
        resetFilters
    } = useSavedFilters(PathPf.STORICO_CONTEST,{});

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    const [bodyGetLista,setBodyGetLista] = useState<BodyStoricoContestazioni>({
        anno:'',
        mese:'',
        idEnti:[],
        idTipologiaReports:[]
    });

    const [valueYears, setValueYears] = useState<string[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [dataGrid,setDataGrid] = useState<ContestazioneRowGrid[]>([]);
    const [listaToMap,setListaToMap] = useState<ContestazioneRowGrid[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalContestazioni, setTotalContestazioni]  = useState(0);
    const [getListaContestazioniRunning, setGetListaContestazioniRunning] = useState(false);
    const [arrayMesi,setArrayMesi] = useState<{descrizione:string,mese:string}[]>([]);

    useEffect(()=>{
        getAnni();
    },[]);

    useEffect(()=>{
        if(bodyGetLista.idEnti.length > 0 ||bodyGetLista.idTipologiaReports.length > 0 || bodyGetLista.mese !== ''){
            setStatusAnnulla('show');
        }else{
            setStatusAnnulla('hidden');
        }
    },[bodyGetLista]);


    const clearOnChangeFilter = () => {
        setDataGrid([]);
        setPage(0);
        setRowsPerPage(10);
        setTotalContestazioni(0);
    };

    const getAnni = async() => {
        setGetListaContestazioniRunning(true);
        await getAnniContestazioni(token,profilo.nonce)
            .then((res)=>{
                setValueYears(res.data);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    setBodyGetLista(filters.body);
                    getListaContestazioni(filters.body,filters.page+1,filters.rows);
                    getMesi(filters.body.anno);
                    setPage(filters.page);
                    setRowsPerPage(filters.rows);
                }else{
                    setBodyGetLista((prev)=> ({...prev, ...{anno:res.data[0]}}));
                    getListaContestazioni({...bodyGetLista,...{anno:res.data[0]}},page+1,rowsPerPage);
                    getMesi(res.data[0]);
                }
            }).catch((err)=>{
                setGetListaContestazioniRunning(false);
                manageError(err,dispatchMainState);
            });
    };
    const getMesi = async (anno) => {
        await getMesiContestazioni(token, profilo.nonce,anno).then((res)=> {
            setArrayMesi(res.data);
        }).catch((err)=>{
            setArrayMesi([]);
            manageError(err,dispatchMainState);  
        });
    };

   
    const getListaContestazioni = async(body,pag, rowpag) => {
        setGetListaContestazioniRunning(true);
        await getListaStorico(token,profilo.nonce,body,pag,rowpag).then((res)=>{
            // ordino i dati in base all'header della grid
            setListaToMap(res.data.reports);
            const orderDataCustom = res.data.reports.map((obj)=>{
                // inserire come prima chiave l'id se non si vuol renderlo visibile nella grid
                // 'id serve per la chiamata get dettaglio dell'elemento selezionato nella grid
                return {
                    reportId:obj.reportId,
                    ragioneSociale:obj.ragioneSociale,
                    dataInserimento:obj.dataInserimento.replace("T", " ").substring(0, 19),
                    mese:month[obj.mese-1],
                    anno:obj.anno,
                    stato:obj.descrizioneStato,
                    categoriaDocumento:obj.categoriaDocumento,
                    idStato:obj.stato
                };
            });
            setDataGrid(orderDataCustom);
            setTotalContestazioni(res.data.count);
            setGetListaContestazioniRunning(false);
        }).catch((err)=>{
            setDataGrid([]);
            setTotalContestazioni(0);
            setGetListaContestazioniRunning(false);
            manageError(err,dispatchMainState);
        });
    };

    const handleAnnullaButton = () => {
        setBodyGetLista({
            anno:valueYears[0],
            mese:'',
            idEnti:[],
            idTipologiaReports:[]
        });
        getListaContestazioni({
            mese:'',
            idEnti:[],
            idTipologiaReports:[],
            anno:valueYears[0]
        },1,10);
        resetFilters();
    };

    const handleFiltra = () => {
        updateFilters({
            pathPage:PathPf.STORICO_CONTEST,
            body:bodyGetLista,
            page:0,
            rows:10,
        });
        getListaContestazioni(bodyGetLista,page+1,rowsPerPage);
    };
         
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        const realPage = newPage + 1;
        getListaContestazioni(bodyGetLista,realPage, rowsPerPage);
        setPage(newPage);
        updateFilters({
            pathPage:PathPf.STORICO_CONTEST,
            body:bodyGetLista,
            page:newPage,
            rows:rowsPerPage
        });
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        const realPage = page + 1;
        getListaContestazioni(bodyGetLista,realPage,parseInt(event.target.value, 10));  
        updateFilters({
            pathPage:PathPf.STORICO_CONTEST,
            body:bodyGetLista,
            page:0,
            rows:parseInt(event.target.value, 10)
        });
    };

    const handleClickOnDetail = (el) => {    
        navigate(PathPf.STORICO_DETTAGLIO_CONTEST);
        const singleEl = listaToMap.find(elem => elem.reportId === el.id);
        handleModifyMainState({contestazioneSelected:singleEl});
    };  


    return (
        <div className="mx-5" style={{minHeight:'600px'}}>
            <div className="marginTop24">
                <div className="row ">
                    <div className="col-9">
                        <Typography variant="h4">Contestazioni</Typography>
                    </div>
                </div>
                <div className="mb-5 mt-5 marginTop24" >
                    <div className="row">
                        <div className="col-3">
                            <Box sx={{ width:'80%'}}>
                                <FormControl
                                    fullWidth
                                    size="medium"
                                >
                                    <InputLabel>
                                Anno
                                    </InputLabel>
                                    <Select
                                        label='Anno'
                                        onChange={(e) =>{
                                            setBodyGetLista((prev)=> ({...prev, ...{anno:e.target.value,mese:''}}));
                                            getMesi(e.target.value);
                                            clearOnChangeFilter();
                                        }  }
                                        value={bodyGetLista.anno||''}
                                    >
                                        {valueYears.map((el:string) => (
                                            <MenuItem
                                                key={el}
                                                value={el||''}
                                            >
                                                {el}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </div>
                        <div className="col-3">
                            <Box sx={{width:'80%'}}  >
                                <FormControl
                                    fullWidth
                                    size="medium"
                                >
                                    <InputLabel> Mese</InputLabel>
                                    <Select
                                        label='Seleziona Mese'
                                        onChange={(e) =>{
                                            setBodyGetLista((prev)=> ({...prev, ...{mese:e.target.value}}));
                                            clearOnChangeFilter();
                                        }}
                                        value={bodyGetLista.mese||''}
                                    >
                                        {arrayMesi.map((el) =>{
                                            return(
                                                <MenuItem key={el.mese} value={el.mese}>
                                                    {el?.descrizione.charAt(0).toUpperCase() + el.descrizione.slice(1).toLowerCase()}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </Box>
                        </div>
                    </div>
                    <div className="row mt-5">
                        <div className="col-9">
                            <div className=" d-flex justify-content-start ">
                                <Button onClick={handleFiltra} sx={{ marginTop: 'auto', marginBottom: 'auto'}}variant="contained">
                                     Filtra
                                </Button>
                                {statusAnnulla === 'hidden' ? null :
                                    <Button onClick={handleAnnullaButton} sx={{marginLeft:'24px'}} >
                                        Annulla filtri
                                    </Button>
                                }
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="d-flex justify-content-end me-5" style={{width:'80%'}}>
                                <Tooltip  title="Contestazioni multiple">
                                    <Button  variant="outlined" onClick={()=> navigate(PathPf.INSERIMENTO_CONTESTAZIONI_ENTE)} ><NoteAddIcon></NoteAddIcon></Button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5">
                        <div className="mt-1 mb-5" style={{ width: '100%'}}>
                            <GridCustom
                                nameParameterApi='contestazionePage'
                                elements={dataGrid}
                                changePage={handleChangePage}
                                changeRow={handleChangeRowsPerPage} 
                                total={totalContestazioni}
                                page={page}
                                rows={rowsPerPage}
                                headerNames={headersName}
                                apiGet={handleClickOnDetail}
                                disabled={getListaContestazioniRunning}
                                widthCustomSize="1300px"></GridCustom>
                        </div>
                    </div>
                </div>
            </div>
            <ModalLoading 
                open={getListaContestazioniRunning} 
                setOpen={setGetListaContestazioniRunning} 
                sentence={'Loading...'}>
            </ModalLoading>
        </div>
    );
};

export default StoricoEnte;