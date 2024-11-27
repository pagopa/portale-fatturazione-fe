import React, { useContext } from "react";
import { Outlet} from "react-router-dom";
import { profiliEnti } from "../reusableFunction/actionLocalStorage";
import { GlobalContext } from "../store/context/globalContext";
import { redirect } from "../api/api";


const EnteRoute = () => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const isEnte = profiliEnti(mainState);

    return isEnte ? <Outlet /> : window.location.href = redirect;
};

export default EnteRoute;
