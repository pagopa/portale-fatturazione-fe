import {Box, Button, Chip, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TablePagination, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import SelectUltimiDueAnni from "../components/reusableComponents/select/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/select/selectMese";
import { downloadMessaggioPagoPaCsv, downloadMessaggioPagoPaZipExel, getListaMessaggi, getMessaggiCount, readMessaggioPagoPa} from "../api/apiPagoPa/centroMessaggi/api";
import { ButtonNaked, TimelineNotification, TimelineNotificationContent, TimelineNotificationDot, TimelineNotificationItem, TimelineNotificationOppositeContent, TimelineNotificationSeparator } from "@pagopa/mui-italia";
import { TimelineConnector } from "@mui/lab";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { manageError, managePresaInCarico } from "../api/api";
import { saveAs } from "file-saver";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { month } from "../reusableFunction/reusableArrayObj";
import { GlobalContext } from "../store/context/globalContext";

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
    idReport: number
}

interface FilterMessaggi{
    anno:number|null,
    mese:null|number,
    tipologiaDocumento:string[]|[],
    letto:null|boolean
}


const Messaggi : React.FC<any> = () => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState,setCountMessages,dispatchMainState} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;


  
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

    const [gridData, setGridData] = useState<Messaggio[]>([]);
    const [getListaLoading, setGetListaLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [countMessaggi, setCountMessaggi] = useState(0);
    const [showDownloading, setShowDownloading] = useState(false);
   
    const getMessaggi = async (pa,ro,body) =>{
        setGetListaLoading(true);
        await getListaMessaggi(token,profilo.nonce,body,pa,ro).then((res)=>{
            setGetListaLoading(false);
            setGridData(res.data.messaggi);
            setCountMessaggi(res.data.count);
        }).catch((err)=>{
            setGetListaLoading(false);
            setGridData([]);
            setCountMessaggi(0);
            manageError(err,globalContextObj.dispatchMainState);
        });
    };
    //aggiorna il counter messaggi(icona in alto nell'header a destra)
    const getCount = async () =>{
        await getMessaggiCount(token,profilo.nonce).then((res)=>{
            const numMessaggi = res.data;
            setCountMessages(numMessaggi);
        }).catch((err)=>{
            console.log(err);
        });
    };

    const downloadMessaggio = async (item, contentType) => {
        
        if(contentType === "text/csv" || contentType === "application/json"){
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
                manageError(err,globalContextObj.dispatchMainState);
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
                    manageError(err,globalContextObj.dispatchMainState);
                    getMessaggi(page+1, rowsPerPage, bodyCentroMessaggiOnFiltra);
                }));
        }else if(contentType ==="application/vnd.ms-excel"){
            setShowDownloading(true);
            await downloadMessaggioPagoPaZipExel(token,profilo.nonce, {idMessaggio:item.idMessaggio}).then(response => response.blob()).then((res)=>{
                saveAs( res,`${item.categoriaDocumento}/${item.tipologiaDocumento}/${month[item.mese-1]}/${item.anno}.xlsx` );
                setShowDownloading(false);
                readMessage(item.idMessaggio);
            }).catch((err)=>{
                manageError(err,globalContextObj.dispatchMainState);
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
        }).catch((err)=>{
            console.log(err);
            // da aggiungere un messaggio apposito
        });
    };

    useEffect(()=>{
        getMessaggi(page+1, rowsPerPage, bodyCentroMessaggi);
    },[]);

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

    return (
        <div className="mx-5">
            <div className="marginTop24 ">
                <Typography variant="h4">Messaggi</Typography>
            </div>
            <div className="mt-5">
                <div className="row">
                    <div  className="col-3">
                        <Box sx={{width:'80%'}}>
                            <FormControl fullWidth>
                                <InputLabel id="select lettura">Lettura</InputLabel>
                                <Select
                                    labelId="select-lettura"
                                    id="select-lettura"
                                    value={bodyCentroMessaggi.letto?.toString()||'tutti'}
                                    label="Lettura"
                                    onChange={(e:SelectChangeEvent)=> {
                                        let val;
                                        if(e.target.value === 'tutti'){
                                            val = null;
                                        }else if(e.target.value === 'true'){
                                            val = true;
                                        }else{
                                            val = false;
                                        }
                                        setBodyCentroMessaggi((prev)=>({...prev,...{letto:val}}));
                                    }}
                                >
                                    <MenuItem value={'tutti'}>Tutti</MenuItem>
                                    <MenuItem value={'true'}>Si</MenuItem>
                                    <MenuItem value={'false'}>No</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                    <div className="col-3">
                        <SelectUltimiDueAnni values={bodyCentroMessaggi} setValue={setBodyCentroMessaggi}></SelectUltimiDueAnni>
                    </div>
                    <div  className="col-3">
                        <SelectMese values={bodyCentroMessaggi} setValue={setBodyCentroMessaggi}></SelectMese>
                    </div>
                </div>
                <div className="d-flex mt-5">
                    <Button 
                        onClick={()=>{
                            getMessaggi(1,10,bodyCentroMessaggi);
                            setBodyCentroMessaggiOnFiltra(bodyCentroMessaggi);
                            setPage(0);
                            setRowsPerPage(10);

                        } } 
                        sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                        variant="contained"> Filtra
                    </Button>
                   
                    <Button
                        onClick={()=>{
                            getMessaggi(1,10,{
                                anno:null,
                                mese:null,
                                tipologiaDocumento:[],
                                letto: null
                            });
                            setBodyCentroMessaggi({
                                anno:null,
                                mese:null,
                                tipologiaDocumento:[],
                                letto:null
                            });
                            setBodyCentroMessaggiOnFiltra({
                                anno:null,
                                mese:null,
                                tipologiaDocumento:[],
                                letto:null
                            });
                            setPage(0);
                            setRowsPerPage(10);
                        } }
                        sx={{marginLeft:'24px'}} >
                   Annulla filtri
                    </Button>
                </div>
            </div>
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
                                            {item.stato && <Chip size="small" label={statoMessaggio} color={colorMessaggio} />}
                                            {item.tipologiaDocumento && <Typography color="text.primary" variant="caption-semibold" component="div">
                                                {`${item.categoriaDocumento} : ${item.tipologiaDocumento}`}
                                            </Typography>}
                                            {item.anno && <Typography color="text.primary" variant="caption-semibold" component="div">
                                                {`${month[item.mese-1]}/${item.anno}  `}
                                            </Typography>}
                                            <Typography color="text.primary" variant="overline" component="div">
                                                {`Letto  `}
                                                {item.lettura ? <CheckCircleIcon color="success" ></CheckCircleIcon>: <CheckCircleOutlineIcon color="disabled"></CheckCircleOutlineIcon> }
                                          
                                            </Typography>
                                           
                                            {item.stato !== '3' && <ButtonNaked  onClick={()=> downloadMessaggio(item,item.contentType)} disabled={disableDownload} target="_blank" variant="naked" color="primary" weight="light" startIcon={<AttachFileIcon />}>
                Download documento
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
        </div>
    );
};

export default Messaggi;