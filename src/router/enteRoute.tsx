import React, { useContext } from "react";
import { Outlet} from "react-router-dom";
import { profiliEnti } from "../reusableFunction/actionLocalStorage";
import { GlobalContext } from "../store/context/globalContext";



const EnteRoute = () => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const isEnte = profiliEnti(mainState);
    console.log(isEnte, 9999);
    return isEnte && <Outlet />;
};

export default EnteRoute;
