import { useContext, useEffect } from "react";
import {  Route} from "react-router-dom";
import { GlobalContext } from "../../store/context/globalContext";
import AreaPersonaleUtenteEnte from "../../page/areaPersonaleUtenteEnte";
import ModuloCommessaElencoUtPa from "../../page/moduloCommessaElencoUtPa";
import ModuloCommessaInserimentoUtEn30 from "../../page/moduloCommessaInserimentoUtEn30";
import ModuloCommessaPdf from "../../page/moduloCommessaPdf";
import RelPdfPage from "../../page/relPdfUtPa";
import RelPage from "../../page/relUtPa";
import ReportDettaglio from "../../page/reportDettaglioUtPa";
import { PathPf } from "../../types/enum";
import useIsTabActive from "../../reusableFunction/tabIsActiv";
import { redirect } from '../../api/api';
import SideNavComponent from "../../layout/sideNav";
import Layout from "../../layout/layOutLoggedIn";

const EnteRoute = () => {

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
  
};

export default EnteRoute;
