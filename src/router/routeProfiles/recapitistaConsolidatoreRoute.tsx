import { Route } from "react-router-dom";
import ReportDettaglio from "../../page/reportDettaglioUtPa";
import { PathPf } from "../../types/enum";
import LayoutEnte from "../../layout/layOutLoggedInEnte";
import SideNavRecCon from "../../layout/sideNavs/sideNavConRec";

const RecConRoute = () => {
    const recapitistaConsolidatoreRoute =  <Route element={<LayoutEnte sideNav={<SideNavRecCon/>}></LayoutEnte>}>
        <Route path={PathPf.LISTA_NOTIFICHE} element={<ReportDettaglio />} />
    </Route>;

    return recapitistaConsolidatoreRoute;
};

export default RecConRoute;
