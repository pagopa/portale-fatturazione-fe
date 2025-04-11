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
import useIsTabActive from '../../reusableFunction/tabIsActiv';

const HeaderProductEnte : React.FC = () => {
    const globalContextObj = useContext(GlobalContext);
    const {mainState,setCountMessages, countMessages,dispatchMainState,statusQueryGetUri,setStatusQueryGetUri } = globalContextObj;
    const profilo =  mainState.profilo;
    const token =  mainState.profilo.jwt;

    const navigate = useNavigate();
    const tabActive = useIsTabActive();
    const { enqueueSnackbar } = useSnackbar();

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
    
                if (res?.data.runtimeStatus === "Completed") {
                    clearInterval(interval);
                    return;
                }
            }
        };
    
        if (globalContextObj.mainState.authenticated === true && statusQueryGetUri?.length > 0 && tabActive) {
            interval = setInterval(async () => {
                await callSequentially();
            }, 10000);
    
            return () => {
                clearInterval(interval); 
            };
        }
    },[globalContextObj.mainState.authenticated,statusQueryGetUri?.length,tabActive]);

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
            if(res.data.runtimeStatus === "Completed"){
                enqueueSnackbar(`È possibile eseguire il download del file NOTIFICHE ${mesiGrid[res.data.input.Mese]}/${res.data.input.Anno}`, {variant:"success",anchorOrigin:{ horizontal: "center", vertical: "bottom" }});
                const newStatusQueryUri = statusQueryGetUri.filter(el => el !== queryString);
                setStatusQueryGetUri(newStatusQueryUri);
                return res;
            }else if(res.data.runtimeStatus === "Running"){
                return;
            }else{
                enqueueSnackbar(`La creazione del file delle notifiche di ${mesiGrid[res.data.input.Mese]}/${res.data.input.Anno} non è andata a buon fine. Si prega di riprovare`, {variant:"info",anchorOrigin:{ horizontal: "center", vertical: "bottom" }});
                const newStatusQueryUri = statusQueryGetUri.filter(el => el !== queryString);
                setStatusQueryGetUri(newStatusQueryUri);
            }
        }).catch(()=>{
            const newStatusQueryUri = statusQueryGetUri.filter(el => el !== queryString);
            setStatusQueryGetUri(newStatusQueryUri);
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
