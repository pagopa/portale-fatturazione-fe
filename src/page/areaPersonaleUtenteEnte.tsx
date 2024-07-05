import React, { useState, useEffect} from 'react';
import { manageError, redirect } from '../api/api';
import { useNavigate} from 'react-router';
import '../style/areaPersonaleUtenteEnte.css';
import { Button } from '@mui/material';
import TabAreaPersonaleUtente from '../components/areaPersonale/tabAreaPersonaleUtente';
import PageTitleNavigation from '../components/areaPersonale/pageTitleNavigation';
import {
    DatiFatturazione,
    StateEnableConferma,
    AreaPersonaleProps,
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
import { getProfilo, getStatusApp, getToken, profiliEnti, setInfoToStatusApplicationLoacalStorage } from '../reusableFunction/actionLocalStorage';
import { getDatiModuloCommessa } from '../api/apiSelfcare/moduloCommessaSE/api';
import SuspenseDatiFatturazione from '../components/areaPersonale/skeletonDatiFatturazione';



const AreaPersonaleUtenteEnte : React.FC<AreaPersonaleProps> = ({mainState, dispatchMainState, open, setOpen}) => {
   
    const token =  getToken();
    const profilo =  getProfilo();
    const statusApp = getStatusApp();
    const navigate = useNavigate();
    const enti = profiliEnti();

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    console.log(statusApp, 'DATIFATTURAZIONE');
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

    // se il nonce è presente viene chiamata la get dati fatturazione

    useEffect(()=>{
      
        if(enti){
            // se l'utente NON è pagopa
           
            getDatiFat();
        }else if(profilo.auth === 'PAGOPA'){
            //se l'utente è pagoPa
            getDatiFatPagoPa();
        }
        
      
    },[]);
  
        
 

    // se non c'è il token viene fatto il redirect al portale di accesso 
    useEffect(()=>{
        if(token === undefined){
            window.location.href = redirect;
        }
        /* se l'utente PagoPA modifa l'url e cerca di accedere al path '/' 
        senza aver prima selezionato una row della grid lista dati fatturazione viene fatto il redirect automatico a  PathPf.LISTA_DATI_FATTURAZIONE*/
        if(profilo.auth === 'PAGOPA' && !profilo.idEnte){
            window.location.href = PathPf.LISTA_DATI_FATTURAZIONE;
        }
    },[]);
   
    // get dati fatturazione SELFCARE
    const getDatiFat = async () =>{
    
        setLoadingData(true);
        await getDatiFatturazione(token,profilo.nonce).then((res:SuccesResponseGetDatiFatturazione ) =>{   
            handleModifyMainState({...statusApp, ...{
                datiFatturazione:true,
                statusPageDatiFatturazione:'immutable'
            }});
            setDatiFatturazione(res.data);
              
            localStorage.setItem('statusApplication',JSON.stringify({...statusApp,
                ...{ datiFatturazione:true}}));

           
            setLoadingData(false);
        }).catch(err =>{

            if(err?.response?.status === 404){
                localStorage.setItem('statusApplication',JSON.stringify({...statusApp,
                    ...{ datiFatturazione:false}}));

                handleModifyMainState({...statusApp, ...{
                    datiFatturazione:false,
                    statusPageDatiFatturazione:'mutable'
                }});
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
                        handleModifyMainState({
                            statusPageDatiFatturazione:'immutable' ,
                        });
                        if(mainState.inserisciModificaCommessa === 'INSERT'){
                            navigate(PathPf.MODULOCOMMESSA);
                        }else{
                            navigate(PathPf.LISTA_COMMESSE);
                        }
                    })
                    .catch(err => {
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
                    if(statusApp.inserisciModificaCommessa === 'INSERT'){
                        handleModifyMainState({
                            statusPageDatiFatturazione:'immutable',
                            datiFatturazione:true,
                            statusPageInserimentoCommessa:'mutable'
                        });
                        console.log(1);
                        setInfoToStatusApplicationLoacalStorage(statusApp,{
                            statusPageDatiFatturazione:'immutable',
                            datiFatturazione:true,
                            statusPageInserimentoCommessa:'mutable'
                        });
                        navigate(PathPf.MODULOCOMMESSA);
                    }else{
                        handleModifyMainState({
                            statusPageDatiFatturazione:'immutable',
                            datiFatturazione:true,
                        });
                        console.log(2);
                        setInfoToStatusApplicationLoacalStorage(statusApp,{
                            statusPageDatiFatturazione:'immutable',
                            datiFatturazione:true,
                        });
                        navigate(PathPf.LISTA_COMMESSE);
                    }  
                }).catch(err =>{
                    setOpenModalLoading(false);
                    manageError(err,dispatchMainState);
                }); 


                // viene fatta questa chiamata solo al primo inserimento dei dati di fatturazione
                // aggiunto 01/07 start
                await getDatiModuloCommessa(token, mainState.nonce).then((res)=>{
                 
                    if(res.data.modifica === true && res.data.moduliCommessa.length === 0 ){
                            
                        handleModifyMainState({
                            inserisciModificaCommessa:'INSERT',
                            statusPageInserimentoCommessa:'mutable',
                            userClickOn:undefined,
                            primoInserimetoCommessa:true
                        });
                        const newState = {
                            mese:res.data.mese,
                            anno:res.data.anno,
                            inserisciModificaCommessa:'INSERT',
                            userClickOn:undefined,
                            primoInserimetoCommessa:true
                        };
    
                        localStorage.setItem('statusApplication',JSON.stringify(newState));
                     
                        navigate(PathPf.MODULOCOMMESSA);
                    }else if(res.data.modifica === true && res.data.moduliCommessa.length > 0 ){
        
                        handleModifyMainState({
                            inserisciModificaCommessa:'MODIFY',
                            statusPageInserimentoCommessa:'immutable',
                            primoInserimetoCommessa:false});
        
                        const newState = {
                            inserisciModificaCommessa:'MODIFY',
                            primoInserimetoCommessa:false
                        };
                        const statusApp = localStorage.getItem('statusApplication')||'{}';
                        const parseStatusApp = JSON.parse(statusApp);
                
                        localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                            ...newState}));
                       
                        navigate(PathPf.LISTA_COMMESSE);
                    }else if(res.data.modifica === false && res.data.moduliCommessa.length === 0){
    
                        handleModifyMainState({
                            inserisciModificaCommessa:'NO_ACTION',
                            statusPageInserimentoCommessa:'immutable',
                            primoInserimetoCommessa:false});
                    
                        const newState = {
                            inserisciModificaCommessa:'NO_ACTION',
                            primoInserimetoCommessa:false
                        };
                        const statusApp = localStorage.getItem('statusApplication')||'{}';
                        const parseStatusApp = JSON.parse(statusApp);
                
                        localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                            ...newState}));
                       
                        navigate(PathPf.LISTA_COMMESSE);
                    }else if(res.data.modifica === false && res.data.moduliCommessa.length > 0){
                        handleModifyMainState({
                            inserisciModificaCommessa:'NO_ACTION',
                            statusPageInserimentoCommessa:'immutable',
                            primoInserimetoCommessa:false}); 
    
                        const newState = {
                            inserisciModificaCommessa:'NO_ACTION',
                            primoInserimetoCommessa:false
                        };
                        const statusApp = localStorage.getItem('statusApplication')||'{}';
                        const parseStatusApp = JSON.parse(statusApp);
                
                        localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                            ...newState}));
                        navigate(PathPf.LISTA_COMMESSE);
                    }
                }).catch((err) =>{
                    manageError(err,dispatchMainState);
                });
                // aggiunto 01/07

                
                
            } 
        }   
    };

    const onIndietroButtonPagoPa = () =>{
        if(mainState.statusPageDatiFatturazione === 'immutable' &&  profilo.auth === 'PAGOPA'){
            navigate(PathPf.LISTA_DATI_FATTURAZIONE);
        }else{
            setOpen(prev => ({...prev, ...{visible:true,clickOn:'INDIETRO_BUTTON'}}));
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
            <PageTitleNavigation dispatchMainState={dispatchMainState} setOpen={setOpen} mainState={mainState} /> 
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
            <BasicModal setOpen={setOpen} open={open} dispatchMainState={dispatchMainState} getDatiFat={getDatiFat} getDatiFatPagoPa={getDatiFatPagoPa} mainState={mainState}></BasicModal>
            <ModalLoading open={openModalLoading} setOpen={setOpenModalLoading} sentence={'Loading...'}></ModalLoading>
            {/*  <BasicAlerts typeAlert={'error'} setVisible={setAlertVisible}  visible={alertVisible}></BasicAlerts>*/}
        </div>
    );
};

export default  AreaPersonaleUtenteEnte;


