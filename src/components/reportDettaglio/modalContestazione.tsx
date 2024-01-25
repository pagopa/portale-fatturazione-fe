import * as React from 'react';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { ModalContestazioneProps, TipoContestazione } from '../../types/typeReportDettaglio';
import {
    TextField,
    Box, FormControl, InputLabel,Select, MenuItem, Button
} from '@mui/material';
import { tipologiaTipoContestazione, manageError } from '../../api/api'; 
import { useNavigate } from 'react-router';
import {useState, useEffect} from 'react';

const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const ModalContestazione : React.FC <ModalContestazioneProps> = ({setOpen, open, mainState}) => {
/*
    PA => ente (selfcare)
 SUP=> supporto (ad)
 FIN=> finance (ad)
 RCP => recapitista (selfcare -> per cap)
CON => consolidatore (selfcare -> tutti gli enti)

[
        {
            "id": 1,
            "flag": "Non Contestata"
        },
        {
            "id": 2,
            "flag": "Annullata"
        },
        {
            "id": 3,
            "flag": "Contestata Ente"
        },
        {
            "id": 4,
            "flag": "Risposta Send"
        },
        {
            "id": 5,
            "flag": "Risposta Recapitista"
        },
        {
            "id": 6,
            "flag": "Risposta Consolidatore"
        },
        {
            "id": 7,
            "flag": "Risposta Ente"
        },
        {
            "id": 8,
            "flag": "Accettata"
        },
        {
            "id": 9,
            "flag": "Rifiutata"
        }
    ];


*/
    const [statoContetstazione, setStato] = useState(0);
    const [entita, setEnt] = useState('');
   
 
   
   

    const navigate = useNavigate();
    
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;


    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);


    interface ModalBodyContestazione {
        tipoContestazione : number | null,
        notaContestazione: string
    }
   


    const [modalBody, setModalBody] = useState<ModalBodyContestazione>({
        tipoContestazione:null,
        notaContestazione:''
    });

    useEffect(()=>{
        setStato(1);
        setEnt('PA');
     
    },[]);

    console.log(entita, '999', statoContetstazione, 'ccc');

    const [tipoContestazioni, setTipoContestazioni] = useState<TipoContestazione[]>([]);

    const getTipoConestazioni = async() => {
        await tipologiaTipoContestazione(token, mainState.nonce)
            .then((res)=>{
                setTipoContestazioni(res.data);
          
            })
            .catch(((err)=>{
                manageError(err,navigate);
            }));
    };


    useEffect(()=>{
        if(mainState.nonce !== ''){
            getTipoConestazioni();
        }
    },[mainState.nonce]);


  

   
 
    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    return (
        <div>
        
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
        Contestazione
                    </Typography>
                    {/*BODY */}
                    <div className='container nopadding_Left '>
                        <div className='row mt-3'>
                            <div className='col-3'>
                                <FormControl
                                    fullWidth
                                    size="medium"
                                >
                                    <InputLabel
                                        id="tipoCon"
                                    >
                                Tipo Contestazione

                                    </InputLabel>
                                    <Select
                                        id="tipoCon"
                                        label='Tipo Contestazione'
                                        labelId="search-by-label"
                                        onChange={(e) =>{
                                            console.log('diocane');
                                            if(e.target.value === ''){
                                                setModalBody((prev)=> ({...prev, ...{tipoContestazione:null}}));
                                            }else{
                                                setModalBody((prev)=> ({...prev, ...{tipoContestazione:Number(e.target.value)}}));
                                            }
                                            
                                        } }
                                        value={modalBody.tipoContestazione|| ''}
                                        disabled= {entita !== 'PA' || statoContetstazione !== 1}

                                    >
                                        {tipoContestazioni.map((el) => (

                                            <MenuItem
                                                key={el.id}
                                                value={el.id}
                                            >
                                                {el.tipo}
                                            </MenuItem>

                                        ))}

                                    </Select>
                                </FormControl>
                            </div>
                        
                            <div className='col-4'>
                                <TextField
                                    //required={required}
                                  
                                    id="outlined-basic"
                                    label='Note Contestazione'
                                    placeholder='Note Contestazione'
                                    //  disabled={makeTextInputDisable}
                                    value={modalBody.notaContestazione}
                                    fullWidth
                                    multiline
                                    disabled= {entita !== 'PA' || (statoContetstazione !== 1 && statoContetstazione !== 3)}
                                    // error={errorValidation}
                                    onChange={(e) =>  setModalBody((prev)=> ({...prev, ...{notaContestazione:e.target.value}}))}
                                    onBlur={()=> console.log('miao')}
            
                                />
                            </div>
                            
                            {statoContetstazione === 1 ? null : 
                                <div className='col-4'>
                                    <TextField
                                    //required={required}
                                    // helperText='Cap'
                                        id="x"
                                        label='Risposta'
                                        placeholder='Risposta'
                                        disabled={entita !== 'PA' || (statoContetstazione !== 3 && statoContetstazione !== 4 && statoContetstazione !== 5 && statoContetstazione !== 6 )}
                                        value={''}
                                        fullWidth
                                        multiline
                                        // error={errorValidation}
                                        onChange={(e) => console.log('')}
                                        onBlur={()=> console.log('miao')}
            
                                    />
                                </div>
                            }
                        </div>
                        {statoContetstazione === 1 ? null :
                            <div className='row mt-5'>
                            
                                <Typography id="modal-modal-title" variant="overline">
                                Supporto Send
                                </Typography>
                                <div className='col-4 mt-2'>
                                    <TextField
                                    //required={required}
                                    // helperText='Cap'
                                        id="outlined-basic"
                                        label='Risposta'
                                        placeholder='Risposta'
                                        disabled={entita !== 'SUP' || (statoContetstazione !== 1 && statoContetstazione !== 2 && statoContetstazione !== 7 && statoContetstazione !== 8 && statoContetstazione !== 9 )}
                                        value={''}
                                        fullWidth
                                        multiline
                                        // error={errorValidation}
                                        onChange={(e) => console.log(e)}
                                        onBlur={()=> console.log('miao')}
            
                                    />
                                </div>

                            </div>
                        }
                        {statoContetstazione === 1 ? null :
                            <div className='row mt-5'>
                            
                                <Typography id="modal-modal-title" variant="overline">
                                Recapitista
                                </Typography>
                                <div className='col-4 mt-2'>
                                    <TextField
                                    //required={required}
                                    // helperText='Cap'
                                        id="outlined-basic"
                                        label='Risposta'
                                        placeholder='Risposta'
                                        disabled={entita !== 'RCP' || (statoContetstazione !== 1 && statoContetstazione !== 2 && statoContetstazione !== 5 )}
                                        value={''}
                                        fullWidth
                                        multiline
                                        // error={errorValidation}
                                        onChange={(e) => console.log(e)}
                                        onBlur={()=> console.log('miao')}
            
                                    />
                                </div>

                            </div>
                        }

                        {statoContetstazione === 1 ? null :
                            <div className='row mt-5'>
                            
                                <Typography id="modal-modal-title" variant="overline">
                                Consolidatore
                                </Typography>
                                <div className='col-4 mt-2'>
                                    <TextField
                                    //required={required}
                                    // helperText='Cap'
                                        id="outlined-basic"
                                        label='Risposta'
                                        placeholder='Risposta'
                                        disabled={entita !== 'RCP' || (statoContetstazione !== 1 && statoContetstazione !== 2 && statoContetstazione !== 6 && statoContetstazione !== 8 && statoContetstazione !== 9  )}
                                        value={''}
                                        fullWidth
                                        multiline
                                        // error={errorValidation}
                                        onChange={(e) => console.log(e)}
                                        onBlur={()=> console.log('miao')}
            
                                    />
                                </div>

                            </div>
                        }

                    </div>

                    {/*BODY */}
                    <div className='container mt-5'>
                        <div className='row'>
                            {
                                statoContetstazione !== 1   ? null :
                          
                                    <div className='col-2 me-2'>
                                        <Button 
                                   
                                            variant='outlined'
                                            onClick={()=>handleClose()}
                                        >Crea Contestazione</Button>
                                    </div>
                            }
                            {
                                statoContetstazione === 1  || statoContetstazione === 2  || statoContetstazione === 8  || statoContetstazione === 9  || entita !== 'PA'  ? null :
                          
                                    <div className='col-2 me-2'>
                                        <Button 
                                   
                                            variant='outlined'
                                            onClick={()=>handleClose()}
                                        >Elimina Contestazione</Button>
                                    </div>
                            }
                            { statoContetstazione === 1  || statoContetstazione === 2  || statoContetstazione === 8  || statoContetstazione === 9 ? null :
                                <div className='col-2 me-2'>
                                    <Button
                                  
                                        variant='contained'
                                        onClick={()=>console.log('esci')}
                                    >Rispondi</Button>
                                </div>
                            }
                          
                            { (entita !== 'CON'  && entita !== 'RCP') || statoContetstazione === 1  || statoContetstazione === 2  || statoContetstazione === 8  || statoContetstazione === 9 ? null :
                                <div className='col-2 me-2'>
                                    <Button
                                   
                                        variant='contained'
                                        onClick={()=>console.log('esci')}
                                    >Ripondi e Accetta contestazione</Button>
                                </div>
                            }

                            {/*'risposta Consolidatore === vuoto '  ||*/ entita === 'CON' || statoContetstazione === 1  || statoContetstazione === 2  || statoContetstazione === 3  ||statoContetstazione === 8 || statoContetstazione === 9 ? null :
                                <div className='col-2 me-2'>
                                    <Button
                                  
                                        variant='contained'
                                        onClick={()=>console.log('esci')}
                                    >Ripondi e Accetta Cosolidatore</Button>
                                </div>
                            }

                            {/*'risposta Recapitista === vuoto '  ||*/ entita === 'RCP' || statoContetstazione === 1  || statoContetstazione === 2  || statoContetstazione === 3  ||statoContetstazione === 8 || statoContetstazione === 9 ? null :
                                <div className='col-2 me-2'>
                                    <Button
                                    
                                        variant='contained'
                                        onClick={()=>console.log('esci')}
                                    >Ripondi e Accetta recapitista</Button>
                                </div>
                            }

                            {entita === 'PA'|| statoContetstazione === 1  || statoContetstazione === 2  ||statoContetstazione === 8 || statoContetstazione === 9 ? null :
                                <div className='col-2 me-2'>
                                    <Button
                                    
                                        variant='contained'
                                        onClick={()=>console.log('esci')}
                                    >Ripondi e Accetta ente</Button>
                                </div>
                            }
                        </div>
                     
                    </div>
                    
                </Box>
                
            </Modal>
        </div>
    );
};
export default ModalContestazione;