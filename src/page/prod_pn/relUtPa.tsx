import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { profiliEnti,  } from "../../reusableFunction/actionLocalStorage";
import { OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import { downloadListaRel, getAnniRelSend, getListaRel, getMesiRelSend, getTipologieFatture } from "../../api/apiSelfcare/relSE/api";
import { mesiGrid, mesiWithZero } from "../../reusableFunction/reusableArrayObj";
import { downloadListaRelPagopa, downloadListaRelPdfZipPagopa, downloadQuadraturaRelPagopa, downloadReportRelPagoPa, getAnniRel, getListaRelPagoPa, getMesiRel, getTipologieContrattoRel, getTipologieFatturePagoPa } from "../../api/apiPagoPa/relPA/api";
import { listaEntiNotifichePage } from "../../api/apiSelfcare/notificheSE/api";
import { PathPf } from "../../types/enum";
import { saveAs } from "file-saver";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import ModalRedirect from "../../components/commessaInserimento/madalRedirect";
import { manageError, manageErrorDownload } from "../../api/api";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { Rel, BodyRel } from "../../types/typeRel";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { useGlobalStore } from "../../store/context/useGlobalStore";


const RelPage : React.FC = () =>{

    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();
    const enti = profiliEnti(mainState);
    let profilePath; 

    if(profilo.auth === 'PAGOPA'){
        profilePath = PathPf.PDF_REL;
    }else{
        profilePath = PathPf.PDF_REL_EN;
    }
 
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
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
    const [arrayContratti, setArrayContratto] = useState<{id:number,descrizione:string}[]>([{id:3,descrizione:"Tutti"}]);
    const [bodyDownload, setBodyDownload] = useState<BodyRel>({
        anno:"",
        mese:"",
        tipologiaFattura:null,
        idEnti:[],
        idContratto:null,
        caricata:null,
        idTipoContratto:null
    });
    const [bodyRel, setBodyRel] = useState<BodyRel>({
        anno:"",
        mese:"",
        tipologiaFattura:null,
        idEnti:[],
        idContratto:null,
        caricata:null,
        idTipoContratto:null
    });
    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(profilePath,{});

    useEffect(()=>{
        getAnni();
    },[]);

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
                    setBodyDownload((prev)=> ({...prev,...{anno:Number(res.data[0])}}));
                    getMesi(res.data[0]);
                }
            }).catch((err)=>{
                setArrayYears([]);
                setGetListaRelRunning(false);
                manageError(err,dispatchMainState);
            });
        }else if(profilo.auth === 'PAGOPA'){
            setGetListaRelRunning(true);
            await getContratti();
            await getAnniRel(token, profilo.nonce).then((res)=>{
                const arrayNumber = res.data.map(el => Number(el.toString()));
                setArrayYears(arrayNumber);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    getMesi(filters.body.anno?.toString());
                }else{
                    setBodyRel((prev)=> ({...prev,...{anno:Number(res.data[0])}}));
                    setBodyDownload((prev)=> ({...prev,...{anno:Number(res.data[0])}}));
                    getMesi(res.data[0]);
                    
                }
            }).catch((err)=>{
                setArrayYears([]);
                setGetListaRelRunning(false);
                manageError(err,dispatchMainState);
            });
        }
       
    };

    const getMesi = async(year, isCalledOnChangeMonth = false) =>{
        
        if(enti && mainState.datiFatturazione === true){
            setGetListaRelRunning(true);
            await getMesiRelSend(token, profilo.nonce,{anno:year}).then((res)=>{
                const mesiCamelCase = res.data.map(el => {
                    el.descrizione = el?.descrizione.charAt(0).toUpperCase() + el.descrizione.slice(1).toLowerCase();
                    return el;
                });
             
                setArrayMonths(mesiCamelCase);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    getListTipologiaFattura(filters.body.anno,filters.body.mese);
                    setTextValue(filters.textValue);
                    setPage(filters.page);
                    setRowsPerPage(filters.rows);
                    setBodyDownload(filters.body);
                    setBodyRel(filters.body);
                    setBodyDownload(filters.body);
                    getlista(filters.body,filters.page + 1, filters.rows);
                }else if(isInitialRender.current){
                    setBodyRel((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                    setBodyDownload((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                    getListTipologiaFattura(year, mesiCamelCase[0].mese);
                    getlista({...bodyRel,...{anno:year,mese:mesiCamelCase[0].mese}},1,rowsPerPage);
                }else if(isCalledOnChangeMonth){

                    getListTipologiaFattura(year,mesiCamelCase[0].mese);
                    setBodyRel((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                    setBodyDownload((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));

                }else{
                    setBodyRel((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                    setBodyDownload((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                   
                    setGetListaRelRunning(false);
                }
            }).catch((err)=>{
                setArrayMonths([]);
                setBodyRel((prev)=> ({...prev,...{mese:0}}));
                setBodyDownload((prev)=> ({...prev,...{mese:0}}));
                setGetListaRelRunning(false);
                manageError(err,dispatchMainState);
            });
        }else if(profilo.auth === 'PAGOPA'){
            setGetListaRelRunning(true);
            await getMesiRel(token, profilo.nonce,{anno:year}).then((res)=>{
                const mesiCamelCase = res.data.map(el => {
                    el.descrizione = el?.descrizione.charAt(0).toUpperCase() + el.descrizione.slice(1).toLowerCase();
                    return el;
                });
                
                setArrayMonths(mesiCamelCase);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    setTextValue(filters.textValue);
                    setValueAutocomplete(filters.valueAutocomplete);
                    getlista(filters.body,filters.page + 1, filters.rows);
                    setPage(filters.page);
                    setRowsPerPage(filters.rows);
                    setBodyDownload(filters.body);
                    getListTipologiaFattura(filters.body.anno,filters.body.mese);
                    setBodyRel(filters.body);
                    setBodyDownload(filters.body);
                }else if(isInitialRender.current ){
                
                    setBodyRel((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                    setBodyDownload((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                    getListTipologiaFattura(year, mesiCamelCase[0].mese);
                    getlista({...bodyRel,...{anno:year,mese:mesiCamelCase[0].mese}},1,rowsPerPage);
                }else if(isCalledOnChangeMonth){

                    getListTipologiaFattura(year,mesiCamelCase[0].mese);
                    setBodyRel((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                    setBodyDownload((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                }else{
                    setBodyRel((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                    setBodyDownload((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                    setGetListaRelRunning(false);
                }
            }).catch((err)=>{
                setArrayMonths([]);
                setBodyRel((prev)=> ({...prev,...{mese:0}}));
                setBodyDownload((prev)=> ({...prev,...{mese:0}}));
                setGetListaRelRunning(false);
                manageError(err,dispatchMainState);
            });
        }
       
    };

    const getContratti = async() => {
        await getTipologieContrattoRel(token, profilo.nonce).then((res)=>{
            setArrayContratto(prev => [...prev, ...res.data]);
        }).catch((err)=>{
            setArrayContratto([]);

        });
    };


    const getlista = async (bodyRel,nPage,nRows) => {

        if(enti && mainState.datiFatturazione === true){
            setGetListaRelRunning(true);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {idEnti,idTipoContratto, ...newBody} = bodyRel;
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
                        tipologiaContratto:obj?.tipologiaContratto,
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
            pathPage:profilePath,
            body:bodyRel,
            textValue,
            valueAutocomplete:valueAutocomplete,
            page:0,
            rows:10,
        });
        setPage(0);
        setRowsPerPage(10);
        setBodyDownload(bodyRel);
        getlista(bodyRel,1,10); 
    };

    const onButtonAnnulla = async () => {
        let res:{descrizione:string,mese:string}[] = [];
        if(enti){
            res = await getMesiRelSend(token, profilo.nonce,{anno:arrayYears[0]?.toString()})
                .then(res => res.data)
                .catch(err => manageError(err,dispatchMainState));
        }else if(profilo.auth === 'PAGOPA'){
            res = await getMesiRel(token, profilo.nonce,{anno:arrayYears[0]?.toString()})
                .then(res => res.data)
                .catch(err => manageError(err,dispatchMainState));
        }
        console.log(res);
        const mesiCamelCase = res.map(el => {
            el.descrizione = el?.descrizione.charAt(0).toUpperCase() + el.descrizione.slice(1).toLowerCase();
            return el;
        });
             
        setArrayMonths(mesiCamelCase);
        getListTipologiaFattura(arrayYears[0],Number(mesiCamelCase[0].mese));
   
        setBodyRel({
            anno:arrayYears[0],
            mese:Number(mesiCamelCase[0].mese),
            tipologiaFattura:null,
            idEnti:[],
            idContratto:null,
            caricata:null,
            idTipoContratto:null
        });
        setBodyDownload({
            anno:arrayYears[0],
            mese:Number(mesiCamelCase[0].mese),
            tipologiaFattura:null,
            idEnti:[],
            idContratto:null,
            caricata:null,
            idTipoContratto:null
        });
        setData([]);
        setPage(0);
        setRowsPerPage(10);
        setValueAutocomplete([]);
        getlista({
            anno:arrayYears[0],
            mese:Number(mesiCamelCase[0].mese),
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
            pathPage:profilePath,
            body:bodyDownload,
            textValue,
            valueAutocomplete:valueAutocomplete,
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
        getlista(bodyRel,realPage,parseInt(event.target.value, 10));
        updateFilters({
            pathPage:profilePath,
            body:bodyDownload,
            textValue,
            valueAutocomplete:valueAutocomplete,
            page:0,
            rows:parseInt(event.target.value, 10),
        });
    };
   
    const setIdRel = async(el) => {
        handleModifyMainState({relSelected:el});
        navigate(profilePath);
    };  

    const getListTipologiaFattura = async(anno,mese) => {
        if(enti){
            await getTipologieFatture(token, profilo.nonce, {mese,anno}).then((res)=>{
                setTipologiaFatture(res.data);
                if(!isInitialRender.current && Object.keys(filters).length > 0){
                    setBodyRel((prev)=>({...prev,...{tipologiaFattura:null}}));
                    setBodyDownload((prev)=>({...prev,...{tipologiaFattura:null}}));
                }
                setGetListaRelRunning(false);
            }).catch((()=>{
                setTipologiaFatture([]);
                setGetListaRelRunning(false);
                setBodyRel((prev)=>({...prev,...{tipologiaFattura:null}}));
                setBodyDownload((prev)=>({...prev,...{tipologiaFattura:null}}));
            }));
        }else if(profilo.auth === 'PAGOPA'){
            await getTipologieFatturePagoPa(token, profilo.nonce, {mese,anno}).then((res)=>{
                setTipologiaFatture(res.data);
                if(!isInitialRender.current){
                    setBodyRel((prev)=>({...prev,...{tipologiaFattura:null}}));
                    setBodyDownload((prev)=>({...prev,...{tipologiaFattura:null}}));
                } 
                setGetListaRelRunning(false);
            }).catch((()=>{
                setTipologiaFatture([]);
                setGetListaRelRunning(false);
                setBodyRel((prev)=>({...prev,...{tipologiaFattura:null}}));
                setBodyDownload((prev)=>({...prev,...{tipologiaFattura:null}}));
                // manageError(err,dispatchMainState);
            }));
        }
        isInitialRender.current = false; 
    };

    const downloadListaRelExel = async() =>{
        setShowLoading(true);
        if(enti){
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {idEnti,idTipoContratto, ...newBody} = bodyDownload;
            const customBody = bodyDownload.mese !== "" ? bodyDownload.mese : 0;
            await downloadListaRel(token,profilo.nonce,newBody).then((res)=>{
                saveAs("data:text/plain;base64," + res.data.documento,`Regolari esecuzioni/${data[0]?.ragioneSociale}/${mesiWithZero[customBody-1]}/${bodyDownload.anno}.xlsx` );
                setShowLoading(false);
            }).catch((err)=>{
                setShowLoading(false);
                manageError(err,dispatchMainState);
            }); 
        }else{
            await downloadListaRelPagopa(token,profilo.nonce,bodyDownload).then((res)=>{
                const customBody = bodyDownload.mese !== "" ? bodyDownload.mese : 0;
                let fileName = `Regolari esecuzioni/${mesiWithZero[customBody-1]}/${bodyDownload.anno}.xlsx`;
                if(bodyDownload.idEnti.length === 1){
                    fileName = `Regolari esecuzioni/${data[0]?.ragioneSociale}/${mesiWithZero[customBody-1]}/${bodyDownload.anno}.xlsx`;
                }
                saveAs("data:text/plain;base64," + res.data.documento,fileName );
                setShowLoading(false);
            }).catch((err)=>{
                setShowLoading(false);
                manageErrorDownload('404',dispatchMainState);
            }); 
        }
    };

    const downloadQuadratura = async() => {
        setShowLoading(true);
        downloadQuadraturaRelPagopa(token,profilo.nonce,bodyDownload).then((res)=>{
            const customBody = bodyDownload.mese !== "" ? bodyDownload.mese : 0;
            let fileName = `Quadratura regolari esecuzioni/${mesiWithZero[customBody-1]}/${bodyDownload.anno}.xlsx`;
            if(bodyDownload.idEnti.length === 1){
                fileName = `Quadratura regolare esecuzione/${data[0]?.ragioneSociale}/${mesiWithZero[customBody-1]}/${bodyDownload.anno}.xlsx`;
            }
            saveAs("data:text/plain;base64," + res.data.documento,fileName );
            setShowLoading(false);
        }).catch((err)=>{
            setShowLoading(false);
            if(err){
                manageErrorDownload('404',dispatchMainState);
            }
           
        });  
    };
  
    const downloadListaPdfPagopa = async() =>{
        setShowLoading(true);
        await downloadListaRelPdfZipPagopa(token,profilo.nonce,bodyRel)
            .then((response) => {
                if (response.ok) {
                    return response.blob();
                }
                setShowLoading(false);
                throw '404';
            }).then(blob => {
                const customBody = bodyDownload.mese !== "" ? bodyDownload.mese : 0;
                let fileName = `REL /Firmate/${mesiWithZero[customBody -1]}/${bodyRel.anno}.zip`;
                if(bodyDownload.idEnti.length === 1){
                    fileName = `REL /Firmate/${data[0]?.ragioneSociale}/${mesiWithZero[customBody -1]}/${bodyRel.anno}.zip`;
                }
                saveAs(blob,fileName );
                setShowLoading(false);
            }).catch(() => {
                manageErrorDownload('404',dispatchMainState);
            
            });
    };

    const downloadReport = async () => {
        setShowLoading(true);
        await downloadReportRelPagoPa(token, profilo.nonce).then((response) => {
            if (response.ok) {
                return response.blob();
            }
            throw '404';
        }).then((res)=>{
            const fileName = `Report regolare esecuzione non fatturate.xlsx`;
            saveAs(res,fileName );
            setShowLoading(false);
        }).catch(()=>{
            manageErrorDownload('404',dispatchMainState);
            setShowLoading(false);
        });
    };

    const statoPdf = [
        'Non Caricata',
        'Firmata',
        'Invalidata'
    ];


    let headerGridKeys = ['Ragione Sociale','Tipologia Fattura',"Tipo Contratto", 'Reg. Es. PDF','ID Contratto','Anno','Mese','Tot. Analogico','Tot. Digitale','Tot. Not. Analogico','Tot. Not. Digitali','Totale',''];
    if(profilo.auth !== "PAGOPA"){
        headerGridKeys = ['Ragione Sociale','Tipologia Fattura', 'Reg. Es. PDF','ID Contratto','Anno','Mese','Tot. Analogico','Tot. Digitale','Tot. Not. Analogico','Tot. Not. Digitali','Totale',''];
    }

    const  hiddenAnnullaFiltri = bodyRel.tipologiaFattura === null && bodyRel.idEnti?.length === 0 && bodyRel.caricata === null && bodyRel.idTipoContratto === null; 
    return (
        <MainBoxStyled title={"Regolare esecuzione / Documenti di cortesia"} actionButton={!enti ? [{
            onButtonClick: downloadReport,
            variant: "outlined",
            icon:{name:"circle_arrow_icon", sx:{} },
            withText:false,
            tooltipMessage:"Report regolare esecuzione non fatturate"
        }]:[]}>
            <ResponsiveGridContainer >
                <MainFilter 
                    filterName={"select_value_string"}
                    inputLabel={"Anno"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyRel}
                    body={bodyRel}
                    keyDescription={"anno"}
                    keyValue={"anno"}
                    keyBody={"anno"}
                    defaultValue={""}
                    arrayValues={arrayYears}
                    extraCodeOnChange={(e)=>{
                        const value = Number(e);
                        setBodyRel((prev)=> ({...prev, ...{anno:value}}));
                        getMesi(value.toString(),true);
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_key_value"}
                    inputLabel={"Mese"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyRel}
                    body={bodyRel}
                    keyValue={"mese"}
                    keyDescription='descrizione'
                    keyBody={"mese"}
                    arrayValues={arrayMonths}
                    extraCodeOnChange={(e)=>{
                        const value = Number(e);
                        setBodyRel((prev)=> ({...prev, ...{mese:value}})); 
                        getListTipologiaFattura(Number(bodyRel.anno),value);            
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_value_string"}
                    inputLabel={"Tipologia Fattura"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyRel}
                    body={bodyRel}
                    keyDescription={"tipologiaFattura"}
                    keyValue={"tipologiaFattura"}
                    keyBody={"tipologiaFattura"}
                    arrayValues={tipologiaFatture}
                    extraCodeOnChange={(e)=>{
                        setBodyRel((prev)=> ({...prev, ...{tipologiaFattura:e}}));
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_value"}
                    inputLabel={"Stato PDF Reg. Es."}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyRel}
                    body={bodyRel}
                    keyDescription={"caricata"}
                    keyValue={"caricata"}
                    keyBody={"caricata"}
                    arrayValues={statoPdf}
                    extraCodeOnChange={(e)=>{
                        const index = statoPdf.findIndex((option) => option === e);
                        setBodyRel((prev)=> ({...prev, ...{caricata:index}}));
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Rag. Soc. Ente"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyRel}
                    body={bodyRel}
                    dataSelect={dataSelect}
                    setTextValue={setTextValue}
                    textValue={textValue}
                    valueAutocomplete={valueAutocomplete}
                    setValueAutocomplete={setValueAutocomplete}
                    keyDescription={"descrizione"}
                    keyValue={"idEnte"}
                    keyBody={"idEnti"}
                    hidden={profilo.auth !== 'PAGOPA'}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_key_value"}
                    inputLabel={"Tipologia contratto"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyRel}
                    body={bodyRel}
                    keyDescription={"descrizione"}
                    keyBody={"idTipoContratto"}
                    keyValue={"id"}
                    arrayValues={arrayContratti}
                    defaultValue={"3"}
                    extraCodeOnChange={(e)=>{
                        const val = (Number(e) === 3) ? null : Number(e);
                        setBodyRel((prev)=>({...prev,...{idTipoContratto:val}}));
                    }}
                    hidden={profilo.auth !== 'PAGOPA'}
                ></MainFilter>
            </ResponsiveGridContainer>
            <FilterActionButtons 
                onButtonFiltra={onButtonFiltra} 
                onButtonAnnulla={onButtonAnnulla} 
                statusAnnulla={hiddenAnnullaFiltri ? "hidden":"show"} 
            ></FilterActionButtons>
            <ActionTopGrid
                actionButtonRight={profilo.auth === 'PAGOPA'?[{
                    onButtonClick:downloadListaPdfPagopa,
                    variant: "outlined",
                    label: "Download documenti firmati",
                    icon:{name:"download"},
                    disabled:(data.length === 0 || getListaRelRunning  || !disableDownloadListaPdf)
                },{
                    onButtonClick:downloadListaRelExel,
                    variant: "outlined",
                    label: "Download risultati",
                    icon:{name:"download"},
                    disabled:(data.length === 0||getListaRelRunning)
                }]: [{
                    onButtonClick:downloadListaRelExel,
                    variant: "outlined",
                    label: "Download risultati",
                    icon:{name:"download"},
                    disabled:(data.length === 0||getListaRelRunning)
                }]}
                actionButtonLeft={profilo.auth === 'PAGOPA'?[{
                    onButtonClick:downloadQuadratura,
                    variant: "outlined",
                    label: "Quadratura notifiche Rel",
                    icon:{name:"download"},
                    disabled:(data.length === 0||getListaRelRunning)
                }]:[]}/>
           
            <GridCustom
                nameParameterApi='idTestata'
                elements={data}
                changePage={handleChangePage}
                changeRow={handleChangeRowsPerPage} 
                total={totalNotifiche}
                page={page}
                rows={rowsPerPage}
                headerNames={headerGridKeys}
                apiGet={setIdRel}
                disabled={getListaRelRunning}
                widthCustomSize="2000px"/>
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
        </MainBoxStyled>
        
    );
};

export default RelPage;
