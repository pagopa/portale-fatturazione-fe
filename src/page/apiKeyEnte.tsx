import { Button, FilledInput, FormControl, FormHelperText, IconButton, InputAdornment, Skeleton, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { GlobalContext } from "../store/context/globalContext";
import { createApiKey, getPageApiKeyVisibleIP} from "../api/apiSelfcare/apiKeySE/api";
import ModalRedirect from "../components/commessaInserimento/madalRedirect";
import { getPageApiKeyVisible } from "../api/api";
import IPAddressInput from "../components/reusableComponents/textField/inputIpAddress";

export interface BodyApiKey {
    apiKey: string|null,
    attiva: boolean,
    refresh: boolean|null
}

const ApiKeyEnte = () => {

    const globalContextObj = useContext(GlobalContext);
    const { mainState,mainData,setMainData} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const [disableInsertApiKey, setDisableInsertApiKey] = useState(false);
    const [showInsertIp, setShowInsertIp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
    const [loadingGetIPs,setLoadingGetIp] = useState(true);
    

    const [bodyApiKey,setBodyApiKey] = useState<BodyApiKey>({
        apiKey: null,
        attiva: true,
        refresh: null
    });


    const [ipsToCompare ,setIpsToCompare] = useState<{
        idEnte: string,
        ipAddress: string,
        dataCreazione: string
    }[]>([]);

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
            setIpsToCompare(res.data);
            setLoadingGetIp(false);
            console.log({res});
        }).catch(()=>{
            setIpsToCompare([]);
            setLoadingGetIp(false);
            //manageError(err, dispatchMainState);
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
                                            <Button disabled={disableInsertApiKey} onClick={()=> generateModifyKey({apiKey:mainData.apiKeyPage.keys[0], attiva: true,refresh: true})} variant="outlined">Rigenera</Button>
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
                                        <Button disabled={disableInsertApiKey} onClick={()=> generateModifyKey({apiKey:mainData.apiKeyPage.keys[1], attiva: false,refresh: true})} variant="outlined">Rigenera</Button>
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
                                (!showInsertIp && ipsToCompare?.length === 0 ) &&
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
                                <div>
                                 
                                    {ipsToCompare.map(el => {
                                        return(
                                            <IPAddressInput getIPs={getIPs} singleIp={el.ipAddress} button={"del"} ipsToCompare={ipsToCompare} setLoading={setLoadingGetIp}></IPAddressInput>
                                        );
                                    })}
                                    <IPAddressInput getIPs={getIPs} singleIp={""} button={"add"} ipsToCompare={ipsToCompare} setLoading={setLoadingGetIp}></IPAddressInput>
                                </div>
                            }
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