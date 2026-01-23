import React, {  useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import { getMesiRelSend } from "../../api/apiSelfcare/relSE/api";
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
import { anniMesiDocumentiEmessi, downloadFattureEnte, getFatturazioneEnte, getTipologieFaEnte } from "../../api/apiSelfcare/apiDocEmessiSE/api";
import CollapsibleTableStandard from "../../components/reusableComponents/grid/gridCollapsible/gridCollapsibleDocEmessiEnte";
import { headersObjGrid } from "../../assets/configurations/config_GridFatturazione";
import { ManageErrorResponse } from "../../types/typesGeneral";


export type BodyDocumentiEmessiEnte = {
    anno:number|null,
    mese:number,
    tipologiaFattura:string[]
}


const DocEm : React.FC = () =>{
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
    const currentYear = (new Date()).getFullYear();
    const currentMonth = (new Date()).getMonth() + 1;
    const monthNumber = Number(currentMonth);

    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.DOCUMENTI_EMESSI,{});


    //______________________NEW_________________
    const [years,setYears] = useState<number[]>([]);
    const [monthsFat,setMonthsFat] = useState<{[key:number]:number[]}>({});
    const [yearMonths, setYearMonths] = useState<number[]>([]);
    const [dataSelect, setDataSelect] = useState<string[]>([]);

    //____________________________________



    const [data, setData] = useState<any[]>([]);
    const [gridData, setGridData] = useState<any[]>([]);
    const [totalNotifiche, setTotalNotifiche]  = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const [showLoadingGrid,setShowLoadingGrid] = useState(false);
    const [showDownloading,setShowDownloading] = useState(false);
    
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<string[]>([]);
    const [tipologie, setTipologie] = useState<string[]>([]);
    const [valueMulitselectTipologie, setValueMultiselectTipologie] = useState<OptionMultiselectChackbox[]>([]);
    const [showedData, setShowedData] = useState<any[]>([]);
    const [tipologiaFatture, setTipologiaFatture] = useState<string[]>([]);
    const [valuetipologiaFattura, setValueTipologiaFattura] = useState<string>('');
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
    const [getListaRelRunning, setGetListaRelRunning] = useState(false);
    const [showLoading, setShowLoading] = useState(false);

  
    const [bodyFatturazione, setBodyFatturazione] = useState<BodyDocumentiEmessiEnte>({
        anno:null,
        mese:monthNumber,
        tipologiaFattura:[]
    });

    const [bodyFatturazioneDownload, setBodyFatturazioneDownload] = useState<BodyDocumentiEmessiEnte>({
        anno:currentYear,
        mese:monthNumber,
        tipologiaFattura:[]
    });

    const [arrayYears,setArrayYears] = useState<number[]>([]);

    
    useEffect(()=>{
        getAnniMesi();
    },[]);


    const getAnniMesi = async () => {
        try {
            const res = await anniMesiDocumentiEmessi(token, profilo.nonce);
    
            const allAnni = res.data.map((item: { anno: number }) => item.anno);
            const anni: number[] = Array.from(new Set(allAnni));
    
            const mesi = res.data.reduce((acc, { anno, mese }) => {
                if (!acc[anno]) acc[anno] = [];
                acc[anno].push(mese);
                return acc;
            }, {} as Record<number, number[]>);

            setMonthsFat(mesi);
            setYears(anni);
            
            const currentYear = anni[0];
    
            if (isInitialRender.current && Object.keys(filters).length > 0) {
                setYearMonths(mesi[filters.body.anno]);
            }else {
                setYearMonths(mesi[currentYear]);
                setBodyFatturazione((prev)=> ({...prev,anno:currentYear,mese:mesi[currentYear][0]}));
                getTipologieFatturazione({anno:currentYear,mese:mesi[currentYear][0]});
                getlistaFatturazione({...bodyFatturazione,anno:currentYear,mese:mesi[currentYear][0]});
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


    const getTipologieFatturazione =  async(body) => {
        await getTipologieFaEnte(token, profilo.nonce, body)
            .then((res)=>{
                setDataSelect(res.data);              
            })
            .catch(((err)=>{
                setDataSelect([]);
                manageError(err,dispatchMainState);
            }));
    };
    
    const getlistaFatturazione = async (body) => {
        setShowLoadingGrid(true);

        await  getFatturazioneEnte(token,profilo.nonce,body)
            .then((res)=>{
                const orderDataCustom = res.data.map(el => el.fattura).map(obj=> ({...{id:Math.random()},...obj}));
                setGridData(orderDataCustom);
                setShowLoadingGrid(false);
                setBodyFatturazioneDownload(bodyFatturazione);
            }).catch((error)=>{
                if(error?.response?.status === 404){
                    setGridData([]);
                }
                setShowLoadingGrid(false);
                manageError(error, dispatchMainState);
            });        
    };

    const downloadListaFatturazione = async () => {
        setShowDownloading(true);
        await downloadFattureEnte(token,profilo.nonce, bodyFatturazioneDownload).then(response => response.blob()).then((response)=>{
            const title = `Documenti emessi/ ${gridData[0]?.ragionesociale}/${month[bodyFatturazioneDownload.mese - 1]}/${bodyFatturazioneDownload.anno}.xlsx`;
            saveAs(response,title);
            setShowDownloading(false);
        }).catch(((err)=>{
            setShowDownloading(false);
            manageError(err,dispatchMainState);
        }));
    };

    const clearOnChangeFilter = () => {
        setGridData([]);
        setTotalNotifiche(0);
        setPage(0);
        setRowsPerPage(10); 
    };

    const onButtonFiltra = () =>{
        updateFilters({
            pathPage:PathPf.DOCUMENTI_EMESSI,
            body:bodyFatturazione,
            page:0,
            rows:10,
            valuetipologiaFattura
        });
        setPage(0);
        setRowsPerPage(10);
        setBodyFatturazioneDownload(bodyFatturazione);
        getlistaFatturazione(bodyFatturazione); 
    };
    
    const onButtonAnnulla = async () => {
        let firstMonth = {mese:0};
           
        firstMonth = await getMesiRelSend(token, profilo.nonce,{anno:arrayYears[0]?.toString()})
            .then(res => res.data[0])
            .catch(err => manageError(err,dispatchMainState));
       
        setBodyFatturazione({
            anno:currentYear,
            mese:monthNumber,
            tipologiaFattura:[],
        });
        setBodyFatturazioneDownload({
            anno:arrayYears[0],
            mese:firstMonth.mese,
            tipologiaFattura:[],
        });
        setValueTipologiaFattura('');
        setData([]);
        setPage(0);
        setRowsPerPage(10);
        setValueAutocomplete([]);
        getlistaFatturazione({
            anno:arrayYears[0],
            mese:firstMonth.mese,
            tipologiaFattura:null,
            idEnti:[],
            idContratto:null,
            caricata:null
        });
        resetFilters();
        
    };

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        const realPage = newPage + 1;
        getlistaFatturazione(bodyFatturazione);
        setPage(newPage);
        updateFilters({
            pathPage:PathPf.DOCUMENTI_EMESSI,
            body:bodyFatturazioneDownload,
            valueAutocomplete:valueAutocomplete,
            page:newPage,
            rows:rowsPerPage,
            valuetipologiaFattura
        });
    };
                        
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        getlistaFatturazione(bodyFatturazione);
        updateFilters({
            pathPage:PathPf.DOCUMENTI_EMESSI,
            body:bodyFatturazione,
            valueAutocomplete:valueAutocomplete,
            page:0,
            rows:parseInt(event.target.value, 10),
            valuetipologiaFattura
        });
    };

    const setIdRel = async(el) => {
        handleModifyMainState({relSelected:el});
        navigate(PathPf.DOCUMENTI_EMESSI);
    };  


    const statusAnnulla = bodyFatturazione.tipologiaFattura.length !== 0 ? "show" : "hidden";
  
    return (
        <MainBoxStyled title={"Documenti contabili emessi"} actionButton={[]}>
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
                    arrayValues={years}
                    extraCodeOnChange={(e)=>{
                        setYearMonths(monthsFat[Number(e)]);
                        setBodyFatturazione((prev)=> ({...prev, ...{anno:Number(e),mese:monthsFat[Number(e)][0]}}));
                        getTipologieFatturazione({anno:Number(e),mese:monthsFat[Number(e)][0]});
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_value_string"}
                    inputLabel={"Mese"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    body={bodyFatturazione}
                    keyDescription={"mese"}
                    keyBody={"mese"}
                    keyValue={"mese"}
                    arrayValues={yearMonths}
                    extraCodeOnChange={(e)=>{
                        setBodyFatturazione((prev)=> ({...prev, mese:Number(e)}));
                        getTipologieFatturazione({anno:bodyFatturazione.anno,mese:Number(e)});
                    }}
                    defaultValue={""}
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Tipologia Fattura"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    dataSelect={dataSelect}
                    valueAutocomplete={valueAutocomplete}
                    setValueAutocomplete={setValueAutocomplete}
                    body={bodyFatturazione}
                    keyDescription={"tipologiaFattura"}
                    keyValue={"tipologiaFattura"}
                    keyBody={"tipologiaFattura"}
                    arrayValues={tipologiaFatture}
                    extraCodeOnChangeArray={(e)=>{
                        setValueAutocomplete(e);
                        setBodyFatturazione((prev) => ({...prev,...{tipologiaFattura:e}}));
                    }}
                    iconMaterial={RenderIcon("invoice",true)}
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
                    disabled:(data.length === 0)
                }]}
                actionButtonLeft={[]}/>
           
            <CollapsibleTableStandard 
                data={gridData}
                showedData={showedData}
                setShowedData={setShowedData}
                headerNames={headersObjGrid}></CollapsibleTableStandard>
            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading} 
                sentence={'Downloading...'}>
            </ModalLoading>
            <ModalRedirect
                setOpen={setOpenModalRedirect} 
                open={openModalRedirect}
                sentence={`Per poter visualizzare il dettaglio dei Documenti EMESSI è obbligatorio fornire i seguenti dati di fatturazione:`}>
            </ModalRedirect>
            <ModalLoading 
                open={getListaRelRunning} 
                setOpen={setGetListaRelRunning} 
                sentence={'Loading...'}>
            </ModalLoading>
        </MainBoxStyled>
        
    );
};

export default DocEm;
