import { Autocomplete, Box, Button, Checkbox, FormControl, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { month } from "../../reusableFunction/reusableArrayObj";
import { useEffect, useState } from "react";
import { manageError } from "../../api/api";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { PathPf, PathRoutePf } from "../../types/enum";
import { useNavigate } from "react-router";
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { getAnniContestazioniSE, getListaStoricoSE, getMesiContestazioniSE, getTipoReportSE } from "../../api/apiSelfcare/storicoContestazioneSE/api";
import { headersName } from "../../assets/configurations/conf_GridStoricoContestazioni_ente";
import { useGlobalStore } from "../../store/context/useGlobalStore";

export interface BodyStoricoContestazioniSE{
    anno:string,
    mese:string|number,//da sistemare
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

interface RecapObjContestazioni{
    tipologiaFattura: string
    idFlagContestazione: number
    flagContestazione: string
    totale: number
    totaleNotificheAnalogiche: number
    totaleNotificheDigitali: number  
}

const StoricoEnte : React.FC = () => {

    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();

    const { 
        filters,
        updateFilters,
        isInitialRender,
        resetFilters
    } = useSavedFilters(PathPf.STORICO_CONTEST_ENTE,{});

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    const [bodyGetLista,setBodyGetLista] = useState<BodyStoricoContestazioniSE>({
        anno:'2025',
        mese:"12",
        idTipologiaReports:[]
    });

    const [valueYears, setValueYears] = useState<string[]>(["2025"]);
    const [dataGrid,setDataGrid] = useState<any[]>([
        {
            reportId:1,
            dataInserimento:"11/12/2025",
            num:1234,
            mese:month[11],
            anno:2025,
            stato:"Bozza",
            idStato:4
        },
        {
            reportId:2,
            dataInserimento:"11/12/2025",
            num:99,
            mese:month[11],
            anno:2025,
            stato:"Processo completato",
            idStato:2
        },
        {
            reportId:3,
            dataInserimento:"11/12/2025",
            num:44,
            mese:month[11],
            anno:2025,
            stato:"In elaborazione",
            idStato:1
        },
        {
            reportId:3,
            dataInserimento:"11/12/2025",
            num:44,
            mese:month[11],
            anno:2025,
            stato:"Errore",
            idStato:3
        }
    ]);
    const [listaToMap,setListaToMap] = useState<ContestazioneRowGrid[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalContestazioni, setTotalContestazioni]  = useState(0);
    const [getListaContestazioniRunning, setGetListaContestazioniRunning] = useState(false);
    const [arrayMesi,setArrayMesi] = useState<{descrizione:string,mese:string}[]>([{descrizione:"Dicembre",mese:"12"}]);
    const [tipologieDoc, setTipologieDoc] = useState<TipologieDoc[]>([]);
    const [tipologiaSelcted,setTipologiaSelected] = useState<TipologieDoc[]>([]);

    useEffect(()=>{
        //listaTipoReport(); 
        getAnni();
    },[]);

    const clearOnChangeFilter = () => {
        setDataGrid([]);
        setPage(0);
        setRowsPerPage(10);
        setTotalContestazioni(0);
    };

    const getAnni = async() => {
        setGetListaContestazioniRunning(true);
        await getAnniContestazioniSE(token,profilo.nonce)
            .then((res)=>{
                setValueYears(res.data);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    setBodyGetLista(filters.body);
                    getListaContestazioni(filters.body,filters.page+1,filters.rows);
                    setTipologiaSelected(filters.tipologiaSelcted);
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
        await getMesiContestazioniSE(token, profilo.nonce,anno).then((res)=> {
            //setArrayMesi(res.data);
        }).catch((err)=>{
            //setArrayMesi([]);
            manageError(err,dispatchMainState);  
        });
    };

    const listaTipoReport = async () =>{
        await getTipoReportSE(token, profilo.nonce).then((res)=>{
            setTipologieDoc(res.data);
        }).catch(((err)=>{
            setTipologieDoc([]);
            manageError(err,dispatchMainState);
        }));
    };

   
    const getListaContestazioni = async(body,pag, rowpag) => {
        setGetListaContestazioniRunning(true);
        await getListaStoricoSE(token,profilo.nonce,body,pag,rowpag).then((res)=>{
            // ordino i dati in base all'header della grid
            setListaToMap(res.data.reports);
            const orderDataCustom = res.data.reports.map((obj)=>{
                // inserire come prima chiave l'id se non si vuol renderlo visibile nella grid
                // 'id serve per la chiamata get dettaglio dell'elemento selezionato nella grid
                return {
                    reportId:obj.reportId,
                    dataInserimento:obj.dataInserimento.replace("T", " ").substring(0, 19),
                    mese:month[obj.mese-1],
                    anno:obj.anno,
                    stato:obj.descrizioneStato,
                    idStato:obj.stato
                };
            });
            //setDataGrid(orderDataCustom);
            setTotalContestazioni(res.data.count);
            setGetListaContestazioniRunning(false);
        }).catch((err)=>{
            //setDataGrid([]);
            setTotalContestazioni(0);
            setGetListaContestazioniRunning(false);
            manageError(err,dispatchMainState);
        });
    };

    const handleAnnullaButton = () => {
        setBodyGetLista({
            anno:valueYears[0],
            mese:'',
            idTipologiaReports:[]
        });
        getListaContestazioni({
            mese:'',
            idTipologiaReports:[],
            anno:valueYears[0]
        },1,10);
        setTipologiaSelected([]);
        resetFilters();
    };

    const handleFiltra = () => {
        updateFilters({
            pathPage:PathPf.STORICO_CONTEST,
            body:bodyGetLista,
            tipologiaSelcted:tipologiaSelcted,
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
            pathPage:PathPf.STORICO_CONTEST_ENTE,
            body:bodyGetLista,
            tipologiaSelcted:tipologiaSelcted,
            page:0,
            rows:parseInt(event.target.value, 10)
        });
    };

    const handleClickOnDetail = (el) => {    
        navigate(PathPf.STORICO_DETTAGLIO_CONTEST);
        const singleEl = listaToMap.find(elem => elem.reportId === el.id);
        handleModifyMainState({contestazioneSelected:singleEl});
    };  



    const statusAnnulla = (bodyGetLista.idTipologiaReports.length > 0 || bodyGetLista.mese !== '') ? "show":"hidden";

    const arrayReacpCon = [{
        "tipologiaFattura": "CONTESTAZIONE",
        "idFlagContestazione": 1,
        "flagContestazione": "Non Contestata",
        "totale": 2263,
        "totaleNotificheAnalogiche": 789,
        "totaleNotificheDigitali": 1474
    },
    {
        "tipologiaFattura": "CONTESTAZIONE",
        "idFlagContestazione": 1,
        "flagContestazione": "Contestata Ente",
        "totale": 10,
        "totaleNotificheAnalogiche": 2,
        "totaleNotificheDigitali": 8
    }];


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
                                        value={(12).toString()}
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
                            <div className="d-flex justify-content-end" >
                                <Tooltip  title="Crea contestazione">
                                    <Button sx={{gap:2}} variant="outlined" onClick={()=> navigate(PathPf.INIZIO_CONTEST_ENTE)} ><NoteAddIcon/>Crea contestazione</Button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white my-5 ">
                       
                        <div className="row text-center">  
                            <div  className="col-12">
                                <Box sx={{ margin: 2 ,backgroundColor:'#F8F8F8', padding:'10px'}}>
                                    <Typography variant="h4">Notifiche {month[Number(bodyGetLista.mese)-1]} {bodyGetLista.anno}</Typography>
                                </Box>
                                {/*se la UI lato ente viene approvato fai un unico componente sie ente che send */}
                                <Box sx={{ margin: 2 , backgroundColor:'#F8F8F8', padding:'10px'}}>
                                    <Table size="small" aria-label="purchases">
                                        <TableHead>
                                            <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                                <TableCell align="center" sx={{ width:"300px"}} >Tipologia Fattura</TableCell>
                                                <TableCell align="center" sx={{ width:"300px"}} >Tipologia Contestazione</TableCell>
                                                <TableCell align="center" sx={{ width:"300px"}}>Tot. Not. Analog.</TableCell>
                                                <TableCell align="center" sx={{ width:"300px"}}>Tot. Not. Digit.</TableCell>
                                                <TableCell align="center" sx={{ width:"300px"}}>Totale</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                            {arrayReacpCon.map((sigleRec:RecapObjContestazioni)=>{
                                                return (
                                                    <TableRow key={Math.random()}>
                                                        <TableCell align="center"  sx={{ width:"300px"}} >{sigleRec.tipologiaFattura}</TableCell>
                                                        <TableCell align="center" sx={{ width:"300px"}} >{sigleRec.flagContestazione}</TableCell>
                                                        <TableCell align="center" sx={{ width:"300px"}}>{sigleRec.totaleNotificheAnalogiche}</TableCell>
                                                        <TableCell align="center" sx={{ width:"300px"}}>{sigleRec.totaleNotificheDigitali}</TableCell>
                                                        <TableCell align="center" sx={{ width:"300px"}}>{sigleRec.totale}</TableCell>
                                                    </TableRow>
                                                );})}
                                        </TableBody>
                                    </Table>
                                </Box>
                            </div>
                        </div>
                    </div>               
                    <div className="mt-5">
                        <div className="mt-1 mb-5" style={{ width: '100%'}}>
                            <GridCustom
                                nameParameterApi='contestazioneEnte'
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