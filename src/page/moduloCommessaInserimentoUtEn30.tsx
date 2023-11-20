import {useState, createContext} from 'react';
import {Typography, Button} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked } from '@pagopa/mui-italia';
import PrimoContainerInsCom from '../components/primoContainerInsCom';
import SecondoContainerInsCom from '../components/secondoContainerInsCom';
import TerzoContainerInsCom from '../components/terzoConteinerInsCom';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import HorizontalLinearStepper from '../components/stepper';
import {insertDatiModuloCommessa} from '../api/api';
import { DatiCommessa, InsModuloCommessaContext } from '../types/typeModuloCommessaInserimento';
import { DatiFatturazioneContext } from './areaPersonaleUtenteEnte';

export const InserimentoModuloCommessaContext = createContext<InsModuloCommessaContext>({
    datiCommessa: {
        moduliCommessa: [
            {
                numeroNotificheNazionali: 0,
                numeroNotificheInternazionali: 0,
                idTipoSpedizione: 1
            },
            {
                numeroNotificheNazionali: 0,
                numeroNotificheInternazionali: 0,
                idTipoSpedizione: 2
            },
            {
                numeroNotificheNazionali: 0,
                numeroNotificheInternazionali: 0,
                idTipoSpedizione: 3
            }
          
        ]
    }
});


const ModuloCommessaInserimentoUtEn30 : React.FC = () => {

    
   

    const [datiCommessa, setDatiCommessa] = useState<DatiCommessa>( {
        moduliCommessa: [
            {
                numeroNotificheNazionali: 0,
                numeroNotificheInternazionali: 0,
                idTipoSpedizione: 1
            },
            {
                numeroNotificheNazionali: 0,
                numeroNotificheInternazionali: 0,
                idTipoSpedizione: 2
            },
            {
                numeroNotificheNazionali: 0,
                numeroNotificheInternazionali: 0,
                idTipoSpedizione: 3
            }
          
        ]
    });
    console.log({datiCommessa});

    const hendlePostModuloCommessa = async () =>{

        const result =  await insertDatiModuloCommessa(datiCommessa);
        console.log({result});
        return result;

    };

    let disableButtonContinua = false;
    const check  = datiCommessa.moduliCommessa.map((singleObj) => {
        const arrBoolean = singleObj.numeroNotificheNazionali <= 0 &&  singleObj.numeroNotificheInternazionali <= 0;
        return arrBoolean;
    });
    disableButtonContinua =  check.every(v => v === true);
   


    return (
        <InserimentoModuloCommessaContext.Provider
            value={{
                setDatiCommessa,
                datiCommessa
            }}>
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
                    <Button variant="contained" 
                        disabled={disableButtonContinua}
                        onClick={()=>hendlePostModuloCommessa()}
                    >Continua</Button>
                </div>

            </div>
        </InserimentoModuloCommessaContext.Provider>
    );
};

export default ModuloCommessaInserimentoUtEn30;