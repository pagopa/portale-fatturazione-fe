import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { manageError } from "../../api/api";
import SkeletonRelPdf from "../../components/rel/skeletonRelPdf";
import { getDetailsDocContabilePa } from "../../api/apiPagoPa/documentiContabiliPA/api";
import { PathPf } from "../../types/enum";
import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import TextDettaglioPdf from "../../components/commessaPdf/textDettaglioPdf";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { DocContabile } from "../../types/typeDocumentiContabili";
import DownloadIcon from '@mui/icons-material/Download';
import NavigatorHeader from "../../components/reusableComponents/navigatorHeader";
import { useGlobalStore } from "../../store/context/useGlobalStore";


const DettaglioDocContabile : React.FC = () =>{

    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);

 
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    
    const navigate = useNavigate();
  

   
    const [showDownloading, setShowDownloading] = useState(false);
    const [loadingDettaglio , setLoadingDettaglio] = useState(false);
    const [docContabile, setDocContabile]  = useState<DocContabile>({
        report: {
            name: "",
            contractId: "",
            tipoDoc: "",
            codiceAggiuntivo: "",
            vatCode: "",
            valuta: "",
            id: 0,
            numero: "",
            data: "",
            bollo: "",
            riferimentoData: "",
            yearQuarter: "",
            posizioni: [
                {
                    category: "",
                    progressivoRiga: 0,
                    codiceArticolo: "",
                    descrizioneRiga: "",
                    quantita: 0,
                    importo: 0,
                    codIva: "",
                    condizioni: "",
                    causale: "",
                    indTipoRiga: ""
                }
            ],
            reports: ["",""]
        },
        psp: {
            contractId: "",
            documentName: "",
            providerNames: "",
            signedDate: "",
            contractType: "",
            name: "",
            abi: "",
            taxCode: "",
            vatCode: "",
            vatGroup: 0,
            pecMail: "",
            courtesyMail: "",
            referenteFatturaMail: "",
            sdd: "",
            sdiCode: "",
            membershipId: "",
            recipientId: "",
            yearMonth: ""
        }
    });
    




    useEffect(()=>{
        if(mainState.docContabileSelected.key === ''){
            navigate(PathPf.DOCUMENTICONTABILI);
        }else{
            getDocContabile({key:mainState.docContabileSelected.key});
        }
    },[]);

    /*

    const downloadRelExel = async() =>{
        setShowDownloading(true);
      
        await getRelExel(token, profilo.nonce, statusApp.idElement).then((res)=>{
            //saveAs("data:text/plain;base64," + res.data.documento,`Rel / Report di dettaglio/ ${ rel?.ragioneSociale} /${rel?.mese}/${rel?.anno}.xlsx` );
            //setShowDownloading(false);
                
            const blob = new Blob([res.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download',`Rel / Report di dettaglio / ${ rel?.ragioneSociale} / ${rel?.mese} / ${rel?.anno}.csv`);
            document.body.appendChild(a);
            a.click();
            setShowDownloading(false);
            document.body.removeChild(a);
               
        }).catch((err)=>{
            manageError(err,dispatchMainState);
            setShowDownloading(false);
        });
       
        
    };


    const downloadPdfRelFirmato = async() =>{
        setShowDownloading(true);
   
        await getRelPdfFirmato(token, profilo.nonce, statusApp.idElement).then((res)=>{
            saveAs("data:text/plain;base64," + res.data.documento,`REL firmata / ${ rel?.ragioneSociale}/${mesiWithZero[Number(meseOnDoc) - 1]}/${rel?.anno}.pdf` );
            setShowDownloading(false);
        }).catch((err)=>{
            manageError(err,dispatchMainState);
            setShowDownloading(false);
        });
       
        
    };

*/


    const getDocContabile = async(obj) => {
        setLoadingDettaglio(true);
        getDetailsDocContabilePa(token,profilo.nonce,obj).then((res) =>{
            setLoadingDettaglio(false);
            setDocContabile(res.data);
        }).catch((err)=>{
            setLoadingDettaglio(false);
            navigate(PathPf.DOCUMENTICONTABILI);
            manageError(err,dispatchMainState);
        });
    };  

    const downloadFile = (url,name) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        //saveAs(url,name);     
    };

    if(loadingDettaglio){
        return(
            <SkeletonRelPdf></SkeletonRelPdf>
        );
    }

    return (
        <div>
            <div>
                <NavigatorHeader pageFrom={"Documenti contabili/"} pageIn={"Dettaglio"} backPath={PathPf.DOCUMENTICONTABILI} icon={<ManageSearchIcon  sx={{paddingBottom:"4px"}}  fontSize='small'></ManageSearchIcon>}></NavigatorHeader>
            </div>
            <div className='d-flex justify-content-between mt-4 me-5 ms-5'>
                <Button disabled={docContabile.report.reports.length === 0 || docContabile.report.reports[0] === ''} onClick={()=> downloadFile(docContabile.report.reports[0],"Detailed Report")} >Download Detailed Report <DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
                <Button disabled={docContabile.report.reports[1] === ''} onClick={()=> downloadFile(docContabile.report.reports[1],"Download Agent Quarter Report")} >Download Agent Quarter Report <DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
            </div>
            <div className="bg-white mb-5 me-5 ms-5">
                <div className="d-flex justify-content-center pt-3">
                    <Typography variant="h4">PSP</Typography>
                </div>
                <div className="pt-3 pb-3 ">
                    <div className="container text-center">
                        <TextDettaglioPdf description='Nome PSP' value={docContabile.psp.name}></TextDettaglioPdf>
                        <TextDettaglioPdf description='ID contratto' value={docContabile.psp.contractId}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Data' value={docContabile.psp.signedDate !== '' ? new Date(docContabile.psp.signedDate).toISOString().split('T')[0]:''}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Tipo contratto' value={docContabile.psp.contractType}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Codice ABI' value={docContabile.psp.abi}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Codice tributario' value={docContabile.psp.taxCode}></TextDettaglioPdf>
                        <TextDettaglioPdf description='P. IVA' value={docContabile.psp.vatCode}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Membership ID' value={docContabile.psp.membershipId}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Recipient ID' value={docContabile.psp.recipientId}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Ultimo aggiornamento' value={docContabile.psp.yearMonth}></TextDettaglioPdf>
                    </div>
                </div>
            </div>
            <div className="bg-white mb-5 me-5 ms-5">
                <div className="d-flex justify-content-center pt-3">
                    <Typography variant="h4">Documento contabile</Typography>
                </div>
                <div className="pt-3 pb-3 ">
                    <div className="container text-center">
                        <TextDettaglioPdf description='Trimestre' value={docContabile.report.yearQuarter}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Tipo documento' value={docContabile.report.tipoDoc}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Codice aggiuntivo' value={docContabile.report.codiceAggiuntivo}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Valuta' value={docContabile.report.valuta}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Numero' value={docContabile.report.numero}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Report data' value={docContabile.report.data !== '' ? new Date(docContabile.report.data).toISOString().split('T')[0]:''}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Bollo' value={docContabile.report.bollo}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Data di riferimento' value={(docContabile.report.riferimentoData !== '' && docContabile.report.riferimentoData !== "0001-01-01T00:00:00") ? new Date(docContabile.report.riferimentoData).toISOString().split('T')[0]:''}></TextDettaglioPdf>
                    </div>
                </div>
            </div>
            <div className="bg-white mb-5 me-5 ms-5">
                <div className="d-flex justify-content-center pt-3">
                    <Typography variant="h4">Posizioni</Typography>
                </div>
                <div className="pt-3 pb-3 ">
                    <div className="container text-center">
                        <div className="row">
                            {docContabile.report.posizioni.map((singlePosizione)=>{
                                return (
                                    <div key={singlePosizione.progressivoRiga} className="col-12">
                                        <Box sx={{ margin: 2 , backgroundColor:'#F8F8F8', padding:'10px'}}>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                                        <TableCell sx={{ width:"300px"}} >ID Categoria</TableCell>
                                                        <TableCell sx={{ width:"300px"}} >Codice articolo</TableCell>
                                                        <TableCell sx={{ width:"300px"}}>Quantità</TableCell>
                                                        <TableCell align="center" sx={{ width:"300px"}}>Importo €</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                                    <TableRow key={singlePosizione.progressivoRiga}>
                                                        <TableCell sx={{ width:"300px"}}>{singlePosizione.category}</TableCell>
                                                        <TableCell sx={{ width:"300px"}}>{singlePosizione.codiceArticolo}</TableCell>
                                                        <TableCell sx={{ width:"300px"}}>{singlePosizione.quantita}</TableCell>
                                                        <TableCell  sx={{ width:"300px"}}align="right">{singlePosizione.importo.toLocaleString("de-DE", { style: 'decimal',maximumFractionDigits: 14})}</TableCell> 
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

export default DettaglioDocContabile;