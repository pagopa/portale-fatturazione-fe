import { Button, Typography } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { useEffect, useState } from "react";
import { getProfilo, getToken } from "../reusableFunction/actionLocalStorage";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import SelectUltimiDueAnni from "../components/reusableComponents/select/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/select/selectMese";
import { BodyFatturazione, FatturazioneProps, FattureObj} from "../types/typeFatturazione";
import { downloadFatturePagopa, getFatturazionePagoPa, getTipologieFaPagoPa } from "../api/apiPagoPa/fatturazionePA/api";
import { manageError } from "../api/api";
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../types/typeReportDettaglio";
import { listaEntiNotifichePage } from "../api/apiSelfcare/notificheSE/api";
import MultiSelectFatturazione from "../components/fatturazione/multiSelect";
import CollapsibleTable from "../components/reusableComponents/grid/gridCustomCollapsible";
import { saveAs } from "file-saver";
import { month } from "../reusableFunction/reusableArrayObj";

const Fatturazione : React.FC<FatturazioneProps> = ({mainState, dispatchMainState}) =>{

    const token =  getToken();
    const profilo =  getProfilo();
    const currentYear = (new Date()).getFullYear();
    const currentMonth = (new Date()).getMonth() + 1;
    const monthNumber = Number(currentMonth);

    const [gridData, setGridData] = useState<FattureObj[]>([]);
    const [showLoadingGrid,setShowLoadingGrid] = useState(false);
    const [showDownloading,setShowDownloading] = useState(false);
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState<string>('hidden');
    const [tipologie, setTipologie] = useState<string[]>([]);
    const [valueMulitselectTipologie, setValueMultiselectTipologie] = useState<string[]>([]);
    const [showedData, setShowedData] = useState<FattureObj[]>([]);
  
    const [bodyFatturazione, setBodyFatturazione] = useState<BodyFatturazione>({
        anno:currentYear,
        mese:monthNumber,
        tipologiaFattura:[],
        idEnti:[]
    });
    const [bodyFatturazioneDownload, setBodyFatturazioneDownload] = useState<BodyFatturazione>({
        anno:currentYear,
        mese:monthNumber,
        tipologiaFattura:[],
        idEnti:[]
    });
    
    useEffect(()=>{
        if(mainState.nonce !== ''){
            getlistaFatturazione(bodyFatturazione);
        }
    },[mainState.nonce]);

    useEffect(()=>{
        if(bodyFatturazione.idEnti.length !== 0 || bodyFatturazione.tipologiaFattura.length !== 0 ){
            setStatusAnnulla('show');
        }else{
            setStatusAnnulla('hidden');
        }
    },[bodyFatturazione]);

    useEffect(()=>{
        if(dataSelect.length === 0){
            setValueAutocomplete([]);
        }
    }, [dataSelect]);
   
    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){
                listaEntiNotifichePageOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);

   
    useEffect(()=>{
        if(mainState.nonce !== ''){
            getTipologieFatturazione();
            setValueMultiselectTipologie([]);
        }
    },[mainState.nonce, bodyFatturazione.mese,bodyFatturazione.anno]);

    const getTipologieFatturazione =  async() => {
        await getTipologieFaPagoPa(token, mainState.nonce, {anno:bodyFatturazione.anno,mese:bodyFatturazione.mese}  )
            .then((res)=>{
                setTipologie(res.data);                
            })
            .catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
    };
    
    const getlistaFatturazione = async (body) => {
        setShowLoadingGrid(true);

        await  getFatturazionePagoPa(token,mainState.nonce,body)
            .then((res)=>{
                const orderDataCustom = res.data.map(el => el.fattura).map(obj=> ({...{id:Math.random()},...obj}));
                setGridData(orderDataCustom);
                setShowLoadingGrid(false);
                setBodyFatturazioneDownload(bodyFatturazione);
            }).catch((error)=>{
                if(error?.response?.status === 404){
                    setGridData([]);
                }
                setShowLoadingGrid(false);
                manageError(error, dispatchMainState);
            });        
    };


    // servizio che popola la select con la checkbox
    const listaEntiNotifichePageOnSelect = async () =>{
        if(profilo.auth === 'PAGOPA'){
            await listaEntiNotifichePage(token, mainState.nonce, {descrizione:textValue} )
                .then((res)=>{
                    setDataSelect(res.data);
                })
                .catch(((err)=>{
                    manageError(err,dispatchMainState);
                }));
        }
    };

    const downloadListaFatturazione = async () => {
        setShowDownloading(true);
        await downloadFatturePagopa(token,mainState.nonce, bodyFatturazioneDownload).then((res)=>{
            let title = `Lista fatturazione/${month[bodyFatturazioneDownload.mese - 1]}/${bodyFatturazioneDownload.anno}.xlsx`;
            if(bodyFatturazioneDownload.idEnti.length === 1 && gridData[0]){
                title = `Lista fatturazione/ ${gridData[0]?.ragionesociale}/${month[bodyFatturazioneDownload.mese - 1]}/${bodyFatturazioneDownload.anno}.xlsx`;
            }
            saveAs("data:text/plain;base64," + res.data.documento, title );
            setShowDownloading(false);
        }).catch(((err)=>{
            setShowDownloading(false);
            manageError(err,dispatchMainState);
        }));
    };


    return (
        <div className="mx-5">
            <div className="marginTop24 ">
                <Typography variant="h4">Fatturazione</Typography>
            </div>
            <div className="mt-5">
                <div className="row">
                    <div className="col-3">
                        <SelectUltimiDueAnni values ={bodyFatturazione} setValue={setBodyFatturazione}></SelectUltimiDueAnni>
                    </div>
                    <div  className="col-3">
                        <SelectMese values={bodyFatturazione} setValue={setBodyFatturazione}></SelectMese>
                    </div>
                    {/* 
                    <div  className="col-3">
                        <SelectTipologiaFattura values={bodyFatturazione} setValue={setBodyFatturazione}  types={tipologie}></SelectTipologiaFattura>
                    </div>*/}
                    <div  className="col-3">
                        <MultiSelectFatturazione
                            setBody={setBodyFatturazione}
                            list={tipologie}
                            value={valueMulitselectTipologie}
                            setValue={setValueMultiselectTipologie}
                        ></MultiSelectFatturazione>
                    </div>
                    <div  className="col-3">
                        <MultiselectCheckbox 
                            setBodyGetLista={setBodyFatturazione}
                            dataSelect={dataSelect}
                            setTextValue={setTextValue}
                            valueAutocomplete={valueAutocomplete}
                            setValueAutocomplete={setValueAutocomplete}
                        ></MultiselectCheckbox>
                    </div>
                </div>
                <div className="d-flex mt-5">
                   
                    <Button 
                        onClick={()=>{
                            getlistaFatturazione(bodyFatturazione);
                        } } 
                        sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                        variant="contained"> Filtra
                    </Button>
                    {statusAnnulla === 'hidden' ? null :
                        <Button
                            onClick={()=>{
                                getlistaFatturazione({
                                    anno:currentYear,
                                    mese:monthNumber,
                                    tipologiaFattura:[],
                                    idEnti:[]
                                });
                                setBodyFatturazione({
                                    anno:currentYear,
                                    mese:monthNumber,
                                    tipologiaFattura:[],
                                    idEnti:[]
                                });
                                setBodyFatturazioneDownload({
                                    anno:currentYear,
                                    mese:monthNumber,
                                    tipologiaFattura:[],
                                    idEnti:[]
                                });
                                setDataSelect([]);
                                setValueMultiselectTipologie([]);
                            } }
                            sx={{marginLeft:'24px'}} >
                    Annulla filtri
                        </Button>
                    }
                </div>
            </div>
            <div className="marginTop24" style={{display:'flex', justifyContent:'end', height:"48px"}}>
                
                {
                    gridData.length > 0 &&
                <Button onClick={() => downloadListaFatturazione()}
                >
                Download Risultati
                    <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                </Button>
                }
            </div>
            
            <CollapsibleTable 
                data={gridData}
                showedData={showedData}
                setShowedData={setShowedData}
                headerNames={[
                    "",
                    "Ragione Sociale",
                    "Tipo Contratto",
                    "Tot.",
                    "N. Fattura",
                    "Tipo Documento",
                    "Divisa",
                    "M. Pagamento",
                    "Ident.",
                    "T. Fattura",
                    "Split",
                    "Data Fattura"]}></CollapsibleTable>
            <div>
                <ModalLoading 
                    open={showLoadingGrid} 
                    setOpen={setShowLoadingGrid}
                    sentence={'Loading...'} >
                </ModalLoading>
                <ModalLoading 
                    open={showDownloading} 
                    setOpen={setShowDownloading}
                    sentence={'Downloading...'} >
                </ModalLoading>
            </div>
            
        </div>
    );
};

export default Fatturazione;