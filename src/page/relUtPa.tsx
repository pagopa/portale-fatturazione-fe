import React, { useContext, useEffect, useState } from "react";
import SelectUltimiDueAnni from "../components/reusableComponents/select/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/select/selectMese";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import SelectTipologiaFattura from "../components/reusableComponents/select/selectTipologiaFattura";
import GridCustom from "../components/reusableComponents/grid/gridCustom";
import { BodyRel, Rel } from "../types/typeRel";
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";
import { manageError} from "../api/api";
import { useNavigate } from "react-router";
import DownloadIcon from '@mui/icons-material/Download';
import { downloadListaRel, getAnniRelSend, getListaRel, getMesiRelSend, getTipologieFatture} from "../api/apiSelfcare/relSE/api";
import { downloadListaRelPagopa, downloadListaRelPdfZipPagopa, downloadQuadraturaRelPagopa, downloadReportRelPagoPa, getAnniRel, getListaRelPagoPa, getMesiRel, getTipologieFatturePagoPa } from "../api/apiPagoPa/relPA/api";
import SelectStatoPdf from "../components/rel/selectStatoPdf";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { saveAs } from "file-saver";
import { PathPf } from "../types/enum";
import {profiliEnti} from "../reusableFunction/actionLocalStorage";
import { OptionMultiselectChackbox } from "../types/typeReportDettaglio";
import { mesiGrid, mesiWithZero } from "../reusableFunction/reusableArrayObj";
import { listaEntiNotifichePage } from "../api/apiSelfcare/notificheSE/api";
import ModalRedirect from "../components/commessaInserimento/madalRedirect";
import { GlobalContext } from "../store/context/globalContext";
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import useSavedFilters from "../hooks/useSaveFiltersLocalStorage";



const RelPage : React.FC = () =>{

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj;

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();
    const enti = profiliEnti(mainState);
 
   

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

  
  
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showLoading, setShowLoading] = useState(false);
    const [totalNotifiche, setTotalNotifiche]  = useState(0);
    const [dataSelect, setDataSelect] = useState([]);
    const [data, setData] = useState<Rel[]>([]);
    const [arrayYears,setArrayYears] = useState<number[]>([]);
    const [arrayMonths,setArrayMonths] = useState<{mese:string,descrizione:string}[]>([]);
    const [getListaRelRunning, setGetListaRelRunning] = useState(false);
    const [disableDownloadListaPdf, setDisableListaPdf] = useState(true);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [tipologiaFatture, setTipologiaFatture] = useState<string[]>([]);
    const [valuetipologiaFattura, setValueTipologiaFattura] = useState<string>('');
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
    const [bodyDownload, setBodyDownload] = useState<BodyRel>({
        anno:0,
        mese:0,
        tipologiaFattura:null,
        idEnti:[],
        idContratto:null,
        caricata:null
    });
    const [bodyRel, setBodyRel] = useState<BodyRel>({
        anno:0,
        mese:0,
        tipologiaFattura:null,
        idEnti:[],
        idContratto:null,
        caricata:null
    });
    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.LISTA_REL,{});

 

    useEffect(()=>{
        getAnni();
        /*
        if(isInitialRender.current && Object.keys(filters).length > 0){
         
            setBodyRel(filters.body);
            setTextValue(filters.textValue);
            setValueAutocomplete(filters.valueAutocomplete);
            getlista(filters.body,filters.page + 1, filters.rows);
            setPage(filters.page);
            setRowsPerPage(filters.rows);
            setBodyDownload(filters.body);
            getListTipologiaFattura(filters.body.anno,filters.body.mese);
        }else{
            const realPage = page + 1;
            getlista(bodyRel,realPage, rowsPerPage);
            getListTipologiaFattura(bodyRel.anno, bodyRel.mese);
            isInitialRender.current = false; 
      
        }*/
    },[]);

    useEffect(()=>{
        if(!isInitialRender.current){
            console.log('dentro');
            getListTipologiaFatturaOnChangeMonthYear(bodyRel.mese,bodyRel.anno);
        }
    },[bodyRel.mese]);

    useEffect(()=>{
        if(!isInitialRender.current){
            getMesi(bodyRel.anno?.toString());
        }
    },[bodyRel.anno]);
 
    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){
                listaEntiNotifichePageOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);

    useEffect(()=>{
        if((mainState.datiFatturazione === false || mainState.datiFatturazioneNotCompleted) && enti){
            setOpenModalRedirect(true);
        }
    },[]);

    const getAnni = async() => {
        
        if(enti && mainState.datiFatturazione === true){
            setGetListaRelRunning(true);
            await getAnniRelSend(token, profilo.nonce).then((res)=>{
                const arrayNumber = res.data.map(el => Number(el.toString()));
                setArrayYears(arrayNumber);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    getMesi(filters.body.anno?.toString());
                }else{
                    setBodyRel((prev)=> ({...prev,...{anno:Number(res.data[0])}}));
                    getMesi(res.data[0]);
                }
            }).catch((err)=>{
                setArrayYears([]);
                setGetListaRelRunning(false);
                manageError(err,dispatchMainState);
            });
        }else if(profilo.auth === 'PAGOPA'){
            setGetListaRelRunning(true);
            await getAnniRel(token, profilo.nonce).then((res)=>{
                const arrayNumber = res.data.map(el => Number(el.toString()));
                setArrayYears(arrayNumber);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    getMesi(filters.body.anno?.toString());
                }else{
                    setBodyRel((prev)=> ({...prev,...{anno:Number(res.data[0])}}));
                    getMesi(res.data[0]);
                    
                }
            }).catch((err)=>{
                setArrayYears([]);
                setGetListaRelRunning(false);
                manageError(err,dispatchMainState);
            });
        }
       
    };

    const getMesi = async(year) =>{
        
        if(enti && mainState.datiFatturazione === true){
            setGetListaRelRunning(true);
            await getMesiRelSend(token, profilo.nonce,{anno:year}).then((res)=>{
                setArrayMonths(res.data);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    getListTipologiaFattura(filters.body.anno,filters.body.mese);
                    setTextValue(filters.textValue);
                    setPage(filters.page);
                    setRowsPerPage(filters.rows);
                    setBodyDownload(filters.body);
                    setBodyRel(filters.body);
                    getlista(filters.body,filters.page + 1, filters.rows);
                }else if(isInitialRender.current){
                    setBodyRel((prev)=> ({...prev,...{mese:res.data[0].mese}}));
                    getListTipologiaFattura(year, res.data[0].mese);
                    getlista({...bodyRel,...{anno:year,mese:res.data[0].mese}},1,rowsPerPage);
                }else{
                    setBodyRel((prev)=> ({...prev,...{mese:res.data[0].mese}}));
                }
            }).catch((err)=>{
                setArrayMonths([]);
                setBodyRel((prev)=> ({...prev,...{mese:0}}));
                setGetListaRelRunning(false);
                manageError(err,dispatchMainState);
            });
        }else if(profilo.auth === 'PAGOPA'){
            setGetListaRelRunning(true);
            await getMesiRel(token, profilo.nonce,{anno:year}).then((res)=>{
                setArrayMonths(res.data);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    setTextValue(filters.textValue);
                    setValueAutocomplete(filters.valueAutocomplete);
                    getlista(filters.body,filters.page + 1, filters.rows);
                    setPage(filters.page);
                    setRowsPerPage(filters.rows);
                    setBodyDownload(filters.body);
                    getListTipologiaFattura(filters.body.anno,filters.body.mese);
                    setBodyRel(filters.body);
                }else if(isInitialRender.current){
                    setBodyRel((prev)=> ({...prev,...{mese:res.data[0].mese}}));
                    getListTipologiaFattura(year, res.data[0].mese);
                    getlista({...bodyRel,...{anno:year,mese:res.data[0].mese}},1,rowsPerPage);
                }else{
                    setBodyRel((prev)=> ({...prev,...{mese:res.data[0].mese}}));
                }
            }).catch((err)=>{
                setArrayMonths([]);
                setBodyRel((prev)=> ({...prev,...{mese:0}}));
                setGetListaRelRunning(false);
                manageError(err,dispatchMainState);
            });
        }
       
    };


    const getlista = async (bodyRel,nPage,nRows) => {
        console.log('zorro');
        if(enti && mainState.datiFatturazione === true){
            setGetListaRelRunning(true);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {idEnti, ...newBody} = bodyRel;
            await  getListaRel(token,profilo.nonce,nPage, nRows, newBody)
                .then((res)=>{
                    // ordino i dati in base all'header della grid
                    const orderDataCustom = res.data.relTestate.map((obj)=>{
                        // inserire come prima chiave l'id se non si vuol renderlo visibile nella grid
                        // 'id serve per la chiamata get dettaglio dell'elemento selezionato nella grid
                        return {
                            idTestata:obj.idTestata,
                            ragioneSociale:obj.ragioneSociale,
                            tipologiaFattura:obj.tipologiaFattura,
                            firmata:obj.firmata,
                            idContratto:obj.idContratto,
                            anno:obj.anno,
                            mese:mesiGrid[obj.mese],
                            totaleAnalogico:obj.totaleAnalogico.toLocaleString("de-DE", { style: "currency", currency: "EUR" }),
                            totaleDigitale:obj.totaleDigitale.toLocaleString("de-DE", { style: "currency", currency: "EUR" }),
                            totaleNotificheAnalogiche:obj.totaleNotificheAnalogiche,
                            totaleNotificheDigitali:obj.totaleNotificheDigitali,
                            totale:obj.totale.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
                        };
                    });
                    setData(orderDataCustom);
                    setTotalNotifiche(res.data.count);
                    setGetListaRelRunning(false);
                }).catch((error)=>{
                    if(error?.response?.status === 404){
                        setData([]);
                        setTotalNotifiche(0);
                    }
                    setGetListaRelRunning(false);
                    manageError(error, dispatchMainState);
                });
        }else if(profilo.auth === 'PAGOPA'){
            setGetListaRelRunning(true);
            await  getListaRelPagoPa(token,profilo.nonce,nPage, nRows, bodyRel).then((res)=>{
                // controllo che tutte le rel abbiano il pdf caricato, se TRUE abilito il button download
                const checkIfAllCaricata = res.data.relTestate.every(v => v.caricata === 1);
                setDisableListaPdf(checkIfAllCaricata);
                // ordino i dati in base all'header della grid
                const orderDataCustom = res.data.relTestate.map((obj)=>{
                    // inserire come prima chiave l'id se non si vuol renderlo visibile nella grid
                    // 'id serve per la chiamata get dettaglio dell'elemento selezionato nella grid
                    return {
                        idTestata:obj.idTestata,
                        ragioneSociale:obj.ragioneSociale,
                        tipologiaFattura:obj.tipologiaFattura,
                        firmata:obj.firmata,
                        idContratto:obj.idContratto,
                        anno:obj.anno,
                        mese:mesiGrid[obj.mese],
                        totaleAnalogico:obj.totaleAnalogico.toLocaleString("de-DE", { style: "currency", currency: "EUR" }),
                        totaleDigitale:obj.totaleDigitale.toLocaleString("de-DE", { style: "currency", currency: "EUR" }),
                        totaleNotificheAnalogiche:obj.totaleNotificheAnalogiche,
                        totaleNotificheDigitali:obj.totaleNotificheDigitali,
                        totale:obj.totale.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
                    };
                });
                setData(orderDataCustom);
                setTotalNotifiche(res.data.count);
                setGetListaRelRunning(false);
            }).catch((error)=>{
                if(error?.response?.status === 404){
                    setData([]);
                    setTotalNotifiche(0);
                }
                setGetListaRelRunning(false);
                manageError(error, dispatchMainState);
            });
        }     
        isInitialRender.current = false;       
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

    const clearOnChangeFilter = () => {
        setData([]);
        setTotalNotifiche(0);
        setPage(0);
        setRowsPerPage(10); 
    };

    const onButtonFiltra = () =>{
        updateFilters({
            pathPage:PathPf.LISTA_REL,
            body:bodyRel,
            textValue,
            valueAutocomplete:valueAutocomplete,
            page:0,
            rows:10,
            valuetipologiaFattura
        });
        setPage(0);
        setRowsPerPage(10);
        setBodyDownload(bodyRel);
        getlista(bodyRel,1,10); 
    };

    const onButtonAnnulla = async () => {
        let firstMonth = {mese:0};
        if(enti){
            firstMonth = await getMesiRelSend(token, profilo.nonce,{anno:arrayYears[0]?.toString()})
                .then(res => res.data[0])
                .catch(err => manageError(err,dispatchMainState));
        }else if(profilo.auth === 'PAGOPA'){
            firstMonth = await getMesiRel(token, profilo.nonce,{anno:arrayYears[0]?.toString()})
                .then(res => res.data[0])
                .catch(err => manageError(err,dispatchMainState));
        }
        setBodyRel({
            anno:arrayYears[0],
            mese:firstMonth.mese,
            tipologiaFattura:null,
            idEnti:[],
            idContratto:null,
            caricata:null
        });
        setBodyDownload({
            anno:arrayYears[0],
            mese:firstMonth.mese,
            tipologiaFattura:null,
            idEnti:[],
            idContratto:null,
            caricata:null
        });
        setValueTipologiaFattura('');
        setData([]);
        setPage(0);
        setRowsPerPage(10);
        setValueAutocomplete([]);
        getlista({
            anno:arrayYears[0],
            mese:firstMonth.mese,
            tipologiaFattura:null,
            idEnti:[],
            idContratto:null,
            caricata:null
        },1,10);
        resetFilters();
    
    };

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        const realPage = newPage + 1;
        getlista(bodyRel,realPage, rowsPerPage);
        setPage(newPage);
        updateFilters({
            pathPage:PathPf.LISTA_REL,
            body:bodyDownload,
            textValue,
            valueAutocomplete:valueAutocomplete,
            page:newPage,
            rows:rowsPerPage,
            valuetipologiaFattura
        });
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        const realPage = page + 1;
        getlista(bodyRel,realPage,parseInt(event.target.value, 10));
        updateFilters({
            pathPage:PathPf.LISTA_REL,
            body:bodyDownload,
            textValue,
            valueAutocomplete:valueAutocomplete,
            page:0,
            rows:parseInt(event.target.value, 10),
            valuetipologiaFattura
        });
    };
   
    const setIdRel = async(el) => {
        handleModifyMainState({relSelected:el});
        navigate(PathPf.PDF_REL);
    };  

    const getListTipologiaFattura = async(anno,mese) => {
        if(enti){
            await getTipologieFatture(token, profilo.nonce, {mese,anno}).then((res)=>{
                setTipologiaFatture(res.data);
                if(filters.valuetipologiaFattura){
                    setValueTipologiaFattura(filters.valuetipologiaFattura);
                }else{
                    setValueTipologiaFattura('');
                }
            }).catch((()=>{
                setTipologiaFatture([]);
                setValueTipologiaFattura("");
                // manageError(err,dispatchMainState);
            }));
        }else if(profilo.auth === 'PAGOPA'){
            await getTipologieFatturePagoPa(token, profilo.nonce, {mese,anno}).then((res)=>{
                setTipologiaFatture(res.data);
                if(filters.valuetipologiaFattura){
                    setValueTipologiaFattura(filters.valuetipologiaFattura);
                }else{
                    setValueTipologiaFattura('');
                } 
            }).catch((()=>{
                setTipologiaFatture([]);
                setValueTipologiaFattura("");
                // manageError(err,dispatchMainState);
            }));
        }
        
    };

    const getListTipologiaFatturaOnChangeMonthYear = async(mese,anno) => {
        if(enti){
            await getTipologieFatture(token, profilo.nonce, {mese,anno}).then((res)=>{
                setTipologiaFatture(res.data);
                setValueTipologiaFattura('');
                setBodyRel((prev)=>({...prev,...{tipologiaFattura:null}}));
                setBodyDownload((prev)=>({...prev,...{tipologiaFattura:null}}));
            }).catch((()=>{
                setTipologiaFatture([]);
                setValueTipologiaFattura('');
                setBodyRel((prev)=>({...prev,...{tipologiaFattura:null}}));
                setBodyDownload((prev)=>({...prev,...{tipologiaFattura:null}}));
               
                // manageError(err,dispatchMainState);
            }));
        }else if(profilo.auth === 'PAGOPA'){
            await getTipologieFatturePagoPa(token, profilo.nonce, {mese,anno}).then((res)=>{
                setTipologiaFatture(res.data);
                setValueTipologiaFattura('');
                setBodyRel((prev)=>({...prev,...{tipologiaFattura:null}}));
                setBodyDownload((prev)=>({...prev,...{tipologiaFattura:null}}));
            }).catch((()=>{
                setTipologiaFatture([]);
                setValueTipologiaFattura('');
                setBodyRel((prev)=>({...prev,...{tipologiaFattura:null}}));
                setBodyDownload((prev)=>({...prev,...{tipologiaFattura:null}}));
                // manageError(err,dispatchMainState);
            }));

        }
        setGetListaRelRunning(false);
    };

    const downloadListaRelExel = async() =>{
        setShowLoading(true);
        if(enti){
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {idEnti, ...newBody} = bodyDownload;
            await downloadListaRel(token,profilo.nonce,newBody).then((res)=>{
                saveAs("data:text/plain;base64," + res.data.documento,`Regolari esecuzioni/${data[0]?.ragioneSociale}/${mesiWithZero[bodyDownload.mese-1]}/${bodyDownload.anno}.xlsx` );
                setShowLoading(false);
            }).catch((err)=>{
                manageError(err,dispatchMainState);
            }); 
        }else{
            await downloadListaRelPagopa(token,profilo.nonce,bodyDownload).then((res)=>{
                let fileName = `Regolari esecuzioni/${mesiWithZero[bodyDownload.mese-1]}/${bodyDownload.anno}.xlsx`;
                if(bodyDownload.idEnti.length === 1){
                    fileName = `Regolari esecuzioni/${data[0]?.ragioneSociale}/${mesiWithZero[bodyDownload.mese-1]}/${bodyDownload.anno}.xlsx`;
                }
                saveAs("data:text/plain;base64," + res.data.documento,fileName );
                setShowLoading(false);
            }).catch((err)=>{
                manageError(err,dispatchMainState);
            }); 
        }
    };

    const downloadQuadratura = async() => {
        setShowLoading(true);
        downloadQuadraturaRelPagopa(token,profilo.nonce,bodyDownload).then((res)=>{
            let fileName = `Quadratura regolari esecuzioni/${mesiWithZero[bodyDownload.mese-1]}/${bodyDownload.anno}.xlsx`;
            if(bodyDownload.idEnti.length === 1){
                fileName = `Quadratura regolare esecuzione/${data[0]?.ragioneSociale}/${mesiWithZero[bodyDownload.mese-1]}/${bodyDownload.anno}.xlsx`;
            }
            saveAs("data:text/plain;base64," + res.data.documento,fileName );
            setShowLoading(false);
        }).catch((err)=>{
            setShowLoading(false);
            manageError(err,dispatchMainState);
        });  
    };
  
    const downloadListaPdfPagopa = async() =>{
        setShowLoading(true);
        await downloadListaRelPdfZipPagopa(token,profilo.nonce,bodyRel)
            .then(response => response.blob())
            .then(blob => {
                let fileName = `REL /Firmate/${mesiWithZero[bodyRel.mese -1]}/${bodyRel.anno}.zip`;
                if(bodyDownload.idEnti.length === 1){
                    fileName = `REL /Firmate/${data[0]?.ragioneSociale}/${mesiWithZero[bodyRel.mese -1]}/${bodyRel.anno}.zip`;
                }
                saveAs(blob,fileName );
                setShowLoading(false);
            })
            .catch(err => {
                manageError(err,dispatchMainState);
            });
    };



    const downloadReport = async () => {
        setShowLoading(true);
        await downloadReportRelPagoPa(token, profilo.nonce).then(response => response.blob()).then((res)=>{
            const fileName = `Report regolare esecuzione non fatturate.xlsx`;
            saveAs(res,fileName );
            setShowLoading(false);
        }).catch((err)=>{
            manageError(err,dispatchMainState);
            setShowLoading(false);
        });
    };

    


    const  hiddenAnnullaFiltri = bodyRel.tipologiaFattura === null && bodyRel.idEnti?.length === 0 && bodyRel.caricata === null; 
    return (
       
        <div className="mx-5">
            <div className="d-flex marginTop24 ">
                <div className="col-9">
                    <Typography variant="h4">Regolare Esecuzione</Typography>
                </div>
                <div className="col-3 ">
                    <Box sx={{width:'80%', marginLeft:'20px', display:'flex', justifyContent:'end'}}  >
                        <Button sx={{width:'250px'}} variant="contained"  onClick={()=> downloadReport()} >
                            <ArrowCircleDownIcon sx={{marginRight:'10px'}}></ArrowCircleDownIcon>
                    Report non fatturate
                        </Button>
                    </Box>
                </div>
               
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
                                        setBodyRel((prev)=> ({...prev, ...{anno:value}}));
                                    }}
                                    value={bodyRel.anno||''}     
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
                                    label='Mese'
                                    onChange={(e) =>{
                                        const value = Number(e.target.value);
                                        setBodyRel((prev)=> ({...prev, ...{mese:value}}));
                                        clearOnChangeFilter();
                                    }}         
                                    value={bodyRel.mese||''}             
                                >
                                    {arrayMonths.map((el) => (
                                        <MenuItem
                                            key={Math.random()}
                                            value={el.mese}
                                        >
                                            {el?.descrizione.charAt(0).toUpperCase() + el.descrizione.slice(1).toLowerCase()}
                                        </MenuItem>
                                    
                                    ))}
                                    
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                    <div  className="col-3">
                        <SelectTipologiaFattura value={valuetipologiaFattura} setBody={setBodyRel} setValue={setValueTipologiaFattura} types={tipologiaFatture} clearOnChangeFilter={clearOnChangeFilter}></SelectTipologiaFattura>
                    </div>
                    <div className="col-3">
                        <SelectStatoPdf values={bodyRel} setValue={setBodyRel} clearOnChangeFilter={clearOnChangeFilter}></SelectStatoPdf>
                    </div>
                </div>
                <div className="row mt-5">
                    { profilo.auth === 'PAGOPA' &&
                        <div  className="col-3">
                            <MultiselectCheckbox 
                                setBodyGetLista={setBodyRel}
                                dataSelect={dataSelect}
                                setTextValue={setTextValue}
                                valueAutocomplete={valueAutocomplete}
                                setValueAutocomplete={setValueAutocomplete}
                                clearOnChangeFilter={clearOnChangeFilter}
                            ></MultiselectCheckbox>
                        </div>
                    }
                </div>
                <div className="row mt-5">
                    <div className="col-1">
                        <Button
                            onClick={onButtonFiltra}
                            variant="contained"
                            disabled={getListaRelRunning}>Filtra</Button>
                    </div>
                    {!hiddenAnnullaFiltri && 
                    <div className="col-2">
                        <Button onClick={onButtonAnnulla} 
                            disabled={getListaRelRunning}
                        >Annulla Filtri</Button>
                    </div>
                    }
                </div>
                <div className="mt-5 mb-5">
                    { data.length > 0  &&
            <div className="marginTop24 d-flex d-flex justify-content-between">
                <div className="d-flex justify-content-start">
                    {profilo.auth === 'PAGOPA'&&
                   
                   <Button onClick={downloadQuadratura} >
                     Quadratura notifiche Rel 
                       <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                   </Button>  }
                </div>
                <div className="d-flex justify-content-end">
                    {profilo.auth === 'PAGOPA'&&
                   
                        <Button
                            disabled={getListaRelRunning  || !disableDownloadListaPdf}
                            onClick={downloadListaPdfPagopa}>
                                  Download documenti firmati 
                            <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                        </Button>
                   
                    }
                    <Button
                        disabled={getListaRelRunning}
                        onClick={downloadListaRelExel}  >
                                  Download risultati 
                        <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                    </Button>
                </div>            
            </div>
                    }    
                    <GridCustom
                        nameParameterApi='idTestata'
                        elements={data}
                        changePage={handleChangePage}
                        changeRow={handleChangeRowsPerPage} 
                        total={totalNotifiche}
                        page={page}
                        rows={rowsPerPage}
                        headerNames={['Ragione Sociale','Tipologia Fattura', 'Reg. Es. PDF','ID Contratto','Anno','Mese','Tot. Analogico','Tot. Digitale','Tot. Not. Analogico','Tot. Not. Digitali','Totale','']}
                        apiGet={setIdRel}
                        disabled={getListaRelRunning}></GridCustom>
                </div>
            </div>
            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading} 
                sentence={'Downloading...'}>
            </ModalLoading>
            <ModalRedirect
                setOpen={setOpenModalRedirect} 
                open={openModalRedirect}
                sentence={`Per poter visualizzare il dettaglio REL è obbligatorio fornire i seguenti dati di fatturazione:`}>
            </ModalRedirect>
            <ModalLoading 
                open={getListaRelRunning} 
                setOpen={setGetListaRelRunning} 
                sentence={'Loading...'}>
            </ModalLoading>
        </div>
    );
};

export default RelPage;
