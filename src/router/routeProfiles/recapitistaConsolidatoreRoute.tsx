import { Route } from "react-router-dom";
import { PathPf } from "../../types/enum";
import LayoutEnte from "../../layout/layOutLoggedInEnte";
import ReportDettaglio from "../../page/prod_pn/reportDettaglioUtPa";
import SideNavRecCon from "../../layout/sideNavs/sideNavConRec";

const RecConRoute = () => {
    const recapitistaConsolidatoreRoute =  <Route element={<LayoutEnte sideNav={<SideNavRecCon/>}></LayoutEnte>}>
        <Route path={PathPf.LISTA_NOTIFICHE} element={<ReportDettaglio />} />
    </Route>;

    return recapitistaConsolidatoreRoute;
};

export default RecConRoute;
