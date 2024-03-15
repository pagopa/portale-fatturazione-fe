import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { ModalProps } from 'react-bootstrap';
import Loader from '../loader';
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
const ModalLoading : React.FC<ModalProps> = ({setOpen, open}) => {
    const handleClose = (event:object, reason: string) =>{
        if(reason !== 'backdropClick'){
            setOpen(false);
        }
    };
    return (
        <div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={open}
                onClose={handleClose}
            >
                <Box sx={style}>
                    <div className='d-flex justify-content-center'>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
             Gentile utente  
                        </Typography>
                    </div>
                    <div className='d-flex justify-content-center mt-3'>
                        <Typography id="modal-modal-title" variant="body1" gutterBottom>
            Attenda la fine del processo  
                        </Typography>
                    </div>
                    <div className='d-flex justify-content-center mt-3'>
                        <div   id='loader_download_contestazione'>
                            <Loader sentence={'Downloading...'}></Loader> 
                        </div> 
                    </div>
                </Box>
            </Modal>
        </div>
    );
};
export default ModalLoading;