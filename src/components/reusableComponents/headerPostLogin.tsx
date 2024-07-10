import { HeaderAccount } from '@pagopa/mui-italia';
import { useLocation } from 'react-router';
import { redirect } from '../../api/api';
import { useNavigate } from 'react-router';
import {useMsal } from '@azure/msal-react';
import { loginRequest } from '../../authConfig';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import Badge from '@mui/material/Badge';
import { IconButton } from '@mui/material';
import { getMessaggiCount } from '../../api/apiPagoPa/centroMessaggi/api';
import { useEffect } from 'react';
import { getProfilo, getToken } from '../../reusableFunction/actionLocalStorage';

type JwtUser = {
    id: string;
    name?: string;
    surname?: string;
    email?: string;
};

const HeaderPostLogin = ({mainState,dispatchMainState}) => {

    const location  = useLocation();
    const profilo =  getProfilo();
    const token = getToken();

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    const getDataUser = localStorage.getItem('profilo')|| '{}';

    const dataUser = JSON.parse(getDataUser);
    const pagoPALink = {
        label: 'PagoPA S.p.A.',
        href: 'https://www.pagopa.it/',
        ariaLabel: 'Link: vai al sito di PagoPA S.p.A.',
        title: 'Sito di PagoPA S.p.A.',
    };
  
    const user: JwtUser = {
        id: '1',
        name: dataUser.nomeEnte,
        surname: "",
        email: "",
    };

    // start actions sul manuale operativo , download del manuale

    const onButtonClick = () => {
        const pdfUrl = "/ManualeUtentePortaleFatturazione3.pdf";
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

    const navigate = useNavigate();

    const getProfiloFromLocalStorage = localStorage.getItem('profilo') || '{}';

    const checkIfUserIsAutenticated = JSON.parse(getProfiloFromLocalStorage).auth;

    const hideShowHeaderLogin =  location.pathname === '/auth' ||
                                 location.pathname === '/azure' ||
                                 location.pathname === '/auth/azure'; 
                                 
    
    const statusUser = mainState.authenticated && user;


    //logica per il centro messaggi sospesa
    const getCount = async () =>{
        await getMessaggiCount(token,profilo.nonce).then((res)=>{
            const numMessaggi = res.data;
            handleModifyMainState({badgeContent:numMessaggi});
        }).catch((err)=>{
            console.log(err);
        });
    };
    
    useEffect(()=>{
        console.log(mainState);
        if(mainState.authenticated === true){
            getCount();
            const interval = setInterval(() => {
                getCount();
            }, 3000);
      
            return () => clearInterval(interval); 
         
        }
    },[]);
    return (

        <div className="div_header" style={{position:'relative'}}>
            {hideShowHeaderLogin ? null : 
               
                <HeaderAccount
                    rootLink={pagoPALink}
                    loggedUser={statusUser}
                    onAssistanceClick={() => onEmailClick()}
                    onLogin={handleLoginRedirect}
                    onLogout={() => {
                        if(checkIfUserIsAutenticated === 'PAGOPA'){
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
            <Badge
                badgeContent={mainState.badgeContent}
                color="primary"
                variant="standard"
                sx={{  
                    position: 'absolute',
                    top: 70,
                    right: 220,
                }}
            >
                <IconButton onClick={()=> {
                            
                    navigate('/centrorichieste');
                } }  color="default">
                    <MarkEmailUnreadIcon fontSize="medium" 
                        sx={{
                            color: '#17324D',
                        }}
                                
                    />
                </IconButton>
  
            </Badge>
               
            
        </div>
    );
};

export default HeaderPostLogin;
