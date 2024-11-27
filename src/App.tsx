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
import { main } from '@popperjs/core';
import Layout from './components/reusableComponents/layOutLoggedIn';



const App = ({ instance }) => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const profilo = mainState?.profilo;

    const globalLocalStorage = localStorage.getItem('globalState') || '{}';
    const result =  JSON.parse(globalLocalStorage);

    const getRedirectPath = () => {
        if (!mainState.authenticated) {
            return "/azureLogin"; // Redirect to login if not authenticated
        }
        
        if(profilo?.prodotto === 'prod-pn' &&  profilo.auth === 'PAGOPA'){
            return PathPf.LISTA_DATI_FATTURAZIONE;
        }else if(profilo?.prodotto === 'prod-pagopa' &&  profilo.auth === 'PAGOPA'){
            return PathPf.ANAGRAFICAPSP;
        }else if( profilo.auth === "SELFCARE" && profiliEnti(mainState)){
            return PathPf.DATI_FATTURAZIONE;
        }else if(profilo.auth === "SELFCARE" && (profilo.profilo === 'REC'|| profilo.profilo === 'CON')){
            return PathPf.LISTA_NOTIFICHE;
        }else{
            return '/';
        }
       
    };


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
                            <Route path="/azure" element={<Azure/>} />
                            <Route path="/azureLogin" element={<AzureLogin/>} />
                            <Route path="/error"  element={<ErrorPage/>} />
                            <Route path="*" element={<Navigate  to={getRedirectPath()} replace />} />
                            <Route element={<SelectProdotti/>}>
                                <Route path="/selezionaprodotto" element={<AuthAzureProdotti />} />
                            </Route>
                            {/*------ route PROD-Pagopa start*/}
                            <Route element={<PagoPaRoute/>}>
                                <Route element={<Layout sideNav={<SideNavPagopa/>}></Layout>}>
                                    <Route path={'/messaggi'} element={<Messaggi  />} />
                                    <Route path={PathPf.ANAGRAFICAPSP} element={<AnagraficaPsp ></AnagraficaPsp>}/>
                                    <Route path={PathPf.DOCUMENTICONTABILI} element={<DocumentiContabili ></DocumentiContabili>}/>
                                    <Route path={PathPf.DETTAGLIO_DOC_CONTABILE} element={<DettaglioDocContabile></DettaglioDocContabile>}/> 
                                </Route>
                            </Route>
                            {/*------ route PROD-Pagopa end*/}
                            {/*------ route PROD-PN start */}
                            <Route element={<ProdPnRoute/>}>
                                <Route element={<Layout sideNav={<SideNavComponent />}></Layout>}>
                                    <Route path={PathPf.DATI_FATTURAZIONE} element={<AreaPersonaleUtenteEnte />} />
                                    <Route path={PathPf.LISTA_MODULICOMMESSA} element={<PagoPaListaModuliCommessa/>}/>
                                    <Route path={PathPf.MODULOCOMMESSA} element={<ModuloCommessaInserimentoUtEn30/>} />
                                    <Route path={PathPf.PDF_COMMESSA} element={<ModuloCommessaPdf/>} />
                                    <Route path={PathPf.LISTA_DATI_FATTURAZIONE} element={<PagoPaListaDatiFatturazione/>} />
                                    <Route path={PathPf.LISTA_REL} element={<RelPage />} />
                                    <Route path={PathPf.PDF_REL} element={<RelPdfPage/>} />
                                    <Route path={PathPf.ADESIONE_BANDO} element={<AdesioneBando/>} />
                                    <Route path={PathPf.FATTURAZIONE} element={<Fatturazione/>} />
                                    <Route path={PathPf.LISTA_NOTIFICHE} element={<ReportDettaglio />} />
                                    <Route path={'/messaggi'} element={<Messaggi />} />
                                    <Route path={'/accertamenti'} element={<Accertamenti/>} />
                                </Route>
                            </Route>
                            {/*------ route PROD-PN end*/}
                           
                            {/*------ route ENTE start*/}
                            <Route element={<EnteRoute/>}>
                                <Route element={<Layout sideNav={<SideNavComponent/>}></Layout>}>
                                    <Route path={PathPf.DATI_FATTURAZIONE} element={<AreaPersonaleUtenteEnte ></AreaPersonaleUtenteEnte>}/>                                     
                                    <Route path={PathPf.LISTA_COMMESSE} element={<ModuloCommessaElencoUtPa  />} />           
                                    <Route path={PathPf.MODULOCOMMESSA} element={<ModuloCommessaInserimentoUtEn30 />} />                 
                                    <Route path={PathPf.PDF_COMMESSA} element={<ModuloCommessaPdf  />} />
                                    <Route path={PathPf.LISTA_REL} element={<RelPage  />} />
                                    <Route path={PathPf.PDF_REL} element={<RelPdfPage  />} />                           
                                    <Route path={PathPf.LISTA_NOTIFICHE} element={<ReportDettaglio/>} />
                                </Route>
                            </Route>
                            {/*------ route ENTE end*/}
                            {/*------ route RECAPITISTA CONSOLIDATORE start*/}
                            <Route element={<RecConRoute/>}>
                                <Route element={<Layout sideNav={<SideNavComponent/>}></Layout>}>
                                    <Route path={PathPf.LISTA_NOTIFICHE} element={<ReportDettaglio />} />
                                </Route>
                            </Route>
                            {/*------ route RECAPITISTA CONSOLIDATORE end*/}
                        </Routes>
                        <FooterComponent  />
                    </div>
                </ThemeProvider>
            </Router>;
        </MsalProvider>
    );
};

export default App;
