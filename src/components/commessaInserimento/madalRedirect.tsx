import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { ModalProps } from 'react-bootstrap';
import { useNavigate } from 'react-router';

const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const ModalRedirect : React.FC<ModalProps> =({setOpen, open, sentence}) => {

    const navigate = useNavigate();


    const handleClose = (event:object, reason: string) =>{
        if(reason !== 'backdropClick'){
            setOpen(false);
        }
    };

    const handleGoToDatiFatturazione = () =>{
        navigate('/');
        
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
                    Gentile utente
                        </Typography>
                    </div>
                    <div className='mt-2'>
                        <Typography id="modal-modal-title" variant="subtitle1" >
                            {sentence}
                            <div className='paddingLeft32'>
                                <ul className="list-group mt-2">
                                    <li><Typography id="modal-modal-title" variant="subtitle2" >Split Payment</Typography></li>
                                    <li><Typography id="modal-modal-title" variant="subtitle2" >Indirizzo mail PEC</Typography></li>
                                    <li><Typography id="modal-modal-title" variant="subtitle2" >Indirizzo mail di riferimento</Typography></li>
                                </ul>
                            </div>
                            
                        </Typography>
                    </div>
                   
                    <div className='container_buttons_modal d-flex justify-content-center mt-5'>
                        <Button
                            variant='contained'
                            onClick={()=>handleGoToDatiFatturazione()}
                        >Inserisci i Dati di fatturazione</Button>
                    </div>
                    
                </Box>
                
            </Modal>
        </div>
    );
};
export default  ModalRedirect;