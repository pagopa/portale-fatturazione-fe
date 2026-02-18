import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PathPf } from "../../types/enum";
import { saveAs } from "file-saver";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import ModalRedirect from "../../components/commessaInserimento/madalRedirect";
import { manageError} from "../../api/api";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { ManageErrorResponse } from "../../types/typesGeneral";
import { month } from "../../reusableFunction/reusableArrayObj";
import { headersDocumentiEmessiEnte, headersDocumentiEmessiEnteCollapse } from "../../assets/configurations/conf_GridDocEmessiEnte";
import {  downloadFattureSospeseEnte, getListaDocumentiSospesi, getPeriodoSospeso } from "../../api/apiSelfcare/documentiSospesiSE/api";
import { sortByNumeroFattura, sortByTipoFattura, sortByTotale, sortDates, sortMonthYear } from "../../reusableFunction/function";

export type BodyDocumentiEmessiEnte = {
    anno:number
    mese:number,
    tipologiaFattura:string[],
    dataFattura:string[]
}

export type Fattura = {
    dataFattura: string;
    stato:string;
    tipoDocumento:string;
    totale: number;
    numero: number;
    idfattura: number;
    prodotto: string;
    identificativo: string;
    istitutioId: string;
    tipocontratto: "PAL" | string;
    divisa: "EUR" | string;
    causale: string;
    split: boolean;
    inviata: number;
    posizioni: Posizione[];
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

 type ResponsePeriodo = {
     anno: number,
     tipologiaFattura: string,
     dataFattura: string,
     mese: number
 }


const DocSos : React.FC = () =>{
    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
    const navigate = useNavigate();
 
    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;


    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.DOCUMENTI_SOSPESI,{});


    //______________________NEW_________________
    const [listaResponse, setListaResponse] = useState<Fattura[]>([]);
    //const [responseByAnno, setResponseByAnno] = useState<{anno:{ mese:number[],tipologiaFattura:string[],dataFattura:string[]}[]}>();
    const [years,setYears] = useState<number[]>([]);
    const [arraymonths,setArrayMonths] = useState<number[]>([]);
    const [arrayDataFattura,setArrayDataFattura] = useState<string[]>([]);
    const [arrayDataFatturaFiltered,setArrayDataFatturaFiltered] = useState<string[]>([]);
   
    const [dataSelect, setDataSelect] = useState<string[]>([]);
    const [showLoadingGrid,setShowLoadingGrid] = useState(true);
    const [showDownloading,setShowDownloading] = useState(false);
    const [gridData, setGridData] = useState<Fattura[]>([]);
    const [gridDataNoSorted, setGridDataNoSorted] = useState<Fattura[]>([]);
    const [totalDocumenti, setTotalDocumenti]  = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totaleHeader, setTotaleHeader] = useState(0);

    const [valueMulitselectDate, setValueMultiselectDate] = useState<string[]>([]);
    const [valueMulitselectTipologie, setValueMultiselectTipologie] = useState<string[]>([]);

    const [globalResponse, setGlobalResponse] = useState<ResponsePeriodo[]>([]);

    const [objectSort, setObjectSort] = useState<{[key:string]:number}>({"Data Fattura":1,"Ident.":1,"Tot.":1,"N. Fattura":1,"Tipo Documento":1});
    //____________________________________

    const [openModalRedirect, setOpenModalRedirect] = useState(false);

    const [bodyFatturazione, setBodyFatturazione] = useState<BodyDocumentiEmessiEnte>({
        anno:9999,
        mese:9999,
        tipologiaFattura:[],
        dataFattura:[]
    });

    const [bodyFatturazioneDownload, setBodyFatturazioneDownload] = useState<BodyDocumentiEmessiEnte>({
        anno:9999,
        mese:9999,
        tipologiaFattura:[],
        dataFattura:[]
    });

    useEffect(()=>{
        if(mainState.datiFatturazione === false || mainState.datiFatturazioneNotCompleted){
            setOpenModalRedirect(true);
        }else{
            getDataFilter();
        }
    },[]);

    const getDataFilter = async() => {
        setShowLoadingGrid(true);
        try{
            const res = await getPeriodoSospeso(token, profilo.nonce);
            setGlobalResponse(res.data);
           
            const yearsArray:number[] = Array.from( new Set(res.data.map(el => el.anno)));
            const allMonths:number[] = Array.from( new Set(res.data.map(el => el.mese)));//da eliminare
            const allTipologie:string[] = Array.from( new Set(res.data.map(el => el.tipologiaFattura)));
            const dataFattura:string[] = Array.from( new Set(res.data.map(el => `${el.dataFattura}-${el.tipologiaFattura}`)));//da eliminare
            //setResponseByAnno(result);
            setYears(yearsArray);
            if(isInitialRender.current && Object.keys(filters)?.length > 0){
                console.log(1);
                if(filters.body.anno !== 9999){
                    console.log(2);
                    const arrayMonths:number[] = Array.from( new Set(res.data
                        .filter(el =>
                            el.anno === Number(filters.body.anno))
                        .map(el => el.mese)));
                    console.log(arrayMonths,{RR:res.data});
                    setArrayMonths(arrayMonths);

                    const arrayTipogie:string[] = Array.from( new Set(res.data
                        .filter(el =>
                            el.anno === Number(filters.body.anno))
                        .map(el => el.tipologiaFattura)));
                    console.log({arrayTipogie,bb:filters.body.tipologiaFattura,filters});
                    setDataSelect(arrayTipogie);
                    if(filters.body?.tipologiaFattura?.length > 0){
                        setValueMultiselectTipologie(filters.body.tipologiaFattura);
                    }
                    
             
                    if(filters?.body?.tipologiaFattura?.length > 0 && filters?.body?.mese === 9999){
                        console.log(4);
                        const arrayDataFattura:string[] = Array.from( new Set(res.data.filter(el =>
                            el.anno === Number(filters?.body?.anno) &&  filters?.body?.tipologiaFattura.includes(el.tipologiaFattura) )
                            .map(el => el.dataFattura)));
                        console.log(arrayDataFattura);
                        setArrayDataFatturaFiltered(arrayDataFattura);
                        if(filters?.body?.dataFattura?.length > 0){
                            console.log(5);
                            setValueMultiselectDate(filters.body.dataFattura);
                        }

                    }

                    console.log(6);
                    setBodyFatturazione(filters.body);
                    setBodyFatturazioneDownload(filters.body);
                    getlistaFatturazione(filters.body);
                 
                }else{
                    if( filters?.body?.tipologiaFattura?.length > 0 && filters.body.anno === 9999){

                        const arrayTipogie:string[] = Array.from( new Set(res.data.map(el => el.tipologiaFattura)));
                  
                        setDataSelect(arrayTipogie);
                        setValueMultiselectTipologie(filters?.body?.tipologiaFattura);
                    }
                   
                
              
                    setDataSelect(allTipologie);
                    console.log(7);
                    setBodyFatturazione(filters.body);
                    setBodyFatturazioneDownload(filters.body);
                    getlistaFatturazione(filters.body);
                }
                
            }else{
               
                setArrayMonths(allMonths);
                setDataSelect(allTipologie); 
                setArrayDataFattura(dataFattura);
                setShowLoadingGrid(false);
                getlistaFatturazione(bodyFatturazione);
            }
            
        }catch(err) {
            if (err && typeof err === "object") {
                manageError(err as ManageErrorResponse, dispatchMainState);
            } else {
                // fallback for unexpected errors
                manageError({ message: String(err) } as ManageErrorResponse, dispatchMainState);
            }
            setShowLoadingGrid(false);
        }

    };


    const getlistaFatturazione = async (body,isCalledOnFiltraButton=false) => {
        if(isCalledOnFiltraButton){
            setShowLoadingGrid(true);
        }
        try {
            const res = await getListaDocumentiSospesi(token,profilo.nonce,body);
            const totaleSum = res.data.importoSospeso;
    
            const getObjectFattura = res.data.dettagli.map(el => el.fattura);
            const orderDataCustom = getObjectFattura.map((obj, index) => ({
                idFattura:obj.idfattura,
                id: obj.identificativo ?? index,
                arrow: '',
                dataFattura: obj.dataFattura
                    ?  new Date(obj.dataFattura).toLocaleDateString('en-CA')
                    : '--',
                stato: 'Sospesa',
                tipologiaFattura: obj.datiGeneraliDocumento[0].tipologia || "--",
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
                arrowDetails: 'arrowDetails',
                posizioni: obj.posizioni.map(el => ({
                    numerolinea: el.numeroLinea,
                    codiceMateriale: el.codiceMateriale,
                    imponibile:el.imponibile.toLocaleString("de-DE", { style: "currency", currency: "EUR" })  || '--',
                    periodoRiferimento: obj.dataFattura
                        ? new Date(obj.dataFattura).toLocaleDateString('it-IT')
                        : '--', 
                    periodoFatturazione:el.periodoRiferimento || '--',
                })),
            }));
            if(isInitialRender.current && Object.keys(filters)?.length > 0 && (filters.page !== 0 || filters.rows !== 10) ){
                const start = filters.page * filters.rows;
                const end = start + filters.rows;
     
                const elementsToShow = orderDataCustom.slice(start, end);
                setGridData(elementsToShow);
                setGridDataNoSorted(elementsToShow);
                setPage(filters.page);
                setRowsPerPage(filters.rows);

            }else{
                const dataToShow = orderDataCustom.slice(0, 10);
                setGridData(dataToShow);
                setGridDataNoSorted(dataToShow);
               
            }
            setListaResponse(orderDataCustom);
            setTotalDocumenti(res.data.dettagli.length);
            setTotaleHeader(totaleSum);
            setBodyFatturazioneDownload(bodyFatturazione);
            isInitialRender.current = false;
            setShowLoadingGrid(false);
            
        } catch (err) {
            isInitialRender.current = false;
            if (err && typeof err === "object") {
                manageError(err as ManageErrorResponse, dispatchMainState);
            } else {
                // fallback for unexpected errors
                manageError({ message: String(err) } as ManageErrorResponse, dispatchMainState);
            }
            setGridData([]);
            setGridDataNoSorted([]);
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
        await downloadFattureSospeseEnte(token,profilo.nonce, bodyFatturazioneDownload).then(response => response.blob()).then((response)=>{
            let title = `Documenti sospesi.xlsx`;
            if(bodyFatturazioneDownload.anno !== 9999 && bodyFatturazioneDownload.mese === 9999){
                title = `Documenti sospesi/${bodyFatturazioneDownload.anno}.xlsx`;
            }else if(bodyFatturazioneDownload.mese !== 9999 && bodyFatturazioneDownload.anno !== 9999){
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
        setTotaleHeader(0);
    };

    const onButtonFiltra = () =>{
        updateFilters({
            pathPage:PathPf.DOCUMENTI_SOSPESI,
            body:bodyFatturazione,
            page:0,
            rows:10
        });
        setPage(0);
        setRowsPerPage(10);
        setBodyFatturazioneDownload(bodyFatturazione);
        getlistaFatturazione(bodyFatturazione,true); 
    };
    
    const onButtonAnnulla = async () => {
        const resetBody:BodyDocumentiEmessiEnte = {
            anno:9999,
            mese:9999,
            tipologiaFattura:[],
            dataFattura:[]
        };
       
        setBodyFatturazione(resetBody);
        setBodyFatturazioneDownload(resetBody);
        setValueMultiselectTipologie([]);
        setValueMultiselectDate([]);
        setPage(0);
        setRowsPerPage(10);
        getlistaFatturazione(resetBody,true);
        resetFilters();
        setTotaleHeader(0);
        
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
            pathPage: PathPf.DOCUMENTI_SOSPESI,
            body: bodyFatturazioneDownload,
            page: newPage,
            rows: rowsPerPage,
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
            pathPage: PathPf.DOCUMENTI_SOSPESI,
            body: bodyFatturazioneDownload,
            page: page,
            rows: newRows,
        });
    };


    let bgHeader = "#E3E7EB";
    if(totaleHeader === 0){
        bgHeader = "#E3E7EB";
    }else if(totaleHeader > 0){
        bgHeader = "#F2FAF2";
    }else if(totaleHeader < 0){
        bgHeader = "#ffeff1";
    }


    const statusAnnulla = (bodyFatturazione.tipologiaFattura.length !== 0 || bodyFatturazione.mese !== 9999) ? false :true;
    let labelAmount = `Totale fatturato`;
    if(bodyFatturazioneDownload.anno !== null && bodyFatturazioneDownload.mese === null){

        labelAmount = `Totale fatturato/${bodyFatturazioneDownload.anno}`;
    }else if(bodyFatturazioneDownload.mese !== null){
 
        labelAmount = `Totale fatturato/${bodyFatturazioneDownload.anno}-${month[bodyFatturazioneDownload.mese-1]}`;
    }


    const setIdDoc =(el) => {
        navigate(PathPf.PDF_REL_EN+"/documentisospesi/"+el.idFattura);
    };   


    const headerAction = (label:string) => {
        const start = page * rowsPerPage;
        const end = start + rowsPerPage;
        setObjectSort(prev =>
            Object.fromEntries(
                Object.keys(prev).map(key => {
                       
                    if (key === label) {
                           
                        const current = prev[key];
                        const next = current === 1 ? 2 : current === 2 ? 3 : 1;
    
                        
                        if(label === "Data Fattura"){
                            if(next === 2){
                                const result = sortDates(listaResponse.slice(start,end), true);
                                setGridData(result);
                            }else if(next === 3){
                                const result = sortDates(listaResponse.slice(start,end), false);
                                setGridData(result);
                            }else{
                                setGridData(listaResponse.slice(start,end));
                            }
                            
                            return [key, next];
                                
                        }else if(label === "Ident."){
                         
                            if(next === 2){
                                const result = sortMonthYear(listaResponse.slice(start,end), true);
                                setGridData(result);
                               
                            }else if(next === 3){
                                const result = sortMonthYear(listaResponse.slice(start,end), false);
                                setGridData(result);
                                
                            }else{
                                setGridData(listaResponse.slice(start,end));
                               
                            }
    
                            return [key, next];
                        }else if(label === "Tot." ){
                            if(next === 2){
                                const result = sortByTotale(listaResponse.slice(start,end), true, "totale");
                             
                                setGridData(result);
                            }else if(next === 3){
                                const result = sortByTotale(listaResponse.slice(start,end), false,"totale");
                               
                                setGridData(result);
                            }else{
                                setGridData(listaResponse.slice(start,end));
                            }
    
                            return [key, next];
                        }else if(label === "N. Fattura"){
                            if(next === 2){
                                const result = sortByNumeroFattura(listaResponse.slice(start,end), true,"numero");
                                setGridData(result);
                            }else if(next === 3){
                                const result = sortByNumeroFattura(listaResponse.slice(start,end), false,"numero");
                                setGridData(result);
                            }else{
                                setGridData(listaResponse.slice(start,end));
                            }
    
                            return [key, next];
                        }else if(label === "Tipo Documento"){
                            if(next === 2){
                                const result = sortByTipoFattura(listaResponse.slice(start,end), true,"tipoDocumento");
                                setGridData(result);
                            }else if(next === 3){
                                const result = sortByTipoFattura(listaResponse.slice(start,end), false,"tipoDocumento");
                                setGridData(result);
                            }else{
                                setGridData(listaResponse.slice(start,end));
                            }
    
                            return [key, next];
                        }else{
                            return [key, 1];
                        }
                           
                    }else{
                        return [key, 1];
                    }
                        
                })
            )
        );
    };
   

    return (
        <MainBoxStyled title={"Documenti contabili sospesi"} actionButton={[]}>
            <ResponsiveGridContainer >
                <MainFilter 
                    filterName={"select_value_with_tutti"}
                    inputLabel={"Anno"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    body={bodyFatturazione}
                    keyDescription={"anno"}
                    keyValue={"anno"}
                    keyBody={"anno"}
                    arrayValues={years.map(el => el.toString())}
                    extraCodeOnChange={(e)=>{
                    
                        if(e.toString() === "9999"){
                        
                            setBodyFatturazione((prev)=> ({...prev, ...{anno:9999,mese:9999,dataFattura:[],tipologiaFattura:[]}}));
                            setArrayMonths([]);
                        }else{
                            setBodyFatturazione((prev)=> ({...prev, ...{anno:Number(e),mese:9999,dataFattura:[],tipologiaFattura:[]}}));
                            const arrayMonths = Array.from( new Set(globalResponse
                                .filter(el =>
                                    el.anno === Number(e))
                                .map(el => el.mese)));
                            setArrayMonths(arrayMonths);

                            const arrayTipogie = Array.from( new Set(globalResponse
                                .filter(el =>
                                    el.anno === Number(e))
                                .map(el => el.tipologiaFattura)));
                            setDataSelect(arrayTipogie);
                           
                        }
                        
                        setValueMultiselectTipologie([]);
                        setValueMultiselectDate([]);
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_mese_with_tutti"}
                    inputLabel={"Mese"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    body={bodyFatturazione}
                    keyDescription={"mese"}
                    keyBody={"mese"}
                    keyValue={"mese"}
                    arrayValues={arraymonths}
                    extraCodeOnChange={(e)=>{
                        setBodyFatturazione((prev)=> ({...prev, mese:Number(e),tipologiaFattura:[],dataFattura:[]}));
                        setValueMultiselectTipologie([]);
                        setValueMultiselectDate([]);
                        if(e.toString() === "9999"){
                            const arrayTipogie = Array.from( new Set(globalResponse
                                .filter(el =>
                                    el.anno === bodyFatturazione.anno)
                                .map(el => el.tipologiaFattura)));
                            setDataSelect(arrayTipogie);

                        }else{
                            const arrayTipogie = Array.from( new Set(globalResponse
                                .filter(el =>
                                    el.anno === bodyFatturazione.anno && el.mese === Number(e))
                                .map(el => el.tipologiaFattura)));
                            setDataSelect(arrayTipogie);
                        }
                        
                    }}
                    disabled={bodyFatturazione.anno === 9999}
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Tipologia Fattura"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    dataSelect={dataSelect}
                    valueAutocomplete={valueMulitselectTipologie}
                    setValueAutocomplete={setValueMultiselectTipologie}
                    body={bodyFatturazione}
                    keyDescription={"tipologiaFattura"}
                    keyValue={"tipologiaFattura"}
                    keyBody={"tipologiaFattura"}
                    extraCodeOnChangeArray={(e)=>{
                        setValueMultiselectTipologie(e);
                        const arrayToCheck = e;
                        if(bodyFatturazione.anno !== null && bodyFatturazione.anno.toString() && arrayToCheck.length > 0){


                            const arrayDataFattura = Array.from( new Set(globalResponse.filter(el =>
                                el.anno === bodyFatturazione.anno && arrayToCheck.includes(el.tipologiaFattura) )
                                .map(el => el.dataFattura)));
                            setArrayDataFatturaFiltered(arrayDataFattura);
                        }
                        setValueMultiselectDate([]);
                        
                     
                        setBodyFatturazione((prev) => ({...prev,...{tipologiaFattura:e}}));
                    }}
                    iconMaterial={RenderIcon("invoice",true)}
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Data Fattura"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    body={bodyFatturazione}
                    dataSelect={arrayDataFatturaFiltered}
                    valueAutocomplete={valueMulitselectDate}
                    setValueAutocomplete={setValueMultiselectDate}
                    keyDescription={"dataFattura"}
                    keyValue={"dataFattura"}
                    keyBody={"dataFattura"}
                    extraCodeOnChangeArray={(e)=>{
                        setValueMultiselectDate(e);
                        setBodyFatturazione(prev => ({...prev,dataFattura:e}));
                    }}
                    iconMaterial={RenderIcon("date",true)}
                    disabled={valueMulitselectTipologie.length === 0 || bodyFatturazione.anno === 9999 || bodyFatturazione.mese !== 9999}
                ></MainFilter>
            </ResponsiveGridContainer>
            <FilterActionButtons 
                onButtonFiltra={onButtonFiltra} 
                onButtonAnnulla={onButtonAnnulla} 
                statusAnnulla={statusAnnulla ? "hidden":"show"} 
            ></FilterActionButtons>
            <Paper sx={{ p: 2, mb: 2, backgroundColor:bgHeader}}>
                <Typography variant="body2" color="text.secondary">
                    Credito sospeso
                </Typography>
                <Typography variant="h6">
                    {totaleHeader === 0 ? "--" :totaleHeader.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                </Typography>
            </Paper>
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
                nameParameterApi='docEmessiEnte'
                elements={gridData}
                changePage={handleChangePage}
                changeRow={handleChangeRowsPerPage} 
                total={totalDocumenti}
                page={page}
                rows={rowsPerPage}
                headerNames={headersDocumentiEmessiEnte}
                headerNamesCollapse={headersDocumentiEmessiEnteCollapse}
                disabled={showLoadingGrid}
                widthCustomSize="2000px"
                apiGet={setIdDoc}
                objectSort={objectSort}
                headerAction={headerAction}
            ></GridCustom>
           
          
            <ModalLoading 
                open={showDownloading} 
                setOpen={setShowDownloading} 
                sentence={'Downloading...'}>
            </ModalLoading>
            <ModalRedirect
                setOpen={setOpenModalRedirect} 
                open={openModalRedirect}
                sentence={`Per poter visualizzare il dettaglio dei Documenti EMESSI è obbligatorio fornire i seguenti dati di fatturazione:`}>
            </ModalRedirect>
            <ModalLoading 
                open={showLoadingGrid} 
                setOpen={setShowLoadingGrid} 
                sentence={'Loading...'}>
            </ModalLoading>
        </MainBoxStyled>
    );
};

export default DocSos;
