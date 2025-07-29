import {useState,useEffect, useContext, useRef} from 'react';
import {Typography, Button, Stepper, Step, Tooltip, IconButton,  Theme, Box, Skeleton, StepLabel, Grid, Chip, FormControl, InputLabel, MenuItem, OutlinedInput, Select, TextField} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked, theme } from '@pagopa/mui-italia';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useNavigate } from 'react-router';
import { GlobalContext } from '../../store/context/globalContext';
import { manageError } from '../../api/api';
import { getDatiFatturazione } from '../../api/apiSelfcare/datiDiFatturazioneSE/api';
import { getCommessaObbligatoriListaV2, getCommessaObbligatoriVerificaV2,  getDettaglioModuloCommessaV2, getRegioniModuloCommessa, insertDatiModuloCommessa, insertDatiModuloCommessaV2 } from '../../api/apiSelfcare/moduloCommessaSE/api';
import ModalRedirect from '../../components/commessaInserimento/madalRedirect';
import ModalConfermaInserimento from '../../components/commessaInserimento/modalConfermaInserimento';
import BasicModal from '../../components/reusableComponents/modals/modal';
import ModalLoading from '../../components/reusableComponents/modals/modalLoading';
import { month } from '../../reusableFunction/reusableArrayObj';
import { PathPf } from '../../types/enum';
import { ManageErrorResponse } from '../../types/typesGeneral';
import { ResponseDettaglioModuloCommessa,TotaleNazionaleInternazionale } from '../../types/typeModuloCommessaInserimento';
import PrimoContainerInsComTrimestrale from '../../components/commessaInserimentoTrimestrale/primoContainerTrimestrale';
import SecondoContainerTrimestrale from '../../components/commessaInserimentoTrimestrale/secondoContainerTrimestrale';
import TerzoContainerTrimestrale from '../../components/commessaInserimentoTrimestrale/terzoContainerTrimestrale';
import ModalAlert from '../../components/reusableComponents/modals/modalAlert';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import is from 'date-fns/esm/locale/is/index.js';
import ModalInfo from '../../components/reusableComponents/modals/modalInfo';


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};


function getStyles(name: string, personName: readonly string[], theme: Theme) {
    return {
        fontWeight: personName.includes(name)
            ? theme.typography.fontWeightMedium
            : theme.typography.fontWeightRegular,
    };
}

export interface ModuloCommessaType {
    modifica: boolean
    annoValidita: number
    meseValidita: number
    idEnte: string
    idTipoContratto: number
    stato: string|null
    prodotto: string|null
    totale: number|null
    dataInserimento: string|null
    dataChiusura: string
    totaleDigitaleNaz: number|null
    totaleDigitaleInternaz: number|null
    totaleAnalogicoARNaz: number|null
    totaleAnalogicoARInternaz: number|null
    totaleAnalogico890Naz: number|null
    totaleNotificheDigitaleNaz: number|null
    totaleNotificheDigitaleInternaz: number|null
    totaleNotificheAnalogicoARNaz: number|null
    totaleNotificheAnalogicoARInternaz: number|null
    totaleNotificheAnalogico890Naz: number|null
    totaleNotificheDigitale: number|null
    totaleNotificheAnalogico: number|null
    totaleNotifiche: number|null
    source: string
    quarter: string
    valoriRegione:Regioni[]
}

interface Regioni {
    890: null|number,
    ar: null,
    istatRegione:string,
    regione: string,
    istatProvincia: string,
    provincia: string,
    isRegione: 1
}

export interface PostModuloCommessa {
    anno: number
    mese: number
    moduliCommessa: NotificheModuliCommessaPost[]
    valoriRegioni: Regioni[]
}

export interface NotificheModuliCommessaPost {
    numeroNotificheNazionali: number
    numeroNotificheInternazionali: number
    idTipoSpedizione: number,
    totaleNotifiche: number
}


const ModuloCommessaInserimentoUtEn30 : React.FC = () => {
  
    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState,openBasicModal_DatFat_ModCom,setOpenBasicModal_DatFat_ModCom} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();
    
    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
   
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
   
    const [loadingData, setLoadingData] = useState(true);
  
    const [isEditAllow, setisEditAllow] = useState<boolean>(false);// cambiare a boolean|null
   
    const [openModalLoading, setOpenModalLoading] = useState(false);
    const [openModalInfo, setOpenModalInfo] = useState<{open:boolean,sentence:string,buttonIsVisible?:boolean|null,labelButton?:string,actionButton?:()=>void}>({open:false, sentence:''});
    //new logic__________________
    const [dataObbligatori, setDataObbligatori] = useState(false);
    const [dataModuli, setDataModuli] = useState<ModuloCommessaType[]>([]);
    //const [dataModuloToVisualize,setDataModuloToVisualize] = useState<ModuloCommessaType>();
    const [stepCompleted,setStepCompleted] = useState<{[k: number]: boolean}>({});
    //const [stepActive, setActiveStep] = useState<number>(0);
    const [steps, setSteps] = useState<string[]>([]);
   
    const [isNewCommessa, setIsNewCommessa] = useState(false);
    const [openModalAlert,setOpenModalAlert] = useState(false);
    const [isObbligatorioLayout, setIsObbligatorioLayout] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [skipped, setSkipped] = useState(new Set<number>());
    //const [regioniIsVisible, setRegioniIsVisible] = useState(false);//forse da eiminare
    const [regioniInsertIsVisible, setRegioniInsertIsVisible] = useState(false);
    const [arrayRegioni, setArrayRegioni] = useState<Regioni[]>([]);
    const [arrayRegioniSelected, setArrayRegioniSelected] = useState<any[]>([]);
    const [profiloViewRegione, setProfiloViewRegione] = useState<number>(0);

    const [errorArRegioni, setErrorArRegioni] = useState(false);
    const [error890Regioni, setError890Regioni] = useState(false);
  
    const clickOnIndietroAvanti = useRef<string>();
  



    useEffect(()=>{
        if(mainState.datiFatturazione === false){
            setOpenModalRedirect(true);
        }
    },[mainState.datiFatturazione]);

    useEffect(()=>{
        handleGetDettaglioModuloCommessa();
        localStorage.setItem('redirectToInsert',JSON.stringify(false));
    },[]);

   

    const getRegioni = async(regioniToHideDelete) => {
        await getRegioniModuloCommessa(token, profilo.nonce).then(async(res)=>{
            try{
                let arrayResult = await res.data.reduce((acc, regione) => {
                    const istatRegioneUsed = regione.istatRegione;
                    if(acc?.some(el => el?.istatRegione ===  istatRegioneUsed)){
                        return acc;
                    }else{
                        acc = [...acc,{regione:regione.regione,istatRegione:regione.istatRegione}];
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
            //RIMETTERE  setIsObbligatorioLayout(res.data);
           
            if(res.data && Object.keys(mainState.infoTrimestreComSelected)?.length === 0){
                setIsObbligatorioLayout(res.data);
                //setLoadingData(true);
                await getCommessaObbligatoriListaV2(token, profilo.nonce).then((response)=>{
                    const obbligatori = response.data.lista;
         
                    setDataModuli(obbligatori);
                    setDataObbligatori(obbligatori.map(el => el.stato === null).flat().includes(true));

                    const stepsResult = obbligatori.map(el => month[el.meseValidita-1]);
                    setSteps(stepsResult);

                    const completedResult = obbligatori.map((el,i) => ({[i+1]:el.stato !== null?true:false}));
                    setStepCompleted(Object.assign({}, ...completedResult));

                    const activeStepResult = obbligatori.findIndex(item => item.stato === null);
                    setActiveStep(activeStepResult);

                    setisEditAllow(true);
                    // setRegioniIsVisible(true);
                    setProfiloViewRegione(response.data.macrocategoriaVendita);
                    setRegioniInsertIsVisible(response.data.macrocategoriaVendita === 3 || response.data.macrocategoriaVendita === 4);

                    //handleGetDettaglioModuloCommessaVecchio(obbligatori[activeStepResult].annoValidita,obbligatori[activeStepResult].meseValidita);
                    // passo al servizio regioni le regioni già presenti , la prima da eliminare dalla lista e le altre da valutare come inserite
                    const regioniToHideDelete = dataModuli[activeStepResult]?.valoriRegione.map(el => el.istatRegione);
                    getRegioni(regioniToHideDelete); 
                    setLoadingData(false);
                }).catch((err:ManageErrorResponse)=>{
                    manageError(err,dispatchMainState);
                    setLoadingData(false);
                });
            }else{
                handleGetDettaglioModuloCommessaVecchio(mainState?.infoTrimestreComSelected?.annoCommessaSelectd,mainState?.infoTrimestreComSelected?.meseCommessaSelected);
                const completedResult = mainState?.infoTrimestreComSelected?.moduli?.map((el,i) => ({[i+1]:el?.stato !== "--"?true:false}));
         
                setStepCompleted(Object.assign({}, ...completedResult));
                setActiveStep(Number(mainState.infoTrimestreComSelected.moduloSelectedIndex));
                const stepsResult = mainState.infoTrimestreComSelected.moduli.map(el => el.meseAnno.split('/')[0]||"");
                setSteps(stepsResult);  
            }
        });
    };

    const handleGetDettaglioModuloCommessaVecchio = async (year,month) =>{
        setLoadingData(true);
        await getDettaglioModuloCommessaV2(token,year,month, profilo.nonce)
            .then((response:{data:any})=>{

                const res = response.data?.lista[0];
        
                console.log({ZORRO:res,response});
           
                setDataModuli([res]);
                setDataObbligatori(false);
            
                setIsNewCommessa(res.modifica && res.totale !== null);
                
                setLoadingData(false);

                const variableRegioniIsVisible = (!res.modifica && (res.valoriRegione.length > 0 && res.valoriRegione[0]["890"] !== null || res.valoriRegione[0].ar !== null)) ||
                                                res.modifica && res.valoriRegione.length > 0; 
                //setRegioniIsVisible(variableRegioniIsVisible);
                setRegioniInsertIsVisible(response.data.macrocategoriaVendita === 3 || response.data.macrocategoriaVendita === 4);
                const regioniToHideDelete = res.valoriRegione.map(el => el.istatRegione);
                getRegioni(regioniToHideDelete); 
                setProfiloViewRegione(response.data.macrocategoriaVendita);
                

            }).catch((err:ManageErrorResponse)=>{
                manageError(err,dispatchMainState);
                setLoadingData(false);
            });
    };
    console.log({dataModuli, isEditAllow});

    // Lato self care
    // chiamata per capire se i dati fatturazione sono stati inseriti
    // SI.... riesco ad inserire modulo commessa
    //No.... redirect dati fatturazione
    // tutto gestito sul button 'continua' in base al parametro datiFatturazione del main state
    //***********************************SECONDO ME LO POSSIAMO TOGLIERO O FARE UN CHECK VEDIAMO IN SEGUITO ***********************
    const getDatiFat = async () =>{
        await getDatiFatturazione(token,profilo.nonce).then(( ) =>{ 
            handleModifyMainState({
                datiFatturazione:true,
                statusPageInserimentoCommessa:'immutable'
            });
        }).catch(err =>{
            if(err.response.status === 404){
                handleModifyMainState({
                    datiFatturazione:false,
                    statusPageInserimentoCommessa:'immutable'});
            }else{
                manageError(err,dispatchMainState);
            }
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
        await insertDatiModuloCommessaV2(objectToSend, token, profilo.nonce)
            .then(()=>{
                setOpenModalLoading(false);
                setisEditAllow(false);
                if(isObbligatorioLayout){
                    navigate(PathPf.DATI_FATTURAZIONE);
                }
                
            } )
            .catch(err => {
                setisEditAllow(false);
                setOpenModalLoading(false);
                manageError(err,dispatchMainState); 
            });
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
            setisEditAllow(false);
        }else{ 
            setisEditAllow(true);
        }
        handleBack();   
    };

    const onAvantiButton = () =>{
        clickOnIndietroAvanti.current = "AVANTI";
        if(isEditAllow && !isObbligatorioLayout){
            setOpenModalAlert(true);
        }else{
            avantiFunction();
        }
    };

    const avantiFunction = () => {
        if(activeStep < steps.length-1){
            if(!isObbligatorioLayout){
                handleGetDettaglioModuloCommessaVecchio(mainState.infoTrimestreComSelected.moduli[activeStep+1].id.split('/')[1],mainState.infoTrimestreComSelected.moduli[activeStep+1].id.split('/')[0]);
                setisEditAllow(false);
                handleNext();
            }else{
                setisEditAllow(true);
                if((coperturaAr < 100 || copertura890 < 100) && (profiloViewRegione === 3  || profiloViewRegione === 4)){
                    setOpenModalInfo({open:true, sentence:'La percentuale di copertura delle  notifiche deve raggiungere il 100%'});
                }else if((coperturaAr < 100 || copertura890 < 100) && (profiloViewRegione === 1  || profiloViewRegione === 2)){
                    setOpenModalInfo({open:true, sentence:'La percentale di copertura non raggiunge il 100%. In questo caso la coperturà verrà completata in base alla percentuale di residenza sulle varie Regioni.',buttonIsVisible:true,labelButton:"Prosegui",actionButton:handleNext});
                }else{
                    handleNext();
                }
               
            }
           
        }
    };
  
    //DA UTILIZZARE CON GLI INSERIMENTI
    const isStepOptional = (step: number) => {
        const indexes = mainState.infoTrimestreComSelected?.moduli?.reduce((acc, obj, index) => {
            if (obj?.source === "facoltativo") acc?.push(index);
            return acc;
        }, []);
        return indexes?.includes(step);
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

    const handleSkip = () => {
        if (!isStepOptional(activeStep)) {
            // You probably want to guard against something like this,
            // it should never occur unless someone's actively trying to break something.
            throw new Error("You can't skip a step that isn't optional.");
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped((prevSkipped) => {
            const newSkipped = new Set(prevSkipped.values());
            newSkipped.add(activeStep);
            return newSkipped;
        });
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const onAddRegioniButton =  () => {
        const activeCommessa = dataModuli.length > 1 ? dataModuli[activeStep] : dataModuli[0];
        console.log({FFF:activeCommessa,activeStep});
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
    };

    const onChangeModuloValue = (e,valueKey) => {
       
        const activeCommessa = dataModuli.length > 1 ? dataModuli[activeStep] : dataModuli[0];
        const restOfCommesse = dataModuli.filter(el => el.meseValidita !== activeCommessa?.meseValidita);
        const activeCommessaIndex = dataModuli.findIndex(el => el.meseValidita === activeCommessa?.meseValidita);
        const regioniActiveCommessa = activeCommessa?.valoriRegione;

        const updatedCommessa = {
            ...activeCommessa,
            [valueKey]: Number(e.target.value),
        };

        setDataModuli([
            ...restOfCommesse.slice(0,activeCommessaIndex),
            updatedCommessa,
            ...restOfCommesse.slice(activeCommessaIndex)]);
        console.log({www:regioniActiveCommessa});
        errorOnOver(regioniActiveCommessa,updatedCommessa);
    };

    const handleChangeTotale_Ar_890_regione = (e, tipoNotifiche,istatRegione ) => {
        const activeCommessa = dataModuli.length > 1 ? dataModuli[activeStep] : dataModuli[0];
        const regioniActiveCommessa = activeCommessa?.valoriRegione;
        const restOfCommesse = dataModuli?.filter(el => el.meseValidita !== activeCommessa?.meseValidita);
        const restOfRegioni = regioniActiveCommessa?.filter(el => el.istatRegione !== istatRegione) || [];
        const regioneAlreadyExistBoolean = regioniActiveCommessa?.find(el => el.istatRegione === istatRegione);
        const regioneAlreadyExist = regioniActiveCommessa?.filter(el => el.istatRegione === istatRegione)[0];
        const originalIndex = regioniActiveCommessa?.findIndex(el => el.istatRegione === istatRegione);
        const activeCommessaIndex = dataModuli?.findIndex(el => el.meseValidita === activeCommessa?.meseValidita);
        let regioneToAdd; 
     
        if(regioneAlreadyExistBoolean){
            regioneToAdd = {
                "890": tipoNotifiche === "totaleAnalogico890Naz"  ?  Number(e.target.value||0) : Number(regioneAlreadyExist["890"]||0),
                "regione": regioneAlreadyExist?.regione,
                "istatRegione":regioneAlreadyExist?.istatRegione,
                "ar":tipoNotifiche === "totaleAnalogicoARNaz"  ? Number(e.target.value||0) :Number(regioneAlreadyExist?.ar||0)
            };
        }
       
        const valoriRegioneOrderedWithSameIndex = [
            ...restOfRegioni.slice(0, originalIndex),
            regioneToAdd,
            ...restOfRegioni.slice(originalIndex)
        ];

        const updatedCommessa = {
            ...activeCommessa,
            valoriRegione:valoriRegioneOrderedWithSameIndex,
        };
        setDataModuli([
            ...restOfCommesse.slice(0,activeCommessaIndex),
            updatedCommessa,
            ...restOfCommesse.slice(activeCommessaIndex)
        ]);
        //gestione errore regioni count
        errorOnOver([...restOfRegioni,regioneToAdd],updatedCommessa);
    };


    const errorOnOver = (newRegioni, newCommessa) => {
       
        const totAr = (newCommessa?.totaleNotificheAnalogicoARNaz||0);
        const tot890 = (newCommessa?.totaleNotificheAnalogico890Naz||0);

        const totArOnNewRegioni = newRegioni.reduce((acc, el) => acc + (el.ar||0), 0);
        const tot890OnNewRegioni = newRegioni.reduce((acc,el)=>  acc + (el[890]||0), 0);
        console.log({newRegioni,newCommessa,totAr,tot890,totArOnNewRegioni,tot890OnNewRegioni });
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
        console.log('mimmo');
        if(!isEditAllow){
            setisEditAllow(true);
        }else{
            if((coperturaAr < 100 || copertura890 < 100) && (profiloViewRegione === 3  || profiloViewRegione === 4)){
                setOpenModalInfo({open:true, sentence:'La percentuale di copertura delle  notifiche deve raggiungere il 100%'});
            }else if((coperturaAr < 100 || copertura890 < 100) && (profiloViewRegione === 1  || profiloViewRegione === 2)){
                setOpenModalInfo({open:true, sentence:'La percentale di copertura non raggiunge il 100%. In questo caso la coperturà verrà completata in base alla percentuale di residenza sulle varie Regioni.',buttonIsVisible:true,labelButton:"Prosegui",actionButton:hendleInsertModifyModuloCommessa});
            }
            
        }
    };

    const activeCommessa = dataModuli.length > 1 ? dataModuli[activeStep] : dataModuli[0];
    const coperturaAr = ((activeCommessa?.totaleNotificheAnalogicoARNaz||0) > 0) ? (Math.round((activeCommessa?.valoriRegione.reduce((acc, el) => acc + (el.ar||0), 0)/(activeCommessa?.totaleNotificheAnalogicoARNaz||0))*100)):0; 
    const copertura890 = ((activeCommessa?.totaleNotificheAnalogico890Naz||0) > 0) ?  (Math.round((activeCommessa?.valoriRegione.reduce((acc, el) => acc + (el[890]||0), 0)/(activeCommessa?.totaleNotificheAnalogico890Naz||0))* 100)):0; 
    
    let labelButtonAvantiListaModuliSave = "Modifica";
    if(isEditAllow && (isObbligatorioLayout && (activeStep+1 < steps.length))){
        labelButtonAvantiListaModuliSave = "Prosegui per salvare";
    }else if(isEditAllow){
        labelButtonAvantiListaModuliSave = "Salva";
    }else if(activeCommessa?.stato === null){
        labelButtonAvantiListaModuliSave = "Inserisci nuovo modulo commessa";
    }



    return (
        <>
            <BasicModal setOpen={setOpenBasicModal_DatFat_ModCom} open={openBasicModal_DatFat_ModCom} dispatchMainState={dispatchMainState} handleGetDettaglioModuloCommessa={handleGetDettaglioModuloCommessa}  mainState={mainState}></BasicModal>
            {/*Hide   modulo commessa sul click contina , save del modulo commessa cosi da mostrare dati fatturazione,
            il componente visualizzato è AreaPersonaleUtenteEnte  */}
           
            <div className="marginTop24 ms-5 me-5">
                <div className='d-flex'>
                    <ButtonNaked
                        color="primary"
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        onClick={() =>{
                            onIndietroButtonHeader();
                        }}
                    >
                        Indietro
                    </ButtonNaked>
                    <Typography sx={{ fontWeight:"bold", marginLeft:'20px'}} variant="caption">
                        <ViewModuleIcon sx={{paddingBottom:'3px'}}  fontSize='small'></ViewModuleIcon>
                         Modulo commessa 
                    </Typography>
                    {
                        dataObbligatori ? 
                            <Typography  variant="caption">/ Inserimento moduli commessa OBBLIGATORI</Typography> :
                            <Typography  variant="caption">/ Inserimento/modifica modulo commessa</Typography>
                    }
                </div>
               
                <div className='mt-5 mb-5'>
                    {steps.length > 1  && 
                    <Stepper activeStep={activeStep}>
                        {steps.map((label, index) => {
                            const stepProps: { completed?: boolean } = {};
                            const labelProps: {
                                optional?: React.ReactNode;
                            } = {};
                            if (isStepOptional(index)) {
                                labelProps.optional = (
                                    <Typography variant="caption">Facoltativo</Typography>
                                );
                            }
                            if (isStepSkipped(index)) {
                                stepProps.completed = false;
                            }
                            return (
                                <Step key={label} {...stepProps}>
                                    <StepLabel {...labelProps}>{label}</StepLabel>
                                </Step>
                            );
                        })}
                    </Stepper>
                    }
                </div>
               
                {loadingData ?  <Box
                    sx={{
                        padding:"24px",
                        height: '100vh'
                    }}
                >
                    <Skeleton variant="rectangular" height="100%" />
                </Box>: <>
                    <div>
                        {/*probabilmente possiamo eliminare il main state dai componenti qui sotto  */}
                        <div className="bg-white mt-3 pt-3">
                            <PrimoContainerInsComTrimestrale meseAnno={`${month[Number(activeCommessa?.meseValidita)-1]}/${activeCommessa?.annoValidita}`} tipoContratto={activeCommessa?.idTipoContratto === 1 ?  "PAL":"PAC"} />
                            {/* CAMBIARE LA PROP BUTTON MODIFICA*/}
                            <SecondoContainerTrimestrale  onChangeModuloValue={onChangeModuloValue }  dataModulo={activeCommessa} meseAnno={` ${month[Number( activeCommessa?.meseValidita )-1]}/${activeCommessa?.annoValidita}`}  modifica={isEditAllow} />
                        </div>
                        {(activeCommessa?.source === "archiviato") &&
                        <div className='bg-white'>
                            <TerzoContainerTrimestrale dataModulo={activeCommessa} dataModifica={activeCommessa?.dataInserimento} meseAnno={` ${month[Number(activeCommessa?.meseValidita)-1]}/${activeCommessa?.annoValidita}`}/>
                        </div>
                        }
                        {/*NEW CODE ______________________________*/}
                 
                        <>
                            <div className="bg-white mt-3 pt-3 ">
                                <Grid 
                                    container
                                    columns={12}>
                                    <Grid
                                        sx={{
                                            textAlign: 'left',
                                            borderColor: '#ffffff',
                                            borderStyle: 'solid',
                                        }}
                                        item
                                        xs={6}
                                    ></Grid>
                                    <Grid
                                        sx={{
                                            textAlign: 'left',
                                            borderColor: '#ffffff',
                                            borderStyle: 'solid',
                                        }}
                                        item
                                        xs={2}
                                    >
                                        <Typography sx={{fontWeight:'bold', textAlign:'center'}}>AR Nazionali </Typography>
                                    </Grid>
                                    <Grid
                                        sx={{
                                            textAlign: 'left',
                                            borderColor: '#ffffff',
                                            borderStyle: 'solid',
                                        }}
                                        item
                                        xs={2}
                                    >
                                        <Typography sx={{fontWeight:'bold', textAlign:'center'}}>890 Nazionali</Typography>
                                    </Grid>

                                </Grid>

                                <hr></hr>

                                <Grid
                                    sx={{ marginTop: '20px' }}
                                    container
                                    columns={12}>
                                    <Grid
                                        justifyContent="center"
                                        alignItems="center"  item  md={6}
                                    >
                                        <Typography sx={{fontWeight:'bold', textAlign:'right'}}>Totale Notifiche</Typography>
                                    </Grid>
                                    <Grid
                                        sx={{
                                            textAlign: 'center',
                                            borderColor: '#ffffff',
                                            borderStyle: 'solid',
                                        }}
                                        item
                                        xs={2}
                                    >
                                        <TextField
                                            sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                            disabled={true}
                                            size="small"
                                          
                                            value={dataModuli.length > 1 ? (dataModuli[activeStep]?.totaleNotificheAnalogicoARNaz||0):(dataModuli[0]?.totaleNotificheAnalogicoARNaz||0)}
                                            InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                        />
                                    </Grid>
                                    <Grid
                                        sx={{
                                            textAlign: 'center',
                                            borderColor: '#ffffff',
                                            borderStyle: 'solid',
                                        }}
                                        item
                                        xs={2}
                                    >
                                        <TextField
                                            sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                            disabled={true}
                                            size="small"
                                        
                                            value={dataModuli.length > 1 ?  (dataModuli[activeStep]?.totaleNotificheAnalogico890Naz||0) : (dataModuli[0]?.totaleNotificheAnalogico890Naz||0)}
                                            InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                        />
                                    </Grid>

                                </Grid>

                                <hr></hr>

                                <Grid
                                    sx={{ marginTop: '20px' }}
                                    container
                                    columns={12}>
                                    <Grid
                                        justifyContent="center"
                                        alignItems="center"  item  md={6}
                                    >
                                        <Typography sx={{fontWeight:'bold', textAlign:'right'}}>Percentuale copertura</Typography>
                                    </Grid>
                                    <Grid
                                        sx={{
                                            textAlign: 'center',
                                            borderColor: '#ffffff',
                                            borderStyle: 'solid',
                                        }}
                                        item
                                        xs={2}
                                    >
                                        <TextField
                                            sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                            disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                                            size="small"
                                            value={(coperturaAr||0) + "%"}
                                            InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                        />
                                    </Grid>
                                    <Grid
                                        sx={{
                                            textAlign: 'center',
                                            borderColor: '#ffffff',
                                            borderStyle: 'solid',
                                        }}
                                        item
                                        xs={2}
                                    >
                                        <TextField
                                            sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                            disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                                            size="small"
                                            value={(copertura890||0) + "%"}
                                            InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                        />
                                    </Grid>

                                </Grid>
                                <hr></hr>
                            </div>
                          
                            <div  className="bg-white mt-3 pt-3 ">
                                <Grid   container spacing={2}>
                                    <Grid item  md={6}>
                                        <FormControl sx={{ m: 1, width: "100%" }}>
                                            <InputLabel>Inserisci regioni</InputLabel>
                                            <Select
                                                disabled={!isEditAllow}
                                                multiple
                                                value={arrayRegioniSelected}
                                                onChange={(e:any)=> setArrayRegioniSelected(e.target.value)}
                                                input={<OutlinedInput label="Inserisci regioni" />}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value) => {
                                                        
                                                            const nameRegione  = arrayRegioni?.find(el => el.istatRegione === value)?.regione;
                                              
                                                            return <Chip key={value} label={nameRegione} />;
                                                        })}
                                                    </Box>
                                                )}
                                                MenuProps={MenuProps}
                                            >
                                                {arrayRegioni.map((el:Regioni) => (
                                                    <MenuItem
                                                        key={el.istatRegione}
                                                        value={el.istatRegione}
                                                        style={getStyles(el.regione, [], theme)}
                                                    >
                                                        {el.regione}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item  md={6}>
                                        <IconButton

                                            disabled={!isEditAllow}
                                            onClick={() => onAddRegioniButton()}
                                            aria-label="Edit"
                                            color="primary"
                                            size="large"
                                        ><AddIcon/>
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </div>
                        
                        
                            {/*creare un componente unico per le regioni_________________________________________________________________ */}
                            <div  className="bg-white mt-3 pt-3">
                                <Grid 
                                    container
                                    columns={12}>
                                    <Grid
                                        sx={{
                                            textAlign: 'left',
                                            borderColor: '#ffffff',
                                            borderStyle: 'solid',
                                        }}
                                        item
                                        xs={6}
                                    ></Grid>
                                    <Grid
                                        sx={{
                                            textAlign: 'left',
                                            borderColor: '#ffffff',
                                            borderStyle: 'solid',
                                        }}
                                        item
                                        xs={2}
                                    >
                                        <Typography sx={{fontWeight:'bold', textAlign:'center'}}>AR Nazionali </Typography>
                                    </Grid>
                                    <Grid
                                        sx={{
                                            textAlign: 'left',
                                            borderColor: '#ffffff',
                                            borderStyle: 'solid',
                                        }}
                                        item
                                        xs={2}
                                    >
                                        <Typography sx={{fontWeight:'bold', textAlign:'center'}}>890 Nazionali</Typography>
                                    </Grid>

                                </Grid>
                                <hr></hr>

                                {/*________________________________________________________ */}
                                <Grid 
                                    container
                                    columns={12}>
                                    <Grid
                                        sx={{
                                            display:"flex",
                                            justifyContent:"right",
                                            textAlign: 'right',
                                            borderColor: '#ffffff',
                                            borderStyle: 'solid',
                                        }}
                                        item
                                        xs={6}
                                    >
                                        <Typography variant='h4' sx={{fontWeight:'bold', textAlign:'center'}}>Regione {activeCommessa?.valoriRegione[0]?.regione}</Typography>
                                        <Tooltip title="Regione di appartenenza">
                                            <IconButton>
                                                <InfoIcon fontSize='medium' />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                    <Grid
                                        sx={{
                                            textAlign: 'center',
                                            borderColor: '#ffffff',
                                            borderStyle: 'solid',
                                        }}
                                        item
                                        xs={2}
                                    >
                                        <TextField
                                            sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                            error={errorArRegioni}
                                            disabled={!isEditAllow}
                                            onChange={(e)=>handleChangeTotale_Ar_890_regione(e,"totaleAnalogicoARNaz",dataModuli.length > 1 ? activeCommessa?.valoriRegione[0]?.istatRegione:activeCommessa?.valoriRegione[0]?.istatRegione)}
                                            size="small"
                                            value={dataModuli.length > 1 ? (activeCommessa?.valoriRegione[0]?.ar||0) : (activeCommessa?.valoriRegione[0]?.ar||0) }
                                            InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                        />
                                    </Grid>
                                    <Grid
                                        sx={{
                                            textAlign: 'center',
                                            borderColor: '#ffffff',
                                            borderStyle: 'solid',
                                        }}
                                        item
                                        xs={2}
                                    >
                                        <TextField
                                            sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                            error={error890Regioni}
                                            disabled={!isEditAllow}
                                            onChange={(e)=>handleChangeTotale_Ar_890_regione(e,"totaleAnalogico890Naz",dataModuli.length > 1 ? activeCommessa?.valoriRegione[0]?.istatRegione :  activeCommessa?.valoriRegione[0]?.istatRegione)}
                                            size="small"
                                            value={dataModuli.length > 1 ? (activeCommessa?.valoriRegione[0]["890"]||0):(activeCommessa?.valoriRegione[0]["890"]||0) }
                                            InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                        />
                                    </Grid>

                                </Grid>

                                {/*___________________________________________________________________*/}
                                <hr></hr>
                             
                                <div style={{overflowY: "auto", backgroundColor:'#F8F8F8'}}>
                                    {  activeCommessa?.valoriRegione.slice(1).length > 0 ? activeCommessa?.valoriRegione.slice(1).map((element:Regioni) => {
                                        return (
                                            <>
                                                <Grid 
                                                    key={element.istatRegione}
                                                    container
                                                    columns={12}>
                                                    <Grid
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "right", 
                                                            alignItems: "center",     
                                                        }}
                                                        item
                                                        xs={6}
                                                    >
                                                        <Typography variant='h4' sx={{fontWeight:'bold', textAlign:'center'}}>
                                                            {element.regione}</Typography>
                                                    </Grid>
                                                    <Grid
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "center", 
                                                            alignItems: "center",     
                                                        }}
                                                        item
                                                        xs={2}
                                                    >
                                                        <TextField
                                                            sx={{ backgroundColor: '#FFFFFF', width: '100px'}}
                                                            error={errorArRegioni}
                                                            disabled={!isEditAllow}
                                                            onChange={(e)=>handleChangeTotale_Ar_890_regione(e,"totaleAnalogicoARNaz",element.istatRegione)}
                                                            size="small"
                                                            value={element.ar}
                                                            InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                                        />
                                                    </Grid>
                                                    <Grid
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "center", 
                                                            alignItems: "center",     
                                                        }}
                                                        item
                                                        xs={2}
                                                    >
                                                        <TextField
                                                            sx={{ backgroundColor: '#FFFFFF', width: '100px'}}
                                                            error={error890Regioni}
                                                            disabled={!isEditAllow}
                                                            onChange={(e)=>handleChangeTotale_Ar_890_regione(e,"totaleAnalogico890Naz",element.istatRegione)}
                                                            size="small"
                                                            value={element[890]}
                                                            InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                                        />
                                                    </Grid>
                                                    {isEditAllow &&
                                                        <Grid container
                                                            justifyContent="center"
                                                            alignItems="center"
                                                            style={{ height: '80px' }} item md={2}>
                                                            <IconButton
                                                                onClick={() => onDeleteSingleRegione(element.istatRegione)}
                                                                aria-label="Delete"
                                                                sx={{color:"#FE6666"}}
                                                                size="large"
                                                            ><DeleteIcon/>
                                                            </IconButton>
                                                        </Grid>
                                                    }

                                                </Grid>
                                                 
                                                <hr></hr>
                                            </>
                                        );}):null}
                                </div>
                               
                                <hr></hr>
                            </div>
                        </>
                     
                    </div>   
                </> }  
            </div> 
          
            <div className="d-flex justify-content-between m-5 ">
                <div >
                    <Tooltip title={activeStep !== 0 && "Indietro"}>
                        <span>
                            <IconButton
                                size='large'
                                disabled={activeStep === 0}
                                onClick={onIndietroButton}> 
                                <ArrowBackIcon sx={{fontSize:"60px"}}/>
                            </IconButton>
                        </span>
                    </Tooltip>
                </div>
                {dataModuli.length > 0 && 
                <div>
                    {activeCommessa?.source === "archiviato"? null:<Button disabled={error890Regioni|| errorArRegioni|| (isObbligatorioLayout && (activeStep+1 < steps.length))} onClick={onHandleSalvaModificaButton} variant={labelButtonAvantiListaModuliSave === "Prosegui per salvare"? "text":"outlined"}>{labelButtonAvantiListaModuliSave}</Button>} 
                </div>
                }
                <div >
                    <Tooltip title={(activeStep+1) !== steps.length && "Avanti"}>
                        <span>
                            <IconButton
                                size='large'
                                disabled={(activeStep+1) === steps.length}
                                onClick={onAvantiButton}> 
                                <ArrowForwardIcon sx={{fontSize:"60px"}}/>
                            </IconButton>
                        </span>
                    </Tooltip>
                </div>
                    
            </div> 
            <ModalRedirect 
                setOpen={setOpenModalRedirect}
                open={openModalRedirect}
                sentence={`Per poter inserire il modulo commessa è obbligatorio fornire  i seguenti dati di fatturazione:`}></ModalRedirect>
            <ModalInfo 
                setOpen={setOpenModalInfo}
                open={openModalInfo}></ModalInfo>
            <ModalLoading open={openModalLoading} setOpen={setOpenModalLoading} sentence={'Loading...'}></ModalLoading>
            <ModalAlert open={openModalAlert} setOpen={setOpenModalAlert} handleAction={clickOnIndietroAvanti.current === "LISTA_MODULI" ? () => navigate(PathPf.LISTA_COMMESSE):clickOnIndietroAvanti.current === "AVANTI" ?avantiFunction:indietroFunction}></ModalAlert>
        </>
    );
};


export default ModuloCommessaInserimentoUtEn30;