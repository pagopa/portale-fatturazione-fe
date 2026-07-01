import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogContent, DialogTitle, Divider, List, ListItem, ListItemText } from '@mui/material';
import { Dispatch } from 'react';


export interface DialogInfoProps<T = any>  {
    onClose:Dispatch<React.SetStateAction<boolean>>,
    open:boolean,
    array:T[],
    title:string,
    sentenseEmptyArray:string,
    clearAction?:() => void
}

type DialogContentProps<T = any> = Pick<
  DialogInfoProps<T>,
  "array" | "sentenseEmptyArray"
>;

const DialogInfo : React.FC<DialogInfoProps> = ({ open, onClose, array = [], title, sentenseEmptyArray,clearAction })=> {
   
  const closeDialog = () => {
    onClose(false);
    if (clearAction) {
      clearAction();
    }
  }
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
      <DilogContentList array={array} sentenseEmptyArray={sentenseEmptyArray} />
    </Dialog>
  );
};
export default  DialogInfo;


const DilogContentList : React.FC<DialogContentProps> = ({ array = [], sentenseEmptyArray }) => { 

  return (
    <DialogContent dividers>
        {array.length === 0 ? (
          <Typography color="text.secondary">
            {sentenseEmptyArray }
          </Typography>
        ) : (
          <List disablePadding>
            {array.map((note, index) => (
              <Box key={note.IdNota} sx={{ backgroundColor: "grey.100",marginBottom: 1, borderRadius: 1, padding: 1 }}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={note.Testo}
                    secondary={
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {new Date(note.Data).toLocaleString("it-IT")}
                      </Typography>
                    }
                  />
                </ListItem>

                {index < array.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </DialogContent>
  )
}