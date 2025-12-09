import { BodyDownloadModuliCommessa, GridElementListaCommesse } from "../../types/typeListaModuliCommessa";
import { ManageErrorResponse, Params } from "../../types/typesGeneral";
import { manageError } from '../../api/api';
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { DataGrid, GridRowParams,GridEventListener,MuiEvent} from '@mui/x-data-grid';
import { anniMesiModuliCommessa, downloadDocumentoListaModuloCommessaPagoPa, downloadPostalizzazioneReport, getContrattoModuliCommessaPA, listaModuloCommessaPagopa } from "../../api/apiPagoPa/moduloComessaPA/api";
import { saveAs } from "file-saver";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { PathPf } from "../../types/enum";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import { mesiWithZero } from "../../reusableFunction/reusableArrayObj";
import { listaEntiNotifichePage } from "../../api/apiSelfcare/notificheSE/api";
import { GlobalContext } from "../../store/context/globalContext";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { headerNameListaModuliCommessaSEND } from "../../assets/configurations/conf_GridListaModuliCommessaSend";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { currentMonth } from "../../reusableFunction/function";


const PagoPaListaModuliCommessa:React.FC = () =>{
    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();


    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    const [gridData, setGridData] = useState<GridElementListaCommesse[]>([]);
    const [bodyGetLista, setBodyGetLista] = useState<BodyDownloadModuliCommessa>({idEnti:[],idTipoContratto:null, anno:0, mese:0});
    const [infoPageListaCom , setInfoPageListaCom] = useState({ page: 0, pageSize: 10 });
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [bodyDownload, setBodyDownload] = useState<BodyDownloadModuliCommessa>({idEnti:[],idTipoContratto:null, anno:0, mese:0});
    const [showLoading,setShowLoading] = useState(false);
    const [showLoadingLista,setShowLoadingLista] = useState(false);
    const [arrayContratto,setArrayContratto]= useState<{id:number,descrizione:string}[]>([{id:3,descrizione:"Tutti"}]);
    const [years,setYears] = useState<number[]>([]);
    const [monthsCommessa,setMonthsCommessa] = useState<{[key:number]:number[]}>({});
    const [yearMonths, setYearMonths] = useState<number[]>([]);

    const defaultYearMonth = useRef<{year:number,month:number}>({year:0,month:0});
   
    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.LISTA_MODULICOMMESSA,{});

    useEffect(()=>{
        getAnniMesi();
    }, []);

    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){
                listaEntiNotifichePageOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);


    const getAnniMesi = async () => {
        try {
            const res = await anniMesiModuliCommessa(token, profilo.nonce);

            const allAnni = res.data.map((item: { anno: number }) => item.anno);
            const anni: number[] = Array.from(new Set(allAnni));

            const mesi = res.data.reduce((acc, { anno, mese }) => {
                if (!acc[anno]) acc[anno] = [];
                acc[anno].push(mese);
                return acc;
            }, {} as Record<number, number[]>);

            setMonthsCommessa(mesi);
            setYears(anni);
        
            let yearSelected;
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;

       
            if(anni.includes(currentYear) && currentMonth !== 12){
                yearSelected = currentYear;
            }else if(anni.includes(currentYear) && anni.includes(currentYear+1) && currentMonth === 12){
                yearSelected = currentYear+1;
            }else{
                yearSelected = currentYear;
            }

            if (isInitialRender.current && Object.keys(filters).length > 0) {
                setYearMonths(mesi[filters.body.anno]);
            }else {
                setYearMonths(mesi[yearSelected]);
            }
     

            let mese_X_plus_one;
            if(((new Date().getMonth() + 1) === 12) && mesi[yearSelected].includes(1) && anni.includes(currentYear+1) ){
                mese_X_plus_one = 1;
                defaultYearMonth.current= {year:yearSelected,month:mese_X_plus_one}; 
            }else if(((new Date().getMonth() + 1) !== 12)&& mesi[yearSelected].includes(new Date().getMonth() + 2)){
                mese_X_plus_one = new Date().getMonth() + 2;
                defaultYearMonth.current= {year:yearSelected,month:mese_X_plus_one};
            }else{
                mese_X_plus_one = mesi[yearSelected].at(0);
                defaultYearMonth.current= {year:yearSelected,month:mese_X_plus_one};
            }
            
            
            if (isInitialRender.current && Object.keys(filters).length > 0) {
                await getContratti(filters.body.anno, filters.body.mese);
            }else{
                await getContratti(yearSelected, mese_X_plus_one);
            }
            
          
            
        
            
        } catch (err) {
            if (err && typeof err === "object") {
                manageError(err as ManageErrorResponse, dispatchMainState);
            } else {
                // fallback for unexpected errors
                manageError({ message: String(err) } as ManageErrorResponse, dispatchMainState);
            }
        }
    };

  
    const getContratti = async(y,m) => {
        await getContrattoModuliCommessaPA(token, profilo.nonce).then((res)=>{
          
            setArrayContratto([{id:3,descrizione:"Tutti"}, ...res.data]);
            if(isInitialRender.current && Object.keys(filters).length > 0){
                setBodyGetLista(filters.body);
                setTextValue(filters.textValue);
                setValueAutocomplete(filters.valueAutocomplete);
                getListaCommesse(filters.body);
                setBodyDownload(filters.body);
                setInfoPageListaCom({page:filters.page,pageSize:filters.rows});
            }else{
                setBodyGetLista({...bodyGetLista,anno:y,mese:m});
                setBodyDownload({...bodyGetLista,anno:y,mese:m});
                getListaCommesse({...bodyGetLista,anno:y,mese:m});
                isInitialRender.current = false;
            }
        }).catch((err)=>{
            setArrayContratto([{id:3,descrizione:"Tutti"}]);
            isInitialRender.current = false;
            manageError(err,dispatchMainState);
        });
    };

    const getListaCommesse = async(body) =>{
        setShowLoadingLista(true);
        await listaModuloCommessaPagopa(body ,token, profilo.nonce)
            .then((res)=>{
               
                setGridData(res.data);
                isInitialRender.current = false;
                setShowLoadingLista(false);
            }).catch((err)=>{
                setGridData([]);
                manageError(err,dispatchMainState);
                isInitialRender.current = false;
                setShowLoadingLista(false);
            }); 
    };

    const getListaCommesseOnAnnulla = async() =>{
        setShowLoadingLista(true);
        
        await listaModuloCommessaPagopa({idEnti:[],idTipoContratto:null, anno:defaultYearMonth.current.year, mese:defaultYearMonth.current.month} ,token, profilo.nonce)
            .then((res)=>{
                setGridData(res.data);
                setShowLoadingLista(false);
            }).catch((err)=>{
                manageError(err,dispatchMainState);
                setShowLoadingLista(false);
            }); 
    };

    const listaEntiNotifichePageOnSelect = async () =>{
        if(profilo.auth === 'PAGOPA'){
            await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue} )
                .then((res)=>{
                    setDataSelect(res.data) ;
                }).catch(((err)=>{
                    manageError(err,dispatchMainState);
                }));
        }
    };

    const downloadExelListaCommessa = async () =>{
        setShowLoading(true);
        await downloadDocumentoListaModuloCommessaPagoPa(token, profilo.nonce,bodyDownload)
            .then((res)=>{
                let fileName = `Moduli Commessa/${mesiWithZero[Number(bodyDownload.mese) -1]}/${bodyDownload.anno}.xlsx`;
                if(gridData.length === 1){
                    fileName = `Modulo Commessa/${gridData[0]?.ragioneSociale} /${mesiWithZero[Number(bodyDownload.mese) -1]}/${bodyDownload.anno}.xlsx`;
                }
                saveAs("data:text/plain;base64," + res.data.documento,fileName);
                setShowLoading(false);
            }).catch((err)=>{
                setShowLoading(false);
                manageError(err,dispatchMainState);
            });
    };


    const downloadPostalizzazione = async () => {
        setShowLoading(true);
        await  downloadPostalizzazioneReport(token,profilo.nonce, bodyDownload).then(response => response.blob()).then((res)=>{
            saveAs( res,`Report postalizzazione/${mesiWithZero[Number(bodyDownload.mese) -1]}/${bodyDownload.anno}.xlsx` );
            setShowLoading(false);
         
        }).catch((err)=>{
            manageError(err,globalContextObj.dispatchMainState);
            setShowLoading(false);
        }); 
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
        // l'evento verrà eseguito solo se l'utente farà il clik sul  mese e action
        if(columsSelectedGrid  === 'regioneSociale' || columsSelectedGrid  === 'action' ){
            handleModifyMainState({infoTrimestreComSelected:{
                meseCommessaSelected:params.row.meseValidita,
                annoCommessaSelectd:params.row.annoValidita,
                idTipoContratto: params.row.idTipoContratto,
                prodotto:params.row.prodotto,
                idEnte:params.row.idEnte,
                nomeEnteClickOn:params.row.ragioneSociale,
                from:PathPf.LISTA_MODULICOMMESSA

            }});
            navigate(PathPf.MODULOCOMMESSA);
        }
    };

    const onChangePageOrRowGrid = (e) => {
        updateFilters(
            {
                body:bodyDownload,
                pathPage:PathPf.LISTA_MODULICOMMESSA,
                textValue,
                valueAutocomplete,
                page:e.page,
                rows:e.pageSize
            });
        setInfoPageListaCom(e);
    };

    const clearOnChangeFilter = () => {
        setGridData([]);
        setInfoPageListaCom({ page: 0, pageSize: 10 });  
    };

    const onButtonFiltra = () => {
        setInfoPageListaCom({ page: 0, pageSize: 10 });
        getListaCommesse(bodyGetLista);
        setBodyDownload(bodyGetLista);
        updateFilters(
            {
                body:bodyGetLista,
                pathPage:PathPf.LISTA_MODULICOMMESSA,
                textValue,
                valueAutocomplete,
                page:0,
                rows:10
            });
    };

    const onButtonAnnulla = () =>{
        setInfoPageListaCom({ page: 0, pageSize: 10 });
        getListaCommesseOnAnnulla();
        setBodyGetLista({idEnti:[],idTipoContratto:null, anno:defaultYearMonth.current.year, mese:defaultYearMonth.current.month});
        setBodyDownload({idEnti:[],idTipoContratto:null, anno:defaultYearMonth.current.year, mese:defaultYearMonth.current.month});
        setDataSelect([]);
        setValueAutocomplete([]);
        resetFilters();
    };


    const statusAnnulla = (bodyGetLista.idTipoContratto !== null || bodyGetLista.idEnti.length > 0)? "show":"hidden";

    return (
        <MainBoxStyled title={"Lista Modulo Commessa Fatturabile"}>
            <ResponsiveGridContainer >
                <MainFilter 
                    filterName={"select_value_string"}
                    inputLabel={"Anno"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyDescription={"anno"}
                    keyValue={"anno"}
                    keyBody={"anno"}
                    arrayValues={years}
                    extraCodeOnChange={(e)=>{
                        setYearMonths(monthsCommessa[Number(e)]);
                        setBodyGetLista((prev)=> ({...prev, ...{anno:Number(e),mese:monthsCommessa[Number(e)][0]}}));
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_value_string"}
                    inputLabel={"Mese"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyDescription={"mese"}
                    keyBody={"mese"}
                    keyValue={"mese"}
                    arrayValues={yearMonths}
                    defaultValue={""}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_key_value"}
                    inputLabel={"Tipologia contratto"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyDescription={"descrizione"}
                    keyBody={"idTipoContratto"}
                    keyValue={"id"}
                    arrayValues={arrayContratto}
                    defaultValue={"3"}
                    extraCodeOnChange={(e)=>{
                        const val = (Number(e) === 3) ? null : Number(e);
                        setBodyGetLista((prev)=>({...prev,...{idTipoContratto:val}}));
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Rag. Soc. Ente"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    dataSelect={dataSelect}
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
                statusAnnulla={statusAnnulla} 
            ></FilterActionButtons>
            <ActionTopGrid
                actionButtonRight={[{
                    onButtonClick:downloadExelListaCommessa,
                    variant: "outlined",
                    label: "Download risultati",
                    icon:{name:"download"},
                    disabled:(gridData.length === 0)
                },{
                    onButtonClick:downloadPostalizzazione,
                    variant: "outlined",
                    label: "Report postalizzazione",
                    icon:{name:"download"},
                    disabled:(gridData.length === 0)
                }]}/>
          
            <div className="mt-1 mb-5" style={{ width: '100%'}}>
                <DataGrid sx={{
                    height:gridData.length < 5 ?"400px" :"auto",
                    '& .MuiDataGrid-virtualScroller': {
                        backgroundColor: 'white',
                    },
                    "& .MuiDataGrid-row": {
                        borderTop: "4px solid #F2F2F2",
                        borderBottom: "2px solid #F2F2F2",
                    }
                }}
                rowHeight={80}
                rows={gridData} 
                columns={headerNameListaModuliCommessaSEND}
                getRowId={(row) => `${row.idEnte}_${row.meseValidita}_${row.annoValidita}`}
                onRowClick={handleEvent}
                onCellClick={handleOnCellClick}
                onPaginationModelChange={(e)=> onChangePageOrRowGrid(e)}
                paginationModel={infoPageListaCom}
                pageSizeOptions={[10, 25, 50,100]}
                />
            </div>
            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading}
                sentence={'Downloading...'} >
            </ModalLoading>
            <ModalLoading 
                open={showLoadingLista} 
                setOpen={setShowLoadingLista}
                sentence={'Loading...'} >
            </ModalLoading>
        </MainBoxStyled>
    );
};
export default PagoPaListaModuliCommessa;