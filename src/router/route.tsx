import '../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Modal, ThemeProvider, Typography} from '@mui/material';
import {theme} from '@pagopa/mui-italia';
import { isRouteErrorResponse, RouterProvider, useLocation, useRouteError} from "react-router";
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
import Messaggi from '../page/messaggi';
import EmailPsp from '../page/prod_pagopa/emailpsp';
import { useEffect } from 'react';
import { authVerify, authVerifyIsLoggedEnte, authVerifyIsLoggedProdPn, authVerifyIsLoggedSend } from '../loaderRoutes/loaderAuthVerify';

const RouteProfile = () => {
    const mainState = useGlobalStore(state => state.mainState);
    const globalLocalStorage = localStorage.getItem('globalStatePF') || '{}';
    const result =  JSON.parse(globalLocalStorage);
    const tabActive = useIsTabActive();
   
    useEffect(()=>{
        if(mainState.authenticated === true  && tabActive === true){
            if(mainState.profilo?.nonce  !== result?.state?.mainState?.profilo?.nonce){
                window.location.href = redirect;
            }
        }
    },[tabActive]);

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
        errorElement: <RouteErrorBoundary />,
        loader:authVerify,
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
                loader:authVerifyIsLoggedSend,
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
                loader:authVerifyIsLoggedProdPn,
                Component: () => <LayoutAzure sideNav={<SideNavPagopa />} />,
                children: [
                    { path:PathRoutePf.ANAGRAFICAPSP, Component: AnagraficaPsp },
                    { path:PathRoutePf.DOCUMENTICONTABILI, Component: DocumentiContabili },
                    { path:PathRoutePf.DETTAGLIO_DOC_CONTABILE, Component: DettaglioDocContabile },
                    { path:PathRoutePf.KPI, Component: KpiPagamenti },
                    { path: PathRoutePf.MESSAGGI, Component: Messaggi },
                    { path: PathRoutePf.EMAIL_PSP, Component: EmailPsp }
                ],
            },
            {
                path: "ente",
                loader:authVerifyIsLoggedEnte,
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



const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 420,
    bgcolor: "background.paper",
    borderRadius: 3,
    boxShadow: "0px 20px 60px rgba(38, 189, 203, 0.25)",
    border: "2px solid",
    borderColor: "#1BB8C6",
    p: 4,
    outline: "none",
};


function RouteErrorBoundary() {
    const error = useRouteError();
    const location = useLocation();

    const errorMessage = isRouteErrorResponse(error)
        ? `Error ${error.status}: ${error.statusText}`
        : error instanceof Error
            ? error.message
            : "Unknown error";

    const handleClose = () => {
        localStorage.clear();
        window.location.href = redirect;
    };
    const handleCopy = () => {
        const infoObject = {
            page:location.pathname.split("/")?.filter(Boolean)?.pop()||"ERROR",
            version:process.env.REACT_APP_VERSION,
            message:errorMessage
        };
        const stringMessage = JSON.stringify(infoObject);
        navigator.clipboard.writeText(stringMessage);
    };

    
    return (
        <div>
            <Modal
                open={true}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <div className='text-center'>
                        <Typography fontSize={"2.2rem"} fontWeight={900} id="modal-modal-title" variant="h4" component="h2">
            ERRORE!
                        </Typography>
                        <Typography fontSize={"1.15rem"} fontWeight={500}   id="modal-modal-description" sx={{ mt: 2 }}>
                            {`${location.pathname.split("/")?.filter(Boolean)?.pop() } V.${process.env.REACT_APP_VERSION}`||`Generic V.${process.env.REACT_APP_VERSION}`}
                        </Typography>
                        
                        <Typography fontSize={"1.15rem"} fontWeight={500} id="modal-modal-description" sx={{ mt: 2 }}>
            Contattare l'assistenza.
                        </Typography>
                    </div>
                   
                    <div className='container_buttons_modal d-flex justify-content-center'>
                        <Button 
                            sx={{marginRight:'20px'}} 
                            variant='contained'
                            onClick={handleClose}
                        >Login</Button>
                        <Button 
                            sx={{marginRight:'20px'}} 
                            variant='outlined'
                            onClick={handleCopy}
                        >Copia Errore</Button>
                      
                    </div>
                </Box>
            </Modal>
        </div>
    );
}