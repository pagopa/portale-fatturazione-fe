import {useState, createContext, useEffect} from 'react';
import {Typography, Button} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked } from '@pagopa/mui-italia';
import PrimoContainerInsCom from '../components/primoContainerInsCom';
import SecondoContainerInsCom from '../components/secondoContainerInsCom';
import TerzoContainerInsCom from '../components/terzoConteinerInsCom';
import BasicModal from '../components/modal';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useNavigate } from 'react-router';
// import HorizontalLinearStepper from '../components/stepper';
import {insertDatiModuloCommessa, getDatiModuloCommessa} from '../api/api';
import { DatiCommessa, InsModuloCommessaContext , ResponsTotaliInsModuloCommessa, TotaleNazionaleInternazionale} from '../types/typeModuloCommessaInserimento';



export const InserimentoModuloCommessaContext = createContext<InsModuloCommessaContext>({
    datiCommessa: {
        moduliCommessa: [
            {
                numeroNotificheNazionali: 0,
                numeroNotificheInternazionali: 0,
                totaleNotifiche:0,
                idTipoSpedizione: 1
            },
            {
                numeroNotificheNazionali: 0,
                numeroNotificheInternazionali: 0,
                totaleNotifiche:0,
                idTipoSpedizione: 2
            },
            {
                numeroNotificheNazionali: 0,
                numeroNotificheInternazionali: 0,
                totaleNotifiche:0,
                idTipoSpedizione: 3
            }
          
        ]
    },
    totale:{totaleNazionale:0, totaleInternazionale:0, totaleNotifiche:0}
   
});


const ModuloCommessaInserimentoUtEn30 : React.FC = () => {

    const navigate = useNavigate();

    const [statusModuloCommessa, setStatusModuloCommessa] = useState('mutable');

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;
   

    const [datiCommessa, setDatiCommessa] = useState<DatiCommessa>( {
        moduliCommessa: [
            {
                numeroNotificheNazionali: 0,
                numeroNotificheInternazionali: 0,
                totaleNotifiche:0,
                idTipoSpedizione: 1
            },
            {
                numeroNotificheNazionali: 0,
                numeroNotificheInternazionali: 0,
                totaleNotifiche:0,
                idTipoSpedizione: 2
            },
            {
                numeroNotificheNazionali: 0,
                numeroNotificheInternazionali: 0,
                totaleNotifiche:0,
                idTipoSpedizione: 3
            }
          
        ]
    });
    console.log({datiCommessa});
    
    const [totaliModuloCommessa, setTotaliModuloCommessa] = useState<ResponsTotaliInsModuloCommessa[]>([
        {
            idCategoriaSpedizione: 0,
            totaleValoreCategoriaSpedizione: 0
        },
        {
            idCategoriaSpedizione: 0,
            totaleValoreCategoriaSpedizione: 0
        }
    ]);

    const [totale, setTotale] = useState<TotaleNazionaleInternazionale>({totaleNazionale:0, totaleInternazionale:0, totaleNotifiche:0});
   
    

    const getDatiCommessa = async () =>{
        await getDatiModuloCommessa(token)
            .then(res =>{
                console.log({res},'GET');
                setStatusModuloCommessa('immutable');
                setDatiCommessa({moduliCommessa:res.data.moduliCommessa});
                setTotaliModuloCommessa(res.data.totale);
                const objAboutTotale = res.data.totaleModuloCommessaNotifica;
                setTotale({totaleNazionale:objAboutTotale.totaleNumeroNotificheNazionali
                    , totaleInternazionale:objAboutTotale.totaleNumeroNotificheInternazionali
                    , totaleNotifiche:objAboutTotale.totaleNumeroNotificheDaProcessare});
               
            } )
            .catch(err => {
                console.log(err,'ERROR');
                if(err.response.status === 401){
                    navigate('/login');
                } 
            });
    };

    useEffect(()=>{
     
        getDatiCommessa();
    },[]);

   
   

    const [disableContinua, setDisableContinua] = useState(false);

    const calculateTot = (arr:any, string:string) =>{
        return arr.reduce((a:number,b:any) =>{
    
            return a + b[string];
        } , 0 );
    };
    useEffect(()=>{

        setTotale({
            totaleNazionale:calculateTot(datiCommessa.moduliCommessa,'numeroNotificheNazionali'),
            totaleInternazionale:calculateTot(datiCommessa.moduliCommessa,'numeroNotificheInternazionali'),
            totaleNotifiche:calculateTot(datiCommessa.moduliCommessa,'totaleNotifiche')});

        const check  = datiCommessa.moduliCommessa.map((singleObj) => {
            const arrBoolean = singleObj.numeroNotificheNazionali <= 0 &&  singleObj.numeroNotificheInternazionali <= 0;
            return arrBoolean;
        });
        const status = check.every(v => v === true);
        setDisableContinua(status);

    },[datiCommessa]);


    const hendlePostModuloCommessa = async () =>{

        await insertDatiModuloCommessa(datiCommessa, token)
            .then(res =>{
                setStatusModuloCommessa('immutable');
                setTotaliModuloCommessa(res.data.totale);
            } )
            .catch(err => {
                if(err.response.status === 401){
                    navigate('/login');
                } 
            });
    };
   

    const hendleModificaModuloCommessa = () => {
        setStatusModuloCommessa('mutable');
        setTotaliModuloCommessa([
            {
                idCategoriaSpedizione: 0,
                totaleValoreCategoriaSpedizione: 0
            },
            {
                idCategoriaSpedizione: 0,
                totaleValoreCategoriaSpedizione: 0
            }
        ]);
    };
    const cssPathModuloComm = statusModuloCommessa === 'immutable' ? 'bold' : 'normal';
    const cssPathAggModComm = statusModuloCommessa === 'mutable' ? 'bold' : 'normal';

   


    return (
        <InserimentoModuloCommessaContext.Provider
            value={{
                setDatiCommessa,
                datiCommessa,
                setDisableContinua,
                statusModuloCommessa,
                totaliModuloCommessa,
                setTotale,
                totale,
            }}>
            <BasicModal setOpen={setOpen} open={open}></BasicModal>
            <div className="marginTop24 ms-5 me-5">
                <div className='d-flex'>
                    <ButtonNaked
                        color="primary"
                        onFocusVisible={() => { console.log('onFocus'); }}
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => console.log('esci')}
                      
                    >
          Esci
                    </ButtonNaked>
                    
                    <Typography sx={{ marginLeft: '20px', fontWeight:cssPathModuloComm}} variant="caption">
                       
                        <ViewModuleIcon sx={{paddingBottom:'3px'}}  fontSize='small'></ViewModuleIcon>
                         Modulo commessa 
                        
                      
                    </Typography>
                    <Typography sx={{fontWeight:cssPathAggModComm}} variant="caption">/ Modifica modulo commessa</Typography>
                    
                    

                </div>
                <div className="marginTop24 marginTopBottom24">
                    {statusModuloCommessa === 'mutable'? <Typography variant="h4"> Modifica modulo commessa</Typography>
                        :
                        <Typography variant="h4"> Modulo commessa</Typography>
                    }
                    {statusModuloCommessa === 'immutable'?
                        <div className="d-flex justify-content-end ">
                            <Button variant="contained" size="small" onClick={()=> hendleModificaModuloCommessa()} >Modifica</Button>
                        </div>
                        : null
                    }
                    
                    
                    
                </div>
                {/*
                    <div className='marginTop24 marginBottom24'>
                        <HorizontalLinearStepper></HorizontalLinearStepper>
                    </div>
                */}
               

                <div className="bg-white mt-3 pt-3">
                    <PrimoContainerInsCom />
                    <SecondoContainerInsCom  />
       
                </div>
                <div className='bg-white'>
                    <TerzoContainerInsCom valueTotali={totaliModuloCommessa}/>
                </div>
                {
                    statusModuloCommessa === 'immutable' ? null :
                        <div className="d-flex justify-content-between mt-5 ">
                            <Button
                                variant="outlined"
                                type="button"
                                data-bs-toggle="modal"
                                data-bs-target="#exampleModal"
                                onClick={()=>handleOpen()}
                            >Indietro</Button>
                            <Button variant="contained" 
                       
                                disabled={disableContinua}
                                onClick={()=>hendlePostModuloCommessa()}
                            >Continua</Button>
                   
                        </div> 
                }
                

            </div>
        </InserimentoModuloCommessaContext.Provider>
    );
};

export default ModuloCommessaInserimentoUtEn30;