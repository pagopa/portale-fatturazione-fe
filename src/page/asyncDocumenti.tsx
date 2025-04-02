import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../store/context/globalContext";
import { useNavigate } from "react-router";
import useSavedFilters from "../hooks/useSaveFiltersLocalStorage";
import { PathPf } from "../types/enum";
import { manageError } from "../api/api";
import { Typography, Button } from "@mui/material";
import { Box } from "@mui/system";
import GridCustom from "../components/reusableComponents/grid/gridCustom";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { formatDateToValidation, isDateInvalid } from "../reusableFunction/function";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { getListaAsyncDoc } from "../api/apiSelfcare/asyncDoc/api";
import { it } from "date-fns/locale";

export interface BodyAsyncDoc{
    init: string|null|Date,
    end: string|null|Date,
    ordinamento:number
}

const AsyncDocumenti = () => {
    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const { 
        filters,
        updateFilters,
        isInitialRender,
        resetFilters
    } = useSavedFilters(PathPf.ASYNC_DOCUMENTI_ENTE,{});

    const [textValue, setTextValue] = useState('');
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [dataGrid,setDataGrid] = useState([]);
    const [totDoc,setTotDoc] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [bodyGetLista, setBodyGetLista] = useState<BodyAsyncDoc>({ init:new Date(),end:null,ordinamento:0});
    const [error,setError] = useState(false);
    const [showLoading,setShowLoading] = useState(false);
    const [showDownloading,setShowDownloading] = useState(false);

    useEffect(()=>{
        listaDoc(bodyGetLista,page,rowsPerPage); 
        
    },[]);
    /*
    useEffect(()=>{
        if(bodyGetLista.idEnti.length > 0 ||bodyGetLista.idTipologiaReports.length > 0 || bodyGetLista.mese !== ''){
            setStatusAnnulla('show');
        }else{
            setStatusAnnulla('hidden');
        }
    },[bodyGetLista]);
*/
 
    const clearOnChangeFilter = () => {
        setDataGrid([]);
        setPage(0);
        setRowsPerPage(10);
        setTotDoc(0);
    };

    const listaDoc = async (body,pag,row) =>{
        await getListaAsyncDoc(token, profilo.nonce, body,pag+1,row ).then((res)=>{
            setDataGrid(res.data);
        }).catch(((err)=>{
            setDataGrid([]);
            manageError(err,dispatchMainState);
        }));
    };

    const handleAnnullaButton = () => {
        setBodyGetLista({ init:new Date(),end:null,ordinamento:0});
        listaDoc({ init:new Date(),end:null,ordinamento:0},1,10);
        resetFilters();
    };

    const handleFiltra = () => {
        updateFilters({
            body:bodyGetLista,
            page:0,
            rows:10,
        });
        listaDoc(bodyGetLista,page,rowsPerPage);
    };
         
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        listaDoc(bodyGetLista,newPage, rowsPerPage);
        setPage(newPage);
        updateFilters({
            pathPage:PathPf.ASYNC_DOCUMENTI_ENTE,
            body:bodyGetLista,
            page:newPage,
            rows:rowsPerPage
        });
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
       
        listaDoc(bodyGetLista,page,parseInt(event.target.value, 10));  
        updateFilters({
            pathPage:PathPf.ASYNC_DOCUMENTI_ENTE,
            body:bodyGetLista,
            page:0,
            rows:parseInt(event.target.value, 10)
        });
    };

    const handleClickOnDetail = () =>{
        console.log(999);
    };
 

    const headerNames = ['Ragione Sociale','Data Inserimento',"Mese","Anno",'Stato','Categoria Doc.',''];

    return (
        <div className="mx-5" style={{minHeight:'600px'}}>
            <div className="marginTop24">
                <div className="row ">
                    <div className="col-9">
                        <Typography variant="h4">Download documenti</Typography>
                    </div>
                </div>
                <div className="mb-5 mt-5 marginTop24" >
                    <div className="row">
                        <div className="col-2">
                            <Box >
                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
                                    <DesktopDatePicker
                                        label={"Data fine"}
                                        value={(bodyGetLista.end === ''||bodyGetLista.end === null) ? null : bodyGetLista.end}
                                        onChange={(e:any | null)  =>{
                                            if(e !== null && !isDateInvalid(e)){
                                                setBodyGetLista(prev => ({...prev,...{end:e}}));
                                                if(bodyGetLista.init !== null && ((formatDateToValidation(e)||0) < (formatDateToValidation(bodyGetLista.init)||0))){
                                                    setError(true);
                                                }else if(bodyGetLista.init === null && bodyGetLista.end !== null){
                                                    setError(true);
                                                }else{
                                                    setError(false);
                                                }
                                            }else{
                                                setBodyGetLista(prev => ({...prev,...{end:null}}));
                                                setError(false);
                                            }
                                            clearOnChangeFilter();
                                        }}
                                        format="dd/MM/yyyy"
                                        slotProps={{
                                            textField: {
                                                error:error,
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>
                        </div>
                        <div className="col-2">
                            <Box >
                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
                                    <DesktopDatePicker
                                        label={"Data fine"}
                                        value={(bodyGetLista.end === ''||bodyGetLista.end === null) ? null : bodyGetLista.end}
                                        onChange={(e:any | null)  =>{
                                            if(e !== null && !isDateInvalid(e)){
                                                setBodyGetLista(prev => ({...prev,...{end:e}}));
                                                if(bodyGetLista.init !== null && ((formatDateToValidation(e)||0) < (formatDateToValidation(bodyGetLista.init)||0))){
                                                    setError(true);
                                                }else if(bodyGetLista.init === null && bodyGetLista.end !== null){
                                                    setError(true);
                                                }else{
                                                    setError(false);
                                                }
                                            }else{
                                                setBodyGetLista(prev => ({...prev,...{end:null}}));
                                                setError(false);
                                            }
                                            clearOnChangeFilter();
                                        }}
                                        format="dd/MM/yyyy"
                                        slotProps={{
                                            textField: {
                                                error:error,
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>
                        </div>
                        <div className="col-2">
                        </div>
                        <div className="col-2 d-flex align-items-center justify-content-center"> 
                            <Box style={{ width: '50%' }}>
                                <Button onClick={handleFiltra} sx={{ marginTop: 'auto', marginBottom: 'auto'}}variant="contained">
                                     Filtra
                                </Button>
                            </Box>    
                            <Box style={{ width: '50%' }}>
                                {statusAnnulla === 'hidden' ? null :
                                    <Button onClick={handleAnnullaButton} sx={{marginLeft:'24px'}} >
                                        Annulla filtri
                                    </Button>
                                } 
                            </Box> 
                        </div>
                    </div>
                   
                    <div className="mt-5">
                        <div className="mt-1 mb-5" style={{ width: '100%'}}>
                            <GridCustom
                                nameParameterApi='contestazionePage'
                                elements={dataGrid}
                                changePage={handleChangePage}
                                changeRow={handleChangeRowsPerPage} 
                                total={totDoc}
                                page={page}
                                rows={rowsPerPage}
                                headerNames={headerNames}
                                apiGet={handleClickOnDetail}
                                disabled={false}
                                widthCustomSize="1300px"></GridCustom>
                        </div>
                    </div>
                </div>
            </div>
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
        </div>
    );
};

export default AsyncDocumenti;