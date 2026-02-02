import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PathPf } from "../../types/enum";
import { saveAs } from "file-saver";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import ModalRedirect from "../../components/commessaInserimento/madalRedirect";
import { manageError} from "../../api/api";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import { Paper, Typography } from "@mui/material";
import { anniMesiDocumentiEmessi, downloadFattureEnte, getFatturazioneEnte, getTipologieFaEnte } from "../../api/apiSelfcare/apiDocEmessiSE/api";
import { ManageErrorResponse } from "../../types/typesGeneral";
import { month } from "../../reusableFunction/reusableArrayObj";
import { headersDocumentiEmessiEnte, headersDocumentiEmessiEnteCollapse } from "../../assets/configurations/conf_GridDocEmessiEnte";
import { getListaDocumentiEmessi, getPeriodoSospeso } from "../../api/apiSelfcare/documentiSospesiSE/api";
import { groupByAnno } from "../../reusableFunction/function";

export type BodyDocumentiEmessiEnte = {
    anno:number|null|string,
    mese:number|null,
    tipologiaFattura:string[],
    dataFattura:string|null
}


const DocSos : React.FC = () =>{

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


    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.DOCUMENTI_SOSPESI,{});


    //______________________NEW_________________
    const [responseByAnno, setResponseByAnno] = useState<{anno:{ mese:number[],tipologiaFattura:string[],dataFattura:string[]}[]}>();
    const [years,setYears] = useState<number[]>([]);
    const [arraymonths,setArrayMonths] = useState<number[]>([]);
    const [arrayDataFattura,setArrayDataFattura] = useState<string[]>([]);
   
    const [dataSelect, setDataSelect] = useState<string[]>([]);
    const [showLoadingGrid,setShowLoadingGrid] = useState(true);
    const [showDownloading,setShowDownloading] = useState(false);
    const [valueMulitselectTipologie, setValueMultiselectTipologie] = useState<string[]>([]);
    const [gridData, setGridData] = useState<any[]>([]);
    const [totalDocumenti, setTotalDocumenti]  = useState(0);
    const [totaleHeader, setTotaleHeader] = useState(0);
    //____________________________________


   
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openModalRedirect, setOpenModalRedirect] = useState(false);



  
    const [bodyFatturazione, setBodyFatturazione] = useState<BodyDocumentiEmessiEnte>({
        anno:null,
        mese:null,
        tipologiaFattura:[],
        dataFattura:null
    });

    const [bodyFatturazioneDownload, setBodyFatturazioneDownload] = useState<BodyDocumentiEmessiEnte>({
        anno:null,
        mese:null,
        tipologiaFattura:[],
        dataFattura:null
    });

    useEffect(()=>{
        getDataFilter();
    },[]);



    const getDataFilter = async() => {
        try{
            const res = await getPeriodoSospeso(token, profilo.nonce);
            const result = groupByAnno(res.data);
            const yearsArray:number[] = Array.from( new Set(res.data.map(el => el.anno)));
            const allMonths:number[] = Array.from( new Set(res.data.map(el => el.mese)));
            const allTipologie:string[] = Array.from( new Set(res.data.map(el => el.tipologiaFattura)));
            const dataFattura:string[] = Array.from( new Set(res.data.map(el => el.dataFattura)));
            setResponseByAnno(result);
            setYears([9999,...yearsArray]);
            setArrayMonths(allMonths);
            setDataSelect(allTipologie); 
            setArrayDataFattura(dataFattura);
            setShowLoadingGrid(false);
          
            getlistaFatturazione(bodyFatturazione);
        }catch(err) {
            if (err && typeof err === "object") {
                manageError(err as ManageErrorResponse, dispatchMainState);
            } else {
                // fallback for unexpected errors
                manageError({ message: String(err) } as ManageErrorResponse, dispatchMainState);
            }
            setShowLoadingGrid(false);
        }

    };


  

    
    const getlistaFatturazione = async (body) => {

        try {
       
            const res = await getListaDocumentiEmessi(
                token,
                profilo.nonce,
                body
            );


            const totaleSum = res.data.importoSospeso;

            const dataToShow = res.data.dettagli.map(el => el.fattura);

            const orderDataCustom = dataToShow.map((obj, index) => ({
                id: obj.identificativo ?? index, // 👈 better than Math.random()
                arrow: '',
                dataFattura: obj.dataFattura
                    ? new Date(obj.dataFattura).toLocaleDateString()
                    : '--',
                stato: 'Sospesa',
                tipologiaFattura: obj.tipologiaFattura,
                identificativo: obj.identificativo,
                tipocontratto:
        obj.tipocontratto === 'PAL'
            ? 'PAC - PAL senza requisiti'
            : 'PAC - PAL con requisiti',
                totale: obj.totale.toLocaleString('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                }),
                numero: obj.numero,
                tipoDocumento: obj.tipoDocumento,
                divisa: obj.divisa,
                metodoPagamento: obj.metodoPagamento,
                split: obj.split ? 'Si' : 'No',
                arrowDetails: 'arrowDetails',
                posizioni: obj.posizioni.map(el => ({
                    numerolinea: el.numeroLinea,
                    codiceMateriale: el.codiceMateriale,
                    imponibile: el.imponibile || '--',
                    periodoRiferimento: el.periodoRiferimento || '--',
                    periodoFatturazione: '--',
                })),
            }));

            setTotaleHeader(totaleSum);
            setGridData(orderDataCustom);
            setBodyFatturazioneDownload(bodyFatturazione);
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

    const downloadListaFatturazione = async () => {
        setShowDownloading(true);
        await downloadFattureEnte(token,profilo.nonce, bodyFatturazioneDownload).then(response => response.blob()).then((response)=>{
            let title = `Documenti sospesi/${bodyFatturazioneDownload.anno}.xlsx`;
            if(bodyFatturazioneDownload.mese){
                title = `Documenti sospesi/${month[bodyFatturazioneDownload.mese - 1]}/${bodyFatturazioneDownload.anno}.xlsx`;
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
            pathPage:PathPf.DOCUMENTI_SOSPESI,
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
        const resetBody:BodyDocumentiEmessiEnte = {
            anno:years[0],
            mese:null,
            tipologiaFattura:[],
            dataFattura:null
        };
       
        setBodyFatturazione(resetBody);
        setBodyFatturazioneDownload(resetBody);
        setValueMultiselectTipologie([]);
        setPage(0);
        setRowsPerPage(10);
        getlistaFatturazione(resetBody);
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
            pathPage:PathPf.DOCUMENTI_SOSPESI,
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
            pathPage:PathPf.DOCUMENTI_SOSPESI,
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

    const setIdDoc = async(el) => {
        handleModifyMainState({relSelected:{
            "nomeEnteClickOn": "Comune di Bisceglie",
            "mese": "Giugno",
            "anno": 2025,
            "id": "234c45ca-da5f-4067-a4d6-1391774162b4_28e1103f-43c7-4268-bab3-91ee62cea226_PRIMO-SALDO_2025_6"
        }});
        navigate(PathPf.PDF_REL_EN+"/documentisospesi");
    };  


  

    const statusAnnulla = (bodyFatturazione.tipologiaFattura.length !== 0 || bodyFatturazione.mese !== null) ? false :true;
    let labelAmount = `Credito sospeso`;
    if(bodyFatturazioneDownload.anno !== null && bodyFatturazioneDownload.mese === null){
  
        labelAmount = `Credito sospeso/${bodyFatturazioneDownload.anno}`;
    }else if(bodyFatturazioneDownload.mese !== null){
   
        labelAmount = `Credito sospeso/${bodyFatturazioneDownload.anno}-${month[bodyFatturazioneDownload.mese-1]}`;
    }

  
    return (
        <MainBoxStyled title={"Documenti contabili sospesi"} actionButton={[]}>
            <ResponsiveGridContainer >
                <MainFilter 
                    filterName={"select_value_with_tutti"}
                    inputLabel={"Anno"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    body={bodyFatturazione}
                    keyDescription={"anno"}
                    keyValue={"anno"}
                    keyBody={"anno"}
                    arrayValues={years.map(el => el.toString())}
                    extraCodeOnChange={(e)=>{
                    
                        if(e.toString() === "9999"){
                            getDataFilter();
                            setBodyFatturazione((prev)=> ({...prev, ...{anno:null,mese:null,dataFattura:null,tipologiaFattura:[]}}));
                        }else{
                            setBodyFatturazione((prev)=> ({...prev, ...{anno:Number(e),mese:null,dataFattura:null,tipologiaFattura:[]}}));
                            responseByAnno && setArrayMonths(responseByAnno[e]?.mese);
                            responseByAnno && setDataSelect(responseByAnno[e]?.tipologiaFattura);
                            responseByAnno && setArrayDataFattura(responseByAnno[e]?.dataFattura);
                        }
                        
                        
                        setValueMultiselectTipologie([]);
                    }}
                ></MainFilter>
                <MainFilter 
                    filterName={"select_value"}
                    inputLabel={"Mese"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    body={bodyFatturazione}
                    keyDescription={"mese"}
                    keyBody={"mese"}
                    keyValue={"mese"}
                    arrayValues={arraymonths}
                    extraCodeOnChange={(e)=>{
                        setBodyFatturazione((prev)=> ({...prev, mese:Number(e)}));
                    }}
                    defaultValue={""}
                    disabled={bodyFatturazione.anno === null}
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
                    filterName={"select_value_string"}
                    inputLabel={"Data Fattura"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    body={bodyFatturazione}
                    keyDescription={"dataFattura"}
                    keyBody={"dataFattura"}
                    keyValue={"dataFattura"}
                    arrayValues={arrayDataFattura}
                    defaultValue={""}
                ></MainFilter>
            </ResponsiveGridContainer>
            <FilterActionButtons 
                onButtonFiltra={onButtonFiltra} 
                onButtonAnnulla={onButtonAnnulla} 
                statusAnnulla={statusAnnulla ? "hidden":"show"} 
            ></FilterActionButtons>
            <Paper sx={{ p: 2, mb: 2, backgroundColor:bgHeader}}>
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
                disabled={showLoadingGrid}
                widthCustomSize="2000px"
                apiGet={setIdDoc}
            ></GridCustom>
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
                open={showLoadingGrid} 
                setOpen={setShowLoadingGrid} 
                sentence={'Loading...'}>
            </ModalLoading>
        </MainBoxStyled>
        
    );
};

export default DocSos;
