import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { ModalSapProps} from '../../types/typeFatturazione';
import { FormControl, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { fattureInvioSapPa, fattureResetSapPa } from '../../api/apiPagoPa/fatturazionePA/api';
import { manageError } from '../../api/api';
import { month } from '../../reusableFunction/reusableArrayObj';
import { useContext } from 'react';
import { GlobalContext } from '../../store/context/globalContext';

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

const ModalSap : React.FC<ModalSapProps> = ({open,setOpen,responseTipologiaSap,mese,anno,dispatchMainState,getListaFatture,bodyFatturazioneDownload}) => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const [value, setValue] = React.useState('');
  
    const onButtonInvia = async() =>{
        // se l'utente ha selezionato il button invia a sap 
        handleClose();
        if(open.who === 0){
            await fattureInvioSapPa(token, profilo.nonce, {annoRiferimento:anno,meseRiferimento:mese,tipologiaFattura:value} )
                .then(()=>{
                    getListaFatture(bodyFatturazioneDownload);
                }).catch(((err)=>{
                    manageError(err,dispatchMainState);
                }));
        }
        if(open.who === 1){
            await fattureResetSapPa(token, profilo.nonce, {annoRiferimento:anno,meseRiferimento:mese,tipologiaFattura:value} )
                .then(()=>{
                    getListaFatture(bodyFatturazioneDownload);
                }).catch(((err)=>{
                    manageError(err,dispatchMainState);
                }));
        }
    };
   
    const handleClose = () => {
        setValue('');
        setOpen((prev)=>({...prev,...{show:false}}));
    };

    return (
        <div>
        
            <Modal
                open={open.show}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <div className='d-flex justify-content-between'>
                        <div className='d-flex align-items-center'>
                            <Typography id="modal-modal-title" variant="h6" >
                                {open.who === 0 ? "Seleziona le fatture da inviare" : "Seleziona le fatture da rielaborare"}
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
                                    onChange={(e) =>setValue(e.target.value)}     
                                    value={value}       
                                >
                                    {responseTipologiaSap.filter(el => el.azione === open.who).map((el) =>{ 
                                        return (            
                                            <MenuItem
                                                key={Math.random()}
                                                value={el.tipologiaFattura}
                                            >
                                                {el.tipologiaFattura}
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
                                    </TableRow>
                                </TableHead>
                                <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                    {responseTipologiaSap.filter(el => el.azione === open.who).map((el) =>{
                                        const backgroundColorRow = el.tipologiaFattura === value ? "#D6E8FB" : '';
                                        return(
                                            <TableRow sx={{backgroundColor:backgroundColorRow}} key={el.tipologiaFattura}>
                                                <TableCell>
                                                    {el.tipologiaFattura}
                                                </TableCell>
                                                <TableCell>
                                                    {el.numeroFatture}
                                                </TableCell>
                                                <TableCell>
                                                    {`${month[el.meseRiferimento-1]}/${el.annoRiferimento}`}
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
                        >{open.who === 0 ? "INVIA" : "RESET"}</Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};
export default  ModalSap;