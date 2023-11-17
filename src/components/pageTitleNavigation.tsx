import React, {useContext} from 'react';
import { Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked } from '@pagopa/mui-italia';
import { DatiFatturazioneContext } from '../page/areaPersonaleUtenteEnte';


const PageTitleNavigation = () => {

    const {statusPage, setStatusPage, user} = useContext(DatiFatturazioneContext);
 
    let titleNavigation;
    console.log({statusPage, user});
    if (statusPage === 'immutable' &&  user !== 'new') {
        console.log('primo');
        titleNavigation = 'Dati di fatturazione';
    }else if(statusPage === 'mutable' &&  user === 'old'){
        titleNavigation = 'Modifica dati di fatturazione';
        console.log('second');
    }else {
        titleNavigation = 'Inserisci dati di fatturazione ';
        console.log('terzo');
    }
   
    // da usare quando si saprà bene la logica
    // const pathNewUser =  <Typography  variant="caption"> /<strong> Iserisci dati di fatturazione</strong></Typography>;
    const pathOldUser = <Typography sx={{ marginLeft: '10px' }} variant="caption">Dati di fatturazione <strong>/ Modifica</strong></Typography>;
  

    return (
        <div className="mx-5 mt-2">
           
            {(statusPage === 'mutable' && user === 'old')
                ? (
                    <div>
                        <ButtonNaked
                            color="primary"
                            onFocusVisible={() => { console.log('onFocus'); }}
                            size="small"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => setStatusPage('immutable')}
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
            {statusPage === 'immutable' ? (
                <div className="text-end marginTop24">
                    <Button onClick={() => setStatusPage('mutable')} variant="contained" size="small">Modifica</Button>
                </div>
            ) : null}

        </div>

    );
};
export default  PageTitleNavigation;