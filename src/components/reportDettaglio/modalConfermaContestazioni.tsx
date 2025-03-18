import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Dispatch, SetStateAction } from 'react';
import { month } from '../../reusableFunction/reusableArrayObj';
import CircularWithValueLabel from '../reusableComponents/progress';
import CircularProgressWithLabel from '../reusableComponents/progress';
import { useEffect } from 'react';

interface PropsModalContestazioni{
    open:boolean,
    setOpen:Dispatch<SetStateAction<boolean>>,
    onButtonComferma:() => void,
    info:{
        mese:string,
        anno:string,
        ente:string
    },
    progress:number,
    uploading:boolean
}

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

const ModalInvioContestazioni : React.FC<PropsModalContestazioni> =({setOpen, open, onButtonComferma,info,progress,uploading}) => {
    
    const handleClose = (event:object, reason: string) =>{
        if(reason !== 'backdropClick'){
            setOpen(false);
        }
    };
   
    const handleConferma = () => {
        onButtonComferma();
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
                    {!uploading ?
                        <>
                            <div className='text-center'>
                                <Typography id="modal-modal-title" variant="h6" component="h2">
        Attenzione!
                                </Typography>
                                <div className='d-flex justify-content-center text-center'>
                                    <Typography variant="body1" sx={{ my:'auto',mr:1 }}>
                                        {`Stai inviando le Contestazioni `}
                                    </Typography>
                                    <Typography sx={{ my:'auto',mr:1  }} variant="caption-semibold">{`${info.ente} ${month[Number(info.mese)-1]} ${info.anno} :`}</Typography>
                                    <Typography sx={{  my:'auto'}} variant="body1">Confermi l'operazione?</Typography>
                                </div>
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
                        </> :
                        <>
                            <div className='text-center'>
                                <div className='d-flex justify-content-center'>
                                    <Typography id="modal-modal-title" variant="h6" component="h2">
             Operazione in corso  
                                    </Typography>
                                </div>
                                <div className='d-flex justify-content-center mt-3'>
                                    <Typography id="modal-modal-title" variant="body1" gutterBottom>
            Attendere la fine del processo  
                                    </Typography>
                                </div>
                                <div className='mt-5'>
                                    <CircularProgressWithLabel value={Math.floor(progress)}></CircularProgressWithLabel>
                                </div>
                               
                            </div>
                        </>
                    }
                </Box> 
            </Modal>
        </div>
    );
};
export default  ModalInvioContestazioni;
