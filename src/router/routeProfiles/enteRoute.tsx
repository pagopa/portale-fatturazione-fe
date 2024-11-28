import React, { useContext } from "react";
import { Outlet, Route} from "react-router-dom";
import { profiliEnti } from "../../reusableFunction/actionLocalStorage";
import { GlobalContext } from "../../store/context/globalContext";
import Layout from "../../components/reusableComponents/layOutLoggedIn";
import SideNavComponent from "../../components/reusableComponents/sideNav";
import AreaPersonaleUtenteEnte from "../../page/areaPersonaleUtenteEnte";
import ModuloCommessaElencoUtPa from "../../page/moduloCommessaElencoUtPa";
import ModuloCommessaInserimentoUtEn30 from "../../page/moduloCommessaInserimentoUtEn30";
import ModuloCommessaPdf from "../../page/moduloCommessaPdf";
import RelPdfPage from "../../page/relPdfUtPa";
import RelPage from "../../page/relUtPa";
import ReportDettaglio from "../../page/reportDettaglioUtPa";
import { PathPf } from "../../types/enum";



const EnteRoute = () => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const isEnte = profiliEnti(mainState);
    console.log(isEnte, 9999);
    return (
        <Route element={<Layout sideNav={<SideNavComponent/>}></Layout>}>
            <Route path={PathPf.DATI_FATTURAZIONE} element={<AreaPersonaleUtenteEnte ></AreaPersonaleUtenteEnte>}/>                                     
            <Route path={PathPf.LISTA_COMMESSE} element={<ModuloCommessaElencoUtPa  />} />           
            <Route path={PathPf.MODULOCOMMESSA} element={<ModuloCommessaInserimentoUtEn30 />} />                 
            <Route path={PathPf.PDF_COMMESSA} element={<ModuloCommessaPdf  />} />
            <Route path={PathPf.LISTA_REL} element={<RelPage  />} />
            <Route path={PathPf.PDF_REL} element={<RelPdfPage  />} />                           
            <Route path={PathPf.LISTA_NOTIFICHE} element={<ReportDettaglio/>} />
        </Route>
    );
};

export default EnteRoute;
