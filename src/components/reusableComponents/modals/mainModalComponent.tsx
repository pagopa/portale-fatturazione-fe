import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

interface MainModalComponentProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
  width?: string | number;
  closeOnBackdropClick?: boolean;
  disableClose?: boolean; // se true, impedisce completamente la chiusura (es. durante un loading)
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
}) => {
  const handleClose = (event: object, reason: string) => {
    if (disableClose) return;
    if (reason === 'backdropClick' && !closeOnBackdropClick) return;
    setOpen(false);
  };

  return (
    <Modal
      aria-labelledby="main-modal-title"
      aria-describedby="main-modal-description"
      open={open}
      onClose={handleClose}
    >
      <Box sx={{ ...style, width }}>
        {children}
      </Box>
    </Modal>
  );
};

export default MainModalComponent;