import { useMsal } from '@azure/msal-react';
import { HeaderAccount } from '@pagopa/mui-italia';
<<<<<<< HEAD:src/components/reusableComponents/headerPostLogin.tsx
import { useLocation, useNavigate } from 'react-router';
import { getManuale, managePresaInCarico, redirect } from '../../api/api';
import {useMsal } from '@azure/msal-react';
import { loginRequest } from '../../authConfig';
import { useContext, useState } from 'react';
import { GlobalContext } from '../../store/context/globalContext';
import { saveAs } from "file-saver";
import ModalLoading from './modals/modalLoading';
=======
import { useContext } from 'react';
import { useNavigate } from 'react-router';
import { loginRequest } from '../authConfig';
import { GlobalContext } from '../store/context/globalContext';
import { redirect } from '../api/api';

>>>>>>> issues/516:src/layout/headerLoginLogout.tsx


type JwtUser = {
    id: string;
    name?: string;
    surname?: string;
    email?: string;
};

const HeaderPostLogin = () => {
    const globalContextObj = useContext(GlobalContext);
<<<<<<< HEAD:src/components/reusableComponents/headerPostLogin.tsx
    const {mainState,dispatchMainState} = globalContextObj;

    const location  = useLocation();
=======
    const {mainState} = globalContextObj;
>>>>>>> issues/516:src/layout/headerLoginLogout.tsx
    const navigate = useNavigate();

    const pagoPALink = {
        label: 'PagoPA S.p.A.',
        href: 'https://www.pagopa.it/',
        ariaLabel: 'Link: vai al sito di PagoPA S.p.A.',
        title: 'Sito di PagoPA S.p.A.',
    };
  
    const user: JwtUser = {
        id: '1',
        name: mainState.profilo.nomeEnte,
        surname: "",
        email: "",
    };

    const [showDownloading, setShowDownloading] = useState(false);
    // start actions sul manuale operativo , download del manuale

   
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
        window.open(`mailto:fatturazione@assistenza.pagopa.it`);
    }
    // end on click su assistenza redirect alla tua apllicazione predefinita per l'invio mail

    const { instance } = useMsal();
   
    const handleLoginRedirect = () => {
        instance.loginRedirect(loginRequest).catch((error) => console.log(error));
    };

    const statusUser = mainState.authenticated && user;

    return (

        <div className="div_header">
<<<<<<< HEAD:src/components/reusableComponents/headerPostLogin.tsx
            {hideShowHeaderLogin ? null : 
                <>
                    <HeaderAccount
                        rootLink={pagoPALink}
                        loggedUser={statusUser}
                        onAssistanceClick={() => onEmailClick()}
                        onLogin={handleLoginRedirect}
                        onLogout={() => {
                            if(mainState.prodotti.length > 0){
                                localStorage.clear();
                                navigate('/azureLogin');
                            }else{
                                localStorage.clear();
                                window.location.href = redirect;
                            }
                        }}
                        onDocumentationClick={()=>onButtonClick()}
                    />
                    <ModalLoading 
                        open={showDownloading} 
                        setOpen={setShowDownloading}
                        sentence={'Downloading...'} >
                    </ModalLoading>
                </>
               
            }
=======
            <HeaderAccount
                rootLink={pagoPALink}
                loggedUser={statusUser}
                onAssistanceClick={() => onEmailClick()}
                onLogin={handleLoginRedirect}
                onLogout={() => {
                    if(mainState.prodotti.length > 0){
                        localStorage.clear();
                        navigate('/azureLogin');
                    }else{
                        localStorage.clear();
                        window.location.href = redirect;
                    }
                }}
                onDocumentationClick={()=>onButtonClick()}
            />
>>>>>>> issues/516:src/layout/headerLoginLogout.tsx
        </div>
    );
};

export default HeaderPostLogin;
