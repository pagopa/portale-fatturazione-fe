import { useContext } from "react";
import { Route } from "react-router-dom";
import { GlobalContext } from "../../store/context/globalContext";
import Layout from "../../components/reusableComponents/layOutLoggedIn";
import SideNavPagopa from "../../components/sideNavs/sideNavPagoPA";
import Messaggi from "../../page/messaggi";
import AnagraficaPsp from "../../page/prod_pagopa/anagraficaPspPagopa";
import DettaglioDocContabile from "../../page/prod_pagopa/dettaglioDocumentoContabile";
import DocumentiContabili from "../../page/prod_pagopa/documentiContabiliPagopa";
import { PathPf } from "../../types/enum";


const PagoPaRoute = () => {
    console.log('pagoPA dentro');
    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const isPagoPaProfile = mainState.profilo.prodotto === 'prod-pagopa' && mainState.prodotti.length > 0 && mainState.authenticated;

    return (
        <Route element={<Layout sideNav={<SideNavPagopa/>}></Layout>}>
            <Route path={'/messaggi'} element={<Messaggi  />} />
            <Route path={PathPf.ANAGRAFICAPSP} element={<AnagraficaPsp ></AnagraficaPsp>}/>
            <Route path={PathPf.DOCUMENTICONTABILI} element={<DocumentiContabili ></DocumentiContabili>}/>
            <Route path={PathPf.DETTAGLIO_DOC_CONTABILE} element={<DettaglioDocContabile></DettaglioDocContabile>}/> 
        </Route>
    );
};

export default PagoPaRoute;
