import { useContext } from "react";
import {  Route } from "react-router-dom";
import { GlobalContext } from "../../store/context/globalContext";
import AuthAzureProdotti from "../../page/authAzureProdotti";


const SelectProdottiRoute = () => {


    return  <Route path="/selezionaprodotto" element={<AuthAzureProdotti />} />;
};

export default SelectProdottiRoute;
