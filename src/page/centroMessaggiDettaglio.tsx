import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked} from '@pagopa/mui-italia';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Button, Typography } from "@mui/material";
import { useEffect, useState} from 'react';
import TextDettaglioPdf from '../components/commessaPdf/textDettaglioPdf';
import DownloadIcon from '@mui/icons-material/Download';
import ModalLoading from '../components/reusableComponents/modals/modalLoading';
import SkeletonRelPdf from '../components/rel/skeletonRelPdf';
import { MainState } from '../types/typesGeneral';
import { useNavigate, useParams } from 'react-router';
import { downloadMessaggioPagoPa, readMessaggioPagoPa } from '../api/apiPagoPa/centroMessaggi/api';
import { saveAs } from "file-saver";
import { manageErrorDownload } from "../api/api";
import { getProfilo, getToken } from '../reusableFunction/actionLocalStorage';
import { Messaggi } from './centroMessaggi';


interface DettaglioMessaggioProps{
    mainState:MainState,
    dispatchMainState:any
}

const DettaglioMessaggio : React.FC<DettaglioMessaggioProps> = ({mainState,dispatchMainState}) =>{

    const { id } = useParams();
    const navigate = useNavigate();
  

    const [details, setDetails] = useState<Messaggi>( {
        idEnte: '',
        idUtente: '',
        json: '',
        anno: 0,
        mese: 0,
        prodotto: '',
        gruppoRuolo: '',
        auth: '',
        stato: '',
        dataInserimento: '',
        dataStepCorrente: '',
        linkDocumento: '',
        tipologiaDocumento: '',
        lettura: false,
        hash: ''
    });

    useEffect(()=>{
        if(mainState.messaggioSelected !== null){
            setDetails(mainState.messaggioSelected);
        }
    },[mainState.messaggioSelected]);

    useEffect(()=>{
        readMessage();
    },[mainState.messaggioSelected]);

   
    const token = getToken();
    const profilo = getProfilo();


    const [showDownloading,setShowDownloading] = useState(false);

    const downloadMessaggio = async (idMessaggio) => {
        setShowDownloading(true);
        await downloadMessaggioPagoPa(token,profilo.nonce,{idMessaggio}).then((response)=>{
            if (response.ok) {
                return response.blob();
            }
            throw '404';
        }).then((response)=>{
            const title = `Lista report.zip`;
           
            saveAs(response,title);
            setShowDownloading(false);
        }).catch(((err)=>{
            setShowDownloading(false);
            manageErrorDownload(err,dispatchMainState);
        }));
    };


    const readMessage = async() => {
        await readMessaggioPagoPa(token,profilo.nonce,{idMessaggio:Number(id)}).then((res)=>{

            console.log(res);
    
        }).catch((err)=>{
           
            console.log(err);
        });
    };
   
    if(showDownloading){
        return(
            <SkeletonRelPdf></SkeletonRelPdf>
        );
    }

    return (
        <div>
            {/*<div style={{ position:'absolute',zIndex:-1, top:'-1000px'}}  id='file_download_rel' ref={targetRef}>
            </div>*/}
            <div className=' marginTop24  '>
                <div className='ms-5'>
                    <ButtonNaked
                        color="primary"
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        onClick={() =>  navigate('/centromessaggi')}
                    >
                    Indietro
                    </ButtonNaked>
                    <Typography sx={{marginLeft:'20px',fontWeight:'bold'}} variant="caption">
                        <ManageAccountsIcon sx={{paddingBottom:'3px',}}  fontSize='small'></ManageAccountsIcon>
                      Dettaglio
                    </Typography>
                </div>
            </div>
            <div className='d-flex justify-content-end mt-4 me-5'>
                <Button  onClick={()=>downloadMessaggio(id)} >Scarica report <DownloadIcon sx={{marginLeft:'20px'}}></DownloadIcon></Button>
            </div>
            <div className="bg-white mb-5 me-5 ms-5">
                <div className="pt-5 pb-5 ">
                    <div className="container text-center">
                        <TextDettaglioPdf description='Tipologia Documento' value={details.tipologiaDocumento}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Data Inserimento' value={details.data||''}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Anno' value={details.anno}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Mese' value={details.mese}></TextDettaglioPdf>
                        <TextDettaglioPdf description='Stato' value={details.stato}></TextDettaglioPdf>
                  
                    </div>
                </div>
            </div>
        
            <ModalLoading 
                open={showDownloading} 
                setOpen={setShowDownloading}
                sentence={'Downloading...'} >
            </ModalLoading>
        </div>
    );
};

export default DettaglioMessaggio;