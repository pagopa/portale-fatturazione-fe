import {  Route } from "react-router-dom";
import { PathPf } from "../../types/enum";
import LayoutAzure from "../../layout/layOutLoggedInAzure";
import Messaggi from "../../page/messaggi";
import Accertamenti from "../../page/prod_pn/accertamenti";
import AdesioneBando from "../../page/prod_pn/adesioneBando";
import AreaPersonaleUtenteEnte from "../../page/prod_pn/areaPersonaleUtenteEnte";
import Fatturazione from "../../page/prod_pn/fatturazione";
import ModuloCommessaInserimentoUtEn30 from "../../page/prod_pn/moduloCommessaInserimentoUtEn30";
import ModuloCommessaPdf from "../../page/prod_pn/moduloCommessaPdf";
import PagoPaListaDatiFatturazione from "../../page/prod_pn/pagoPaListaDatiFatturazione";
import PagoPaListaModuliCommessa from "../../page/prod_pn/pagoPaListaModuliCommessa";
import RelPdfPage from "../../page/prod_pn/relPdfUtPa";
import RelPage from "../../page/prod_pn/relUtPa";
import ReportDettaglio from "../../page/prod_pn/reportDettaglioUtPa";
import InserimentoContestazioni from "../../page/prod_pn/inserimentoContestazioni";
import Storico from "../../page/prod_pn/storicoContestazioni";
import SideNavSend from "../../layout/sideNavs/sideNavSend";
import PageTipologiaContratto from "../../page/tipologiaContratto";
import ListaDocEmessi from "../../page/whiteList";
import InvioFatture from "../../page/invioFatture";
import InvioFattureDetails from "../../page/invioFattureDetails";

const ProdPnRoute = () => {
    const prodPnRoute =  <Route element={<LayoutAzure  sideNav={<SideNavSend />}></LayoutAzure >}>
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
        <Route path={PathPf.INSERIMENTO_CONTESTAZIONI} element={<InserimentoContestazioni />} />
        <Route path={PathPf.STORICO_CONTEST} element={<Storico />} />
        <Route path={PathPf.TIPOLOGIA_CONTRATTO} element={<PageTipologiaContratto/>} />
        <Route path={PathPf.LISTA_DOC_EMESSI} element={<ListaDocEmessi/>} />
        <Route path={PathPf.JSON_TO_SAP} element={<InvioFatture/>} />
        <Route path={PathPf.JSON_TO_SAP_DETAILS} element={<InvioFattureDetails/>} />
        
    </Route>;
    return prodPnRoute;
};

export default ProdPnRoute;
