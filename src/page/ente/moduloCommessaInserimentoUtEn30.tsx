import {useEffect} from 'react';
import {Typography, Button, Tooltip, Skeleton, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked } from '@pagopa/mui-italia';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useNavigate } from 'react-router';
import {  getRegioniModuloCommessa } from '../../api/apiSelfcare/moduloCommessaSE/api';
import ModalRedirect from '../../components/commessaInserimento/madalRedirect';
import BasicModal from '../../components/reusableComponents/modals/modal';
import ModalLoading from '../../components/reusableComponents/modals/modalLoading';
import { PathPf } from '../../types/enum';
import ModalAlert from '../../components/reusableComponents/modals/modalAlert';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ModalInfo from '../../components/reusableComponents/modals/modalInfo';
import StepperCommessa from '../../components/commessaInserimentoTrimestrale/stepperModCommessa';
import MainInserimentoModuloCommessa from '../../components/commessaInserimentoTrimestrale/mainComponentInserimentoCommessa';
import useSaveModifyModuloCommessa from '../../hooks/useSaveModifyModuloCommessa';
import { useGlobalStore } from '../../store/context/useGlobalStore';


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

export interface Regioni {
    890: null|number,
    ar: null|number,
    istatRegione:string,
    regione: string,
    istatProvincia: string,
    provincia: string,
    isRegione: 1,
    calcolato?:number,
    obbligatorio:number
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

export interface  TotaleCommessa {
    "idEnte": string,
    "idTipoContratto": number,
    "idCategoriaSpedizione": number,
    "stato": string,
    "prodotto": string,
    "annoValidita":number,
    "meseValidita": number,
    "totaleCategoria": number,
    "percentualeCategoria": number,
    "totale": number
}


const ModuloCommessaInserimentoUtEn30 : React.FC = () => {

    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
    const openBasicModal_DatFat_ModCom = useGlobalStore(state => state.openBasicModal_DatFat_ModCom);
    const setOpenBasicModal_DatFat_ModCom = useGlobalStore(state => state.setOpenBasicModal_DatFat_ModCom);
    const setErrorAlert = useGlobalStore(state => state.setErrorAlert);

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();

    let profilePathModuloCommessapdf; 
            
    if(profilo.auth === 'PAGOPA'){
        profilePathModuloCommessapdf = PathPf.PDF_COMMESSA;
    }else{
        profilePathModuloCommessapdf = PathPf.PDF_COMMESSA_EN;
    }
    
    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };


    const {
        onIndietroButtonHeader,
        setOpenModalRedirect,
        getDettaglioEnte,
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
    } = useSaveModifyModuloCommessa({
        token,
        profilo,
        apiRegioni:getRegioniModuloCommessa,
        dispatchMainState,
        navigate,
        mainState,
        handleModifyMainState,
        setOpenBasicModal_DatFat_ModCom,
        whoInvokeHook:"ENTE",
        setErrorAlert
    });
   
  
  
    useEffect(()=>{
        if(mainState.datiFatturazione === false){
            setOpenModalRedirect(true);
        }
    },[mainState.datiFatturazione]);

    useEffect(()=>{
        getDettaglioEnte();
        localStorage.setItem('redirectToInsert',JSON.stringify(false));
    },[]);

    let labelButtonAvantiListaModuliSave = "Modifica";
    if(isEditAllow && (isObbligatorioLayout && (activeStep+1 < steps.length))){
        labelButtonAvantiListaModuliSave = "Prosegui per salvare";
    }else if(isEditAllow || activeCommessa?.stato === null){
        labelButtonAvantiListaModuliSave = "Salva";
    }  
    
    return (
        <>
            <BasicModal setOpen={setOpenBasicModal_DatFat_ModCom} open={openBasicModal_DatFat_ModCom} dispatchMainState={dispatchMainState} handleGetDettaglioModuloCommessa={getDettaglioEnte}  mainState={mainState}></BasicModal>
            {/*Hide   modulo commessa sul click contina , save del modulo commessa cosi da mostrare dati fatturazione,
            il componente visualizzato è AreaPersonaleUtenteEnte  */}
            <div className="marginTop24 ms-5 me-5">
                {loadingData ?  
                    <Skeleton sx={{margin:"24px"}} variant="rectangular" height="30px" />
                    :
                    <Box>
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
                                    <Typography  variant="caption">/ Dettaglio-Inserimento modulo commessa</Typography>
                            }
                        </div>
                        <div className='mt-5 mb-5'>
                            {steps && (activeStep === 0 || activeStep > 0) && steps.length > 1  && 
                              <StepperCommessa  activeStep={activeStep} steps={steps}/>
                            }
                        </div>
                    </Box>
                }
                <MainInserimentoModuloCommessa 
                    activeCommessa={activeCommessa}
                    onChangeModuloValue={onChangeModuloValue}
                    isEditAllow={isEditAllow}
                    errorAnyValueIsEqualNull={errorAnyValueIsEqualNull}
                    dataTotali={dataTotali}
                    arrayRegioniSelected={arrayRegioniSelected}
                    setArrayRegioniSelected={setArrayRegioniSelected}
                    arrayRegioni={arrayRegioni}
                    onAddRegioniButton={onAddRegioniButton}
                    errorArRegioni={errorArRegioni}
                    handleChangeTotale_Ar_890_regione={handleChangeTotale_Ar_890_regione}
                    error890Regioni={error890Regioni}
                    onDeleteSingleRegione={onDeleteSingleRegione}
                    dataModuli={dataModuli}
                    activeStep={activeStep}
                    mainState={mainState}
                    coperturaAr={coperturaAr}
                    copertura890={copertura890}
                    loadingData={loadingData}
                    coperturaArInseritaManualmente={coperturaArInseritaManualmente}
                    copertura890InseritaManualmente={copertura890InseritaManualmente}
                ></MainInserimentoModuloCommessa>
            </div> 
            {!loadingData &&
            <div className="d-flex justify-content-between m-5 ">
                <div>
                    {steps.length > 1 && 
                    <Tooltip title={activeStep !== 0 && "Indietro"}>
                        <span>
                            <Button
                                sx={{color:"#5c6f81"}}
                                size='large'
                                disabled={activeStep === 0}
                                onClick={onIndietroButton}><ArrowBackIcon  sx={{fontSize:"60px",marginRight:"20px",color:activeStep === 0 ?"inherit" :"#5c6f81"}}/>
                                 Indiero
                            </Button>
                        </span>
                    </Tooltip>
                    }
                </div>
                {((dataModuli?.length > 0 && (activeCommessa?.source === "archiviato")) || !activeCommessa?.modifica) ? null:
                    <div className="d-flex justify-content-center align-items-center">
                        <Button  disabled={error890Regioni|| errorArRegioni|| (isObbligatorioLayout && (activeStep+1 < steps?.length))} onClick={onHandleSalvaModificaButton} variant={labelButtonAvantiListaModuliSave === "Prosegui per salvare"? "text":"outlined"}>
                            {labelButtonAvantiListaModuliSave}
                        </Button>
                    </div>} 
                { (activeCommessa?.totaleNotifiche !== null && !isEditAllow && !loadingData) && 
                <div  className="d-flex justify-content-center align-items-center">
                    <Button onClick={()=>{
                        handleModifyMainState({infoTrimestreComSelected:{
                            ...mainState.infoTrimestreComSelected,
                            annoCommessaSelectd:activeCommessa.annoValidita.toString(),
                            meseCommessaSelected:activeCommessa.meseValidita.toString(),
                            moduloSelectedIndex:activeStep}
                        });
                        navigate(profilePathModuloCommessapdf+`/${activeCommessa.annoValidita}/${activeCommessa.meseValidita}`);}
                    } variant="contained">Vedi anteprima</Button>   
                </div> 
                }
                <div >
                    {steps.length > 1 &&  (activeStep === 0 || activeStep > 0) &&
                    <Tooltip  title={(activeStep+1) !== steps?.length && "Avanti"}>
                        <span>
                            <Button
                                sx={{color:"#5c6f81"}}
                                size='large'
                                disabled={(activeStep+1) === steps.length || error890Regioni || errorArRegioni}
                                onClick={onAvantiButton}> 
                                Avanti
                                <ArrowForwardIcon sx={{fontSize:"60px", color:(activeStep+1) === steps.length || error890Regioni || errorArRegioni ?"inherit" :"#5c6f81",marginLeft:"20px"}}/>
                            </Button>
                        </span>
                    </Tooltip>
                    }
                </div>   
            </div> 
            }
            <ModalRedirect 
                setOpen={setOpenModalRedirect}
                open={openModalRedirect}
                sentence={`Per poter inserire il modulo commessa è obbligatorio fornire  i seguenti dati di fatturazione:`}></ModalRedirect>
            <ModalInfo 
                setOpen={setOpenModalInfo}
                open={openModalInfo}
                width={600}></ModalInfo>
            <ModalLoading open={openModalLoading} setOpen={setOpenModalLoading} sentence={'Loading...'}></ModalLoading>
            <ModalAlert
                open={openModalAlert}
                setOpen={setOpenModalAlert} 
                handleAction={clickOnIndietroAvanti.current === "LISTA_MODULI" ? () => navigate(PathPf.LISTA_COMMESSE):clickOnIndietroAvanti.current === "AVANTI" ?avantiFunction:indietroFunction}
            ></ModalAlert>
        </>
    );
};


export default ModuloCommessaInserimentoUtEn30;