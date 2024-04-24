import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { ModalProps } from 'react-bootstrap';

const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const ModalUploadPdf : React.FC<ModalProps> =({setOpen, open}) => {

    const handleClose = () =>{
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
                    <div className='text-center'>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                 Gentile utente
                        </Typography>
                    </div>
                    <div className='text-center'>
                        <Typography id="modal-modal-description" sx={{ mt: 3 }}>
                        L'inserimento del documento è stato completato
                        </Typography>
                    </div>
                    <div className='container_buttons_modal d-flex justify-content-center'>
                        <Button
                            variant='contained'
                            onClick={()=>handleClose()}
                        >Ok</Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};
export default  ModalUploadPdf ;