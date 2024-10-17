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
import { reducerMainState } from './reducer/reducerMainState';
import { getAuthProfilo, manageError, redirect } from './api/api';
import { getProdotti, getProfilo, profiliEnti } from './reusableFunction/actionLocalStorage';
import useIsTabActive from './reusableFunction/tabIsActiv';
import BasicAlerts from './components/reusableComponents/modals/alert';
import AdesioneBando from './page/adesioneBando';
import { PathPf } from './types/enum';
import RelPdfPage from './page/relPdfUtPa';
import { InfoOpen} from './types/typesGeneral';
import Fatturazione from './page/fatturazione';
import Accertamenti from './page/accertamenti';
import Messaggi from './page/messaggi';
import AuthAzureProdotti from './page/authAzureProdotti';
import SideNavPagopa from './components/sideNavs/sideNavPagoPA';
import AnagraficaPsp from './page/prod_pagopa/anagraficaPspPagopa';
import DocumentiContabili from './page/prod_pagopa/documentiContabiliPagopa';
import GlobalContextProvider, { GlobalContext } from './store/context/globalContext';




const App = ({ instance }) => {
    // eslint-disable-next-line no-undef
   
    
    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj;


    const [profilo, setProfilo] = useState<any>({});
    const [prodotti, setProdotti] = useState<any>({});

    useEffect(()=>{
        setProfilo(getProfilo());
        setProdotti(getProdotti()?.prodotti);
        console.log('dentro effect',mainState);
    },[mainState]);
   
 
   
    const [showAlert, setShowAlert] = useState(false);
    const [valueAnnoElencoCom, setValueAnnoElencoCom] = useState('');
    const [openBasicModal_DatFat_ModCom, setOpenBasicModal_DatFat_ModCom] = useState<InfoOpen>({visible:false,clickOn:''});
    // set status page abilita e disabilita le modifiche al componente dati fatturazione
 
    
    
   
   
   

    // eseguiamo la get a riga 21 solo se il value dell'input(nonce) nel Dom è non c'è e controlliamo che nella local storage sia settatto il profilo
    // Object.values(profilo).length !== 0 viene fatto solo per far si che la chiamanta non venga fatta al primo rendering
    // in quel caso il get profilo viene chiamato nella page auth
  
 
   

   

 

    console.log(prodotti,profilo);

    const recOrConsIsLogged = profilo?.profilo === 'REC' || profilo.profilo ==='CON';
    let route;

    if(prodotti?.length > 0 && !profilo.auth){
        route = <Router>
            <ThemeProvider theme={theme}>
                <div className="App" >
                    <HeaderPostLogin />
                    <div>
                        <Routes>
                            <Route path="/selezionaprodotto" element={<AuthAzureProdotti  />} />
                            <Route path="/azureLogin" element={<AzureLogin />} />
                        </Routes>
                    </div>
                    <FooterComponent />
                </div>
            </ThemeProvider>
        </Router>;

    }else if(profilo.jwt && profilo.auth === 'PAGOPA' && profilo.prodotto === 'prod-pagopa'){
        route = <Router>
            <ThemeProvider theme={theme}>
                <div className="App">
                    <BasicAlerts setVisible={setShowAlert} visible={showAlert} ></BasicAlerts>
                    <HeaderPostLogin  />
                    <div>
                        <HeaderNavComponent  />
                        <Grid sx={{ height: '100%' }} container spacing={2} columns={12}>
                            <Grid item xs={2}>
                                <SideNavPagopa/>
                            </Grid> 
                            <Grid item xs={10} sx={{minHeight:'600px'}}>
                                <Routes>
                                    <Route path={'/messaggi'} element={<Messaggi />} />
                                    <Route path={PathPf.ANAGRAFICAPSP} element={<AnagraficaPsp></AnagraficaPsp>}/>
                                    <Route path={PathPf.DOCUMENTICONTABILI} element={<DocumentiContabili ></DocumentiContabili>}/>
                                    <Route path="/azureLogin" element={<AzureLogin />} />
                                    <Route path="/auth/azure" element={<AuthAzure  />} />
                                    <Route path="azure" element={<Azure />} />
                                    <Route path="*" element={<Navigate to={PathPf.ANAGRAFICAPSP} replace />} />
                                </Routes>
                            </Grid>
                        </Grid>
                    </div>
                    <FooterComponent  />
                </div>
            </ThemeProvider>
        </Router>;
    }else if(!profilo.jwt && mainState.authenticated === false){
        route = <Router>
            <ThemeProvider theme={theme}>
                <div className="App">
                    <HeaderPostLogin/>

                    <div>
                        <HeaderNavComponent />

                        <Routes>
                            
                            <Route path="/auth" element={<Auth  />} />
                            
                            <Route path="/auth/azure" element={<AuthAzure  />} />
                            
                            <Route path="azure" element={<Azure />} />
                            
                            <Route path="*" element={<Navigate to={"/error"} replace />} />

                            <Route path="/azureLogin" element={<AzureLogin />} />

                            <Route path="/error"  element={<ErrorPage/>} />
                        </Routes>

                    </div>

                    <FooterComponent />
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
