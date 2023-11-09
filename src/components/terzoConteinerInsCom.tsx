import React from 'react';
import { Grid, Typography } from '@mui/material';

export default function TerzoContainerInsCom() {
  const mese= <span className="fw-semibold"> Novembre/2023</span>;
  return (
    <div className=" m-3 pl-5 pt-3">
      {/* prima row start */}

      <Grid
        container
        columns={12}
      >

        <Grid
          sx={{
            textAlign: 'left',
          }}
          item
          xs={6}
        >
          Numero complessivo delle notifiche
          da processare in via analogica del
          tipo notifica ex L. 890/1982 nel mese di {mese}
        </Grid>

        <Grid
          sx={{ display:'flex', alignItems:'center', justifyContent:'center' }}
          item
          xs={6}
        >
          <Typography
            variant="caption-semibold"
            sx={{fontSize:'18px'}}
          >
            20
          </Typography>
        </Grid>
  
      </Grid>

      {/* prima row end */}

      {/* seconda row start */}
      <hr></hr>
      <Grid
        container
        columns={12}
      >

        <Grid
          sx={{
            textAlign: 'left',
          }}
          item
          xs={6}
        >
          Notifiche Analogiche: “Art. 2 comma 6
          Anticipo pari al 30% per le notifiche
          analogiche oggetto della commessa di {mese}
        </Grid>

        <Grid
          sx={{ display:'flex', alignItems:'center', justifyContent:'center' }}
          item
          xs={6}
        >
          <Typography
            variant="caption-semibold"
            sx={{fontSize:'18px', textAlign:'center'}}
          >
            20
          </Typography>
        </Grid>

      </Grid>
      {/* seconda row end */}
      <hr></hr>
      <Grid
        sx={{ marginTop: '25px', paddingBottom: '16px'}}
        container
        columns={12}
      >

        <Grid
          item
          xs={6}
        >

          <p className="text-center float-end fw-bolder">TOTALE MODULO COMMESSA NETTO IVA</p>
        </Grid>
        <Grid
          sx={{ textAlign: 'center' }}
          item
          xs={6}
        >
          <Typography
            variant="caption-semibold"
            sx={{fontSize:'18px'}}
          >
            20
          </Typography>
        </Grid>

      </Grid>
    </div>
  );
}
