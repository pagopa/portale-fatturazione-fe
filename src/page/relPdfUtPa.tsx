import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked} from '@pagopa/mui-italia';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { RelPageProps } from "../types/typeRel";
import { Button, Typography } from "@mui/material";
import { useNavigate } from 'react-router';
import { getRelPdf, getRelExel, manageError, getRelExelPagoPa } from '../api/api';
import { useEffect} from 'react';
import TextDettaglioPdf from '../components/commessaPdf/textDettaglioPdf';
import { usePDF } from 'react-to-pdf';
import { ResponseDownloadPdf } from '../types/typeModuloCommessaInserimento';

const RelPdfPage : React.FC<RelPageProps> = ({mainState}) =>{

    const rel = mainState.relSelected;

    const navigate = useNavigate();

    if(rel === null){
        navigate('/rel');
    }

    const { toPDF, targetRef } = usePDF({filename: 'Regolare Esecuzione.pdf'});
  

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    

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

    
    const toDoOnDownloadPdf = (res:ResponseDownloadPdf) =>{
        const wrapper = document.getElementById('file_download_rel');
        if(wrapper){
            wrapper.innerHTML = res.data;
        }
    };

    useEffect(()=>{
        downloadPdfRel();
    },[]);

    return (
        <div>
            <div className='d-flex marginTop24 ms-5 '>
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
            <div className="bg-white m-5">
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
            <div className='d-flex justify-content-around m-5'>
                {profilo.auth === 'SELFCARE' &&
                 <div className="">
                     <Button sx={{width:'274px'}} onClick={()=> toPDF()}  variant="contained">Scarica Pdf Regolare Esecuzione</Button>
                 </div>
                }
               
                <div className="">
                    <Button sx={{width:'274px'}} onClick={()=> downloadRelExel()}  variant="contained">Scarica lista Regolare Esecuzione</Button>
                </div>
            </div>

            
        </div>
       
       
    );
};

export default RelPdfPage;