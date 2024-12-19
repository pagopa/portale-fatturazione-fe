import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useRef } from 'react';
import { MatriceArray } from '../../page/accertamenti';
import CloseIcon from '@mui/icons-material/Close';
const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius:'20px'
};

const ModalMatriceKpi = ({setOpen, open,anni,quarters}) => {
 
    // data, value, setValue,downloadDocMatric
    const [annoSelected, setAnnoSelected] = React.useState('');
    const [quarterSelected, setQuarterSelected] = React.useState('');

    console.log(quarters);
    const handleClose = () =>{
        setOpen(false);
        setAnnoSelected('');
        setQuarterSelected('');
    }; 

    const onButtonScarica = () => {
        /*
        const objSelected : MatriceArray = data.find(el => el.dataInizioValidita === value);

        downloadDocMatrice(objSelected.dataInizioValidita,objSelected.dataFineValidita);
        handleClose();*/
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
                        <div className='m-auto'>
                            <Typography  id="modal-modal-title" variant="h6" component="h2">
                              Scarica la matrice KPI 
                            </Typography>
                        </div>

                        <div className="d-flex align-items-center justify-content-end">
                            <div className='icon_close'>
                                <CloseIcon onClick={()=> handleClose() } id='close_icon' sx={{color:'#17324D'}}></CloseIcon>
                            </div>
                        </div>
                    </div>
                    <div className='mt-5'>
                        <div className="d-flex justify-content-center">
                            <FormControl color="primary" focused  sx={{width:'70%'}}>
                                <InputLabel id="demo-simple-select-label">Anno</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="select_matrice"
                                    value={annoSelected||''}
                                    label="Anno"
                                    onChange={(e)=>{ 
                                        
                                        setAnnoSelected(e.target.value);
                                        /*
                                            const objSelected = data.find(el => el.dataInizioValidita === e.target.value);
                                            dataFine.current = new Date(objSelected.dataFineValidita).toLocaleString().split(",")[0];
                                            */
                                    }}
                                >
                                    {anni.map((el)=>{
                                        return <MenuItem key={el} value={el}>{el}</MenuItem>;
                                    })}
                                </Select>
                            </FormControl>
                        </div>
                        <div className='d-flex justify-content-center mt-5'>
                            {/*dataFine.current !== '' && <TextField sx={{width:'70%'}} label="Quarter" color="error" focused value={dataFine.current} />*/}
                            <FormControl color="primary" focused  sx={{width:'70%'}}>
                                <InputLabel id="demo-simple-select-label">Quarter</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="select_matrice"
                                    value={quarterSelected||''}
                                    label="Quarter"
                                    onChange={(e)=>{ 
                                        
                                        setQuarterSelected(e.target.value);
                                        /*
                                            const objSelected = data.find(el => el.dataInizioValidita === e.target.value);
                                            dataFine.current = new Date(objSelected.dataFineValidita).toLocaleString().split(",")[0];
                                            */
                                    }}
                                >
                                    {quarters.map((el,i)=>{
                                        return <MenuItem key={i} value={el.value}>{el.quarter}</MenuItem>;
                                    })}
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                    <div className='container_buttons_modal d-flex justify-content-center mt-5'>
                        <Button 
                            sx={{marginRight:'20px'}} 
                            disabled={false}//disabled={value === ''}
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
export default  ModalMatriceKpi;