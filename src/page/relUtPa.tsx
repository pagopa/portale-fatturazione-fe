import React, { useEffect, useState } from "react";
import SelectUltimiDueAnni from "../components/reusableComponents/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/selectMese";
import { Button, Typography } from "@mui/material";
import SelectTipologiaFattura from "../components/rel/selectTipologiaFattura";
import GridCustom from "../components/reusableComponents/gridCustom";
import { BodyRel, RelPageProps } from "../types/typeRel";
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";
import { manageError, redirect} from "../api/api";
import { useNavigate } from "react-router";
import ModalRedirect from "../components/commessaInserimento/madalRedirect";
import DownloadIcon from '@mui/icons-material/Download';
import { downloadListaRel, getListaRel, getSingleRel } from "../api/apiSelfcare/relSE/api";
import { downloadListaRelPagopa, downloadListaRelPdfZipPagopa, getListaRelPagoPa, getSingleRelPagopa } from "../api/apiPagoPa/relPA/api";
import SelectStatoPdf from "../components/rel/selectStatoPdf";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { saveAs } from "file-saver";
import useIsTabActive from "../reusableFunctin/tabIsActiv";
import { PathPf } from "../types/enum";
import { profiliEnti } from "../reusableFunctin/actionLocalStorage";
import { OptionMultiselectChackbox } from "../types/typeReportDettaglio";

const RelPage : React.FC<RelPageProps> = ({mainState, dispatchMainState}) =>{

    const mesiGrid = ["Dicembre", "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

    const navigate = useNavigate();
    const enti = profiliEnti();

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    const setFilterToLocalStorage = (bodyRel,textValue,valueAutocomplete, page, rowsPerPage) => {
        localStorage.setItem("filtersRel", JSON.stringify({bodyRel,textValue,valueAutocomplete, page, rowsPerPage}));
    }; 

    

    const deleteFilterToLocalStorage = () => {
        localStorage.removeItem("filtersRel");
    }; 

    const getFiltersFromLocalStorage = () => {
        const filtri = localStorage.getItem('filtersRel') || '{}';
        const result =  JSON.parse(filtri);
        return result;
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
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);


  


    useEffect(()=>{
        const result = getFiltersFromLocalStorage();
      
        if(mainState.nonce !== ''){
            
            if(Object.keys(result).length > 0){
             
             
                setBodyRel(result.bodyRel);
                setTextValue(result.textValue);
                setValueAutocomplete(result.valueAutocomplete);
                getlistaRel(result.bodyRel,result.page + 1, result.rowsPerPage);
                setPage(result.page);
                setRowsPerPage(result.rowsPerPage);
                setBodyDownload(result.bodyRel);
            }else{
           
                const realPage = page + 1;
                getlistaRel(bodyRel,realPage, rowsPerPage);
            }

           
        }
        
    },[mainState.nonce]);
    
    

    const tabActive = useIsTabActive();
    useEffect(()=>{
        if(tabActive === true && (mainState.nonce !== profilo.nonce)){
            window.location.href = redirect;
        }
    },[tabActive, mainState.nonce]);

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };



  
    const  hiddenAnnullaFiltri = bodyRel.tipologiaFattura === null && bodyRel.idEnti?.length === 0 && bodyRel.caricata === null; 

    // data ragione sociale

    const [totalNotifiche, setTotalNotifiche]  = useState(0);
       
    const [dataSelect, setDataSelect] = useState([]);
    const [data, setData] = useState<any>([]);

    const [getListaRelRunning, setGetListaRelRunning] = useState(false);
    const [disableDownloadListaPdf, setDisableListaPdf] = useState(true);

    const [textValue, setTextValue] = useState('');

    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);

    const [bodyDownload, setBodyDownload] = useState<BodyRel>({
        anno:currentYear,
        mese:month,
        tipologiaFattura:null,
        idEnti:[],
        idContratto:null,
        caricata:null
    });
   
   

    const getlistaRel = async (bodyRel,nPage,nRows) => {
       
        setGetListaRelRunning(true);
        if(enti){
            const {idEnti, ...newBody} = bodyRel;
            await  getListaRel(token,mainState.nonce,nPage, nRows, newBody)
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
                    
                    manageError(error, navigate);
                });
        }else{
            await  getListaRelPagoPa(token,mainState.nonce,nPage, nRows, bodyRel)
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
                
                    manageError(error, navigate);
                });
        }            
    };
   
   

    const onButtonFiltra = () =>{
        setPage(0);
        setRowsPerPage(10);
        setBodyDownload(bodyRel);
        getlistaRel(bodyRel,1,10); 
        setFilterToLocalStorage(bodyRel,textValue,valueAutocomplete, 0, 10);
       
        
    };

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
     
        const realPage = newPage + 1;
       
        getlistaRel(bodyRel,realPage, rowsPerPage);
        setPage(newPage);
        const result = getFiltersFromLocalStorage();
        setFilterToLocalStorage(result.bodyRel,result.textValue,result.valueAutocomplete, newPage, rowsPerPage);
        
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
    
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        const realPage = page + 1;

        getlistaRel(bodyRel,realPage,parseInt(event.target.value, 10));
        const result = getFiltersFromLocalStorage();
        setFilterToLocalStorage(result.bodyRel,result.textValue,result.valueAutocomplete, page, parseInt(event.target.value, 10));
      
    };

   
    const getRel = async(idRel) => {

        if(enti){
            getSingleRel(token,mainState.nonce,idRel).then((res) =>{
                
                handleModifyMainState({relSelected:res.data});
               
                if(res.data.datiFatturazione === true){
                    navigate(PathPf.PDF_REL);
                }else{
                    setOpenModalRedirect(true);
                }
            }).catch((err)=>{
                manageError(err, navigate);
            }
              
            );
        }else{
            getSingleRelPagopa(token,mainState.nonce,idRel).then((res) =>{
               
                handleModifyMainState({relSelected:res.data});
            
                navigate(PathPf.PDF_REL);
              
            }).catch((err)=>{
             
                manageError(err, navigate);
            }
              
            );
        }
        
    };  

    const mesiWithZero = ['01','02','03','04','05','06','07','08','09','10','11','12'];

    const downloadListaRelExel = async() =>{
        setShowLoading(true);
        if(enti){

            const {idEnti, ...newBody} = bodyDownload;
            await downloadListaRel(token,mainState.nonce,newBody).then((res)=>{
                saveAs("data:text/plain;base64," + res.data.documento,`Regolari esecuzioni /${data[0]?.ragioneSociale}/ ${mesiWithZero[bodyDownload.mese-1]}/ ${bodyDownload.anno}.xlsx` );
                setShowLoading(false);
            }).catch((err)=>{
                manageError(err,navigate);
            }); 
        }else{
            await downloadListaRelPagopa(token,mainState.nonce,bodyDownload).then((res)=>{
                let fileName = `Regolari esecuzioni /${mesiWithZero[bodyDownload.mese-1]}/ ${bodyDownload.anno}.xlsx`;
                if(bodyDownload.idEnti.length === 1){
                    fileName = `Regolari esecuzioni /${data[0]?.ragioneSociale}/${mesiWithZero[bodyDownload.mese-1]}/ ${bodyDownload.anno}.xlsx`;
                }
                saveAs("data:text/plain;base64," + res.data.documento,fileName );
                setShowLoading(false);
            }).catch((err)=>{
                manageError(err,navigate);
            }); 
            
        }
        
    };


  
    const downloadListaPdfPagopa = async() =>{
        setShowLoading(true);
        await downloadListaRelPdfZipPagopa(token,mainState.nonce,bodyRel)
            .then(response => response.blob())
            .then(blob => {
                let fileName = `REL /Frimate / ${mesiWithZero[bodyRel.mese -1]} / ${bodyRel.anno}.zip`;
                if(bodyDownload.idEnti.length === 1){
                    fileName = `REL /Frimate /${data[0]?.ragioneSociale}/${mesiWithZero[bodyRel.mese -1]} / ${bodyRel.anno}.zip`;
                }
                saveAs(blob,fileName );
                setShowLoading(false);
            })
            .catch(err => {
                manageError(err,navigate);
            });
    };

  
    
    
    // visulizzazione del pop up redirect dati di fatturazione
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    /*
    <Button onClick={() => setVisible(true)}>SHOW ALERT</Button>
    <BasicAlerts setVisible={setVisible} visible={visible} typeAlert={''}></BasicAlerts>
    const [visible, setVisible] = useState(false);
*/
 
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
                                setTextValue={setTextValue}
                                textValue={textValue}
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
                            setData([]);
                            setPage(0);
                            setRowsPerPage(10);
                            deleteFilterToLocalStorage();
                            
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
                        headerNames={['Ragione Sociale','Tipologia Fattura', 'Reg. Es. PDF','ID Contratto','Anno','Mese','Tot. Analogico','Tot. Digitale','Tot. Not. Analogico','Tot. Not. Digitali','Totale','']}
                        apiGet={getRel}
                        disabled={getListaRelRunning}></GridCustom>
                </div>
            </div>
            <ModalRedirect
                setOpen={setOpenModalRedirect} 
                open={openModalRedirect}
                sentence={`Per poter visualizzare il dettaglio REL  è obbligatorio fornire i seguenti dati di fatturazione:`}>
                    
            </ModalRedirect>

            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading} 
                sentence={'Downloading...'}>
            </ModalLoading>

            <ModalLoading 
                open={getListaRelRunning} 
                setOpen={setGetListaRelRunning} 
                sentence={'Loading...'}>
            </ModalLoading>
        </div>

    );
};

export default RelPage;



