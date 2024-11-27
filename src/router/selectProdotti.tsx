import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { GlobalContext } from "../store/context/globalContext";


const SelectProdotti = () => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const isLoggedWithoutProfile = mainState.prodotti.length > 0 && mainState.authenticated === true && !mainState.profilo.auth;

    return isLoggedWithoutProfile ? <Outlet /> : <Navigate to="/azureLogin" />;
};

export default SelectProdotti;
