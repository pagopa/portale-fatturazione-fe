
import { useContext, useEffect, useState } from "react";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { DataGrid, GridEventListener, GridRowParams, MuiEvent } from "@mui/x-data-grid";
import { Params } from "../../types/typesGeneral";
import { getAnniAccertamenti, getListaAccertamentiPagoPa, getListaAccertamentiPrenotazionePagoPa, getMatriceAccertamenti, getMatriceAccertamentiPagoPa, getMesiAccertamenti } from "../../api/apiPagoPa/accertamentiPA/api";
import { manageError, managePresaInCarico } from "../../api/api";
import { Accertamento, BodyAccertamenti } from "../../types/typeAccertamenti";
import ModalMatriceAccertamenti from "../../components/accertamenti/modalMatrice";
import { saveAs } from "file-saver";
import { GlobalContext } from "../../store/context/globalContext";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { getMessaggiCount } from "../../api/apiPagoPa/centroMessaggi/api";
import { headerColumsDocContabili } from "../../assets/configurations/conf_GridDocContabili";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { PathPf } from "../../types/enum";


export interface MatriceArray {
    dataInizioValidita: string,
    dataFineValidita: string
}

const Accertamenti : React.FC = () =>{

    const globalContextObj = useContext(GlobalContext);
    const {mainState,dispatchMainState,setCountMessages} = globalContextObj;

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    
    const [gridData, setGridData] = useState<Accertamento[]>([]);
    const [arrayYears,setArrayYears] = useState<number[]>([]);
    const [arrayMonths,setArrayMonths] = useState<{mese:string,descrizione:string}[]>([]);
    const [infoPageAccertamenti , setInfoPageAccertamenti] = useState({ page: 0, pageSize: 10 });
    const [showLoadingGrid,setShowLoadingGrid] = useState(false);
    const [showDownloading,setShowDownloading] = useState(false);
    const [showPopUpMatrice,setShowPopUpMatrice] = useState(false);
    const [dataMatrice, setDataMatrice] = useState<MatriceArray[]>([]);
    const [valueSelectMatrice,setValueSelectMatrice ] = useState('');
    const [bodyAccertamenti, setBodyAccertamenti] = useState<BodyAccertamenti>({
        anno:0,
        mese:null,
        tipologiaFattura:[],
        idEnti:[]
    });
    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.ACCERTAMENTI,{});
    
    useEffect(()=>{
        getAnni();
        getListaMatrice(); 
    },[]);


    const getAnni = async() => {
        setShowLoadingGrid(true);
        await getAnniAccertamenti(token, profilo.nonce).then((res)=>{
            const arrayNumber = res.data.map(el => Number(el.toString()));
            setArrayYears(arrayNumber);
            if(isInitialRender.current && Object.keys(filters).length > 0){
                getMesi(filters.body.anno?.toString());
            }else{
                setBodyAccertamenti((prev)=> ({...prev,...{anno:Number(res.data[0])}}));
                getMesi(res.data[0]);
                getListaAccertamenti(Number(res.data[0]),null);
            }
               
        }).catch((err)=>{
            setArrayYears([]);
            setShowLoadingGrid(false);
            manageError(err,dispatchMainState);
        });
    };

    const getMesi = async(year) =>{
        await getMesiAccertamenti(token, profilo.nonce,{anno:year}).then((res)=>{
            const mesiCamelCase = res.data.map(el => {
                el.descrizione = el?.descrizione.charAt(0).toUpperCase() + el.descrizione.slice(1).toLowerCase();
                return el;
            });
            setArrayMonths(mesiCamelCase);
            if(isInitialRender.current && Object.keys(filters).length > 0){
                setBodyAccertamenti(filters.body);
                getListaAccertamenti(filters.body.anno, filters.body.mese);
            }else{
                setBodyAccertamenti((prev)=> ({...prev, ...{anno:year,mese:null}}));
            }
        }).catch((err)=>{
            setArrayMonths([]);
            setBodyAccertamenti((prev)=> ({...prev,...{mese:null}}));
            setShowLoadingGrid(false);
            manageError(err,dispatchMainState);
        });
    };

    const getListaAccertamenti = async(anno,mese) => {
        setShowLoadingGrid(true);
        await getListaAccertamentiPagoPa(token, profilo.nonce, {anno,mese} )
            .then((res)=>{
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    setInfoPageAccertamenti({page:filters.page,pageSize:filters.rows});
                }
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

    const clearOnChangeFilter = () => {
        setGridData([]);
        setInfoPageAccertamenti({ page: 0, pageSize: 10 });
    };

    const onButtonFiltra = () =>{
        updateFilters({
            pathPage:PathPf.ACCERTAMENTI,
            body:bodyAccertamenti,
            page:0,
            rows:10,
        });
        getListaAccertamenti(bodyAccertamenti.anno, bodyAccertamenti.mese);
    };

    const onButtonAnnulla = () => {
        getListaAccertamenti(Number(arrayYears[0]),null);
        setBodyAccertamenti({
            anno:arrayYears[0],
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
                pathPage:PathPf.ACCERTAMENTI,
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

    return (
        <MainBoxStyled title={"Documenti contabili"}>
            <ResponsiveGridContainer >
                <MainFilter 
                    filterName={"select_value_string"}
                    inputLabel={"Anno"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyAccertamenti}
                    body={bodyAccertamenti}
                    keyDescription={"anno"}
                    keyValue={"anno"}
                    keyBody={"anno"}
                    arrayValues={arrayYears}
                    extraCodeOnChange={(e)=>{
                        const value = Number(e);
                        getMesi(value.toString());
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_key_value"}
                    inputLabel={"Mese"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyAccertamenti}
                    body={bodyAccertamenti}
                    keyValue={"mese"}
                    keyDescription='descrizione'
                    keyBody={"mese"}
                    arrayValues={arrayMonths}
                    extraCodeOnChange={(e)=>{
                        const value = Number(e);
                        setBodyAccertamenti((prev)=> ({...prev, ...{mese:value}}));
                    }}
                ></MainFilter>
            </ResponsiveGridContainer>
            <FilterActionButtons 
                onButtonFiltra={onButtonFiltra} 
                onButtonAnnulla={onButtonAnnulla} 
                statusAnnulla={bodyAccertamenti.mese === null  ? "hidden":"show"} 
            ></FilterActionButtons>
            <ActionTopGrid
                actionButtonRight={[{
                    onButtonClick:() => setShowPopUpMatrice(true),
                    variant: "outlined",
                    label: "Matrice fornitori",
                }]}/>
            <DataGrid sx={{
                height:'400px',
                '& .MuiDataGrid-virtualScroller': {
                    backgroundColor: 'white',
                },
                "& .MuiDataGrid-row": {
                    borderTop: "4px solid #F2F2F2",
                    borderBottom: "2px solid #F2F2F2",
                }
            }}
            rowHeight={60}
            onPaginationModelChange={(e)=> onChangePageOrRowGrid(e)}
            paginationModel={infoPageAccertamenti}
            rows={gridData} 
            columns={headerColumsDocContabili(downloadAccertamento)}
            getRowId={(row) => row.idReport}
            onRowClick={handleEvent}
            onCellClick={handleOnCellClick}
            pageSizeOptions={[10, 25, 50,100]}
            />
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
        </MainBoxStyled> 
    );
};
        
export default Accertamenti;