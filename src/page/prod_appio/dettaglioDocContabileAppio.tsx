import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { manageError } from "../../api/api";
import SkeletonRelPdf from "../../components/reusableComponents/skeletonRelPdf";
import { PathPf } from "../../types/enum";
import { Box,Button,Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import NavigatorHeader from "../../components/reusableComponents/navigatorHeader";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import DetailsSection from "../../components/reusableComponents/detailSection";
import { downloadDettaglioDocCotabiliAppio, getDetailsDocContabileAppio } from "../../api/apiPagoPa/documentiemessiAppio/api";
import { dettaglioDocContabileAppio } from "../../assets/configurations/conf_GridDocContabiliAppio";
import { saveAs } from "file-saver";
import DownloadIcon from '@mui/icons-material/Download';

export interface PosizioneDocContabile {
  numero: string;
  tipoDoc: string;
  valuta: string;
  codiceAggiuntivo: string;
  dataReport: string;       // ISO date
  dataRiferimento: string;  // ISO date
  codiceArticolo: string;
  quantita: number;
  importo: number;
  codIva: string;
  condizioni: string;
  causale: string;
}

export interface DocContabileAppio {
  name: string;
  contractId: string;
  prodotto: string;
  dataCreazione: string;        // ISO date
  pricingPlan: string;
  partitaIva: string;
  codiceFiscale: string;
  ultimoAggiornamento: string;  // ISO date
  yearQuarter: string;
  year: number;
  quarter: number;
  importoTotale: number;
  posizioni: PosizioneDocContabile[];
}

const DettaglioDocContabileAppIo : React.FC = () =>{

  const mainState = useGlobalStore(state => state.mainState);
  const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
  const token =  mainState.profilo.jwt;
  const profilo =  mainState.profilo;
  const navigate = useNavigate();
  const { contractId, yearQuarter } = useParams();
  
  const [showDownloading, setShowDownloading] = useState(false);
  const [loadingDettaglio , setLoadingDettaglio] = useState(true);
  const [docContabile, setDocContabile]  = useState<DocContabileAppio>();
 
  useEffect(()=>{
    if(contractId !== undefined && yearQuarter !== undefined)
      getDocContabile({
        "contractId": contractId,
        "yearQuarter": yearQuarter
      });
  },[contractId,yearQuarter]);


  const getDocContabile = async(obj) => {
    getDetailsDocContabileAppio(token,profilo.nonce,obj).then((res) =>{
      setLoadingDettaglio(false);
      setDocContabile(res.data);
      setLoadingDettaglio(false);
    }).catch((err)=>{
      setLoadingDettaglio(false);
      navigate(PathPf.DOCUMENTICONTABILIAPPIO);
      manageError(err,dispatchMainState);
    });
  };  

  const onDownloadButton = async() =>{
    setShowDownloading(true);
    await downloadDettaglioDocCotabiliAppio(token,profilo.nonce, { "contractId":contractId||'', "yearQuarter": yearQuarter||'' }).then(response => response.blob()).then((res) => {
    
      const fileName = `FinancialReport AppIO ${contractId}/${yearQuarter}.xlsx`;
      saveAs( res,fileName );
      setShowDownloading(false);
    }).catch(err => {
      setShowDownloading(false);
      manageError(err,dispatchMainState);
    });
  };
  
  if(loadingDettaglio){
    return(
      <SkeletonRelPdf></SkeletonRelPdf>
    );
  }

  return (
    <div>
      <div>
        <NavigatorHeader pageFrom={"Documenti contabili/"} pageIn={"Dettaglio"} backPath={PathPf.DOCUMENTICONTABILIAPPIO} icon={<ManageSearchIcon  sx={{paddingBottom:"4px"}}  fontSize='small'/>}></NavigatorHeader>
      </div>
      <div className='d-flex justify-content-end mt-4 me-5 ms-5'>
        {docContabile &&<Button onClick={onDownloadButton} >Download Financial Report <DownloadIcon sx={{marginLeft:'20px'}}/></Button>}
       
      </div>
      <div className="bg-white mb-5 me-5 ms-5">
        <DetailsSection title={"Documento contabile"} data={docContabile} fields={dettaglioDocContabileAppio}/>
      </div>
      <div className="bg-white mb-5 me-5 ms-5">
        <div className="d-flex justify-content-center pt-3">
          <Typography variant="h4">Posizioni</Typography>
        </div>
        <div className="pt-3 pb-3 ">
          <div className="container text-center">
            <div className="row">
              {docContabile?.posizioni.map((singlePosizione,i)=>{
                return (
                  <div key={i} className="col-12">
                    <Box sx={{ margin: 2 , backgroundColor:'#F8F8F8', padding:'10px'}}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                            <TableCell align="center" sx={{ width:"300px"}} >ID Categoria</TableCell>
                            <TableCell align="center"sx={{ width:"300px"}} >Codice articolo</TableCell>
                            <TableCell align="center" sx={{ width:"300px"}}>Quantità</TableCell>
                            <TableCell align="center" sx={{ width:"300px"}}>Importo €</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                          <TableRow key={`row-${i}`}>
                            <TableCell  align="center" sx={{ width:"300px"}}>{singlePosizione.codIva||"--"}</TableCell>
                            <TableCell  align="center" sx={{ width:"300px"}}>{singlePosizione.codiceArticolo||"--"}</TableCell>
                            <TableCell  align="center" sx={{ width:"300px"}}>{singlePosizione.quantita||"--"}</TableCell>
                            <TableCell  sx={{ width:"300px"}} align="right">{singlePosizione.importo.toLocaleString("de-DE", { style: 'decimal',maximumFractionDigits: 14})||"--"}</TableCell> 
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Box>
                  </div>
                );
              })}
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

export default DettaglioDocContabileAppIo;