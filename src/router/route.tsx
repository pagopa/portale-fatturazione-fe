import '../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { useContext, useEffect, useState } from "react";
import { profiliEnti } from "../reusableFunction/actionLocalStorage";
import { GlobalContext } from "../store/context/globalContext";
import EnteRoute from "./routeProfiles/enteRoute";
import SelectProdottiRoute from "./routeProfiles/selectProdotti";
import ProdPnRoute from "./routeProfiles/prodPnRoute";
import PagoPaRoute from "./routeProfiles/pagoPaRoute";
import RecConRoute from "./routeProfiles/recapitistaConsolidatoreRoute";
import { ThemeProvider} from '@mui/material';
import {theme} from '@pagopa/mui-italia';
import {Routes, Route, Navigate} from "react-router";
import BasicAlerts from "../components/reusableComponents/modals/alert";
import Auth from "../page/auth";
import AuthAzure from "../page/authAzure";
import Azure from "../page/azure";
import AzureLogin from "../page/azureLogin";
import ErrorPage from "../page/error";
import { PathPf } from "../types/enum";
import LayoutLoggedOut from '../layout/layoutLoggedOut';
import { BrowserRouter } from 'react-router-dom';
import useIsTabActive from '../reusableFunction/tabIsActiv';
import { getPageApiKeyVisible, redirect } from '../api/api';


const RouteProfile = () => {
    const globalContextObj = useContext(GlobalContext);
    const  { mainState,setMainData,mainData}  = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const isEnte = profiliEnti(mainState);
    const isLoggedWithoutProfile = mainState.prodotti?.length > 0 && mainState.authenticated === true && !mainState.profilo.auth;
    const isProdPnProfile = mainState.profilo?.prodotto === 'prod-pn' && mainState.prodotti?.length > 0 && mainState.authenticated;
    const isPagoPaProfile = mainState.profilo?.prodotto === 'prod-pagopa' && mainState.prodotti?.length > 0 && mainState.authenticated;
    const isRececapitistaOrConsolidatore = (mainState.profilo?.profilo === 'REC' || mainState.profilo?.profilo ==='CON') && mainState.authenticated;
 

    const globalLocalStorage = localStorage.getItem('globalState') || '{}';
    const result =  JSON.parse(globalLocalStorage);

    useEffect(()=>{
        if(token && profilo.nonce){
            apiKeyPageAvailable();
        }
    },[token,profilo.nonce]);

    const apiKeyPageAvailable = async() => {
        await getPageApiKeyVisible(token,profilo.nonce).then(async(res)=>{
            const newKeys = res?.data.map(el => el.apiKey).filter(el => el !== null);
            setMainData((prev) => ({...prev, apiKeyPage:{ keys:newKeys,ip:[],visible:true}}));
        }).catch((err)=>{
            if(err.response.status === 401){
                setMainData((prev) => ({...prev, apiKeyPage:{...prev.apiKeyPage,visible:false}}));
            }else if (err.response.status === 404){
                setMainData((prev) => ({...prev, apiKeyPage:{...prev.apiKeyPage,visible:true}}));
            }else{
                setMainData((prev) => ({...prev, apiKeyPage:{...prev.apiKeyPage,visible:true}}));
            }
        });
    };

    let route:any  = <Route/>;
    let redirectRoute = "/azureLogin";

    if(isEnte){
        route = EnteRoute({apiIsVisible:mainData.apiKeyPage.visible});
        redirectRoute = PathPf.DATI_FATTURAZIONE;
    }else if(isLoggedWithoutProfile){
        route = SelectProdottiRoute();
        redirectRoute = "/selezionaprodotto";
    }else if(isProdPnProfile){
        route = ProdPnRoute();
        redirectRoute = PathPf.LISTA_DATI_FATTURAZIONE;
    }else if(isPagoPaProfile){
        route = PagoPaRoute();
        redirectRoute = PathPf.ANAGRAFICAPSP;
    }else if(isRececapitistaOrConsolidatore){
        route = RecConRoute();
        redirectRoute = PathPf.LISTA_NOTIFICHE;
    }

    const tabActive = useIsTabActive();
   
    useEffect(()=>{
        if(mainState.authenticated === true  && tabActive === true){
            if(profilo?.nonce  !== result?.profilo?.nonce){
                window.location.href = redirect;
            }
        }
    },[tabActive]);

   
    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <div className="App">
                    <BasicAlerts></BasicAlerts>
                    <Routes>
                        <Route path="/auth" element={<Auth/>} />
                        <Route path="/auth/azure" element={<AuthAzure/>} />
                        <Route path="/azure" element={<Azure/>} />
                        <Route path="/azureLogin" element={<LayoutLoggedOut page={<AzureLogin/>}></LayoutLoggedOut>}></Route>
                        <Route path="/error"  element={<ErrorPage/>} />
                        <Route path="*" element={<Navigate  to={redirectRoute} replace />} />
                        {route}
                    </Routes>
                </div>
            </ThemeProvider>
        </BrowserRouter>
    );
};

export default RouteProfile;
