import { HeaderAccount } from '@pagopa/mui-italia';
import { useContext, useState } from 'react';
import { GlobalContext } from '../../store/context/globalContext';
import { getManuale, managePresaInCarico, redirect } from '../../api/api';
import { pagoPALinkHeder } from '../../assets/dataLayout';
import { JwtUser } from '../../types/typesGeneral';
import { saveAs } from "file-saver";
import ModalLoading from '../../components/reusableComponents/modals/modalLoading';

const HeaderLogEnte = () => {
    const globalContextObj = useContext(GlobalContext);
    const {mainState,dispatchMainState} = globalContextObj;
    const [showDownloading, setShowDownloading] = useState(false);

    
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
    

    function onEmailClick() {

        window.location.href = process.env.REACT_APP_REDIRECT_ASSISTENZA ||'';
    }
  
    const statusUser = mainState.authenticated && user;

    return (
        <div className="div_header">
            <HeaderAccount
                rootLink={pagoPALinkHeder}
                loggedUser={statusUser}
                onAssistanceClick={() => onEmailClick()}
                onLogout={() => {
                    localStorage.removeItem("globalState");
                    localStorage.removeItem("filters");
                    window.location.href = redirect;
                }}
                onDocumentationClick={()=>onButtonClick()}
            />
            <ModalLoading 
                open={showDownloading} 
                setOpen={setShowDownloading}
                sentence={'Downloading...'} >
            </ModalLoading>
        </div>
    );
};

export default HeaderLogEnte;
