import { pagopaLogin, redirect, pagopaLogin2 } from "../api/api";
import {InteractionRequiredAuthError,InteractionStatus,
} from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import {useState, useEffect, useContext} from 'react';
import { useNavigate } from "react-router";
import { AuthAzureProps} from "../types/typesGeneral";
import { loginRequest } from "../authConfig";
import { GlobalContext } from "../store/context/globalContext";
import { getProdotti, getProfilo } from "../reusableFunction/actionLocalStorage";



// Blank Page utilizzata per l'autenticazione Azure e le conseguenti chiamate di accesso pagoPA
// e salvataggio del profilo nlla local storage


const AuthAzure : React.FC<any> = () =>{

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState} = globalContextObj;

  
    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
    
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
                    navigate('/azureLogin');
                 
                });
        }
    }, [instance, accounts, inProgress, apiData]);


    useEffect(()=>{
        if(Object.values(tokens).length > 0){
            //postPagoPa();
            postPagoPa2();
        }
    },[tokens]);
 
  
    /* const postPagoPa = () =>{
        pagopaLogin(tokens).then((res)=>{
            localStorage.clear();
            if(res.status === 200){
                //localStorage.removeItem("statusApplication");
                // store del token nella local storage per tutte le successive chiamate START
                const storeJwt = {token:res.data.jwt};
                localStorage.setItem('token', JSON.stringify(storeJwt));
           
                // store del token nella local storage per tutte le successive chiamate END
                // getProfilo(res);
            }
        }).catch(() =>{
            window.location.href = redirect;

        });

    };*/

    const postPagoPa2 = () =>{
        pagopaLogin2(tokens).then((res)=>{
            localStorage.clear();
            if(res.status === 200){
                //localStorage.removeItem("statusApplication");
                // store del token nella local storage per tutte le successive chiamate START
                console.log(res.data,'data');
                handleModifyMainState({
                    authenticated:true,
                    prodotti:res.data,
                    profilo:{},
                    mese:'',
                    anno:'',
                    nomeEnteClickOn:'',
                    datiFatturazione:false,// l'ente ha i dati di fatturazione?
                    userClickOn:undefined, // se l'utente clicca su un elemento di lista commesse setto GRID
                    inserisciModificaCommessa:undefined, // INSERT MODIFY  se il sevizio get commessa mi restituisce true []
                    primoInserimetoCommessa:true,// la commessa mese corrente è stata inserita?
                    statusPageDatiFatturazione:'immutable',
                    statusPageInserimentoCommessa:'immutable',
                    relSelected:{
                        nomeEnteClickOn:'',
                        mese:0,
                        anno:0,
                        idElement:''
                    },
                    apiError:null,
                    badgeContent:0,
                    messaggioSelected:null
                });
                navigate('/selezionaprodotto');
            }
        }).catch(() =>{
            window.location.href = redirect;

        });

    };


    return (
        <>
        </>
    ); 
};

export default AuthAzure;