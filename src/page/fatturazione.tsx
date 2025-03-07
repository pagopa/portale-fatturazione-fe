import { Box, Button, FormControl, InputLabel, MenuItem, Select, Tooltip, Typography } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { useContext, useEffect, useState } from "react";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { BodyFatturazione, FattureObj, HeaderCollapsible, TipologiaSap} from "../types/typeFatturazione";
import { downloadFatturePagopa, downloadFattureReportPagopa, fattureCancellazioneRipristinoPagoPa,fattureTipologiaSapPa, getAnniDocEmessiPagoPa, getFatturazionePagoPa, getMesiDocEmessiPagoPa, getTipologieFaPagoPa } from "../api/apiPagoPa/fatturazionePA/api";
import { manageError, manageErrorDownload, managePresaInCarico } from "../api/api";
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../types/typeReportDettaglio";
import { listaEntiNotifichePage } from "../api/apiSelfcare/notificheSE/api";
import { saveAs } from "file-saver";
import { month } from "../reusableFunction/reusableArrayObj";
import MultiSelectFatturazione from "../components/fatturazione/multiSelect";
import PreviewIcon from '@mui/icons-material/Preview';
import ModalSap from "../components/fatturazione/modalSap";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ModalConfermaRipristina from "../components/fatturazione/modalConfermaRipristina";
import ModalResetFilter from "../components/fatturazione/modalResetFilter";
import CollapsibleTable from "../components/reusableComponents/grid/gridCollapsible/gridCustomCollapsibleWithCheckbox";
import { GlobalContext } from "../store/context/globalContext";
import { getMessaggiCount } from "../api/apiPagoPa/centroMessaggi/api";
import { PathPf } from "../types/enum";
import useSavedFilters from "../hooks/useSaveFiltersLocalStorage";
import IosShareIcon from '@mui/icons-material/IosShare';
import { useNavigate } from "react-router";

const Fatturazione : React.FC = () =>{

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState, mainState,setCountMessages} = globalContextObj;

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const navigate = useNavigate();

    const [gridData, setGridData] = useState<FattureObj[]>([]);
    const [arrayYears,setArrayYears] = useState<number[]>([]);
    const [arrayMonths,setArrayMonths] = useState<{mese:string,descrizione:string}[]>([]);
    const [showLoadingGrid,setShowLoadingGrid] = useState(false);
    const [showDownloading,setShowDownloading] = useState(false);
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState<string>('hidden');
    const [tipologie, setTipologie] = useState<string[]>([]);
    const [valueMulitselectTipologie, setValueMultiselectTipologie] = useState<string[]>([]);
    const [disableButtonSap, setDisableButtonSap] = useState<boolean>(true);
    const [disableButtonReset, setDisableButtonReset] = useState<boolean>(true);
    const [openSapModal, setOpenSapModal] = useState<{who:number,show:boolean}>({who:0,show:false});
    const [openConfermaModal,setOpenConfermaModal] = useState(false);
    const [openResetFilterModal,setOpenResetFilterModal] = useState(false);
    const [responseTipologieSap, setResponseTipologieSap] = useState<TipologiaSap[]>([]);
    const [fattureSelected, setFattureSelected] = useState<number[]>([]);
    const [openModalJson,setOpenModalJson] = useState(false);
    
    const [bodyFatturazione, setBodyFatturazione] = useState<BodyFatturazione>({
        anno:0,
        mese:0,
        tipologiaFattura:[],
        idEnti:[],
        cancellata:false
    });
    const [bodyFatturazioneDownload, setBodyFatturazioneDownload] = useState<BodyFatturazione>({
        anno:0,
        mese:0,
        tipologiaFattura:[],
        idEnti:[],
        cancellata:false
    });
    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.FATTURAZIONE,{});

    useEffect(()=>{
        getAnni();
    },[]);

    useEffect(()=>{
        if(!isInitialRender.current){
            getMesi(bodyFatturazione.anno?.toString());
        }
        
    },[bodyFatturazione.anno]);

    
    
    useEffect(()=>{
        if(bodyFatturazione.idEnti.length !== 0 || bodyFatturazione.tipologiaFattura.length !== 0 || bodyFatturazione.cancellata === true ){
            setStatusAnnulla('show');
        }else{
            setStatusAnnulla('hidden');
        }
    },[bodyFatturazione]);
   
    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){
                listaEntiNotifichePageOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);

   
    useEffect(()=>{
        if(!isInitialRender.current){
            getTipologieFatturazione(bodyFatturazione.anno,bodyFatturazione.mese,bodyFatturazione.cancellata);
            setValueMultiselectTipologie([]);
        }
    },[bodyFatturazione.mese,bodyFatturazione.anno,bodyFatturazione.cancellata]);


    const getAnni = async() => {
        setShowLoadingGrid(true);
        await getAnniDocEmessiPagoPa(token, profilo.nonce).then((res)=>{
            const arrayNumber = res.data.map(el => Number(el.toString()));
            setArrayYears(arrayNumber);
            if(isInitialRender.current && Object.keys(filters).length > 0){
                getMesi(filters.body.anno?.toString());
            }else{
                setBodyFatturazione((prev)=> ({...prev,...{anno:Number(res.data[0])}}));
                getMesi(res.data[0]);
            }
            
        }).catch((err)=>{
            setArrayYears([]);
            setShowLoadingGrid(false);
            manageError(err,dispatchMainState);
        });
    };


    const getMesi = async(year) =>{
        await getMesiDocEmessiPagoPa(token, profilo.nonce,{anno:year}).then((res)=>{
            
            setArrayMonths(res.data);
            if(isInitialRender.current && Object.keys(filters).length > 0){
                setBodyFatturazione(filters.body);
                setBodyFatturazioneDownload(filters.body);
                setTipologie(filters.tipologie);
                setValueAutocomplete(filters.valueAutocomplete);
                setTextValue(filters.textValue);
                setValueMultiselectTipologie(filters.valueMulitselectTipologie);
                setFattureSelected(filters.fattureSelected);
                getlistaFatturazione(filters.body);
            }else{
                setBodyFatturazione((prev)=> ({...prev,...{mese:res.data[0].mese}}));
                getlistaFatturazione({...bodyFatturazione,...{anno:Number(year),mese:res.data[0].mese}});
            }
        }).catch((err)=>{
            setArrayMonths([]);
            setBodyFatturazione((prev)=> ({...prev,...{mese:0}}));
            setShowLoadingGrid(false);
            manageError(err,dispatchMainState);
        });
    };

    const getTipologieFatturazione =  async(anno,mese,cancellata) => {
        await getTipologieFaPagoPa(token, profilo.nonce, {anno:anno,mese:mese,cancellata:cancellata}  )
            .then((res)=>{
                setTipologie(res.data);
                if(!isInitialRender.current){
                    setBodyFatturazione((prev)=>({...prev,...{tipologiaFattura:[]}}));
                    setBodyFatturazioneDownload((prev)=>({...prev,...{tipologiaFattura:[]}}));   
                }
            }).catch(((err)=>{
                setTipologie([]);
                setBodyFatturazione((prev)=>({...prev,...{tipologiaFattura:[]}}));
                setBodyFatturazioneDownload((prev)=>({...prev,...{tipologiaFattura:[]}}));
                manageError(err,dispatchMainState);
            }));
        isInitialRender.current = false;
    };

    
    const getlistaFatturazione = async (body) => {
        setShowLoadingGrid(true);
        setDisableButtonSap(true);
        await  getFatturazionePagoPa(token,profilo.nonce,body)
            .then((res)=>{
                const data = res.data.map(el => el?.fattura);
                setGridData(data);
                setShowLoadingGrid(false);
                setBodyFatturazioneDownload(body);
            }).catch((error)=>{
                if(error?.response?.status === 404){
                    setGridData([]);
                }
                setBodyFatturazioneDownload(body);
                setShowLoadingGrid(false);
                manageError(error, dispatchMainState);
            });  
        getTipologieFattureInvioSap(body.anno,body.mese);
        if(isInitialRender.current){
            getTipologieFatturazione(body.anno,body.mese, body.cancellata);
        }
    };

    const getCount = async () =>{
        await getMessaggiCount(token,profilo.nonce).then((res)=>{
            const numMessaggi = res.data;
            setCountMessages(numMessaggi);
        }).catch((err)=>{
            console.log(err);
        });
    };


    const sendCancellazzioneRispristinoFatture = async () =>{
        await fattureCancellazioneRipristinoPagoPa(token,profilo.nonce,{idFatture:fattureSelected,cancellazione:!bodyFatturazioneDownload.cancellata}).then(()=>{
            getlistaFatturazione(bodyFatturazioneDownload);
            managePresaInCarico('FATTURA_SOSPESA_RIPRISTINATA',dispatchMainState);
            // add branch 536 10/01/25
            getCount();
            // add branch 536 10/01/25
        }).catch((error)=>{
               
            getlistaFatturazione(bodyFatturazioneDownload);
            manageError(error, dispatchMainState);
        });      
    };

    // servizio che popola la select con la checkbox
    const listaEntiNotifichePageOnSelect = async () =>{
        if(profilo.auth === 'PAGOPA'){
            await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue} ).then((res)=>{
                setDataSelect(res.data);
            }).catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
        }
    };

    const downloadListaFatturazione = async () => {
        setShowDownloading(true);
        await downloadFatturePagopa(token,profilo.nonce, bodyFatturazioneDownload).then(response => response.blob()).then((response)=>{
            let title = `Lista fatturazione/${month[bodyFatturazioneDownload.mese - 1]}/${bodyFatturazioneDownload.anno}.xlsx`;
            if(bodyFatturazioneDownload.idEnti.length === 1 && gridData[0]){
                title = `Lista fatturazione/ ${gridData[0]?.ragionesociale}/${month[bodyFatturazioneDownload.mese - 1]}/${bodyFatturazioneDownload.anno}.xlsx`;
            }
            saveAs(response,title);
            setShowDownloading(false);
        }).catch(((err)=>{
            setShowDownloading(false);
            manageError(err,dispatchMainState);
        }));
    };

    const downloadListaReportFatturazione = async () => {
        setShowDownloading(true);
        await downloadFattureReportPagopa(token,profilo.nonce, bodyFatturazioneDownload).then((response)=>{
            if (response.ok) {
                return response.blob();
            }
            throw '404';
        }).then((response)=>{
            let title = `Lista report/${month[bodyFatturazioneDownload.mese - 1]}/${bodyFatturazioneDownload.anno}.zip`;
            if(bodyFatturazioneDownload.idEnti.length === 1 && gridData[0]){
                title = `Lista report/ ${gridData[0]?.ragionesociale}/${month[bodyFatturazioneDownload.mese - 1]}/${bodyFatturazioneDownload.anno}.zip`;
            }
            saveAs(response,title);
            setShowDownloading(false);
        }).catch(((err)=>{
            setShowDownloading(false);
            manageErrorDownload(err,dispatchMainState);
        }));
    };

    const fattureSelectedArr = () =>{
        return fattureSelected.map((el)=>{
            return gridData.filter((obj:FattureObj) => obj.idfattura === el ).pop();
        });
    };
 
    const headersObjGrid : HeaderCollapsible[] = [
        {name:"",align:"left",id:1},
        {name:"Ragione Sociale",align:"left",id:2},
        {name:"Data Fattura",align:"center",id:12},
        {name:"Elaborazione",align:"center",id:13},
        {name:"T. Fattura",align:"center",id:10},
        {name:"Ident.",align:"center",id:9},
        {name:"Tipo Contratto",align:"center",id:3},
        {name:"Tot.",align:"center",id:4},
        {name:"N. Fattura",align:"center",id:5},
        {name:"Tipo Documento",align:"center",id:6},
        {name:"Divisa",align:"center",id:7},
        {name:"M. Pagamento",align:"center",id:8},
        {name:"Split",align:"center",id:11},
    ];


    // logic modal ON BUTTON SAP

    const getTipologieFattureInvioSap = async(anno,mese) =>{
        await fattureTipologiaSapPa(token, profilo.nonce, {anno,mese} ).then((res)=>{
            const anableInvioSap = res.data.filter((el)=> el.azione === 0).length;
            const anableReset = res.data.filter((el)=> el.azione === 1).length;
            if(anableInvioSap > 0){
                setDisableButtonSap(false);
            }else{
                setDisableButtonSap(true);
            }
            if(anableReset > 0){
                setDisableButtonReset(false);
            }else{
                setDisableButtonReset(true);
            }
            setResponseTipologieSap(res.data);
        }).catch((()=>{
            setDisableButtonSap(true);
            setDisableButtonReset(true);
            setResponseTipologieSap([]);
        }));
    };

    const onButtonSap = (who) => {
        setOpenSapModal((prev)=>({...prev,...{show:true,who}}));
    };

    const clearOnChangeFilter = () => {
        setGridData([]);
        setFattureSelected([]);  
        setDisableButtonSap(true);
        setDisableButtonReset(true); 
    };

    const onButtonFiltra = () => {
        updateFilters({
            pathPage:PathPf.FATTURAZIONE,
            body:bodyFatturazione,
            textValue:textValue,
            valueAutocomplete,
            tipologie:tipologie,
            fattureSelected:fattureSelected,
            valueMulitselectTipologie:valueMulitselectTipologie,
            page:0,
            rows:10,
        });
        getlistaFatturazione(bodyFatturazione);
    };

    const onButtonAnnulla = () => {

        getMesi(arrayYears[0]?.toString());
        
        setBodyFatturazione({
            anno:arrayYears[0],
            mese:0,
            tipologiaFattura:[],
            idEnti:[],
            cancellata:false
        });
        setBodyFatturazioneDownload({
            anno:arrayYears[0],
            mese:0,
            tipologiaFattura:[],
            idEnti:[],
            cancellata:false
        });
        setDataSelect([]);
        setValueMultiselectTipologie([]);
        setValueAutocomplete([]);
        resetFilters();
    };
    
    const upadateOnSelctedChange = (page,rowsPerPage) =>{
     
        updateFilters({
            pathPage:PathPf.FATTURAZIONE,
            body:bodyFatturazione,
            textValue:textValue,
            valueAutocomplete,
            tipologie:tipologie,
            fattureSelected:fattureSelected,
            valueMulitselectTipologie:valueMulitselectTipologie,
            page:page,
            rows:rowsPerPage,
        });
    };
    return (
        <div className="mx-5 mb-5">
            <div className="marginTop24 ">
                <Typography variant="h4">Documenti emessi</Typography>
            </div>
            <div className="mt-5">
                <div className="row">
                    <div className="col-3">
                        <Box sx={{width:'80%'}} >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel>
                            Anno   
                                </InputLabel>
                                <Select
                                    label='Seleziona Anno'
                                    onChange={(e) => {
                                        clearOnChangeFilter();  
                                        const value = Number(e.target.value);
                                        setBodyFatturazione((prev)=> ({...prev, ...{anno:value}}));
                                    }}
                                    value={bodyFatturazione.anno||''}     
                                >
                                    {arrayYears.map((el) => (
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
                        <Box sx={{width:'80%', marginLeft:'20px'}}  >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel>
                                Mese   
                                </InputLabel>
                                <Select
                                    label='Seleziona Prodotto'
                                    onChange={(e) =>{
                                        const value = Number(e.target.value);
                                        setBodyFatturazione((prev)=> ({...prev, ...{mese:value}}));
                                        clearOnChangeFilter();
                                    }}         
                                    value={bodyFatturazione.mese||''}             
                                >
                                    {arrayMonths.map((el) => (
                                    
                                        <MenuItem
                                            key={Math.random()}
                                            value={el.mese}
                                        >
                                            {el.descrizione.charAt(0).toUpperCase() + el.descrizione.slice(1).toLowerCase()}
                                        </MenuItem>
                                    ))} 
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                    <div  className="col-3">
                        <FormControl sx={{width:'80%',marginLeft:'20px'}}>
                            <InputLabel id="stato_fatturazione">Stato</InputLabel>
                            <Select
                                labelId="stato_fatturazione"
                                id="stato_fatturazione"
                                value={bodyFatturazione.cancellata ? 1 : 0}
                                label="Stato"
                                onChange={(e)=>{
                                    const value = e.target.value === 0 ? false : true;
                                    setBodyFatturazione((prev)=>({...prev,...{cancellata:value}}));
                                    clearOnChangeFilter();
                                }}
                            >
                                <MenuItem value={0}>Fatturate</MenuItem>
                                <MenuItem value={1}>Non fatturate</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div  className="col-3">
                        <MultiSelectFatturazione
                            setBody={setBodyFatturazione}
                            list={tipologie}
                            value={valueMulitselectTipologie}
                            setValue={setValueMultiselectTipologie}
                            clearOnChangeFilter={clearOnChangeFilter}
                        ></MultiSelectFatturazione>
                    </div>
                </div>
                <div className="row mt-5">
                    <div  className="col-3">
                        <MultiselectCheckbox 
                            setBodyGetLista={setBodyFatturazione}
                            dataSelect={dataSelect}
                            setTextValue={setTextValue}
                            valueAutocomplete={valueAutocomplete}
                            setValueAutocomplete={setValueAutocomplete}
                            clearOnChangeFilter={clearOnChangeFilter}
                        ></MultiselectCheckbox>
                    </div>
                </div>
                <div className="row mt-5">
                    <div  className="col-6">
                        <div className="d-flex">
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
                    <div className="col-6">
                        <div className="d-flex flex-row-reverse">
                            <Tooltip  className="mx-2" title="Invia fatture REL firmate">
                                <span>
                                    <Button   onClick={()=> navigate(PathPf.JSON_TO_SAP)   /* setOpenModalJson(true)*/}  variant="outlined"><IosShareIcon></IosShareIcon></Button>
                                </span>
                            </Tooltip>
                            <Tooltip  className="mx-2" title="Invia a SAP">
                                <span>
                                    <Button onClick={()=> onButtonSap(0)} disabled={disableButtonSap}  variant="outlined">  <PreviewIcon></PreviewIcon></Button>
                                </span>
                            </Tooltip>
                            <Tooltip  className="mx-2" title="Reset">
                                <span>
                                    <Button  onClick={()=> onButtonSap(1)} disabled={disableButtonReset} color="error"  variant="outlined"><RestartAltIcon></RestartAltIcon></Button>
                                </span>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
            <div className="marginTop24" style={{display:'flex', justifyContent:'end', height:"48px"}}>
                {
                    gridData.length > 0 &&
                        <>
                            { !bodyFatturazioneDownload.cancellata &&
                                <Button sx={{marginRight:'10px',width:'216px'}} onClick={() => downloadListaReportFatturazione()}
                                >
                Download Report
                                    <DownloadIcon sx={{marginLeft:'10px'}}></DownloadIcon>
                                </Button>
                            }
                            <Button sx={{width:'216px'}} onClick={() => downloadListaFatturazione()}
                            >
                Download Risultati
                                <DownloadIcon sx={{marginLeft:'10px'}}></DownloadIcon>
                            </Button>
                        </>
                }
            </div>
            <CollapsibleTable 
                data={gridData}
                headerNames={headersObjGrid}
                stato={bodyFatturazioneDownload.cancellata}
                setOpenConfermaModal={setOpenConfermaModal}
                setOpenResetFilterModal={setOpenResetFilterModal}
                monthFilterIsEqualMonthDownload={bodyFatturazione.mese === bodyFatturazioneDownload.mese}
                selected={fattureSelected}
                setSelected={setFattureSelected}
                updateFilters={updateFilters}
                pathPage={PathPf.FATTURAZIONE}
                body={{
                    body:bodyFatturazioneDownload,
                    textValue:textValue,
                    valueAutocomplete:valueAutocomplete,
                    valueMulitselectTipologie:valueMulitselectTipologie,
                    tipologie:tipologie,
                    fattureSelected:fattureSelected}}
                infoPageLocalStorage={{page:filters.page,rows:filters.rows}}
                firstRender={isInitialRender.current}
                upadateOnSelctedChange={upadateOnSelctedChange}
            ></CollapsibleTable>
            <div>
                <ModalLoading 
                    open={showLoadingGrid} 
                    setOpen={setShowLoadingGrid}
                    sentence={'Loading...'} >
                </ModalLoading>
                <ModalLoading 
                    open={showDownloading} 
                    setOpen={setShowDownloading}
                    sentence={'Downloading...'} >
                </ModalLoading>
            </div>
            <ModalSap
                open={openSapModal} 
                setOpen={setOpenSapModal}
                responseTipologiaSap={responseTipologieSap}
                mese={bodyFatturazioneDownload.mese}
                anno={bodyFatturazioneDownload.anno}
                dispatchMainState={dispatchMainState}
                getListaFatture={getlistaFatturazione}
                bodyFatturazioneDownload={bodyFatturazioneDownload}></ModalSap>
            <ModalConfermaRipristina 
                setOpen={setOpenConfermaModal}
                open={openConfermaModal}
                filterInfo={bodyFatturazioneDownload}
                onButtonComferma={sendCancellazzioneRispristinoFatture}
                fattureSelectedArr={fattureSelectedArr}></ModalConfermaRipristina>
            <ModalResetFilter
                setOpen={setOpenResetFilterModal}
                open={openResetFilterModal}
                filterInfo={bodyFatturazioneDownload}
                filterNotExecuted={bodyFatturazione}
                getListaFatture={getlistaFatturazione}></ModalResetFilter>
        </div>
    );
};

export default Fatturazione;