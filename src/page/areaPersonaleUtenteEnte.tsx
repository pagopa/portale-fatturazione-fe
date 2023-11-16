import React, { useState, useEffect, createContext  } from 'react';

import '../style/areaPersonaleUtenteEnte.css';
import { Button } from '@mui/material';
import TabAreaPersonaleUtente from '../components/tabAreaPersonaleUtente';
import PageTitleNavigation from '../components/pageTitleNavigation';
import {AreaPersonaleContext, DatiFatturazione, StateEnableConferma, DatiFatturazionePost} from '../types/typesAreaPersonaleUtenteEnte';
import {getDatiFatturazione, modifyDatiFatturazione,insertDatiFatturazione} from '../api/api';








export const DatiFatturazioneContext = createContext<AreaPersonaleContext>({
    statusPage:''
    ,datiFatturazione:{
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

const AreaPersonaleUtenteEnte : React.FC = () => {
 
    const [statusPage, setStatusPage] = useState('immutable');
    const [user, setUser] = useState('old');
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
        datiFatturazione.cup === ''
     || datiFatturazione.cig === '' 
     || datiFatturazione.pec === ''
     || datiFatturazione.idDocumento === ''
      || datiFatturazione.codCommessa === ''
    );


    useEffect(()=>{
     
        getDatiFatturazione(setDatiFatturazione, setStatusPage, setUser);
  
     
        
    }, []);

   

    const hendleSubmitDatiFatturazione = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) =>{
        e.preventDefault();
        if(user === 'old'){
            modifyDatiFatturazione(datiFatturazione);
            setStatusPage('immutable');
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

            insertDatiFatturazione(body);
            setStatusPage('immutable');
        }
    
         
    };
 
    console.log({user});
    

    return (
        <DatiFatturazioneContext.Provider
            value={{
                statusPage,
                datiFatturazione,
                setDatiFatturazione,
                setStatusPage,
                setStatusBottmConferma,
                user}}>

            <div >
                <PageTitleNavigation />
                {/* tab 1 e 2 start */}
                <TabAreaPersonaleUtente />

                <div>

                    {statusPage === 'immutable' ? null : (
                        <div className="d-flex justify-content-between m-5 ">

                            <Button
                                onClick={() =>setStatusPage('immutable')}
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