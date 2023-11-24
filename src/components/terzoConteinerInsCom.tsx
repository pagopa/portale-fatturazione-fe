import React from 'react';
import { Grid, Typography } from '@mui/material';
import { TerzoContainerModCommessa } from '../types/typeModuloCommessaInserimento';

const TerzoContainerInsCom : React.FC<TerzoContainerModCommessa> = ({valueTotali}) => {
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
                    <Typography>
                         Numero complessivo delle notifiche
                         da processare in via analogica del
                         tipo notifica ex L. 890/1982 nel mese di {mese}
                    </Typography>
         
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
                        {valueTotali[0].totaleValoreCategoriaSpedizione}
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
                    <Typography>
                      Notifiche Analogiche: “Art. 2 comma 6
                      Anticipo pari al 30% per le notifiche
                      analogiche oggetto della commessa di {mese}
                    </Typography>
         
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
                        {valueTotali[1].totaleValoreCategoriaSpedizione}
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
                    <div className='d-flex justify-content-end'>
                        <Typography sx={{fontWeight:'bold'}} >TOTALE MODULO COMMESSA NETTO IVA</Typography>
                    </div>

                    
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
                        {valueTotali[0].totaleValoreCategoriaSpedizione + valueTotali[1].totaleValoreCategoriaSpedizione}
                    </Typography>
                </Grid>

            </Grid>
        </div>
    );
};

export default TerzoContainerInsCom;
