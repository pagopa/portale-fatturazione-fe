import * as React from 'react';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { ModalContestazioneProps, TipoContestazione, ModalBodyContestazione, Contestazione } from '../../types/typeReportDettaglio';
import {
    TextField,
    Box, FormControl, InputLabel,Select, MenuItem, Button
} from '@mui/material';
import { manageError } from '../../api/api'; 
import { useNavigate } from 'react-router';
import {useState, useEffect} from 'react';
import YupString from '../../validations/string/index';
import { createContestazione, modifyContestazioneConsolidatore, modifyContestazioneEnte,modifyContestazioneRecapitista, tipologiaTipoContestazione } from '../../api/apiSelfcare/notificheSE/api';
import { modifyContestazioneEntePagoPa } from '../../api/apiPagoPa/notificheSE/api';

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

const ModalContestazione : React.FC <ModalContestazioneProps> = ({setOpen, open, mainState, contestazioneSelected, setContestazioneSelected, funGetNotifiche, funGetNotifichePagoPa, openModalLoading, page, rows}) => {
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
        setOpen(false);
        openModalLoading(true);
        const body = {
            idNotifica:contestazioneSelected.contestazione.idNotifica,
            tipoContestazione:contestazioneSelected.contestazione.tipoContestazione,
            noteEnte:contestazioneSelected.contestazione.noteEnte
        };
        
        await createContestazione(token, mainState.nonce,body)
            .then(()=>{
                funGetNotifiche(page,rows);
            })
            .catch(((err)=>{
                manageError(err,navigate);
            }));
    };

    const modifyContestazioneFun = async (action:string) => {
        setOpen(false);
        openModalLoading(true);
        let body;
        if(action === 'Annulla'){
            body ={
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                statoContestazione:2
            };
        }else if(action === 'Modifica/Rispondi' && (stato === 4 || stato === 5 || stato === 6 || stato === 7)){
            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                noteEnte:contestazioneSelected.contestazione.noteEnte,
                rispostaEnte: rispostaEnte,
                statoContestazione:7
            };
        }else if(action === 'RispondiAccettaSend' && (stato === 4 || stato === 7)){
            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                noteEnte:contestazioneSelected.contestazione.noteEnte,
                rispostaEnte: rispostaEnte,
                onere:'SEND',
                statoContestazione:9
            };
        }else if(action === 'Rispondi_Recapitista'){
            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                risposta:contestazioneSelected.contestazione.noteRecapitista,
                statoContestazione:5
            };

        }else if(action === 'Rispondi_Consolidatore'){
            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                risposta:contestazioneSelected.contestazione.noteConsolidatore,
                statoContestazione:6
            };
        }else if(action === 'accettaConsolidatore_ENTE'){
            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                noteEnte:contestazioneSelected.contestazione.noteEnte,
                rispostaEnte: rispostaEnte,
                onere:'CON',
                statoContestazione:9
            };
        }else if(action === 'accettaRecapitista_ENTE'){
            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                noteEnte:contestazioneSelected.contestazione.noteEnte,
                rispostaEnte: rispostaEnte,
                onere:'REC',
                statoContestazione:9
            };
        }else if(action === 'rispondi_accetta_ENTE' && profilo.profilo === 'REC'){
            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                risposta:contestazioneSelected.contestazione.noteRecapitista,
                statoContestazione:8,
            };
        }else if(action === 'rispondi_accetta_ENTE' && profilo.profilo === 'CON'){
            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                risposta:contestazioneSelected.contestazione.noteConsolidatore,
                statoContestazione:8,
            };
        }else{
            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                noteEnte:contestazioneSelected.contestazione.noteEnte,
                rispostaEnte: rispostaEnte,
                statoContestazione:contestazioneSelected.contestazione.statoContestazione
            };

        }
        
        if(profilo.profilo === 'PA'){
            await modifyContestazioneEnte(token, profilo.nonce, body).then(()=>{
               
                funGetNotifiche(page,rows);
            }).catch(((err)=>{
                manageError(err,navigate);
            }));
        }else if(profilo.profilo === 'REC'){
            await modifyContestazioneRecapitista(token, profilo.nonce, body).then(()=>{
                funGetNotifiche(page,rows);
                
            }).catch(((err)=>{
                manageError(err,navigate);
            }));
        }else if(profilo.profilo === 'CON'){
            await modifyContestazioneConsolidatore(token, profilo.nonce, body).then(()=>{
                funGetNotifiche(page,rows);
                
            }).catch(((err)=>{
                manageError(err,navigate);
            }));
        }
  
    };

    const modifyContestazioneFunPagoPa = async(action:string) => {
        setOpen(false);
        openModalLoading(true);
        let body = {};
        if(action === 'rispondi'){

            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                onere:'PA',
                noteSend: rispostaSend,
                statoContestazione:4
            };
        }
        if(action === 'rispondi_accetta_ENTE'){
            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                onere:'PA',
                noteSend: rispostaSend,
                statoContestazione:8
            };
        }
        if(action === 'chiudi'){
            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                onere:'SEND',
                noteSend: rispostaSend,
                statoContestazione:9
            };
        }
        if(action === 'accettaConsolidatore_SEND'){
            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                onere:'CON',
                noteSend: rispostaSend,
                statoContestazione:9
            };
        }
        if(action === 'accettaRecapitista_SEND'){
            body = {
                idNotifica:contestazioneSelected.contestazione.idNotifica,
                onere:'REC',
                noteSend: rispostaSend,
                statoContestazione:9
            };
        }
        
        await modifyContestazioneEntePagoPa(token, mainState.nonce, body).then((res)=>{
            
            funGetNotifichePagoPa(page,rows);
            
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
    const stato = contestazioneSelected.contestazione.statoContestazione;
    const rispostaEnte = contestazioneSelected?.contestazione?.rispostaEnte;
    const rispostaSend = contestazioneSelected?.contestazione?.noteSend;
    const noteRecapitista = contestazioneSelected.contestazione.noteRecapitista;
    const noteConsolidatore = contestazioneSelected.contestazione.noteConsolidatore;

    const noActionEnte = !contestazioneSelected.modifica && !contestazioneSelected.chiusura && !contestazioneSelected.risposta;

    // ente/selfacre puo rispondere?
    const noRisposta = contestazioneSelected.risposta;
    // ente/selfacre puo accettare rifiutare una contestazione?
    const noChiusura = contestazioneSelected.chiusura;
    // ente puo modificare la nota ente?
    const noModifica = contestazioneSelected.modifica;

    const readOnlyNotaContestazione = (
        stato !== 1 && stato !== 3) ||
          contestazioneSelected.modifica === false;

    const rispostaEnteIsHidden =  stato === 1 ||
     (stato === 2 && rispostaEnte === null ) || 
     stato === 3 ||
     (noRisposta === false  && (rispostaEnte === null || rispostaEnte === '')) ||
     (stato === 4  && profilo.auth === 'PAGOPA')||
     (stato === 8 && rispostaEnte === null ) || 
     (stato === 9 && rispostaEnte === null ); 

    const readOnlyRispostaEnte =  (stato === 2 && rispostaEnte !== null) ||
       stato === 8 ||
       stato === 9 || 
       stato === 7 ||
       noRisposta === false ||
       profilo.profilo !== 'PA';
    // stato === 7 && (rispostaSend !== '' || rispostaSend !== null || noteRecapitista !== null || noteRecapitista !== '' || notaCosolidatore !== null ||notaCosolidatore !== '' ) ||

    const supportoSentHidden =  stato === 1 ||
    stato === 2 ||
    (stato === 3 && profilo.profilo === 'PA') ||
    (stato === 8 && rispostaSend === null) ||
    (stato === 9  && rispostaSend === null) ||
    (rispostaSend === null && noRisposta === false) ||
    (profilo.profilo === 'REC' && (rispostaSend === null || rispostaSend === '')) || // add 04/04
    (profilo.profilo === 'CON' && (rispostaSend === null || rispostaSend === '')) ;  // add 05/04
    // stato === 3 ||
    //(stato === 5 && rispostaSend === null)||
    //(stato === 6 && rispostaSend === null)||

   

    const supportSendReadOnly = profilo.auth !== 'PAGOPA' ||
     stato === 9||
     stato === 8  ||
     stato === 7  ||
      stato === 2 ||
      noRisposta === false;

    const hiddenRispondi_send =  stato === 1 ||
    stato === 2 ||
    stato === 8 ||
    stato === 9 ||
    profilo.auth !== 'PAGOPA'||
    noRisposta === false ||
    noChiusura === false;
    // profilo.auth === 'PAGOPA' && noRisposta &&
    /*
    const hiddenRispondiAccettaEnte_SEND_REC_CON = stato === 1 ||
    stato === 2 ||
    stato === 6 ||
    stato === 8 ||
    stato === 9 ||
    profilo.auth !== 'PAGOPA';
    */

    const hiddenRispondiAccettaEnte_SEND_REC_CON = profilo.profilo === 'PA' || stato === 2 || stato === 8 || stato === 9 ;
   
    const hiddenConsRec =   stato === 1 ||
    stato === 2 ||
    stato === 3 ||
    // stato === 6 ||
    stato === 8 ||
    stato === 9 ||
    profilo.profilo === 'REC' ||
    profilo.profilo === 'CON'; 

    const showButtonAccettaRecapitista_Send = profilo.auth === 'PAGOPA' && noteRecapitista && noChiusura;
    let labelButtonAccettaRecapitista_Send = 'Accetta risposta Recapitista';
  
    // (stato === 4 && profilo.auth === 'PAGOPA')? 'Modifica e accetta risposta RECAPITISTA' : 'Accetta risposta RECAPITISTA'
    if((stato === 4 && profilo.auth === 'PAGOPA') || (stato === 3  && profilo.profilo === 'PA')){
        labelButtonAccettaRecapitista_Send = 'Modifica e accetta risposta Recapitista';
    } 

    let disableButtonAccettaRecapitista_Send_Ente = false;
    
    if(profilo.auth === 'PAGOPA' && (rispostaSend === null || rispostaSend === '')){
        disableButtonAccettaRecapitista_Send_Ente = true;
    }
    if(profilo.profilo === 'PA' && (rispostaEnte === null || rispostaEnte === '')){
        disableButtonAccettaRecapitista_Send_Ente = true;
    }

    
    // logica button accetta risposa consolidatore_SEND_ENTE
    const showButtonAccettaConsolidatore_Send = profilo.auth === 'PAGOPA'  && noteConsolidatore && noChiusura;
    let labelButtonAccettaConsolidatore_Send = 'Accetta risposta Consolidatore';
  
    
    if((stato === 4 && profilo.auth === 'PAGOPA') || (stato === 3  && profilo.profilo === 'PA')){
        labelButtonAccettaConsolidatore_Send = 'Modifica e accetta risposta Consolidatore';
    } 

    let disableButtonAccettaConsolidatore_Send_Ente = false;
    
    if(profilo.auth === 'PAGOPA' && (rispostaSend === null || rispostaSend === '')){
        disableButtonAccettaConsolidatore_Send_Ente = true;
    }
    if(profilo.profilo === 'PA' && (rispostaEnte === null || rispostaEnte === '')){
        disableButtonAccettaConsolidatore_Send_Ente = true;
    }


    const hiddenButtonAnnullaContestazione = profilo.profilo !== 'PA' ||
     stato !== 3 ||
    contestazioneSelected.modifica === false; 

    const hiddenModificaRispondiEnte = stato === 1  ||
       stato === 2  ||
        stato === 8  || 
        stato === 9 ||
        stato === 7 ||
    profilo.profilo !== 'PA' ||
    // aggiunta 22/02
    (noRisposta === false && noModifica === false);

    
    const hiddenRispondiChiudiSend_Ente =  profilo.profilo === 'PA' && rispostaSend && stato !== 2 && stato !== 8 && stato !== 9; // (stato !== 4 && stato !== 7) || profilo.auth === 'PAGOPA' || profilo.profilo === 'REC' || profilo.profilo === 'CON';

    const hiddenChiudi_send = profilo.auth === 'PAGOPA' && noChiusura;

    let disableCreaContestazioneButton = false;
    if(stato === 1 && (contestazioneSelected.contestazione.tipoContestazione < 1  || contestazioneSelected.contestazione.noteEnte === null || contestazioneSelected.contestazione.noteEnte === '')){
        disableCreaContestazioneButton = true;
    }

    let stringButtonAccettaEnte_send = 'Rispondi e accetta ENTE';
    if(profilo.profilo === 'REC' && stato === 5 ){
        stringButtonAccettaEnte_send = 'Modifica e accetta ENTE';
    }else if(profilo.profilo === 'REC' && stato !== 5 ){
        stringButtonAccettaEnte_send = 'Rispondi e accetta ENTE';
    }else if(profilo.profilo === 'CON' && stato === 6 ){
        stringButtonAccettaEnte_send = 'Modifica e accetta ENTE';
    }else if(profilo.profilo === 'CON' && stato !== 6 ){
        stringButtonAccettaEnte_send = 'Rispondi e accetta ENTE';
    }else if(stato === 4  && profilo.auth === 'PAGOAPA'){
        stringButtonAccettaEnte_send = 'Modifica e accetta ENTE';
    }else if (stato === 7 && profilo.auth === 'PAGOAPA'){
        stringButtonAccettaEnte_send = 'Accetta Contestazione ENTE';
    }
    /*else if(noRisposta === false){     // secondo me questo if va tolto
        stringButtonAccettaEnte_send = 'Accetta Contestazione ENTE';
    }*/

    let disableRispondiAccettaEnte_SEND_REC_CON = false;
    if(profilo.auth === 'PAGOPA' && (rispostaSend === '' || rispostaSend === null)){
        disableRispondiAccettaEnte_SEND_REC_CON = true;
    }else if(profilo.profilo === 'REC' && (noteRecapitista === '' || noteRecapitista === null)){
        disableRispondiAccettaEnte_SEND_REC_CON = true;
    }else if(profilo.profilo === 'CON' && (noteConsolidatore === '' || noteConsolidatore === null)){
        disableRispondiAccettaEnte_SEND_REC_CON = true;
    }

    let labelModificaRispondiEnte = 'Rispondi';
    if(stato === 3 && profilo.profilo === 'PA' ){
        labelModificaRispondiEnte = 'Modifica Nota';
    }else if(stato === 7 && profilo.profilo === 'PA'){
        labelModificaRispondiEnte = 'Modifica Risposta';
    }

    let disableRispondiAccettaSend_rispondi = false;
    if(profilo.profilo === 'PA' && stato === 4 && (rispostaEnte === '' || rispostaEnte === null)){
        disableRispondiAccettaSend_rispondi = true;
    }else if(profilo.profilo === 'PA' && stato === 3 && (contestazioneSelected.contestazione.noteEnte === '' || contestazioneSelected.contestazione.noteEnte === null)){
        disableRispondiAccettaSend_rispondi = true;
    }
    
    let labelChiusdi_send = 'Rifiuta Contestazione';
    if(stato === 3 && noRisposta === true){
        labelChiusdi_send = 'Rispondi e rifiuta contestazione';
    }else if(stato === 4 &&  noRisposta === true){
        labelChiusdi_send = 'Modifica e rifiuta contestazione';
    }

    let labelRispondiAccetta_Ente = "Rispondi e accetta contestazione SEND";
    if(stato === 7 ){
        labelRispondiAccetta_Ente = 'Accetta risposta SEND';
    }else if(noRisposta === false){
        labelRispondiAccetta_Ente = 'Accetta risposta SEND';
    }

    const showTextBox_Recapitista = (profilo.profilo === 'REC' && (stato !== 2 && stato !== 8 && stato !== 9)) || noteRecapitista ;
    const showTextBox_Consolidatore = (profilo.profilo === 'CON' && (stato !== 2 && stato !== 8 && stato !== 9)) || noteConsolidatore;
    /*stato === 1 ||
     (stato === 2 && noteRecapitista === null) || 
     stato === 3 ||
    (stato === 4 && noteRecapitista === null) ||
    (stato === 6 && noteRecapitista === null) ||
    (stato === 7 && noteRecapitista === null) ||
    (stato === 8 && noteRecapitista === null) ||
    (stato === 9 && noteRecapitista === null); */
    // RECAPITISTA
    let showButton_Recapitista = false;
    if(profilo.profilo === 'REC' && noRisposta){
        showButton_Recapitista = true;
    }

    let labelButton_Recapitista = 'Rispondi';
    if(stato === 5){
        labelButton_Recapitista = 'Modifica risposta';
    }
    let disableButton_Recapitista = false;
    if(noteRecapitista === '' || noteRecapitista === null){
        disableButton_Recapitista = true;
    }
   
    // CONSOLIDATORE
    let showButton_Consolidatore = false;
    if(profilo.profilo === 'CON' && noRisposta){
        showButton_Consolidatore = true;
    }
    let labelButton_Consolidatore = 'Rispondi';
    if(stato === 6){
        labelButton_Consolidatore = 'Modifica risposta';
    }
    let disableButton_Consolidatore = false;
    if(noteConsolidatore === '' || noteConsolidatore === null){
        disableButton_Consolidatore = true;
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
                                        id="x"
                                        label='Risposta'
                                        placeholder='Risposta'
                                        //disabled={profilo.profilo !== 'PA' || (contestazioneSelected.contestazione.statoContestazione !== 3 && contestazioneSelected.contestazione.statoContestazione !== 4 && contestazioneSelected.contestazione.statoContestazione !== 5 && contestazioneSelected.contestazione.statoContestazione !== 6 )}
                                        InputProps={{ readOnly:readOnlyRispostaEnte}}
                                        value={rispostaEnte || ''}
                                        fullWidth
                                        multiline
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
                                        id="supporto"
                                        label='Risposta'
                                        placeholder='Risposta'
                                        //disabled={profilo.profilo !== 'SUP' || (contestazioneSelected.contestazione.statoContestazione !== 1 && contestazioneSelected.contestazione.statoContestazione !== 2 && contestazioneSelected.contestazione.statoContestazione !== 7 && contestazioneSelected.contestazione.statoContestazione !== 8 && contestazioneSelected.contestazione.statoContestazione !== 9 )}
                                        value={rispostaSend || ''}
                                        fullWidth
                                        multiline
                                        InputProps={{ readOnly: supportSendReadOnly }}
                                        onChange={(e) =>  setContestazioneSelected((prev:Contestazione)=> {
                                    
                                            const newContestazione = {...prev.contestazione, noteSend:e.target.value};
                                            return {...prev, contestazione:newContestazione};
                                         
                                        })}
            
                                    />
                                </div>

                            </div>
                        }
                        { /*  recapitista textfield */}
                        {showTextBox_Recapitista &&
                            <div className='row mt-5'>
                            
                                <Typography id="modal-modal-title" variant="overline">
                                Recapitista
                                </Typography>
                                <div className='col-4 mt-2'>
                                    <TextField
                                        id="outlined-basic"
                                        label='Risposta'
                                        placeholder='Risposta'
                                        InputProps={{ readOnly: profilo.profilo !== 'REC' || !noRisposta}}
                                        value={noteRecapitista}
                                        fullWidth
                                        multiline
                                        onChange={(e) =>  setContestazioneSelected((prev:Contestazione)=> {
                                    
                                            const newContestazione = {...prev.contestazione, noteRecapitista:e.target.value};
                                            return {...prev, contestazione:newContestazione};
                                         
                                        })}
                                        onBlur={()=> console.log('miao')}
            
                                    />
                                </div>

                            </div>
                        }
                        {/*consolidatore text field */}
                        {showTextBox_Consolidatore &&
                            <div className='row mt-5'>
                            
                                <Typography id="modal-modal-title" variant="overline">
                                Consolidatore
                                </Typography>
                                <div className='col-4 mt-2'>
                                    <TextField
                                        id="outlined-basic"
                                        label='Risposta'
                                        placeholder='Risposta'
                                        InputProps={{ readOnly: profilo.profilo !== 'CON' || !noRisposta}}
                                        value={noteConsolidatore || ''}
                                        fullWidth
                                        multiline
                                        onChange={(e) =>  setContestazioneSelected((prev:Contestazione)=> {
                                            const newContestazione = {...prev.contestazione, noteConsolidatore:e.target.value};
                                            return {...prev, contestazione:newContestazione};
                                        })}
                                        onBlur={()=> console.log('miao')}
                                    />
                                </div>
                            </div>
                        }
                      

                    </div>

                    {/*BODY */}
                    <div className='mt-5'>
                        <div className='row'>
                            {/* butto ENTE */}
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
                            {/* butto ENTE */}
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
                            { !hiddenModificaRispondiEnte &&
                                <div  className='col-2 me-2'>
                                    <Button
                                        sx={{width:'207px'}}
                                        disabled={disableRispondiAccettaSend_rispondi}
                                        variant='contained'
                                        onClick={()=>{
                                            modifyContestazioneFun('Modifica/Rispondi');
                                            
                                        }}
                                       
                                    >{labelModificaRispondiEnte}</Button>
                                </div>
                            }
                            {/* butto ENTE  */}
                            { hiddenRispondiChiudiSend_Ente &&
                                <div className='col-2 me-2'>
                                    <Button
                                       
                                        disabled={disableRispondiAccettaSend_rispondi}
                                        variant='contained'
                                        onClick={()=>{
                                            modifyContestazioneFun('RispondiAccettaSend');
                                            
                                        }}
                                       
                                    >{labelRispondiAccetta_Ente}</Button>
                                </div>
                            }
                            {/* butto PAGOPA */}
                            { hiddenRispondi_send ? null :
                                <div className='col-2 me-2'>
                                    <Button
                                        sx={{width:'207px'}}
                                        disabled={rispostaSend === null  || rispostaSend === ''}
                                        variant='contained'
                                        onClick={()=>{
                                            modifyContestazioneFunPagoPa('rispondi');
                                            
                                        }}
                                    >{(stato === 4) ? 'Modifica Risposta' : 'Rispondi'}</Button>
                                </div>
                            }
                            {/* butto PAGOPA CONSOLIDATORE RECAPITISTA */}
                            {!hiddenRispondiAccettaEnte_SEND_REC_CON &&
                                <div className='col-2 me-2'>
                                    <Button
                                        disabled={disableRispondiAccettaEnte_SEND_REC_CON}
                                        variant='contained'
                                        onClick={()=>{
                                            if(profilo.auth === 'PAGOPA'){
                                                modifyContestazioneFunPagoPa('rispondi_accetta_ENTE');
                                            }else if(profilo.auth === 'SELFCARE'){
                                                modifyContestazioneFun('rispondi_accetta_ENTE');
                                            }
                                        }}
                                    >{stringButtonAccettaEnte_send}</Button>
                                </div>
                            }
                            {/* butto PAGOPA */}
                            {hiddenChiudi_send &&
                                <div className='col-2 me-2 '>
                                    <Button
                                       
                                        disabled={rispostaSend === null || rispostaSend === ''}
                                        variant='contained'
                                        onClick={()=>modifyContestazioneFunPagoPa('chiudi')}
                                    >{labelChiusdi_send}</Button>
                                </div>
                            }
                            {/* butto PAGOPA , ente*/}
                            {showButtonAccettaConsolidatore_Send &&
                                <div className='col-2 me-2'>
                                    <Button
                                        sx={{width:'220px'}}
                                        disabled={disableButtonAccettaConsolidatore_Send_Ente}
                                        variant='contained'
                                        onClick={()=>{
                                            if(profilo.auth === 'PAGOPA'){
                                                modifyContestazioneFunPagoPa('accettaConsolidatore_SEND');
                                            }if(profilo.profilo === 'CON'){
                                                modifyContestazioneFun('accettaConsolidatore_ENTE');
                                            }
                                        }}
                                    >{labelButtonAccettaConsolidatore_Send}</Button>
                                </div>
                            }
                            {/* butto PAGOPA , ente*/}
                            { showButtonAccettaRecapitista_Send &&
                                <div className='col-2 me-2'>
                                    <Button
                                        sx={{width:'220px'}}
                                        disabled={disableButtonAccettaRecapitista_Send_Ente}
                                        variant='contained'
                                        onClick={()=>{
                                            if(profilo.auth === 'PAGOPA'){
                                                modifyContestazioneFunPagoPa('accettaRecapitista_SEND');
                                            }if(profilo.profilo === 'REC'){
                                                modifyContestazioneFun('accettaRecapitista_ENTE');
                                            }
                                        }}
                                    >{labelButtonAccettaRecapitista_Send}</Button>
                                </div>
                            }
                            {/* butto RECAPITISTA*/} 
                            { showButton_Recapitista &&
                                <div className='col-2 me-2'>
                                    <Button
                                        sx={{width:'220px'}}
                                        disabled={disableButton_Recapitista}
                                        variant='contained'
                                        onClick={()=>modifyContestazioneFun('Rispondi_Recapitista')}
                                    >{labelButton_Recapitista}</Button>
                                </div>
                            }
                            {/* butto CONSOLIDATORE*/} 
                            { showButton_Consolidatore &&
                                <div className='col-2 me-2'>
                                    <Button
                                        sx={{width:'220px'}}
                                        disabled={disableButton_Consolidatore}
                                        variant='contained'
                                        onClick={()=>modifyContestazioneFun('Rispondi_Consolidatore')}
                                    >{labelButton_Consolidatore}</Button>
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