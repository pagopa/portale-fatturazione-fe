import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { manageError } from '../../api/api';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Paper from '@mui/material/Paper';
import { getTipologieScadenziario } from '../../api/apiPagoPa/notificheSE/api';

const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

interface ModalScadenziario {
    setOpen:any,
    open:boolean,
    nonce:string
}

interface Scadenziario {
    annoContestazione: number,
    dataFine:string,
    dataInizio:string
    meseContestazione: string
}

const ModalScadenziario : React.FC<ModalScadenziario> = ({setOpen, open, nonce}) => {

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const navigate = useNavigate();
   
    const handleClose = () => setOpen(false);

    const [datiScadenziario, setDatiScadenziario] = useState<Scadenziario[] | []>([]);
    
    const getScadenziario = async () => {

        getTipologieScadenziario(token, nonce )
            .then((res)=>{
                setDatiScadenziario(res.data);
                console.log({res},'scadenziario ');
            })
            .catch(((err)=>{
                manageError(err,navigate);
            }));
    };

    useEffect(()=>{
        getScadenziario();
    },[]);

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
                                Scadenzario
                            </Typography>
                          
                        </div>
                        <div>
                            <Button variant="contained"  onClick={()=> handleClose() }> X </Button>
                        </div>
                    </div>

                    <div className='mt-3'>
                        <TableContainer component={Paper}>
                            <Table   aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Mese</TableCell>
                                        <TableCell align="left">Anno </TableCell>
                                        <TableCell align="left">Data inizio inserimento contestazione</TableCell>
                                        <TableCell align="left">Data fine inserimento contestazione</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {datiScadenziario.map((row) => (
                                        <TableRow
                                            key={row.meseContestazione}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 }}}
                                        >
                                            <TableCell align="left" scope="row">
                                                {row.meseContestazione}
                                            </TableCell>
                                            <TableCell align="left">{row.annoContestazione}</TableCell>
                                            <TableCell align="left">{row.dataInizio}</TableCell>
                                            <TableCell align="left">{row.dataFine}</TableCell>
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