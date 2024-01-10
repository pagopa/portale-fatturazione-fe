import { Typography } from "@mui/material";
import { Box, FormControl, InputLabel,Select, MenuItem, TextField, Button} from '@mui/material';
import { DataGrid, GridRowParams,GridEventListener,MuiEvent, GridColDef } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import { usePDF } from 'react-to-pdf';
import {useState} from 'react';


const ReportDettaglio : React.FC = () => {

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

    return (
        <div className="mx-5">
            {/*title container start */}
            <div className="marginTop24 ">
                <Typography variant="h4">Report Dettaglio</Typography>
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
                <div className="ms-5">
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
            </div>
            <div className="d-flex" >
                
                <div>
                    <Box sx={{ width: 200 }}>
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
                <div className="ms-5">
                    <Box sx={{ width: 200 }}>
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
                <div className=" d-flex justify-content-center align-items-center ms-5">
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
            {/* grid */}
            <div className="marginTop24" style={{display:'flex', justifyContent:'end'}}>
           
                <Button onClick={()=>console.log('ciao') } >
            Download Risultati
                    <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                </Button>
            </div>
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