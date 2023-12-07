import React, { startTransition, useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import { TerzoContainerModCommessa, CategorieTotali,ResponsTotaliInsModuloCommessa } from '../types/typeModuloCommessaInserimento';
import { getDatiConfigurazioneCommessa } from '../api/api';

const TerzoContainerInsCom : React.FC<TerzoContainerModCommessa> = ({valueTotali}) => {
    console.log({valueTotali});
    const month = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre","Gennaio"];
   
    

    
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    const getStatusApplication = localStorage.getItem('statusApplication') || '{}';
    const statusApplication =  JSON.parse(getStatusApplication);

    let mese = '';
    let anno = 2000;
    if(statusApplication.inserisciModificaCommessa === 'MODIFY' ){
        mese = month[statusApplication.mese -1 ];
        anno = statusApplication.anno;
    }else{
        const mon = new Date().getMonth();
        const date = new Date();
      
        if(mon === 11){
           
            anno = date.getFullYear()+1;
           
        }else{
            anno = date.getFullYear();
        }
        mese = month[mon + 1 ];

    }
   
    
    
  
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
    const dataToInsert = <span className="fw-semibold"> {mese}/{anno}</span>;
    console.log(dataToInsert);

    const replaceDate = (arr:[], stringToRepace:string, stringToInsert:string) =>{
  
        return arr.map((singleObj:CategorieTotali) =>{
            singleObj.descrizione = singleObj.descrizione.replace(stringToRepace,stringToInsert);
            return singleObj;
        });
    };

    const getConfigurazione = async() =>{
        getDatiConfigurazioneCommessa(token, profilo.idTipoContratto, profilo.prodotto)
            .then((res)=>{
                const newCategorie = replaceDate(res.data.categorie,'[data]', '');
                setLabelCategorie(newCategorie);
            }).catch((err)=>err);
    };

    useEffect(()=>{
        getConfigurazione();
    },[]);

  

    const labelDigitale = labelCategorie.filter((obj) => obj.idCategoriaSpedizione === 2);
    const labelAnalogica = labelCategorie.filter((obj) => obj.idCategoriaSpedizione === 1);

    const valueDigitale = valueTotali.filter((obj) => obj.idCategoriaSpedizione === 2);
    const valueAnalogico = valueTotali.filter((obj) => obj.idCategoriaSpedizione === 1);

    const sum = valueTotali[0]?.totaleValoreCategoriaSpedizione + valueTotali[1]?.totaleValoreCategoriaSpedizione;
    const sumFixed2Decimal = sum.toFixed(2).toString().replace('.', ',');
    console.log(sumFixed2Decimal);
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
                        {labelDigitale[0].descrizione} {dataToInsert}
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
                        {valueDigitale[0]?.totaleValoreCategoriaSpedizione.toFixed(2).toString().replace('.',',')} €
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
                        {labelAnalogica[0].descrizione} {dataToInsert}
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
                        {valueAnalogico[0]?.totaleValoreCategoriaSpedizione.toFixed(2).toString().replace('.',',')} €
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
                        {sumFixed2Decimal} €
                    </Typography>
                </Grid>

            </Grid>
        </div>
    );
};

export default TerzoContainerInsCom;
