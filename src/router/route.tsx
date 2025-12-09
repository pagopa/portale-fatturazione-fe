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
import { Grid, ThemeProvider} from '@mui/material';
import {theme} from '@pagopa/mui-italia';
import {Routes, Route, Navigate, useLocation, RouterProvider, Outlet} from "react-router";
import BasicAlerts from "../components/reusableComponents/modals/alert";
import Auth from "../page/auth";
import AuthAzure from "../page/authAzure";
import Azure from "../page/azure";
import AzureLogin from "../page/azureLogin";
import ErrorPage from "../page/error";
import { PathPf } from "../types/enum";
import LayoutLoggedOut from '../layout/layoutLoggedOut';
import { BrowserRouter, createBrowserRouter } from 'react-router-dom';
import useIsTabActive from '../reusableFunction/tabIsActiv';
import { getPageApiKeyVisible, redirect } from '../api/api';
import HeaderLogAzure from '../layout/mainHeader/headerLogInOutAzure';
import FooterComponent from '../layout/footer';
import AreaPersonaleUtenteEnte from '../page/prod_pn/areaPersonaleUtenteEnte';
import LayoutAzure from '../layout/layOutLoggedInAzure';
import Messaggi from '../page/messaggi';
import Accertamenti from '../page/prod_pn/accertamenti';
import AdesioneBando from '../page/prod_pn/adesioneBando';
import DettaglioStoricoContestazione from '../page/prod_pn/dettaglioStoricoContestazione';
import Fatturazione from '../page/prod_pn/fatturazione';
import InserimentoContestazioni from '../page/prod_pn/inserimentoContestazioni';
import InvioFatture from '../page/prod_pn/invioFatture';
import InvioFattureDetails from '../page/prod_pn/invioFattureDetails';
import ModuloCommessaInserimentoPn from '../page/prod_pn/moduloCommessaInserimentoPn';
import ModuloCommessaPdf from '../page/prod_pn/moduloCommessaPdf';
import PagoPaListaDatiFatturazione from '../page/prod_pn/pagoPaListaDatiFatturazione';
import PagoPaListaModuliCommessa from '../page/prod_pn/pagoPaListaModuliCommessa';
import ProcessiOrchestartore from '../page/prod_pn/processiOrchestratore';
import RelPdfPage from '../page/prod_pn/relPdfUtPa';
import RelPage from '../page/prod_pn/relUtPa';
import ReportDettaglio from '../page/prod_pn/reportDettaglioUtPa';
import Storico from '../page/prod_pn/storicoContestazioni';
import PageTipologiaContratto from '../page/prod_pn/tipologiaContratto';
import ListaDocEmessi from '../page/prod_pn/whiteList';
import SideNavSend from '../layout/sideNavs/sideNavSend';
import AuthAzureProdotti from '../page/authAzureProdotti';

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
        if(token && profilo.nonce && isEnte){
            apiKeyPageAvailable();
        }
    },[token,profilo.nonce,isEnte]);

    const apiKeyPageAvailable = async() => {
        //evita la chimata se lato AZURE
        await getPageApiKeyVisible(token,profilo.nonce).then(async(res)=>{
            const newKeys = res?.data.map(el => el.apiKey).filter(el => el !== null);
            setMainData((prev) => ({...prev, apiKeyPage:{ keys:newKeys,ip:[],visible:true}}));
        }).catch((err)=>{
         
            if(err?.response?.status === 401){
                setMainData((prev) => ({...prev, apiKeyPage:{...prev.apiKeyPage,visible:false}}));
            }else if (err.response.status === 404){
                setMainData((prev) => ({...prev, apiKeyPage:{...prev.apiKeyPage,visible:true}}));
            }else{
                setMainData((prev) => ({...prev, apiKeyPage:{...prev.apiKeyPage,visible:false}}));
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
        <ThemeProvider theme={theme}>
            <div className="App">
               
                <RouterProvider router={router2} />
            </div>
        </ThemeProvider>
    
        
    );

};

/*
<Routes>
                        <Route path="/auth" element={<Auth/>} />
                        <Route path="/auth/azure" element={<AuthAzure/>} />
                        <Route path="/azure" element={<Azure/>} />
                        <Route path="/azureLogin" element={<LayoutLoggedOut page={<AzureLogin/>}></LayoutLoggedOut>}></Route>
                        <Route path="/error"  element={<ErrorPage/>} />
                        <Route path="*" element={<Navigate  to={redirectRoute} replace />} />
                       
                        <Route path={"/test"} element={<TestListaModuli/>}/>
                        {route}
                    </Routes>
                     */

export default RouteProfile;

const LayoutLoggedOut2 = () => {
    return (
        <>
            <BasicAlerts></BasicAlerts>
            <HeaderLogAzure/>
            <Grid sx={{ height: '100%' }}>
                <Outlet />
            </Grid>
            <FooterComponent  />
        </>
    );
};


const prodPnRoutes = [
    {
        Component: LayoutAzure,
        path:"",
        children: [
            { path: PathPf.DATI_FATTURAZIONE, Component: AreaPersonaleUtenteEnte },
            { path: PathPf.LISTA_MODULICOMMESSA, Component: PagoPaListaModuliCommessa },
            { path: PathPf.MODULOCOMMESSA, Component: ModuloCommessaInserimentoPn },
            { path: PathPf.PDF_COMMESSA + "/:annoPdf?/:mesePdf?", Component: ModuloCommessaPdf },
            { path: PathPf.LISTA_DATI_FATTURAZIONE, Component: PagoPaListaDatiFatturazione },
            { path: PathPf.LISTA_REL, Component: RelPage },
            { path: PathPf.PDF_REL, Component: RelPdfPage },
            { path: PathPf.ADESIONE_BANDO, Component: AdesioneBando },
            { path: PathPf.FATTURAZIONE, Component: Fatturazione },
            { path: PathPf.LISTA_NOTIFICHE, Component: ReportDettaglio },
            { path: "/messaggi", Component: Messaggi },
            { path: "/accertamenti", Component: Accertamenti },
            { path: PathPf.INSERIMENTO_CONTESTAZIONI, Component: InserimentoContestazioni },
            { path: PathPf.STORICO_CONTEST, Component: Storico },
            { path: PathPf.TIPOLOGIA_CONTRATTO, Component: PageTipologiaContratto },
            { path: PathPf.LISTA_DOC_EMESSI, Component: ListaDocEmessi },
            { path: PathPf.JSON_TO_SAP, Component: InvioFatture },
            { path: PathPf.JSON_TO_SAP_DETAILS, Component: InvioFattureDetails },
            { path: PathPf.STORICO_DETTAGLIO_CONTEST, Component: DettaglioStoricoContestazione },
            { path: PathPf.ORCHESTRATORE, Component: ProcessiOrchestartore },
        ],
    },
];

const test = () => {
    console.log(999);
    return true;
};

const router2 = createBrowserRouter([
    {
        path: "/",
        Component:LayoutLoggedOut2,
        children: [
            {
                Component: AzureLogin,
                index:true
          
            },
            {
                
                path: "azureLogin",
                Component: AzureLogin,
              
          
            },
            {
                path: "azure",
                Component: Azure,
          
            },
            {
                path: "auth",
                Component: Auth,
          
            },
            {
                path: "selezionaprodotto",
                Component: AuthAzureProdotti,
            },
            {
                path: "auth/azure",
                Component: AuthAzure,
               
            },
            {
                path: "send",
                Component: () => <LayoutAzure sideNav={<SideNavSend />} />,
                children: [
                    { path: PathPf.LISTA_MODULICOMMESSA, Component: PagoPaListaModuliCommessa },
      
                    { path: PathPf.LISTA_DATI_FATTURAZIONE, Component: PagoPaListaDatiFatturazione },
                  
                        
                ],
            },
            {
                path: "*",
                Component: () => <Navigate to={"azureLogin"} replace />,
            },
           
        ],
    },
]);



