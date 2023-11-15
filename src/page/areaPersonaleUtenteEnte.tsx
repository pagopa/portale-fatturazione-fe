import React, { useState, useEffect, createContext  } from 'react';

import '../style/areaPersonaleUtenteEnte.css';
import { Button } from '@mui/material';
import TabAreaPersonaleUtente from '../components/tabAreaPersonaleUtente';
import PageTitleNavigation from '../components/pageTitleNavigation';
import {AreaPersonaleContext, DatiFatturazione, StateEnableConferma} from '../types/typesAreaPersonaleUtenteEnte';
import {getDatiFatturazione, modifyDatiFatturazione} from '../api/api';








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

    const [statusBottonConferma, setStatusBottmConferma] = useState<StateEnableConferma>({
        'CUP':false,
        'CIG':false,
        'Mail Pec':false,
        'ID Documento':false,
        "Codice. Commessa/Convenzione":false,
    });
   
    const enableDisableConferma = Object.values(statusBottonConferma).every(element => element === false);
  
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
        dataDocumento:'',
        pec:''

    });

   


    useEffect(()=>{
        getDatiFatturazione(setDatiFatturazione);
    }, []);

   

    const hendleSubmitDatiFatturazione = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) =>{
        e.preventDefault();
    
        modifyDatiFatturazione(datiFatturazione);
        setStatusPage('immutable'); 
    };
 
   
    

    return (
        <DatiFatturazioneContext.Provider value={{statusPage, datiFatturazione, setDatiFatturazione, setStatusPage, setStatusBottmConferma}}>

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
                                disabled={!enableDisableConferma}
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