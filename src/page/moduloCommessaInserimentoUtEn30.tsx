import {useState,useEffect, useContext} from 'react';
import {Typography, Button} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked } from '@pagopa/mui-italia';
import PrimoContainerInsCom from '../components/commessaInserimento/primoContainerInsCom';
import SecondoContainerInsCom from '../components/commessaInserimento/secondoContainerInsCom';
import TerzoContainerInsCom from '../components/commessaInserimento/terzoConteinerInsCom';
import BasicModal from '../components/reusableComponents/modals/modal';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useNavigate } from 'react-router';
import {manageError} from '../api/api';
import { redirect } from '../api/api';
import ModalRedirect from '../components/commessaInserimento/madalRedirect';
import { DatiCommessa, ResponseDettaglioModuloCommessa,ModuloCommessaInserimentoProps, TotaleNazionaleInternazionale, ResponsTotaliInsModuloCommessa} from '../types/typeModuloCommessaInserimento';
import { ManageErrorResponse } from '../types/typesGeneral';
import { getDettaglioModuloCommessa, insertDatiModuloCommessa } from '../api/apiSelfcare/moduloCommessaSE/api';
import { getModuloCommessaPagoPa, modifyDatiModuloCommessaPagoPa } from '../api/apiPagoPa/moduloComessaPA/api';
import { getDatiFatturazione } from '../api/apiSelfcare/datiDiFatturazioneSE/api';
import { getDatiFatturazionePagoPa } from '../api/apiPagoPa/datiDiFatturazionePA/api';
import ModalLoading from '../components/reusableComponents/modals/modalLoading';
import { PathPf } from '../types/enum';
import { profiliEnti, } from '../reusableFunction/actionLocalStorage';
import { calculateTot } from '../reusableFunction/function';
import { month } from '../reusableFunction/reusableArrayObj';
import ModalConfermaInserimento from '../components/commessaInserimento/modalConfermaInserimento';
import SkeletonComIns from '../components/commessaInserimento/skeletonComIns';
import { GlobalContext } from '../store/context/globalContext';



const ModuloCommessaInserimentoUtEn30 : React.FC = () => {

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState,openBasicModal_DatFat_ModCom,setOpenBasicModal_DatFat_ModCom} = globalContextObj;

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
   
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [totale, setTotale] = useState<TotaleNazionaleInternazionale>({totaleNazionale:0, totaleInternazionale:0, totaleNotifiche:0});
    const [dataMod, setDataModifica] = useState('');
    const [buttonModifica, setButtonMofica] = useState(false);
    const [openModalLoading, setOpenModalLoading] = useState(false);
    const [openModalConfermaIns, setOpenModalConfermaIns] = useState(false);
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
        if(mainState.userClickOn === 'GRID'){
            // SELFCARE
            if(enti){
                handleGetDettaglioModuloCommessa();
                getDatiFat();
                //PAGOPA
            }else if(profilo.auth === 'PAGOPA'){
                handleGetDettaglioModuloCommessaPagoPa();
                getDatiFatPagoPa();
            }
        }
        if(mainState.mese === '' || mainState.anno === ''){
            navigate(PathPf.DATI_FATTURAZIONE);
        }
    },[]);

    useEffect(()=>{
        /*
        if(token === undefined){   
            window.location.href = redirect;
        }
        /* se l'utente PagoPA modifa l'url e cerca di accedere al path '/8' senza aver prima selezionato
         una row della grid lista MODULI COMMESSA viene fatto il redirect automatico a  '/pagopalistamodulocommessa'
        if(profilo.auth === 'PAGOPA' && !profilo.idEnte){
            window.location.href = PathPf.LISTA_MODULICOMMESSA;
        }
        /* se l'utente selcare  modifica l'url andando ad inserire '/8' viene eseguito il redirect a datifatturazione
        if(enti && !mainState.mese && !mainState.anno && mainState.inserisciModificaCommessa !== 'INSERT'){
            window.location.href = PathPf.DATI_FATTURAZIONE;
        }*/
        if(mainState.datiFatturazione === false && profilo.auth !== 'PAGOPA'){
            setOpenModalRedirect(true);
        }
       
    },[]);

    useEffect(()=>{
        setTotale({
            totaleNazionale:calculateTot(datiCommessa.moduliCommessa,'numeroNotificheNazionali'),
            totaleInternazionale:calculateTot(datiCommessa.moduliCommessa,'numeroNotificheInternazionali'),
            totaleNotifiche:calculateTot(datiCommessa.moduliCommessa,'totaleNotifiche')});
    },[datiCommessa]);



    



    const handleGetDettaglioModuloCommessa = async () =>{
        setLoadingData(true);
        await getDettaglioModuloCommessa(token,mainState.anno,mainState.mese, profilo.nonce)
            .then((response:ResponseDettaglioModuloCommessa)=>{
                const res = response.data;
                setDataModifica(res.dataModifica);
                setDatiCommessa({moduliCommessa:res.moduliCommessa});
                setTotaliModuloCommessa(res.totale);
                const objAboutTotale = res.totaleModuloCommessaNotifica;
                setTotale({totaleNazionale:objAboutTotale.totaleNumeroNotificheNazionali
                    , totaleInternazionale:objAboutTotale.totaleNumeroNotificheInternazionali
                    , totaleNotifiche:objAboutTotale.totaleNumeroNotificheDaProcessare});
                setButtonMofica(res.modifica);
                setLoadingData(false);
            }).catch((err:ManageErrorResponse)=>{
                manageError(err,dispatchMainState);
                setLoadingData(false);
            });
    };

    const handleGetDettaglioModuloCommessaPagoPa = async () => {
        setLoadingData(true);
        await getModuloCommessaPagoPa(token, profilo.nonce,profilo.idEnte, profilo.prodotto, profilo.idTipoContratto, Number(mainState.mese), Number(mainState.anno))
            .then((response:ResponseDettaglioModuloCommessa)=>{
                const res = response.data;
                setDatiCommessa({moduliCommessa:res.moduliCommessa});
                setTotaliModuloCommessa(res.totale);
                const objAboutTotale = res.totaleModuloCommessaNotifica;
                setTotale({totaleNazionale:objAboutTotale.totaleNumeroNotificheNazionali
                    , totaleInternazionale:objAboutTotale.totaleNumeroNotificheInternazionali
                    , totaleNotifiche:objAboutTotale.totaleNumeroNotificheDaProcessare});
                setDataModifica(res.dataModifica);
                setButtonMofica(res.modifica);
                setLoadingData(false);
            }).catch((err:ManageErrorResponse)=>{
                manageError(err,dispatchMainState);
                setLoadingData(false);
            });
    };
    // Lato self care
    // chiamata per capire se i dati fatturazione sono stati inseriti
    // SI.... riesco ad inserire modulo commessa
    //No.... redirect dati fatturazione
    // tutto gestito sul button 'continua' in base al parametro datiFatturazione del main state
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

    // Lato Pagopa
    // chiamata per capire se i dati fatturazione sono stati inseriti
    // SI.... riesco ad inserire modulo commessa
    //No.... redirect dati fatturazione
    // tutto gestito sul button 'continua' in base al parametro datiFatturazione del main state
    const getDatiFatPagoPa = async () =>{
        await getDatiFatturazionePagoPa(token,profilo.nonce, profilo.idEnte, profilo.prodotto ).then(() =>{   
            handleModifyMainState({
                datiFatturazione:true,
                statusPageInserimentoCommessa:'immutable'});
        }).catch(err =>{
            if(err?.response?.status === 404){
                handleModifyMainState({
                    datiFatturazione:false,
                    statusPageInserimentoCommessa:'immutable'
                });
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
                setButtonMofica(true);
                toDoOnPostModifyCommessa(res);
            } )
            .catch(err => {
                setOpenModalLoading(false);
                manageError(err,dispatchMainState); 
            });
    };

    const hendleModifyDatiModuloCommessaPagoPa = async() =>{
        // probabilmente questo verra modificato con l'agginta del flag fatturabile
        const datiCommessaPlusIdTpcProIdE = {
            ...datiCommessa,
            ...{
                prodotto:profilo.prodotto,
                idTipoContratto:profilo.idTipoContratto,
                idEnte:profilo.idEnte,
                fatturabile:true }};
        await modifyDatiModuloCommessaPagoPa(datiCommessaPlusIdTpcProIdE, token, profilo.nonce)
            .then((res)=>{
                setOpenModalLoading(false);
                setButtonMofica(true);
                toDoOnPostModifyCommessa(res);
            }).catch(err => {
                setOpenModalLoading(false);
                manageError(err,dispatchMainState); 
            });
    };

    const onButtonComfermaPopUp = () =>{
        setOpenModalLoading(true);
        if(profilo.auth === 'PAGOPA'){
            hendleModifyDatiModuloCommessaPagoPa();
        }else{
            hendlePostModuloCommessa();
        }
    };

    const OnButtonSalva = () =>{
        setOpenModalConfermaIns(true);
    };

    const hendleOnButtonModificaModuloCommessa = () => {
        handleModifyMainState({statusPageInserimentoCommessa:'mutable'});
        setButtonMofica(false);
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

    const onIndietroButton = () =>{
        if(mainState.statusPageInserimentoCommessa === 'immutable' && profilo.auth !== 'PAGOPA'){
            navigate(PathPf.LISTA_COMMESSE);
        }else if(mainState.statusPageInserimentoCommessa === 'immutable' && profilo.auth === 'PAGOPA'){
            navigate(PathPf.LISTA_MODULICOMMESSA);
        }else if(mainState.statusPageInserimentoCommessa === 'mutable' && profilo.auth === 'PAGOPA'){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:'INDIETRO_BUTTON'}}));
        }else if(mainState.inserisciModificaCommessa === 'INSERT'&& enti){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:'INDIETRO_BUTTON'}}));
        }else if(mainState.inserisciModificaCommessa === 'MODIFY' && mainState.statusPageInserimentoCommessa === 'mutable'&& enti ){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:'INDIETRO_BUTTON'}}));
        } 
    };
    const cssPathModuloComm = mainState.statusPageInserimentoCommessa === 'immutable' ? 'bold' : 'normal';
    const cssPathAggModComm = mainState.statusPageInserimentoCommessa === 'mutable' ? 'bold' : 'normal';

    let actionTitle; 
    if(mainState.inserisciModificaCommessa === 'INSERT'){
        actionTitle =  <Typography variant="h4"> Aggiungi modulo commessa</Typography>;
    }else if(mainState.inserisciModificaCommessa  === 'MODIFY' && mainState.statusPageInserimentoCommessa === 'immutable' ){
        actionTitle = <Typography variant="h4">{month[Number(mainState.mese) - 1]} {profilo.auth === 'PAGOPA' && `/ ${mainState.nomeEnteClickOn}`}</Typography>;
    }else if(mainState.inserisciModificaCommessa  === 'MODIFY' && mainState.statusPageInserimentoCommessa === 'mutable'  ){
        actionTitle = <div className='d-flex'>
            <Typography variant="h4"> Modifica modulo commessa {profilo.auth === 'PAGOPA' && `/ ${mainState.nomeEnteClickOn}`}</Typography>
        </div>; 
    }else{
        actionTitle = <Typography variant="h4">Modulo commessa</Typography>;
    }

 
    if(loadingData){
        return(
            <SkeletonComIns></SkeletonComIns>
        );

    }

    return (
        <>
            <BasicModal setOpen={setOpenBasicModal_DatFat_ModCom} open={openBasicModal_DatFat_ModCom} dispatchMainState={dispatchMainState} handleGetDettaglioModuloCommessa={handleGetDettaglioModuloCommessa} handleGetDettaglioModuloCommessaPagoPa={handleGetDettaglioModuloCommessaPagoPa} mainState={mainState}></BasicModal>
            {/*Hide   modulo commessa sul click contina , save del modulo commessa cosi da mostrare dati fatturazione,
            il componente visualizzato è AreaPersonaleUtenteEnte  */}
           
            <div className="marginTop24 ms-5 me-5">
                <div className='d-flex'>
                    <ButtonNaked
                        color="primary"
                        onFocusVisible={() => { console.log('onFocus'); }}
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        onClick={() =>{
                            onIndietroButton();
                        }}
                    >
                        Indietro
                    </ButtonNaked>
                    <Typography sx={{ fontWeight:cssPathModuloComm, marginLeft:'20px'}} variant="caption">
                        <ViewModuleIcon sx={{paddingBottom:'3px'}}  fontSize='small'></ViewModuleIcon>
                         Modulo commessa 
                    </Typography>
                    {
                        mainState.inserisciModificaCommessa === 'INSERT' ? 
                            <Typography sx={{fontWeight:cssPathAggModComm}} variant="caption">/ Aggiungi modulo commessa</Typography> :
                            <Typography sx={{fontWeight:cssPathAggModComm}} variant="caption">/ Modifica modulo commessa</Typography>
                    }
                </div>
                <div className="marginTop24 marginTopBottom24">
                    {actionTitle}
                    {buttonModifica &&
                        <div className="d-flex justify-content-end ">
                            <Button variant="contained" size="small" onClick={()=> hendleOnButtonModificaModuloCommessa()} >Modifica</Button>
                        </div>
                    } 
                </div>
                <div>
                    <div className="bg-white mt-3 pt-3">
                        <PrimoContainerInsCom />
                        <SecondoContainerInsCom totale={totale} mainState={mainState} dispatchMainState={dispatchMainState} setDatiCommessa={setDatiCommessa} datiCommessa={datiCommessa} />
                    </div>
                    <div className='bg-white'>
                        <TerzoContainerInsCom valueTotali={totaliModuloCommessa} dataModifica={dataMod}/>
                    </div>
                    {
                        mainState.statusPageInserimentoCommessa === 'immutable' ? null :
                            <div className="d-flex justify-content-between mt-5 mb-5 ">
                                <Button
                                    variant="outlined"
                                    type="button"
                                    onClick={()=>onIndietroButton()}
                                >Indietro
                                </Button>
                                <Button 
                                    variant="contained" 
                                    onClick={()=>{ 
                                        OnButtonSalva();      
                                    }}              
                                >Salva</Button>
                            </div> 
                    }
                </div> 
            </div> 
            {mainState.statusPageInserimentoCommessa === 'immutable' &&
                <div className="d-flex justify-content-center marginTop24 mb-5">
                    <Button onClick={()=>navigate(PathPf.PDF_COMMESSA)} variant="contained">Vedi anteprima</Button>
                </div> 
            }
            <ModalRedirect 
                setOpen={setOpenModalRedirect}
                open={openModalRedirect}
                sentence={`Per poter inserire il modulo commessa è obbligatorio fornire  i seguenti dati di fatturazione:`}></ModalRedirect>
            <ModalConfermaInserimento
                setOpen={setOpenModalConfermaIns}
                open={openModalConfermaIns}
                onButtonComfermaPopUp={onButtonComfermaPopUp}
                mainState={mainState}
                sentence={`Stai ${mainState.inserisciModificaCommessa === 'MODIFY' ? 'modificando': 'registrando'} il Modulo Commessa di ${month[Number(mainState.mese) - 1]} ${mainState.anno}: confermi l'operazione?`}
            ></ModalConfermaInserimento>
            <ModalLoading open={openModalLoading} setOpen={setOpenModalLoading} sentence={'Loading...'}></ModalLoading>
        </>
    );
};

export default ModuloCommessaInserimentoUtEn30;