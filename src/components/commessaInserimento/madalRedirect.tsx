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

const ModalRedirect : React.FC<ModalProps> =({setOpen, open}) => {

    const navigate = useNavigate();
   

    const handleClose = () => setOpen(false);

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
                    Gentile cliente
                        </Typography>
                    </div>
                    <div className='mt-3'>
                        <Typography id="modal-modal-title" variant="body1" component="h2">
                    Per poter inserire il modulo commessa è nesessario l'inserimento dei dati di fatturazione.
                        </Typography>
                    </div>
                    
                   
                   
                    <div className='container_buttons_modal d-flex justify-content-center mt-5'>
                        <Button
                            variant='contained'
                            onClick={()=>handleGoToDatiFatturazione()}
                        >Insrisci i Dati di fatturazione</Button>
                    </div>
                    
                </Box>
                
            </Modal>
        </div>
    );
};
export default  ModalRedirect;