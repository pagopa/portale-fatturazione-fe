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
        cig:'',
        idDocumento:'',
        codCommessa:'',
        contatti:[],
        dataCreazione:'',
        dataModifica:'',
        dataDocumento:'',
        pec:''

    }
});

const AreaPersonaleUtenteEnte : React.FC<AreaPersonaleProps> = ({infoModuloCommessa, setInfoModuloCommessa}) => {
   
  
    const [user, setUser] = useState('old');
  

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;


   
  
    const navigate = useNavigate();
   
    const [datiFatturazione, setDatiFatturazione] = useState<DatiFatturazione>({
        tipoCommessa:'',
        splitPayment:false,
        cup: '',
        cig:'',
        idDocumento:'',
        codCommessa:'',
        contatti:[],
        dataCreazione:'',
        dataModifica:'',
        dataDocumento:new Date().toISOString(),
        pec:''

    });
    /*
    const retrieToken = localStorage.getItem('selfcareToken');
  
    if(retrieToken){
        setCheckProfilo(true);
    }

  */

    const [statusBottonConferma, setStatusBottmConferma] = useState<StateEnableConferma>({
        'CUP':false,
        'CIG':false,
        'Mail Pec':false,
        'ID Documento':false,
        "Codice. Commessa/Convenzione":false,
    });
   
    const enableDisableConferma = Object.values(statusBottonConferma).every(element => element === false);
   
    const ifAnyTextAreaIsEmpty = (
        datiFatturazione.cup === ''
     || datiFatturazione.cig === '' 
     || datiFatturazione.pec === ''
     || datiFatturazione.idDocumento === ''
      || datiFatturazione.codCommessa === ''
    );
    const location : any = useLocation();
    const getDatiFat = async () =>{
      
        await getDatiFatturazione(token).then((res:any) =>{   
            setUser('old');
            setDatiFatturazione(res.data); 
           
        }).catch(err =>{
           
            if(err.response.status === 401){
                localStorage.removeItem("token");
                localStorage.removeItem("profilo");
                navigate('/error');
            }else if(err.response.status === 404){

                setUser('new');
            }
            // setUser('new');
            setInfoModuloCommessa((prev:any)=>({...prev, ...{statusPageDatiFatturazione:'mutable'}}));
            
            setDatiFatturazione({
                tipoCommessa:'',
                splitPayment:false,
                cup: '',
                cig:'',
                idDocumento:'',
                codCommessa:'',
                contatti:[],
                dataCreazione:'',
                dataModifica:'',
                dataDocumento:new Date().toISOString(),
                pec:''
        
            });
        });

    };
 


    useEffect(()=>{
        getDatiFat();
    }, []);

   

    const hendleSubmitDatiFatturazione = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) =>{
        e.preventDefault();
        if(user === 'old'){
            modifyDatiFatturazione(datiFatturazione, token)
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
                        navigate('/4');
                    }
                    
                })
                .catch(err => {

                    if(err.response.status === 401){
                        console.log('CU cu');
                        // navigate('/login');
                    }
                });
         

           
        }else{
            const body : DatiFatturazionePost= {
                tipoCommessa:datiFatturazione.tipoCommessa,
                splitPayment:datiFatturazione.splitPayment,
                cup: datiFatturazione.cup,
                cig:datiFatturazione.cig,
                idDocumento:datiFatturazione.idDocumento,
                codCommessa:datiFatturazione.codCommessa,
                contatti:datiFatturazione.contatti,
                dataDocumento:new Date().toISOString(),
                pec:datiFatturazione.pec};

            insertDatiFatturazione(body, token).then(res =>{
                setInfoModuloCommessa((prev:any)=>({...prev, ...{
                    statusPageDatiFatturazione:'immutable',
                    action:'SHOW_MODULO_COMMESSA'
                }}));
                navigate('/4');
                
            }).catch(err =>{
                if(err.response.status === 401){
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