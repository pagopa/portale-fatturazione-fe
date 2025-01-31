import { useMsal } from '@azure/msal-react';
import { HeaderAccount } from '@pagopa/mui-italia';
import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { GlobalContext } from '../../store/context/globalContext';
import { loginRequest } from '../../authConfig';
import { pagoPALinkHeder } from '../../assets/dataLayout';
import { JwtUser } from '../../types/typesGeneral';

const HeaderLogAzure = () => {
    const { instance } = useMsal();
    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const navigate = useNavigate();
    const location = useLocation();

    const user: JwtUser = {
        id: '1',
        name: mainState.profilo.nomeEnte,
        surname: "",
        email: "",
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
                onDocumentationClick={()=>console.log('quando fa il merge implementa id download by api')}
            />
        </div>
    );
};

export default HeaderLogAzure;
