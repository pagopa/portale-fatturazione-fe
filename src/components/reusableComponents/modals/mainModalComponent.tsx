import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Button, TextField } from '@mui/material';

interface MainModalComponentProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
  width?: string | number;
  closeOnBackdropClick?: boolean;
  disableClose?: boolean; // se true, impedisce completamente la chiusura (es. durante un loading)
  TextFieldComponent?: React.ComponentType<any> //TODO da sistemare typescript
}

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '20px',
};

const MainModalComponent: React.FC<MainModalComponentProps> = ({
  open,
  setOpen,
  children,
  width = "400px",
  closeOnBackdropClick = false,
  disableClose = false,
  TextFieldComponent
}) => {
  const handleClose = (event: object, reason: string) => {
    if (disableClose) return;
    if (reason === 'backdropClick' && !closeOnBackdropClick) return;
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
    >
      <Box sx={{ ...style, width }}>
        {children}
        {/*TODO portare entrame le text fild come unica prop */}
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label={"N. Document di Storno"}
            fullWidth={true}
            value={""}
            placeholder={"Inserisci il numero del documento di storno"}
          //helperText={"N. Document di Storno"}
          />
          {TextFieldComponent && <TextFieldComponent/>}
        </Box>
        <div className='container_buttons_modal d-flex justify-content-center mt-5'>
          <Button  variant='contained' onClick={()=> "ciao"} >Prosegui</Button>
        </div>
      </Box>
    </Modal>
  );
};

export default MainModalComponent;