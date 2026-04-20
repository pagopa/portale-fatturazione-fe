import { SingleFileInput } from '@pagopa/mui-italia';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useNavigate, useParams } from 'react-router';
import TextDettaglioPdf from '../../components/commessaPdf/textDettaglioPdf';
import DownloadIcon from '@mui/icons-material/Download';
import ModalUploadPdf from '../../components/rel/modalUploadPdf';
import ModalLoading from '../../components/reusableComponents/modals/modalLoading';
import { PathPf } from '../../types/enum';
import { month } from '../../reusableFunction/reusableArrayObj';
import { createDateFromString } from '../../reusableFunction/function';
import SkeletonRelPdf from '../../components/rel/skeletonRelPdf';
import NavigatorHeader from '../../components/reusableComponents/navigatorHeader';
import { useGlobalStore } from '../../store/context/useGlobalStore';
import usePageRelDocPdf from '../../hooks/usePageRelDocPdf';
import { useLocation } from 'react-router-dom';

const RelPdfPage : React.FC = () =>{
    const { pageFrom, id, idEnte, idTipoContratto } = useParams();
    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();
    const location = useLocation();
    

   
    let profilePath; 
    let headerNavigationFrom;
    let labelScaricaPdf = "Scarica PDF Reg. Es.";
    let labelScaricaReportDettaglio = "Scarica report di dettaglio notifiche Reg. Es.";
    let fatturaType = "";
  
    if(location.pathname.includes("send") && location.pathname.includes("rel") ){
        profilePath = PathPf.LISTA_REL;
        headerNavigationFrom = "Regolare Esecuzione/";
    }else if(location.pathname.includes("ente") && location.pathname.includes("documentiemessi")){
        profilePath = PathPf.DOCUMENTI_EMESSI;
        headerNavigationFrom = "Documenti Emessi/";
        labelScaricaPdf = "Scarica PDF Doc. Emessi";
        labelScaricaReportDettaglio = "Scarica report di dettaglio notifiche Doc. Emessi";
        fatturaType = "Emessa";
    }else if(location.pathname.includes("ente") && location.pathname.includes("documentisospesi")){
        profilePath = PathPf.DOCUMENTI_SOSPESI;
        headerNavigationFrom = "Documenti Sospesi/";
        labelScaricaPdf = "Scarica PDF Doc. Sospesi";
        labelScaricaReportDettaglio = "Scarica report di dettaglio notifiche Doc. Sospesi";
        fatturaType = "Sospesa";
    }else if(location.pathname.includes("ente") && location.pathname.includes("rel")){
        profilePath = PathPf.LISTA_REL_EN;
        headerNavigationFrom = "Regolare Esecuzione/";
    }else if(location.pathname.includes("send") && location.pathname.includes("documentiemessi")){
        profilePath = PathPf.FATTURAZIONE;
        headerNavigationFrom = "Documenti Emessi/";
        labelScaricaPdf = "Scarica PDF Doc. Emessi";
        fatturaType = "Emessa";
        labelScaricaReportDettaglio = "Scarica report di dettaglio notifiche Doc. Emessi";
    }else if(location.pathname.includes("send") && location.pathname.includes("documentisospesi")){
        profilePath = PathPf.DOCUMENTI_SOSPESI_SEND;
        headerNavigationFrom = "Documenti Sospesi/";
        labelScaricaPdf = "Scarica PDF Doc. Sospesi";
        labelScaricaReportDettaglio = "Scarica report di dettaglio notifiche Doc. Sospesi";
        fatturaType = "Sospesa";
    }

 
  

    const {
        disableButtonDettaglioNot,
        targetRef,
        loadingDettaglio,
        rel,
        downloadReportDettaglio,
        downloadPdf,
        downloadPdfRelFirmato,
        lastUpdateDocFirmato,
        enti,
        file,
        loadingUpload, 
        errorUpload,
        openModalConfirmUploadPdf,
        setOpenModalConfirmUploadPdf,
        showDownloading,
        setShowDownloading,
        setFile,
        uploadPdf
    } = usePageRelDocPdf({
        token,
        profilo,
        mainState,
        dispatchMainState,
        whoInvoke:location.pathname.includes("ente")?"ente":"send",
        pageFrom:pageFrom,
        navigate,
        profilePath,
        rowId:id,
        idEnte:idEnte
    });

    let showComponentPdfAdmin = false;

    if(profilo.auth === "PAGOPA"){
        if(location.pathname.includes("/rel/") && (!rel.tipologiaFattura.toUpperCase().includes("SEMESTRALE")) ){
            showComponentPdfAdmin = true;
        }else if((location.pathname.includes("/documentiemessi") ||location.pathname.includes("/documentisospesi")) && (rel.tipologiaFattura === "PRIMO SALDO" || rel.tipologiaFattura === "SECONDO SALDO") ){
            showComponentPdfAdmin = true;
        }
    }

    let showButtonDownloadReport = false;

    if(profilo.auth === "PAGOPA"){
        if((location.pathname.includes("documentiemessi") || location.pathname.includes("documentisospesi") ) &&
            rel.tipologiaFattura !== "PRIMO SALDO" && rel.tipologiaFattura !== "SECONDO SALDO"){
            showButtonDownloadReport = false;
        }else if(location.pathname.includes("/rel/")){
            showButtonDownloadReport = true;
        }else{
            showButtonDownloadReport = true;
        }
    }else if(profilo.auth === "SELFCARE"){
        if((location.pathname.includes("documentiemessi") || location.pathname.includes("documentisospesi") ) &&
            rel.tipologiaFattura !== "PRIMO SALDO" && rel.tipologiaFattura !== "SECONDO SALDO"){
            showButtonDownloadReport = false;
        }else if(location.pathname.includes("/rel/")){
            showButtonDownloadReport = true;
        }else{
            showButtonDownloadReport = true;
        }
    }

    let showDownloadPdfRELEnteFirmato = false;
    if(profilo.auth === "SELFCARE"){
        if(rel.totale >= 1 && !rel.tipologiaFattura.toUpperCase().includes("SEMESTRALE")&& location.pathname.includes("/rel/")){
            showDownloadPdfRELEnteFirmato = true;
        }
    }
 
    let showComponentActionOnBottomEnte = false;
    if(profilo.auth === "SELFCARE"){
        if(rel.totale > 0 && !rel.tipologiaFattura.toUpperCase().includes("SEMESTRALE") && location.pathname.includes("/rel/")){
            showComponentActionOnBottomEnte = true;
        }
    }

    let showDownloadPdfDocEmessiSospesiEnte = false;
    if(profilo.auth === "SELFCARE"){
        if((location.pathname.includes("documentiemessi") || location.pathname.includes("documentisospesi"))&&
            (rel.tipologiaFattura === "PRIMO SALDO" || rel.tipologiaFattura === "SECONDO SALDO" )){
            showDownloadPdfDocEmessiSospesiEnte= true;
        }
    }
    /*
    let accontoIsVisible:boolean = profilo.auth === "SELFCARE" && Number(mainState?.profilo?.idTipoContratto) === 2 && rel.tipologiaFattura !== "ANTICIPO"
    if(profilo.auth === "PAGOPA" && Number(idTipoContratto) === 2 && rel.tipologiaFattura !== "ANTICIPO"){
        accontoIsVisible = true;
    }*/

    let idTipoContrattoBasedOnProfile = profilo.auth === "PAGOPA" ? Number(idTipoContratto) : Number(mainState?.profilo?.idTipoContratto) 

    if(loadingDettaglio){
        return(
            <SkeletonRelPdf></SkeletonRelPdf>
        );
    }

    return (
        <div>
            <div style={{ position:'absolute',zIndex:-1, top:'-1000px'}}  id='file_download_rel' ref={targetRef}>
            </div>
            <div className='mb-4'>
                <NavigatorHeader pageFrom={headerNavigationFrom} pageIn={"Dettaglio"} backPath={profilePath} icon={<ManageAccountsIcon  sx={{paddingBottom:"5px"}}  fontSize='small'></ManageAccountsIcon>}></NavigatorHeader>
            </div>
            {showButtonDownloadReport &&
                <div className='d-flex justify-content-end mt-2 me-5'>
                    <Button disabled={disableButtonDettaglioNot}  onClick={()=> downloadReportDettaglio()} >{labelScaricaReportDettaglio} <DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
                </div>
            }
            <MainComponentBasedOnUrl mainObj={rel} profilePath={profilePath} idTipoContrattoBasedOnProfile={idTipoContrattoBasedOnProfile} fatturaType={fatturaType}></MainComponentBasedOnUrl>
            <div className='d-flex justify-content-between ms-5 me-5'>
                {showComponentPdfAdmin &&
                <div>
                    <Button sx={{width:'274px'}} onClick={downloadPdf}  variant="contained">{labelScaricaPdf}<DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
                </div>}
                {(profilo.auth === 'PAGOPA' && rel?.caricata >= 1 && !rel.tipologiaFattura.toUpperCase().includes("SEMESTRALE")) && location.pathname.includes("/rel/") &&
                    <div>
                        <div>
                            <Button sx={{width:'300px'}} onClick={() => downloadPdfRelFirmato()}   variant="contained">Scarica PDF Firmato <DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
                        </div>
                        {lastUpdateDocFirmato !== '' &&
                    <div className='text-center mt-2'>
                        <Typography variant="overline" >{createDateFromString(lastUpdateDocFirmato)}</Typography>
                    </div>
                        }
                    </div>
                }
            </div>
            <div className="ms-5 me-5 mb-3">
                {showComponentActionOnBottomEnte  &&
                    <Box sx={{display:"flex",justifyContent:"space-between"}}>
                        <div>
                            <Button sx={{width:'274px'}} onClick={downloadPdf}  variant="contained">{labelScaricaPdf}<DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
                        </div>
                        <div id='singleInput' style={{minWidth: '300px', height:'40px'}}>
                            <SingleFileInput  value={file} loading={loadingUpload} error={errorUpload} accept={[".pdf"]} onFileSelected={(e) => uploadPdf(e)} onFileRemoved={() => setFile(null)} dropzoneLabel={(rel?.caricata === 1 || rel?.caricata === 2) ? 'Reinserisci nuovo PDF Reg. Es. firmato' : "Inserisci PDF Reg. Es. firmato"} rejectedLabel="Tipo file non supportato" dropzoneButton=""></SingleFileInput>
                        </div> 
                        {showDownloadPdfRELEnteFirmato &&
                         <div>
                             <div>
                                 <Button sx={{width:'300px'}} onClick={() => downloadPdfRelFirmato()}   variant="contained">Scarica PDF Firmato <DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
                             </div>
                             {lastUpdateDocFirmato !== '' &&
                            <div className='text-center mt-2'>
                                <Typography variant="overline" >{createDateFromString(lastUpdateDocFirmato)}</Typography>
                            </div>
                             }
                         </div>
                        }
                    </Box> 
                }
                {showDownloadPdfDocEmessiSospesiEnte &&
                    <Box>
                        <div className="">
                            <Button sx={{width:'274px'}} onClick={downloadPdf}  variant="contained">{labelScaricaPdf}<DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
                        </div>
                    </Box>
                }
            </div>
            {openModalConfirmUploadPdf &&
            <ModalUploadPdf setOpen={setOpenModalConfirmUploadPdf} open={openModalConfirmUploadPdf}></ModalUploadPdf>
            }
           
            <ModalLoading 
                open={showDownloading} 
                setOpen={setShowDownloading}
                sentence={'Downloading...'} >
            </ModalLoading>
        </div>
    );
};

export default RelPdfPage;




const MainComponentBasedOnUrl = ({mainObj,profilePath,idTipoContrattoBasedOnProfile,fatturaType}) => {
    const isRel = profilePath === PathPf.LISTA_REL || profilePath === PathPf.LISTA_REL_EN;
    const totale_Imponibile_Ivato_IsVisible = mainObj.tipologiaFattura === "PRIMO SALDO" || mainObj.tipologiaFattura === "SECONDO SALDO" || mainObj.tipologiaFattura === "VAR. SEMESTRALE";    
    const anticipo_analogico_digitale_IsVisible = mainObj.tipologiaFattura === "ANTICIPO";
    const acconto_analogico_digitale_IsVisible = mainObj.tipologiaFattura === "ACCONTO" && idTipoContrattoBasedOnProfile === 2;
    const storno_analogico_digitale_totale_storno_IsVisible = mainObj.tipologiaFattura === "PRIMO SALDO" || mainObj.tipologiaFattura === "SECONDO SALDO" || mainObj.tipologiaFattura === "VAR. SEMESTRALE";
       return ( 
       <div>
         <div className="bg-white mb-5 me-5 ms-5">
            <div className="d-flex justify-content-center pt-3">
                <Typography variant="h4">Dettaglio Fattura {fatturaType}</Typography>
            </div>
            <div className="pt-3 pb-3 ">
                <div className="container text-center">
                    <TextDettaglioPdf description='Soggetto aderente' value={mainObj.ragioneSociale}></TextDettaglioPdf>
                    <TextDettaglioPdf description='Tipologia Fattura' value={mainObj.tipologiaFattura}></TextDettaglioPdf>
                    <TextDettaglioPdf description='Anno' value={mainObj.anno}></TextDettaglioPdf>
                    <TextDettaglioPdf description='Mese' value={month[Number(mainObj.mese) - 1]}></TextDettaglioPdf>
                    <TextDettaglioPdf description='ID Documento' value={mainObj.idDocumento||"--"}></TextDettaglioPdf>
                    <TextDettaglioPdf description='Cup' value={mainObj.cup||"--"}></TextDettaglioPdf>
                </div>
            </div>
         </div>
         <div className="bg-white mb-5 me-5 ms-5">
            <div className="d-flex justify-content-center pt-3">
                <Typography variant="h4">Consumato</Typography>
            </div>
            <div className="pt-3 pb-3 ">
                <div className="container text-center">
                    <TextDettaglioPdf description='N. Notifiche Analogiche' value={mainObj.totaleNotificheAnalogiche}></TextDettaglioPdf>
                    <TextDettaglioPdf description='N. Notifiche Digitali' value={mainObj.totaleNotificheDigitali}></TextDettaglioPdf>
                    <TextDettaglioPdf description='N. Totale Notifiche' value={mainObj.totaleNotificheDigitali + mainObj.totaleNotificheAnalogiche }></TextDettaglioPdf>
                    {totale_Imponibile_Ivato_IsVisible && <TextDettaglioPdf description='Totale Imponibile Analogico' value={Number(mainObj.totaleAnalogico).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>}
                    {totale_Imponibile_Ivato_IsVisible &&<TextDettaglioPdf description='Totale Imponibile Digitale' value={Number(mainObj.totaleDigitale).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>}
                    {totale_Imponibile_Ivato_IsVisible &&<TextDettaglioPdf description='Totale Ivato Analogico ' value={Number(mainObj.totaleAnalogicoIva).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>}
                    {totale_Imponibile_Ivato_IsVisible &&<TextDettaglioPdf description='Totale Ivato Digitale' value={Number(mainObj.totaleDigitaleIva).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>}
                </div>
            </div>
         </div>
         <div className="bg-white mb-5 me-5 ms-5">
            <div className="d-flex justify-content-center pt-3">
                <Typography variant="h4">Dati Fatture</Typography>
            </div>
            <div className="pt-3 pb-3 ">
                <div className="container text-center">
                  {anticipo_analogico_digitale_IsVisible && <TextDettaglioPdf description='Anticipo Analogico' value={Number(mainObj.anticipoAnalogico||0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>}
                  {anticipo_analogico_digitale_IsVisible && <TextDettaglioPdf description='Anticipo Digitale' value={Number(mainObj.anticipoDigitale||0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>}
                  {acconto_analogico_digitale_IsVisible && <TextDettaglioPdf description='Acconto Analogico' value={Number(mainObj.accontoAnalogico||0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>}
                  {acconto_analogico_digitale_IsVisible && <TextDettaglioPdf description='Acconto Digitale' value={Number(mainObj.accontoDigitale||0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>}
                  {storno_analogico_digitale_totale_storno_IsVisible &&<TextDettaglioPdf description='Storno Analogico' value={Number(mainObj.stornoAnalogico||0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>}
                  {storno_analogico_digitale_totale_storno_IsVisible &&<TextDettaglioPdf description='Storno Digitale' value={Number(mainObj.stornoDigitale||0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>}
                  {storno_analogico_digitale_totale_storno_IsVisible &&<TextDettaglioPdf description='Totale Storni' value={Number(mainObj.stornoDigitale||0+ mainObj.stornoAnalogico||0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>}
                  <TextDettaglioPdf description='Totale Imponibile' value={Number(isRel ?mainObj.totale:mainObj.totaleFattura).toLocaleString()+' €'}></TextDettaglioPdf>
                  <TextDettaglioPdf description='Iva' value={mainObj.iva +' %'}></TextDettaglioPdf>
                  <TextDettaglioPdf description='Totale Ivato' value={Number(mainObj.totaleIva).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                </div>
            </div>
         </div>
          {mainObj?.fattureSospese?.length > 0 &&
                <div className="bg-white mb-5 me-5 ms-5">
                    <div className="d-flex justify-content-center pt-3">
                        <Typography variant="h4">Elenco Fatture Emesse</Typography>
                    </div>
                    <div className="pt-3 pb-3 ">
                        <div className="container text-center">
                            <div className="row">
                                {mainObj.fattureSospese.map((fat)=>{
                                    return (
                                        <div key={fat.idFattura} className="col-12">
                                            <Box sx={{ margin: 2 , backgroundColor:'#F8F8F8', padding:'10px'}}>
                                                <Table size="small" aria-label="purchases">
                                                    <TableHead>
                                                        <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                                            <TableCell align="center" sx={{ width:"300px"}} >Data Fattura</TableCell>
                                                            <TableCell align="center" sx={{ width:"300px"}} >Tipo Documento</TableCell>
                                                            <TableCell align="center" sx={{ width:"300px"}}>Metodo Pagamento</TableCell>
                                                            <TableCell align="center" sx={{ width:"300px"}}>Totale Fattura Imponibile €</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                                        <TableRow>
                                                            <TableCell align="center" sx={{ width:"300px"}}>{new Date(fat.dataFattura).toLocaleDateString('en-CA')}</TableCell>
                                                            <TableCell align="center" sx={{ width:"300px"}}>{fat.tipoDocumento}</TableCell>
                                                            <TableCell align="center" sx={{ width:"300px"}}>{fat.metodoPagamento}</TableCell>
                                                            <TableCell align="center" sx={{ width:"300px"}}>{fat.totaleFatturaImponibile.toLocaleString("de-DE", { style: 'decimal',maximumFractionDigits: 14})}</TableCell> 
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
                }
         
        </div>
       )
    
    
};
