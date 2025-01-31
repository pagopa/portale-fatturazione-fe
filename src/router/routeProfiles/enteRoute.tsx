import {  Route} from "react-router-dom";
import AreaPersonaleUtenteEnte from "../../page/areaPersonaleUtenteEnte";
import ModuloCommessaElencoUtPa from "../../page/moduloCommessaElencoUtPa";
import ModuloCommessaInserimentoUtEn30 from "../../page/moduloCommessaInserimentoUtEn30";
import ModuloCommessaPdf from "../../page/moduloCommessaPdf";
import RelPdfPage from "../../page/relPdfUtPa";
import RelPage from "../../page/relUtPa";
import ReportDettaglio from "../../page/reportDettaglioUtPa";
import { PathPf } from "../../types/enum";
import LayoutEnte from "../../layout/layOutLoggedInEnte";
import SideNavEnte from "../../layout/sideNavs/sidNavEnte";

const EnteRoute = () => {

    const enteRoute =  <Route element={<LayoutEnte sideNav={<SideNavEnte/>}></LayoutEnte>}>
        <Route path={PathPf.DATI_FATTURAZIONE} element={<AreaPersonaleUtenteEnte ></AreaPersonaleUtenteEnte>}/>                                     
        <Route path={PathPf.LISTA_COMMESSE} element={<ModuloCommessaElencoUtPa  />} />           
        <Route path={PathPf.MODULOCOMMESSA} element={<ModuloCommessaInserimentoUtEn30 />} />                 
        <Route path={PathPf.PDF_COMMESSA} element={<ModuloCommessaPdf  />} />
        <Route path={PathPf.LISTA_REL} element={<RelPage  />} />
        <Route path={PathPf.PDF_REL} element={<RelPdfPage  />} />                           
        <Route path={PathPf.LISTA_NOTIFICHE} element={<ReportDettaglio/>} />
    </Route>;
    return enteRoute; 
  
};

export default EnteRoute;
