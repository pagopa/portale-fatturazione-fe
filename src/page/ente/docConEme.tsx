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
import { anniMesiDocumentiEmessi, downloadFattureEnte, getFatturazioneEnte, getPeriodoEmesso, getTipologieFaEnte } from "../../api/apiSelfcare/apiDocEmessiSE/api";
import { ManageErrorResponse } from "../../types/typesGeneral";
import { Paper, Typography } from "@mui/material";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import { headersDocumentiEmessiEnte, headersDocumentiEmessiEnteCollapse } from "../../assets/configurations/conf_GridDocEmessiEnte";
import { getListaDocumentiEmessi } from "../../api/apiSelfcare/documentiSospesiSE/api";
import { groupByAnno } from "../../reusableFunction/function";


export type BodyDocumentiEmessiEnte = {
    anno:number|null|string,
    mese:number|null,
    tipologiaFattura:string[],
    dataFattura:string[]
}

export type Fattura = {
    dataFattura: string;
    stato:string;
    tipoDocumento:string;
    totale: number;
    numero: number;
    idfattura: number;
    prodotto: string;
    identificativo: string;
    istitutioId: string;
    tipocontratto: "PAL" | string;
    divisa: "EUR" | string;
    causale: string;
    split: boolean;
    inviata: number;
    posizioni: Posizione[];
};

export type Posizione = {
    numeroLinea: number;
    testo: string;
    codiceMateriale: string;
    quantita: number;
    prezzoUnitario: number;
    imponibile: number;
    periodoRiferimento: string; // MM/YYYY
};

 type ResponsePeriodo = {
     anno: number,
     tipologiaFattura: string,
     dataFattura: string,
     mese: number
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


    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.DOCUMENTI_EMESSI,{});


    //______________________NEW_________________
    const [listaResponse, setListaResponse] = useState<Fattura[]>([]);
    const [responseByAnno, setResponseByAnno] = useState<{anno:{ mese:number[],tipologiaFattura:string[],dataFattura:string[]}[]}>();
    const [years,setYears] = useState<number[]>([]);
    const [arraymonths,setArrayMonths] = useState<number[]>([]);
    const [arrayDataFattura,setArrayDataFattura] = useState<string[]>([]);
    const [arrayDataFatturaFiltered,setArrayDataFatturaFiltered] = useState<string[]>([]);
   
    const [dataSelect, setDataSelect] = useState<string[]>([]);
    const [showLoadingGrid,setShowLoadingGrid] = useState(true);
    const [showDownloading,setShowDownloading] = useState(false);
    const [gridData, setGridData] = useState<Fattura[]>([]);
    const [totalDocumenti, setTotalDocumenti]  = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totaleHeader, setTotaleHeader] = useState(0);

    const [valueMulitselectDate, setValueMultiselectDate] = useState<string[]>([]);
    const [valueMulitselectTipologie, setValueMultiselectTipologie] = useState<string[]>([]);

    const [globalResponse, setGlobalResponse] = useState<ResponsePeriodo[]>([]);
    //____________________________________

    const [openModalRedirect, setOpenModalRedirect] = useState(false);

    const [bodyFatturazione, setBodyFatturazione] = useState<BodyDocumentiEmessiEnte>({
        anno:null,
        mese:null,
        tipologiaFattura:[],
        dataFattura:[]
    });

    const [bodyFatturazioneDownload, setBodyFatturazioneDownload] = useState<BodyDocumentiEmessiEnte>({
        anno:null,
        mese:null,
        tipologiaFattura:[],
        dataFattura:[]
    });

    useEffect(()=>{
        if(mainState.datiFatturazione === false || mainState.datiFatturazioneNotCompleted){
            setOpenModalRedirect(true);
        }else{
            getDataFilter();
        }
    },[]);



    const getDataFilter = async() => {
        try{
            const res = await getPeriodoEmesso(token, profilo.nonce);
            setGlobalResponse(res.data);
            const result = groupByAnno(res.data);
           
            const yearsArray:number[] = Array.from( new Set(res.data.map(el => el.anno)));
            const allMonths:number[] = Array.from( new Set(res.data.map(el => el.mese)));//da eliminare
            const allTipologie:string[] = Array.from( new Set(res.data.map(el => el.tipologiaFattura)));
            const dataFattura:string[] = Array.from( new Set(res.data.map(el => `${el.dataFattura}-${el.tipologiaFattura}`)));//da eliminare
            setResponseByAnno(result);
            setYears([9999,...yearsArray]);
            if(isInitialRender.current && Object.keys(filters)?.length > 0){
               
                if(filters.body.anno !== null){
                    result && setArrayMonths(result[filters.body.anno]?.mese);
                    result && setDataSelect(result[filters.body.anno]?.tipologiaFattura);
                }else{
                    setArrayMonths(allMonths);
                    setDataSelect(allTipologie);
                }

                let arrayToCheck = filters.body.tipologiaFattura;
                if(filters.body.anno !== null && arrayToCheck.length > 0){
                    arrayToCheck = [...arrayToCheck,filters.body.anno.toString()];
                    const result = arrayDataFattura.filter(item =>
                        arrayToCheck.some(key =>
                            item.toUpperCase().includes(key.toUpperCase())
                        )
                    );
                    responseByAnno && setArrayDataFatturaFiltered(result);
                }
                setBodyFatturazione(filters.body);
                setBodyFatturazioneDownload(filters.body);
            }else{
               
                setArrayMonths(allMonths);
                setDataSelect(allTipologie); 
                setArrayDataFattura(dataFattura);
                setShowLoadingGrid(false);
                getlistaFatturazione(bodyFatturazione);
            }
            
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
            const res = await getListaDocumentiEmessi(token,profilo.nonce,body);
            const totaleSum = res.data.importoSospeso;
            console.log({res});
            setListaResponse(res.data.dettagli);
            setTotalDocumenti(res.data.dettagli.length);
            setPage(0);
            const dataToShow = res.data.dettagli.slice(0, 10).map(el => el.fattura);

            const orderDataCustom = dataToShow.map((obj, index) => ({
                id: obj.identificativo ?? index,
                arrow: '',
                dataFattura: obj.dataFattura
                    ? new Date(obj.dataFattura).toLocaleDateString()
                    : '--',
                stato: 'Emessa',
                tipologiaFattura: obj.tipoDocumento,
                identificativo: obj.identificativo,
                tipocontratto: obj.tipocontratto === 'PAL'
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
            isInitialRender.current = false;
        } catch (err) {
            isInitialRender.current = false;
            if (err && typeof err === "object") {
                manageError(err as ManageErrorResponse, dispatchMainState);
            } else {
                // fallback for unexpected errors
                manageError({ message: String(err) } as ManageErrorResponse, dispatchMainState);
            }
            setGridData([]);
            setListaResponse([]);
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
        const resetBody:BodyDocumentiEmessiEnte = {
            anno:null,
            mese:null,
            tipologiaFattura:[],
            dataFattura:[]
        };
       
        setBodyFatturazione(resetBody);
        setBodyFatturazioneDownload(resetBody);
        setValueMultiselectTipologie([]);
        setValueMultiselectDate([]);
        setPage(0);
        setRowsPerPage(10);
        getlistaFatturazione(resetBody);
        resetFilters();
        
    };

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);

        const start = newPage * rowsPerPage;
        const end = start + rowsPerPage;

        const elementsToShow = listaResponse.slice(start, end);
        setGridData(elementsToShow);

        updateFilters({
            pathPage: PathPf.DOCUMENTI_EMESSI,
            body: bodyFatturazioneDownload,
            page: newPage,
            rows: rowsPerPage,
        });
    };
                        
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const newRows = parseInt(event.target.value, 10);

        setRowsPerPage(newRows);
        setPage(0);

        const elementsToShow = listaResponse.slice(0, newRows);
        setGridData(elementsToShow);
        updateFilters({
            pathPage: PathPf.DOCUMENTI_EMESSI,
            body: bodyFatturazioneDownload,
            page: page,
            rows: newRows,
        });
    };


    let bgHeader = "#E3E7EB";
    if(totaleHeader === 0){
        bgHeader = "#E3E7EB";
    }else if(totaleHeader > 0){
        bgHeader = "#F2FAF2";
    }else if(totaleHeader < 0){
        bgHeader = "#ffeff1";
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


    function filterByCombinedMatch(firstArray, secondArray) {
        const year = firstArray[firstArray.length - 1];
        const valuesToCheck = firstArray.slice(0, -1);

        return secondArray.filter(item =>
            valuesToCheck.some(val =>
                item.includes(val) && item.includes(year)
            )
        );
    }
    return (
        <MainBoxStyled title={"Documenti contabili emessi"} actionButton={[]}>
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
                            setBodyFatturazione((prev)=> ({...prev, ...{anno:null,mese:null,dataFattura:[],tipologiaFattura:[]}}));
                        }else{
                            setBodyFatturazione((prev)=> ({...prev, ...{anno:Number(e),mese:null,dataFattura:[],tipologiaFattura:[]}}));
                            responseByAnno && setArrayMonths(responseByAnno[e]?.mese);
                            responseByAnno && setDataSelect(responseByAnno[e]?.tipologiaFattura);
                        }
                        
                        setValueMultiselectTipologie([]);
                        setValueMultiselectDate([]);
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
                        setBodyFatturazione((prev)=> ({...prev, mese:Number(e),tipologiaFattura:[],dataFattura:[]}));
                        setValueMultiselectTipologie([]);
                        setValueMultiselectDate([]);
                        console.log("dio ");
                        const arrayTipogie = Array.from( new Set(globalResponse
                            .filter(el =>
                                el.anno === bodyFatturazione.anno && el.mese === Number(e))
                            .map(el => el.tipologiaFattura)));
                        setDataSelect(arrayTipogie);
                    }}
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
                        let arrayToCheck = e;
                        if(bodyFatturazione.anno !== null && bodyFatturazione.anno.toString() && arrayToCheck.length > 0){
                            arrayToCheck = [...arrayToCheck,bodyFatturazione.anno.toString()];
                            console.log({arrayToCheck});

                            const result = filterByCombinedMatch(arrayToCheck, arrayDataFattura);
                            
                            console.log({result});
                            responseByAnno && setArrayDataFatturaFiltered(result);
                        }
                        setValueMultiselectDate([]);
                        
                     
                        setBodyFatturazione((prev) => ({...prev,...{tipologiaFattura:e}}));
                    }}
                    iconMaterial={RenderIcon("invoice",true)}
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Data Fattura"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBodyFatturazione}
                    body={bodyFatturazione}
                    dataSelect={arrayDataFatturaFiltered}
                    valueAutocomplete={valueMulitselectDate}
                    setValueAutocomplete={setValueMultiselectDate}
                    keyDescription={"dataFattura"}
                    keyValue={"dataFattura"}
                    keyBody={"dataFattura"}
                    extraCodeOnChangeArray={(e)=>{
                        setValueMultiselectDate(e);
                    }}
                    iconMaterial={RenderIcon("date",true)}
                    disabled={valueMulitselectTipologie.length === 0 || bodyFatturazione.anno === null || bodyFatturazione.mese !== null}
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

export default DocEm;
