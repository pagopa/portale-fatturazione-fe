import React, { useEffect, useState} from 'react';
import { Grid, Typography } from '@mui/material';
import RowInserimentoCommessa from './rowInserimentoCommessa';
import { ResponseCategorieSpedizione, SecondoContainerProps   } from '../../types/typeModuloCommessaInserimento';
import { manageError } from '../../api/api';
import { ManageErrorResponse } from '../../types/typesGeneral';
import { getCategoriaSpedizione } from '../../api/apiSelfcare/moduloCommessaSE/api';

import { getIdByTipo } from '../../reusableFunction/function';

const SecondoContainerInsCom = ({totale, mainState,dispatchMainState, setDatiCommessa,datiCommessa}) => {

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const [arrTipoSpedizione , setArrTipoSpedizione] = useState({
        idSpedizioneDigitale : 0,
        idSpedizioneAnalog890 : 0,
        idSpedizioneAnalogAR : 0,
    });
 
    const getCategoria = async () =>{
        await getCategoriaSpedizione(token , profilo.nonce).then((res:ResponseCategorieSpedizione ) => {
            setArrTipoSpedizione({
                idSpedizioneDigitale :getIdByTipo('Digitale',res.data),
                idSpedizioneAnalog890 :  getIdByTipo('Analog. L. 890/82',res.data),
                idSpedizioneAnalogAR : getIdByTipo('Analog. A/R',res.data),
            });
        }).catch((err:ManageErrorResponse) =>{
            manageError(err,dispatchMainState);
        });
    };
   
    useEffect(()=>{
        getCategoria();
    },[]);
  
    return (
        <div className="m-3 pl-5 ">
            <hr></hr>
            {/* prima row start */}
            <RowInserimentoCommessa
                sentence="Numero complessivo delle notifiche da processare in via digitale nel mese di"
                textBoxHidden={false}
                idTipoSpedizione={arrTipoSpedizione.idSpedizioneDigitale}
                rowNumber={3}
                mainState={mainState}
                setDatiCommessa={setDatiCommessa}
                datiCommessa={datiCommessa}
            />
            {/* prima row end */}
            <hr></hr>
            {/* seconda row start */}
            <RowInserimentoCommessa
                sentence="Numero complessivo delle notifiche da processare in via analogica tramite Raccomandata A/R nel mese di"
                textBoxHidden={false}
                idTipoSpedizione={arrTipoSpedizione.idSpedizioneAnalogAR}
                rowNumber={1}
                mainState={mainState}
                setDatiCommessa={setDatiCommessa}
                datiCommessa={datiCommessa}
            />
            {/* seconda row end */}
            {/* terza row start */}
            <hr></hr>
            <RowInserimentoCommessa
                sentence="Numero complessivo delle notifiche da processare in via analogica del tipo notifica ex L. 890/1982 nel mese di"
                textBoxHidden
                idTipoSpedizione={arrTipoSpedizione.idSpedizioneAnalog890}
                rowNumber={2}
                mainState={mainState}
                setDatiCommessa={setDatiCommessa}
                datiCommessa={datiCommessa}
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