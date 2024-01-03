import React, { useState, useEffect, createContext  } from 'react';
import { redirect } from '../api/api';
import { useNavigate, useLocation } from 'react-router';
import '../style/areaPersonaleUtenteEnte.css';
import { Button } from '@mui/material';
import TabAreaPersonaleUtente from '../components/areaPersonale/tabAreaPersonaleUtente';
import PageTitleNavigation from '../components/areaPersonale/pageTitleNavigation';
import {
    AreaPersonaleContext,
    DatiFatturazione,
    StateEnableConferma,
    AreaPersonaleProps,
    DatiFatturazionePost,
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
   
  
    const [user, setUser] = useState('old');
  
    const navigate = useNavigate();
   
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


  
 
    console.log({datiFatturazione});
    const [statusBottonConferma, setStatusBottmConferma] = useState<StateEnableConferma>({
        'CUP':false,
        'CIG':false,
        'Mail Pec':false,
        'ID Documento':false,
        "Codice. Commessa/Convenzione":false,
    });
   
    const enableDisableConferma = Object.values(statusBottonConferma).every(element => element === false);
   
    const ifAnyTextAreaIsEmpty = (
        datiFatturazione.notaLegale === false 
     || datiFatturazione.pec === ''
     || datiFatturazione.contatti.length === 0
    );
  
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

   
   

  

    const getDatiFat = async () =>{
      
        await getDatiFatturazione(token,mainState.nonce).then((res:SuccesResponseGetDatiFatturazione ) =>{   
            setUser('old');
            setDatiFatturazione(res.data); 
           
        }).catch(err =>{
           
            if(err.response.status === 401){
                localStorage.removeItem("token");
                localStorage.removeItem("profilo");
                navigate('/error');
            }else if(err.response.status === 404){

                setUser('new');
            }else if(err.response.status === 419){

                navigate('/error');
            }
            navigate('/error');
            // setUser('new');
            setMainState((prev:any)=>({...prev, ...{statusPageDatiFatturazione:'mutable'}}));
            
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
   
    const getDatiFatPagoPa = async () =>{

        await getDatiFatturazionePagoPa(token,mainState.nonce, profilo.idEnte, profilo.prodotto ).then((res:SuccesResponseGetDatiFatturazione) =>{   
            setUser('old');
            console.log(res.data, '2 gennaio');
            setDatiFatturazione(res.data); 
           
        }).catch(err =>{
           
            if(err.response.status === 401){
                localStorage.removeItem("token");
                localStorage.removeItem("profilo");
                navigate('/error');
            }else if(err.response.status === 404){

                setUser('new');
            }else if(err.response.status === 419){

                navigate('/error');
            }
            // navigate('/error');
            // setUser('new');
            setMainState((prev:any)=>({...prev, ...{statusPageDatiFatturazione:'mutable'}}));
            
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

    useEffect(()=>{
        if(token === undefined){
            window.location.href = redirect;
        }
    },[]);

    const actionOnResponseModifyDatiFatturazione = () =>{
        if(mainState.action === 'DATI_FATTURAZIONE'){
            setMainState((prev:any)=>({...prev, ...{
                statusPageDatiFatturazione:'immutable',
            }}));
        }else{
            setMainState((prev:any)=>({...prev, ...{
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

       

        if(user === 'old'){

            if(profilo.auth === 'PAGOPA'){

                const newDatiFatturazione = {...datiFatturazione, ...{idEnte:profilo.idEnte,prodotto:profilo.prodotto}};

                modifyDatiFatturazionePagoPa(token,mainState.nonce, newDatiFatturazione ).then((res) =>{

                    actionOnResponseModifyDatiFatturazione();
                
                }).catch(err => {
                    manageError(err, navigate);
                });

            }else{


                console.log({datiFatturazione}, 'GENNAIO');
                modifyDatiFatturazione(datiFatturazione, token,mainState.nonce)
                    .then((res) =>{

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
            
            const body : DatiFatturazionePost = {
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
              

            if(profilo.auth === 'PAGOPA'){
                insertDatiFatturazionePagoPa( token,mainState.nonce, bodyPagoPa).then(res =>{

                    setMainState((prev:any)=>({...prev, ...{
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
                insertDatiFatturazione(body, token,mainState.nonce).then(res =>{
                    setMainState((prev:any)=>({...prev, ...{
                        statusPageDatiFatturazione:'immutable',
                        action:'SHOW_MODULO_COMMESSA'
                    }}));
        
                    // commentato perche penso non serva
                    // navigate('/');
                        
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
                setStatusBottmConferma,
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
                                onClick={() =>setMainState((prev:any)=>({...prev, ...{statusPageDatiFatturazione:'immutable'}}))}
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