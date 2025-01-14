import '../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { useContext, useEffect } from "react";
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
import { redirect } from '../api/api';


const RouteProfile = () => {
    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const isEnte = profiliEnti(mainState);
    const isLoggedWithoutProfile = mainState.prodotti.length > 0 && mainState.authenticated === true && !mainState.profilo.auth;
    const isProdPnProfile = mainState.profilo.prodotto === 'prod-pn' && mainState.prodotti.length > 0 && mainState.authenticated;
    const isPagoPaProfile = mainState.profilo.prodotto === 'prod-pagopa' && mainState.prodotti.length > 0 && mainState.authenticated;
    const isRececapitistaOrConsolidatore = (mainState.profilo?.profilo === 'REC' || mainState.profilo?.profilo ==='CON') && mainState.authenticated;
    const profilo = mainState.profilo;

    const globalLocalStorage = localStorage.getItem('globalState') || '{}';
    const result =  JSON.parse(globalLocalStorage);

    let route  = <Route/>;
    let redirectRoute = "/azureLogin";

    if(isEnte){
        route = EnteRoute();
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
