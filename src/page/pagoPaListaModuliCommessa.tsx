import { ListaModuliCommessaProps } from "../types/typeListaModuliCommessa";
import { Typography } from "@mui/material";
import { Box, FormControl, InputLabel,Select, MenuItem, TextField, Button} from '@mui/material';
import {getTipologiaProdotto, getTipologiaProfilo, listaDatiFatturazionePagopa} from '../api/api';
import { ListaDatiFatturazioneProps } from "../types/typeListaDatiFatturazione";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {BodyListaDatiFatturazione} from '../types/typesGeneral';
import { DataGrid, GridRowParams,GridEventListener,MuiEvent, GridColDef } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';

const PagoPaListaModuliCommessa:React.FC<ListaModuliCommessaProps> = ({mainState,setMainState}) =>{



    return (
        <div className="mx-5">
            {/*title container start */}
            <div className="marginTop24 ">
                <Typography variant="h4">Lista Modulo Commessa</Typography>
            </div>
            {/*title container end */}
    
            <div className="d-flex  me-5 mb-5   marginTop24" >
                <div className="me-5">
                    <Box sx={{ width: 200 }}>
                        <FormControl
                            fullWidth
                            size="medium"
                        >
                            <InputLabel
                                id="sea"
                            >
                            Seleziona Prodotto

                            </InputLabel>
                            <Select
                                id="sea"
                                label='Seleziona Prodotto'
                                labelId="search-by-label"
                                onChange={(e) => console.log('888')}
                                value={''}
                                //IconComponent={SearchIcon}
                
                                disabled={status=== 'immutable' ? true : false}

                            >
                                {[1,2,3].map((el) => (

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
                </div>
                <div>
                    <Box sx={{ width: 200 }}>
                        <FormControl
                            fullWidth
                            size="medium"
                        >
                            <InputLabel
                                id="sea"
                            >
                            Seleziona Profilo

                            </InputLabel>
                            <Select
                                id="sea"
                                label='Seleziona Profilo'
                                labelId="search-by-label"
                                onChange={(e) =>  console.log('bestia')}
                                value={''}
                                //IconComponent={SearchIcon}
                
                                disabled={status=== 'immutable' ? true : false}

                            >
                                {[3,4,5].map((el) => (

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
                </div>
            </div>
            <div className="d-flex" >
                <div className="me-5">
                    <TextField
                        sx={{ width: 200 }}
                        label="Rag Soc. Ente"
                        placeholder="Rag Soc. Ente"
                        value={''}
                        onChange={(e)=>console.log('dio ')}
                    />
                </div>
                <div className=" d-flex justify-content-center align-items-center">
                    <div>
                        <Button 
                            onClick={()=> console.log('cioa')} 
                            sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                            variant="contained"> Filtra
                        </Button>
                        
                        <Button
                            onClick={()=>{
                                console.log('ciao');
                            } }
                            variant="contained"
                            sx={{marginLeft:'24px'}} >
                    Annulla filtri
                        </Button>
                    </div>
                
                </div>
           
            </div>
            {/* grid */}
            <div className="marginTop24" style={{display:'flex', justifyContent:'end'}}>
           
                <Button >
            Download Risultati
                    <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                </Button>
            </div>
            <div className="mt-1 mb-5" style={{ width: '100%'}}>
                <h1>Data grid</h1>
            
            </div>
            <div>

            </div>
        </div>
    );
};
export default PagoPaListaModuliCommessa;