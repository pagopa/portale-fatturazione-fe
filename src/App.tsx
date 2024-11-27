import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {useState, useReducer, useEffect, useContext} from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import { ThemeProvider, Grid} from '@mui/material';
import {theme} from '@pagopa/mui-italia';
import AreaPersonaleUtenteEnte from './page/areaPersonaleUtenteEnte';
import ModuloCommessaElencoUtPa from './page/moduloCommessaElencoUtPa';
import ModuloCommessaInserimentoUtEn30 from './page/moduloCommessaInserimentoUtEn30';
import ModuloCommessaPdf from './page/moduloCommessaPdf';
import Auth from './page/auth';
import HeaderPostLogin from './components/reusableComponents/headerPostLogin';
import SideNavComponent from './components/reusableComponents/sideNav';
import FooterComponent from './components/reusableComponents/footer';
import ErrorPage from './page/error';
import HeaderNavComponent from './components/reusableComponents/headerNav';
import AzureLogin from './page/azureLogin';
import PagoPaListaDatiFatturazione from './page/pagoPaListaDatiFatturazione';
import PagoPaListaModuliCommessa from './page/pagoPaListaModuliCommessa';
import ReportDettaglio from './page/reportDettaglioUtPa';
import AuthAzure from './page/authAzure';
import { MsalProvider} from '@azure/msal-react';
import Azure from './page/azure';
import RelPage from './page/relUtPa';
import { profiliEnti } from './reusableFunction/actionLocalStorage';
import BasicAlerts from './components/reusableComponents/modals/alert';
import AdesioneBando from './page/adesioneBando';
import { PathPf } from './types/enum';
import RelPdfPage from './page/relPdfUtPa';
import Fatturazione from './page/fatturazione';
import Accertamenti from './page/accertamenti';
import Messaggi from './page/messaggi';
import AuthAzureProdotti from './page/authAzureProdotti';
import SideNavPagopa from './components/sideNavs/sideNavPagoPA';
import AnagraficaPsp from './page/prod_pagopa/anagraficaPspPagopa';
import DocumentiContabili from './page/prod_pagopa/documentiContabiliPagopa';
import { GlobalContext } from './store/context/globalContext';
import useIsTabActive from './reusableFunction/tabIsActiv';
import { redirect } from './api/api';
import DettaglioDocContabile from './page/prod_pagopa/dettaglioDocumentoContabile';
import BundleError from './components/reusableComponents/bundleError';
import EnteRoute from './router/enteRoute';
import PagoPaRoute from './router/pagoPaRoute';
import ProdPnRoute from './router/prodPnRoute';
import SelectProdotti from './router/selectProdotti';
import RecConRoute from './router/recapitistaConsolidatoreRoute';



const App = ({ instance }) => {

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj;

    const enti = profiliEnti(mainState);
    const prodotti = mainState?.prodotti;
    const profilo = mainState?.profilo;

    const globalLocalStorage = localStorage.getItem('globalState') || '{}';
    const result =  JSON.parse(globalLocalStorage);


    const tabActive = useIsTabActive();


    useEffect(()=>{
        if(mainState.authenticated === true  && window.location.pathname !== '/azureLogin' && tabActive === true &&(profilo.nonce !== result.profilo.nonce)){
            window.location.href = redirect;
        }
    },[tabActive]);

  
  
    return (
        <MsalProvider instance={instance}>
            <Router>
                <ThemeProvider theme={theme}>
                    <div className="App">
                        <BasicAlerts></BasicAlerts>
                        <HeaderPostLogin/>
                        <HeaderNavComponent/>
                        <Routes>
                            <Route path="/auth" element={<Auth/>} />
                            <Route path="/auth/azure" element={<AuthAzure/>} />
                            <Route path="azure" element={<Azure/>} />
                            <Route path="/azureLogin" element={<AzureLogin/>} />
                            <Route path="/error"  element={<ErrorPage/>} />
                            {/*PROD-PN ROUTES START */}
                         
                            <Route path="x"  element={<ProdPnRoute></ProdPnRoute>}></Route>
                            {/*PROD-PN ROUTES END*/}
                            <Route element={<SelectProdotti/>}>
                                <Route path="/selezionaprodotto" element={<AuthAzureProdotti />} />
                            </Route>
                        </Routes>
                        <FooterComponent  />
                    </div>
                </ThemeProvider>
            </Router>;
        </MsalProvider>
    );
};

export default App;
