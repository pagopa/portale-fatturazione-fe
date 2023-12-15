import { HeaderAccount } from '@pagopa/mui-italia';
import { useLocation } from 'react-router';

import { useNavigate } from 'react-router';


type JwtUser = {
    id: string;
    name?: string;
    surname?: string;
    email?: string;
};

export default function HeaderPostLogin() {


    const location : any = useLocation();
    const navigate = useNavigate();
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

    const onButtonClick = () => {
        const pdfUrl = "/ManualeUtentePortaleFatturazione.pdf";
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = "ManualeUtentePortaleFatturazione.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

  
    function onEmailClick() {
        window.open(`mailto:fatturazione@assistenza.pagopa.it`);
    }
  

    return (

        <div className="div_header">
            {(location.pathname === '/auth')  ? null : 
                <HeaderAccount
                    rootLink={pagoPALink}
                    loggedUser={getDataUser === '{}' ? false : user}
                   
                    onAssistanceClick={() => onEmailClick()
                        //navigate('https://fatturazione@assistenza.pagopa.it');
                    }
                    
                    onLogin={() => {
                        console.log('User login');
                    }}
                    onLogout={() => {
                        localStorage.removeItem('profilo');
                        localStorage.removeItem('token');
                        localStorage.removeItem('statusApplication');
                        window.location.href = 'https://selfcare.pagopa.it/';
                        //navigate('https://selfcare.pagopa.it/');
                        
                    }}
                    onDocumentationClick={()=>onButtonClick()}
                />
            }
        </div>
    );
}
