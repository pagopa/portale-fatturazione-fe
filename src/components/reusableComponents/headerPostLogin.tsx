import { HeaderAccount } from '@pagopa/mui-italia';
import { useLocation, useNavigate } from 'react-router';
import { getManuale, redirect } from '../../api/api';
import {useMsal } from '@azure/msal-react';
import { loginRequest } from '../../authConfig';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../store/context/globalContext';
import axios from 'axios';


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

    const [urlProva, setUrlProva] = useState('');
    // start actions sul manuale operativo , download del manuale

    useEffect(()=>{
        if(urlProva !== ''){
            const link = document.createElement("a");
            link.href = urlProva;
            link.download = 'ciao.pdf';
            document.body.appendChild(link);
        
            link.click();
        
            document.body.removeChild(link);
            window.URL.revokeObjectURL(urlProva);
            setUrlProva('');
        }

    },[urlProva]);

    const onButtonClick = async () => {
        

        await getManuale().then(async(res) => {
            try {
                /* 
                console.log(res, 'pippo');
                // setUrlProva(res);
                const link = document.createElement("a");
                link.href = res;
                link.download = 'ciao.pdf';
                document.body.appendChild(link);
        
                link.click();
        
                document.body.removeChild(link);
                window.URL.revokeObjectURL(res);
              
                
                // Make GET request with responseType set to 'blob'
                await axios.get(res,{
                    responseType: 'blob', // Ensures the response is treated as binary data
                    headers: {
                        'Content-Type': 'application/pdf', // Optional, depending on server
                    },
                }).then((response)=>{
                    console.log(response, 'BLOB');
                   
                }).catch((err)=> console.log('errore catch',err,'yyy'));
  */
                console.log(res,'RESRES');
                await fetch(res)  // URL to the API endpoint
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        console.log(response,'mimmo');
                    })
                    .then(data => {
                        return data; // Handle the response data
                    })
                    .catch(error => {
                        console.error('There was a problem with the fetch operation:', error);
                    });
     
            } catch (error) {
                console.error('Error downloading blob from Azure:', error);
            }
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
