import '../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { useContext } from "react";
import { profiliEnti } from "../reusableFunction/actionLocalStorage";
import { GlobalContext } from "../store/context/globalContext";
import EnteRoute from "./routeProfiles/enteRoute";
import SelectProdottiRoute from "./routeProfiles/selectProdotti";
import ProdPnRoute from "./routeProfiles/prodPnRoute";
import PagoPaRoute from "./routeProfiles/pagoPaRoute";
import RecConRoute from "./routeProfiles/recapitistaConsolidatoreRoute";
import { ThemeProvider} from '@mui/material';
import {theme} from '@pagopa/mui-italia';
import {Routes, Route, Navigate } from "react-router";
import BasicAlerts from "../components/reusableComponents/modals/alert";
import Auth from "../page/auth";
import AuthAzure from "../page/authAzure";
import Azure from "../page/azure";
import AzureLogin from "../page/azureLogin";
import ErrorPage from "../page/error";
import { PathPf } from "../types/enum";
import LayoutLoggedOut from '../components/reusableComponents/layoutLoggedOut';




const RouteProfile = () => {
    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const isEnte = profiliEnti(mainState);
    const isLoggedWithoutProfile = mainState.prodotti.length > 0 && mainState.authenticated === true && !mainState.profilo.auth;
    const isProdPnProfile = mainState.profilo.prodotto === 'prod-pn' && mainState.prodotti.length > 0 && mainState.authenticated;
    const isPagoPaProfile = mainState.profilo.prodotto === 'prod-pagopa' && mainState.prodotti.length > 0 && mainState.authenticated;
    const isRececapitistaOrConsolidatore = (mainState.profilo?.profilo === 'REC' || mainState.profilo?.profilo ==='CON') && mainState.authenticated;

    
    let route;
    let redirect = "/azureLogin";

    if(isEnte){
        route = EnteRoute();
        redirect = PathPf.DATI_FATTURAZIONE;
    }else if(isLoggedWithoutProfile){
        route = SelectProdottiRoute();
        redirect = "/selezionaprodotto";
    }else if(isProdPnProfile){
        route = ProdPnRoute();
        redirect = PathPf.LISTA_DATI_FATTURAZIONE;
    }else if(isPagoPaProfile){
        route = PagoPaRoute();
        redirect = PathPf.ANAGRAFICAPSP;
    }else if(isRececapitistaOrConsolidatore){
        route = RecConRoute();
        redirect = PathPf.LISTA_NOTIFICHE;
    }


    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                <BasicAlerts></BasicAlerts>
                <Routes>
                    <Route path="/auth" element={<Auth/>} />
                    <Route path="/auth/azure" element={<AuthAzure/>} />
                    <Route path="/azure" element={<Azure/>} />
                    <Route path="/azureLogin" element={<LayoutLoggedOut page={<AzureLogin/>}></LayoutLoggedOut>}></Route>
                    <Route path="/error"  element={<ErrorPage/>} />
                    <Route path="*" element={<Navigate  to={redirect} replace />} />
                    {route}
                </Routes>
            </div>
        </ThemeProvider>
    );

  
  
};

export default RouteProfile;
