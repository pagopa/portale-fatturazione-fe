import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { ModalProps } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { PathPf } from '../../../types/enum';
import { getChosenPath, profiliEnti } from '../../../reusableFunction/actionLocalStorage';
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
    
    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);
    const navigate = useNavigate();
    const location = useLocation();
    const chosenPath = getChosenPath();
    const enti = profiliEnti();
   
    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
  
    const handleClose = () =>{
        setOpen(prev => ({...prev,...{visible:false}}));
    };

    const handleEsci = () =>{
     
        if(location.pathname === PathPf.DATI_FATTURAZIONE ){
            if(profilo.auth === 'PAGOPA'&& mainState.statusPageDatiFatturazione === 'mutable' && mainState.datiFatturazione === false){
                navigate(open.clickOn);
                setOpen(prev => ({...prev, ...{visible:false,clickOn:''}}));
                handleModifyMainState({statusPageDatiFatturazione:'immutable'});
                
                localStorage.removeItem("filtersModuliCommessa");
                localStorage.removeItem("pageRowListaModuliCommessa");
                localStorage.removeItem("filtersRel");
                localStorage.removeItem("filtersNotifiche");
                //localStorage.removeItem("filtersListaDatiFatturazione");
                //localStorage.removeItem("pageRowListaDatiFatturazione");
               
               
            }else if(profilo.auth === 'PAGOPA'&& mainState.statusPageDatiFatturazione === 'immutable'){
                setOpen(prev => ({...prev, ...{visible:false,clickOn:''}}));
                navigate(PathPf.LISTA_DATI_FATTURAZIONE);
            }else if(profilo.auth === 'PAGOPA' && mainState.statusPageDatiFatturazione === 'mutable' && open.clickOn === 'INDIETRO_BUTTON'){
                getDatiFatPagoPa();
                setOpen(prev => ({...prev, ...{visible:false,clickOn:''}}));
                handleModifyMainState({statusPageDatiFatturazione:'immutable'});
            }else if(profilo.auth === 'PAGOPA' && mainState.statusPageDatiFatturazione === 'mutable' && open.clickOn !== 'INDIETRO_BUTTON'){
                getDatiFatPagoPa();
                setOpen(prev => ({...prev, ...{visible:false,clickOn:''}}));
                handleModifyMainState({statusPageDatiFatturazione:'immutable'});
                navigate(open.clickOn);
                localStorage.removeItem("filtersModuliCommessa");
                localStorage.removeItem("pageRowListaModuliCommessa");
                localStorage.removeItem("filtersRel");
                localStorage.removeItem("filtersNotifiche");
                // localStorage.removeItem("filtersListaDatiFatturazione");
                // localStorage.removeItem("pageRowListaDatiFatturazione");
            }else if(enti && mainState.statusPageDatiFatturazione === 'mutable'){
                getDatiFat();
                handleModifyMainState({statusPageDatiFatturazione:'immutable'});
                navigate(open.clickOn);
                setOpen(prev => ({...prev, ...{visible:false,clickOn:''}}));
                /* localStorage.removeItem("filtersModuliCommessa");
                localStorage.removeItem("pageRowListaModuliCommessa");
                localStorage.removeItem("filtersRel");
                localStorage.removeItem("filtersNotifiche");
                localStorage.removeItem("filtersListaDatiFatturazione");
                localStorage.removeItem("pageRowListaDatiFatturazione");*/
            }
        }
        if(location.pathname === PathPf.MODULOCOMMESSA){
            if(profilo.auth === 'PAGOPA' && open.clickOn === 'INDIETRO_BUTTON'){
                handleGetDettaglioModuloCommessaPagoPa();
                setOpen(prev => ({...prev, ...{visible:false,clickOn:''}}));
                handleModifyMainState({statusPageInserimentoCommessa:'immutable'});

            }else if(profilo.auth === 'PAGOPA' && open.clickOn !== 'INDIETRO_BUTTON'){
                handleGetDettaglioModuloCommessaPagoPa();
                navigate(open.clickOn);
                setOpen(prev => ({...prev, ...{visible:false,clickOn:''}}));
                handleModifyMainState({statusPageInserimentoCommessa:'immutable'});
                // localStorage.removeItem("filtersModuliCommessa");
                // localStorage.removeItem("pageRowListaModuliCommessa");
                localStorage.removeItem("filtersRel");
                localStorage.removeItem("filtersNotifiche");
                localStorage.removeItem("filtersListaDatiFatturazione");
                localStorage.removeItem("pageRowListaDatiFatturazione");

            }else if(mainState.statusPageInserimentoCommessa === 'mutable' && enti && open.clickOn === 'INDIETRO_BUTTON' && mainState.inserisciModificaCommessa === 'MODIFY'){
                setOpen(prev => ({...prev, ...{visible:false,clickOn:''}}));
                handleModifyMainState({statusPageInserimentoCommessa:'immutable'});
                handleGetDettaglioModuloCommessa();

            }else if(mainState.statusPageInserimentoCommessa === 'mutable' && enti && open.clickOn === 'INDIETRO_BUTTON' && mainState.inserisciModificaCommessa === 'INSERT'){
                setOpen(prev => ({...prev, ...{visible:false,clickOn:''}}));
                handleModifyMainState({statusPageInserimentoCommessa:'immutable'});
                navigate(PathPf.LISTA_COMMESSE);
                handleGetDettaglioModuloCommessa();

            }else if(mainState.statusPageInserimentoCommessa === 'mutable' && enti && open.clickOn !== 'INDIETRO_BUTTON'){
                navigate(open.clickOn);
                setOpen(prev => ({...prev, ...{visible:false,clickOn:''}}));
                handleModifyMainState({statusPageInserimentoCommessa:'immutable'});
                

            }
        }
       
    };
    return (
        <div>
            <Modal
                open={open.visible}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <div className='text-center'>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
        Attenzione!
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