import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked, SingleFileInput} from '@pagopa/mui-italia';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { RelPageProps } from "../types/typeRel";
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
import BasicAlerts from '../components/reusableComponents/alert';


const RelPdfPage : React.FC<RelPageProps> = ({mainState, dispatchMainState}) =>{

    const targetRef  = useRef<HTMLInputElement>(null);

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    const state = localStorage.getItem('statusApplication') || '{}';
    const statusApp =  JSON.parse(state);

    const mesiWithZero = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    const rel = mainState.relSelected;

    const navigate = useNavigate();

    useEffect(()=>{
        if(rel === null){
            navigate('/rel');
        }

        if(!token){
            window.location.href = redirect;
        }
    },[]);

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    const mesi = ["Dicembre", "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
    
    const downloadRelExel = async() =>{

        if( mainState.relSelected !== null){

            if(profilo.auth === 'SELFCARE'){
                await getRelExel(token, profilo.nonce, mainState.relSelected.idTestata).then((res)=>{
               
                    saveAs("data:text/plain;base64," + res.data.documento,`Rel / Report di dettaglio/ ${ mainState.relSelected?.ragioneSociale} /${statusApp.mese}/${statusApp.anno}.xlsx` );
                }).catch((err)=>{
                    manageError(err,navigate);
                });
            }else{
                await getRelExelPagoPa(token, profilo.nonce, mainState.relSelected.idTestata).then((res)=>{
                    saveAs("data:text/plain;base64," + res.data.documento,`Rel / Report di dettaglio / ${ mainState.relSelected?.ragioneSociale} / ${statusApp.mese} / ${statusApp.anno}.xlsx` );
                }).catch((err)=>{
                    manageError(err,navigate);
                });
                
            }
             
        }
        
    };

    const downloadPdfRel = async() =>{

        if( mainState.relSelected !== null){
            if(profilo.auth === 'SELFCARE'){
                await getRelPdf(token, profilo.nonce, mainState.relSelected.idTestata).then((res: ResponseDownloadPdf)=>{
                    toDoOnDownloadPdf(res);
                }).catch((err)=>{
                    manageError(err,navigate);
                });
            }  
        }
        
    };

    const meseOnDoc = mainState.relSelected?.mese || 0;
    const downloadPdfRelFirmato = async() =>{

      
        if( mainState.relSelected !== null){
            if(profilo.auth === 'SELFCARE'){
                await getRelPdfFirmato(token, profilo.nonce, mainState.relSelected.idTestata).then((res)=>{
                    saveAs("data:text/plain;base64," + res.data.documento,`REL firmata / ${ mainState.relSelected?.ragioneSociale}/${mesiWithZero[Number(meseOnDoc) - 1]}/${statusApp.anno}.pdf` );
                }).catch((err)=>{
                    manageError(err,navigate);
                });
            }else{
                await getRelPdfFirmatoPagoPa(token, profilo.nonce, mainState.relSelected.idTestata).then((res)=>{
                    saveAs("data:text/plain;base64," + res.data.documento,`REL firmata / ${ mainState.relSelected?.ragioneSociale}/${mesiWithZero[Number(meseOnDoc) - 1]}/${statusApp.anno}.pdf` );
                }).catch((err)=>{
                    manageError(err,navigate);
                });
                
            } 
        }
        
    };


    const [lastUpdateDocFirmato, setLastUpdateDocFirmato] = useState('');

    
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

            if(profilo.auth === 'SELFCARE'){
                await getLogRelDocumentoFirmato(token, profilo.nonce,bodySelf).then((res) =>{
                    setLastUpdateDocFirmato(res.data[0].dataEvento);
               
                }).catch((err)=>{
                   
                    manageError(err, navigate);
                });
            }else if(profilo.auth === 'PAGOPA'){
                await getLogPagoPaRelDocumentoFirmato(token, profilo.nonce,bodyPagopa).then((res) =>{
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
        }
    };

    useEffect(()=>{
        downloadPdfRel(); 
        getDateLastDownloadPdfFirmato();  
    },[]);

    const [file, setFile] = useState<File | null>(null);
    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [errorUpload, setErrorUpload] = useState<boolean>(false);
    const [openModalConfirmUploadPdf, setOpenModalConfirmUploadPdf] = useState<boolean>(false);

    const handleSelect = (e) => {
        setFile(e);
    };
    const handleRemove = () => {
        setFile(null);
    };
   
    useEffect(()=>{
        if(file !== null){
            uploadPdf();
        }
    },[file]);
  
    const uploadPdf = async () =>{
        setLoadingUpload(true);
        setErrorUpload(false);
        if(rel){
            await uploadPdfRel(token, profilo.nonce, rel.idTestata, {file:file} ).then((res)=>{
              
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
     
        getSingleRel(token,profilo.nonce,idRel).then((res) =>{
            handleModifyMainState({relSelected:res.data});
           
        }).catch((err)=>{
            manageError(err, navigate);
        }
              
        );
    };



    /*
    const [visible, setVisible] = useState(false);
    <Button onClick={() => setVisible(true)}>ciao</Button>
    <BasicAlerts setVisible={setVisible} visible={visible} typeAlert={''}></BasicAlerts>
*/
    function createDateFromString(string:string){
        const getGiorno = new Date(string).getDate();
  
        const getMese = new Date(string).getMonth() + 1;
        const getAnno = new Date(string).getFullYear();

        return getGiorno+'/'+getMese+'/'+getAnno;
    }


    const classContainerButtons = profilo.auth === 'SELFCARE' ? 'd-flex justify-content-between m-5': 'd-flex justify-content-end m-5';

    return (
        <div>
           
            <div className=' marginTop24  '>
                
                <div className='ms-5'>
             
                    <ButtonNaked
                        color="primary"
                        onFocusVisible={() => { console.log('onFocus'); }}
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/rel')}
                   
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
                
                    <div style={{ position:'absolute',zIndex:-1}}  id='file_download_rel' ref={targetRef}>

                    </div>
                
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
                {profilo.auth === 'SELFCARE' &&
                 <>
                     <div className="">
                         <Button sx={{width:'274px'}} onClick={() => generatePDF(targetRef, {filename: `Regolare Esecuzione / ${ mainState.relSelected?.ragioneSociale}/${mesiWithZero[Number(meseOnDoc) - 1]}/${statusApp.anno} .pdf`})}  variant="contained">Scarica PDF Reg. Es.<DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
                     </div>
               
                     
                     <div id='singleInputRel' style={{minWidth: '300px', height:'40px'}}>
                         <SingleFileInput  value={file} loading={loadingUpload} error={errorUpload} accept={[".pdf"]} onFileSelected={(e)=>handleSelect(e)} onFileRemoved={handleRemove} dropzoneLabel={(rel?.caricata === 1 ||rel?.caricata === 2) ? 'Reinserisci nuovo PDF Reg. Es. firmato':"Inserisci PDF Reg. Es.  firmato"} rejectedLabel="Tipo file non supportato" ></SingleFileInput>
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
        </div>
       
    );
};

export default RelPdfPage;