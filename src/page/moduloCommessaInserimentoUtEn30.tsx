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
import {insertDatiModuloCommessa, getDatiModuloCommessa } from '../api/api';
import {useAxios, url, menageError} from '../api/api';
import AreaPersonaleUtenteEnte from '../page/areaPersonaleUtenteEnte';
import HorizontalLinearStepper from '../components/stepper';
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

  

    
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const navigate = useNavigate();



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
            idCategoriaSpedizione: 0,
            totaleValoreCategoriaSpedizione: 0
        },
        {
            idCategoriaSpedizione: 0,
            totaleValoreCategoriaSpedizione: 0
        }
    ]);

    const [totale, setTotale] = useState<TotaleNazionaleInternazionale>({totaleNazionale:0, totaleInternazionale:0, totaleNotifiche:0});
   
    // visualizza modulo cmmessa from grid 

    const { ...getDatiCommessaOnClickFromGrid } = useAxios({});
   
    const handleGetDettaglioModuloCommessa = async() => {
        getDatiCommessaOnClickFromGrid.fetchData({
            method: 'GET',
            url: `${url}/api/modulocommessa/dettaglio/${infoModuloCommessa.anno}/${infoModuloCommessa.mese}`,
            headers: {
                Authorization: 'Bearer ' + token
            }
        });

        
    };

 
    /*
    const getDatiCommessa = async () =>{
        await getDatiModuloCommessa(token)
            .then(res =>{
           
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
                    navigate('/error');
                } 
            });
    };
*/
    useEffect(()=>{
        if(infoModuloCommessa.userClickOn === undefined){
            // handleGetDettaglioModuloCommessa();
       
        }
     
    },[]);
   



    useEffect(()=>{
       
        if(infoModuloCommessa.userClickOn === 'GRID'){
            handleGetDettaglioModuloCommessa();
            setInfoModuloCommessa((prev:any)=>({...prev,...{userClickOn:'',statusPageInserimentoCommessa:'immutable'}}));
            console.log('franco');
        }
        
        // setInfoModuloCommessa((prev:any)=>({...prev,...{statusPageInserimentoCommessa:'immutable'}}));
      
       

        if(getDatiCommessaOnClickFromGrid.response){
            const res = getDatiCommessaOnClickFromGrid.response;
            console.log(res,'cicici');
         
            setDatiCommessa({moduliCommessa:res.moduliCommessa});
            setTotaliModuloCommessa(res.totale);
            const objAboutTotale = res.totaleModuloCommessaNotifica;
            setTotale({totaleNazionale:objAboutTotale.totaleNumeroNotificheNazionali
                , totaleInternazionale:objAboutTotale.totaleNumeroNotificheInternazionali
                , totaleNotifiche:objAboutTotale.totaleNumeroNotificheDaProcessare});
           
        }
     
      
        
        console.log(getDatiCommessaOnClickFromGrid.response, 'RESPONSE');
        menageError(getDatiCommessaOnClickFromGrid, navigate);
    },[getDatiCommessaOnClickFromGrid.response]);

   
   

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
                if(infoModuloCommessa.inserisciModificaCommessa === 'MODIFY'){
                    navigate('/4');
                    setInfoModuloCommessa((prev:any)=>({
                        ...prev,
                        ...{
                            action:'SHOW_MODULO_COMMESSA',
                            statusPageInserimentoCommessa:'immutable',
                            statusPageDatiFatturazione:'immutable',
                        }}));
                }else{
                    setTotaliModuloCommessa(res.data.totale);
                    setInfoModuloCommessa((prev:any)=>({...prev,...{action:'HIDE_MODULO_COMMESSA', statusPageInserimentoCommessa:'immutable'}}));
                }
               
            } )
            .catch(err => {
                if(err.response.status === 401){
                    navigate('/error');
                } 
            });
    };
   

    const hendleModificaModuloCommessa = () => {
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
        actionTitle =  <Typography variant="h4"> Mese commessa</Typography>;
    }else if(infoModuloCommessa.inserisciModificaCommessa  === 'MODIFY' && infoModuloCommessa.statusPageInserimentoCommessa === 'mutable'  ){
        actionTitle =  <Typography variant="h4"> Modifica modulo commessa</Typography>;
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
                        {infoModuloCommessa.statusPageInserimentoCommessa === 'immutable' ? 'Esci': 'Indietro'}
    
                    </ButtonNaked>
                    
                    
                    
                    <Typography sx={{ fontWeight:cssPathModuloComm, marginLeft:'20px'}} variant="caption">

                        
                       
                        <ViewModuleIcon sx={{paddingBottom:'3px'}}  fontSize='small'></ViewModuleIcon>
                         Modulo commessa 
                        
                      
                    </Typography>
                    <Typography sx={{fontWeight:cssPathAggModComm}} variant="caption">/ Modifica modulo commessa</Typography>
                    
                    
                   
                </div>
                <div className="marginTop24">
                    <HorizontalLinearStepper></HorizontalLinearStepper>
                </div>
               
                <div className="marginTop24 marginTopBottom24">
                    
                
                    {actionTitle}

                    {(infoModuloCommessa.statusPageInserimentoCommessa === 'mutable'&& infoModuloCommessa.modifica === true)?
                        null :
                        <div className="d-flex justify-content-end ">
                            <Button variant="contained" size="small" onClick={()=> hendleModificaModuloCommessa()} >Modifica</Button>
                        </div>
                        
                    }
                    
                    
                    
                </div>
                {/*
                    <div className='marginTop24 marginBottom24'>
                        <HorizontalLinearStepper></HorizontalLinearStepper>
                    </div>
                    */}
               
                {infoModuloCommessa.action !== "HIDE_MODULO_COMMESSA" ?
                    <div>
                        <div className="bg-white mt-3 pt-3">
                            <PrimoContainerInsCom />
                            <SecondoContainerInsCom  />
       
                        </div>
                        <div className='bg-white'>
                            <TerzoContainerInsCom valueTotali={totaliModuloCommessa}/>
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
                                            setInfoModuloCommessa((prev:any)=>({
                                                ...prev,
                                                ...{action:'HIDE_MODULO_COMMESSA',
                                                    statusPageDatiFatturazione:'mutable'}}));
                                            hendlePostModuloCommessa();
                                        }}
                                                    
                                    >Continua</Button>
                   
                                </div> 
                        }
                    </div> 
                    : null}
            </div> 
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