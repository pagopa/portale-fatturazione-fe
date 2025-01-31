import {  Route} from "react-router-dom";
import { PathPf } from "../../types/enum";
import SideNavComponent from "../../layout/sideNav";
import LayoutEnte from "../../layout/layOutLoggedInEnte";
import AreaPersonaleUtenteEnte from "../../page/prod_pn/areaPersonaleUtenteEnte";
import ModuloCommessaElencoUtPa from "../../page/prod_pn/moduloCommessaElencoUtPa";
import ModuloCommessaInserimentoUtEn30 from "../../page/prod_pn/moduloCommessaInserimentoUtEn30";
import ModuloCommessaPdf from "../../page/prod_pn/moduloCommessaPdf";
import RelPdfPage from "../../page/prod_pn/relPdfUtPa";
import RelPage from "../../page/prod_pn/relUtPa";
import ReportDettaglio from "../../page/prod_pn/reportDettaglioUtPa";

const EnteRoute = () => {

 
   
    const enteRoute =  <Route element={<LayoutEnte sideNav={<SideNavComponent/>}></LayoutEnte>}>
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
