import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { ModalProps } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const BasicModal : React.FC<ModalProps> =({setOpen, open, dispatchMainState, getDatiFat, getDatiFatPagoPa, handleGetDettaglioModuloCommessa, handleGetDettaglioModuloCommessaPagoPa, mainState}) => {
    console.log(mainState);
    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);
    const navigate = useNavigate();
    const location = useLocation();

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
    console.log(location);
    const handleClose = () => setOpen(false);

    const handleEsci = () =>{
        if(location.pathname === '/'){
            if(profilo.auth === 'PAGOPA'){
                getDatiFatPagoPa();
                setOpen(false);
                handleModifyMainState({statusPageDatiFatturazione:'immutable'});
            }else{
                getDatiFat();
                handleModifyMainState({statusPageDatiFatturazione:'immutable'});
                setOpen(false);
            }
        }
        if(location.pathname === '/8'){
            if(profilo.auth === 'PAGOPA'){
                handleGetDettaglioModuloCommessaPagoPa();
                setOpen(false);
                handleModifyMainState({statusPageInserimentoCommessa:'immutable'});
            }else if(mainState.inserisciModificaCommessa === 'INSERT' && profilo.auth === 'SELFCARE'){
                setOpen(false);
                navigate('/4');

            }else if(profilo.auth === 'SELFCARE'){
                handleGetDettaglioModuloCommessa();
                handleModifyMainState({statusPageInserimentoCommessa:'immutable'});
                setOpen(false);
            }
        }
       
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
                    <div className='text-center'>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
        Gentile utente
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Le modifiche andranno perse
                        </Typography>
                    </div>
                   
                    <div className='container_buttons_modal d-flex justify-content-center'>
                        <Button 
                            sx={{marginRight:'20px'}} 
                            variant='outlined'
                            onClick={()=>handleClose()}
                        >Annulla</Button>
                        <Button
                            variant='contained'
                            onClick={()=>handleEsci()}
                        >Ok</Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};
export default  BasicModal;