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
<<<<<<< HEAD
// import HorizontalLinearStepper from '../components/stepper';
import {insertDatiModuloCommessa, getDettaglioModuloCommessa} from '../api/api';
import {url, menageError} from '../api/api';
=======
import {insertDatiModuloCommessa, getDettaglioModuloCommessa, getModuloCommessaPagoPa, modifyDatiModuloCommessaPagoPa, manageError} from '../api/api';
>>>>>>> issues/237
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


const ModuloCommessaInserimentoUtEn30 : React.FC<ModuloCommessaInserimentoProps> = ({mainState, setMainState}) => {



    
    const month = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre",'Gennaio'];

    const navigate = useNavigate();

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const state = localStorage.getItem('statusApplication') || '{}';
    const statusApp =  JSON.parse(state);
   
    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);
    

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
    const [buttonModifica, setButtonMofica] = useState(false);
    // visualizza modulo cmmessa from grid 

    const handleGetDettaglioModuloCommessa = async () =>{

        await getDettaglioModuloCommessa(token,statusApp.anno,statusApp.mese, mainState.nonce)
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
                setButtonMofica(res.modifica);
            }).catch((err:any)=>{
                manageError(err,navigate);
            });
    };

    const handleGetDettaglioModuloCommessaPagoPa = async () => {
        await getModuloCommessaPagoPa(token, mainState.nonce,profilo.idEnte, profilo.prodotto, profilo.idTipoContratto, statusApp.mese, statusApp.anno )
            .then((response:any)=>{
                const res = response.data;
                setDatiCommessa({moduliCommessa:res.moduliCommessa});
                setTotaliModuloCommessa(res.totale);
                const objAboutTotale = res.totaleModuloCommessaNotifica;
                setTotale({totaleNazionale:objAboutTotale.totaleNumeroNotificheNazionali
                    , totaleInternazionale:objAboutTotale.totaleNumeroNotificheInternazionali
                    , totaleNotifiche:objAboutTotale.totaleNumeroNotificheDaProcessare});
                setDataModifica(res.dataModifica);
                setButtonMofica(res.modifica);
            }).catch((err:any)=>{
             
                manageError(err,navigate);
            });
    };
  
    useEffect(()=>{
      
        if(statusApp.userClickOn === 'GRID' && mainState.nonce !== ''){

            // SELFCARE
            if(profilo.auth !== 'PAGOPA'){
                handleGetDettaglioModuloCommessa();
                //PAGOPA
            }else if(profilo.auth === 'PAGOPA'){
                handleGetDettaglioModuloCommessaPagoPa();
            }

            setMainState((prev:any)=>{
                return {...prev,...{userClickOn:'',statusPageInserimentoCommessa:'immutable'}};
            });
        }
      
      
    },[mainState.nonce]);
   

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

    // funzione utilizzata con la response sul click modifica/insert modulo commessa , sia utente selcare che pagopa
    const toDoOnPostModifyCommessa = (res:any) =>{
        if(mainState.inserisciModificaCommessa === 'MODIFY'){
                 
            setMainState((prev:any)=>({
                ...prev,
                ...{
                    action:'SHOW_MODULO_COMMESSA',
                    statusPageInserimentoCommessa:'immutable',
                    statusPageDatiFatturazione:'immutable',
                }}));
          
           
            localStorage.setItem('statusApplication',JSON.stringify({...statusApp, ...{
                action:'SHOW_MODULO_COMMESSA',
                statusPageInserimentoCommessa:'immutable',
                statusPageDatiFatturazione:'immutable',
            }}));
            // aggiunta ora attenzione>
            setTotaliModuloCommessa(res.data.totale);
        }else{
            setTotaliModuloCommessa(res.data.totale);

            setMainState((prev:any)=>({
                ...prev,
                ...{action:'HIDE_MODULO_COMMESSA',
                    statusPageInserimentoCommessa:'immutable',
                    statusPageDatiFatturazione:'mutable',
                    mese:res.data.mese,
                    anno:res.data.anno
                }}));

            localStorage.setItem('statusApplication',JSON.stringify({...statusApp,
                ...{action:'HIDE_MODULO_COMMESSA',
                    statusPageInserimentoCommessa:'immutable',
                    statusPageDatiFatturazione:'mutable',
                    mese:res.data.mese,
                    anno:res.data.anno
                }}));
        }  
    };


    const hendlePostModuloCommessa = async () =>{

        await insertDatiModuloCommessa(datiCommessa, token, mainState.nonce)
            .then(res =>{
                toDoOnPostModifyCommessa(res);
                 
            } )
            .catch(err => {
                manageError(err, navigate); 
            });
    };


    const hendleModifyDatiModuloCommessaPagoPa = async() =>{
        // probabilmente questo verra modificato con l'agginta del flag fatturabile
        const datiCommessaPlusIdTpcProIdE = {
            ...datiCommessa,
            ...{
                prodotto:profilo.prodotto,
                idTipoContratto:profilo.idTipoContratto,
                idEnte:profilo.idEnte,
                fatturabile:true }};

        await modifyDatiModuloCommessaPagoPa(datiCommessaPlusIdTpcProIdE, token, mainState.nonce)
            .then((res)=>{
                toDoOnPostModifyCommessa(res);
            }).catch(err => {
                manageError(err, navigate); 
            });
    };


    const OnButtonContinua = () =>{
        if(profilo.auth === 'PAGOPA'){
            hendleModifyDatiModuloCommessaPagoPa();
        }else{
            hendlePostModuloCommessa();
        }
    };
   

    const hendleOnButtonModificaModuloCommessa = () => {
        setMainState((prev:any)=>({...prev,...{statusPageInserimentoCommessa:'mutable'}}));
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
    const cssPathModuloComm = mainState.statusPageInserimentoCommessa === 'immutable' ? 'bold' : 'normal';
    const cssPathAggModComm = mainState.statusPageInserimentoCommessa === 'mutable' ? 'bold' : 'normal';

    let actionTitle; 
    if(mainState.inserisciModificaCommessa === 'INSERT'){
        actionTitle =  <Typography variant="h4"> Aggiungi modulo commessa</Typography>;
    }else if(mainState.inserisciModificaCommessa  === 'MODIFY' && mainState.statusPageInserimentoCommessa === 'immutable' ){
        actionTitle =  <Typography variant="h4">{month[statusApp.mese - 1]}</Typography>;
    }else if(mainState.inserisciModificaCommessa  === 'MODIFY' && mainState.statusPageInserimentoCommessa === 'mutable'  ){
        actionTitle =  <Typography variant="h4"> Modifica modulo commessa</Typography>;
    }
   

   
    let indexStepper = 0;
    if(mainState.inserisciModificaCommessa === 'INSERT'){
        indexStepper = 1;
    }else if(mainState.action === 'HIDE_MODULO_COMMESSA' && mainState.inserisciModificaCommessa === 'MODIFY'){
        indexStepper = 2;
    }

    const hiddenShowHorizontalStepper = (
        mainState.inserisciModificaCommessa === 'INSERT' &&
        mainState.modify === true) ||
        (mainState.action === 'HIDE_MODULO_COMMESSA' && 
         mainState.inserisciModificaCommessa === 'MODIFY' && 
         mainState.modify === true);

    const hideShowButtonModifica =  mainState.statusPageInserimentoCommessa === 'immutable' &&
                                         mainState.action !== 'HIDE_MODULO_COMMESSA' &&
                                         mainState.ruolo !== 'R' && 
                                         buttonModifica;

    return (
        <InserimentoModuloCommessaContext.Provider
            value={{
                setDatiCommessa,
                datiCommessa,
                setDisableContinua,
                totaliModuloCommessa,
                setTotale,
                totale,
                mainState,
                setMainState
            }}>
            <BasicModal setOpen={setOpen} open={open}></BasicModal>
            {/*Hide   modulo commessa sul click contina , save del modulo commessa cosi da mostrare dati fatturazione,
            il componente visualizzato è AreaPersonaleUtenteEnte  */}
           
            <div className="marginTop24 ms-5 me-5">
                <div className='d-flex'>
                 
                    <ButtonNaked
                        color="primary"
                        onFocusVisible={() => { console.log('onFocus'); }}
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        onClick={() =>{
                            if(mainState.statusPageInserimentoCommessa === 'immutable' && profilo.auth !== 'PAGOPA'){
                                navigate('/4');
                            }else if(mainState.statusPageInserimentoCommessa === 'immutable' && profilo.auth === 'PAGOPA'){
                                navigate('/pagopalistamodulicommessa');
                            }else{
                                setMainState((prev:any)=>({...prev,...{statusPageInserimentoCommessa:'immutable'}}));
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
                { hiddenShowHorizontalStepper
                    ? 
                    <div className="marginTop24">
                        <HorizontalLinearStepper indexStepper={indexStepper}></HorizontalLinearStepper>
                    </div> :null
                }
            
                <div className="marginTop24 marginTopBottom24">
                    {actionTitle}

<<<<<<< HEAD
                    {infoModuloCommessa.statusPageInserimentoCommessa === 'immutable' && infoModuloCommessa.action !== 'HIDE_MODULO_COMMESSA' && infoModuloCommessa.ruolo !== 'R' && buttonModifica ?
=======
                    {hideShowButtonModifica ?
>>>>>>> issues/237
                       
                        <div className="d-flex justify-content-end ">
                            <Button variant="contained" size="small" onClick={()=> hendleOnButtonModificaModuloCommessa()} >Modifica</Button>
                        </div> :  null
                        
                    } 
                </div>
               
                {mainState.action !== "HIDE_MODULO_COMMESSA" ?
                    <div>
                        <div className="bg-white mt-3 pt-3">
                            <PrimoContainerInsCom setMainState={setMainState} />
                            <SecondoContainerInsCom  />
       
                        </div>
                        <div className='bg-white'>
                            <TerzoContainerInsCom valueTotali={totaliModuloCommessa} dataModifica={dataMod} mainState={mainState}/>
                        </div>
                 
                        {
                            mainState.statusPageInserimentoCommessa === 'immutable' ? null :
                                <div className="d-flex justify-content-between mt-5 mb-5 ">
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
                                            OnButtonContinua();
                                        }}
                                                    
                                    >Continua</Button>
                   
                                </div> 
                        }
                       
                    </div> 
                    : null}
            </div> 
            {mainState.statusPageInserimentoCommessa === 'immutable' && mainState.action !== "HIDE_MODULO_COMMESSA"?
                <div className="d-flex justify-content-center marginTop24 mb-5">
                    <Button onClick={()=>navigate('/pdf')} variant="contained">Vedi anteprima</Button>
                </div> : null
            }
          
           
            {/* Nascondo il dettaglio fatturazione fino al click continua */}
            {mainState.action === 'HIDE_MODULO_COMMESSA' ?
                <AreaPersonaleUtenteEnte 
                    mainState={mainState}
                    setMainState={setMainState}></AreaPersonaleUtenteEnte>
                : null
            }
            
        </InserimentoModuloCommessaContext.Provider>
    );
};

export default ModuloCommessaInserimentoUtEn30;