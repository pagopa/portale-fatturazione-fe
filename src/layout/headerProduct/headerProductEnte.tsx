import React, { useEffect, useState } from 'react';
import {HeaderProduct, PartyEntity} from '@pagopa/mui-italia';
import { arrayProducts } from '../../assets/dataLayout';
import { Badge, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PathPf } from '../../types/enum';
import { getMessaggiCountEnte, getVerificaNotificheEnte } from '../../api/apiSelfcare/notificheSE/api';
import DownloadIcon from '@mui/icons-material/Download';
import { SnackbarContent, useSnackbar } from 'notistack';
import { mesiGrid } from '../../reusableFunction/reusableArrayObj';
import { useGlobalStore } from '../../store/context/useGlobalStore';
import { url } from '../../api/api';
import axios from 'axios';
import ErrorIcon from '@mui/icons-material/Error';
import { getInfoBanner } from '../../api/apiSelfcare/apiBanner/api';

interface InfoBanner {
  id: string;
  dataInizio: string;
  dataFine: string;
  testo: string;
  visibile: boolean;
}

const HeaderProductEnte : React.FC = () => {

  const mainState = useGlobalStore(state => state.mainState);
  const setCountMessages = useGlobalStore(state => state.setCountMessages);
  const statusQueryGetUri = useGlobalStore(state => state.statusQueryGetUri);
  const setStatusQueryGetUri = useGlobalStore(state => state.setStatusQueryGetUri);
  const countMessages = useGlobalStore(state => state.countMessages);


  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const profilo =  mainState.profilo;
  const token =  mainState.profilo.jwt;

  const partyList : Array<PartyEntity> = [
    {
      id:'0',
      logoUrl: ``,
      name:profilo.nomeEnte ,
      productRole: "",
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
    if(mainState.authenticated === true ){
      getDataInfoBanner();
      const interval = setInterval(() => {
        getCount();
      
      }, 20000);
      return () => clearInterval(interval); 
    }
  },[mainState.authenticated]);

   
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

    if(mainState.authenticated === true && statusQueryGetUri?.length > 0 && isTabVisible){
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
  },[mainState.authenticated,statusQueryGetUri?.length,isTabVisible]);

  //:TODO  quando verrà implementato il refresh token bisogna richiamere l'api INFOBANNER
  const getDataInfoBanner = async () => {
    try {
      const info = await getInfoBanner(token, profilo.nonce);
      if(isBannerActive(info.data)){
        enqueueSnackbar(
          info.data.testo.length > 130 ? info.data?.testo.toString().slice(0, 130) + '...' : info.data.testo, { 
            variant: 'warning',
            persist: true ,
            anchorOrigin: { vertical: 'top', horizontal: 'center' },
            content: (key, message) => (
              <SnackbarContent style={{ marginTop: '-23px' }}>
                <div style={{
                  backgroundColor: '#fff4e5',
                  color: '#663c00',
                  padding: '12px 16px',
                  margin: '0 40px 0 40px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: '50px',
                }}>
                  <ErrorIcon style={{ color: '#ed6c02', fontSize: '20px', flexShrink: 0 }} />
                  <Tooltip
                    title={info.data.testo}
                    arrow
                    placement="bottom"
                    componentsProps={{
                      tooltip: {
                        sx: {
                          fontSize: '14px',
                          padding: '8px 12px',
                          maxWidth: 400,
                        }
                      }
                    }}
                  >
                    <span style={{
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'default',
                    }}>
                      {message}
                    </span>
                  </Tooltip>
                </div>
              </SnackbarContent>
            )
          });
      }
     
    } catch (error) {
      console.error('Failed to fetch info banner:', error);
    }
  };

  const isBannerActive = (banner: InfoBanner | null): boolean => {
    if (!banner || !banner.visibile) return false;

    const now = new Date();
    const start = new Date(banner.dataInizio);
    const end = new Date(banner.dataFine);

    return now >= start && now <= end;
  };

  const getCount = async () => {
    try {
      let response;

      switch (profilo.profilo) {
      case "CON":
        response = await axios.get(
          `${url}/api/notifiche/consolidatore/richiesta/count?nonce=${profilo.nonce}`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        break;

      case "REC":
        response = await axios.get(
          `${url}/api/notifiche/recapitista/richiesta/count?nonce=${profilo.nonce}`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        break;

      default:
        response = await getMessaggiCountEnte(token, profilo.nonce);
        break;
      }

      setCountMessages(response.data);
    } catch (err) {
      console.log({err});
    }
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
    }).catch(()=>{
      //const newStatusQueryUri = statusQueryGetUri.filter(el => el !== queryString && el !== null);
      // setStatusQueryGetUri(newStatusQueryUri);
      enqueueSnackbar(`Errore nella validazione del file Notifiche.`, {variant:"warning",anchorOrigin:{ horizontal: "center", vertical: "bottom" }});
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
