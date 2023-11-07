import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../style/areaPersonaleUtenteEnte.css';

import { Button } from '@mui/material';
import TabAreaPersonaleUtente from '../components/tabAreaPersonaleUtente';
import PageTitleNavigation from '../components/pageTitleNavigation';

export default function AreaPersonaleUtenteEnte() {

  const [statusPage, setStatusPage] = useState('immutable');

  const [data , setData] = useState();

  const obj = {};

  const insertDatiFatturazione = async () => {
    try {
      const response = await fetch(
        '/portalefatturebeapi20231102162515.azurewebsites.net/api/datifatturazione?idente=db184986-dbfb-412f-b950-cc5f95f5a268',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(obj),
        },
      );
      await response.json();
    } catch (error) {
      console.log(error);
    }
  };

  const idEnte = 'db184986-dbfb-412f-b950-cc5f95f5a268';
  const getAllDatiCommessa = async () => {

    try{
      const response = await axios.get(
        `https://portalefatturebeapi20231102162515.azurewebsites.net/api/datifatturazione/tipocontratto`).then( (res) =>{
           console.log({RESPONSE:res});
        });
    }catch(error){
      console.log({error});
    }
 
     

  
  };
 
  useEffect(()=>{
    getAllDatiCommessa();

  }, []);
  
    console.log(data,'State Data');
    
    
    

  

  

    


  return (

    <div>
      <PageTitleNavigation statusPage={statusPage} setStatusPage={setStatusPage} />
      {/* tab 1 e 2 start */}
      <TabAreaPersonaleUtente />

      <div>

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
}
