import React, {useContext} from 'react';
import { Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked } from '@pagopa/mui-italia';
import { DatiFatturazioneContext } from '../../page/areaPersonaleUtenteEnte';
import DnsIcon from '@mui/icons-material/Dns';
import { useNavigate } from 'react-router';

interface PageTitleProps {
    dispatchMainState:any
}

const PageTitleNavigation : React.FC<PageTitleProps>   = ({dispatchMainState}) => {


    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    const navigate = useNavigate();

    const {mainState} = useContext(DatiFatturazioneContext);

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
        titleNavigation = 'Dati di fatturazione';
    }else if(mainState.statusPageDatiFatturazione === 'mutable' &&   mainState.datiFatturazione ){
        titleNavigation = 'Modifica dati di fatturazione';
    }

    

    const onIndietroButtonPagoPa = () =>{
        if(mainState.statusPageDatiFatturazione === 'immutable' || mainState.datiFatturazione === false){
            navigate('/pagopalistadatifatturazione');
        }else{
            handleModifyMainState({statusPageDatiFatturazione:'immutable'});
        }
    
    };

   

    return (
        <div className="mx-5 marginTop24">
           
            {((mainState.statusPageDatiFatturazione === 'mutable' && mainState.datiFatturazione) || profilo.auth === 'PAGOPA')
                &&
                    <div>
                        <ButtonNaked
                            color="primary"
                            onFocusVisible={() => { console.log('onFocus'); }}
                            size="small"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => onIndietroButtonPagoPa()}
                            sx={{marginBottom:'2px'}}
                        >
                          Indietro 
                        </ButtonNaked>
                        <Typography sx={{ marginLeft: '20px' }} variant="caption">
                            <DnsIcon fontSize="inherit" sx={{marginRight:'5px'}}></DnsIcon>
                              Dati di fatturazione 
                            <strong>/ {!mainState.datiFatturazione ? 'Inserisci i dati di fatturazione':'Modifica i dati di fatturazione'}</strong>
                        </Typography>
                     
                    </div>
            }
            <div className="marginTop24">
                <Typography variant="h4">{titleNavigation}</Typography>
            </div>
            
            {mainState.statusPageDatiFatturazione === 'immutable' && profilo.ruolo === 'R/W' ? (
                <div className="text-end marginTop24">
                    <Button onClick={() => handleModifyMainState({statusPageDatiFatturazione:'mutable'})}
                        variant="contained" size="small">Modifica</Button>
                </div>
            ) : null}

        </div>

    );
};
export default  PageTitleNavigation;