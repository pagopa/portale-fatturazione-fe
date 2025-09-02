import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Dispatch, SetStateAction } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@mui/material';
import { ReactNode } from "react";




export interface ModalInfoProps {
    setOpen:Dispatch<SetStateAction<{open:boolean,sentence:string,buttonIsVisible?:boolean|null,labelButton?:string,actionButton?:()=>void,icon?:ReactNode|null}>>,
    open:{open:boolean,sentence:string,buttonIsVisible?:boolean|null,labelButton?:string,actionButton?:()=>void,icon?:ReactNode|null},
    width?:number,
    
}

const ModalInfo : React.FC<ModalInfoProps> = ({setOpen, open,width}) => {
   
    const handleClose = () => setOpen({open:false, sentence:''});
    console.log({open});
    return (
        <Modal
            open={open.open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={ {
                position: 'absolute' as const,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: width ? width : 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius:'20px'
            }}>
                <div className="d-flex align-items-center justify-content-end">
                    <div className='icon_close'>
                        <CloseIcon onClick={handleClose} id='close_icon' sx={{color:'#17324D'}}></CloseIcon>
                    </div>
                </div>
                <div className='d-flex justify-content-center'>
                    {open.icon  && <div  style={{ marginRight: 8 }}>{open.icon}</div>}
                    <Typography id="modal-modal-title" variant="h6" component="h2">
        Attenzione!
                    </Typography>    
                </div>
                <div className='d-flex justify-content-center text-center'>
                    <Typography id="modal-modal-description" variant="body1" sx={{ mt: 2 }}>
                        {open.sentence}
                    </Typography>
                </div> 
                {open?.buttonIsVisible &&
                    <div className='d-flex justify-content-evenly text-center mt-5'>
                        <Button variant="outlined" onClick={handleClose}>Annulla</Button>
                        <Button variant="contained" onClick={() =>{
                            handleClose();
                            open?.actionButton && open?.actionButton();}}>Prosegui</Button>
                       
                    </div>
                }
               
            </Box>
        </Modal>
    );
};
export default  ModalInfo;