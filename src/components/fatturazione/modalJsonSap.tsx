import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { FormControl, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../store/context/globalContext';
import { getListaJsonFatturePagoPa, invioListaJsonFatturePagoPa, sendListaJsonFatturePagoPa } from '../../api/apiPagoPa/fatturazionePA/api';
import CloseIcon from '@mui/icons-material/Close';
import { manageError } from '../../api/api';
import RowJsonSap from './rowPopJson';


const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1500,
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

interface SelectedJsonSap {
    annoRiferimento: number,
    meseRiferimento: number,
    tipologiaFattura: string
}

const ModalJsonSap = ({open,setOpen}) => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState,dispatchMainState} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const [listaFatture, setListaFatture] = useState<ListaFatture[]>([]);
    const [tipologieFatture, setTipologie] = useState<string[]>([]);
    const [selected,setSelected] = useState<SelectedJsonSap[]>([]);
    const [tipologia, setTipologia] = useState('Tutte');

    useEffect(()=>{
        if(open || tipologia !== 'Tutte'){
            getLista(tipologia);
        }
    },[open,tipologia]);

    const getLista = async (tipologia) =>{
        await getListaJsonFatturePagoPa(token,profilo.nonce).then((res)=>{
            const array = res.data.map( el => el.tipologiaFattura);
            const uniqueArray = array.reduce((accumulator, current) => {
                if (!accumulator.includes(current)) {
                    accumulator.push(current);
                }
                return accumulator;
            }, []);
            
            setTipologie([...["Tutte"],...uniqueArray]);
            let elOrdered = res.data.map(el => {
                return {
                    tipologiaFattura: el.tipologiaFattura,
                    numeroFatture: el.numeroFatture,
                    annoRiferimento: el.annoRiferimento,
                    meseRiferimento: el.meseRiferimento,
                    importo: el.importo
                };
            }); 

            if(tipologia !== 'Tutte'){
                elOrdered = res.data.filter(el => el.tipologiaFattura === tipologia);
            }
          
            setListaFatture(elOrdered);
        }).catch((err)=>{
            console.log(err);
        });
    };

    const getDetailSingleRow = async(body,setStateSingleRow) => {
        await sendListaJsonFatturePagoPa(token,profilo.nonce,body).then((res)=>{

            const orderData = res.data.map(el => {
                return {
                    ragioneSociale: el.ragioneSociale,
                    tipologiaFattura: el.tipologiaFattura,
                    annoRiferimento: el.annoRiferimento,
                    meseRiferimento:el.meseRiferimento,
                    dataFattura:el.dataFattura,
                    importo:el.importo
                };
            });
            console.log({rea:res.data});
            setStateSingleRow(orderData);
        }).catch((err)=>{
            manageError(err, dispatchMainState);
        });
    };


    console.log({tipologieFatture});
    const onButtonInvia = async() =>{
        // se l'utente ha selezionato il button invia a sap 
        await invioListaJsonFatturePagoPa(token,profilo.nonce,selected).then((res)=>{

         
            console.log({rea:res.data});
          
        }).catch((err)=>{
            manageError(err, dispatchMainState);
        });
      
    };
   
    const handleClose = () => {
        setTipologia('Tutte');
        setOpen(false);
    };

    return (
        <div>
        
            <Modal
                open={open}
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
                                        setTipologia(e.target.value);
                                    }}     
                                    value={tipologia}       
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
                        <Box sx={{ backgroundColor:'#F8F8F8', padding:'20px',marginTop:'40px',width:'95%'}}>
                            <div className='d-flex justify-content-center'>
                                <Typography  variant="h6" gutterBottom component="div">
                                    Fatture
                                </Typography>
                            </div>
                            <Box
                                sx={{
                                    overflowY: "auto",
                                    whiteSpace: "nowrap",
                                    maxHeight: "600px"
                                }}
                            >
                                <Table  aria-label="purchases">
                                    <TableHead sx={{position: "sticky", top:'0',zIndex:"2",backgroundColor: "#E3E6E9"}}>
                                        <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                            <TableCell sx={{ marginLeft:"16px"}} ></TableCell>
                                            <TableCell sx={{ marginLeft:"16px"}} ></TableCell>
                                            <TableCell align='center' sx={{ marginLeft:"16px"}} >Tipologia Fattura</TableCell>
                                            <TableCell align='center' sx={{ marginLeft:"16px"}}>Numero Fatture</TableCell>
                                            <TableCell align='center' sx={{ marginLeft:"16px"}}>Anno</TableCell>
                                            <TableCell align='center' sx={{ marginLeft:"16px"}}>Mese</TableCell>
                                            <TableCell align='center' sx={{ marginLeft:"16px"}}>Importo imponibile</TableCell>
                                        </TableRow>
                                    </TableHead>
                               
                                    {listaFatture.map((el) =>{
                                   
                                        return(
                                          
                                            <RowJsonSap row={el} setSelected={setSelected} selected={selected} apiDetail={getDetailSingleRow} lista={listaFatture}></RowJsonSap>
                                           
                                        );
                                    } )}
                              
                                </Table>
                            </Box>
                        </Box>
                    </div>
                    <div className='container_buttons_modal d-flex justify-content-center mt-5'>
                        <Button  
                            variant='contained'
                            disabled={selected.length < 1}
                            onClick={onButtonInvia}
                        >INVIA</Button>
                    </div>
                </Box> 
            </Modal>
        </div>
    );
};
export default  ModalJsonSap;