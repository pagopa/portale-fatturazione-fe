import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { FormControl, InputLabel, MenuItem, Select} from '@mui/material';
import { SetStateAction, useContext } from 'react';
import { GlobalContext } from '../../store/context/globalContext';
import CloseIcon from '@mui/icons-material/Close';

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

interface ModalAggiungiProps {
    open:boolean,
    setOpen?:React.Dispatch<SetStateAction<boolean>>,
}

const ModalAggiungi : React.FC<ModalAggiungiProps> = ({open,setOpen}) => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;


    const [value, setValue] = React.useState('');
  
   
   
    const handleClose = () => {
      
        console.log('close');
    };
    const onButtonOK = () => {
        console.log('invia');
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
                    <div className='d-flex justify-content-between'>
                        <div className='d-flex align-items-center justify-content-start'>
                            <Typography  id="modal-modal-title" variant="h6" component="h2">
                              Inserisci gli enti nella lista
                            </Typography>
                        </div>

                        <div className="d-flex align-items-center justify-content-end">
                            <div className='icon_close'>
                                <CloseIcon onClick={()=> handleClose() } id='close_icon' sx={{color:'#17324D'}}></CloseIcon>
                            </div>
                        </div>
                    </div>
                    <div className='d-flex  mt-5'>
                        <Box sx={{width:'50%'}}  >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel>
                                Tipologia Fattura  
                                </InputLabel>
                                <Select
                                    label='Tipologia Fattura'
                                    labelId="search-by-label"
                                    onChange={(e) =>setValue(e.target.value)}     
                                    value={value}       
                                >
                                    {[].map((el) =>{ 
                                        return (            
                                            <MenuItem
                                                key={Math.random()}
                                                value={''}
                                            >
                                                {''}
                                            </MenuItem>              
                                        );
                                    } )}   
                                </Select>
                            </FormControl>
                        </Box>   
                    </div>
                    <div className='container_buttons_modal d-flex justify-content-center mt-5'>
                        <Button  
                            disabled={value === ''}
                            variant='contained'
                            onClick={onButtonOK}
                        >Aggiungi</Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};
export default  ModalAggiungi;