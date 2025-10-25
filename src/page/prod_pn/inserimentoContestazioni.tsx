import { Autocomplete, Box,Button,FormControl, InputLabel, MenuItem, Select, Skeleton, styled, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { PathPf } from "../../types/enum";
import {  useContext, useEffect, useRef, useState } from "react";
import { getAnniContestazioni, getEntiContestazioni, getMesiContestazioni, recapContestazioniAzure, uploadContestazioniAzure } from "../../api/apiPagoPa/notifichePA/api";
import { GlobalContext } from "../../store/context/globalContext";
import { manageError, managePresaInCarico, manageStringMessage } from "../../api/api";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { month } from "../../reusableFunction/reusableArrayObj";
import ModalInvioContestazioni from "../../components/reportDettaglio/modalConfermaContestazioni";
import NavigatorHeader from "../../components/reusableComponents/navigatorHeader";
import GavelIcon from '@mui/icons-material/Gavel';
import useSavedFiltersNested from "../../hooks/usaSaveFiltersLocalStorageNested";
import DeleteIcon from '@mui/icons-material/Delete';
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

interface MeseContetazione{
    descrizione: string,
    mese: string
}
export interface BodyContestazionePage{
    anno:string,
    mese:string,
    idEnte: string,
    contractId: string
}
interface EntiContestazionePage{
    ragioneSociale: string,
    idEnte: string,
    contractId: string
}
interface RecapObjContestazioni{
    tipologiaFattura: string
    idFlagContestazione: number
    flagContestazione: string
    totale: number
    totaleNotificheAnalogiche: number
    totaleNotificheDigitali: number  
}

const InserimentoContestazioni = () =>{
    const globalContextObj = useContext(GlobalContext);
    const {mainState,dispatchMainState,setErrorAlert} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const { 
        filters,
        updateFilters,
        isInitialRender,
        resetFilters
    } = useSavedFiltersNested(PathPf.INSERIMENTO_CONTESTAZIONI,{});

    const [body,setBody] = useState<BodyContestazionePage>({
        anno:'',
        mese:'',
        idEnte: "",
        contractId: ""
    });
    const [valueYears,setValueYears] = useState<string[]>([]);
    const [valueMesi,setValueMesi] = useState<MeseContetazione[]>([]);
    const [valueEnti,setValueEnti] = useState<EntiContestazionePage[]>([]);
    const [valueAutocomplete, setValueAutocomplete] = useState<EntiContestazionePage|null>(null);
    const [textValueEnti, setTextValueEnti] = useState('');
    const [loadingEnti, setloadingEnti] = useState(false);
    const [arrayReacpCon, setArrayRecapCon] = useState<RecapObjContestazioni[]>([]);
    const [nameEnteTitle, setEnteTitle] = useState<string>('');
    const [openModalConferma, setOpenModalConferma] = useState(false);
    const [file, setFile] = useState<File|null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loadindDetail,setLoadingDetail] = useState(false);
    const uploadRef = useRef<boolean>(false);

    useEffect(()=>{
        getAnni();
        if(isInitialRender.current && Object.keys(filters).length > 0 && filters.body.contractId === ""){
            manageStringMessage('NO_ENTE_FILTRI_CONTESTAZIONE',dispatchMainState);
        }else if(body.contractId === ""  && body.idEnte === ""){
            manageStringMessage('NO_ENTE_FILTRI_CONTESTAZIONE',dispatchMainState);
        }
    },[]);

    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValueEnti.length >= 3){
                getEnti();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValueEnti]);

    const getAnni = async() => {
        await getAnniContestazioni(token,profilo.nonce).then((res)=>{
            setValueYears(res.data);
            if(isInitialRender.current && Object.keys(filters).length > 0){
                getMesi(filters.body.anno);
                setEnteTitle(filters.valueAutocomplete.ragioneSociale);
            }else{
                getMesi(res.data[0]);
            }
        }).catch((err)=>{
            manageError(err,dispatchMainState);
        });
    };

    const getMesi = async(y) => {
        await getMesiContestazioni(token,profilo.nonce,y).then((res)=>{
            setValueMesi(res.data);
            if(isInitialRender.current && Object.keys(filters).length > 0){
                setBody(filters.body);
                setTextValueEnti(filters.textValueEnti);
                setValueAutocomplete(filters.valueAutocomplete);
                if(filters.body.contractId !== '' && filters.body.idEnte !== '' && uploadRef.current === false){
                    recapContestazioni(filters.body);
                }else{
                    isInitialRender.current = false;
                }
            }else if(res.data.length){
                if(uploadRef.current){
                    setBody((prev)=> ({...prev, ...{anno:y,mese:res.data[0].mese,idEnte:"",contractId:""}}));
                    updateFilters({
                        pathPage:PathPf.INSERIMENTO_CONTESTAZIONI,
                        body:{...body, ...{anno:y,mese:res.data[0].mese,idEnte:"",contractId:""}},
                        textValueEnti,
                        valueAutocomplete
                    });
                }else{
                    setBody((prev)=> ({...prev, ...{anno:y,mese:res.data[0].mese}}));
                    updateFilters({
                        pathPage:PathPf.INSERIMENTO_CONTESTAZIONI,
                        body:{...body, ...{anno:y,mese:res.data[0].mese}},
                        textValueEnti,
                        valueAutocomplete
                    });
                }
                
                // chiamata che avviene solo al cambio anno
                if(body.idEnte !== '' && body.contractId !== '' && uploadRef.current === false){
                    recapContestazioni({...body, ...{anno:y,mese:res.data[0].mese}});
                }
            } 
            uploadRef.current = false;
        }).catch((err)=>{
            manageError(err,dispatchMainState);
            uploadRef.current = false;
        });
    };

    const getEnti = async() => {
        setloadingEnti(true);
        await getEntiContestazioni(token,profilo.nonce,textValueEnti).then((res)=>{
            setValueEnti(res.data);
            setloadingEnti(false); 
        }).catch((err)=>{
            manageError(err,dispatchMainState);
            setloadingEnti(false);
        });
    };

    const recapContestazioni = async(body) => {
        setLoadingDetail(true);
        await recapContestazioniAzure(token,profilo.nonce,body).then((res)=>{
            setArrayRecapCon(res.data);
            setLoadingDetail(false);
            isInitialRender.current = false;
        }).catch((err)=>{
            setArrayRecapCon([]);
            setLoadingDetail(false);
            if(err?.response?.request?.status === 404){
                manageStringMessage('404_NO_CONTESTAZIONI',dispatchMainState);
            }else{
                manageError(err,dispatchMainState);
            }   
        });
    };

    const handleSelect = (file: File) => {
        if(file.type === "text/csv"){
            setFile(file);
        }else{
            setFile(null);
            manageStringMessage("FORMAT_FILE_ERROR",dispatchMainState);
        }
    };

    const uploadFile = async () => {
        uploadRef.current = true;
        const fileId = crypto.randomUUID();
        if (!file) return;
        const chunkSize:number = 5 * 1024 * 1024; // 4 MB
        const totalChunks = Math.ceil(file.size / chunkSize);
        let start = 0;
        setUploading(true);
        try{
            while (start < file.size) {
                const end = Math.min(start + chunkSize, file.size);
                const chunk = file.slice(start, end);
                const formData = new FormData();
                formData.append('fileChunk', chunk, file.name);
                formData.append('fileId', fileId); // Include the unique file ID
                formData.append('chunkIndex', Math.floor(start / chunkSize).toString());
                formData.append('totalChunks', totalChunks.toString());
                formData.append('idEnte', body.idEnte);
                formData.append('contractId', body.contractId);
                formData.append('mese', body.mese);
                formData.append('anno', body.anno);
                // Create a promise for each chunk upload
                /// forse da eliminare, ho inserito questo per i file con le dimensioni di un solo chunk
                if(totalChunks === 1 ){
                    setProgress(50);
                }
                await uploadContestazioniAzure(token,profilo.nonce,formData).then((res)=>{
                    setProgress((prevProgress) => (prevProgress >= 101 ? 0 : prevProgress + (100/totalChunks)));
                    if(res.data.item2 === true){
                        managePresaInCarico('PRESA_IN_CARICO_DOCUMENTO',dispatchMainState);
                    }
                }).catch((err)=>{
                    setErrorAlert({error:409,message:err?.response?.data?.detail|| "L'operazione non è andata a buon fine"});
                    throw new Error(err.response.data.details); 
                });
                start = end;
            }
        }catch(err){
            setUploading(false);
            setProgress(0);
            setOpenModalConferma(false);
            setFile(null);   
        }
        /// prova a fermare la get dettaglio andando a gestire la logica con luploading
        setProgress(0);
        setOpenModalConferma(false);
        setFile(null);
        resetFilters();
        setValueAutocomplete(null);
        setTextValueEnti('');
        setArrayRecapCon([]);
        
        getAnni();
        setUploading(false);
    };

    const handleChangeAnno = (e) => {
        getMesi(e.target.value);
        setBody((prev)=> ({...prev, ...{anno:e.target.value}})); 
        setFile(null);
    };

    const handleChangeMese = (e) => {
        setBody((prev)=> ({...prev, ...{mese:e.target.value}}));
        setFile(null);
        if(body.contractId !== '' && body.idEnte !== ''){
            recapContestazioni({...body,...{mese:e.target.value}});
        }
        updateFilters({
            pathPage:PathPf.INSERIMENTO_CONTESTAZIONI,
            body:{...body, ...{mese:e.target.value}},
            textValueEnti,
            valueAutocomplete
        });
    };

    return (
        <>
            <div>
                <NavigatorHeader pageFrom={"Contestazioni/"} pageIn={"Contestazioni multiple"} backPath={PathPf.STORICO_CONTEST} icon={<GavelIcon  sx={{padding:"3px"}}  fontSize='small'></GavelIcon>}></NavigatorHeader>
            </div>
            <div className="mx-5" style={{minHeight:'600px'}}>
                <div className="marginTop24">
                    <div className="row ">
                        <div className="col-9">
                            <Typography variant="h4">Contestazioni multiple</Typography>
                        </div>
                    </div>
                </div>
                <div className="mt-5">
                    <div className="row">
                        <div className="col-3">
                            <Box sx={{width:'80%'}}>
                                <FormControl fullWidth size="medium">
                                    <InputLabel>Anno</InputLabel>
                                    <Select
                                        label='Anno'
                                        onChange={handleChangeAnno}
                                        value={body.anno}
                                    >
                                        {valueYears.map((el) => (
                                            <MenuItem key={el} value={el}>
                                                {el}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </div>
                        <div className="col-3">
                            <Box sx={{width:'80%'}} >
                                <FormControl fullWidth size="medium">
                                    <InputLabel>Mese</InputLabel>
                                    <Select
                                        label='Mese'
                                        onChange={handleChangeMese}
                                        value={body.mese}
                                    >
                                        {valueMesi.map((el:MeseContetazione) => (
                                            <MenuItem key={el.mese} value={el.mese}>
                                                {el?.descrizione.charAt(0).toUpperCase() + el.descrizione.slice(1).toLowerCase()}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </div>
                        <div className="col-3">
                            <Box sx={{width:'80%'}}  >
                                <Autocomplete
                                    options={valueEnti}
                                    loading={loadingEnti}
                                    isOptionEqualToValue={(option, value) => option.idEnte === value.idEnte}
                                    getOptionLabel={(option: EntiContestazionePage) => option.ragioneSociale}
                                    value={valueAutocomplete}
                                    onChange={(event, value) => {
                                        if(value){
                                            setBody((prev) => ({...prev,...{idEnte:value.idEnte,contractId:value.contractId}}));
                                            setEnteTitle(value.ragioneSociale);
                                            recapContestazioni({...body,...{idEnte:value.idEnte,contractId:value.contractId}});
                                            setValueAutocomplete(value);
                                            updateFilters({
                                                pathPage:PathPf.INSERIMENTO_CONTESTAZIONI,
                                                body:{...body,...{idEnte:value.idEnte,contractId:value.contractId}},
                                                textValueEnti,
                                                valueAutocomplete:value
                                            });
                                        }else{
                                            setBody((prev) => ({...prev,...{idEnte:'',contractId:''}}));
                                            setEnteTitle('');
                                            setArrayRecapCon([]);
                                            setValueAutocomplete(null);
                                            updateFilters({
                                                pathPage:PathPf.INSERIMENTO_CONTESTAZIONI,
                                                body:{...body,...{idEnte:'',contractId:''}},
                                                textValueEnti,
                                                valueAutocomplete:null
                                            });
                                        }
                                        setFile(null);
                                    }}
                                    renderInput={(params) => {
                                        return <TextField 
                                            onChange={(e)=>{
                                                updateFilters({
                                                    pathPage:PathPf.INSERIMENTO_CONTESTAZIONI,
                                                    body:body,
                                                    textValueEnti:e.target.value,
                                                    valueAutocomplete
                                                });
                                                setTextValueEnti(e.target.value);}}
                                            {...params} label="Rag Soc. Ente" />;}}
                                />
                            </Box>
                        </div>
                        <div className="col-3 m-auto">
                            <Tooltip title={file ? (file?.name || ""):"Carica file"}>
                                <Button
                                    disabled={body.contractId === '' || arrayReacpCon.length === 0}
                                    component="label"
                                    variant="contained"
                                    onClick={()=> file && setOpenModalConferma(true)}
                                    startIcon={<CloudUploadIcon />}
                                >
                                    {file ? "Inserisci":"Carica file"}
                                    {!file && <VisuallyHiddenInput type="file" onChange={(e:any)=> handleSelect(e.target.files[0])}/>}
                                </Button>
                            </Tooltip>
                            {file &&
                            <Tooltip title={"Elimina file"}>
                                <Button  
                                    sx={{marginLeft:'20px'}}
                                    size="medium"
                                    variant="outlined"
                                    onClick={() => setFile(null)}> 
                                    <DeleteIcon  />
                                </Button>
                            </Tooltip>
                            }
                        </div>
                    </div>
                    {loadindDetail ? 
                        <div className="bg-white my-5 "> 
                            <Skeleton variant="rectangular" height={300}/>
                        </div> :
                        <div className="bg-white my-5 ">
                            {arrayReacpCon.length > 0 &&
                            <div className="row text-center">  
                                <div  className="col-12">
                                    <Box sx={{ margin: 2 ,backgroundColor:'#F8F8F8', padding:'10px'}}>
                                        <Typography variant="h4">{nameEnteTitle} {month[Number(body.mese)-1]} {body.anno}</Typography>
                                    </Box>
                                    <Box sx={{ margin: 2 , backgroundColor:'#F8F8F8', padding:'10px'}}>
                                        <Table size="small" aria-label="purchases">
                                            <TableHead>
                                                <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                                    <TableCell align="center" sx={{ width:"300px"}} >Tipologia Fattura</TableCell>
                                                    <TableCell align="center" sx={{ width:"300px"}} >Tipologia Contestazione</TableCell>
                                                    <TableCell align="center" sx={{ width:"300px"}}>Flag Contestazione</TableCell>
                                                    <TableCell align="center" sx={{ width:"300px"}}>Tot. Not. Analog.</TableCell>
                                                    <TableCell align="center" sx={{ width:"300px"}}>Tot. Not. Digit.</TableCell>
                                                    <TableCell align="center" sx={{ width:"300px"}}>Totale</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                                {arrayReacpCon.map((sigleRec:RecapObjContestazioni)=>{
                                                    return (
                                                        <TableRow key={Math.random()}>
                                                            <TableCell align="center"  sx={{ width:"300px"}} >{sigleRec.tipologiaFattura}</TableCell>
                                                            <TableCell align="center" sx={{ width:"300px"}} >{sigleRec.flagContestazione}</TableCell>
                                                            <TableCell align="center" sx={{ width:"300px"}}>{sigleRec.idFlagContestazione}</TableCell>
                                                            <TableCell align="center" sx={{ width:"300px"}}>{sigleRec.totaleNotificheAnalogiche}</TableCell>
                                                            <TableCell align="center" sx={{ width:"300px"}}>{sigleRec.totaleNotificheDigitali}</TableCell>
                                                            <TableCell align="center" sx={{ width:"300px"}}>{sigleRec.totale}</TableCell>
                                                        </TableRow>
                                                    );})}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                </div>
                            </div>}
                        </div>}
                </div>
                <ModalInvioContestazioni 
                    open={openModalConferma} 
                    setOpen={setOpenModalConferma}
                    onButtonComferma={uploadFile}
                    info={{mese:body.mese, anno:body.anno,ente:nameEnteTitle}}
                    progress={progress}
                    uploading={uploading}
                ></ModalInvioContestazioni>
                <ModalLoading 
                    open={loadindDetail} 
                    setOpen={setLoadingDetail}
                    sentence={'Loading...'} >
                </ModalLoading>
            </div>
        </>
    );
};
export default InserimentoContestazioni;


