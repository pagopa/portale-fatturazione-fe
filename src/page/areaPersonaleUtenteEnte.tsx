import React, { useState, useEffect, createContext  } from 'react';
import { useNavigate, useLocation } from 'react-router';
import '../style/areaPersonaleUtenteEnte.css';
import { Button } from '@mui/material';
import TabAreaPersonaleUtente from '../components/tabAreaPersonaleUtente';
import PageTitleNavigation from '../components/pageTitleNavigation';
import {AreaPersonaleContext, DatiFatturazione, StateEnableConferma, DatiFatturazionePost,AreaPersonaleProps} from '../types/typesAreaPersonaleUtenteEnte';
import {getDatiFatturazione, modifyDatiFatturazione,insertDatiFatturazione} from '../api/api';



export const DatiFatturazioneContext = createContext<AreaPersonaleContext>({
    datiFatturazione:{
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

const AreaPersonaleUtenteEnte : React.FC<AreaPersonaleProps> = ({infoModuloCommessa, setInfoModuloCommessa}) => {
   
  
    const [user, setUser] = useState('old');
  


   
  
    const navigate = useNavigate();
   
    const [datiFatturazione, setDatiFatturazione] = useState<DatiFatturazione>({
        tipoCommessa:'',
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
    const location : any = useLocation();


    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

   

  

    const getDatiFat = async () =>{
      
        await getDatiFatturazione(token,infoModuloCommessa.nonce).then((res:any) =>{   
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
            setInfoModuloCommessa((prev:any)=>({...prev, ...{statusPageDatiFatturazione:'mutable'}}));
            
            setDatiFatturazione({
                tipoCommessa:'',
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
        if(infoModuloCommessa.nonce !== ''){
            getDatiFat();
       
        }
    }, [infoModuloCommessa.nonce]);

    useEffect(()=>{
        if(token === undefined){
            window.location.href = 'https://uat.selfcare.pagopa.it/';
        }
    },[]);

   

    const hendleSubmitDatiFatturazione = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) =>{
        e.preventDefault();
        if(user === 'old'){
            modifyDatiFatturazione(datiFatturazione, token,infoModuloCommessa.nonce)
                .then((res) =>{

                    if(infoModuloCommessa.action === 'DATI_FATTURAZIONE'){
                        setInfoModuloCommessa((prev:any)=>({...prev, ...{
                            statusPageDatiFatturazione:'immutable',
                        }}));
                    }else{
                        setInfoModuloCommessa((prev:any)=>({...prev, ...{
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
                    
                })
                .catch(err => {

                    if(err.response?.status === 401){
                        
                        navigate('/error');
                    }else if(err.response.status === 419){

                        navigate('/error');
                    }
                });
         

           
        }else{
            const body : DatiFatturazionePost= {
                tipoCommessa:datiFatturazione.tipoCommessa,
                splitPayment:datiFatturazione.splitPayment,
                cup: datiFatturazione.cup,
                notaLegale:datiFatturazione.notaLegale,
                idDocumento:datiFatturazione.idDocumento,
                codCommessa:datiFatturazione.codCommessa,
                contatti:datiFatturazione.contatti,
                dataDocumento:new Date().toISOString(),
                pec:datiFatturazione.pec};

            insertDatiFatturazione(body, token,infoModuloCommessa.nonce).then(res =>{
                setInfoModuloCommessa((prev:any)=>({...prev, ...{
                    statusPageDatiFatturazione:'immutable',
                    action:'SHOW_MODULO_COMMESSA'
                }}));
                navigate('/');
                
            }).catch(err =>{
                if(err.response.status === 401){
                    navigate('/error');
                }else if(err.response.status === 419){

                    navigate('/error');
                }
            });
            
        }
    
         
    };
 

    

    return (
        <DatiFatturazioneContext.Provider
            value={{
                datiFatturazione,
                setDatiFatturazione,
                setInfoModuloCommessa,
                setStatusBottmConferma,
                user,
                infoModuloCommessa}}>

            <div >
                
                {infoModuloCommessa.action !== "HIDE_MODULO_COMMESSA" ?
                    <PageTitleNavigation /> : null
                }
                
                {/* tab 1 e 2 start */}
               
                <TabAreaPersonaleUtente />

                <div>

                    {infoModuloCommessa.statusPageDatiFatturazione === 'immutable' ? null : (
                        <div className="d-flex justify-content-between m-5 ">

                            <Button
                                onClick={() =>setInfoModuloCommessa((prev:any)=>({...prev, ...{statusPageDatiFatturazione:'immutable'}}))}
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