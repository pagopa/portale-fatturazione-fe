import React, { useEffect, useState, useContext} from 'react';
import { Grid, Typography } from '@mui/material';
import RowInserimentoCommessa from './rowInserimentoCommessa';
import { InsModuloCommessaContext,ResponseCategorieSpedizione   } from '../../types/typeModuloCommessaInserimento';
import { InserimentoModuloCommessaContext } from '../../page/moduloCommessaInserimentoUtEn30';
import { manageError } from '../../api/api';
import { useNavigate } from 'react-router';
import { ManageErrorResponse } from '../../types/typesGeneral';
import { getCategoriaSpedizione } from '../../api/apiSelfcare/moduloCommessaSE/api';
import { getProfilo, getToken } from '../../reusableFunctin/actionLocalStorage';
import { getIdByTipo } from '../../reusableFunctin/function';

const SecondoContainerInsCom : React.FC = () => {
    const { totale, mainState } = useContext<InsModuloCommessaContext>(InserimentoModuloCommessaContext);
    
    const navigate = useNavigate();
    const token =  getToken();

    const [arrTipoSpedizione , setArrTipoSpedizione] = useState({
        idSpedizioneDigitale : 0,
        idSpedizioneAnalog890 : 0,
        idSpedizioneAnalogAR : 0,
    });
 
    const getCategoria = async () =>{
        await getCategoriaSpedizione(token , mainState.nonce).then((res:ResponseCategorieSpedizione ) => {
            setArrTipoSpedizione({
                idSpedizioneDigitale :getIdByTipo('Digitale',res.data),
                idSpedizioneAnalog890 :  getIdByTipo('Analog. L. 890/82',res.data),
                idSpedizioneAnalogAR : getIdByTipo('Analog. A/R',res.data),
            });
        }).catch((err:ManageErrorResponse) =>{
            manageError(err, navigate);
        });
    };
   
    useEffect(()=>{
        if(mainState.nonce !== ''){
            getCategoria();
        }
    },[mainState.nonce]);
  
    return (
        <div className="m-3 pl-5 ">
            <hr></hr>
            {/* prima row start */}
            <RowInserimentoCommessa
                sentence="Numero complessivo delle notifiche da processare in via digitale nel mese di"
                textBoxHidden={false}
                idTipoSpedizione={arrTipoSpedizione.idSpedizioneDigitale}
                rowNumber={3}
            />
            {/* prima row end */}
            <hr></hr>
            {/* seconda row start */}
            <RowInserimentoCommessa
                sentence="Numero complessivo delle notifiche da processare in via analogica tramite Raccomandata A/R nel mese di"
                textBoxHidden={false}
                idTipoSpedizione={arrTipoSpedizione.idSpedizioneAnalogAR}
                rowNumber={1}
            />
            {/* seconda row end */}
            {/* terza row start */}
            <hr></hr>
            <RowInserimentoCommessa
                sentence="Numero complessivo delle notifiche da processare in via analogica del tipo notifica ex L. 890/1982 nel mese di"
                textBoxHidden
                idTipoSpedizione={arrTipoSpedizione.idSpedizioneAnalog890}
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