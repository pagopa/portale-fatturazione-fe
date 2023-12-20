import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import AuthAzure from './page/authAzure';
import { MsalProvider, AuthenticatedTemplate, useMsal, UnauthenticatedTemplate } from '@azure/msal-react';
import { Container, Button } from 'react-bootstrap';
import { loginRequest } from './authConfig';
import './App.css';





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

 
    const [checkProfilo,setCheckProfilo] = useState(false);
    // set status page abilita e disabilita le modifiche al componente dati fatturazione
   
    const [infoModuloCommessa, setInfoModuloCommessa] = useState({
        mese:'',
        anno:'',
        modifica:undefined, // se la commessa selezionata è modificabile
        userClickOn:undefined, // se l'utente clicca su un elemento di lista commesse setto GRID
        inserisciModificaCommessa:undefined, // INSERT MODIFY  se il sevizio get commessa mi restituisce true []
        action:'DATI_FATTURAZIONE', // le action possono essere HIDE_MODULO_COMMESSA / SHOW_MODULO_COMMESSA / DATI_FATTURAZIOne
        statusPageDatiFatturazione:'immutable',
        statusPageInserimentoCommessa:'immutable',
        path:'/',
        nonce:'',
        indexStepper:0 // in che pat sono al momento del reload?
    });



    return (
        <MsalProvider instance={instance}>
       
   

            <Router>
            
                <Routes>
                    <Route path="/auth" element={<Auth setCheckProfilo={setCheckProfilo} setInfoModuloCommessa={setInfoModuloCommessa}/>} />
                </Routes>

               

                
           
                <ThemeProvider theme={theme}>
                    <div className="App">
                   
                        <HeaderPostLogin />
                   
                        <div>
                            <HeaderNavComponent />

                            <Grid sx={{ height: '100%' }} container spacing={2} columns={12}>
                                <Grid  item xs={2}>
                                    <SideNavComponent  setInfoModuloCommessa={setInfoModuloCommessa}
                                        infoModuloCommessa={infoModuloCommessa}/>
                                </Grid>
                            

                                <Grid item xs={10}>
                                    <Routes>
                                        <Route path="/" element={<AreaPersonaleUtenteEnte
                                            infoModuloCommessa={infoModuloCommessa}
                                            setInfoModuloCommessa={setInfoModuloCommessa}
                                        />} />
                                    </Routes>
                                    <Routes>
                                        <Route path="/4" element={<ModuloCommessaElencoUtPa infoModuloCommessa={infoModuloCommessa} setInfoModuloCommessa={setInfoModuloCommessa} />} />
                                    </Routes>
                                    <Routes>
                                        <Route path="/8" element={<ModuloCommessaInserimentoUtEn30 infoModuloCommessa={infoModuloCommessa} setInfoModuloCommessa={setInfoModuloCommessa} />} />
                                    </Routes>
                                    <Routes>
                                        <Route path="/pdf" element={<ModuloCommessaPdf infoModuloCommessa={infoModuloCommessa} />} />
                                    </Routes>
                                    <Routes>
                                        <Route path="/pagopalistadatifatturazione" element={<PagoPaListaDatiFatturazione />} />
                                    </Routes>

                                    <Routes>
                                        <Route path="/auth/azure" element={<AuthAzure />} />
                                    </Routes>
                                    
                           
                                </Grid>

                            </Grid>
                        </div>
                
                        <Routes>
                            <Route path="/error" element={<ErrorPage />} />
                        </Routes>
                        <Routes>
                            <Route path="/azureLogin" element={<AzureLogin />} />
                        </Routes>
                        <FooterPostLogin />
                    </div>
                </ThemeProvider>
              
            </Router>
        </MsalProvider>

    );
};

export default App;
