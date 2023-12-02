import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, Grid } from '@mui/material';
import {theme} from '@pagopa/mui-italia';
import AreaPersonaleUtenteEnte from './page/areaPersonaleUtenteEnte';
import ModuloCommessaElencoUtPa from './page/moduloCommessaElencoUtPa';
import ModuloCommessaInserimentoUtEn30 from './page/moduloCommessaInserimentoUtEn30';
import Auth from './page/auth';
import HeaderPostLogin from './components/headerPostLogin';
import SideNavComponent from './components/sideNav';
import FooterPostLogin from './components/footerPostLogin';
import ErrorPage from './page/error';
//import LoginPage from './page/login';

import HeaderNavComponent from './components/headerNav';

const App : React.FC = () => {


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
        statusPageInserimentoCommessa:'immutable'
    });

    console.log({infoModuloCommessa});
  
    return (

        <Router>
            
            <Routes>
                <Route path="/auth" element={<Auth setCheckProfilo={setCheckProfilo}/>} />
            </Routes>
           
            <ThemeProvider theme={theme}>
                <div className="App">
                   
                    <HeaderPostLogin />
                   
                    <div>
                        <HeaderNavComponent />

                        <Grid sx={{ paddingBottom: '80px', height: '100%' }} container spacing={2} columns={12}>

                            <Grid sx={{ marginBottom: '-100px' }} item xs={2}>
                                <SideNavComponent  setInfoModuloCommessa={setInfoModuloCommessa}/>
                            </Grid>

                            <Grid item xs={10}>
                                <Routes>
                                    <Route path="/" element={<AreaPersonaleUtenteEnte
                                        infoModuloCommessa={infoModuloCommessa}
                                        setInfoModuloCommessa={setInfoModuloCommessa}
                                    />} />
                                </Routes>
                                <Routes>
                                    <Route path="/4" element={<ModuloCommessaElencoUtPa setInfoModuloCommessa={setInfoModuloCommessa} />} />
                                </Routes>
                                <Routes>
                                    <Route path="/8" element={<ModuloCommessaInserimentoUtEn30 infoModuloCommessa={infoModuloCommessa} setInfoModuloCommessa={setInfoModuloCommessa} />} />
                                </Routes>
                                
                                    
                           
                            </Grid>

                        </Grid>
                    </div>
                    <div className='container d-flex align-items-center justify-content-center pb-4'>
                        <Routes>
                            <Route path="/error" element={<ErrorPage />} />
                        </Routes>
                    </div>
                   
                    <FooterPostLogin />
                </div>
            </ThemeProvider>
              
        </Router>

    );
};

export default App;
