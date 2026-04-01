import React, { useEffect, useState } from "react";
import { OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import { mesiGrid } from "../../reusableFunction/reusableArrayObj";
import { listaEntiNotifichePage } from "../../api/apiSelfcare/notificheSE/api";
import { PathPf } from "../../types/enum";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { manageError } from "../../api/api";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import { getAnniDocStoricoPagoPa, getFatturazioneRiepilogoPagoPa, getMesiDocStoricoPagoPa } from "../../api/apiPagoPa/fatturazionePA/api";



type DocumentiStorico =  {
    idTestata:number,
    tipologiaFattura:number|string,
    stato:string,
    importoSospeso:number|string,
    mese:string,
    anno:number,
    progressivo:number
}
type BodyDocumentiStorico =  {
    anno:number|null,
    mese:number|null,
    idEnti:OptionMultiselectChackbox[]
}
 

const DocStoricoSend : React.FC = () =>{

    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;


    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showLoading, setShowLoading] = useState(false);
    const [totalListEL, setTotalListEl]  = useState(0);
    const [dataSelectRagSoc, setDataSelectRagSoc] = useState([]);

    const [data, setData] = useState<DocumentiStorico[]>([]);
    const [gridDataPaginated, setGridDataPaginated] = useState<DocumentiStorico[]>([]);
    const [arrayYears,setArrayYears] = useState<number[]>([]);
    const [arrayMonths,setArrayMonths] = useState<number[]>([]);
    const [getListaRelRunning, setGetListaRelRunning] = useState(false);

    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [firstYearMonth, setFirstYearMonth] = useState<number[]>([]);

    const [bodyDownload, setBodyDownload] = useState<BodyDocumentiStorico>({
        anno:null,
        mese:null,
        idEnti:[]
    });
    const [bodyStorico, setBodyStorico] = useState<BodyDocumentiStorico>({
        anno:null,
        mese:null,
        idEnti:[]
    });
    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.LISTA_STORICO_DOCUMENTI_SEND,{});


    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){
                listaEntiNotifichePageOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);

    useEffect(()=>{
        getAnni();
    },[]);
  
    const getAnni = async() => {
        setGetListaRelRunning(true);
        await getAnniDocStoricoPagoPa(token, profilo.nonce).then((res)=>{
           
            const arrayNumber = res.data.map(el => Number(el.toString()));
            if(arrayNumber.length > 0 && isInitialRender.current){
                setFirstYearMonth((prev) => ([...prev,arrayNumber[0]]));
            }
            setArrayYears(arrayNumber);
            if(isInitialRender.current && Object.keys(filters).length > 0){
                getMesi(filters.body.anno?.toString());
            }else{
                setBodyStorico((prev)=> ({...prev,...{anno:Number(res.data[0])}}));
                setBodyDownload((prev)=> ({...prev,...{anno:Number(res.data[0])}}));
                getMesi(res.data[0]);
                    
            }
        }).catch((err)=>{
            setArrayYears([]);
            setGetListaRelRunning(false);
            manageError(err,dispatchMainState);
        });
        
       
    };

    const getMesi = async(year) =>{
        if(!isInitialRender.current){
            setGetListaRelRunning(true);
        }
        
        await getMesiDocStoricoPagoPa(token, profilo.nonce,{anno:year}).then((res)=>{
            const mesiCamelCase = res.data.map(el => {
                el.descrizione = el?.descrizione.charAt(0).toUpperCase() + el.descrizione.slice(1).toLowerCase();
                return el;
            });
            if(mesiCamelCase.length > 0 && isInitialRender.current){
                setFirstYearMonth((prev) => ([...prev,Number(mesiCamelCase[0].mese)]));
            }
                
            setArrayMonths(mesiCamelCase.map(el => el.mese));
            if(isInitialRender.current && Object.keys(filters).length > 0){
                setTextValue(filters.textValue);
                setValueAutocomplete(filters.valueAutocomplete);
                   
                setPage(filters.page);
                setRowsPerPage(filters.rows);
                setBodyDownload(filters.body);
               
                setBodyStorico(filters.body);
                getlista({anno:filters.body.anno,mese:filters.body.mese,idEnti:filters.body.idEnti});
            }else if(isInitialRender.current){
                setBodyStorico((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                setBodyDownload((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                getlista({anno:year,mese:mesiCamelCase[0].mese,idEnti:[]});
                    
            }else{
                setBodyStorico((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                setBodyDownload((prev)=> ({...prev,...{mese:mesiCamelCase[0].mese}}));
                setGetListaRelRunning(false);
            }
        }).catch((err)=>{
            setArrayMonths([]);
            setBodyStorico((prev)=> ({...prev,...{mese:0}}));
            setBodyDownload((prev)=> ({...prev,...{mese:0}}));
            setGetListaRelRunning(false);
            manageError(err,dispatchMainState);
        });
       
    };

    const getlista = async (body,isCalledOnFiltraButton=false) => {
        if(isCalledOnFiltraButton){
            setGetListaRelRunning(true);
        }
        
      
        await  getFatturazioneRiepilogoPagoPa(token,profilo.nonce,body)
            .then((res)=>{
                // ordino i dati in base all'header della grid
                const orderDataCustom = res.data.map((obj:any)=>{
                    // inserire come prima chiave l'id se non si vuol renderlo visibile nella grid
                    // 'id serve per la chiamata get dettaglio dell'elemento selezionato nella grid
                    return {
                        id:Math.random(),
                        ragioneSociale:obj.ragioneSociale,
                        anno:obj.annoRiferimento,
                        mese:mesiGrid[obj.meseRiferimento],
                        tipologiaContratto:obj.tipologiaContratto || "--",
                        anticipo:obj.anticipo ? obj.anticipo.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) : "--",
                        anticipoSospeso:obj.anticipoSospeso ? "Si":"No",
                        acconto:obj.acconto ? obj.acconto.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) : "--",
                        accontoSospeso:obj.accontoSospeso ? "Si":"No",
                        primoSaldo:obj.primoSaldo ? obj.primoSaldo.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) : "--",
                        primoSaldoSospeso:obj.primoSaldoSospeso ?  "Si":"No",
                        secondoSaldo:obj.secondoSaldo ? obj.secondoSaldo.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) : "--",
                        secondoSaldoSospeso:obj.secondoSaldoSospeso  ? "Si":"No"
                    };
                });
            
                setTotalListEl(res.data.length);
                //setStorno(mockRes.importoSospeso.toLocaleString("de-DE", { style: "currency", currency: "EUR" }));
                setData(orderDataCustom);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    getElementPaginated(orderDataCustom,filters.page,filters.rows);
                }else{
                    getElementPaginated(orderDataCustom,0,10);
                }
                
                //setTotalNotifiche(res.data.count);
                setGetListaRelRunning(false);
            }).catch((error)=>{
                if(error?.response?.status === 404){
                    setData([]);
                    setGridDataPaginated([]);
                    setTotalListEl(0);
                }
                setGetListaRelRunning(false);
                manageError(error, dispatchMainState);
            });
    
        isInitialRender.current = false;       
    };

    const getElementPaginated = (orderDataCustom, page, rowsPerPage) => {
        const start = page * rowsPerPage;
        const end = start + rowsPerPage;
     
        const elementsToShow = orderDataCustom.slice(start, end);
    
        setGridDataPaginated(elementsToShow);
    };

    // servizio che popola la select con la checkbox
    const listaEntiNotifichePageOnSelect = async () =>{
        await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue} ).then((res)=>{
            setDataSelectRagSoc(res.data);
        }).catch(((err)=>{
            manageError(err,dispatchMainState);
        }));
    };

    const clearOnChangeFilter = () => {
        setData([]);
        setGridDataPaginated([])
        setTotalListEl(0);
        setPage(0);
        setRowsPerPage(10); 
    };

    const onButtonFiltra = () =>{
        updateFilters({
            pathPage:PathPf.LISTA_STORICO_DOCUMENTI_SEND,
            body:bodyStorico,
            textValue,
            valueAutocomplete:valueAutocomplete,
            page:0,
            rows:10
        });
        setPage(0);
        setRowsPerPage(10);
        setBodyDownload(bodyStorico);
        getlista(bodyStorico,true); 
    };

    const onButtonAnnulla = async () => {
        getElementPaginated(data,0,10);
        resetFilters();
        setPage(0);
        setRowsPerPage(10);
        setValueAutocomplete([]);
        setBodyStorico({
            anno:arrayYears[0],
            mese:firstYearMonth[1],
            idEnti:[]
        });
        getlista({
            anno:arrayYears[0],
            mese:firstYearMonth[1],
            idEnti:[]
        },true);

    };

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
 
        setPage(newPage);
        getElementPaginated(data,newPage,10);
        updateFilters({
            pathPage: PathPf.LISTA_STORICO_DOCUMENTI_SEND,
            body: bodyStorico,
            page: newPage,
            rows: rowsPerPage,
            textValue,
            valueAutocomplete:valueAutocomplete
        });
      
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        getElementPaginated(data,0,parseInt(event.target.value, 10));

        updateFilters({
            pathPage: PathPf.LISTA_STORICO_DOCUMENTI_SEND,
            body: bodyStorico,
            page: page,
            rows: parseInt(event.target.value, 10),
            textValue,
            valueAutocomplete:valueAutocomplete,
           
        });
     
    };

 

    const headerGridKeys = ["Ragione Sociale",'Anno','Mese','T. Contratto','Anticipo', 'Anticipo Sospeso','Acconto','Acconto Sospeso','Primo Saldo','Primo Saldo Sospeso',"Secondo Saldo", 'Secondo Saldo Sospeso'];
   
    const  hiddenAnnullaFiltri = bodyStorico.idEnti?.length !== 0 ||
    Number(bodyStorico.anno) !== firstYearMonth[0] ||
    Number(bodyStorico.mese) !== firstYearMonth[1]; 

 

    return (
        <MainBoxStyled title={"Storico Documenti contabili"} actionButton={[]}>
            <ResponsiveGridContainer >
                <MainFilter 
                    filterName={"select_value_string"}
                    inputLabel={"Anno"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyStorico}
                    body={bodyStorico}
                    keyDescription={"anno"}
                    keyValue={"anno"}
                    keyBody={"anno"}
                    arrayValues={arrayYears}
                    extraCodeOnChange={(e)=>{
                        const value = Number(e);
                        setBodyStorico((prev)=> ({...prev, ...{anno:value}}));
                        getMesi(value.toString());
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_mese_with_tutti"}
                    inputLabel={"Mese"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyStorico}
                    body={bodyStorico}
                    keyValue={"mese"}
                    keyDescription='mese'
                    keyBody={"mese"}
                    arrayValues={arrayMonths}
                    extraCodeOnChange={(e)=>{
                        const value = Number(e);
                        if(value === 9999){
                            setBodyStorico((prev)=> ({...prev, ...{mese:null}})); 
                        }else{
                            setBodyStorico((prev)=> ({...prev, ...{mese:value}})); 
                        }
                          
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Rag. Soc. Ente"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyStorico}
                    body={bodyStorico}
                    dataSelect={dataSelectRagSoc}
                    setTextValue={setTextValue}
                    textValue={textValue}
                    valueAutocomplete={valueAutocomplete}
                    setValueAutocomplete={setValueAutocomplete}
                    keyDescription={"descrizione"}
                    keyValue={"idEnte"}
                    keyBody={"idEnti"}
                ></MainFilter>
            </ResponsiveGridContainer>
            <FilterActionButtons 
                onButtonFiltra={onButtonFiltra} 
                onButtonAnnulla={onButtonAnnulla} 
                statusAnnulla={!hiddenAnnullaFiltri ? "hidden":"show"} 
            ></FilterActionButtons>
            <ActionTopGrid
                actionButtonRight={[]}
                actionButtonLeft={[]}/>
            <GridCustom
                nameParameterApi='storico_documenti_contabili'
                elements={gridDataPaginated}
                changePage={handleChangePage}
                changeRow={handleChangeRowsPerPage} 
                total={totalListEL}
                page={page}
                rows={rowsPerPage}
                headerNames={headerGridKeys}
                disabled={getListaRelRunning}
                widthCustomSize="2000px"
                sentenseEmpty={"Non sono presenti documenti contabili"}
                />
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
        </MainBoxStyled>
        
    );
};

export default DocStoricoSend;
