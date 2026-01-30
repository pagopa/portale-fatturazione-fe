import React, {  useEffect, useState } from "react";
import { useNavigate } from "react-router";
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
import { ManageErrorResponse } from "../../types/typesGeneral";
import { Paper, Typography } from "@mui/material";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import { headersDocumentiEmessiEnte, headersDocumentiEmessiEnteCollapse } from "../../assets/configurations/conf_GridDocEmessiEnte";


export type BodyDocumentiEmessiEnte = {
    anno:number|null,
    mese:number|null,
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
    const [showLoadingGrid,setShowLoadingGrid] = useState(false);
    const [showDownloading,setShowDownloading] = useState(false);
    const [valueMulitselectTipologie, setValueMultiselectTipologie] = useState<string[]>([]);
    const [totaleHeader, setTotaleHeader] = useState(0);
    //____________________________________


    const [gridData, setGridData] = useState<any[]>([]);
    const [totalDocumenti, setTotalDocumenti]  = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    
 
    


    const [tipologie, setTipologie] = useState<string[]>([]);
    
    const [showedData, setShowedData] = useState<any[]>([]);
 
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
    const [getListaRelRunning, setGetListaRelRunning] = useState(false);


  
    const [bodyFatturazione, setBodyFatturazione] = useState<BodyDocumentiEmessiEnte>({
        anno:null,
        mese:null,
        tipologiaFattura:[]
    });

    const [bodyFatturazioneDownload, setBodyFatturazioneDownload] = useState<BodyDocumentiEmessiEnte>({
        anno:null,
        mese:null,
        tipologiaFattura:[]
    });

    const [arrayYears,setArrayYears] = useState<number[]>([]);

    
    useEffect(()=>{
        getAnniMesi();
    },[]);


    const getAnniMesi = async () => {
        try {
            setShowLoadingGrid(true);
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
            console.log(currentYear);
            if (isInitialRender.current && Object.keys(filters).length > 0) {
                setYearMonths(mesi[filters.body.anno]);
                setValueMultiselectTipologie(filters.valueMulitselectTipologie);
            }else {
                setYearMonths(mesi[currentYear]);
                //setBodyFatturazione((prev)=> ({...prev,anno:currentYear}));//mese:mesi[currentYear][0]
                //setBodyFatturazioneDownload((prev)=> ({...prev,anno:currentYear}));
                getTipologieFatturazione({anno:null,mese:null});//mese:mesi[currentYear][0]
                getlistaFatturazione(bodyFatturazione);//,mese:mesi[currentYear][0]
            }
               
        } catch (err) {
            if (err && typeof err === "object") {
                manageError(err as ManageErrorResponse, dispatchMainState);
            } else {
                // fallback for unexpected errors
                manageError({ message: String(err) } as ManageErrorResponse, dispatchMainState);
            }
            setShowLoadingGrid(false);
        }
    };


    const getTipologieFatturazione =  async(body) => {
        await getTipologieFaEnte(token, profilo.nonce, body)
            .then((res)=>{
                setDataSelect(res.data);  
                       
            }).catch(((err)=>{
                setDataSelect([]);
                manageError(err,dispatchMainState);
                
            }));
    };
    
    const getlistaFatturazione = async (body) => {
        setShowLoadingGrid(true);
        await  getFatturazioneEnte(token,profilo.nonce,body)
            .then((res)=>{
                const orderDataCustom = res.data.map(el => el.fattura).map(obj=>{
                    return {
                        id:Math.random(),
                        arrow:"",
                        dataFattura:obj.dataFattura !== null ? new Date(obj.dataFattura).toLocaleString().split(',')[0] : '--',
                        stato:"Emesso",
                        tipologiaFattura:obj.tipologiaFattura,
                        identificativo:obj.identificativo,
                        tipocontratto:obj.tipocontratto === "PAL"?"PAC - PAL senza requisiti":"PAC - PAL con requisiti",
                        totale:obj.totale.toLocaleString("de-DE", { style: "currency", currency: "EUR" }),
                        numero:obj.numero,
                        tipoDocumento:obj.tipoDocumento,
                        divisa:obj.divisa,
                        metodoPagamento:obj.metodoPagamento,
                        split:obj.split ? "Si" : "No",
                        arrowDetails:"arrowDetails",
                        posizioni:obj.posizioni.map(el => {
                            return{
                                "numerolinea": el.numerolinea,
                                "codiceMateriale": el.codiceMateriale,
                                "imponibile": el.imponibile || "--",
                                "periodoRiferimento": el.periodoRiferimento || "--",
                                "periodoFatturazione":"--"
                            };
                            
                        })
                    };
                });
                const totaleSum = res.data
                    .map(el => el.fattura)
                    .reduce((acc, obj) => acc + (obj.totale ?? 0), 0);
                setTotaleHeader(totaleSum);
                setGridData(orderDataCustom);
                setShowLoadingGrid(false);
                setBodyFatturazioneDownload(bodyFatturazione);
                isInitialRender.current = false;
            }).catch((error)=>{
                if(error?.response?.status === 404){
                    setGridData([]);
                    setTotaleHeader(0);
                }
                isInitialRender.current = false;
                setShowLoadingGrid(false);
                manageError(error, dispatchMainState);
            });        
    };

    const downloadListaFatturazione = async () => {
        setShowDownloading(true);
        await downloadFattureEnte(token,profilo.nonce, bodyFatturazioneDownload).then(response => response.blob()).then((response)=>{
            let title = `Documenti emessi/${bodyFatturazioneDownload.anno}.xlsx`;
            if(bodyFatturazioneDownload.mese){
                title = `Documenti emessi/${month[bodyFatturazioneDownload.mese - 1]}/${bodyFatturazioneDownload.anno}.xlsx`;
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
    };

    const onButtonFiltra = () =>{
        updateFilters({
            pathPage:PathPf.DOCUMENTI_EMESSI,
            body:bodyFatturazione,
            page:0,
            rows:10
        });
        setPage(0);
        setRowsPerPage(10);
        setBodyFatturazioneDownload(bodyFatturazione);
        getlistaFatturazione(bodyFatturazione); 
    };
    
    const onButtonAnnulla = async () => {
        const resetBody = {
            anno:years[0],
            mese:null,
            tipologiaFattura:[],
        };
       
        setBodyFatturazione(resetBody);
        setBodyFatturazioneDownload(resetBody);
        setValueMultiselectTipologie([]);
        setPage(0);
        setRowsPerPage(10);
        getlistaFatturazione(resetBody);
        getTipologieFatturazione({anno:years[0],mese:null});
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
       
            page:newPage,
            rows:rowsPerPage,
         
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
           
            page:0,
            rows:parseInt(event.target.value, 10),
      
        });
    };

    let bgHeader = "#E3E7EB";
    if(totaleHeader === 0){
        bgHeader = "#E3E7EB";
    }else if(totaleHeader > 0){
        bgHeader = "#F2FAF2";
    }else if(totaleHeader < 0){
        bgHeader = "#FB9EAC";
    }

    const statusAnnulla = (bodyFatturazione.tipologiaFattura.length !== 0 || bodyFatturazione.mese !== null) ? false :true;
    let labelAmount = `Totale fatturato`;
    if(bodyFatturazioneDownload.anno !== null && bodyFatturazioneDownload.mese === null){
        console.log(1);
        labelAmount = `Totale fatturato/${bodyFatturazioneDownload.anno}`;
    }else if(bodyFatturazioneDownload.mese !== null){
        console.log(2);
        labelAmount = `Totale fatturato/${bodyFatturazioneDownload.anno}-${month[bodyFatturazioneDownload.mese-1]}`;
    }
    console.log({bodyFatturazioneDownload});

    const setIdDoc = async(el) => {
        handleModifyMainState({relSelected:{
            "nomeEnteClickOn": "Comune di Bisceglie",
            "mese": "Giugno",
            "anno": 2025,
            "id": "234c45ca-da5f-4067-a4d6-1391774162b4_28e1103f-43c7-4268-bab3-91ee62cea226_PRIMO-SALDO_2025_6"
        }});
        navigate(PathPf.PDF_REL_EN+"/documentiemessi");
    };  
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
                        setBodyFatturazione((prev)=> ({...prev, ...{anno:Number(e),mese:null}}));
                        getTipologieFatturazione({anno:Number(e),mese:null});
                        setValueMultiselectTipologie([]);
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
                        setValueMultiselectTipologie([]);
                    }}
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
                        setBodyFatturazione((prev) => ({...prev,...{tipologiaFattura:e}}));
                    }}
                    iconMaterial={RenderIcon("invoice",true)}
                ></MainFilter>
                <MainFilter 
                    filterName={"date_from_to"}
                    inputLabel={"Data fattura"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    body={bodyFatturazione}
                    keyValue={"init"}
                    keyDescription="start"
                    keyCompare={"end"}
                    keyBody="init"
                    format="MM/yyyy"
                    viewDate={['year', 'month']}
                    error={false}
                ></MainFilter>
            </ResponsiveGridContainer>
            <FilterActionButtons 
                onButtonFiltra={onButtonFiltra} 
                onButtonAnnulla={onButtonAnnulla} 
                statusAnnulla={statusAnnulla ? "hidden":"show"} 
            ></FilterActionButtons>
            <Paper sx={{ p: 2, mb: 2,backgroundColor:bgHeader }}>
                <Typography variant="body2" color="text.secondary">
                    {labelAmount}
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
                disabled={getListaRelRunning}
                widthCustomSize="2000px"
                apiGet={setIdDoc}></GridCustom>
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
                open={getListaRelRunning} 
                setOpen={setGetListaRelRunning} 
                sentence={'Loading...'}>
            </ModalLoading>
        </MainBoxStyled>
        
    );
};

export default DocEm;
