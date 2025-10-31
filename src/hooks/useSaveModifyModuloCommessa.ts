import { ReactNode, useRef, useState, ElementType } from "react";
import { ModuloCommessaType, Regioni, TotaleCommessa } from "../page/ente/moduloCommessaInserimentoUtEn30";
import { manageError, managePresaInCarico } from "../api/api";
import { ManageErrorResponse } from "../types/typesGeneral";
import { PathPf } from "../types/enum";
import { getCommessaObbligatoriListaV2, getCommessaObbligatoriVerificaV2, getDettaglioModuloCommessaV2, insertDatiModuloCommessaV2 } from "../api/apiSelfcare/moduloCommessaSE/api";
import { month } from "../reusableFunction/reusableArrayObj";
import { getDatiFatturazione } from "../api/apiSelfcare/datiDiFatturazioneSE/api";
import ErrorIcon from '@mui/icons-material/Error';
import { getModuloCommessaPagoPaV2, modifyDatiModuloCommessaPagoPaV2 } from "../api/apiPagoPa/moduloComessaPA/api";



function useSaveModifyModuloCommessa({
    token,
    profilo,
    apiRegioni,
    dispatchMainState,
    navigate,
    mainState,
    handleModifyMainState,
    setOpenBasicModal_DatFat_ModCom,
    whoInvokeHook,
    setErrorAlert
}) {

    const [openModalRedirect, setOpenModalRedirect] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [isEditAllow, setisEditAllow] = useState<boolean>(false);
    const [openModalLoading, setOpenModalLoading] = useState(false);
    const [openModalInfo, setOpenModalInfo] = useState<{open:boolean,sentence:string,buttonIsVisible?:boolean|null,labelButton?:string,actionButton?:()=>void,icon?:React.ElementType }>({open:false, sentence:''});
    const [dataObbligatori, setDataObbligatori] = useState(false);
    const [dataModuli, setDataModuli] = useState<ModuloCommessaType[]>([]);
    const [dataTotali, setDataTotali] = useState<TotaleCommessa[]>([]);
    const [steps, setSteps] = useState<string[]>([]);
    const [openModalAlert,setOpenModalAlert] = useState(false);
    const [isObbligatorioLayout, setIsObbligatorioLayout] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [skipped, setSkipped] = useState(new Set<number>());
    const [arrayRegioni, setArrayRegioni] = useState<Regioni[]>([]);
    const [arrayRegioniSelected, setArrayRegioniSelected] = useState<any[]>([]);
    const [profiloViewRegione, setProfiloViewRegione] = useState<number>(0);
    const [errorArRegioni, setErrorArRegioni] = useState(false);
    const [error890Regioni, setError890Regioni] = useState(false);
    const [errorAnyValueIsEqualNull, setErrorAnyValueIsEqualNull] = useState(false);
    const clickOnIndietroAvanti = useRef<string>();



    const getRegioni = async(regioniToHideDelete) => {
        await apiRegioni(token, profilo.nonce).then(async(res)=>{
            try{
                let arrayResult = await res.data.reduce((acc, regione) => {
                    const istatRegioneUsed = regione.istatRegione;
                    if(acc?.some(el => el?.istatRegione ===  istatRegioneUsed)){
                        return acc;
                    }else{
                        acc = [...acc,{regione:regione.regione,istatRegione:regione.istatRegione,890:null,ar:null}];
                    }        
                    return acc;
                }, []);
                arrayResult = arrayResult.filter(el => !regioniToHideDelete?.includes(el.istatRegione));
                setArrayRegioni(arrayResult);
                setArrayRegioniSelected([]);
                    
            }catch(err){
                console.log({err});
            }
        }).catch((err)=>{
            manageError(err,dispatchMainState);
        });
    };


    const handleGetDettaglioModuloCommessa = async () =>{
        setLoadingData(true);
        await getCommessaObbligatoriVerificaV2(token, profilo.nonce).then(async(res)=>{
                       
            if(res.data && Object.keys(mainState.infoTrimestreComSelected)?.length === 0){
                setIsObbligatorioLayout(res.data);
                await getCommessaObbligatoriListaV2(token, profilo.nonce).then((response)=>{
                    let obbligatori = response.data.lista;
                    obbligatori = obbligatori?.map(el => {
                        if(!el.valoriRegione){
                            el.valoriRegione = [];
                        }
                        return el;
                    });
               
                    setDataModuli(obbligatori);
                    setDataObbligatori(obbligatori.map(el => el.stato === null).flat().includes(true));
            
                    const stepsResult = obbligatori.map(el => month[el.meseValidita-1]);
                    setSteps(stepsResult);
            
                    //const completedResult = obbligatori.map((el,i) => ({[i+1]:el.stato !== null?true:false}));
                    //setStepCompleted(Object.assign({}, ...completedResult));
            
                    const activeStepResult = obbligatori.findIndex(item => item.stato === null);
                    setActiveStep(activeStepResult);
            
                    setisEditAllow(true);
                    handleModifyMainState({statusPageInserimentoCommessa:'mutable'});
                    setOpenBasicModal_DatFat_ModCom("mutable");
                             
                    setProfiloViewRegione(response.data.macrocategoriaVendita);
                    // setRegioniInsertIsVisible(response.data.macrocategoriaVendita === 3 || response.data.macrocategoriaVendita === 4);
            
                    //handleGetDettaglioModuloCommessaVecchio(obbligatori[activeStepResult].annoValidita,obbligatori[activeStepResult].meseValidita);
                    // passo al servizio regioni le regioni già presenti , la prima da eliminare dalla lista e le altre da valutare come inserite
                    if(obbligatori.length > 0){
                        const regioniToHideDelete = obbligatori[activeStepResult]?.valoriRegione.map(el => el.istatRegione);
                        getRegioni(regioniToHideDelete); 
                    }else{
                        getRegioni([]); 
                    }
                    
                    setLoadingData(false);
                }).catch(()=>{
                
                    managePresaInCarico('NO_INSERIMENTO_COMMESSA',dispatchMainState); 
                    navigate(PathPf.LISTA_COMMESSE);
                    setLoadingData(false);
                });
            }else{
                handleGetDettaglioModuloCommessaVecchio(mainState?.infoTrimestreComSelected?.annoCommessaSelectd,mainState?.infoTrimestreComSelected?.meseCommessaSelected);
                //const completedResult = mainState?.infoTrimestreComSelected?.moduli?.map((el,i) => ({[i+1]:el?.stato !== "--"?true:false}));
                     
                //setStepCompleted(Object.assign({}, ...completedResult));
                setActiveStep(Number(mainState.infoTrimestreComSelected.moduloSelectedIndex));
                const stepsResult = mainState.infoTrimestreComSelected.moduli.map(el => el.meseAnno.split('/')[0]||"");
                setSteps(stepsResult);  
            }
        });
    };
            
    const handleGetDettaglioModuloCommessaVecchio = async (year,month,isCallAfterSaveData = false) =>{
        setLoadingData(true);
        await getDettaglioModuloCommessaV2(token,year,month, profilo.nonce)
            .then((response:{data:any})=>{
               
                const res = response.data?.lista[0];
         
                if(!res.valoriRegione){
                    res.valoriRegione = [];
                }
             
                setDataModuli([res]);
                setDataTotali(response.data.totali);
                setDataObbligatori(false);
                //setIsNewCommessa(res.modifica && res.totale !== null);
                setLoadingData(false);
            
                // const variableRegioniIsVisible = (!res.modifica && (res.valoriRegione.length > 0 && res.valoriRegione[0]["890"] !== null || res.valoriRegione[0].ar !== null)) ||
                // res.modifica && res.valoriRegione.length > 0; 
                          
                //setRegioniInsertIsVisible(response.data.macrocategoriaVendita === 3 || response.data.macrocategoriaVendita === 4);
                const regioniToHideDelete = res.valoriRegione.map(el => el.istatRegione);
                getRegioni(regioniToHideDelete); 
                setProfiloViewRegione(response.data.macrocategoriaVendita);
                if(res?.source === "archiviato"){
                    setisEditAllow(false);
                }else if(res?.stato === null && res?.source !== "archiviato" && !isCallAfterSaveData){
                    setisEditAllow(true);
                }else if(res?.stato !== null && res?.source !== "archiviato" && !isCallAfterSaveData){
                    setisEditAllow(false);
                }else if(res?.source !== "archiviato" && isCallAfterSaveData){
                    setisEditAllow(false);
                }else if(!res.modifica){
                    setisEditAllow(false);
                }
            }).catch((err:ManageErrorResponse)=>{
                manageError(err,dispatchMainState);
                setLoadingData(false);
            });
    };

  

    const handleGetDettaglioModuloCommessaSendV2 = async (isCallAfterSaveData = false) => {
        setLoadingData(true);
        await getModuloCommessaPagoPaV2(token, profilo.nonce,mainState.infoTrimestreComSelected.idEnte, mainState.infoTrimestreComSelected.prodotto, mainState.infoTrimestreComSelected.idTipoContratto, mainState.infoTrimestreComSelected.meseCommessaSelected, mainState.infoTrimestreComSelected.annoCommessaSelectd)
            .then((response:any)=>{
              
                const res = response.data?.lista[0];
       
                setDataModuli([res]);
                setDataTotali(response.data.totali);
                setDataObbligatori(false);
                //setIsNewCommessa(res.modifica && res.totale !== null);
                setLoadingData(false);
            
                const regioniToHideDelete = res.valoriRegione.map(el => el.istatRegione);
                getRegioni(regioniToHideDelete); // sostituire con il servizio v2 pagopa
                setProfiloViewRegione(response.data.macrocategoriaVendita);
                if(res?.source === "archiviato"){
                    setisEditAllow(false);
                }else if(res?.stato === null && res?.source !== "archiviato" && !isCallAfterSaveData){
                    setisEditAllow(true);
                }else if(res?.stato !== null && res?.source !== "archiviato" && !isCallAfterSaveData){
                    setisEditAllow(false);
                }else if(res?.source !== "archiviato" && isCallAfterSaveData){
                    setisEditAllow(false);
                }else if(!res.modifica){
                    setisEditAllow(false);
                }
            }).catch((err:ManageErrorResponse)=>{
                manageError(err,dispatchMainState);
                setLoadingData(false);
            });
    };



    const hendleInsertModifyModuloCommessa = async () =>{
        setOpenModalLoading(true);
        const objectToSend:any[] = dataModuli.map((el:ModuloCommessaType) => {
            return {
                anno:el.annoValidita,
                mese:el.meseValidita,
                "moduliCommessa": [
                    {
                        "numeroNotificheNazionali": el.totaleNotificheAnalogicoARNaz||0,
                        "numeroNotificheInternazionali": el.totaleNotificheAnalogicoARInternaz||0,
                        "idTipoSpedizione": 1,
                        "totaleNotifiche": el.totaleNotificheAnalogico||0
                    },
                    {
                        "numeroNotificheNazionali": el.totaleNotificheAnalogico890Naz||0,
                        "numeroNotificheInternazionali": 0,
                        "idTipoSpedizione": 2,
                        "totaleNotifiche": el.totaleNotificheAnalogico890Naz||0
                    },
                    {
                        "numeroNotificheNazionali": el?.totaleNotificheDigitaleNaz||0,
                        "numeroNotificheInternazionali":el.totaleNotificheDigitaleInternaz||0,
                        "idTipoSpedizione": 3,
                        "totaleNotifiche": el.totaleNotificheDigitale||0
                    }
                ],
                "valoriRegione": el.valoriRegione
            };});
        if(whoInvokeHook === "ENTE"){
            await getDatiFatturazione(token,profilo.nonce).then(async( ) =>{ 
                await insertDatiModuloCommessaV2(objectToSend, token, profilo.nonce)
                    .then(async()=>{
                        setOpenModalLoading(false);
                        handleModifyMainState({statusPageInserimentoCommessa:'immutable'});
                        managePresaInCarico("SAVE_COMMESSA_OK",dispatchMainState);
                        if(isObbligatorioLayout){
                            navigate(PathPf.DATI_FATTURAZIONE);
                        }else{
                            await handleGetDettaglioModuloCommessaVecchio(activeCommessa.annoValidita,activeCommessa.meseValidita,true);
                        }
                    }).catch(err => {
                        handleModifyMainState({statusPageInserimentoCommessa:'immutable'});
                        setOpenModalLoading(false);
                        if(err.response.status === 500){
                            setErrorAlert({error:err.response.status,message:err.response.data.detail});
                            navigate(PathPf.LISTA_COMMESSE);
                        }else{
                            manageError(err,dispatchMainState);         
                        }
                    });
            }).catch(err =>{
                setOpenModalLoading(false);
                if(err.response.status === 404){
                    handleModifyMainState({datiFatturazione:false});
                    navigate(PathPf.DATI_FATTURAZIONE);
                }else{
                    manageError(err,dispatchMainState);
                }
            });
        }else if(whoInvokeHook === "SEND"){
            await modifyDatiModuloCommessaPagoPaV2(objectToSend,activeCommessa.idEnte,activeCommessa.idTipoContratto, token, profilo.nonce)
                .then(async()=>{
                    setOpenModalLoading(false);
                    managePresaInCarico("SAVE_COMMESSA_OK",dispatchMainState);
                    await handleGetDettaglioModuloCommessaSendV2(true);
                }).catch(err => {
                    setOpenModalLoading(false);
                    if(err.response.status === 500){
                        setErrorAlert({error:err.response.status,message:err.response.data.detail});
                        navigate(PathPf.LISTA_MODULICOMMESSA);
                    }else{
                        manageError(err,dispatchMainState);         
                    }
                });
        }               
    };
              
            
    const onIndietroButtonHeader = () =>{
        clickOnIndietroAvanti.current = "LISTA_MODULI";
        if(isEditAllow){
            setOpenModalAlert(true);
        }else{
            navigate(PathPf.LISTA_COMMESSE);
        }
    };

    const onIndietroButton = () =>{
        clickOnIndietroAvanti.current = "INDIETRO";
        if(activeStep > 0){
            if(isEditAllow && !isObbligatorioLayout){
                setOpenModalAlert(true);
            }else{
                indietroFunction();
            }
        }  
    };

    const indietroFunction = () => {
        if(!isObbligatorioLayout){
            handleGetDettaglioModuloCommessaVecchio(mainState.infoTrimestreComSelected?.moduli[activeStep-1]?.id.split('/')[1],mainState?.infoTrimestreComSelected?.moduli[activeStep-1]?.id.split('/')[0]);
            handleModifyMainState({statusPageInserimentoCommessa:'immutable'});
        }else{ 
            handleModifyMainState({statusPageInserimentoCommessa:'mutable'});
        }
        handleBack();  
        setErrorAnyValueIsEqualNull(false); 
    };

    const onAvantiButton = () =>{
        if(isAnyValueOfModuloEqualNull() && isEditAllow && isObbligatorioLayout){
            setErrorAnyValueIsEqualNull(true);
            setOpenModalInfo({
                open:true, 
                sentence:`Tutti i campi del modulo commessa vanno valorizzati, 0 è un valore ammesso.`,
                buttonIsVisible:false,icon:ErrorIcon
            });
        }else{
            clickOnIndietroAvanti.current = "AVANTI";
            if(isEditAllow && !isObbligatorioLayout){
                setOpenModalAlert(true);
            }else{
                avantiFunction();
            }
        }
    };

    const avantiFunction = () => {
        if(isAnyValueOfModuloEqualNull() && activeCommessa.source !== "archiviato"  && !openModalAlert && isEditAllow){
            setErrorAnyValueIsEqualNull(true);
        }else{
            if(activeStep < steps.length-1){
                if(!isObbligatorioLayout){
                
                    handleGetDettaglioModuloCommessaVecchio(mainState.infoTrimestreComSelected.moduli[activeStep+1].id.split('/')[1],mainState.infoTrimestreComSelected.moduli[activeStep+1].id.split('/')[0]);
                    handleNext();
                    handleModifyMainState({statusPageInserimentoCommessa:'immutable'});
                }else{
                    if(((coperturaAr||0) < 100 || (copertura890||0) < 100) && (profiloViewRegione === 3  || profiloViewRegione === 4)){
                        setOpenModalInfo({open:true, sentence:`La percentale di copertura NON raggiunge il 100%. Tramite dati ISTAT le notifiche restanti saranno integrate sulle regione italiane in base alla percentuale della Popolazione Residente.`,buttonIsVisible:true,labelButton:"Prosegui",actionButton:handleNext});
                    }else if(((coperturaAr||0) < 100 || (copertura890||0) < 100) && (profiloViewRegione === 1  || profiloViewRegione === 2)){
                        setOpenModalInfo({open:true, sentence:`La percentale di copertura NON raggiunge il 100%. Le notifiche restanti saranno integrate sulla regione di appartenenza.`,buttonIsVisible:true,labelButton:"Prosegui",actionButton:handleNext});
                    }else{
                        handleNext();
                    }  
                    handleModifyMainState({statusPageInserimentoCommessa:'mutable'});
                }
            }
            setErrorAnyValueIsEqualNull(false);
        }
    };
  
    const isStepSkipped = (step: number) => {
        return skipped.has(step);
    };

    const handleNext = () => {
        let newSkipped = skipped;
        if (isStepSkipped(activeStep)) {
            newSkipped = new Set(newSkipped.values());
            newSkipped.delete(activeStep);
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped(newSkipped);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };


    
    const onAddRegioniButton =  () => {
        const activeCommessa = dataModuli.length > 1 ? dataModuli[activeStep] : dataModuli[0];
        const activeCommessaIndex = dataModuli?.findIndex(el => el?.meseValidita === activeCommessa?.meseValidita);
        const regioniToAdd =  arrayRegioniSelected.map(singleId => {
            return  arrayRegioni.filter( el => el.istatRegione === singleId);
        });
        const restOfCommesse = dataModuli.filter(el => el?.meseValidita !== activeCommessa?.meseValidita);
        const updatedCommessa = {
            ...activeCommessa,
            valoriRegione:[...activeCommessa.valoriRegione,...regioniToAdd.flat()],
        };

        const regioneAlreadySelected = updatedCommessa.valoriRegione.map(el => el.istatRegione);
        if(regioneAlreadySelected.length > 0){
            getRegioni([...arrayRegioniSelected,...regioneAlreadySelected]);
        }else{
            getRegioni(arrayRegioniSelected);
        }

        setDataModuli([
            ...restOfCommesse.slice(0,activeCommessaIndex),
            updatedCommessa,
            ...restOfCommesse.slice(activeCommessaIndex)]);
    };

    const onDeleteSingleRegione = (id) => {
        const activeCommessa = dataModuli.length > 1 ? dataModuli[activeStep] : dataModuli[0];
        const activeCommessaIndex = dataModuli.findIndex(el => el.meseValidita === activeCommessa.meseValidita);
        const newRegioni = activeCommessa.valoriRegione.filter(el => el.istatRegione !== id);
        const restOfCommesse = dataModuli.filter(el => el.meseValidita !== activeCommessa.meseValidita);
        const updatedCommessa = {
            ...activeCommessa,
            valoriRegione:newRegioni,
        };
       
        
        const regioneAlreadySelected = updatedCommessa.valoriRegione.map(el => el.istatRegione);
        getRegioni(regioneAlreadySelected );

        setDataModuli([
            ...restOfCommesse.slice(0,activeCommessaIndex),
            updatedCommessa,
            ...restOfCommesse.slice(activeCommessaIndex)]);

        errorOnOver(newRegioni, updatedCommessa);
    };


    const onChangeModuloValue = (e,valueKey) => {
    
        const activeCommessa = dataModuli.length > 1 ? dataModuli[activeStep] : dataModuli[0];
        const restOfCommesse = dataModuli.filter(el => el.meseValidita !== activeCommessa?.meseValidita);
        const activeCommessaIndex = dataModuli.findIndex(el => el.meseValidita === activeCommessa?.meseValidita);
        const regioniActiveCommessa = activeCommessa?.valoriRegione;

        const updatedCommessa = {
            ...activeCommessa,
            [valueKey]:e.target.value === "" ? null : Number(e.target.value),
        };
     
        setDataModuli([
            ...restOfCommesse.slice(0,activeCommessaIndex),
            updatedCommessa,
            ...restOfCommesse.slice(activeCommessaIndex)]);
        
        if(e.target.value === "0"){
            let tipoNotifica = "";
            if(valueKey === "totaleNotificheAnalogicoARNaz"){
                tipoNotifica = "totaleAnalogicoARNaz";
                handleChangeTotale_Ar_890_regione(e,tipoNotifica,null,true);
            }else if(valueKey === "totaleNotificheAnalogico890Naz"){
                tipoNotifica = "totaleAnalogico890Naz";
                handleChangeTotale_Ar_890_regione(e,tipoNotifica,null,true);
            }
            
        }else{
            errorOnOver(regioniActiveCommessa,updatedCommessa);
        }
 
        
    };

    const handleChangeTotale_Ar_890_regione = (e, tipoNotifiche, element,isCallonChangeModuloValue=false) => {
        const value = e.target.value !== "" ? Number(e.target.value) : null;

        setDataModuli(prev => {
            const activeCommessaIndex = prev.length > 1 ? prev.findIndex(el => el.meseValidita === prev[activeStep].meseValidita): 0;

            const activeCommessa = prev[activeCommessaIndex];

            let updatedRegioni;

           
            if(isCallonChangeModuloValue){
                updatedRegioni = activeCommessa.valoriRegione.map(r =>{
                    return{ ...r,
                        ar: tipoNotifiche === "totaleAnalogicoARNaz" ? value : r.ar,
                        890: tipoNotifiche === "totaleAnalogico890Naz" ? value : r[890]
                    };
                }   
                );

            }else{
            // only update the specific regione
                updatedRegioni = activeCommessa.valoriRegione.map(r =>
                    r.istatRegione === element.istatRegione
                        ? {
                            ...r,
                            ar: tipoNotifiche === "totaleAnalogicoARNaz" ? value : r.ar,
                            890: tipoNotifiche === "totaleAnalogico890Naz" ? value : r[890],
                        }
                        : r
                );
            }

            const updatedCommessa = {
                ...activeCommessa,
                valoriRegione: updatedRegioni,
            };

            const newData = [...prev];
            newData[activeCommessaIndex] = updatedCommessa;
            // still call your validation
            errorOnOver(updatedRegioni, updatedCommessa);
            return newData;
        });
    };


    const errorOnOver = (newRegioni, newCommessa) => {
        const totAr = (newCommessa?.totaleNotificheAnalogicoARNaz||0);
        const tot890 = (newCommessa?.totaleNotificheAnalogico890Naz||0);
        const totArOnNewRegioni = newRegioni.reduce((acc, el) => acc + (el.ar||0), 0);
        const tot890OnNewRegioni = newRegioni.reduce((acc,el)=>  acc + (el[890]||0), 0);

        if(totArOnNewRegioni > totAr){
            !errorArRegioni && setErrorArRegioni(true);
        }else{
            errorArRegioni && setErrorArRegioni(false);
        }

        if(tot890OnNewRegioni > tot890){
            !error890Regioni && setError890Regioni(true);
        }else{
            error890Regioni && setError890Regioni(false);
        }
    };

    

    const onHandleSalvaModificaButton =  () => {
        try{
            if(isAnyValueOfModuloEqualNull() && isEditAllow){
           
                setErrorAnyValueIsEqualNull(true);
                setOpenModalInfo({
                    open:true, 
                    sentence:`Tutti i campi del modulo commessa vanno valorizzati, 0 è un valore ammesso.`,
                    buttonIsVisible:false,icon:ErrorIcon
                });
            }else{
           
                if(!isEditAllow){
                 
                    setisEditAllow(true);
                    handleModifyMainState({statusPageInserimentoCommessa:'mutable'});
                    setOpenBasicModal_DatFat_ModCom("mutable");
                }else{
                
                    if(((coperturaAr||0) < 100 || (copertura890||0) < 100) && (profiloViewRegione === 3  || profiloViewRegione === 4)){
                    
                        setOpenModalInfo({open:true, sentence:`La percentale di copertura NON raggiunge il 100%. Le notifiche restanti  saranno integrate sulle regioni Italiane in base allla percentuale di residenza fornite tramite dati ISTAT.`,buttonIsVisible:true,labelButton:"Prosegui",actionButton:hendleInsertModifyModuloCommessa});
                    }else if(((coperturaAr||0) < 100 || (copertura890||0) < 100) && (profiloViewRegione === 1  || profiloViewRegione === 2)){
                     
                        setOpenModalInfo({open:true, sentence:`La percentale di copertura NON raggiunge il 100%. Le notifiche restanti  saranno integrate sulla regione di appartenenza.`,buttonIsVisible:true,labelButton:"Prosegui",actionButton:hendleInsertModifyModuloCommessa});
                    }else{
                        hendleInsertModifyModuloCommessa();
                    }
                    setErrorAnyValueIsEqualNull(false);
                }
            } 
        }catch(err){
            console.log(err);
        }
        
    };

    const isAnyValueOfModuloEqualNull =  () => {
        return activeCommessa.totaleNotificheAnalogico890Naz === null
     || activeCommessa.totaleNotificheAnalogicoARInternaz === null 
     || activeCommessa.totaleNotificheAnalogicoARNaz === null 
     || activeCommessa.totaleNotificheDigitaleInternaz === null 
     || activeCommessa.totaleNotificheDigitaleNaz === null
     || activeCommessa.valoriRegione.filter(el => el.obbligatorio !== 1).map(el => el[890]).includes(null)
     || activeCommessa.valoriRegione.filter(el => el.obbligatorio !== 1).map(el => el.ar).includes(null);
    };
  
    const activeCommessa = dataModuli.length > 1 ? dataModuli[activeStep] : dataModuli[0];
    const coperturaAr = activeCommessa?.totaleNotificheAnalogicoARNaz === 0 ? 100 : ((activeCommessa?.totaleNotificheAnalogicoARNaz||0) > 0) ? (Math.round((activeCommessa?.valoriRegione.reduce((acc, el) => acc + (el.ar||0), 0)/(activeCommessa?.totaleNotificheAnalogicoARNaz||0))*100)): errorArRegioni ? null : ""; 
    const copertura890 = activeCommessa?.totaleNotificheAnalogico890Naz === 0 ? 100 : ((activeCommessa?.totaleNotificheAnalogico890Naz||0) > 0) ?  (Math.round((activeCommessa?.valoriRegione.reduce((acc, el) => acc + (el[890]||0), 0)/(activeCommessa?.totaleNotificheAnalogico890Naz||0))* 100)): error890Regioni ? null : "";  

    const coperturaArInseritaManualmente = activeCommessa?.totaleNotificheAnalogicoARNaz === 0 ? 100 : ((activeCommessa?.totaleNotificheAnalogicoARNaz||0) > 0) ? (Math.round((activeCommessa?.valoriRegione.filter(el => el.calcolato === 0).reduce((acc, el) => acc + (el.ar||0), 0)/(activeCommessa?.totaleNotificheAnalogicoARNaz||0))*100)): errorArRegioni ? null : ""; 
    const copertura890InseritaManualmente = activeCommessa?.totaleNotificheAnalogico890Naz === 0 ? 100 : ((activeCommessa?.totaleNotificheAnalogico890Naz||0) > 0) ?  (Math.round((activeCommessa?.valoriRegione.filter(el => el.calcolato === 0).reduce((acc, el) => acc + (el[890]||0), 0)/(activeCommessa?.totaleNotificheAnalogico890Naz||0))* 100)): error890Regioni ? null : "";  

        


    return{
        onIndietroButtonHeader,
        setOpenModalRedirect,
        getDettaglioEnte:handleGetDettaglioModuloCommessa,
        getDettaglioSend:handleGetDettaglioModuloCommessaSendV2,
        activeCommessa,
        isObbligatorioLayout,
        isEditAllow,
        activeStep,
        steps,
        dataObbligatori,
        onChangeModuloValue,
        errorAnyValueIsEqualNull,
        dataTotali,
        arrayRegioniSelected,
        setArrayRegioniSelected,
        arrayRegioni,
        onAddRegioniButton,
        errorArRegioni,
        handleChangeTotale_Ar_890_regione,
        error890Regioni,
        onDeleteSingleRegione,
        coperturaAr,
        dataModuli,
        copertura890,
        loadingData,
        onIndietroButton,
        onHandleSalvaModificaButton,
        onAvantiButton,
        openModalRedirect,
        setOpenModalInfo,
        openModalInfo,
        openModalLoading,
        setOpenModalLoading,
        openModalAlert,
        setOpenModalAlert,
        clickOnIndietroAvanti,
        avantiFunction,
        indietroFunction,
        coperturaArInseritaManualmente,
        copertura890InseritaManualmente
    };

}

export default useSaveModifyModuloCommessa;