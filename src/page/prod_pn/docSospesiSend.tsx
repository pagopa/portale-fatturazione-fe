import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { PathPf } from "../../types/enum";
import { saveAs } from "file-saver";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import { manageError} from "../../api/api";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import { ManageErrorResponse } from "../../types/typesGeneral";
import { month } from "../../reusableFunction/reusableArrayObj";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import { headersDocumentiSospesiiSend, headersDocumentiSospesiSendCollapse } from "../../assets/configurations/conf_GridDocSospesiSend";
import { downloadFattureSospesePagopa, getAnniDocSospesiPagoPa, getFatturazioneSospesePagoPa, getMesiDocSospesiPagoPa, getTipologieFaSospesePagoPa, getTipologieFaSospesePagoPaWithData, getTipologieSospeseContratto } from "../../api/apiPagoPa/fatturazionePA/api";
import { listaEntiNotifichePage } from "../../api/apiSelfcare/notificheSE/api";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";


export interface BodyFatturazioneSospeseSend{
    anno:number|null,
    mese:number|null,
    tipologiaFattura:string[],
    idEnti:string[],
    cancellata:boolean,
    idTipoContratto:null|number,
    inviata:null|number
}

export type Fattura = {
    ragioneSociale: string;
    dataFattura: string;
    stato:string;
    tipoDocumento:string;
    totale: number;
    numero: number;
    idfattura: number;
    prodotto: string;
    identificativo: string;
    istitutioId: number;
    tipocontratto: "PAL" | string;
    divisa: "EUR" | string;
    causale: string;
    split: boolean;
    inviata: number;
    posizioni: Posizione[];
    datiGeneraliDocumento:any[],
    metodoPagamento:any,
    idFattura:number, 
};

export type Posizione = {
    numeroLinea: number;
    testo: string;
    codiceMateriale: string;
    quantita: number;
    prezzoUnitario: number;
    imponibile: number;
    periodoRiferimento: string; // MM/YYYY
};



const DocSospesiSend : React.FC = () =>{
    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
 
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;


    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.DOCUMENTI_SOSPESI_SEND,{});

    const callLista = useRef(true);
    const callAnnulla = useRef(false);

    const [firstYearMonth, setFirstYearMonth] = useState<number[]>([]);
    const [arrayYears,setArrayYears] = useState<number[]>([]);
    const [arrayMonths,setArrayMonths] = useState<{mese:string,descrizione:string}[]>([]);
    const [tipologie, setTipologie] = useState<string[]>([]);
    const [valueMulitselectTipologie, setValueMultiselectTipologie] = useState<string[]>([]);
    const [dateTipologie, setDateTipologie] = useState<string[]>([]);
    const [valueMulitselectDateTipologie, setValueMultiselectDateTipologie] = useState<string[]>([]);
    const [arrayContratti, setArrayContratto] = useState<{id:number,descrizione:string}[]>([{id:3,descrizione:"Tutti"}]);
  
    //__________________________________________________
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [dataSelectRagSoc, setDataSelectRagSoc] = useState<ElementMultiSelect[]>([]);
    const [listaResponse, setListaResponse] = useState<Fattura[]>([]);
   


    const [showLoadingGrid,setShowLoadingGrid] = useState(false);
    const [showDownloading,setShowDownloading] = useState(false);
    const [gridData, setGridData] = useState<Fattura[]>([]);
    const [totalDocumenti, setTotalDocumenti]  = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
   
   
    const [bodyFatturazione, setBodyFatturazione] = useState<BodyFatturazioneSospeseSend>({
        anno:null,
        mese:null,
        tipologiaFattura:[],
        idEnti:[],
        cancellata:false,
        idTipoContratto:null,
        inviata:null
    });

    const [bodyFatturazioneDownload, setBodyFatturazioneDownload] = useState<BodyFatturazioneSospeseSend>({
        anno:null,
        mese:null,
        tipologiaFattura:[],
        idEnti:[],
        cancellata:false,
        idTipoContratto:null,
        inviata:null
    });


    useEffect(()=>{
        getContratti(); 
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

    const getAnni = async() => {
        setShowLoadingGrid(true);
        await getAnniDocSospesiPagoPa(token, profilo.nonce).then((res)=>{
            const arrayNumber = res.data.map(el => Number(el.toString()));
            if(arrayNumber.length > 0 && isInitialRender.current){
                setFirstYearMonth((prev) => ([...prev,arrayNumber[0]]));
            }
           
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

    const getMesi = async(year) =>{
        await getMesiDocSospesiPagoPa(token, profilo.nonce,{anno:year}).then((res)=>{    
            const mesiCamelCase = res.data.map(el => {
                el.descrizione = el?.descrizione.charAt(0).toUpperCase() + el.descrizione.slice(1).toLowerCase();
                return el;
            });
          
            if(mesiCamelCase.length > 0 && isInitialRender.current){
                setFirstYearMonth((prev) => ([...prev,Number(mesiCamelCase[0].mese)]));
            }
            setArrayMonths(mesiCamelCase);
            if(isInitialRender.current && Object.keys(filters).length > 0){
            
                setBodyFatturazione(filters.body);
                setBodyFatturazioneDownload(filters.body);
                setValueAutocomplete(filters.valueAutocomplete);             
                setTextValue(filters.textValue);
              
                getlistaFatturazione(filters.body);
            }else{
                setBodyFatturazione({anno:Number(year),mese:mesiCamelCase[0].mese, tipologiaFattura:[],cancellata:false,idEnti:[],idTipoContratto:null,inviata:null});
                
                getDateTipologieFatturazione({...bodyFatturazione,...{anno:Number(year),mese:mesiCamelCase[0].mese, tipologiaFattura:[],cancellata:false,idEnti:[],idTipoContratto:null}});
                getTipologieFatturazione(Number(year),Number(mesiCamelCase[0]?.mese),false);
            
                if(callLista.current || callAnnulla.current){
                    getlistaFatturazione({...bodyFatturazione,...{anno:Number(year),mese:mesiCamelCase[0].mese, tipologiaFattura:[],cancellata:false,idEnti:[],idTipoContratto:null}});
                }else{
                    setShowLoadingGrid(false);
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
        await getTipologieFaSospesePagoPa(token, profilo.nonce, {anno:anno,mese:mese,cancellata:cancellata}  )
            .then((res)=>{
                setTipologie(res.data);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    setValueMultiselectTipologie(filters.valueMulitselectTipologie);
                    setShowLoadingGrid(false);
                }else{

                    setValueMultiselectTipologie([]);
                }
            }).catch((()=>{
                setValueMultiselectTipologie([]);
                setTipologie([]);
            }));
        isInitialRender.current = false;
    };

    const getDateTipologieFatturazione =  async(body) => {
        await getTipologieFaSospesePagoPaWithData(token, profilo.nonce, body)
            .then((res)=>{
                const result = res.data.map((el)=>{
                    return el.tipologiaFattura+"-"+el.dataFattura?.split("T")[0];
                });
                setDateTipologie(result);
                
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    setValueMultiselectDateTipologie(filters.valueMulitselectDateTipologie);
                    getTipologieFatturazione(filters.body.anno, filters.body.mese, filters.body.cancellata);
                }else{
                    setValueMultiselectDateTipologie([]);
                }
            }).catch((()=>{
                setDateTipologie([]);
                setValueMultiselectDateTipologie([]);
            }));
    };

    const getContratti = async() => {
        await getTipologieSospeseContratto(token, profilo.nonce).then((res)=>{
            setArrayContratto([{id:3,descrizione:"Tutti"}, ...res.data]);
        }).catch(()=>{
            setArrayContratto([]);
        });
    };

    const listaEntiNotifichePageOnSelect = async () =>{
        await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue}).then((res)=>{
            setDataSelectRagSoc(res.data);
        }).catch(((err)=>{
            manageError(err,dispatchMainState);
        }));
    };
           
    const getlistaFatturazione = async (body,isCalledOnFiltraButton=false) => {
        if(isCalledOnFiltraButton){
            setShowLoadingGrid(true);
        }
        try {
            const res = await getFatturazioneSospesePagoPa(token,profilo.nonce,body);
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
            
            const orderDataCustom = data.map((obj, index) => ({
                idFattura:obj.idfattura,
                id: obj.identificativo ?? index,
                arrow: '',
                ragioneSociale: obj.ragionesociale || '--',
                dataFattura: obj.dataFattura
                    ?  new Date(obj.dataFattura).toLocaleDateString('it-IT')
                    : '--',
                stato: 'Sospesa',
                tipologiaFattura: obj.tipologiaFattura || "--",
                identificativo: obj.identificativo,
                tipocontratto: obj.tipocontratto === 'PAL'
                    ? 'PAC - PAL senza requisiti'
                    : 'PAC - PAL con requisiti',
                totale: obj.totale.toLocaleString('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                }),
                numero: obj.numero,
                tipoDocumento: obj.tipoDocumento,
                divisa: obj.divisa,
                metodoPagamento: obj.metodoPagamento,
                split: obj.split ? 'Si' : 'No',
                posizioni: obj.posizioni.map(el => ({
                    numerolinea: el.numerolinea,
                    codiceMateriale: el.codiceMateriale,
                    imponibile:el.imponibile.toLocaleString("de-DE", { style: "currency", currency: "EUR" })  || '--',
                    periodoRiferimento: el.periodoRiferimento || '--', 
                    periodoFatturazione:el.periodoFatturazione || '--',//new Date(obj.dataFattura).toLocaleDateString('it-IT')
                })),
            }));
            let dataToShow = [];
            if(isInitialRender.current && Object.keys(filters).length > 0 ){
                getDateTipologieFatturazione(filters.body);
                const start = filters.page * filters.rows;
                const end = start + filters.rows;
                dataToShow = orderDataCustom.slice(start, end);
            }else{
                isInitialRender.current = false;
                dataToShow = orderDataCustom.slice(0, 10);
                setShowLoadingGrid(false);
            }
          
       
            setGridData(dataToShow);
            setListaResponse(orderDataCustom);
            setTotalDocumenti(res.data.length);
            //setBodyFatturazione(body);
            setBodyFatturazioneDownload(body);
            
            callLista.current = false;
           
                        
        } catch (err) {
            if (err && typeof err === "object") {
                manageError(err as ManageErrorResponse, dispatchMainState);
            } else {
                // fallback for unexpected errors
                manageError({ message: String(err) } as ManageErrorResponse, dispatchMainState);
            }
            setGridData([]);
            setListaResponse([]);
            setShowLoadingGrid(false);
        }finally{
            if(isCalledOnFiltraButton){
                setShowLoadingGrid(false);
            }
        }
    };

    const downloadListaFatturazione = async () => {
        setShowDownloading(true);
        await downloadFattureSospesePagopa(token,profilo.nonce, bodyFatturazioneDownload).then(response => response.blob()).then((response)=>{
            let title = `Documenti sospesi.xlsx`;
            if(bodyFatturazioneDownload.anno !== null && bodyFatturazioneDownload.mese === null){
                title = `Documenti sospesi/${bodyFatturazioneDownload.anno}.xlsx`;
            }else if(bodyFatturazioneDownload.mese !== null && bodyFatturazioneDownload.anno !== null){
                title = `Documenti sospesi/${month[bodyFatturazioneDownload.mese - 1]}/${bodyFatturazioneDownload.anno}.xlsx`;
            }
            saveAs(response,title);
            setShowDownloading(false);
        }).catch(((err)=>{
            setShowDownloading(false);
            manageError(err,dispatchMainState);
        }));
    };

    const clearOnChangeFilter = () => {
        setGridData([]);
        setPage(0);
        setRowsPerPage(10); 
    
    };

    const onButtonFiltra = () => {
        callLista.current = true;
        updateFilters({
            pathPage:PathPf.DOCUMENTI_SOSPESI_SEND,
            body:bodyFatturazione,
            textValue:textValue,
            valueAutocomplete,
            valueMulitselectTipologie:valueMulitselectTipologie,
            valueMulitselectDateTipologie:valueMulitselectDateTipologie,
            page:page,
            rows:rowsPerPage
        });
        getlistaFatturazione(bodyFatturazione,true);
        
    };
    
    const onButtonAnnulla = () => {
        callAnnulla.current = true;
        getAnni();
        resetFilters();
        setDataSelectRagSoc([]);
        setValueMultiselectTipologie([]);
        setValueAutocomplete([]);
        setValueMultiselectDateTipologie([]);
    };

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
            
        const start = newPage * rowsPerPage;
        const end = start + rowsPerPage;
         
        const elementsToShow = listaResponse.slice(start, end);
        setGridData(elementsToShow);
    
        updateFilters({
            pathPage: PathPf.DOCUMENTI_SOSPESI_SEND,
            body: bodyFatturazioneDownload,
            page: newPage,
            rows: rowsPerPage,
            textValue:textValue,
            valueAutocomplete,
            valueMulitselectTipologie:valueMulitselectTipologie,
            valueMulitselectDateTipologie:valueMulitselectDateTipologie,
        
        });
    };
                            
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const newRows = parseInt(event.target.value, 10);
    
        setRowsPerPage(newRows);
        setPage(0);
    
        const elementsToShow = listaResponse.slice(0, newRows);
        setGridData(elementsToShow);
        updateFilters({
            pathPage: PathPf.DOCUMENTI_SOSPESI_SEND,
            body: bodyFatturazioneDownload,
            page: page,
            rows: newRows,
            textValue:textValue,
            valueAutocomplete,
            valueMulitselectTipologie:valueMulitselectTipologie,
            valueMulitselectDateTipologie:valueMulitselectDateTipologie,
       
        });
    };

   

    const statusAnnulla = ( 
        bodyFatturazione.anno !== firstYearMonth[0] ||
        Number(bodyFatturazione.mese) !== firstYearMonth[1] ||
        bodyFatturazione.idEnti.length > 0||
        bodyFatturazione.idTipoContratto !== null||
        valueMulitselectDateTipologie.length > 0 ||
        bodyFatturazione.tipologiaFattura.length !== 0 ) ? false :true;
 
    return (
        <MainBoxStyled title={"Documenti contabili sospesi"} actionButton={[]}> 
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
                        setDataSelectRagSoc([]);
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
                        getDateTipologieFatturazione({...bodyFatturazione,...{mese:value}});
                                  
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Tipologia Fattura"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    dataSelect={tipologie}
                    valueAutocomplete={valueMulitselectTipologie}
                    setValueAutocomplete={setValueMultiselectTipologie}
                    body={bodyFatturazione}
                    keyDescription={"tipologiaFattura"}
                    keyValue={"tipologiaFattura"}
                    keyBody={"tipologiaFattura"}
                    extraCodeOnChangeArray={(e)=>{
                        setValueMultiselectTipologie(e);
                        setValueMultiselectDateTipologie([]);
                        setBodyFatturazione((prev) => ({...prev,...{tipologiaFattura:e}}));
                        getDateTipologieFatturazione({...bodyFatturazione,...{tipologiaFattura:e}});
                    }}
                    iconMaterial={RenderIcon("invoice",true)}
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
                    keyValue={"dataFattura"}
                    keyBody={"dataFattura"}
                    extraCodeOnChangeArray={(e)=>{
                        setValueMultiselectDateTipologie(e);
                     
                    }}
                    iconMaterial={RenderIcon("date",true)}
                    disabled={false}
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
                    filterName={"multi_checkbox"}
                    inputLabel={"Rag. Soc. Ente"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    body={bodyFatturazione}
                    dataSelect={dataSelectRagSoc}
                    setTextValue={setTextValue}
                    textValue={textValue}
                    valueAutocomplete={valueAutocomplete}
                    setValueAutocomplete={setValueAutocomplete}
                    extraCodeOnChangeArray={(e)=>{
                        setValueAutocomplete(e);
                        const arrayId = e.map(el => el.idEnte);
                        getDateTipologieFatturazione({...bodyFatturazione,...{idEnti:arrayId}});
                        
                        setBodyFatturazione((prev)=> ({...prev, ...{idEnti:arrayId}}));
                    }}
                    keyDescription={"descrizione"}
                    keyValue={"idEnte"}
                    keyBody={"idEnti"}
                ></MainFilter>

            </ResponsiveGridContainer>
            <FilterActionButtons 
                onButtonFiltra={onButtonFiltra} 
                onButtonAnnulla={onButtonAnnulla} 
                statusAnnulla={statusAnnulla ? "hidden":"show"} 
            ></FilterActionButtons>
            <ActionTopGrid
                actionButtonRight={[{
                    onButtonClick:downloadListaFatturazione,
                    variant: "outlined",
                    label: "Download risultati",
                    icon:{name:"download"},
                    disabled:(gridData.length === 0)
                }]}
                actionButtonLeft={[]}/>
            <GridCustom
                nameParameterApi='docSospesiSend'
                elements={gridData}
                changePage={handleChangePage}
                changeRow={handleChangeRowsPerPage} 
                total={totalDocumenti}
                page={page}
                rows={rowsPerPage}
                headerNames={headersDocumentiSospesiiSend}
                headerNamesCollapse={headersDocumentiSospesiSendCollapse}
                disabled={showLoadingGrid}
                widthCustomSize="2000px"
                setGridData={setGridData}
                gridType={true}
                listaResponse={listaResponse}
                sentenseEmpty={"Non sono presenti fatture sospese"}
            ></GridCustom>
           
          
            <ModalLoading 
                open={showDownloading} 
                setOpen={setShowDownloading} 
                sentence={'Downloading...'}>
            </ModalLoading>
            <ModalLoading 
                open={showLoadingGrid} 
                setOpen={setShowLoadingGrid} 
                sentence={'Loading...'}>
            </ModalLoading>
        </MainBoxStyled>
    );
};

export default DocSospesiSend;
