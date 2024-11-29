import {  Route } from "react-router-dom";
import SideNavPagopa from "../../layout/sideNavs/sideNavPagoPA";
import Messaggi from "../../page/messaggi";
import AnagraficaPsp from "../../page/prod_pagopa/anagraficaPspPagopa";
import DettaglioDocContabile from "../../page/prod_pagopa/dettaglioDocumentoContabile";
import DocumentiContabili from "../../page/prod_pagopa/documentiContabiliPagopa";
import { PathPf } from "../../types/enum";
import LayoutAzure from "../../layout/layOutLoggedInAzure";



const PagoPaRoute = () => {


    const prodPagopaRoute =  <Route element={<LayoutAzure sideNav={<SideNavPagopa/>}></LayoutAzure>}>
        <Route path={'/messaggi'} element={<Messaggi  />} />
        <Route path={PathPf.ANAGRAFICAPSP} element={<AnagraficaPsp ></AnagraficaPsp>}/>
        <Route path={PathPf.DOCUMENTICONTABILI} element={<DocumentiContabili ></DocumentiContabili>}/>
        <Route path={PathPf.DETTAGLIO_DOC_CONTABILE} element={<DettaglioDocContabile></DettaglioDocContabile>}/> 
    </Route>;
    return prodPagopaRoute;
};

export default PagoPaRoute;
