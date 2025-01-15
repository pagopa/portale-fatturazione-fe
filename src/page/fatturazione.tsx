import { Button, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { useContext, useEffect, useState } from "react";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import SelectUltimiDueAnni from "../components/reusableComponents/select/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/select/selectMese";
import { BodyFatturazione, FattureObj, HeaderCollapsible, TipologiaSap} from "../types/typeFatturazione";
import { downloadFatturePagopa, downloadFattureReportPagopa, fattureCancellazioneRipristinoPagoPa,fattureTipologiaSapPa, getFatturazionePagoPa, getTipologieFaPagoPa } from "../api/apiPagoPa/fatturazionePA/api";
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

const Fatturazione : React.FC = () =>{

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState, mainState,setCountMessages} = globalContextObj;

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const currentYear = (new Date()).getFullYear();
    const currentMonth = (new Date()).getMonth() + 1;
    const monthNumber = Number(currentMonth);

    const [gridData, setGridData] = useState<FattureObj[]>([]);
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
    
    const [bodyFatturazione, setBodyFatturazione] = useState<BodyFatturazione>({
        anno:currentYear,
        mese:monthNumber,
        tipologiaFattura:[],
        idEnti:[],
        cancellata:false
    });
    const [bodyFatturazioneDownload, setBodyFatturazioneDownload] = useState<BodyFatturazione>({
        anno:currentYear,
        mese:monthNumber,
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
            getlistaFatturazione(bodyFatturazione);
        }
    },[]);

    useEffect(()=>{
        if(!isInitialRender.current){
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
        }
       
    },[fattureSelected]);
    
    useEffect(()=>{
        if(bodyFatturazione.idEnti.length !== 0 || bodyFatturazione.tipologiaFattura.length !== 0 || bodyFatturazione.cancellata === true ){
            setStatusAnnulla('show');
        }else{
            setStatusAnnulla('hidden');
        }

        if(!isInitialRender.current){
            console.log('dentro1');
            setGridData([]);
            setFattureSelected([]);  
            setDisableButtonSap(true);
            setDisableButtonReset(true);
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
            console.log('pippo');
            getTipologieFatturazione(bodyFatturazione.anno,bodyFatturazione.mese,bodyFatturazione.cancellata);
            setValueMultiselectTipologie([]);
            // added 15/12
            setGridData([]);
            setDisableButtonSap(true);
            setDisableButtonReset(true);
        }
        // added 15/12
    },[bodyFatturazione.mese,bodyFatturazione.anno,bodyFatturazione.cancellata]);

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
        {name:"Data Fattura",align:"center",id:12}];


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
        getlistaFatturazione({
            anno:currentYear,
            mese:monthNumber,
            tipologiaFattura:[],
            idEnti:[],
            cancellata:false
        });
        setBodyFatturazione({
            anno:currentYear,
            mese:monthNumber,
            tipologiaFattura:[],
            idEnti:[],
            cancellata:false
        });
        setBodyFatturazioneDownload({
            anno:currentYear,
            mese:monthNumber,
            tipologiaFattura:[],
            idEnti:[],
            cancellata:false
        });
        setDataSelect([]);
        setValueMultiselectTipologie([]);
        setValueAutocomplete([]);
        resetFilters();
    };
  

    return (
        <div className="mx-5 mb-5">
            <div className="marginTop24 ">
                <Typography variant="h4">Documenti emessi</Typography>
            </div>
            <div className="mt-5">
                <div className="row">
                    <div className="col-3">
                        <SelectUltimiDueAnni values={bodyFatturazione} setValue={setBodyFatturazione}></SelectUltimiDueAnni>
                    </div>
                    <div  className="col-3">
                        <SelectMese values={bodyFatturazione} setValue={setBodyFatturazione}></SelectMese>
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
                               
                                    setBodyFatturazione((prev)=>({...prev,...{cancellata:value}}));}
                                }
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
                            <Button sx={{width:'216px'}} onClick={()=> onButtonSap(0)} disabled={disableButtonSap}  variant="outlined">Invia a SAP <PreviewIcon sx={{marginLeft:'20px'}}></PreviewIcon></Button>
                            <Button sx={{width:'216px',marginRight:'10px'}} onClick={()=> onButtonSap(1)} disabled={disableButtonReset} color="error"  variant="outlined">Reset <RestartAltIcon sx={{marginLeft:'20px'}}></RestartAltIcon></Button>
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