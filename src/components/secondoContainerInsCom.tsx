import React, { useEffect, useState, useContext} from 'react';
import { Grid, Typography } from '@mui/material';
import RowInserimentoCommessa from './rowInserimentoCommessa';
import { InsModuloCommessaContext } from '../types/typeModuloCommessaInserimento';
import { InserimentoModuloCommessaContext } from '../page/moduloCommessaInserimentoUtEn30';
import {useAxios, url, menageError} from '../api/api';

const SecondoContainerInsCom : React.FC = () => {
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;
    const { totale} = useContext<InsModuloCommessaContext>(InserimentoModuloCommessaContext);


    const { ...getCategoriaSpedizione } = useAxios({
        method: 'GET',
        url: `${url}/api/tipologia/categoriaspedizione`,
        headers: {
            Authorization: 'Bearer ' + token
        }
    });

    const getIdByTipo = (string:string, array:any[]) =>{
      
        const getAllObjs = array.map((singleObj)=>{
            return singleObj.tipoSpedizione;
        }).flat().filter((obj)=>{
            return obj.tipo === string;
        });
        return getAllObjs[0].id;
     
    };

    let idSpedizioneDigitale = 0;
    let idSpedizioneAnalog890 = 0;
    let idSpedizioneAnalogAR = 0;

    if(getCategoriaSpedizione.response !== undefined){
        idSpedizioneDigitale = getIdByTipo('Digitale',getCategoriaSpedizione.response);
        idSpedizioneAnalog890 = getIdByTipo('Analog. L. 890/82',getCategoriaSpedizione.response);
        idSpedizioneAnalogAR = getIdByTipo('Analog. A/R',getCategoriaSpedizione.response);
    }
  

   



  
    return (
        <div className="m-3 pl-5 ">
            <hr></hr>
            {/* prima row start */}
            <RowInserimentoCommessa
                sentence="Numero complessivo delle notifiche da processare in via digitale nel mese di"
                textBoxHidden={false}
                idTipoSpedizione={idSpedizioneDigitale}
                // setInputTotale={setInputTotale}
                rowNumber={3}
            />
            {/* prima row end */}
            <hr></hr>
            {/* seconda row start */}
            <RowInserimentoCommessa
                sentence="Numero complessivo delle notifiche da processare in via analogica tramite Raccomandata A/R nel mese di"
                textBoxHidden={false}
               
                idTipoSpedizione={idSpedizioneAnalogAR}
                // setInputTotale={setInputTotale}
                rowNumber={1}
            />
            {/* seconda row end */}
            {/* terza row start */}
            <hr></hr>
            <RowInserimentoCommessa
                sentence="Numero complessivo delle notifiche da processare in via analogica del tipo notifica ex L. 890/1982 nel mese di"
                textBoxHidden
              
                idTipoSpedizione={idSpedizioneAnalog890}
                // setInputTotale={setInputTotale}
                rowNumber={2}
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
                    <div className='d-flex justify-content-end'>
                        <Typography sx={{fontWeight:'bold'}}> TOTALE</Typography >
                    </div>

                    
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
                        {totale.totaleNazionale}
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
                        {totale.totaleInternazionale}
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
                        {totale.totaleNotifiche}
                    </Typography>
                </Grid>

            </Grid>
            {/* quarta row end */}
        </div>
    );
};
export default  SecondoContainerInsCom;