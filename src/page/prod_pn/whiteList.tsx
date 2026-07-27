import { useEffect, useState } from "react";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { saveAs } from "file-saver";
import { manageError, managePresaInCarico } from "../../api/api";
import { listaEntiNotifichePage } from "../../api/apiSelfcare/notificheSE/api";
import { headerNames } from "../../assets/configurations/config_GridWhiteList";
import ModalConfermaInserimento from "../../components/commessaInserimento/modalConfermaInserimento";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import ModalAggiungi from "../../components/whiteList/modalAggiungi";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { month } from "../../reusableFunction/reusableArrayObj";
import { PathPf } from "../../types/enum";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import { getAnniWhite, getMesiWhite, getTipologiaFatturaWhite, getWhiteListPagoPa, deleteWhiteListPagoPa, downloadWhiteListPagopa, GestioneFatture } from "../../api/apiPagoPa/whiteListPA/whiteList";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import EnhancedTableCustom from "../../components/reusableComponents/grid/gridCustomBase/enhancedTabalToolbarCustom";
import DialogInfo from "../../components/reusableComponents/modals/dialogInfo";
import ModalInfo from "../../components/reusableComponents/modals/modalInfo";
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
export interface BodyLista {
  idEnti: string[]
  tipologiaContratto: number|null
  tipologiaFattura: string
  anno: number
  mese: number
}
export interface WhitelistData {
  count: number
  whitelist: Whitelist[]
}
export interface Whitelist {
  idWhite?: number;
  ragioneSociale:string;
  anno: number;
  mese: number;
  tipologiaFatture: string;
  tipoContratto: string;
  cancella?:boolean;
}



const WhiteList : React.FC = () => {
  const mainState = useGlobalStore(state => state.mainState);
  const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
  
  const token =  mainState.profilo.jwt;
  
  const profilo =  mainState.profilo;
  
  const [gridData, setGridData] = useState<Whitelist[]>([]);
  const [getListaLoading, setGetListaLoading] = useState(false);
  const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
  const [textValue, setTextValue] = useState('');
  const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
  const [valueSelectMonths, setValueSelectMonths] = useState<{descrizione:string,mese:number}[]>([]);
  const [showLoading,setShowLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements]  = useState(0);
  const [arrayYears,setArrayYears] = useState<number[]>([]);
  const [arrayMonths,setArrayMonths] = useState<{descrizione:string,mese:number}[]>([]);
  const [showPopUpNota, setShowPopUpNota] = useState(false);
  const [notes, setNotes] = useState<{IdNota:number,Testo:string,Data:Date}[]>([]);
  const [openModalInfo, setOpenModalInfo] = useState<{open:boolean,sentence:React.ReactNode,buttonIsVisible?:boolean|null,labelButton?:string,actionButton?:()=>void,icon?:React.ElementType }>({open:false, sentence:''});
  const [textAreaValue, setTextAreaValue] = useState<string>('');

  const contratti = [{id:3,descrizione:"Tutte"},{id:2,descrizione:"PAC"},{id:1,descrizione:"PAL"}];
  const azioni = [{id:3,descrizione:"Tutte"},{id:2,descrizione:"Posticipate"},{id:1,descrizione:"Eliminate"}];
  
  const [tipologiaFatture, setTipologiaFatture] = useState<string[]>([]);
  const [openModalAction, setOpenModalAction] = useState(false);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  
  const [selected, setSelected] = useState<number[]>([]);
  const [bodyGetLista, setBodyGetLista] = useState<GestioneFatture>({
    idEnti: [],
    tipologiaContratto:null,
    tipologiaFattura:null,
    anno: null,
    mesi: [],
    azione:null
  });
  
  const { 
    filters,
    updateFilters,
    resetFilters,
    isInitialRender
  } = useSavedFilters(PathPf.LISTA_DOC_EMESSI,{});
  
  useEffect(()=>{
    getAnni();
  },[]);
  
  const getAnni = async(year = null, action = '' ) => {
    await getAnniWhite(token, profilo.nonce).then(async(res)=>{
      setArrayYears(res.data);
      await getListTipologiaFattura();
      if(isInitialRender.current && Object.keys(filters).length > 0){
        //se ci sono gli anni ed è il primorender e ci sono i filtri nella local storage
        setBodyGetLista(filters.body);
        await getMesi(filters.body.anno);
        await getLista(filters.page+1, filters.rows,filters.body);
        setPage(filters.page);
        setRowsPerPage(filters.rows);
        setTextValue(filters.textValue);
        setValueAutocomplete(filters.valueAutocomplete);
        setSelected(filters.selected);
      }else{
        setGetListaLoading(true);
        setPage(0);
        setRowsPerPage(10);
        setValueSelectMonths([]);
        setValueAutocomplete([]);
        if(res.data.length === 0){
          //se NON ci sono gli anni
          setBodyGetLista({
            idEnti: [],
            tipologiaContratto:null,
            tipologiaFattura:null,
            anno: null,
            mesi: [],
            azione:null
          });
          setArrayMonths([]);
          setGridData([]);
          setTotalElements(0);
        }else if(year &&( action === 'Add' || (action === 'Delete' && res.data.includes(year) ))){
          const bodyToSet = {
            idEnti: [],
            tipologiaContratto: null,
            tipologiaFattura:null,
            anno: year,
            mesi: [],
            azione:null
          };
          setBodyGetLista(bodyToSet);
          await getMesi(year);
          await getLista(1,10,bodyToSet);
        }else if(year && action === 'Delete' &&  !res.data.includes(year)){
          
          const bodyToSet = {
            idEnti: [],
            tipologiaContratto: null,
            tipologiaFattura:null,
            anno: res.data[0],
            mesi: [],
            azione:null
          };
          setBodyGetLista(bodyToSet);
          await getMesi(res.data[0]);
          await getLista(1,10,bodyToSet);
          
        }else{
          setBodyGetLista((prev)=>({...prev,...{anno:res.data[0]}}));
          await getMesi(res.data[0]);
          await getLista(1,10,{
            idEnti: [],
            tipologiaContratto: null,
            tipologiaFattura:null,
            anno: res.data[0],
            mesi: []
          });
        }  
        
      }
      setGetListaLoading(false);
    }).catch((err)=>{
      setArrayYears([]);
      setArrayMonths([]);
      setGetListaLoading(false);
      manageError(err,dispatchMainState);
    });
  };
  
  const getMesi = async(y) => {
    setGetListaLoading(true);
    await getMesiWhite(token, profilo.nonce, {anno:y}).then((res)=>{
      setArrayMonths(res.data);
      if(isInitialRender.current && Object.keys(filters).length > 0){
        setValueSelectMonths(filters.valueSelectMonths);
      }else{
        setValueSelectMonths([]);
        setBodyGetLista((prev)=>({...prev,...{mesi:[]}}));
      }
      setGetListaLoading(false);
      isInitialRender.current = false;
    }).catch((err)=>{
      setArrayYears([]);
      setGetListaLoading(false);
      manageError(err,dispatchMainState);
      isInitialRender.current = false;
    });
  };
  
  useEffect(()=>{
    const timer = setTimeout(() => {
      if(textValue.length >= 3){ 
        listaEntiPageOnSelect();
      }
    }, 800);
    return () => clearTimeout(timer);
  },[textValue]);
  
  const listaEntiPageOnSelect = async () =>{
    await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue} )
      .then((res)=>{
        setDataSelect(res.data);
      }).catch(((err)=>{
        manageError(err,dispatchMainState);
      }));
  };
  
  
  const getListTipologiaFattura = async() => {
    await getTipologiaFatturaWhite(token, profilo.nonce).then((res)=>{
      setTipologiaFatture([...["Tutte"],...res.data]);
      
    }).catch(((err)=>{
      setTipologiaFatture([]);
      
      manageError(err,dispatchMainState);
    }));   
  };


  const notaMock = [

    {

      "IdNota": "B13C89FD-4C92-44BA-80C2-2435E91AD102",

      "Testo": "Creazione di una fattura posticipata",

      "Data": "2026-07-01T08:58:36.4713059Z"  },

    {

      "IdNota": "79E02493-65EA-4BB8-BC4C-4E3CC0DA3776",

      "Testo": "Ripristino di una fattura posticipata",

      "Data": "2026-07-01T08:58:42.3053355Z"  }

  ];
  
  const getLista = async(pg,row,body) => {
    setGetListaLoading(true);
    await getWhiteListPagoPa(token, profilo.nonce,pg,row,body).then((res)=>{
      const customObj = res.data.whitelist.map((el ,i) => {
        //TODO: aggiungere LA LOGICA IN BASE ALLO STATO
        const isEliminata = el.tipologiaFattura === "ACCONTO" || el.tipologiaFattura === "ANTICIPO" ? true : false;
        return {
          idWhite:el.id,
          ragioneSociale:el.ragioneSociale,
          anno:el.anno,
          mese:month[el.mese-1],
          tipologiaFattura:el.tipologiaFattura,
          tipoContratto:el.tipoContratto,
          stato:isEliminata ? "Eliminata" : i % 2 === 0 ? "Posticipata" : "Ripristinata",
          nota:notaMock,
          cancella:el.cancella
        };
      });
      setGridData(customObj);
      setTotalElements(res.data.count);
      setGetListaLoading(false);
    }).catch(((err)=>{
      setGridData([]);
      setTotalElements(0);
      setGetListaLoading(false);
      manageError(err,dispatchMainState);
    }));     
  };
  
  const deleteElements = async (y) => {
    setGetListaLoading(true);
    resetFilters();
    await deleteWhiteListPagoPa(token, profilo.nonce,selected).then(async()=> {
      await getAnni(y, 'Delete'); 
      managePresaInCarico('INSER_DELETE_WHITE_LIST',dispatchMainState);
      setSelected([]);
    }).catch((err)=>{
      setGetListaLoading(false);
      manageError(err,dispatchMainState);
    });
  };
  
  const onButtonAggiungi = async(yearAdd) => {
    resetFilters();
    getAnni(yearAdd, "Add");
  };
  
  const clearOnChangeFilter = () => {
    setGridData([]);
    setSelected([]);
  };
  
  const onButtonFiltra = () => {
    getLista(1,10,bodyGetLista);
    updateFilters(
      {
        body:bodyGetLista,
        pathPage:PathPf.LISTA_DOC_EMESSI,
        textValue,
        valueAutocomplete,
        valueSelectMonths,
        page:0,
        rows:10,
        selected:selected
      });
    setPage(0);
    setRowsPerPage(10);
    setSelected([]);
  };
    
    
  const onButtonAnnulla = () => {
    getLista(1,10,{
      idEnti: [],
      tipologiaContratto: null,
      tipologiaFattura:null,
      anno: arrayYears[0],
      mesi: []
    });
    setBodyGetLista({
      idEnti: [],
      tipologiaContratto: null,
      tipologiaFattura:null,
      anno: arrayYears[0],
      mesi: [],
      azione:null
    });
    setValueAutocomplete([]);
    setValueSelectMonths([]);
    setTextValue('');
    resetFilters();
  };
    
    
  const onDownload = async() => {
    setShowLoading(true);
    await downloadWhiteListPagopa(token, profilo.nonce,bodyGetLista).then((response) =>{
      if (response.ok) {
        return response.blob();
      }
      throw '404';
    }).then(
      (response)=>{
        let fileName = `White list Fatturazione/${bodyGetLista.anno}.xlsx`;
        if(bodyGetLista.idEnti.length === 1){
          fileName = `White list Fatturazione/${dataSelect[0].descrizione}/${bodyGetLista.anno}.xlsx`;
        }
        if(bodyGetLista.idEnti.length === 1 && bodyGetLista.mesi.length === 1){
          fileName = `White list Fatturazione/${dataSelect[0].descrizione}/${month[bodyGetLista?.mesi[0] -1]}/${bodyGetLista.anno}.xlsx`;
        }
          
        setShowLoading(true);
        saveAs(response,fileName);
        setShowLoading(false);
      }).catch(err =>{
      setShowLoading(false);
      manageError(err,dispatchMainState);
    } );
  };
      
      
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    getLista(newPage + 1,rowsPerPage, bodyGetLista);
    setPage(newPage);
    updateFilters({
      pathPage:PathPf.LISTA_DOC_EMESSI,
      body:bodyGetLista,
      textValue,
      valueAutocomplete,
      valueSelectMonths,
      page:newPage,
      rows:rowsPerPage,
      selected:selected
    });
  };
      
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    updateFilters({
      pathPage:PathPf.LISTA_DOC_EMESSI,
      body:bodyGetLista,
      textValue,
      valueAutocomplete,
      valueSelectMonths,
      page:0,
      rows:parseInt(event.target.value, 10),
      selected:selected
    });
        
    getLista(1,parseInt(event.target.value, 10),bodyGetLista);                     
  };
      
  const onButtonComfermaPopUp = () => {
    deleteElements(bodyGetLista.anno);
  };

  const keyValueObjModalInfo = [
    {
      key:"ragioneSociale",
      label:"Ragione Sociale"
    },
    {
      key:"anno",
      label:"Anno"
    },
    {
      key:"mese",
      label:"Mese"
    },
    {
      key:"tipologiaFattura",
      label:"Tipologia Fattura"
    }
  ];


  const showPopUpAction = (obj, action) => {  
    if(action === "nota"){
      const sortedNotes = [...obj.nota].sort(
        (a, b) => new Date(b.Data).getTime() - new Date(a.Data).getTime()
      );
      setNotes(sortedNotes);
      setShowPopUpNota(true);
    }else if(action === "ripristina"){

      setOpenModalInfo({
        open:true,
        sentence: ( <ElementToProcessComponent obj={obj} keyValueObj={keyValueObjModalInfo} title={<>Sei sicuro di voler <strong>Ripristinare</strong> la seguente fattura?</>} />),
        buttonIsVisible:true,
        labelButton:"Prosegui",
        actionButton:() => console.log("ripristina")
      });
    }else if(action === "annulla"){

      setOpenModalInfo({
        open:true,
        sentence: ( <ElementToProcessComponent obj={obj} keyValueObj={keyValueObjModalInfo} title={<>Sei sicuro di voler <strong>Annullare</strong> la <strong>posticipazione</strong> della seguente fattura?</>} />),
        buttonIsVisible:true,
        labelButton:"Prosegui",
        actionButton:() => console.log("ANNULLA")
      });
    }else if(action === "annulla eliminazione"){

      setOpenModalInfo({
        open:true,
        sentence: ( <ElementToProcessComponent obj={obj} keyValueObj={keyValueObjModalInfo} title={<>Sei sicuro di voler <strong>Annullare</strong>  <strong>l'eliminazione</strong> della seguente fattura?</>} />),
        buttonIsVisible:true,
        labelButton:"Prosegui",
        actionButton:() => console.log("ANNULLA")
      });
    }
  };
      
  const buttonsTopHeader =  [
    {
      stringIcon:"Aggiungi",
      icon:<AddCircleIcon sx={{ color:selected.length === 0 ? "#1976D2" : "#A2ADB8", cursor: 'pointer' }} />,
      action:"Add"
    }];

   
  const statusAnnulla = (
    bodyGetLista.idEnti.length !== 0 ||
    bodyGetLista.mesi.length !== 0 ||
    bodyGetLista.tipologiaFattura !== null ||
    bodyGetLista.tipologiaContratto !== null
  ) ? 'show' : 'hidden';
        
        
        
  return (
    <MainBoxStyled title={"Gestione Fatture"}>
      <ResponsiveGridContainer >
        <MainFilter 
          filterName={"select_value_string"}
          inputLabel={"Anno"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyGetLista}
          body={bodyGetLista}
          keyDescription={"anno"}
          keyValue={"anno"}
          keyBody={"anno"}
          arrayValues={arrayYears}
          extraCodeOnChange={(e)=>{
            const value = Number(e);
            setBodyGetLista((prev)=> ({...prev, ...{anno:value}}));
            getMesi(value);
          }}
        ></MainFilter>
        <MainFilter 
          filterName={"multi_checkbox"}
          inputLabel={"Mese"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyGetLista}
          body={bodyGetLista}
          dataSelect={arrayMonths}
          valueAutocomplete={valueSelectMonths}
          setValueAutocomplete={setValueSelectMonths}
          keyDescription={"descrizione"}
          keyBody={"mesi"}
          keyValue={"mese"}
          extraCodeOnChangeArray={(value)=>{
            const valueArray = value.map((el) => Number(el.mese));
            setValueSelectMonths(value);
            setBodyGetLista((prev) => ({...prev,...{mesi:valueArray}}));
          }}
          iconMaterial={RenderIcon("date",true)}
        ></MainFilter>
        <MainFilter 
          filterName={"select_value_string"}
          inputLabel={"Tipologia Fattura"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyGetLista}
          body={bodyGetLista}
          keyDescription={"tipologiaFattura"}
          keyValue={"tipologiaFattura"}
          keyBody={"tipologiaFattura"}
          arrayValues={tipologiaFatture}
          extraCodeOnChange={(e)=>{
            if(e){
              if(e === "Tutte"){
                setBodyGetLista((prev)=>({...prev,...{tipologiaFattura:null}}));
              }else{
                setBodyGetLista((prev)=>({...prev,...{tipologiaFattura:e}}));
              }
            }
          }}
          defaultValue={(tipologiaFatture && tipologiaFatture?.length > 0) ? "Tutte": ""}
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
          arrayValues={contratti}
          defaultValue={3}
          extraCodeOnChange={(e)=>{
            const val = (Number(e) === 3) ? null : Number(e);
            setBodyGetLista((prev)=>({...prev,...{idTipoContratto:val}}));
          }}
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
          inputLabel={"Azioni"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyGetLista}
          body={bodyGetLista}
          keyDescription={"descrizione"}
          keyBody={"idTipoContratto"}
          keyValue={"id"}
          arrayValues={azioni}
          defaultValue={3}
          extraCodeOnChange={(e)=>{
            const val = (Number(e) === 3) ? null : Number(e);
            setBodyGetLista((prev)=>({...prev,...{azione:val}}));
          }}
        ></MainFilter>
      </ResponsiveGridContainer>
      <FilterActionButtons 
        onButtonFiltra={onButtonFiltra} 
        onButtonAnnulla={onButtonAnnulla} 
        statusAnnulla={statusAnnulla}/>
      <ActionTopGrid
        actionButtonRight={[{
          onButtonClick:onDownload,
          variant: "outlined",
          label: "Download risultati",
          icon:{name:"download"},
          disabled:(gridData.length === 0||getListaLoading)
        }]}/>
      <EnhancedTableCustom setOpenModalAdd={setOpenModalAdd} selected={selected||[]} buttons={buttonsTopHeader} />
      <GridCustom
        nameParameterApi='idWhite'
        elements={gridData}
        changePage={handleChangePage}
        changeRow={handleChangeRowsPerPage} 
        total={totalElements}
        page={page}
        rows={rowsPerPage}
        headerNames={headerNames}
        disabled={false}
        widthCustomSize="auto"
        setOpenModalAction={showPopUpAction}
        buttons={buttonsTopHeader}
        sentenseEmpty={"Non sono presenti documenti"}
      />
      <ModalAggiungi 
        getLista={onButtonAggiungi}
        open={openModalAdd}
        setOpen={setOpenModalAdd} />
      <ModalLoading 
        open={getListaLoading} 
        setOpen={setGetListaLoading}
        sentence={'Loading...'} />
      <ModalLoading 
        open={showLoading} 
        setOpen={setShowLoading}
        sentence={'Downloading...'} />
      <ModalConfermaInserimento
        setOpen={setOpenModalAction}
        open={openModalAction}
        onButtonComfermaPopUp={onButtonComfermaPopUp}
        mainState={mainState}
        sentence={"Sei sicuro di voler procedere"}
      />
      <DialogInfo 
        open={showPopUpNota}
        onClose={setShowPopUpNota}
        clearAction={()=>{setNotes([]);}}
        array={notes}
        title="Storico Note"
        sentenseEmptyArray="Nessuna nota disponibile."
      />
      <ModalInfo 
        setOpen={setOpenModalInfo}
        open={openModalInfo}
        width={800}
        textAreaValue={textAreaValue}
        setTextAreaValue={setTextAreaValue}
      />
    </MainBoxStyled>
          
  );
};
export default WhiteList;
      


export const ElementToProcessComponent = ({obj, title , keyValueObj}) => {

  return (
    <Box sx={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center', mt:2, mb:2}}>
      <Typography > {title}</Typography>
      <Box sx={{ backgroundColor:'#F8F8F8', padding:'10px',marginTop:'20px',width:'100%'}}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
              {keyValueObj.map((el,i) => (
                <TableCell key={i} align="center" sx={{ marginLeft:"16px"}} >{el.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
            <TableRow >
              {keyValueObj.map((el,i) => (
                <Tooltip title={obj[el.key].length > 20 ? obj[el.key]:null} >
                  <TableCell key={i} align="center">{obj[el.key]?.length > 20 ? obj[el.key].slice(0, 20) + '...':obj[el.key]}</TableCell>
                </Tooltip> 
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};