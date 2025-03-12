import { useNavigate } from "react-router";
import NavigatorHeader from "../../components/reusableComponents/navigatorHeader";
import { PathPf } from "../../types/enum";
import GavelIcon from '@mui/icons-material/Gavel';
import SkeletonRelPdf from "../../components/rel/skeletonRelPdf";
import { useContext, useEffect, useState } from "react";
import { Box,IconButton,Table, TableCell, TableHead, TableRow,Typography } from "@mui/material";
import TextDettaglioPdf from "../../components/commessaPdf/textDettaglioPdf";
import { GlobalContext } from "../../store/context/globalContext";
import { getDettaglioContestazione } from "../../api/apiPagoPa/notifichePA/api";
import { manageError } from "../../api/api";
import { mesiGrid} from "../../reusableFunction/reusableArrayObj";
import { findStatoContestazioni } from "../../reusableFunction/function";
import DownloadIcon from '@mui/icons-material/Download';


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

    useEffect(()=>{
        if(singleContest?.reportId !== 0){
            getDettaglio();
        }
    },[singleContest?.reportId]);

    const getDettaglio = async() => {
        setLoadingDettaglio(true);
        await getDettaglioContestazione(token,profilo.nonce,singleContest?.reportId).then((res)=>{
            console.log(res);
            setArrayDetails(res.data);
            setLoadingDettaglio(false);
        }).catch((err) => {
            manageError(err,dispatchMainState);
            setLoadingDettaglio(false);
            navigate(PathPf.STORICO_CONTEST);
        });
    };


    

    if(loadingDettaglio){
        return(
            <SkeletonRelPdf></SkeletonRelPdf>
        );
    }
    console.log({singleContest});

    return (
        <div>
            <div>
                <NavigatorHeader pageFrom={"Contestazioni/"} pageIn={"Dettaglio"} backPath={PathPf.STORICO_CONTEST} icon={<GavelIcon  sx={{padding:"3px"}}  fontSize='small'></GavelIcon>}></NavigatorHeader>
            </div>
            <div className="bg-white m-5">
                <div className="d-flex justify-content-center pt-3">
                    <Typography variant="h4">{singleContest.ragioneSociale} {mesiGrid[singleContest.mese]} {singleContest.anno}</Typography>
                </div>
                <div className="pt-3 pb-3 ">
                    <div className="container text-center">
                        <TextDettaglioPdf description='Categoria documento' value={singleContest.categoriaDocumento}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Data inserimento' value={new Date(singleContest.dataInserimento).toISOString().replace("T", " ").substring(0, 19)}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Stato' value={findStatoContestazioni(singleContest.stato)||''}></TextDettaglioPdf>
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
                                    <Box style={{overflowY: "auto",maxHeight: "500px", margin:2, backgroundColor:'#F8F8F8'}}>
                                        <Table stickyHeader  >
                                            <TableHead sx={{position: "sticky",top: 0, zIndex: 1}}>
                                                <TableRow >
                                                    <TableCell align="center" >Step</TableCell>
                                                    <TableCell align="center">Data Completamento</TableCell>
                                                    <TableCell align="center">Accettata</TableCell>
                                                    <TableCell align="center">Contestata Ente</TableCell>
                                                    <TableCell align="center"></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            {arrayDetails.map((obj)=>{
                                                return ( 
                                                    <TableRow sx={{ borderBottom: '3px solid #ccc' }}  key={Math.random()}>
                                                        <TableCell  sx={{ borderBottomWidth: '3px' }}   align="center">{obj.descrizioneStep}</TableCell>
                                                        <TableCell sx={{ borderBottomWidth: '3px' }} align="center"  > {obj.dataCompletamento ?new Date(obj.dataCompletamento).toISOString().replace("T", " ").substring(0, 19):''} </TableCell>
                                                        <TableCell sx={{ borderBottomWidth: '3px' }}  align="center">{obj.accettata}</TableCell>
                                                        <TableCell sx={{ borderBottomWidth: '3px' }} align="center">{obj.contestataEnte}</TableCell>
                                                        <TableCell  sx={{ borderBottomWidth: '3px' }} align="center"><IconButton><DownloadIcon></DownloadIcon></IconButton></TableCell>
                                                        
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

        </div>
      
    );
};

export default DettaglioStoricoContestazione;