import {Box, Button, Chip, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TablePagination, Typography } from "@mui/material";
import { useEffect, useState } from "react";
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


export interface Messaggi {
    idEnte: null|string,
    idUtente: string,
    json: string,
    anno: number,
    mese: number,
    prodotto: string,
    gruppoRuolo: string,
    auth: string,
    stato: string,
    dataInserimento: string,
    dataStepCorrente: string,
    linkDocumento: string,
    tipologiaDocumento: string,
    lettura: boolean,
    hash: string,
    data?:string
}

interface MessaggiProps {
    mainState:MainState,
    dispatchMainState:any
}

interface FilterMessaggi{
    anno:number,
    mese:null|number,
    tipologiaDocumento:string[]|[],
    letto:null|boolean
}


const Messaggi : React.FC<MessaggiProps> = ({mainState,dispatchMainState}) => {

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

    const [gridData, setGridData] = useState<Messaggi[]>([]);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [countMessaggi, setCountMessaggi] = useState(0);
    const [valueAutocomplete, setValueAutocomplete] = useState<string[]>([]);
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

    const downloadMessaggio = async (id, contentType) => {
        setShowDownloading(true);
        if(contentType === "text/csv"){

            await downloadMessaggioPagoPaCsv(token,profilo.nonce, {idMessaggio:id}).then((res)=>{
                const blob = new Blob([res.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('hidden', '');
                a.setAttribute('href', url);
                a.setAttribute('download',`File.csv`);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);   
                setShowDownloading(false);
                readMessage(id);
            }).catch(((err)=>{
                setShowDownloading(false);
                manageError(err,dispatchMainState);
            }));
        }else if(contentType === "application/zip"){
        
            await downloadMessaggioPagoPaZipExel(token,profilo.nonce, {idMessaggio:id}).then(response => response.blob())
                .then((res)=>{
                    saveAs(res,`File.zip`);
                    setShowDownloading(false);
                    readMessage(id);
                
                }).catch(((err)=>{
                    setShowDownloading(false);
                    manageError(err,dispatchMainState);
                }));
        }else if(contentType ==="application/vnd.ms-excel"){
            await downloadMessaggioPagoPaZipExel(token,profilo.nonce, {idMessaggio:id}).then(response => response.blob()).then((res)=>{
               
                saveAs( res,`File.xlsx` );
                setShowDownloading(false);
                readMessage(id);
            }).catch((err)=>{
                manageError(err,dispatchMainState);
                setShowDownloading(false);
            }); 
        }
    };


  
        
    
   

    const readMessage = async(id) => {
        await readMessaggioPagoPa(token,profilo.nonce,{idMessaggio:Number(id)}).then((res)=>{
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
            {/* 
            <div className="marginTop24" style={{display:'flex', justifyContent:'space-between', height:"48px"}}>
                
                {
                    [].length > 0 &&
                <Button onClick={() => console.log('grid')}
                    disabled={false}
                >
                Download Risultati
                    <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                </Button>
                }
            </div>
            */}
            <div className="mb-5 mt-5">
                <Box sx={{
                    backgroundColor: "background.paper",
                    borderRadius: 2,
                    overflowY: "auto",
                    maxHeight: "400px",
                    minHeight: "400px",
                    display: "flex",
                    flexGrow: 1,
                    flexDirection: "column"
                }}>
                    <TimelineNotification >
                        {gridData.map((item: any, i: number) => {
                            return (
                                <div id={item.lettura ? 'div_timeline_single_messagge_non_lette' :'div_timeline_single_messagge_lette'}>
                                    <TimelineNotificationItem 
                                        key={item.id}>
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
                                            <TimelineNotificationDot  variant={item.stato === '1' ? "outlined" : undefined} size={item.stato === '1' ? "small" : "default"} />
                                            <TimelineConnector />
                                        </TimelineNotificationSeparator>
                                        <TimelineNotificationContent>
                                            <Typography variant="caption" color="text.secondary" component="div">
                                                {getTime(item.dataInserimento)}
                                            </Typography>
                                            {item.stato && <Chip size="small" label={item.stato === '1' ? 'In elaborazione' : 'Elaborato' } color={item.stato === '1' ? 'warning':'success'} />}
                                            {item.tipologiaDocumento && <Typography color="text.primary" variant="caption-semibold" component="div">
                                                {`Tipologia documento: ${item.tipologiaDocumento}`}
                                            </Typography>}
                                            <Typography color="text.primary" variant="overline" component="div">
                                                {`Letto  `}
                                                {item.lettura ? <CheckCircleIcon color="success" ></CheckCircleIcon>: <CheckCircleOutlineIcon color="disabled"></CheckCircleOutlineIcon>
                                                    
                                                }
                                          
                                            </Typography>
                                            {item.minor && item.fiscalCode && <Typography color="text.secondary" variant="caption" component="div">
                                                {item.fiscalCode}
                                            </Typography>}
                                            {!item.minor && <ButtonNaked  onClick={()=> downloadMessaggio(item.idMessaggio,item.contentType)} disabled={item.stato !== '2'} target="_blank" variant="naked" color="primary" weight="light" startIcon={<AttachFileIcon />}>
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