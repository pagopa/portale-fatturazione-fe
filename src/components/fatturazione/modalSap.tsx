import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { ModalSapProps, TipologiaSap } from '../../types/typeFatturazione';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const ModalSap : React.FC<ModalSapProps> = ({open,setOpen,responseTipologiaSap}) => {

    const [value, setValue] = React.useState('');
    const [numeroFatture,setNumeroFatture] = React.useState(0);
    console.log(responseTipologiaSap);
   
    const handleClose = () => {
        setOpen(false);
        setValue('');
        setNumeroFatture(0);
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
                       
                        <div className='d-flex align-items-center'>
                            <Typography id="modal-modal-title" variant="h6" >
                             Seleziona le fatture da inviare
    
                            </Typography>
                        </div>
                            
                       
                        <div>
                            <Button variant="contained"  onClick={()=> handleClose() }> X </Button>
                        </div>
                    </div>
                    <div className='d-flex  mt-5'>
                        <Box sx={{width:'50%'}}  >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel
                                    id="tipologiaFatturaSap"
                                >
                                Tipologia Fattura  
                                </InputLabel>
                                <Select
                                    id="tipologiaFatturaSap"
                                    label='Tipologia Fattura'
                                    labelId="search-by-label"
                                    onChange={(e) =>{
                                        setValue(e.target.value);
                                        console.log(e);
                                        const numFat = responseTipologiaSap.filter((el)=> el.tipologiaFattura === e.target.value);
                                        setNumeroFatture(numFat[0].numeroFatture);
                                        // setBody((prev)=>({...prev,...{tipologiaFattura:e.target.value}}));
                                    }}     
                                    value={value}       
                                >
                                    {responseTipologiaSap.map((el) => (            
                                        <MenuItem
                                            key={Math.random()}
                                            value={el.tipologiaFattura}
                                        >
                                            {el.tipologiaFattura}
                                        </MenuItem>              
                                    ))}
                                    
                                </Select>
                            </FormControl>
                        </Box>
                        <div className='d-flex align-items-center ms-5'>
                            <Typography variant="overline" >
                                {`Numero fatture: ${numeroFatture}`}
    
                            </Typography>
                        </div>
                       
                    </div>
                   
                    <div className='container_buttons_modal d-flex justify-content-center mt-5'>
                        <Button  
                            variant='contained'
                            onClick={()=>console.log('invia')}
                        >INVIA</Button>
                    </div>
                    
                </Box>
                
            </Modal>
        </div>
    );
};
export default  ModalSap;