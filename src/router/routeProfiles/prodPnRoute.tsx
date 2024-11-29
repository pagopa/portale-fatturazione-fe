import React, { useContext, useEffect } from "react";
import {  Route } from "react-router-dom";

import { GlobalContext } from "../../store/context/globalContext";
import Layout from "../../components/reusableComponents/layOutLoggedIn";
import SideNavComponent from "../../components/reusableComponents/sideNav";
import Accertamenti from "../../page/accertamenti";
import AdesioneBando from "../../page/adesioneBando";
import AreaPersonaleUtenteEnte from "../../page/areaPersonaleUtenteEnte";
import Fatturazione from "../../page/fatturazione";
import Messaggi from "../../page/messaggi";
import ModuloCommessaInserimentoUtEn30 from "../../page/moduloCommessaInserimentoUtEn30";
import ModuloCommessaPdf from "../../page/moduloCommessaPdf";
import PagoPaListaDatiFatturazione from "../../page/pagoPaListaDatiFatturazione";
import PagoPaListaModuliCommessa from "../../page/pagoPaListaModuliCommessa";
import RelPdfPage from "../../page/relPdfUtPa";
import RelPage from "../../page/relUtPa";
import ReportDettaglio from "../../page/reportDettaglioUtPa";
import { PathPf } from "../../types/enum";
import useIsTabActive from "../../reusableFunction/tabIsActiv";
import { redirect } from "../../api/api";


const ProdPnRoute = () => {

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
};

export default ProdPnRoute;
