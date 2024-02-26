import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked} from '@pagopa/mui-italia';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Rel, RelPageProps } from "../types/typeRel";
import { Button, Typography } from "@mui/material";
import { useNavigate } from 'react-router';
import { getSingleRel, manageError } from '../api/api';
import { useEffect, useState } from 'react';
import TextDettaglioPdf from '../components/commessaPdf/textDettaglioPdf';

const RelPdfPage : React.FC<RelPageProps> = ({mainState}) =>{

    const mesi = ["Dicembre", "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const navigate = useNavigate();

    const [rel,setRel] = useState<Rel>({
        idTestata: '',
        idEnte: '',
        ragioneSociale: '',
        dataDocumento: '',
        idDocumento: '',
        cup: '',
        idContratto: '',
        tipologiaFattura: '',
        anno: '',
        mese: '',
        totaleAnalogico: 0,
        totaleDigitale: '',
        totaleNotificheAnalogiche: 0,
        totaleNotificheDigitali: 0,
        totale: 0
    });


    const getRel = async() => {
        getSingleRel(token,mainState.nonce,mainState.idRel).then((res) =>{
           
            setRel(res.data);
        }).catch((err)=>{
            manageError(err, navigate);
        }
          
        );
    };  

    useEffect(()=>{
        console.log(mainState);
        if(mainState.nonce !== '' && mainState.idRel !== '' ){
            getRel();
        }
      
    },[mainState]);



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
              
                <Typography sx={{ fontWeight:'bold', marginLeft:'20px'}} variant="caption">
                    <ManageAccountsIcon sx={{paddingBottom:'3px'}}  fontSize='small'></ManageAccountsIcon>
                      Rel /
                    
                </Typography>
                <Typography sx={{fontWeight:'bold', marginLeft:'5px'}} variant="caption">
                   
                      Dettaglio
                    
                </Typography>
               
                 
                 
                
            </div>
            <div className="bg-white m-5">
                <div className="pt-5 pb-5 ">
                    {/* nascondo il pdf
                    <div style={{ position:'absolute',zIndex:-1}}  id='file_download' ref={targetRef}>

                    </div>
 */}

                    <div className="container text-center">
                        <TextDettaglioPdf description={'Soggetto aderente'} value={rel.ragioneSociale}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Tipologia Fattura'} value={rel.tipologiaFattura}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Anno'} value={rel.anno}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Mese'} value={mesi[rel.mese]}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Cup'} value={rel.cup}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Tot. Analogico'} value={rel.totaleAnalogico}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Tot. Digitale'} value={rel.totaleDigitale}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Tot. Not. Analogico'} value={rel.totaleNotificheAnalogiche}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Tot. Not. Digitali'} value={rel.totaleNotificheDigitali}></TextDettaglioPdf>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-center mb-5">
                <Button onClick={()=> console.log('scarica')}  variant="contained">Scarica</Button>
            </div>
        </div>
       
    );
};

export default RelPdfPage;