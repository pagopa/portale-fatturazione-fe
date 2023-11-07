import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, Grid } from '@mui/material';
import {
  theme,
} from '@pagopa/mui-italia';
import AreaPersonaleUtenteEnte from './page/areaPersonaleUtenteEnte';
import DatiFatturazioneUtentePagoPa from './page/moduloCommessaElencoUtPa';
import ModuloCommessaInserimentoUtEn30 from './page/moduloCommessaInserimentoUtEn30';
import HeaderPostLogin from './components/headerPostLogin';
import SideNavComponent from './components/sideNav';
import FooterPostLogin from './components/footerPostLogin';

import HeaderNavComponent from './components/headerNav';

function App() {
  return (

    <Router>
      <ThemeProvider theme={theme}>
        <div className="App">

          <HeaderPostLogin />
          <HeaderNavComponent />

          <Grid sx={{ paddingBottom: '80px', height: '100%' }} container spacing={2} columns={12}>

            <Grid sx={{ marginBottom: '-100px' }} item xs={2}>
              <SideNavComponent />
            </Grid>

            <Grid item xs={10}>
              <Routes>
                <Route path="/" element={<AreaPersonaleUtenteEnte />} />
              </Routes>
              <Routes>
                <Route path="/4" element={<DatiFatturazioneUtentePagoPa />} />
              </Routes>
              <Routes>
                <Route path="/8" element={<ModuloCommessaInserimentoUtEn30 />} />
              </Routes>
            </Grid>

          </Grid>

          <FooterPostLogin />
        </div>
      </ThemeProvider>
    </Router>

  );
}

export default App;
