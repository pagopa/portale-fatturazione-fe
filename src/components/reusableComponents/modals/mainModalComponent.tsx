import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Button } from '@mui/material';

interface MainModalComponentProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
  width?: string | number;
  closeOnBackdropClick?: boolean;
  disableClose?: boolean; // se true, impedisce completamente la chiusura (es. durante un loading)
  TextField?: React.ComponentType<any> //TODO da sistemare typescript
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
  TextField
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
        {TextField && <TextField/>}
        <div className='container_buttons_modal d-flex justify-content-center mt-5'>
          <Button  variant='contained' onClick={()=> "ciao"} >Prosegui</Button>
        </div>
      </Box>
    </Modal>
  );
};

export default MainModalComponent;