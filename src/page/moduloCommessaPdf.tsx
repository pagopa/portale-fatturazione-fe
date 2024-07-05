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
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { PathPf } from "../types/enum";
import { getProfilo, getStatusApp, getTipoCommessa, getToken, profiliEnti, setInfoToStatusApplicationLoacalStorage } from "../reusableFunction/actionLocalStorage";
import { mesiWithZero, month } from "../reusableFunction/reusableArrayObj";
import { DatiCommessaPdf, ResponseGetPdfPagoPa } from "../types/typeListaModuliCommessa";
import { createDateFromString, replaceDate } from "../reusableFunction/function";
import SkeletonComPdf from "../components/commessaPdf/skeletonComPdf";

const ModuloCommessaPdf : React.FC<ModComPdfProps> = ({mainState, dispatchMainState}) =>{

    const token =  getToken();
    const profilo =  getProfilo();
    const statusApp = getStatusApp();
    const tipoCommessa =  getTipoCommessa();
    const navigate = useNavigate();
    const enti = profiliEnti();

    const [showLoading, setShowLoading] = useState(false);
    const [showLoadingDettaglio, setShowLoadingDettaglio] = useState(false);
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

    useEffect(()=>{
    
        if(profilo.auth === 'PAGOPA'){
            getPagoPdf();
        }else{
            getPdf();
        }
        
    },[]);
   
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
        setShowLoadingDettaglio(true);
        getModuloCommessaPdf(token, statusApp.anno,statusApp.mese, profilo.nonce).then((res:ResponseGetPdfPagoPa)=>{
            toDoOnGetPdfSelfcarePagopa(res);
            setShowLoadingDettaglio(false);
        }).catch((err)=>{
            setShowLoadingDettaglio(false);
            manageError(err,dispatchMainState);
            navigate(PathPf.MODULOCOMMESSA);
        });  
    };

    const getPagoPdf = async() =>{
        setShowLoadingDettaglio(true);
        getModuloCommessaPagoPaPdf(token, profilo.nonce,statusApp.mese,statusApp.anno,profilo.idEnte, profilo.prodotto, profilo.idTipoContratto)
            .then((res)=>{
                toDoOnGetPdfSelfcarePagopa(res);
                setShowLoadingDettaglio(false);
            }).catch((err)=>{
                setShowLoadingDettaglio(false);
                manageError(err,dispatchMainState);
                navigate(PathPf.MODULOCOMMESSA);
            });  
    };

    const toDoOnDownloadPdf = (res:ResponseDownloadPdf) =>{
        const wrapper = document.getElementById('file_download');
        if(wrapper){
            wrapper.innerHTML = res.data;
            toPDF();
            setShowLoading(false);
        }
    };
 
    const downloadPdf = async()=>{
        setShowLoading(true);
        downloadModuloCommessaPdf(token, statusApp.anno,statusApp.mese, tipoCommessa, profilo.nonce).then((res: ResponseDownloadPdf)=>{
            toDoOnDownloadPdf(res);
        }).catch((err)=>{
            manageError(err,dispatchMainState);
        });   
    };

    const downlodPagoPaPdf = async()=>{
        setShowLoading(true);
        downloadModuloCommessaPagoPaPdf(token,  profilo.nonce,statusApp.mese,statusApp.anno,profilo.idEnte, profilo.prodotto, profilo.idTipoContratto,tipoCommessa).then((res:ResponseDownloadPdf)=>{
            toDoOnDownloadPdf(res);
        }).catch((err)=>{
            manageError(err,dispatchMainState);
        }); 
    };

    const onButtonScarica  = ( ) =>{
        if(profilo.auth === 'PAGOPA'){
            downlodPagoPaPdf();
        }else if(enti){
            downloadPdf();
        }
    };

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

    const string = `${mese}/${anno}`;
    const arrWithlabelDateMonth = replaceDate(dataPdf.datiModuloCommessa,'[data]',string );

    const onIndietroButton = () =>{
        console.log(9);
        setInfoToStatusApplicationLoacalStorage(statusApp,{userClickOn:'GRID'});
        navigate(PathPf.MODULOCOMMESSA); 
    };

    const { toPDF, targetRef } = usePDF({filename: `Modulo Commessa /${dataPdf.descrizione} /${mesiWithZero[statusApp.mese -1]}/ ${statusApp.anno}.pdf`});

    if(showLoadingDettaglio){
        return(
            <SkeletonComPdf></SkeletonComPdf>
        );
    }
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
                    <Typography  variant="caption">/ {month[statusApp.mese - 1]}</Typography>
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
                    <Button onClick={()=> onButtonScarica()}  variant="contained">Scarica</Button>
                </div>
                <ModalLoading 
                    open={showLoading} 
                    setOpen={setShowLoading}
                    sentence={'Downloading...'} >
                </ModalLoading>
            </div>
        </>
    );
};
export default ModuloCommessaPdf;
