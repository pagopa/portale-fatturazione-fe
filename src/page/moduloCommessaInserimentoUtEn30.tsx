import {
    Typography, Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked } from '@pagopa/mui-italia';

import PrimoContainerInsCom from '../components/primoContainerInsCom';
import SecondoContainerInsCom from '../components/secondoContainerInsCom';
import TerzoContainerInsCom from '../components/terzoConteinerInsCom';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import HorizontalLinearStepper from '../components/stepper';

export default function ModuloCommessaInserimentoUtEn30() {
    return (

        <div className="marginTop24 ms-5 me-5">
            <div>
                <ButtonNaked
                    color="primary"
                    onFocusVisible={() => { console.log('onFocus'); }}
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => console.log('esci')}
                    sx={{marginBottom:'3px'}}
                >
          Esci
                </ButtonNaked>
                <Typography sx={{ marginLeft: '20px' }} variant="caption"> <ViewModuleIcon sx={{marginBottom:'5px'}} fontSize='small'></ViewModuleIcon> Modulo commessa / <strong>Aggiungi modulo commessa</strong></Typography>

            </div>
            <div className="marginTop24">
                <Typography variant="h4"> Aggiungi modulo commessa</Typography>
            </div>
            <div className='marginTop24 marginBottom24'>
                <HorizontalLinearStepper></HorizontalLinearStepper>
            </div>

            <div className="bg-white mt-3 pt-3">
                <PrimoContainerInsCom />
                <SecondoContainerInsCom />
       
            </div>
            <div className='bg-white'>
                <TerzoContainerInsCom />
            </div>
      
            <div className="d-flex justify-content-between mt-5 ">
                <Button variant="outlined">Indietro</Button>
                <Button variant="contained">Continua</Button>
            </div>

        </div>
    );
}
