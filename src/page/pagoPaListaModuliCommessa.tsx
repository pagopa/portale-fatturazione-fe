import { ListaModuliCommessaProps } from "../types/typeListaModuliCommessa";
import { Typography } from "@mui/material";
import { Box, FormControl, InputLabel,Select, MenuItem, TextField, Button} from '@mui/material';
import {getTipologiaProdotto, manageError, listaDatiFatturazionePagopa, listaModuloCommessaPagopa} from '../api/api';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {BodyListaDatiFatturazione} from '../types/typesGeneral';
import { DataGrid, GridRowParams,GridEventListener,MuiEvent, GridColDef } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';

const PagoPaListaModuliCommessa:React.FC<ListaModuliCommessaProps> = ({mainState,setMainState}) =>{

    const navigate = useNavigate();

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;


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
                console.log({res}, 'lista');
                setGridData(res.data);
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
        console.log({params});
        // l'evento verrà eseguito solo se l'utente farà il clik sul 
        if(columsSelectedGrid  === 'mese' || columsSelectedGrid === 'action' ){
            /*
            const getProfilo = localStorage.getItem('profilo') || '{}';
            const profilo =  JSON.parse(getProfilo);

            localStorage.setItem('profilo', JSON.stringify({
                ...profilo,
                ...{
                    idEnte:params.row.idEnte,
                    prodotto:params.row.prodotto
                }
               
            }));
*/
            navigate('/8');
        }
       
    };


    

    const columns: GridColDef[] = [
        { field: 'mese', headerName: 'Mese', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:any) => <a className="mese_alidita text-primary fw-bolder" href="/8">{param.row.ragioneSociale}</a>},
        { field: 'totaleAnalogicoLordo', headerName: 'Tot. Analogico', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'totaleDigitaleLordo', headerName: 'Tot. Digitale', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
    
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
                        
                        <Button
                            onClick={()=>{
                                console.log('ciao');
                            } }
                            variant="contained"
                            sx={{marginLeft:'24px'}} >
                    Annulla filtri
                        </Button>
                    </div>
                
                </div>
           
            </div>
            {/* grid */}
            <div className="marginTop24" style={{display:'flex', justifyContent:'end'}}>
           
                <Button >
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