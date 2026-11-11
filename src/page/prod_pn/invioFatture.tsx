import { useEffect, useRef, useState } from "react";
import { GridCellParams, GridEventListener, GridRowParams, GridRowSelectionModel, MuiEvent } from "@mui/x-data-grid";
import { useNavigate } from "react-router";
import { manageError, manageErrorDownload, managePresaInCarico } from "../../api/api";
import { downloadReportRelNonFatturate, getListaJsonFatturePagoPa, invioListaJsonFatturePagoPa, sendListaJsonFatturePagoPa } from "../../api/apiPagoPa/fatturazionePA/api";
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
import { Box, DialogContent, Divider, List, ListItem, ListItemText, Stack, Typography } from "@mui/material";
import { NotaTextField } from "./gestioneFatture";
import FiltersCollapseInvioFatture, { FiltriCollapseInvioFatture } from "../../components/invioFatture/filtersCollapseInvioFatture";
import NavigatorHeader from "../../components/reusableComponents/navigatorHeader";
import DescriptionIcon from '@mui/icons-material/Description';
import { downloadInvioFatture, getDettaglioInvioFatture, getStatiInvioJson } from "../../api/apiPagoPa/invioFattureSapPA/api";
import { ManageErrorResponse } from "../../types/typesGeneral";

interface ListaFatture {
  tipologiaFattura: string,
  statoInvio:number,
  numeroFatture: number,
  annoRiferimento: number,
  meseRiferimento: number,
  importo: number,
  fatture:any[]
}

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
  "idFatture": number[],
  "nota": string,
  "numeroDocumentoStorno": string
}


const InvioFatture : React.FC = () => {

  const mainState = useGlobalStore(state => state.mainState);
  const dispatchMainState = useGlobalStore(state => state.dispatchMainState);

  const token =  mainState.profilo.jwt;
  const profilo =  mainState.profilo;
  const navigate = useNavigate();

  const callLista = useRef(true);
    
  const [listaFatture, setListaFatture] = useState<ListaFatture[]>([]);
  const [tipologieFatture, setTipologie] = useState<string[]>(['Tutte']);
  const [selected,setSelected] = useState<SelectedJsonSap[]>([]);
  const [tipologia, setTipologia] = useState('Tutte');
  const [showLoader, setShowLoader] = useState(false);
  const [showDownloading, setShowDownloading] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
  const [infoPage , setInfoPage] = useState({ page: 0, pageSize: 10 });


  const [collapseDataLoading,setCollapseDataLoading] = useState(true);


  const [bodyFatturazione, setBodyFatturazione] = useState<BodyInvioFatture>({
    anno:2026,
    mesi:[],
    tipologieFattura:[],
    statoInvio:""

  });
  

  const [arrayYears,setArrayYears] = useState<number[]>([2025,2026,2027]);
  const [arrayMonths,setArrayMonths] = useState<{mese:string,descrizione:string}[]>([]);

  const [valueMulitselectTipologie, setValueMultiselectTipologie] = useState<string[]>([]);

   

  const { 
    filters,
    updateFilters,
    isInitialRender,
    resetFilters
  } = useSavedFiltersNested("/inviofatture",{});
  console.log({filters});
  useEffect(()=>{
    getLista();
    getStati();
    //TODO: sistemare quaneo ci sarà l'api
    setTipologie(["Anticipo", "Acconto", "Primo Saldo", "Secondo Saldo", "Var. Semestrale", "Sem. Sospesi"]);
    //TODO: cedere dove spostare questa logica
    if(isInitialRender.current && Object.keys(filters).length > 0){
      setTipologia(filters.tipologiaInvio);
      setSelected(filters.selectedInvio);
      setRowSelectionModel(filters.rowSelectionModelInvio);
      setInfoPage(filters.infoPageInvio);
    } 
  },[]);

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
          
   */

  const getStati = async () => {
    try{
      const resp = await getStatiInvioJson(token,profilo.nonce);
      console.log({resp});
      setArrayTipologieInvio(resp.data);
    }catch{
      setArrayTipologieInvio([]);
      console.log("error");
    }
  };

 
  const getLista = async () =>{
    try{
      const res = await getListaJsonFatturePagoPa(token,profilo.nonce);
      setListaFatture(res.data);
    }catch(err:any){
      setListaFatture([]);
      manageError(err, dispatchMainState);
    }
  };

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


  const onChangePageOrRowGrid = (e) => {
    setInfoPage(e);
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
  };

  const onButtonFiltra = () => {
    console.log('Filtra button clicked');
  };

  const onButtonAnnulla = () => {
    console.log('Annulla button clicked');
  };

  const [arrayTipologieInvio, setArrayTipologieInvio] = useState<{codice:string,descrizione:string}[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState(0);
  const [gridData, setGridData] = useState<Fattura[]>([]);
  const [objectSort, setObjectSort] = useState<{[key:string]:number}>({"Anno Riferimento":1,"Mese Riferimento":1});
  const [listaResponse, setListaResponse] = useState<any[]>([]);
  const [openModalFatture, setOpenModalFatture]= useState(false);
  const [infoReinvio, setInforeInvio] = useState<{dataInvio:string}[]>([]);

  const [showPopUpDateInvio, setShowPopUpdateInvio] = useState(false);
  const [numeroDocStorno, setNumeroDocStorno] = useState("");
  const [nota, setNota] = useState("");


  const [elementsSelected,setElementSelected] = useState<Record<string, any>[]>([]);
  const [arrayCollapseSelected,setArrayCollapseSelected] = useState<SelectedJsonSap[]>([]);

  // fatture complete della riga (ignorando i filtri del collapse): se la riga è stata filtrata uso la copia originale
  const getFattureCompleteRiga = (row: Record<string, any>): any[] => {
    const original = originalFattureRef.current[getRowKey(row)];
    if (original) return original;
    return listaFatture.find((el) =>
      el.annoRiferimento === row.annoRiferimento &&
      el.meseRiferimento === row.meseRiferimento &&
      el.tipologiaFattura === row.tipologiaFattura
    )?.fatture || [];
  };

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
      return {
        checkboxStatus:false,
        key:"idFattura"
      };
    }else{
      //prendo tutti i sotto elementi
   
      setElementSelected(getFattureCompleteRiga(currentRow));
      return {
        checkboxStatus:true,
        key:"idFattura"
      };
    }
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
  
  // va inserito dentro la fundione la logica del checkjed
  /*
  const handleGetDetails = (el: ListaFatture) => {
    navigate(PathPf.JSON_TO_SAP_DETAILS.replace(":id",`${el.annoRiferimento}-${el.meseRiferimento}-${el.tipologiaFattura}`));
  };
*/


  //Bisogna aggiungere un parametro che controlla se è collapsed altrimenti non devo faren la chiamata
  const handleGetDetailsRowCollapsed = async (el: Record<string, any>, clickOnCheckbox:boolean = false) => {
  
    try{
      const res = await getDettaglioInvioFatture(token, profilo.nonce, {
        "annoRiferimento": el.annoRiferimento,
        "meseRiferimento": el.meseRiferimento,
        "tipologiaFattura": el.tipologiaFattura,
        "statoInvio": el.statoInvio,
        //"ragioneSociale": "string",
        //"numeroFattura": "string",
        //"dataFattura": "2026-11-10T16:07:02.127Z",
        "page": 0,
        "pageSize": 10
      });
      const resCollapseDetails = res.data;
      setCollapseDataLoading(false);

      const addStatoInvioInsideCollapse = resCollapseDetails.map((collapseEl) => {
        collapseEl.statoInvio = el.statoInvio;
        collapseEl.fileJson = collapseEl.statoInvio !== 0 ? "FatturePagoPa_01012026_1230.json" : "--";
        return collapseEl;
      });

    
      setListaFatture((prevState) =>
        prevState.map((item) =>
          item.annoRiferimento === el.annoRiferimento &&
          item.tipologiaFattura === el.tipologiaFattura &&
          item.meseRiferimento === el.meseRiferimento &&
          item.statoInvio === el.statoInvio
            ? { ...item, fatture: addStatoInvioInsideCollapse }
            : item
        )
      );
   
      if(clickOnCheckbox){
        setElementSelected(resCollapseDetails);
      }
      originalFattureRef.current[getRowKey(el)] = addStatoInvioInsideCollapse;
      return resCollapseDetails;

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

  const statusAnnulla = "hidden";


  const manageStateCheckbox = (row, isMainCheck="",elementsSel) =>{
    
    let verifyIfSelected = false;
    let disabled = false;
   
    if(isMainCheck === "main-row"){
      // confronto con tutte le fatture della riga, non con quelle filtrate nel collapse
      const elementsInsideCollapse = getFattureCompleteRiga(row);

      verifyIfSelected = (!!elementsSel.find((el) =>{
        return el.annoRiferimento === row.annoRiferimento &&
       el.meseRiferimento === row.meseRiferimento && 
       el.tipologiaFattura === row.tipologiaFattura &&
       el.statoInvio === row.statoInvio;
      } )) && (elementsInsideCollapse?.length||0) === elementsSel.length;

      /*
      console.log({1:(elementsSel.find((el) =>{
        return el.annoRiferimento === row.annoRiferimento &&
       el.meseRiferimento === row.meseRiferimento && 
       el.tipologiaFattura === row.tipologiaFattura &&
       el.statoInvio === row.statoInvio;
      } )),2:(elementsInsideCollapse?.length||0) , 3:elementsSel,4:row});*/
      //MAnage disable 

    }else{
      
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
      disabled:row.statoInvio === 2 || disabled
    };
  };

  const showPopUpAction = (obj, action) => { 
    console.log({obj});
    let array = [1,2,3];
    if(obj.statoInvio !== 4){
      array = [ 1 ];
    }
    const notes = array.map((el,i) => ({
      dataInvio:`0${i+1}/12/2026 - 0${i+1}:20:00`,
      testo:"Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industry's standard dummy text ever since 1966,"}));
    setInforeInvio(notes);
    setShowPopUpdateInvio(true);
  
  };
  return(
    <>
      <div>
        <NavigatorHeader pageFrom={"Documenti Contabili Emessi/"} pageIn={"Invio a SAP"} backPath={PathPf.FATTURAZIONE} icon={<DescriptionIcon sx={{padding:"3px"}}  fontSize='small'/>}/>
      </div>
      <MainBoxStyled >
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
              callLista.current = false; 
            /* getMesi(e.toString());
            setDataSelect([]);
            setValueMultiselectTipologie([]);
            setValueAutocomplete([]);*/
            }}/>
          <MainFilter 
            filterName={"select_key_value"}
            inputLabel={"Mese"}
            clearOnChangeFilter={clearOnChangeFilter}
            setBody={setBodyFatturazione}
            body={bodyFatturazione}
            keyValue={"mese"}
            keyDescription='descrizione'
            keyBody={"mese"}
            defaultValue={""}
            arrayValues={arrayMonths}
            extraCodeOnChange={(e)=>{
              const value = Number(e);
            /* setBodyFatturazione((prev)=> ({...prev, ...{mese:value,tipologiaFattura:[]}}));
            getTipologieFatturazione(bodyFatturazione.anno,value,bodyFatturazione.cancellata);
            setValueMultiselectTipologie([]); */           
            }}/>
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
              setBodyFatturazione((prev) => ({...prev,...{tipologiaFattura:e}}));
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
            elements={listaFatture}
            changePage={onChangePageOrRowGrid}
            changeRow={onChangePageOrRowGrid} 
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
            setGridData={setGridData}
            gridType={true}
            setObjectSort={setObjectSort}
            objectSort={objectSort}
            manageStateCheckbox={manageStateCheckbox}
            listaResponse={listaResponse}
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
    </>
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
  const showStornoNota = elementsSelected.some(el => el.statoInvio !== 0);
  const keyValueObjFiltered = showStornoNota
    ? keyValueObjModalInfo
    : keyValueObjModalInfo.filter(el => el.key !== "idStorno-component" && el.key !== "nota-component");

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
      <NotaTextField value={""}/>
    </Box>
  );
};

interface ListItemData {
  testo: string;
  dataInvio: string;
}


const DilogContentList : React.FC<{array:ListItemData[]}> = ({ array = [] }) => { 
  return (
    <DialogContent dividers>
      {array.length === 0 ? (
        <Typography color="text.secondary">
          Nessuna DATA disponibile.
        </Typography>
      ) : (
        <List
          disablePadding
          sx={{
            maxHeight: 400, 
            overflowY: 'auto' 
          }}>
          {array.map((el, index) => {
            return (
              <Box key={`${el}-{index}`} sx={{ backgroundColor: "grey.100",marginBottom: 1, borderRadius: 1, padding: 1 }}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={el.testo}
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center" component="span">
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {el.dataInvio}
                        </Typography>
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
