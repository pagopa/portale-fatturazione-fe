import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked} from '@pagopa/mui-italia';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Rel, RelPageProps } from "../types/typeRel";
import { Button, Typography } from "@mui/material";
import { useNavigate } from 'react-router';
import { getRelPdf, getSingleRel, manageError } from '../api/api';
import { useEffect, useState } from 'react';
import TextDettaglioPdf from '../components/commessaPdf/textDettaglioPdf';
import { usePDF } from 'react-to-pdf';
import { ResponseDownloadPdf } from '../types/typeModuloCommessaInserimento';

const RelPdfPage : React.FC<RelPageProps> = ({mainState}) =>{

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    const { toPDF, targetRef } = usePDF({filename: 'Rel.pdf'});

    const mesi = ["Dicembre", "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

 

    const navigate = useNavigate();

    const rel = mainState.relSelected;

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
                    </div>
                    }
                </div>
            </div>

            <div className="d-flex justify-content-center mb-5">
                <Button onClick={()=> toPDF()}  variant="contained">Scarica</Button>
            </div>
        </div>
       
    );
};

export default RelPdfPage;