import { Typography } from "@mui/material";
import { Box, FormControl, InputLabel,Select, MenuItem, TextField, Button} from '@mui/material';
import {getTipologiaProdotto, getTipologiaProfilo, listaDatiFatturazionePagopa} from '../api/api';
import { ListaDatiFatturazioneProps } from "../types/typeListaDatiFatturazione";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {BodyListaDatiFatturazione} from '../types/typesGeneral';
import { DataGrid, GridRowParams,GridEventListener,MuiEvent, GridColDef } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';


const PagoPaListaDatiFatturazione:React.FC<ListaDatiFatturazioneProps> = ({mainState, setMainState}) =>{
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const navigate = useNavigate();

    const [prodotti, setProdotti] = useState([{nome:''}]);
    const [profili, setProfili] = useState(['']);
    const [bodyGetLista, setBodyGetLista] = useState({descrizione:'',prodotto:'',profilo:''});

    const [gridData, setGridData] = useState([]);

    const [statusAnnulla, setStatusAnnulla] = useState('hidden');


    useEffect(()=>{
        if(bodyGetLista.descrizione !== '' || bodyGetLista.prodotto !== '' || bodyGetLista.profilo !== ''){
            setStatusAnnulla('show');
        }else{
            setStatusAnnulla('hidden');
        }
    },[bodyGetLista]);

   

    

    const getProdotti = async() => {
        await getTipologiaProdotto(token, mainState.nonce )
            .then((res)=>{
                console.log({res}, 'getProdotti');
                setProdotti(res.data);
            })
            .catch(((err)=>{
                if(err.response?.status === 401){
                        
                    navigate('/error');
                }
            }));
    };

    const getProfili = async() => {
        await getTipologiaProfilo(token, mainState.nonce)
            .then((res)=>{
                console.log({res}, 'getProfilii');
                setProfili(res.data);
            })
            .catch(((err)=>{
                if(err.response?.status === 401){
                    
                    navigate('/error');
                }
            }));
    };

    

    const getListaDatifatturazione = async(body:BodyListaDatiFatturazione) =>{
        await listaDatiFatturazionePagopa(body ,token, mainState.nonce)
            .then((res)=>{
                console.log({res}, 'lista');
                setGridData(res.data);
            })
            .catch(((err)=>{
                if(err.response?.status === 401){
                
                    navigate('/error');
                }if(err.response?.status === 404){
                    setGridData([]);
                }
            })); 
    };


    useEffect(()=>{
        
        if(mainState.nonce !== ''){

            getProdotti();
            getProfili();
            getListaDatifatturazione(bodyGetLista);
       
        }
    }, [mainState.nonce]);

    let columsSelectedGrid = '';
    const handleOnCellClick = (params:any) =>{
        columsSelectedGrid  = params.field;
        
    };


    const handleEvent: GridEventListener<'rowClick'> = (
        params:GridRowParams,
        event: MuiEvent<React.MouseEvent<HTMLElement>>,
        idCommessa
    ) => {
        event.preventDefault();
        console.log({params});
        // l'evento verrà eseguito solo se l'utente farà il clik sul 
        if(columsSelectedGrid  === 'ragioneSociale' || columsSelectedGrid === 'action' ){

            /* 
            setMainState((prev:any)=>({...prev, ...{
                idEnte:params.row.idEnte,
                prodotto:params.row.prodotto,
               
            }}));
            */

            const getProfilo = localStorage.getItem('profilo') || '{}';
            const profilo =  JSON.parse(getProfilo);

            localStorage.setItem('profilo', JSON.stringify({
                ...profilo,
                ...{
                    idEnte:params.row.idEnte,
                    prodotto:params.row.prodotto
                }
               
            }));

            navigate('/');
        }
       
    };


    
    
      
    const columns: GridColDef[] = [
        { field: 'ragioneSociale', headerName: 'Regione Sociale', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:any) => <a className="mese_alidita text-primary fw-bolder" href="/">{param.row.ragioneSociale}</a>},
        { field: 'cup', headerName: 'Cup', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'splitPayment', headerName: 'Split payment', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'idDocumento', headerName: 'ID. Documento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataDocumento', headerName: 'Data Documento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'codCommessa', headerName: 'Cod. Commessa', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataCreazione', headerName: 'Data Primo Acc.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataModifica', headerName: 'Data Ultimo Acc.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
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


    return(
        <div className="mx-5">
            {/*title container start */}
            <div className="marginTop24 ">
                <Typography variant="h4">Lista Dati Fatturazione</Typography>
            </div>
            {/*title container end */}
        
            <div className="d-flex  me-5 mb-5   marginTop24" >
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
                <div>
                    <Box sx={{ width: 200 }}>
                        <FormControl
                            fullWidth
                            size="medium"
                        >
                            <InputLabel
                                id="sea"
                            >
                                Seleziona Profilo

                            </InputLabel>
                            <Select
                                id="sea"
                                label='Seleziona Profilo'
                                labelId="search-by-label"
                                onChange={(e) =>  setBodyGetLista((prev)=> ({...prev, ...{profilo:e.target.value}}))}
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
            </div>
            <div className="d-flex" >
                <div className="me-5">
                    <TextField
                        sx={{ width: 200 }}
                        label="Rag Soc. Ente"
                        placeholder="Rag Soc. Ente"
                        value={bodyGetLista.descrizione}
                        onChange={(e)=>setBodyGetLista((prev)=> ({...prev, ...{descrizione:e.target.value}}))}
                    />
                </div>
                <div className=" d-flex justify-content-center align-items-center">
                    <div>
                        <Button 
                            onClick={()=> getListaDatifatturazione(bodyGetLista)} 
                            sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                            variant="contained"> Filtra
                        </Button>
                        {statusAnnulla === 'hidden'? null :
                            <Button
                                onClick={()=>{
                                    setBodyGetLista(({descrizione:'',prodotto:'',profilo:''}));
                                    getListaDatifatturazione({descrizione:'',prodotto:'',profilo:''});
                                } }
                                variant="contained"
                                sx={{marginLeft:'24px'}} >
                        Annulla filtri
                            </Button>}
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
export default PagoPaListaDatiFatturazione;