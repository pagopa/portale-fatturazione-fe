import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { manageError } from '../../api/api';
import { Dispatch, useContext, useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Paper from '@mui/material/Paper';
import { getTipologieScadenziario } from '../../api/apiPagoPa/notifichePA/api';
import { ActionReducerType } from '../../reducer/reducerMainState';
import { GlobalContext } from '../../store/context/globalContext';
import CloseIcon from '@mui/icons-material/Close';






interface ModalScadenziario {
    setOpen:React.Dispatch<React.SetStateAction<boolean>>,
    open:boolean,
    nonce:string,
    dispatchMainState:Dispatch<ActionReducerType>,
}

interface Scadenziario {
    annoContestazione: number,
    dataFine:string,
    dataInizio:string
    meseContestazione: string
}

const ModalScadenziario : React.FC<ModalScadenziario> = ({setOpen, open, nonce,dispatchMainState}) => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const style = {
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width:"auto",
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius:'20px'
    };

    

    const handleClose = () => setOpen(false);

    const [datiScadenziario, setDatiScadenziario] = useState<Scadenziario[] | []>([]);
    
    const getScadenziario = async () => {
        getTipologieScadenziario(token, nonce )
            .then((res)=>{
                setDatiScadenziario(res.data);
            }).catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
    };

    useEffect(()=>{
        if(nonce !== ''){
            getScadenziario();
        }
    },[nonce]);

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
                            <Typography  id="modal-modal-title" variant="h6" component="h2">
                                Scadenzario contestazioni
                            </Typography>
                        </div>
                        
                        <div className='icon_close me-5'>
                            <CloseIcon onClick={handleClose} id='close_icon' sx={{color:'#17324D'}}></CloseIcon>
                        </div>
                       
                    </div>
        
                    <div className='mt-5'>
                        <TableContainer  sx={{overflowY: "auto",maxHeight: "75vh"}} component={Paper}>
                            <Table>
                                <TableHead sx={{ position:'sticky',top: '0',zIndex:'10', backgroundColor:'#f2f2f2',borderLeft: "10px solid #e0e0e0",borderRight: "10px solid #e0e0e0"}}>
                                    <TableRow sx={{ position: "sticky", top: 0, zIndex: 20, backgroundColor: "grey.200",borderColor: "divider"}}>
                                        <TableCell colSpan={2} align="center" sx={{ fontWeight: "bold"}}>
                                                
                                        </TableCell>
                                        <TableCell sx={{fontWeight: "bold",whiteSpace: "nowrap",borderRight: "10px solid #e0e0e0",borderLeft: "10px solid #e0e0e0"}} colSpan={6} align="center">
                                                Ente Aderente
                                        </TableCell>
                                        <TableCell sx={{fontWeight: "bold",whiteSpace: "nowrap", borderRight: "10px solid e0e0e0"}} colSpan={2} align="center">
                                                Supporto postalizzazione
                                        </TableCell>
                                        {(profilo.profilo === 'CON' || profilo.profilo === 'REC') &&
                                            <TableCell colSpan={2} align="center" sx={{ fontWeight: "bold",whiteSpace: "nowrap"}}>
                                                Consolidatore/Recapitista
                                            </TableCell>
                                        }
                                    </TableRow>
                                    <TableRow sx={{ position: "sticky", top: 48, zIndex: 19, backgroundColor: "grey.100",borderColor: "divider"  }}>
                                        <TableCell   align="center" colSpan={1}>Mese</TableCell>
                                        <TableCell  sx={{borderRight: "10px solid #e0e0e0"}} align="center" colSpan={1} >Anno </TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap"}} colSpan={2} align="center">Inizio inserimento</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap"}} colSpan={2} align="center">Fine inserimento</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap",borderRight: "10px solid #e0e0e0"}} colSpan={2} align="center">Tempo di risposta</TableCell>
                                        <TableCell sx={{whiteSpace: "nowrap"}} colSpan={2} align="center">Tempo di risposta</TableCell>
                                        {(profilo.profilo === 'CON' || profilo.profilo === 'REC') &&
                                            <>
                                                <TableCell  sx={{whiteSpace: "nowrap"}} colSpan={1} align="center">Inizo risposta </TableCell>
                                                <TableCell sx={{whiteSpace: "nowrap"}} colSpan={1} align="center">Tempo di risposta</TableCell>
                                            </>
                                        }
                                    </TableRow>
                                </TableHead>
                                
                                <TableBody>
                                    {datiScadenziario.map((row) => (
                                        <TableRow
                                            key={row.meseContestazione}
                                            sx={{ borderLeft: "10px solid #e0e0e0",borderRight: "10px solid #e0e0e0",backgroundColor:"#fcfcfc",borderBottom: "2px solid #e0e0e0"}}
                                        >
                                            <TableCell  align="center" scope="row">
                                                {row.meseContestazione}
                                            </TableCell>
                                            <TableCell  sx={{ borderRight: "10px solid #e0e0e0",boxSizing: "border-box",whiteSpace: "nowrap"}} align="center">{row.annoContestazione}</TableCell>
                                            <TableCell colSpan={2} sx={{whiteSpace: "nowrap"}} align="center">{row.dataInizio}</TableCell>
                                            <TableCell colSpan={2} sx={{whiteSpace: "nowrap"}} align="center">{row.dataFine}</TableCell>
                                            <TableCell colSpan={2} sx={{ borderRight: "10px solid #e0e0e0",whiteSpace: "nowrap",boxSizing: "border-box"}}  align="center">{row.chiusuraContestazioni}</TableCell>
                                            <TableCell colSpan={2} sx={{ borderRight: "10px solid #e0e0e0",whiteSpace: "nowrap",boxSizing: "border-box"}}  align="center">{row.tempoRisposta}</TableCell>
                                            {(profilo.profilo === 'CON' || profilo.profilo === 'REC') &&
                                                <>
                                                    <TableCell sx={{ borderRight: "10px solid #e0e0e0",boxSizing: "border-box",whiteSpace: "nowrap"}} align="center">{row.dataRecapitistaInizio}</TableCell>
                                                    <TableCell sx={{ borderRight: "10px solid #e0e0e0",boxSizing: "border-box",whiteSpace: "nowrap"}} align="center">{row.dataRecapitistaFine}</TableCell>
                                                </>
                                            }
                                        </TableRow>
                                    ))}
                                </TableBody>
                              
                            </Table>
                        </TableContainer>
                    </div> 
                    
                </Box>
            </Modal>
        </div>
    );
};
export default  ModalScadenziario;