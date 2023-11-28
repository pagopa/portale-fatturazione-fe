import React, {useState, useEffect} from 'react';
import {useAxios, url} from '../api/api';
import { Button, Box, Typography, FormControl, InputLabel,Select, MenuItem,} from '@mui/material';
import GridComponent from '../components/grid';
import { useNavigate } from 'react-router';
import SearchIcon from '@mui/icons-material/Search';





interface GridData {
    id: number,
    Mese: string,
    Lavorazione: string,
    Stato: string,
    'Not. Digitali': number,
    'Not. Analog. AR. Naz.': number,
    'Not. Analog. AR. No Naz.': number,
    'Not. Analog. 890/1982': number,
    'Tot. Mod. Commessa': string,
}


export default function ModuloCommessaElencoUtPa() {


    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;
   
    const navigate = useNavigate();

    const [anni, setAnni] = useState([]);
    const [valueSelect, setValueSelect] = useState<string>('');
   
   
    const {...data} = useAxios({
        method: 'GET',
        url: `${url}/api/modulocommessa/anni`,
        headers: {
            Authorization: 'Bearer ' + token
        }
    });

    useEffect(()=>{
       
        if(data.response){
            
            setAnni(data.response);
        }else if(data.error.response.status === 404){
            
            alert('Non è stato possibile aggiungere gli anni nella select');
        }else if(data.error.response.status === 401){
            
            navigate('/error');
        }else if(data.error.response.status === 500){
            
            navigate('/error');
        }
        
    },[data.response,data.error]);


    
   
   
   
    const { ...data2 } = useAxios({
        method: 'GET',
        url: `${url}/api/modulocommessa/lista/${valueSelect}`,
        headers: {
            Authorization: 'Bearer ' + token
        }
    });

    const [gridData, setGridData] = useState([]);

    useEffect(()=>{

      
        if(data2.response){
        

            const finalData = data2.response.map( (singlObj:any,i:number) =>{
   
                singlObj.id = Math.random();
                singlObj.idCategoriaSpedizione = singlObj.totali[i+1].idCategoriaSpedizione;
             
                singlObj.tipo = singlObj.totali[i+1].tipo;
                singlObj.totaleCategoria= singlObj.totali[i+1].totaleCategoria;
                
                delete singlObj.totali;
               
                return singlObj;
            } );
         
            setGridData(finalData);
        }
        
    },[data2.response]);


      

    
   
   


  
    return (

        <div className="m-5">
            <div>
                <Typography variant="h4">Modulo commessa</Typography>
            </div>

            <div className="text-end">
                <Button onClick={() => console.log('pagina aggiungi modulo commessa')} variant="contained" size="small">Aggiungi</Button>
            </div>
            <div className=" d-flex mb-5">
                <Box sx={{ width: 300 }}>
                    <FormControl
                        fullWidth
                        size="medium"
                        
                    >
                        <InputLabel
                            id="Filtra per anno"
                            
                        >
                            Filtra per anno

                        </InputLabel>
                        <Select
                            id="sea"
                            label="Anno"
                            labelId="search-by-label"
                            onChange={(e) => setValueSelect(e.target.value) }
                            value={valueSelect}
                            IconComponent={SearchIcon}
                        >
                            {anni.map((el) => (

                                <MenuItem
                                    key={Math.random()}
                                    value={el}
                                >
                                    {el}
                                </MenuItem>

                            ))}

                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ display: 'flex' }}>
                  
                    <Button
                        size="small"
                        variant="contained"
                        disabled={valueSelect === ''}
                        sx={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: '30px' }}
                     
                    >
            Filtra 

                    </Button>
                    {valueSelect !== '' ? 
                        <Typography
                            variant="caption-semibold"
                            onClick={()=>setValueSelect('')}
                            sx={{
                                marginTop: 'auto',
                                marginBottom: 'auto',
                                marginLeft: '30px',
                                cursor: 'pointer',
                                color: '#0062C3',
                            }}
                        >
            Annulla filtri

                        </Typography>
                        : null}
                </Box>

            </div>

            <div>
                <GridComponent data={gridData} /> 
            </div>

        </div>
    );
}


/*
const gridData:GridData[] = [{
    id: 0,
    Mese: 'Gennaio',
    Lavorazione: 'aperta',
    Stato: 'aperta/caricato',
    'Not. Digitali': 1000,
    'Not. Analog. AR. Naz.': 123,
    'Not. Analog. AR. No Naz.': 234,
    'Not. Analog. 890/1982': 1982,
    'Tot. Mod. Commessa': '1200 €',
},
{
    id: 1,
    Mese: 'Gennaio',
    Lavorazione: 'aperta',
    Stato: 'aperta/caricato',
    'Not. Digitali': 1000,
    'Not. Analog. AR. Naz.': 123,
    'Not. Analog. AR. No Naz.': 234,
    'Not. Analog. 890/1982': 1982,
    'Tot. Mod. Commessa': '1200 €',
},
{
    id: 2,
    Mese: 'Gennaio',
    Lavorazione: 'aperta',
    Stato: 'aperta/caricato',
    'Not. Digitali': 1000,
    'Not. Analog. AR. Naz.': 123,
    'Not. Analog. AR. No Naz.': 234,
    'Not. Analog. 890/1982': 1982,
    'Tot. Mod. Commessa': '1200 €',
},
{
    id: 4,
    Mese: 'Gennaio',
    Lavorazione: 'aperta',
    Stato: 'aperta/caricato',
    'Not. Digitali': 1000,
    'Not. Analog. AR. Naz.': 123,
    'Not. Analog. AR. No Naz.': 234,
    'Not. Analog. 890/1982': 1982,
    'Tot. Mod. Commessa': '1200 €',
},
{
    id: 5,
    Mese: 'Gennaio',
    Lavorazione: 'aperta',
    Stato: 'aperta/caricato',
    'Not. Digitali': 1000,
    'Not. Analog. AR. Naz.': 123,
    'Not. Analog. AR. No Naz.': 234,
    'Not. Analog. 890/1982': 1982,
    'Tot. Mod. Commessa': '1200 €',
},
{
    id: 6,
    Mese: 'Gennaio',
    Lavorazione: 'aperta',
    Stato: 'aperta/caricato',
    'Not. Digitali': 1000,
    'Not. Analog. AR. Naz.': 123,
    'Not. Analog. AR. No Naz.': 234,
    'Not. Analog. 890/1982': 1982,
    'Tot. Mod. Commessa': '1200 €',
},{
    id: 22,
    Mese: 'Gennaio',
    Lavorazione: 'aperta',
    Stato: 'aperta/caricato',
    'Not. Digitali': 1000,
    'Not. Analog. AR. Naz.': 123,
    'Not. Analog. AR. No Naz.': 234,
    'Not. Analog. 890/1982': 1982,
    'Tot. Mod. Commessa': '1200 €',
},
{
    id: 7,
    Mese: 'Gennaio',
    Lavorazione: 'aperta',
    Stato: 'aperta/caricato',
    'Not. Digitali': 1000,
    'Not. Analog. AR. Naz.': 123,
    'Not. Analog. AR. No Naz.': 234,
    'Not. Analog. 890/1982': 1982,
    'Tot. Mod. Commessa': '1200 €',
},
{
    id: 8,
    Mese: 'Gennaio',
    Lavorazione: 'aperta',
    Stato: 'aperta/caricato',
    'Not. Digitali': 1000,
    'Not. Analog. AR. Naz.': 123,
    'Not. Analog. AR. No Naz.': 234,
    'Not. Analog. 890/1982': 1982,
    'Tot. Mod. Commessa': '1200 €',
}];
*/