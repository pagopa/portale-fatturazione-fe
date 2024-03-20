import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {useState, useReducer} from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, Grid } from '@mui/material';
import {theme} from '@pagopa/mui-italia';
import AreaPersonaleUtenteEnte from './page/areaPersonaleUtenteEnte';
import ModuloCommessaElencoUtPa from './page/moduloCommessaElencoUtPa';
import ModuloCommessaInserimentoUtEn30 from './page/moduloCommessaInserimentoUtEn30';
import ModuloCommessaPdf from './page/moduloCommessaPdf';
import Auth from './page/auth';
import HeaderPostLogin from './components/reusableComponents/headerPostLogin';
import SideNavComponent from './components/reusableComponents/sideNav';
import FooterPostLogin from './components/reusableComponents/footerPostLogin';
import ErrorPage from './page/error';
import HeaderNavComponent from './components/reusableComponents/headerNav';
import AzureLogin from './page/azureLogin';
import PagoPaListaDatiFatturazione from './page/pagoPaListaDatiFatturazione';
import PagoPaListaModuliCommessa from './page/pagoPaListaModuliCommessa';
import ReportDettaglio from './page/reportDettaglioUtPa';
import AuthAzure from './page/authAzure';
import RelPdfPage from './page/relPdfUtPa';
import { MsalProvider, AuthenticatedTemplate, useMsal, UnauthenticatedTemplate } from '@azure/msal-react';
import Azure from './page/azure';
import { Container, Button } from 'react-bootstrap';
import { loginRequest } from './authConfig';
import './App.css';
import RelPage from './page/relUtPa';
import { reducerMainState } from './reducer/reducerMainState';


const MainContent = () => {
    /**
     * useMsal is hook that returns the PublicClientApplication instance,
     * that tells you what msal is currently doing. For more, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
     */
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();

    const handleRedirect = () => {
        instance
            .loginRedirect({
                ...loginRequest,
                prompt: 'create',
            })
            .catch((error) => console.log(error));
    };
    return (
        <div className="App">
            <AuthenticatedTemplate>
                {activeAccount ? (
                    <Container>
                        {/*<IdTokenData idTokenClaims={activeAccount.idTokenClaims} /> */} 
                    </Container>
                ) : null}
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <Button className="signInButton" onClick={handleRedirect} variant="primary">
                    Sign up
                </Button>
            </UnauthenticatedTemplate>
        </div>
    );
};


const App = ({ instance }) => {

    /* const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);
*/
    const [checkProfilo,setCheckProfilo] = useState(false);
    // set status page abilita e disabilita le modifiche al componente dati fatturazione

    const [mainState, dispatchMainState] = useReducer(reducerMainState, {
        mese:'',
        anno:'',
        //modifica:undefined, // se la commessa selezionata è modificabile
        datiFatturazione:false,// l'ente ha i dati di fatturazione?
        userClickOn:undefined, // se l'utente clicca su un elemento di lista commesse setto GRID
        inserisciModificaCommessa:undefined, // INSERT MODIFY  se il sevizio get commessa mi restituisce true []
        primoInserimetoCommessa:true,
        // action:'DATI_FATTURAZIONE', // le action possono essere HIDE_MODULO_COMMESSA / SHOW_MODULO_COMMESSA / DATI_FATTURAZIOne
        statusPageDatiFatturazione:'immutable',
        statusPageInserimentoCommessa:'immutable',
        idEnte:'',// parametro valorizzato nel caso in cui AUTH sia PAGOPA e venga selezionata una row della lista dati fatturazione
        prodotto: '',// parametro valorizzato nel caso in cui AUTH sia PAGOPA e venga selezionata una row della lista dati fatturazione,
        relSelected: null // rel selezionata nella grid in page rel
    });

    console.log(mainState);
    /*
    const [mainState,  dispatchMainState] = useState({
        mese:'',
        anno:'',
        modifica:undefined, // se la commessa selezionata è modificabile
        userClickOn:undefined, // se l'utente clicca su un elemento di lista commesse setto GRID
        inserisciModificaCommessa:undefined, // INSERT MODIFY  se il sevizio get commessa mi restituisce true []
        action:'DATI_FATTURAZIONE', // le action possono essere HIDE_MODULO_COMMESSA / SHOW_MODULO_COMMESSA / DATI_FATTURAZIOne
        statusPageDatiFatturazione:'immutable',
        statusPageInserimentoCommessa:'immutable',
        indexStepper:0, // index del componente setpper
        idEnte:'',// parametro valorizzato nel caso in cui AUTH sia PAGOPA e venga selezionata una row della lista dati fatturazione
        prodotto: '',// parametro valorizzato nel caso in cui AUTH sia PAGOPA e venga selezionata una row della lista dati fatturazione,
        relSelected: null // rel selezionata nella grid in page rel
    });
   
    let redirectOnWrongURL = '/';

    if(profilo.auth === 'PAGOPA'){
        redirectOnWrongURL = '/pagopalistadatifatturazione';
    }
 
*/
  

    return (

      
        <MsalProvider instance={instance}>
            <Router>
                <ThemeProvider theme={theme}>
                    <div className="App">

                        <HeaderPostLogin />

                        <div>
                            <HeaderNavComponent />

                            <Grid sx={{ height: '100%' }} container spacing={2} columns={12}>
                             
                                <Grid item xs={2}>
                                    <SideNavComponent  dispatchMainState={ dispatchMainState}
                                        mainState={mainState} />
                                </Grid> 
                               


                                <Grid item xs={10}>
                                    <Routes>
                                        
                                        <Route path="/auth" element={<Auth setCheckProfilo={setCheckProfilo}  dispatchMainState={ dispatchMainState} />} />
                                        
                                        <Route path="/auth/azure" element={<AuthAzure  dispatchMainState={ dispatchMainState}/>} />
                                        
                                        <Route path="azure" element={<Azure />} />
                                        
                                        <Route path="/" element={<AreaPersonaleUtenteEnte
                                            mainState={mainState}
                                            dispatchMainState={ dispatchMainState} />} />
                                   
                                        <Route path="/4" element={<ModuloCommessaElencoUtPa mainState={mainState}  dispatchMainState={ dispatchMainState} />} />
                                  
                                        <Route path="/8" element={<ModuloCommessaInserimentoUtEn30 mainState={mainState}  dispatchMainState={ dispatchMainState} />} />
                                  
                                        <Route path="/pdf" element={<ModuloCommessaPdf mainState={mainState} />} />
                                  
                                        <Route path="/pagopalistadatifatturazione" element={<PagoPaListaDatiFatturazione mainState={mainState}  dispatchMainState={ dispatchMainState} />} />
                                    
                                        <Route path="/pagopalistamodulicommessa" element={<PagoPaListaModuliCommessa mainState={mainState}  dispatchMainState={ dispatchMainState} />} />
                                   
                                        <Route path="/notifiche" element={<ReportDettaglio mainState={mainState} />} />

                                        <Route path="/rel" element={<RelPage  mainState={mainState}  dispatchMainState={dispatchMainState} />} />

                                        <Route path="/relpdf" element={<RelPdfPage  mainState={mainState}  dispatchMainState={dispatchMainState}/>} />

                                        <Route path="*" element={<Navigate to="/error" replace />} />

                                        <Route path="/azureLogin" element={<AzureLogin />} />
                                        <Route path="/error" element={<ErrorPage />} />
                                    </Routes>





                                </Grid>

                            </Grid>
                        </div>

                        <FooterPostLogin />
                    </div>
                </ThemeProvider>

            </Router>
        </MsalProvider>

    );
};

export default App;
