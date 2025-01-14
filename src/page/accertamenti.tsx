import { Button, Typography } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { Dispatch, useContext, useEffect, useState } from "react";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import SelectUltimiDueAnni from "../components/reusableComponents/select/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/select/selectMese";
import { DataGrid, GridColDef, GridEventListener, GridRowParams, MuiEvent } from "@mui/x-data-grid";
import { Params } from "../types/typesGeneral";
import { getListaAccertamentiPagoPa, getListaAccertamentiPrenotazionePagoPa, getMatriceAccertamenti, getMatriceAccertamentiPagoPa } from "../api/apiPagoPa/accertamentiPA/api";
import { manageError, managePresaInCarico } from "../api/api";
import { Accertamento, BodyAccertamenti } from "../types/typeAccertamenti";
import { mesiGrid } from "../reusableFunction/reusableArrayObj";
import ModalMatriceAccertamenti from "../components/accertamenti/modalMatrice";
import { saveAs } from "file-saver";
import { ActionReducerType } from "../reducer/reducerMainState";
import { GlobalContext } from "../store/context/globalContext";
import { getMessaggiCount } from "../api/apiPagoPa/centroMessaggi/api";
import useSavedFilters from "../hooks/useSaveFiltersLocalStorage";
import { PathPf } from "../types/enum";


interface AccertamentiProps {
    dispatchMainState:Dispatch<ActionReducerType>
}

export interface MatriceArray {
    dataInizioValidita: string,
    dataFineValidita: string
}

const Accertamenti : React.FC = () =>{

    const globalContextObj = useContext(GlobalContext);
    const {mainState,dispatchMainState,setCountMessages} = globalContextObj;

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const currentYear = (new Date()).getFullYear();
    
    const [gridData, setGridData] = useState<Accertamento[]>([]);
    
    const [infoPageAccertamenti , setInfoPageAccertamenti] = useState({ page: 0, pageSize: 100 });
    const [showLoadingGrid,setShowLoadingGrid] = useState(false);
    const [showDownloading,setShowDownloading] = useState(false);
    const [showPopUpMatrice,setShowPopUpMatrice] = useState(false);
    const [dataMatrice, setDataMatrice] = useState<MatriceArray[]>([]);
    const [valueSelectMatrice,setValueSelectMatrice ] = useState('');
    /*
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState<string>('hidden');
    const [tipologie, setTipologie] = useState<string[]>([]);
    const [valueMulitselectTipologie, setValueMultiselectTipologie] = useState<string[]>([]);
    const [showedData, setShowedData] = useState<FattureObj[]>([]);
    const idElement = useId();*/
    const [bodyAccertamenti, setBodyAccertamenti] = useState<BodyAccertamenti>({
        anno:currentYear,
        mese:null,
        tipologiaFattura:[],
        idEnti:[]
    });
    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters('/accertamenti',{});
    
    useEffect(()=>{
        if(isInitialRender.current && Object.keys(filters).length > 0){
            getListaAccertamenti(filters.body.anno,filters.body.mese);
            setBodyAccertamenti(filters.body);
            setInfoPageAccertamenti({page:filters.page,pageSize:filters.rows});
        }else{
            getListaAccertamenti(new Date().getFullYear(),null);
            
        }
        getListaMatrice();
    },[]);
    
    
    const getListaAccertamenti = async(anno,mese) => {
        setShowLoadingGrid(true);
        await getListaAccertamentiPagoPa(token, profilo.nonce, {anno,mese} )
            .then((res)=>{
                setGridData(res.data);
                setShowLoadingGrid(false);
            })
            .catch(((err)=>{
                setGridData([]);
                setShowLoadingGrid(false);
                manageError(err,dispatchMainState);
            }));
        isInitialRender.current = false;
    };
    
    const getListaMatrice = async () =>{
        await getMatriceAccertamenti(token, profilo.nonce) 
            .then((res)=>{
                setDataMatrice(res.data);
            })
            .catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
    };

    
    const downloadDocMatrice = async (inizio,fine) => {
        setShowDownloading(true);
        await getMatriceAccertamentiPagoPa(token, profilo.nonce,{dataInizioValidita: inizio,dataFineValidita: fine}).then(response => response.blob()) 
            .then((res)=>{
                saveAs(res,`Matrice recapitisti.xlsx` );
                setShowDownloading(false);
            })
            .catch(((err)=>{
                setShowDownloading(false);
                manageError(err,dispatchMainState);
            }));
    };

    const getCount = async () =>{
        await getMessaggiCount(token,profilo.nonce).then((res)=>{
            const numMessaggi = res.data;
            setCountMessages(numMessaggi);
        }).catch((err)=>{
            console.log(err);
        });
    };

    const downloadAccertamento = async (id) => {
        await getListaAccertamentiPrenotazionePagoPa(token,profilo.nonce, {idReport:id})
            .then(()=>{
                managePresaInCarico('PRESA_IN_CARICO_DOCUMENTO',dispatchMainState);
                // add branch 536 10/01/25
                getCount();
                // add branch 536 10/01/25
            })
            .catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
    };
    /*
    const downloadAccertamento = async (id,mese,anno,descrizione, contentType) => {
    setShowDownloading(true);
    if(contentType === "text/csv"){
    
    await getDownloadSingleAccertamentoPagoPaCsv(token,profilo.nonce, {idReport:id}).then((res)=>{
    const blob = new Blob([res.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download',`Accertamento/${descrizione}/${mese}/${anno}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);   
    setShowDownloading(false);
    }).catch(((err)=>{
    setShowDownloading(false);
    manageError(err,dispatchMainState);
    }));
    }else if(contentType === "application/zip"){
    
    await getDownloadSingleAccertamentoPagoPaZipExel(token,profilo.nonce, {idReport:id}).then(response => response.blob())
    .then((res)=>{
    
    saveAs(res,`Accertamento/${descrizione}/${mese}/${anno}.zip`);
    setShowDownloading(false);
    }).catch(((err)=>{
    setShowDownloading(false);
    manageError(err,dispatchMainState);
    }));
    }else if(contentType ==="application/vnd.ms-excel"){
    await getDownloadSingleAccertamentoPagoPaZipExel(token,profilo.nonce, {idReport:id}).then(response => response.blob()).then((res)=>{
    saveAs( res,`Accertamento/${descrizione}/${mese}/${anno}.xlsx` );
    setShowDownloading(false);
    }).catch((err)=>{
    manageError(err,dispatchMainState);
    setShowDownloading(false);
    }); 
    }
    
    };
    */

    const onButtonFiltra = () =>{
        updateFilters({
            pathPage:'/accertamenti',
            body:bodyAccertamenti,
            page:0,
            rows:10,
        });
        getListaAccertamenti(bodyAccertamenti.anno, bodyAccertamenti.mese);
    };

    const onButtonAnnulla = () => {
        getListaAccertamenti(new Date().getFullYear(),null);
        setBodyAccertamenti({
            anno:currentYear,
            mese:null,
            tipologiaFattura:[],
            idEnti:[]
        });
        resetFilters();
    };


    const onChangePageOrRowGrid = (e) => {
        updateFilters(
            {
                body:bodyAccertamenti,
                pathPage:'/accertamenti',
                page:e.page,
                rows:e.pageSize
            });
        setInfoPageAccertamenti(e);
    };
    
    let columsSelectedGrid = '';
    const handleOnCellClick = (params:Params) =>{
        columsSelectedGrid  = params.field;
    };
    
    const handleEvent: GridEventListener<'rowClick'> = (
        params:GridRowParams,
        event: MuiEvent<React.MouseEvent<HTMLElement>>,
    ) => {
        event.preventDefault();
        // l'evento verrà eseguito solo se l'utente farà il clik sul 
        
    };
    
    const columns: GridColDef[] = [
        { field: 'descrizione', headerName: 'Tipologia Accertamento', width: 400 , headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:{row:Accertamento}) => <a className="mese_alidita text-primary fw-bolder" href="/">{param.row.descrizione}</a>},
        { field: 'prodotto', headerName: 'Prodotto', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'anno', headerName: 'Anno', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'mese', headerName: 'Mese', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' ,renderCell: (param:{row:Accertamento}) => <div className="MuiDataGrid-cellContent" title={mesiGrid[param.row.mese]} role="presentation">{mesiGrid[param.row.mese]}</div> },
        { field: 'contentType', headerName: 'Tipo File', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left',renderCell: (param:{row:Accertamento}) => {
            if(param.row.contentType === "text/csv"){
                return <div className="MuiDataGrid-cellContent" title="CSV" role="presentation">CSV</div>;
            }else if(param.row.contentType === "application/zip"){
                return <div className="MuiDataGrid-cellContent" title="Zip" role="presentation">ZIP</div>;
            }else if(param.row.contentType === "application/vnd.ms-excel"){
                return  <div className="MuiDataGrid-cellContent" title="Excel" role="presentation">EXCEL</div>;
            }
        } },
        {field: 'action', headerName: '',sortable: false,width:70,headerAlign: 'left',disableColumnMenu :true,renderCell: ((param:{id:any,row:Accertamento}) => ( <DownloadIcon sx={{marginLeft:'10px',color: '#1976D2', cursor: 'pointer'}} onClick={()=> downloadAccertamento(param.id)}></DownloadIcon>)),}
    ];
    

    return (
        <div className="mx-5 mb-5">
            <div className="marginTop24 ">
                <Typography variant="h4">Documenti contabili</Typography>
            </div>
            <div className="mt-5">
                <div className="row">
                    <div className="col-3">
                        <SelectUltimiDueAnni values ={bodyAccertamenti} setValue={setBodyAccertamenti}></SelectUltimiDueAnni>
                    </div>
                    <div  className="col-3">
                        <SelectMese values={bodyAccertamenti} setValue={setBodyAccertamenti}></SelectMese>
                    </div>
                </div>
                <div className=" mt-5">
                    <div className="row">
                        <div className="col-1">
                            <Button 
                                onClick={onButtonFiltra} 
                                sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                                variant="contained"> Filtra
                            </Button>
                        </div>
                        <div className="col-2">
                            {bodyAccertamenti.mese === null ? null :
                                <Button
                                    onClick={onButtonAnnulla}
                                    sx={{marginLeft:'24px'}} >
                Annulla filtri
                                </Button>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-5 mb-5" style={{ width: '100%'}}>
                <div className="d-flex justify-content-end">
                    <Button onClick={()=> setShowPopUpMatrice(true)} variant="outlined">Matrice fornitori</Button>
                </div>
                <DataGrid sx={{
                    height:'400px',
                    '& .MuiDataGrid-virtualScroller': {
                        backgroundColor: 'white',
                    }
                }}
                onPaginationModelChange={(e)=> onChangePageOrRowGrid(e)}
                paginationModel={infoPageAccertamenti}
                rows={gridData} 
                columns={columns}
                getRowId={(row) => row.idReport}
                onRowClick={handleEvent}
                onCellClick={handleOnCellClick}
                />
            </div>
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
                <ModalMatriceAccertamenti 
                    open={showPopUpMatrice} 
                    setOpen={setShowPopUpMatrice}
                    data={dataMatrice}
                    setValue={setValueSelectMatrice}
                    value={valueSelectMatrice}
                    downloadDocMatrice={downloadDocMatrice}
                ></ModalMatriceAccertamenti>
            </div> 
        </div>
    );
};
        
export default Accertamenti;