import React, { useCallback, useContext, useEffect, useState } from 'react';
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
    const {mainState,setCountMessages, countMessages,statusQueryGetUri,setStatusQueryGetUri } = globalContextObj;
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const profilo =  mainState.profilo;
    const token =  mainState.profilo.jwt;

    const partyList : Array<PartyEntity> = [
        {
            id:'0',
            logoUrl: ``,
            name:profilo.nomeEnte ,
            productRole: "Amministratore",
        }
    ];

    const [isTabVisible, setIsTabVisible] = useState(true);
 
    useEffect(()=>{
        getCount();
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            // eslint-disable-next-line no-undef
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    },[]);

    const handleVisibilityChange = () => {
        setIsTabVisible(document.visibilityState === 'visible');
    };
    
    useEffect(()=>{
        if(globalContextObj.mainState.authenticated === true ){
            const interval = setInterval(() => {
                getCount();
            }, 20000);
            return () => clearInterval(interval); 
        }
    },[globalContextObj.mainState.authenticated]);

   
    useEffect(()=>{
        let interval2;
        let stringsArray:string[] = [];
        const callSequentially = async () => {
            for (const el of statusQueryGetUri) {
                const res = await getValidationNotifiche(el);
                if (res) {
                    stringsArray = [...stringsArray,res];
                }
            }
            return;
        };

        if(globalContextObj.mainState.authenticated === true && statusQueryGetUri?.length > 0 && isTabVisible){
            interval2 = setInterval( async() => {
                await callSequentially();
                const deleteQueryCompleted = statusQueryGetUri.filter(element => !stringsArray.includes(element));
                setStatusQueryGetUri(deleteQueryCompleted);
                stringsArray = [];
            }, 10000); 
        }
        return () => {
            clearInterval(interval2); 
        };
    },[globalContextObj.mainState.authenticated,statusQueryGetUri?.length,isTabVisible]);

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
                enqueueSnackbar(`È possibile eseguire il download del file NOTIFICHE ${mesiGrid[res?.data?.input?.mese]}/${res?.data?.input?.anno}`, {variant:"success",anchorOrigin:{ horizontal: "center", vertical: "bottom" }});
                return queryString;
            }else if(res.data.runtimeStatus === "Running"|| res.data.runtimeStatus === "Pending" ){
                return;
            }else{
                enqueueSnackbar(`La creazione del file delle notifiche di ${mesiGrid[res?.data?.input?.mese]}/${res?.data?.input?.anno} non è andata a buon fine. Si prega di riprovare`, {variant:"info",anchorOrigin:{ horizontal: "center", vertical: "bottom" }});
                return queryString;
            }
        }).catch((err)=>{
            
            //const newStatusQueryUri = statusQueryGetUri.filter(el => el !== queryString && el !== null);
            // setStatusQueryGetUri(newStatusQueryUri);
            return queryString;
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
            {  (profilo.profilo !== 'CON' && profilo.profilo !== 'REC') &&
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
            }
        </div>
    );
};

export default HeaderProductEnte;
