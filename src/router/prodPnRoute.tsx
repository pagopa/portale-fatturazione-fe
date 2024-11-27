import React, { useContext } from "react";
import { Navigate, Outlet, Route } from "react-router-dom";

import { GlobalContext } from "../store/context/globalContext";
import { Grid } from "@mui/material";
import SideNavComponent from "../components/reusableComponents/sideNav";
import Accertamenti from "../page/accertamenti";
import AdesioneBando from "../page/adesioneBando";
import AreaPersonaleUtenteEnte from "../page/areaPersonaleUtenteEnte";
import Fatturazione from "../page/fatturazione";
import Messaggi from "../page/messaggi";
import ModuloCommessaInserimentoUtEn30 from "../page/moduloCommessaInserimentoUtEn30";
import ModuloCommessaPdf from "../page/moduloCommessaPdf";
import PagoPaListaDatiFatturazione from "../page/pagoPaListaDatiFatturazione";
import PagoPaListaModuliCommessa from "../page/pagoPaListaModuliCommessa";
import RelPdfPage from "../page/relPdfUtPa";
import RelPage from "../page/relUtPa";
import ReportDettaglio from "../page/reportDettaglioUtPa";
import { PathPf } from "../types/enum";


const ProdPnRoute = () => {
    console.log('dentro');
    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const isProdPnProfile = mainState.profilo.prodotto === 'prod-pn' && mainState.prodotti.length > 0 && mainState.authenticated;
    console.log('dentro',isProdPnProfile);
    return isProdPnProfile ?   <>
        <Grid sx={{ height: '100%' }} container spacing={2} columns={12}>
            <Grid item xs={2}>
                <SideNavComponent />
            </Grid> 
            <Grid item xs={10}>
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
            </Grid>
        </Grid>
    </> : <Navigate to="/azureLogin" />;
};

export default ProdPnRoute;
