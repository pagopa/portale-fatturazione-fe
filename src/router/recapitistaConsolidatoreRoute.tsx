import { useContext } from "react";
import { Outlet } from "react-router-dom";
import { GlobalContext } from "../store/context/globalContext";
import { redirect } from "../api/api";


const RecConRoute = () => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const isRececapitistaOrConsolidatore = (mainState.profilo?.profilo === 'REC' || mainState.profilo?.profilo ==='CON') && mainState.authenticated;

    return isRececapitistaOrConsolidatore ? <Outlet /> : window.location.href = redirect;
};

export default RecConRoute;
