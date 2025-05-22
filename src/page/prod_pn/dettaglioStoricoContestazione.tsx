import { useNavigate } from "react-router";
import NavigatorHeader from "../../components/reusableComponents/navigatorHeader";
import { PathPf } from "../../types/enum";
import GavelIcon from '@mui/icons-material/Gavel';
import SkeletonRelPdf from "../../components/rel/skeletonRelPdf";
import { useContext, useEffect, useState } from "react";
import { Box,IconButton,Table, TableBody, TableCell, TableHead, TableRow,Typography } from "@mui/material";
import TextDettaglioPdf from "../../components/commessaPdf/textDettaglioPdf";
import { GlobalContext } from "../../store/context/globalContext";
import { getContestazioneExel, getDettaglioContestazione } from "../../api/apiPagoPa/notifichePA/api";
import { manageError, manageErrorDownload } from "../../api/api";
import { mesiGrid} from "../../reusableFunction/reusableArrayObj";
import { findStatoContestazioni } from "../../reusableFunction/function";
import DownloadIcon from '@mui/icons-material/Download';
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
interface Contestazione {
    reportId: number;
    step:number;
    descrizioneStep:string;
    totaleNotificheAnalogicheAR:null;
    totaleNotificheAnalogiche890:null;
    totaleNotificheDigitali: null;
    totaleNotifiche:null;
    link:string;
    nonContestataAnnullata:null;
    contestataEnte: null;
    accettata:null;
    rispostaSend:null;
    rispostaRecapitista:null;
    rispostaConsolidatore:null;
    rifiutata:null;
    nonFatturabile:null;
    fatturabile:null;
    storage:string;
    nomeDocumento:string;
    dataCompletamento:Date;
}

const DettaglioStoricoContestazione = () => {

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const singleContest = mainState.contestazioneSelected;
    const navigate = useNavigate();

    const [loadingDettaglio,setLoadingDettaglio] = useState(false);
    const [arrayDetails,setArrayDetails] = useState<Contestazione[]>([]);
    const [lastStepContestazioneObj, setLastStepContestazioneObj] = useState<Contestazione|null>(null);
    const [showDownloading, setShowDownloading] = useState(false);

    useEffect(()=>{
        if(singleContest?.reportId !== 0){
            getDettaglio();
        }
    },[singleContest?.reportId]);

    const getDettaglio = async() => {
        setLoadingDettaglio(true);
        await getDettaglioContestazione(token,profilo.nonce,singleContest?.reportId).then((res)=>{
            const step11Obj = res.data.find((el) => {
                return el.step === 11;
            });
            setLastStepContestazioneObj(step11Obj||null);
            setArrayDetails(res.data);
            setLoadingDettaglio(false);
        }).catch((err) => {
            manageError(err,dispatchMainState);
            setLoadingDettaglio(false);
            navigate(PathPf.STORICO_CONTEST);
        });
    };

    const downloadSigleDetail = async(body) => {
        setShowDownloading(true);
        await getContestazioneExel(token,profilo.nonce,body).then((res)=>{
            setShowDownloading(false);
            const link = document.createElement("a");
            link.href = res.data;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(res.data);
        }).catch(() => {
            setShowDownloading(false);
            manageErrorDownload('404',dispatchMainState);
        });
    };

    if(loadingDettaglio){
        return <SkeletonRelPdf/>;
    }

    return (
        <div>
            <div>
                <NavigatorHeader pageFrom={"Contestazioni/"} pageIn={"Dettaglio"} backPath={PathPf.STORICO_CONTEST} icon={<GavelIcon  sx={{padding:"3px"}}  fontSize='small'></GavelIcon>}></NavigatorHeader>
            </div>
            <div className="bg-white m-5">
                <div className="d-flex justify-content-center pt-5">
                    <Typography variant="h4">{singleContest.ragioneSociale} {mesiGrid[singleContest.mese]} {singleContest.anno}</Typography>
                </div>
                <div className="pt-3 pb-3 ">
                    <div className="container text-center">
                        <TextDettaglioPdf description='Categoria documento' value={singleContest.categoriaDocumento}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Data inserimento' value={new Date(singleContest.dataInserimento).toISOString().replace("T", " ").substring(0, 19)}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Stato' value={findStatoContestazioni(singleContest.stato)||''}></TextDettaglioPdf>
                        {lastStepContestazioneObj && 
                        <>
                            <Box sx={{ margin: 5 , backgroundColor:'#F8F8F8', padding:'10px'}}>
                                <Table size="small" aria-label="purchases">
                                    <TableHead>
                                        <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                            <TableCell align="center" sx={{ width:"300px"}}>Contestate Ente</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>Risposte send</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>Risposte Recapitista</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>Risposte Consolidatore</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>Risposte Ente</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>Accettate</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>Rifiutate</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>Annulate</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                        <TableRow key={lastStepContestazioneObj?.reportId}>
                                            <TableCell align="center"  sx={{ width:"300px"}} >{lastStepContestazioneObj?.contestataEnte}</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}} >{lastStepContestazioneObj?.rispostaSend}</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>{lastStepContestazioneObj?.rispostaRecapitista}</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>{lastStepContestazioneObj?.rispostaConsolidatore}</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>xxx</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>{lastStepContestazioneObj?.accettata}</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>{lastStepContestazioneObj?.rifiutata}</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>xxx</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Box>
                            <div className="d-flex justify-content-between">
                                <Box sx={{ marginX: 5 , backgroundColor:'#F2F2F2', padding:'10px'}}>
                                    <Table size="small" aria-label="purchases">
                                        <TableHead>
                                            <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                                <TableCell align="center" sx={{ width:"300px"}} ><Typography variant="h6">Fatturabili</Typography></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                            <TableRow>
                                                <TableCell align="center"  sx={{ width:"300px"}} ><Typography variant="button">{lastStepContestazioneObj?.fatturabile}</Typography></TableCell>
                                            </TableRow>  
                                        </TableBody>
                                    </Table>
                                </Box>
                                <Box sx={{ marginX: 5 , backgroundColor:'#F2F2F2', padding:'10px'}}>
                                    <Table size="small" aria-label="purchases">
                                        <TableHead>
                                            <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                                <TableCell align="center" sx={{ width:"300px"}} ><Typography variant="h6">Non Fatturabili</Typography></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                            <TableRow>
                                                <TableCell align="center" sx={{ width:"300px"}} ><Typography variant="button">{lastStepContestazioneObj?.nonFatturabile}</Typography></TableCell>
                                            </TableRow>  
                                        </TableBody>
                                    </Table>
                                </Box>
                            </div>
                        </>
                        }
                    </div>
                </div> 
            </div>
            <div className="bg-white mb-5 me-5 ms-5">
                <div className="d-flex justify-content-center pt-3">
                    <Typography variant="h4">Dettaglio</Typography>
                </div>
                <div className=" pb-3 ">
                    <div className="container text-center">
                        <div className="row">
                            <div className="col-12" >
                                <Box  sx={{ margin: 2 , backgroundColor:'#F8F8F8', padding:'10px'}}>
                                    <Box style={{overflowY: "auto", maxHeight: "500px",margin:2, backgroundColor:'#F8F8F8'}}>
                                        <Table size="small" stickyHeader  >
                                            <TableHead sx={{position: "sticky",top: 0, zIndex: 1}}>
                                                <TableRow >
                                                    <TableCell align="center" >Processo</TableCell>
                                                    <TableCell align="center">Data Processo</TableCell>
                                                    <TableCell align="center">Tot. Not. Digit.</TableCell>
                                                    <TableCell align="center">Tot. Not. Analog. 890</TableCell>
                                                    <TableCell align="center">Tot. Not. AR</TableCell>
                                                    <TableCell align="center">Tot. Not.</TableCell>
                                                    <TableCell align="center"></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            {arrayDetails.map((obj)=>{
                                                return ( 
                                                    <TableRow key={Math.random()} sx={{ borderBottom: '3px solid #ccc' }}  >
                                                        <TableCell  sx={{ borderBottomWidth: '3px' }}   align="center">{obj?.descrizioneStep ||"-"}</TableCell>
                                                        <TableCell sx={{ borderBottomWidth: '3px' }} align="center"  > {obj?.dataCompletamento ?new Date(obj.dataCompletamento).toISOString().replace("T", " ").substring(0, 19):"-"} </TableCell>
                                                        <TableCell sx={{ borderBottomWidth: '3px' }} align="center">{obj?.totaleNotificheDigitali ||"-"}</TableCell>
                                                        <TableCell sx={{ borderBottomWidth: '3px' }} align="center">{obj?.totaleNotificheAnalogiche890||"-"}</TableCell>
                                                        <TableCell sx={{ borderBottomWidth: '3px' }} align="center">{obj?.totaleNotificheAnalogicheAR||"-"}</TableCell>
                                                        <TableCell sx={{ borderBottomWidth: '3px' }} align="center">{obj?.totaleNotifiche||"-"}</TableCell>
                                                        <TableCell  sx={{ borderBottomWidth: '3px' }} align="center"><IconButton onClick={() => downloadSigleDetail({idreport:obj.reportId,step:obj.step})} disabled={obj?.nomeDocumento ? false : true}><DownloadIcon color={obj?.nomeDocumento ? "primary" : "disabled"}></DownloadIcon></IconButton></TableCell>
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
            <ModalLoading 
                open={showDownloading} 
                setOpen={setShowDownloading}
                sentence={'Downloading...'} >
            </ModalLoading>
        </div>
      
    );
};

export default DettaglioStoricoContestazione;