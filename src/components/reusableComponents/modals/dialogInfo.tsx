import * as React from 'react';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogTitle } from '@mui/material';
import { Dispatch } from 'react';
export interface DialogInfoProps<T = any>  {
    onClose:Dispatch<React.SetStateAction<boolean>>,
    open:boolean,
    array:T[],
    title:string,
    clearAction?:() => void,
    ContentComponent:React.ComponentType<{
            array:T
        }>,
}

const DialogInfo : React.FC<DialogInfoProps> = ({ open, onClose, array = [], title,clearAction, ContentComponent })=> {
   
  const closeDialog = () => {
    onClose(false);
    if (clearAction) {
      clearAction();
    }
  };
  return (
    <Dialog 
      PaperProps={{
        sx: {
          borderRadius: "20px", 
        },
      }}
      open={open} 
      onClose={closeDialog}
      maxWidth="sm"
      fullWidth>
      <DialogTitle>
        <div className='d-flex justify-content-between'>
          <div className='d-flex align-items-center justify-content-start'>
            <Typography  id="modal-modal-title" variant="h6" component="h2">
              {title}
            </Typography>
          </div>
          <div className="d-flex align-items-center justify-content-end">
            <div className='icon_close'>
              <CloseIcon onClick={closeDialog} id='close_icon' sx={{color:'#17324D'}}></CloseIcon>
            </div>
          </div>
        </div>
      </DialogTitle>
      <ContentComponent array={array}/>
    </Dialog>
  );
};
export default  DialogInfo;


