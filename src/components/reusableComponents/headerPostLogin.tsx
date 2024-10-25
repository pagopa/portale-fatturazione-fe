import { HeaderAccount } from '@pagopa/mui-italia';
import { useLocation, useNavigate } from 'react-router';
import { redirect } from '../../api/api';
import {useMsal } from '@azure/msal-react';
import { loginRequest } from '../../authConfig';
import { useContext } from 'react';
import { GlobalContext } from '../../store/context/globalContext';


type JwtUser = {
    id: string;
    name?: string;
    surname?: string;
    email?: string;
};

const HeaderPostLogin = () => {
    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;

    const location  = useLocation();
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

    // start actions sul manuale operativo , download del manuale

    const onButtonClick = () => {
        const pdfUrl = "/ManualeUtentePortaleFatturazione5.pdf";
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = "ManualeUtentePortaleFatturazione.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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




    const hideShowHeaderLogin =  location.pathname === '/auth' ||
                                 location.pathname === '/azure' ||
                                 location.pathname === '/auth/azure'; 
                                 
    
    const statusUser = mainState.authenticated && user;


 
    return (

        <div className="div_header">
            {hideShowHeaderLogin ? null : 
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
            }
        </div>
    );
};

export default HeaderPostLogin;
