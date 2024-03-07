import React, { useEffect, useState } from 'react';
import { Grid, Typography, InputLabel } from '@mui/material';
import { TerzoContainerModCommessa, CategorieTotali} from '../../types/typeModuloCommessaInserimento';
import { useNavigate } from 'react-router';
import { getDatiConfigurazioneCommessa } from '../../api/apiSelfcare/moduloCommessaSE/api';

const TerzoContainerInsCom : React.FC<TerzoContainerModCommessa> = ({valueTotali, dataModifica, mainState}) => {

    const month = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre","Gennaio"];
   
    
    const navigate = useNavigate();
    
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
   

    const replaceDate = (arr:[], stringToRepace:string, stringToInsert:string) =>{
  
        return arr.map((singleObj:CategorieTotali) =>{
            singleObj.descrizione = singleObj.descrizione.replace(stringToRepace,stringToInsert);
            return singleObj;
        });
    };


    const getConfigurazione = async() =>{
        getDatiConfigurazioneCommessa(token, profilo.idTipoContratto, profilo.prodotto, profilo.nonce)
            .then((res)=>{
                const newCategorie = replaceDate(res.data.categorie,'[data]', '');
                setLabelCategorie(newCategorie);
            }).catch((err)=>{
                if(err.response.status === 401){
                    navigate('/error');
                }else if(err.response.status === 419){
                    navigate('/error');
                }
            });
    };

    useEffect(()=>{
        if(profilo.nonce !== undefined){
            getConfigurazione();
        }
        
    },[]);

  

    const labelDigitale = labelCategorie.filter((obj) => obj.idCategoriaSpedizione === 2);
    const labelAnalogica = labelCategorie.filter((obj) => obj.idCategoriaSpedizione === 1);

    const valueDigitale = valueTotali.filter((obj) => obj.idCategoriaSpedizione === 2);
    const valueAnalogico = valueTotali.filter((obj) => obj.idCategoriaSpedizione === 1);

    const sum = (valueTotali[0]?.totaleValoreCategoriaSpedizione || 0) + (valueTotali[1]?.totaleValoreCategoriaSpedizione || 0);
    const sumFixed2Decimal = sum.toFixed(2).toString().replace('.', ',');
 


    function createDateFromString(string:string){
        const getGiorno = new Date(string).getDate();
      
        const getMese = new Date(string).getMonth() + 1;
        const getAnno = new Date(string).getFullYear();

        return getGiorno+'/'+getMese+'/'+getAnno;
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
                        {valueDigitale[0]?.totaleValoreCategoriaSpedizione.toFixed(2).toString().replace('.',',')|| 0} €
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
                        {valueAnalogico[0]?.totaleValoreCategoriaSpedizione.toFixed(2).toString().replace('.',',') || 0} €
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

            <hr className="mx-3 mt-5" />

            {
                statusApplication.inserisciModificaCommessa === 'INSERT' ? null :
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

export default TerzoContainerInsCom;
//{createDateFromString(parseProfilo.dataPrimo)}