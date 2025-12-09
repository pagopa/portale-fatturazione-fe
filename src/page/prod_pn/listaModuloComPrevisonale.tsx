import { GridElementListaCommesse } from "../../types/typeListaModuliCommessa";
import {  Params } from "../../types/typesGeneral";
import { manageError } from '../../api/api';
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getContrattoModuliCommessaPA } from "../../api/apiPagoPa/moduloComessaPA/api";
import { saveAs } from "file-saver";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { PathPf } from "../../types/enum";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import { listaEntiNotifichePage } from "../../api/apiSelfcare/notificheSE/api";
import { GlobalContext } from "../../store/context/globalContext";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { downloadDocumentoListaPrevisionaleaPagoPa, listaModuloCommessaPrevisonalePagopa } from "../../api/apiPagoPa/moduloPrevisionale/api";
import dayjs from "dayjs";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import { headersGridPrevisionale } from "../../assets/configurations/conf_GridModComPrevisionale";
import { mesiGrid } from "../../reusableFunction/reusableArrayObj";
import { transformDateTime } from "../../reusableFunction/function";
import { GridEventListener, GridRowParams, MuiEvent } from "@mui/x-data-grid";


export interface BodyPrevisionale {
    dataInizioModulo: string|null|Date
    dataFineModulo: string|null|Date
    idEnti: string[]
    idTipoContratto: number|null
    dataInizioContratto: string|null
    dataFineContratto: string|null
    page: number
    size: number
}

export interface ItemGridPrevisonale {
    id:number,
    ragioneSociale:string,
    anno:number,
    mese:number,
    stato:string,
    dataContratto:string,
    dataInserimento:string,
    dataChiusura:string,
}



const ListaCommessaPrevisionale:React.FC = () =>{
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

    const now = new Date();
    const defaultDataInizioModulo = new Date(now.getFullYear(), now.getMonth(), 1);

    const future = new Date(now.getFullYear(), now.getMonth() + 4, 1);
    const defaultDataFineModulo = new Date(future.getFullYear(), future.getMonth() + 1, 0);
  
 

    const [gridData, setGridData] = useState<ItemGridPrevisonale[]>([]);
    const [count, setCount] = useState(0);
    const [bodyGetLista, setBodyGetLista] = useState<BodyPrevisionale>({
        dataInizioModulo: defaultDataInizioModulo,
        dataFineModulo: defaultDataFineModulo,
        idEnti: [],
        idTipoContratto: null,
        dataInizioContratto: null,
        dataFineContratto: null,
        page: 0,
        size: 10
    });

    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [showLoading,setShowLoading] = useState(false);
    const [showLoadingLista,setShowLoadingLista] = useState(false);
    const [arrayContratto,setArrayContratto]= useState<{id:number,descrizione:string}[]>([{id:3,descrizione:"Tutti"}]);

    const [errorData, setErrorData] = useState(false);
    const [errorContratto, setErrorContratto] = useState(false);

   
    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.LISTA_MODULICOMMESSA_PREVISONALE,{});

    useEffect(()=>{
        getContratti();
    }, []);

    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){
                listaEntiNotifichePageOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);



  
    const getContratti = async() => {
  
        await getContrattoModuliCommessaPA(token, profilo.nonce).then((res)=>{
            setArrayContratto([{id:3,descrizione:"Tutti"}, ...res.data]);

            if(isInitialRender.current && Object.keys(filters).length > 0){
                setBodyGetLista(filters.body);
                setTextValue(filters.textValue);
                setValueAutocomplete(filters.valueAutocomplete);
                getListaCommesse(filters.body);
            }else{
              
                getListaCommesse(bodyGetLista);
                isInitialRender.current = false;
            }
        }).catch((err)=>{
            setArrayContratto([]);
            isInitialRender.current = false;
            manageError(err,dispatchMainState);
        });
    };

    const getListaCommesse = async(body) =>{
        const bodyFormattedDate = {
            ...body,
            dataInizioModulo:body.dataInizioModulo !== null ? dayjs(body.dataInizioModulo).format("YYYY-MM-DD"):null,
            dataFineModulo: body.dataFineModulo !== null ?dayjs(body.dataFineModulo).format("YYYY-MM-DD"):null,
            dataInizioContratto:body.dataInizioContratto !== null ?dayjs(body.dataInizioContratto).format("YYYY-MM-DD"):null,
            dataFineContratto:body.dataFineContratto !== null ?dayjs(body.dataFineContratto).format("YYYY-MM-DD"):null,
            page:body.page+1
        };

        setShowLoadingLista(true);
        await listaModuloCommessaPrevisonalePagopa(bodyFormattedDate ,token, profilo.nonce)
            .then((res)=>{
           
                setCount(res.data.count);
                const finalData = res.data.moduliCommessa.map(el => {
              
                    return {
                        id:el.ragioneSociale+el.annoValidita+el.meseValidita,
                        idTipoContratto: el.idTipoContratto,
                        meseValidita:el.meseValidita,
                        prodotto:el.prodotto,
                        idEnte:el.idEnte,
                        ragioneSociale:el.ragioneSociale,
                        annoValidita:el.annoValidita,
                        mese:mesiGrid[el.meseValidita],
                        stato:el.source||"--",
                        tipologiaContratto:el.tipologiaContratto||"--",
                        dataContratto:dayjs(el.dataContratto).format("YYYY-MM-DD"),
                        dataInserimento:dayjs(el.dataInserimento).format("YYYY-MM-DD"),
                        dataChiusura:dayjs(el.dataChiusura).format("YYYY-MM-DD"),
                        totaleNotificheDigitaleNaz:el.totaleNotificheDigitaleNaz !== null && el.totaleNotificheDigitaleNaz !== "" ? el.totaleNotificheDigitaleNaz :"--",
                        totaleNotificheDigitaleInternaz:el.totaleNotificheDigitaleInternaz !== null && el.totaleNotificheDigitaleInternaz !== "" ? el.totaleNotificheDigitaleInternaz:"--",
                        totaleNotificheAnalogicoARNaz:el.totaleNotificheAnalogicoARNaz !== null && el.totaleNotificheAnalogicoARNaz !== "" ? el.totaleNotificheAnalogicoARNaz:"--",
                        totaleNotificheAnalogicoARInternaz:el.totaleNotificheAnalogicoARInternaz !== null && el.totaleNotificheAnalogicoARInternaz !== "" ? el.totaleNotificheAnalogicoARInternaz:"--",
                        totaleNotificheAnalogico890Naz:(el.totaleNotificheAnalogico890Naz !== null && el.totaleNotificheAnalogico890Naz !== "") ? el.totaleNotificheAnalogico890Naz:"--",
                        totaleNotifiche:el.totaleNotifiche !== null && el.totaleNotifiche !== "" ? el.totaleNotifiche:"--",
                        action:""
                    };
                });

             
                setGridData(finalData);
                isInitialRender.current = false;
                setShowLoadingLista(false);
            }).catch((err)=>{
                setGridData([]);
                setCount(0);
                setBodyGetLista((prev)=> ({...prev,page:0}));
                manageError(err,dispatchMainState);
                isInitialRender.current = false;
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
        const bodyFormattedDate = {
            ...bodyGetLista,
            dataInizioModulo:bodyGetLista.dataInizioModulo !== null ? dayjs(bodyGetLista.dataInizioModulo).format("YYYY-MM-DD"):null,
            dataFineModulo: bodyGetLista.dataFineModulo !== null ?dayjs(bodyGetLista.dataFineModulo).format("YYYY-MM-DD"):null,
            dataInizioContratto:bodyGetLista.dataInizioContratto !== null ?dayjs(bodyGetLista.dataInizioContratto).format("YYYY-MM-DD"):null,
            dataFineContratto:bodyGetLista.dataFineContratto !== null ?dayjs(bodyGetLista.dataFineContratto).format("YYYY-MM-DD"):null,
            page:bodyGetLista.page+1
        };
        setShowLoading(true);
        await downloadDocumentoListaPrevisionaleaPagoPa(token, profilo.nonce,bodyFormattedDate).then((response) =>{
            if(response.status !== 200){
                setShowLoading(false);
                manageError({response:{request:{status:Number(response.status)}},message:''},dispatchMainState);
            }else{
                return response.blob();
            }
        }).then((res)=>{
            const formatInit = dayjs(bodyGetLista.dataInizioModulo).format("YYYY-MM-DD");
            const formatEnd = dayjs(bodyGetLista.dataFineModulo).format("YYYY-MM-DD");
   
            let fileName = `Moduli Commessa Previsonale.xlsx`;
            if(bodyGetLista.dataInizioModulo && !bodyGetLista.dataFineModulo && gridData.length > 1){
                fileName = `Moduli Commessa Previsonale/dal/${formatInit}.xlsx`;
            }else if(bodyGetLista.dataInizioModulo && bodyGetLista.dataFineModulo  && gridData.length > 1){
                fileName = `Moduli Commessa Previsonale/dal/${formatInit}/al/${formatEnd}.xlsx`;
            }else if((gridData.length === 1 || bodyGetLista.idEnti.length === 1) && !bodyGetLista.dataInizioModulo && !bodyGetLista.dataFineModulo){
                fileName = `Modulo Commessa Previsionale/${gridData[0]?.ragioneSociale}.xlsx`;
            }else if((gridData.length === 1 || bodyGetLista.idEnti.length === 1) && bodyGetLista.dataInizioModulo&& !bodyGetLista.dataFineModulo){
                fileName = `Modulo Commessa Previsionale/${gridData[0]?.ragioneSociale}/dal/${formatInit}.xlsx`;
            }else if((gridData.length === 1 || bodyGetLista.idEnti.length === 1) && bodyGetLista.dataInizioModulo && bodyGetLista.dataFineModulo ){
                fileName = `Modulo Commessa Previsionale/${gridData[0]?.ragioneSociale}/dal/${formatInit}/al/${formatEnd}.xlsx`;
            }
            saveAs(res,fileName);
            setShowLoading(false);
        }).catch((err)=>{
            setShowLoading(false);
            manageError(err,dispatchMainState);
        });
    };

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {

        setBodyGetLista((prev)=> {
            const newBody = {...prev,page:newPage};

            getListaCommesse(newBody);
            updateFilters(
                {
                    body:newBody,
                    pathPage:PathPf.LISTA_MODULICOMMESSA_PREVISONALE,
                });
            return newBody;
        }); 
    };
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setBodyGetLista((prev)=> {
            const newBody = {...prev,page:0,size:parseInt(event.target.value, 10)};
            getListaCommesse(newBody);
            updateFilters(
                {
                    body:newBody,
                    pathPage:PathPf.LISTA_MODULICOMMESSA_PREVISONALE,
                });
            return newBody;
        }); 
    };

    const clearOnChangeFilter = () => {
        setGridData([]);
        setCount(0);
    };

    const onButtonFiltra = () => {
        const bodyToSet = {...bodyGetLista, page: 0};
        getListaCommesse(bodyToSet);
        updateFilters(
            {
                body:bodyToSet,
                pathPage:PathPf.LISTA_MODULICOMMESSA_PREVISONALE,
                textValue,
                valueAutocomplete,
            });
    };

    const onButtonAnnulla = () =>{
        const defaultBody = {
            dataInizioModulo: defaultDataInizioModulo,
            dataFineModulo: defaultDataFineModulo,
            idEnti: [],
            idTipoContratto: null,
            dataInizioContratto: null,
            dataFineContratto: null,
            page: 0,
            size: 10
        };

        setBodyGetLista(defaultBody);
        getListaCommesse(defaultBody);
        setDataSelect([]);
        setValueAutocomplete([]);
        resetFilters();
    };

    const handleEvent = (el) => {
        handleModifyMainState({infoTrimestreComSelected:{
            meseCommessaSelected:el.meseValidita,
            annoCommessaSelectd:el.annoValidita,
            idTipoContratto: el.idTipoContratto,
            prodotto:el.prodotto,
            idEnte:el.idEnte,
            nomeEnteClickOn:el.ragioneSociale,
            from:PathPf.LISTA_MODULICOMMESSA_PREVISONALE
        }});

        navigate(PathPf.MODULOCOMMESSA);
        
    };


    const statusAnnulla = (
        bodyGetLista.idTipoContratto !== null ||
         bodyGetLista.idEnti.length > 0||
        bodyGetLista.dataInizioModulo !== defaultDataInizioModulo||
        bodyGetLista.dataFineModulo !== defaultDataFineModulo || 
        bodyGetLista.dataInizioContratto !== null ||
        bodyGetLista.dataFineModulo !== null
    )? "show":"hidden";


    return (
        <MainBoxStyled title={"Lista Modulo Commessa Previsonale"}>
            <ResponsiveGridContainer >
                <MainFilter 
                    filterName={"date_from_to"}
                    inputLabel={"Data inizio"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyValue={"dataInizioModulo"}
                    keyDescription="start"
                    keyCompare={"dataFineModulo"}
                    error={errorData}
                    setError={setErrorData}
                    keyBody="dataInizioModulo"
                ></MainFilter>
                <MainFilter 
                    filterName={"date_from_to"}
                    inputLabel={"Data fine"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyValue={"dataFineModulo"}
                    keyDescription="end"
                    keyCompare={"dataInizioModulo"}
                    error={errorData}
                    setError={setErrorData}
                    keyBody="dataFineModulo"
                ></MainFilter>    
                <MainFilter 
                    filterName={"date_from_to"}
                    inputLabel={"Data contratto da"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyValue={"dataInizioContratto"}
                    keyDescription="start"
                    keyCompare={"dataFineContratto"}
                    error={errorContratto}
                    setError={setErrorContratto}
                    keyBody="dataInizioContratto"
                ></MainFilter>
                <MainFilter 
                    filterName={"date_from_to"}
                    inputLabel={"Data contratto a"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyGetLista}
                    body={bodyGetLista}
                    keyValue={"dataFineContratto"}
                    keyDescription="end"
                    keyCompare={"dataInizioContratto"}
                    error={errorContratto}
                    setError={setErrorContratto}
                    keyBody="dataFineContratto"
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
            </ResponsiveGridContainer>
            <FilterActionButtons 
                onButtonFiltra={onButtonFiltra} 
                onButtonAnnulla={onButtonAnnulla} 
                statusAnnulla={statusAnnulla} 
                disabled={errorContratto || errorData}
            ></FilterActionButtons>
            <ActionTopGrid
                actionButtonRight={[{
                    onButtonClick:downloadExelListaCommessa,
                    variant: "outlined",
                    label: "Download risultati",
                    icon:{name:"download"},
                    disabled:(gridData.length === 0)
                }]}/>
            <GridCustom
                nameParameterApi='idPrevisonale'
                elements={gridData}
                changePage={handleChangePage}
                changeRow={handleChangeRowsPerPage} 
                total={count}
                page={bodyGetLista.page}
                rows={bodyGetLista.size}
                headerNames={headersGridPrevisionale(handleEvent)}
                disabled={showLoadingLista}
                widthCustomSize="2000px"
                body={bodyGetLista}
            ></GridCustom>
          
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
export default ListaCommessaPrevisionale;