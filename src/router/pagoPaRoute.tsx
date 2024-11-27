import { useContext } from "react";
import { Outlet } from "react-router-dom";
import { GlobalContext } from "../store/context/globalContext";


const PagoPaRoute = () => {
    console.log('pagoPA dentro');
    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const isPagoPaProfile = mainState.profilo.prodotto === 'prod-pagopa' && mainState.prodotti.length > 0 && mainState.authenticated;

    return isPagoPaProfile && <Outlet />;
};

export default PagoPaRoute;
