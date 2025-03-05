import { useContext, useEffect, useState } from "react";
import NavigatorHeader from "../components/reusableComponents/navigatorHeader";
import { PathPf } from "../types/enum";
import IosShareIcon from '@mui/icons-material/IosShare';
import { GlobalContext } from "../store/context/globalContext";
import { getListaJsonFatturePagoPa, invioListaJsonFatturePagoPa, sendListaJsonFatturePagoPa } from "../api/apiPagoPa/fatturazionePA/api";
import { manageError, managePresaInCarico } from "../api/api";
import { Box } from "@mui/system";
import { InputLabel, Select, MenuItem, FormControl, Button, Toolbar, Typography } from "@mui/material";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { DataGrid, GridCallbackDetails, GridCellParams, GridColDef, GridEventListener, GridRowParams, MuiEvent } from "@mui/x-data-grid";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from "react-router";
import { mesiGrid, month } from "../reusableFunction/reusableArrayObj";



interface ListaFatture {
    tipologiaFattura: string,
    statoInvio:number,
    numeroFatture: number,
    annoRiferimento: number,
    meseRiferimento: number,
    importo: number,
    id:string
}

export interface SelectedJsonSap {
    annoRiferimento: number,
    meseRiferimento: number,
    tipologiaFattura: string
}


const InvioFatture = () => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState,dispatchMainState,setErrorAlert} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();
    
    const [listaFatture, setListaFatture] = useState<ListaFatture[]>([]);
    const [tipologieFatture, setTipologie] = useState<string[]>([]);
    const [selected,setSelected] = useState<SelectedJsonSap[]>([]);
    const [tipologia, setTipologia] = useState('Tutte');
    const [showLoader, setShowLoader] = useState(false);
    const [infoPage , setInfoPage] = useState({ page: 0, pageSize: 10 });


    
    useEffect(()=>{
        getLista(tipologia);
        setSelected([]);
    },[tipologia]);
    
    const getLista = async (tipologia) =>{
        await getListaJsonFatturePagoPa(token,profilo.nonce).then((res)=>{
            const array = res.data.map( el => el.tipologiaFattura);
            const uniqueArray = array.reduce((accumulator, current) => {
                if (!accumulator.includes(current)) {
                    accumulator.push(current);
                }
                return accumulator;
            }, []);
                
            setTipologie([...["Tutte"],...uniqueArray]);
            let elOrdered = res.data.map((el) => {
                return {
                    id:el.tipologiaFattura+"-"+el.annoRiferimento+"-"+el.meseRiferimento,
                    tipologiaFattura: el.tipologiaFattura,   
                    statoInvio: el.statoInvio,
                    numeroFatture: el.numeroFatture,
                    annoRiferimento: el.annoRiferimento,
                    meseRiferimento: el.meseRiferimento,
                    importo: el.importo.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
                };
            }); 
    
            if(tipologia !== 'Tutte'){
                elOrdered = elOrdered.filter(el => el.tipologiaFattura === tipologia);
            }
              
            setListaFatture(elOrdered);
        }).catch((err)=>{
            manageError(err, dispatchMainState);
        });
    };

    console.log({listaFatture});
    /*
    const getDetailSingleRow = async(body,setStateSingleRow) => {
      
        await sendListaJsonFatturePagoPa(token,profilo.nonce,body).then((res)=>{
            // setErrorSingleRowDetail(false);
            const orderData = res.data.map(el => {
                return {
                    ragioneSociale: el.ragioneSociale,
                    tipologiaFattura: el.tipologiaFattura,
                    annoRiferimento: el.annoRiferimento,
                    meseRiferimento:month[el.meseRiferimento],
                    dataFattura:el.dataFattura,
                    importo:el.importo.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
                };
            });
         
            setStateSingleRow(orderData);
        }).catch(()=>{
            getLista(tipologia);
            managePresaInCarico("ERROR_LIST_JSON_TO_SAP",dispatchMainState);
        });
 
    };
    */
    const onButtonInvia = async() =>{
        setShowLoader(true);
        // se l'utente ha selezionato il button invia a sap 
        await invioListaJsonFatturePagoPa(token,profilo.nonce,selected).then((res)=>{
    
            setShowLoader(false);
            getLista("Tutte");
            setSelected([]);
            setTipologia('Tutte');
            managePresaInCarico('SEND_JSON_SAP_OK',dispatchMainState);
        }).catch((err)=>{
            setShowLoader(false);
            setSelected([]);
            setTipologia('Tutte');
            manageError(err, dispatchMainState);
        });
          
    };

    const columns: GridColDef[] = [
        { field: 'tipologiaFattura', headerName: 'Tipologia Fattura', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:any) => <a className="mese_alidita text-primary fw-bolder" href="/">{param.row.tipologiaFattura}</a>},
        { field: 'statoInvio', headerName: 'Stato', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'numeroFatture', headerName: 'Numero', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'annoRiferimento', headerName: 'Anno', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'meseRiferimento', headerName: 'Mese', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left', renderCell: (param:{row:any}) => <div className="MuiDataGrid-cellContent" title={mesiGrid[param.row.meseRiferimento]} role="presentation">{mesiGrid[param.row.meseRiferimento]}</div>},
        { field: 'importo', headerName: 'Importo', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        {field: 'action', headerName: '',sortable: false,width:70,headerAlign: 'left',disableColumnMenu :true,renderCell: (() => ( <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }}/>)),}
    ];


    let columsSelectedGrid = '';
    const handleOnCellClick = (params: GridCellParams, event: MuiEvent, details: GridCallbackDetails) =>{
        columsSelectedGrid  = params.field;
        console.log( {params,event,details});
    };
    
    const handleEvent: GridEventListener<'rowClick'> = (
        params:GridRowParams,
        event: MuiEvent<React.MouseEvent<HTMLElement>>,
    ) => {
        event.preventDefault();
        // l'evento verrà eseguito solo se l'utente farà il clik sul 
        if(columsSelectedGrid  === 'tipologiaFattura' || columsSelectedGrid === 'action' ){
            console.log('ciao');
            navigate(PathPf.JSON_TO_SAP_DETAILS.replace(":id",params.row.id));
        }
    };

    const onChangePageOrRowGrid = (e) => {
        setInfoPage(e);
    };
    

    return(
        <>
            <div>
                <NavigatorHeader pageFrom={"Documenti emessi/"} pageIn={"Inserimento fatture"} backPath={PathPf.FATTURAZIONE} icon={<IosShareIcon sx={{paddingBottom:"5px"}}  fontSize='small'></IosShareIcon>}></NavigatorHeader>
            </div>
            <div className="mx-5 mb-5">
                <div className="mt-5">
                    <div className="row">
                        <div className="col-3">
                            <Box  >
                                <FormControl
                                    fullWidth
                                    size="medium"
                                >
                                    <InputLabel>
                                Tipologia Fattura  
                                    </InputLabel>
                                    <Select
                                        label='Tipologia Fattura'
                                        onChange={(e) =>{
                                            setTipologia(e.target.value);
                                        }}     
                                        value={tipologia}       
                                    >
                                        {tipologieFatture.map((el) =>{ 
                                            return (            
                                                <MenuItem
                                                    key={Math.random()}
                                                    value={el}
                                                >
                                                    {el}
                                                </MenuItem>              
                                            );
                                        } )}
                                    </Select>
                                </FormControl>
                            </Box>   
                        </div>

                        <div className="col-2">
                          
                            <div className="d-flex justify-content-center align-items-center" style={{height: "59px"}} >
                                <Button  
                                    variant='outlined'
                                    disabled={selected.length < 1}
                                    onClick={onButtonInvia}
                                >Invia</Button>
                            </div>
                        </div>
                        <div className="row mt-5">
                            <div className="col-12">
                                { selected?.length > 0 ? <Toolbar
                                    sx={{bgcolor:"rgba(23, 50, 77, 0.08)"}}
                                >
                                    <Typography
                                        sx={{ flex: '1 1 100%' }}
                                        color="inherit"
                                        variant="subtitle1"
                                        component="div"
                                    >
                                        {`${selected?.length}  Selezionate`} 
                                    </Typography>
                                </Toolbar>:
                                   
                                    <Typography
                                        sx={{ flex: '1 1 100%', visibility: 'hidden', height:'64px' }} // Hidden placeholder to keep layout
                                        variant="subtitle1"
                                        component="div"
                                    >
                                        Placeholder
                                    </Typography>
                                }
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                <div className="mt-1 mb-5" style={{ width: '100%'}}> 
                                    <DataGrid
                                        sx={{
                                            height:'400px',
                                            '& .MuiDataGrid-virtualScroller': {
                                                backgroundColor: 'white',
                                            }
                                        }}
                                        getRowId={(row) => row.id}
                                        rows={listaFatture}
                                        columns={columns}
                                        pageSizeOptions={[10, 25, 50,100]}
                                        checkboxSelection
                                        onRowClick={handleEvent}
                                        onCellClick={handleOnCellClick}
                                        onRowSelectionModelChange={(newRowSelectionModel) => {
                                           
                                            const createObjectToSend = newRowSelectionModel.reduce((acc:any,singleEl) => {
                                                const getElementWithSameId = listaFatture.filter((el:ListaFatture) => el?.id === singleEl);  
                                                return [...acc,...getElementWithSameId];
                                            },[]).map(el => ({
                                                annoRiferimento: el.annoRiferimento,
                                                meseRiferimento: el.meseRiferimento,
                                                tipologiaFattura: el.tipologiaFattura
                                            }));
                                            console.log({createObjectToSend});
                                            setSelected(createObjectToSend);
                                        }}
                                        onPaginationModelChange={(e)=> onChangePageOrRowGrid(e)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ModalLoading 
                open={showLoader} 
                setOpen={setShowLoader}
                sentence={'Loading...'} >
            </ModalLoading>
        </>
       
    );
};

export default InvioFatture;

/*
   <Box
                                    sx={{
                                        overflowY: "auto",
                                        whiteSpace: "nowrap",
                                        backgroundColor:'#F8F8F8',
                                        height:'500px',
                                        marginY:'2%'
                                    }}>
<Table  aria-label="purchases">
                                        <TableHead sx={{position: "sticky", top:'0',zIndex:"2",backgroundColor: "#F2F2F2"}}>
                                            <TableRow >
                                                <TableCell sx={{ marginLeft:"16px"}} ></TableCell>
                                                <TableCell sx={{ marginLeft:"16px"}} ></TableCell>
                                                <TableCell align='center' sx={{ marginLeft:"16px"}} >Tipologia Fattura</TableCell>
                                                <TableCell align='center' sx={{ marginLeft:"16px"}} >Stato</TableCell>
                                                <TableCell align='center' sx={{ marginLeft:"16px"}}>Numero Fatture</TableCell>
                                                <TableCell align='center' sx={{ marginLeft:"16px"}}>Anno</TableCell>
                                                <TableCell align='center' sx={{ marginLeft:"16px"}}>Mese</TableCell>
                                                <TableCell align='center' sx={{ marginLeft:"16px"}}>Importo imponibile</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        {listaFatture.map((el) =>{
                                            return(
                                                <RowJsonSap row={el} setSelected={setSelected} selected={selected} apiDetail={getDetailSingleRow} lista={listaFatture}></RowJsonSap>
                                            );
                                        } )}
                              
                                    </Table> 
                                    </Box>*/