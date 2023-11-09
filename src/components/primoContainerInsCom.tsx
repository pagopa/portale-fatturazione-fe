import React from 'react';
import { Grid } from '@mui/material';
import LabelComponent from './label';


export default function PrimoContainerInsCom() {
  const exampleDate = "Nov/2023";
  const exampleTipoContratto = "PAC";
  return (
    <div className="m-3">
      <Grid
        container
        spacing={2}
        columns={12}
      >

        <Grid
          sx={{ textAlign: 'center' }}
          item
          xs={6}
        >
          <div>
          <LabelComponent label="Mese/Anno:" input={exampleDate} />
          <LabelComponent label="Tipo Contratto:" input={exampleTipoContratto} />
          </div>
         
        </Grid>

        <Grid
          item
          xs={2}
        >
          <p className="text-center fw-bolder">Territorio Nazionale</p>
        </Grid>
        <Grid
          item
          xs={2}
        >
          <p className=" text-center fw-bolder">Territorio diverso da nazionale</p>
        </Grid>
        <Grid
          item
          xs={2}
        >
          <p className="text-center  fw-bolder">Totale notifiche da processare</p>
        </Grid>

      </Grid>
    </div>
  );
}
