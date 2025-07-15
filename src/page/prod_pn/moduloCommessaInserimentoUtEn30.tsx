import {useState,useEffect, useContext} from 'react';
import {Typography, Button, Stepper, Step, StepButton, Tooltip, IconButton,  Theme, useTheme, SelectChangeEvent, Box, Skeleton, StepLabel} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked } from '@pagopa/mui-italia';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useNavigate } from 'react-router';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { GlobalContext } from '../../store/context/globalContext';
import { manageError } from '../../api/api';
import { getDatiFatturazione } from '../../api/apiSelfcare/datiDiFatturazioneSE/api';
import { getCommessaObbligatoriListaV2, getCommessaObbligatoriVerificaV2, getDettaglioModuloCommessa, insertDatiModuloCommessa } from '../../api/apiSelfcare/moduloCommessaSE/api';
import ModalRedirect from '../../components/commessaInserimento/madalRedirect';
import ModalConfermaInserimento from '../../components/commessaInserimento/modalConfermaInserimento';
import SkeletonComIns from '../../components/commessaInserimento/skeletonComIns';
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

const names = [
    "Abruzzo",
    "Basilicata",
    "Calabria",
    "Campania",
    "Emilia-Romagna",
    "Friuli-Venezia Giulia",
    "Lazio",
    "Liguria",
    "Lombardia",
    "Marche",
    "Molise",
    "Piemonte",
    "Puglia",
    "Sardegna",
    "Sicilia",
    "Toscana",
    "Trentino-Alto Adige",
    "Umbria",
    "Valle d'Aosta",
    "Veneto"
];

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
    const [dataMod, setDataModifica] = useState('');
   
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
  


    //new logic __________________
    const [datiCommessa, setDatiCommessa] = useState<DatiCommessa>( {
        moduliCommessa: [
            {
                numeroNotificheNazionali: 0,
                numeroNotificheInternazionali: 0,
                totaleNotifiche:0,
                idTipoSpedizione: 1
            },
            {
                numeroNotificheNazionali: 0,
                numeroNotificheInternazionali: 0,
                totaleNotifiche:0,
                idTipoSpedizione: 2
            },
            {
                numeroNotificheNazionali: 0,
                numeroNotificheInternazionali: 0,
                totaleNotifiche:0,
                idTipoSpedizione: 3
            }
        ]
    });
    
    const [totaliModuloCommessa, setTotaliModuloCommessa] = useState<ResponsTotaliInsModuloCommessa[]>([
        {
            idCategoriaSpedizione: 1,
            totaleValoreCategoriaSpedizione: 0
        },
        {
            idCategoriaSpedizione: 2,
            totaleValoreCategoriaSpedizione: 0
        }
    ]);
  
    useEffect(()=>{
        if(mainState.inserisciModificaCommessa === 'INSERT'){
            setTotaliModuloCommessa([
                {
                    idCategoriaSpedizione: 1,
                    totaleValoreCategoriaSpedizione: 0
                },
                {
                    idCategoriaSpedizione: 2,
                    totaleValoreCategoriaSpedizione: 0
                }
            ]);
            setDatiCommessa({
                moduliCommessa: [
                    {
                        numeroNotificheNazionali: 0,
                        numeroNotificheInternazionali: 0,
                        totaleNotifiche:0,
                        idTipoSpedizione: 1
                    },
                    {
                        numeroNotificheNazionali: 0,
                        numeroNotificheInternazionali: 0,
                        totaleNotifiche:0,
                        idTipoSpedizione: 2
                    },
                    {
                        numeroNotificheNazionali: 0,
                        numeroNotificheInternazionali: 0,
                        totaleNotifiche:0,
                        idTipoSpedizione: 3
                    }
                ]
            });
        }
    },[mainState.inserisciModificaCommessa]);


    useEffect(()=>{
        if(mainState.datiFatturazione === false){
            setOpenModalRedirect(true);
        }
    },[mainState.datiFatturazione]);

    useEffect(()=>{
        handleGetDettaglioModuloCommessa();
    },[]);

    /* da verificare con l'inserimento modifica
    useEffect(()=>{
        setTotale({
            totaleNazionale:calculateTot(datiCommessa.moduliCommessa,'numeroNotificheNazionali'),
            totaleInternazionale:calculateTot(datiCommessa.moduliCommessa,'numeroNotificheInternazionali'),
            totaleNotifiche:calculateTot(datiCommessa.moduliCommessa,'totaleNotifiche')});
    },[datiCommessa]);
*/

    const handleGetDettaglioModuloCommessa = async () =>{
        setLoadingData(true);
        await getCommessaObbligatoriVerificaV2(token, profilo.nonce).then(async(res)=>{
            //RIMETTERE  setIsObbligatorioLayout(res.data);
            
            if(res.data && Object.keys(mainState.infoTrimestreComSelected).length === 0){
                setIsObbligatorioLayout(res.data);
                //setLoadingData(true);
                await getCommessaObbligatoriListaV2(token, profilo.nonce).then((response)=>{
                    console.log({dettaglioOBBligatorio:response});
                    setDataModuli(response.data);
                    setDataObbligatori(response.data.map(el => el.stato === null).flat().includes(true));

                    const stepsResult = response.data.map(el => month[el.meseValidita-1]);
                    setSteps(stepsResult);

                    const completedResult = response.data.map((el,i) => ({[i+1]:el.stato !== null?true:false}));
                    setStepCompleted(Object.assign({}, ...completedResult));

                    const activeStepResult = response.data.findIndex(item => item.stato === null);
                    setActiveStep(activeStepResult);

                    //sistemare quando mauro ci darà l'api , probabilmente da eliminare questo state
                    setDataModuloToVisualize(response.data[activeStepResult]);

                    handleGetDettaglioModuloCommessaVecchio(response.data[activeStepResult].annoValidita,response.data[activeStepResult].meseValidita);
                    //setLoadingData(false);
                }).catch((err:ManageErrorResponse)=>{
                    manageError(err,dispatchMainState);
                    setLoadingData(false);
                });
            }else{
                handleGetDettaglioModuloCommessaVecchio(mainState?.infoTrimestreComSelected?.annoCommessaSelectd,mainState?.infoTrimestreComSelected?.meseCommessaSelected);
                const completedResult = mainState?.infoTrimestreComSelected?.moduli?.map((el,i) => ({[i+1]:el?.stato !== "--"?true:false}));
                console.log({completedResult});
                setStepCompleted(Object.assign({}, ...completedResult));
                setActiveStep(Number(mainState.infoTrimestreComSelected.moduloSelectedIndex));
                const stepsResult = mainState.infoTrimestreComSelected.moduli.map(el => el.meseAnno.split('/')[0]||"");
                setSteps(stepsResult);
                
            }
        });

       
    };

    console.log({steps, activeStep,stepCompleted});
  
    const handleGetDettaglioModuloCommessaVecchio = async (year,month) =>{
        setLoadingData(true);
        await getDettaglioModuloCommessa(token,year,month, profilo.nonce)
            .then((response:ResponseDettaglioModuloCommessa)=>{
                console.log(response.data);
                const res = response.data;
                setInfoCommessa({anno:res.anno.toString(),mese:res.mese.toString(),idTipoContratto:res.idTipoContratto,isEditable:res.modifica});
                if(res.totale.length > 0){
                    setDatiCommessa({moduliCommessa:res.moduliCommessa});
                    const objAboutTotale = res.totaleModuloCommessaNotifica;
                    setTotale({totaleNazionale:objAboutTotale.totaleNumeroNotificheNazionali
                        , totaleInternazionale:objAboutTotale.totaleNumeroNotificheInternazionali
                        , totaleNotifiche:objAboutTotale.totaleNumeroNotificheDaProcessare});
                   
                }else{
                    setDatiCommessa({
                        moduliCommessa: [
                            {
                                numeroNotificheNazionali: 0,
                                numeroNotificheInternazionali: 0,
                                totaleNotifiche:0,
                                idTipoSpedizione: 1
                            },
                            {
                                numeroNotificheNazionali: 0,
                                numeroNotificheInternazionali: 0,
                                totaleNotifiche:0,
                                idTipoSpedizione: 2
                            },
                            {
                                numeroNotificheNazionali: 0,
                                numeroNotificheInternazionali: 0,
                                totaleNotifiche:0,
                                idTipoSpedizione: 3
                            }
                        ]
                    });
                    setTotaliModuloCommessa([
                        {
                            idCategoriaSpedizione: 1,
                            totaleValoreCategoriaSpedizione: 0
                        },
                        {
                            idCategoriaSpedizione: 2,
                            totaleValoreCategoriaSpedizione: 0
                        }
                    ]);
                    setTotale({totaleNazionale:0, totaleInternazionale:0, totaleNotifiche:0});
                }
                
                setDataModifica(res.dataModifica);
                setIsNewCommessa(!res.modifica && res.totale.length === 0);
                setLoadingData(false);
            }).catch((err:ManageErrorResponse)=>{
                manageError(err,dispatchMainState);
                setLoadingData(false);
            });
    };

    console.log({isNewCommessa});
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
            setTotaliModuloCommessa(res.data.totale);
        }else{
            setTotaliModuloCommessa(res.data.totale);
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

    const onButtonComfermaPopUp = () =>{
        setOpenModalLoading(true);
        hendlePostModuloCommessa();
    };

    const OnButtonSalva = () =>{
        setOpenModalConfermaIns(true);
    };

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
    };

    const onIndietroButtonHeader = () =>{
        if(mainState.statusPageInserimentoCommessa === 'immutable'){
            navigate(PathPf.LISTA_COMMESSE);
            // inserito con nuova logica modulo commessa trimestrale 
            localStorage.setItem('redirectToInsert',JSON.stringify(false));
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
                handleGetDettaglioModuloCommessaVecchio(dataModuli[activeStep-1].annoValidita,dataModuli[activeStep-1].meseValidita);
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

                handleGetDettaglioModuloCommessaVecchio(dataModuli[activeStep+1].annoValidita,dataModuli[activeStep+1].meseValidita);
                //setLoadingData(false);
                console.log('cristo,',activeStep);
              
                setModificaCommessa(false);
            }else{
                //setDataModuloToVisualize(dataModuli[stepActive+1]);

                handleGetDettaglioModuloCommessaVecchio(mainState.infoTrimestreComSelected.moduli[activeStep+1].id.split('/')[1],mainState.infoTrimestreComSelected.moduli[activeStep+1].id.split('/')[0]);
                //setLoadingData(false);
                console.log('cristo,',activeStep);
               
                setModificaCommessa(false);
            }
            handleNext();
           
        }
    };

 
   
    //_______________________

    
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

    //_____________________________
  
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
                </div>
                {loadingData ?  <Box
                    sx={{
                        padding:"24px",
                        height: '100vh'
                    }}
                >
                    <Skeleton variant="rectangular" height="100%" />
                </Box>: <>
                    {!isObbligatorioLayout &&
                    <div  className='d-flex justify-content-end'>
                        <Tooltip  title={modificaCommessa ? "Salva": isNewCommessa ? "Salva" :!infoCommessa.isEditable ? null:'Modifica'}>
                            <span>
                                <IconButton
                                    size='large'
                                    disabled={!modificaCommessa||!infoCommessa.isEditable}
                                    onClick={() =>{
                                        if(!modificaCommessa && !isNewCommessa){
                                            setModificaCommessa(true);
                                        }else{
                                            console.log('000');
                                            
                                        }
                                    } }> 
                                    {!modificaCommessa && !isNewCommessa ?<EditNoteIcon sx={{fontSize:"60px"}}/> :<SaveIcon sx={{fontSize:"60px"}}/>}
                                </IconButton>
                            </span>
                        </Tooltip>
                    </div>
                    }
                    <div>
                        <div className="bg-white mt-3 pt-3">
                            <PrimoContainerInsComTrimestrale meseAnno={`${month[Number(infoCommessa.mese)-1]}/${infoCommessa.anno}`} tipoContratto={infoCommessa.idTipoContratto === 1 ? "PAL":"PAC"} />
                            {/* CAMBIARE LA PROP BUTTON MODIFICA*/}
                            <SecondoContainerTrimestrale totale={totale} mainState={mainState} dispatchMainState={dispatchMainState} setDatiCommessa={setDatiCommessa} datiCommessa={datiCommessa} meseAnno={` ${month[Number(infoCommessa.mese)-1]}/${infoCommessa.anno}`} modifica={!modificaCommessa && !isNewCommessa && !isObbligatorioLayout} />
                        </div>
                        <div className='bg-white'>
                            <TerzoContainerTrimestrale valueTotali={totaliModuloCommessa} dataModifica={dataMod} meseAnno={`${infoCommessa.anno}/${infoCommessa.mese}`}/>
                        </div>
                        {/*NEW CODE ______________________________*/}
                        {/*
                        <div style={{paddingRight:"28px"}} className="bg-white mt-3 pt-3">
                            <Grid   container spacing={2}>
                                <Grid item  md={6}>
                                </Grid>
                                <Grid item  md={2}>
                                    <Typography sx={{fontWeight:'bold', textAlign:'center'}}>AR</Typography>
                                </Grid>
                                <Grid item md={2}>
                                    <Typography sx={{fontWeight:'bold', textAlign:'center'}}>890</Typography>
                                </Grid>
                                <hr></hr>
                                <Grid container  justifyContent="center"
                                    alignItems="center" style={{ height: '80px' }} item  md={6}>
                                    <Typography sx={{fontWeight:'bold', textAlign:'right'}}>Totale Notifiche</Typography>
                                </Grid>
                                <Grid container
                                    justifyContent="center"
                                    alignItems="center"
                                    style={{ height: '80px' }} item  md={2}>
                                    <TextField
                                        sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                        disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                                        size="small"
                                        value={100}
                                        InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                    />
                                </Grid>
                                <Grid container
                                    justifyContent="center"
                                    alignItems="center"
                                    style={{ height: '80px' }} item md={2}>
                                    <TextField
                                        sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                        disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                                        size="small"
                                        value={100}
                                        InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                    />
                                </Grid>
                                <Grid container  justifyContent="center"
                                    alignItems="center" style={{ height: '80px' }} item  md={6}>
                                    <Typography sx={{fontWeight:'bold', textAlign:'center'}}>Percentuale copertura</Typography>
                                </Grid>
                                <Grid container
                                    justifyContent="center"
                                    alignItems="center"
                                    style={{ height: '80px' }} item  md={2}>
                                    <TextField
                                        sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                        disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                                        size="small"
                                        value={100}
                                        InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                    />
                                </Grid>
                                <Grid container
                                    justifyContent="center"
                                    alignItems="center"
                                    style={{ height: '80px' }} item md={2}>
                                    <TextField
                                        sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                        disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                                        size="small"
                                        value={100}
                                        InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                    />
                                </Grid>
                            </Grid>
                        </div>
                     
                        <div style={{paddingRight:"28px"}} className="bg-white my-3 py-3">
                            <Grid   container spacing={2}>
                            
                                <Grid item  md={6}>
                                    <FormControl sx={{ m: 1, width: "100%" }}>
                                        <InputLabel>Inserisci regioni</InputLabel>
                                        <Select
                                    
                                            multiple
                                            value={personName}
                                            onChange={handleChange}
                                            input={<OutlinedInput label="Inserisci regioni" />}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((value) => (
                                                        <Chip key={value} label={value} />
                                                    ))}
                                                </Box>
                                            )}
                                            MenuProps={MenuProps}
                                        >
                                            {names.map((name) => (
                                                <MenuItem
                                                    key={name}
                                                    value={name}
                                                    style={getStyles(name, personName, theme)}
                                                >
                                                    {name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item  md={6}>
                                    <IconButton
                                        aria-label="Edit"
                                        color="primary"
                                        size="large"
                                    ><AddIcon/>
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </div>
                        <div className="bg-white mt-3 pt-3">
                            <Grid sx={{paddingRight:"28px"}}  container spacing={2}>
                                <Grid container  justifyContent="center"
                                    alignItems="center" style={{ height: '80px' }} item  md={6}>
                                    <Typography variant='h4' sx={{fontWeight:'bold', textAlign:'center'}}>Regione LOMBARDIA</Typography>
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
                                        disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                                        size="small"
                                        value={100}
                                        InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                    />
                                </Grid>
                                <Grid container
                                    justifyContent="center"
                                    alignItems="center"
                                    style={{ height: '80px' }} item md={2}>
                                    <TextField
                                        sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                        disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                                        size="small"
                                        value={100}
                                        InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                    />
                                </Grid>
                            </Grid>
                            <hr></hr>
                            <Box  sx={{ margin: 2 , backgroundColor:'#F8F8F8', padding:'10px'}}>
                                <Box style={{overflowY: "auto",maxHeight: "200px", margin:2, backgroundColor:'#F8F8F8'}}>
                                    {["Piemonte","Calabria","Sardegna","Campania"].map((el) => {
                                        return (
                                            <>
                                                <Grid container spacing={2}>
                                                    <Grid container  justifyContent="center"
                                                        alignItems="center" style={{ height: '80px' }} item  md={6}>
                                                        <Typography variant='h4' sx={{fontWeight:'bold', textAlign:'center'}}>{el}</Typography>
                                                    </Grid>
                                                    <Grid container
                                                        justifyContent="center"
                                                        alignItems="center"
                                                        style={{ height: '80px' }} item  md={2}>
                                                        <TextField
                                                            sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                                            disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                                                            size="small"
                                                            value={100}
                                                            InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                                        />
                                                    </Grid>
                                                    <Grid container
                                                        justifyContent="center"
                                                        alignItems="center"
                                                        style={{ height: '80px' }} item md={2}>
                                                        <TextField
                                                            sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                                            disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                                                            size="small"
                                                            value={100}
                                                            InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <hr></hr>
                                            </>
                                        );})}
                                </Box>
                            </Box>
                            <hr></hr>
                        </div>
                        */}
                    </div>   
                </> }  
            </div> 
          
            <div className="d-flex justify-content-between m-5 ">
                <div>
                    <Button
                        variant="outlined"
                        disabled={activeStep === 0}
                        type="button"
                        onClick={()=>onIndietroButtonCommessa()}
                    >Indietro
                    </Button>
                </div>
                <div>
                    <Button onClick={()=> modificaCommessa ? setOpenModalAlert(true) : onAvantiButton()} variant="outlined">{dataModuli.length-1 === activeStep && !isObbligatorioLayout ? "Lista Moduli commesse": dataModuli.length-1 === activeStep && isObbligatorioLayout  ?"Salva":"Avanti"}</Button>
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