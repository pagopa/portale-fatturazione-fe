import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked} from '@pagopa/mui-italia';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { RelPageProps } from "../types/typeRel";
import { Button, Typography } from "@mui/material";
import { useNavigate } from 'react-router';
import { getRelPdf, getRelExel } from '../api/api';
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

    const { toPDF, targetRef } = usePDF({filename: 'Regolare Es.pdf'});
  

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    

    const mesi = ["Dicembre", "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

    



    const downloadRelExel = async() =>{

        if( mainState.relSelected !== null){
            await getRelExel(token, mainState.nonce, mainState.relSelected.idTestata).then((res)=>{
                
               
                const link = document.createElement('a');
                link.href = "data:text/plain;base64," + res.data.documento;
                link.setAttribute('download', 'Lista Regolare esecuzione.xlsx'); //or any other extension
                document.body.appendChild(link);
          
                link.click();
                document.body.removeChild(link);
       
            }).catch((err)=>{
                console.log(err);
            });  
        }

        
    };

    

    const downloadPdfRel = async() =>{

        if( mainState.relSelected !== null){
            await getRelPdf(token, mainState.nonce, mainState.relSelected.idTestata).then((res: ResponseDownloadPdf)=>{
                toDoOnDownloadPdf(res);
       
            }).catch((err)=>{
                console.log(err);
            });  
        }

        
    };

    
    const toDoOnDownloadPdf = (res:ResponseDownloadPdf) =>{
        const wrapper = document.getElementById('file_download_rel');
        if(wrapper){
            wrapper.innerHTML = res.data;
        }
    };

    useEffect(()=>{
        if(profilo.auth === 'PAGOPA'){
            console.log('nada');
        }else{
            downloadPdfRel();
        }
      

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
                        <TextDettaglioPdf description={'Tot. Analogico'} value={Number(rel.totaleAnalogico).toFixed(2)+' €'}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Tot. Digitale'} value={Number(rel.totaleDigitale).toFixed(2)+' €'}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Tot. Not. Analogico'} value={rel.totaleNotificheAnalogiche}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Tot. Not. Digitali'} value={rel.totaleNotificheDigitali}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Totale'} value={Number(rel.totale).toFixed(2)+' €'}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Iva'} value={rel.iva +' %'}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Iva Totale Analogico'} value={Number(rel.totaleAnalogicoIva).toFixed(2)+' €'}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Iva Totale Digitale'} value={Number(rel.totaleDigitaleIva).toFixed(2)+' €'}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Iva Totale'} value={Number(rel.totaleIva).toFixed(2)+' €'}></TextDettaglioPdf>
                    </div>
                    }
                </div>
            </div>
            <div className='d-flex justify-content-around m-5'>
                <div className="">
                    <Button onClick={()=> toPDF()}  variant="contained">Scarica Pdf</Button>
                </div>
                <div className="">
                    <Button onClick={()=> downloadRelExel()}  variant="contained">Scarica Lista Rel</Button>
                </div>
            </div>

            
        </div>
       
       
    );
};

export default RelPdfPage;