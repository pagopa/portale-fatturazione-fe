import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { FattureObj, ModalConfermaRipristinaProps } from '../../types/typeFatturazione';
import { month } from '../../reusableFunction/reusableArrayObj';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

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

const ModalConfermaRipristina : React.FC<ModalConfermaRipristinaProps> =({setOpen, open, onButtonComferma,filterInfo,fattureSelectedArr}) => {
    

    const handleClose = (event:object, reason: string) =>{
        if(reason !== 'backdropClick'){
            setOpen(false);
        }
    };
   
    const handleConferma = () => {
        setOpen(false);
        onButtonComferma();
    };

    const handleAnnulla = () =>{
        setOpen(false);
             
    };
    let arr = [];

    if(open === true){
        arr = fattureSelectedArr();
    }
    
    
    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <div className='text-center'>
                        <Typography id="modal-modal-title" variant="h6">
        Attenzione!
                        </Typography>
                        <div className='mt-3'>
                            <Typography id="modal-modal-description" variant="body1" sx={{ mt: 2 }}>
                                {`${filterInfo.cancellata ? 'Ripristino':'Sospensione'} delle fatture di ${month[filterInfo.mese-1]?.toLocaleUpperCase()}: confermi l'operazione?`}
                            </Typography>
                        </div>
                        
                    </div>
                    
                    <div >
                       
                      
                        <Box sx={{ backgroundColor:'#F8F8F8', padding:'10px',marginTop:'40px',overflowY:'auto',height:'200px'}}>
                           
                            <Typography sx={{marginLeft:"6px",textAlign:'center'}} variant="h6" gutterBottom>
                                   Fatture
                            </Typography>
                         
                           
                            <Table size="small" aria-label="purchases"sx={{}}>
                                <TableHead >
                                    <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                        <TableCell sx={{ marginLeft:"16px"}}> Ragione Sociale</TableCell>
                                        <TableCell sx={{ marginLeft:"16px"}}> Tipologia Fattura</TableCell>
                                    </TableRow>
                                </TableHead>
                                {arr.length > 0 &&
                                <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                    {arr.map((el:FattureObj) =>{
                                       
                                        return(
                                            <TableRow  key={el.idfattura}>
                                                <TableCell>
                                                    {el.ragionesociale}
                                                </TableCell>
                                                <TableCell>
                                                    {el.tipologiaFattura}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    } )}
                                </TableBody>
                                }
                            </Table>
                        </Box>
                  
                    </div>
                   
                    <div className='container_buttons_modal d-flex justify-content-center'>
                        <Button 
                            sx={{marginRight:'20px'}} 
                            variant='contained'
                            onClick={()=>handleConferma()}
                        >Conferma</Button>
                        <Button
                            variant='outlined'
                            onClick={()=>handleAnnulla()}
                        >Annulla</Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};
export default  ModalConfermaRipristina;