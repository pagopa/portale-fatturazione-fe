import React, { useState, useEffect, useContext} from 'react';
import { manageError, redirect } from '../api/api';
import { useNavigate} from 'react-router';
import '../style/areaPersonaleUtenteEnte.css';
import { Button } from '@mui/material';
import TabAreaPersonaleUtente from '../components/areaPersonale/tabAreaPersonaleUtente';
import PageTitleNavigation from '../components/areaPersonale/pageTitleNavigation';
import {
    DatiFatturazione,
    StateEnableConferma,
    SuccesResponseGetDatiFatturazione
} from '../types/typesAreaPersonaleUtenteEnte';
import {  getDatiFatturazione,
    modifyDatiFatturazione,
    insertDatiFatturazione } from '../api/apiSelfcare/datiDiFatturazioneSE/api';
import {  getDatiFatturazionePagoPa,
    modifyDatiFatturazionePagoPa,
    insertDatiFatturazionePagoPa, } from '../api/apiPagoPa/datiDiFatturazionePA/api';
import BasicModal from '../components/reusableComponents/modals/modal';
import ModalLoading from '../components/reusableComponents/modals/modalLoading';
import {PathPf} from '../types/enum';
import { profiliEnti, } from '../reusableFunction/actionLocalStorage';
import SuspenseDatiFatturazione from '../components/areaPersonale/skeletonDatiFatturazione';
import { GlobalContext } from '../store/context/globalContext';
        
        
        
const AreaPersonaleUtenteEnte : React.FC = () => {

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
  
    const [openModalLoading, setOpenModalLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [datiFatturazione, setDatiFatturazione] = useState<DatiFatturazione>({
        tipoCommessa:'',
        idEnte:'',
        splitPayment:true,
        cup: '',
        idDocumento:'',
        codCommessa:'',
        contatti:[],
        dataCreazione:'',
        dataModifica:'',
        dataDocumento:new Date().toISOString(),
        pec:'',
        notaLegale:false,
        prodotto:'',
        map:'',
        id:0
    });
            
    // state creato per il tasto conferma , abilitato nel caso in cui tutti values sono true
    const [statusBottonConferma, setStatusButtonConferma] = useState<StateEnableConferma>({
        'CUP':false,
        'CIG':false,
        'Mail Pec':false,
        'ID Documento':false,
        "Codice Commessa/Convenzione":false,
    });

            
    useEffect(()=>{
        if(enti){
            // se l'utente NON è pagopa
            getDatiFat();
        }else if(profilo.auth === 'PAGOPA'){
            //se l'utente è pagoPa
            getDatiFatPagoPa();
        }
    },[]);
            
    /*
    // se non c'è il token viene fatto il redirect al portale di accesso 
    useEffect(()=>{
        if(token === undefined){
            window.location.href = redirect;
        }
        /* se l'utente PagoPA modifa l'url e cerca di accedere al path '/' 
                senza aver prima selezionato una row della grid lista dati fatturazione viene fatto il redirect automatico a  PathPf.LISTA_DATI_FATTURAZIONE
        if(profilo.auth === 'PAGOPA' && !profilo.idEnte){
            window.location.href = PathPf.LISTA_DATI_FATTURAZIONE;
        }
    },[]);
            */
    // get dati fatturazione SELFCARE
    const getDatiFat = async () =>{
        setLoadingData(true);
        await getDatiFatturazione(token,profilo.nonce).then((res:SuccesResponseGetDatiFatturazione ) =>{   

            // 17/09/24 questa costante datiFatturazioneNotCompleted è stata aggiunta nella local strorage perche ci sono dei comuni che hanno inserito 
            // o id Documento o cup , ora ci han chiesto di rendere obbligatori i due campi se almeno uno dei due è stato inserito 
            // e mostrare il pop up redirect nel caso questa costante sarà uguale a false
      
            const datiFatturazioneNotCompleted = res.data.idDocumento === '' && res.data.cup !== '';
            if(datiFatturazioneNotCompleted){
                handleModifyMainState({
                    datiFatturazione:true,
                    statusPageDatiFatturazione:'mutable',
                    datiFatturazioneNotCompleted:datiFatturazioneNotCompleted
                });
            }else{
                handleModifyMainState({
                    datiFatturazione:true,
                    statusPageDatiFatturazione:'immutable',
                    datiFatturazioneNotCompleted:datiFatturazioneNotCompleted
                });
            }
           
            setDatiFatturazione(res.data);
            setLoadingData(false);
            //checkCommessa();
                    
        }).catch(err =>{
                    
            if(err?.response?.status === 404){
                // setInfoToStatusApplicationLoacalStorage(statusApp,{datiFatturazione:false});
                handleModifyMainState({
                    datiFatturazione:false,
                    statusPageDatiFatturazione:'mutable'
                });
                //checkCommessa();
            }
            setDatiFatturazione({
                tipoCommessa:'',
                idEnte:'',
                splitPayment:true,
                cup: '',
                idDocumento:'',
                codCommessa:'',
                contatti:[],
                dataCreazione:'',
                dataModifica:'',
                dataDocumento:null,
                pec:'',
                notaLegale:false,
                prodotto:'',
                map:'',
                id:0
                        
            });
            if(err?.response?.status !== 404){
                manageError(err,dispatchMainState);
            }
            setLoadingData(false);     
        });
    };
            
            
    // get dati fatturazione PAGOPA
    const getDatiFatPagoPa = async () =>{
        setLoadingData(true);
        await getDatiFatturazionePagoPa(token,profilo.nonce, profilo.idEnte, profilo.prodotto ).then((res:SuccesResponseGetDatiFatturazione) =>{   
            handleModifyMainState({
                datiFatturazione:true,
                statusPageDatiFatturazione:'immutable'
            });
            setDatiFatturazione(res.data); 
            setLoadingData(false);
        }).catch(err =>{
            handleModifyMainState({
                datiFatturazione:false,
                statusPageDatiFatturazione:'mutable'
            });
            setDatiFatturazione({
                tipoCommessa:'',
                idEnte:'',
                splitPayment:true,
                cup: '',
                idDocumento:'',
                codCommessa:'',
                contatti:[],
                dataCreazione:'',
                dataModifica:'',
                dataDocumento:null,
                pec:'',
                notaLegale:false,
                prodotto:'',
                map:'',
                id:0
                        
            });
             
            if(err?.response?.status !== 404){
                manageError(err,dispatchMainState);
            }
            setLoadingData(false);
            navigate(PathPf.LISTA_DATI_FATTURAZIONE); 
        });
    };
            
            
    const hendleSubmitDatiFatturazione = async (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) =>{
        e.preventDefault();
        setOpenModalLoading(true);
        //  1 - se l'user ha già dati fatturazione
        if(mainState.datiFatturazione === true){
            // 1 - ed è un utente PAGOPA
            if(profilo.auth === 'PAGOPA'){
                const newDatiFatturazione = {...datiFatturazione, ...{idEnte:profilo.idEnte,prodotto:profilo.prodotto}};
                        
                await modifyDatiFatturazionePagoPa(token,profilo.nonce, newDatiFatturazione ).then(() =>{
                    setOpenModalLoading(false);
                    handleModifyMainState({
                        statusPageDatiFatturazione:'immutable',
                    });
                }).catch(err => {
                    setOpenModalLoading(false);
                    manageError(err,dispatchMainState);
                });
            }else{
                // 1 - ed è un utente SELFCARE
                await modifyDatiFatturazione(datiFatturazione, token,profilo.nonce)
                    .then(() =>{
                        setOpenModalLoading(false);
                        if(mainState.inserisciModificaCommessa === 'INSERT'){
                            handleModifyMainState({
                                statusPageDatiFatturazione:'immutable',
                                statusPageInserimentoCommessa:'mutable',
                                mese:new Date().getMonth()+2,
                                anno:new Date().getFullYear(),
                                datiFatturazioneNotCompleted:false
                            });
                            navigate(PathPf.MODULOCOMMESSA);
                        }else{
                            handleModifyMainState({
                                statusPageDatiFatturazione:'immutable',
                                datiFatturazioneNotCompleted:false
                            });
                            navigate(PathPf.LISTA_COMMESSE);
                        }
                    }).catch(err => {
                        setOpenModalLoading(false);
                        manageError(err,dispatchMainState);
                    });
            }
        }else{
            // 2 - se l'user NON ha I dati fatturazione
            const bodyPagoPa = {
                tipoCommessa:datiFatturazione.tipoCommessa,
                splitPayment:datiFatturazione.splitPayment,
                cup: datiFatturazione.cup,
                notaLegale:datiFatturazione.notaLegale,
                idDocumento:datiFatturazione.idDocumento,
                codCommessa:datiFatturazione.codCommessa,
                contatti:datiFatturazione.contatti,
                dataDocumento:new Date().toISOString(),
                pec:datiFatturazione.pec,
                idEnte:profilo.idEnte,
                prodotto:profilo.prodotto
            };
            const {idEnte,prodotto,...body} = bodyPagoPa;
            // 2 - ed è un utente PAGOPA
            if(profilo.auth === 'PAGOPA'){
                await insertDatiFatturazionePagoPa( token,profilo.nonce, bodyPagoPa).then(()  =>{
                    setOpenModalLoading(false);
                    handleModifyMainState({
                        statusPageDatiFatturazione:'immutable',
                        datiFatturazione:true
                    });
                }).catch(err =>{
                    setOpenModalLoading(false);
                    manageError(err,dispatchMainState);
                });
                
            }else{
                // 2 - ED è UN UTENTE SELFCARE
                        
                await insertDatiFatturazione(body, token,profilo.nonce).then(() =>{
                    setOpenModalLoading(false);
                    if(mainState.inserisciModificaCommessa === 'INSERT'){
                        handleModifyMainState({
                            statusPageDatiFatturazione:'immutable',
                            datiFatturazione:true,
                            statusPageInserimentoCommessa:'mutable',
                            mese:new Date().getMonth()+2,
                            anno:new Date().getFullYear(),
                            datiFatturazioneNotCompleted:false
                        });
                                
                        navigate(PathPf.MODULOCOMMESSA);
                    }else{
                        handleModifyMainState({
                            statusPageDatiFatturazione:'immutable',
                            datiFatturazione:true,
                            datiFatturazioneNotCompleted:false
                        });
                        navigate(PathPf.LISTA_COMMESSE);
                    }  
                }).catch(err =>{
                    setOpenModalLoading(false);
                    manageError(err,dispatchMainState);
                }); 
                        
            } 
        }   
    };
            
    const onIndietroButtonPagoPa = () =>{
        if(mainState.statusPageDatiFatturazione === 'immutable' &&  profilo.auth === 'PAGOPA'){
            navigate(PathPf.LISTA_DATI_FATTURAZIONE);
        }else{
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:'INDIETRO_BUTTON'}}));
        }
    };
            
    // check su ogni elemento dello state statusBottonConferma
    const enableDisableConferma = Object.values(statusBottonConferma).every(element => element === false);
   
    const ifAnyTextAreaIsEmpty = (
        datiFatturazione.notaLegale === false 
                || datiFatturazione.pec === ''
                || datiFatturazione.contatti.length === 0
    );
    
    if(loadingData){
        return(
            <SuspenseDatiFatturazione></SuspenseDatiFatturazione>
        );
                
    }
    return (
                
        <div >
            <PageTitleNavigation dispatchMainState={dispatchMainState} setOpen={setOpenBasicModal_DatFat_ModCom} mainState={mainState} /> 
            {/* tab 1 e 2 start */}
            <div className='mt-5'>
                <TabAreaPersonaleUtente mainState={mainState} datiFatturazione={datiFatturazione} setDatiFatturazione={setDatiFatturazione} setStatusButtonConferma={setStatusButtonConferma} />
            </div>
            <div>
                {mainState.statusPageDatiFatturazione === 'immutable' ? null : (
                    <div className="d-flex justify-content-between m-5 ">
                        <Button
                            onClick={() => onIndietroButtonPagoPa()}
                            disabled={mainState.datiFatturazione === false || mainState.statusPageDatiFatturazione === 'immutable' }
                            variant="outlined"
                            size="medium"
                        >
                    Indietro
                        </Button>
                        <Button
                            variant="contained"
                            size="medium"
                            type='submit'
                            onClick={(e) => hendleSubmitDatiFatturazione(e)}
                            disabled={!enableDisableConferma || ifAnyTextAreaIsEmpty}
                        >
                    Salva
                        </Button>
                    </div>
                )}
            </div>
            <BasicModal setOpen={setOpenBasicModal_DatFat_ModCom} open={openBasicModal_DatFat_ModCom} dispatchMainState={dispatchMainState} getDatiFat={getDatiFat} getDatiFatPagoPa={getDatiFatPagoPa} mainState={mainState}></BasicModal>
            <ModalLoading open={openModalLoading} setOpen={setOpenModalLoading} sentence={'Loading...'}></ModalLoading>
            {/*   <BasicAlerts typeAlert={'error'} setVisible={setAlertVisible}  visible={alertVisible}></BasicAlerts>*/}
        </div>
    );
};
        
export default  AreaPersonaleUtenteEnte;
        
        
        