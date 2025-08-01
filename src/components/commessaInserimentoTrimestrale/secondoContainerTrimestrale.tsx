import { Grid, Typography } from '@mui/material';
import RowInserimentoCommessaTrimestrale from './rowInserimentoCommessaTrimestrale';
const SecondoContainerTrimestrale = ({ onChangeModuloValue,dataModulo,meseAnno,modifica,errorAnyValueIsEqualNull}) => {
    console.log({pippo:dataModulo});
    const totaleNazionale = (dataModulo?.totaleNotificheDigitaleNaz||0) + (dataModulo?.totaleNotificheAnalogicoARNaz||0)+(dataModulo?.totaleNotificheAnalogico890Naz||0);
    const totaleInternazionale = (dataModulo?.totaleNotificheDigitaleInternaz||0)+(dataModulo?.totaleNotificheAnalogicoARInternaz||0);
    const totaleNotifiche = (dataModulo?.totaleNotificheDigitaleNaz||0) + (dataModulo?.totaleNotificheAnalogicoARNaz||0)+(dataModulo?.totaleNotificheAnalogico890Naz||0)+(dataModulo?.totaleNotificheDigitaleInternaz||0)+(dataModulo?.totaleNotificheAnalogicoARInternaz||0);

    const totaleDigit = (dataModulo?.totaleNotificheDigitaleNaz||0)+(dataModulo?.totaleNotificheDigitaleInternaz||0);
    const totaleAR = (dataModulo?.totaleNotificheAnalogicoARNaz||0)+(dataModulo?.totaleNotificheAnalogicoARInternaz||0);
    const totale890 = (dataModulo?.totaleNotificheAnalogico890Naz||0);
    console.log({totaleNazionale,totaleInternazionale,totaleNotifiche});
  
    return (
        <div className="m-3 pl-5 ">
            <hr></hr>
            {/* prima row start */}
            <RowInserimentoCommessaTrimestrale
                errorAnyValueIsEqualNull={errorAnyValueIsEqualNull}
                sentence="Numero complessivo delle notifiche da processare in via digitale nel mese di"
                textBoxHidden={false}
                setValue={onChangeModuloValue}
                values={[dataModulo?.totaleNotificheDigitaleNaz,dataModulo?.totaleNotificheDigitaleInternaz]}
                keys={["totaleNotificheDigitaleNaz","totaleNotificheDigitaleInternaz"]}
                meseAnno={meseAnno}
                modifica={modifica}
                totale={totaleDigit} />
            {/* prima row end */}
            <hr></hr>
            {/* seconda row start */}
            <RowInserimentoCommessaTrimestrale
                errorAnyValueIsEqualNull={errorAnyValueIsEqualNull}
                sentence="Numero complessivo delle notifiche da processare in via analogica tramite Raccomandata A/R nel mese di"
                textBoxHidden={false}
                setValue={onChangeModuloValue}
                values={[dataModulo?.totaleNotificheAnalogicoARNaz,dataModulo?.totaleNotificheAnalogicoARInternaz]}
                keys={["totaleNotificheAnalogicoARNaz","totaleNotificheAnalogicoARInternaz"]}
                meseAnno={meseAnno}
                modifica={modifica}
                totale={totaleAR}
            />
            {/* seconda row end */}
            {/* terza row start */}
            <hr></hr>
            <RowInserimentoCommessaTrimestrale
                errorAnyValueIsEqualNull={errorAnyValueIsEqualNull}
                sentence="Numero complessivo delle notifiche da processare in via analogica del tipo notifica ex L. 890/1982 nel mese di"
                textBoxHidden={false}
                setValue={onChangeModuloValue}
                values={[dataModulo?.totaleNotificheAnalogico890Naz,""]}
                keys={["totaleNotificheAnalogico890Naz"]}
                meseAnno={meseAnno}
                modifica={modifica}
                totale={totale890}
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
                        { totaleNazionale}
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
                        {totaleInternazionale}
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
                        {totaleNotifiche}
                    </Typography>
                </Grid>

            </Grid>
            {/* quarta row end */}
        </div>
    );
};
export default  SecondoContainerTrimestrale;