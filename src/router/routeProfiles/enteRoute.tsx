import {  Route} from "react-router-dom";
import { PathPf } from "../../types/enum";
import LayoutEnte from "../../layout/layOutLoggedInEnte";
import AreaPersonaleUtenteEnte from "../../page/prod_pn/areaPersonaleUtenteEnte";
import ModuloCommessaElencoUtPa from "../../page/prod_pn/moduloCommessaElencoUtPa";
import ModuloCommessaInserimentoUtEn30 from "../../page/prod_pn/moduloCommessaInserimentoUtEn30";
import ModuloCommessaPdf from "../../page/prod_pn/moduloCommessaPdf";
import RelPdfPage from "../../page/prod_pn/relPdfUtPa";
import RelPage from "../../page/prod_pn/relUtPa";
import ReportDettaglio from "../../page/prod_pn/reportDettaglioUtPa";
import SideNavEnte from "../../layout/sideNavs/sidNavEnte";
import ApiKeyEnte from "../../page/apiKeyEnte";
import LoadingRoute from "./loadingRoute";
import StoricoEnte from "../../page/ente/storicoContestazioniEnte";
import InserimentoContestazioniEnte from "../../page/ente/inserimentoContestazioniEnte";
import DettaglioStoricoContestazione from "../../page/prod_pn/dettaglioStoricoContestazione";



const EnteRoute  : React.FC<{apiIsVisible:boolean|null}> = ({apiIsVisible}) => {

    const enteRoute =  <Route element={<LayoutEnte sideNav={<SideNavEnte/>}></LayoutEnte>}>
        <Route path={PathPf.DATI_FATTURAZIONE} element={<AreaPersonaleUtenteEnte ></AreaPersonaleUtenteEnte>}/>                                     
        <Route path={PathPf.LISTA_COMMESSE} element={<ModuloCommessaElencoUtPa  />} />           
        <Route path={PathPf.MODULOCOMMESSA} element={<ModuloCommessaInserimentoUtEn30 />} />                 
        <Route path={PathPf.PDF_COMMESSA} element={<ModuloCommessaPdf  />} />
        <Route path={PathPf.LISTA_REL} element={<RelPage  />} />
        <Route path={PathPf.PDF_REL} element={<RelPdfPage  />} />                           
        <Route path={PathPf.LISTA_NOTIFICHE} element={<ReportDettaglio/>} />
       
        
        {/*La riga sottostante è stata aggiunta nel caso in cui l'utente è in apiKey page e tenta il reload dell'applicazione
        Dato che Api key è una pagina visibile solo per alcuni utenti ad ogni reload viene chiamata un api di controllo "getPageApiKeyVisible" */}
        {/*LOGICA NASCOSAT PER IL DEPLOY IN PROD  DI CONTESTAZIONI MASSIVE LATO ENTE
        {apiIsVisible && <Route path={PathPf.API_KEY_ENTE} element={<ApiKeyEnte/>} />}
        {apiIsVisible === null && <Route path={PathPf.API_KEY_ENTE} element={<LoadingRoute/>} />}
         <Route path={PathPf.STORICO_CONTEST_ENTE} element={<StoricoEnte />} />
        <Route path={PathPf.INSERIMENTO_CONTESTAZIONI_ENTE} element={<InserimentoContestazioniEnte />} />
        <Route path={PathPf.STORICO_DETTAGLIO_CONTEST} element={<DettaglioStoricoContestazione/>} />
        */}
        
    </Route>;
    return enteRoute; 
  
};

export default EnteRoute;
