import { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { createIP, deleteIP } from '../../../api/apiSelfcare/apiKeySE/api';
import { manageError } from '../../../api/api';
import { useGlobalStore } from '../../../store/context/useGlobalStore';

const IPAddressInput = ({singleIp,getIPs,button,ipsToCompare,setLoading,disable}) => {
  
    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
    const setErrorAlert = useGlobalStore(state => state.setErrorAlert);
 
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const [valueSinIp, valueCdr] = singleIp.split('/');

    const [ipAddress, setIpAddress] = useState(valueSinIp||"");
    const [cdr, setCdr] = useState(valueCdr||"");
    const [error, setError] = useState('');
    const [errorCDR, setErrorCDR] = useState('');
    const [disableDeleteAddButton, setDisableDeleteAddButton] = useState(false);

    const createIPApi = async(ipAddress) =>{
        setLoading(true);
        setDisableDeleteAddButton(true);
        await createIP(token,profilo.nonce,ipAddress).then(async()=>{
            await getIPs();
            setDisableDeleteAddButton(false);
        }).catch((err)=>{
            setLoading(false);
            setDisableDeleteAddButton(false);
        
            if(err.response.status === 400){
                setErrorAlert({error:err.response.status,message:err.response.data.detail});
            }else{
                manageError(err, dispatchMainState);
            }
        });
    };
    
    const deleteSingleIp =  async(ipSelected:string) =>{
        setLoading(true);
        setDisableDeleteAddButton(true);
        await deleteIP(token,profilo.nonce,ipSelected).then(async()=>{
            await getIPs();
            setDisableDeleteAddButton(false);
        }).catch((err)=>{
            setLoading(false);
            setDisableDeleteAddButton(false);
            manageError(err, dispatchMainState);
        });
    };

    const validateIP = (value) => {
        const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipPattern.test(value);
    };
   

    const handleChange = (e) => {
        const value = e.target.value;
        if (/^[\d.]*$/.test(value) && !/\.\./.test(value) && value.length <= 15) {
            setIpAddress(value);
            if (!validateIP(value)) {
                setError('IP Adderess non valido');
            }else if(ipsToCompare.map(el => el.ipAddress).includes(value+"/"+cdr)){
                setError('IP Address già inserito');
                setErrorCDR('IP Address già inserito');
            }else if(ipsToCompare.map(el => el.ipAddress).includes(value) && cdr === ""){
                setError('IP Address già inserito');
            }else {
                setError('');
            }
        }

        if (Number(cdr) >= 8 && Number(cdr) <= 32) {
            if(ipsToCompare.map(el => el.ipAddress).includes(value+"/"+cdr)){
                setErrorCDR('IP Address già inserito');
            } else {
                setErrorCDR('');
            }
        }
        
    };

    const handleChangeCDR = (e) => {
        const value = e.target.value;
        setCdr(value);
        if (Number(value) >= 8 && Number(value) <= 32) {
            if(ipsToCompare.map(el => el.ipAddress).includes(ipAddress+"/"+value)){
                setErrorCDR('IP Address già inserito');
                setError('IP Address già inserito');
            } else {
                setErrorCDR('');
            }
        }else if(value === ""){
            setErrorCDR('');
        
        }else{
            setErrorCDR('CDR non valido');
        }  

        if (/^[\d.]*$/.test(ipAddress) && !/\.\./.test(ipAddress) && ipAddress.length <= 15) {
            setIpAddress(ipAddress);
            if (!validateIP(ipAddress)) {
                setError('IP Adderess non valido');
            }else if(ipsToCompare.map(el => el.ipAddress).includes(ipAddress+"/"+value)){
                setError('IP Address già inserito');
                setErrorCDR('IP Address già inserito');
            }else if(ipsToCompare.map(el => el.ipAddress).includes(ipAddress) && value === ""){
                setError('IP Address già inserito');
            }else {
                setError('');
            }
        }
    };

    return (
        <div   className="bg-white col-11 p-3 d-flex justify-content-start">
            <div className='d-flex ms-2'>
                <TextField
                    label="IP Address"
                    value={ipAddress}
                    onChange={handleChange}
                    disabled={disable}
                    error={!!error}
                    helperText={error}
                    placeholder="e.g., 192.168.1.1"
                    inputProps={{
                        readOnly: button === "del" ? true : false,
                        inputMode: 'numeric',
                        pattern: '^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$',
                    }}
                />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '58px', width: '10%', }}>
                    <Typography variant='h5'> / </Typography>
                </div>
                <TextField
                    sx={{width:"25%"}}
                    label="CIDR"
                    value={cdr}
                    onChange={handleChangeCDR}
                    disabled={disable}
                    error={!!errorCDR}
                    helperText={errorCDR}
                    placeholder="8 - 32"
                    inputProps={{
                        readOnly: button === "del" ? true : false,
                        inputMode: 'numeric',
                        pattern: '^(8|9|[1-2][0-9]|3[0-2])$',
                    }}
                />
                
            </div>
           
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px', // Add spacing between buttons
                height: '58px',
                width: '10%',
            }}>
                {button === "add" && <Button disabled={error !== "" || ipAddress === ""|| errorCDR !== "" || disable }  onClick={()=> createIPApi(cdr !== "" ? ipAddress+"/"+cdr: ipAddress)} variant="outlined"><AddIcon fontSize="small"></AddIcon></Button>}
                {button === "del" &&<Button disabled={disable} onClick={() =>deleteSingleIp(singleIp)} variant="outlined"><DeleteIcon fontSize="small"></DeleteIcon></Button>}
            </div>
           
        </div>
    );
};

export default IPAddressInput;
