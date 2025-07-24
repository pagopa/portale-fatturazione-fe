import {useState,useEffect, useContext} from 'react';
import {Typography, Button, Stepper, Step, Tooltip, IconButton,  Theme, Box, Skeleton, StepLabel, Grid, Chip, FormControl, InputLabel, MenuItem, OutlinedInput, Select, TextField} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked, theme } from '@pagopa/mui-italia';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useNavigate } from 'react-router';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { GlobalContext } from '../../store/context/globalContext';
import { manageError } from '../../api/api';
import { getDatiFatturazione } from '../../api/apiSelfcare/datiDiFatturazioneSE/api';
import { getCommessaObbligatoriListaV2, getCommessaObbligatoriVerificaV2, getDettaglioModuloCommessa, getDettaglioModuloCommessaV2, getRegioniModuloCommessa, insertDatiModuloCommessa } from '../../api/apiSelfcare/moduloCommessaSE/api';
import ModalRedirect from '../../components/commessaInserimento/madalRedirect';
import ModalConfermaInserimento from '../../components/commessaInserimento/modalConfermaInserimento';
import BasicModal from '../../components/reusableComponents/modals/modal';
import ModalLoading from '../../components/reusableComponents/modals/modalLoading';
import { calculateTot } from '../../reusableFunction/function';
import { month } from '../../reusableFunction/reusableArrayObj';
import { PathPf } from '../../types/enum';
import { ManageErrorResponse } from '../../types/typesGeneral';
import { DatiCommessa, ResponseDettaglioModuloCommessa, ResponsTotaliInsModuloCommessa, TotaleNazionaleInternazionale } from '../../types/typeModuloCommessaInserimento';
import PrimoContainerInsComTrimestrale from '../../components/commessaInserimentoTrimestrale/primoContainerTrimestrale';
import SecondoContainerTrimestrale from '../../components/commessaInserimentoTrimestrale/secondoContainerTrimestrale';
import TerzoContainerTrimestrale from '../../components/commessaInserimentoTrimestrale/terzoContainerTrimestrale';
import SaveIcon from '@mui/icons-material/Save';
import ModalAlert from '../../components/reusableComponents/modals/modalAlert';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { el } from 'date-fns/locale';
import RowInserimentoCommessaTrimestrale from '../../components/commessaInserimentoTrimestrale/rowInserimentoCommessaTrimestrale';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';



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
    const [totale, setTotale] = useState<TotaleNazionaleInternazionale>({totaleNazionale:0, totaleInternazionale:0, totaleNotifiche:0});
    const [dataMod, setDataModifica] = useState<string|null>('');// cambiare a boolean|null
   
    const [openModalLoading, setOpenModalLoading] = useState(false);
    const [openModalConfermaIns, setOpenModalConfermaIns] = useState(false);
    //new logic__________________
    const [dataObbligatori, setDataObbligatori] = useState(false);
    const [dataModuli, setDataModuli] = useState<ModuloCommessaType[]>([]);
    const [dataModuloToVisualize,setDataModuloToVisualize] = useState<ModuloCommessaType>();
    const [stepCompleted,setStepCompleted] = useState<{[k: number]: boolean}>({});
    //const [stepActive, setActiveStep] = useState<number>(0);
    const [steps, setSteps] = useState<string[]>([]);
    const [modificaCommessa,setModificaCommessa] = useState(false);
    const [isNewCommessa, setIsNewCommessa] = useState(false);
    const [openModalAlert,setOpenModalAlert] = useState(false);
    const [isObbligatorioLayout, setIsObbligatorioLayout] = useState(false);
    const [infoCommessa,setInfoCommessa] = useState({anno:"",mese:"",idTipoContratto:0,isEditable:false});
    const [activeStep, setActiveStep] = useState(0);
    const [skipped, setSkipped] = useState(new Set<number>());
    const [regioniIsVisible, setRegioniIsVisible] = useState(false);
    const [arrayRegioni, setArrayRegioni] = useState<Regioni[]>([]);
    const [arrayRegioniSelected, setArrayRegioniSelected] = useState<any[]>([]);

    const [errorArRegioni, setErrorArRegioni] = useState(false);
    const [error890Regioni, setError890Regioni] = useState(false);
    //const [arrayRegioniFromApiModCommessa , setArrayRegioniFromApiModCommessa] = useState<Regioni[]>([]);
  



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

                    //sistemare quando mauro ci darà l'api , probabilmente da eliminare questo state
                    setDataModuloToVisualize(obbligatori[activeStepResult]);
                    setDataModifica(null);
                    setRegioniIsVisible(response.data.macrocategoriaVendita === 1);

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
                setInfoCommessa({anno:res.annoValidita.toString(),mese:res.meseValidita.toString(),idTipoContratto:res.idTipoContratto,isEditable:res.modifica});
                console.log({ZORRO:res});
           
                setDataModuli([res]);
                setDataObbligatori(false);
            
                setDataModifica(res.dataInserimento);
                setIsNewCommessa(res.modifica && res.totale !== null);
                
                setLoadingData(false);

                const variableRegioniIsVisible = (!res.modifica && (res.valoriRegione.length > 0 && res.valoriRegione[0]["890"] !== null || res.valoriRegione[0].ar !== null)) ||
                                                res.modifica && res.valoriRegione.length > 0; 
                setRegioniIsVisible(variableRegioniIsVisible);
              
            }).catch((err:ManageErrorResponse)=>{
                manageError(err,dispatchMainState);
                setLoadingData(false);
            });
    };
    console.log({dataModuli});

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

    // funzione utilizzata con la response sul click modifica/insert modulo commessa , sia utente selcare che pagopa
    const toDoOnPostModifyCommessa = (res:ResponseDettaglioModuloCommessa) =>{
        if(mainState.inserisciModificaCommessa === 'MODIFY'){
            handleModifyMainState({
                statusPageInserimentoCommessa:'immutable',
                statusPageDatiFatturazione:'immutable',
            });
            setDataModifica(res.data.dataModifica);
            // aggiunta in seguito
            //setTotaliModuloCommessa(res.data.totale);
        }else{
            //setTotaliModuloCommessa(res.data.totale);
            setDataModifica(res.data.dataModifica);
            handleModifyMainState({
                statusPageInserimentoCommessa:'immutable',
                inserisciModificaCommessa:'MODIFY',
                mese:res.data.mese,
                anno:res.data.anno,
                primoInserimetoCommessa: false
            });
        
            navigate(PathPf.DATI_FATTURAZIONE);
        }  
    };
    /*
    const hendlePostModuloCommessa = async () =>{
        await insertDatiModuloCommessa(datiCommessa, token, profilo.nonce)
            .then(res =>{
                setOpenModalLoading(false);
                // setButtonMofica(true);
                toDoOnPostModifyCommessa(res);
            } )
            .catch(err => {
                setOpenModalLoading(false);
                manageError(err,dispatchMainState); 
            });
    };
*/
    const onButtonComfermaPopUp = () =>{
        setOpenModalLoading(true);
        // hendlePostModuloCommessa();
    };

    const OnButtonSalva = () =>{
        setOpenModalConfermaIns(true);
    };

    /*
    const hendleOnButtonModificaModuloCommessa = () => {
        handleModifyMainState({statusPageInserimentoCommessa:'mutable'});
        //setButtonMofica(false);
        setTotaliModuloCommessa([
            {
                idCategoriaSpedizione: 0,
                totaleValoreCategoriaSpedizione: 0
            },
            {
                idCategoriaSpedizione: 0,
                totaleValoreCategoriaSpedizione: 0
            }
        ]);
    };*/

    const onIndietroButtonHeader = () =>{
        if(mainState.statusPageInserimentoCommessa === 'immutable'){
            navigate(PathPf.LISTA_COMMESSE);
            // inserito con nuova logica modulo commessa trimestrale 
           
            //
            //da cambiare
        }else if(mainState.inserisciModificaCommessa === 'INSERT'){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:'INDIETRO_BUTTON'}}));
        }else if(mainState.inserisciModificaCommessa === 'MODIFY' && mainState.statusPageInserimentoCommessa === 'mutable' ){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:'INDIETRO_BUTTON'}}));
        }
    };

    const onIndietroButtonCommessa = () =>{
        /*da inserire in seguito
        const completedResult = response.data.map((el,i) => ({[i+1]:el.stato !== null?true:false}));
        setStepCompleted(Object.assign({}, ...completedResult));*/
        if(activeStep > 0){
            // const completedResult = response.data.map((el,i) => ({[i+1]:el.stato !== null?true:false}));
        //setStepCompleted({1:false,2:false});
        //sistemare quando mauro ci darà l'api , probabilmente da eliminare questo state
            if(isObbligatorioLayout){
                setDataModuloToVisualize(dataModuli[activeStep-1]);
                // handleGetDettaglioModuloCommessaVecchio(dataModuli[activeStep-1].annoValidita,dataModuli[activeStep-1].meseValidita);
            }else{
                setDataModuloToVisualize(mainState.infoTrimestreComSelected.moduli[activeStep-1]);
                handleGetDettaglioModuloCommessaVecchio(mainState.infoTrimestreComSelected?.moduli[activeStep-1]?.id.split('/')[1],mainState?.infoTrimestreComSelected?.moduli[activeStep-1]?.id.split('/')[0]);
            }
          
            //setLoadingData(false);
            handleBack();
        }  
    };

    const onAvantiButton = () =>{
        /*da inserire in seguito
        const completedResult = response.data.map((el,i) => ({[i+1]:el.stato !== null?true:false}));
        setStepCompleted(Object.assign({}, ...completedResult));*/
        if(activeStep < steps.length-1){
            // const completedResult = response.data.map((el,i) => ({[i+1]:el.stato !== null?true:false}));
        //setStepCompleted({1:false,2:false});
        //sistemare quando mauro ci darà l'api , probabilmente da eliminare questo state
            if(isObbligatorioLayout){
                setDataModuloToVisualize(dataModuli[activeStep+1]);
                //handleGetDettaglioModuloCommessaVecchio(dataModuli[activeStep+1].annoValidita,dataModuli[activeStep+1].meseValidita);
                //setLoadingData(false);
               
                setModificaCommessa(false);
            }else{
                //setDataModuloToVisualize(dataModuli[stepActive+1])
                handleGetDettaglioModuloCommessaVecchio(mainState.infoTrimestreComSelected.moduli[activeStep+1].id.split('/')[1],mainState.infoTrimestreComSelected.moduli[activeStep+1].id.split('/')[0]);
                //setLoadingData(false);
                setDataModuloToVisualize(dataModuli[activeStep]);
                setModificaCommessa(false);
            }
            handleNext();
        }
    };

    //DA UTILIZZARE CON GLI INSERIMENTI
    const isStepOptional = (step: number) => {
        return step === 10;
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
        const activeCommessa = dataModuli[activeStep];
        const activeCommessaIndex = dataModuli.findIndex(el => el.meseValidita === activeCommessa.meseValidita);
        const regioniToAdd =  arrayRegioniSelected.map(singleId => {

            return  arrayRegioni.filter( el => el.istatRegione === singleId);
        });
        const restOfCommesse = dataModuli.filter(el => el.meseValidita !== activeCommessa.meseValidita);
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
        const activeCommessa = dataModuli[activeStep];
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
       
        const activeCommessa = dataModuli[activeStep];
        const restOfCommesse = dataModuli.filter(el => el.meseValidita !== activeCommessa.meseValidita);
        const activeCommessaIndex = dataModuli.findIndex(el => el.meseValidita === activeCommessa.meseValidita);

        const updatedCommessa = {
            ...activeCommessa,
            [valueKey]: Number(e.target.value),
        };

        setDataModuli([
            ...restOfCommesse.slice(0,activeCommessaIndex),
            updatedCommessa,
            ...restOfCommesse.slice(activeCommessaIndex)]);
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
        /*else{
            regioneToAdd = {
                "890": tipoNotifiche === "totaleAnalogico890Naz" ?  Number(e.target.value) :null,
                "regione": regioneAlreadyExist?.regione,
                "istatRegione":regioneAlreadyExist?.istatRegione,
                "ar":tipoNotifiche === "totaleAnalogicoARNaz" ?  Number(e.target.value) :null
            };
        }*/
      
        console.log({restOfRegioni,regioneToAdd,regioneAlreadyExistBoolean});
        
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
        console.log({newRegioni});
        const totAr = (newCommessa.totaleAnalogicoARNaz||0);
        const tot890 = (newCommessa.totaleAnalogico890Naz||0);

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
        console.log('mimmo');
    };

    const activeCommessa = dataModuli.length > 1 ? dataModuli[activeStep] : dataModuli[0];

   
    const coperturaAr =  (Math.round((activeCommessa?.valoriRegione.reduce((acc, el) => acc + (el.ar||0), 0)/(activeCommessa?.totaleAnalogicoARNaz||0))*100)); 
   
    const copertura890 = (Math.round((activeCommessa?.valoriRegione.reduce((acc, el) => acc + (el[890]||0), 0)/(activeCommessa?.totaleAnalogico890Naz||0))  * 100)); 
    
    let labelButtonAvantiListaModuliSave = "Modifica";

    if((activeStep+1) === steps.length){
        labelButtonAvantiListaModuliSave = "Sava";
    }
    /*else if(!isObbligatorioLayout && activeStep === steps.length ){
        labelButtonAvantiListaModuliSave = "Lista moduli commessa";
    }*/


    dataModuli?.length-1 === activeStep && !isObbligatorioLayout ?
        "Lista Moduli commesse": dataModuli?.length-1 === activeStep && isObbligatorioLayout  ?"Salva":"Avanti";
  

    //_____________________________



    console.log({activeStep,dataModuli,mm:dataModuli[activeStep]});
   
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
                                    <Typography variant="caption">Optional</Typography>
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
                            <PrimoContainerInsComTrimestrale meseAnno={`${month[Number(isObbligatorioLayout ? dataModuli[activeStep].meseValidita : infoCommessa.mese)-1]}/${isObbligatorioLayout ? dataModuli[activeStep].annoValidita :infoCommessa.anno}`} tipoContratto={isObbligatorioLayout ? dataModuli[activeStep].idTipoContratto === 1 ?  "PAL":"PAC": infoCommessa.idTipoContratto === 1 ? "PAL":"PAC"} />
                            {/* CAMBIARE LA PROP BUTTON MODIFICA*/}
                            <SecondoContainerTrimestrale  onChangeModuloValue={onChangeModuloValue }  dataModulo={dataModuli[isObbligatorioLayout ? activeStep: 0]} meseAnno={` ${month[Number(isObbligatorioLayout ? dataModuli[activeStep].meseValidita : infoCommessa.mese)-1]}/${isObbligatorioLayout ? dataModuli[activeStep].annoValidita :infoCommessa.anno}`}  modifica={!modificaCommessa && !isNewCommessa && !isObbligatorioLayout} />
                        </div>
                        {(!isObbligatorioLayout && dataModuli[0].source === "archiviato") &&
                        <div className='bg-white'>
                            <TerzoContainerTrimestrale dataModulo={dataModuli[0]} dataModifica={dataMod} meseAnno={` ${month[Number(isObbligatorioLayout ? dataModuli[activeStep].meseValidita : infoCommessa.mese)-1]}/${isObbligatorioLayout ? dataModuli[activeStep].annoValidita :infoCommessa.anno}`}/>
                        </div>
                        }
                        {/*NEW CODE ______________________________*/}
                        {regioniIsVisible &&
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
                     
                            <div style={{paddingRight:"28px"}} className="bg-white my-3 py-3">
                                <Grid   container spacing={2}>
                                    <Grid item  md={6}>
                                        <FormControl sx={{ m: 1, width: "100%" }}>
                                            <InputLabel>Inserisci regioni</InputLabel>
                                            <Select
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
                            <div  style={{paddingRight:"28px"}}  className="bg-white mt-3 pt-3 pe-4">
                                <Grid   container spacing={2}>
                                    <Grid container  justifyContent="center"
                                        alignItems="center" style={{ height: '80px' }} item  md={6}>
                                        <Typography variant='h4' sx={{fontWeight:'bold', textAlign:'center'}}>Regione {dataModuli[activeStep]?.valoriRegione[0]?.regione}</Typography>
                                        <Tooltip title="Regione di appartenenza">
                                            <IconButton>
                                                <InfoIcon fontSize='medium' />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                    <Grid container
                                        justifyContent="center"
                                        alignItems="center"
                                        style={{ height: '80px' }} item  md={2}>
                                        <TextField
                                            sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                            error={errorArRegioni}
                                            onChange={(e)=>handleChangeTotale_Ar_890_regione(e,"totaleAnalogicoARNaz",dataModuli.length > 1 ? dataModuli[activeStep]?.valoriRegione[0]?.istatRegione:dataModuli[0]?.valoriRegione[0]?.istatRegione)}
                                            size="small"
                                            value={dataModuli.length > 1 ? (dataModuli[activeStep]?.valoriRegione[0]?.ar||0) : (dataModuli[0]?.valoriRegione[0]?.ar||0) }
                                            InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                        />
                                    </Grid>
                                    <Grid container
                                        justifyContent="center"
                                        alignItems="center"
                                        style={{ height: '80px' }} item md={2}>
                                        <TextField
                                            sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                            error={error890Regioni}
                                            onChange={(e)=>handleChangeTotale_Ar_890_regione(e,"totaleAnalogico890Naz",dataModuli.length > 1 ? dataModuli[activeStep]?.valoriRegione[0]?.istatRegione :  dataModuli[0]?.valoriRegione[0]?.istatRegione)}
                                            size="small"
                                            value={dataModuli.length > 1 ? (dataModuli[activeStep]?.valoriRegione[0]["890"]||0):(dataModuli[0]?.valoriRegione[0]["890"]||0) }
                                            InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                        />
                                    </Grid>
                                    
                                </Grid>
                                <hr></hr>
                                <Box   sx={{ backgroundColor:'#F8F8F8'}}>
                                    <Box style={{overflowY: "auto",maxHeight: "200px", backgroundColor:'#F8F8F8'}}>
                                        {  dataModuli[activeStep]?.valoriRegione.slice(1).length > 0 ? dataModuli[activeStep]?.valoriRegione.slice(1).map((element:Regioni) => {
                                            return (
                                                <div key={element.istatRegione}>
                                                    <Grid container spacing={2}>
                                                        <Grid container  justifyContent="center"
                                                            alignItems="center" style={{ height: '80px' }} item  md={6}>
                                                            <Typography variant='h4' sx={{fontWeight:'bold', textAlign:'center'}}>
                                                                {element.regione}</Typography>
                                                        </Grid>
                                                        <Grid container
                                                            justifyContent="center"
                                                            alignItems="center"
                                                            style={{ height: '80px' }} item  md={2}>
                                                            <TextField
                                                                sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                                                error={errorArRegioni}
                                                                onChange={(e)=>handleChangeTotale_Ar_890_regione(e,"totaleAnalogicoARNaz",element.istatRegione)}
                                                                size="small"
                                                                value={element.ar}
                                                                InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                                            />
                                                        </Grid>
                                                        <Grid container
                                                            justifyContent="center"
                                                            alignItems="center"
                                                            style={{ height: '80px' }} item md={2}>
                                                            <TextField
                                                                sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                                                error={error890Regioni}
                                                                onChange={(e)=>handleChangeTotale_Ar_890_regione(e,"totaleAnalogico890Naz",element.istatRegione)}
                                                                size="small"
                                                                value={element[890]}
                                                                InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                                            />
                                                        </Grid>
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
                                                        
                                                    </Grid>
                                                    <hr></hr>
                                                </div>
                                            );}):null}
                                    </Box>
                                </Box>
                                <hr></hr>
                            </div>
                        </>
                        }
                    </div>   
                </> }  
            </div> 
          
            <div className="d-flex justify-content-between m-5 ">
                <div >
                    <Tooltip  title={modificaCommessa ? "Salva": isNewCommessa ? "Salva" :!infoCommessa.isEditable ? null:'Modifica'}>
                        <span>
                            <IconButton
                                size='large'
                                disabled={activeStep === 0}
                                onClick={onIndietroButtonCommessa}> 
                                <ArrowBackIcon sx={{fontSize:"60px"}}/>
                            </IconButton>
                        </span>
                    </Tooltip>
                </div>
                <div>
                    {activeCommessa.source === "archiviato"? null:<Button onClick={onHandleSalvaModificaButton} variant="outlined">{labelButtonAvantiListaModuliSave}</Button>} 
                </div>
                <div >
                    <Tooltip  title={modificaCommessa ? "Salva": isNewCommessa ? "Salva" :!infoCommessa.isEditable ? null:'Modifica'}>
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
            <ModalConfermaInserimento
                setOpen={setOpenModalConfermaIns}
                open={openModalConfermaIns}
                onButtonComfermaPopUp={onButtonComfermaPopUp}
                mainState={mainState}
                sentence={`Stai ${mainState.inserisciModificaCommessa === 'MODIFY' ? 'modificando': 'registrando'} il Modulo Commessa di OTTOBRE, GENNAIO ${mainState.anno}: confermi l'operazione?`}
            ></ModalConfermaInserimento>
            <ModalLoading open={openModalLoading} setOpen={setOpenModalLoading} sentence={'Loading...'}></ModalLoading>
            <ModalAlert open={openModalAlert} setOpen={setOpenModalAlert} handleAction={onAvantiButton}></ModalAlert>
        </>
    );
};


export default ModuloCommessaInserimentoUtEn30;