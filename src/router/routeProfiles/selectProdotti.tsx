import { Route } from "react-router-dom";
import AuthAzureProdotti from "../../page/authAzureProdotti";
import { useContext, useEffect } from "react";
import useIsTabActive from "../../reusableFunction/tabIsActiv";
import { GlobalContext } from "../../store/context/globalContext";
import { redirect } from "../../api/api";
import LayoutLoggedOut from "../../layout/layoutLoggedOut";



const SelectProdottiRoute = () => {

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

    const selectProfiloRoute = <Route  path="/selezionaprodotto" element={<LayoutLoggedOut page={<AuthAzureProdotti />}></LayoutLoggedOut>}></Route>;
    return selectProfiloRoute;
};

export default SelectProdottiRoute;
