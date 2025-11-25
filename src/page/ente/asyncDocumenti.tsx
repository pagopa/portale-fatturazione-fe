import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../store/context/globalContext";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { PathPf } from "../../types/enum";
import { manageError } from "../../api/api";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import {  transformDateTime, transformDateTimeWithNameMonth } from "../../reusableFunction/function";
import { getListaAsyncDoc } from "../../api/apiSelfcare/asyncDoc/api";
import { headerNameAsyncDoc } from "../../assets/configurations/conf_GridAsyncDocEnte";
import { mesiGrid } from "../../reusableFunction/reusableArrayObj";
import dayjs from "dayjs";
import { getMessaggiCountEnte, getNotificheDownloadFromAsync } from "../../api/apiSelfcare/notificheSE/api";
import ModalRedirect from "../../components/commessaInserimento/madalRedirect";
import { FilterActionButtons, MainBoxStyled, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
export interface BodyAsyncDoc{
    init: string|null|Date,
    end: string|null|Date,
    ordinamento:number
}

export interface DataGridAsyncDoc {
    reportId:number,
    dataInserimento:string,
    anno:number,
    mese:number,
    dataFine:string,
    stato:number,
    letto:boolean
}

const AsyncDocumenti = () => {
    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState,setCountMessages,statusQueryGetUri} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const { 
        filters,
        updateFilters,
        isInitialRender,
        resetFilters,
    } = useSavedFilters(PathPf.ASYNC_DOCUMENTI_ENTE,{});

    const [dataGrid,setDataGrid] = useState([]);
    const [totDoc,setTotDoc] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [bodyGetLista, setBodyGetLista] = useState<BodyAsyncDoc>({ init:null,end:null,ordinamento:1});
    const [error,setError] = useState(false);
    const [showLoading,setShowLoading] = useState(false);
    const [showDownloading,setShowDownloading] = useState(false);
    const [openModalRedirect, setOpenModalRedirect] = useState(false);

    const disableListaCompletaButton = bodyGetLista.init !== null || bodyGetLista.end !== null;
   
    useEffect(()=>{
        if(mainState.datiFatturazione === false || mainState.datiFatturazioneNotCompleted){
            setOpenModalRedirect(true);
        }else if(isInitialRender.current && Object.keys(filters)?.length > 0){
            listaDoc(filters.body,filters.page, filters.rows);
            setTotDoc(filters.totalData);
            setPage(filters.page);
            setRowsPerPage(filters.rows);
            setBodyGetLista({ 
                init:filters.body.init ? new Date(filters.body.init):null,
                end:filters?.body?.end ? new Date(filters.body.end):null,
                ordinamento:filters.body.ordinamento,
            });
        }else{
            listaDoc(bodyGetLista,page,rowsPerPage);
        }
    },[]);

    //DA VERIFICARE
    useEffect(()=>{
        if(!isInitialRender.current){
            listaDoc(bodyGetLista,page,rowsPerPage);
        }
    },[statusQueryGetUri?.length]);


    const clearOnChangeFilter = () => {
        setDataGrid([]);
        setPage(0);
        setRowsPerPage(10);
        setTotDoc(0);
    };

    const listaDoc = async (body,pag,row) =>{
        setShowLoading(true);
        const bodyWitoutTime:BodyAsyncDoc = {
            ...body,
            init:body.init ?dayjs(body.init).format("YYYY-MM-DD") : null,
            end:body.end ? dayjs(body.end).format("YYYY-MM-DD") :null,
        };
        await getListaAsyncDoc(token, profilo.nonce, bodyWitoutTime,pag+1,row ).then((res)=>{
            const result = res.data.items.map((el)=>{
                const element = {
                    reportId:el.reportId,
                    actionOpen:'',
                    dataInserimento:transformDateTimeWithNameMonth(el.dataInserimento)?.split(".")[0]||"--",
                    anno:el.anno,
                    mese:mesiGrid[el.mese],
                    count:el.count|| "--",
                    dataFine:transformDateTime(el.dataFine)?.split(".")[0]||"--",
                    stato:el.descrizioneStato,
                    letto:el.letto,
                    action:'',
                    DETTAGLIO:el.json
                };
                return element;
            });
            setTotDoc(res.data.count);
            setDataGrid(result);
            setShowLoading(false);
            updateFilters({
                body:body,
                pathPage:PathPf.ASYNC_DOCUMENTI_ENTE,
                page:pag,
                rows:row,
                totalData:res.data.count
            });
        }).catch(((err)=>{
            setDataGrid([]);
            setShowLoading(false);
            manageError(err,dispatchMainState);
            updateFilters({
                body:body,
                pathPage:PathPf.ASYNC_DOCUMENTI_ENTE,
                page:0,
                rows:10,
                totalData:0
            });
        }));
    };

   

    const handleAnnullaButton = () => {
        setBodyGetLista({ init:null,end:null,ordinamento:1});
        listaDoc({ init:null,end:null,ordinamento:1},0,10);
        setPage(0);
        setRowsPerPage(10);
        resetFilters();
        setError(false);
    };

    const handleFiltra = () => {
        listaDoc(bodyGetLista,page,rowsPerPage);
    };
         
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        listaDoc(bodyGetLista,newPage, rowsPerPage);
        setPage(newPage);
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        listaDoc(bodyGetLista,0,parseInt(event.target.value, 10));  
    };

    const handleClickOnDetail = async(obj) =>{
        setShowDownloading(true);
        await getNotificheDownloadFromAsync(token, profilo.nonce,obj?.idReport).then(async(res)=>{
            const link = document.createElement("a");
            link.href = res.data;
            link.download = `Notifiche.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(res.data);

            await getMessaggiCountEnte(token,profilo.nonce).then((res)=>{
                const numMessaggi = res.data;
                setCountMessages(numMessaggi);
            });
    
            await listaDoc(bodyGetLista,page,rowsPerPage); 
            setShowDownloading(false);
        }).catch((err)=>{
          
            setShowDownloading(false);
            manageError(err,dispatchMainState);
        });
    };

    const headerAction = (newParam) => {
     
        listaDoc({ ...bodyGetLista,...{ordinamento:newParam}},page, rowsPerPage);
        setBodyGetLista({ ...bodyGetLista,...{ordinamento:newParam}});
        updateFilters({
            body:{ ...bodyGetLista,...{ordinamento:newParam}}
        });
    };
 
    return (
        <MainBoxStyled title={"Download documenti"}>
            <ResponsiveGridContainer >
                <MainFilter 
                    filterName={"date_from_to"}
                    inputLabel={"Data inizio"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyValue={"init"}
                    keyDescription=""
                    keyCompare={"end"}
                    error={error}
                    setError={setError}
                    keyBody="init"
                ></MainFilter>
                <MainFilter 
                    filterName={"date_from_to"}
                    inputLabel={"Data fine"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyValue={"end"}
                    keyDescription=""
                    keyCompare={"init"}
                    error={error}
                    setError={setError}
                    keyBody="end"
                ></MainFilter>
            </ResponsiveGridContainer>
            <FilterActionButtons 
                onButtonFiltra={handleFiltra} 
                onButtonAnnulla={handleAnnullaButton} 
                statusAnnulla={disableListaCompletaButton? "hidden":"show"} 
            ></FilterActionButtons>
            <GridCustom
                nameParameterApi='asyncDocEnte'
                elements={dataGrid}
                changePage={handleChangePage}
                changeRow={handleChangeRowsPerPage} 
                total={totDoc}
                page={page}
                rows={rowsPerPage}
                headerNames={headerNameAsyncDoc}
                apiGet={handleClickOnDetail}
                disabled={false}
                headerAction={headerAction}
                body={bodyGetLista}
                widthCustomSize="auto"></GridCustom>
            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading} 
                sentence={'Loading...'}>
            </ModalLoading>
            <ModalLoading 
                open={showDownloading} 
                setOpen={setShowDownloading} 
                sentence={'Downloading...'}>
            </ModalLoading>
            <ModalRedirect
                setOpen={setOpenModalRedirect} 
                open={openModalRedirect}
                sentence={`Per poter visualizzare la sezione Download Documenti è obbligatorio fornire i seguenti dati di fatturazione:`}>
            </ModalRedirect>
        </MainBoxStyled>
    );
};

export default AsyncDocumenti;