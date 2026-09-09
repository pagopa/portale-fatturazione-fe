import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import { Button, CircularProgress } from '@mui/material';
import te from 'date-fns/esm/locale/te/index.js';
export interface ModalInfoProps <T>{
    setOpen:(v: { open: boolean; sentence: React.ReactNode|string }) => void,
    open:{
    open:boolean,
    sentence:React.ReactNode|string,
    buttonIsVisible?:boolean|null,
    loaderIsVisible?:boolean,
    sentenceLoader?:string,
    labelButton?:string,
      actionButton?:()=>void,icon?:React.ElementType
    },
    width?:number,
    textAreaValue?:string,
    setTextAreaValue?:(v:string)=>void,
    externalActionButton?:(obj?:T )=>void,
    errorTextInput?:boolean,
    TextField:React.ComponentType<{
        value: string;
        onChange?: (v: string) => void;
        error?: boolean;
    }>,
    verifiedText?:boolean
}

const ModalInfo = <T,>({setOpen, open,width,textAreaValue,setTextAreaValue,externalActionButton,errorTextInput,TextField,verifiedText}: ModalInfoProps<T>) => {
   
  const handleClose = () =>{
    setOpen({open:false, sentence:''});
    setTimeout(() => window.scrollTo(0, 0), 50);
    if(setTextAreaValue) setTextAreaValue("");

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
        <div className="d-flex align-items-center justify-content-end">
          <div className='icon_close'>
            <CloseIcon onClick={handleClose} sx={{color:'#17324D'}}/>
          </div>
      
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
          {(TextField && textAreaValue !== undefined) && (
            <TextField
              value={textAreaValue}
              onChange={setTextAreaValue}
              error={errorTextInput}
            />
          )}
        </div>
        {(open?.buttonIsVisible) &&
          <div className='d-flex justify-content-evenly  gap-3 text-center mt-5'>
            <Button 
              disabled={open.loaderIsVisible} 
              variant="outlined" 
              onClick={handleClose}
              sx={{ width: 120, flexShrink: 0 }}
            > 
            Annulla
            </Button>
            <Button 
              startIcon={open?.loaderIsVisible ? <CircularProgress size={16} color="inherit" /> : null}
              disabled={(setTextAreaValue && (((textAreaValue?.length || 0) < 10) || errorTextInput)) || open.loaderIsVisible}
              variant="contained" 
              sx={{
                width: open.sentenceLoader ? 250 : 120,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'inline-flex'
              }}
              onClick={() => {
                window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                if (open?.actionButton) open?.actionButton();
                if (externalActionButton && setTextAreaValue) {
                  externalActionButton();
                  if(verifiedText){
                    handleClose();
                  }
                  
                  //setTextAreaValue("");
                } else {
                  handleClose();
                }
              }}
            >
              {open.sentenceLoader ? open.sentenceLoader : "Prosegui"}
            </Button>    
          </div>
        }  
      </Box>  
    </Modal>
  );
};
export default  ModalInfo;