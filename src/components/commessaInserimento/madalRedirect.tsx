import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { ModalProps } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { PathPf } from '../../types/enum';
import { useContext } from 'react';
import { GlobalContext } from '../../store/context/globalContext';

const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius:'20px'
};

const ModalRedirect : React.FC<ModalProps> =({setOpen, open, sentence}) => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const profilo =  mainState.profilo;

  
    const navigate = useNavigate();

    const handleClose = (event:object, reason: string) =>{
        if(reason !== 'backdropClick'){
            setOpen(false);
        }
    };

    const handleGoToDatiFatturazione = () =>{
        if(profilo.auth === 'PAGOPA'){
            navigate(PathPf.DATI_FATTURAZIONE);
        }else{
            navigate(PathPf.DATI_FATTURAZIONE_EN);
        }
          
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
                    <div className='d-flex justify-content-center'>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                    Attenzione!
                        </Typography>
                    </div>
                    <div className='mt-2'>
                        <Typography id="modal-modal-title" variant="subtitle1" >
                            {sentence}
                            <div className='paddingLeft32'>
                                <ul className="list-group mt-2">
                                    {mainState.datiFatturazioneNotCompleted ? 
                                        <>
                                            <li><Typography id="modal-modal-title" variant="subtitle2" >Id Documento</Typography></li>
                                        </> :
                                        <>
                                            <li><Typography id="modal-modal-title" variant="subtitle2" >Selezionare una delle voci "Dati ordine di acquisto" o "Dati contratto"</Typography></li>
                                            <li><Typography id="modal-modal-title" variant="subtitle2" >Split Payment</Typography></li>
                                            <li><Typography id="modal-modal-title" variant="subtitle2" >Indirizzo mail PEC</Typography></li>
                                            <li><Typography id="modal-modal-title" variant="subtitle2" >Codice SDI</Typography></li>
                                            <li><Typography id="modal-modal-title" variant="subtitle2" >Indirizzo mail di riferimento</Typography></li>
                                            <li><Typography id="modal-modal-title" variant="subtitle2" >Accettazione del disclaimer sul codice degli appalti</Typography></li>    
                                        </>
                                    }
                                    
                                </ul>
                            </div>
                        </Typography>
                    </div>
                    <div className='container_buttons_modal d-flex justify-content-center mt-5'>
                        <Button
                            variant='contained'
                            onClick={()=>handleGoToDatiFatturazione()}
                        >Vai ai dati di fatturazione</Button>
                    </div>
                </Box>
                
            </Modal>
        </div>
    );
};
export default  ModalRedirect;
