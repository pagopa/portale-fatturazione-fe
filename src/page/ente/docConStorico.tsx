import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { profiliEnti,  } from "../../reusableFunction/actionLocalStorage";
import { OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import { downloadListaRel, getAnniRelSend, getListaRel, getMesiRelSend, getTipologieFatture } from "../../api/apiSelfcare/relSE/api";
import { mesiGrid, mesiWithZero } from "../../reusableFunction/reusableArrayObj";
import { downloadListaRelPagopa, downloadListaRelPdfZipPagopa, downloadQuadraturaRelPagopa, downloadReportRelPagoPa, getAnniRel, getListaRelPagoPa, getMesiRel, getTipologieContrattoRel, getTipologieFatturePagoPa } from "../../api/apiPagoPa/relPA/api";
import { listaEntiNotifichePage } from "../../api/apiSelfcare/notificheSE/api";
import { PathPf } from "../../types/enum";
import { saveAs } from "file-saver";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import ModalRedirect from "../../components/commessaInserimento/madalRedirect";
import { manageError, manageErrorDownload } from "../../api/api";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { Rel, BodyRel } from "../../types/typeRel";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import { Paper, Typography } from "@mui/material";


type DocumentiStorico =  {
    idTestata:number,
    tipologiaFattura:number|string,
    stato:string,
    importoSospeso:number|string,
    mese:string,
    anno:number,
    progressivo:number
}
 

const DocStorico : React.FC = () =>{

    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();
    const enti = profiliEnti(mainState);
    let profilePath; 

    if(profilo.auth === 'PAGOPA'){
        profilePath = PathPf.PDF_REL;
    }else{
        profilePath = PathPf.PDF_REL_EN;
    }
 
    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showLoading, setShowLoading] = useState(false);
    const [totalNotifiche, setTotalNotifiche]  = useState(0);
    const [dataSelect, setDataSelect] = useState([]);
    const [storno, setStorno] = useState("");
    const [data, setData] = useState<DocumentiStorico[]>([]);
    const [arrayYears,setArrayYears] = useState<number[]>([]);
    const [arrayMonths,setArrayMonths] = useState<{mese:string,descrizione:string}[]>([]);
    const [getListaRelRunning, setGetListaRelRunning] = useState(false);
    const [disableDownloadListaPdf, setDisableListaPdf] = useState(true);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [tipologiaFatture, setTipologiaFatture] = useState<string[]>([]);
    const [valuetipologiaFattura, setValueTipologiaFattura] = useState<string>('');
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
    const [arrayContratti, setArrayContratto] = useState<{id:number,descrizione:string}[]>([{id:3,descrizione:"Tutti"}]);
    const [bodyDownload, setBodyDownload] = useState<BodyRel>({
        anno:0,
        mese:0,
        tipologiaFattura:null,
        idEnti:[],
        idContratto:null,
        caricata:null,
        idTipoContratto:null
    });
    const [bodyRel, setBodyRel] = useState<BodyRel>({
        anno:0,
        mese:0,
        tipologiaFattura:null,
        idEnti:[],
        idContratto:null,
        caricata:null,
        idTipoContratto:null
    });
    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(profilePath,{});

    useEffect(()=>{
        getAnni();
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
        if((mainState.datiFatturazione === false || mainState.datiFatturazioneNotCompleted) && enti){
            setOpenModalRedirect(true);
        }
    },[]);

    const getAnni = async() => {
        
        if(enti && mainState.datiFatturazione === true){
            setGetListaRelRunning(true);
            await getAnniRelSend(token, profilo.nonce).then((res)=>{
                const arrayNumber = res.data.map(el => Number(el.toString()));
                setArrayYears(arrayNumber);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    getMesi(filters.body.anno?.toString());
                }else{
                    setBodyRel((prev)=> ({...prev,...{anno:Number(res.data[0])}}));
                    setBodyDownload((prev)=> ({...prev,...{anno:Number(res.data[0])}}));
                    getMesi(res.data[0]);
                }
            }).catch((err)=>{
                setArrayYears([]);
                setGetListaRelRunning(false);
                manageError(err,dispatchMainState);
            });
        }else if(profilo.auth === 'PAGOPA'){
            setGetListaRelRunning(true);
            await getContratti();
            await getAnniRel(token, profilo.nonce).then((res)=>{
                const arrayNumber = res.data.map(el => Number(el.toString()));
                setArrayYears(arrayNumber);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    getMesi(filters.body.anno?.toString());
                }else{
                    setBodyRel((prev)=> ({...prev,...{anno:Number(res.data[0])}}));
                    setBodyDownload((prev)=> ({...prev,...{anno:Number(res.data[0])}}));
                    getMesi(res.data[0]);
                    
                }
            }).catch((err)=>{
                setArrayYears([]);
                setGetListaRelRunning(false);
                manageError(err,dispatchMainState);
            });
        }
       
    };

    const getMesi = async(year) =>{
        
        if(enti && mainState.datiFatturazione === true){
            setGetListaRelRunning(true);
            await getMesiRelSend(token, profilo.nonce,{anno:year}).then((res)=>{
                const mesiCamelCase = res.data.map(el => {
                    el.descrizione = el?.descrizione.charAt(0).toUpperCase() + el.descrizione.slice(1).toLowerCase();
                    return el;
                });
                setArrayMonths(mesiCamelCase);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    getListTipologiaFattura(filters.body.anno,filters.body.mese);
                    setTextValue(filters.textValue);
                    setPage(filters.page);
                    setRowsPerPage(filters.rows);
                    setBodyDownload(filters.body);
                    setBodyRel(filters.body);
                    setBodyDownload(filters.body);
                    getlista(filters.body,filters.page + 1, filters.rows);
                }else if(isInitialRender.current){
                    setBodyRel((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                    setBodyDownload((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                    getListTipologiaFattura(year, mesiCamelCase[0].mese);
                    getlista({...bodyRel,...{anno:year,mese:mesiCamelCase[0].mese}},1,rowsPerPage);
                }else{
                    setBodyRel((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                    setBodyDownload((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                   
                    setGetListaRelRunning(false);
                }
            }).catch((err)=>{
                setArrayMonths([]);
                setBodyRel((prev)=> ({...prev,...{mese:0}}));
                setBodyDownload((prev)=> ({...prev,...{mese:0}}));
                setGetListaRelRunning(false);
                manageError(err,dispatchMainState);
            });
        }else if(profilo.auth === 'PAGOPA'){
            setGetListaRelRunning(true);
            await getMesiRel(token, profilo.nonce,{anno:year}).then((res)=>{
                const mesiCamelCase = res.data.map(el => {
                    el.descrizione = el?.descrizione.charAt(0).toUpperCase() + el.descrizione.slice(1).toLowerCase();
                    return el;
                });
                
                setArrayMonths(mesiCamelCase);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    setTextValue(filters.textValue);
                    setValueAutocomplete(filters.valueAutocomplete);
                    getlista(filters.body,filters.page + 1, filters.rows);
                    setPage(filters.page);
                    setRowsPerPage(filters.rows);
                    setBodyDownload(filters.body);
                    getListTipologiaFattura(filters.body.anno,filters.body.mese);
                    setBodyRel(filters.body);
                }else if(isInitialRender.current){
                    setBodyRel((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                    setBodyDownload((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                    getListTipologiaFattura(year, mesiCamelCase[0].mese);
                    getlista({...bodyRel,...{anno:year,mese:mesiCamelCase[0].mese}},1,rowsPerPage);
                }else{
                    setBodyRel((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                    setBodyDownload((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                    setGetListaRelRunning(false);
                }
            }).catch((err)=>{
                setArrayMonths([]);
                setBodyRel((prev)=> ({...prev,...{mese:0}}));
                setBodyDownload((prev)=> ({...prev,...{mese:0}}));
                setGetListaRelRunning(false);
                manageError(err,dispatchMainState);
            });
        }
       
    };

    const getContratti = async() => {
        await getTipologieContrattoRel(token, profilo.nonce).then((res)=>{
            setArrayContratto(prev => [...prev, ...res.data]);
        }).catch((err)=>{
            setArrayContratto([]);

        });
    };


    const getlista = async (bodyRel,nPage,nRows) => {

        const mockRes = {
            "importoSospeso": 1234.56,
            "dettagli": [
                {
                    "importo_sospeso_parziale": 100.00,
                    "FkTipologiaFattura": 1,
                    "TotaleFattura": 500.00,
                    "AnnoRiferimento": 2024,
                    "MeseRiferimento": 6,
                    "Progressivo": 1,
                    "stato": "sospesa"
                },
                {
                    "importo_sospeso_parziale": 200.00,
                    "FkTipologiaFattura": 2,
                    "TotaleFattura": 750.00,
                    "AnnoRiferimento": 2024,
                    "MeseRiferimento": 7,
                    "Progressivo": 2,
                    "stato": "sospesa"
                }
            ]
        };


        setGetListaRelRunning(true);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {idEnti,idTipoContratto, ...newBody} = bodyRel;
        await  getListaRel(token,profilo.nonce,nPage, nRows, newBody)
            .then((res)=>{
                // ordino i dati in base all'header della grid
                const orderDataCustom = mockRes.dettagli.map((obj)=>{
                    // inserire come prima chiave l'id se non si vuol renderlo visibile nella grid
                    // 'id serve per la chiamata get dettaglio dell'elemento selezionato nella grid
                    return {
                        idTestata:Math.random(),
                        tipologiaFattura:obj.FkTipologiaFattura === 1 ? "Anticipo": "Primo saldo",
                        stato:obj.stato.charAt(0).toUpperCase() + obj.stato.slice(1),
                        importoSospeso:obj.importo_sospeso_parziale.toLocaleString("de-DE", { style: "currency", currency: "EUR" }),
                        mese:mesiGrid[obj.MeseRiferimento],
                        anno:obj.AnnoRiferimento,
                        progressivo:obj.Progressivo
                    };
                });
                setStorno(mockRes.importoSospeso.toLocaleString("de-DE", { style: "currency", currency: "EUR" }));
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
    
        isInitialRender.current = false;       
    };

    // servizio che popola la select con la checkbox
    const listaEntiNotifichePageOnSelect = async () =>{
        if(profilo.auth === 'PAGOPA'){
            await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue} ).then((res)=>{
                setDataSelect(res.data);
            }).catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
        }
    };

    const clearOnChangeFilter = () => {
        setData([]);
        setTotalNotifiche(0);
        setPage(0);
        setRowsPerPage(10); 
    };

    const onButtonFiltra = () =>{
        updateFilters({
            pathPage:profilePath,
            body:bodyRel,
            textValue,
            valueAutocomplete:valueAutocomplete,
            page:0,
            rows:10,
            valuetipologiaFattura
        });
        setPage(0);
        setRowsPerPage(10);
        setBodyDownload(bodyRel);
        getlista(bodyRel,1,10); 
    };

    const onButtonAnnulla = async () => {
        let firstMonth = {mese:0};
        if(enti){
            firstMonth = await getMesiRelSend(token, profilo.nonce,{anno:arrayYears[0]?.toString()})
                .then(res => res.data[0])
                .catch(err => manageError(err,dispatchMainState));
        }else if(profilo.auth === 'PAGOPA'){
            firstMonth = await getMesiRel(token, profilo.nonce,{anno:arrayYears[0]?.toString()})
                .then(res => res.data[0])
                .catch(err => manageError(err,dispatchMainState));
        }
        setBodyRel({
            anno:arrayYears[0],
            mese:firstMonth.mese,
            tipologiaFattura:null,
            idEnti:[],
            idContratto:null,
            caricata:null,
            idTipoContratto:null
        });
        setBodyDownload({
            anno:arrayYears[0],
            mese:firstMonth.mese,
            tipologiaFattura:null,
            idEnti:[],
            idContratto:null,
            caricata:null,
            idTipoContratto:null
        });
        setValueTipologiaFattura('');
        setData([]);
        setPage(0);
        setRowsPerPage(10);
        setValueAutocomplete([]);
        getlista({
            anno:arrayYears[0],
            mese:firstMonth.mese,
            tipologiaFattura:null,
            idEnti:[],
            idContratto:null,
            caricata:null
        },1,10);
        resetFilters();
    
    };

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        const realPage = newPage + 1;
        getlista(bodyRel,realPage, rowsPerPage);
        setPage(newPage);
        updateFilters({
            pathPage:profilePath,
            body:bodyDownload,
            textValue,
            valueAutocomplete:valueAutocomplete,
            page:newPage,
            rows:rowsPerPage,
            valuetipologiaFattura
        });
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        const realPage = page + 1;
        getlista(bodyRel,realPage,parseInt(event.target.value, 10));
        updateFilters({
            pathPage:profilePath,
            body:bodyDownload,
            textValue,
            valueAutocomplete:valueAutocomplete,
            page:0,
            rows:parseInt(event.target.value, 10),
            valuetipologiaFattura
        });
    };
   
    const setIdRel = async(el) => {
        handleModifyMainState({relSelected:el});
        navigate(profilePath);
    };  

    const getListTipologiaFattura = async(anno,mese) => {
        if(enti){
            await getTipologieFatture(token, profilo.nonce, {mese,anno}).then((res)=>{
                setTipologiaFatture(res.data);
                if(filters.valuetipologiaFattura){
                    setValueTipologiaFattura(filters.valuetipologiaFattura);
                }else{
                    setValueTipologiaFattura('');
                }
            }).catch((()=>{
                setTipologiaFatture([]);
                setValueTipologiaFattura("");
                // manageError(err,dispatchMainState);
            }));
        }else if(profilo.auth === 'PAGOPA'){
            await getTipologieFatturePagoPa(token, profilo.nonce, {mese,anno}).then((res)=>{
                setTipologiaFatture(res.data);
                if(filters.valuetipologiaFattura){
                    setValueTipologiaFattura(filters.valuetipologiaFattura);
                }else{
                    setValueTipologiaFattura('');
                } 
            }).catch((()=>{
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
                setBodyRel((prev)=>({...prev,...{tipologiaFattura:null}}));
                setBodyDownload((prev)=>({...prev,...{tipologiaFattura:null}}));
            }).catch((()=>{
                setTipologiaFatture([]);
                setValueTipologiaFattura('');
                setBodyRel((prev)=>({...prev,...{tipologiaFattura:null}}));
                setBodyDownload((prev)=>({...prev,...{tipologiaFattura:null}}));
               
                // manageError(err,dispatchMainState);
            }));
        }else if(profilo.auth === 'PAGOPA'){
            await getTipologieFatturePagoPa(token, profilo.nonce, {mese,anno}).then((res)=>{
                setTipologiaFatture(res.data);
                setValueTipologiaFattura('');
                setBodyRel((prev)=>({...prev,...{tipologiaFattura:null}}));
                setBodyDownload((prev)=>({...prev,...{tipologiaFattura:null}}));
            }).catch((()=>{
                setTipologiaFatture([]);
                setValueTipologiaFattura('');
                setBodyRel((prev)=>({...prev,...{tipologiaFattura:null}}));
                setBodyDownload((prev)=>({...prev,...{tipologiaFattura:null}}));
                // manageError(err,dispatchMainState);
            }));

        }
        setGetListaRelRunning(false);
    };


    const downloadReport = async () => {
        setShowLoading(true);
        await downloadReportRelPagoPa(token, profilo.nonce).then((response) => {
            if (response.ok) {
                return response.blob();
            }
            throw '404';
        }).then((res)=>{
            const fileName = `Report regolare esecuzione non fatturate.xlsx`;
            saveAs(res,fileName );
            setShowLoading(false);
        }).catch(()=>{
            manageErrorDownload('404',dispatchMainState);
            setShowLoading(false);
        });
    };

  

    const headerGridKeys = ['Tipologia Fattura',"Stato", 'Importo Sospeso','Mese','Anno','Progressivo'];
   

    const  hiddenAnnullaFiltri = bodyRel.tipologiaFattura === null && bodyRel.idEnti?.length === 0 && bodyRel.caricata === null && bodyRel.idTipoContratto === null; 
    return (
        <MainBoxStyled title={"Documenti contabili"} actionButton={[]}>
            <ResponsiveGridContainer >
                <MainFilter 
                    filterName={"select_value_string"}
                    inputLabel={"Anno"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyRel}
                    body={bodyRel}
                    keyDescription={"anno"}
                    keyValue={"anno"}
                    keyBody={"anno"}
                    arrayValues={arrayYears}
                    extraCodeOnChange={(e)=>{
                        const value = Number(e);
                        setBodyRel((prev)=> ({...prev, ...{anno:value}}));
                        getMesi(value.toString());
                        getListTipologiaFatturaOnChangeMonthYear(bodyRel.mese,bodyRel.anno);
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_key_value"}
                    inputLabel={"Mese"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyRel}
                    body={bodyRel}
                    keyValue={"mese"}
                    keyDescription='descrizione'
                    keyBody={"mese"}
                    arrayValues={arrayMonths}
                    extraCodeOnChange={(e)=>{
                        const value = Number(e);
                        setBodyRel((prev)=> ({...prev, ...{mese:value}})); 
                        getListTipologiaFatturaOnChangeMonthYear(value,bodyRel.anno);            
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_value_string"}
                    inputLabel={"Tipologia Fattura"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyRel}
                    body={bodyRel}
                    keyDescription={"tipologiaFattura"}
                    keyValue={"tipologiaFattura"}
                    keyBody={"tipologiaFattura"}
                    arrayValues={tipologiaFatture}
                    extraCodeOnChange={(e)=>{
                        setBodyRel((prev)=> ({...prev, ...{tipologiaFattura:e}}));
                    }}
                ></MainFilter>
            </ResponsiveGridContainer>
            <FilterActionButtons 
                onButtonFiltra={onButtonFiltra} 
                onButtonAnnulla={onButtonAnnulla} 
                statusAnnulla={hiddenAnnullaFiltri ? "hidden":"show"} 
            ></FilterActionButtons>
            <ActionTopGrid
                actionButtonRight={[]}
                actionButtonLeft={[]}/>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
    Storno totale
                </Typography>
                <Typography variant="h6">
    € 1.234,56
                </Typography>
            </Paper>
           
            <GridCustom
                nameParameterApi='storico_documenti_contabili'
                elements={data}
                changePage={handleChangePage}
                changeRow={handleChangeRowsPerPage} 
                total={totalNotifiche}
                page={page}
                rows={rowsPerPage}
                headerNames={headerGridKeys}
                apiGet={setIdRel}
                disabled={getListaRelRunning}
                widthCustomSize="2000px"></GridCustom>
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
        </MainBoxStyled>
        
    );
};

export default DocStorico;
