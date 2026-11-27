import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { manageError, manageErrorDownload, managePresaInCarico } from "../../api/api";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import { saveAs } from "file-saver";
import MainFilter from "../../components/reusableComponents/mainFilter";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import { headerNamesInvioFatture, headerNamesInvioFattureCollapse, keyValueObjModalInfo } from "../../assets/configurations/conf_GridInvioFatture";
import MainModalComponent from "../../components/reusableComponents/modals/mainModalComponent";
import { ViewDataComponent } from "../../components/reusableComponents/tableViewData";
import DialogInfo from "../../components/reusableComponents/modals/dialogInfo";
import { Box, Chip, DialogContent, Divider, List, ListItem, ListItemText, Stack, Typography } from "@mui/material";
import { NotaTextField } from "./gestioneFatture";
import FiltersCollapseInvioFatture, { FiltriCollapseInvioFatture } from "../../components/invioFatture/filtersCollapseInvioFatture";
import { downloadInvioFatture, downloadInvioFattureDaReInviare, generazioneJson, generazioneJsonInviate, getAnniInviofatture, getCheckLock, getDettaglioInvioFatture, getListaInvioFatture, getMesiInviofatture, getStatiInvioJson, getTipologieInviofatture } from "../../api/apiPagoPa/invioFattureSapPA/api";
import { toMesi } from "../../reusableFunction/reusableArrayObj";
import { isValidNumeroDocumentoStorno, isValidText2NotaPii } from "../../reusableFunction/function";
import { PathPf } from "../../types/enum";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";

interface ListaFatture {
  tipologiaFattura: string,
  statoInvio:string,
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
  "meseRiferimento": number,
  "nota":string,
  "numeroDocumentoStorno":string
};

type InputFattura = { nota: string, numeroDocumentoStorno: string };

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
  "nota"?: string,
  "numeroDocumentoStorno"?: string
}

export interface BodyGeneraJsonInviate {
  "anno": number,
  "mese": number,
  "tipologiaFattura": string,
  "fatture": {
    "idFattura": number,
    "nota": string,
    "numeroDocumentoStorno": string
  }[]
}

const InvioFatture : React.FC = () => {

  const mainState = useGlobalStore(state => state.mainState);
  const dispatchMainState = useGlobalStore(state => state.dispatchMainState);

  const token =  mainState.profilo.jwt;
  const profilo =  mainState.profilo;

  const [listaFatture, setListaFatture] = useState<ListaFatture[]>([]);
  const [showLoader, setShowLoader] = useState(false);
  const [showDownloading, setShowDownloading] = useState(false);
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
  const [objectSort, setObjectSort] = useState<{[key:string]:number}>({"Anno Riferimento":1,"Mese Riferimento":1});
  const [openModalFatture, setOpenModalFatture]= useState(false);
  const [infoReinvio, setInforeInvio] = useState<{dataInvio:string}[]>([]);
  const [showPopUpDateInvio, setShowPopUpdateInvio] = useState(false);
  const [nota, setNota] = useState("");
  const [elementsSelected,setElementSelected] = useState<DettaglioFattura[]>([]);

  const [bodyFatturazione, setBodyFatturazione] = useState<BodyInvioFatture>({
    anno:"",
    mesi:[],
    tipologieFattura:[],
    statoInvio:""
  });

  const [allElementsSelected, setAllElementsSelected] = useState(false);
  // righe (getRowKey) con dettagli in caricamento
  const [loadingRows, setLoadingRows] = useState<string[]>([]);
  // ultima riga su cui l'utente ha cliccato il checkbox principale: serve a scartare risposte non più attuali
  const lastCheckboxKeyRef = useRef<string | null>(null);

  // ______________ Input della modale (nota / n. doc. storno) per singola fattura ______________
  // valori digitati tenuti in un ref: una digitazione non aggiorna elementsSelected né ri-renderizza le altre righe
  const inputFattureRef = useRef<Map<number, InputFattura>>(new Map());
  // id delle fatture con input non validi: lo state cambia solo quando cambia il numero di invalidi
  const invalidIdsRef = useRef<Set<number>>(new Set());
  const [invalidInputCount, setInvalidInputCount] = useState(0);

  const isInputFatturaValid = (v: InputFattura) =>
    isValidText2NotaPii(v.nota) && isValidNumeroDocumentoStorno(v.numeroDocumentoStorno);

  // al cambio della selezione: allineo ref e invalidi (O(n) solo qui, non a ogni digitazione)
  useEffect(() => {
    const nextInputs = new Map<number, InputFattura>();
    const nextInvalid = new Set<number>();
    elementsSelected.forEach((el) => {
      const value = inputFattureRef.current.get(el.idFattura)
        ?? { nota: el.nota ?? "", numeroDocumentoStorno: el.numeroDocumentoStorno ?? "" };
      nextInputs.set(el.idFattura, value);
      if(!isInputFatturaValid(value)) nextInvalid.add(el.idFattura);
    });
    inputFattureRef.current = nextInputs;
    invalidIdsRef.current = nextInvalid;
    setInvalidInputCount(nextInvalid.size);
  }, [elementsSelected]);

  // aggiornamento O(1) per digitazione; setState con lo stesso valore non provoca render
  const onInputFatturaChange = useCallback((idFattura: number, key: keyof InputFattura, value: string) => {
    const prev = inputFattureRef.current.get(idFattura) ?? { nota: "", numeroDocumentoStorno: "" };
    const next = { ...prev, [key]: value };
    inputFattureRef.current.set(idFattura, next);
    if(isInputFatturaValid(next)) invalidIdsRef.current.delete(idFattura);
    else invalidIdsRef.current.add(idFattura);
    setInvalidInputCount(invalidIdsRef.current.size);
  }, []);

  const {
    filters,
    updateFilters,
    isInitialRender,
    resetFilters
  } = useSavedFilters(PathPf.JSON_TO_SAP,{});

  // ______________ Loading sul bottone "Generazione Json" ______________
  // con molti elementi selezionati il render della modale è lento: mostro il loading finché non è visualizzata
  const [openingModal, setOpeningModal] = useState(false);

  const openModalWithLoading = () => {
    setOpeningModal(true);
    // requestAnimationFrame + setTimeout: il browser disegna prima il loading,
    // solo dopo parte il render (sincrono e pesante) della modale
    requestAnimationFrame(() => {
      setTimeout(() => setOpenModalFatture(true), 0);
    });
  };

  // modale montata (commit del render completato): tolgo il loading
  useEffect(() => {
    if(openModalFatture) setOpeningModal(false);
  }, [openModalFatture]);


  useEffect(()=>{
    getAnni();
    getLock();
  },[]);

  const getStati = async () => {
    try{
      const resp = await getStatiInvioJson(token,profilo.nonce);
      setArrayTipologieInvio(resp.data);
      // non sovrascrivo lo stato invio ripristinato dai filtri salvati
      setBodyFatturazione((prev)=>({...prev,statoInvio:prev.statoInvio || "TUTTE"}));

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

      // filtri salvati (reload della pagina): ripristino filtri, paginazione e lista
      if(isInitialRender.current && filters?.body){
        const savedBody: BodyInvioFatture = filters.body;
        setBodyFatturazione(savedBody);
        setValueSelectMonths(filters.valueSelectMonths || []);
        setValueMultiselectTipologie(filters.valueMulitselectTipologie || []);
        setRowsPerPage(filters.rows || 10);
        getMesi(savedBody.anno);
        getStati();
        getTipologieFattura({anno:savedBody.anno,mesi:savedBody.mesi || []});
        getLista(savedBody, filters.page || 0);
        return;
      }

      setBodyFatturazione((prev)=>({
        ...prev, anno:resp.data[0]
      }));
      getMesi(resp.data[0]);
      getStati();
      getTipologieFattura({anno:resp.data[0],mesi:[]});
      getLista({...bodyFatturazione,anno:resp.data[0]});
    }catch(err:any){
      setArrayYears([]);
      setShowLoader(false);
      manageError(err,dispatchMainState);
    }
  };

  const getLock = async () => {
    try{
      const resp = await getCheckLock(token,profilo.nonce);
      if(resp.status === 204){
        console.log(1);
      }
    
    }catch(err){
      console.log(err);
    }
  };
  
  const getMesi = async (anno) => {
    try{
      const resp = await getMesiInviofatture(token,profilo.nonce,{anno:anno});
      const result:{mese:number,descrizione:string}[] = toMesi(resp.data).reverse();
      const resultUpperCase :{mese:number,descrizione:string}[] = result.map(el => {
        el.descrizione = el.descrizione.toUpperCase();
        return el;
      });
      setArrayMonths(resultUpperCase);
    }catch(err:any){
      setArrayMonths([]);
      manageError(err,dispatchMainState);
    }
  };

  // pageToSet: pagina da mostrare dopo il caricamento (ripristino dai filtri salvati), di default la prima
  const getLista = async (body, pageToSet = 0) =>{
    if(!isInitialRender.current){
      setShowLoader(true);
    }
    try{
      const res = await getListaInvioFatture(token,profilo.nonce,body);
      // nuova lista: i dettagli caricati prima non sono più validi
      rowsCompleteRef.current.clear();
      originalFattureRef.current = {};
      setListaFatture(res.data);
      setCount(res.data?.length || 0);
      setPage(pageToSet);
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
    if(filters?.body) updateFilters({page:newPage});
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newRows = parseInt(event.target.value, 10);
    setRowsPerPage(newRows);
    setPage(0);
    if(filters?.body) updateFilters({page:0,rows:newRows});
  };

  const downloadRisultati = async () => {
    setShowDownloading(true);
    try {
      const response = await downloadInvioFatture(token, profilo.nonce, bodyFatturazione);
      if (!response.ok) throw '404';
      const blob = await response.blob();
      const title = `Lista Invio a SAP.xlsx`;
      saveAs(blob, title);
    } catch {
      manageErrorDownload('404', dispatchMainState);
    } finally {
      setShowDownloading(false);
    }
  };

  const downloadReInviate = async () => {
    setShowDownloading(true);
    try {
      const response = await downloadInvioFattureDaReInviare(token, profilo.nonce, bodyFatturazione);
      if (!response.ok) throw '404';
      const blob = await response.blob();
      const title = `Lista Fatture Re-Inviate SAP.xlsx`;
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
    // salvo i filtri: al reload vengono ripristinati e la lista viene ricaricata
    updateFilters({
      pathPage:PathPf.JSON_TO_SAP,
      body:bodyFatturazione,
      valueSelectMonths,
      valueMulitselectTipologie,
      page:0,
      rows:rowsPerPage
    });
    getLista(bodyFatturazione);
  };

  const onButtonAnnulla = () => {
    const newBody = {
      anno:arrayYears[0],
      mesi:[],
      tipologieFattura:[],
      statoInvio:"TUTTE"
    };
    resetFilters();
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

  // dettagli: passati dalla grid quando il click sul checkbox ha appena caricato (in await) tutte le fatture della riga
  const manageCheckbox = (currentRow: Record<string, any>, dettagli?: Record<string, any>[]): void => {
    const key = getRowKey(currentRow);

    // risposta non più attuale: l'utente ha cliccato il checkbox di un'altra riga nel frattempo
    if(dettagli && lastCheckboxKeyRef.current !== key) return;

    // elementsSelected è quello del momento del click (closure), quindi il toggle resta corretto anche dopo l'await
    const fattureRiga = (dettagli as DettaglioFattura[]) ?? getFattureCompleteRiga(currentRow);

    const verifyIfSelected = (!!elementsSelected.find((el) =>{
      return el.annoRiferimento === currentRow.annoRiferimento &&
       el.meseRiferimento === currentRow.meseRiferimento &&
       el.tipologiaFattura === currentRow.tipologiaFattura &&
       el.statoInvio === currentRow.statoInvio;
    } )) && fattureRiga.length !== 0 && fattureRiga.length === elementsSelected.length;

    lastCheckboxKeyRef.current = key;
    if(verifyIfSelected){
      setElementSelected([]);
      setAllElementsSelected(false);
    }else{
      //prendo tutti i sotto elementi
     
      setElementSelected(fattureRiga);
      setAllElementsSelected(fattureRiga.length > 0);
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
          ragioneSociale:currentRow.ragioneSociale,
          numeroInvii:currentRow.numeroInvii
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

    // checkbox principale disabilitato finché i dettagli della riga sono in caricamento
    const rowLoading = isMainCheck === "main-row" && loadingRows.includes(getRowKey(row));

    return {
      verifyIfSelected,
      disabled:row.statoInvio === "IN_ELABORAZIONE" || disabled || rowLoading
    };
  };


  //Bisognaaggiungere un parametro che controlla se è collapsed altrimenti non devo faren la chiamata
  const PAGE_SIZE_DETTAGLIO = 500;

  // restituisce le fatture complete della riga; la selezione è gestita da manageCheckbox (chiamato dalla grid dopo l'await)
  const handleGetDetailsRowCollapsed = async (el: Record<string, any>, clickOnCheckbox:boolean = false): Promise<DettaglioFattura[]> => {
    const rowKey = getRowKey(el);
    if(clickOnCheckbox){
      lastCheckboxKeyRef.current = rowKey;
    }

    // dettaglio già caricato completamente: nessuna chiamata, restituisco le fatture già presenti
    const fattureCaricate = originalFattureRef.current[rowKey];
    if(rowsCompleteRef.current.has(rowKey) && fattureCaricate){
      // ripristino la lista completa: alla riapertura i filtri del collapse ripartono vuoti
      setListaFatture((prev) => prev.map((item) => getRowKey(item) === rowKey ? { ...item, fatture: fattureCaricate } : item));
      setCollapseDataLoading(false);
      return fattureCaricate;
    }

    setLoadingRows((prev) => prev.includes(rowKey) ? prev : [...prev, rowKey]);

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

      // mostro subito la prima pagina
      let allFatture = firstPage;
      updateRiga(allFatture);
      setCollapseDataLoading(false);

      // pagine successive in sequenza: la chiamata n+1 parte solo quando la n è risolta,
      // e ogni pagina viene aggiunta subito alla riga
      for(let p = 2; p <= totalPages; p++){
        const res = await fetchPage(p);
        allFatture = [...allFatture, ...mapCollapse(res.data.fatture)];
        updateRiga(allFatture);
      }
      // tutte le pagine caricate: alle prossime aperture non rifaccio le chiamate
      rowsCompleteRef.current.add(rowKey);
      return allFatture;

    }catch(error:any){
      if(error.response?.status === 401 || error.message === "Network Error"){
        manageError(error,dispatchMainState);
      }else{
        managePresaInCarico("ERROR_LIST_JSON_TO_SAP", dispatchMainState);
      }
      setCollapseDataLoading(false);
      return [];
    }finally{
      setLoadingRows((prev) => prev.filter((k) => k !== rowKey));
    }
  };


  // ______________ Filtri dentro il collapse (applicati solo alla riga corrente) ______________
  // copia delle fatture originali (response iniziale) per ogni riga, usata per ripristinare i dati al reset dei filtri
  const originalFattureRef = useRef<Record<string, any[]>>({});
  // righe (getRowKey) il cui dettaglio è stato caricato per intero
  const rowsCompleteRef = useRef<Set<string>>(new Set());

  const getRowKey = (row: Record<string, any>) => `${row.annoRiferimento}-${row.meseRiferimento}-${row.tipologiaFattura}-${row.statoInvio}`;

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
        // 1 = inviate (numeroInvii < 2), 2 = re-inviate (numeroInvii > 1), null = nessun filtro
        const numeroInvii = filtri.numeroInvii != null ? Number(filtri.numeroInvii) : null;

        const filtered = original.filter((f) => {
          const matchRagione = !ragioneSociale || (f.ragioneSociale || "").toLowerCase().includes(ragioneSociale);
          const matchId = !idFattura || String(f.idFattura ?? "").includes(idFattura);
          const matchData = !dataFattura || (f.dataFattura && new Date(f.dataFattura).toDateString() === dataFattura);
          const invii = Number(f.numeroInvii ?? 0);
          const matchInvii = numeroInvii === 1 ? invii < 2
            : numeroInvii === 2 ? invii > 1
              : true;
          return matchRagione && matchId && matchData && matchInvii;
        });
        return { ...item, fatture: filtered };
      })
    );
  };

  const showPopUpAction = (obj, action) => { 
    setInforeInvio(obj.storicoInvii);
    setShowPopUpdateInvio(true);
  };



  const generaJsonToSAP = async() => {
    setOpenModalFatture(false);
    
    setShowLoader(true);
    const idsFatture = elementsSelected.map(el => el.idFattura );
    const fatturaTypo = elementsSelected[0];
    const allFattureInsideMainRow = (listaFatture.find((el) => {
      return el.annoRiferimento === fatturaTypo.annoRiferimento &&  
      el.meseRiferimento === fatturaTypo.meseRiferimento &&
      el.tipologiaFattura === fatturaTypo.tipologiaFattura &&
      el.statoInvio === fatturaTypo.statoInvio;
    })?.fatture)||[];
   
    const idsB = new Set(elementsSelected.map(f => f.idFattura));
    const mancantiInB:number[] = allFattureInsideMainRow.filter(f => !idsB.has(f.idFattura)).map(el => el.idFattura);

    try{
      if(fatturaTypo.statoInvio === "DA_INVIARE"){

        const bodyGenerazione: BodyGeneraJson = {
          anno: fatturaTypo.annoRiferimento,
          mese: fatturaTypo.meseRiferimento,
          tipologiaFattura: fatturaTypo.tipologiaFattura,
          statoInvio: fatturaTypo.statoInvio,
          allSelected: allElementsSelected,
          idFatture: allElementsSelected ? [] : idsFatture,
          idFattureEscluse: allElementsSelected ? mancantiInB : [],
          nota: nota,
          numeroDocumentoStorno: ""
        };
        await generazioneJson(token,profilo.nonce,bodyGenerazione);
      }else{
        const bodyGenerazioneInviate: BodyGeneraJsonInviate = {
          anno: fatturaTypo.annoRiferimento,
          mese: fatturaTypo.meseRiferimento,
          tipologiaFattura: fatturaTypo.tipologiaFattura,
          fatture: elementsSelected.map(el => {
            const input = inputFattureRef.current.get(el.idFattura);
            return {
              idFattura: el.idFattura,
              nota: input?.nota ?? el.nota ?? "",
              numeroDocumentoStorno: input?.numeroDocumentoStorno ?? el.numeroDocumentoStorno ?? ""
            };
          })
        };
        await generazioneJsonInviate(token,profilo.nonce,bodyGenerazioneInviate);
      }
      
      await getLista(bodyFatturazione);
      managePresaInCarico("INSER_DELETE_WHITE_LIST", dispatchMainState);
      setNota("");
      setElementSelected([]);
    }catch(err: unknown){
    
      const motivo = axios.isAxiosError<{ motivo?: string }>(err) ? err.response?.data?.motivo : undefined;
      if(motivo === "LOCK_ATTIVO"){
        managePresaInCarico('LOCK_ATTIVO',dispatchMainState);
      }else{
        managePresaInCarico('GENERICO_KO',dispatchMainState);
        setNota("");
        setElementSelected([]);
      }
    }finally{
     
      setShowLoader(false);
    }
  };

  // DA_INVIARE: serve la nota generale (min 10 caratteri)
  // altri stati (re-invio): ogni fattura selezionata deve avere nota e numeroDocumentoStorno valorizzati
  const buttonGeneraDisabled = elementsSelected.length === 0 || (
    elementsSelected[0].statoInvio === "DA_INVIARE"
      ? !isValidText2NotaPii(nota ?? "")
      : invalidInputCount > 0
  );
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
          clearOnChangeFilter={clearOnChangeFilter}
          arrayValues={arrayTipologieInvio}
          keyValue="codice"
          keyDescription="descrizione"
          keyBody="statoInvio"
          body={bodyFatturazione}
          setBody={setBodyFatturazione}
          defaultValue={"TUTTE"}
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
            onButtonClick:downloadReInviate,
            variant: "outlined",
            label: "Download Fatture Re-inviate",
            icon:{name:"download"},
            disabled:(listaFatture?.length === 0)
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
          filterOnCollapse={(row, detailsLoading) => (
            <FiltersCollapseInvioFatture
              element={row}
              disabled={detailsLoading}
              selectedRows={elementsSelected}
              manageStateCheckbox={manageStateCheckbox}
              onGenerate={openModalWithLoading}
              generateLoading={openingModal}
              onFilter={(filtri) => applyFiltersCollapse(row, filtri)}
              onLoading={setCollapseDataLoading}
            />
          )}
          getAsyncDetails={handleGetDetailsRowCollapsed}
          collapseDataLoading={collapseDataLoading}
          selectedRows={elementsSelected}
          //headerActionSort={headerAction}
          //setGridData={setGridData}
          gridType={true}
          setObjectSort={setObjectSort}
          objectSort={objectSort}
          manageStateCheckbox={manageStateCheckbox}
          //listaResponse={listaResponse}
          sentenseEmpty={"Nessuna fattura disponibile"}
          keyCollapse={"fatture"}
          titleRowCollapse={"Dettaglio Fatture"}
          sentenseEmptyCollapse={"Nessuna fattura disponibile"}
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
        width={"1300px"}
        open={openModalFatture}
        setOpen={setOpenModalFatture}
        action={generaJsonToSAP}
        buttonDisabled={buttonGeneraDisabled}
      >
        <ModalContentFattureSelezionate
          elementsSelected={elementsSelected}
          onInputFatturaChange={onInputFatturaChange}
          setOpen={setOpenModalFatture}
          nota={nota}
          setNota={setNota}/>
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
  onInputFatturaChange: (idFattura: number, key: keyof InputFattura, value: string) => void;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  nota: string;
  setNota: (value: string) => void;
}

const ModalContentFattureSelezionate : React.FC<ModalContentFattureSelezionateProps> = ({
  elementsSelected,
  setOpen,
  onInputFatturaChange,
  nota,
  setNota
}) => {
  // "idStorno-component" e "nota-component" visibili solo se le fatture selezionate non sono "Da inviare" (statoInvio !== 0)
  const showStornoNota = elementsSelected.some(el => el.statoInvio === "DA_INVIARE");
  // riferimento stabile: altrimenti tutte le righe memoizzate della tabella si ri-renderizzano
  const keyValueObjFiltered = useMemo(() => showStornoNota
    ?  keyValueObjModalInfo.filter(el => el.key !== "idStorno-component" && el.key !== "nota-component")
    : keyValueObjModalInfo, [showStornoNota]);

  // salva nella fattura selezionata il valore inserito nei campi della modale (numero documento storno / nota)
  // non aggiorna elementsSelected: il valore resta nello stato locale della riga e nel ref del parent
  const setUserInputInsideFattura = useCallback((fattura: Record<string, any>, idComponent: string, valueText: string) => {
    if(idComponent === "idStorno-component"){
      onInputFatturaChange(fattura.idFattura, "numeroDocumentoStorno", valueText);
    }else if(idComponent === "nota-component"){
      onInputFatturaChange(fattura.idFattura, "nota", valueText);
    }
  }, [onInputFatturaChange]);

  return (
    <Box>
      <ViewDataComponent
        closeIcon={true}
        title={"Fatture Selezionate"}
        obj={elementsSelected}
        onComponentChange={setUserInputInsideFattura}
        keyValueObj={keyValueObjFiltered}
        showButton={false}
        setOpen={setOpen}
        showCounter={true}
      />
      {elementsSelected.find(el => el.statoInvio === "DA_INVIARE") && <NotaTextField error={nota.length < 10} onChange={setNota} value={nota}/>}
      
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