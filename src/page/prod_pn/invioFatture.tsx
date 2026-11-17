import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { manageError, manageErrorDownload, managePresaInCarico } from "../../api/api";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import useSavedFiltersNested from "../../hooks/usaSaveFiltersLocalStorageNested";
import { PathPf } from "../../types/enum";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import { saveAs } from "file-saver";
import MainFilter from "../../components/reusableComponents/mainFilter";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import { headerNamesInvioFatture, headerNamesInvioFattureCollapse, keyValueObjModalInfo } from "../../assets/configurations/conf_GridInvioFatture";
import MainModalComponent from "../../components/reusableComponents/modals/mainModalComponent";
import { ElementToProcessComponent } from "../../components/reusableComponents/tableViewData";
import DialogInfo from "../../components/reusableComponents/modals/dialogInfo";
import { Box, Chip, DialogContent, Divider, List, ListItem, ListItemText, Stack, Typography } from "@mui/material";
import { NotaTextField } from "./gestioneFatture";
import FiltersCollapseInvioFatture, { FiltriCollapseInvioFatture } from "../../components/invioFatture/filtersCollapseInvioFatture";
import { downloadInvioFatture, getAnniInviofatture, getDettaglioInvioFatture, getListaInvioFatture, getMesiInviofatture, getStatiInvioJson, getTipologieInviofatture } from "../../api/apiPagoPa/invioFattureSapPA/api";
import { toMesi } from "../../reusableFunction/reusableArrayObj";

interface ListaFatture {
  tipologiaFattura: string,
  statoInvio:number,
  numeroFatture: number,
  annoRiferimento: number,
  meseRiferimento: number,
  importo: number,
  fatture:DettaglioFattura[],
  id:string
}

type DettaglioFattura = {
  "idFattura": number,
  "numeroFattura": string,
  "progressivo": number,
  "tipoDocumento": string,
  "tipologiaFattura": string,
  "idEnte": string,
  "ragioneSociale": string,
  "importo": number,
  "idDocumento": null|string,
  "dataFattura": string,
  "statoInvio": string,
  "semestre": null|string,
  "dataUltimaGenerazione": string,
  "nomeFile": string,
  "numeroInvii": number,
  "storicoInvii": [
    {
      "nInvio": number,
      "data": string,
      "testo": string,
      "azione": string
    }
  ],
  "annoRiferimento": number,
  "meseRiferimento": number
};

export interface SelectedJsonSap {
  annoRiferimento: number,
  meseRiferimento: number,
  tipologiaFattura: string,
  idFattura:number|null
}

export interface BodyInvioFatture {
  anno: number|"";
  mesi: number[];
  tipologieFattura: string[];
  statoInvio: string;
}

export type BodyDettaglioFatture = {
  annoRiferimento: number,
  meseRiferimento: number,
  tipologiaFattura: string,
  statoInvio: string,
  ragioneSociale?: string;
  numeroFattura?: string;
  dataFattura?: string;
  page?: number;
  pageSize?: number;
};

export interface BodyGeneraJson {
  "anno": number,
  "mese": number,
  "tipologiaFattura": string,
  "statoInvio":string,
  "allSelected":boolean,
  "idFatture": number[],
  "idFattureEscluse":number[],
  "nota": string,
  "numeroDocumentoStorno": string
}

const InvioFatture : React.FC = () => {

  const mainState = useGlobalStore(state => state.mainState);
  const dispatchMainState = useGlobalStore(state => state.dispatchMainState);

  const token =  mainState.profilo.jwt;
  const profilo =  mainState.profilo;
  const navigate = useNavigate();

  const [listaFatture, setListaFatture] = useState<ListaFatture[]>([]);
  //const [selected,setSelected] = useState<SelectedJsonSap[]>([]);
  
  const [showLoader, setShowLoader] = useState(false);
  const [showDownloading, setShowDownloading] = useState(false);
  //const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
  //const [infoPage , setInfoPage] = useState({ page: 0, pageSize: 10 });
  const [collapseDataLoading,setCollapseDataLoading] = useState(true);

  const [arrayYears,setArrayYears] = useState<number[]>([]);
  const [arrayMonths,setArrayMonths] = useState<{mese:number,descrizione:string}[]>([]);

  const [valueMulitselectTipologie, setValueMultiselectTipologie] = useState<string[]>([]);
  const [tipologieFatture, setTipologieFattura] = useState<string[]>([]);

  const [valueSelectMonths, setValueSelectMonths] = useState<{descrizione:string,mese:number}[]>([]);
  const [arrayTipologieInvio, setArrayTipologieInvio] = useState<{codice:string,descrizione:string}[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState(0);
  //const [gridData, setGridData] = useState<Fattura[]>([]);
  const [objectSort, setObjectSort] = useState<{[key:string]:number}>({"Anno Riferimento":1,"Mese Riferimento":1});
  //const [listaResponse, setListaResponse] = useState<Fattura[]>([]);
  const [openModalFatture, setOpenModalFatture]= useState(false);
  const [infoReinvio, setInforeInvio] = useState<{dataInvio:string}[]>([]);

  const [showPopUpDateInvio, setShowPopUpdateInvio] = useState(false);
  const [numeroDocStorno, setNumeroDocStorno] = useState("");
  const [nota, setNota] = useState("");

 
  const [elementsSelected,setElementSelected] = useState<DettaglioFattura[]>([]);
  console.log({elementsSelected});

  const [bodyFatturazione, setBodyFatturazione] = useState<BodyInvioFatture>({
    anno:"",
    mesi:[],
    tipologieFattura:[],
    statoInvio:"TUTTE"
  });

  const { 
    filters,
    updateFilters,
    isInitialRender,
    resetFilters
  } = useSavedFiltersNested("/inviofatture",{});


  useEffect(()=>{
    getAnni();
    //TODO: vedere dove spostare questa logica
    /*if(isInitialRender.current && Object.keys(filters).length > 0){
      //setTipologia(filters.tipologiaInvio);
      setSelected(filters.selectedInvio);
      //setRowSelectionModel(filters.rowSelectionModelInvio);
      setInfoPage(filters.infoPageInvio);
    } */
  },[]);

  const getStati = async () => {
    try{
      const resp = await getStatiInvioJson(token,profilo.nonce);
      setArrayTipologieInvio(resp.data);
    }catch{
      setArrayTipologieInvio([]);
    }
  };

  const getTipologieFattura = async (body) => {
    try{
      const resp = await getTipologieInviofatture(token,profilo.nonce,body);
      setTipologieFattura(resp.data);
    }catch{
      setTipologieFattura([]);
    }
  };

  const getAnni = async () => {
    setShowLoader(true);
    try{
      const resp = await getAnniInviofatture(token,profilo.nonce);
    
      setArrayYears(resp.data);
      setBodyFatturazione((prev)=>({
        ...prev, anno:resp.data[0]
      }));
      getMesi(resp.data[0]);
      getStati();
      getTipologieFattura({anno:resp.data[0],mesi:[]});
      getLista({...bodyFatturazione,anno:resp.data[0]});
    }catch{
      setArrayYears([]);
      setShowLoader(false);
    }
  };

  const getMesi = async (anno) => {
    try{
      const resp = await getMesiInviofatture(token,profilo.nonce,{anno:anno});
      const result = toMesi(resp.data).reverse();
      setArrayMonths(result);
    }catch{
      setArrayMonths([]);
    }
  };

  const getLista = async (body) =>{
    if(!isInitialRender.current){
      setShowLoader(true);
    }
    try{
      const res = await getListaInvioFatture(token,profilo.nonce,body);
      setListaFatture(res.data);
      setCount(res.data?.length || 0);
      setPage(0);
      setShowLoader(false);
      isInitialRender.current = false;
    }catch(err:any){
      setListaFatture([]);
      setCount(0);
      setPage(0);
      setShowLoader(false);
      isInitialRender.current = false;
      manageError(err, dispatchMainState);
    }
  };

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const downloadRisultati = async () => {
    setShowDownloading(true);
    try {
      const response = await downloadInvioFatture(token, profilo.nonce, bodyFatturazione);
      if (!response.ok) throw '404';
      const blob = await response.blob();
      const title = `Lista Non Inviate.xlsx`;
      saveAs(blob, title);
    } catch {
      manageErrorDownload('404', dispatchMainState);
    } finally {
      setShowDownloading(false);
    }
  };

  const clearOnChangeFilter = () => {
    setListaFatture([]);
    setCount(0);
    setPage(0);
    setElementSelected([]);
  };

  const onButtonFiltra = () => {
    getLista(bodyFatturazione);
  };

  const onButtonAnnulla = () => {
    const newBody = {
      anno:arrayYears[0],
      mesi:[],
      tipologieFattura:[],
      statoInvio:"TUTTE"
    };
    setBodyFatturazione(newBody);
    setValueSelectMonths([]);
    setValueMultiselectTipologie([]);
    setListaFatture([]);
    setCount(0);
    setPage(0);
    setElementSelected([]);
    getLista(newBody);
  };

  // fatture complete della riga (ignorando i filtri del collapse): se la riga è stata filtrata uso la copia originale

  const manageCheckbox = (currentRow: Record<string, any>):Record<string, any>=> {

    const checkLengthOfCollapse = getFattureCompleteRiga(currentRow).length;

    

    const verifyIfSelected = (!!elementsSelected.find((el) =>{
     
      return el.annoRiferimento === currentRow.annoRiferimento &&
       el.meseRiferimento === currentRow.meseRiferimento && 
       el.tipologiaFattura === currentRow.tipologiaFattura &&
       el.statoInvio === currentRow.statoInvio;
    } )) && checkLengthOfCollapse !== 0 && checkLengthOfCollapse === elementsSelected.length;

  
    if(verifyIfSelected){
      setElementSelected([]);
    }else{
      //prendo tutti i sotto elementi
      setElementSelected(getFattureCompleteRiga(currentRow));
    }
  };

  const getFattureCompleteRiga = (row: Record<string, any>): any[] => {
    const original = originalFattureRef.current[getRowKey(row)];
   
     
    if (original) return original;
   
    const [tipologiaFatturaRow, annoRiferimentoRow, meseRiferimentoRow, statoInvioRow] = row.id.split('|');
    return listaFatture.find((el) => {
      const [tipologiaFattura, annoRiferimento, meseRiferimento, statoInvio] = el.id.split('|');
      return annoRiferimento === annoRiferimentoRow &&
      meseRiferimento === meseRiferimentoRow &&
      tipologiaFattura === tipologiaFatturaRow;
    })?.fatture || [];
  };


  const manageCheckboxCollapse = (currentRow: Record<string, any>): Record<string, any> => {
  
   
    const verifyIfSelected = (!!elementsSelected.find((el) =>{
     
      return el.annoRiferimento === currentRow.annoRiferimento &&
       el.meseRiferimento === currentRow.meseRiferimento && 
       el.tipologiaFattura === currentRow.tipologiaFattura &&
       el.idFattura === currentRow.idFattura;
    } ));
    if(verifyIfSelected){
    
      setElementSelected(elementsSelected.filter(el => el.idFattura !== currentRow.idFattura));
      return {
        checkboxStatus:false,
        key:"idFattura"
      };
    }else{
  
      setElementSelected((prev)=>{
        return [...prev,{
          annoRiferimento:currentRow.annoRiferimento,
          meseRiferimento:currentRow.meseRiferimento,
          tipologiaFattura:currentRow.tipologiaFattura,
          idFattura:currentRow.idFattura,
          statoInvio:currentRow.statoInvio,
          ragioneSociale:currentRow.ragioneSociale
        }];});
      return {
        checkboxStatus:true,
        key:"idFattura"
      };
    }
  };


  const manageStateCheckbox = (row, isMainCheck="",elementsSel) =>{
    
    let verifyIfSelected = false;
    let disabled = false;
   
    if(isMainCheck === "main-row" && elementsSel){
      // confronto con tutte le fatture della riga, non con quelle filtrate nel collapse
      const elementsInsideCollapse = getFattureCompleteRiga(row);
      
      verifyIfSelected = (!!elementsSel.find((el) =>{
        return el.annoRiferimento === row.annoRiferimento &&
       el.meseRiferimento === row.meseRiferimento && 
       el.tipologiaFattura === row.tipologiaFattura &&
       el.statoInvio === row.statoInvio;
      } )) && (elementsInsideCollapse?.length||0) === elementsSel.length;

    }else if(isMainCheck === "collapse-row" && elementsSel.length > 0){
      
      verifyIfSelected = (!!elementsSel.find((el) =>{
        return el.annoRiferimento === row.annoRiferimento &&
       el.meseRiferimento === row.meseRiferimento && 
       el.tipologiaFattura === row.tipologiaFattura &&
        el.idFattura === row.idFattura;
      } ));
    }

  
    disabled = elementsSelected.length !== 0 && (!!elementsSel.find((el) =>{
     
      return el.annoRiferimento !== row.annoRiferimento ||
       el.meseRiferimento !== row.meseRiferimento || 
       el.tipologiaFattura !== row.tipologiaFattura; 
    } ));

    return {
      verifyIfSelected,
      disabled:row.statoInvio === "IN_ELABORAZIONE" || disabled
    };
  };


  //Bisognaaggiungere un parametro che controlla se è collapsed altrimenti non devo faren la chiamata
  const PAGE_SIZE_DETTAGLIO = 10;

  const handleGetDetailsRowCollapsed = async (el: Record<string, any>, clickOnCheckbox:boolean = false) => {

    const fetchPage = (page: number) => getDettaglioInvioFatture(token, profilo.nonce, {
      "annoRiferimento": el.annoRiferimento,
      "meseRiferimento": el.meseRiferimento,
      "tipologiaFattura": el.tipologiaFattura,
      "statoInvio": el.statoInvio,
      "page": page,
      "pageSize": PAGE_SIZE_DETTAGLIO
    });

    const mapCollapse = (fatture: any[] = []) => fatture.map((collapseEl) => ({
      ...collapseEl,
      statoInvio: el.statoInvio,
      fileJson: el.statoInvio !== "DA_INVIARE" ? el.nomeFile : "--",
      annoRiferimento: el.annoRiferimento,
      meseRiferimento: el.meseRiferimento
    }));

    const updateRiga = (fatture: any[]) => {
      originalFattureRef.current[getRowKey(el)] = fatture;
      setListaFatture((prevState) =>
        prevState.map((item) =>
          item.annoRiferimento === el.annoRiferimento &&
          item.tipologiaFattura === el.tipologiaFattura &&
          item.meseRiferimento === el.meseRiferimento &&
          item.statoInvio === el.statoInvio
            ? { ...item, fatture }
            : item
        )
      );
    };

    try{
      setCollapseDataLoading(true);
      // prima pagina: ricavo il totale dal count
      const firstRes = await fetchPage(1);
      const firstPage = mapCollapse(firstRes.data.fatture);
      const total = Number(firstRes.data.count) || firstPage.length;
      const totalPages = Math.ceil(total / PAGE_SIZE_DETTAGLIO);

      // pagine successive in parallelo; loader e paginazione restano nascosti fino alla fine
      let allFatture = firstPage;
      if(totalPages > 1){
        const pages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
        const results = await Promise.all(pages.map(fetchPage));
        allFatture = [...firstPage, ...results.flatMap((r) => mapCollapse(r.data.fatture))];
      }
      updateRiga(allFatture);
      setCollapseDataLoading(false);

      if(clickOnCheckbox){
        setElementSelected(allFatture);
      }
      return allFatture;

    }catch{
      managePresaInCarico("ERROR_LIST_JSON_TO_SAP", dispatchMainState);
      navigate(PathPf.JSON_TO_SAP);
      setCollapseDataLoading(false); 
      return [];
    }
  };


  // ______________ Filtri dentro il collapse (applicati solo alla riga corrente) ______________
  // copia delle fatture originali (response iniziale) per ogni riga, usata per ripristinare i dati al reset dei filtri
  const originalFattureRef = useRef<Record<string, any[]>>({});

  const getRowKey = (row: Record<string, any>) =>
    `${row.annoRiferimento}-${row.meseRiferimento}-${row.tipologiaFattura}-${row.statoInvio}`;

  const applyFiltersCollapse = (row: Record<string, any>, filtri: FiltriCollapseInvioFatture) => {
    const key = getRowKey(row);
    setListaFatture((prev) =>
      prev.map((item) => {
        if (getRowKey(item) !== key) return item;
        if (!originalFattureRef.current[key]) {
          originalFattureRef.current[key] = item.fatture || [];
        }
        const original = originalFattureRef.current[key];
        const ragioneSociale = filtri.ragioneSociale?.trim().toLowerCase() || "";
        const idFattura = filtri.idFattura?.trim() || "";
        const dataFattura = filtri.dataFattura ? new Date(filtri.dataFattura).toDateString() : "";

        const filtered = original.filter((f) => {
          const matchRagione = !ragioneSociale || (f.ragioneSociale || "").toLowerCase().includes(ragioneSociale);
          const matchId = !idFattura || String(f.idFattura ?? "").includes(idFattura);
          const matchData = !dataFattura || (f.dataFattura && new Date(f.dataFattura).toDateString() === dataFattura);
          return matchRagione && matchId && matchData;
        });
        return { ...item, fatture: filtered };
      })
    );
  };

  const headerAction = (
    label: string,
    setGridDataParam: (data: any[]) => void,
    emessiGrid = true,
    setObjectSort: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>,
    page: number,
    rowsPerPage: number,
    listaResponseParameter: any[],
  ) => {};

 



  const showPopUpAction = (obj, action) => { 
    setInforeInvio(obj.storicoInvii);
    setShowPopUpdateInvio(true);
  };

  const statusAnnulla = (bodyFatturazione.anno !== arrayYears[0] ||
   bodyFatturazione.mesi.length > 0 ||
   bodyFatturazione.tipologieFattura.length > 0 || 
   bodyFatturazione.statoInvio !== "TUTTE") ? "show" :"hidden";
 
  return(
    <MainBoxStyled title={"Invio a SAP"}>
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
          arrayValues={arrayYears}
          extraCodeOnChange={(e)=>{
            setBodyFatturazione((prev)=> ({...prev, anno:Number(e)}));
            getMesi(e.toString());
            getTipologieFattura({anno:bodyFatturazione.anno,mesi:[]});
            setValueMultiselectTipologie([]);
            setValueSelectMonths([]);
          }}/>
        <MainFilter 
          filterName={"multi_checkbox"}
          inputLabel={"Mese"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyFatturazione}
          body={bodyFatturazione}
          dataSelect={arrayMonths}
          valueAutocomplete={valueSelectMonths}
          setValueAutocomplete={setValueSelectMonths}
          keyDescription={"descrizione"}
          keyBody={"mesi"}
          keyValue={"mese"}
          disabled={bodyFatturazione.anno === ""}
          extraCodeOnChangeArray={(value)=>{
            const valueArray = value.map((el) => Number(el.mese));
            setValueSelectMonths(value);
            getTipologieFattura({anno:bodyFatturazione.anno,mesi:valueArray});
            setBodyFatturazione((prev) => ({...prev,...{mesi:valueArray,tipologieFattura:[]}}));
            setValueMultiselectTipologie([]);
          }}
          iconMaterial={RenderIcon("date",true)}
        />
        <MainFilter 
          filterName={"multi_checkbox"}
          inputLabel={"Tipologia Fattura"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyFatturazione}
          body={bodyFatturazione}
          dataSelect={tipologieFatture}
          valueAutocomplete={valueMulitselectTipologie}
          setValueAutocomplete={setValueMultiselectTipologie}
          keyDescription={"tipologiaFattura"}
          keyValue={"tipologiaFattura"}
          keyBody={"tipologiaFattura"}
          extraCodeOnChangeArray={(e)=>{
            setValueMultiselectTipologie(e);
            setBodyFatturazione((prev) => ({...prev,...{tipologieFattura:e}}));
          }}
          iconMaterial={RenderIcon("invoice",true)}/>
        <MainFilter
          filterName={"select_key_value"}
          inputLabel="Tipologia Invio"
          arrayValues={arrayTipologieInvio}
          keyValue="codice"
          keyDescription="descrizione"
          keyBody="statoInvio"
          body={bodyFatturazione}
          setBody={setBodyFatturazione}
          clearOnChangeFilter={() => {}}
        />
      </ResponsiveGridContainer>
      <FilterActionButtons 
        onButtonFiltra={onButtonFiltra} 
        onButtonAnnulla={onButtonAnnulla} 
        statusAnnulla={statusAnnulla} 
      />
      <ActionTopGrid
        counter={elementsSelected.length}
        actionButtonRight={[
          {
            onButtonClick:downloadRisultati,
            variant: "outlined",
            label: "Download Fatture Re-inviate",
            icon:{name:"download"},
            disabled:true
          },
          {
            onButtonClick:downloadRisultati,
            variant: "outlined",
            label: "Download Risultati",
            icon:{name:"download"},
            disabled:(listaFatture?.length === 0)
          }]}/>
      <div className="mt-1 mb-5" style={{ width: '100%'}}> 
        <GridCustom
          nameParameterApi='invioFatture'
          elements={listaFatture.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
          changePage={handleChangePage}
          changeRow={handleChangeRowsPerPage}
          total={count}
          page={page}
          rows={rowsPerPage}
          headerNames={headerNamesInvioFatture}
          headerNamesCollapse={headerNamesInvioFattureCollapse}
          apiGet={()=>setOpenModalFatture(true)}
          disabled={false}
          widthCustomSize="1600px"
          //setAction={showPopUpAction}
          manageCheckbox={manageCheckbox}
          manageCheckboxCollapse={manageCheckboxCollapse}
          filterOnCollapse={(row) => (
            <FiltersCollapseInvioFatture
              element={row}
              selectedRows={elementsSelected}
              manageStateCheckbox={manageStateCheckbox}
              onGenerate={()=>setOpenModalFatture(true)}
              onFilter={(filtri) => applyFiltersCollapse(row, filtri)}
              onLoading={setCollapseDataLoading}
            />
          )}
          getAsyncDetails={handleGetDetailsRowCollapsed}
          collapseDataLoading={collapseDataLoading}
          selectedRows={elementsSelected}
          headerActionSort={headerAction}
          //setGridData={setGridData}
          gridType={true}
          setObjectSort={setObjectSort}
          objectSort={objectSort}
          manageStateCheckbox={manageStateCheckbox}
          //listaResponse={listaResponse}
          sentenseEmpty={"Nessuna fattura disponibile"}
          keyCollapse={"fatture"}
          titleRowCollapse={"Dettaglio Fatture"}
          colSpanCollaps={8}
          setAction={showPopUpAction}
        />
      </div>
      <ModalLoading 
        open={showLoader} 
        setOpen={setShowLoader}
        sentence={'Loading...'} />
      <ModalLoading 
        open={showDownloading} 
        setOpen={setShowDownloading}
        sentence={'Downloading...'} />
      <MainModalComponent 
        width={"1200px"}
        open={openModalFatture}
        setOpen={setOpenModalFatture}
      >
        <ModalContentFattureSelezionate
          elementsSelected={elementsSelected}
          setOpen={setOpenModalFatture}
          numeroDocStorno={numeroDocStorno}
          setNumeroDocStorno={setNumeroDocStorno}
          nota={nota}
          setNota={setNota}
        />
      </MainModalComponent>
      <DialogInfo 
        open={showPopUpDateInvio}
        onClose={setShowPopUpdateInvio}
        clearAction={() => { setInforeInvio([]);}}
        array={infoReinvio}
        title="Storico Invio"
        ContentComponent={DilogContentList}/>
    </MainBoxStyled>
  );
};
export default InvioFatture;



export const checkIfElementSelected = (arraySel, row) =>{
  return !arraySel.find((el) =>{
    return el.annoRiferimento === row.annoRiferimento &&
       el.meseRiferimento === row.meseRiferimento && 
       el.tipologiaFattura === row.tipologiaFattura &&
       el.statoInvio === row.statoInvio;});
}; 

interface ModalContentFattureSelezionateProps {
  elementsSelected: Record<string, any>[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  numeroDocStorno: string;
  setNumeroDocStorno: (value: string) => void;
  nota: string;
  setNota: (value: string) => void;
}

const ModalContentFattureSelezionate : React.FC<ModalContentFattureSelezionateProps> = ({
  elementsSelected,
  setOpen,
  numeroDocStorno,
  setNumeroDocStorno,
  nota,
  setNota
}) => {
  // "idStorno-component" e "nota-component" visibili solo se le fatture selezionate non sono "Da inviare" (statoInvio !== 0)
  const showStornoNota = elementsSelected.some(el => el.statoInvio === "DA_INVIARE");
  const keyValueObjFiltered = showStornoNota
    ?  keyValueObjModalInfo.filter(el => el.key !== "idStorno-component" && el.key !== "nota-component")
    : keyValueObjModalInfo;

  return (
    <Box>
      <ElementToProcessComponent
        closeIcon={true}
        title={"Fatture Selezionate"}
        obj={elementsSelected}
        keyValueObj={keyValueObjFiltered}
        showButton={false}
        setOpen={setOpen}
        showCounter={true}
      />
      {elementsSelected.find(el => el.statoInvio === "DA_INVIARE") && <NotaTextField value={""}/>}
      
    </Box>
  );
};

interface ListItemData {
  "nInvio": number,
  "data": string,
  "testo": string,
  "azione": string
}


const DilogContentList : React.FC<{array:ListItemData[]}> = ({ array = [] }) => { 
  return (
    <DialogContent dividers>
      {array.length === 0 ? (
        <Typography color="text.secondary">
          Nessuna nota disponibile.
        </Typography>
      ) : (
        <List  
          disablePadding 
          sx={{ 
            maxHeight: 400, 
            overflowY: 'auto' 
          }}>
          {array.map((nota, index) => {
            let colorChip:string|undefined = undefined;
            //let azione = "";
            if(nota?.azione === "RE_INVIATA"){
              colorChip = '##B5E2B4';
              //azione = 'Re-inviata';
            }else if(nota?.azione === "INVIATA"){
              colorChip = '#B5E2B4';
              //azione = 'inviata';
            }
          
            return (
              <Box key={nota.data + nota.nInvio} sx={{ backgroundColor: "grey.100",marginBottom: 1, borderRadius: 1, padding: 1 }}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={nota.testo}
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center" component="span">
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {new Date(nota.data).toLocaleString("it-IT")}
                        </Typography>
                        {nota.azione &&
                      <>
                        <Typography 
                          component="span"
                          variant="body2"
                          color="text.secondary">
                          - Azione :
                        </Typography>
                        <Chip variant="outlined" size="small" label={nota.azione} 
                          sx={{
                            backgroundColor: colorChip,
                            height: 18,
                            fontSize: '0.65rem',
                            '& .MuiChip-label': {
                              padding: '0 6px',
                            }
                          }}   />
                      </>
                        }
                      </Stack>
                    }
                  />
                </ListItem>
                {index < array.length - 1 && <Divider />}
              </Box>
            );})}
        </List>
      )}
    </DialogContent>
  );
};


/* //TODO penso si possa cancellare, vecchia logica per ordinare le tipologie , ci arriveranno dalle api
      const array = res.data.map( el => el.tipologiaFattura);
      const ORDER = ;

      const toTitleCase = (str: string) =>
        str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
      //ATTENZIONE: SE verrà aggiunta un altra tipologia fattura bisogna aggiungerla nell'array ORDER ALTRIMENTI NON VERRà MAPPATA
      const uniqueArray = array
        .map(toTitleCase)
        .reduce((accumulator, current) => {
          if (!accumulator.includes(current)) {
            accumulator.push(current);
          }
          return accumulator;
        }, [])
        .sort((a, b) => {
          const indexA = ORDER.indexOf(a);
          const indexB = ORDER.indexOf(b);
          const rankA = indexA === -1 ? ORDER.length : indexA;
          const rankB = indexB === -1 ? ORDER.length : indexB;
          return rankA - rankB;
        });


          const onButtonInvia = async() =>{
    setShowLoader(true);
    await invioListaJsonFatturePagoPa(token,profilo.nonce,selected).then(()=>{
      setShowLoader(false);
      getLista();
      setSelected([]);
      setRowSelectionModel([]);
      setTipologia('Tutte');
      resetFilters();
      managePresaInCarico('SEND_JSON_SAP_OK',dispatchMainState);
    }).catch((err)=>{
      setShowLoader(false);
      setSelected([]);
      setRowSelectionModel([]);
      setTipologia('Tutte');
      resetFilters();
      manageError(err, dispatchMainState);
    });
  };

  const statoFattura = (row) =>{
    let tooltipObj:any = {label:'',title:''};
    if(row.statoInvio === 0){
      tooltipObj = {label:'Da inviare',title:'Da inviare',color:'#86E1FD'};
    }else if(row.statoInvio === 2){
      tooltipObj = {label:'Elaborazione',title:'La fattura è in elaborazione',color:"#FFE5A3"};
    }
    return tooltipObj;
  };
          
   */


const x  = [{
  "anno": 0,
  "mese": 0,
  "tipologiaFattura": "string",
  "statoInvio": "string",
  "fattureSelezionate": [
    {
      "idFattura" :"number", 
      "tipologiaFattura":"string",
      "nota": "string",
      "numeroDocumentoStorno": "string"}
  ],
  
}];