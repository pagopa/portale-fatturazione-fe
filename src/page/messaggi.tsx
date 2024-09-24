import {Box, Button, Chip, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TablePagination, Typography } from "@mui/material";
import { Dispatch, useEffect, useState } from "react";
import SelectUltimiDueAnni from "../components/reusableComponents/select/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/select/selectMese";
import { downloadMessaggioPagoPaCsv, downloadMessaggioPagoPaZipExel, getListaMessaggi, readMessaggioPagoPa} from "../api/apiPagoPa/centroMessaggi/api";
import { getProfilo, getToken } from "../reusableFunction/actionLocalStorage";
import { MainState } from "../types/typesGeneral";
import { ButtonNaked, TimelineNotification, TimelineNotificationContent, TimelineNotificationDot, TimelineNotificationItem, TimelineNotificationOppositeContent, TimelineNotificationSeparator } from "@pagopa/mui-italia";
import { TimelineConnector } from "@mui/lab";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { manageError } from "../api/api";
import { saveAs } from "file-saver";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { month } from "../reusableFunction/reusableArrayObj";
import { ActionReducerType } from "../reducer/reducerMainState";




export interface Messaggio {
    idMessaggio:number,
    idEnte: any,
    idUtente: string,
    json: string,
    anno: number,
    mese: number,
    prodotto: string,
    gruppoRuolo: string,
    auth: string,
    stato: string,
    dataInserimento: string,
    dataStepCorrente: any,
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

interface MessaggiProps {
    mainState:MainState,
    dispatchMainState:Dispatch<ActionReducerType>
}

interface FilterMessaggi{
    anno:number,
    mese:null|number,
    tipologiaDocumento:string[]|[],
    letto:null|boolean
}


const Messaggi : React.FC<MessaggiProps> = ({dispatchMainState}) => {

    const token = getToken();
    const profilo = getProfilo();
    const currentYear = (new Date()).getFullYear();
  
    const [bodyCentroMessaggi, setBodyCentroMessaggi] = useState<FilterMessaggi>({
        anno:currentYear,
        mese:null,
        tipologiaDocumento:[],
        letto:null
    });

    const [bodyCentroMessaggiOnFiltra, setBodyCentroMessaggiOnFiltra] = useState<FilterMessaggi>({
        anno:currentYear,
        mese:null,
        tipologiaDocumento:[],
        letto:null
    });

    const [gridData, setGridData] = useState<Messaggio[]>([]);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [countMessaggi, setCountMessaggi] = useState(0);
    //const [valueAutocomplete, setValueAutocomplete] = useState<string[]>([]);
    const [showDownloading, setShowDownloading] = useState(false);
   

    const getMessaggi = async (pa,ro,body) =>{
        await getListaMessaggi(token,profilo.nonce,body,pa,ro).then((res)=>{
            setGridData(res.data.messaggi);
            setCountMessaggi(res.data.count);
        }).catch((err)=>{
            setGridData([]);
            setCountMessaggi(0);
            manageError(err,dispatchMainState);
        });
    };

    const downloadMessaggio = async (item, contentType) => {
        setShowDownloading(true);
        if(contentType === "text/csv"){

            await downloadMessaggioPagoPaCsv(token,profilo.nonce, {idMessaggio:item.idMessaggio}).then((res)=>{
                const blob = new Blob([res.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('hidden', '');
                a.setAttribute('href', url);
                a.setAttribute('download',`${item.categoriaDocumento}/${item.tipologiaDocumento}/${month[item.mese-1]}/${item.anno}.csv`);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);   
                setShowDownloading(false);
                readMessage(item.idMessaggio);
            }).catch(((err)=>{
                console.log(err,'err');
                setShowDownloading(false);
                manageError(err,dispatchMainState);
                getMessaggi(page+1, rowsPerPage, bodyCentroMessaggiOnFiltra);
            }));
        }else if(contentType === "application/zip"){
        
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
            await downloadMessaggioPagoPaZipExel(token,profilo.nonce, {idMessaggio:item.idMessaggio}).then(response => response.blob()).then((res)=>{
               
                saveAs( res,`${item.categoriaDocumento}/${item.tipologiaDocumento}/${month[item.mese-1]}/${item.anno}.xlsx` );
                setShowDownloading(false);
                readMessage(item.idMessaggio);
            }).catch((err)=>{
                manageError(err,dispatchMainState);
                setShowDownloading(false);
                getMessaggi(page+1, rowsPerPage, bodyCentroMessaggiOnFiltra);
            }); 
        }
    };


  
        
    
   

    const readMessage = async(id) => {
        await readMessaggioPagoPa(token,profilo.nonce,{idMessaggio:Number(id)}).then(()=>{
            getMessaggi(page+1, rowsPerPage, bodyCentroMessaggiOnFiltra);
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
                    <div className="col-3">
                        <SelectUltimiDueAnni values={bodyCentroMessaggi} setValue={setBodyCentroMessaggi}></SelectUltimiDueAnni>
                    </div>
                    <div  className="col-3">
                        <SelectMese values={bodyCentroMessaggi} setValue={setBodyCentroMessaggi}></SelectMese>
                    </div>
                    {/* 
                    <div  className="col-3">
                        <Box sx={{width:'80%', marginLeft:'20px'}}  >
                            <Autocomplete
                                multiple
                                fullWidth
                                size="medium"
                                onChange={(event, value,reason) => {
                                    setBodyCentroMessaggi((prev:FilterCentroMessaggi) => ({...prev,...{tipologiaDocumento:value}}));
                                }}
                                id="checkboxes-tipologie-fatture"
                                options={['fatturazione','prova']}
                                value={bodyCentroMessaggi.tipologiaDocumento}
                                disableCloseOnSelect
                                getOptionLabel={(option:string) => option}
                                renderOption={(props, option,{ selected }) =>(
                                    <li {...props}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        {option}
                                    </li>
                                )}
                                renderInput={(params) => {
                
                                    return <TextField {...params}
                                        label="Tipologia Documento" 
                                        placeholder="Tipologia Documento" />;
                                }}
           
                            />
                        </Box>
                    </div>
                    */}
                    <div  className="col-3">
                        <Box sx={{width:'80%', marginLeft:'20px'}}>
                            <FormControl fullWidth>
                                <InputLabel id="select lettura">Lettura</InputLabel>
                                <Select
                                    labelId="select-lettura"
                                    id="select-lettura"
                                    value={bodyCentroMessaggi.letto?.toString()||''}
                                    label="Lettura"
                                    onChange={(e:SelectChangeEvent)=> {
                                        let val;
                                        if(e.target.value === 'true'){
                                            val = true;
                                        }else{
                                            val = false;
                                        }
                                        setBodyCentroMessaggi((prev)=>({...prev,...{letto:val}}));
                                    }}
                                >
                                    <MenuItem value={'true'}>Si</MenuItem>
                                    <MenuItem value={'false'}>No</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
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
                                anno:currentYear,
                                mese:null,
                                tipologiaDocumento:[],
                                letto: null
                            });
                            setBodyCentroMessaggi({
                                anno:currentYear,
                                mese:null,
                                tipologiaDocumento:[],
                                letto:null
                            });
                            setBodyCentroMessaggiOnFiltra({
                                anno:currentYear,
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
                            console.log(item,'item');
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
                                <div id={item.lettura ? 'div_timeline_single_messagge_non_lette' :'div_timeline_single_messagge_lette'}>
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
            <div>
            </div>
            <ModalLoading 
                open={showDownloading} 
                setOpen={setShowDownloading}
                sentence={'Downloading...'} >
            </ModalLoading>
        </div>
    );
};

export default Messaggi;