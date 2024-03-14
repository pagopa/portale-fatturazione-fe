import React, { useEffect, useState } from "react";
import SelectUltimiDueAnni from "../components/reusableComponents/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/selectMese";
import { Button, Typography } from "@mui/material";
import SelectTipologiaFattura from "../components/rel/selectTipologiaFattura";
import GridCustom from "../components/reusableComponents/gridCustom";
import { BodyRel, RelPageProps } from "../types/typeRel";
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";
import { manageError} from "../api/api";
import { useNavigate } from "react-router";
import ModalRedirect from "../components/commessaInserimento/madalRedirect";
import DownloadIcon from '@mui/icons-material/Download';
import { downloadListaRel, getListaRel, getSingleRel } from "../api/apiSelfcare/relSE/api";
import { downloadListaRelPagopa, downloadListaRelPdfZipPagopa, getListaRelPagoPa, getSingleRelPagopa } from "../api/apiPagoPa/relPA/api";
import SelectStatoPdf from "../components/rel/selectStatoPdf";
import ModalLoading from "../components/reusableComponents/modalLoading";
import { saveAs } from "file-saver";
import ModalInfo from "../components/reusableComponents/modalInfo";

const RelPage : React.FC<RelPageProps> = ({mainState, dispatchMainState}) =>{

    const mesiGrid = ["Dicembre", "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

    const navigate = useNavigate();

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

    const currentYear = (new Date()).getFullYear();
    const currentMonth = (new Date()).getMonth() + 1;
    const month = Number(currentMonth);

    const [bodyRel, setBodyRel] = useState<BodyRel>({
        anno:currentYear,
        mese:month,
        tipologiaFattura:null,
        idEnti:[],
        idContratto:null,
        caricata:null
    });

    const  hiddenAnnullaFiltri = bodyRel.tipologiaFattura === null && bodyRel.idEnti?.length === 0 && bodyRel.caricata === null; 

    // data ragione sociale

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalNotifiche, setTotalNotifiche]  = useState(0);
       
    const [dataSelect, setDataSelect] = useState([]);
    const [data, setData] = useState([]);

    const [getListaRelRunning, setGetListaRelRunning] = useState(false);
    const [disableDownloadListaPdf, setDisableListaPdf] = useState(true);

    const getlistaRel = async (nPage,nRows) => {
        setGetListaRelRunning(true);
        if(profilo.auth === 'SELFCARE'){
            const {idEnti, ...newBody} = bodyRel;
            await  getListaRel(token,profilo.nonce,nPage, nRows, newBody)
                .then((res)=>{
                    // ordino i dati in base all'header della grid
                    const orderDataCustom = res.data.relTestate.map((obj)=>{
                        // inserire come prima chiave l'id se non si vuol renderlo visibile nella grid
                        // 'id serve per la chiamata get dettaglio dell'elemento selezionato nella grid
                        return {
                            idTestata:obj.idTestata,
                            ragioneSociale:obj.ragioneSociale,
                            tipologiaFattura:obj.tipologiaFattura,
                            firmata:obj.firmata,
                            idContratto:obj.idContratto,
                            anno:obj.anno,
                            mese:mesiGrid[obj.mese],
                            totaleAnalogico:Number(obj.totaleAnalogico).toFixed(2)+' €',
                            totaleDigitale:Number(obj.totaleDigitale).toFixed(2)+' €',
                            totaleNotificheAnalogiche:obj.totaleNotificheAnalogiche,
                            totaleNotificheDigitali:obj.totaleNotificheDigitali,
                            totale:Number(obj.totale).toFixed(2)+' €'
                        };
                    });
                    
                    setData(orderDataCustom);
                    setTotalNotifiche(res.data.count);
                    setGetListaRelRunning(false);
                }).catch((error)=>{
                    
                    manageError(error, navigate);
                });
        }else{
            await  getListaRelPagoPa(token,profilo.nonce,nPage, nRows, bodyRel)
                .then((res)=>{
                    // controllo che tutte le rel abbiano il pdf caricato, se TRUE abilito il button download
                    const checkIfAllCaricata = res.data.relTestate.every(v => v.caricata === 1);
                    setDisableListaPdf(checkIfAllCaricata);
                    // ordino i dati in base all'header della grid
                    const orderDataCustom = res.data.relTestate.map((obj)=>{

                        // inserire come prima chiave l'id se non si vuol renderlo visibile nella grid
                        // 'id serve per la chiamata get dettaglio dell'elemento selezionato nella grid
                        return {
                            idTestata:obj.idTestata,
                            ragioneSociale:obj.ragioneSociale,
                            tipologiaFattura:obj.tipologiaFattura,
                            firmata:obj.firmata,
                            idContratto:obj.idContratto,
                            anno:obj.anno,
                            mese:mesiGrid[obj.mese],
                            totaleAnalogico:Number(obj.totaleAnalogico).toFixed(2)+' €',
                            totaleDigitale:Number(obj.totaleDigitale).toFixed(2)+' €',
                            totaleNotificheAnalogiche:obj.totaleNotificheAnalogiche,
                            totaleNotificheDigitali:obj.totaleNotificheDigitali,
                            totale:Number(obj.totale).toFixed(2)+' €'
                        };
                    });
                
                    setData(orderDataCustom);
                    setTotalNotifiche(res.data.count);
                    setGetListaRelRunning(false);
                }).catch((error)=>{
                
                    manageError(error, navigate);
                });
        }            
    };
   
    useEffect(()=>{
        if(profilo.nonce !== ''){
            const realPage = page + 1;
            getlistaRel(realPage, rowsPerPage);
        }
        
    },[profilo.nonce]);

    const onButtonFiltra = () =>{
        setPage(0);
        setRowsPerPage(10);
        getlistaRel(1,10); 
    };

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
     
        const realPage = newPage + 1;
       
        getlistaRel(realPage, rowsPerPage);
        setPage(newPage);
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
    
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        const realPage = page + 1;

        getlistaRel(realPage,parseInt(event.target.value, 10));
                          
    };

   
    const getRel = async(idRel) => {

        if(profilo.auth === 'SELFCARE'){
            getSingleRel(token,profilo.nonce,idRel).then((res) =>{
                handleModifyMainState({relSelected:res.data});
               
                if(res.data.datiFatturazione === true){
                    navigate('/relpdf');
                }else{
                    setOpenModalRedirect(true);
                }
            }).catch((err)=>{
                manageError(err, navigate);
            }
              
            );
        }else{
            getSingleRelPagopa(token,profilo.nonce,idRel).then((res) =>{
                handleModifyMainState({relSelected:res.data});
                if(res.data.datiFatturazione === true){
                    navigate('/relpdf');
                }else{
                    setOpenModalInfo(true);
                }
            }).catch((err)=>{
                manageError(err, navigate);
            }
              
            );
        }
        
    };  

    const downloadListaRelExel = async() =>{
        setShowLoading(true);
        if(profilo.auth === 'SELFCARE'){

            const {idEnti, ...newBody} = bodyRel;
            await downloadListaRel(token,profilo.nonce,newBody).then((res)=>{
                saveAs("data:text/plain;base64," + res.data.documento,`Lista Regolare esecuzione mese di riferimento ${mesiGrid[bodyRel.mese]}.xlsx` );
                setShowLoading(false);
            }).catch((err)=>{
                manageError(err,navigate);
            }); 
        }else{
            await downloadListaRelPagopa(token,profilo.nonce,bodyRel).then((res)=>{
                saveAs("data:text/plain;base64," + res.data.documento,`Lista Regolare esecuzione mese di riferimento ${mesiGrid[bodyRel.mese]}.xlsx` );
                setShowLoading(false);
            }).catch((err)=>{
                manageError(err,navigate);
            }); 
            
        }
        
    };


  
    const downloadListaPdfPagopa = async() =>{
        setShowLoading(true);
        await downloadListaRelPdfZipPagopa(token,profilo.nonce,bodyRel)
            .then(response => response.blob())
            .then(blob => {
                saveAs(blob,'Lista PDF Reg. Es..zip' );
                setShowLoading(false);
            })
            .catch(err => {
                manageError(err,navigate);
            });
    };

  

    
    // visulizzazione del pop up redirect dati di fatturazione
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [openModalInfo, setOpenModalInfo] = useState(false);

 
    return (
       
        <div className="mx-5">
            <div className="marginTop24 ">
                <Typography variant="h4">Regolare Esecuzione</Typography>
            </div>
            <div className="mt-5">
                <div className="row">
                    <div className="col-3">
                        <SelectUltimiDueAnni values ={bodyRel} setValue={setBodyRel}></SelectUltimiDueAnni>
                    </div>
                    <div  className="col-3">
                        <SelectMese values={bodyRel} setValue={setBodyRel}></SelectMese>
                    </div>
                    <div  className="col-3">
                        <SelectTipologiaFattura values={bodyRel} setValue={setBodyRel}></SelectTipologiaFattura>
                    </div>
                    <div className="col-3">
                        <SelectStatoPdf values={bodyRel} setValue={setBodyRel}></SelectStatoPdf>
                    </div>
                </div>
                <div className="row mt-5">
                    { profilo.auth === 'PAGOPA' &&
                        <div  className="col-3">
                            <MultiselectCheckbox 
                                mainState={mainState} 
                                setBodyGetLista={setBodyRel}
                                setDataSelect={setDataSelect}
                                dataSelect={dataSelect}
                            ></MultiselectCheckbox>
                        </div>
                    }
                </div>
                
                <div className="row mt-5">
                    <div className="col-1">
                        <Button
                            onClick={()=>{
                                onButtonFiltra();
                            }}
                            variant="contained"
                            disabled={getListaRelRunning}>Filtra</Button>
                    </div>
                    {!hiddenAnnullaFiltri && 
                    <div className="col-2">
                        <Button onClick={()=>{
                            setBodyRel({
                                anno:currentYear,
                                mese:month,
                                tipologiaFattura:null,
                                idEnti:[],
                                idContratto:null,
                                caricata:null
                            });
                            setData([]);
                        }} 
                        disabled={getListaRelRunning}
                        >Annulla Filtri</Button>
                    </div>
                    }
                </div>
                <div className="mt-5 mb-5">
                    { data.length > 0  &&
            <div className="marginTop24" style={{display:'flex', justifyContent:'end'}}>
                <div>
                    {profilo.auth === 'PAGOPA'&&  
                    <Button
                        disabled={getListaRelRunning  || !disableDownloadListaPdf}
                        onClick={()=> {
                            downloadListaPdfPagopa();
                        }}  >
                                  Download documenti firmati 
                        <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                    </Button>
                    }
                    <Button
                        disabled={getListaRelRunning}
                        onClick={()=> {
                            downloadListaRelExel();
                        }}  >
                                  Download risultati 
                        <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                    </Button>
                </div>            
            </div>
                    }    
                    <GridCustom
                        nameParameterApi='idTestata'
                        elements={data}
                        changePage={handleChangePage}
                        changeRow={handleChangeRowsPerPage} 
                        total={totalNotifiche}
                        page={page}
                        rows={rowsPerPage}
                        headerNames={['Ragione Sociale','Tipologia Fattura', 'Reg. Es. Pdf','ID Contratto','Anno','Mese','Tot. Analogico','Tot. Digitale','Tot. Not. Analogico','Tot. Not. Digitali','Totale','']}
                        apiGet={getRel}
                        disabled={getListaRelRunning}></GridCustom>
                </div>
            </div>
            <ModalRedirect
                setOpen={setOpenModalRedirect} 
                open={openModalRedirect}
                sentence={`Per poter visulazzare il dettaglio REL è nesessario l'inserimento dei dati di fatturazione obbligatori:`}>
            </ModalRedirect>

            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading} >
            </ModalLoading>

            <ModalInfo  
                open={openModalInfo} 
                setOpen={setOpenModalInfo}
                sentence={`Non è possibile visualizzare il dettaglio dell'elemento selezionato `}>
            </ModalInfo>
        </div>

    );
};

export default RelPage;



