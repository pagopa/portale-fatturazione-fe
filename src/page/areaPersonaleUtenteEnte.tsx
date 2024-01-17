import React, { useState, useEffect, createContext  } from 'react';
import { redirect } from '../api/api';
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
import {
    getDatiFatturazione,
    modifyDatiFatturazione,
    insertDatiFatturazione,
    getDatiFatturazionePagoPa,
    modifyDatiFatturazionePagoPa,
    insertDatiFatturazionePagoPa,
    manageError
} from '../api/api';



export const DatiFatturazioneContext = createContext<AreaPersonaleContext>({
    datiFatturazione:{
        idEnte:'',
        tipoCommessa:'',
        splitPayment:false,
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

const AreaPersonaleUtenteEnte : React.FC<AreaPersonaleProps> = ({mainState, setMainState}) => {
   

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    const navigate = useNavigate();

    // set dello stato user , se l'user ha dati fatturazione === old altrimenti === new
    const [user, setUser] = useState('old');
  
   
   
    const [datiFatturazione, setDatiFatturazione] = useState<DatiFatturazione>({
        tipoCommessa:'',
        idEnte:'',
        splitPayment:false,
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
      
        await getDatiFatturazione(token,mainState.nonce).then((res:SuccesResponseGetDatiFatturazione ) =>{   
            setUser('old');
            setDatiFatturazione(res.data); 
           
        }).catch(err =>{
            // setUser('new');
            setMainState((prev:MainState)=>({...prev, ...{statusPageDatiFatturazione:'mutable'}}));
            
            setDatiFatturazione({
                tipoCommessa:'',
                idEnte:'',
                splitPayment:false,
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

        await getDatiFatturazionePagoPa(token,mainState.nonce, profilo.idEnte, profilo.prodotto ).then((res:SuccesResponseGetDatiFatturazione) =>{   
            setUser('old');
           
            setDatiFatturazione(res.data); 
           
        }).catch(err =>{
           
            manageError(err, navigate);
            // navigate('/error');
            // setUser('new');
            setMainState((prev:MainState)=>({...prev, ...{statusPageDatiFatturazione:'mutable'}}));
            
            setDatiFatturazione({
                tipoCommessa:'',
                idEnte:'',
                splitPayment:false,
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
        });
    };
 

    // se il nonce è presente viene chiamata la get dati fatturazione
    useEffect(()=>{
        if(mainState.nonce !== ''){
            if(profilo.auth !== 'PAGOPA'){
                // se l'utente NON è pagopa
                getDatiFat();
            }else{
                //se l'utente è pagoPa
                getDatiFatPagoPa();
            }
        }
    }, [mainState.nonce]);

    // se non c'è il token viene fatto il redirect al portale di accesso 
    useEffect(()=>{
        if(token === undefined){
            window.location.href = redirect;
        }
    },[]);


    // funzione richiamata in entrambe le funzioni modify dati fatturazione lato selcare e pagopa

    const actionOnResponseModifyDatiFatturazione = () =>{
        if(mainState.action === 'DATI_FATTURAZIONE'){
            setMainState((prev:MainState)=>({...prev, ...{
                statusPageDatiFatturazione:'immutable',
            }}));
        }else{
            setMainState((prev:MainState)=>({...prev, ...{
                statusPageDatiFatturazione:'immutable',
                action:'SHOW_MODULO_COMMESSA'
            }}));
        
            const statusApp = localStorage.getItem('statusApplication')||'{}';
            const parseStatusApp = JSON.parse(statusApp);
        
            localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                ...{ statusPageDatiFatturazione:'immutable',
                    action:'SHOW_MODULO_COMMESSA'
                }}));
        }

    };

   

    const hendleSubmitDatiFatturazione = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) =>{
        e.preventDefault();
        //  1 - se l'user ha già dati fatturazione
        if(user === 'old'){
            // 1 - ed è un utente PAGOPA
            if(profilo.auth === 'PAGOPA'){

                const newDatiFatturazione = {...datiFatturazione, ...{idEnte:profilo.idEnte,prodotto:profilo.prodotto}};

                modifyDatiFatturazionePagoPa(token,mainState.nonce, newDatiFatturazione ).then(() =>{

                    actionOnResponseModifyDatiFatturazione();
                
                }).catch(err => {
                    manageError(err, navigate);
                });

            }else{
                // 1 - ed è un utente SELFCARE
                modifyDatiFatturazione(datiFatturazione, token,mainState.nonce)
                    .then(() =>{

                        actionOnResponseModifyDatiFatturazione();
                    
                    })
                    .catch(err => {
                        if(err.response?.status === 401){  
                            navigate('/error');
                        }else if(err.response.status === 419){

                            navigate('/error');
                        }
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
                insertDatiFatturazionePagoPa( token,mainState.nonce, bodyPagoPa).then(()  =>{
                    
                    setMainState((prev:MainState)=>({...prev, ...{
                        statusPageDatiFatturazione:'immutable',
                        action:'SHOW_MODULO_COMMESSA'
                    }}));
                }).catch(err =>{

                    if(err.response.status === 401){
                        navigate('/error');
                    }else if(err.response.status === 419){
        
                        navigate('/error');
                    }

                });

            }else{
                // 2 - ED è UN UTENTE SELFCARE
                insertDatiFatturazione(body, token,mainState.nonce).then(() =>{
                    setMainState((prev:MainState)=>({...prev, ...{
                        statusPageDatiFatturazione:'immutable',
                        action:'SHOW_MODULO_COMMESSA'
                    }}));
          
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
                setMainState,
                setStatusButtonConferma,
                user,
                mainState}}>

            <div >
                
                {mainState.action !== "HIDE_MODULO_COMMESSA" ?
                    <PageTitleNavigation /> : null
                }
                
                {/* tab 1 e 2 start */}
               
                <TabAreaPersonaleUtente />

                <div>

                    {mainState.statusPageDatiFatturazione === 'immutable' ? null : (
                        <div className="d-flex justify-content-between m-5 ">

                            <Button
                                onClick={() =>setMainState((prev:MainState)=>({...prev, ...{statusPageDatiFatturazione:'immutable'}}))}
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
              Conferma

                            </Button>


                        </div>
                    )}

                </div>

            </div>
        </DatiFatturazioneContext.Provider>
    );
};

export default  AreaPersonaleUtenteEnte;