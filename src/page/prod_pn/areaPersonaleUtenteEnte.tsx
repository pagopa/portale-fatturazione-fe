import React, { useState, useEffect, useContext} from 'react';
import { manageError, managePresaInCarico, redirect } from '../../api/api';
import { useNavigate} from 'react-router';
import '../../style/areaPersonaleUtenteEnte.css';
import { Button } from '@mui/material';
import TabAreaPersonaleUtente from '../../components/areaPersonale/tabAreaPersonaleUtente';
import PageTitleNavigation from '../../components/areaPersonale/pageTitleNavigation';
import {
    DatiFatturazione,
    DatiFatturazionePostPagopa,
    StateEnableConferma,
    SuccesResponseGetDatiFatturazione
} from '../../types/typesAreaPersonaleUtenteEnte';
import {  getDatiFatturazione,
    modifyDatiFatturazione,
    insertDatiFatturazione, 
    getSdi} from '../../api/apiSelfcare/datiDiFatturazioneSE/api';
import {  getDatiFatturazionePagoPa,
    modifyDatiFatturazionePagoPa,
    insertDatiFatturazionePagoPa,
    getSdiPagoPa, } from '../../api/apiPagoPa/datiDiFatturazionePA/api';
import BasicModal from '../../components/reusableComponents/modals/modal';
import ModalLoading from '../../components/reusableComponents/modals/modalLoading';
import {PathPf} from '../../types/enum';
import { profiliEnti, } from '../../reusableFunction/actionLocalStorage';
import SuspenseDatiFatturazione from '../../components/areaPersonale/skeletonDatiFatturazione';
import { GlobalContext } from '../../store/context/globalContext';
import ModalInfo from '../../components/reusableComponents/modals/modalInfo';
import { toLocalISOString } from '../../reusableFunction/function';
        
        
        
const AreaPersonaleUtenteEnte : React.FC = () => {

    const globalContextObj = useContext(GlobalContext);
    const {
        dispatchMainState,
        mainState,
        openBasicModal_DatFat_ModCom,
        setOpenBasicModal_DatFat_ModCom,
        setOpenModalInfo,
        openModalInfo,
        setErrorAlert
    } = globalContextObj;
   
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();
    const enti = profiliEnti(mainState);

    if(!profilo.idEnte && profilo.auth === 'PAGOPA'){
        navigate(PathPf.LISTA_DATI_FATTURAZIONE);
    }
            
    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
  
    const [openModalLoading, setOpenModalLoading] = useState(false);
    const [openModalVerifica, setOpenModalVerifica] = useState(false);
    
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
        dataDocumento:null,
        pec:'',
        notaLegale:false,
        prodotto:'',
        map:'',
        id:0,
        codiceSDI:null,
        contractCodiceSDI:null

    });

            
    // state creato per il tasto conferma , abilitato nel caso in cui tutti values sono true
    const [statusBottonConferma, setStatusButtonConferma] = useState<StateEnableConferma>({
        'CUP':false,
        'CIG':false,
        'PEC':false,
        'ID Documento':false,
        "Codice Commessa/Convenzione":false,
        "Codice univoco o SDI":false,
        "dataDocumento":false,
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
            let result = res.data;
            if(res.data.codiceSDI === null || res.data.codiceSDI === ''){
                result = {...res.data, codiceSDI:res.data.contractCodiceSDI};
            }
           
            setDatiFatturazione(result);
            setLoadingData(false);   
        }).catch(async(err) =>{ 
            if(err?.response?.status === 404){
                // se l'ente non ha i dati di fatturazione potrebbe avere lo SDI
                await getSdi(token,profilo.nonce).then((res)=>{
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
                        id:0,
                        codiceSDI:res.data.contractCodiceSDI,
                        contractCodiceSDI:null
                    });
                }).catch((err)=>{
                    manageError(err,dispatchMainState);
                });

            }
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
            let result = res.data;
            if(res.data.codiceSDI === null || res.data.codiceSDI === ''){
                result = {...res.data, codiceSDI:res.data.contractCodiceSDI};
            }
            setDatiFatturazione(result); 
            setLoadingData(false);
        }).catch(async(err) =>{
           
            if(err?.response?.status !== 404){
                manageError(err,dispatchMainState);
                navigate(PathPf.LISTA_DATI_FATTURAZIONE); 
            }

            await getSdiPagoPa(token,profilo.nonce,profilo.idEnte, profilo.prodotto).then((res)=>{
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
                    id:0,
                    codiceSDI:res.data.contractCodiceSDI,
                    contractCodiceSDI:null
                });
                handleModifyMainState({
                    datiFatturazione:false,
                    statusPageDatiFatturazione:'mutable'
                });
                
            }).catch((err)=>{
                manageError(err,dispatchMainState);
            });
           
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
                console.log({UP:datiFatturazione});
                const newDatiFatturazione:DatiFatturazionePostPagopa = {...datiFatturazione, ...{idEnte:profilo.idEnte,prodotto:profilo.prodotto,dataDocumento:datiFatturazione.dataDocumento ? toLocalISOString(new Date(datiFatturazione.dataDocumento)):null}};
                console.log({DOWN:newDatiFatturazione});
                await modifyDatiFatturazionePagoPa(token,profilo.nonce, newDatiFatturazione ).then(() =>{
                    setOpenModalLoading(false);
                    handleModifyMainState({
                        statusPageDatiFatturazione:'immutable',
                    });
                    console.log("DONE");
                    getDatiFatPagoPa();
                    managePresaInCarico("SAVE_DATIFATTURAZIONE_OK",dispatchMainState);
                }).catch(err => {
                    setOpenModalLoading(false);
                    setErrorAlert({error:err.response.status,message:err.response.data.detail});
                });
            }else{
                // 1 - ed è un utente SELFCARE
                await modifyDatiFatturazione(datiFatturazione, token,profilo.nonce)
                    .then(() =>{
                        setOpenModalLoading(false);
                       
                        handleModifyMainState({
                            statusPageDatiFatturazione:'immutable',
                            datiFatturazioneNotCompleted:false
                        });
                       
                        getDatiFat();
                        managePresaInCarico("SAVE_DATIFATTURAZIONE_OK",dispatchMainState);
                    }).catch(err => {
                        setOpenModalLoading(false);
                        setErrorAlert({error:err.response.status,message:err.response.data.detail});
                    });
            }
        }else{
            // 2 - se l'user NON ha I dati fatturazione
            const bodyPagoPa:DatiFatturazionePostPagopa  = {
                tipoCommessa:datiFatturazione.tipoCommessa,
                splitPayment:datiFatturazione.splitPayment,
                cup: datiFatturazione.cup,
                notaLegale:datiFatturazione.notaLegale,
                idDocumento:datiFatturazione.idDocumento,
                codCommessa:datiFatturazione.codCommessa,
                contatti:datiFatturazione.contatti,
                dataDocumento:datiFatturazione.dataDocumento ? toLocalISOString(new Date(datiFatturazione.dataDocumento)):null,
                pec:datiFatturazione.pec,
                idEnte:profilo.idEnte,
                prodotto:profilo.prodotto,
                codiceSDI:datiFatturazione.codiceSDI
            };
            const {idEnte,prodotto,...body} = bodyPagoPa;
            // 2 - ed è un utente PAGOPA
            if(profilo.auth === 'PAGOPA'){
                console.log({bodyPagoPa});
                await insertDatiFatturazionePagoPa( token,profilo.nonce, bodyPagoPa).then(()  =>{
                    setOpenModalLoading(false);
                    handleModifyMainState({
                        statusPageDatiFatturazione:'immutable',
                        datiFatturazione:true
                    });
                    getDatiFatPagoPa();
                    managePresaInCarico("SAVE_DATIFATTURAZIONE_OK",dispatchMainState);
                }).catch(err =>{
                    setOpenModalLoading(false);
                    setErrorAlert({error:err.response.status,message:err.response.data.detail});
                });
                
            }else{
                // 2 - ED è UN UTENTE SELFCARE   
                await insertDatiFatturazione(body, token,profilo.nonce).then(() =>{
                    setOpenModalLoading(false);
                   
                    handleModifyMainState({
                        statusPageDatiFatturazione:'immutable',
                        datiFatturazione:true,
                        datiFatturazioneNotCompleted:false
                    });
                    getDatiFat();
                    managePresaInCarico("SAVE_DATIFATTURAZIONE_OK",dispatchMainState);
                     
                }).catch(err =>{
                    setOpenModalLoading(false);
                    setErrorAlert({error:err.response.status,message:err.response.data.detail});
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
                || datiFatturazione.codiceSDI === ''
                || datiFatturazione.codiceSDI === null
    );


    if(loadingData){
        return(
            <SuspenseDatiFatturazione></SuspenseDatiFatturazione>
        );
                
    }

    return (
                
        <div >
            <PageTitleNavigation  setOpen={setOpenBasicModal_DatFat_ModCom}  /> 
            {/* tab 1 e 2 start */}
            <div className='mt-5'>
                <TabAreaPersonaleUtente mainState={mainState} datiFatturazione={datiFatturazione} setDatiFatturazione={setDatiFatturazione} setStatusButtonConferma={setStatusButtonConferma} setOpenModalVerifica={setOpenModalVerifica} />
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
            <ModalInfo setOpen={setOpenModalInfo} open={openModalInfo}></ModalInfo>
            <BasicModal setOpen={setOpenBasicModal_DatFat_ModCom} open={openBasicModal_DatFat_ModCom} dispatchMainState={dispatchMainState} getDatiFat={getDatiFat} getDatiFatPagoPa={getDatiFatPagoPa} mainState={mainState}></BasicModal>
            <ModalLoading open={openModalLoading} setOpen={setOpenModalLoading} sentence={'Loading...'}></ModalLoading>
            <ModalLoading open={openModalVerifica} setOpen={setOpenModalVerifica} sentence={'Loading...'} sentence2={'Verifica del codice SDI in corso'}></ModalLoading>
            {/*   <BasicAlerts typeAlert={'error'} setVisible={setAlertVisible}  visible={alertVisible}></BasicAlerts>*/}
        </div>
    );
};
        
export default  AreaPersonaleUtenteEnte;
        
        
        