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
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const BasicModal : React.FC<ModalProps> =({setOpen, open}) => {

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    const navigate = useNavigate();
   

    const handleClose = () => setOpen(false);

    const handleEsci = () =>{
        if(profilo.auth === 'PAGOPA'){
            navigate('/pagopalistadatifatturazione');
        }else{
            navigate('/');
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
                    <Typography id="modal-modal-title" variant="h6" component="h2">
        Vuoi davvero uscire ?
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Se esci le modifiche andranno perse
                    </Typography>
                    <div className='container_buttons_modal d-flex justify-content-end'>
                        <Button 
                            sx={{marginRight:'20px'}} 
                            variant='outlined'
                            onClick={()=>handleClose()}
                        >Annulla</Button>
                        <Button
                            variant='contained'
                            onClick={()=>handleEsci()}
                        >Esci</Button>
                    </div>
                    
                </Box>
                
            </Modal>
        </div>
    );
};
export default  BasicModal;