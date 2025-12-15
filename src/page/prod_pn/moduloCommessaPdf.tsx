import { manageError } from "../../api/api";
import { useEffect, useState} from 'react';
import {Typography, Button} from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useNavigate } from "react-router";
import TextDettaglioPdf from '../../components/commessaPdf/textDettaglioPdf';
import { DataPdf } from "../../types/typeModuloCommessaInserimento";
import { usePDF } from 'react-to-pdf';
import { DatiModuloCommessaPdf, ResponseDownloadPdf } from "../../types/typeModuloCommessaInserimento";
import { downloadModuloCommessaPdf, getModuloCommessaPdf } from "../../api/apiSelfcare/moduloCommessaSE/api";
import { downloadModuloCommessaPagoPaPdf, getModuloCommessaPagoPaPdfV2 } from "../../api/apiPagoPa/moduloComessaPA/api";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { PathPf } from "../../types/enum";
import { getTipoCommessa, profiliEnti} from "../../reusableFunction/actionLocalStorage";
import { month } from "../../reusableFunction/reusableArrayObj";
import { DatiCommessaPdf, ResponseGetPdfPagoPa } from "../../types/typeListaModuliCommessa";
import { createDateFromString, replaceDate } from "../../reusableFunction/function";
import SkeletonComPdf from "../../components/commessaPdf/skeletonComPdf";

import {useParams} from "react-router-dom";
import NavigatorHeader from "../../components/reusableComponents/navigatorHeader";
import { useGlobalStore } from "../../store/context/useGlobalStore";

const ModuloCommessaPdf : React.FC = () =>{

    const {annoPdf, mesePdf} = useParams();
  
    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    let profilePathModuloCommessa; 
            
    if(profilo.auth === 'PAGOPA'){
        profilePathModuloCommessa = PathPf.MODULOCOMMESSA;
    }else{
        profilePathModuloCommessa = PathPf.MODULOCOMMESSA_EN;
    }

    const tipoCommessa =  getTipoCommessa();
    const navigate = useNavigate();
    const enti = profiliEnti(mainState);

    const [showLoading, setShowLoading] = useState(false);
    const [showLoadingDettaglio, setShowLoadingDettaglio] = useState(true);
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
        let primo = res.data.datiModuloCommessa.find((obj:DatiCommessaPdf)=>obj.idTipoSpedizione === 3);
        let secondo = res.data.datiModuloCommessa.find((obj:DatiCommessaPdf)=>obj.idTipoSpedizione === 1);
        let terzo = res.data.datiModuloCommessa.find((obj:DatiCommessaPdf)=>obj.idTipoSpedizione === 2);
        let quarto = res.data.datiModuloCommessa.find((obj:DatiCommessaPdf)=>obj.idTipoSpedizione === 0);
        if(primo === undefined){
            primo = {
                totaleNotifiche: 0,
                numeroNotificheNazionali: 0,
                numeroNotificheInternazionali: 0,
                tipo:"",
                idTipoSpedizione: 0
            };
        }
        if(secondo  === undefined){
            secondo =  {
                totaleNotifiche: 0,
                numeroNotificheNazionali: 0,
                numeroNotificheInternazionali: 0,
                tipo:"",
                idTipoSpedizione: 0
            };
        }

        if(terzo  === undefined){
            terzo =  {
                totaleNotifiche: 0,
                numeroNotificheNazionali: 0,
                numeroNotificheInternazionali: 0,
                tipo:"",
                idTipoSpedizione: 0
            };
        }

        if(quarto  === undefined){
            quarto =  {
                totaleNotifiche: 0,
                numeroNotificheNazionali: 0,
                numeroNotificheInternazionali: 0,
                tipo:"",
                idTipoSpedizione: 0
            };
        }
        final = [primo, secondo, terzo, quarto];
        setDataPdf({...res.data,...{datiModuloCommessa:final}});
        localStorage.setItem("tipo", res.data.tipoCommessa);
    };

    const getPdf = async() =>{
        setShowLoadingDettaglio(true);
        getModuloCommessaPdf(token, annoPdf||"",mesePdf||"", profilo.nonce).then((res:ResponseGetPdfPagoPa)=>{
            toDoOnGetPdfSelfcarePagopa(res);
            setShowLoadingDettaglio(false);
        }).catch((err)=>{
            setShowLoadingDettaglio(false);
            manageError(err,dispatchMainState);
            navigate(profilePathModuloCommessa);
        });  
    };

    const getPagoPdf = async() =>{
        setShowLoadingDettaglio(true);
        getModuloCommessaPagoPaPdfV2(token, profilo.nonce,mesePdf||"",annoPdf||"",mainState.infoTrimestreComSelected.idEnte, mainState.infoTrimestreComSelected.prodotto)   // mainState.infoTrimestreComSelected.idTipoContratto
            .then((res)=>{
                toDoOnGetPdfSelfcarePagopa(res);
                setShowLoadingDettaglio(false);
            }).catch((err)=>{
                setShowLoadingDettaglio(false);
                manageError(err,dispatchMainState);
                navigate(profilePathModuloCommessa);
            });  
    };

    const toDoOnDownloadPdf = async(res:ResponseDownloadPdf) =>{
        const wrapper = document.getElementById('file_download');
        if (wrapper) {
            wrapper.innerHTML = res.data;
            await toPDF();
            wrapper.remove();
            setShowLoading(false);
        }
    };
 
    const downloadPdf = async()=>{
        setShowLoading(true);
        downloadModuloCommessaPdf(token, annoPdf||"",mesePdf||"", tipoCommessa, profilo.nonce).then((res: ResponseDownloadPdf)=>{
            toDoOnDownloadPdf(res);
        }).catch((err)=>{
            setShowLoading(false);
            manageError(err,dispatchMainState);
        });   
    };

    const downlodPagoPaPdf = async()=>{
        setShowLoading(true);
        downloadModuloCommessaPagoPaPdf(token,  profilo.nonce,mesePdf||"",annoPdf||"",mainState.infoTrimestreComSelected.idEnte, mainState.infoTrimestreComSelected.prodotto, mainState.infoTrimestreComSelected.idTipoContratto,"html").then((res:ResponseDownloadPdf)=>{
            toDoOnDownloadPdf(res);
        }).catch((err)=>{
            setShowLoading(false);
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

    const { toPDF, targetRef } = usePDF({filename: `Modulo Commessa /${dataPdf.descrizione}/${mesePdf}/${annoPdf}.pdf`});

    if(showLoadingDettaglio){
        return(
            <SkeletonComPdf></SkeletonComPdf>
        );
    }
    return (
        <>
            <div className="">
                <div>
                    <NavigatorHeader pageFrom={"Modulo commessa/"} pageIn={"Anteprima"} backPath={profilePathModuloCommessa} icon={<ViewModuleIcon sx={{paddingBottom:"4px"}}  fontSize='small'></ViewModuleIcon>}></NavigatorHeader>
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
                                if(singleObj.tipo !== ''){

                                
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
                                }
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
