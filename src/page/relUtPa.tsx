import React, { useEffect, useRef, useState } from "react";
import SelectUltimiDueAnni from "../components/reusableComponents/select/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/select/selectMese";
import { Button, Typography } from "@mui/material";
import SelectTipologiaFattura from "../components/reusableComponents/select/selectTipologiaFattura";
import GridCustom from "../components/reusableComponents/grid/gridCustom";
import { BodyRel, RelPageProps } from "../types/typeRel";
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";
import { manageError} from "../api/api";
import { useNavigate } from "react-router";
import DownloadIcon from '@mui/icons-material/Download';
import { downloadListaRel, getListaRel, getTipologieFatture} from "../api/apiSelfcare/relSE/api";
import { downloadListaRelPagopa, downloadListaRelPdfZipPagopa, downloadQuadraturaRelPagopa, getListaRelPagoPa, getTipologieFatturePagoPa } from "../api/apiPagoPa/relPA/api";
import SelectStatoPdf from "../components/rel/selectStatoPdf";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { saveAs } from "file-saver";
import { PathPf } from "../types/enum";
import { deleteFilterToLocalStorageRel, getFiltersFromLocalStorageRel, getProfilo, getStatusApp, getToken, profiliEnti, setFilterToLocalStorageRel } from "../reusableFunction/actionLocalStorage";
import { OptionMultiselectChackbox } from "../types/typeReportDettaglio";
import { mesiGrid, mesiWithZero } from "../reusableFunction/reusableArrayObj";
import { listaEntiNotifichePage } from "../api/apiSelfcare/notificheSE/api";
import ModalRedirect from "../components/commessaInserimento/madalRedirect";

const RelPage : React.FC<RelPageProps> = ({mainState, dispatchMainState}) =>{

    const token =  getToken();
    const profilo =  getProfilo();
    const statusApp = getStatusApp();
    const navigate = useNavigate();
    const enti = profiliEnti();

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    const currentYear = (new Date()).getFullYear();
    const currentMonth = (new Date()).getMonth() + 1;
    const month = Number(currentMonth);
  
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showLoading, setShowLoading] = useState(false);
    const [totalNotifiche, setTotalNotifiche]  = useState(0);
    const [dataSelect, setDataSelect] = useState([]);
    const [data, setData] = useState<any>([]);
    const [getListaRelRunning, setGetListaRelRunning] = useState(false);
    const [disableDownloadListaPdf, setDisableListaPdf] = useState(true);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [tipologiaFatture, setTipologiaFatture] = useState<string[]>([]);
    const [valuetipologiaFattura, setValueTipologiaFattura] = useState<string>('');
    const [openModalRedirect, setOpenModalRedirect] = useState(false);

    const [bodyDownload, setBodyDownload] = useState<BodyRel>({
        anno:currentYear,
        mese:month,
        tipologiaFattura:null,
        idEnti:[],
        idContratto:null,
        caricata:null
    });
    const [bodyRel, setBodyRel] = useState<BodyRel>({
        anno:currentYear,
        mese:month,
        tipologiaFattura:null,
        idEnti:[],
        idContratto:null,
        caricata:null
    });

 

    useEffect(()=>{
        
        const result = getFiltersFromLocalStorageRel();
    
        if(Object.keys(result).length > 0){
            setBodyRel(result.bodyRel);
            setTextValue(result.textValue);
            setValueAutocomplete(result.valueAutocomplete);
            getlistaRel(result.bodyRel,result.page + 1, result.rowsPerPage);
            setPage(result.page);
            setRowsPerPage(result.rowsPerPage);
            setBodyDownload(result.bodyRel);
            getListTipologiaFattura(result.bodyRel.anno,result.bodyRel.mese);
        }{
            const realPage = page + 1;
            getlistaRel(bodyRel,realPage, rowsPerPage);
            getListTipologiaFattura(bodyRel.anno,bodyRel.mese);
        }
        
    },[]);

 


   
   
    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){
                listaEntiNotifichePageOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);

    useEffect(()=>{
        if(statusApp.datiFatturazione === false){
            setOpenModalRedirect(true);
        }
    },[]);

    const getlistaRel = async (bodyRel,nPage,nRows) => {
        
        if(enti && statusApp.datiFatturazione === true){
            setGetListaRelRunning(true);
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
                            totaleAnalogico:obj.totaleAnalogico.toLocaleString("de-DE", { style: "currency", currency: "EUR" }),
                            totaleDigitale:obj.totaleDigitale.toLocaleString("de-DE", { style: "currency", currency: "EUR" }),
                            totaleNotificheAnalogiche:obj.totaleNotificheAnalogiche,
                            totaleNotificheDigitali:obj.totaleNotificheDigitali,
                            totale:obj.totale.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
                        };
                    });
                    setData(orderDataCustom);
                    setTotalNotifiche(res.data.count);
                    setGetListaRelRunning(false);
                }).catch((error)=>{
                    if(error?.response?.status === 404){
                        setData([]);
                        setTotalNotifiche(0);
                    }
                    setGetListaRelRunning(false);
                    manageError(error, dispatchMainState);
                });
        }else if(profilo.auth === 'PAGOPA'){
            setGetListaRelRunning(true);
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
                            totaleAnalogico:obj.totaleAnalogico.toLocaleString("de-DE", { style: "currency", currency: "EUR" }),
                            totaleDigitale:obj.totaleDigitale.toLocaleString("de-DE", { style: "currency", currency: "EUR" }),
                            totaleNotificheAnalogiche:obj.totaleNotificheAnalogiche,
                            totaleNotificheDigitali:obj.totaleNotificheDigitali,
                            totale:obj.totale.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
                        };
                    });
                    setData(orderDataCustom);
                    setTotalNotifiche(res.data.count);
                    setGetListaRelRunning(false);
                }).catch((error)=>{
                    if(error?.response?.status === 404){
                        setData([]);
                        setTotalNotifiche(0);
                    }
                    setGetListaRelRunning(false);
                    manageError(error, dispatchMainState);
                });
        }            
    };

    // servizio che popola la select con la checkbox
    const listaEntiNotifichePageOnSelect = async () =>{
        if(profilo.auth === 'PAGOPA'){
            await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue} )
                .then((res)=>{
                    setDataSelect(res.data);
                })
                .catch(((err)=>{
                   
                    manageError(err,dispatchMainState);
                   
                }));
        }
    };

    const onButtonFiltra = () =>{
        setPage(0);
        setRowsPerPage(10);
        setBodyDownload(bodyRel);
        getlistaRel(bodyRel,1,10); 
        setFilterToLocalStorageRel(bodyRel,textValue,valueAutocomplete, 0, 10,valuetipologiaFattura);
    };

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        const realPage = newPage + 1;
        getlistaRel(bodyRel,realPage, rowsPerPage);
        setPage(newPage);
      
        setFilterToLocalStorageRel(bodyDownload,textValue,valueAutocomplete, newPage, rowsPerPage,valuetipologiaFattura);
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        const realPage = page + 1;
        getlistaRel(bodyRel,realPage,parseInt(event.target.value, 10));
   
        setFilterToLocalStorageRel(bodyDownload,textValue,valueAutocomplete, page, parseInt(event.target.value, 10),valuetipologiaFattura);
    };
   
    const setIdRel = async(idRel) => {
        handleModifyMainState({relSelected:idRel});
        navigate(PathPf.PDF_REL);
    
    };  

    const getListTipologiaFattura = async(anno,mese) => {
     
        const result = getFiltersFromLocalStorageRel();
        if(enti){
            await getTipologieFatture(token, profilo.nonce, {mese,anno}).then((res)=>{
                setTipologiaFatture(res.data);
                if(result.valuetipologiaFattura){
                    setValueTipologiaFattura(result.valuetipologiaFattura);
                }else{
                    setValueTipologiaFattura('');
                }
                
                
            }).catch(((err)=>{
                setTipologiaFatture([]);
                setValueTipologiaFattura("");
                // manageError(err,dispatchMainState);
            }));
        }else if(profilo.auth === 'PAGOPA'){
            await getTipologieFatturePagoPa(token, profilo.nonce, {mese,anno}).then((res)=>{
                setTipologiaFatture(res.data);
                if(result.valuetipologiaFattura){
                    setValueTipologiaFattura(result.valuetipologiaFattura);
                }else{
                    setValueTipologiaFattura('');
                }
                
                
            }).catch(((err)=>{
                setTipologiaFatture([]);
                setValueTipologiaFattura("");
                // manageError(err,dispatchMainState);
            }));
        }
       
    };

    const getListTipologiaFatturaOnChangeMonthYear = async(mese,anno) => {
  
        if(enti){
            await getTipologieFatture(token, profilo.nonce, {mese,anno}).then((res)=>{
                setTipologiaFatture(res.data);
                setValueTipologiaFattura('');
            }).catch(((err)=>{
                setTipologiaFatture([]);
                setValueTipologiaFattura('');
                // manageError(err,dispatchMainState);
            }));
        }else if(profilo.auth === 'PAGOPA'){
            await getTipologieFatturePagoPa(token, profilo.nonce, {mese,anno}).then((res)=>{
                setTipologiaFatture(res.data);
                setValueTipologiaFattura('');
            }).catch(((err)=>{
                setTipologiaFatture([]);
                setValueTipologiaFattura('');
                // manageError(err,dispatchMainState);
            }));

        }
       
    };

    const downloadListaRelExel = async() =>{
        setShowLoading(true);
        if(enti){
            const {idEnti, ...newBody} = bodyDownload;
            await downloadListaRel(token,profilo.nonce,newBody).then((res)=>{
                saveAs("data:text/plain;base64," + res.data.documento,`Regolari esecuzioni /${data[0]?.ragioneSociale}/ ${mesiWithZero[bodyDownload.mese-1]}/ ${bodyDownload.anno}.xlsx` );
                setShowLoading(false);
            }).catch((err)=>{
                manageError(err,dispatchMainState);
            }); 
        }else{
            await downloadListaRelPagopa(token,profilo.nonce,bodyDownload).then((res)=>{
                let fileName = `Regolari esecuzioni /${mesiWithZero[bodyDownload.mese-1]}/ ${bodyDownload.anno}.xlsx`;
                if(bodyDownload.idEnti.length === 1){
                    fileName = `Regolari esecuzioni /${data[0]?.ragioneSociale}/${mesiWithZero[bodyDownload.mese-1]}/ ${bodyDownload.anno}.xlsx`;
                }
                saveAs("data:text/plain;base64," + res.data.documento,fileName );
                setShowLoading(false);
            }).catch((err)=>{
                manageError(err,dispatchMainState);
            }); 
        }
    };

    const downloadQuadratura = async() => {
        setShowLoading(true);
        downloadQuadraturaRelPagopa(token,profilo.nonce,bodyDownload).then((res)=>{
            let fileName = `Quadratura regolari esecuzioni /${mesiWithZero[bodyDownload.mese-1]}/ ${bodyDownload.anno}.xlsx`;
            if(bodyDownload.idEnti.length === 1){
                fileName = `Quadratura regolare esecuzione /${data[0]?.ragioneSociale}/${mesiWithZero[bodyDownload.mese-1]}/ ${bodyDownload.anno}.xlsx`;
            }
            saveAs("data:text/plain;base64," + res.data.documento,fileName );
            setShowLoading(false);
        }).catch((err)=>{
            setShowLoading(false);
            manageError(err,dispatchMainState);
        });  
    };
  
    const downloadListaPdfPagopa = async() =>{
        setShowLoading(true);
        await downloadListaRelPdfZipPagopa(token,profilo.nonce,bodyRel)
            .then(response => response.blob())
            .then(blob => {
                let fileName = `REL /Firmate / ${mesiWithZero[bodyRel.mese -1]} / ${bodyRel.anno}.zip`;
                if(bodyDownload.idEnti.length === 1){
                    fileName = `REL /Firmate /${data[0]?.ragioneSociale}/${mesiWithZero[bodyRel.mese -1]} / ${bodyRel.anno}.zip`;
                }
                saveAs(blob,fileName );
                setShowLoading(false);
            })
            .catch(err => {
                manageError(err,dispatchMainState);
            });
    };
    const  hiddenAnnullaFiltri = bodyRel.tipologiaFattura === null && bodyRel.idEnti?.length === 0 && bodyRel.caricata === null; 
    return (
       
        <div className="mx-5">
            <div className="marginTop24 ">
                <Typography variant="h4">Regolare Esecuzione</Typography>
            </div>
            <div className="mt-5">
                <div className="row">
                    <div className="col-3">
                        <SelectUltimiDueAnni values ={bodyRel} setValue={setBodyRel} getTipologia={getListTipologiaFatturaOnChangeMonthYear}></SelectUltimiDueAnni>
                    </div>
                    <div  className="col-3">
                        <SelectMese values={bodyRel} setValue={setBodyRel} getTipologia={getListTipologiaFatturaOnChangeMonthYear}></SelectMese>
                    </div>
                    <div  className="col-3">
                        <SelectTipologiaFattura value={valuetipologiaFattura} setBody={setBodyRel} setValue={setValueTipologiaFattura} types={tipologiaFatture}></SelectTipologiaFattura>
                    </div>
                    <div className="col-3">
                        <SelectStatoPdf values={bodyRel} setValue={setBodyRel}></SelectStatoPdf>
                    </div>
                </div>
                <div className="row mt-5">
                    { profilo.auth === 'PAGOPA' &&
                        <div  className="col-3">
                            <MultiselectCheckbox 
                                setBodyGetLista={setBodyRel}
                                dataSelect={dataSelect}
                                setTextValue={setTextValue}
                                valueAutocomplete={valueAutocomplete}
                                setValueAutocomplete={setValueAutocomplete}
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
                            setBodyDownload({
                                anno:currentYear,
                                mese:month,
                                tipologiaFattura:null,
                                idEnti:[],
                                idContratto:null,
                                caricata:null
                            });
                            setValueTipologiaFattura('');
                            setData([]);
                            setPage(0);
                            setRowsPerPage(10);
                            deleteFilterToLocalStorageRel();
                            setValueAutocomplete([]);
                            getlistaRel({
                                anno:currentYear,
                                mese:month,
                                tipologiaFattura:null,
                                idEnti:[],
                                idContratto:null,
                                caricata:null
                            },1,10);
                            
                        }} 
                        disabled={getListaRelRunning}
                        >Annulla Filtri</Button>
                    </div>
                    }
                </div>
                <div className="mt-5 mb-5">
                    { data.length > 0  &&
            <div className="marginTop24 d-flex d-flex justify-content-between">
                <div className="d-flex justify-content-start">
                    {profilo.auth === 'PAGOPA'&&
                   
                   <Button onClick={()=> {
                       downloadQuadratura();
                   }} >
                     Quadratura notifiche Rel 
                       <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                   </Button>  }
                </div>
                <div className="d-flex justify-content-end">
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
                        headerNames={['Ragione Sociale','Tipologia Fattura', 'Reg. Es. PDF','ID Contratto','Anno','Mese','Tot. Analogico','Tot. Digitale','Tot. Not. Analogico','Tot. Not. Digitali','Totale','']}
                        apiGet={setIdRel}
                        disabled={getListaRelRunning}></GridCustom>
                </div>
            </div>
            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading} 
                sentence={'Downloading...'}>
            </ModalLoading>
            <ModalRedirect
                setOpen={setOpenModalRedirect} 
                open={openModalRedirect}
                sentence={`Per poter visualizzare il dettaglio REL è obbligatorio fornire i seguenti dati di fatturazione:`}>
            </ModalRedirect>
            <ModalLoading 
                open={getListaRelRunning} 
                setOpen={setGetListaRelRunning} 
                sentence={'Loading...'}>
            </ModalLoading>
        </div>
    );
};

export default RelPage;
