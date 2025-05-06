import React, { useContext, useState } from 'react';
import { Button, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { GlobalContext } from '../../../store/context/globalContext';
import { createIP, deleteIP } from '../../../api/apiSelfcare/apiKeySE/api';
import { manageError } from '../../../api/api';

const IPAddressInput = ({singleIp,getIPs,button,ipsToCompare,setLoading,disable}) => {
  
    const globalContextObj = useContext(GlobalContext);
    const { mainState,dispatchMainState} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const [ipAddress, setIpAddress] = useState(singleIp);
    const [error, setError] = useState('');
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
            manageError(err, dispatchMainState);
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
            }else if(ipsToCompare.map(el => el.ipAddress).includes(value)){
                setError('IP Address già inserito');
            } else {
                setError('');
            }
        }
    };

    return (
        <div className="bg-white col-11 p-3 d-flex justify-content-start">
        
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
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px', // Add spacing between buttons
                height: '58px',
                width: '20%',
            }}>
                {button === "add" && <Button disabled={error !== "" || ipAddress === ""||disable }  onClick={()=> createIPApi(ipAddress)} variant="outlined"><AddIcon fontSize="small"></AddIcon></Button>}
                {button === "del" &&<Button disabled={disable} onClick={() =>deleteSingleIp(singleIp)} variant="outlined"><DeleteIcon fontSize="small"></DeleteIcon></Button>}
            </div>
           
        </div>
    );
};

export default IPAddressInput;
