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


    return (

        <div className="div_header">
            {(location.pathname === '/auth')  ? null : 
                <HeaderAccount
                    rootLink={pagoPALink}
                    loggedUser={getDataUser === '{}' ? false : user}
                    onAssistanceClick={() => {
                        console.log('Clicked/Tapped on Assistance');
                    }}
                    onLogin={() => {
                        console.log('User login');
                    }}
                    onLogout={() => {
                        localStorage.removeItem('profilo');
                        localStorage.removeItem('token');
                        navigate('/error');
                    }}
                />
            }
        </div>
    );
}
