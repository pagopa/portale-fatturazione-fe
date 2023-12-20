import {useState, createContext, useEffect} from 'react';
import {Typography, Button} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked } from '@pagopa/mui-italia';
import PrimoContainerInsCom from '../components/commessaInserimento/primoContainerInsCom';
import SecondoContainerInsCom from '../components/commessaInserimento/secondoContainerInsCom';
import TerzoContainerInsCom from '../components/commessaInserimento/terzoConteinerInsCom';
import BasicModal from '../components/reusableComponents/modal';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useNavigate } from 'react-router';
// import HorizontalLinearStepper from '../components/stepper';
import {insertDatiModuloCommessa, getDettaglioModuloCommessa} from '../api/api';
import {url, menageError} from '../api/api';
import { redirect } from '../api/api';
import AreaPersonaleUtenteEnte from '../page/areaPersonaleUtenteEnte';
import HorizontalLinearStepper from '../components/reusableComponents/stepper';
import { DatiCommessa, InsModuloCommessaContext , ResponsTotaliInsModuloCommessa,ModuloCommessaInserimentoProps, TotaleNazionaleInternazionale} from '../types/typeModuloCommessaInserimento';



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


const ModuloCommessaInserimentoUtEn30 : React.FC<ModuloCommessaInserimentoProps> = ({infoModuloCommessa, setInfoModuloCommessa}) => {



    
    const month = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre",'Gennaio'];

    const navigate = useNavigate();

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);

    const [openModalDatiFatturazione, setOpenModalDatiFatturazione] = useState(false);
    const handleOpenModalDatiFatt = () => setOpenModalDatiFatturazione(true);



   
   

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
  
    
    const [totaliModuloCommessa, setTotaliModuloCommessa] = useState<ResponsTotaliInsModuloCommessa[]>([
        {
            idCategoriaSpedizione: 1,
            totaleValoreCategoriaSpedizione: 0
        },
        {
            idCategoriaSpedizione: 2,
            totaleValoreCategoriaSpedizione: 0
        }
    ]);

    const [totale, setTotale] = useState<TotaleNazionaleInternazionale>({totaleNazionale:0, totaleInternazionale:0, totaleNotifiche:0});
    const [dataMod, setDataModifica] = useState('');
    // visualizza modulo cmmessa from grid 

   
    
    const state = localStorage.getItem('statusApplication') || '{}';
    const statusApp =  JSON.parse(state);
   
   

    const handleGetDettaglioModuloCommessa = async () =>{

        await getDettaglioModuloCommessa(token,statusApp.anno,statusApp.mese, infoModuloCommessa.nonce)
            .then((response:any)=>{
                const res = response.data;
                console.log({res});
                setDatiCommessa({moduliCommessa:res.moduliCommessa});
                setTotaliModuloCommessa(res.totale);
                const objAboutTotale = res.totaleModuloCommessaNotifica;
                setTotale({totaleNazionale:objAboutTotale.totaleNumeroNotificheNazionali
                    , totaleInternazionale:objAboutTotale.totaleNumeroNotificheInternazionali
                    , totaleNotifiche:objAboutTotale.totaleNumeroNotificheDaProcessare});
                setDataModifica(res.dataModifica);
            }).catch((err:any)=>{
                if(err.response.status === 401){
                    navigate('/error');
                }else if(err.response.status === 419){
                    navigate('/error');
                } 
            });
    };

  
    useEffect(()=>{
        if(statusApp.userClickOn === 'GRID' && infoModuloCommessa.nonce !== ''){
            handleGetDettaglioModuloCommessa();
          
            setInfoModuloCommessa((prev:any)=>{

               
                return {...prev,...{userClickOn:'',statusPageInserimentoCommessa:'immutable'}};
            });
        }
      
    },[infoModuloCommessa.nonce]);
   

    useEffect(()=>{
        if(token === undefined){
            window.location.href = redirect;
        }
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
            const arrBoolean = singleObj?.numeroNotificheNazionali <= 0 &&  singleObj?.numeroNotificheInternazionali <= 0;
            return arrBoolean;
        });
        const status = check.every(v => v === true);
        setDisableContinua(status);

    },[datiCommessa]);


    const hendlePostModuloCommessa = async () =>{

        await insertDatiModuloCommessa(datiCommessa, token, infoModuloCommessa.nonce)
            .then(res =>{
                const statusApp = localStorage.getItem('statusApplication')||'{}';
                const parseStatusApp = JSON.parse(statusApp);
            
              
                if(infoModuloCommessa.inserisciModificaCommessa === 'MODIFY'){
                    // navigate('/4');
                    console.log({infoModuloCommessa});
                    setInfoModuloCommessa((prev:any)=>({
                        ...prev,
                        ...{
                            action:'SHOW_MODULO_COMMESSA',
                            statusPageInserimentoCommessa:'immutable',
                            statusPageDatiFatturazione:'immutable',
                        }}));
                  
                    console.log(parseStatusApp);
                    localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp, ...{
                        action:'SHOW_MODULO_COMMESSA',
                        statusPageInserimentoCommessa:'immutable',
                        statusPageDatiFatturazione:'immutable',
                    }}));
                    // aggiunta ora attenzione>
                    setTotaliModuloCommessa(res.data.totale);
                }else{
                    setTotaliModuloCommessa(res.data.totale);

                    console.log({res},'POST MODULO');
                    setInfoModuloCommessa((prev:any)=>({
                        ...prev,
                        ...{action:'HIDE_MODULO_COMMESSA',
                            statusPageInserimentoCommessa:'immutable',
                            statusPageDatiFatturazione:'mutable',
                            mese:res.data.mese,
                            anno:res.data.anno
                        }}));

                    localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                        ...{action:'HIDE_MODULO_COMMESSA',
                            statusPageInserimentoCommessa:'immutable',
                            statusPageDatiFatturazione:'mutable',
                            mese:res.data.mese,
                            anno:res.data.anno
                        }}));
                }
               
               
            } )
            .catch(err => {
                if(err.response.status === 401){
                    navigate('/error');
                } 
            });
    };
   

    const hendleOnButtonModificaModuloCommessa = () => {
        setInfoModuloCommessa((prev:any)=>({...prev,...{statusPageInserimentoCommessa:'mutable'}}));
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
    const cssPathModuloComm = infoModuloCommessa.statusPageInserimentoCommessa === 'immutable' ? 'bold' : 'normal';
    const cssPathAggModComm = infoModuloCommessa.statusPageInserimentoCommessa === 'mutable' ? 'bold' : 'normal';

    let actionTitle; 
    if(infoModuloCommessa.inserisciModificaCommessa === 'INSERT'){
        actionTitle =  <Typography variant="h4"> Aggiungi modulo commessa</Typography>;
    }else if(infoModuloCommessa.inserisciModificaCommessa  === 'MODIFY' && infoModuloCommessa.statusPageInserimentoCommessa === 'immutable' ){
        actionTitle =  <Typography variant="h4">{month[statusApp.mese - 1]}</Typography>;
    }else if(infoModuloCommessa.inserisciModificaCommessa  === 'MODIFY' && infoModuloCommessa.statusPageInserimentoCommessa === 'mutable'  ){
        actionTitle =  <Typography variant="h4"> Modifica modulo commessa</Typography>;
    }
    console.log({infoModuloCommessa});

   
    let indexStepper = 0;
    if(infoModuloCommessa.inserisciModificaCommessa === 'INSERT'){
        indexStepper = 1;
    }else if(infoModuloCommessa.action === 'HIDE_MODULO_COMMESSA' && infoModuloCommessa.inserisciModificaCommessa === 'MODIFY'){
        indexStepper = 2;
    }

    return (
        <InserimentoModuloCommessaContext.Provider
            value={{
                setDatiCommessa,
                datiCommessa,
                setDisableContinua,
                totaliModuloCommessa,
                setTotale,
                totale,
                infoModuloCommessa,
                setInfoModuloCommessa
            }}>
            <BasicModal setOpen={setOpen} open={open}></BasicModal>
            {/*Hidden di modulo commessa sul click contina , save del modulo commessa cosi da mostrare dati fatturazione,
            il componente visualizzato è AreaPersonaleUtenteEnte  */}
           
            <div className="marginTop24 ms-5 me-5">
                <div className='d-flex'>
                 
                    <ButtonNaked
                        color="primary"
                        onFocusVisible={() => { console.log('onFocus'); }}
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        onClick={() =>{
                            if(infoModuloCommessa.statusPageInserimentoCommessa === 'immutable'){
                                navigate('/4');
                            }else{
                                setInfoModuloCommessa((prev:any)=>({...prev,...{statusPageInserimentoCommessa:'immutable'}}));
                            }
                            
                        } }
                      
                    >
                        Indietro
    
                    </ButtonNaked>
                    
                    
                    
                    <Typography sx={{ fontWeight:cssPathModuloComm, marginLeft:'20px'}} variant="caption">

                        
                       
                        <ViewModuleIcon sx={{paddingBottom:'3px'}}  fontSize='small'></ViewModuleIcon>
                         Modulo commessa 
                        
                      
                    </Typography>
                    {
                        statusApp.inserisciModificaCommessa === 'INSERT' ? 
                            <Typography sx={{fontWeight:cssPathAggModComm}} variant="caption">/ Aggiungi modulo commessa</Typography> :
                            <Typography sx={{fontWeight:cssPathAggModComm}} variant="caption">/ Modifica modulo commessa</Typography>
                    }
                    
                    
                    
                   
                </div>
                {(infoModuloCommessa.inserisciModificaCommessa === 'INSERT' &&  infoModuloCommessa.modify === true) ||
                (infoModuloCommessa.action === 'HIDE_MODULO_COMMESSA' && 
                infoModuloCommessa.inserisciModificaCommessa === 'MODIFY' && 
                infoModuloCommessa.modify === true)
                    ? 
                    <div className="marginTop24">
                        <HorizontalLinearStepper indexStepper={indexStepper}></HorizontalLinearStepper>
                    </div> :null
                }
               
               
                <div className="marginTop24 marginTopBottom24">
                    
                
                    {actionTitle}

                    {infoModuloCommessa.statusPageInserimentoCommessa === 'immutable' && infoModuloCommessa.action !== 'HIDE_MODULO_COMMESSA' && infoModuloCommessa.ruolo !== 'R' ?
                       
                        <div className="d-flex justify-content-end ">
                            <Button variant="contained" size="small" onClick={()=> hendleOnButtonModificaModuloCommessa()} >Modifica</Button>
                        </div> :  null
                        
                    }
                    
                    
                    
                </div>
               
                {infoModuloCommessa.action !== "HIDE_MODULO_COMMESSA" ?
                    <div>
                        <div className="bg-white mt-3 pt-3">
                            <PrimoContainerInsCom setInfoModuloCommessa={setInfoModuloCommessa} />
                            <SecondoContainerInsCom  />
       
                        </div>
                        <div className='bg-white'>
                            <TerzoContainerInsCom valueTotali={totaliModuloCommessa} dataModifica={dataMod} infoModuloCommessa={infoModuloCommessa}/>
                        </div>
                 
                        {
                            infoModuloCommessa.statusPageInserimentoCommessa === 'immutable' ? null :
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
                                        onClick={()=>{ 
                                            /*
                                            setInfoModuloCommessa((prev:any)=>({
                                                ...prev,
                                                ...{action:'HIDE_MODULO_COMMESSA',
                                                    statusPageDatiFatturazione:'mutable'}}));
                                                    */
                                            hendlePostModuloCommessa();
                                        }}
                                                    
                                    >Continua</Button>
                   
                                </div> 
                        }
                       
                    </div> 
                    : null}
            </div> 
            {infoModuloCommessa.statusPageInserimentoCommessa === 'immutable' && infoModuloCommessa.action !== "HIDE_MODULO_COMMESSA"?
                <div className="d-flex justify-content-center marginTop24">
                    <Button onClick={()=>navigate('/pdf')} variant="contained">Vedi anteprima</Button>
                </div> : null
            }
          
           
            {/* Nascondo il dettaglio fatturazione fino al click continua */}
            {infoModuloCommessa.action === 'HIDE_MODULO_COMMESSA' ?
                <AreaPersonaleUtenteEnte 
                    infoModuloCommessa={infoModuloCommessa}
                    setInfoModuloCommessa={setInfoModuloCommessa}></AreaPersonaleUtenteEnte>
                : null
            }
            
        </InserimentoModuloCommessaContext.Provider>
    );
};

export default ModuloCommessaInserimentoUtEn30;