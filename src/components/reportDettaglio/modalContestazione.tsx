import * as React from 'react';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { ModalContestazioneProps, TipoContestazione, ModalBodyContestazione, Contestazione } from '../../types/typeReportDettaglio';
import {
    TextField,
    Box, FormControl, InputLabel,Select, MenuItem, Button
} from '@mui/material';
import { tipologiaTipoContestazione, manageError, createContestazione, modifyContestazioneEnte, modifyContestazioneEntePagoPa} from '../../api/api'; 
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

const ModalContestazione : React.FC <ModalContestazioneProps> = ({setOpen, open, mainState, contestazioneSelected, setContestazioneSelected, funGetNotifiche, funGetNotifichePagoPa}) => {
/*
    PA => ente (selfcare)
 SUP=> supporto (ad)
 FIN=> finance (ad)
 RCP => recapitista (selfcare -> per cap)
CON => consolidatore (selfcare -> tutti gli enti)

    const [entita, setEnt] = useState('');
   
    useEffect(()=>{

        setEntita('PA');
    },[]);
 
   */
   

    const navigate = useNavigate();
    
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;


    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);



    const [enableCreaContestazione, setEnableCreaContestazione] = useState(true);
    
 

    const requiredString = (string:string , nomeTextBox:string) =>{
        
        YupString.required().validate(string).then(()=>{
               
            setEnableCreaContestazione(false);
      
        }).catch(()=>{
             
            setEnableCreaContestazione(true);
         
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
        setErrNoteEnte(false);
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

    console.log(contestazioneSelected);

    const modifyContestazioneFun = async (action:string) => {
        let body;
        if(action === 'Annulla'){
            body ={
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                statoContestazione:2
            };
        }else if(action === 'Modifica/Rispondi' && stato === 4){
            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                noteEnte:contestazioneSelected.contestazione.noteEnte,
                rispostaEnte: contestazioneSelected.contestazione.rispostaEnte,
                statoContestazione:7
            };
        }else if(action === 'RispondiAccettaSend' && stato === 4){
            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                noteEnte:contestazioneSelected.contestazione.noteEnte,
                rispostaEnte: contestazioneSelected.contestazione.rispostaEnte,
                onere:'SEND',
                statoContestazione:9
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



    const modifyContestazioneFunPagoPa = async(action:string) => {
        let body = {};
        if(action === 'rispondi'){

            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                onere:'PA',
                noteSend: contestazioneSelected.contestazione.noteSend,
                statoContestazione:4
            };
        }
        if(action === 'rispondi_accetta'){
            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                onere:'PA',
                noteSend: contestazioneSelected.contestazione.noteSend,
                statoContestazione:8
            };
        }
        if(action === 'chiudi'){
            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                onere:'SEND',
                noteSend: contestazioneSelected.contestazione.noteSend,
                statoContestazione:9
            };
        }

       

        await modifyContestazioneEntePagoPa(token, mainState.nonce, body).then((res)=>{
            setOpen(false);
            funGetNotifichePagoPa();
            
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

    // hidden show text field
    const stato = contestazioneSelected?.contestazione?.statoContestazione;
    const rispostaEnte = contestazioneSelected?.contestazione?.rispostaEnte;
    const rispostaSend = contestazioneSelected?.contestazione?.noteSend;
    const noteRecapitista = contestazioneSelected.contestazione.noteRecapitista;

    const noActionEnte = contestazioneSelected.modifica && contestazioneSelected.chiusura && contestazioneSelected.risposta;


    const readOnlyNotaContestazione = (
        stato !== 1 && stato !== 3) ||
          contestazioneSelected.modifica === false;
    

    const rispostaEnteIsHidden =  stato === 1 ||
     (stato === 2 && rispostaEnte === null ) || 
     stato === 3 ||
     (stato === 4  && profilo.auth === 'PAGOPA')||
     (stato === 8 && rispostaEnte === null ) || 
     (stato === 9 && rispostaEnte === null ); 

    const readOnlyRispostaEnte =  (stato === 2 && rispostaEnte !== null) ||
       stato === 8 ||
       stato === 9 || 
       contestazioneSelected?.risposta === false ||
       profilo.auth === 'PAGOPA';

    const supportoSentHidden =  stato === 1 ||
    stato === 2 ||
    (stato === 3 && profilo.profilo === 'PA') ||
    (stato === 8 && rispostaSend === null) ||
    (stato === 9  && rispostaSend === null) ;
    // stato === 3 ||
    //(stato === 5 && rispostaSend === null)||
    //(stato === 6 && rispostaSend === null)||

    const recapitistaHidden = stato === 1 ||
     (stato === 2 && noteRecapitista === null) || 
     stato === 3 ||
    (stato === 4 && noteRecapitista === null) ||
    (stato === 6 && noteRecapitista === null) ||
    (stato === 7 && noteRecapitista === null) ||
    (stato === 8 && noteRecapitista === null) ||
    (stato === 9 && noteRecapitista === null); 
    

    const supportSendReadOnly = profilo.auth !== 'PAGOPA' ||
     stato === 9||
     stato === 8  ||
     stato === 7  ||
      stato === 2;

    const hiddenRispondi_send =  stato === 1 ||
    stato === 2 ||
    stato === 5 ||
    stato === 6 ||
    stato === 7 ||
    stato === 8 ||
    stato === 9 ||
    profilo.auth !== 'PAGOPA';

    const hiddenRispondiAccettaEnte_send = stato === 1 ||
    stato === 2 ||
    stato === 5 ||
    stato === 6 ||
    stato === 8 ||
    stato === 9 ||
    profilo.auth !== 'PAGOPA';


    const hiddenConsRec =   stato === 1 ||
    stato === 2 ||
    stato === 3 ||
    stato === 5 ||
    stato === 6 ||
    stato === 8 ||
    stato === 9; 

    const hiddenButtonAnnullaContestazione = profilo.auth === 'PAGOPA' ||
     stato !== 3 ||
      (contestazioneSelected.chiusura === false && contestazioneSelected.modifica === false); 

    const hiddenModificaRispondiEnte = stato === 1  ||
       stato === 2  ||
        stato === 8  || 
        stato === 9 ||
    profilo.auth === 'PAGOPA';

    const hiddenRispondiChiudiSend = (stato !== 4 && stato !== 7) ||
     profilo.profilo !== 'PA'; 

    const hiddenChiudi_send = profilo.auth !== 'PAGOPA' || stato !== 7;

    let disableCreaContestazioneButton = false;
    if(stato === 1 && (contestazioneSelected.contestazione.tipoContestazione < 1  || contestazioneSelected.contestazione.noteEnte === null || contestazioneSelected.contestazione.noteEnte === '')){
        disableCreaContestazioneButton = true;
    }

    let stringButtonAccettaEnte_send = 'Rispondi e accetta Ente';
    if(stato === 4 ){
        stringButtonAccettaEnte_send = 'Modifica e accetta Ente';
    }else if (stato === 7){
        stringButtonAccettaEnte_send = 'Accetta Contestazione Ente';
    }

    let labelModificaRispondiEnte = 'Rispondi';
    if(stato === 3 && profilo.profilo === 'PA' ){
        labelModificaRispondiEnte = 'Modifica Nota';
    }else if(stato === 7 && profilo.profilo === 'PA'){
        labelModificaRispondiEnte = 'Modifica Risposta';
    }

    let disableRispondiAccettaSend_rispondi = false;
    if(profilo.profilo === 'PA' && stato === 4 && (contestazioneSelected.contestazione.rispostaEnte === '' || contestazioneSelected.contestazione.rispostaEnte === null)){
        disableRispondiAccettaSend_rispondi = true;
    }else if(profilo.profilo === 'PA' && stato === 3 && (contestazioneSelected.contestazione.noteEnte === '' || contestazioneSelected.contestazione.noteEnte === null)){
        disableRispondiAccettaSend_rispondi = true;
    }
    
    return (
        <div>
        
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <div className='d-flex justify-content-between'>
                        <div>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                {contestazioneSelected.contestazione.statoContestazione === 1 ? 'Crea contestazione': 'Contestazione'}
    
                            </Typography>
                        </div>
                        <div>
                            <Button variant="contained"  onClick={()=> handleClose() }> X </Button>
                        </div>
                    </div>
                   
                    {/*BODY */}
                    <div className='pt-3'>
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
                                        // disabled= {profilo.profilo !== 'PA' || contestazioneSelected?.contestazione?.statoContestazione !== 1}
                                        inputProps={{ readOnly: contestazioneSelected?.contestazione?.statoContestazione !== 1 }}

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
                                    //disabled= {profilo.profilo !== 'PA' || (contestazioneSelected?.contestazione?.statoContestazione !== 1 && contestazioneSelected?.contestazione?.statoContestazione !== 3) ||  contestazioneSelected.modifica === false}
                                    InputProps={{ readOnly: readOnlyNotaContestazione}}
                                    error={errNoteEnte}
                                    onChange={(e) =>  setContestazioneSelected((prev:Contestazione)=> {
                                    
                                        const newContestazione = {...prev.contestazione, noteEnte:e.target.value};
                                        return {...prev, contestazione:newContestazione};
                                     
                                    })}
                                    onBlur={(e)=> requiredString(e.target.value, 'nota_ente')}
            
                                />
                            </div>
                            
                            {rispostaEnteIsHidden ? null : 
                                <div className='col-4'>
                                    <TextField
                                    //required={required}
                                    // helperText='Cap'
                                        id="x"
                                        label='Risposta'
                                        placeholder='Risposta'
                                        //disabled={profilo.profilo !== 'PA' || (contestazioneSelected.contestazione.statoContestazione !== 3 && contestazioneSelected.contestazione.statoContestazione !== 4 && contestazioneSelected.contestazione.statoContestazione !== 5 && contestazioneSelected.contestazione.statoContestazione !== 6 )}
                                        InputProps={{ readOnly:readOnlyRispostaEnte}}
                                        value={contestazioneSelected.contestazione.rispostaEnte || ''}
                                        fullWidth
                                        multiline
                                        // error={errorValidation}
                                        onChange={(e) =>  setContestazioneSelected((prev:Contestazione)=> {
                                    
                                            const newContestazione = {...prev.contestazione, rispostaEnte:e.target.value};
                                            return {...prev, contestazione:newContestazione};
                                         
                                        })}
                                        onBlur={(e)=> requiredString(e.target.value, 'risposta_ente')}
            
                                    />
                                </div>
                            }
                        </div>
                        {supportoSentHidden ? null :
                            <div className='row mt-5'>
                            
                                <Typography id="modal-modal-title" variant="overline">
                                Supporto Send
                                </Typography>
                                <div className='col-4 mt-2'>
                                    <TextField
                                    //required={required}
                                    // helperText='Cap'
                                        id="supporto"
                                        label='Risposta'
                                        placeholder='Risposta'
                                        //disabled={profilo.profilo !== 'SUP' || (contestazioneSelected.contestazione.statoContestazione !== 1 && contestazioneSelected.contestazione.statoContestazione !== 2 && contestazioneSelected.contestazione.statoContestazione !== 7 && contestazioneSelected.contestazione.statoContestazione !== 8 && contestazioneSelected.contestazione.statoContestazione !== 9 )}
                                        value={contestazioneSelected.contestazione.noteSend || ''}
                                        fullWidth
                                        multiline
                                        InputProps={{ readOnly: supportSendReadOnly }}
                                        // error={errorValidation}
                                        onChange={(e) =>  setContestazioneSelected((prev:Contestazione)=> {
                                    
                                            const newContestazione = {...prev.contestazione, noteSend:e.target.value};
                                            return {...prev, contestazione:newContestazione};
                                         
                                        })}
                                        onBlur={()=> console.log('miao')}
            
                                    />
                                </div>

                            </div>
                        }
                        { /*  nascondiamo recapitista e consolidatore */}
                        {recapitistaHidden ? null :
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
                                        disabled={profilo.profilo !== 'RCP' || (contestazioneSelected.contestazione.statoContestazione !== 1 && contestazioneSelected.contestazione.statoContestazione !== 2 && contestazioneSelected.contestazione.statoContestazione !== 5 )}
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
                        {/* 
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
                                        disabled={profilo.profilo !== 'RCP' || (contestazioneSelected.contestazione.statoContestazione !== 1 && contestazioneSelected.contestazione.statoContestazione !== 2 && contestazioneSelected.contestazione.statoContestazione !== 6 && contestazioneSelected.contestazione.statoContestazione !== 8 && contestazioneSelected.contestazione.statoContestazione !== 9  )}
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
                        */}

                    </div>

                    {/*BODY */}
                    <div className='mt-5'>
                        <div className='row'>
                            {
                                contestazioneSelected.contestazione.statoContestazione !== 1   ? null :
                          
                                    <div className='col-2 me-2'>
                                        <Button 
                                            disabled={disableCreaContestazioneButton}
                                            variant='outlined'
                                            onClick={()=>{
                                                creaContestazione();
                                            }
                                            }
                                            
                                        >Crea Contestazione</Button>
                                    </div>
                            }
                            {
                                hiddenButtonAnnullaContestazione ? null :
                          
                                    <div className='col-2 me-2'>
                                        <Button 
                                   
                                            variant='outlined'
                                            onClick={()=>{
                                                modifyContestazioneFun('Annulla');
                                            }}
                                        >Annulla Contestazione</Button>
                                    </div>
                            }
                            {/* butto ENTE */}
                            { hiddenModificaRispondiEnte ? null :
                                <div className='col-2 me-2'>
                                    <Button
                                        disabled={disableRispondiAccettaSend_rispondi}
                                        variant='contained'
                                        onClick={()=>{
                                            modifyContestazioneFun('Modifica/Rispondi');
                                            
                                        }}
                                       
                                    >{labelModificaRispondiEnte}</Button>
                                </div>
                            }

                            { hiddenRispondiChiudiSend ? null :
                                <div className='col-2 me-2'>
                                    <Button
                                        disabled={disableRispondiAccettaSend_rispondi}
                                        variant='contained'
                                        onClick={()=>{
                                            modifyContestazioneFun('RispondiAccettaSend');
                                            
                                        }}
                                       
                                    >{stato === 7 ? 'Modifica e chiudi Send' : "Rispondi e chiudi Send" }</Button>
                                </div>
                            }
                            {/* butto PAGOPA */}
                            { hiddenRispondi_send ? null :
                                <div className='col-1 me-2'>
                                    <Button
                                        disabled={contestazioneSelected.contestazione.noteSend === null}
                                        variant='contained'
                                        onClick={()=>{
                                            modifyContestazioneFunPagoPa('rispondi');
                                            
                                        }}
                                    >{(stato === 4) ? 'Modifica' : 'Rispondi'}</Button>
                                </div>
                            }
                            {hiddenRispondiAccettaEnte_send ? null :
                                <div className='col-2 me-2'>
                                    <Button
                                        disabled={contestazioneSelected.contestazione.noteSend === null}
                                        variant='contained'
                                        onClick={()=>modifyContestazioneFunPagoPa('rispondi_accetta')}
                                    >{stringButtonAccettaEnte_send}</Button>
                                </div>
                            }
                            {hiddenChiudi_send ? null :
                                <div className='col-2 '>
                                    <Button
                                        disabled={contestazioneSelected.contestazione.noteSend === null}
                                        variant='contained'
                                        onClick={()=>modifyContestazioneFunPagoPa('chiudi')}
                                    >Chiudi Contestazione Ente</Button>
                                </div>
                            }

                            {hiddenConsRec ? null :
                                <div className='col-2 me-2'>
                                    <Button
                                        disabled={true}
                                        variant='contained'
                                        onClick={()=>console.log('esci')}
                                    >Ripondi e chiudi Cosolidatore</Button>
                                </div>
                            }

                            { hiddenConsRec? null :
                                <div className='col-2 me-2'>
                                    <Button
                                        disabled={true}
                                        variant='contained'
                                        onClick={()=>console.log('esci')}
                                    >Ripondi e Chiudi Recapitista</Button>
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