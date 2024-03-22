import React, {useState, useEffect} from 'react';
import { manageError, redirect } from '../api/api';
import { Button, Box, Typography, FormControl, InputLabel,Select, MenuItem,} from '@mui/material';
import GridComponent from '../components/commessaElenco/grid';
import { useNavigate } from 'react-router';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { VisualModuliCommessaProps,  DataGridCommessa , GetAnniResponse, ResponseGetListaCommesse} from '../types/typeModuloCommessaElenco';
import { ManageErrorResponse } from '../types/typesGeneral';
import { getAnni, getListaCommessa, getListaCommessaFiltered, getListaCommessaOnAnnulla } from '../api/apiSelfcare/moduloCommessaSE/api';
import ModalRedirect from '../components/commessaInserimento/madalRedirect';

const ModuloCommessaElencoUtPa: React.FC<VisualModuliCommessaProps> = ({dispatchMainState,mainState}) => {
   
    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);
  
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const state = localStorage.getItem('statusApplication') || '{}';
    const statusApp =  JSON.parse(state);
   
    const navigate = useNavigate();

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    useEffect(()=>{
        handleModifyMainState(statusApp);
        if(statusApp.datiFatturazione === false){
            setOpenModalRedirect(true);
        }
  
    },[]);

    const [anni, setAnni] = useState<string[]>([]);
    const [valueSelect, setValueSelect] = useState<string>('');

    const [gridData, setGridData] = useState<DataGridCommessa[]>([]);
    
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
    // il componente data grid ha bisogno di un id per ogni elemento
    const fixResponseForDataGrid = (arr:DataGridCommessa[]) =>{
      
        const result = arr.map( (singlObj:DataGridCommessa) =>{
            
            return {
                id : Math.random(),
                ...singlObj
            };
        } );
        return result;
    };

    // servizio che  popola la select anni
    const getAnniSelect = async () =>{

        await getAnni(token, profilo.nonce).then((res:GetAnniResponse)=>{
           
            setAnni(res.data);
        }).catch((err:ManageErrorResponse)=>{
            manageError(err, navigate);
        });
    };

    // servizio che popola la grid con la lista commesse
    const getListaCommessaGrid = async () =>{

        await getListaCommessa(token , profilo.nonce).then((res:ResponseGetListaCommesse)=>{
            
            const finalData = fixResponseForDataGrid(res.data);
            setGridData(finalData);
        }).catch((err:ManageErrorResponse)=>{
            manageError(err, navigate);
        });
    };

    // nel caso in cui un utente apre un altra tab e accede come un utente diverso le chiamate andranno in errore
    // nel beck è stato implementato un controllo basato sul nonce
    useEffect(()=>{
        if(profilo.nonce !== undefined){
            getAnniSelect();
            getListaCommessaGrid();
        }
        
    },[profilo.nonce]);
    
    // se il token non c'è viene fatto il redirect al portale di accesso
    useEffect(()=>{
        if(token === undefined){
            window.location.href = redirect;
        }
    },[]);
  
    const handleButtonFiltra = () => {
        getListaCommessaFiltered(token , profilo.nonce, valueSelect).then((res:ResponseGetListaCommesse)=>{
            const finalData = fixResponseForDataGrid(res.data);
            setGridData(finalData);
           
        }).catch((err:ManageErrorResponse)=>{
            manageError(err, navigate);
        });
    };

    // on click sul button annulla filtri
    const handleButtonAnnullaFiltri = () => {

        getListaCommessaOnAnnulla(token, profilo.nonce).then((res:ResponseGetListaCommesse)=>{
            const finalData = fixResponseForDataGrid(res.data);
            setGridData(finalData);
           
        }).catch((err:ManageErrorResponse)=>{
            manageError(err, navigate);
        });
      
    };

    return (

        <div className="mx-5">
            <div className='marginTop24'>
                <Typography variant="h4">Modulo commessa</Typography>
                
            </div>
        
            <div className=" d-flex justify-content-between mb-5  mt-5">
                <div className='d-flex'>

               
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

                {(mainState.primoInserimetoCommessa && profilo.auth === 'SELFCARE') &&
                <Button variant="contained" onClick={()=> navigate('/8')}>Inserisci modulo commessa</Button>
                }

            </div>

            <div className='mb-5'>
                <GridComponent data={gridData} dispatchMainState={dispatchMainState} mainState={mainState} />
                
            </div>
            <ModalRedirect 
                setOpen={setOpenModalRedirect}
                open={openModalRedirect}
                sentence={`Per poter inserire il modulo commessa è necessario l'inserimento dei dati di fatturazione obbligatori:`}></ModalRedirect>

        </div>
    );
};
export default  ModuloCommessaElencoUtPa;
