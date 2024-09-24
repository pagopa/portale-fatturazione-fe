import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked, SingleFileInput} from '@pagopa/mui-italia';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Rel, RelPagePdfProps} from "../types/typeRel";
import { Button, Typography } from "@mui/material";
import { useNavigate } from 'react-router';
import {manageError } from '../api/api';
import { useEffect, useRef, useState} from 'react';
import TextDettaglioPdf from '../components/commessaPdf/textDettaglioPdf';
import { ResponseDownloadPdf } from '../types/typeModuloCommessaInserimento';
import { getRelExel, getRelPdf, uploadPdfRel ,getRelPdfFirmato, getSingleRel, getLogRelDocumentoFirmato } from '../api/apiSelfcare/relSE/api';
import { getLogPagoPaRelDocumentoFirmato, getRelExelPagoPa, getRelPdfFirmatoPagoPa, getRelPdfPagoPa, getSingleRelPagopa } from '../api/apiPagoPa/relPA/api';
import DownloadIcon from '@mui/icons-material/Download';
import ModalUploadPdf from '../components/rel/modalUploadPdf';
import { saveAs } from "file-saver";
import generatePDF from 'react-to-pdf';
import { redirect } from '../api/api';
import ModalLoading from '../components/reusableComponents/modals/modalLoading';
import { PathPf } from '../types/enum';
import { getProfilo, getStatusApp, getToken, profiliEnti } from '../reusableFunction/actionLocalStorage';
import {mesiWithZero, month } from '../reusableFunction/reusableArrayObj';
import { createDateFromString } from '../reusableFunction/function';
import SkeletonRelPdf from '../components/rel/skeletonRelPdf';

const RelPdfPage : React.FC<RelPagePdfProps> = ({mainState, dispatchMainState}) =>{

    const targetRef  = useRef<HTMLInputElement>(null);
    const token =  getToken();
    const profilo =  getProfilo();
    const navigate = useNavigate();
    const enti = profiliEnti();
    const statusApp = getStatusApp();

   
    const [showDownloading, setShowDownloading] = useState(false);
    const [lastUpdateDocFirmato, setLastUpdateDocFirmato] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [errorUpload, setErrorUpload] = useState<boolean>(false);
    const [openModalConfirmUploadPdf, setOpenModalConfirmUploadPdf] = useState<boolean>(false);
    const [loadingDettaglio , setLoadingDettaglio] = useState(false);
    const [rel, setRel]  = useState<Rel>({
        idTestata: "",
        idEnte: "",
        ragioneSociale: "",
        dataDocumento: null,
        idDocumento: "",
        cup:"",
        idContratto: "",
        tipologiaFattura: "",
        anno: "",
        mese: "",
        totaleAnalogico: 0,
        totaleDigitale: 0,
        totaleNotificheAnalogiche: 0,
        totaleNotificheDigitali: 0,
        totale: 0,
        datiFatturazione: false,
        iva: 0,
        totaleAnalogicoIva: 0,
        totaleDigitaleIva: 0,
        totaleIva: 0,
        firmata: "",
        caricata: 0
    });
    
    const meseOnDoc = rel?.mese || 0;

    useEffect(()=>{
        if(!token){
            window.location.href = redirect;
        }
        if(!statusApp.idElement){
            navigate(PathPf.LISTA_REL);
        }
    },[]);

    /*
    useEffect(()=>{
        if(file !== null){
            uploadPdf();
        }
    },[file]);
    */

    useEffect(()=>{
       
        getRel(statusApp.idElement);
        
    },[]);

    const downloadRelExel = async() =>{
        setShowDownloading(true);
        if(enti){
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
        }else{
            await getRelExelPagoPa(token, profilo.nonce, statusApp.idElement).then((res)=>{
                // saveAs("data:text/plain;base64," + res.data.documento,`Rel / Report di dettaglio / ${ rel?.ragioneSociale} / ${rel?.mese} / ${rel?.anno}.xlsx` );
                // setShowDownloading(false);
                
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
        }
        
    };

    const downloadPdfRel = async() =>{
        if(enti){
            setShowDownloading(true);
            await getRelPdf(token, profilo.nonce, statusApp.idElement).then((res: ResponseDownloadPdf)=>{
                toDoOnDownloadPdf(res);
            }).catch((err)=>{
                setShowDownloading(false);
                manageError(err,dispatchMainState);
            });
        }else if(profilo.auth === 'PAGOPA'){
            setShowDownloading(true);
            await getRelPdfPagoPa(token, profilo.nonce, statusApp.idElement).then((res: ResponseDownloadPdf)=>{
                toDoOnDownloadPdf(res);
            }).catch((err)=>{
                setShowDownloading(false);
                manageError(err,dispatchMainState);
            });
        }
       
    };

    const downloadPdfRelFirmato = async() =>{
        setShowDownloading(true);
        if(enti){
            await getRelPdfFirmato(token, profilo.nonce, statusApp.idElement).then((res)=>{
                saveAs("data:text/plain;base64," + res.data.documento,`REL firmata / ${ rel?.ragioneSociale}/${mesiWithZero[Number(meseOnDoc) - 1]}/${rel?.anno}.pdf` );
                setShowDownloading(false);
            }).catch((err)=>{
                manageError(err,dispatchMainState);
                setShowDownloading(false);
            });
        }else{
            await getRelPdfFirmatoPagoPa(token, profilo.nonce, statusApp.idElement).then((res)=>{
                saveAs("data:text/plain;base64," + res.data.documento,`REL firmata / ${ rel?.ragioneSociale}/${mesiWithZero[Number(meseOnDoc) - 1]}/${rel?.anno}.pdf` );
                setShowDownloading(false);
            }).catch((err)=>{
                manageError(err,dispatchMainState);
                setShowDownloading(false);
            });
        } 
        
    };

    const getDateLastDownloadPdfFirmato = async(body) =>{
     
        const {idEnte, ...bodySelf} = body;
        if(enti){
            await getLogRelDocumentoFirmato(token, profilo.nonce,bodySelf).then((res) =>{
                setLastUpdateDocFirmato(res.data[0].dataEvento);
            }).catch((err)=>{ 
                //manageError(err,dispatchMainState);
            });
        }else if(profilo.auth === 'PAGOPA'){
            await getLogPagoPaRelDocumentoFirmato(token, profilo.nonce,body).then((res) =>{
                setLastUpdateDocFirmato(res.data[0].dataEvento);
            }).catch((err)=>{
                //manageError(err,dispatchMainState);
            });
        }
        
    };
    
    const toDoOnDownloadPdf = (res:ResponseDownloadPdf) =>{
        const wrapper = document.getElementById('file_download_rel');
        if(wrapper){
            wrapper.innerHTML = res.data;
            generatePDF(targetRef, {filename: `Regolare Esecuzione / ${ rel?.ragioneSociale}/${mesiWithZero[Number(meseOnDoc) - 1]}/${statusApp.anno} .pdf`});
            setShowDownloading(false);
        }
    };
    //prova
    const uploadPdf = async (file) =>{
        setLoadingUpload(true);
        setErrorUpload(false);
       
        await uploadPdfRel(token, profilo.nonce, rel.idTestata, {file:file} ).then((res)=>{
            getRel(rel.idTestata);
            setFile(null);
            setLoadingUpload(false);
            if(res.status === 200){
                setOpenModalConfirmUploadPdf(true);
                
                getDateLastDownloadPdfFirmato({
                    anno: Number(rel.anno),
                    mese: Number(rel.mese),
                    tipologiaFattura: rel.tipologiaFattura,
                    idContratto: rel.idContratto,
                    idEnte:rel.idEnte
                });
            }
        }).catch((err)=>{
            setLoadingUpload(false);
            setErrorUpload(true);
            manageError(err,dispatchMainState);
            setFile(null);
        });
        
    };

    const getRel = async(idRel) => {
        setLoadingDettaglio(true);
        if(enti){
            getSingleRel(token,profilo.nonce,idRel).then((res) =>{
                if(res.data.datiFatturazione === true){
                    setLoadingDettaglio(false);
                    setRel(res.data);
                    getDateLastDownloadPdfFirmato({
                        anno: Number(res.data.anno),
                        mese: Number(res.data.mese),
                        tipologiaFattura: res.data.tipologiaFattura,
                        idContratto: res.data.idContratto,
                        idEnte:res.data.idEnte
                    });
                }else{
                    setLoadingDettaglio(false);
                }
            }).catch((err)=>{
                setLoadingDettaglio(false);
                navigate(PathPf.LISTA_REL);
                manageError(err,dispatchMainState);
            });
        }else{
            getSingleRelPagopa(token,profilo.nonce,idRel).then((res) =>{
                setLoadingDettaglio(false);
                setRel(res.data);
                getDateLastDownloadPdfFirmato({
                    anno: Number(res.data.anno),
                    mese: Number(res.data.mese),
                    tipologiaFattura: res.data.tipologiaFattura,
                    idContratto: res.data.idContratto,
                    idEnte:res.data.idEnte
                });
            }).catch((err)=>{
                setLoadingDettaglio(false);
                navigate(PathPf.LISTA_REL);
                manageError(err,dispatchMainState);

            });
        }
    };  

    if(loadingDettaglio){
        return(
            <SkeletonRelPdf></SkeletonRelPdf>
        );
    }

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
            <div className='d-flex justify-content-start m-5'>
                {(profilo.auth === 'PAGOPA' && rel?.caricata >= 1 && rel.tipologiaFattura !== 'VAR. SEMESTRALE' && rel.tipologiaFattura !== 'VAR. ANNUALE') &&
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
            <div className="d-flex justify-content-between m-5">
               
                {(enti && rel.totale > 0 && rel.tipologiaFattura !== 'VAR. SEMESTRALE' && rel.tipologiaFattura !== 'VAR. ANNUALE') &&
                    <>
                        <div className="">
                            <Button sx={{width:'274px'}} onClick={() => downloadPdfRel()}  variant="contained">Scarica PDF Reg. Es.<DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
                        </div>
                        <div id='singleInputRel' style={{minWidth: '300px', height:'40px'}}>
                            <SingleFileInput  value={file} loading={loadingUpload} error={errorUpload} accept={[".pdf"]} onFileSelected={(e)=> uploadPdf(e) } onFileRemoved={() => setFile(null)} dropzoneLabel={(rel?.caricata === 1 ||rel?.caricata === 2) ? 'Reinserisci nuovo PDF Reg. Es. firmato':"Inserisci PDF Reg. Es. firmato"} rejectedLabel="Tipo file non supportato" ></SingleFileInput>
                        </div> 
                    </>
                }
              
               
                {(enti && rel?.caricata >= 1 && rel.tipologiaFattura !== 'VAR. SEMESTRALE' && rel.tipologiaFattura !== 'VAR. ANNUALE') &&
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