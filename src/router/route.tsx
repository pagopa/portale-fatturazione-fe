import { useContext } from "react";
import { profiliEnti } from "../reusableFunction/actionLocalStorage";
import { GlobalContext } from "../store/context/globalContext";
import EnteRoute from "./routeProfiles/enteRoute";
import SelectProdottiRoute from "./routeProfiles/selectProdotti";
import { Route } from "react-router";
import Layout from "../components/reusableComponents/layOutLoggedIn";
import SideNavComponent from "../components/reusableComponents/sideNav";
import AreaPersonaleUtenteEnte from "../page/areaPersonaleUtenteEnte";
import ModuloCommessaElencoUtPa from "../page/moduloCommessaElencoUtPa";
import ModuloCommessaInserimentoUtEn30 from "../page/moduloCommessaInserimentoUtEn30";
import ModuloCommessaPdf from "../page/moduloCommessaPdf";
import RelPdfPage from "../page/relPdfUtPa";
import RelPage from "../page/relUtPa";
import ReportDettaglio from "../page/reportDettaglioUtPa";
import { PathPf } from "../types/enum";
import AuthAzureProdotti from "../page/authAzureProdotti";
import Accertamenti from "../page/accertamenti";
import AdesioneBando from "../page/adesioneBando";
import Fatturazione from "../page/fatturazione";
import Messaggi from "../page/messaggi";
import PagoPaListaDatiFatturazione from "../page/pagoPaListaDatiFatturazione";
import PagoPaListaModuliCommessa from "../page/pagoPaListaModuliCommessa";
import SideNavPagopa from "../components/sideNavs/sideNavPagoPA";
import AnagraficaPsp from "../page/prod_pagopa/anagraficaPspPagopa";
import DettaglioDocContabile from "../page/prod_pagopa/dettaglioDocumentoContabile";
import DocumentiContabili from "../page/prod_pagopa/documentiContabiliPagopa";



const RouteProfile = () => {
    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const profilo = mainState.profilo;
    const isEnte = profiliEnti(mainState);
    const isLoggedWithoutProfile = mainState.prodotti.length > 0 && mainState.authenticated === true && !mainState.profilo.auth;
    const isProdPnProfile = mainState.profilo.prodotto === 'prod-pn' && mainState.prodotti.length > 0 && mainState.authenticated;
    const isPagoPaProfile = mainState.profilo.prodotto === 'prod-pagopa' && mainState.prodotti.length > 0 && mainState.authenticated;
    const isRececapitistaOrConsolidatore = (mainState.profilo?.profilo === 'REC' || mainState.profilo?.profilo ==='CON') && mainState.authenticated;


    if(isEnte){

        const enteRoute =  <Route element={<Layout sideNav={<SideNavComponent/>}></Layout>}>
            <Route path={PathPf.DATI_FATTURAZIONE} element={<AreaPersonaleUtenteEnte ></AreaPersonaleUtenteEnte>}/>                                     
            <Route path={PathPf.LISTA_COMMESSE} element={<ModuloCommessaElencoUtPa  />} />           
            <Route path={PathPf.MODULOCOMMESSA} element={<ModuloCommessaInserimentoUtEn30 />} />                 
            <Route path={PathPf.PDF_COMMESSA} element={<ModuloCommessaPdf  />} />
            <Route path={PathPf.LISTA_REL} element={<RelPage  />} />
            <Route path={PathPf.PDF_REL} element={<RelPdfPage  />} />                           
            <Route path={PathPf.LISTA_NOTIFICHE} element={<ReportDettaglio/>} />
        </Route>;
        return enteRoute; 
    }else if(isLoggedWithoutProfile){
        const selectProfiloRoute =  <Route path="/selezionaprodotto" element={<AuthAzureProdotti />}></Route>;
        return selectProfiloRoute;
    }else if(isProdPnProfile){
        const prodPnRoute =  <Route element={<Layout sideNav={<SideNavComponent />}></Layout>}>
            <Route path={PathPf.DATI_FATTURAZIONE} element={<AreaPersonaleUtenteEnte />} />
            <Route path={PathPf.LISTA_MODULICOMMESSA} element={<PagoPaListaModuliCommessa/>}/>
            <Route path={PathPf.MODULOCOMMESSA} element={<ModuloCommessaInserimentoUtEn30/>} />
            <Route path={PathPf.PDF_COMMESSA} element={<ModuloCommessaPdf/>} />
            <Route path={PathPf.LISTA_DATI_FATTURAZIONE} element={<PagoPaListaDatiFatturazione/>} />
            <Route path={PathPf.LISTA_REL} element={<RelPage />} />
            <Route path={PathPf.PDF_REL} element={<RelPdfPage/>} />
            <Route path={PathPf.ADESIONE_BANDO} element={<AdesioneBando/>} />
            <Route path={PathPf.FATTURAZIONE} element={<Fatturazione/>} />
            <Route path={PathPf.LISTA_NOTIFICHE} element={<ReportDettaglio />} />
            <Route path={'/messaggi'} element={<Messaggi />} />
            <Route path={'/accertamenti'} element={<Accertamenti/>} />
        </Route>;

        return prodPnRoute;
    }else if(isPagoPaProfile){
        const prodPagopaRoute =  <Route element={<Layout sideNav={<SideNavPagopa/>}></Layout>}>
            <Route path={'/messaggi'} element={<Messaggi  />} />
            <Route path={PathPf.ANAGRAFICAPSP} element={<AnagraficaPsp ></AnagraficaPsp>}/>
            <Route path={PathPf.DOCUMENTICONTABILI} element={<DocumentiContabili ></DocumentiContabili>}/>
            <Route path={PathPf.DETTAGLIO_DOC_CONTABILE} element={<DettaglioDocContabile></DettaglioDocContabile>}/> 
        </Route>;
        return prodPagopaRoute;
    }else if(isRececapitistaOrConsolidatore){
        const recapitistaConsolidatoreRoute =  <Route element={<Layout sideNav={<SideNavComponent/>}></Layout>}>
            <Route path={PathPf.LISTA_NOTIFICHE} element={<ReportDettaglio />} />
        </Route>;
    
        return recapitistaConsolidatoreRoute;
    }
};

export default RouteProfile;
