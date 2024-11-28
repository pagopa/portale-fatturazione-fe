import { useContext } from "react";
import { Route } from "react-router-dom";
import { GlobalContext } from "../../store/context/globalContext";
import Layout from "../../components/reusableComponents/layOutLoggedIn";
import SideNavComponent from "../../components/reusableComponents/sideNav";
import ReportDettaglio from "../../page/reportDettaglioUtPa";
import { PathPf } from "../../types/enum";


const RecConRoute = () => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const isRececapitistaOrConsolidatore = (mainState.profilo?.profilo === 'REC' || mainState.profilo?.profilo ==='CON') && mainState.authenticated;

    return (
        <Route element={<Layout sideNav={<SideNavComponent/>}></Layout>}>
            <Route path={PathPf.LISTA_NOTIFICHE} element={<ReportDettaglio />} />
        </Route>
    );
};

export default RecConRoute;
