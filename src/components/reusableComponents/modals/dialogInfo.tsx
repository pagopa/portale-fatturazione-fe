import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { Chip, Dialog, DialogContent, DialogTitle, Divider, List, ListItem, ListItemText, Stack } from '@mui/material';
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
      <DilogContentList array={array} sentenseEmptyArray={sentenseEmptyArray} />
    </Dialog>
  );
};
export default  DialogInfo;


const DilogContentList : React.FC<DialogContentProps> = ({ array = [], sentenseEmptyArray }) => { 
  console.log({array});
  return (
    <DialogContent dividers>
      {array.length === 0 ? (
        <Typography color="text.secondary">
          {sentenseEmptyArray }
        </Typography>
      ) : (
        <List  
          disablePadding 
          sx={{ 
            maxHeight: 400, 
            overflowY: 'auto' 
          }}>
          {array.map((nota, index) => {

            let colorChip:string|undefined = undefined;
            console.log({8:nota?.Azione});
            if(nota?.Azione === "RIPRISTINA"){
              colorChip = '#B5E2B4';
            }else if(nota?.Azione === "POSTICIPA"){
              colorChip = '#FFE5A3';
            }else if(nota?.Azione === "ELIMINA"){
              colorChip = '#ef9a9a';
            }else if(nota?.Azione === "CANCELLA"){
              colorChip = '#FFF0F5';
            }
            console.log({colorChip});
            return (
              <Box key={nota.IdNota} sx={{ backgroundColor: "grey.100",marginBottom: 1, borderRadius: 1, padding: 1 }}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={nota.Testo}
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center" component="span">
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {new Date(nota.Data).toLocaleString("it-IT")}
                        </Typography>
                        {nota.Azione &&
                      <>
                        <Typography 
                          component="span"
                          variant="body2"
                          color="text.secondary">
                            - Azione :
                        </Typography>
                        <Chip variant="outlined" size="small" label={nota?.Azione} 
                          sx={{
                            backgroundColor: colorChip,
                            height: 18,
                            fontSize: '0.65rem',
                            '& .MuiChip-label': {
                              padding: '0 6px',
                            }
                          }}   />
                      </>
                        }
                      </Stack>
                    }
                  />
                </ListItem>

                {index < array.length - 1 && <Divider />}
              </Box>
            );})}
        </List>
      )}
    </DialogContent>
  );
};