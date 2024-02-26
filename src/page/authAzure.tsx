import { pagopaLogin, getAuthProfilo, manageError, redirect } from "../api/api";
import {InteractionRequiredAuthError,InteractionStatus,
} from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import {useState, useEffect} from 'react';
import { useNavigate } from "react-router";
import { AuthAzureProps, MainState } from "../types/typesGeneral";


// Blank Page utilizzata per l'autenticazione Azure e le conseguenti chiamate di accesso pagoPA
// e salvataggio del profilo nlla local storage
const AuthAzure : React.FC<AuthAzureProps> = ({setMainState}) =>{

    
    const navigate = useNavigate();

    const { instance, inProgress, accounts } = useMsal();
   
   
    const [apiData, setApiData] = useState(null);
    const [tokens, setTokens] = useState({});
  
    useEffect(() => {
        const accessTokenRequest = {
            scopes: ["user.read"],
            account: accounts[0],
        };
        if (!apiData && inProgress === InteractionStatus.None) {
            instance
                .acquireTokenSilent(accessTokenRequest)
                .then((accessTokenResponse) => {
                    // Acquire token silent success
                    const accessToken = accessTokenResponse.accessToken;
                    const idToken = accessTokenResponse.idToken;
               

                    setTokens({access_token:accessToken, id_token:idToken});
                  
                })
                .catch((error) => {
                    if (error instanceof InteractionRequiredAuthError) {
                        instance.acquireTokenRedirect(accessTokenRequest);
                    }
                 
                });
        }
    }, [instance, accounts, inProgress, apiData]);


    useEffect(()=>{
        if(Object.values(tokens).length > 0){
            postPagoPa();
        }

    },[tokens]);


  
    const postPagoPa = () =>{
        pagopaLogin(tokens).then((res)=>{
            if(res.status === 200){
            
                // store del token nella local storage per tutte le successive chiamate START
                const storeJwt = {token:res.data.jwt};
                localStorage.setItem('token', JSON.stringify(storeJwt));
           
                // store del token nella local storage per tutte le successive chiamate END
                getProfilo(res);
               
            }

        }).catch((err) =>{
            window.location.href = redirect;
            //manageError(err, navigate);
        });

    };


    type  Jwt = {
        jwt:string
    }
    interface ParameterGetProfiloAzure {
        data:Jwt
    }


    const getProfilo = async (res:ParameterGetProfiloAzure)=>{
      
        await getAuthProfilo(res.data.jwt)
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
                    jwt:res.data.jwt
                }));
                
              
              
                setMainState((prev:MainState)=>({...prev, ...{nonce:resp?.data.nonce,ruolo:resp.data.ruolo,action:'LISTA_DATI_FATTURAZIONE'}}));
                navigate('/pagopalistadatifatturazione');
                // setto il nonce nello state di riferimento globale
              
            } )
            .catch(err => {
                window.location.href = redirect;
                //manageError(err, navigate);
            });
    };

  
    return (
        <>
        </>
    ); 
};

export default AuthAzure;