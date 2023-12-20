import { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { pagopaLogin, getAuthProfilo } from "../api/api";








const AuthAzure :React.FC = () =>{
    const { instance, accounts } = useMsal();
    const [tokens, setTokens] = useState({});
    console.log({tokens});
    async function useToken() {
        console.log(1);
        if (accounts.length > 0) {
            const request = {
                scopes: ["openid"],
                account: accounts[0]
            };
            console.log(2);
            const cc = instance.acquireTokenSilent(request).then(response => {
                console.log(3);
                setTokens({access_token:response.accessToken, id_token:response.idToken});
            }).catch(error => {
                // acquireTokenSilent can fail for a number of reasons, fallback to interaction
                if (error instanceof InteractionRequiredAuthError) {
                    instance.acquireTokenPopup(request).then(response => {
                        setTokens({access_token:response.accessToken, id_token:response.idToken});
                    });
                }
            });
            console.log(await cc);
            return cc;
        }
    
        return tokens;
    }
   
  
    
    const postPagoPa = async() =>{
        console.log('dentro');
        await pagopaLogin(tokens).then((res) => {
            const x = JSON.stringify(res);
            localStorage.setItem('prova',x );
            console.log({res});
            return res.data;
        }).catch((err)=>{
            console.log(err);
        });
    };

   

    useEffect(()=>{
        useToken();
    },[]);

    useEffect(()=>{
    
        if(Object.values(tokens).length > 0){
            postPagoPa();
        }
      
         
         
    },[tokens]);


  


    return (
        <>
            <h1> Azure Auth cccccc</h1>
        </>
    );
};

export default AuthAzure;