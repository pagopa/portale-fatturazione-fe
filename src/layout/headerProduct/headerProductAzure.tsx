import {  useEffect } from 'react';
import { useNavigate } from 'react-router';
import {HeaderProduct, PartyEntity } from '@pagopa/mui-italia';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import Badge from '@mui/material/Badge';
import { Box, IconButton } from '@mui/material';
import { getAuthProfilo, manageStringMessage, redirectAZ } from '../../api/api';
import { getMessaggiCount } from '../../api/apiPagoPa/centroMessaggi/api';
import { PathPf } from '../../types/enum';
import {  products } from '../../assets/dataLayout';
import { useGlobalStore } from '../../store/context/useGlobalStore';
import { ProfiloObject } from '../../types/typesGeneral';

const HeaderProductAzure = () => {
   
  const mainState = useGlobalStore(state => state.mainState);
  const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
  const setCountMessages = useGlobalStore(state => state.setCountMessages);
  const countMessages = useGlobalStore(state => state.countMessages);
  const setLoadingProfilo = useGlobalStore(state => state.setLoadingProfilo);
  const loadingProfilo = useGlobalStore(state => state.loadingProfilo);

  const token =  mainState.profilo?.jwt;
  const profilo =  mainState.profilo;
  const navigate = useNavigate();


  const partyList : Array<PartyEntity> = [
    {
      id:'0',
      logoUrl: ``,
      name:profilo.nomeEnte||'' ,
      productRole: "Amministratore",
    }
  ];


  const handleModifyMainState = (valueObj) => {
    dispatchMainState({
      type:'MODIFY_MAIN_STATE',
      value:valueObj
    });
  };
 
  //logica per il centro messaggi sospesa
  const getCount = async () =>{
    await getMessaggiCount(token,profilo.nonce).then((res)=>{
      const numMessaggi = res.data;
      setCountMessages(numMessaggi);
    }).catch((err)=>{
      console.log(err);
    });
  };
    
  useEffect(()=>{
    if(mainState.authenticated === true ){
      const interval = setInterval(() => {
        getCount();
      }, 30000);
      return () => clearInterval(interval); 
    }
  },[mainState.authenticated]);

  const getProfilo = async (jwt, productSelected) => { 
    setLoadingProfilo(true);
    try { 
      const resp = await getAuthProfilo(jwt); 
      const storeProfilo = resp.data; 
      const profiloDetails = { 
        auth: storeProfilo.auth,
        nomeEnte: storeProfilo.nomeEnte,
        descrizioneRuolo: storeProfilo.descrizioneRuolo,
        ruolo: storeProfilo.ruolo,
        dataUltimo: storeProfilo.dataUltimo,
        dataPrimo: storeProfilo.dataPrimo,
        prodotto: storeProfilo.prodotto,
        jwt: productSelected.jwt,
        nonce: storeProfilo.nonce,
        profilo: storeProfilo.profilo
      }; 
      handleModifyMainState({ 
        ruolo: resp.data.ruolo,
        action: '',
        authenticated: true,
        profilo: profiloDetails,
        //devo aggiungere qui un loading profilo
      }); 
      if (productSelected.prodotto === 'prod-pagopa') {
        navigate(PathPf.ANAGRAFICAPSP);
      } else if (productSelected.prodotto === 'prod-pn') {
        navigate(PathPf.LISTA_DATI_FATTURAZIONE); 
      } else if (productSelected.prodotto === 'prod-appio') { 
        navigate(PathPf.ANAGRAFICAAPPIO);
      } } catch (error:{response?:{status:number}}) { 
      console.error('Errore durante il recupero del profilo:', error);
      
      if(error.response.status === 401){
        navigate("/azureLogin");
      }else{
        manageStringMessage("SWITCH_PROFILO_ERROR",dispatchMainState);
      }
    }finally {
      console.log("finally");
      setLoadingProfilo(false);
    }
  };

  let conditionalPath =  PathPf.MESSAGGI; 
  if(profilo.auth === 'PAGOPA'  && mainState.profilo.prodotto === "prod-pn"){
    conditionalPath =  PathPf.MESSAGGI;
  }else if(profilo.auth === 'PAGOPA'  && mainState.profilo.prodotto === "prod-pagopa"){
    conditionalPath =  PathPf.MESSAGGIPN;
  }else if(profilo.auth === 'PAGOPA'  && mainState.profilo.prodotto === "prod-appio"){
    conditionalPath =  PathPf.MESSAGGIAPPIO;
  }

  return (
    <div style={{display:'flex', backgroundColor:'white'}}>
      <div style={{width:'95%'}}>
        <div key={profilo.prodotto}>
          <Box
            sx={{
              pointerEvents: loadingProfilo ? 'none' : 'auto',
              opacity: loadingProfilo ? 0.5 : 1,
            }}
            aria-disabled={loadingProfilo}
          >
            <HeaderProduct
              productId={profilo.prodotto}
              productsList={products}
              onSelectedProduct={(e) => {
                const newProfilo:ProfiloObject|undefined = mainState.prodotti.find((el:ProfiloObject) => el.prodotto === e.id);
                if(newProfilo) getProfilo(newProfilo.jwt,newProfilo);  
              }}
              partyList={partyList}/>
          </Box>
        </div>
      </div>
      <div className="d-flex justify-content-center m-auto">
        <Badge
          badgeContent={countMessages}
          color="primary"
          variant="standard"
        >
          <IconButton disabled={loadingProfilo} onClick={()=> {
            navigate(conditionalPath);
          } }  color="default">
            <MarkEmailUnreadIcon fontSize="medium" sx={{color: '#17324D'}}
            />
          </IconButton>
        </Badge>
      </div>
    </div>
  );
};

export default HeaderProductAzure;
