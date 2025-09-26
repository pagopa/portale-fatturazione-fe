import {useEffect, useContext, useState} from 'react';
import { Button, Typography} from '@mui/material';
import BasicModal from '../../components/reusableComponents/modals/modal';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useNavigate } from 'react-router';
import ModalRedirect from '../../components/commessaInserimento/madalRedirect';
import ModalLoading from '../../components/reusableComponents/modals/modalLoading';
import { PathPf } from '../../types/enum';
import { profiliEnti } from '../../reusableFunction/actionLocalStorage';
import { month } from '../../reusableFunction/reusableArrayObj';
import ModalConfermaInserimento from '../../components/commessaInserimento/modalConfermaInserimento';
import SkeletonComIns from '../../components/commessaInserimento/skeletonComIns';
import { GlobalContext } from '../../store/context/globalContext';
import MainInserimentoModuloCommessa from '../../components/commessaInserimentoTrimestrale/mainComponentInserimentoCommessa';
import NavigatorHeader from '../../components/reusableComponents/navigatorHeader';
import useSaveModifyModuloCommessa from '../../hooks/useSaveModifyModuloCommessa';
import { getRegioniModuloCommessaPA } from '../../api/apiPagoPa/moduloComessaPA/api';
import ModalAlert from '../../components/reusableComponents/modals/modalAlert';
import ModalInfo from '../../components/reusableComponents/modals/modalInfo';



const ModuloCommessaInserimentoPn : React.FC = () => {

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

    //da portare nell'hook
    const [openModalConfermaIns,setOpenModalConfermaIns] = useState(false);

    const onButtonComfermaPopUp = () => {
        console.log(999);
    };

    
    const {
        onIndietroButtonHeader,
        setOpenModalRedirect,
        getDettaglioSend,
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
        apiRegioni:getRegioniModuloCommessaPA,
        dispatchMainState,
        navigate,
        mainState,
        handleModifyMainState,
        setOpenBasicModal_DatFat_ModCom,
        whoInvokeHook:"SEND"
    });
   


    useEffect(()=>{
        getDettaglioSend();
     
    },[]);

    let labelButtonAvantiListaModuliSave = "Modifica";
   
    if(isEditAllow || activeCommessa?.stato === null){
        labelButtonAvantiListaModuliSave = "Salva";
    }


    if(loadingData){
        return(
            <SkeletonComIns></SkeletonComIns>
        );
    }

    return (
        <>
            <BasicModal setOpen={setOpenBasicModal_DatFat_ModCom} open={openBasicModal_DatFat_ModCom} dispatchMainState={dispatchMainState} handleGetDettaglioModuloCommessa={()=> console.log("ciao")}  mainState={mainState}></BasicModal>
            {/*Hide   modulo commessa sul click contina , save del modulo commessa cosi da mostrare dati fatturazione,
            il componente visualizzato è AreaPersonaleUtenteEnte  */}
            <div>
                <NavigatorHeader pageFrom={"Modulo commessa/"} pageIn={"Modifica modulo commessa"} backPath={PathPf.LISTA_MODULICOMMESSA} icon={<ViewModuleIcon sx={{padding:"3px"}}  fontSize='small'></ViewModuleIcon>}></NavigatorHeader>
            </div>
            <div className="marginTop24 ms-5 me-5">
                <div className="marginTop24">
                    <Typography variant="h4">{`${month[activeCommessa.meseValidita-1]} / ${mainState.infoTrimestreComSelected.nomeEnteClickOn}`}</Typography>
                </div>
                <div className='mt-5 mb-5'>
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
            </div> 
            {!loadingData &&
                        <div className="d-flex justify-content-between m-5 ">
                            <div>

                            </div>
                            {((dataModuli.length > 0 && (activeCommessa?.source === "archiviato")) || !activeCommessa.modifica) ? null:
                                <div className="d-flex justify-content-center align-items-center">
                                    <Button  disabled={error890Regioni|| errorArRegioni} onClick={onHandleSalvaModificaButton} variant={"outlined"}>{labelButtonAvantiListaModuliSave}
                                    </Button>
                                </div>} 
                            { (activeCommessa?.dataInserimento !== null && !isEditAllow && !loadingData) && 
                            <div  className="d-flex justify-content-center align-items-center">
                                <Button onClick={()=>{
                                    navigate(PathPf.PDF_COMMESSA+`/${activeCommessa.annoValidita}/${activeCommessa.meseValidita}`);}
                                } variant="contained">Vedi anteprima</Button>   
                            </div> 
                            }
                            <div>
                                
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
            <ModalConfermaInserimento
                setOpen={setOpenModalConfermaIns}
                open={openModalConfermaIns}
                onButtonComfermaPopUp={onButtonComfermaPopUp}
                mainState={mainState}
                sentence={`Verrà effettuata la modifica del Modulo Commessa di ${month[Number(mainState.mese) - 1]} ${mainState.anno}: confermi l'operazione?`}
            ></ModalConfermaInserimento>
            <ModalLoading open={openModalLoading} setOpen={setOpenModalLoading} sentence={'Loading...'}></ModalLoading>
        </>
    );
};

export default ModuloCommessaInserimentoPn;