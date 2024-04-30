import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {useState, useReducer, useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
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
import { getAuthProfilo, redirect } from './api/api';
import { getProfilo } from './reusableFunctin/actionLocalStorage';
import useIsTabActive from './reusableFunctin/tabIsActiv';

enum PathPf {
    DATI_FATTURAZIONE = '/datidifatturazione', //
    LISTA_DATI_FATTURAZIONE = '/listadatifatturazione',//listadatidifatturazione
    MODULOCOMMESSA = '/modulocommessa', //8
    LISTA_MODULICOMMESSA = '/listamodulicommessa',
    LISTA_COMMESSE = '/modulicommessa',  //4
    PDF_COMMESSA = '/pdfmodulocommessa',//pdf
    LISTA_NOTIFICHE = '/listanotifiche',
    LISTA_REL = '/listarel',
    PDF_REL = '/relpdf'
}

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
    // eslint-disable-next-line no-undef
    const profilo =  getProfilo();
    const tabActive = useIsTabActive();

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
 
    const [checkProfilo,setCheckProfilo] = useState(false);
    // set status page abilita e disabilita le modifiche al componente dati fatturazione
    
    const [mainState, dispatchMainState] = useReducer(reducerMainState, {
        mese:'',
        anno:'',
        nonce:'',
        datiFatturazione:false,// l'ente ha i dati di fatturazione?
        userClickOn:undefined, // se l'utente clicca su un elemento di lista commesse setto GRID
        inserisciModificaCommessa:undefined, // INSERT MODIFY  se il sevizio get commessa mi restituisce true []
        primoInserimetoCommessa:true,// la commessa mese corrente è stata inserita?
        statusPageDatiFatturazione:'immutable',
        statusPageInserimentoCommessa:'immutable',
        relSelected: null,
        apiError:'',
        authenticated:false 
    });
    console.log(mainState);
    // questa chiamata viene eseguita esclusivamente se l'utenete fa un reload page cosi da inserire nuovamente il NONCE nel DOM
    const getProfiloToGetNonce = async () =>{
    
        await getAuthProfilo(profilo.jwt)
            .then((res) =>{
                handleModifyMainState({nonce:res?.data.nonce,authenticated:true});
            }).catch((err)=>{
                window.location.href = redirect;
                //navigate('/error');
            });
    };
    // eseguiamo la get a riga 21 solo se il value dell'input(nonce) nel Dom è non c'è e controlliamo che nella local storage sia settatto il profilo
    // Object.values(profilo).length !== 0 viene fatto solo per far si che la chiamanta non venga fatta al primo rendering
    // in quel caso il get profilo viene chiamato nella page auth
  
    useEffect(()=>{
        // if(mainState.nonce === '' && Object.values(profilo).length !== 0 && location.pathname !== '/auth' ){
        if(mainState.nonce === '' && Object.values(profilo).length !== 0){
            getProfiloToGetNonce();
        }
         
    },[mainState.nonce]);
    console.log(window.location.href);
    useEffect(()=>{
        if(mainState.authenticated === true && tabActive === true && (mainState.nonce !== profilo.nonce && window.location.href !== '/azureLogin' )){
            window.location.href = redirect;
        }
    },[tabActive, mainState.nonce]);
   
    const [valueAnnoElencoCom, setValueAnnoElencoCom] = useState('');
    //_____________________________________________________________

    const recOrConsIsLogged = profilo.profilo === 'REC' || profilo.profilo ==='CON';
  
    return (
      
        <MsalProvider instance={instance}>
            <Router>
                <ThemeProvider theme={theme}>
                    <div className="App">

                        <HeaderPostLogin mainState={mainState}/>

                        <div>
                            <HeaderNavComponent />

                            <Grid sx={{ height: '100%' }} container spacing={2} columns={12}>
                             
                                <Grid item xs={2}>
                                    <SideNavComponent  dispatchMainState={ dispatchMainState}
                                        mainState={mainState}
                                    />
                                </Grid> 

                                <Grid item xs={10}>
                                    <Routes>
                                        
                                        <Route path="/auth" element={<Auth setCheckProfilo={setCheckProfilo}  dispatchMainState={ dispatchMainState} />} />
                                        
                                        <Route path="/auth/azure" element={<AuthAzure  dispatchMainState={ dispatchMainState}/>} />
                                        
                                        <Route path="azure" element={<Azure dispatchMainState={ dispatchMainState}/>} />
                                        
                                        {!recOrConsIsLogged && <Route path={PathPf.DATI_FATTURAZIONE} element={<AreaPersonaleUtenteEnte
                                            mainState={mainState}
                                            dispatchMainState={ dispatchMainState} />} />
                                        }
                                   
                                        <Route path={PathPf.LISTA_COMMESSE} element={<ModuloCommessaElencoUtPa mainState={mainState}  dispatchMainState={ dispatchMainState} valueSelect={valueAnnoElencoCom}  setValueSelect={setValueAnnoElencoCom}  />} />
                                  
                                        <Route path={PathPf.MODULOCOMMESSA} element={<ModuloCommessaInserimentoUtEn30 mainState={mainState}  dispatchMainState={ dispatchMainState} />} />
                                  
                                        <Route path={PathPf.PDF_COMMESSA} element={<ModuloCommessaPdf mainState={mainState} />} />
                                  
                                        <Route path={PathPf.LISTA_DATI_FATTURAZIONE} element={<PagoPaListaDatiFatturazione mainState={mainState}  dispatchMainState={ dispatchMainState} />} />
                                    
                                        <Route path={PathPf.LISTA_MODULICOMMESSA} element={<PagoPaListaModuliCommessa mainState={mainState}  dispatchMainState={ dispatchMainState} />} />
                                   
                                        <Route path={PathPf.LISTA_NOTIFICHE} element={<ReportDettaglio mainState={mainState} />} />

                                        <Route path={PathPf.LISTA_REL} element={<RelPage  mainState={mainState}  dispatchMainState={dispatchMainState}/>} />

                                        <Route path={PathPf.PDF_REL} element={<RelPdfPage  mainState={mainState}  dispatchMainState={dispatchMainState}/>} />

                                        <Route path="*" element={<Navigate to="/error" replace />} />

                                        <Route path="/azureLogin" element={<AzureLogin dispatchMainState={dispatchMainState}/>} />

                                        <Route path="/error"  element={<ErrorPage dispatchMainState={ dispatchMainState}  mainState={mainState}/>} />
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
