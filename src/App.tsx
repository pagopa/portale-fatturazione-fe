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



const App = ({ instance }) => {

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj;

    const enti = profiliEnti(mainState);
    const prodotti = mainState.prodotti;
    const profilo = mainState.profilo;

    const globalLocalStorage = localStorage.getItem('globalState') || '{}';
    const result =  JSON.parse(globalLocalStorage);


    const tabActive = useIsTabActive();


    useEffect(()=>{
        console.log('fuori if', tabActive);
        if(mainState.authenticated === true  && window.location.pathname !== '/azureLogin' && tabActive === true &&(profilo.nonce !== result.profilo.nonce)){
            console.log('dentro active');
            window.location.href = redirect;
        }
    },[tabActive]);

   
    // eslint-disable-next-line no-undef
    /*
    console.log(mainState,'pippo');
    if(!mainState.profilo.jwt && mainState.prodotti.length === 0){
        // eslint-disable-next-line no-undef
        const getGlobalFromStorage = localStorage.getItem('globalState')||'{}';
        const result =  JSON.parse(getGlobalFromStorage);
        handleModifyMainState(result);
    }

    
    useEffect(()=>{
        if(!mainState.profilo.jwt){
            console.log('ecco');
            // eslint-disable-next-line no-undef
            const getGlobalFromStorage = localStorage.getItem('globalState')||'{}';
            const result =  JSON.parse(getGlobalFromStorage);
            handleModifyMainState(result);
        }

    },[mainState.profilo.jwt]);
*/
    const recOrConsIsLogged = profilo?.profilo === 'REC' || profilo.profilo ==='CON';
    let route;

    if(prodotti.length > 0 && mainState.authenticated === true && !profilo.auth){
        console.log(1);
        route = <Router>
            <ThemeProvider theme={theme}>
                <div className="App" >
                    <HeaderPostLogin />
                    <Routes>
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/auth/azure" element={<AuthAzure  />} />
                        <Route path="/selezionaprodotto" element={<AuthAzureProdotti />} />
                        <Route path="/azureLogin" element={<AzureLogin />} />
                    </Routes>
                    <FooterComponent />
                </div>
            </ThemeProvider>
        </Router>;
    }else if(profilo.prodotto === 'prod-pagopa' && prodotti.length > 0){
        console.log(2);
        route = <Router>
            <ThemeProvider theme={theme}>
                <div className="App">
                    <BasicAlerts></BasicAlerts>
                    <HeaderPostLogin   />
                    <HeaderNavComponent   />
                    <Grid sx={{ height: '100%' }} container spacing={2} columns={12}>
                        <Grid item xs={2}>
                            <SideNavPagopa/>
                        </Grid> 
                        <Grid item xs={10} sx={{minHeight:'600px'}}>
                            <Routes>
                                <Route path={'/messaggi'} element={<Messaggi  />} />
                                <Route path={PathPf.ANAGRAFICAPSP} element={<AnagraficaPsp ></AnagraficaPsp>}/>
                                <Route path={PathPf.DOCUMENTICONTABILI} element={<DocumentiContabili ></DocumentiContabili>}/>
                                <Route path="/azureLogin" element={<AzureLogin/>} />
                                <Route path="/auth/azure" element={<AuthAzure  />} />
                                <Route path="azure" element={<Azure />} />
                                <Route path="/auth" element={<Auth  />} />
                                <Route path={PathPf.DETTAGLIO_DOC_CONTABILE} element={<DettaglioDocContabile></DettaglioDocContabile>}/>
                                <Route path="*" element={<Navigate to={PathPf.ANAGRAFICAPSP} replace />} />
                            </Routes>
                        </Grid>
                    </Grid>
                    <FooterComponent  />
                </div>
            </ThemeProvider>
        </Router>;
    }else if(profilo.prodotto === 'prod-pn' && prodotti.length > 0){
        console.log(3,'dentro', mainState);
        route = <Router>
            <ThemeProvider theme={theme}>
                <div className="App" >
                    <BasicAlerts></BasicAlerts>
                    <HeaderPostLogin  />
                    <HeaderNavComponent    />
                    <Grid sx={{ height: '100%' }} container spacing={2} columns={12}>
                        <Grid item xs={2}>
                            <SideNavComponent />
                        </Grid> 
                        <Grid item xs={10}>
                            <Routes>
                                <Route path="/auth" element={<Auth  />} />
                                <Route path="/auth/azure" element={<AuthAzure  />} />                 
                                <Route path="azure" element={<Azure />} />
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
                                <Route path="*" element={<Navigate to={PathPf.LISTA_DATI_FATTURAZIONE} replace />} />
                                <Route path="/azureLogin" element={<AzureLogin />} />
                                <Route path="/error"  element={<ErrorPage />} />
                            </Routes>
                        </Grid>
                    </Grid>
                    <FooterComponent  />
                </div>
            </ThemeProvider>
        </Router>;

    }else if(profilo.jwt && enti){
        console.log(4);
        route = <Router>
            <ThemeProvider theme={theme}>
                <div className="App">
                    <BasicAlerts></BasicAlerts>
                    <HeaderPostLogin  />
                    <HeaderNavComponent   />
                    <Grid sx={{ height: '100%' }} container spacing={2} columns={12}>
                        <Grid item xs={2}>
                            <SideNavComponent/>
                        </Grid> 
                        <Grid item xs={10}>
                            <Routes>
                                <Route path="/auth" element={<Auth  />} />
                                <Route path="/auth/azure" element={<AuthAzure  />} />
                                <Route path="azure" element={<Azure />} />
                                <Route path={PathPf.DATI_FATTURAZIONE} element={<AreaPersonaleUtenteEnte ></AreaPersonaleUtenteEnte>}/>                                     
                                <Route path={PathPf.LISTA_COMMESSE} element={<ModuloCommessaElencoUtPa  />} />           
                                <Route path={PathPf.MODULOCOMMESSA} element={<ModuloCommessaInserimentoUtEn30 />} />                 
                                <Route path={PathPf.PDF_COMMESSA} element={<ModuloCommessaPdf  />} />
                                <Route path={PathPf.LISTA_REL} element={<RelPage  />} />
                                <Route path={PathPf.PDF_REL} element={<RelPdfPage  />} />                           
                                <Route path={PathPf.LISTA_NOTIFICHE} element={<ReportDettaglio/>} />
                                <Route path="*" element={<Navigate to={PathPf.DATI_FATTURAZIONE} replace />} />
                                <Route path="/azureLogin" element={<AzureLogin />} />
                                <Route path="/error"  element={<ErrorPage />} />
                            </Routes>
                        </Grid>
                    </Grid>
                    <FooterComponent  />
                </div>
            </ThemeProvider>
        </Router>;

    }else if(profilo.jwt && recOrConsIsLogged){
        console.log(5);
        route = <Router>
            <ThemeProvider theme={theme}>
                <div className="App">
                    <BasicAlerts  ></BasicAlerts>
                    <HeaderPostLogin />
                    <HeaderNavComponent />
                    <Grid sx={{ height: '100%' }} container spacing={2} columns={12}>            
                        <Grid item xs={2}>
                            <SideNavComponent/>
                        </Grid> 
                        <Grid item xs={10}>
                            <Routes>                    
                                <Route path="/auth" element={<Auth />} />                        
                                <Route path="/auth/azure" element={<AuthAzure  />} />
                                <Route path="azure" element={<Azure />} />     
                                <Route path={PathPf.LISTA_NOTIFICHE} element={<ReportDettaglio />} />
                                <Route path="*" element={<Navigate to={PathPf.LISTA_NOTIFICHE} replace />} />
                                <Route path="/azureLogin" element={<AzureLogin />} />
                                <Route path="/error"  element={<ErrorPage/>} />
                            </Routes>
                        </Grid>
                    </Grid>
                    <FooterComponent  />
                </div>
            </ThemeProvider>
        </Router>;
    }else if(mainState.authenticated === false){
        console.log(6);
        route = <Router>
            <ThemeProvider theme={theme}>
                <div className="App">
                    <HeaderPostLogin />
                    <HeaderNavComponent  />
                    <Routes>
                        <Route path="/auth" element={<Auth  />} />
                        <Route path="/auth/azure" element={<AuthAzure  />} />
                        <Route path="azure" element={<Azure />} />
                        <Route path="*" element={<Navigate to={"/azureLogin"} replace />} />
                        <Route path="/azureLogin" element={<AzureLogin/>} />
                    </Routes>
                    <FooterComponent  />
                </div>
            </ThemeProvider>
        </Router>;
    }else if(!profilo.jwt){
        console.log(7);
        route = <Router>
            <ThemeProvider theme={theme}>
                <div className="App">
                </div>
            </ThemeProvider>
        </Router>;
    }
  
    return (
        <MsalProvider instance={instance}>
            {route}
        </MsalProvider>
    );
};

export default App;
