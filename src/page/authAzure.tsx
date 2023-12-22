import { pagopaLogin, getAuthProfilo } from "../api/api";
import { loginRequest } from '../authConfig';
import {InteractionRequiredAuthError,InteractionStatus,
} from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import {useState, useEffect} from 'react';
import { useNavigate } from "react-router";
import { AuthAzureProps } from "../types/typesGeneral";


const AuthAzure : React.FC<AuthAzureProps> = ({setInfoModuloCommessa}) =>{

    
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
                    /*
                    const stringTokens = JSON.stringify(tokens);
                    localStorage.setItem('tokens',stringTokens);
                    // Call your API with token
                      callApi(accessToken).then((response) => {
                        setApiData(response);
                    });*/
                })
                .catch((error) => {
                    if (error instanceof InteractionRequiredAuthError) {
                        instance.acquireTokenRedirect(accessTokenRequest);
                    }
                    console.log(error);
                });
        }
    }, [instance, accounts, inProgress, apiData]);


    useEffect(()=>{
        if(Object.values(tokens).length > 0){
            postPagoPa();
        }

    },[tokens]);


    console.log({tokens});
    const postPagoPa = () =>{
        pagopaLogin(tokens).then((res)=>{
            if(res.status === 200){
                console.log('dentro postpagopa', {res});
                // store del token nella local storage per tutte le successive chiamate START
                const storeJwt = {token:res.data.jwt};
                localStorage.setItem('token', JSON.stringify(storeJwt));
           
                // store del token nella local storage per tutte le successive chiamate END

            

                getProfilo(res);
               
            }

        }).catch((err) =>{
            console.log(err);
        });

    };



    const getProfilo = async (res:any)=>{
      
        await getAuthProfilo(res.data.jwt)
            .then(resp =>{
                console.log('dentro getProfilo', {res});
               
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
                
              
              
                setInfoModuloCommessa((prev:any)=>({...prev, ...{nonce:resp?.data.nonce,ruolo:resp.data.ruolo,action:'LISTA_DATI_FATTURAZIONE'}}));
                navigate('/pagopalistadatifatturazione');
                // setto il nonce nello state di riferimento globale
              
            } )
            .catch(err => {
                console.log(err);
            });
    };

  
    return (
        <>
            <h1>Auth azure</h1>
        </>
    ); 
};

export default AuthAzure;