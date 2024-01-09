import { ListaModuliCommessaProps } from "../types/typeListaModuliCommessa";
import { Typography } from "@mui/material";
import { Box, FormControl, InputLabel,Select, MenuItem, TextField, Button} from '@mui/material';
import {getTipologiaProdotto, manageError, listaModuloCommessaPagopa, downloadDocumentoListaModuloCommessaPagoPa} from '../api/api';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { DataGrid, GridRowParams,GridEventListener,MuiEvent, GridColDef } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';


const PagoPaListaModuliCommessa:React.FC<ListaModuliCommessaProps> = ({mainState,setMainState}) =>{

    const navigate = useNavigate();

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    
    const state = localStorage.getItem('statusApplication') || '{}';
    const statusApp =  JSON.parse(state);




    // prendo gli ultimi 2 anni dinamicamente
    const currentYear = (new Date()).getFullYear().toString();
    const getCurrentFinancialYear = () => {
        const thisYear = (new Date()).getFullYear();
        const yearArray = [0, 1].map((count) => `${thisYear - count}`);
        return yearArray;
    };

    //creo un array di oggetti con tutti i mesi 
    const currentMonth = (new Date()).getMonth() + 1;
    const currString = currentMonth.toString();
    const mesi = [
        {1:'Gennaio'},{2:'Febbraio'},{3:'Marzo'},{4:'Aprile'},{5:'Maggio'},{6:'Giugno'},
        {7:'Luglio'},{8:'Agosto'},{9:'Settembre'},{10:'Ottobre'},{11:'Novembre'},{12:'Dicembre'}];
   

    const [prodotti, setProdotti] = useState([{nome:''}]);
    const [gridData, setGridData] = useState([]);
    const [bodyGetLista, setBodyGetLista] = useState({descrizione:'',prodotto:'', anno:currentYear, mese:currString});

    const [statusAnnulla, setStatusAnnulla] = useState('hidden');

    useEffect(()=>{

        // se un utente ha già selezionato un elemento nella grid avrà in memoria l'idEnte, per errore se andrà nella pagina '/8'
        // modificando a mano l'url andrà a modificare il modulo commessa dell'ultima commessa  selezionata
        if(profilo.auth === 'PAGOPA'){
            delete profilo.idEnte;
            const newProfilo = profilo; 
            localStorage.setItem('profilo', JSON.stringify(newProfilo));
        }
        

    },[]);

    useEffect(()=>{
        if(bodyGetLista.descrizione !== '' || bodyGetLista.prodotto !== '' ){
            setStatusAnnulla('show');
        }else{
            setStatusAnnulla('hidden');
        }
    },[bodyGetLista]);

   

    

    const getProdotti = async() => {
        await getTipologiaProdotto(token, mainState.nonce )
            .then((res)=>{
               
                setProdotti(res.data);
            })
            .catch(((err)=>{
                manageError(err,navigate);
            }));
    };

 

    useEffect(()=>{
        if(mainState.nonce !== ''){
            getProdotti();
            getListaCommesse();
        }
    }, [mainState.nonce]);


    const getListaCommesse = async() =>{
        await listaModuloCommessaPagopa(bodyGetLista ,token, mainState.nonce)
            .then((res)=>{
               
                setGridData(res.data);
            })
            .catch((err)=>{
                manageError(err,navigate);
            }); 
    };

    const getListaCommesseOnAnnulla = async() =>{
        await listaModuloCommessaPagopa({descrizione:'',prodotto:'', anno:currentYear, mese:currString} ,token, mainState.nonce)
            .then((res)=>{
             
                setBodyGetLista({descrizione:'',prodotto:'', anno:currentYear, mese:currString});
                setGridData(res.data);
            })
            .catch((err)=>{
                manageError(err,navigate);
            }); 
    };


    const downloadExelListaCommessa = async () =>{
        await downloadDocumentoListaModuloCommessaPagoPa(token, mainState.nonce,bodyGetLista)
            .then((res)=>{
             
                //const url = window.URL.createObjectURL(res.data.documento);
                const link = document.createElement('a');
                link.href = "data:text/plain;base64," + res.data.documento;
                link.setAttribute('download', 'Lista Modulo Commessa.xlsx'); //or any other extension
                document.body.appendChild(link);
              
                link.click();
                document.body.removeChild(link);

            })
            .catch((err)=>{
                manageError(err,navigate);
            });
    };



    let columsSelectedGrid = '';
    const handleOnCellClick = (params:any) =>{
        columsSelectedGrid  = params.field;
        
    };


    const handleEvent: GridEventListener<'rowClick'> = (
        params:GridRowParams,
        event: MuiEvent<React.MouseEvent<HTMLElement>>,
      
    ) => {
        event.preventDefault();
       
        // l'evento verrà eseguito solo se l'utente farà il clik sul  mese e action
        if(columsSelectedGrid  === 'regioneSociale' ||columsSelectedGrid  === 'action' ){
            
        
          
            const newState = {
                path:'/8',
                mese:params.row.mese,
                anno:params.row.anno,
                userClickOn:'GRID',
                inserisciModificaCommessa:"MODIFY"
            };
            const string = JSON.stringify(newState);
            localStorage.setItem('statusApplication', string);


            const newProfilo = {...profilo,...{
                idTipoContratto: params.row.idTipoContratto,
                prodotto:params.row.prodotto,
                idEnte:params.row.idEnte
            }};
            const stringProfilo = JSON.stringify(newProfilo);
            localStorage.setItem('profilo', stringProfilo);


            setMainState((prev:any)=>({...prev, ...{
                mese:params.row.mese,
                anno:params.row.anno,
                modifica:params.row.modifica,
                userClickOn:'GRID',
                inserisciModificaCommessa:"MODIFY"
            }}));
            // localStorage.removeItem('statusApplication');
           
            navigate('/8');
           
        }
       
    };


    
    


    const columns: GridColDef[] = [
        { field: 'regioneSociale', headerName: 'Regione Sociale', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:any) => <a className="mese_alidita text-primary fw-bolder" href="/8">{param.row.ragioneSociale}</a>},
        { field: 'prodotto', headerName: 'Prodotto', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        // { field: 'tipoSpedizioneDigitale', headerName: 'Tipo Spedizione', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'numeroNotificheNazionaliDigitale', headerName: 'Num. Not. Naz.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'numeroNotificheInternazionaliDigitale', headerName: 'Num. Not. Int', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        // { field: 'tipoSpedizioneAnalogicoAR', headerName: 'Tipo spediz Anal', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'numeroNotificheNazionaliAnalogicoAR', headerName: 'Num. Not. Naz. AR', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'numeroNotificheInternazionaliAnalogicoAR', headerName: 'Num. Not. Int. AR', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        // { field: 'tipoSpedizioneAnalogicoAR', headerName: 'Tipo spediz Anal', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'numeroNotificheNazionaliAnalogico890', headerName: 'Num. Not. Naz. 890', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'numeroNotificheInternazionaliAnalogico890', headerName: 'Num. Not. Naz. AR 890', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'totaleAnalogicoLordo', headerName: 'Tot. Spedizioni A.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left',  valueFormatter: ({ value }) => value.toFixed(2)},
        { field: 'totaleDigitaleLordo', headerName: 'Tot. Spedizioni D', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left', valueFormatter: ({ value }) => value.toFixed(2) },
    
        {
            field: 'action',
            headerName: '',
            sortable: false,
            width:70,
            headerAlign: 'left',
            disableColumnMenu :true,
            renderCell: ((row : any) => (
    
                <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} onClick={() => console.log('Show page details')} />
    
            )
            ),
        }

    ];
    return (
        <div className="mx-5">
            {/*title container start */}
            <div className="marginTop24 ">
                <Typography variant="h4">Lista Modulo Commessa</Typography>
            </div>
            {/*title container end */}
    
            <div className="d-flex  me-5 mb-5   marginTop24" >
               
                <div>
                    <Box sx={{ width: 200 }}>
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
                                onChange={(e) =>  setBodyGetLista((prev)=> ({...prev, ...{anno:e.target.value}}))}
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
                <div className="ms-5">
                    <Box sx={{ width: 200 }}>
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
                                    setBodyGetLista((prev)=> ({...prev, ...{mese:e.target.value}}));
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
            </div>
            <div className="d-flex" >
                <div className="me-5">
                    <Box sx={{ width: 200 }}>
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
                                id="sea"
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
                <div className="me-5">
                    <TextField
                        sx={{ width: 200 }}
                        label="Rag Soc. Ente"
                        placeholder="Rag Soc. Ente"
                        value={bodyGetLista.descrizione}
                        onChange={(e) => setBodyGetLista((prev)=> ({...prev, ...{descrizione:e.target.value}}))}
                    />
                </div>
                <div className=" d-flex justify-content-center align-items-center">
                    <div>
                        <Button 
                            onClick={()=> getListaCommesse()} 
                            sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                            variant="contained"> Filtra
                        </Button>

                        {statusAnnulla === 'hidden' ? null :
                        
                            <Button
                                onClick={()=>{
                                    getListaCommesseOnAnnulla();
                                } }
                                sx={{marginLeft:'24px'}} >
                    Annulla filtri
                            </Button>
                        }
                    </div>
                
                </div>
           
            </div>
            {/* grid */}
            <div className="marginTop24" style={{display:'flex', justifyContent:'end'}}>
           
                <Button onClick={()=>downloadExelListaCommessa() } >
            Download Risultati
                    <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                </Button>
            </div>
            <div className="mt-1 mb-5" style={{ width: '100%'}}>
                <DataGrid sx={{
                    height:'400px',
                    '& .MuiDataGrid-virtualScroller': {
                        backgroundColor: 'white',
                    }
                   
                }}
                rows={gridData} 
                columns={columns}
                getRowId={(row) => row.key}
                onRowClick={handleEvent}
                onCellClick={handleOnCellClick}
                
                />
                
            </div>
            <div>

            </div>
        </div>
    );
};
export default PagoPaListaModuliCommessa;