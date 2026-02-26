
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
    const { pageFrom, id } = useParams();
    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();
    const location = useLocation();
    const accontoIsVisible = mainState?.profilo?.idTipoContratto === 2;

   
    let profilePath; 
    let headerNavigationFrom;
    let labelScaricaPdf = "Scarica PDF Reg. Es.";
    let labelScaricaReportDettaglio = "Scarica report di dettaglio notifiche Reg. Es.";
  
    if(location.pathname.includes("send") && location.pathname.includes("rel") ){
        profilePath = PathPf.LISTA_REL;
        headerNavigationFrom = "Regolare Esecuzione/";
    }else if(location.pathname.includes("ente") && location.pathname.includes("documentiemessi")){
        profilePath = PathPf.DOCUMENTI_EMESSI;
        headerNavigationFrom = "Documenti Emessi/";
        labelScaricaPdf = "Scarica PDF Doc. Emessi";
        labelScaricaReportDettaglio = "Scarica report di dettaglio notifiche Doc. Emessi";
    }else if(location.pathname.includes("ente") && location.pathname.includes("documentisospesi")){
        profilePath = PathPf.DOCUMENTI_SOSPESI;
        headerNavigationFrom = "Documenti Sospesi/";
        labelScaricaPdf = "Scarica PDF Doc. Sospesi";
        labelScaricaReportDettaglio = "Scarica report di dettaglio notifiche Doc. Sospesi";
    }else if(location.pathname.includes("ente") && location.pathname.includes("rel")){
        profilePath = PathPf.LISTA_REL_EN;
        headerNavigationFrom = "Regolare Esecuzione/";
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
        rowId:id
    });



    console.log({rel});

    if(loadingDettaglio){
        return(
            <SkeletonRelPdf></SkeletonRelPdf>
        );
    }

    return (
        <div>
            <div style={{ position:'absolute',zIndex:-1, top:'-1000px'}}  id='file_download_rel' ref={targetRef}>
            </div>
            <div>
                <NavigatorHeader pageFrom={headerNavigationFrom} pageIn={"Dettaglio"} backPath={profilePath} icon={<ManageAccountsIcon  sx={{paddingBottom:"5px"}}  fontSize='small'></ManageAccountsIcon>}></NavigatorHeader>
            </div>
            { (location.pathname.includes("ente") && 
            (location.pathname.includes("documentiemessi") || location.pathname.includes("documentisospesi") ) &&
            rel.tipologiaFattura !== "PRIMO SALDO" && rel.tipologiaFattura !== "SECONDO SALDO")
                ? null:
                <div className='d-flex justify-content-end mt-4 me-5'>
                    <Button disabled={disableButtonDettaglioNot}  onClick={()=> downloadReportDettaglio()} >{labelScaricaReportDettaglio} <DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
                </div>
            }
            <MainComponentBasedOnUrl mainObj={rel} profilePath={profilePath} accontoIsVisible={accontoIsVisible}></MainComponentBasedOnUrl>
            <div className='d-flex justify-content-between ms-5 me-5'>
                {(profilo.auth === 'PAGOPA' &&  !rel.tipologiaFattura.toUpperCase().includes("SEMESTRALE")) &&
                <div>
                    <Button sx={{width:'274px'}} onClick={downloadPdf}  variant="contained">Scarica PDF Reg. Es.<DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
                </div>}
                {(profilo.auth === 'PAGOPA' && rel?.caricata >= 1 && !rel.tipologiaFattura.toUpperCase().includes("SEMESTRALE")) &&
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
               
                {(enti && rel.totale > 0 && !rel.tipologiaFattura.toUpperCase().includes("SEMESTRALE")&& location.pathname.includes("/rel/"))  &&
                    <Box sx={{display:"flex",justifyContent:"space-between"}}>
                        <div>
                            <Button sx={{width:'274px'}} onClick={downloadPdf}  variant="contained">{labelScaricaPdf}<DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
                        </div>
                   
                        <div id='singleInput' style={{minWidth: '300px', height:'40px'}}>
                            <SingleFileInput  value={file} loading={loadingUpload} error={errorUpload} accept={[".pdf"]} onFileSelected={(e) => uploadPdf(e)} onFileRemoved={() => setFile(null)} dropzoneLabel={(rel?.caricata === 1 || rel?.caricata === 2) ? 'Reinserisci nuovo PDF Reg. Es. firmato' : "Inserisci PDF Reg. Es. firmato"} rejectedLabel="Tipo file non supportato" dropzoneButton=""></SingleFileInput>
                        </div> 
                        {(enti && rel?.caricata >= 1 && !rel.tipologiaFattura.toUpperCase().includes("SEMESTRALE")) && location.pathname.includes("/rel/") &&
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
                {(enti && location.pathname.includes("documentiemessi") || location.pathname.includes("documentisospesi")) &&
                    (rel.tipologiaFattura === "PRIMO SALDO" || rel.tipologiaFattura === "SECONDO SALDO" ) &&
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




const MainComponentBasedOnUrl = ({mainObj,profilePath,accontoIsVisible}) => {
    if(profilePath === PathPf.LISTA_REL ||  profilePath === PathPf.LISTA_REL_EN){
        return (
            <div className="bg-white mb-5 me-5 ms-5">
                <div className="pt-5 pb-5 ">
                    <div className="container text-center">
                        <TextDettaglioPdf description='Soggetto aderente' value={mainObj.ragioneSociale}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Tipologia Fattura' value={mainObj.tipologiaFattura}></TextDettaglioPdf>
                        <TextDettaglioPdf description='ID Documento' value={mainObj.idDocumento||"--"}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Anno' value={mainObj.anno}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Mese' value={month[Number(mainObj.mese) - 1]}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Cup' value={mainObj.cup||"--"}></TextDettaglioPdf>
                        <TextDettaglioPdf description='N. Notifiche Analogiche' value={mainObj.totaleNotificheAnalogiche}></TextDettaglioPdf>
                        <TextDettaglioPdf description='N. Notifiche Digitali' value={mainObj.totaleNotificheDigitali}></TextDettaglioPdf>
                        <TextDettaglioPdf description='N. Totale Notifiche' value={mainObj.totaleNotificheDigitali + mainObj.totaleNotificheAnalogiche }></TextDettaglioPdf>
                        <TextDettaglioPdf description='Totale Imponibile Analogico' value={Number(mainObj.totaleAnalogico).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Totale Imponibile Digitale' value={Number(mainObj.totaleDigitale).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Totale Imponibile' value={Number(mainObj.totale).toLocaleString()+' €'}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Iva' value={mainObj.iva +' %'}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Totale Ivato Analogico ' value={Number(mainObj.totaleAnalogicoIva).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Totale Ivato Digitale' value={Number(mainObj.totaleDigitaleIva).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Totale Ivato' value={Number(mainObj.totaleIva).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                    </div>
                </div>
            </div>
        );
    }else if(profilePath === PathPf.DOCUMENTI_EMESSI){
        return (
            <Box>
                <div className="bg-white mb-5 me-5 ms-5">
                    <div className="pt-5 pb-5 ">
                        <div className="container text-center">
                            <TextDettaglioPdf description='Soggetto aderente' value={mainObj.ragioneSociale}></TextDettaglioPdf>
                            <TextDettaglioPdf description='Tipologia Fattura' value={mainObj.tipologiaFattura}></TextDettaglioPdf>
                            <TextDettaglioPdf description='ID Documento' value={mainObj.idDocumento||"--"}></TextDettaglioPdf>
                            <TextDettaglioPdf description='Anno' value={mainObj.anno}></TextDettaglioPdf>
                            <TextDettaglioPdf description='Mese' value={month[Number(mainObj.mese) - 1]}></TextDettaglioPdf>
                            <TextDettaglioPdf description='Cup' value={mainObj.cup||"--"}></TextDettaglioPdf>
                            
                            <TextDettaglioPdf description='Anticipo Analogico' value={Number(mainObj.anticipoAnalogico||0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                            <TextDettaglioPdf description='Anticipo Digitale' value={Number(mainObj.anticipoDigitale||0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>

                            {accontoIsVisible && <TextDettaglioPdf description='Acconto Analogico' value={Number(mainObj.accontoAnalogico||0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>}
                            {accontoIsVisible && <TextDettaglioPdf description='Acconto Digitale' value={Number(mainObj.accontoDigitale||0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>}

                            <TextDettaglioPdf description='Storno Analogico' value={Number(mainObj.stornoAnalogico||0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                            <TextDettaglioPdf description='Storno Digitale' value={Number(mainObj.stornoDigitale||0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                            
                            <TextDettaglioPdf description='N. Notifiche Analogiche' value={mainObj.totaleNotificheAnalogiche}></TextDettaglioPdf>
                            <TextDettaglioPdf description='N. Notifiche Digitali' value={mainObj.totaleNotificheDigitali}></TextDettaglioPdf>
                            <TextDettaglioPdf description='N. Totale Notifiche' value={mainObj.totaleNotificheDigitali + mainObj.totaleNotificheAnalogiche }></TextDettaglioPdf>
                            <TextDettaglioPdf description='Totale Imponibile Analogico' value={Number(mainObj.totaleAnalogico).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                            <TextDettaglioPdf description='Totale Imponibile Digitale' value={Number(mainObj.totaleDigitale).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                            <TextDettaglioPdf description='Totale Imponibile' value={Number(mainObj.totaleFattura).toLocaleString()+' €'}></TextDettaglioPdf>
                            <TextDettaglioPdf description='Iva' value={mainObj.iva +' %'}></TextDettaglioPdf>
                            <TextDettaglioPdf description='Totale Ivato Analogico ' value={Number(mainObj.totaleAnalogicoIva).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                            <TextDettaglioPdf description='Totale Ivato Digitale' value={Number(mainObj.totaleDigitaleIva).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                            <TextDettaglioPdf description='Totale Ivato' value={Number(mainObj.totaleIva).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        </div>
                    </div>
                </div>
                {mainObj.fattureSospese.length > 0 &&
                <div className="bg-white mb-5 me-5 ms-5">
                    <div className="d-flex justify-content-center pt-3">
                        <Typography variant="h4">Fatture sospese</Typography>
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
            </Box>
           
        );

    }else if(profilePath === PathPf.DOCUMENTI_SOSPESI){
        return (
            <div className="bg-white mb-5 me-5 ms-5">
                <div className="pt-5 pb-5 ">
                    <div className="container text-center">
                        <TextDettaglioPdf description='Soggetto aderente' value={mainObj.ragioneSociale}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Tipologia Fattura' value={mainObj.tipologiaFattura}></TextDettaglioPdf>
                        <TextDettaglioPdf description='ID Documento' value={mainObj.idDocumento||"--"}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Anno' value={mainObj.anno}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Mese' value={month[Number(mainObj.mese) - 1]}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Cup' value={mainObj.cup||"--"}></TextDettaglioPdf>

                        <TextDettaglioPdf description='Anticipo Analogico' value={Number(mainObj.anticipoAnalogico||0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Anticipo Digitale' value={Number(mainObj.anticipoDigitale||0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Storno Analogico' value={Number(mainObj.stornoAnalogico||0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Storno Digitale' value={Number(mainObj.stornoDigitale||0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>

                        <TextDettaglioPdf description='N. Notifiche Analogiche' value={mainObj.totaleNotificheAnalogiche}></TextDettaglioPdf>
                        <TextDettaglioPdf description='N. Notifiche Digitali' value={mainObj.totaleNotificheDigitali}></TextDettaglioPdf>
                        <TextDettaglioPdf description='N. Totale Notifiche' value={mainObj.totaleNotificheDigitali + mainObj.totaleNotificheAnalogiche }></TextDettaglioPdf>
                        <TextDettaglioPdf description='Totale Imponibile Analogico' value={Number(mainObj.totaleAnalogico).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Totale Imponibile Digitale' value={Number(mainObj.totaleDigitale).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Totale Imponibile' value={Number(mainObj.totaleFattura).toLocaleString()+' €'}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Iva' value={mainObj.iva +' %'}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Totale Ivato Analogico ' value={Number(mainObj.totaleAnalogicoIva).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Totale Ivato Digitale' value={Number(mainObj.totaleDigitaleIva).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Totale Ivato' value={Number(mainObj.totaleIva).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                    </div>
                </div>
            </div>
        );

    }
    
};