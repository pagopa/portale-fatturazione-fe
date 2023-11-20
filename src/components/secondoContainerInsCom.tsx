import React, {useContext, useEffect, useState} from 'react';
import { Grid, Typography } from '@mui/material';
import RowInserimentoCommessa from './rowInserimentoCommessa';
import {InserimentoModuloCommessaContext} from '../page/moduloCommessaInserimentoUtEn30';
import {InsModuloCommessaContext, DataTotaleObj} from '../types/typeModuloCommessaInserimento';

export default function SecondoContainerInsCom() {
    const {datiCommessa,setDatiCommessa} = useContext<InsModuloCommessaContext>(InserimentoModuloCommessaContext);
    const [inputTotale, setInputTotale] = useState<DataTotaleObj>({
        digitaleNazionale:0,
        digitaleInternazionale:0,
        analogicoNazionale:0,
        analogicoInternazionale:0,
        analNotificaNazionale:0,
        analNotificaInternazionale:0,
    });
    console.log({inputTotale});
    const [totale, setTotale] = useState({totaleNazionale:0, totaleInternazionale:0, totaleNotifiche:0});
    useEffect(()=>{
        const totNazionale = inputTotale.digitaleNazionale + inputTotale.analogicoNazionale + inputTotale.analNotificaNazionale;
        const totInternazionale = inputTotale.digitaleInternazionale + inputTotale.analogicoInternazionale + inputTotale.analNotificaInternazionale;
        const totNotifiche = totNazionale + totInternazionale; 
        setTotale(prev => ({...prev, ...{totaleNazionale:totNazionale, totaleInternazionale:totInternazionale,totaleNotifiche:totNotifiche}}));
    },[inputTotale]);
 
    return (
        <div className="m-3 pl-5 ">
            <hr></hr>
            {/* prima row start */}
            <RowInserimentoCommessa
                sentence="Numero complessivo delle notifiche da processare in via digitale nel mese di"
                textBoxHidden
                setDatiCommessa={setDatiCommessa}
                idTipoSpedizione={1}
                setInputTotale={setInputTotale}
                rowNumber={1}
            />
            {/* prima row end */}
            <hr></hr>
            {/* seconda row start */}
            <RowInserimentoCommessa
                sentence="Numero complessivo delle notifiche da processare in via analogica tramite Raccomandata A/R nel mese di"
                textBoxHidden={false}
                setDatiCommessa={setDatiCommessa}
                idTipoSpedizione={2}
                setInputTotale={setInputTotale}
                rowNumber={2}
            />
            {/* seconda row end */}
            {/* terza row start */}
            <hr></hr>
            <RowInserimentoCommessa
                sentence="Numero complessivo delle notifiche da processare in via analogica del tipo notifica ex L. 890/1982 nel mese di"
                textBoxHidden
                setDatiCommessa={setDatiCommessa}
                idTipoSpedizione={3}
                setInputTotale={setInputTotale}
                rowNumber={3}
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
}
