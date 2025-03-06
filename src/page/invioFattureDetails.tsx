import NavigatorHeader from "../components/reusableComponents/navigatorHeader";
import IosShareIcon from '@mui/icons-material/IosShare';
import { PathPf } from "../types/enum";
import { TableHead, TableRow, TableCell, TableBody, Typography, TableContainer, Table } from "@mui/material";
import { Box, styled } from "@mui/system";
import { mesiGrid, month } from "../reusableFunction/reusableArrayObj";
import SkeletonRelPdf from "../components/rel/skeletonRelPdf";
import { useContext, useEffect, useState } from "react";
import { sendListaJsonFatturePagoPa } from "../api/apiPagoPa/fatturazionePA/api";
import { GlobalContext } from "../store/context/globalContext";
import { managePresaInCarico } from "../api/api";
import { useNavigate, useParams } from "react-router";

interface DetailsSingleRow 
{
    idFattura: number,
    tipologiaFattura: string,
    idEnte: string,
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
    const [detailsSingleRow, setDetailsSingleRow] = useState<DetailsSingleRow[]>([]);

    useEffect(()=>{
        getDetailSingleRow();
    },[]);

    const getDetailSingleRow = async() => {

       
        await sendListaJsonFatturePagoPa(token,profilo.nonce,{annoRiferimento: Number(idSplitted[0]),meseRiferimento: Number(idSplitted[1]),tipologiaFattura: idSplitted[2]}).then((res)=>{
            // setErrorSingleRowDetail(false);
            const orderData = res.data.map(el => {
                return {
                    ragioneSociale: el.ragioneSociale?.toString().length > 50 ? el.ragioneSociale?.toString().slice(0, 40) + '...' : el.ragioneSociale,
                    tipologiaFattura: el.tipologiaFattura,
                    annoRiferimento: el.annoRiferimento,
                    meseRiferimento:el.meseRiferimento,
                    dataFattura:el.dataFattura,
                    importo:el.importo.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
                };
            });
          
            setDetailsSingleRow(orderData);
            setLoadingDetail(false);
        }).catch(()=>{
            managePresaInCarico("ERROR_LIST_JSON_TO_SAP",dispatchMainState);
            navigate(PathPf.JSON_TO_SAP);
        });
     
    };

    if(loadingDetail){
        return(
            <SkeletonRelPdf></SkeletonRelPdf>
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
                                                        <TableCell align="center" >Ragione sociale</TableCell>
                                                        <TableCell align="center" >Tipologia Fattura</TableCell>
                                                        <TableCell align="center" >Anno</TableCell>
                                                        <TableCell align="center" >Mese</TableCell>
                                                        <TableCell align="center" >Data</TableCell>
                                                        <TableCell align="center" >Importo</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody   sx={{
                                                    borderColor: "white",
                                                    borderWidth: "thick",
                                                }}>
                                                    {detailsSingleRow.map((obj)=>{
                                                        return ( 
                                                            <TableRow key={Math.random()}>
                                                                <TableCell sx={{color:'#0D6EFD',fontWeight: 'bold'}} >{obj.ragioneSociale?.length > 40 ? obj.ragioneSociale.slice(0, 50) + '...' : obj.ragioneSociale}</TableCell>
                                                                <TableCell align="center">{obj.tipologiaFattura}</TableCell>
                                                                <TableCell align="center" > {obj.annoRiferimento} </TableCell>
                                                                <TableCell align="center">{month[obj.meseRiferimento-1]}</TableCell>
                                                                <TableCell align="center">{new Date(obj.dataFattura).toLocaleString().split(",")[0]||''}</TableCell>
                                                                <TableCell  align="right">
                                                                    {obj.importo.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
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

/*
             <div>
                    <Table size="small" aria-label="purchases">
                        <Box
                            style={{
                                overflowY: "auto",
                                maxHeight: "250px",
                                width: "100%"
                            }}
                        >
                            <TableHead  sx={{position: "sticky", top:'0',zIndex:"1",backgroundColor: "white"}}>
                                <TableRow>
                                    <TableCell sx={{ marginLeft:"16px"}} >Ragione sociale</TableCell>
                                    <TableCell sx={{ marginLeft:"16px"}} >Tipologia Fattura</TableCell>
                                    <TableCell sx={{ marginLeft:"16px"}}>Anno</TableCell>
                                    <TableCell sx={{ marginLeft:"16px"}}>Mese</TableCell>
                                    <TableCell sx={{ marginLeft:"16px"}}>Data</TableCell>
                                    <TableCell sx={{ marginLeft:"16px"}}>Importo</TableCell>
                                </TableRow>
                            </TableHead>
                                   
                            <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                { detailsSingleRow.map((obj) => (
                                    <TableRow key={Math.random()}>
                                        <TableCell>{obj.ragioneSociale?.length > 40 ? obj.ragioneSociale.slice(0, 50) + '...' : obj.ragioneSociale}</TableCell>
                                        <TableCell>
                                            {obj.tipologiaFattura}
                                        </TableCell>
                                        <TableCell  component="th" scope="row"> {obj.annoRiferimento} </TableCell>
                                        <TableCell align="center" >{month[obj.meseRiferimento-1]}</TableCell>
                                        <TableCell>{new Date(obj.dataFattura).toLocaleString().split(",")[0]||''}</TableCell>
                                        <TableCell  align="right"component="th" scope="row">
                                            {obj.importo.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                                        </TableCell>
                                    </TableRow>
                                ))
                                }
                            </TableBody>
                        </Box>
                    </Table>
                </div>
            
            */