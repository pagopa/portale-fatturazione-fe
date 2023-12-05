import { getModuloCommessaPdf, downloadModuloCommessaPdf } from "../api/api";
import {useEffect, useState} from 'react';
import {Typography, Button} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked} from '@pagopa/mui-italia';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useNavigate } from "react-router";
import TextDettaglioPdf from '../components/textDettaglioPdf';
import { DataPdf } from "../types/typeModuloCommessaInserimento";
import { menageError } from "../api/api";
import { usePDF } from 'react-to-pdf';




const ModuloCommessaPdf : React.FC = () =>{

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const { toPDF, targetRef } = usePDF({filename: 'ModuloCommessa.pdf'});

    const navigate = useNavigate();

    const [dataPdf, setDataPdf] = useState<DataPdf>({
        cup: "",
        cig: "",
        codCommessa: "",
        dataDocumento: "",
        splitPayment: "",
        idDocumento: "",
        map: "",
        tipoCommessa: "",
        prodott: "",
        pec: "",
        dataModifica: "",
        meseAttivita: 0,
        contatti: [
            {
                idDatiFatturazione: 0,
                email: ""
            }
        ],
        descrizione: "",
        partitaIva: "",
        indirizzoCompleto: "",
        datiModuloCommessa: [{
            totaleNotifiche: 0,
            numeroNotificheNazionali: 0,
            numeroNotificheInternazionali: 0,
            tipo:"",
            idTipoSpedizione: 0
        }]
    });

    const state = localStorage.getItem('statusApplication') || '{}';
    const statusApp =  JSON.parse(state);

    

    const getPdf = async() =>{
        getModuloCommessaPdf(token, statusApp.anno,statusApp.mese).then((res)=>{
            setDataPdf(res.data);
            localStorage.setItem("tipo", res.data.tipoCommessa);
         
        }).catch((err)=>{
            console.log('ccccc');
        });  
    };
 
    const downloadPdf = async()=>{
        const tipoCommessa =  localStorage.getItem('tipo') || '';
        downloadModuloCommessaPdf(token, statusApp.anno,statusApp.mese, tipoCommessa).then((res)=>{
            const wrapper = document.getElementById('file_download');
            if(wrapper){
                wrapper.innerHTML = res.data;
            }
        }).catch((err)=>{
            console.log(err);
        });   
    };
    useEffect(()=>{
        getPdf();
        downloadPdf();
    },[]);
    
   

    return (
        <div className="">
           
            <div className='d-flex marginTop24 '>
                <ButtonNaked
                    color="primary"
                    onFocusVisible={() => { console.log('onFocus'); }}
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/8') }
                   
                >
                    Esci
 
                </ButtonNaked>
              
                <Typography sx={{ fontWeight:'bold', marginLeft:'20px'}} variant="caption">

                    <ViewModuleIcon sx={{paddingBottom:'3px'}}  fontSize='small'></ViewModuleIcon>
                      Modulo commessa 
                    
                </Typography>
                <Typography  variant="caption">/ Mese</Typography>
                 
                 
                
            </div>
            <div className="bg-white m-5 p-5">

            

                <div className=" ">

                    <div className="container text-center">
                        <TextDettaglioPdf description={'Soggetto aderente'} value={dataPdf.descrizione}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Sede Legale completa'} value={dataPdf.indirizzoCompleto}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Partita IVA'} value={dataPdf.partitaIva}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Codice Fiscale'} value={''}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Codice IPA'} value={''}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Codice SDI'} value={''}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Soggetto Split Payment'} value={dataPdf.splitPayment}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Altre informazioni utili ai fini della fatturazione'} value={''}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'PEC'} value={dataPdf.pec}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Indirizzo email amministrativo  di riferimento per contatti'} value={dataPdf.contatti[0].email}></TextDettaglioPdf>
                        <TextDettaglioPdf description={'Data di compilazione'} value={dataPdf.dataDocumento}></TextDettaglioPdf>
                    </div>
                </div>

                <div className="mt-5">
                    <div className="container text-center">
                        <div className="row">
                            <div className="col-7">
                        
                            </div>
                            <div className="col-5">
                                <div className="row">
                                    <div className="col">
                                        <Typography  variant="overline">Terristorio nazionale</Typography>
                                    </div>
                                    <div className="col">
                                        <Typography  variant="overline">Terristorio diverso da  nazionale</Typography>
                                    </div>
                                    <div className="col">
                                        <Typography  variant="overline">Totale notifiche da processare</Typography>
                                    </div>
                                </div>
    
                            </div>
                       
                        </div>

                    
                        {dataPdf.datiModuloCommessa.map((singleObj)=>{
                            return (
                                <div className="row mt-3">
                                    <div className="col-7">
                                      
                                        <Typography sx={{display:'flex',textAlign:'left'}} variant="caption">{singleObj.tipo}</Typography>
                                     
                                        
                                    </div>
                                    <div className="col-5">
                                        <div className="row">
                                            <div className="col">
                                                <Typography  variant="caption">{singleObj.numeroNotificheNazionali}</Typography>
                                            </div>
                                            <div className="col">
                                                <Typography  variant="caption">{singleObj.numeroNotificheInternazionali}</Typography>
                                            </div>
                                            <div className="col">
                                                <Typography  variant="caption">{singleObj.totaleNotifiche}</Typography>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                       
                    
                    </div>
                </div>
               

            </div>
            <div className="d-flex justify-content-center">
                <Button onClick={()=> toPDF()}  variant="contained">Scarica</Button>
            </div>



            <div style={{position:'absolute', zIndex:'-1'}}  id='file_download' ref={targetRef}>

            </div>
            

        </div>
    );
};
export default ModuloCommessaPdf;

