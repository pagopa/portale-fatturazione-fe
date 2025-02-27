import { useContext, useEffect, useState } from "react";
import NavigatorHeader from "../components/reusableComponents/navigatorHeader";
import { PathPf } from "../types/enum";
import IosShareIcon from '@mui/icons-material/IosShare';
import { GlobalContext } from "../store/context/globalContext";
import { getListaJsonFatturePagoPa, invioListaJsonFatturePagoPa, sendListaJsonFatturePagoPa } from "../api/apiPagoPa/fatturazionePA/api";
import { manageError, managePresaInCarico } from "../api/api";
import { Box } from "@mui/system";
import { InputLabel, Select, MenuItem, FormControl, Table, TableCell, TableHead, TableRow, Button } from "@mui/material";
import RowJsonSap from "../components/fatturazione/rowPopJson";
import Loader from "../components/reusableComponents/loader";


interface ListaFatture {
    tipologiaFattura: string,
    statoInvio:number,
    numeroFatture: number,
    annoRiferimento: number,
    meseRiferimento: number,
    importo: number
}

interface SelectedJsonSap {
    annoRiferimento: number,
    meseRiferimento: number,
    tipologiaFattura: string
}


const InvioFatture = () => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState,dispatchMainState,setErrorAlert} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    
    const [listaFatture, setListaFatture] = useState<ListaFatture[]>([]);
    const [tipologieFatture, setTipologie] = useState<string[]>([]);
    const [selected,setSelected] = useState<SelectedJsonSap[]>([]);
    const [tipologia, setTipologia] = useState('Tutte');
    const [showLoader, setShowLoader] = useState(false);

    
    console.log({selected});
    useEffect(()=>{
      
        getLista(tipologia);
          
    },[]);

    
    useEffect(()=>{
        if( tipologia !== 'Tutte'){
            getLista(tipologia);
            setSelected([]);
        }
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
            let elOrdered = res.data.map(el => {
                return {
                    tipologiaFattura: el.tipologiaFattura,   
                    statoInvio: el.statoInvio,
                    numeroFatture: el.numeroFatture,
                    annoRiferimento: el.annoRiferimento,
                    meseRiferimento: el.meseRiferimento,
                    importo: el.importo
                };
            }); 
    
            if(tipologia !== 'Tutte'){
                elOrdered = res.data.filter(el => el.tipologiaFattura === tipologia);
            }
              
            setListaFatture(elOrdered);
        }).catch((err)=>{
            manageError(err, dispatchMainState);
        });
    };
    
    const getDetailSingleRow = async(body,setStateSingleRow) => {
      
        await sendListaJsonFatturePagoPa(token,profilo.nonce,body).then((res)=>{
            // setErrorSingleRowDetail(false);
            const orderData = res.data.map(el => {
                return {
                    ragioneSociale: el.ragioneSociale,
                    tipologiaFattura: el.tipologiaFattura,
                    annoRiferimento: el.annoRiferimento,
                    meseRiferimento:el.meseRiferimento,
                    dataFattura:el.dataFattura,
                    importo:el.importo
                };
            });
         
            setStateSingleRow(orderData);
        }).catch(()=>{
            setStateSingleRow([]);
            managePresaInCarico("ERROR_LIST_JSON_TO_SAP",dispatchMainState);
        });
 
    };
    
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
                            {!showLoader ?
                                <div className="d-flex justify-content-center align-items-center" style={{height: "59px"}} >
                                    <Button  
                                        variant='outlined'
                                        disabled={selected.length < 1}
                                        onClick={onButtonInvia}
                                    >Invia</Button>
                                </div>
                                :
                                <div id='loader_on_modal' className='container_buttons_modal d-flex justify-content-center mt-5'>
                                    <Loader sentence={'Attendere...'}></Loader> 
                                </div>}
                        </div>
                        <div className="row mt-5">
                            <div className="col-12">
                                <Box
                                    sx={{
                                        overflowY: "auto",
                                        whiteSpace: "nowrap",
                                        backgroundColor:'#F8F8F8',
                                        height:'500px',
                                        marginY:'2%'
                                    }}
                                >
                                    <Table  aria-label="purchases">
                                        <TableHead sx={{position: "sticky", top:'0',zIndex:"2",backgroundColor: "#E3E6E9"}}>
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
                                </Box>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
       
    );
};

export default InvioFatture;

