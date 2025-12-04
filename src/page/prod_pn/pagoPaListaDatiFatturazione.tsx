import { getTipologiaProfilo, manageError, } from '../../api/api';
import { BodyGetListaDatiFatturazione, GridElementListaFatturazione, ResponseDownloadListaFatturazione } from "../../types/typeListaDatiFatturazione";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {BodyListaDatiFatturazione, Params} from '../../types/typesGeneral';
import { DataGrid, GridRowParams,GridEventListener,MuiEvent } from '@mui/x-data-grid';
import { getTipologiaProdotto } from "../../api/apiSelfcare/moduloCommessaSE/api";
import { downloadDocumentoListaDatiFatturazionePagoPa, listaDatiFatturazionePagopa } from "../../api/apiPagoPa/datiDiFatturazionePA/api";
import { saveAs } from "file-saver";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { PathPf } from "../../types/enum";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import { listaEntiNotifichePage } from "../../api/apiSelfcare/notificheSE/api";
import { GlobalContext } from "../../store/context/globalContext";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { configListaFatturazione } from "../../assets/configurations/cong_GridListaDatiFatturazione";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { text } from 'node:stream/consumers';


const PagoPaListaDatiFatturazione:React.FC = () =>{
    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj;

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
   
    const navigate = useNavigate();
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const [prodotti, setProdotti] = useState([{nome:''}]);
    const [profili, setProfili] = useState(['']);
    const [gridData, setGridData] = useState<GridElementListaFatturazione[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [filtersDownload, setFiltersDownload] = useState<BodyGetListaDatiFatturazione>({idEnti:[],prodotto:'',profilo:''});
    const [getListaLoading, setGetListaLoading] = useState(false);
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [bodyGetLista, setBodyGetLista] = useState<BodyGetListaDatiFatturazione>({idEnti:[],prodotto:'',profilo:''});
    const [infoPageListaDatiFat , setInfoPageListaDatiFat] = useState({ page: 0, pageSize: 10 });
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [showLoading,setShowLoading] = useState(false);

    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.LISTA_DATI_FATTURAZIONE,{});

    useEffect(()=>{  
        getProdotti();
        getProfili();
    }, []);

    useEffect(()=>{
        if(bodyGetLista.idEnti?.length  !== 0 || bodyGetLista.prodotto !== '' || bodyGetLista.profilo !== ''){
            setStatusAnnulla('show');
        }else{
            setStatusAnnulla('hidden');
        }
    },[bodyGetLista]);

    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){ 
                listaEntiNotifichePageOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);

    const getProdotti = async() => {
        await getTipologiaProdotto(token,profilo.nonce )
            .then((res)=>{
                setProdotti(res.data);
            }).catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
    };

    const getProfili = async() => {
        await getTipologiaProfilo(token,profilo.nonce)
            .then((res)=>{
                setProfili(res.data);
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    getListaDatifatturazione(filters.body);
                    setBodyGetLista(filters.body);
                    setTextValue(filters.textValue);
                    setValueAutocomplete(filters.valueAutocomplete);
                    getListaDatifatturazione(filters.body);
                    setFiltersDownload(filters.body);
                    setInfoPageListaDatiFat({page:filters.page,pageSize:filters.rows});
                }else{
                    getListaDatifatturazione(bodyGetLista);
                }
            }).catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
    };

    const getListaDatifatturazione = async(body:BodyListaDatiFatturazione) =>{
        setGetListaLoading(true);
        await listaDatiFatturazionePagopa(body ,token,profilo.nonce)
            .then((res)=>{
                const editedData = res.data.map((el)=>{
                    return Object.fromEntries(
                        Object.entries(el).map(([key, value]) => [key, (value === null || value === "") ? "--" : value])
                    );
                });
                setGridData(editedData);
                setGetListaLoading(false);
                isInitialRender.current = false;
            }).catch(((err)=>{
                setGridData([]);
                setGetListaLoading(false);
                manageError(err,dispatchMainState);
                isInitialRender.current = false;
            })); 
    };


    // servizio che popola la select con la checkbox
    const listaEntiNotifichePageOnSelect = async () =>{
        if(profilo.auth === 'PAGOPA'){
            await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue} )
                .then((res)=>{
                    setDataSelect(res.data);
                }).catch(((err)=>{
                    manageError(err,dispatchMainState);  
                }));
        }
    };

    const onDownloadButton = async() =>{
        setShowLoading(true);
        await downloadDocumentoListaDatiFatturazionePagoPa(token,profilo.nonce, filtersDownload).then((res:ResponseDownloadListaFatturazione) => {
            let fileName = `Lista dati di fatturazione.xlsx`;
            if(gridData.length === 1){
                fileName = `Dati di fatturazione / ${gridData[0]?.ragioneSociale}.xlsx`;
            }
            saveAs("data:text/plain;base64," + res.data.documento,fileName);
            setShowLoading(false);
        }).catch(err => {
            manageError(err,dispatchMainState);
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
        // l'evento verrà eseguito solo se l'utente farà il clik sul 
        if(columsSelectedGrid  === 'ragioneSociale' || columsSelectedGrid === 'action' ){
            const oldProfilo = mainState.profilo;
            handleModifyMainState({profilo:{...oldProfilo,...{idEnte:params.row.idEnte,prodotto:params.row.prodotto}},nomeEnteClickOn:params.row.ragioneSociale});
            navigate(PathPf.DATI_FATTURAZIONE);
        }
    };


    const clearOnChangeFilter = () => {
        setGridData([]);
        setInfoPageListaDatiFat({ page: 0, pageSize: 10 });
    };


    const onButtonFiltra = () => {
        getListaDatifatturazione(bodyGetLista);
        setInfoPageListaDatiFat({ page: 0, pageSize: 10 });
        setFiltersDownload(bodyGetLista);
        updateFilters(
            {
                body:bodyGetLista,
                pathPage:PathPf.LISTA_DATI_FATTURAZIONE,
                textValue,
                valueAutocomplete,
                page:0,
                rows:10
            });
    };

    const onButtonAnnulla = () => {
        setBodyGetLista({idEnti:[],prodotto:'',profilo:''});
        setInfoPageListaDatiFat({ page: 0, pageSize: 10 });
        getListaDatifatturazione({idEnti:[],prodotto:'',profilo:''});
        setFiltersDownload({idEnti:[],prodotto:'',profilo:''});
        setDataSelect([]);
        setValueAutocomplete([]);
        resetFilters();
    };

    const onChangePageOrRowGrid = (e) => {
        updateFilters(
            {
                body:filtersDownload,
                pathPage:PathPf.LISTA_DATI_FATTURAZIONE,
                textValue,
                valueAutocomplete,
                page:e.page,
                rows:e.pageSize
            });
        setInfoPageListaDatiFat(e);
    };
      
    return(
        <MainBoxStyled title={"Lista Dati Fatturazione"}>
            <ResponsiveGridContainer >
                <MainFilter 
                    filterName={"select_value_string"}
                    inputLabel={"Seleziona profilo"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyDescription={"profilo"}
                    keyValue={"profilo"}
                    keyBody={"profilo"}
                    arrayValues={profili}
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Rag. Soc. Ente"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyCompare={""}
                    dataSelect={dataSelect}
                    setTextValue={setTextValue}
                    textValue={textValue}
                    valueAutocomplete={valueAutocomplete}
                    setValueAutocomplete={setValueAutocomplete}
                    keyDescription={"descrizione"}
                    keyValue={"idEnte"}
                    keyOption='descrizione'
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
                    onButtonClick:onDownloadButton,
                    variant: "outlined",
                    label: "Download risultati",
                    icon:{name:"download"},
                    disabled:(gridData.length === 0 || getListaLoading)
                }]}/>
           
            <div className="mt-1 mb-5" style={{ width: '100%'}}>
                <DataGrid 
                    sx={{
                        height:gridData.length < 5 ?"400px" :"auto",
                        '& .MuiDataGrid-virtualScroller': {
                            backgroundColor: 'white',
                        },
                        "& .MuiDataGrid-row": {
                            borderTop: "4px solid #F2F2F2",
                            borderBottom: "2px solid #F2F2F2",
                        },
                        "& .MuiDataGrid-overlay": {
                            backgroundColor: "white",
                        },
                    }}
                    rowHeight={80}
                    pageSizeOptions={[10, 25, 50,100]}
                    onPaginationModelChange={(e)=> onChangePageOrRowGrid(e)}
                    paginationModel={infoPageListaDatiFat}
                    rows={gridData} 
                    columns={configListaFatturazione}
                    getRowId={(row) => row.key}
                    onRowClick={handleEvent}
                    onCellClick={handleOnCellClick}
                />
            </div>
            <ModalLoading 
                open={getListaLoading} 
                setOpen={setGetListaLoading}
                sentence={'Loading...'} >
            </ModalLoading>
            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading}
                sentence={'Downloading...'} >
            </ModalLoading>
        </MainBoxStyled>
    );
}; 
export default PagoPaListaDatiFatturazione;