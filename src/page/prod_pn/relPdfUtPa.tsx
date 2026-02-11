
import { SingleFileInput } from '@pagopa/mui-italia';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Button, Typography } from "@mui/material";
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

   
    let profilePath; 
    let headerNavigationFrom;
  
    if(location.pathname.includes("send") && location.pathname.includes("rel") ){
        profilePath = PathPf.LISTA_REL;
        headerNavigationFrom = "Regolare Esecuzione/";
    }else if(location.pathname.includes("ente") && location.pathname.includes("documentiemessi")){
        profilePath = PathPf.DOCUMENTI_EMESSI;
        headerNavigationFrom = "Documenti Emessi/";
    }else if(location.pathname.includes("ente") && location.pathname.includes("documentisospesi")){
        profilePath = PathPf.DOCUMENTI_SOSPESI;
        headerNavigationFrom = "Documenti Sospesi/";
    }else if(location.pathname.includes("ente") && location.pathname.includes("rel")){
        profilePath = PathPf.LISTA_REL_EN;
        headerNavigationFrom = "Regolare Esecuzione/";
    }

  

    const {
        disableButtonDettaglioNot,
        targetRef,
        loadingDettaglio,
        rel,
        downloadRelExel,
        downloadPdfRel,
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
            <div className='d-flex justify-content-end mt-4 me-5'>
                <Button disabled={disableButtonDettaglioNot}  onClick={()=> downloadRelExel()} >Scarica report di dettaglio notifiche Reg. Es. <DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
            </div>
            <div className="bg-white mb-5 me-5 ms-5">
                <div className="pt-5 pb-5 ">
                    <div className="container text-center">
                        <TextDettaglioPdf description='Soggetto aderente' value={rel.ragioneSociale}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Tipologia Fattura' value={rel.tipologiaFattura}></TextDettaglioPdf>
                        <TextDettaglioPdf description='ID Documento' value={rel.idDocumento}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Anno' value={rel.anno}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Mese' value={month[Number(rel.mese) - 1]}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Cup' value={rel.cup}></TextDettaglioPdf>
                        <TextDettaglioPdf description='N. Notifiche Analogiche' value={rel.totaleNotificheAnalogiche}></TextDettaglioPdf>
                        <TextDettaglioPdf description='N. Notifiche Digitali' value={rel.totaleNotificheDigitali}></TextDettaglioPdf>
                        <TextDettaglioPdf description='N. Totale Notifiche' value={rel.totaleNotificheDigitali + rel.totaleNotificheAnalogiche }></TextDettaglioPdf>
                        <TextDettaglioPdf description='Totale Imponibile Analogico' value={Number(rel.totaleAnalogico).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Totale Imponibile Digitale' value={Number(rel.totaleDigitale).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Totale Imponibile' value={Number(rel.totale).toLocaleString()+' €'}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Iva' value={rel.iva +' %'}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Totale Ivato Analogico ' value={Number(rel.totaleAnalogicoIva).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Totale Ivato Digitale' value={Number(rel.totaleDigitaleIva).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Totale Ivato' value={Number(rel.totaleIva).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                    </div>
                </div>
            </div>
       
            <div className='d-flex justify-content-between ms-5'>
                {(profilo.auth === 'PAGOPA' &&  !rel.tipologiaFattura.toUpperCase().includes("SEMESTRALE")) &&
                <div>
                    <Button sx={{width:'274px'}} onClick={() => downloadPdfRel()}  variant="contained">Scarica PDF Reg. Es.<DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
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
            <div className="d-flex justify-content-between ms-5 me-5 mb-3">
               
                {(enti && rel.totale > 0 && !rel.tipologiaFattura.toUpperCase().includes("SEMESTRALE")) &&
                    <>
                        <div className="">
                            <Button sx={{width:'274px'}} onClick={() => downloadPdfRel()}  variant="contained">Scarica PDF Reg. Es.<DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
                        </div>
                        <div id='singleInput' style={{minWidth: '300px', height:'40px'}}>
                            <SingleFileInput  value={file} loading={loadingUpload} error={errorUpload} accept={[".pdf"]} onFileSelected={(e) => uploadPdf(e)} onFileRemoved={() => setFile(null)} dropzoneLabel={(rel?.caricata === 1 || rel?.caricata === 2) ? 'Reinserisci nuovo PDF Reg. Es. firmato' : "Inserisci PDF Reg. Es. firmato"} rejectedLabel="Tipo file non supportato" dropzoneButton=""></SingleFileInput>
                        </div> 
                    </>
                }
              
               
                {(enti && rel?.caricata >= 1 && !rel.tipologiaFattura.toUpperCase().includes("SEMESTRALE")) &&
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