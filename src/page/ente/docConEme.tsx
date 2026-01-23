import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { profiliEnti,  } from "../../reusableFunction/actionLocalStorage";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import { downloadListaRel, getAnniRelSend, getListaRel, getMesiRelSend, getTipologieFatture } from "../../api/apiSelfcare/relSE/api";
import { mesiGrid, mesiWithZero, month } from "../../reusableFunction/reusableArrayObj";
import { downloadListaRelPagopa, downloadListaRelPdfZipPagopa, downloadQuadraturaRelPagopa, downloadReportRelPagoPa, getAnniRel, getListaRelPagoPa, getMesiRel, getTipologieContrattoRel, getTipologieFatturePagoPa } from "../../api/apiPagoPa/relPA/api";
import { listaEntiNotifichePage } from "../../api/apiSelfcare/notificheSE/api";
import { PathPf } from "../../types/enum";
import { saveAs } from "file-saver";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import ModalRedirect from "../../components/commessaInserimento/madalRedirect";
import { manageError, manageErrorDownload } from "../../api/api";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { Rel, BodyRel } from "../../types/typeRel";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import { downloadFattureEnte, getFatturazioneEnte, getTipologieFaEnte } from "../../api/apiSelfcare/apiDocEmessiSE/api";


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
    const [data, setData] = useState<any[]>([]);
    const [gridData, setGridData] = useState<any[]>([]);
    const [totalNotifiche, setTotalNotifiche]  = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const [showLoadingGrid,setShowLoadingGrid] = useState(false);
    const [showDownloading,setShowDownloading] = useState(false);
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState<string>('hidden');
    const [tipologie, setTipologie] = useState<string[]>([]);
    const [valueMulitselectTipologie, setValueMultiselectTipologie] = useState<string[]>([]);
    const [showedData, setShowedData] = useState<any[]>([]);
    const [tipologiaFatture, setTipologiaFatture] = useState<string[]>([]);
    const [valuetipologiaFattura, setValueTipologiaFattura] = useState<string>('');
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
    const [getListaRelRunning, setGetListaRelRunning] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [bodyDownload, setBodyDownload] = useState<BodyRel>({
        anno:0,
        mese:0,
        tipologiaFattura:null,
        idEnti:[],
        idContratto:null,
        caricata:null,
        idTipoContratto:null
    });
    const [bodyRel, setBodyRel] = useState<BodyRel>({
        anno:0,
        mese:0,
        tipologiaFattura:null,
        idEnti:[],
        idContratto:null,
        caricata:null,
        idTipoContratto:null
    });
  
    const [bodyFatturazione, setBodyFatturazione] = useState<any>({
        anno:currentYear,
        mese:monthNumber,
        tipologiaFattura:[],
        idEnti:[]
    });
    const [bodyFatturazioneDownload, setBodyFatturazioneDownload] = useState<any>({
        anno:currentYear,
        mese:monthNumber,
        tipologiaFattura:[],
        idEnti:[]
    });

    const [arrayYears,setArrayYears] = useState<number[]>([]);

    
    useEffect(()=>{
      
        getlistaFatturazione(bodyFatturazione);
        
    },[]);

    useEffect(()=>{
        if(bodyFatturazione.idEnti.length !== 0 || bodyFatturazione.tipologiaFattura.length !== 0 ){
            setStatusAnnulla('show');
        }else{
            setStatusAnnulla('hidden');
        }
    },[bodyFatturazione]);

  
    useEffect(()=>{
       
        getTipologieFatturazione();
        setValueMultiselectTipologie([]);
        
    },[bodyFatturazione.mese,bodyFatturazione.anno]);


  

    const getTipologieFatturazione =  async() => {
        await getTipologieFaEnte(token, profilo.nonce, {anno:bodyFatturazione.anno,mese:bodyFatturazione.mese}  )
            .then((res)=>{
                setTipologie(res.data);
                setBodyFatturazione((prev)=>({...prev,...{tipologiaFattura:[]}}));
                setBodyFatturazioneDownload((prev)=>({...prev,...{tipologiaFattura:[]}}));
                            
            })
            .catch(((err)=>{
                setTipologie([]);
                setBodyFatturazione((prev)=>({...prev,...{tipologiaFattura:[]}}));
                setBodyFatturazioneDownload((prev)=>({...prev,...{tipologiaFattura:[]}}));
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

    const getListTipologiaFattura = async(anno,mese) => {
     
        await getTipologieFatture(token, profilo.nonce, {mese,anno}).then((res)=>{
            setTipologiaFatture(res.data);
            if(filters.valuetipologiaFattura){
                setValueTipologiaFattura(filters.valuetipologiaFattura);
            }else{
                setValueTipologiaFattura('');
            }
        }).catch((()=>{
            setTipologiaFatture([]);
            setValueTipologiaFattura("");
            // manageError(err,dispatchMainState);
        }));
       
            
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
            body:bodyRel,
            textValue,
            valueAutocomplete:valueAutocomplete,
            page:0,
            rows:10,
            valuetipologiaFattura
        });
        setPage(0);
        setRowsPerPage(10);
        setBodyDownload(bodyRel);
        getlistaFatturazione(bodyRel); 
    };
    
    const onButtonAnnulla = async () => {
        let firstMonth = {mese:0};
           
        firstMonth = await getMesiRelSend(token, profilo.nonce,{anno:arrayYears[0]?.toString()})
            .then(res => res.data[0])
            .catch(err => manageError(err,dispatchMainState));
       
        setBodyRel({
            anno:arrayYears[0],
            mese:firstMonth.mese,
            tipologiaFattura:null,
            idEnti:[],
            idContratto:null,
            caricata:null,
            idTipoContratto:null
        });
        setBodyDownload({
            anno:arrayYears[0],
            mese:firstMonth.mese,
            tipologiaFattura:null,
            idEnti:[],
            idContratto:null,
            caricata:null,
            idTipoContratto:null
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
        getlistaFatturazione(bodyRel);
        setPage(newPage);
        updateFilters({
            pathPage:PathPf.DOCUMENTI_EMESSI,
            body:bodyDownload,
            textValue,
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
        const realPage = page + 1;
        getlistaFatturazione(bodyRel);
        updateFilters({
            pathPage:PathPf.DOCUMENTI_EMESSI,
            body:bodyDownload,
            textValue,
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
  
    return (
        <MainBoxStyled title={"Documenti contabili emessi"} actionButton={[{
            onButtonClick: downloadListaFatturazione,
            variant: "outlined",
            icon:{name:"circle_arrow_icon", sx:{} },
            withText:false,
            tooltipMessage:"Report Documenti emessi"
        }]}>
            <ResponsiveGridContainer >
                <MainFilter 
                    filterName={"select_value_string"}
                    inputLabel={"Anno"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyRel}
                    body={bodyRel}
                    keyDescription={"anno"}
                    keyValue={"anno"}
                    keyBody={"anno"}
                    arrayValues={[2025,2026]}
                    extraCodeOnChange={(e)=>{
                        const value = Number(e);
                        setBodyRel((prev)=> ({...prev, ...{anno:value}}));
                        //getMesi(value.toString());
                        // getListTipologiaFatturaOnChangeMonthYear(bodyRel.mese,bodyRel.anno);
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_key_value"}
                    inputLabel={"Mese"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyRel}
                    body={bodyRel}
                    keyValue={"mese"}
                    keyDescription='descrizione'
                    keyBody={"mese"}
                    arrayValues={[{mese:1,descrizione:"Gennaio"},{mese:2,descrizione:"Febbrio"}]}
                    extraCodeOnChange={(e)=>{
                        const value = Number(e);
                        setBodyRel((prev)=> ({...prev, ...{mese:value}})); 
                        // getListTipologiaFatturaOnChangeMonthYear(value,bodyRel.anno);            
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_value_string"}
                    inputLabel={"Tipologia Fattura"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyRel}
                    body={bodyRel}
                    keyDescription={"tipologiaFattura"}
                    keyValue={"tipologiaFattura"}
                    keyBody={"tipologiaFattura"}
                    arrayValues={tipologiaFatture}
                    extraCodeOnChange={(e)=>{
                        setBodyRel((prev)=> ({...prev, ...{tipologiaFattura:e}}));
                    }}
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
           
            <GridCustom
                nameParameterApi='idTestata'
                elements={data}
                changePage={handleChangePage}
                changeRow={handleChangeRowsPerPage} 
                total={totalNotifiche}
                page={page}
                rows={rowsPerPage}
                headerNames={headerGridKeys}
                apiGet={setIdRel}
                disabled={getListaRelRunning}
                widthCustomSize="2000px"></GridCustom>
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
