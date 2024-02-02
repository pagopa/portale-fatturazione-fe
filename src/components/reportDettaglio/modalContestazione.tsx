import * as React from 'react';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { ModalContestazioneProps, TipoContestazione, ModalBodyContestazione, Contestazione } from '../../types/typeReportDettaglio';
import {
    TextField,
    Box, FormControl, InputLabel,Select, MenuItem, Button
} from '@mui/material';
import { tipologiaTipoContestazione, manageError, createContestazione, modifyContestazioneEnte} from '../../api/api'; 
import { useNavigate } from 'react-router';
import {useState, useEffect} from 'react';
import YupString from '../../validations/string/index';

const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const ModalContestazione : React.FC <ModalContestazioneProps> = ({setOpen, open, mainState, contestazioneSelected, setContestazioneSelected, funGetNotifiche}) => {
/*
    PA => ente (selfcare)
 SUP=> supporto (ad)
 FIN=> finance (ad)
 RCP => recapitista (selfcare -> per cap)
CON => consolidatore (selfcare -> tutti gli enti)
*/
    const [entita, setEnt] = useState('');
   
    useEffect(()=>{

        setEnt('PA');
    },[]);
 
   
   

    const navigate = useNavigate();
    
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;


    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);



    const [enableCreaContestazione, setEnableCreaContestazione] = useState(true);

    const requiredString = (string:string) =>{
        
        YupString.required().validate(string).then(()=>{
            setEnableCreaContestazione(false);
            setErrNoteEnte(false);
            
        }).catch(()=>{
            setEnableCreaContestazione(true);
            setErrNoteEnte(true);
        });
    };
   

    // reset dei dati del modal ogni qual volta viene chiuso 
    useEffect(()=>{
        if(open === false){
            setContestazioneSelected({
                modifica: true,
                accetta: true,
                contestazione: {
                    id: 0,
                    tipoContestazione: 0,
                    idNotifica: '',
                    noteEnte: '',
                    noteSend: null,
                    noteRecapitista: null,
                    noteConsolidatore: null,
                    rispostaEnte: '',
                    statoContestazione: 0,
                    onere: '',
                    dataInserimentoEnte: '',
                    dataModificaEnte: '',
                    dataInserimentoSend: '',
                    dataModificaSend: '',
                    dataInserimentoRecapitista: '',
                    dataModificaRecapitista: '',
                    dataInserimentoConsolidatore: '',
                    dataModificaConsolidatore: '',
                    dataChiusura: '',
                    anno: 0,
                    mese: 0
                }
                
            });
            
            setEnableCreaContestazione(true);
        }
    },[open]);

   
   
   

   

    const [tipoContestazioni, setTipoContestazioni] = useState<TipoContestazione[]>([]);

    // get delle tipologie delle contestazioni che popolano la select 
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



    const creaContestazione = async () => {

        const body = {
            idNotifica:contestazioneSelected.contestazione.idNotifica,
            tipoContestazione:contestazioneSelected.contestazione.tipoContestazione,
            noteEnte:contestazioneSelected.contestazione.noteEnte
        };

        
        await createContestazione(token, mainState.nonce,body)
            .then(()=>{
                setOpen(false);
                funGetNotifiche();
            })
            .catch(((err)=>{
                manageError(err,navigate);
            }));
    };

   

    const modifyContestazioneFun = async (action:string) => {
        let body;
        if(action === 'Annulla'){
            body ={
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                statoContestazione:2
            };
        }else{
            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                noteEnte:contestazioneSelected.contestazione.noteEnte,
                rispostaEnte: contestazioneSelected.contestazione.rispostaEnte,
                statoContestazione:contestazioneSelected.contestazione.statoContestazione
            };
        }
        
        
        await modifyContestazioneEnte(token, mainState.nonce, body).then((res)=>{
            setOpen(false);
            funGetNotifiche();
            
        }).catch(((err)=>{
            manageError(err,navigate);
        }));

    };

    const [errNoteEnte, setErrNoteEnte] = useState(false);

  

   
 
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
                            <div className='col-4'>
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
                                           
                                            if(e.target.value === ''){
                                                 
                                                setContestazioneSelected((prev:Contestazione)=>{
                                                    const newContestazione = {...prev.contestazione, tipoContestazione:null};
                                                    return {...prev, contestazione:newContestazione};
                                                } );
                                            }else{
                                                setContestazioneSelected((prev:Contestazione)=>{
                                                    const newContestazione = {...prev.contestazione, tipoContestazione:Number(e.target.value)};
                                                    return {...prev, contestazione:newContestazione};
                                                } );
                                            }
                                            
                                        } }
                                        value={contestazioneSelected.contestazione.tipoContestazione|| ''}
                                        disabled= {entita !== 'PA' || contestazioneSelected?.contestazione?.statoContestazione !== 1}

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
                                    required
                                  
                                    id="outlined-basic"
                                    label='Note Contestazione'
                                    placeholder='Note Contestazione'
                                    //  disabled={makeTextInputDisable}
                                    value={contestazioneSelected.contestazione.noteEnte}
                                    fullWidth
                                    multiline
                                    disabled= {entita !== 'PA' || (contestazioneSelected?.contestazione?.statoContestazione !== 1 && contestazioneSelected?.contestazione?.statoContestazione !== 3)}
                                    error={errNoteEnte}
                                    onChange={(e) =>  setContestazioneSelected((prev:Contestazione)=> {
                                    
                                        const newContestazione = {...prev.contestazione, noteEnte:e.target.value};
                                        return {...prev, contestazione:newContestazione};
                                     
                                    })}
                                    onBlur={(e)=> requiredString(e.target.value)}
            
                                />
                            </div>
                            
                            {contestazioneSelected?.contestazione?.statoContestazione === 1 || contestazioneSelected?.contestazione?.statoContestazione === 3 ? null : 
                                <div className='col-4'>
                                    <TextField
                                    //required={required}
                                    // helperText='Cap'
                                        id="x"
                                        label='Risposta'
                                        placeholder='Risposta'
                                        disabled={entita !== 'PA' || (contestazioneSelected.contestazione.statoContestazione !== 3 && contestazioneSelected.contestazione.statoContestazione !== 4 && contestazioneSelected.contestazione.statoContestazione !== 5 && contestazioneSelected.contestazione.statoContestazione !== 6 )}
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
                        {contestazioneSelected.contestazione.statoContestazione === 1 || contestazioneSelected.contestazione.statoContestazione === 3 ? null :
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
                                        disabled={entita !== 'SUP' || (contestazioneSelected.contestazione.statoContestazione !== 1 && contestazioneSelected.contestazione.statoContestazione !== 2 && contestazioneSelected.contestazione.statoContestazione !== 7 && contestazioneSelected.contestazione.statoContestazione !== 8 && contestazioneSelected.contestazione.statoContestazione !== 9 )}
                                        value={contestazioneSelected.contestazione.noteSend}
                                        fullWidth
                                        multiline
                                        // error={errorValidation}
                                        onChange={(e) => console.log(e)}
                                        onBlur={()=> console.log('miao')}
            
                                    />
                                </div>

                            </div>
                        }
                        {contestazioneSelected.contestazione.statoContestazione === 1 || contestazioneSelected.contestazione.statoContestazione === 3 ? null :
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
                                        disabled={entita !== 'RCP' || (contestazioneSelected.contestazione.statoContestazione !== 1 && contestazioneSelected.contestazione.statoContestazione !== 2 && contestazioneSelected.contestazione.statoContestazione !== 5 )}
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

                        {contestazioneSelected.contestazione.statoContestazione === 1 || contestazioneSelected.contestazione.statoContestazione === 3 ? null :
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
                                        disabled={entita !== 'RCP' || (contestazioneSelected.contestazione.statoContestazione !== 1 && contestazioneSelected.contestazione.statoContestazione !== 2 && contestazioneSelected.contestazione.statoContestazione !== 6 && contestazioneSelected.contestazione.statoContestazione !== 8 && contestazioneSelected.contestazione.statoContestazione !== 9  )}
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
                                contestazioneSelected.contestazione.statoContestazione !== 1   ? null :
                          
                                    <div className='col-2 me-2'>
                                        <Button 
                                            disabled={enableCreaContestazione || contestazioneSelected.contestazione.tipoContestazione === null}
                                            variant='outlined'
                                            onClick={()=>{
                                                creaContestazione();
                                            }
                                            }
                                        >Crea Contestazione</Button>
                                    </div>
                            }
                            {
                                contestazioneSelected.contestazione.statoContestazione === 1  || contestazioneSelected.contestazione.statoContestazione === 2  || contestazioneSelected.contestazione.statoContestazione === 8  || contestazioneSelected.contestazione.statoContestazione === 9  || entita !== 'PA'  ? null :
                          
                                    <div className='col-2 me-2'>
                                        <Button 
                                   
                                            variant='outlined'
                                            onClick={()=>{
                                                modifyContestazioneFun('Annulla');
                                            }}
                                        >Annulla Contestazione</Button>
                                    </div>
                            }
                            { contestazioneSelected.contestazione.statoContestazione === 1  || contestazioneSelected.contestazione.statoContestazione === 2  || contestazioneSelected.contestazione.statoContestazione === 8  || contestazioneSelected.contestazione.statoContestazione === 9 ? null :
                                <div className='col-2 me-2'>
                                    <Button
                                        disabled={enableCreaContestazione}
                                        variant='contained'
                                        onClick={()=>{
                                            modifyContestazioneFun('Modifica/Rispondi');
                                            
                                        }}
                                    >{contestazioneSelected.contestazione.statoContestazione === 3 ? 'Modifica' : 'Rispondi'}</Button>
                                </div>
                            }
                          
                            { (entita !== 'CON'  && entita !== 'RCP') || contestazioneSelected.contestazione.statoContestazione === 1  || contestazioneSelected.contestazione.statoContestazione === 2  || contestazioneSelected.contestazione.statoContestazione === 8  || contestazioneSelected.contestazione.statoContestazione === 9 ? null :
                                <div className='col-2 me-2'>
                                    <Button
                                   
                                        variant='contained'
                                        onClick={()=>console.log('esci')}
                                    >Ripondi e Accetta contestazione</Button>
                                </div>
                            }

                            {/*'risposta Consolidatore === vuoto '  ||*/ entita === 'CON' || contestazioneSelected.contestazione.statoContestazione === 1  || contestazioneSelected.contestazione.statoContestazione === 2  || contestazioneSelected.contestazione.statoContestazione === 3  ||contestazioneSelected.contestazione.statoContestazione === 8 || contestazioneSelected.contestazione.statoContestazione === 9 ? null :
                                <div className='col-2 me-2'>
                                    <Button
                                  
                                        variant='contained'
                                        onClick={()=>console.log('esci')}
                                    >Ripondi e Accetta Cosolidatore</Button>
                                </div>
                            }

                            {/*'risposta Recapitista === vuoto '  ||*/ entita === 'RCP' || contestazioneSelected.contestazione.statoContestazione === 1  || contestazioneSelected.contestazione.statoContestazione === 2  || contestazioneSelected.contestazione.statoContestazione === 3  ||contestazioneSelected.contestazione.statoContestazione === 8 || contestazioneSelected.contestazione.statoContestazione === 9 ? null :
                                <div className='col-2 me-2'>
                                    <Button
                                    
                                        variant='contained'
                                        onClick={()=>console.log('esci')}
                                    >Ripondi e Accetta recapitista</Button>
                                </div>
                            }

                            {entita === 'PA'|| contestazioneSelected.contestazione.statoContestazione === 1  || contestazioneSelected.contestazione.statoContestazione === 2  ||contestazioneSelected.contestazione.statoContestazione === 8 || contestazioneSelected.contestazione.statoContestazione === 9 ? null :
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