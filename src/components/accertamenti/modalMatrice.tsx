import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useRef } from 'react';
import { MatriceArray } from '../../page/accertamenti';

const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const ModalMatriceAccertamenti = ({setOpen, open, data, value, setValue,downloadDocMatrice}) => {
 

    const dataFine = useRef('');

   
    const handleClose = () =>{
        setOpen(false);
        setValue('');
        dataFine.current = '';
    }; 

    const onButtonScarica = () => {

        const objSelected : MatriceArray = data.find(el => el.dataInizioValidita === value);

        downloadDocMatrice(objSelected.dataInizioValidita,objSelected.dataFineValidita);
        handleClose();
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
                        <div className='ms-3 mt-auto mb-auto'>
                          
                            <Typography  id="modal-modal-title" variant="h6" component="h2">
                                Scarica la matrice recapitisti 
                            </Typography>
                          
                        </div>
                        <div>
                            <Button variant="contained"  onClick={()=> handleClose() }> X </Button>
                        </div>
                    </div>
                    <div className=''>
                        <div className='mt-5'>
                            <div className="d-flex justify-content-center">
                                <FormControl color="primary" focused  sx={{width:'70%'}}>
                                    <InputLabel id="demo-simple-select-label">Data inizio</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="select_matrice"
                                        value={value}
                                        label="Data inizio"
                                        onChange={(e)=>{ 
                                            setValue(e.target.value);
                                            const objSelected = data.find(el => el.dataInizioValidita === e.target.value);
                                            dataFine.current = new Date(objSelected.dataFineValidita).toLocaleString().split(",")[0];
                                        }}
                                    >
                                        {data.map((el)=>{
                                            return  <MenuItem key={el.dataInizioValidita} value={el.dataInizioValidita}>{new Date(el.dataInizioValidita).toLocaleString().split(",")[0]}</MenuItem>;
                                        })}
                                    </Select>
                                </FormControl>
                            </div>
                            <div className='d-flex justify-content-center mt-5'>
                                {dataFine.current !== '' && <TextField sx={{width:'70%'}} label="Data fine" color="error" focused value={dataFine.current} />}
                            </div>
                        </div>
                       
                    </div>
                   
                    <div className='container_buttons_modal d-flex justify-content-center mt-5'>
                        <Button 
                            sx={{marginRight:'20px'}} 
                            disabled={value === ''}
                            variant="contained"
                            onClick={()=>{
                                onButtonScarica();
                            }}
                        >Scarica</Button>
                    </div>
                    
                </Box>
                
            </Modal>
        </div>
    );
};
export default  ModalMatriceAccertamenti;