import { useNavigate } from "react-router";
import NavigatorHeader from "../../components/reusableComponents/navigatorHeader";
import { PathPf } from "../../types/enum";
import GavelIcon from '@mui/icons-material/Gavel';
import SkeletonRelPdf from "../../components/rel/skeletonRelPdf";
import { useContext, useEffect, useState } from "react";
import { Box,FormControl,IconButton,InputLabel,MenuItem,Select,Table, TableBody, TableCell, TableHead, TableRow,Typography } from "@mui/material";
import TextDettaglioPdf from "../../components/commessaPdf/textDettaglioPdf";
import { GlobalContext } from "../../store/context/globalContext";
import { getContestazioneExel, getDettaglioContestazione } from "../../api/apiPagoPa/notifichePA/api";
import { manageError, manageErrorDownload } from "../../api/api";
import { mesiGrid} from "../../reusableFunction/reusableArrayObj";
import DownloadIcon from '@mui/icons-material/Download';
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { downloadReportContestazione, getDettaglioContestazionePA, getTipoContestazioni } from "../../api/apiPagoPa/storicoContestazioni/api";
import { downloadReportContestazioneSE, getContestazioneExelSE, getDettaglioContestazioneSE, getTipoContestazioniSE } from "../../api/apiSelfcare/storicoContestazioneSE/api";
interface Contestazione {
    reportId: number;
    step:number;
    descrizioneStep:string;
    totaleNotificheAnalogicheARNazionaliAR:null;
    totaleNotificheAnalogiche890:null;
    totaleNotificheDigitali: null;
    totaleNotificheAnalogicheARInternazionaliRIR:null;
    totaleNotificheAnalogicheRSInternazionaliRIS:null;
    totaleNotificheAnalogicheRSNazionaliRS:null;
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
    dataCompletamento:string;
    rispostaEnte:string
}

const DettaglioStoricoContestazione = () => {

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const singleContest = mainState.contestazioneSelected;
    const navigate = useNavigate();

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    const [loadingDettaglio,setLoadingDettaglio] = useState(false);
    const [arrayDetails,setArrayDetails] = useState<Contestazione[]>([]);
    const [lastStepContestazioneObj, setLastStepContestazioneObj] = useState<Contestazione|null>(null);
    const [showDownloading, setShowDownloading] = useState(false);
    const [tipologieContestazioni , setTipologieContestazioni] = useState<{step:number, descrizione:string}[]>([]);
    const [fileType, setFileType] = useState("");

    useEffect(()=>{
        if(singleContest?.reportId !== 0){
            getDettaglio(); 
        }
    },[singleContest?.reportId]);

    useEffect(()=>{
        getTipologieContestazioni();
    },[]);

    const getTipologieContestazioni = async() => {
        if(profilo.auth === "SELFCARE"){
            await getTipoContestazioniSE(token,profilo.nonce).then((res)=>{
                setTipologieContestazioni(res.data.map(el => el));
            }).catch((err)=>{
                manageError(err,dispatchMainState);
            });
        }else{
            await getTipoContestazioni(token,profilo.nonce).then((res)=>{
                setTipologieContestazioni(res.data.map(el => el));
            }).catch((err)=>{
                manageError(err,dispatchMainState);
            });
        }
       
    };

    const getDettaglio = async() => {
        setLoadingDettaglio(true);
        if(profilo.auth === "SELFCARE"){
            await getDettaglioContestazioneSE(token,profilo.nonce,singleContest?.reportId).then((res)=>{
                const step11Obj = res.data.find((el) => {
                    return el.step === 99;
                });
                setLastStepContestazioneObj(step11Obj||null);
                setArrayDetails(res.data);
                setLoadingDettaglio(false);
            }).catch((err) => {
                manageError(err,dispatchMainState);
                setLoadingDettaglio(false);
                navigate(PathPf.STORICO_CONTEST_ENTE);
            });
        }else{
            await getDettaglioContestazionePA(token,profilo.nonce,{idReport:singleContest?.reportId}).then((res)=>{
                console.log({res});
                handleModifyMainState({contestazioneSelected:res.data.reportContestazione});
            }).catch((err)=>{
                manageError(err,dispatchMainState);
            });
            await getDettaglioContestazione(token,profilo.nonce,singleContest?.reportId).then((res)=>{
                const step11Obj = res.data.find((el) => {
                    return el.step === 99;
                });
                setLastStepContestazioneObj(step11Obj||null);
                setArrayDetails(res.data);
                setLoadingDettaglio(false);
            }).catch((err) => {
                manageError(err,dispatchMainState);
                setLoadingDettaglio(false);
                navigate(PathPf.STORICO_CONTEST);
            });
        }
       
    };

    const downloadSigleDetail = async(body) => {
        setShowDownloading(true);
        if(profilo.auth === "SELFCARE"){
            await getContestazioneExelSE(token,profilo.nonce,body).then((res)=>{
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
        }else{
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
        }
      
    };




    const downloadMainReport = async() => {
        setShowDownloading(true);
        if(profilo.auth === "SELFCARE"){
            await downloadReportContestazioneSE(token,profilo.nonce,Number(singleContest.reportId),fileType)
                .then((res)=>{
                    if(fileType === "JSON"){
                        const link = document.createElement("a");
                        const jsonData = JSON.stringify(res.data.Steps[0], null, 2);
                        const blob = new Blob([jsonData], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        link.href = url;
                        link.download = `Report contestazione/${singleContest.ragioneSociale}/${mesiGrid[singleContest.mese]}/${singleContest.anno}.json`;
                        link.click();
                        URL.revokeObjectURL(url);
                    }else if(fileType === "CSV"){
                        const blob = new Blob([res.data], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.setAttribute('hidden', '');
                        a.setAttribute('href', url);
                        a.setAttribute('download',`Report contestazione/${singleContest.ragioneSociale}/${mesiGrid[singleContest.mese]}/${singleContest.anno}.csv`);
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a); 
                    }
                    setShowDownloading(false);
                }).catch((err)=>{
                    setShowDownloading(false);
                    manageErrorDownload('404',dispatchMainState);
                });
        }else{
            await downloadReportContestazione(token,profilo.nonce,Number(singleContest.reportId),fileType)
                .then((res)=>{
                    if(fileType === "JSON"){
                        const link = document.createElement("a");
                        const jsonData = JSON.stringify(res.data.Steps[0], null, 2);
                        const blob = new Blob([jsonData], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        link.href = url;
                        link.download = `Report contestazione/${singleContest.ragioneSociale}/${mesiGrid[singleContest.mese]}/${singleContest.anno}.json`;
                        link.click();
                        URL.revokeObjectURL(url);
                    }else if(fileType === "CSV"){
                        const blob = new Blob([res.data], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.setAttribute('hidden', '');
                        a.setAttribute('href', url);
                        a.setAttribute('download',`Report contestazione/${singleContest.ragioneSociale}/${mesiGrid[singleContest.mese]}/${singleContest.anno}.csv`);
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a); 
                    }
                    setShowDownloading(false);
                }).catch((err)=>{
                    setShowDownloading(false);
                    manageErrorDownload('404',dispatchMainState);
                });
        }
        
    };

    if(loadingDettaglio){
        return <SkeletonRelPdf/>;
    }

    return (
        <div>
            <div>
                <NavigatorHeader pageFrom={"Contestazioni/"} pageIn={"Dettaglio"} backPath={profilo.auth === "SELFCARE" ? PathPf.STORICO_CONTEST_ENTE :PathPf.STORICO_CONTEST} icon={<GavelIcon  sx={{padding:"3px"}}  fontSize='small'></GavelIcon>}></NavigatorHeader>
            </div>
            <div className="bg-white m-5">
                <div className="d-flex justify-content-center pt-5">
                    <Typography variant="h4">{singleContest.ragioneSociale} {mesiGrid[singleContest.mese]} {singleContest.anno}</Typography>
                </div>
                <div className="pt-3 pb-3 ">
                    <div className="container text-center">
                        <TextDettaglioPdf description='Categoria documento' value={singleContest.categoriaDocumento}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Data inserimento' value={(singleContest.dataInserimento||'')?.replace("T", " ")?.substring(0, 19)}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Stato' value={singleContest.descrizioneStato?.charAt(0)?.toUpperCase() + singleContest.descrizioneStato?.slice(1)||''}></TextDettaglioPdf>
                        {(singleContest.stato === 3) && 
                        <>
                            <Box sx={{ margin: 5 , backgroundColor:'#F8F8F8', padding:'10px'}}>
                                <Table size="small" aria-label="purchases">
                                    <TableHead>
                                        <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                            <TableCell align="center" sx={{ width:"300px"}}>Contestate Ente</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>Risposte send</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>Risposte Recapitista</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>Risposte Consolidatore</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                        <TableRow key={lastStepContestazioneObj?.reportId}>
                                            <TableCell align="center"  sx={{ width:"300px"}} >{lastStepContestazioneObj?.contestataEnte||0}</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}} >{lastStepContestazioneObj?.rispostaSend||0}</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>{lastStepContestazioneObj?.rispostaRecapitista||0}</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>{lastStepContestazioneObj?.rispostaConsolidatore||0}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Box>

                            <Box sx={{ margin:5, backgroundColor:'#F8F8F8', padding:'10px'}}>
                                <Table size="small" aria-label="purchases">
                                    <TableHead>
                                        <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                            <TableCell align="center" sx={{ width:"300px"}}>Risposte Ente</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>Accettate</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>Rifiutate</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>Annullate</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                        <TableRow key={lastStepContestazioneObj?.reportId}>
                                            <TableCell align="center" sx={{ width:"300px"}}>{lastStepContestazioneObj?.rispostaEnte||0}</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>{lastStepContestazioneObj?.accettata||0}</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>{lastStepContestazioneObj?.rifiutata||0}</TableCell>
                                            <TableCell align="center" sx={{ width:"300px"}}>{lastStepContestazioneObj?.nonContestataAnnullata||0}</TableCell>
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
                                                <TableCell align="center"  sx={{ width:"300px"}} ><Typography variant="button">{lastStepContestazioneObj?.fatturabile||0}</Typography></TableCell>
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
                                                <TableCell align="center" sx={{ width:"300px"}} ><Typography variant="button">{lastStepContestazioneObj?.nonFatturabile||0}</Typography></TableCell>
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
                                                    <TableCell align="center">Digit.</TableCell>
                                                    <TableCell align="center">Analog. 890</TableCell>
                                                    <TableCell align="center">AR</TableCell>
                                                    <TableCell align="center">RIR </TableCell>
                                                    <TableCell align="center">RIS </TableCell>
                                                    <TableCell align="center">RS </TableCell>
                                                    <TableCell align="center">Tot. Notifiche</TableCell>
                                                    <TableCell align="center"></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            {arrayDetails.map((obj)=>{
                                                return ( 
                                                    <TableRow key={Math.random()} sx={{ borderBottom: '3px solid #ccc' }}  >
                                                        <TableCell  sx={{ borderBottomWidth: '3px' }}   align="center">{obj?.descrizioneStep ||"-"}</TableCell>
                                                        <TableCell sx={{ borderBottomWidth: '3px' }} align="center"  > {obj?.dataCompletamento ? obj.dataCompletamento?.replace("T", " ").substring(0, 19):"-"} </TableCell>
                                                        <TableCell sx={{ borderBottomWidth: '3px' }} align="center">{obj?.totaleNotificheDigitali === null ? "-" : obj?.totaleNotificheDigitali}</TableCell>
                                                        <TableCell sx={{ borderBottomWidth: '3px' }} align="center">{obj?.totaleNotificheAnalogiche890 === null ? "-" : obj?.totaleNotificheAnalogiche890}</TableCell>
                                                        <TableCell sx={{ borderBottomWidth: '3px' }} align="center">{obj?.totaleNotificheAnalogicheARNazionaliAR  === null ? "-" : obj?.totaleNotificheAnalogicheARNazionaliAR}</TableCell>
                                                        <TableCell sx={{ borderBottomWidth: '3px' }} align="center">{obj?.totaleNotificheAnalogicheARInternazionaliRIR === null ? "-" : obj?.totaleNotificheAnalogicheARInternazionaliRIR}</TableCell>
                                                        <TableCell sx={{ borderBottomWidth: '3px' }} align="center">{obj?.totaleNotificheAnalogicheRSInternazionaliRIS === null ? "-" : obj?.totaleNotificheAnalogicheRSInternazionaliRIS}</TableCell>
                                                        <TableCell sx={{ borderBottomWidth: '3px' }} align="center">{obj?.totaleNotificheAnalogicheRSNazionaliRS === null ? "-" : obj?.totaleNotificheAnalogicheRSNazionaliRS }</TableCell>
                                                        <TableCell sx={{ borderBottomWidth: '3px' }} align="center">{obj?.totaleNotifiche === null ? "-" : obj?.totaleNotifiche}</TableCell>
                                                        <TableCell  sx={{ borderBottomWidth: '3px' }} align="center"><IconButton onClick={() => downloadSigleDetail({idReport:obj.reportId,step:obj.step})} disabled={obj?.nomeDocumento ? false : true}><DownloadIcon color={obj?.nomeDocumento ? "primary" : "disabled"}></DownloadIcon></IconButton></TableCell>
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
                {(singleContest.stato === 2 || singleContest.stato === 3) && 
                <div className=" pb-3 ">
                    <div className="container text-center">
                        <div className="row">
                            <div className="col-12" >
                                <Box  sx={{ margin: 2 ,paddingRight:'30px',paddingLeft:"10px",paddingBottom:"10px"}}>
                                    <div className="d-flex justify-content-end">
                                        <Box sx={{width:'180px', marginRight:"20px"}} >
                                            <FormControl
                                                fullWidth
                                                size="small"
                                            >
                                                <InputLabel>Download Report</InputLabel>
                                                <Select
                                                    label='Download Report'
                                                    onChange={(e) => setFileType(e.target.value)}
                                                    value={fileType||""}
                                                >
                                                    {["JSON","CSV"].map((el) =>{
                                                        return(
                                                            <MenuItem key={el} value={el}>
                                                                {el}
                                                            </MenuItem>
                                                        );
                                                    })}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        <IconButton disabled={fileType === ""} onClick={downloadMainReport} ><DownloadIcon color={fileType !== "" ? "primary" : "disabled"} /></IconButton>
                                    </div>
                                </Box>
                            </div>
                        </div>
                    </div>
                </div>
                }
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