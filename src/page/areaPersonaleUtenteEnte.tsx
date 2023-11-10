import React, { useState, createContext  } from 'react';
import axios from 'axios';
import '../style/areaPersonaleUtenteEnte.css';
import { Button } from '@mui/material';
import TabAreaPersonaleUtente from '../components/tabAreaPersonaleUtente';
import PageTitleNavigation from '../components/pageTitleNavigation';

const AreaPersonaleUtenteEnte : React.FC = () => {
    const DatiFatturazioneContext = createContext();
  
    const [statusPage, setStatusPage] = useState('immutable');


  
   
   

    return (
        <DatiFatturazioneContext.Provider value={statusPage}>

            <div>
                <PageTitleNavigation statusPage={statusPage} setStatusPage={setStatusPage} />
                {/* tab 1 e 2 start */}
                <TabAreaPersonaleUtente  statusPage={statusPage}/>

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
                                onClick={() => setStatusPage('immutable')}
                                variant="contained"
                                size="medium"
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