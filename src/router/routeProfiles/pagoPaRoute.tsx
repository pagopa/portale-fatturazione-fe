import { useContext, useEffect } from "react";
import {  Route } from "react-router-dom";
import { GlobalContext } from "../../store/context/globalContext";
import Layout from "../../components/reusableComponents/layOutLoggedIn";
import SideNavPagopa from "../../components/sideNavs/sideNavPagoPA";
import Messaggi from "../../page/messaggi";
import AnagraficaPsp from "../../page/prod_pagopa/anagraficaPspPagopa";
import DettaglioDocContabile from "../../page/prod_pagopa/dettaglioDocumentoContabile";
import DocumentiContabili from "../../page/prod_pagopa/documentiContabiliPagopa";
import { PathPf } from "../../types/enum";
import useIsTabActive from "../../reusableFunction/tabIsActiv";
import { redirect } from "../../api/api";


const PagoPaRoute = () => {

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

    const prodPagopaRoute =  <Route element={<Layout sideNav={<SideNavPagopa/>}></Layout>}>
        <Route path={'/messaggi'} element={<Messaggi  />} />
        <Route path={PathPf.ANAGRAFICAPSP} element={<AnagraficaPsp ></AnagraficaPsp>}/>
        <Route path={PathPf.DOCUMENTICONTABILI} element={<DocumentiContabili ></DocumentiContabili>}/>
        <Route path={PathPf.DETTAGLIO_DOC_CONTABILE} element={<DettaglioDocContabile></DettaglioDocContabile>}/> 
    </Route>;
    return prodPagopaRoute;
};

export default PagoPaRoute;
