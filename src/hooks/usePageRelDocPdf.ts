import { useEffect, useRef, useState } from "react";
import { Rel } from "../types/typeRel";
import { profiliEnti } from "../reusableFunction/actionLocalStorage";
import { PathPf } from "../types/enum";
import { getDocumentiEmessiPdf, getDocumentiSospesiPdf, getLogRelDocumentoFirmato, getRelExel, getRelPdf, getRelPdfFirmato, getSingleRel, uploadPdfRel } from "../api/apiSelfcare/relSE/api";
import { manageError, manageErrorDownload, redirect } from "../api/api";
import { getLogPagoPaRelDocumentoFirmato, getRelExelPagoPa, getRelPdfFirmatoPagoPa, getRelPdfPagoPa, getSingleRelPagopa } from "../api/apiPagoPa/relPA/api";
import { ResponseDownloadPdf } from "../types/typeModuloCommessaInserimento";
import { mesiWithZero } from "../reusableFunction/reusableArrayObj";
import { saveAs } from "file-saver";
import generatePDF from "react-to-pdf";
import { ManageErrorResponse } from "../types/typesGeneral";
import { getDettaglioFatturaEmessa, getDettaglioFatturaSospesa } from "../api/apiSelfcare/documentiSospesiSE/api";

function usePageRelDocPdf({
    token,
    profilo,
    mainState,
    dispatchMainState,
    whoInvoke,
    pageFrom,
    navigate,
    profilePath,
    rowId,
}) {

    const targetRef  = useRef<HTMLInputElement>(null);
    const enti = profiliEnti(mainState);
     
  
    const [showDownloading, setShowDownloading] = useState(false);
    const [disableButtonDettaglioNot, setDisableButtonDettaglioNot] = useState(false);
    const [lastUpdateDocFirmato, setLastUpdateDocFirmato] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [errorUpload, setErrorUpload] = useState<boolean>(false);
    const [openModalConfirmUploadPdf, setOpenModalConfirmUploadPdf] = useState<boolean>(false);
    const [loadingDettaglio , setLoadingDettaglio] = useState(true);
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
        caricata: 0,
        fattureSospese:[],
        accontoAnalogico: 0,
        accontoDigitale: 0,
        stornoAnalogico: 0,
        stornoDigitale: 0
    });
        
    const meseOnDoc = rel?.mese || 0;

    
    useEffect(()=>{
        getRel(rowId);
    },[]);

    const getRel = async (id) => {
        setLoadingDettaglio(true);

        try {
            let res; 
            if(whoInvoke === "ente" && pageFrom === "rel"){
                res = await getSingleRel(token, profilo.nonce, id);
            }else if(whoInvoke === "ente" && pageFrom === "documentiemessi"){
                res = await  getDettaglioFatturaEmessa(token,profilo.nonce,id);
            }else if(whoInvoke === "ente" && pageFrom === "documentisospesi"){
                res = await  getDettaglioFatturaSospesa(token,profilo.nonce,id);
            }else if(whoInvoke === "send"&& pageFrom === "rel"){
                res = await  getSingleRelPagopa(token,profilo.nonce,id);
            }

            
            console.log({resRel:res});
            setRel(res.data);
            if (res.data.datiFatturazione === true && pageFrom === "rel") {
               

                await getDateLastDownloadPdfFirmato({
                    anno: Number(res.data.anno),
                    mese: Number(res.data.mese),
                    tipologiaFattura: res.data.tipologiaFattura,
                    idContratto: res.data.idContratto,
                    idEnte: res.data.idEnte,
                });
            }
        } catch (err) {
            navigate(profilePath);
            if (err && typeof err === "object") {
                manageError(err as ManageErrorResponse, dispatchMainState);
            } else {
                // fallback for unexpected errors
                manageError({ message: String(err) } as ManageErrorResponse, dispatchMainState);
            }
        } finally {
            setLoadingDettaglio(false);
        }
    };

     
    
    const downloadReportDettaglio = async () => {
        setShowDownloading(true);

        try {
            let response;
            if (enti) {
         
                if(pageFrom === "rel"){
                    response = await getRelExel(token, profilo.nonce, mainState.relSelected.id);
                }else if(pageFrom === "documentiemessi"){ 
                    throw new Error('404_RIGHE_ID_EMESSE');
                }else if(pageFrom === "documentisospesi"){
                    throw new Error('404_RIGHE_ID_SOSPESE');
                }
            }else if(profilo.auth === 'PAGOPA'){
                response = await getRelExelPagoPa(token, profilo.nonce, mainState.relSelected.id);
            }

            const fileUrl = response.data;

            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = `${rel?.ragioneSociale}_${rel?.mese}_${rel?.anno}.csv`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(fileUrl);

        } catch (error) {
            if (enti) {
         
                if(pageFrom === "rel"){
                    manageErrorDownload('404_RIGHE_ID', dispatchMainState);
                }else if(pageFrom === "documentiemessi"){ 
                    manageErrorDownload('404_RIGHE_ID_EMESSE', dispatchMainState);
                }else if(pageFrom === "documentisospesi"){
                    manageErrorDownload('404_RIGHE_ID_SOSPESE', dispatchMainState);
                }
            }else if(profilo.auth === 'PAGOPA'){
                manageErrorDownload('404_RIGHE_ID', dispatchMainState);
            }
        
            setDisableButtonDettaglioNot(true);
        } finally {
            setShowDownloading(false);
        }
    };
    
    const downloadPdf = async () => {
        try {
            if (enti) {
                setShowDownloading(true);
                let res: ResponseDownloadPdf|undefined;
                if(pageFrom === "rel"){
                    res = await getRelPdf( token,  profilo.nonce,  rowId );
                }else if(pageFrom === "documentiemessi"){ 
                    res = await getDocumentiEmessiPdf(token, profilo.nonce, rowId);
                }else if(pageFrom === "documentisospesi"){
                    res = await getDocumentiSospesiPdf(token, profilo.nonce, rowId);
                }
                if(res){
                    toDoOnDownloadPdf(res);
                }

            }else if (profilo.auth === 'PAGOPA') {
                setShowDownloading(true);
                console.log({MM:mainState});
                const res: ResponseDownloadPdf = await getRelPdfPagoPa(token,profilo.nonce, rowId);
                toDoOnDownloadPdf(res);
            }

        } catch (err:any) {
            setShowDownloading(false);
            manageError(err, dispatchMainState);
        }
    };


    
    const downloadPdfRelFirmato = async() =>{
        setShowDownloading(true);
        if(enti){
            await getRelPdfFirmato(token, profilo.nonce, rowId).then((res)=>{
                saveAs("data:text/plain;base64," + res.data.documento,`REL firmata/${ rel?.ragioneSociale}/${mesiWithZero[Number(meseOnDoc) - 1]}/${rel?.anno}.pdf` );
                setShowDownloading(false);
            }).catch((err)=>{
                manageError(err,dispatchMainState);
                setShowDownloading(false);
            });
        }else{
            await getRelPdfFirmatoPagoPa(token, profilo.nonce, rowId).then((res)=>{
                saveAs("data:text/plain;base64," + res.data.documento,`REL firmata/${ rel?.ragioneSociale}/${mesiWithZero[Number(meseOnDoc) - 1]}/${rel?.anno}.pdf` );
                setShowDownloading(false);
            }).catch((err)=>{
                manageError(err,dispatchMainState);
                setShowDownloading(false);
            });
        } 
            
    };
    
    const getDateLastDownloadPdfFirmato = async(body) =>{
         
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {idEnte, ...bodySelf} = body;
        if(enti){
            await getLogRelDocumentoFirmato(token, profilo.nonce,bodySelf).then((res) =>{
                setLastUpdateDocFirmato(res.data[0].dataEvento);
            }).catch(()=>{ 
                //manageErrorDownload('404',dispatchMainState);
            });
        }else if(profilo.auth === 'PAGOPA'){
            await getLogPagoPaRelDocumentoFirmato(token, profilo.nonce,body).then((res) =>{
                setLastUpdateDocFirmato(res.data[0].dataEvento);
            }).catch(()=>{
                //manageErrorDownload('404',dispatchMainState);
            });
        }
            
    };
        
    const toDoOnDownloadPdf = (res:ResponseDownloadPdf) =>{
        const wrapper = document.getElementById('file_download_rel');
        if(wrapper){
            wrapper.innerHTML = res.data;
            generatePDF(targetRef, {filename: `Regolare Esecuzione/${ rel?.ragioneSociale}/${mesiWithZero[Number(meseOnDoc) - 1]}/${rel.anno}.pdf`});
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
    
  

    return {
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
    };
}

export default usePageRelDocPdf;