import '../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { ThemeProvider} from '@mui/material';
import {theme} from '@pagopa/mui-italia';
import { Navigate, RouterProvider} from "react-router";
import Auth from "../page/auth";
import AuthAzure from "../page/authAzure";
import Azure from "../page/azure";
import AzureLogin from "../page/azureLogin";
import { PathRoutePf } from "../types/enum";
import LayoutLoggedOut from '../layout/layoutLoggedOut';
import useIsTabActive from '../reusableFunction/tabIsActiv';
import {  redirect } from '../api/api';
import AreaPersonaleUtenteEnte from '../page/prod_pn/areaPersonaleUtenteEnte';
import LayoutAzure from '../layout/layOutLoggedInAzure';
import Messaggi from '../page/messaggi';
import Accertamenti from '../page/prod_pn/accertamenti';
import AdesioneBando from '../page/prod_pn/adesioneBando';
import DettaglioStoricoContestazione from '../page/prod_pn/dettaglioStoricoContestazione';
import Fatturazione from '../page/prod_pn/fatturazione';
import InserimentoContestazioni from '../page/prod_pn/inserimentoContestazioni';
import InvioFatture from '../page/prod_pn/invioFatture';
import InvioFattureDetails from '../page/prod_pn/invioFattureDetails';
import ModuloCommessaInserimentoPn from '../page/prod_pn/moduloCommessaInserimentoPn';
import ModuloCommessaPdf from '../page/prod_pn/moduloCommessaPdf';
import PagoPaListaDatiFatturazione from '../page/prod_pn/pagoPaListaDatiFatturazione';
import PagoPaListaModuliCommessa from '../page/prod_pn/pagoPaListaModuliCommessa';
import ProcessiOrchestartore from '../page/prod_pn/processiOrchestratore';
import RelPdfPage from '../page/prod_pn/relPdfUtPa';
import RelPage from '../page/prod_pn/relUtPa';
import ReportDettaglio from '../page/prod_pn/reportDettaglioUtPa';
import Storico from '../page/prod_pn/storicoContestazioni';
import PageTipologiaContratto from '../page/prod_pn/tipologiaContratto';
import ListaDocEmessi from '../page/prod_pn/whiteList';
import SideNavSend from '../layout/sideNavs/sideNavSend';
import AuthAzureProdotti from '../page/authAzureProdotti';
import ListaCommessaPrevisionale from '../page/prod_pn/listaModuloComPrevisonale';
import AnagraficaPsp from '../page/prod_pagopa/anagraficaPspPagopa';
import DocumentiContabili from '../page/prod_pagopa/documentiContabiliPagopa';
import DettaglioDocContabile from '../page/prod_pagopa/dettaglioDocumentoContabile';
import KpiPagamenti from '../page/prod_pagopa/kpiPagamenti';
import SideNavPagopa from '../layout/sideNavs/sideNavPagoPA';
import SideNavEnte from '../layout/sideNavs/sidNavEnte';
import ModuloCommessaElencoUtPa from '../page/ente/moduloCommessaElencoUtPa';
import ModuloCommessaInserimentoUtEn30 from '../page/ente/moduloCommessaInserimentoUtEn30';
import AsyncDocumenti from '../page/ente/asyncDocumenti';
import ApiKeyEnte from '../page/apiKeyEnte';
import LayoutEnte from '../layout/layOutLoggedInEnte';
import SideNavRecCon from '../layout/sideNavs/sideNavConRec';
import { useGlobalStore } from '../store/context/useGlobalStore';
import { createBrowserRouter } from 'react-router-dom';
import { RoleBasedIndexRedirect } from './redirectRoute';

const RouteProfile = () => {
    const mainState = useGlobalStore(state => state.mainState);
    /*
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const isEnte = profiliEnti(mainState);
    const isLoggedWithoutProfile = mainState.prodotti?.length > 0 && mainState.authenticated === true && !mainState.profilo.auth;
    const isProdPnProfile = mainState.profilo?.prodotto === 'prod-pn' && mainState.prodotti?.length > 0 && mainState.authenticated;
    const isPagoPaProfile = mainState.profilo?.prodotto === 'prod-pagopa' && mainState.prodotti?.length > 0 && mainState.authenticated;
    const isRececapitistaOrConsolidatore = (mainState.profilo?.profilo === 'REC' || mainState.profilo?.profilo ==='CON') && mainState.authenticated;

    const globalLocalStorage = localStorage.getItem('globalState') || '{}';
    const result =  JSON.parse(globalLocalStorage);
   
    useEffect(()=>{
        if(token && profilo.nonce && isEnte){
            apiKeyPageAvailable();
        }
    },[token,profilo.nonce,isEnte]);

    const apiKeyPageAvailable = async() => {
        //evita la chimata se lato AZURE
        await getPageApiKeyVisible(token,profilo.nonce).then(async(res)=>{
            const newKeys = res?.data.map(el => el.apiKey).filter(el => el !== null);
            setMainData((prev) => ({...prev, apiKeyPage:{ keys:newKeys,ip:[],visible:true}}));
        }).catch((err)=>{
         
            if(err?.response?.status === 401){
                setMainData((prev) => ({...prev, apiKeyPage:{...prev.apiKeyPage,visible:false}}));
            }else if (err.response.status === 404){
                setMainData((prev) => ({...prev, apiKeyPage:{...prev.apiKeyPage,visible:true}}));
            }else{
                setMainData((prev) => ({...prev, apiKeyPage:{...prev.apiKeyPage,visible:false}}));
            }
        });
    };

    let route:any  = <Route/>;
    let redirectRoute = "/azureLogin";
    if(isEnte){
        route = EnteRoute({apiIsVisible:mainData.apiKeyPage.visible});
        redirectRoute = PathPf.DATI_FATTURAZIONE;
    }else if(isLoggedWithoutProfile){
        route = SelectProdottiRoute();
        redirectRoute = "/selezionaprodotto";
    }else if(isProdPnProfile){
        route = ProdPnRoute();
        redirectRoute = PathPf.LISTA_DATI_FATTURAZIONE;
    }else if(isPagoPaProfile){
        route = PagoPaRoute();
        redirectRoute = PathPf.ANAGRAFICAPSP;
    }else if(isRececapitistaOrConsolidatore){
        route = RecConRoute();
        redirectRoute = PathPf.LISTA_NOTIFICHE;
    }
*/

    /*TODO DA SETTARE A FINE SVILUPPO ZUNDUST
    const tabActive = useIsTabActive();
   
    useEffect(()=>{
        if(mainState.authenticated === true  && tabActive === true){
            if(profilo?.nonce  !== result?.profilo?.nonce){
                window.location.href = redirect;
            }
        }
    },[tabActive]);
*/
  
    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                <RouterProvider router={router2} />
            </div>
        </ThemeProvider>
    
        
    );

};


export default RouteProfile;








const router2 = createBrowserRouter([
    {
        path: "/",
        Component:LayoutLoggedOut,
        children: [
            {
                index: true,
                element: <RoleBasedIndexRedirect />
            },
            { 
                path: "azureLogin",
                Component: AzureLogin,
            },
            {
                path: "azure",
                Component: Azure,
            },
            {
                path: "auth",
                Component: Auth,
            },
            {
                path: "selezionaprodotto",
                Component: AuthAzureProdotti,
            },
            {
                path: "auth/azure",
                Component: AuthAzure,
            },
            {
                path: "send",
                Component: () => <LayoutAzure sideNav={<SideNavSend />} />,
                children: [
                    { path: PathRoutePf.LISTA_DATI_FATTURAZIONE, Component: PagoPaListaDatiFatturazione },
                    { path: PathRoutePf.DATI_FATTURAZIONE, Component: AreaPersonaleUtenteEnte },
                    { path: PathRoutePf.TIPOLOGIA_CONTRATTO, Component: PageTipologiaContratto },
                    { path: PathRoutePf.LISTA_MODULICOMMESSA_PREVISONALE, Component: ListaCommessaPrevisionale },
                    { path: PathRoutePf.LISTA_MODULICOMMESSA, Component: PagoPaListaModuliCommessa },
                    { path: PathRoutePf.LISTA_NOTIFICHE, Component: ReportDettaglio },
                    { path: PathRoutePf.INSERIMENTO_CONTESTAZIONI, Component: InserimentoContestazioni },
                    { path: PathRoutePf.STORICO_CONTEST, Component: Storico },
                    { path: PathRoutePf.STORICO_DETTAGLIO_CONTEST, Component: DettaglioStoricoContestazione },
                    { path: PathRoutePf.MODULOCOMMESSA, Component: ModuloCommessaInserimentoPn },
                    { path: PathRoutePf.PDF_COMMESSA+"/:annoPdf?/:mesePdf?", Component: ModuloCommessaPdf },
                    { path: PathRoutePf.LISTA_REL, Component: RelPage },
                    { path: PathRoutePf.PDF_REL, Component: RelPdfPage },
                    { path: PathRoutePf.ADESIONE_BANDO, Component: AdesioneBando },
                    { path: PathRoutePf.FATTURAZIONE, Component: Fatturazione },
                    { path: PathRoutePf.MESSAGGI, Component: Messaggi },
                    { path: PathRoutePf.ACCERTAMENTI, Component: Accertamenti },
                    { path: PathRoutePf.LISTA_DOC_EMESSI, Component: ListaDocEmessi },
                    { path: PathRoutePf.JSON_TO_SAP, Component: InvioFatture },
                    { path: PathRoutePf.JSON_TO_SAP_DETAILS, Component: InvioFattureDetails },
                    { path: PathRoutePf.ORCHESTRATORE, Component: ProcessiOrchestartore }
                ],
            },
            {
                path: "pn",
                Component: () => <LayoutAzure sideNav={<SideNavPagopa />} />,
                children: [
                    { path:PathRoutePf.ANAGRAFICAPSP, Component: AnagraficaPsp },
                    { path:PathRoutePf.DOCUMENTICONTABILI, Component: DocumentiContabili },
                    { path:PathRoutePf.DETTAGLIO_DOC_CONTABILE, Component: DettaglioDocContabile },
                    { path:PathRoutePf.KPI, Component: KpiPagamenti },
                    { path: PathRoutePf.MESSAGGI, Component: Messaggi },
                ],
            },
            {
                path: "ente",
                Component: () => <LayoutEnte sideNav={<SideNavEnte />} />,
                children: [
                    {path: PathRoutePf.DATI_FATTURAZIONE,Component: AreaPersonaleUtenteEnte},
                    {path: PathRoutePf.LISTA_COMMESSE, Component: ModuloCommessaElencoUtPa},
                    {path: PathRoutePf.MODULOCOMMESSA,Component: ModuloCommessaInserimentoUtEn30},
                    {path: PathRoutePf.PDF_COMMESSA + "/:annoPdf?/:mesePdf?",Component: ModuloCommessaPdf},
                    {path: PathRoutePf.LISTA_REL,Component: RelPage},
                    {path: PathRoutePf.PDF_REL,Component: RelPdfPage},
                    {path: PathRoutePf.LISTA_NOTIFICHE, Component: ReportDettaglio},
                    {path: PathRoutePf.ASYNC_DOCUMENTI_ENTE, Component: AsyncDocumenti},
                    {path: PathRoutePf.API_KEY_ENTE,Component: ApiKeyEnte}
                ],
            },
            {
                path: "reccon",
                Component: () => <LayoutEnte sideNav={<SideNavRecCon />} />,
                children: [
                    {path: PathRoutePf.LISTA_NOTIFICHE, Component: ReportDettaglio}
                ],
            },
            {
                path: "*",
                Component: () => <RoleBasedIndexRedirect></RoleBasedIndexRedirect>,
            },
           
        ],
    },
    
   
]);



