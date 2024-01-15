import { Typography } from "@mui/material";
import { } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { usePDF } from 'react-to-pdf';
import { useState, useEffect } from 'react';
import {
    Card, Table,TableHead,TableBody,
    TableRow,TableCell,TablePagination, TextField,
    Box, FormControl, InputLabel,Select, MenuItem, Button
} from '@mui/material';
import { manageError, getTipologiaProdotto, getTipologiaProfilo, listaNotifiche } from "../api/api";
import { ReportDettaglioProps, NotificheList } from "../types/typeReportDettaglio";
import { useNavigate } from "react-router";
import { BodyListaNotifiche } from "../types/typesGeneral";

const ReportDettaglio : React.FC<ReportDettaglioProps> = ({mainState}) => {

    const navigate = useNavigate();
    
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

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

    const contestazioni = [
        {'Si':1,},
        {'No':2,},
        {'Tutte':3}
    ];
 
    const [prodotti, setProdotti] = useState([{nome:''}]);
    const [profili, setProfili] = useState([]);
  
    const [bodyGetLista, setBodyGetLista] = useState<BodyListaNotifiche>({
        profilo:'pa',
        prodotto:"prod-pn",
        anno:2023,
        mese:12, 
        tipoNotifica:null,
        //contestazione:null,
        cap:null,
    });
    console.log({bodyGetLista});
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');



    const [notificheList, setNotificheList] = useState<NotificheList[]>([]);
    const [notificheCount, setNotificheCount] = useState(0);
    const [controller, setController] = useState({
        page: 1,
        rowsPerPage: 10
    });


    const getlistaNotifiche = async () => {

        await listaNotifiche(token,mainState.nonce,controller.page,controller.rowsPerPage, bodyGetLista)
            .then((res)=>{
             
                setNotificheList(res.data.notifiche);
                setNotificheCount(res.data.count);

            }).catch((error)=>{
                manageError(error, navigate);
            });

    };
  
    useEffect(() => {
      
        getlistaNotifiche();
    }, []);
  
    const handlePageChange = (event :any, newPage : number) => {
        setController({
            ...controller,
            page: newPage
        });
    };
  
    const handleChangeRowsPerPage = (event : any) => {
        setController({
            ...controller,
            rowsPerPage: parseInt(event.target.value, 10),
            page: 0
        });
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

    useEffect(()=>{
        if(mainState.nonce !== ''){
            getProdotti();
            getProfili();
        }
    },[mainState.nonce]);

    return (
        <div className="mx-5">
            {/*title container start */}
            <div className="marginTop24 ">
                <Typography variant="h4">Report Dettaglio</Typography>
            </div>
            {/*title container end */}
            <div className="container nopadding_Left mt-5 mb-5 ">
                <div className="row">
                    <div className="col-3   ">
                        <Box >
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
                        <Box >
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
                        <Box >
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
                    <div className="col-3 ">
                        <Box >
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
                </div>

               
           
            
                <div className="row mt-5" >
                
                    <div className="col-3">
                        <Box >
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
                                    value={bodyGetLista.tipoNotifica}
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
                        <Box>
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel
                                    id="sea"
                                >
                                Contestazione

                                </InputLabel>
                                <Select
                                    id="sea"
                                    label='Contestazione'
                                    labelId="search-by-label"
                                    onChange={(e) =>{
                                        const value = Number(e.target.value);
                                        setBodyGetLista((prev)=> ({...prev, ...{contestazione:value}}));}
                                    } 
                                    value={''}
                                    //IconComponent={SearchIcon}
                    
                                    disabled={status=== 'immutable' ? true : false}

                                >
                                    {contestazioni.map((el) => (

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
                    <div className="col-3 ">
                        <Box >
                            <TextField
                                //required={required}
                                // helperText='Cap'
                                label='Cap'
                                placeholder='Cap'
                                //  disabled={makeTextInputDisable}
                                value={''}
                                // error={errorValidation}
                                onChange={(e) => setBodyGetLista((prev)=> ({...prev, ...{cap:e.target.value}}))}
                                onBlur={()=> console.log('miao')}
            
                            />
                        </Box>
                    </div>
                    <div className="col-3">
                        <div className=" d-flex">
                            <div>
                                <Button 
                                    onClick={()=> console.log('ciao')} 
                                    sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                                    variant="contained"> Filtra
                                </Button>

                                {statusAnnulla === 'hidden' ? null :
                        
                                    <Button
                                        onClick={()=>{
                                            console.log('ciao');
                                        } }
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
            <div className="marginTop24" style={{display:'flex', justifyContent:'end'}}>
           
                <Button onClick={()=>console.log('ciao') } >
            Download Risultati
                    <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                </Button>
            </div>


            <Card>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
              Codice Fiscale
                            </TableCell>
                            <TableCell>
              Regione Sociale
                            </TableCell>
                         
                            <TableCell>
              Contestazione
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {notificheList.map((notifica:NotificheList) => (
                            <TableRow key={Math.random()}>
                                <TableCell>
                                    {notifica.codiceFiscale}
                                </TableCell>
                                <TableCell>
                                    {notifica.ragioneSociale}
                                </TableCell>
                              
                                <TableCell>
                                    {notifica.contestazione}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    onPageChange={handlePageChange}
                    page={controller.page}
                    count={notificheCount}
                    rowsPerPage={controller.rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Card>
            {/* 
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
                
            </div>*/}
           
            <div>

            </div>
        </div>
    );
};

export default ReportDettaglio;