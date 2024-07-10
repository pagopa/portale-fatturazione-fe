import { Autocomplete, Box, Button, Checkbox, Chip, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TablePagination, TextField, Typography } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { useEffect, useState } from "react";
import SelectUltimiDueAnni from "../components/reusableComponents/select/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/select/selectMese";
import { downloadMessaggioPagoPa, getListaMessaggi} from "../api/apiPagoPa/centroMessaggi/api";
import { getProfilo, getToken } from "../reusableFunction/actionLocalStorage";
import { MainState } from "../types/typesGeneral";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

import { mesiGrid, month } from "../reusableFunction/reusableArrayObj";
import GridMessaggi from "../components/centroMessaggi/gridMessaggi";
import { ButtonNaked, TimelineNotification, TimelineNotificationContent, TimelineNotificationDot, TimelineNotificationItem, TimelineNotificationOppositeContent, TimelineNotificationSeparator } from "@pagopa/mui-italia";
import { TimelineConnector } from "@mui/lab";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { manageError } from "../api/api";
import { saveAs } from "file-saver";


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

interface CentroMessaggiProps {
    mainState:MainState,
    dispatchMainState:any
}

interface FilterCentroMessaggi{
    anno:number,
    mese:null|number,
    tipologiaDocumento:string[]|[],
}


const CentroMessaggi : React.FC<CentroMessaggiProps> = ({mainState,dispatchMainState}) => {

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;



    const token = getToken();
    const profilo = getProfilo();
    const currentYear = (new Date()).getFullYear();
  
   
    
    const [bodyCentroMessaggi, setBodyCentroMessaggi] = useState<FilterCentroMessaggi>({
        anno:currentYear,
        mese:null,
        tipologiaDocumento:[],
    });

    const [gridData, setGridData] = useState<Messaggi[]>([]);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [countMessaggi, setCountMessaggi] = useState(0);
    const [valueAutocomplete, setValueAutocomplete] = useState<string[]>([]);

    const [showDownloading, setShowDownloading] = useState(false);


    console.log(gridData);
   

    const getMessaggi = async (pa,ro,body) =>{
       
        await getListaMessaggi(token,profilo.nonce,body,pa,ro).then((res)=>{
            
            setGridData(res.data.messaggi);
            setCountMessaggi(res.data.count);
        }).catch((err)=>{
            setGridData([]);
            setCountMessaggi(0);
            console.log(err);
        });
    };

    const downloadMessaggio = async (id) => {
        await downloadMessaggioPagoPa (token,profilo.nonce, {idMessaggio:id}).then(response => response.blob())
            .then((res)=>{
                console.log(res);
                saveAs(res,`File.zip`);
                setShowDownloading(false);
            }).catch(((err)=>{
                setShowDownloading(false);
                manageError(err,dispatchMainState);
            }));
    };


  

    useEffect(()=>{
        getMessaggi(page+1, rowsPerPage, bodyCentroMessaggi);
    },[]);


    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        const realPage = newPage + 1;
        getMessaggi(realPage, rowsPerPage,bodyCentroMessaggi);
        setPage(newPage);   
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        
        const realPage = page + 1;
        getMessaggi(realPage, parseInt(event.target.value, 10),bodyCentroMessaggi);             
    };
   
    function getDay(dateString: string): string {
        const date = new Date(dateString);
        return `0${date.getDate()}`.slice(-2);
    }
      
    function getTime(dateString: string): string {
        const date = new Date(dateString);
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
                    */}
                </div>
                <div className="d-flex mt-5">
                   
                    <Button 
                        onClick={()=>{
                            getMessaggi(page+1,rowsPerPage,bodyCentroMessaggi);
                        } } 
                        sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                        variant="contained"> Filtra
                    </Button>
                   
                    <Button
                        onClick={()=>{
                            getMessaggi(1,rowsPerPage,{
                                anno:currentYear,
                                mese:null,
                                tipologiaDocumento:[],
                                letto: null
                            });
                            setBodyCentroMessaggi({
                                anno:currentYear,
                                mese:null,
                                tipologiaDocumento:[]
                            });
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
                {/*  <GridMessaggi
                    dispatchMainState={dispatchMainState}
                    nameParameterApi='idMessaggio'
                    elements={gridData}
                    changePage={handleChangePage}
                    changeRow={handleChangeRowsPerPage} 
                    total={countMessaggi}
                    page={page}
                    rows={rowsPerPage}
                    headerNames={headersName}
                    apiGet={getMessaggi}
                    disabled={false}></GridMessaggi>
                    */}

                <Box sx={{
                    
                    backgroundColor: "background.paper",
                    borderRadius: 2
                }}>
                    <TimelineNotification >
                        {gridData.map((item: any, i: number) => <TimelineNotificationItem key={item.id}>
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
                                {item.contentType && <Typography color="text.primary" variant="caption" component="div">
                                    {`Content type: ${item.contentType}`}
                                </Typography>}
                                {item.minor && item.fiscalCode && <Typography color="text.secondary" variant="caption" component="div">
                                    {item.fiscalCode}
                                </Typography>}
                                {!item.minor && <ButtonNaked  onClick={()=> downloadMessaggio(item.idMessaggio)} disabled={item.stato !== '2'} target="_blank" variant="naked" color="primary" weight="light" startIcon={<AttachFileIcon />}>
                Download documento
                                </ButtonNaked>}
                            </TimelineNotificationContent>
                        </TimelineNotificationItem>)}
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
            
        </div>
    );

};

export default CentroMessaggi;