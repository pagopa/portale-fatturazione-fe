import { HeaderAccount } from '@pagopa/mui-italia';
import { useContext } from 'react';
import { GlobalContext } from '../../store/context/globalContext';
import { redirect } from '../../api/api';
import { pagoPALinkHeder } from '../../assets/dataLayout';
import { JwtUser } from '../../types/typesGeneral';

const HeaderLogEnte = () => {
    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;

    
    const user: JwtUser = {
        id: '1',
        name: mainState.profilo.nomeEnte,
        surname: "",
        email: "",
    };

    const assistenza = process.env;
    

    function onEmailClick() {
        console.log( assistenza,'??');
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
                    localStorage.clear();
                    window.location.href = redirect;
                }}
                onDocumentationClick={()=>console.log('quando fa il merge implementa id download by api')}
            />
        </div>
    );
};

export default HeaderLogEnte;
