import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import { Button, TextField } from '@mui/material';

export interface ModalInfoProps <T>{
    setOpen:(v: { open: boolean; sentence: React.ReactNode|string }) => void,
    open:{
      open:boolean,
      sentence:React.ReactNode|string,
      buttonIsVisible?:boolean|null,
      labelButton?:string,
      actionButton?:()=>void,icon?:React.ElementType
    },
    width?:number,
    textAreaValue?:string,
    setTextAreaValue?:(v:string)=>void,
    externalActionButton?:(obj?:T )=>void,
    errorTextInput?:boolean
    
}

const ModalInfo = <T,>({setOpen, open,width,textAreaValue,setTextAreaValue,externalActionButton,errorTextInput}: ModalInfoProps<T>) => {
   
  const handleClose = () =>{
    setOpen({open:false, sentence:''});
    setTimeout(() => window.scrollTo(0, 0), 50);

  }; 
 
  return (
    <Modal
      open={open.open}
      onClose={handleClose}
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
      
        <div className="d-flex align-items-end justify-content-end w-100">
          <CloseIcon onClick={handleClose} sx={{color:'#17324D'}}/>
        </div>
        <div className='d-flex justify-content-center text-center align-items-center w-100'>
          {open.icon  && <div  style={{ marginRight: 8 }}>{<open.icon/>}</div>}
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Attenzione!
          </Typography>    
        </div>
        {setTextAreaValue ? <> {open.sentence} </> :
          <div className='d-flex justify-content-center text-center align-items-center w-100'>
            <Typography id="modal-modal-description" variant="body1" sx={{ mt: 2 }}>
              {open.sentence}
            </Typography>
          </div>}
        <div className='d-flex justify-content-center text-center align-items-center w-100'>
          {setTextAreaValue && (
            <TextField
              label="Inserisci una nota (obbligatoria)"
              multiline
              minRows={2}
              fullWidth
              value={textAreaValue}
              onChange={(e) => setTextAreaValue && setTextAreaValue(e.target.value)}
              error={errorTextInput}
              placeholder={"Non inserire dati sensibili né informazioni riconducibili a persone o fatti specifici."}
              helperText={(textAreaValue?.length||0) > 500 ?
                "Inserisci una nota (max 500 caratteri)":
                "Inserisci una nota ( min 10 caratteri)"}
            />
        
          )}
        </div>
        {open?.buttonIsVisible &&
            <div className='d-flex justify-content-evenly text-center mt-5'>
              <Button variant="outlined" onClick={handleClose}>Annulla</Button>
              <Button disabled={setTextAreaValue && ((textAreaValue?.length||0) < 10)} variant="contained" 
                onClick={() =>{
                  window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "auto"
                  });
                  handleClose();
                  if(open?.actionButton) open?.actionButton();
                  if(externalActionButton && setTextAreaValue ){
                    externalActionButton(); 
                    setTextAreaValue("");
                  } 
                }}>
                      Prosegui
              </Button>    
            </div>
        }    
      </Box>  
    </Modal>
  );
};
export default  ModalInfo;