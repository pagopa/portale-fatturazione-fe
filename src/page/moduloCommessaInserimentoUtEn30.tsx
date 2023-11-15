import React from 'react';
import {
    Typography, Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked } from '@pagopa/mui-italia';

import PrimoContainerInsCom from '../components/primoContainerInsCom';
import SecondoContainerInsCom from '../components/secondoContainerInsCom';
import TerzoContainerInsCom from '../components/terzoConteinerInsCom';

export default function ModuloCommessaInserimentoUtEn30() {
    return (

        <div className="m-5">
            <div>
                <ButtonNaked
                    color="primary"
                    onFocusVisible={() => { console.log('onFocus'); }}
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => console.log('esci')}
                >
          Esci
                </ButtonNaked>
                <Typography sx={{ marginLeft: '10px' }} variant="caption">Navigazione</Typography>

            </div>
            <div className="mt-3">
                <Typography variant="h4">Aggiungi modulo commessa</Typography>
            </div>

            <div className="bg-white mt-3 pt-3">
                <PrimoContainerInsCom />
                <SecondoContainerInsCom />
       
            </div>
            <div className='bg-white'>
                <TerzoContainerInsCom />
            </div>
      
            <div className="d-flex justify-content-between mt-5 ">
                <Button variant="outlined">Indietro</Button>
                <Button variant="contained">Continua</Button>
            </div>

        </div>
    );
}
