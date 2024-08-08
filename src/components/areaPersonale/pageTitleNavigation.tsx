import { Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked } from '@pagopa/mui-italia';
import DnsIcon from '@mui/icons-material/Dns';
import {  useNavigate } from 'react-router';
import { PathPf } from '../../types/enum';
import { getProfilo, getStatusApp } from '../../reusableFunction/actionLocalStorage';
import { InfoOpen, MainState } from '../../types/typesGeneral';
import { Dispatch, SetStateAction } from 'react';
import { ActionReducerType } from '../../reducer/reducerMainState';

interface PageTitleProps {
    dispatchMainState:Dispatch<ActionReducerType>,
    setOpen:Dispatch<SetStateAction<InfoOpen>>,
    mainState:MainState
}

const PageTitleNavigation : React.FC<PageTitleProps>   = ({dispatchMainState, setOpen,mainState}) => {

    const profilo =  getProfilo();
    const statusApp = getStatusApp();
    const navigate = useNavigate();

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
  
    let titleNavigation;
    if (!mainState.datiFatturazione) {
        titleNavigation = 'Inserisci i dati di fatturazione ';
    }else if (mainState.statusPageDatiFatturazione === 'immutable' && mainState.datiFatturazione) {
        titleNavigation = 'Dati di fatturazione ';
    }else if(mainState.statusPageDatiFatturazione === 'mutable' &&   mainState.datiFatturazione ){
        titleNavigation = 'Modifica dati di fatturazione ';
    }

    const onIndietroButtonPagoPa = () =>{
        if(mainState.statusPageDatiFatturazione === 'immutable' &&  profilo.auth === 'PAGOPA'){
            navigate(PathPf.LISTA_DATI_FATTURAZIONE);
        }else{
            setOpen((prev:InfoOpen) => ({...prev, ...{visible:true,clickOn:'INDIETRO_BUTTON'}}));
        }
    };

    const cssPath1 = mainState.statusPageDatiFatturazione === 'immutable'?'bold':'normal';
    const cssPath2 = mainState.statusPageDatiFatturazione === 'mutable'?'bold':'normal';

    return (
        <div className="mx-5 marginTop24">
            {((mainState.statusPageDatiFatturazione === 'mutable' && mainState.datiFatturazione) || profilo.auth === 'PAGOPA')
                &&
                    <div>
                        <ButtonNaked
                            color="primary"
                            size="small"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => onIndietroButtonPagoPa()}
                            sx={{marginBottom:'2px'}}
                        >
                          Indietro 
                        </ButtonNaked>
                        <Typography sx={{ marginLeft: '20px',fontWeight:cssPath1 }} variant="caption">
                            <DnsIcon fontSize="inherit" sx={{marginRight:'5px'}}></DnsIcon>
                              Dati di fatturazione /
                        </Typography>
                        <Typography sx={{fontWeight:cssPath2 }} variant="caption">
                            {!mainState.datiFatturazione ? 'Inserisci i dati di fatturazione':'Modifica i dati di fatturazione'}
                        </Typography>
                    </div>
            }
            <div className="marginTop24">
                <Typography variant="h4">{titleNavigation} {profilo.auth === 'PAGOPA' && `/ ${statusApp.nomeEnteClickOn}`} </Typography>
            </div>
            {mainState.statusPageDatiFatturazione === 'immutable' && profilo.ruolo === 'R/W' ? (
                <div className="text-end">
                    <Button onClick={() => handleModifyMainState({statusPageDatiFatturazione:'mutable'})}
                        variant="contained" size="small">Modifica</Button>
                </div>
            ) : null}
        </div>
    );
};
export default  PageTitleNavigation;