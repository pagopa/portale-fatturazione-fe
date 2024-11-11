import { Autocomplete, Box,Button,FormControl, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import MarkUnreadChatAltIcon from '@mui/icons-material/MarkUnreadChatAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked, SingleFileInput } from "@pagopa/mui-italia";
import { useNavigate } from "react-router";
import { PathPf } from "../../types/enum";
import {  useContext, useEffect, useState } from "react";
import { getAnniContestazioni, getEntiContestazioni, getMesiContestazioni, recapContestazioniAzure, uploadContestazioniAzure } from "../../api/apiPagoPa/notifichePA/api";
import { GlobalContext } from "../../store/context/globalContext";
import { manageError, managePresaInCarico, manageStringMessage } from "../../api/api";
import { useId } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { month } from "../../reusableFunction/reusableArrayObj";
import ModalInvioContestazioni from "../../components/reportDettaglio/modalConfermaContestazioni";
import { styled, width } from "@mui/system";
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

const InserimentoContestazioni = () =>{
    const globalContextObj = useContext(GlobalContext);
    const {mainState,dispatchMainState} = globalContextObj;


    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const navigate = useNavigate();

    const [body,setBody] = useState<BodyContestazionePage>({
        anno:'',
        mese:'',
        idEnte: "",
        contractId: ""
    });

  
  

    const [valueYears,setValueYears] = useState<string[]>([]);
    const [valueMesi,setValueMesi] = useState<MeseContetazione[]>([]);
    const [valueEnti,setValueEnti] = useState<EntiContestazionePage[]>([]);
    const [textValueEnti, setTextValueEnti] = useState('');
    const [loadingEnti, setloadingEnti] = useState(false);
    const [arrayReacpCon, setArrayRecapCon] = useState<RecapObjContestazioni[]>([]);
    const [nameEnteTitle, setEnteTitle] = useState<string>('');
    const [openModalConferma, setOpenModalConferma] = useState(false);

    useEffect(()=>{
        getAnni();
        if(body.contractId === ''){
            manageStringMessage('NO_ENTE_FILTRI_CONTESTAZIONE',dispatchMainState);
        }
    },[]);

    useEffect(()=>{
        if(body.contractId === '' && valueMesi.length > 0){
            manageStringMessage('NO_ENTE_FILTRI_CONTESTAZIONE',dispatchMainState);
        }
    },[body.mese]);

    useEffect(()=>{
        if(body.anno !== ''){
            getMesi();
        }
    },[body.anno]);

    useEffect(()=>{
        if(body.anno !== ''&& body.mese !== '' && body.contractId !== ''){

            setFile(null);
            recapContestazioni();
        }
    },[body]);

    


    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValueEnti.length >= 3){
                getEnti();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValueEnti]);


    const getAnni = async() => {
        await getAnniContestazioni(token,profilo.nonce)
            .then((res)=>{
              
                setValueYears(res.data);
                setBody((prev)=> ({...prev, ...{anno:res.data[0]}}));
            })
            .catch((err)=>{
                //manageError(err,dispatchMainState);
            });
    };

    const getMesi = async() => {
        await getMesiContestazioni(token,profilo.nonce,body.anno)
            .then((res)=>{
                setValueMesi(res.data);
                if(res.data.length > 0){
                    setBody((prev)=> ({...prev, ...{mese:res.data[0].mese}}));
                }else{
                    setBody((prev)=> ({...prev, ...{mese:''}}));
                }
            })
            .catch((err)=>{
                //manageError(err,dispatchMainState);
            });
    };

    const getEnti = async() => {
        setloadingEnti(true);
        await getEntiContestazioni(token,profilo.nonce,textValueEnti)
            .then((res)=>{

                setValueEnti(res.data);
                setloadingEnti(false);
            })
            .catch((err)=>{
                manageError(err,dispatchMainState);
                setloadingEnti(false);
            });
    };

    const recapContestazioni = async() => {
        await recapContestazioniAzure(token,profilo.nonce,body)
            .then((res)=>{
                setArrayRecapCon(res.data);
                

            }).catch((err)=>{
                setArrayRecapCon([]);
                if(err?.response?.request?.status === 404){
                    manageStringMessage('404_NO_CONTESTAZIONI',dispatchMainState);
                }else{
                    manageError(err,dispatchMainState);
                }
                
               
            });
    };



    const [file, setFile] = useState<File|null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    //setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
    

    const handleSelect = (file: File) => {
        setFile(file);
    };

    const handleRemove = () => {
        setFile(null);
    };


    const handleShowModalConferma = () => {
        setOpenModalConferma(true);
       
    };
    console.log(file?.name,'file');
  
    const uploadFile = async () => {
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
                await uploadContestazioniAzure(token,profilo.nonce,formData).then((res)=>{
                    console.log(res,'AAAA');
                    setProgress((prevProgress) => (prevProgress >= 101 ? 0 : prevProgress + (100/totalChunks)));
                    if(res.data.item2 === true){
                        managePresaInCarico('PRESA_IN_CARICO_DOCUMENTO',dispatchMainState);
                    }
                    console.log('Chunk uploaded successfully',Math.floor(start / chunkSize));
                }).catch((err)=>{
                    console.log(err,'topxxxx',err.response.data.detail);
                    manageStringMessage('409_'+err.response.data.detail,dispatchMainState);
                    throw new Error(err.response.data.details); // Stop all uploads
                });
     
                start = end;
            }
        }catch(err){
            
            setUploading(false);
            setProgress(0);
            setOpenModalConferma(false);
            setFile(null);
            
        }
       
        setUploading(false);
        setProgress(0);
        setOpenModalConferma(false);
        setFile(null);
    };
   
    
    

    return (
        <div className="mx-5" style={{minHeight:'600px'}}>
            <div className='d-flex marginTop24'>
                <ButtonNaked
                    color="primary"
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={() =>{
                        navigate(PathPf.LISTA_NOTIFICHE);
                    }}
                >
                        Indietro
                </ButtonNaked>
                <Typography sx={{ marginLeft:'20px'}} variant="caption">
                    <MarkUnreadChatAltIcon sx={{paddingBottom:'3px'}}  fontSize='small'></MarkUnreadChatAltIcon>
                         Notifiche 
                </Typography>
                <Typography sx={{fontWeight:'bold'}} variant="caption">/ Inserisci contestazioni</Typography> 
            </div>
            <div className="marginTop24">
                <div className="row ">
                    <div className="col-9">
                        <Typography variant="h4">Inserisci contestazioni</Typography>
                    </div>
                </div>
            </div>
            <div className="mt-5">
                <div className="row">
                    <div className="col-3">
                        <Box sx={{width:'80%'}} >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel>Anno</InputLabel>
                                <Select
                                    label='Anno'
                                    onChange={(e) => {
                                        setBody((prev)=> ({...prev, ...{anno:e.target.value,mese:''}}));
                                    }}
                                    value={body.anno}
                                >
                                    {valueYears.map((el) => (
                                        <MenuItem
                                            key={Math.random()}
                                            value={el}
                                        >
                                            {el}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                    <div className="col-3">
                        <Box sx={{width:'80%'}} >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel>Mese</InputLabel>
                                <Select
                                    label='Mese'
                                    onChange={(e) => {
                                        setBody((prev)=> ({...prev, ...{mese:e.target.value}}));
                                    }}
                                    value={body.mese}
                                >
                                    {valueMesi.map((el:MeseContetazione) => (
                                        <MenuItem
                                            key={el.mese}
                                            value={el.mese}
                                        >
                                            {el.descrizione}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        
                    </div>
                    <div className="col-3">
                        <Box sx={{width:'80%', marginLeft:'20px'}}  >
                            <Autocomplete
                                options={valueEnti}
                                loading={loadingEnti}
                                getOptionLabel={(option: EntiContestazionePage) => option.ragioneSociale}
                                onChange={(event, value) => {
                                    if(value){
                                        setBody((prev) => ({...prev,...{idEnte:value.idEnte,contractId:value.contractId}}));
                                        setEnteTitle(value.ragioneSociale);
                                    }else{
                                        setBody((prev) => ({...prev,...{idEnte:'',contractId:''}}));
                                        setEnteTitle('');
                                        setArrayRecapCon([]);
                                    }
                                }}
                                renderInput={(params) => {
                                    return <TextField 
                                        onChange={(e)=>{
                                            setTextValueEnti(e.target.value);
                                        }}
                                        {...params} label="Rag Soc. Ente" />;}}
                            />
                        </Box>
                    </div>
                </div>
             
                <div className=" d-flex justify-content-end mt-5">
                    <Button sx={{width:'250px'}} onClick={handleShowModalConferma} disabled={!file} variant="outlined">
                            Upload
                        <CloudUploadIcon sx={{marginLeft:'10px'}} fontSize="large" />
                    </Button>
                </div>
                {(body.contractId !== '' && arrayReacpCon.length > 0) &&
                    <div  id='singleInput' className="d-flex justify-content-end marginTop24   mt-3">
                        <div style={{minWidth:'250px'}}>
                            <SingleFileInput  value={file} accept={[".csv,.xlsx"]} onFileSelected={handleSelect} onFileRemoved={handleRemove} dropzoneLabel="Trascina il tuo file.csv" dropzoneButton="" rejectedLabel="Tipo di file non supportato" />
                        </div>
                    </div>
                }
                {arrayReacpCon.length > 0 &&
                <div className="bg-white my-5 p-1 ">
                    <div className="row text-center">  
                        <div  className="col-12">
                            <Box sx={{ margin: 2 ,backgroundColor:'#F8F8F8', padding:'10px'}}>
                                <Typography variant="h4">{nameEnteTitle} {month[Number(body.mese)-1]} {body.anno}</Typography>
                            </Box>
                            <Box sx={{ margin: 2 , backgroundColor:'#F8F8F8', padding:'10px'}}>
                                <Table size="small" aria-label="purchases">
                                    <TableHead>
                                        <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                            <TableCell align="left" sx={{ width:"300px"}} >Tipologia Fattura</TableCell>
                                            <TableCell align="left" sx={{ width:"300px"}} >Tipologia Contestazione</TableCell>
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
                                                    <TableCell align="left"  sx={{ width:"300px"}} >{sigleRec.tipologiaFattura}</TableCell>
                                                    <TableCell align="left" sx={{ width:"300px"}} >{sigleRec.flagContestazione}</TableCell>
                                                    <TableCell align="right" sx={{ width:"300px"}}>{sigleRec.idFlagContestazione}</TableCell>
                                                    <TableCell align="right" sx={{ width:"300px"}}>{sigleRec.totaleNotificheAnalogiche}</TableCell>
                                                    <TableCell align="right" sx={{ width:"300px"}}>{sigleRec.totaleNotificheDigitali}</TableCell>
                                                    <TableCell align="right" sx={{ width:"300px"}}>{sigleRec.totale}</TableCell>
                                                </TableRow>
                                            );})}
                                    </TableBody>
                                </Table>
                            </Box>
                        </div>
                                  
                                
                    </div>
                </div>
                }
              
               
                
                
            </div>
            <ModalInvioContestazioni 
                open={openModalConferma} 
                setOpen={setOpenModalConferma}
                onButtonComferma={uploadFile}
                info={{mese:body.mese, anno:body.anno,ente:nameEnteTitle}}
                progress={progress}
                uploading={uploading}
            ></ModalInvioContestazioni>
           
        </div>
    );

};
export default InserimentoContestazioni;


