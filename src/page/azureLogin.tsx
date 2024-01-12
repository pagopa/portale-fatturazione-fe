import { useNavigate } from "react-router";


// pagina visulizzata nel caso in cui l'utenete PagoPa procede con il logOut
// l'utente PagoPa potrà riaccedere tramite questa pagina

const AzureLogin : React.FC = () =>{


    const navigate = useNavigate();

    const getProfiloFromLocalStorage = localStorage.getItem('profilo') || '{}';

    const checkIfUserIsAutenticated = JSON.parse(getProfiloFromLocalStorage).auth;

    if(checkIfUserIsAutenticated === 'PAGOPA'){
        navigate('/pagopalistadatifatturazione');
    }
    if(checkIfUserIsAutenticated === 'SELFCARE'){
        localStorage.removeItem('profilo');
        localStorage.removeItem('token');

    }



    return (
      
        <div className='container d-flex align-items-center justify-content-center ' style={{height: '400px'}}>
            <h1>Sessione terminata</h1>
        
        </div>
            
     
    );
};

export default AzureLogin;