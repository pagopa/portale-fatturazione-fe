import React from 'react';
import { Grid, Typography } from '@mui/material';
import RowInserimentoCommessa from './rowInserimentoCommessa';

export default function SecondoContainerInsCom() {

 
  return (
    <div className="m-3 pl-5 ">
<hr></hr>
      {/* prima row start */}
      <RowInserimentoCommessa
        sentence="Numero complessivo delle notifiche da
          processare in via digitale nel mese di"
        textBoxHidden={false}
      />
      {/* prima row end */}
<hr></hr>
      {/* seconda row start */}
      <RowInserimentoCommessa
        sentence="Numero complessivo delle notifiche da
          processare in via analogica tramite Raccomandata A/R nel mese di"
        textBoxHidden={false}
      />
      {/* seconda row end */}
      {/* terza row start */}
      <hr></hr>
      <RowInserimentoCommessa
        sentence="Numero complessivo delle notifiche da
          processare in via analogica del tipo notifica ex L. 890/1982 nel mese di"
        textBoxHidden
      />
      <hr></hr>
      {/* terza row end */}
      {/* quarta row start */}
      <Grid
        sx={{
          marginTop: '3%',
          paddingBottom: '3%'
        }}
        container
        columns={12}
      >

        <Grid
          item
          xs={6}
        >

          <p className="text-center float-end fw-bolder">TOTALE</p>
        </Grid>

        <Grid
          sx={{ textAlign: 'center' }}
          item
          xs={2}
        >
          <Typography
            variant="caption-semibold"
            sx={{fontSize:'18px'}}
          >
            20
          </Typography>
        </Grid>
        <Grid
          sx={{ textAlign: 'center' }}
          item
          xs={2}
        >
          <Typography
            variant="caption-semibold"
            sx={{fontSize:'18px'}}
          >
            20
          </Typography>
        </Grid>
        <Grid
          sx={{ textAlign: 'center' }}
          item
          xs={2}
        >
          <Typography
            variant="caption-semibold"
            sx={{fontSize:'18px'}}
          >
            20
          </Typography>
        </Grid>

      </Grid>
      {/* quarta row end */}
    </div>
  );
}
