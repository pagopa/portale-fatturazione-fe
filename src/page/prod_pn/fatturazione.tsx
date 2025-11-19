import { Autocomplete, Box, Button, Checkbox, FormControl, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { BodyFatturazione, FattureObj, TipologiaSap} from "../../types/typeFatturazione";
import { manageError, manageErrorDownload, managePresaInCarico } from "../../api/api";
import MultiselectCheckbox from "../../components/reportDettaglio/multiSelectCheckbox";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import { listaEntiNotifichePage } from "../../api/apiSelfcare/notificheSE/api";
import { useContext, useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { month } from "../../reusableFunction/reusableArrayObj";
import MultiSelectFatturazione from "../../components/fatturazione/multiSelect";
import PreviewIcon from '@mui/icons-material/Preview';
import ModalSap from "../../components/fatturazione/modalSap";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import IosShareIcon from '@mui/icons-material/IosShare';
import { useNavigate } from "react-router";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { GlobalContext } from "../../store/context/globalContext";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { PathPf } from "../../types/enum";
import { downloadFatturePagopa, downloadFattureReportPagopa, fattureCancellazioneRipristinoPagoPa, fattureTipologiaSapPa, getAnniDocEmessiPagoPa, getFatturazionePagoPa, getMesiDocEmessiPagoPa, getTipologieContratto, getTipologieFaPagoPa, getTipologieFaPagoPaWithData } from "../../api/apiPagoPa/fatturazionePA/api";
import { getMessaggiCount } from "../../api/apiPagoPa/centroMessaggi/api";
import CollapsibleTable from "../../components/reusableComponents/grid/gridCollapsible/gridCustomCollapsibleWithCheckbox";
import ModalConfermaRipristina from "../../components/fatturazione/modalConfermaRipristina";
import ModalResetFilter from "../../components/fatturazione/modalResetFilter";
import { headersObjGrid } from "../../assets/configurations/config_GridFatturazione";


const Fatturazione : React.FC = () =>{

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState, mainState,setCountMessages} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const callLista = useRef(true);
    const callAnnulla = useRef(false);
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
    const [dateTipologie, setDateTipologie] = useState<string[]>([]);
    const [valueMulitselectDateTipologie, setValueMultiselectDateTipologie] = useState<string[]>([]);
    const [arrayContratti, setArrayContratto] = useState<{id:number,descrizione:string}[]>([{id:0,descrizione:"Tutti"}]);
    
    const [bodyFatturazione, setBodyFatturazione] = useState<BodyFatturazione>({
        anno:0,
        mese:0,
        tipologiaFattura:[],
        idEnti:[],
        cancellata:false,
        idTipoContratto:null
    });

    const [bodyFatturazioneDownload, setBodyFatturazioneDownload] = useState<BodyFatturazione>({
        anno:0,
        mese:0,
        tipologiaFattura:[],
        idEnti:[],
        cancellata:false,
        idTipoContratto:null
    });

    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.FATTURAZIONE,{});

    useEffect(()=>{
        getAnni();
        getContratti(); 
    },[]);

    useEffect(()=>{
        if(bodyFatturazione.idEnti.length !== 0 || bodyFatturazione.tipologiaFattura.length !== 0 || bodyFatturazione.cancellata === true || bodyFatturazione.idTipoContratto !== null ){
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
        if(bodyFatturazione.anno !== 0 && bodyFatturazione.mese !== 0 && !isInitialRender.current){
            getDateTipologieFatturazione(bodyFatturazione);
            setValueMultiselectDateTipologie([]);
        }else if(isInitialRender.current && Object.keys(filters).length > 0){
            getDateTipologieFatturazione(filters.body);
        }else if(isInitialRender.current && bodyFatturazione.anno !== 0 && bodyFatturazione.mese !== 0){
            getDateTipologieFatturazione(bodyFatturazione);
        }
    },[bodyFatturazione]);
    
    const getAnni = async() => {
        setShowLoadingGrid(true);
        await getAnniDocEmessiPagoPa(token, profilo.nonce).then((res)=>{
            const arrayNumber = res.data.map(el => Number(el.toString()));
            setArrayYears(arrayNumber);
            if(isInitialRender.current && Object.keys(filters).length > 0){
                getMesi(filters.body.anno?.toString());
            }else{
                getMesi(res.data[0]);
            }   
        }).catch((err)=>{
            setArrayYears([]);
            setShowLoadingGrid(false);
            manageError(err,dispatchMainState);
        });
    };

    const getContratti = async() => {
        await getTipologieContratto(token, profilo.nonce).then((res)=>{
            setArrayContratto(prev => [...prev, ...res.data]);
        }).catch((err)=>{
            setArrayContratto([{id:0,descrizione:"Tutti"}]);
        });
    };
   
    const getMesi = async(year) =>{
        await getMesiDocEmessiPagoPa(token, profilo.nonce,{anno:year}).then((res)=>{    
            setArrayMonths(res.data);
            if(isInitialRender.current && Object.keys(filters).length > 0){
                setBodyFatturazione(filters.body);
                setBodyFatturazioneDownload(filters.body);
                setValueAutocomplete(filters.valueAutocomplete);
                setTextValue(filters.textValue);
                setValueMultiselectTipologie(filters.valueMulitselectTipologie);
                setFattureSelected(filters.fattureSelected);
                getlistaFatturazione(filters.body);
            }else{
                setBodyFatturazione({anno:Number(year),mese:res.data[0].mese, tipologiaFattura:[],cancellata:false,idEnti:[],idTipoContratto:null});
                getTipologieFatturazione(Number(year),Number(res.data[0]?.mese),false);
                setValueMultiselectTipologie([]);
                if(callLista.current){
                    getlistaFatturazione({...bodyFatturazione,...{anno:Number(year),mese:res.data[0].mese, tipologiaFattura:[],cancellata:false,idEnti:[],idTipoContratto:null}});
                }
               
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
            }).catch((()=>{
                setTipologie([]);
            }));
        isInitialRender.current = false;
    };

    const getDateTipologieFatturazione =  async(body) => {
        await getTipologieFaPagoPaWithData(token, profilo.nonce, body)
            .then((res)=>{
                const result = res.data.map((el)=>{
                    return el.tipologiaFattura+"-"+el.dataFattura?.split("T")[0];
                });
                setDateTipologie(result);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    setValueMultiselectDateTipologie(filters.valueMulitselectDateTipologie);
                }
            }).catch((()=>{
                setDateTipologie([]);
            }));
    };

    const getlistaFatturazione = async (body) => {
        setShowLoadingGrid(true);
        setDisableButtonSap(true);
        await  getFatturazionePagoPa(token,profilo.nonce,body).then((res)=>{

            let dataString = valueMulitselectDateTipologie.map(el =>  el.split("-").slice(1).join("-"));
            
            if(isInitialRender.current && Object.keys(filters).length > 0 ){
                dataString = filters?.valueMulitselectDateTipologie.map(el =>  el.split("-").slice(1).join("-"));
            }else if( callAnnulla.current){
                dataString = [];
            }
       
            let data; 
            if(dataString.length === 0){
                data = res.data.map(el => el?.fattura);
            }else{
                data = res.data.map(el => el?.fattura).filter(obj => dataString.includes(obj.dataFattura));
            }  
            setGridData(data);
            setShowLoadingGrid(false);
            setBodyFatturazioneDownload(body);
            callAnnulla.current = false;
        }).catch((error)=>{
            if(error?.response?.status === 404){
                setGridData([]);
            }
            setBodyFatturazioneDownload(body);
            setShowLoadingGrid(false);
            manageError(error, dispatchMainState);
            callAnnulla.current = false;
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
        }).catch(()=>{
            return;
        });
    };


    const sendCancellazzioneRispristinoFatture = async () =>{
        await fattureCancellazioneRipristinoPagoPa(token,profilo.nonce,{idFatture:fattureSelected,cancellazione:!bodyFatturazioneDownload.cancellata}).then(()=>{
            getlistaFatturazione(bodyFatturazioneDownload);
            managePresaInCarico('FATTURA_SOSPESA_RIPRISTINATA',dispatchMainState);
            getCount();
        }).catch((error)=>{
            getlistaFatturazione(bodyFatturazioneDownload);
            manageError(error, dispatchMainState);
        });      
    };

    const listaEntiNotifichePageOnSelect = async () =>{
        if(profilo.auth === 'PAGOPA'){
            await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue}).then((res)=>{
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
            manageErrorDownload('404',dispatchMainState);
        }));
    };

    const fattureSelectedArr = () =>{
        return fattureSelected.map((el)=>{
            return gridData.filter((obj:FattureObj) => obj.idfattura === el ).pop();
        });
    };
 

    const getTipologieFattureInvioSap = async(anno,mese) =>{
        await fattureTipologiaSapPa(token, profilo.nonce, {anno,mese} ).then((res)=>{
            const anableInvioSap = res.data?.filter((el)=> el.azione === 0).length;
            const anableReset = res.data?.filter((el)=> el.azione === 1).length;
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
            fattureSelected:fattureSelected,
            valueMulitselectTipologie:valueMulitselectTipologie,
            valueMulitselectDateTipologie:valueMulitselectDateTipologie,
            page:0,
            rows:10,
        });
        getlistaFatturazione(bodyFatturazione);
        callLista.current = true;
    };

    const onButtonAnnulla = () => {
        callAnnulla.current = true;
        resetFilters();
        getAnni();
        setBodyFatturazione({
            anno:arrayYears[0],
            mese:0,
            tipologiaFattura:[],
            idEnti:[],
            cancellata:false,
            idTipoContratto:null
        });
        setBodyFatturazioneDownload({
            anno:arrayYears[0],
            mese:0,
            tipologiaFattura:[],
            idEnti:[],
            cancellata:false,
            idTipoContratto:null
        });
        setDataSelect([]);
        setValueMultiselectTipologie([]);
        setValueAutocomplete([]);
        
    };
    
    const upadateOnSelctedChange = (page,rowsPerPage) =>{
        updateFilters({
            pathPage:PathPf.FATTURAZIONE,
            body:bodyFatturazione,
            textValue:textValue,
            valueAutocomplete,
            fattureSelected:fattureSelected,
            valueMulitselectTipologie:valueMulitselectTipologie,
            valueMulitselectDateTipologie:valueMulitselectDateTipologie,
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
                        <Box sx={{width:'80%'}}>
                            <FormControl fullWidth size="medium">
                                <InputLabel>
                            Anno   
                                </InputLabel>
                                <Select
                                    label='Seleziona Anno'
                                    onChange={(e) => {
                                        callLista.current = false;
                                        clearOnChangeFilter();  
                                        getMesi(e.target.value.toString());
                                        setDataSelect([]);
                                        setValueMultiselectTipologie([]);
                                        setValueAutocomplete([]);
                                    }}
                                    value={bodyFatturazione.anno||''}     
                                >
                                    {arrayYears.map((el) => (
                                        <MenuItem key={Math.random()} value={el}>
                                            {el}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                    <div  className="col-3">
                        <Box sx={{width:'80%', marginLeft:'20px'}}>
                            <FormControl fullWidth size="medium">
                                <InputLabel>
                                Mese   
                                </InputLabel>
                                <Select 
                                    label='Seleziona Prodotto'
                                    onChange={(e) =>{
                                        const value = Number(e.target.value);
                                        setBodyFatturazione((prev)=> ({...prev, ...{mese:value}}));
                                        clearOnChangeFilter();
                                        getTipologieFatturazione(bodyFatturazione.anno,value,bodyFatturazione.cancellata);
                                        setValueMultiselectTipologie([]);
                                    }}         
                                    value={bodyFatturazione.mese||''}
                                >
                                    {arrayMonths.map((el) => (
                                        <MenuItem key={Math.random()} value={el.mese}>
                                            {el.descrizione.charAt(0).toUpperCase() + el.descrizione.slice(1).toLowerCase()}
                                        </MenuItem>
                                    ))} 
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                    <div  className="col-3">
                        <FormControl sx={{width:'80%',marginLeft:'20px'}}>
                            <InputLabel>Stato</InputLabel>
                            <Select value={bodyFatturazione.cancellata ? 1 : 0}
                                label="Stato"
                                onChange={(e)=>{
                                    const value = e.target.value === 0 ? false : true;
                                    setBodyFatturazione((prev)=>({...prev,...{cancellata:value}}));
                                    getTipologieFatturazione(bodyFatturazione.anno,bodyFatturazione.mese,value);
                                    setValueMultiselectTipologie([]);
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
                    <div  className="col-3">
                        <Autocomplete
                            limitTags={1}
                            sx={{width:'80%',marginLeft:'20px',height:'59px'}}
                            multiple
                            onChange={(event, value) => {
                                setValueMultiselectDateTipologie(value);
                              
                                clearOnChangeFilter();
                            }}
                            options={dateTipologie}
                            value={valueMulitselectDateTipologie}
                            disableCloseOnSelect
                            getOptionLabel={(option:string) => option}
                            renderOption={(props, option,{ selected }) =>(
                                <li {...props}>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    {option}
                                </li>
                            )}
                            renderInput={(params) => {
                                return <TextField {...params}
                                    sx={{backgroundColor:"#F2F2F2"}}
                                    label="Data fattura" 
                                    placeholder="Data fattura" />;
                            }}     
                        />
                    </div>
                    <div  className="col-3">
                        <FormControl sx={{width:'80%',marginLeft:'20px'}}>
                            <InputLabel>Tipologia Contratto</InputLabel>
                            <Select value={bodyFatturazione.idTipoContratto !== null ? bodyFatturazione.idTipoContratto : 0}
                                label="Tipologia Contratto"
                                onChange={(e)=>{
                                    const value = Number(e.target.value) === 0 ? null : Number(e.target.value);
                                    setBodyFatturazione((prev)=>({...prev,...{idTipoContratto:value}}));
                                    clearOnChangeFilter();
                                }}
                            >
                                {arrayContratti?.map(el => {
                                    return  <MenuItem value={el.id}>{el.descrizione}</MenuItem>;
                                })}
                            </Select>
                        </FormControl>
                    </div>
                </div>
                <div className="row mt-5">
                    <div  className="col-6 mt-5">
                        <div className="d-flex">
                            <Button 
                                onClick={onButtonFiltra}  sx={{ marginTop: 'auto', marginBottom: 'auto'}} variant="contained"> 
                                Filtra
                            </Button>
                            {statusAnnulla === 'hidden' ? null :
                                <Button onClick={onButtonAnnulla}sx={{marginLeft:'24px'}} >
                   Annulla filtri
                                </Button>
                            }
                        </div>
                    </div>
                    <div className="col-6 mt-5">
                        <div className="d-flex flex-row-reverse">
                            <Tooltip  className="mx-2" title="Invia fatture REL firmate">
                                <span>
                                    <Button onClick={()=> navigate(PathPf.JSON_TO_SAP)}  variant="outlined"><IosShareIcon></IosShareIcon></Button>
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
                { gridData.length > 0 &&
                        <>
                            { !bodyFatturazioneDownload.cancellata &&
                                <Button sx={{marginRight:'10px',width:'216px'}} onClick={downloadListaReportFatturazione}
                                > Download Report<DownloadIcon sx={{marginLeft:'10px'}}></DownloadIcon>
                                </Button>
                            }
                            <Button sx={{width:'216px'}} onClick={downloadListaFatturazione}>
                                 Download Risultati<DownloadIcon sx={{marginLeft:'10px'}}></DownloadIcon>
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