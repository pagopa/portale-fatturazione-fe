import { Grid, Typography } from '@mui/material';
import RowInserimentoCommessaTrimestrale from './rowInserimentoCommessaTrimestrale';
const SecondoContainerTrimestrale = ({ onChangeModuloValue,dataModulo,meseAnno,modifica}) => {
    console.log({pippo:dataModulo});
    const totaleNazionale = (dataModulo?.totaleDigitaleNaz||0) + (dataModulo?.totaleAnalogicoARNaz||0)+(dataModulo?.totaleAnalogico890Naz||0);
    const totaleInternazionale = (dataModulo?.totaleDigitaleInternaz||0)+(dataModulo?.totaleAnalogicoARInternaz||0);
    const totaleNotifiche = (dataModulo?.totaleDigitaleNaz||0) + (dataModulo?.totaleAnalogicoARNaz||0)+(dataModulo?.totaleAnalogico890Naz||0)+(dataModulo?.totaleDigitaleInternaz||0)+(dataModulo?.totaleAnalogicoARInternaz||0);

    const totaleDigit = (dataModulo?.totaleDigitaleNaz||0)+(dataModulo?.totaleDigitaleInternaz||0);
    const totaleAR = (dataModulo?.totaleAnalogicoARNaz||0)+(dataModulo?.totaleAnalogicoARInternaz||0);
    const totale890 = (dataModulo?.totaleAnalogico890Naz||0);
    console.log({totaleNazionale,totaleInternazionale,totaleNotifiche});
  
    return (
        <div className="m-3 pl-5 ">
            <hr></hr>
            {/* prima row start */}
            <RowInserimentoCommessaTrimestrale
              
                sentence="Numero complessivo delle notifiche da processare in via digitale nel mese di"
                textBoxHidden={false}
                setValue={onChangeModuloValue}
                values={[dataModulo?.totaleDigitaleNaz,dataModulo?.totaleDigitaleInternaz]}
                keys={["totaleDigitaleNaz","totaleDigitaleInternaz"]}
                meseAnno={meseAnno}
                modifica={modifica}
                totale={totaleDigit} />
            {/* prima row end */}
            <hr></hr>
            {/* seconda row start */}
            <RowInserimentoCommessaTrimestrale
         
                sentence="Numero complessivo delle notifiche da processare in via analogica tramite Raccomandata A/R nel mese di"
                textBoxHidden={false}
                setValue={onChangeModuloValue}
                values={[dataModulo?.totaleAnalogicoARNaz,dataModulo?.totaleAnalogicoARInternaz]}
                keys={["totaleAnalogicoARNaz","totaleAnalogicoARInternaz"]}
                meseAnno={meseAnno}
                modifica={modifica}
                totale={totaleAR}
            />
            {/* seconda row end */}
            {/* terza row start */}
            <hr></hr>
            <RowInserimentoCommessaTrimestrale
             
                sentence="Numero complessivo delle notifiche da processare in via analogica del tipo notifica ex L. 890/1982 nel mese di"
                textBoxHidden={false}
                setValue={onChangeModuloValue}
                values={[dataModulo?.totaleAnalogico890Naz,""]}
                keys={["totaleAnalogico890Naz"]}
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