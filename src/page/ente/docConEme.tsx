import React, {  useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { month } from "../../reusableFunction/reusableArrayObj";
import { PathPf } from "../../types/enum";
import { saveAs } from "file-saver";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import ModalRedirect from "../../components/commessaInserimento/madalRedirect";
import { manageError, } from "../../api/api";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import { getPeriodoEmesso} from "../../api/apiSelfcare/apiDocEmessiSE/api";
import { ManageErrorResponse } from "../../types/typesGeneral";
import { Box, Grid, Paper, Typography } from "@mui/material";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import { headersDocumentiEmessiEnte, headersDocumentiEmessiEnteCollapse, headersDocumentiEmessiEnteContestate } from "../../assets/configurations/conf_GridDocEmessiEnte";
import { downloadFattureEmesseEnte, getListaDocumentiContestati, getListaDocumentiEmessi } from "../../api/apiSelfcare/documentiSospesiSE/api";
import { sortByNumeroFattura, sortByTipoFattura, sortByTotale, sortDates, sortMonthYear } from "../../reusableFunction/function";
import { fi } from "date-fns/locale";
import { set } from "date-fns";


export type BodyDocumentiEmessiEnte = {
    anno:number,
    mese:number,
    tipologiaFattura:string[],
    dataFattura:string[]
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

 type ResponsePeriodo = {
     anno: number,
     tipologiaFattura: string,
     dataFattura: string,
     mese: number
 }




const DocEm : React.FC = () =>{
    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
    const navigate = useNavigate();
 
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;


    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.DOCUMENTI_EMESSI,{});


    //______________________NEW_________________
    const [listaResponse, setListaResponse] = useState<Fattura[]>([]);
    //const [responseByAnno, setResponseByAnno] = useState<{anno:{ mese:number[],tipologiaFattura:string[],dataFattura:string[]}[]}>();
    const [years,setYears] = useState<number[]>([]);
    const [arraymonths,setArrayMonths] = useState<number[]>([]);
    //const [arrayDataFattura,setArrayDataFattura] = useState<string[]>([]);
    const [arrayDataFatturaFiltered,setArrayDataFatturaFiltered] = useState<string[]>([]);
   
    const [dataSelect, setDataSelect] = useState<string[]>([]);
    const [showLoadingGrid,setShowLoadingGrid] = useState(true);
    const [showDownloading,setShowDownloading] = useState(false);
    const [gridData, setGridData] = useState<Fattura[]>([]);
    const [listaResponseaSorted, setListaResponseaSorted] = useState<Fattura[]>([]);
    const [totalDocumenti, setTotalDocumenti]  = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totaleHeader, setTotaleHeader] = useState(0);
    const [valueMulitselectDate, setValueMultiselectDate] = useState<string[]>([]);
    const [valueMulitselectTipologie, setValueMultiselectTipologie] = useState<string[]>([]);
    const [globalResponse, setGlobalResponse] = useState<ResponsePeriodo[]>([]);
    const [objectSort, setObjectSort] = useState<{[key:string]:number}>({"Data Fattura":1,"Ident.":1,"Tot.":1,"N. Fattura":1,"Tipo Documento":1});

    //_______________________NEW CONTESTATI_________________
    const [listaResponseContestate, setListaResponseContestate] = useState<Fattura[]>([]);
    const [listaResponseaSortedContestate, setListaResponseaSortedContestate] = useState<Fattura[]>([]);
    const [pageContestate, setPageContestate] = useState(0);
    const [rowsPerPageContestate, setRowsPerPageContestate] = useState(10);
    const [gridDataContestate, setGridDataContestate] = useState<Fattura[]>([]);
    //const [gridDataNoSortedContestate, setGridDataNoSortedContestate] = useState<Fattura[]>([]);
    const [objectSortContestate, setObjectSortContestate] = useState<{[key:string]:number}>({"Data Fattura":1,"Ident.":1,"Tot.":1,"N. Fattura":1,"Tipo Documento":1});
    const [totalDocumentiContestate, setTotalDocumentiContestate]  = useState(0);
    //__________________________________________________________________________________
  
   
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
            const res = await getPeriodoEmesso(token, profilo.nonce);
            setGlobalResponse(res.data);
           
            const yearsArray:number[] = Array.from( new Set(res.data.map(el => el.anno)));
            const allMonths:number[] = Array.from( new Set(res.data.map(el => el.mese)));//da eliminare
            const allTipologie:string[] = Array.from( new Set(res.data.map(el => el.tipologiaFattura)));
            const dataFattura:string[] = Array.from( new Set(res.data.map(el => `${el.dataFattura}-${el.tipologiaFattura}`)));//da eliminare
         
            setYears(yearsArray);
            if(isInitialRender.current && Object.keys(filters)?.length > 0){
             
                if(filters.body.anno !== 9999){
                    console.log(2);
                    const arrayMonths:number[] = Array.from( new Set(res.data
                        .filter(el =>
                            el.anno === Number(filters.body.anno))
                        .map(el => el.mese)));
                 
                    setArrayMonths(arrayMonths);

                    const arrayTipogie:string[] = Array.from( new Set(res.data
                        .filter(el =>
                            el.anno === Number(filters.body.anno))
                        .map(el => el.tipologiaFattura)));
    
                    setDataSelect(arrayTipogie);
                    if(filters.body?.tipologiaFattura?.length > 0){
                        setValueMultiselectTipologie(filters.body.tipologiaFattura);
                    }
                    
             
                    if(filters?.body?.tipologiaFattura?.length > 0 && filters?.body?.mese === 9999){
                    
                        const arrayDataFattura:string[] = Array.from( new Set(res.data.filter(el =>
                            el.anno === Number(filters?.body?.anno) &&  filters?.body?.tipologiaFattura.includes(el.tipologiaFattura) )
                            .map(el => el.dataFattura)));
             
                        setArrayDataFatturaFiltered(arrayDataFattura);
                        if(filters?.body?.dataFattura?.length > 0){
                            setValueMultiselectDate(filters.body.dataFattura);
                        }
                    }

                    setBodyFatturazione(filters.body);
                    setBodyFatturazioneDownload(filters.body);
                    getlistaFatturazione(filters.body,true);
                 
                }else{
                    if( filters?.body?.tipologiaFattura?.length > 0 && filters.body.anno === 9999){

                        const arrayTipogie:string[] = Array.from( new Set(res.data.map(el => el.tipologiaFattura)));
                  
                        setDataSelect(arrayTipogie);
                        setValueMultiselectTipologie(filters?.body?.tipologiaFattura);
                    }
                   
                    setDataSelect(allTipologie);
                   
                    setBodyFatturazione(filters.body);
                    setBodyFatturazioneDownload(filters.body);
                    getlistaFatturazione(filters.body,true);
                }
                
            }else{
               
                setArrayMonths(allMonths);
                setDataSelect(allTipologie); 
                setShowLoadingGrid(false);
                getlistaFatturazione(bodyFatturazione,true);
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


    const funcToMapElements = (obj:any) => {
        return obj.map((obj, index) => ({
            ragioneSociale: obj.ragioneSociale || '--',
            idFattura:obj.idfattura,
            id: obj.identificativo ?? index,
            arrow: '',
            dataFattura: obj.dataFattura
                ?  new Date(obj.dataFattura).toLocaleDateString('it-IT')
                : '--',
            stato: 'Emessa',
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
            posizioni:obj?.posizioni ? obj?.posizioni.map(el => ({
                numerolinea: el.numeroLinea,
                codiceMateriale: el.codiceMateriale,
                imponibile:el.imponibile.toLocaleString("de-DE", { style: "currency", currency: "EUR" })  || '--',
                periodoRiferimento: obj.dataFattura
                    ? new Date(obj.dataFattura).toLocaleDateString('it-IT')
                    : '--', 
                periodoFatturazione:el.periodoRiferimento || '--',
            })):[],
        }));
    };


    const getlistaFatturazione = async (body,isCalledOnFiltraButton=false) => {
        if(isCalledOnFiltraButton){
            setShowLoadingGrid(true);
        }
        try {

            if(isInitialRender.current){
                const resCancellati = await getListaDocumentiContestati(token,profilo.nonce);
                const getObjectFatturaCancellati = resCancellati.data.dettagli.map(el => el.fattura);
                const orderDataCustomContestate:Fattura[] = funcToMapElements(getObjectFatturaCancellati);
                setListaResponseContestate(orderDataCustomContestate);
                setListaResponseaSortedContestate(orderDataCustomContestate);
                setTotalDocumentiContestate(resCancellati.data.dettagli.length);
                
                if(isInitialRender.current && Object.keys(filters)?.length > 0){
                    console.log({filters});
                    if(Object.values(filters.objectSortContestate).some(value => value !== 1)){
                        const obj = filters.objectSortContestate;
                        const label = Object.keys(obj).filter(key => obj[key] !== 1);
                        console.log({label,obj});
                        headerAction(label[0],setGridDataContestate,false,setObjectSortContestate,filters.pageContestate,filters.rowsPerPageContestate,orderDataCustomContestate);
                        //setObjectSortContestate(filters.objectSortContestate);
                    }else{
                        const start = filters.pageContestate * filters.rowsPerPageContestate;
                        const end = start + filters.rowsPerPageContestate;
     
                        const elementsToShow = orderDataCustomContestate.slice(start, end);
                        console.log({diobestia:elementsToShow});
                        setGridDataContestate(elementsToShow);
                    }
                    if(filters.pageContestate !== 0){
                        setPageContestate(filters.pageContestate);
                    }
                    if(filters.rowsPerPageContestate !== 10){
                        setRowsPerPageContestate(filters.rowsPerPageContestate);
                    }
                    
                }else{
                    const elementsToShow = orderDataCustomContestate.slice(0, 10);
                    setGridDataContestate(elementsToShow);
                }
            }
           

            const res = await getListaDocumentiEmessi(token,profilo.nonce,body);
            const totaleSum = res.data.importo;
            const getObjectFattura = res.data.dettagli.map(el => el.fattura);
            const orderDataCustom:Fattura[] = funcToMapElements(getObjectFattura);

           
            if(isInitialRender.current && Object.keys(filters)?.length > 0 ){
                console.log({filters});
                if(Object.values(filters.objectSort).some(value => value !== 1)){
                    const obj = filters.objectSort;
                    const label = Object.keys(obj).filter(key => obj[key] !== 1);
                 
                    headerAction(label[0],setGridData,true,setObjectSort,filters.page,filters.rows,orderDataCustom);
                    //setObjectSort(filters.objectSort);
                }else{
                    const start = filters.page * filters.rowsPerPage;
                    const end = start + filters.rowsPerPage;
     
                    const elementsToShow = orderDataCustom.slice(start, end);
                    setGridData(elementsToShow);
                }
                if(filters.page !== 0){
                    setPage(filters.page);
                }
                if(filters.rows !== 10){
                    setRowsPerPage(filters.rows);
                }
            }else{
                const dataToShow = orderDataCustom.slice(0, 10);
                setGridData(dataToShow);
            }
            setListaResponse(orderDataCustom);
            setListaResponseaSorted(orderDataCustom);
            setTotalDocumenti(res.data.dettagli.length);
            setTotaleHeader(totaleSum);
         
            setBodyFatturazioneDownload(bodyFatturazione);

          
            if(isInitialRender.current && Object.keys(filters).length === 0){
                updateFilters({
                    pathPage:PathPf.DOCUMENTI_EMESSI,
                    body:bodyFatturazione,
                    page:0,
                    rows:10,
                    pageContestate:0,
                    rowsPerPageContestate:10,
                    objectSort,
                    objectSortContestate
                });
            }
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
            //setGridDataNoSorted([]);
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
        await downloadFattureEmesseEnte(token,profilo.nonce, bodyFatturazioneDownload).then(response => response.blob()).then((response)=>{
            let title = `Documenti emessi/${listaResponse[0].ragioneSociale}.xlsx`;
            if(bodyFatturazioneDownload.anno !== 9999 && bodyFatturazioneDownload.mese === 9999){
                title = `Documenti emessi/${listaResponse[0].ragioneSociale}/${bodyFatturazioneDownload.anno}.xlsx`;
            }else if(bodyFatturazioneDownload.mese !== 9999 && bodyFatturazioneDownload.anno !== 9999){
                title = `Documenti emessi/${listaResponse[0].ragioneSociale}/${month[bodyFatturazioneDownload.mese - 1]}/${bodyFatturazioneDownload.anno}.xlsx`;
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
            pathPage:PathPf.DOCUMENTI_EMESSI,
            body:bodyFatturazione,
            page:0,
            rows:10,
            objectSort
        });
        setPage(0);
        setRowsPerPage(10);
        setBodyFatturazioneDownload(bodyFatturazione);
        getlistaFatturazione(bodyFatturazione,true); 
        setObjectSort({"Data Fattura":1,"Ident.":1,"Tot.":1,"N. Fattura":1,"Tipo Documento":1});
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
     
        const elementsToShow = listaResponseaSorted.slice(start, end);
        setGridData(elementsToShow);

        updateFilters({
            pathPage: PathPf.DOCUMENTI_EMESSI,
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

        const elementsToShow = listaResponseaSorted.slice(0, newRows);
        setGridData(elementsToShow);
        updateFilters({
            pathPage: PathPf.DOCUMENTI_EMESSI,
            body: bodyFatturazioneDownload,
            page: page,
            rows: newRows,
        });
    };

    
    const handleChangePageContestate = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPageContestate(newPage);
        
        const start = newPage * rowsPerPageContestate;
        const end = start + rowsPerPageContestate;
     
        const elementsToShow = listaResponseaSortedContestate.slice(start, end);
        setGridDataContestate(elementsToShow);

        updateFilters({
            pathPage: PathPf.DOCUMENTI_EMESSI,
            pageContestate: newPage,
            rowsPerPageContestate: rowsPerPageContestate,
        });
    };
                        
    const handleChangeRowsPerPageContestate = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const newRows = parseInt(event.target.value, 10);

        setRowsPerPageContestate(newRows);
        setPageContestate(0);

        const elementsToShow = listaResponseaSortedContestate.slice(0, newRows);
        setGridDataContestate(elementsToShow);
        updateFilters({
            pathPage: PathPf.DOCUMENTI_EMESSI,
            pageContestate: pageContestate,
            rowsPerPageContestate: newRows,
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


    const setIdDoc = async(el) => {
        navigate(PathPf.PDF_REL_EN+"/documentiemessi/"+el.idFattura); 
    };  
    

    const headerAction = (
        label: string,
        setGridDataParam: (data: any[]) => void,
        emessiGrid = true,
        setObjectSort: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>,
        page: number,
        rowsPerPage: number,
        listaResponseParameter: any[],
    ) => {

        const start = page * rowsPerPage;
        const end = start + rowsPerPage;
        if(isInitialRender.current && Object.keys(filters)?.length > 0){
            const prev = emessiGrid ? filters.objectSort : filters.objectSortContestate;
          
        
            //const label = Object.keys(prev).filter(key => prev[key] !== 1);
            const valueNotOne = Object.values(prev).find(value => value !== 1);
            let sortedFull = [...listaResponseParameter];
            if(valueNotOne){   
                const booleanValue = valueNotOne === 2 ? true : false;
                switch (label) {
                    case "Data Fattura":
                        sortedFull = sortDates(sortedFull, booleanValue);
                        break;

                    case "Ident.":
                        sortedFull = sortMonthYear(sortedFull, booleanValue);
                        break;

                    case "Tot.":
                        sortedFull = sortByTotale(sortedFull, booleanValue, "totale");
                        break;

                    case "N. Fattura":
                        console.log("sort by numero fattura", booleanValue);
                        sortedFull = sortByNumeroFattura(sortedFull, booleanValue, "numero");
                        break;

                    case "Tipo Documento":
                        sortedFull = sortByTipoFattura(sortedFull, booleanValue, "tipoDocumento");
                        break;

                    default:
                        break;
                }
            }
         
            if(emessiGrid){ 
                console.log("first",{sortedFull});
                setListaResponseaSorted(sortedFull);
                setObjectSort(filters.objectSort);
            }else{
                console.log("first",3,{sortedFull});
                setListaResponseaSortedContestate(sortedFull);
                setObjectSort(filters.objectSortContestate);
            }
            const paginated = sortedFull.slice(start, end);
            setGridDataParam(paginated);
            console.log("first",4);
         

        }else{
            setObjectSort(prev => {
                console.log ({prev});
                const current = prev[label] ?? 1;
                const next = current === 1 ? 2 : current === 2 ? 3 : 1;

                // reset all columns to 1 except selected
                const newSortObject = Object.fromEntries(
                    Object.keys(prev).map(key => [
                        key,
                        key === label ? next : 1
                    ])
                );

                let sortedFull = [...listaResponseParameter];
                if (next !== 1) {
                    const isAsc = next === 2;

                    switch (label) {
                        case "Data Fattura":
                            sortedFull = sortDates(sortedFull, isAsc);
                            break;

                        case "Ident.":
                            sortedFull = sortMonthYear(sortedFull, isAsc);
                            break;

                        case "Tot.":
                            sortedFull = sortByTotale(sortedFull, isAsc, "totale");
                            break;

                        case "N. Fattura":
                            console.log("sort by numero fattura", isAsc);
                            sortedFull = sortByNumeroFattura(sortedFull, isAsc, "numero");
                            break;

                        case "Tipo Documento":
                            sortedFull = sortByTipoFattura(sortedFull, isAsc, "tipoDocumento");
                            break;

                        default:
                            break;
                    }
                }
                if(emessiGrid){ 
                    console.log(2,{sortedFull});
                    setListaResponseaSorted(sortedFull);
                }else{
                    console.log(3);
                    setListaResponseaSortedContestate(sortedFull);
                }
                const paginated = sortedFull.slice(start, end);
                setGridDataParam(paginated);
                console.log(4);
                if(!isInitialRender.current){
                    updateFilters({
                        pathPage: PathPf.DOCUMENTI_EMESSI,
                        body: bodyFatturazioneDownload,
                        page:page,
                        rows: rowsPerPage,
                        pageContestate: pageContestate,
                        rowsPerPageContestate:rowsPerPageContestate,
                        objectSort: emessiGrid ? newSortObject : objectSort,
                        objectSortContestate: !emessiGrid ? newSortObject : objectSortContestate
                    });
                }
            

                return newSortObject;
            });
        }
       
    };
   
   

    return (
        <MainBoxStyled title={"Documenti contabili emessi"} actionButton={[]}>
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
                    Totale fatturato
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
                headerActionSort={headerAction}
                setGridData={setGridData}
                gridType={true}
                setObjectSort={setObjectSort}
                listaResponse={listaResponse}
            />
            <Box sx={{marginLeft:"1.25rem"}}>
                <Grid
                    container
                    spacing={2}
                    sx={{ alignItems: "center",my:3 }}
                >
                    <Typography
                        variant="h5"
                        sx={{ textAlign: { xs: "center", md: "left" } }}
                    >
                        Fatture Contestate
                    </Typography>
                </Grid>
            </Box>
            <GridCustom
                nameParameterApi='docEmessiEnteContestate'
                elements={gridDataContestate}
                changePage={handleChangePageContestate}
                changeRow={handleChangeRowsPerPageContestate} 
                total={totalDocumentiContestate}
                page={pageContestate}
                rows={rowsPerPageContestate }
                headerNames={headersDocumentiEmessiEnteContestate}
                disabled={showLoadingGrid}
                widthCustomSize="2000px"
                objectSort={objectSortContestate}
                headerActionSort={headerAction}
                setGridData={setGridDataContestate}
                gridType={false}
                setObjectSort={setObjectSortContestate}
                sentenseEmpty={"Non sono presenti fatture contestate"}
                listaResponse={listaResponseContestate}
            />
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

export default DocEm;
