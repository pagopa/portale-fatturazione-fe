import React, {useContext} from 'react';
import { Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked } from '@pagopa/mui-italia';
import { DatiFatturazioneContext } from '../../page/areaPersonaleUtenteEnte';
import HorizontalLinearStepper from '../reusableComponents/stepper';

const PageTitleNavigation = () => {


    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    const {infoModuloCommessa, setInfoModuloCommessa, user} = useContext(DatiFatturazioneContext);
 
    let titleNavigation;
  
    if (infoModuloCommessa.statusPageDatiFatturazione === 'immutable' &&  user !== 'new') {
       
        titleNavigation = 'Dati di fatturazione';
    }else if(infoModuloCommessa.statusPageDatiFatturazione === 'mutable' &&  user === 'old'){
        titleNavigation = 'Modifica dati di fatturazione';
       
    }else {
        titleNavigation = 'Inserisci dati di fatturazione ';
      
    }
   
    // da usare quando si saprà bene la logica
    // const pathNewUser =  <Typography  variant="caption"> /<strong> Iserisci dati di fatturazione</strong></Typography>;
    const pathOldUser = <Typography sx={{ marginLeft: '10px' }} variant="caption">Dati di fatturazione <strong>/ Modifica</strong></Typography>;
  

    return (
        <div className="mx-5 mt-2">
           
            {(infoModuloCommessa.statusPageDatiFatturazione === 'mutable' && user === 'old')
                ? (
                    <div>
                        <ButtonNaked
                            color="primary"
                            onFocusVisible={() => { console.log('onFocus'); }}
                            size="small"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => setInfoModuloCommessa((prev:any)=>({...prev, ...{statusPageDatiFatturazione:'immutable'}}))}
                            sx={{marginBottom:'2px'}}
                        >
                          Indietro 
                        </ButtonNaked>
                        {pathOldUser}
                        

                    </div>
                     
                      
                ) : null}
            <div className="marginTop24">
                <Typography variant="h4">{titleNavigation}</Typography>
            </div>
            
            {infoModuloCommessa.statusPageDatiFatturazione === 'immutable' && profilo.ruolo === 'R/W' ? (
                <div className="text-end marginTop24">
                    <Button onClick={() => setInfoModuloCommessa((prev:any)=>({...prev, ...{statusPageDatiFatturazione:'mutable'}}))} variant="contained" size="small">Modifica</Button>
                </div>
            ) : null}

        </div>

    );
};
export default  PageTitleNavigation;