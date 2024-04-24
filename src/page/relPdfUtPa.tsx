import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked, SingleFileInput} from '@pagopa/mui-italia';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { RelPagePdfProps} from "../types/typeRel";
import { Button, Typography } from "@mui/material";
import { useNavigate } from 'react-router';
import {manageError } from '../api/api';
import { useEffect, useRef, useState} from 'react';
import TextDettaglioPdf from '../components/commessaPdf/textDettaglioPdf';
import { ResponseDownloadPdf } from '../types/typeModuloCommessaInserimento';
import { getRelExel, getRelPdf, uploadPdfRel ,getRelPdfFirmato, getSingleRel, getLogRelDocumentoFirmato } from '../api/apiSelfcare/relSE/api';
import { getLogPagoPaRelDocumentoFirmato, getRelExelPagoPa, getRelPdfFirmatoPagoPa } from '../api/apiPagoPa/relPA/api';
import DownloadIcon from '@mui/icons-material/Download';
import ModalUploadPdf from '../components/rel/modalUploadPdf';
import { saveAs } from "file-saver";
import generatePDF from 'react-to-pdf';
import { redirect } from '../api/api';
import ModalLoading from '../components/reusableComponents/modals/modalLoading';
import { PathPf } from '../types/enum';
import { getProfilo, getStatusApp, getToken, profiliEnti } from '../reusableFunctin/actionLocalStorage';
import { mesi, mesiWithZero } from '../reusableFunctin/reusableArrayObj';
import { createDateFromString } from '../reusableFunctin/function';

const RelPdfPage : React.FC<RelPagePdfProps> = ({mainState, dispatchMainState}) =>{

    const targetRef  = useRef<HTMLInputElement>(null);
    const token =  getToken();
    const profilo =  getProfilo();
    const navigate = useNavigate();
    const enti = profiliEnti();
    const statusApp = getStatusApp();
    const rel = mainState.relSelected;
    const meseOnDoc = mainState.relSelected?.mese || 0;

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    const [showDownloading, setShowDownloading] = useState(false);
    const [lastUpdateDocFirmato, setLastUpdateDocFirmato] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [errorUpload, setErrorUpload] = useState<boolean>(false);
    const [openModalConfirmUploadPdf, setOpenModalConfirmUploadPdf] = useState<boolean>(false);

    useEffect(()=>{
        if(rel === null){
            navigate(PathPf.LISTA_REL);
        }
        if(!token){
            window.location.href = redirect;
        }
        getDateLastDownloadPdfFirmato(); 
    },[]);

    useEffect(()=>{
        if(file !== null){
            uploadPdf();
        }
    },[file]);

    const downloadRelExel = async() =>{
        if( mainState.relSelected !== null){
            setShowDownloading(true);
            if(enti){
                await getRelExel(token, mainState.nonce, mainState.relSelected.idTestata).then((res)=>{
                    saveAs("data:text/plain;base64," + res.data.documento,`Rel / Report di dettaglio/ ${ mainState.relSelected?.ragioneSociale} /${mainState.relSelected?.mese}/${mainState.relSelected?.anno}.xlsx` );
                    setShowDownloading(false);
                }).catch((err)=>{
                    manageError(err,navigate);
                    setShowDownloading(false);
                });
            }else{
                await getRelExelPagoPa(token, mainState.nonce, mainState.relSelected.idTestata).then((res)=>{
                    saveAs("data:text/plain;base64," + res.data.documento,`Rel / Report di dettaglio / ${ mainState.relSelected?.ragioneSociale} / ${mainState.relSelected?.mese} / ${mainState.relSelected?.anno}.xlsx` );
                    setShowDownloading(false);
                }).catch((err)=>{
                    manageError(err,navigate);
                    setShowDownloading(false);
                });
            }
        }
    };

    const downloadPdfRel = async() =>{
        setShowDownloading(true);
        if( mainState.relSelected !== null){
            if(enti){
                await getRelPdf(token, mainState.nonce, mainState.relSelected.idTestata).then((res: ResponseDownloadPdf)=>{
                    toDoOnDownloadPdf(res);
                }).catch((err)=>{
                    manageError(err,navigate);
                });
            }  
        }  
    };

    const downloadPdfRelFirmato = async() =>{
        if( mainState.relSelected !== null){
            setShowDownloading(true);
            if(enti){
                await getRelPdfFirmato(token, mainState.nonce, mainState.relSelected.idTestata).then((res)=>{
                    saveAs("data:text/plain;base64," + res.data.documento,`REL firmata / ${ mainState.relSelected?.ragioneSociale}/${mesiWithZero[Number(meseOnDoc) - 1]}/${mainState.relSelected?.anno}.pdf` );
                    setShowDownloading(false);
                }).catch((err)=>{
                    manageError(err,navigate);
                    setShowDownloading(false);
                });
            }else{
                await getRelPdfFirmatoPagoPa(token, mainState.nonce, mainState.relSelected.idTestata).then((res)=>{
                    saveAs("data:text/plain;base64," + res.data.documento,`REL firmata / ${ mainState.relSelected?.ragioneSociale}/${mesiWithZero[Number(meseOnDoc) - 1]}/${mainState.relSelected?.anno}.pdf` );
                    setShowDownloading(false);
                }).catch((err)=>{
                    manageError(err,navigate);
                    setShowDownloading(false);
                });
            } 
        }
    };

    const getDateLastDownloadPdfFirmato = async() =>{
        if(rel){
            const bodyPagopa = {
                anno: Number(rel.anno),
                mese: Number(rel.mese),
                tipologiaFattura: rel.tipologiaFattura,
                idContratto: rel.idContratto,
                idEnte:rel.idEnte
            };
            const {idEnte, ...bodySelf} = bodyPagopa;
            if(enti){
                await getLogRelDocumentoFirmato(token, mainState.nonce,bodySelf).then((res) =>{
                    setLastUpdateDocFirmato(res.data[0].dataEvento);
                }).catch((err)=>{ 
                    manageError(err, navigate);
                });
            }else if(profilo.auth === 'PAGOPA'){
                await getLogPagoPaRelDocumentoFirmato(token, mainState.nonce,bodyPagopa).then((res) =>{
                    setLastUpdateDocFirmato(res.data[0].dataEvento);
                }).catch((err)=>{
                    manageError(err, navigate);
                });
            }
        }
    };
    
    const toDoOnDownloadPdf = (res:ResponseDownloadPdf) =>{
        const wrapper = document.getElementById('file_download_rel');
        if(wrapper){
            wrapper.innerHTML = res.data;
            generatePDF(targetRef, {filename: `Regolare Esecuzione / ${ mainState.relSelected?.ragioneSociale}/${mesiWithZero[Number(meseOnDoc) - 1]}/${statusApp.anno} .pdf`});
            setShowDownloading(false);
        }
    };

    const uploadPdf = async () =>{
        setLoadingUpload(true);
        setErrorUpload(false);
        if(rel){
            await uploadPdfRel(token, mainState.nonce, rel.idTestata, {file:file} ).then((res)=>{
                getRel(rel.idTestata);
                setFile(null);
                setLoadingUpload(false);
                if(res.status === 200){
                    setOpenModalConfirmUploadPdf(true);
                    getDateLastDownloadPdfFirmato();
                }
            }).catch(()=>{
                setLoadingUpload(false);
                setErrorUpload(true);
            });
        }
    };

    const getRel = async(idRel) => {
        getSingleRel(token,mainState.nonce,idRel).then((res) =>{
            handleModifyMainState({relSelected:res.data});
        }).catch((err)=>{
            manageError(err, navigate);
        });
    };

    const classContainerButtons = enti ? 'd-flex justify-content-between m-5': 'd-flex justify-content-end m-5';

    return (
        <div>
            <div style={{ position:'absolute',zIndex:-1, top:'-1000px'}}  id='file_download_rel' ref={targetRef}>
            </div>
            <div className=' marginTop24  '>
                <div className='ms-5'>
                    <ButtonNaked
                        color="primary"
                        onFocusVisible={() => { console.log('onFocus'); }}
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(PathPf.LISTA_REL)}
                    >
                    Indietro
                    </ButtonNaked>
                    <Typography sx={{marginLeft:'20px'}} variant="caption">
                        <ManageAccountsIcon sx={{paddingBottom:'3px'}}  fontSize='small'></ManageAccountsIcon>
                      Regolare Esecuzione /
                    </Typography>
                    <Typography sx={{fontWeight:'bold', marginLeft:'5px'}} variant="caption">
                      Dettaglio
                    </Typography>
                </div>
            </div>
            <div className='d-flex justify-content-end mt-4 me-5'>
                <Button  onClick={()=> downloadRelExel()} >Scarica report di dettaglio notifiche Reg. Es. <DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
            </div>
            <div className="bg-white mb-5 me-5 ms-5">
                <div className="pt-5 pb-5 ">
                    {rel !== null &&
                    <div className="container text-center">
                        <TextDettaglioPdf description={'Soggetto aderente'} value={rel.ragioneSociale}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Tipologia Fattura'} value={rel.tipologiaFattura}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'ID Documento'} value={rel.idDocumento}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Anno'} value={rel.anno}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Mese'} value={mesi[rel.mese]}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Cup'} value={rel.cup}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'N. Notifiche Analogiche'} value={rel.totaleNotificheAnalogiche}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'N. Notifiche Digitali'} value={rel.totaleNotificheDigitali}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'N. Totale Notifiche'} value={rel.totaleNotificheDigitali + rel.totaleNotificheAnalogiche }></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Totale Imponibile Analogico'} value={Number(rel.totaleAnalogico).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Totale Imponibile Digitale'} value={Number(rel.totaleDigitale).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Totale Imponibile'} value={Number(rel.totale).toLocaleString()+' €'}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Iva'} value={rel.iva +' %'}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Totale Ivato Analogico '} value={Number(rel.totaleAnalogicoIva).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Totale Ivato Digitale'} value={Number(rel.totaleDigitaleIva).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Totale Ivato'} value={Number(rel.totaleIva).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}></TextDettaglioPdf>
                    </div>
                    }
                </div>
            </div>
            <div className={classContainerButtons}>
                {enti &&
                 <>
                     <div className="">
                         <Button sx={{width:'274px'}} onClick={() => downloadPdfRel()}  variant="contained">Scarica PDF Reg. Es.<DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
                     </div>
                     <div id='singleInputRel' style={{minWidth: '300px', height:'40px'}}>
                         <SingleFileInput  value={file} loading={loadingUpload} error={errorUpload} accept={[".pdf"]} onFileSelected={(e)=> setFile(e)} onFileRemoved={() => setFile(null)} dropzoneLabel={(rel?.caricata === 1 ||rel?.caricata === 2) ? 'Reinserisci nuovo PDF Reg. Es. firmato':"Inserisci PDF Reg. Es.  firmato"} rejectedLabel="Tipo file non supportato" ></SingleFileInput>
                     </div> 
                 </>
                }
                {rel?.caricata === 1 &&
                <div>
                    <div>
                        <Button sx={{width:'300px'}} onClick={() => downloadPdfRelFirmato()}   variant="contained">Scarica PDF Firmato <DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
                    </div>
                    <div className='text-center mt-2'>
                        <Typography variant="overline" >{createDateFromString(lastUpdateDocFirmato)}</Typography>
                    </div>
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