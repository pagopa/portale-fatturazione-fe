import { Autocomplete, Box,Button,FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import MarkUnreadChatAltIcon from '@mui/icons-material/MarkUnreadChatAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked } from "@pagopa/mui-italia";
import { useNavigate } from "react-router";
import { PathPf } from "../../types/enum";
import { Ref, RefObject, useContext, useEffect, useRef, useState } from "react";
import { getAnniContestazioni, getEntiContestazioni, getMesiContestazioni } from "../../api/apiPagoPa/notifichePA/api";
import { GlobalContext } from "../../store/context/globalContext";
import { manageError } from "../../api/api";
import axios from "axios";

interface MeseContetazione{
    descrizione: string,
    mese: string
}

interface BodyContestazionePage{
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

    useEffect(()=>{
        getAnni();
    },[]);

    useEffect(()=>{
        if(body.year !== ''){
            getMesi();
        }
    },[body.year]);


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
                console.log(res);
                setValueMesi([]);
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



    const [file, setFile] = useState<File|null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileId = useRef(''); 
    console.log(file,'file',fileId);
 
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        fileId.current = `file_${Date.now()}`; // Generate a unique ID based on timestamp
    };
 
    const uploadFile = async () => {
        if (!file) return;
 
        const chunkSize = 4 * 1024 * 1024; // 4 MB
        const totalChunks = Math.ceil(file.size / chunkSize);
        const uploadPromises:any[] = [];
        let start = 0;
 
        while (start < file.size) {
            const end = Math.min(start + chunkSize, file.size);
            const chunk = file.slice(start, end);
            // const formData = new FormData();
            //formData.append('file', chunk, file.name);
            //formData.append('fileId', fileId.current); // Include the unique file ID
            //formData.append('chunkIndex', Math.floor(start / chunkSize));
            //formData.append('totalChunks', totalChunks);
 
            // Create a promise for each chunk upload
            const uploadPromise = axios.post('/upload', {x:''}, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
 
            uploadPromises.push(uploadPromise);
            start = end;
        }
 
        setUploading(true);
        try {
            await Promise.all(uploadPromises);
            console.log('All chunks uploaded successfully');
        } catch (error) {
            console.error('Error uploading chunks:', error);
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };
   


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
                        <Box sx={{width:'80%', marginLeft:'20px'}}  >
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel>Mese</InputLabel>
                                <Select
                                    label='Mese'
                                    onChange={(e:any) =>{
                                        console.log(e.target.value);
                                        setBody((prev)=> ({...prev, ...{month:e.target.value.toString()}}));
                                    }}
                                    value={body.month||''}
                                >
                                    {valueMesi.map((el:MeseContetazione) => (
                                        <MenuItem
                                            key={el.mese}
                                            value={el.mese||''}
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
                <div className="marginTop24 mt-5">
                    <Button onClick={uploadFile} disabled={uploading} variant='outlined'>UPLOAD</Button>
                </div>
                <input type="file" onChange={handleFileChange} />
            </div>
           
        </div>
    );

};
export default InserimentoContestazioni;