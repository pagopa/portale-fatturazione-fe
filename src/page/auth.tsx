import { useSearchParams, useNavigate } from 'react-router-dom';
import { selfcareLogin, getAuthProfilo, manageError, redirect } from '../api/api';
import {useEffect} from 'react';
import { LoginProps, MainState, ManageErrorResponse } from '../types/typesGeneral';


// Blank page utilizzata per l'accesso degli utenti tramite  Selfcare

/*quando l'utente SELFCARE va al link https://uat.selfcare.pagopa.it/auth/login , procede con login es. (comune di Erba ) , viene fatto un redirect
automatico su questa ('/auth?selfcareToken=token') blank page dove , se c'è un profilo già presente nella LOCAL STORAGE lo andiamo ad eliminare , prendiamo il token che selfcare ci inserisce nell'url ,
e andiamo a fare la prima chiamata getSelfcare che ci restituisce un secondo token che noi utilizziamo nella seconda chiamata getProfilo.
Nella risposta della chiamata getProfilo noi andiamo ad estrapolare il jwt, salvarlo nella LOCAL STORAGE, così da poterlo utilizzare in ogni chiamata 
da parte dell'utente SELFCARE

*/
const Auth : React.FC<LoginProps> = ({setCheckProfilo, setMainState}) =>{
 
    
    // localStorage.removeItem('profilo');
    // localStorage.removeItem('token');
  
    const [searchParams] = useSearchParams();
    const token = searchParams.get('selfcareToken');


    const navigate = useNavigate();

type  Jwt = {
    jwt:string
}
interface ParameterGetProfilo {
    data:Jwt[]
}

//  seconda chiamata
const getProfilo = async (res:ParameterGetProfilo)=>{
      
    await getAuthProfilo(res.data[0].jwt)
        .then(resp =>{
               
            const storeProfilo = resp.data;
            localStorage.setItem('profilo', JSON.stringify({
                auth:storeProfilo.auth,
                nomeEnte:storeProfilo.nomeEnte,
                descrizioneRuolo:storeProfilo.descrizioneRuolo,
                ruolo:storeProfilo.ruolo,
                dataUltimo:storeProfilo.dataUltimo,
                dataPrimo:storeProfilo.dataPrimo,
                prodotto:storeProfilo.prodotto,
                jwt:res.data[0].jwt,
                profilo:storeProfilo.profilo // profilo utilizzato per la gestione delle notifiche/contestazioni
            }));
                
              
              
            setCheckProfilo(true);
               
            // setto il nonce nello state di riferimento globale
            setMainState((prev: MainState)=>({...prev, ...{nonce:resp?.data.nonce,ruolo:resp.data.ruolo}}));
            navigate("/");
        } )
        .catch((err: ManageErrorResponse) => {

            window.location.href = redirect;
            // manageError(err,navigate);
        });
};

 
// prima chiamata 
const getSelfcare = async() =>{
    await selfcareLogin(token).then(res =>{
          
        if(res.status === 200){
            // store del token nella local storage per tutte le successive chiamate START
            const storeJwt = {token:res.data[0].jwt};
            localStorage.setItem('token', JSON.stringify(storeJwt));
           
            // store del token nella local storage per tutte le successive chiamate END
            getProfilo(res);
               
        }
    }).catch((err:ManageErrorResponse) =>{
        window.location.href = redirect;
        //manageError(err, navigate);
    });
};

  

useEffect(()=>{
    getSelfcare();
},[]);
    
   
return (
    <></>
);
};

export default Auth;