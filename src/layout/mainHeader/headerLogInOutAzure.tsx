import { useMsal } from '@azure/msal-react';
import { HeaderAccount } from '@pagopa/mui-italia';
import { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { GlobalContext } from '../../store/context/globalContext';
import { loginRequest } from '../../authConfig';
import { pagoPALinkHeder } from '../../assets/dataLayout';
import { JwtUser } from '../../types/typesGeneral';
import { getManuale, managePresaInCarico } from '../../api/api';
import { saveAs } from "file-saver";
import ModalLoading from '../../components/reusableComponents/modals/modalLoading';

const HeaderLogAzure = () => {
    const { instance } = useMsal();
    const globalContextObj = useContext(GlobalContext);
    const {mainState,dispatchMainState} = globalContextObj;
    const navigate = useNavigate();
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
        } ).catch((err) => {
            setShowDownloading(false);
            managePresaInCarico('ERRORE_MANUALE',dispatchMainState);
        });
    };


    //end actions sul manuale operativo , download del manuale
    // start on click su assistenza redirect alla tua apllicazione predefinita per l'invio mail
    function onEmailClick() {
        // if(mainState.profilo.auth === "PAGOPA" || location.pathname === '/azureLogin' || mainState.prodotti.length > 0){
        window.open(`mailto:fatturazione@assistenza.pagopa.it`);
       
    }
    // end on click su assistenza redirect alla tua apllicazione predefinita per l'invio mail

    const handleLoginRedirect = () => {
        instance.loginRedirect(loginRequest).catch((error) => console.log(error));
    };

    const statusUser = mainState.authenticated && user;
    console.log(window.location.href,'???');
    return (
        <div className="div_header">
            <HeaderAccount
                rootLink={pagoPALinkHeder}
                loggedUser={statusUser}
                onAssistanceClick={() => onEmailClick()}
                onLogin={handleLoginRedirect}
                onLogout={() => {
                    localStorage.clear();
                    navigate('/azureLogin');
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

export default HeaderLogAzure;
