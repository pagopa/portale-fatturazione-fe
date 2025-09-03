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
        width: (profilo.profilo === 'CON' || profilo.profilo === 'REC') ?'80%':'60%',
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
                    <div className='mt-3'>
                        <TableContainer component={Paper}>
                            <Table aria-label="simple table">
                                <div style={{overflowY: "auto",maxHeight: "75vh"}}>
                                    <TableHead sx={{ position:'sticky',top: '0',zIndex:'10', backgroundColor:'#fffff'}}>
                                        <TableRow sx={{ position: "sticky", top: 0, zIndex: 20, backgroundColor: "#fafafa" }}>
                                            <TableCell colSpan={2} align="center" sx={{ borderLeft: "1px solid black",fontWeight: "bold",borderTop:"1px solid black" }}>
                                                
                                            </TableCell>
                                            <TableCell sx={{
                                                borderLeft: "1px solid black",
                                                borderRight: "1px solid black",
                                                borderTop:"1px solid black",
                                                fontWeight: "bold"
                                            }} colSpan={3} align="center">
                                                Ente/Aderente
                                            </TableCell>
                                            <TableCell sx={{borderRight: "1px solid black",fontWeight: "bold",borderTop:"1px solid black"}} colSpan={1} align="center">
                                                Supporto SEND
                                            </TableCell>
                                            {(profilo.profilo === 'CON' || profilo.profilo === 'REC') &&
                                            <TableCell colSpan={2} align="center" sx={{ fontWeight: "bold",borderLeft: "1px solid black",
                                                borderRight: "1px solid black",
                                                borderTop:"1px solid black", }}>
                                                Consolidatore/Recapitista
                                            </TableCell>
                                            }
                                        </TableRow>
                                        <TableRow sx={{ position: "sticky", top: 48, zIndex: 19, backgroundColor: "#fafafa" }}>
                                            <TableCell  sx={{ borderLeft: "1px solid black",borderBottom:"1px solid black" }} colSpan={1}>Mese</TableCell>
                                            <TableCell sx={{borderRight: "1px solid black",borderBottom:"1px solid black"}} colSpan={1} >Anno </TableCell>
                                            <TableCell sx={{borderBottom:"1px solid black"}} colSpan={1} align="left">Inizio inserimento</TableCell>
                                            <TableCell sx={{borderBottom:"1px solid black"}} colSpan={1} align="left">Fine inserimento</TableCell>
                                            <TableCell sx={{borderRight: "1px solid black",borderBottom:"1px solid black"}} colSpan={1} align="left">Fine risposta</TableCell>
                                            <TableCell sx={{borderRight: "1px solid black",borderBottom:"1px solid black"}} colSpan={1} align="left">Fine</TableCell>
                                            {(profilo.profilo === 'CON' || profilo.profilo === 'REC') &&
                                            <>
                                                <TableCell  sx={{borderBottom:"1px solid black"}} colSpan={1} align="left">Inizo risposta </TableCell>
                                                <TableCell sx={{borderRight: "1px solid black",borderBottom:"1px solid black"}} colSpan={1} align="left">Fine risposta</TableCell>
                                            </>
                                            }
                                        </TableRow>
                                    </TableHead>
                                
                                    <TableBody>
                                        {datiScadenziario.map((row) => (
                                            <TableRow
                                                key={row.meseContestazione}
                                                sx={{ borderLeft: "1px solid black"}}
                                            >
                                                <TableCell align="left" scope="row">
                                                    {row.meseContestazione}
                                                </TableCell>
                                                <TableCell sx={{
                                                    borderRight: "1px solid black",
                                                }} align="left">{row.annoContestazione}</TableCell>
                                                <TableCell align="left">{row.dataInizio}</TableCell>
                                                <TableCell align="left">{row.dataFine}</TableCell>
                                                <TableCell sx={{borderRight: "1px solid black"}}  align="left">{row.chiusuraContestazioni}</TableCell>
                                                <TableCell sx={{borderRight: "1px solid black"}}  align="left">{row.tempoRisposta}</TableCell>
                                                {(profilo.profilo === 'CON' || profilo.profilo === 'REC') &&
                                                <>
                                                    <TableCell sx={{borderRight: "1px solid black"}} align="left">{row.dataRecapitistaInizio}</TableCell>
                                                    <TableCell sx={{borderRight: "1px solid black"}} align="left">{row.dataRecapitistaFine}</TableCell>
                                                </>
                                                }
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </div> 
                            </Table>
                        </TableContainer>
                    </div> 
                    
                </Box>
            </Modal>
        </div>
    );
};
export default  ModalScadenziario;