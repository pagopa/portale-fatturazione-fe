import { HeaderAccount } from '@pagopa/mui-italia';
import { useEffect, useState } from 'react';
import { getManuale, managePresaInCarico, redirect } from '../../api/api';
import { pagoPALinkHeder } from '../../assets/dataLayout';
import { JwtUser } from '../../types/typesGeneral';
import { saveAs } from "file-saver";
import ModalLoading from '../../components/reusableComponents/modals/modalLoading';
import { useGlobalStore } from '../../store/context/useGlobalStore';
import { getInfoBanner } from '../../api/apiSelfcare/apiBanner/api';
import ErrorIcon from '@mui/icons-material/Error';
import DOMPurify from 'dompurify';

interface InfoBanner {
  id: string;
  dataInizio: string;
  dataFine: string;
  testo: string;
  visibile: boolean;
}

const HeaderLogEnte = () => {
  const mainState = useGlobalStore(state => state.mainState);
  const dispatchMainState = useGlobalStore(state => state.dispatchMainState);

  const profilo =  mainState.profilo;
  const token =  mainState.profilo.jwt;

  const [showDownloading, setShowDownloading] = useState(false);
  const [contentBasserApi, setContentBannerApi] = useState<InfoBanner>();

  useEffect(()=>{
    if(mainState.authenticated === true ){
      getDataInfoBanner();
    }
  },[mainState.authenticated]);

    
  const user: JwtUser = {
    id: '1',
    name: mainState.profilo.nomeEnte,
    surname: "",
    email: "",
  };

  const onButtonClick = async () => {
    setShowDownloading(true);
    await getManuale().then((response) =>{
      setShowDownloading(false);
      if(response.status !== 200){
        managePresaInCarico('ERRORE_MANUALE',dispatchMainState);
      }else{
        response.blob().then((res) => {
          setShowDownloading(false);
          const fileName = 'Manuale Utente Portale Fatturazione.pdf';
          saveAs( res,fileName );
        }); 
      }
    } ).catch(() => {
      setShowDownloading(false);
      managePresaInCarico('ERRORE_MANUALE',dispatchMainState);
    });
  };


  //:TODO  quando verrà implementato il refresh token bisogna richiamere l'api INFOBANNER
  const getDataInfoBanner = async () => {
    try {
      const info = await getInfoBanner(token, profilo.nonce);
      setContentBannerApi(info.data);
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
    

  function onEmailClick() {
    window.location.href = import.meta.env.VITE_APP_REDIRECT_ASSISTENZA ||'';
  }
  
  const statusUser = mainState.authenticated && user;

  return (
    <div className="div_header">
      <HeaderAccount
        rootLink={pagoPALinkHeder}
        loggedUser={statusUser}
        onAssistanceClick={() => onEmailClick()}
        onLogout={() => {
          localStorage.removeItem("globalStatePF");
          localStorage.removeItem("filters");
          window.location.href = redirect;
        }}
        onDocumentationClick={()=>onButtonClick()}
      />
      <div style={{ overflow: 'hidden' }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: '#fff4e5',
          color: '#663c00',
          padding: '12px 20%',
          borderRadius: '8px',
          fontSize: '14px',
          gap: '20px',
          transform: (contentBasserApi && isBannerActive(contentBasserApi)) ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 1s ease-in-out',
        }}>
          <ErrorIcon style={{ color: '#ed6c02', flexShrink: 0 }} />
          <div
            style={{flex: 1 }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contentBasserApi?.testo || "") }}
          />
        </div>
      </div>
      <ModalLoading 
        open={showDownloading} 
        setOpen={setShowDownloading}
        sentence={'Downloading...'} >
      </ModalLoading>
    </div>
  );
};

export default HeaderLogEnte;
