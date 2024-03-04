import { Typography } from "@mui/material";
import { } from '@mui/material';
import React , { useState, useEffect, useRef } from 'react';
import {
    Card, Table,TableHead,TableBody,
    TableRow,TableCell,TablePagination, TextField,
    Box, FormControl, InputLabel,Select, MenuItem, Button
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { manageError, getTipologiaProdotto, getTipologiaProfilo, listaNotifiche, getContestazione, downloadNotifche, listaNotifichePagoPa, getContestazionePagoPa, downloadNotifchePagoPa } from "../api/api";
import { ReportDettaglioProps, NotificheList, FlagContestazione, Contestazione  } from "../types/typeReportDettaglio";
import { useNavigate } from "react-router";
import { BodyListaNotifiche } from "../types/typesGeneral";
import ModalContestazione from '../components/reportDettaglio/modalContestazione';
import ModalInfo from "../components/reportDettaglio/modalInfo";
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";
import DownloadIcon from '@mui/icons-material/Download';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MultiSelectStatoContestazione from "../components/reportDettaglio/multiSelectGroupedBy";
import ModalLoading from "../components/reusableComponents/modalLoading";
import ModalScadenziario from "../components/reportDettaglio/modalScadenziario";



const ReportDettaglio : React.FC<ReportDettaglioProps> = ({mainState}) => {
    
    const navigate = useNavigate();
    
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);
    
    
    
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
        
    const tipoNotifica = [
        {"Digitali": 1},
        {"Analogico AR Nazionali": 2}, 
        {"Analogico AR Internazionali": 3},
        {"Analogico RS Nazionali": 4}, 
        {"Analogico RS Internazionali": 5}, 
        {"Analogico 890":6}];
            
            
    const [prodotti, setProdotti] = useState([{nome:''}]);
    const [profili, setProfili] = useState([]);
            
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

    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
            
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

    const [notificheList, setNotificheList] = useState<NotificheList[]>([]);

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
        return  {...notifica,...{onere:newOnere} };
    });

   
            
            
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



    
                
    const onAnnullaFiltri = async () =>{

        setStatusAnnulla('hidden');
        setValueFgContestazione([]);
        setDataSelect([]);
        setBodyGetLista({
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
   
        const realPageNumber = page + 1;
        const pageNumber = Number(realPageNumber);

        if(profilo.auth === 'SELFCARE'){
            const body = {
                profilo:'',
                prodotto:'',
                anno:currentYear,
                mese:currString, 
                tipoNotifica:null,
                statoContestazione:[],
                cap:null,
                iun:null,
                recipientId:null
            };
            await listaNotifiche(token,profilo.nonce,1,10, body)
                .then((res)=>{
                    setNotificheList(res.data.notifiche);
                    setTotalNotifiche(res.data.count);
                        
                }).catch((error)=>{
                    manageError(error, navigate);
                });
        }

        if(profilo.auth === 'PAGOPA'){
            const bodyPagoPa = {
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
            await listaNotifichePagoPa(token,profilo.nonce,1,10, bodyPagoPa)
                .then((res)=>{
                    setNotificheList(res.data.notifiche);
                    setTotalNotifiche(res.data.count);
                        
                }).catch((error)=>{
                    manageError(error, navigate);
                });
        }
      
    };     
                
    
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalNotifiche, setTotalNotifiche]  = useState(0);
    const realPageNumber = page + 1;
    const pageNumber = Number(realPageNumber);

    const [getNotificheWorking, setGetNotificheWorking] = useState(false);
                
    const getlistaNotifiche = async (nPage:number, nRow:number) => {
        // elimino idEnti dal paylod della get notifiche lato selfcare
        const {idEnti, ...newBody} = bodyGetLista;
        // disable button filtra e annulla filtri nell'attesa dei dati
        setGetNotificheWorking(true);
        await listaNotifiche(token,profilo.nonce,nPage, nRow, newBody)
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
        await listaNotifichePagoPa(token,profilo.nonce,nPage, nRow, bodyGetLista)
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

    
    /*               
    useEffect(() => {
        
        if(profilo.nonce !== ''){
            if(profilo.auth === 'SELFCARE'){
                getlistaNotifiche();
                
            }
            if(profilo.auth === 'PAGOPA'){
                getlistaNotifichePagoPa();
                //listaEntiNotifichePageOnSelect();
            }
            
           
        } 
    }, [profilo.nonce,rowsPerPage,page]);

*/
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
            
        }
        if(profilo.auth === 'PAGOPA'){
            getlistaNotifichePagoPa(realPage,rowsPerPage);
            //listaEntiNotifichePageOnSelect();
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
            
        }
        if(profilo.auth === 'PAGOPA'){
            getlistaNotifichePagoPa(realPage,parseInt(event.target.value, 10));
            //listaEntiNotifichePageOnSelect();
        }
                            
    };
                        
    const getProdotti = async() => {
        await getTipologiaProdotto(token, profilo.nonce )
            .then((res)=>{
                                
                setProdotti(res.data);
            })
            .catch(((err)=>{
                manageError(err,navigate);
            }));
    };
                        
                        
                        
    const getProfili = async() => {
        await getTipologiaProfilo(token, profilo.nonce )
            .then((res)=>{
                                
                setProfili(res.data);
            })
            .catch(((err)=>{
                manageError(err,navigate);
            }));
    };
                        
                        
                 
    useEffect(()=>{
        if(profilo.nonce !== undefined){
            getProdotti();
            getProfili();
        }
    },[profilo.nonce]);
                        
                        
    
                        
                        
                        
                        
    const getContestazioneModal = async(idNotifica:string) =>{

        if(profilo.auth === 'SELFCARE'){
            await getContestazione(token, profilo.nonce , idNotifica )
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

            await getContestazionePagoPa(token, profilo.nonce , idNotifica ).then((res)=>{
           
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
        }

       

    };
                        
                        
    const onSelectContestazione = (notifica:NotificheList) =>{
                      
        getContestazioneModal(notifica.idNotifica);
       
    };

    const mesiGrid = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
                        

   
    
    const downloadNotificheOnDownloadButton = async () =>{

        if(profilo.auth === 'SELFCARE'){
            await downloadNotifche(token, profilo.nonce,bodyGetLista )
                .then((res)=>{

            
                    const link = document.createElement('a');
                    link.href = "data:text/plain;base64," + res.data.documento;
                    link.setAttribute('download', 'Lista Notifiche.xlsx'); //or any other extension
                    document.body.appendChild(link);
              
                    link.click();
                    document.body.removeChild(link);
                            
                })
                .catch(((err)=>{
                    manageError(err,navigate);
                }));
        }else{
            await downloadNotifchePagoPa(token, profilo.nonce,bodyGetLista )
                .then((res)=>{

                    const blob = new Blob([res.data], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.setAttribute('hidden', '');
                    a.setAttribute('href', url);
                    a.setAttribute('download', 'Lista Notifiche.csv');
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
    const [dataSelect, setDataSelect] = useState([]);



    const [valueFgContestazione, setValueFgContestazione] = useState<FlagContestazione[]>([]);



    // modal
                        
    const [open, setOpen] = useState(false);
    const [openModalInfo, setOpenModalInfo] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [showModalScadenziario, setShowModalScadenziario ] = useState(false);
    
            
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
                                    //IconComponent={SearchIcon}
                            
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
                                    //IconComponent={SearchIcon}
                                
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
                                    //IconComponent={SearchIcon}
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
                                //required={required}
                                // helperText='Cap'
                                fullWidth
                                label='IUN'
                                placeholder='IUN'
                                //  disabled={makeTextInputDisable}
                                value={bodyGetLista.iun || ''}
                                // error={errorValidation}
                                onChange={(e) => setBodyGetLista((prev)=>{
                                                        
                                    if(e.target.value === ''){
                                        return {...prev, ...{iun:null}};
                                    }else{
                                        return {...prev, ...{iun:e.target.value}};
                                    }
                                } )}
                                onBlur={()=> console.log('miao')}
                                                    
                            />
                        </Box>
                    </div>
                   
                    {/* 
                    <div className="col-3 ">
                        <Box  sx={{width:'80%', marginLeft:'20px'}} >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel
                                    id="sea"
                                >
                                        Recapitista
                                        
                                </InputLabel>
                                <Select
                                    id="sea"
                                    label='Recapitista'
                                    labelId="search-by-label"
                                    onChange={(e) => setBodyGetLista((prev)=> ({...prev, ...{profilo:e.target.value}}))}
                                    value={bodyGetLista.profilo}
                                    //IconComponent={SearchIcon}
                                    disabled={status=== 'immutable' ? true : false}
                                        
                                >
                                    {profili.map((el) => (
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
                    */}
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
                                    //IconComponent={SearchIcon}
                                            
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
                                //required={required}
                                // helperText='Cap'
                                label='Cap'
                                placeholder='Cap'
                                //  disabled={makeTextInputDisable}
                                value={bodyGetLista.cap || ''}
                                // error={errorValidation}
                                onChange={(e) => setBodyGetLista((prev)=>{
                                                        
                                    if(e.target.value === ''){
                                        return {...prev, ...{cap:null}};
                                    }else{
                                        return {...prev, ...{cap:e.target.value}};
                                    }
                                } )}
                                onBlur={()=> console.log('miao')}
                                                    
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
            {/* grid */}
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
                <div style={{overflowX:'auto'}}>
                    <Card sx={{width: '2000px'}}  >
                        <Table >
                            <TableHead sx={{backgroundColor:'#f2f2f2'}}>
                                <TableRow>
                                    <TableCell>
                                                Contestazione
                                    </TableCell>
                                    <TableCell>
                                                Onere
                                    </TableCell>
                                    <TableCell>
                                                Recipient ID
                                    </TableCell>
                                    <TableCell>
                                                Anno
                                    </TableCell>
                                    <TableCell>
                                                Mese
                                    </TableCell>
                                    <TableCell>
                                                Regione Sociale
                                    </TableCell>
                                    <TableCell>
                                                Tipo Notifica
                                    </TableCell>
                                    <TableCell sx={{width:'300px'}}>
                                                IUN
                                    </TableCell>
                                    <TableCell >
                                                Data Invio
                                    </TableCell>
                                    <TableCell>
                                                Stato Estero
                                    </TableCell>
                                    <TableCell>
                                                Cap
                                    </TableCell>
                                    <TableCell>
                                                Costo
                                    </TableCell>
                                    <TableCell sx={{width:'140px'}}>
                                               
                                    </TableCell>
                                
                                </TableRow>
                            </TableHead>

                            {notificheList.length === 0 ?
                                <div className="" style={{height: '50px'}}>
                                    

                                </div> :
                                <TableBody sx={{marginLeft:'20px'}}>
                                    {notificheListWithOnere.map((notifica:NotificheList) =>{
                        
                                        return (
                                        
                                      
                                            <TableRow key={notifica.idNotifica}>
                                                <TableCell sx={{color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer'}}
                                                    onClick={()=>{
                                                       
                                                        onSelectContestazione(notifica); 
                                                        
                                                                        
                                                    } }
                                                >
                                                    {notifica.contestazione}
                                                </TableCell>
                                                <TableCell>
                                                    {notifica.onere}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {notifica.recipientId}
                                                </TableCell>
                                                <TableCell>
                                                    {notifica.anno}
                                                </TableCell>
                                                <TableCell>
                                                    {mesiGrid[Number(notifica.mese) - 1 ]}
                                                </TableCell>
                                                <TableCell>
                                                    {notifica.ragioneSociale}
                                                </TableCell>
                                                <TableCell>
                                                    {notifica.tipoNotifica}
                                                </TableCell>
                                                <TableCell>
                                                    {notifica.iun}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(notifica.dataInvio).toISOString().split('T')[0]}
                                                </TableCell>
                                                <TableCell>
                                                    {notifica.cap}
                                                </TableCell>
                                                <TableCell>
                                                    {notifica.statoEstero}
                                                </TableCell>
                                                <TableCell>
                                                    {(Number(notifica.costEuroInCentesimi) / 100).toFixed(2)}€
                                                </TableCell>
                                                <TableCell  onClick={()=>{
                                                   
                                                    onSelectContestazione(notifica);
                                                    
                                                                     
                                                } }>
                                                    <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} /> 
                                                </TableCell>
                                                   
                                           
                                            </TableRow>
                                        
                                        );
                                    } )}
                                </TableBody>
                            }
                        </Table>
                        
                                                    
                                                    
                    </Card>
                </div>
                <div className="pt-3">
                                                    
                    <TablePagination
                        sx={{'.MuiTablePagination-selectLabel': {
                            display:'none',
                            backgroundColor:'#f2f2f2'
                           
                        }}}
                        component="div"
                        page={page}
                        count={totalNotifiche}
                        rowsPerPage={rowsPerPage}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />  
                </div>
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

            <ModalInfo
                open={openModalInfo} 
                setOpen={setOpenModalInfo} >

            </ModalInfo>

            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading} >
                    
            </ModalLoading>
         
            <ModalScadenziario
                open={showModalScadenziario} 
                setOpen={setShowModalScadenziario}
                nonce={profilo.nonce}></ModalScadenziario>
                                                    
        </div>
    );
};
                                                
export default ReportDettaglio;