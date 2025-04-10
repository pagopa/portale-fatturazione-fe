import React, { useContext, useEffect } from 'react';
import {HeaderProduct, PartyEntity} from '@pagopa/mui-italia';
import { arrayProducts } from '../../assets/dataLayout';
import { GlobalContext } from '../../store/context/globalContext';
import { Badge, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PathPf } from '../../types/enum';
import { getMessaggiCountEnte, getVerificaNotificheEnte } from '../../api/apiSelfcare/notificheSE/api';
import DownloadIcon from '@mui/icons-material/Download';
import {  useSnackbar } from 'notistack';
import { mesiGrid } from '../../reusableFunction/reusableArrayObj';

const HeaderProductEnte : React.FC = () => {
    const globalContextObj = useContext(GlobalContext);
    const {mainState,setCountMessages, countMessages,dispatchMainState } = globalContextObj;
    const profilo =  mainState.profilo;
    const token =  mainState.profilo.jwt;
    const statusQueryGetUri = mainState?.statusQueryGetUri;
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
    
    console.log({mainState});

    useEffect(()=>{
        getCount();
    },[]);

    
    useEffect(()=>{
        if(globalContextObj.mainState.authenticated === true ){
            const interval = setInterval(() => {
                getCount();
            }, 20000);
            return () => clearInterval(interval); 
        }
    },[globalContextObj.mainState.authenticated]);

    useEffect(()=>{
        let interval;

        const callSequentially = async () => {
            for (const el of statusQueryGetUri) {
                const res = await getValidationNotifiche(el);
                console.log(res?.data.runtimeStatus);
    
                if (res?.data.runtimeStatus === "Completed") {
                    clearInterval(interval);
                    console.log("Stopping interval, task completed.");
                    return; // Exit the function early
                }
            }
        };
    
        if (globalContextObj.mainState.authenticated === true && statusQueryGetUri?.length > 0) {
            interval = setInterval(async () => {
                console.log("Starting sequential calls...");
                await callSequentially(); // Wait for all sequential calls to finish
            }, 10000);
    
            return () => {
                clearInterval(interval); // Clean up interval on unmount or dependency change
            };
        }
    },[globalContextObj.mainState.authenticated,statusQueryGetUri?.length]);

    const partyList : Array<PartyEntity> = [
        {
            id:'0',
            logoUrl: ``,
            name:profilo.nomeEnte ,
            productRole: "Amministratore",
        }
    ];

 

    //logica per il centro messaggi sospesa
    const getCount = async () =>{
        await getMessaggiCountEnte(token,profilo.nonce).then((res)=>{
            const numMessaggi = res.data;
            setCountMessages(numMessaggi);
        }).catch((err)=>{
            console.log(err);
        });
    };

    const getValidationNotifiche = async(queryString) => {
        const result = await getVerificaNotificheEnte(token,profilo.nonce,{idEnte: profilo.idEnte,statusQueryGetUri:queryString}).then((res)=>{
            console.log({res});
            //show alert message
            console.log(3);
            // handleClickVariant("warning","Ciao mamma");
            if(res.data.runtimeStatus === "Completed"){
                enqueueSnackbar(`È possibile eseguire il download del file NOTIFICHE ${mesiGrid[res.data.input.Mese]}/${res.data.input.Anno}`, {variant:"success",anchorOrigin:{ horizontal: "left", vertical: "bottom" }});
                const newStatusQueryUri = mainState.statusQueryGetUri.filter(el => el !== queryString);
                handleModifyMainState({statusQueryGetUri:newStatusQueryUri});
                return res;
            }else if(res.data.runtimeStatus === "Running"){
                console.log('Running');
            }else{
                enqueueSnackbar(`La creazione del file delle notifiche di ${mesiGrid[res.data.input.Mese]}/${res.data.input.Anno} non è andata a buon fine. Si prega di riprovare`, {variant:"info",anchorOrigin:{ horizontal: "left", vertical: "bottom" }});
                const newStatusQueryUri = mainState.statusQueryGetUri.filter(el => el !== queryString);
                handleModifyMainState({statusQueryGetUri:newStatusQueryUri});
            }
        }).catch(()=>{
            const newStatusQueryUri = mainState.statusQueryGetUri.filter(el => el !== queryString);
            handleModifyMainState({statusQueryGetUri:newStatusQueryUri});
            console.log("ERRORE NELLA VERIFICA");
        });
        return result;
    };
   
    return (
        <div style={{display:'flex', backgroundColor:'white'}}>
            <div style={{width:'95%'}}>
                <div key={profilo.prodotto}>
                    <HeaderProduct
                        productId='1'
                        productsList={arrayProducts}
                        onSelectedProduct={(p) => console.log('Selected Item:', p.title)}
                        partyList={partyList}
                    ></HeaderProduct>
                </div>
            </div>
            <div className="d-flex justify-content-center m-auto">
                <Badge
                    badgeContent={countMessages}
                    color="primary"
                    variant="standard"
                >
                    <IconButton onClick={() => navigate(PathPf.ASYNC_DOCUMENTI_ENTE)}  color="default">
                        <DownloadIcon fontSize="medium" sx={{color: '#17324D'}}
                        />
                    </IconButton>
                </Badge>
            </div>
        </div>
    );
};

export default HeaderProductEnte;
