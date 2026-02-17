import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { FormControl, InputLabel, MenuItem, Select, Table, TableCell, TableHead, TableRow } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { getListaJsonFatturePagoPa, invioListaJsonFatturePagoPa, sendListaJsonFatturePagoPa } from '../../api/apiPagoPa/fatturazionePA/api';
import CloseIcon from '@mui/icons-material/Close';
import { manageError, managePresaInCarico } from '../../api/api';
import RowJsonSap from './rowPopJson';
import Loader from '../reusableComponents/loader';
import { useGlobalStore } from '../../store/context/useGlobalStore';



const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70%',
    height:'80%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius:'20px'
};


interface ListaFatture {
    tipologiaFattura: string,
    statoInvio:number,
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

    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const [listaFatture, setListaFatture] = useState<ListaFatture[]>([]);
    const [tipologieFatture, setTipologie] = useState<string[]>([]);
    const [selected,setSelected] = useState<SelectedJsonSap[]>([]);
    const [tipologia, setTipologia] = useState('Tutte');
    const [showLoader, setShowLoader] = useState(false);

    useEffect(()=>{
        if(open || tipologia !== 'Tutte'){
            getLista(tipologia);
            setSelected([]);
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
                    statoInvio: el.statoInvio,
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
            manageError(err, dispatchMainState);
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
 
            setStateSingleRow(orderData);
        }).catch((err)=>{
            manageError(err, dispatchMainState);
        });
    };

    const onButtonInvia = async() =>{
        setShowLoader(true);
        // se l'utente ha selezionato il button invia a sap 
        await invioListaJsonFatturePagoPa(token,profilo.nonce,selected).then((res)=>{

            setShowLoader(false);
            getLista("Tutte");
            setSelected([]);
            setTipologia('Tutte');
            managePresaInCarico('SEND_JSON_SAP_OK',dispatchMainState);
        }).catch((err)=>{
            setShowLoader(false);
            setSelected([]);
            setTipologia('Tutte');
            manageError(err, dispatchMainState);
        });
      
    };
   
    const handleClose = () => {
        setTipologia('Tutte');
        setOpen(false);
        setSelected([]);
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
                        <Box sx={{width:'250px'}}  >
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
                        <Box
                            sx={{
                                overflowY: "auto",
                                whiteSpace: "nowrap",
                                backgroundColor:'#F8F8F8',
                                height:'350px',
                                marginY:'2%'
                            }}
                        >
                            <Table  aria-label="purchases">
                                <TableHead sx={{position: "sticky", top:'0',zIndex:"2",backgroundColor: "#E3E6E9"}}>
                                    <TableRow >
                                        <TableCell sx={{ marginLeft:"16px"}} ></TableCell>
                                        <TableCell sx={{ marginLeft:"16px"}} ></TableCell>
                                        <TableCell align='center' sx={{ marginLeft:"16px"}} >Tipologia Fattura</TableCell>
                                        <TableCell align='center' sx={{ marginLeft:"16px"}} >Stato</TableCell>
                                        <TableCell align='center' sx={{ marginLeft:"16px"}}>Numero Fatture</TableCell>
                                        <TableCell align='center' sx={{ marginLeft:"16px"}}>Anno</TableCell>
                                        <TableCell align='center' sx={{ marginLeft:"16px"}}>Mese</TableCell>
                                        <TableCell align='center' sx={{ marginLeft:"16px"}}>Importo imponibile</TableCell>
                                    </TableRow>
                                </TableHead>
                               
                                {listaFatture.map((el) =>{
                                   
                                    return(
                                          
                                        <RowJsonSap row={el} setSelected={setSelected} selected={selected} apiDetail={getDetailSingleRow} lista={listaFatture} ></RowJsonSap>
                                           
                                    );
                                } )}
                              
                            </Table>
                        </Box>
                       
                    </div>
                    {!showLoader ?
                        <div className='container_buttons_modal d-flex justify-content-center mt-5'>
                            <Button  
                                variant='contained'
                                disabled={selected.length < 1}
                                onClick={onButtonInvia}
                            >INVIA</Button>
                        </div>:
                        <div id='loader_on_modal' className='container_buttons_modal d-flex justify-content-center mt-5'>
                            <Loader sentence={'Attendere...'}></Loader> 
                        </div>}
                    
                </Box> 
            </Modal>
        </div>
    );
};
export default  ModalJsonSap;