import React, { useEffect, useState } from 'react';
import { Grid, Typography, InputLabel, Box, Skeleton } from '@mui/material';
import {  CategorieTotali} from '../../types/typeModuloCommessaInserimento';
import { useNavigate } from 'react-router';
import { getDatiConfigurazioneCommessa } from '../../api/apiSelfcare/moduloCommessaSE/api';
import { createDateFromString } from '../../reusableFunction/function';
import { useGlobalStore } from '../../store/context/useGlobalStore';


const TerzoContainerTrimestrale  = ({dataModulo, dataModifica, meseAnno}) => {

    const mainState = useGlobalStore(state => state.mainState);

  
    const navigate = useNavigate();
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const [configurazioneLoading, setConfigurazioneLoading] = useState(false);
    const [labelCategorie, setLabelCategorie] = useState<CategorieTotali[]>([
        {
            idCategoriaSpedizione: 1,
            percentuale: 0,
            descrizione: ''
        },
        {
            idCategoriaSpedizione: 2,
            percentuale: 0,
            descrizione: ''
        }]);

 

    useEffect(()=>{
        getConfigurazione();
    },[]);

    const replaceDate = (arr:[], stringToRepace:string, stringToInsert:string) =>{
        return arr.map((singleObj:CategorieTotali) =>{
            singleObj.descrizione = singleObj.descrizione.replace(stringToRepace,stringToInsert);
            return singleObj;
        });
    };

    const getConfigurazione = async() =>{
        setConfigurazioneLoading(true);
        getDatiConfigurazioneCommessa(token, mainState.infoTrimestreComSelected.idTipoContratto, mainState.infoTrimestreComSelected.prodotto, profilo.nonce)
            .then((res)=>{
                const newCategorie = replaceDate(res.data.categorie,'[data]', '');
                setConfigurazioneLoading(false);
                setLabelCategorie(newCategorie);
            }).catch((err)=>{
                setConfigurazioneLoading(false);
                if(err?.response?.status === 401){
                    navigate('/error');
                }else if(err?.response?.status === 419){
                    navigate('/error');
                }
            });
    };
 
    const labelDigitale = labelCategorie.filter((obj) => obj.idCategoriaSpedizione === 2);
    const labelAnalogica = labelCategorie.filter((obj) => obj.idCategoriaSpedizione === 1);

    const sum = (dataModulo[0]?.totale || 0) + (dataModulo[1]?.totale || 0);
    const sumFixed2Decimal = sum?.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
    
    if(configurazioneLoading){
        return <Box
            sx={{
                padding:"24px",
                height: '350px'
            }}
        >
            <Skeleton variant="rectangular" height="100%" />
        </Box>;
    }

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
                        {labelDigitale[0]?.descrizione} <span style={{fontWeight:'bold'}}>{meseAnno}</span>
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
                        {dataModulo[1]?.totale?.toLocaleString("de-DE", { style: "currency", currency: "EUR" })|| '0 €'} 
                    </Typography>
                </Grid>
            </Grid>
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
                        {labelAnalogica[0]?.descrizione} <span style={{fontWeight:'bold'}}>{meseAnno}</span>
                    </Typography>
                </Grid>
                <Grid
                    sx={{ display:'flex', alignItems:'center', justifyContent:'center' }}
                    item
                    xs={6}
                >
                    <Typography
                        sx={{fontSize:'18px', textAlign:'center'}}
                    >
                        {dataModulo[0]?.totale?.toLocaleString("de-DE", { style: "currency", currency: "EUR" })|| '0 €'} 
                    </Typography>
                </Grid>
            </Grid>
            {/* seconda row end */}
            <hr></hr>
            <Grid
                sx={{
                    marginTop: '3%',
                    paddingBottom: '3%'
                }}
                container
                columns={12}
            >
                <Grid item xs={6}>
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
                        {sumFixed2Decimal}
                    </Typography>
                </Grid>
            </Grid>
            <hr />
            {
                dataModifica && 
                    <div className="d-flex justify-content-around marginTopBottom24">
                        <div className='d-flex'>
                            <InputLabel  sx={{ marginRight:'20px'}}  size={"normal"}>Data modifica</InputLabel>
                            <Typography >{createDateFromString(dataModifica)}</Typography>
                        </div>
                    </div>
            }
        </div>
    );
};

export default TerzoContainerTrimestrale;
