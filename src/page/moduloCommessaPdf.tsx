import { manageError } from "../api/api";
import {useEffect, useState} from 'react';
import {Typography, Button} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked} from '@pagopa/mui-italia';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useNavigate } from "react-router";
import TextDettaglioPdf from '../components/commessaPdf/textDettaglioPdf';
import { DataPdf } from "../types/typeModuloCommessaInserimento";
import { usePDF } from 'react-to-pdf';
import { DatiModuloCommessaPdf,ModComPdfProps, ResponseDownloadPdf } from "../types/typeModuloCommessaInserimento";
import { downloadModuloCommessaPdf, getModuloCommessaPdf } from "../api/apiSelfcare/moduloCommessaSE/api";
import { downloadModuloCommessaPagoPaPdf, getModuloCommessaPagoPaPdf } from "../api/apiPagoPa/moduloComessaPA/api";

const ModuloCommessaPdf : React.FC<ModComPdfProps> = ({mainState}) =>{

    const month = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre","Gennaio"];
    const mesiWithZero = ['01','02','03','04','05','06','07','08','09','10','11','12'];

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    const state = localStorage.getItem('statusApplication') || '{}';
    const statusApp =  JSON.parse(state);

    const tipoCommessa =  localStorage.getItem('tipo') || '';

   
    function createDateFromString(string:string){
        const getGiorno = new Date(string).getDate();
      
        const getMese = new Date(string).getMonth() + 1;
        const getAnno = new Date(string).getFullYear();

        return getGiorno+'/'+getMese+'/'+getAnno;
    }
    

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
        }],
        datiModuloCommessaCosti:[
            {Totale:'',
                descrizione:''}
        ]
    });
   
    const { toPDF, targetRef } = usePDF({filename: `Modulo Commessa /${dataPdf.descrizione} /${mesiWithZero[statusApp.mese -1]}/ ${statusApp.anno}.pdf`});
    interface DatiCommessaPdf {
        totaleNotifiche?: number,
        numeroNotificheNazionali?: number,
        numeroNotificheInternazionali?: number,
        tipo?: string,
        idTipoSpedizione?: number
    }

    interface ResponseGetPdfPagoPa {
        data:DataPdf
    }
 
    // richiamo questa funzione in entrambe le getPdf     selfcare     pagopa
    const toDoOnGetPdfSelfcarePagopa = (res:ResponseGetPdfPagoPa) =>{

        let final = [{
            totaleNotifiche: 0,
            numeroNotificheNazionali: 0,
            numeroNotificheInternazionali: 0,
            tipo:"",
            idTipoSpedizione: 0
        }];
       
        const primo = res.data.datiModuloCommessa.find((obj:DatiCommessaPdf)=>obj.idTipoSpedizione === 3);
        const secondo = res.data.datiModuloCommessa.find((obj:DatiCommessaPdf)=>obj.idTipoSpedizione === 1);
        const terzo = res.data.datiModuloCommessa.find((obj:DatiCommessaPdf)=>obj.idTipoSpedizione === 2);
        const quarto = res.data.datiModuloCommessa.find((obj:DatiCommessaPdf)=>obj.idTipoSpedizione === 0);

        if(primo !== undefined && secondo !== undefined && terzo !== undefined && quarto !== undefined){
            final = [primo, secondo, terzo, quarto];
        }
         
        setDataPdf({...res.data,...{datiModuloCommessa:final}});
        localStorage.setItem("tipo", res.data.tipoCommessa);
    };

    const getPdf = async() =>{
        getModuloCommessaPdf(token, statusApp.anno,statusApp.mese, profilo.nonce).then((res:ResponseGetPdfPagoPa)=>{

            toDoOnGetPdfSelfcarePagopa(res);
         
        }).catch((err)=>{
            manageError(err, navigate);
        });  
    };

    const getPagoPdf = async() =>{
        getModuloCommessaPagoPaPdf(token, profilo.nonce,statusApp.mese,statusApp.anno,profilo.idEnte, profilo.prodotto, profilo.idTipoContratto)
            .then((res)=>{

                toDoOnGetPdfSelfcarePagopa(res);
         
            }).catch((err)=>{
                manageError(err, navigate);
            });  
    };

    const toDoOnDownloadPdf = (res:ResponseDownloadPdf) =>{

        const wrapper = document.getElementById('file_download');
        if(wrapper){
            wrapper.innerHTML = res.data;
        }
    };
 
    const downloadPdf = async()=>{
       
        downloadModuloCommessaPdf(token, statusApp.anno,statusApp.mese, tipoCommessa, profilo.nonce).then((res: ResponseDownloadPdf)=>{
            toDoOnDownloadPdf(res);
           
        }).catch((err)=>{
            manageError(err, navigate);
        });   
    };

    const downlodPagoPaPdf = async()=>{
        downloadModuloCommessaPagoPaPdf(token,  profilo.nonce,statusApp.mese,statusApp.anno,profilo.idEnte, profilo.prodotto, profilo.idTipoContratto,tipoCommessa).then((res:ResponseDownloadPdf)=>{
         
            toDoOnDownloadPdf(res);
        }).catch((err)=>{
            manageError(err, navigate);
        }); 
    };
 
    useEffect(()=>{

        if(profilo.nonce !== undefined){

            if(profilo.auth === 'PAGOPA'){
                getPagoPdf();
                downlodPagoPaPdf();
            }else{
                getPdf();
                downloadPdf();
            }
          
        }
      
    },[profilo.nonce]);

    let mese = '';
    let anno = 2000;

    const mon = new Date().getMonth();
    const date = new Date();
    mese = month[mon + 1 ];
    if(mon === 11){
       
        anno = date.getFullYear()+1;
       
    }else{
        anno = date.getFullYear();
    }

    const replaceDate = (arr:DatiModuloCommessaPdf[], stringToRepace:string, stringToInsert:string) =>{
  
        return arr.map((singleObj :DatiModuloCommessaPdf ) =>{
            singleObj.tipo = singleObj.tipo.replace(stringToRepace,stringToInsert);
            return singleObj;
        });
    };
    const string = `${mese}/${anno}`;
   
    const arrWithlabelDateMonth = replaceDate(dataPdf.datiModuloCommessa,'[data]',string );

    const onIndietroButton = () =>{

        const newStatusApp = {...statusApp, ...{userClickOn:'GRID'}};
      
        localStorage.setItem('statusApplication', JSON.stringify(newStatusApp));
        navigate('/8'); 
    };

    return (
        <>
        
            <div className="">
                
                <div className='d-flex marginTop24 ms-5 '>
                    <ButtonNaked
                        color="primary"
                        onFocusVisible={() => { console.log('onFocus'); }}
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => onIndietroButton() }
                   
                    >
                    Indietro
 
                    </ButtonNaked>
              
                    <Typography sx={{ fontWeight:'bold', marginLeft:'20px'}} variant="caption">

                        <ViewModuleIcon sx={{paddingBottom:'3px'}}  fontSize='small'></ViewModuleIcon>
                      Modulo commessa 
                    
                    </Typography>
                    <Typography  variant="caption">/ {mese}</Typography>
                
                </div>
                <div className="bg-white m-5 p-5">

                    <div className=" ">
                        {/* nascondo il pdf */}
                        <div style={{ position:'absolute',zIndex:-1}}  id='file_download' ref={targetRef}>

                        </div>

                        <div className="container text-center">
                            <TextDettaglioPdf description={'Soggetto aderente'} value={dataPdf.descrizione}></TextDettaglioPdf>
                            <TextDettaglioPdf description={'Sede Legale completa'} value={dataPdf.indirizzoCompleto}></TextDettaglioPdf>
                            <TextDettaglioPdf description={'Partita IVA/Codice Fiscale'} value={dataPdf.partitaIva}></TextDettaglioPdf>
                            <TextDettaglioPdf description={'Cup'} value={dataPdf.cup}></TextDettaglioPdf>
                            <TextDettaglioPdf description={'Cig'} value={dataPdf.cig}></TextDettaglioPdf>
                            <TextDettaglioPdf description={'Soggetto Split Payment'} value={dataPdf.splitPayment}></TextDettaglioPdf>
                            <TextDettaglioPdf description={'PEC'} value={dataPdf.pec}></TextDettaglioPdf>
                            <TextDettaglioPdf description={'Email riferimento contatti'} value={dataPdf?.contatti[0]?.email}></TextDettaglioPdf>
                            <TextDettaglioPdf description={'Data di compilazione'} value={createDateFromString(dataPdf.dataModifica)|| ''}></TextDettaglioPdf>
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
                                            <Typography  variant="overline">Territorio nazionale</Typography>
                                        </div>
                                        <div className="col">
                                            <Typography  variant="overline">Territorio diverso da  nazionale</Typography>
                                        </div>
                                        <div className="col">
                                            <Typography  variant="overline">Totale notifiche da processare</Typography>
                                        </div>
                                    </div>
    
                                </div>
                       
                            </div>
                    
                            {arrWithlabelDateMonth.map((singleObj:DatiModuloCommessaPdf)=>{
                                return (
                                    <div key={Math.random()} className="row mt-3">
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
                            <hr></hr>

                            {dataPdf.datiModuloCommessaCosti.map((singleObj)=>{
                                return (
                                    <div key={Math.random()} className="row mt-3">
                                        <div className="col-7">
      
                                            <Typography sx={{display:'flex',textAlign:'left'}} variant="caption">{singleObj.descrizione}</Typography>
        
                                        </div>
                                        <div className="col-5">
                                           
                                            <div className="row">
                                                <div className="col">
                                                  
                                                </div>
                                                <div className="col">
                                                    
                                                </div>
                                                <div className="row">
                                                    <div className="d-flex flex-row-reverse">
                                                        <Typography  variant="caption">{singleObj.Totale}</Typography>
                                                    </div>
                                                </div>
                                              
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    
                        </div>
                    </div>

                </div>
                <div className="d-flex justify-content-center mb-5">
                    <Button onClick={()=> toPDF()}  variant="contained">Scarica</Button>
                </div>

            </div>
           
        </>
    );
};
export default ModuloCommessaPdf;
