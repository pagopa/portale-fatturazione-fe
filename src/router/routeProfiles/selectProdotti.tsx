import { Route } from "react-router-dom";
import AuthAzureProdotti from "../../page/authAzureProdotti";
import LayoutLoggedOut from "../../layout/layoutLoggedOut";



const SelectProdottiRoute = () => {

    const selectProfiloRoute = <Route  path="/selezionaprodotto" element={<LayoutLoggedOut page={<AuthAzureProdotti />}></LayoutLoggedOut>}></Route>;
    return selectProfiloRoute;
};

export default SelectProdottiRoute;
