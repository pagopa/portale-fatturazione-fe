import React, { useState, useEffect } from 'react';
import axios from 'axios';

import '../style/areaPersonaleUtenteEnte.css';

import { Button } from '@mui/material';
import TabAreaPersonaleUtente from '../components/tabAreaPersonaleUtente';
import PageTitleNavigation from '../components/pageTitleNavigation';

const AreaPersonaleUtenteEnte : React.FC = () => {

  const [statusPage, setStatusPage] = useState('immutable');





  const idEnte = 'db184986-dbfb-412f-b950-cc5f95f5a268';



 
 
  return (

    <div>
      <PageTitleNavigation statusPage={statusPage} setStatusPage={setStatusPage} />
      {/* tab 1 e 2 start */}
      <TabAreaPersonaleUtente  statusPage={statusPage}/>

      <div>

<div>    </div>
        {statusPage === 'immutable' ? null : (
          <div className="d-flex justify-content-between m-5 ">

            <Button
              onClick={() => setStatusPage('immutable')}
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
  );
};

export default  AreaPersonaleUtenteEnte;