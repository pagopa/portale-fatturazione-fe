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
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const ModalInfo : React.FC<ModalProps> = ({setOpen, open, sentence}) => {
   
    const handleClose = () => setOpen(false);

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
        Operazione in corso
                        </Typography>
                        
                    </div>
                    <div className='d-flex justify-content-center text-center'>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            {sentence}
                        </Typography>
                    </div>
                   
                    <div className='container_buttons_modal d-flex justify-content-center mt-3'>
                        <Button 
                            sx={{marginRight:'20px'}} 
                            variant='outlined'
                            onClick={()=>handleClose()}
                        >Esci</Button>
                    </div>
                    
                </Box>
                
            </Modal>
        </div>
    );
};
export default  ModalInfo;