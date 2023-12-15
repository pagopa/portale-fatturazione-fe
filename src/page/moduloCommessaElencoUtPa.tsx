import React, {useState, useEffect} from 'react';
import {useAxios, url, menageError, getAnni, getListaCommessa, getListaCommessaFiltered,getListaCommessaOnAnnulla} from '../api/api';
import { Button, Box, Typography, FormControl, InputLabel,Select, MenuItem,} from '@mui/material';
import GridComponent from '../components/grid';
import { useNavigate } from 'react-router';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { VisualModuliCommessaProps } from '../types/typeModuloCommessaElenco';


const ModuloCommessaElencoUtPa: React.FC<VisualModuliCommessaProps> = ({setInfoModuloCommessa,infoModuloCommessa}) => {
    console.log({infoModuloCommessa});
  
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;
   
    const navigate = useNavigate();

    const [anni, setAnni] = useState([]);
    const [valueSelect, setValueSelect] = useState<string>('');
   
    const fixResponseForDataGrid = (arr:any) =>{
        const result = arr.map( (singlObj:any,i:number) =>{
            
            return {
                id : Math.random(),
                ...singlObj
            };
        } );
        return result;
    };


    const getAnniSelect = async () =>{

        await getAnni(token, infoModuloCommessa.nonce).then((res:any)=>{
            setAnni(res.data);
        }).catch((err:any)=>{
            if(err.response.status === 401){

                navigate('/error');
            }else if(err.response.status === 419){

                navigate('/error');
            }
        });
    };

    const getListaCommessaGrid = async () =>{

        await getListaCommessa(token , infoModuloCommessa.nonce).then((res:any)=>{
            const finalData = fixResponseForDataGrid(res.data);
            setGridData(finalData);
        }).catch((err:any)=>{
            if(err.response.status === 401){

                navigate('/error');
            }else if(err.response.status === 419){

                navigate('/error');
            }
        });
    };

    useEffect(()=>{
       
        getAnniSelect();
        getListaCommessaGrid();
        
        
    },[]);

  
  
    
   
    
   
    const [gridData, setGridData] = useState([]);
    
  
  

   
    const handleButtonFiltra = () => {
        getListaCommessaFiltered(token , infoModuloCommessa.nonce, valueSelect).then((res:any)=>{
            const finalData = fixResponseForDataGrid(res.data);
            setGridData(finalData);
           
        }).catch((err:any)=>{
            if(err.response.status === 401){

                navigate('/error');
            }else if(err.response.status === 419){

                navigate('/error');
            }
        });
    };


   
    const handleButtonAnnullaFiltri = () => {

        getListaCommessaOnAnnulla(token, infoModuloCommessa.nonce).then((res:any)=>{
            const finalData = fixResponseForDataGrid(res.data);
            setGridData(finalData);
           
        }).catch((err:any)=>{
            if(err.response.status === 401){

                navigate('/error');
            }else if(err.response.status === 419){

                navigate('/error');
            }
        });
      
    };


    console.log({infoModuloCommessa},'grid');
    return (

        <div className="m-5">
            <div>
                <Typography variant="h4">Modulo commessa</Typography>
            </div>

            {/*
            <div className="text-end">
                <Button onClick={() => console.log('pagina aggiungi modulo commessa')} variant="contained" size="small">Aggiungi</Button>
            </div>
 */}
            
            <div className=" marginTop24 d-flex mb-5">
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
                            onChange={(e) =>{setValueSelect(e.target.value);}  }
                            value={valueSelect}
                            IconComponent={ArrowDropDownIcon}
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
                        onClick={()=>handleButtonFiltra()}
                     
                    >
            Filtra 

                    </Button>
                    {valueSelect !== '' ? 
                        <Typography
                            variant="caption-semibold"
                            onClick={()=>{setValueSelect(''); handleButtonAnnullaFiltri();}}
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
                <GridComponent data={gridData} setInfoModuloCommessa={setInfoModuloCommessa} infoModuloCommessa={infoModuloCommessa} />
                
            </div>

        </div>
    );
};
export default  ModuloCommessaElencoUtPa;

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