import { Typography } from "@mui/material";
import { } from '@mui/material';
import React , { useState, useEffect} from 'react';
import { TextField,Box, FormControl, InputLabel,Select, MenuItem, Button} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getTipologiaProfilo, manageError } from "../api/api";
import { ReportDettaglioProps, NotificheList, FlagContestazione, Contestazione, ElementMultiSelect  } from "../types/typeReportDettaglio";
import { useNavigate } from "react-router";
import { BodyListaNotifiche } from "../types/typesGeneral";
import ModalContestazione from '../components/reportDettaglio/modalContestazione';
import ModalInfo from "../components/reusableComponents/modals/modalInfo";
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";
import DownloadIcon from '@mui/icons-material/Download';
import MultiSelectStatoContestazione from "../components/reportDettaglio/multiSelectGroupedBy";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import ModalScadenziario from "../components/reportDettaglio/modalScadenziario";
import { downloadNotifche, getContestazione, listaNotifiche } from "../api/apiSelfcare/notificheSE/api";
import { downloadNotifchePagoPa, getContestazionePagoPa, listaNotifichePagoPa } from "../api/apiPagoPa/notificheSE/api";
import { getTipologiaProdotto } from "../api/apiSelfcare/moduloCommessaSE/api";
import GridCustom from "../components/reusableComponents/gridCustom";
import ModalRedirect from "../components/commessaInserimento/madalRedirect";

const ReportDettaglio : React.FC<ReportDettaglioProps> = ({mainState}) => {

    const navigate = useNavigate();
    
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    const state = localStorage.getItem('statusApplication') || '{}';
    const statusApp =  JSON.parse(state);
    
    // prendo gli ultimi 2 anni dinamicamente
    const currentYear = (new Date()).getFullYear();
    const getCurrentFinancialYear = () => {
        const thisYear = (new Date()).getFullYear();
        const yearArray = [0, 1].map((count) => `${thisYear - count}`);
        return yearArray;
    };
    
    //creo un array di oggetti con tutti i mesi 
    const currentMonth = (new Date()).getMonth() + 1;
    const currString = currentMonth;
    const mesi = [
        {1:'Gennaio'},{2:'Febbraio'},{3:'Marzo'},{4:'Aprile'},{5:'Maggio'},{6:'Giugno'},
        {7:'Luglio'},{8:'Agosto'},{9:'Settembre'},{10:'Ottobre'},{11:'Novembre'},{12:'Dicembre'}];

    const mesiWithZero = ['01','02','03','04','05','06','07','08','09','10','11','12'];
        

    const mesiGrid = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
        
    const tipoNotifica = [
        {"Digitali": 1},
        {"Analogico AR Nazionali": 2}, 
        {"Analogico AR Internazionali": 3},
        {"Analogico RS Nazionali": 4}, 
        {"Analogico RS Internazionali": 5}, 
        {"Analogico 890":6}];
            
    const [prodotti, setProdotti] = useState([{nome:''}]);
    const [profili, setProfili] = useState([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [notificheList, setNotificheList] = useState<NotificheList[]>([]);
            
    const [bodyGetLista, setBodyGetLista] = useState<BodyListaNotifiche>({
        profilo:'',
        prodotto:'',
        anno:currentYear,
        mese:currString, 
        tipoNotifica:null,
        statoContestazione:[],
        cap:null,
        iun:null,
        idEnti:[],
        recipientId:null
    });
            
    const [contestazioneSelected, setContestazioneSelected] = useState<Contestazione>({ 
        risposta:true,
        modifica: true,
        chiusura: true,
        contestazione: {
            id: 0,
            tipoContestazione: 0,
            idNotifica: '',
            noteEnte: '',
            noteSend: null,
            noteRecapitista: null,
            noteConsolidatore: null,
            rispostaEnte: '',
            statoContestazione: 0,
            onere: '',
            dataInserimentoEnte: '',
            dataModificaEnte: '',
            dataInserimentoSend: '',
            dataModificaSend: '',
            dataInserimentoRecapitista: '',
            dataModificaRecapitista: '',
            dataInserimentoConsolidatore: '',
            dataModificaConsolidatore: '',
            dataChiusura: '',
            anno: 0,
            mese: 0
        }
    });
    
    // Modifico l'oggetto notifica per fare il binding dei dati nel componente GRIDCUSTOM
    const notificheListWithOnere = notificheList.map((notifica) =>{
        
        let newOnere = '';
        if(notifica.onere === 'SEND_PA'){
            newOnere = 'ENTE';
        }else if( notifica.onere === 'PA_SEND' ){
            newOnere = 'SEND';
        }else if(notifica.onere === 'SEND_SEND'){
            newOnere = 'SEND';
        }else if(notifica.onere === 'SEND_RCP'){
            newOnere = 'RECAPITISTA';
        }else if(notifica.onere === 'SEND_CON'){
            newOnere = 'CONSOLIDATORE';
        }
     
        return {idNotifica:notifica.idNotifica,
            contestazione:notifica.contestazione,
            onere:newOnere,
            recipientId:notifica.recipientId,
            anno:notifica.anno,
            mese:mesiGrid[Number(notifica.mese) - 1 ],
            ragioneSociale:notifica.ragioneSociale,
            tipoNotifica:notifica.tipoNotifica,
            iun:notifica.iun,
            dataInvio:new Date(notifica.dataInvio).toISOString().split('T')[0],
            statoEstero:notifica.statoEstero,
            cap:notifica.cap,
            costEuroInCentesimi:(Number(notifica.costEuroInCentesimi) / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" })
        };
    });
  
    // visualizzare il tasto annulla filtri      
    useEffect(()=>{
        if( 
            bodyGetLista.profilo !== '' ||
                    bodyGetLista.prodotto !== '' ||
                    bodyGetLista.tipoNotifica !== null ||
                    bodyGetLista.statoContestazione.length !== 0 ||
                    bodyGetLista.cap !== null ||
                    bodyGetLista.idEnti?.length !== 0 ||
                    bodyGetLista.mese !== currString ||
                    bodyGetLista.anno !== currentYear||
                    bodyGetLista.recipientId !== null){
            setStatusAnnulla('show');
        }else{           
            setStatusAnnulla('hidden');
        }
    },[bodyGetLista]);

    // action sul tasto annulla filtri
    const onAnnullaFiltri = async () =>{

        const newBody = {
            profilo:'',
            prodotto:'',
            anno:currentYear,
            mese:currString, 
            tipoNotifica:null,
            statoContestazione:[],
            cap:null,
            iun:null,
            idEnti:[],
            recipientId:null

        };

        setStatusAnnulla('hidden');
        setValueFgContestazione([]);
        setDataSelect([]);
        setBodyGetLista(newBody);

        if(profilo.auth === 'SELFCARE'){
            const {idEnti, ...body} = newBody;
            await listaNotifiche(token,mainState.nonce,1,10, body)
                .then((res)=>{
                    setNotificheList(res.data.notifiche);
                    setTotalNotifiche(res.data.count);
                        
                }).catch((error)=>{
                    manageError(error, navigate);
                });
        }else if(profilo.auth === 'PAGOPA'){
        
            await listaNotifichePagoPa(token,mainState.nonce,1,10, newBody)
                .then((res)=>{
                    setNotificheList(res.data.notifiche);
                    setTotalNotifiche(res.data.count);
                        
                }).catch((error)=>{
                    manageError(error, navigate);
                });
        }
      
    };     
        // disable tutti i button fino a che il servizio lista notifiche non mi dia un 200K , questo perchè c'è un numero di notifiche elevato
        // con delle tempistiche lunghissime        
    const [getNotificheWorking, setGetNotificheWorking] = useState(false);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalNotifiche, setTotalNotifiche]  = useState(0);
    const realPageNumber = page + 1;
         
    const getlistaNotifiche = async (nPage:number, nRow:number) => {
        // elimino idEnti dal paylod della get notifiche lato selfcare
        const {idEnti, ...newBody} = bodyGetLista;
        // disable button filtra e annulla filtri nell'attesa dei dati
        setGetNotificheWorking(true);
        await listaNotifiche(token,mainState.nonce,nPage, nRow, newBody)
            .then((res)=>{
                setNotificheList(res.data.notifiche);
                setTotalNotifiche(res.data.count);
                // abilita button filtra e annulla filtri all'arrivo dei dati
                setGetNotificheWorking(false);
            }).catch((error)=>{
                // abilita button filtra e annulla filtri all'arrivo dei dati
                setGetNotificheWorking(false);
                manageError(error, navigate);
            });
                    
    };

    const getlistaNotifichePagoPa = async (nPage:number, nRow:number) => {
        // disable button filtra e annulla filtri nell'attesa dei dati
        setGetNotificheWorking(true);
        await listaNotifichePagoPa(token,mainState.nonce,nPage, nRow, bodyGetLista)
            .then((res)=>{
                // abilita button filtra e annulla filtri all'arrivo dei dati
                setGetNotificheWorking(false);
                setNotificheList(res.data.notifiche);
                setTotalNotifiche(res.data.count); 
            }).catch((error)=>{
                // abilita button filtra e annulla filtri all'arrivo dei dati
                setGetNotificheWorking(false);
                manageError(error, navigate);
            });
                    
    };
            
    useEffect(() => {
      
        if(mainState.nonce !== undefined){
            getProdotti();
            getProfili();

            if(profilo.auth === 'SELFCARE'){
                getlistaNotifiche( realPageNumber, rowsPerPage); 
            }else if(profilo.auth === 'PAGOPA'){
                getlistaNotifichePagoPa( realPageNumber, rowsPerPage);
            }
        } 
    }, [mainState.nonce]);

    // logica sul button filtra
    const onButtonFiltra = () =>{
        setPage(0);
        setRowsPerPage(10);
        if(profilo.auth === 'SELFCARE'){
            getlistaNotifiche(1, 10);
        }else{
            getlistaNotifichePagoPa(1, 10);
        }  
    };
                
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        const realPage = newPage + 1;
        if(profilo.auth === 'SELFCARE'){
            getlistaNotifiche(realPage,rowsPerPage);
        }else if(profilo.auth === 'PAGOPA'){
            getlistaNotifichePagoPa(realPage,rowsPerPage);
        }
        setPage(newPage);
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
    
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        const realPage = page + 1;

        if(profilo.auth === 'SELFCARE'){
            getlistaNotifiche(realPage,parseInt(event.target.value, 10));
        }else if(profilo.auth === 'PAGOPA'){
            getlistaNotifichePagoPa(realPage,parseInt(event.target.value, 10));
        }                    
    };
                        
    const getProdotti = async() => {
        await getTipologiaProdotto(token, mainState.nonce )
            .then((res)=>{          
                setProdotti(res.data);
            })
            .catch(((err)=>{
                manageError(err,navigate);
            }));
    };
                                            
    const getProfili = async() => {
        await getTipologiaProfilo(token, mainState.nonce )
            .then((res)=>{              
                setProfili(res.data);
            })
            .catch(((err)=>{
                manageError(err,navigate);
            }));
    };
                
    const getContestazioneModal = async(idNotifica:string) =>{

        if(profilo.auth === 'SELFCARE'){
            await getContestazione(token, mainState.nonce , idNotifica )
                .then((res)=>{
                    //se i tempi di creazione di una contestazione sono scaduti show pop up info
                    if(res.data.modifica === false && res.data.chiusura === false && res.data.contestazione.statoContestazione === 1){
                        setOpenModalInfo(true);
                    }else{
                    // atrimenti show pop up creazione contestazione
                        setOpen(true); 
                        setContestazioneSelected(res.data);
                    }           
                })
                .catch(((err)=>{
                    manageError(err,navigate);
                }));
        }else{
            await getContestazionePagoPa(token, mainState.nonce , idNotifica ).then((res)=>{
                //se i tempi di creazione di una contestazione sono scaduti show pop up info
                if(res.data.modifica === false && res.data.chiusura === false && res.data.contestazione.statoContestazione === 1){
                    setOpenModalInfo(true);
                }else{
                    // atrimenti show pop up creazione contestazione
                    setOpen(true); 
                    setContestazioneSelected(res.data);
                }                 
            }).catch(((err)=>{
                manageError(err,navigate);
            }));
        }
    };

    const downloadNotificheOnDownloadButton = async () =>{
        if(profilo.auth === 'SELFCARE'){
            await downloadNotifche(token, mainState.nonce,bodyGetLista )
                .then((res)=>{
                    const link = document.createElement('a');
                    link.href = "data:text/plain;base64," + res.data.documento;
                    link.setAttribute('download',`Notifiche /${notificheListWithOnere[0].ragioneSociale}/${mesiWithZero[bodyGetLista.mese-1]} /${bodyGetLista.anno}.xlsx`); //or any other extension
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);           
                })
                .catch(((err)=>{
                    manageError(err,navigate);
                }));
        }else{
            await downloadNotifchePagoPa(token, mainState.nonce,bodyGetLista )
                .then((res)=>{
                    const blob = new Blob([res.data], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.setAttribute('hidden', '');
                    a.setAttribute('href', url);
                    a.setAttribute('download',`Notifiche /${mesiWithZero[bodyGetLista.mese-1]} /${bodyGetLista.anno}.csv`);
                    document.body.appendChild(a);
                    a.click();
                    setShowLoading(false);
                    document.body.removeChild(a); 
                })
                .catch(((err)=>{
                    manageError(err,navigate);
                    setShowLoading(false);
                }));
        }
    };

    // stato multiselect ragione sociale 
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [valueFgContestazione, setValueFgContestazione] = useState<FlagContestazione[]>([]);

    // modal             
    const [open, setOpen] = useState(false);
    const [openModalInfo, setOpenModalInfo] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [showModalScadenziario, setShowModalScadenziario ] = useState(false);   
    // visulizzazione del pop up redirect dati di fatturazione
    const [openModalRedirect, setOpenModalRedirect] = useState(false);

    useEffect(()=>{
        if(statusApp.datiFatturazione === false){
            setOpenModalRedirect(true);
        }
   
    },[]);
    return (
        <div className="mx-5">
            {/*title container start */}
            <div className="d-flex   marginTop24 ">
                <div className="col-9">
                    <Typography variant="h4">Report Dettaglio</Typography>
                </div>
                <div className="col-3 ">
                    <Box sx={{width:'80%', marginLeft:'20px', display:'flex', justifyContent:'end'}}  >
                        <Button onClick={()=> setShowModalScadenziario(true)} variant="contained">
                            <VisibilityIcon sx={{marginRight:'10px'}}></VisibilityIcon>
                    Scadenzario
                        </Button>
                    </Box>
                </div>
            </div>
            {/*title container end */}
            <div className="mt-5 mb-5 ">
                <div className="row">
                    <div className="col-3   ">
                        <Box sx={{width:'80%'}} >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel
                                    id="sea"
                                >
                            Anno
                                </InputLabel>
                                <Select
                                    id="sea"
                                    label='Seleziona Prodotto'
                                    labelId="search-by-label"
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        setBodyGetLista((prev)=> ({...prev, ...{anno:value}}));
                                    }}
                                    value={bodyGetLista.anno}
                                    disabled={status=== 'immutable' ? true : false}
                                >
                                    {getCurrentFinancialYear().map((el) => (
                                        <MenuItem
                                            key={Math.random()}
                                            value={el}
                                        >
                                            {el}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                    <div className="col-3  ">
                        <Box sx={{width:'80%', marginLeft:'20px'}}  >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel
                                    id="sea"
                                >
                                Mese
                                
                                </InputLabel>
                                <Select
                                    id="sea"
                                    label='Seleziona Prodotto'
                                    labelId="search-by-label"
                                    onChange={(e) =>{
                                        const value = Number(e.target.value);
                                        setBodyGetLista((prev)=> ({...prev, ...{mese:value}}));
                                    }}
                                    value={bodyGetLista.mese}
                                    disabled={status=== 'immutable' ? true : false}
                                >
                                    {mesi.map((el) => (
                                        <MenuItem
                                            key={Math.random()}
                                            value={Object.keys(el)[0].toString()}
                                        >
                                            {Object.values(el)[0]}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                    <div className="col-3  ">
                        <Box sx={{width:'80%', marginLeft:'20px'}} >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel
                                    id="sea"
                                >
                                    Seleziona Prodotto
                                </InputLabel>
                                <Select
                                    id="prodotto"
                                    label='Seleziona Prodotto'
                                    labelId="search-by-label"
                                    onChange={(e) => setBodyGetLista((prev)=> ({...prev, ...{prodotto:e.target.value}}))}
                                    value={bodyGetLista.prodotto}
                                    disabled={status=== 'immutable' ? true : false}
                                >
                                    {prodotti.map((el) => (
                                        <MenuItem
                                            key={Math.random()}
                                            value={el.nome}
                                        >
                                            {el.nome}
                                        </MenuItem>
                                        
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                    <div className="col-3 ">
                        <Box sx={{width:'80%',marginLeft:'20px'}} >
                            <TextField
                                fullWidth
                                label='IUN'
                                placeholder='IUN'
                                value={bodyGetLista.iun || ''}
                                onChange={(e) => setBodyGetLista((prev)=>{             
                                    if(e.target.value === ''){
                                        return {...prev, ...{iun:null}};
                                    }else{
                                        return {...prev, ...{iun:e.target.value}};
                                    }
                                } )}            
                            />
                        </Box>
                    </div>
                </div>                                         
                <div className="row mt-5" >           
                    <div className="col-3">
                        <Box sx={{width:'80%'}} >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel
                                    id="sea"
                                >
                                            Tipo Notifica     
                                </InputLabel>
                                <Select
                                    id="sea"
                                    label='Tipo Notifica'
                                    labelId="search-by-label"
                                    onChange={(e) =>{
                                        const value = Number(e.target.value);
                                        setBodyGetLista((prev)=> ({...prev, ...{tipoNotifica:value}}));
                                    }}
                                    value={bodyGetLista.tipoNotifica || ''}        
                                    disabled={status=== 'immutable' ? true : false}
                                >
                                    {tipoNotifica.map((el) => (     
                                        <MenuItem
                                            key={Math.random()}
                                            value={Object.values(el)[0].toString()}
                                        >
                                            {Object.keys(el)[0].toString()}
                                        </MenuItem>      
                                    ))}       
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                    <div className=" col-3 ">
                        <Box sx={{width:'80%', marginLeft:'20px'}} >
                            <MultiSelectStatoContestazione 
                                mainState={mainState}
                                setBodyGetLista={setBodyGetLista}
                                valueFgContestazione={valueFgContestazione}
                                setValueFgContestazione={setValueFgContestazione}></MultiSelectStatoContestazione>
                        </Box>
                    </div>
                    <div className="col-3 ">
                        <Box sx={{width:'80%', marginLeft:'20px'}} >
                            <TextField
                                fullWidth
                                label='CAP'
                                placeholder='CAP'
                                value={bodyGetLista.cap || ''}
                                onChange={(e) => setBodyGetLista((prev)=>{               
                                    if(e.target.value === ''){
                                        return {...prev, ...{cap:null}};
                                    }else{
                                        return {...prev, ...{cap:e.target.value}};
                                    }
                                } )}
                            />
                        </Box>
                    </div>
                    <div className="col-3 ">
                        <Box sx={{width:'80%',  marginLeft:'20px'}} >
                            <TextField
                                fullWidth
                                label='Recipient ID'
                                placeholder='Recipient ID'
                                value={bodyGetLista.recipientId || ''}
                                onChange={(e) => setBodyGetLista((prev)=>{                
                                    if(e.target.value === ''){
                                        return {...prev, ...{recipientId:null}};
                                    }else{
                                        return {...prev, ...{recipientId:e.target.value}};
                                    }
                                } )}                     
                            />
                        </Box>
                    </div>                         
                </div>
                <div className="row mt-5" >
                    {(profilo.auth === 'PAGOPA' || profilo.profilo === 'CND') &&
                    <div className="col-3">
                        <MultiselectCheckbox 
                            mainState={mainState} 
                            setBodyGetLista={setBodyGetLista}
                            setDataSelect={setDataSelect}
                            dataSelect={dataSelect}
                        ></MultiselectCheckbox>
                    </div>
                    }
                </div>
                <div className="">
                    <div className="d-flex justify-content-start mt-5">
                        <div className=" d-flex align-items-center justify-content-center h-100">
                            <div>
                                <Button 
                                    onClick={()=> onButtonFiltra()} 
                                    disabled={getNotificheWorking}
                                    variant="contained"> Filtra  
                                </Button>                
                                {statusAnnulla === 'hidden' ? null :
                                    <Button
                                        onClick={()=>{
                                            onAnnullaFiltri();   
                                        } }
                                        disabled={getNotificheWorking}
                                        sx={{marginLeft:'24px'}} >
                                                    Annulla filtri
                                    </Button>
                                }
                            </div>               
                        </div>
                    </div>
                </div>
            </div>
            { notificheList.length > 0  &&
            <div className="marginTop24" style={{display:'flex', justifyContent:'end'}}>
                <div>
                    <Button
                        disabled={getNotificheWorking}
                        onClick={()=> {
                            downloadNotificheOnDownloadButton(); 
                            if(profilo.auth === 'PAGOPA'){
                                setShowLoading(true);
                            }
                        }}  >
                                  Download Risultati 
                        <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                    </Button>
                </div>           
            </div>
            }            
            <div className="mb-5">
                <GridCustom
                    nameParameterApi='idNotifica'
                    elements={notificheListWithOnere}
                    changePage={handleChangePage}
                    changeRow={handleChangeRowsPerPage} 
                    total={totalNotifiche}
                    page={page}
                    rows={rowsPerPage}
                    headerNames={['Contestazione', 'Onere', 'Recipient ID','Anno', 'Mese','Ragione Sociale', 'Tipo Notifica','IUN', 'Data invio','Stato estero', 'CAP', 'Costo', '']}
                    apiGet={getContestazioneModal}
                    disabled={getNotificheWorking}></GridCustom>
            </div>             
            {/* MODAL */}                                 
            <ModalContestazione open={open} 
                setOpen={setOpen} 
                mainState={mainState}
                contestazioneSelected={contestazioneSelected}
                setContestazioneSelected={setContestazioneSelected}
                funGetNotifiche={getlistaNotifiche}
                funGetNotifichePagoPa={getlistaNotifichePagoPa}
            ></ModalContestazione>

            <ModalRedirect
                setOpen={setOpenModalRedirect} 
                open={openModalRedirect}
                sentence={`Per poter visualizzare la lista delle Notifiche è obbligatorio fornire i seguenti dati di fatturazione:`}>
                    
            </ModalRedirect>

            <ModalInfo
                open={openModalInfo} 
                setOpen={setOpenModalInfo}
                sentence={'Non è possibile creare una contestazione.'} >
            </ModalInfo>

            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading} >
            </ModalLoading>
         
            <ModalScadenziario
                open={showModalScadenziario} 
                setOpen={setShowModalScadenziario}
                nonce={mainState.nonce}></ModalScadenziario>                                    
        </div>
    );
};
                                                
export default ReportDettaglio;