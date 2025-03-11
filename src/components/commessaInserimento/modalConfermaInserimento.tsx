import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { ModalConfermaInsProps } from '../../types/typeModuloCommessaInserimento';
import { month } from '../../reusableFunction/reusableArrayObj';
const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius:'20px'
};

const ModalConfermaInserimento : React.FC<ModalConfermaInsProps> =({setOpen, open, onButtonComfermaPopUp, mainState,sentence}) => {
    


    const handleClose = (event:object, reason: string) =>{
        if(reason !== 'backdropClick'){
            setOpen(false);
        }
    };
   
    const handleConferma = () => {
        setOpen(false);
        onButtonComfermaPopUp();
    };

    const handleAnnulla = () =>{
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
        Attenzione!
                        </Typography>
                        <Typography id="modal-modal-description" variant="body1" sx={{ mt: 2 }}>
                            {sentence}
                        </Typography>
                    </div>
                   
                    <div className='container_buttons_modal d-flex justify-content-center'>
                        <Button 
                            sx={{marginRight:'20px'}} 
                            variant='contained'
                            onClick={()=>handleConferma()}
                        >Conferma</Button>
                        <Button
                            variant='outlined'
                            onClick={()=>handleAnnulla()}
                        >Annulla</Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};
export default  ModalConfermaInserimento;