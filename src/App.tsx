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
import { BodyRel } from './types/typeRel';



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

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    const profiloValue = profilo.profilo;
    

    const [checkProfilo,setCheckProfilo] = useState(false);
    // set status page abilita e disabilita le modifiche al componente dati fatturazione
    
    const [mainState, dispatchMainState] = useReducer(reducerMainState, {
        mese:'',
        anno:'',
        nonce:'',
        //nomeEnteClickOn:'',  // lato pagopa sul click della grid lista ModuloCommessa/dati fatturazione vado a soricizzare il nome da mostrare nel dettaglio
        //modifica:undefined, // se la commessa selezionata è modificabile
        datiFatturazione:false,// l'ente ha i dati di fatturazione?
        userClickOn:undefined, // se l'utente clicca su un elemento di lista commesse setto GRID
        inserisciModificaCommessa:undefined, // INSERT MODIFY  se il sevizio get commessa mi restituisce true []
        primoInserimetoCommessa:true,// la commessa mese corrente è stata inserita?
        // action:'DATI_FATTURAZIONE', // le action possono essere HIDE_MODULO_COMMESSA / SHOW_MODULO_COMMESSA / DATI_FATTURAZIOne
        statusPageDatiFatturazione:'immutable',
        statusPageInserimentoCommessa:'immutable',
        // idEnte:'',// parametro valorizzato nel caso in cui AUTH sia PAGOPA e venga selezionata una row della lista dati fatturazione
        // prodotto: '',// parametro valorizzato nel caso in cui AUTH sia PAGOPA e venga selezionata una row della lista dati fatturazione,
        relSelected: null,
        apiError:'' // rel selezionata nella grid in page rel
    });

    //_______________rel __________________
    const currentYear = (new Date()).getFullYear();
    const currentMonth = (new Date()).getMonth() + 1;
    const month = Number(currentMonth);

    const [bodyRel, setBodyRel] = useState<BodyRel>({
        anno:currentYear,
        mese:month,
        tipologiaFattura:null,
        idEnti:[],
        idContratto:null,
        caricata:null
    });
    const [pageGridRel, setPageGridRel] = useState(0);
    const [rowsPerPageGridRel, setRowsPerPageGridRel] = useState(10);
    //_____________________________

    //___________elenco commessa anno selfcare
    const [valueAnnoElencoCom, setValueAnnoElencoCom] = useState('');
    //_____________________________________________________________

    //________ lista dati fatturazione pagopa
    const [filterListaFatturazione, setFilterListaFatturazione] = useState({descrizione:'',prodotto:'',profilo:''});
    const [infoPageListaDatiFat , setInfoPageListaDatiFat] = useState({ page: 0, pageSize: 100 });
    //______________________________________________
    //________ lista dati commessa

    let currString;
    //creo un array di oggetti con tutti i mesi 

    if((new Date()).getMonth() === 11){
        currString = '1';
    }else{
        const currentMonth = (new Date()).getMonth() + 2;
        currString = currentMonth.toString();
    }
    const [filterListaCommesse, setFilterListaCommesse] = useState({descrizione:'',prodotto:'', anno:currentYear, mese:currString});
    const [infoPageListaCom , setInfoPageListaCom] = useState({ page: 0, pageSize: 100 });
    //__________________

    const recOrConsIsLogged = profilo.profilo === 'REC' || profilo.profilo ==='CON';

  
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
                                        mainState={mainState}
                                        setFilterListaFatturazione={setFilterListaFatturazione}
                                        setFilterListaCommesse={setFilterListaCommesse}
                                        setInfoPageListaDatiFat={setInfoPageListaDatiFat}
                                        setInfoPageListaCom={setInfoPageListaCom}
                                    />
                                </Grid> 
                               


                                <Grid item xs={10}>
                                    <Routes>
                                        
                                        <Route path="/auth" element={<Auth setCheckProfilo={setCheckProfilo}  dispatchMainState={ dispatchMainState} />} />
                                        
                                        <Route path="/auth/azure" element={<AuthAzure  dispatchMainState={ dispatchMainState}/>} />
                                        
                                        <Route path="azure" element={<Azure />} />
                                        
                                        {!recOrConsIsLogged && <Route path={PathPf.DATI_FATTURAZIONE} element={<AreaPersonaleUtenteEnte
                                            mainState={mainState}
                                            dispatchMainState={ dispatchMainState} />} />
                                        }
                                   
                                        <Route path={PathPf.LISTA_COMMESSE} element={<ModuloCommessaElencoUtPa mainState={mainState}  dispatchMainState={ dispatchMainState} valueSelect={valueAnnoElencoCom}  setValueSelect={setValueAnnoElencoCom}  />} />
                                  
                                        <Route path={PathPf.MODULOCOMMESSA} element={<ModuloCommessaInserimentoUtEn30 mainState={mainState}  dispatchMainState={ dispatchMainState} />} />
                                  
                                        <Route path={PathPf.PDF_COMMESSA} element={<ModuloCommessaPdf mainState={mainState} />} />
                                  
                                        <Route path={PathPf.LISTA_DATI_FATTURAZIONE} element={<PagoPaListaDatiFatturazione mainState={mainState}  dispatchMainState={ dispatchMainState} setBodyGetLista={setFilterListaFatturazione} bodyGetLista={filterListaFatturazione} infoPageListaDatiFat={infoPageListaDatiFat}  setInfoPageListaDatiFat={setInfoPageListaDatiFat}/>} />
                                    
                                        <Route path={PathPf.LISTA_MODULICOMMESSA} element={<PagoPaListaModuliCommessa mainState={mainState}  dispatchMainState={ dispatchMainState} setBodyGetLista={setFilterListaCommesse} bodyGetLista={filterListaCommesse} infoPageListaCom={infoPageListaCom}  setInfoPageListaCom={setInfoPageListaCom}/>} />
                                   
                                        <Route path={PathPf.LISTA_NOTIFICHE} element={<ReportDettaglio mainState={mainState} />} />

                                        <Route path={PathPf.LISTA_REL} element={<RelPage  mainState={mainState}  dispatchMainState={dispatchMainState}  bodyRel={bodyRel} setBodyRel={setBodyRel} page={pageGridRel} setPage={setPageGridRel} rowsPerPage={rowsPerPageGridRel} setRowsPerPage={setRowsPerPageGridRel} />} />

                                        <Route path={PathPf.PDF_REL} element={<RelPdfPage  mainState={mainState}  dispatchMainState={dispatchMainState}/>} />

                                        <Route path="*" element={<Navigate to="/error" replace />} />

                                        <Route path="/azureLogin" element={<AzureLogin />} />

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
