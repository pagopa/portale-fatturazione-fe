import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { FormControl, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../store/context/globalContext';
import { getListaJsonFatturePagoPa } from '../../api/apiPagoPa/fatturazionePA/api';
import CloseIcon from '@mui/icons-material/Close';

const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1000,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius:'20px'
};


interface ListaFatture {
    tipologiaFattura: string,
    numeroFatture: number,
    annoRiferimento: number,
    meseRiferimento: number,
    importo: number
}

const ModalJsonSap = ({open,setOpen}) => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const [value, setValue] = React.useState('');

    const [listaFatture, setListaFatture] = useState<ListaFatture[]>([]);
    const [tipologieFatture, setTipologie] = useState<string[]>([]);

    useEffect(()=>{
        if(open){
            getLista();
        }
    },[open]);

    const getLista = async () =>{
        await getListaJsonFatturePagoPa(token,profilo.nonce).then((res)=>{
            const array = res.data.map( el => el.tipologiaFattura);
            const uniqueArray = array.reduce((accumulator, current) => {
                if (!accumulator.includes(current)) {
                    accumulator.push(current);
                }
                return accumulator;
            }, []);
            
            setTipologie(uniqueArray);
            setListaFatture(res.data);
        }).catch((err)=>{
            console.log(err);
        });
    };
    console.log({tipologieFatture});
    const onButtonInvia = async() =>{
        // se l'utente ha selezionato il button invia a sap 
        console.log('ciao');
    };
   
    const handleClose = () => {
        setValue('');
        setOpen(false);
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
                 
                    <div className='d-flex justify-content-between ms-3 mt-auto mb-auto w-100' >
                        <div className='d-flex justify-content-center align-items-center'>
                            <Typography id="modal-modal-title" variant="h6" >
                               Seleziona le fatture da inviare
                            </Typography>
                        </div>
                        <div className='icon_close me-5'>
                            <CloseIcon onClick={handleClose} id='close_icon' sx={{color:'#17324D'}}></CloseIcon>
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
                                    onChange={(e) =>{
                                        setValue(e.target.value);
                                    }}     
                                    value={value}       
                                >
                                    {tipologieFatture.map((el) =>{ 
                                        return (            
                                            <MenuItem
                                                key={Math.random()}
                                                value={el}
                                            >
                                                {el}
                                            </MenuItem>              
                                        );
                                    } )}
                                </Select>
                            </FormControl>
                        </Box>   
                    </div>
                    <div>
                        <Box sx={{ backgroundColor:'#F8F8F8', padding:'10px',marginTop:'40px',width:'80%'}}>
                            <Typography sx={{marginLeft:"6px"}} variant="h6" gutterBottom component="div">
                                    Fatture
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                        <TableCell sx={{ marginLeft:"16px"}} >Tipologia Fattura</TableCell>
                                        <TableCell sx={{ marginLeft:"16px"}}>Numero Fatture</TableCell>
                                        <TableCell sx={{ marginLeft:"16px"}}>Data</TableCell>
                                        <TableCell sx={{ marginLeft:"16px"}}>Importo imponibile</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                    {listaFatture.map((el) =>{
                                        const backgroundColorRow = "#D6E8FB" ;
                                        return(
                                            <TableRow sx={{backgroundColor:backgroundColorRow}} >
                                                <TableCell>
                                                   1
                                                </TableCell>
                                                <TableCell>
                                                   2
                                                </TableCell>
                                                <TableCell>
                                                   3
                                                </TableCell>
                                            </TableRow>
                                        );
                                    } )}
                                </TableBody>
                            </Table>
                        </Box>
                    </div>
                    <div className='container_buttons_modal d-flex justify-content-center mt-5'>
                        <Button  
                            disabled={value === ''}
                            variant='contained'
                            onClick={()=> onButtonInvia()}
                        >INVIA</Button>
                    </div>
                </Box> 
            </Modal>
        </div>
    );
};
export default  ModalJsonSap;