import { Button, FilledInput, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, Skeleton, TextField, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputMask from 'react-input-mask';
import DeleteIcon from '@mui/icons-material/Delete';
import { GlobalContext } from "../store/context/globalContext";
import { createApiKey, createIP, deleteIP, getPageApiKeyVisibleIP} from "../api/apiSelfcare/apiKeySE/api";
import ModalRedirect from "../components/commessaInserimento/madalRedirect";
import { getPageApiKeyVisible, manageError } from "../api/api";



export interface BodyApiKey {
    apiKey: string|null,
    attiva: boolean,
    refresh: boolean|null
}



const ApiKeyEnte = () => {

    const globalContextObj = useContext(GlobalContext);
    const { mainState,mainData,setMainData,dispatchMainState} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const [disableInsertApiKey, setDisableInsertApiKey] = useState(false);
    const [showInsertIp, setShowInsertIp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
    const [loadingGetIPs,setLoadingGetIp] = useState(true);
    const [disableDeleteAddButton, setDisableDeleteAddButton] = useState(false);

    const [bodyApiKey,setBodyApiKey] = useState<BodyApiKey>({
        apiKey: null,
        attiva: true,
        refresh: null
    });

   
    const [ip0,setIp0] = useState<string|null>();
    const [ip1,setIp1] = useState<string|null>();
    const [ipsToCompare ,setIpsToCompare] = useState<string[]>([]);
    const [error0,setError0] = useState("");
    const [error1,setError1] = useState("");

    useEffect(()=>{
        if(mainState.datiFatturazione === false && profilo.auth !== 'PAGOPA'){
            setOpenModalRedirect(true);
        }else{
            getIPs();
        }
    },[]);

    const getIPs = async() =>{
        setLoadingGetIp(true);
        await getPageApiKeyVisibleIP(token,profilo.nonce).then(async(res)=>{
            const newIps = res?.data.map(el => el.ipAddress);
            if(newIps.length > 0){
                setIp0(newIps[0]);
            }
            if(newIps.length > 1){
                setIp1(newIps[1]);
            }else{
                setIp1(null);
            }
           
            setIpsToCompare(newIps);
            setLoadingGetIp(false);
        }).catch((err)=>{
            setIp0(null);
            setIp1(null);
            setIpsToCompare([]);
            setLoadingGetIp(false);
            //manageError(err, dispatchMainState);
        });
    };

    const createIPPage = async(ipAddress) =>{
        setDisableDeleteAddButton(true);
        await createIP(token,profilo.nonce,ipAddress).then(async(res)=>{
            await getIPs();
            setDisableDeleteAddButton(false);
        }).catch((err)=>{
            setDisableDeleteAddButton(false);
            manageError(err, dispatchMainState);
        });
    };

    const deleteSingleIp =  async(ipSelected:string) =>{
        setDisableDeleteAddButton(true);
        await deleteIP(token,profilo.nonce,ipSelected).then(async(res)=>{
            await getIPs();
            setDisableDeleteAddButton(false);
        }).catch((err)=>{
            setDisableDeleteAddButton(false);
            manageError(err, dispatchMainState);
        });
    };
    

    const generateModifyKey = async(body) => {
        setDisableInsertApiKey(true);
        await createApiKey(token,profilo.nonce,body).then(async(res)=>{
            await getPageApiKeyVisible(token,profilo.nonce).then((res)=>{
                setDisableInsertApiKey(false);
              
                const newKeys = res.data.map(el => el.apiKey);
                setMainData((prev) => ({...prev, apiKeyPage:{...prev.apiKeyPage,keys:newKeys}}));
            }).catch(()=>{
               
                setDisableInsertApiKey(false);
            });
        }).catch(()=>{
            setDisableInsertApiKey(false);
        });
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowPassword2 = () => setShowPassword2((show) => !show);
  
  
    const validateIP = (value) => {
        const ipPattern = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;
        return ipPattern.test(value);
    };
  
    const handleChangeIp0 = (e) => {
        const value = e.target.value;
        setIp0(value);
        if (value && !validateIP(value)) {
            setError0('IP non valido');
        }else {
            setError0('');
        }
    };


    const handleChangeIp1 = (e) => {
        const value2 = e.target.value;
        setIp1(value2);
        if (value2 && !validateIP(value2)) {
            setError1('Invalid IP address');
        }else if(value2 === ip0){
            setError1('Inserire un indirizzo IP diverso');
        } else {
            setError1('');
        } 
    };

    return(
        <div className="m-5 ">
           
            <div className="mt-5 pb-5">
                <Typography>Genera API KEY per gestire l'autenticazione dei soggetti connessi al nodo PAGOPA </Typography>
                <div className="row mt-5">
                    <div className="col-8">
                        <div style={{ display: 'flex', justifyContent: 'start', alignItems: 'center', height: '100%' }}>
                            <Typography variant="h4">API KEY</Typography>
                        </div>
                    </div>
                    {
                        mainData.apiKeyPage.keys?.length < 2 &&  <div className="col-3">
                            <div  style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', height: '100%',width:"300px" }}>
                                <Button disabled={disableInsertApiKey} onClick={()=>generateModifyKey(bodyApiKey)} variant="outlined"><AddIcon fontSize="small" className="me-2"></AddIcon>{mainData.apiKeyPage.keys?.length < 1 ?"Genera API KEY":"Genera API KEY secondaria"}</Button>
                            </div>
                        </div>
                    }
                </div>
                <div className="marginTop24">
                    <div className="row">
                        
                        {mainData.apiKeyPage.keys?.length === 0 && 
                               <> <div className=" bg-white col-8 p-3 d-flex justify-content-center">
                                   <Typography variant="body1">Non è stata ancora generata nessuna API KEY</Typography>
                               </div>
                               
                               <div className=" bg-white col-3 p-3">
                                   {!disableInsertApiKey && <Typography  onClick={() => generateModifyKey(bodyApiKey)} sx={{cursor:"pointer",color:"#0073E6"}} variant="caption-semibold">Genera API KEY</Typography>}
                               </div>
                               </> }
                        {mainData.apiKeyPage.keys?.length > 0 && 
                        <div className=" bg-white col-11 p-3 d-flex justify-content-start">
                            <FormControl sx={{ m: 1, width: '40%' }}>
                                <FormHelperText>API KEY primaria</FormHelperText>

                                <FilledInput
                                    value={mainData.apiKeyPage.keys[0]||""}
                                    fullWidth={true}
                                    type={showPassword ? 'text' : 'password'}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label={
                                                    showPassword ? 'Nascondi API Key' : 'Mostra Api key'
                                                }
                                                onClick={handleClickShowPassword}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                />
                                
                            </FormControl>
                            {mainData.apiKeyPage.keys?.length > 0 &&
                                        <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', height: '100%',width: '20%' }}>
                                            <Button disabled={disableInsertApiKey} onClick={()=> generateModifyKey({apiKey:mainData.apiKeyPage.keys[0], attiva: true,refresh: null})} variant="outlined">Rigenera</Button>
                                        </div>}
                        </div>}
                        {mainData.apiKeyPage.keys?.length > 1 &&
                                <div className=" bg-white col-11 p-3 d-flex justify-content-start">
                                    <FormControl sx={{ m: 1, width: '40%' }}>
                                        <FormHelperText>API KEY secondaria</FormHelperText>
                                        <FilledInput
                                            value={mainData.apiKeyPage.keys[1]||""}
                                            fullWidth={true}
                                            type={showPassword2 ? 'text' : 'password'}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label={
                                                            showPassword2 ? 'Nascondi API Key' : 'Mostra Api key'
                                                        }
                                                        onClick={handleClickShowPassword2}
                                                    >
                                                        {showPassword2 ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                        />
                                    </FormControl>
                                    <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', height: '100%',width: '20%' }}>
                                        <Button disabled={disableInsertApiKey} onClick={()=> generateModifyKey({apiKey:mainData.apiKeyPage.keys[1], attiva: false,refresh: null})} variant="outlined">Rigenera</Button>
                                    </div>
                                </div>}
                    </div>
                </div>
            </div>
            {!loadingGetIPs ? 
                <div className="mt-5 pb-5">
                    <div className="row mt-5 ">
                        <div className="col-9">
                            <div style={{ display: 'flex', justifyContent: 'start', alignItems: 'center', height: '100%' }}>
                                <Typography variant="h4">IP RANGE</Typography>
                            </div>
                        </div>
                        <div className="col-2">
                            {
                                (!showInsertIp && !ip0) &&
                            <div  style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', height: '100%' }}>
                                <Button onClick={()=> setShowInsertIp((prev)=> !prev)} variant="outlined"><AddIcon fontSize="small" className="me-2"></AddIcon>Aggiungi IP</Button>
                            </div>
                            }
                        </div>
                    </div>
                    <div className="marginTop24">
                        <div className="row ">
                            {!showInsertIp && ipsToCompare?.length === 0 ?
                                <>
                                    <div className=" bg-white col-8 p-3 d-flex justify-content-center">
                                        <Typography variant="body1">Non è stato creato ancora nessun IP</Typography>
                                    </div>
                                    <div className=" bg-white col-3 p-3">
                                        <Typography onClick={()=> setShowInsertIp((prev)=> !prev)} sx={{cursor:"pointer",color:"#0073E6"}} variant="caption-semibold">Aggiungi IP</Typography>
                                    </div>
                                </>:
                                <>
                                    <div className=" bg-white col-11 p-3 d-flex justify-content-start">
                                        <InputMask
                                            sx={{ m: 1, width: '20%',height:"59px" }}
                                            mask="99.99.99.999"
                                       
                                            value={ip0||""}
                                            onChange={(e)=>handleChangeIp0(e)}
                                            placeholder="Inserisci IP primario"
                                        >
                                            {(inputProps) => (
                                                <TextField
                                                    error={error0 !== ""}
                                                    helperText={error0 !== "" && error0}
                                                    InputProps={{
                                                        readOnly: ipsToCompare[0],
                                                    }}
                                                    {...inputProps}
                                                />
                                            )}
                                        </InputMask>
                                    
                                        <div  style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', height: '100%',width: '20%' }}>
                                            {ipsToCompare?.length === 0 ? 
                                                <Button disabled={error0 !== "" || !ip0 || disableDeleteAddButton} onClick={()=> createIPPage(ip0)} variant="outlined"><AddIcon fontSize="small"></AddIcon></Button>:
                                                <Button disabled={disableDeleteAddButton} onClick={() =>deleteSingleIp(ipsToCompare[0])} variant="outlined"><DeleteIcon fontSize="small"></DeleteIcon></Button>
                                        
                                            }
                                       
                                        </div>
                                   
                                    </div>
                                    {ipsToCompare?.length > 0 &&
                                <div className=" bg-white col-11 p-3 d-flex justify-content-start">
                                    <InputMask
                                    
                                        sx={{ m: 1, width: '20%',height:"59px" }}
                                        mask="99.99.99.999"
                                        value={ip1||""}
                                        onChange={(e)=>handleChangeIp1(e)}
                                        placeholder="Inserisci IP secondario"
                                    >
                                        {(inputProps) => (
                                            <TextField
                                                error={error1 !== ""}
                                                helperText={error1 !== "" && error1}
                                                InputProps={{
                                                    readOnly: ipsToCompare[1],
                                                }}
                                                {...inputProps}
                                            />
                                        )}
                                    </InputMask>
                                    <div  style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', height: '100%',width: '20%' }}>
                                        {ipsToCompare?.length === 1 ? 
                                            <Button disabled={error1 !== ""||!ip1|| disableDeleteAddButton} onClick={()=> createIPPage(ip1)} variant="outlined"><AddIcon fontSize="small"></AddIcon></Button>:
                                            <Button disabled={disableDeleteAddButton} onClick={() =>deleteSingleIp(ipsToCompare[1])} variant="outlined"><DeleteIcon fontSize="small"></DeleteIcon></Button>
                                        }
                                    </div>
                                </div>
                                    }
                                </>}
                        </div>
                    </div>
                </div>:
                <div className="mt-5 pb-5">
                    <div className="row mt-5 ">
                        <div className="col-11">
                            <Skeleton variant="rectangular" height={"300px"} />
                        </div>
                    </div>
                </div>}
            <ModalRedirect 
                setOpen={setOpenModalRedirect}
                open={openModalRedirect}
                sentence={`Per poter generare le API KEY è obbligatorio fornire  i seguenti dati di fatturazione:`}></ModalRedirect>
        </div>
        
    );
};
export default ApiKeyEnte;