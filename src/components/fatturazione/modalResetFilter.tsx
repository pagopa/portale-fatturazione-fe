import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { ModalResetFilterProps } from '../../types/typeFatturazione';
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
};

const ModalResetFilter : React.FC<ModalResetFilterProps> =({setOpen, open, filterInfo,getListaFatture,filterNotExecuted}) => {
    

    const handleClose = (event:object, reason: string) =>{
        if(reason !== 'backdropClick'){
            setOpen(false);
        }
    };
   
    const handleFiltra = () => {
        setOpen(false);
        getListaFatture(filterNotExecuted);
       
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
                        <Typography id="modal-modal-title" variant="h6">
        Attenzione!
                        </Typography>
                        <div className='mt-3'>
                            <Typography id="modal-modal-description" variant="body1">
                                {`Il mese selezionato nei filtri "${month[filterNotExecuted.mese -1].toLocaleUpperCase()}" non è in linea con il mese "${month[filterInfo.mese -1].toLocaleUpperCase()}" delle fatture visualizzate`}
                            </Typography>
                        </div>
                        
                    </div>
                   
                    <div className='container_buttons_modal d-flex justify-content-center'>
                        <Button 
                            sx={{marginRight:'20px'}} 
                            variant='contained'
                            onClick={()=>handleFiltra()}
                        >Filtra</Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};
export default  ModalResetFilter;