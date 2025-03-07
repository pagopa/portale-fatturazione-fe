import NavigatorHeader from "../components/reusableComponents/navigatorHeader";
import IosShareIcon from '@mui/icons-material/IosShare';
import { PathPf } from "../types/enum";
import { TableHead, TableRow, TableCell, Typography, Table,  Tooltip, IconButton, TextField, Popover} from "@mui/material";
import { Box} from "@mui/system";
import { mesiGrid, month } from "../reusableFunction/reusableArrayObj";
import SkeletonRelPdf from "../components/rel/skeletonRelPdf";
import { useContext, useEffect, useState } from "react";
import { sendListaJsonFatturePagoPa } from "../api/apiPagoPa/fatturazionePA/api";
import { GlobalContext } from "../store/context/globalContext";
import { managePresaInCarico } from "../api/api";
import { useNavigate, useParams } from "react-router";
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SkeletonGridLoading from "../components/reusableComponents/skeletonGridLoading";

interface DetailsSingleRow 
{
    idFattura?: number,
    tipologiaFattura: string,
    idEnte?: string,
    ragioneSociale: string,
    annoRiferimento: number,
    meseRiferimento: number,
    importo: number,
    dataFattura: string
}

const InvioFattureDetails = () => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState,dispatchMainState } = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();

    const { id } = useParams();
    const idSplitted:string[] = id?.split('-')||["","",""];

    const [loadingDetail, setLoadingDetail] = useState(true);
    const [loadingCustomAction, setLoadingCustomAction] = useState(false);
    const [detailsSingleRow, setDetailsSingleRow] = useState<DetailsSingleRow[]>([]);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [inputPopOver, setInputPopOver] = useState('');
    const [sortImport, setSortImport] = useState<boolean|null>(null);
    
    const open = Boolean(anchorEl);
    const idPop = open ? 'simple-popover' : undefined;


    useEffect(()=>{
        const timer = setTimeout(() => {
            getDetailSingleRow();
        }, 500);
        return () => clearTimeout(timer);
    },[inputPopOver, sortImport]);


    const filter = async(data) => {
        return await data.data.filter((item) => {
            if(inputPopOver.length >= 3){
                return item?.ragioneSociale?.toLowerCase().includes(inputPopOver.toLowerCase());
            }else{
                return item;
            }
        }).sort((a, b) => {
            if(sortImport === null){
                return b;
            }else if(sortImport === true){
                return  b.importo - a.importo;
            }else{
                return a.importo - b.importo;
            }
            
        },[]);
    };

    const getDetailSingleRow = async() => {
        setLoadingCustomAction(true);
        await sendListaJsonFatturePagoPa(token,profilo.nonce,{annoRiferimento: Number(idSplitted[0]),meseRiferimento: Number(idSplitted[1]),tipologiaFattura: idSplitted[2]}).then(async(res)=>{
            // setErrorSingleRowDetail(false);
            
            const x  = await filter(res).then(res => res).catch(err => console.log({err}));
            const orderData : DetailsSingleRow[] = x.map(el => {
                return {
                    ragioneSociale:el.ragioneSociale,
                    tipologiaFattura: el.tipologiaFattura,
                    annoRiferimento: el.annoRiferimento,
                    meseRiferimento:el.meseRiferimento,
                    dataFattura:el.dataFattura,
                    importo:el.importo?.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
                };
            });
            setDetailsSingleRow(orderData);
            setLoadingCustomAction(false);
            setLoadingDetail(false); 
        }).catch((err)=>{
            managePresaInCarico("ERROR_LIST_JSON_TO_SAP",dispatchMainState);
            navigate(PathPf.JSON_TO_SAP);
        });
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClickArrow = () => {
        setLoadingCustomAction(true);
        if(sortImport === null){
            setSortImport(true);
        }else if(sortImport === true){
            setSortImport(false);
        }else if(sortImport === false){
            setSortImport(null);
        }
    };
    
  
    const handleClose = () => {
        setAnchorEl(null);
    };
  
  

    if(loadingDetail){
        return(
            <div className="m-3">
                <SkeletonRelPdf/>
            </div> 
        );
    }else{
        return(
            <>
                <div>
                    <NavigatorHeader pageFrom={"Documenti emessi/Inserimento fatture/"} pageIn={"Dettaglio"} backPath={PathPf.JSON_TO_SAP} icon={<IosShareIcon sx={{paddingBottom:"5px"}}  fontSize='small'></IosShareIcon>}></NavigatorHeader>
                </div>

                <div className="bg-white m-5">
                    <div className="d-flex justify-content-center pt-3">
                        <Typography variant="h4">{`${idSplitted[2]} ${mesiGrid[idSplitted[1]]} ${idSplitted[0]}`}</Typography>
                    </div>
                    <div className=" pb-3 ">
                        <div className="container text-center">
                            <div className="row">
                                <div className="col-12" >
                                    <Box  sx={{ margin: 2 , backgroundColor:'#F8F8F8', padding:'10px'}}>
                                        <Box style={{
                                            overflowY: "auto",
                                            maxHeight: "500px",
                                            margin: 2 ,
                                            backgroundColor:'#F8F8F8',    
                                        }} >
                                            
                                            <Table stickyHeader  >
                                                <TableHead sx={{
                                                    position: "sticky",
                                                    top: 0,
                                                    zIndex: 1   
                                                }}>
                                                    <TableRow >
                                                        <TableCell align="center" > Ragione sociale  <Tooltip
                                                            title={'Filtra'}  
                                                        >
                                                            <>   <Tooltip
                                                                title="Filtra"   
                                                            >
                                                                <IconButton sx={{marginLeft:'10px'}} aria-describedby={idPop} onClick={handleClick} aria-label="Filtra" size="small">
                                                                    <FilterListIcon></FilterListIcon>
                                                                </IconButton>
                                                            </Tooltip>
                                                                
                                                            <Popover anchorOrigin={{
                                                                vertical: 'top',
                                                                horizontal: 'right',
                                                            }} 
                                                            open={open}
                                                            anchorEl={anchorEl}
                                                            onClose={handleClose}id={idPop}>
                                                                    
                                                                <TextField onChange={(e) => setInputPopOver(e.target.value)} sx={{borderRadius:'20px'}} value={inputPopOver}  placeholder={"Min 3 caratteri"} variant="outlined" />
                                                            </Popover>
                                                            </>
                                                        </Tooltip></TableCell>
                                                        <TableCell align="center" >Data Fattura</TableCell>
                                                        <TableCell align="center" >T. Fattura</TableCell>
                                                        <TableCell align="center" >Anno</TableCell>
                                                        <TableCell align="center" >Mese</TableCell>
                                                        <TableCell align="center" >Importo
                                                            <Tooltip
                                                                title="Sort"   
                                                            >
                                                                <IconButton sx={{marginLeft:'10px'}}  onClick={handleClickArrow}  size="small">
                                                                    {(sortImport === null || sortImport === true) ? <ArrowUpwardIcon></ArrowUpwardIcon>:<ArrowDownwardIcon></ArrowDownwardIcon>}
                                                                </IconButton>
                                                            </Tooltip>
                                                           
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                {loadingCustomAction ? 
                                                    <SkeletonGridLoading columnLength={10} rowLength={6}></SkeletonGridLoading> 
                                                    : detailsSingleRow.map((obj)=>{
                                                        return ( 
                                                            <TableRow key={Math.random()}>
                                                                
                                                                <Tooltip
                                                                    title={obj.ragioneSociale}
                                                                ><TableCell sx={{color:'#0D6EFD',fontWeight: 'bold',width:"300px"}} >
                                                                        {obj.ragioneSociale?.toString().length > 30 ? obj.ragioneSociale?.toString().slice(0, 27) + '...' : obj.ragioneSociale}
                                                                    </TableCell>
                                                                </Tooltip>
                                                               
                                                                <TableCell align="center">{new Date(obj.dataFattura).toLocaleString().split(",")[0]||''}</TableCell>
                                                                <TableCell align="center">{obj.tipologiaFattura}</TableCell>
                                                                <TableCell align="center" > {obj.annoRiferimento} </TableCell>
                                                                <TableCell align="center">{month[obj.meseRiferimento-1]}</TableCell>
                                                                <TableCell  align="right">
                                                                    {obj.importo}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                            </Table>
                                        </Box>
                                    </Box>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> 
            </>
        );
    }
};

export default InvioFattureDetails;
