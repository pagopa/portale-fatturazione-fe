import { Route } from "react-router-dom";

import ReportDettaglio from "../../page/reportDettaglioUtPa";
import { PathPf } from "../../types/enum";
import { useContext, useEffect } from "react";
import useIsTabActive from "../../reusableFunction/tabIsActiv";
import { GlobalContext } from "../../store/context/globalContext";
import { redirect } from "../../api/api";
import SideNavComponent from "../../layout/sideNav";
import Layout from "../../layout/layOutLoggedIn";


const RecConRoute = () => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const profilo = mainState.profilo;

    const globalLocalStorage = localStorage.getItem('globalState') || '{}';
    const result =  JSON.parse(globalLocalStorage);

    const tabActive = useIsTabActive();
    useEffect(()=>{
        if(mainState.authenticated === true  && tabActive === true &&(profilo.nonce !== result.profilo.nonce)){
            window.location.href = redirect;
        }
    },[tabActive]);

    const recapitistaConsolidatoreRoute =  <Route element={<Layout sideNav={<SideNavComponent/>}></Layout>}>
        <Route path={PathPf.LISTA_NOTIFICHE} element={<ReportDettaglio />} />
    </Route>;

    return recapitistaConsolidatoreRoute;
};

export default RecConRoute;
