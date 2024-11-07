import { Autocomplete, Box,Button,FormControl, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import MarkUnreadChatAltIcon from '@mui/icons-material/MarkUnreadChatAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked, SingleFileInput } from "@pagopa/mui-italia";
import { useNavigate } from "react-router";
import { PathPf } from "../../types/enum";
import {  useContext, useEffect, useState } from "react";
import { getAnniContestazioni, getEntiContestazioni, getMesiContestazioni, recapContestazioniAzure, uploadContestazioniAzure } from "../../api/apiPagoPa/notifichePA/api";
import { GlobalContext } from "../../store/context/globalContext";
import { manageError, manageStringMessage } from "../../api/api";
import { useId } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
interface MeseContetazione{
    descrizione: string,
    mese: string
}

export interface BodyContestazionePage{
    year:string,
    month:string,
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
    const {mainState,dispatchMainState} = globalContextObj;


    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const navigate = useNavigate();

    const [body,setBody] = useState<BodyContestazionePage>({
        year:'',
        month:'',
        idEnte: "",
        contractId: ""
    });
  

    const [valueYears,setValueYears] = useState<string[]>([]);
    const [valueMesi,setValueMesi] = useState<MeseContetazione[]>([]);
    const [valueEnti,setValueEnti] = useState<EntiContestazionePage[]>([]);
    const [textValueEnti, setTextValueEnti] = useState('');
    const [loadingEnti, setloadingEnti] = useState(false);
    const [arrayReacpCon, setArrayRecapCon] = useState<RecapObjContestazioni[]>([]);
   

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
    },[body.month]);

    useEffect(()=>{
        if(body.year !== ''){
            getMesi();
        }
    },[body.year]);

    useEffect(()=>{
        if(body.year !== ''&& body.month !== '' && body.contractId !== ''){
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
                setBody((prev)=> ({...prev, ...{year:res.data[0]}}));
            })
            .catch((err)=>{
                //manageError(err,dispatchMainState);
            });
    };

    const getMesi = async() => {
        await getMesiContestazioni(token,profilo.nonce,body.year)
            .then((res)=>{
                setValueMesi(res.data);
                if(res.data.length > 0){
                    setBody((prev)=> ({...prev, ...{month:res.data[0].mese}}));
                }else{
                    setBody((prev)=> ({...prev, ...{month:''}}));
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
                console.log(res,'enti');
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
                manageError(err,dispatchMainState);
            });
    };



    const [file, setFile] = useState<File|null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    

    const handleSelect = (file: File) => {
        setFile(file);
    };

    const handleRemove = () => {
        setFile(null);
    };
   
 
    const uploadFile = async () => {
        const fileId = crypto.randomUUID();
        if (!file) return;
      
        const chunkSize:number = 4 * 1024 * 1024; // 4 MB
        const totalChunks = Math.ceil(file.size / chunkSize);
        const uploadPromises = [];
        let start = 0;
        setUploading(true);
        while (start < file.size) {
            const end = Math.min(start + chunkSize, file.size);
            const chunk = file.slice(start, end);
            const formData = new FormData();
            formData.append('file', chunk, file.name);
            formData.append('fileId', fileId); // Include the unique file ID
            formData.append('chunkIndex', Math.floor(start / chunkSize).toString());
            formData.append('totalChunks', totalChunks.toString());
            formData.append('idEnte', body.idEnte);
            formData.append('contractId', body.contractId);
            formData.append('month', body.month);
            formData.append('year', body.year);
 
            // Create a promise for each chunk upload
            await uploadContestazioniAzure(token,profilo.nonce,formData).then((res)=>{
                console.log(res);
                console.log('Chunk uploaded successfully',Math.floor(start / chunkSize));
            }).catch((err)=>{
                console.log(err);
                console.error('Error uploading chunks:', err);
            });
 
            // uploadPromises.push(uploadPromise);
            start = end;
        }
        setUploading(false);
        setProgress(0);
    };
   
    console.log(body,file,'prova');


    return (
        <div className="mx-5">
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
                        <Typography variant="h4">Contestazioni</Typography>
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
                                        setBody((prev)=> ({...prev, ...{year:e.target.value,month:''}}));
                                    }}
                                    value={body.year}
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
                                        setBody((prev)=> ({...prev, ...{month:e.target.value}}));
                                    }}
                                    value={body.month}
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
                                    }else{
                                        setBody((prev) => ({...prev,...{idEnte:'',contractId:''}}));
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
                {(((body.contractId === '') && (file === null)) || (body.contractId !== '')) &&
                <div className=" d-flex justify-content-end mt-5">
                    <Button onClick={uploadFile} disabled={(body.contractId === '') || (!file)} variant="outlined">
                            Upload
                        <CloudUploadIcon sx={{marginLeft:'10px'}} fontSize="large" />
                    </Button>
                </div>
                }
                {(body.contractId !== '') &&
                <div className="marginTop24  mt-5">
                    <SingleFileInput  value={file} accept={[".csv"]} onFileSelected={handleSelect} onFileRemoved={handleRemove} dropzoneLabel="Trascina il tuo file.csv" dropzoneButton="Carica file" rejectedLabel="Tipo di file non supportato" />
                </div>
                }
                

                <div className="bg-white my-5 p-1 ">
                    <div className="row text-center">  
                        <div  className="col-12">
                            <Box sx={{ backgroundColor:'#F8F8F8', padding:'10px'}}>
                                <Typography variant="h4">Nome Ente</Typography>
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
              
               
                
                
            </div>
           
        </div>
    );

};
export default InserimentoContestazioni;


