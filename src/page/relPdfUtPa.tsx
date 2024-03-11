import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked, SingleFileInput} from '@pagopa/mui-italia';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { RelPageProps } from "../types/typeRel";
import { Button, Typography } from "@mui/material";
import { useNavigate } from 'react-router';
import { manageError } from '../api/api';
import { useEffect, useRef, useState} from 'react';
import TextDettaglioPdf from '../components/commessaPdf/textDettaglioPdf';
import { ResponseDownloadPdf } from '../types/typeModuloCommessaInserimento';
import { getRelExel, getRelPdf, uploadPdfRel ,getRelPdfFirmato, getSingleRel } from '../api/apiSelfcare/relSE/api';
import { getRelExelPagoPa } from '../api/apiPagoPa/relPA/api';
import DownloadIcon from '@mui/icons-material/Download';

import generatePDF from 'react-to-pdf';


const RelPdfPage : React.FC<RelPageProps> = ({mainState, dispatchMainState}) =>{

    const rel = mainState.relSelected;

    const navigate = useNavigate();

    

    useEffect(()=>{
        if(rel === null){
            navigate('/rel');
        }
    },[]);

    const targetRef  = useRef<HTMLInputElement>(null);

    const targetRefFirmata = useRef<HTMLInputElement>(null); 
  

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

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
                
               
                    const link = document.createElement('a');
                    link.href = "data:text/plain;base64," + res.data.documento;
                    link.setAttribute('download', 'Lista Regolare esecuzione.xlsx'); //or any other extension
                    document.body.appendChild(link);
              
                    link.click();
                    document.body.removeChild(link);
           
                }).catch((err)=>{
                    manageError(err,navigate);
                });
            }else{
                await getRelExelPagoPa(token, profilo.nonce, mainState.relSelected.idTestata).then((res)=>{
                
               
                    const link = document.createElement('a');
                    link.href = "data:text/plain;base64," + res.data.documento;
                    link.setAttribute('download', 'Lista Regolare esecuzione.xlsx'); //or any other extension
                    document.body.appendChild(link);
              
                    link.click();
                    document.body.removeChild(link);
           
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

    const downloadPdfRelFirmato = async() =>{

        if( mainState.relSelected !== null){
            if(profilo.auth === 'SELFCARE'){
                await getRelPdfFirmato(token, profilo.nonce, mainState.relSelected.idTestata).then((res: ResponseDownloadPdf)=>{
                    toDoOnDownloadPdf(res);
               
                }).catch((err)=>{
                    manageError(err,navigate);
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
        if(rel?.caricata === 1){
            downloadPdfRelFirmato();
        }
        
    },[]);

    const [file, setFile] = useState<File | null>(null);

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

        if(rel){
            await uploadPdfRel(token, profilo.nonce, rel.idTestata, {file:file} ).then((res)=>{
                getRel(rel.idTestata);
                setFile(null);
           
            }).catch((err)=>{
                manageError(err,navigate);
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




  

    return (
        <div>
            <div className='d-flex justify-content-between marginTop24  '>
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
                
               
                
                <div className='me-5'>
                
                    <Button sx={{width:'274px'}} onClick={()=> downloadRelExel()}  variant="contained"><DownloadIcon sx={{marginRight:'20px'}}></DownloadIcon>Scarica report di dettaglio notifiche Reg. Es.</Button>
             
                </div>
                
                
               
                
                 
                
            </div>
            <div className="bg-white m-5">
                <div className="pt-5 pb-5 ">
                
                    <div style={{ position:'absolute',zIndex:-1}}  id='file_download_rel' ref={targetRef}>

                    </div>
                    <div style={{ position:'absolute',zIndex:-1}}  id='file_download_rel_firmata' ref={targetRefFirmata}>

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
                        <TextDettaglioPdf description={'N. Tototale Notifiche'} value={rel.totaleNotificheDigitali + rel.totaleNotificheAnalogiche }></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Totale Imponibile Analogico'} value={Number(rel.totaleAnalogico).toFixed(2)+' €'}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Totale Imponibile Digitale'} value={Number(rel.totaleDigitale).toFixed(2)+' €'}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Totale Imponibile'} value={Number(rel.totale).toFixed(2)+' €'}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Iva'} value={rel.iva +' %'}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Totale Ivato Analogico '} value={Number(rel.totaleAnalogicoIva).toFixed(2)+' €'}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Totale Ivato Digitale'} value={Number(rel.totaleDigitaleIva).toFixed(2)+' €'}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Totale Ivato'} value={Number(rel.totaleIva).toFixed(2)+' €'}></TextDettaglioPdf>
                        
                    </div>
                    }
                </div>
            </div>
           
            {profilo.auth === 'SELFCARE' &&
                 <div className='d-flex justify-content-between m-5'>
                     <div className="">
                         <Button sx={{width:'274px'}} onClick={() => generatePDF(targetRef, {filename: 'Regolare Esecuzione.pdf'})}  variant="contained"><DownloadIcon sx={{marginRight:'20px'}}></DownloadIcon>Scarica PDF Reg. Es.</Button>
                     </div>
              
               
                     <div>
                         <div id='singleInputRel' style={{minWidth: '300px', height:'40px'}}>
                             <SingleFileInput  value={file} accept={[".pdf"]} onFileSelected={(e)=>handleSelect(e)} onFileRemoved={handleRemove} dropzoneLabel={(rel?.caricata === 1 ||rel?.caricata === 2) ? 'Reinserisci nuovo PDF Reg. Es. firmato':"Inserisci PDF Reg. Es.  firmato"} rejectedLabel="Tipo file non supportato" ></SingleFileInput>
                         </div> 
                     </div>
                     {rel?.caricata === 1 &&
                <div>
                    <Button sx={{width:'300px'}} onClick={() => generatePDF(targetRefFirmata, {filename: 'Regolare Esecuzione Firmato.pdf'})}   variant="contained"> <DownloadIcon sx={{marginRight:'20px'}}></DownloadIcon>Scarica PDF Firmato</Button>
                </div>
                     }
                 </div>
            }
           
            
           
            
        </div>
       
       
    );
};

export default RelPdfPage;