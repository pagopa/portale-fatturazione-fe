import React, { useEffect, useState, useContext} from 'react';
import { Grid, Typography } from '@mui/material';
import RowInserimentoCommessa from './rowInserimentoCommessa';
import { InsModuloCommessaContext } from '../types/typeModuloCommessaInserimento';
import { InserimentoModuloCommessaContext } from '../page/moduloCommessaInserimentoUtEn30';
import {useAxios, url, menageError, getCategoriaSpedizione} from '../api/api';
import { useNavigate } from 'react-router';

const SecondoContainerInsCom : React.FC = () => {
    const navigate = useNavigate();
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;
    const { totale, infoModuloCommessa} = useContext<InsModuloCommessaContext>(InserimentoModuloCommessaContext);

    const getIdByTipo = (string:string, array:any[]) =>{
      
        const getAllObjs = array.map((singleObj)=>{
            return singleObj.tipoSpedizione;
        }).flat().filter((obj)=>{
            return obj.tipo === string;
        });
        return getAllObjs[0].id;
     
    };
    const [arrTipoSpedizione , setArrTipoSpedizione] = useState({
        idSpedizioneDigitale : 0,
        idSpedizioneAnalog890 : 0,
        idSpedizioneAnalogAR : 0,
    });
 
    const getCategoria = async () =>{
        await getCategoriaSpedizione(token , infoModuloCommessa.nonce).then((res:any) => {
            console.log({res}, 'PIPPO');
            setArrTipoSpedizione({
                idSpedizioneDigitale :getIdByTipo('Digitale',res.data),
                idSpedizioneAnalog890 :  getIdByTipo('Analog. L. 890/82',res.data),
                idSpedizioneAnalogAR : getIdByTipo('Analog. A/R',res.data),
            });
          
            
        }).catch((err:any) =>{
            if(err.response.status === 401){
                navigate('/error');
            }else if(err.response.status === 419){
                navigate('/error');
            }
        });
    };
   
    useEffect(()=>{
        if(infoModuloCommessa.nonce !== ''){
            getCategoria();
        }
        
    },[infoModuloCommessa.nonce]);

  


  
    return (
        <div className="m-3 pl-5 ">
            <hr></hr>
            {/* prima row start */}
            <RowInserimentoCommessa
                sentence="Numero complessivo delle notifiche da processare in via digitale nel mese di"
                textBoxHidden={false}
                idTipoSpedizione={arrTipoSpedizione.idSpedizioneDigitale}
                // setInputTotale={setInputTotale}
                rowNumber={3}
            />
            {/* prima row end */}
            <hr></hr>
            {/* seconda row start */}
            <RowInserimentoCommessa
                sentence="Numero complessivo delle notifiche da processare in via analogica tramite Raccomandata A/R nel mese di"
                textBoxHidden={false}
               
                idTipoSpedizione={arrTipoSpedizione.idSpedizioneAnalogAR}
                // setInputTotale={setInputTotale}
                rowNumber={1}
            />
            {/* seconda row end */}
            {/* terza row start */}
            <hr></hr>
            <RowInserimentoCommessa
                sentence="Numero complessivo delle notifiche da processare in via analogica del tipo notifica ex L. 890/1982 nel mese di"
                textBoxHidden
              
                idTipoSpedizione={arrTipoSpedizione.idSpedizioneAnalog890}
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