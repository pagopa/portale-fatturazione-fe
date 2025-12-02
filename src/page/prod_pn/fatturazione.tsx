import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { BodyFatturazione, FattureObj, TipologiaSap} from "../../types/typeFatturazione";
import { manageError, manageErrorDownload, managePresaInCarico } from "../../api/api";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import { listaEntiNotifichePage } from "../../api/apiSelfcare/notificheSE/api";
import { useContext, useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { month, statoInvio } from "../../reusableFunction/reusableArrayObj";
import ModalSap from "../../components/fatturazione/modalSap";
import { useNavigate } from "react-router";
import { GlobalContext } from "../../store/context/globalContext";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { PathPf } from "../../types/enum";
import { downloadFatturePagopa, downloadFattureReportPagopa, fattureCancellazioneRipristinoPagoPa, fattureTipologiaSapPa, getAnniDocEmessiPagoPa, getFatturazionePagoPa, getMesiDocEmessiPagoPa, getTipologieContratto, getTipologieFaPagoPa, getTipologieFaPagoPaWithData } from "../../api/apiPagoPa/fatturazionePA/api";
import { getMessaggiCount } from "../../api/apiPagoPa/centroMessaggi/api";
import CollapsibleTable from "../../components/reusableComponents/grid/gridCollapsible/gridCustomCollapsibleWithCheckbox";
import ModalConfermaRipristina from "../../components/fatturazione/modalConfermaRipristina";
import ModalResetFilter from "../../components/fatturazione/modalResetFilter";
import { headersObjGrid } from "../../assets/configurations/config_GridFatturazione";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";


const Fatturazione : React.FC = () =>{

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState, mainState,setCountMessages} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const callLista = useRef(true);
    const callAnnulla = useRef(false);
    const navigate = useNavigate();

    const [gridData, setGridData] = useState<FattureObj[]>([]);
    const [arrayYears,setArrayYears] = useState<number[]>([]);
    const [arrayMonths,setArrayMonths] = useState<{mese:string,descrizione:string}[]>([]);
    const [showLoadingGrid,setShowLoadingGrid] = useState(false);
    const [showDownloading,setShowDownloading] = useState(false);
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [tipologie, setTipologie] = useState<string[]>([]);
    const [valueMulitselectTipologie, setValueMultiselectTipologie] = useState<string[]>([]);
    const [disableButtonSap, setDisableButtonSap] = useState<boolean>(true);
    const [disableButtonReset, setDisableButtonReset] = useState<boolean>(true);
    const [openSapModal, setOpenSapModal] = useState<{who:number,show:boolean}>({who:0,show:false});
    const [openConfermaModal,setOpenConfermaModal] = useState(false);
    const [openResetFilterModal,setOpenResetFilterModal] = useState(false);
    const [responseTipologieSap, setResponseTipologieSap] = useState<TipologiaSap[]>([]);
    const [fattureSelected, setFattureSelected] = useState<number[]>([]);
    const [dateTipologie, setDateTipologie] = useState<string[]>([]);
    const [valueMulitselectDateTipologie, setValueMultiselectDateTipologie] = useState<string[]>([]);
    const [arrayContratti, setArrayContratto] = useState<{id:number,descrizione:string}[]>([{id:3,descrizione:"Tutti"}]);


   
    const [bodyFatturazione, setBodyFatturazione] = useState<BodyFatturazione>({
        anno:0,
        mese:0,
        tipologiaFattura:[],
        idEnti:[],
        cancellata:false,
        idTipoContratto:null,
        inviata:3
    });

    const [bodyFatturazioneDownload, setBodyFatturazioneDownload] = useState<BodyFatturazione>({
        anno:0,
        mese:0,
        tipologiaFattura:[],
        idEnti:[],
        cancellata:false,
        idTipoContratto:null,
        inviata:3
    });

    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.FATTURAZIONE,{});

    useEffect(()=>{
        getAnni();
        getContratti(); 
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
        if(bodyFatturazione.anno !== 0 && bodyFatturazione.mese !== 0 && !isInitialRender.current){
            getDateTipologieFatturazione(bodyFatturazione);
            setValueMultiselectDateTipologie([]);
        }else if(isInitialRender.current && Object.keys(filters).length > 0){
            getDateTipologieFatturazione(filters.body);
        }else if(isInitialRender.current && bodyFatturazione.anno !== 0 && bodyFatturazione.mese !== 0){
            getDateTipologieFatturazione(bodyFatturazione);
        }
    },[bodyFatturazione]);
    
    const getAnni = async() => {
        setShowLoadingGrid(true);
        await getAnniDocEmessiPagoPa(token, profilo.nonce).then((res)=>{
            const arrayNumber = res.data.map(el => Number(el.toString()));
            setArrayYears(arrayNumber);
            if(isInitialRender.current && Object.keys(filters).length > 0){
                getMesi(filters.body.anno?.toString());
            }else{
                getMesi(res.data[0]);
            }   
        }).catch((err)=>{
            setArrayYears([]);
            setShowLoadingGrid(false);
            manageError(err,dispatchMainState);
        });
    };

    const getContratti = async() => {
        await getTipologieContratto(token, profilo.nonce).then((res)=>{
            setArrayContratto([{id:3,descrizione:"Tutti"}, ...res.data]);
        }).catch(()=>{
            setArrayContratto([]);
        });
    };
   
    const getMesi = async(year) =>{
        await getMesiDocEmessiPagoPa(token, profilo.nonce,{anno:year}).then((res)=>{    
            const mesiCamelCase = res.data.map(el => {
                el.descrizione = el?.descrizione.charAt(0).toUpperCase() + el.descrizione.slice(1).toLowerCase();
                return el;
            });
            setArrayMonths(mesiCamelCase);
            if(isInitialRender.current && Object.keys(filters).length > 0){
                setBodyFatturazione(filters.body);
                setBodyFatturazioneDownload(filters.body);
                setValueAutocomplete(filters.valueAutocomplete);
                setTextValue(filters.textValue);
                setValueMultiselectTipologie(filters.valueMulitselectTipologie);
                setFattureSelected(filters.fattureSelected);
                getlistaFatturazione(filters.body);
            }else{
                setBodyFatturazione({anno:Number(year),mese:mesiCamelCase[0].mese, tipologiaFattura:[],cancellata:false,idEnti:[],idTipoContratto:null,inviata:3});
                getTipologieFatturazione(Number(year),Number(mesiCamelCase[0]?.mese),false);
                setValueMultiselectTipologie([]);
                if(callLista.current){
                    getlistaFatturazione({...bodyFatturazione,...{anno:Number(year),mese:mesiCamelCase[0].mese, tipologiaFattura:[],cancellata:false,idEnti:[],idTipoContratto:null}});
                }
               
            }
        }).catch((err)=>{
            setArrayMonths([]);
            setBodyFatturazione((prev)=> ({...prev,...{mese:0}}));
            setShowLoadingGrid(false);
            manageError(err,dispatchMainState);
        });
    };

    const getTipologieFatturazione =  async(anno,mese,cancellata) => {
        await getTipologieFaPagoPa(token, profilo.nonce, {anno:anno,mese:mese,cancellata:cancellata}  )
            .then((res)=>{
                setTipologie(res.data);
            }).catch((()=>{
                setTipologie([]);
            }));
        isInitialRender.current = false;
    };

    const getDateTipologieFatturazione =  async(body) => {
        await getTipologieFaPagoPaWithData(token, profilo.nonce, body)
            .then((res)=>{
                const result = res.data.map((el)=>{
                    return el.tipologiaFattura+"-"+el.dataFattura?.split("T")[0];
                });
                setDateTipologie(result);
            
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    setValueMultiselectDateTipologie(filters.valueMulitselectDateTipologie);
                }
            }).catch((()=>{
                setDateTipologie([]);
            }));
    };

    const getlistaFatturazione = async (bodyToModify) => {
        let body = bodyToModify;
        if(body.inviata === 3){
            body =  {...bodyToModify,inviata:null};
        }else if(body.inviata === 4){
            body =  {...bodyToModify,inviata:0};
        }
        setShowLoadingGrid(true);
        setDisableButtonSap(true);
        await  getFatturazionePagoPa(token,profilo.nonce,body).then((res)=>{

            let dataString = valueMulitselectDateTipologie.map(el =>  el.split("-").slice(1).join("-"));
            
            if(isInitialRender.current && Object.keys(filters).length > 0 ){
                dataString = filters?.valueMulitselectDateTipologie.map(el =>  el.split("-").slice(1).join("-"));
            }else if( callAnnulla.current){
                dataString = [];
            }
       
            let data; 
            if(dataString.length === 0){
                data = res.data.map(el => el?.fattura);
            }else{
                data = res.data.map(el => el?.fattura).filter(obj => dataString.includes(obj.dataFattura));
            }  
            setGridData(data);
            setShowLoadingGrid(false);
            setBodyFatturazioneDownload(body);
            callAnnulla.current = false;
        }).catch((error)=>{
            if(error?.response?.status === 404){
                setGridData([]);
            }
            setBodyFatturazioneDownload(body);
            setShowLoadingGrid(false);
            manageError(error, dispatchMainState);
            callAnnulla.current = false;
        });  
        getTipologieFattureInvioSap(body.anno,body.mese);
        if(isInitialRender.current){
            getTipologieFatturazione(body.anno,body.mese, body.cancellata);
        }
    };

    const getCount = async () =>{
        await getMessaggiCount(token,profilo.nonce).then((res)=>{
            const numMessaggi = res.data;
            setCountMessages(numMessaggi);
        }).catch(()=>{
            return;
        });
    };


    const sendCancellazzioneRispristinoFatture = async () =>{
        await fattureCancellazioneRipristinoPagoPa(token,profilo.nonce,{idFatture:fattureSelected,cancellazione:!bodyFatturazioneDownload.cancellata}).then(()=>{
            getlistaFatturazione(bodyFatturazioneDownload);
            managePresaInCarico('FATTURA_SOSPESA_RIPRISTINATA',dispatchMainState);
            getCount();
        }).catch((error)=>{
            getlistaFatturazione(bodyFatturazioneDownload);
            manageError(error, dispatchMainState);
        });      
    };

    const listaEntiNotifichePageOnSelect = async () =>{
        if(profilo.auth === 'PAGOPA'){
            await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue}).then((res)=>{
                setDataSelect(res.data);
            }).catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
        }
    };

    const downloadListaFatturazione = async () => {
        let body = bodyFatturazioneDownload;
        if(body.inviata === 3){
            body =  {...bodyFatturazioneDownload,inviata:null};
        }else if(body.inviata === 4){
            body =  {...bodyFatturazioneDownload,inviata:0};
        }
        setShowDownloading(true);
        await downloadFatturePagopa(token,profilo.nonce, body).then(response => response.blob()).then((response)=>{
            let title = `Lista fatturazione/${month[body.mese - 1]}/${body.anno}.xlsx`;
            if(body.idEnti.length === 1 && gridData[0]){
                title = `Lista fatturazione/ ${gridData[0]?.ragionesociale}/${month[body.mese - 1]}/${body.anno}.xlsx`;
            }
            saveAs(response,title);
            setShowDownloading(false);
        }).catch(((err)=>{
            setShowDownloading(false);
            manageError(err,dispatchMainState);
        }));
    };

    const downloadListaReportFatturazione = async () => {
        let body = bodyFatturazioneDownload;
        if(body.inviata === 3){
            body =  {...bodyFatturazioneDownload,inviata:null};
        }else if(body.inviata === 4){
            body =  {...bodyFatturazioneDownload,inviata:0};
        }
        setShowDownloading(true);
        await downloadFattureReportPagopa(token,profilo.nonce, body).then((response)=>{
            if (response.ok) {
                return response.blob();
            }
            throw '404';
        }).then((response)=>{
            let title = `Lista report/${month[body.mese - 1]}/${body.anno}.zip`;
            if(body.idEnti.length === 1 && gridData[0]){
                title = `Lista report/ ${gridData[0]?.ragionesociale}/${month[body.mese - 1]}/${body.anno}.zip`;
            }
            saveAs(response,title);
            setShowDownloading(false);
        }).catch((()=>{
            setShowDownloading(false);
            manageErrorDownload('404',dispatchMainState);
        }));
    };

    const fattureSelectedArr = () =>{
        return fattureSelected.map((el)=>{
            return gridData.filter((obj:FattureObj) => obj.idfattura === el ).pop();
        });
    };
 

    const getTipologieFattureInvioSap = async(anno,mese) =>{
        await fattureTipologiaSapPa(token, profilo.nonce, {anno,mese} ).then((res)=>{
            const anableInvioSap = res.data?.filter((el)=> el.azione === 0).length;
            const anableReset = res.data?.filter((el)=> el.azione === 1).length;
            if(anableInvioSap > 0){
                setDisableButtonSap(false);
            }else{
                setDisableButtonSap(true);
            }
            if(anableReset > 0){
                setDisableButtonReset(false);
            }else{
                setDisableButtonReset(true);
            }
            setResponseTipologieSap(res.data);
        }).catch((()=>{
            setDisableButtonSap(true);
            setDisableButtonReset(true);
            setResponseTipologieSap([]);
        }));
    };

    const onButtonSap = (who) => {
        setOpenSapModal((prev)=>({...prev,...{show:true,who}}));
    };

    const clearOnChangeFilter = () => {
        setGridData([]);
        setFattureSelected([]);  
        setDisableButtonSap(true);
        setDisableButtonReset(true); 
    };

    const onButtonFiltra = () => {
        updateFilters({
            pathPage:PathPf.FATTURAZIONE,
            body:bodyFatturazione,
            textValue:textValue,
            valueAutocomplete,
            fattureSelected:fattureSelected,
            valueMulitselectTipologie:valueMulitselectTipologie,
            valueMulitselectDateTipologie:valueMulitselectDateTipologie,
            page:0,
            rows:10,
        });
        getlistaFatturazione(bodyFatturazione);
        callLista.current = true;
    };

    const onButtonAnnulla = () => {
        callAnnulla.current = true;
        resetFilters();
        getAnni();
        setBodyFatturazione({
            anno:arrayYears[0],
            mese:0,
            tipologiaFattura:[],
            idEnti:[],
            cancellata:false,
            idTipoContratto:null,
            inviata:3
        });
        setBodyFatturazioneDownload({
            anno:arrayYears[0],
            mese:0,
            tipologiaFattura:[],
            idEnti:[],
            cancellata:false,
            idTipoContratto:null,
            inviata:3
        });
        setDataSelect([]);
        setValueMultiselectTipologie([]);
        setValueAutocomplete([]);
        
    };
    
    const upadateOnSelctedChange = (page,rowsPerPage) =>{
        updateFilters({
            pathPage:PathPf.FATTURAZIONE,
            body:bodyFatturazione,
            textValue:textValue,
            valueAutocomplete,
            fattureSelected:fattureSelected,
            valueMulitselectTipologie:valueMulitselectTipologie,
            valueMulitselectDateTipologie:valueMulitselectDateTipologie,
            page:page,
            rows:rowsPerPage,
        });
    };



    const statusAnnulla = bodyFatturazione.idEnti.length !== 0 || bodyFatturazione.tipologiaFattura.length !== 0 || bodyFatturazione.cancellata === true || bodyFatturazione.idTipoContratto !== null ? "show" :"hidden";


    return (
        <MainBoxStyled title={"Documenti emessi"}>
            <ResponsiveGridContainer >
                <MainFilter 
                    filterName={"select_value_string"}
                    inputLabel={"Anno"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    body={bodyFatturazione}
                    keyDescription={"anno"}
                    keyValue={"anno"}
                    keyBody={"anno"}
                    arrayValues={arrayYears}
                    extraCodeOnChange={(e)=>{
                        callLista.current = false; 
                        getMesi(e.toString());
                        setDataSelect([]);
                        setValueMultiselectTipologie([]);
                        setValueAutocomplete([]);
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_key_value"}
                    inputLabel={"Mese"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    body={bodyFatturazione}
                    keyValue={"mese"}
                    keyDescription='descrizione'
                    keyBody={"mese"}
                    arrayValues={arrayMonths}
                    extraCodeOnChange={(e)=>{
                        const value = Number(e);
                        setBodyFatturazione((prev)=> ({...prev, ...{mese:value,tipologiaFattura:[]}}));
                        getTipologieFatturazione(bodyFatturazione.anno,value,bodyFatturazione.cancellata);
                        setValueMultiselectTipologie([]);            
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_key_value"}
                    inputLabel={"Stato"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    body={bodyFatturazione}
                    keyValue={"id"}
                    keyDescription='descrizione'
                    keyBody={"cancellata"}
                    arrayValues={[{id:1,descrizione:"Fatturate"},{id:2,descrizione:"Non fatturate"}]}
                    extraCodeOnChange={(e)=>{
                      
                        const value = Number(e) === 1 ? false : true;
                        setBodyFatturazione((prev)=>({...prev,...{cancellata:value,tipologiaFattura:[]}}));
                        getTipologieFatturazione(bodyFatturazione.anno,bodyFatturazione.mese,value);
                        setValueMultiselectTipologie([]);       
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Tipologia Fattura"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    body={bodyFatturazione}
                    dataSelect={tipologie}
                    valueAutocomplete={valueMulitselectTipologie}
                    setValueAutocomplete={setValueMultiselectTipologie}
                    keyDescription={"tipologiaFattura"}
                    keyValue={"tipologiaFattura"}
                    keyBody={"tipologiaFattura"}
                    extraCodeOnChangeArray={(e)=>{
                        setValueMultiselectTipologie(e);
                        setBodyFatturazione((prev) => ({...prev,...{tipologiaFattura:e}}));
                    }}
                    iconMaterial={RenderIcon("invoice",true)}
                    
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Rag. Soc. Ente"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    body={bodyFatturazione}
                    dataSelect={dataSelect}
                    setTextValue={setTextValue}
                    textValue={textValue}
                    valueAutocomplete={valueAutocomplete}
                    setValueAutocomplete={setValueAutocomplete}
                    keyDescription={"descrizione"}
                    keyValue={"idEnte"}
                    keyBody={"idEnti"}
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Data Fattura"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    body={bodyFatturazione}
                    dataSelect={dateTipologie}
                    valueAutocomplete={valueMulitselectDateTipologie}
                    setValueAutocomplete={setValueMultiselectDateTipologie}
                    keyDescription={"dataFattura"}
                    keyValue={"tipologiaFattura"}
                    keyBody={"dataFattura"}
                    extraCodeOnChangeArray={(e)=>{
                      
                        setValueMultiselectDateTipologie(e);
                    }}
                    iconMaterial={RenderIcon("date",true)}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_key_value"}
                    inputLabel={"Tipologia contratto"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    body={bodyFatturazione}
                    keyDescription={"descrizione"}
                    keyBody={"idTipoContratto"}
                    keyValue={"id"}
                    arrayValues={arrayContratti}
                    defaultValue={"3"}
                    extraCodeOnChange={(e)=>{
                        const val = (Number(e) === 3) ? null : Number(e);
                        setBodyFatturazione((prev)=>({...prev,...{idTipoContratto:val}}));
                    }}
                    iconMaterial={RenderIcon("contract")}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_key_value"}
                    inputLabel={"Stato Invio"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    body={bodyFatturazione}
                    keyValue={"id"}
                    keyDescription='description'
                    keyBody={"inviata"}
                    arrayValues={statoInvio}
                    extraCodeOnChange={(e)=>{ 
                        const value = Number(e);
                        setBodyFatturazione((prev)=>({...prev,...{inviata:value}}));
                    }}
                ></MainFilter>
            </ResponsiveGridContainer>
            <FilterActionButtons 
                onButtonFiltra={onButtonFiltra} 
                onButtonAnnulla={onButtonAnnulla} 
                statusAnnulla={statusAnnulla} 
                actionButton={[  {
                    onButtonClick: () => onButtonSap(1),
                    variant: "outlined",
                    icon:{name:"restart" },
                    disabled:disableButtonReset,
                    tooltipMessage:"Reset",
                    withText:false,
                    colorAction:"error"
                }, 
                {
                    onButtonClick: () => onButtonSap(0),
                    variant: "outlined",
                    icon:{name:"preview" },
                    disabled:disableButtonSap,
                    tooltipMessage:"Invia a SAP",
                    withText:false
                },{
                    onButtonClick: () => navigate(PathPf.JSON_TO_SAP),
                    variant: "outlined",
                    icon:{name:"iso_share" },
                    tooltipMessage:"Invia fatture REL firmate",
                    withText:false
                },
              
                ]}
            ></FilterActionButtons>
            <ActionTopGrid
                actionButtonRight={[{
                    onButtonClick:downloadListaReportFatturazione,
                    variant: "outlined",
                    label: "Download Report",
                    icon:{name:"download"},
                    disabled:(gridData.length === 0)
                },{
                    onButtonClick:downloadListaFatturazione,
                    variant: "outlined",
                    label: "Download Risultati",
                    icon:{name:"download"},
                    disabled:(gridData.length === 0)
                }]}/>
              
            <CollapsibleTable 
                data={gridData}
                headerNames={headersObjGrid}
                stato={bodyFatturazioneDownload.cancellata}
                setOpenConfermaModal={setOpenConfermaModal}
                setOpenResetFilterModal={setOpenResetFilterModal}
                monthFilterIsEqualMonthDownload={bodyFatturazione.mese === bodyFatturazioneDownload.mese}
                selected={fattureSelected}
                setSelected={setFattureSelected}
                updateFilters={updateFilters}
                pathPage={PathPf.FATTURAZIONE}
                body={{
                    body:bodyFatturazioneDownload,
                    textValue:textValue,
                    valueAutocomplete:valueAutocomplete,
                    valueMulitselectTipologie:valueMulitselectTipologie,
                    fattureSelected:fattureSelected}}
                infoPageLocalStorage={{page:filters.page,rows:filters.rows}}
                firstRender={isInitialRender.current}
                upadateOnSelctedChange={upadateOnSelctedChange}
            ></CollapsibleTable>
             
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
               
            <ModalSap
                open={openSapModal} 
                setOpen={setOpenSapModal}
                responseTipologiaSap={responseTipologieSap}
                mese={bodyFatturazioneDownload.mese}
                anno={bodyFatturazioneDownload.anno}
                dispatchMainState={dispatchMainState}
                getListaFatture={getlistaFatturazione}
                bodyFatturazioneDownload={bodyFatturazioneDownload}></ModalSap>
            <ModalConfermaRipristina 
                setOpen={setOpenConfermaModal}
                open={openConfermaModal}
                filterInfo={bodyFatturazioneDownload}
                onButtonComferma={sendCancellazzioneRispristinoFatture}
                fattureSelectedArr={fattureSelectedArr}></ModalConfermaRipristina>
            <ModalResetFilter
                setOpen={setOpenResetFilterModal}
                open={openResetFilterModal}
                filterInfo={bodyFatturazioneDownload}
                filterNotExecuted={bodyFatturazione}
                getListaFatture={getlistaFatturazione}></ModalResetFilter>
        </MainBoxStyled>
        
    );
};

export default Fatturazione;