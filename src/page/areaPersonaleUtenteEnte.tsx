import React, { useState, useEffect, createContext  } from 'react';
import { manageError, redirect } from '../api/api';
import { useNavigate} from 'react-router';
import '../style/areaPersonaleUtenteEnte.css';
import { Button } from '@mui/material';
import TabAreaPersonaleUtente from '../components/areaPersonale/tabAreaPersonaleUtente';
import PageTitleNavigation from '../components/areaPersonale/pageTitleNavigation';
import { MainState } from '../types/typesGeneral';
import {
    AreaPersonaleContext,
    DatiFatturazione,
    StateEnableConferma,
    AreaPersonaleProps,
    SuccesResponseGetDatiFatturazione
} from '../types/typesAreaPersonaleUtenteEnte';
import {  getDatiFatturazione,
    modifyDatiFatturazione,
    insertDatiFatturazione,} from '../api/apiSelfcare/datiDiFatturazioneSE/api';
import {  getDatiFatturazionePagoPa,
    modifyDatiFatturazionePagoPa,
    insertDatiFatturazionePagoPa, } from '../api/apiPagoPa/datiDiFatturazionePA/api';

export const DatiFatturazioneContext = createContext<AreaPersonaleContext>({
    datiFatturazione:{
        idEnte:'',
        tipoCommessa:'',
        splitPayment:true,
        cup: '',
        idDocumento:'',
        codCommessa:'',
        contatti:[],
        dataCreazione:'',
        dataModifica:'',
        dataDocumento:'',
        pec:'',
        notaLegale:false

    }
});

const AreaPersonaleUtenteEnte : React.FC<AreaPersonaleProps> = ({mainState, dispatchMainState}) => {
   
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    const navigate = useNavigate();

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
  
   
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
        notaLegale:false

    });
  
    console.log({datiFatturazione});
    // state creato per il tasto conferma , abilitato nel caso in cui tutti values sono true
    const [statusBottonConferma, setStatusButtonConferma] = useState<StateEnableConferma>({
        'CUP':false,
        'CIG':false,
        'Mail Pec':false,
        'ID Documento':false,
        "Codice. Commessa/Convenzione":false,
    });
   
    // check su ogni elemento dello state statusBottonConferma
    const enableDisableConferma = Object.values(statusBottonConferma).every(element => element === false);
   
    const ifAnyTextAreaIsEmpty = (
        datiFatturazione.notaLegale === false 
     || datiFatturazione.pec === ''
     || datiFatturazione.contatti.length === 0
    );
   
    // get dati fatturazione SELFCARE
    const getDatiFat = async () =>{
      
        await getDatiFatturazione(token,profilo.nonce).then((res:SuccesResponseGetDatiFatturazione ) =>{   
           
            setDatiFatturazione(res.data); 

            const statusApp = localStorage.getItem('statusApplication')||'{}';
            const parseStatusApp = JSON.parse(statusApp);
        
            localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                ...{ datiFatturazione:true}}));

            handleModifyMainState({...parseStatusApp, ...{
                datiFatturazione:true,
                statusPageDatiFatturazione:'immutable'
            }});
           
        }).catch(err =>{
           
            if(err?.response?.status === 401){
                localStorage.removeItem("token");
                localStorage.removeItem("profilo");
                navigate('/error');
            }else if(err?.response?.status === 404){
                const statusApp = localStorage.getItem('statusApplication')||'{}';
                const parseStatusApp = JSON.parse(statusApp);
            
                localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                    ...{ datiFatturazione:false}}));

                handleModifyMainState({...parseStatusApp, ...{
                    datiFatturazione:false,
                    statusPageDatiFatturazione:'mutable'
                }});
            }else if(err?.response?.status === 419){

                navigate('/error');
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
                notaLegale:false
        
            });

            manageError(err, navigate);
        });

    };
   
    // get dati fatturazione PAGOPA
    const getDatiFatPagoPa = async () =>{

        await getDatiFatturazionePagoPa(token,profilo.nonce, profilo.idEnte, profilo.prodotto ).then((res:SuccesResponseGetDatiFatturazione) =>{   
            handleModifyMainState({
                datiFatturazione:true,
                statusPageDatiFatturazione:'immutable'
            });
        
            setDatiFatturazione(res.data); 
           
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
                notaLegale:false
        
            });
            manageError(err, navigate);
        });
    };

    // se il nonce è presente viene chiamata la get dati fatturazione
    useEffect(()=>{
        if(profilo.nonce !== undefined){
            if(profilo.auth === 'SELFCARE'){
                // se l'utente NON è pagopa
                getDatiFat();
            }else{
                //se l'utente è pagoPa
                getDatiFatPagoPa();
            }
        }
    }, [profilo.nonce]);

    // se non c'è il token viene fatto il redirect al portale di accesso 
    useEffect(()=>{
        if(token === undefined){
            window.location.href = redirect;
        }

        /* se l'utente PagoPA modifa l'url e cerca di accedere al path '/' 
        senza aver prima selezionato una row della grid lista dati fatturazione viene fatto il redirect automatico a  '/pagopalistadatifatturazione'*/
        if(profilo.auth === 'PAGOPA' && !profilo.idEnte){
            window.location.href = '/pagopalistadatifatturazione';
        }
    },[]);

   
    const hendleSubmitDatiFatturazione = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) =>{
        e.preventDefault();
        const statusApp = localStorage.getItem('statusApplication')||'{}';
        const parseStatusApp = JSON.parse(statusApp);
        //  1 - se l'user ha già dati fatturazione
        if(mainState.datiFatturazione === true){
            // 1 - ed è un utente PAGOPA
            if(profilo.auth === 'PAGOPA'){

                const newDatiFatturazione = {...datiFatturazione, ...{idEnte:profilo.idEnte,prodotto:profilo.prodotto}};

                modifyDatiFatturazionePagoPa(token,profilo.nonce, newDatiFatturazione ).then(() =>{

                    handleModifyMainState({
                        statusPageDatiFatturazione:'immutable',
                    });
                
                }).catch(err => {
                    manageError(err, navigate);
                });

            }else{
                // 1 - ed è un utente SELFCARE
                modifyDatiFatturazione(datiFatturazione, token,profilo.nonce)
                    .then(() =>{
                       
                        handleModifyMainState({
                            statusPageDatiFatturazione:'immutable',
                        });
                        if(mainState.inserisciModificaCommessa === 'INSERT'){
                            navigate('/8');
                        }else{
                            navigate('/4');
                        }
                    })
                    .catch(err => {
                        manageError(err, navigate);
                    });
            }
        }else{
            // 2 - se l'user NON ha I dati fatturazione
            const body = {
                tipoCommessa:datiFatturazione.tipoCommessa,
                splitPayment:datiFatturazione.splitPayment,
                cup: datiFatturazione.cup,
                notaLegale:datiFatturazione.notaLegale,
                idDocumento:datiFatturazione.idDocumento,
                codCommessa:datiFatturazione.codCommessa,
                contatti:datiFatturazione.contatti,
                dataDocumento:new Date().toISOString(),
                pec:datiFatturazione.pec};

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
              
            // 2 - ed è un utente PAGOPA
            if(profilo.auth === 'PAGOPA'){
                insertDatiFatturazionePagoPa( token,profilo.nonce, bodyPagoPa).then(()  =>{
                    
                    handleModifyMainState({
                        statusPageDatiFatturazione:'immutable',
                        datiFatturazione:true
                    });
                 
                }).catch(err =>{
                    if(err?.response?.status === 401){
                        navigate('/error');
                    }else if(err?.response?.status === 419){
                        navigate('/error');
                    }
                });

            }else{
                // 2 - ED è UN UTENTE SELFCARE
                insertDatiFatturazione(body, token,profilo.nonce).then(() =>{
                  
                  
                    if(parseStatusApp.inserisciModificaCommessa === 'INSERT'){
                        handleModifyMainState({
                            statusPageDatiFatturazione:'immutable',
                            datiFatturazione:true,
                            statusPageInserimentoCommessa:'mutable'
                        });
                       
                    
                        localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                            ...{
                                statusPageDatiFatturazione:'immutable',
                                datiFatturazione:true,
                                statusPageInserimentoCommessa:'mutable'
                            }}));
                        navigate('/8');
                    }else{
                        handleModifyMainState({
                            statusPageDatiFatturazione:'immutable',
                            datiFatturazione:true,
                        });

                        localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                            ...{
                                statusPageDatiFatturazione:'immutable',
                                datiFatturazione:true,
                            }}));
                        navigate('/4');
                    }  
                }).catch(err =>{
                    if(err.response.status === 401){
                        navigate('/error');
                    }else if(err.response.status === 419){
        
                        navigate('/error');
                    }
                });
                    
            }
            
        }
         
    };

    return (
        <DatiFatturazioneContext.Provider
            value={{
                datiFatturazione,
                setDatiFatturazione,
                setStatusButtonConferma,
                mainState}}>

            <div >
                
                <PageTitleNavigation dispatchMainState={dispatchMainState} /> 
                {/* tab 1 e 2 start */}
                <div className='mt-5'>
                    <TabAreaPersonaleUtente />
                </div>
                <div>

                    {mainState.statusPageDatiFatturazione === 'immutable' ? null : (
                        <div className="d-flex justify-content-between m-5 ">

                            <Button
                                onClick={() => handleModifyMainState({statusPageDatiFatturazione:'immutable'})}
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

            </div>
        </DatiFatturazioneContext.Provider>
    );
};

export default  AreaPersonaleUtenteEnte;