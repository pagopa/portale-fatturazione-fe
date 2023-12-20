import { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { pagopaLogin, getAuthProfilo } from "../api/api";


const AuthAzure :React.FC = () =>{

    const { instance, accounts } = useMsal();
    const [tokens, setTokens] = useState({});

    useEffect(()=>{

        if (accounts.length > 0) {
            const request = {
                scopes: ["User.Read"],
                account: accounts[0]
            };
            instance.acquireTokenSilent(request).then((response:any) => {
                setTokens({accessToken:response.accessToken, idToken:response.idToken});
         
            }).catch(error => {
                // acquireTokenSilent can fail for a number of reasons, fallback to interaction
                if (error instanceof InteractionRequiredAuthError) {
                    instance.acquireTokenPopup(request).then((response:any) => {
                        setTokens({accessToken:response.accessToken, idToken:response.idToken});
                    });
                }
            });
        }

    },[accounts.length]);

    const postPagoPa = async() =>{

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
    
        if(Object.values(tokens).length > 0){
            postPagoPa();
        }
        
    },[tokens]);

  


    return (
        <>
            <h1> Azure Auth</h1>
        </>
    );
};

export default AuthAzure;