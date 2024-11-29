import { Route } from "react-router-dom";
import ReportDettaglio from "../../page/reportDettaglioUtPa";
import { PathPf } from "../../types/enum";
import SideNavComponent from "../../layout/sideNav";
import LayoutEnte from "../../layout/layOutLoggedInEnte";


const RecConRoute = () => {

   

    const recapitistaConsolidatoreRoute =  <Route element={<LayoutEnte sideNav={<SideNavComponent/>}></LayoutEnte>}>
        <Route path={PathPf.LISTA_NOTIFICHE} element={<ReportDettaglio />} />
    </Route>;

    return recapitistaConsolidatoreRoute;
};

export default RecConRoute;
