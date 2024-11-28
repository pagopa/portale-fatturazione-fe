import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {useEffect, useContext} from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import { ThemeProvider} from '@mui/material';
import {theme} from '@pagopa/mui-italia';
import Auth from './page/auth';
import HeaderPostLogin from './components/reusableComponents/headerPostLogin';
import FooterComponent from './components/reusableComponents/footer';
import ErrorPage from './page/error';
import HeaderNavComponent from './components/reusableComponents/headerNav';
import AzureLogin from './page/azureLogin';
import AuthAzure from './page/authAzure';
import { MsalProvider} from '@azure/msal-react';
import Azure from './page/azure';
import { profiliEnti } from './reusableFunction/actionLocalStorage';
import BasicAlerts from './components/reusableComponents/modals/alert';
import { PathPf } from './types/enum';
import { GlobalContext } from './store/context/globalContext';
import useIsTabActive from './reusableFunction/tabIsActiv';
import { redirect } from './api/api';
import RouteProfile from './router/route';




const App = ({ instance }) => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const profilo = mainState?.profilo;

    const globalLocalStorage = localStorage.getItem('globalState') || '{}';
    const result =  JSON.parse(globalLocalStorage);

    const getRedirectPath = () => {
        if (!mainState.authenticated) {
            return "/azureLogin"; // Redirect to login if not authenticated
        }else if(profilo?.prodotto === 'prod-pn' &&  profilo.auth === 'PAGOPA'){
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

  
    const route = RouteProfile();
  
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
                            {route}
                        </Routes>
                        <FooterComponent  />
                    </div>
                </ThemeProvider>
            </Router>;
        </MsalProvider>
    );
};

export default App;
