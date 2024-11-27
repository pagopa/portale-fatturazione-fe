import React, { useContext } from "react";
import {  Outlet } from "react-router-dom";

import { GlobalContext } from "../store/context/globalContext";


const ProdPnRoute = () => {
    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const isProdPnProfile = mainState.profilo.prodotto === 'prod-pn' && mainState.prodotti.length > 0 && mainState.authenticated;
    console.log('dentro',isProdPnProfile);
    return isProdPnProfile && <Outlet />;
};

export default ProdPnRoute;
