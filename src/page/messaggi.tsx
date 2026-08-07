import {Box, Chip, TablePagination, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { downloadMessaggioPagoPaCsv, downloadMessaggioPagoPaZipExel, getListaMessaggi, getMessaggiCount, readMessaggioPagoPa} from "../api/apiPagoPa/centroMessaggi/api";
import { ButtonNaked, TimelineNotification, TimelineNotificationContent, TimelineNotificationDot, TimelineNotificationItem, TimelineNotificationOppositeContent, TimelineNotificationSeparator } from "@pagopa/mui-italia";
import { TimelineConnector } from "@mui/lab";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { manageError, managePresaInCarico } from "../api/api";
import { saveAs } from "file-saver";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { mesiDescNome, month } from "../reusableFunction/reusableArrayObj";
import PreviewIcon from '@mui/icons-material/Preview';
import { useNavigate } from "react-router";
import { PathPf } from "../types/enum";
import { useGlobalStore } from "../store/context/useGlobalStore";
import MainFilter from "../components/reusableComponents/mainFilter";
import { FilterActionButtons, MainBoxStyled, ResponsiveGridContainer } from "../components/reusableComponents/layout/mainComponent";
import { get2FinancialYear } from "../reusableFunction/function";
import useSavedFilters from "../hooks/useSaveFiltersLocalStorage";

export interface Messaggio {
    idMessaggio:number,
    idEnte: null|string|number,
    idUtente: string,
    json: string,
    anno: number,
    mese: number,
    prodotto: string,
    gruppoRuolo: string,
    auth: string,
    stato: string,
    dataInserimento: string,
    dataStepCorrente: null|string|number,
    linkDocumento: string,
    tipologiaDocumento: string,
    categoriaDocumento: string,
    lettura: true,
    hash: string,
    rhash: string,
    contentType: string,
    contentLanguage: string,
    idReport: number,
    ragioneSociale?:string
}

interface FilterMessaggi{
    anno:number|null,
    mese:null|number,
    tipologiaDocumento:string[]|[],
    letto:null|boolean
}


const Messaggi : React.FC = () => {
  const mainState = useGlobalStore(state => state.mainState);
  const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
  const setCountMessages = useGlobalStore(state => state.setCountMessages);
  const token =  mainState.profilo.jwt;
  const profilo =  mainState.profilo;
  const navigate = useNavigate();

  const { 
    filters,
    updateFilters,
    isInitialRender
  } = useSavedFilters(PathPf.MESSAGGI,{});

  const handleModifyMainState = (valueObj) => {
    dispatchMainState({
      type:'MODIFY_MAIN_STATE',
      value:valueObj
    });
  };
  
  const [bodyCentroMessaggi, setBodyCentroMessaggi] = useState<FilterMessaggi>({
    anno:null,
    mese:null,
    tipologiaDocumento:[],
    letto:null
  });

  const [bodyCentroMessaggiOnFiltra, setBodyCentroMessaggiOnFiltra] = useState<FilterMessaggi>({
    anno:null,
    mese:null,
    tipologiaDocumento:[],
    letto:null
  });

  useEffect(()=>{
    if(isInitialRender.current && Object.keys(filters).length > 0){
      setBodyCentroMessaggi(filters.body);
      getMessaggi(filters.page, filters.rows, filters.body);
    }else{
      getMessaggi(page+1, rowsPerPage, bodyCentroMessaggi);
    }
  },[]);

  const [gridData, setGridData] = useState<Messaggio[]>([]);
  const [getListaLoading, setGetListaLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [countMessaggi, setCountMessaggi] = useState(0);
  const [showDownloading, setShowDownloading] = useState(false);
  const arrayLettura  = [ { label: "Tutti",value:"tutti" },{ label: "Si",value:true },{ label: "No",value:false }];
   
  const getMessaggi = async (pa,ro,body) =>{
    setGetListaLoading(true);
    await getListaMessaggi(token,profilo.nonce,body,pa,ro).then((res)=>{
      setGetListaLoading(false);
      setGridData(res.data.messaggi);
      setCountMessaggi(res.data.count);
      if(!isInitialRender.current){
        updateFilters({
          body:body,
          pathPage:PathPf.MESSAGGI,
          page:pa,
          rows:ro
        });
      }
    }).catch((err)=>{
      setGetListaLoading(false);
      setGridData([]);
      setCountMessaggi(0);
      manageError(err,dispatchMainState);
    });
  };
    //aggiorna il counter messaggi(icona in alto nell'header a destra)
  const getCount = async () =>{
    await getMessaggiCount(token,profilo.nonce).then((res)=>{
      const numMessaggi = res.data;
      setCountMessages(numMessaggi);
    }).catch(()=>{
      return;
    });
  };

  const downloadMessaggio = async (item, contentType) => {
    if(item.categoriaDocumento.toLowerCase().includes("contestazione")){
      handleModifyMainState({contestazioneSelected:{reportId:item.idReport}});
      readMessage(item.idMessaggio);
      navigate(PathPf.STORICO_DETTAGLIO_CONTEST);
    }else if(contentType === "text/csv" || contentType === "application/json"){
      setShowDownloading(true);
      await downloadMessaggioPagoPaCsv(token,profilo.nonce, {idMessaggio:item.idMessaggio}).then((res)=>{
        if(contentType === "application/json"){
          res.data = JSON.stringify(res.data);
        }
        const blob = new Blob([res.data], { type: contentType});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        if(contentType === "text/csv"){
          a.setAttribute('download',`${item.categoriaDocumento}/${item.tipologiaDocumento}/${month[item.mese-1]}/${item.anno}.csv`);
        }
        if(contentType === "application/json"){
          a.setAttribute('download',`${item.categoriaDocumento}/${item.tipologiaDocumento}/${month[item.mese-1]}/${item.anno}.json`);
        }
                
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);   
        setShowDownloading(false);
        readMessage(item.idMessaggio);
      }).catch(((err)=>{
        setShowDownloading(false);
        manageError(err,dispatchMainState);
        getMessaggi(page+1, rowsPerPage, bodyCentroMessaggiOnFiltra); 
      }));
    }else if(contentType === "application/zip"){
      setShowDownloading(true);
      await downloadMessaggioPagoPaZipExel(token,profilo.nonce, {idMessaggio:item.idMessaggio}).then(response => response.blob())
        .then((res)=>{
          saveAs(res,`${item.categoriaDocumento}/${item.tipologiaDocumento}/${month[item.mese-1]}/${item.anno}.zip`);
          setShowDownloading(false);
          readMessage(item.idMessaggio);
        }).catch(((err)=>{
          setShowDownloading(false);
          manageError(err,dispatchMainState);
          getMessaggi(page+1, rowsPerPage, bodyCentroMessaggiOnFiltra);
        }));
    }else if(contentType ==="application/vnd.ms-excel"){
      setShowDownloading(true);
      await downloadMessaggioPagoPaZipExel(token,profilo.nonce, {idMessaggio:item.idMessaggio}).then(response => response.blob()).then((res)=>{
        saveAs( res,`${item.categoriaDocumento}/${item.tipologiaDocumento}/${month[item.mese-1]}/${item.anno}.xlsx` );
        setShowDownloading(false);
        readMessage(item.idMessaggio);
      }).catch((err)=>{
        manageError(err,dispatchMainState);
        setShowDownloading(false);
        getMessaggi(page+1, rowsPerPage, bodyCentroMessaggiOnFiltra);
      }); 
    }else{
      //nome da cambiare quando sistemiamo la logica dell'errore
      managePresaInCarico(400,dispatchMainState);
    }
  };

  const readMessage = async(id) => {
    await readMessaggioPagoPa(token,profilo.nonce,{idMessaggio:Number(id)}).then(()=>{
      getMessaggi(page+1, rowsPerPage, bodyCentroMessaggiOnFiltra);
      getCount();
    }).catch(()=>{
      return;
      // da aggiungere un messaggio apposito
    });
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    const realPage = newPage + 1;
    getMessaggi(realPage, rowsPerPage,bodyCentroMessaggiOnFiltra);
    setPage(newPage);   
  };
                    
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    const realPage = page + 1;
    getMessaggi(realPage, parseInt(event.target.value, 10),bodyCentroMessaggiOnFiltra);             
  };

   
  function getDay(dateString: string): string {
    const date = new Date(dateString);
    return `0${date.getDate()}`.slice(-2);
  }
      
  function getTime(dateString: string): string {
    const date = new Date(dateString);
    if(date.getMinutes() < 9){
      return `${date.getHours()}:0${date.getMinutes()}`;
    }
    return `${date.getHours()}:${date.getMinutes()}`;
  }

  function getMonthString(dateString: string): string {
    const date = new Date(dateString);
    return date
      .toLocaleString("default", { month: "long" })
      .toUpperCase()
      .substring(0, 3);
  }

  const onAnnulla = () => {

    const newBody = {
      anno:null,
      mese:null,
      tipologiaDocumento:[],
      letto: null
    };
    getMessaggi(1,10,newBody);
    setBodyCentroMessaggi(newBody);
    setBodyCentroMessaggiOnFiltra(newBody);
    setPage(0);
    setRowsPerPage(10);

    updateFilters({
      body:newBody,
      pathPage:PathPf.MESSAGGI,
      page:0,
      rows:10
    });
  };


  const onFiltra = () => {
    getMessaggi(1,10,bodyCentroMessaggi);
    setBodyCentroMessaggiOnFiltra(bodyCentroMessaggi);
    setPage(0);
    setRowsPerPage(10);
    updateFilters({
      body:bodyCentroMessaggi,
      pathPage:PathPf.MESSAGGI,
      page:0,
      rows:10
    });
  };

  const statusAnnulla = (
    bodyCentroMessaggi.anno !== null ||
     bodyCentroMessaggi.letto !== null ||
      bodyCentroMessaggi.letto !== null
  ) ? "show" : "hidden";

  return (

    <MainBoxStyled title={"Messaggi"}>
      <ResponsiveGridContainer >
        <MainFilter 
          filterName={"select_key_value"}
          inputLabel={"Lettura"}
          clearOnChangeFilter={() => console.log("ciao")}
          setBody={setBodyCentroMessaggi}
          body={bodyCentroMessaggi}
          keyValue={"value"}
          keyDescription='label'
          keyBody={"letto"}
          defaultValue={"tutti"}
          arrayValues={arrayLettura}
          extraCodeOnChange={(e)=>{
            let val;
            if(e === 'tutti'){
              val = null;
            }else if(e.toString() === 'true'){
              val = true;
            }else{
              val = false;
            }
            setBodyCentroMessaggi((prev)=>({...prev,...{letto:val}}));          
          }}
        ></MainFilter>
        <MainFilter 
          filterName={"select_value_string"}
          inputLabel={"Anno"}
          clearOnChangeFilter={() => console.log("ciao")}
          setBody={setBodyCentroMessaggi}
          body={bodyCentroMessaggi}
          keyDescription={"anno"}
          keyValue={"anno"}
          keyBody={"anno"}
          defaultValue={""}
          arrayValues={get2FinancialYear()}
        ></MainFilter>
        <MainFilter 
          filterName={"select_key_value"}
          inputLabel={"Mese"}
          clearOnChangeFilter={() => console.log("ciao")}
          setBody={setBodyCentroMessaggi}
          body={bodyCentroMessaggi}
          keyValue={"mese"}
          keyDescription='descrizione'
          keyBody={"mese"}
          arrayValues={mesiDescNome}
        ></MainFilter>
      </ResponsiveGridContainer>
     
      <FilterActionButtons 
        onButtonFiltra={onFiltra} 
        onButtonAnnulla={onAnnulla} 
        statusAnnulla={statusAnnulla}
      />
      <div className="mb-5 mt-5">
        <Box sx={{
          backgroundColor: "background.paper",
          borderRadius: 2,
          overflowY: "auto",
          maxHeight: "1000px",
          minHeight: "1000px",
          display: "flex",
          flexGrow: 1,
          flexDirection: "column"
        }}>
          <TimelineNotification >
            {gridData.map((item: Messaggio) => {
              let statoMessaggio = '';
              let colorMessaggio;
              let disableDownload = false;
                          
              if(item.stato === '0'){
                statoMessaggio = 'PRESA IN CARICO';
                colorMessaggio = "warning";
                disableDownload = true;
              }else if(item.stato === '1'){
                statoMessaggio = 'IN ELABORAZIONE';
                colorMessaggio = "info";
                disableDownload = true;
              }else if(item.stato === '2'){
                statoMessaggio = 'ELABORATO';
                colorMessaggio = "success";
                disableDownload = false;
              }else if(item.stato === '3'){
                statoMessaggio = 'NON DISPONIBILE';
                colorMessaggio = "error";
                disableDownload = true;
              }
              return (
                <div key={item.idMessaggio} id={item.lettura ? 'div_timeline_single_messagge_non_lette' :'div_timeline_single_messagge_lette'}>
                  <TimelineNotificationItem 
                    key={item.idMessaggio}>
                    <TimelineNotificationOppositeContent >
                      <Typography>
                        {getDay(item.dataInserimento)}
                      </Typography>
                      <Typography color="text.secondary" variant="caption" component="div">
                        {getMonthString(item.dataInserimento)}
                      </Typography>

                    </TimelineNotificationOppositeContent>
                    <TimelineNotificationSeparator>
                      <TimelineConnector />
                      <TimelineNotificationDot  variant={item.lettura ? undefined : "outlined"} size="default"/>
                      <TimelineConnector />
                    </TimelineNotificationSeparator>
                    <TimelineNotificationContent>
                      <Typography variant="caption" color="text.secondary" component="div">
                        {getTime(item.dataInserimento)}
                      </Typography>
                      {item.stato && <Chip variant="outlined" size="small" label={statoMessaggio} color={colorMessaggio} />}
                      {item.tipologiaDocumento && <Typography color="text.primary" variant="caption-semibold" component="div">
                        {`${item.categoriaDocumento} : ${item.categoriaDocumento.toLowerCase().includes("contestazione") ? item?.ragioneSociale :item.tipologiaDocumento}`}
                      </Typography>}
                      {item.anno && <Typography color="text.primary" variant="caption-semibold" component="div">
                        {`${month[item.mese-1]}/${item.anno}  `}
                      </Typography>}
                      <Typography color="text.primary" variant="overline" component="div">
                        {`Letto  `}
                        {item.lettura ? <CheckCircleIcon color="success" ></CheckCircleIcon>: <CheckCircleOutlineIcon color="disabled"></CheckCircleOutlineIcon> }
                                          
                      </Typography>
                                           
                      {item.stato !== '3' && <ButtonNaked  onClick={()=> downloadMessaggio(item,item.contentType)} disabled={disableDownload} target="_blank" variant="naked" color="primary" weight="light" startIcon={item.categoriaDocumento.toLowerCase().includes("contestazione") ? <PreviewIcon/>:<AttachFileIcon />}>
                        {item.categoriaDocumento.toLowerCase().includes("contestazione") ? 'Visualizza documento' : 'Download documento'}
                      </ButtonNaked>}
                    </TimelineNotificationContent>
                  </TimelineNotificationItem>
                </div> 
              );
            })}
          </TimelineNotification>
        </Box>
        <div className="pt-3">                           
          <TablePagination
            sx={{'.MuiTablePagination-selectLabel': {
              display:'none',
              backgroundColor:'#f2f2f2'
                                                
            }}}
            component="div"
            page={page}
            count={countMessaggi}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            SelectProps={{
              disabled: false
            }}
          ></TablePagination>
        </div>
      </div>         
      <ModalLoading 
        open={showDownloading} 
        setOpen={setShowDownloading}
        sentence={'Downloading...'} >
      </ModalLoading>
      <ModalLoading 
        open={getListaLoading} 
        setOpen={setGetListaLoading}
        sentence={'Loading...'} >
      </ModalLoading>
    </MainBoxStyled>
  );
};

export default Messaggi;