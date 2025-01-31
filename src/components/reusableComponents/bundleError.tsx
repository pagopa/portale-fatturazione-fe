import { Box, Button, Grid, ListItemText, ThemeProvider, Typography} from '@mui/material';
import {CompanyLinkType, Footer, FooterLinksType, HeaderAccount, PreLoginFooterLinksType, theme} from '@pagopa/mui-italia';
import { IllusError } from "@pagopa/mui-italia";


function  BundleError({ error, resetErrorBoundary }){
  
    const profile = localStorage.getItem('globalState') || '{}';
    const result =  JSON.parse(profile);

    let line1 = error.message;
    let line2 = '';

    if(error?.stack?.split("\n")[0]){
        line1 = error?.stack?.split("\n")[0];
    }

    if(error.stack?.split("\n")[1]){
        line2 = error.stack?.split("\n")[1];
    }

    const infoDate = new Date().toISOString();


    const pagoPALinkHeader = {
        label: 'PagoPA S.p.A.',
        href: 'https://www.pagopa.it/',
        ariaLabel: 'Link: vai al sito di PagoPA S.p.A.',
        title: 'Sito di PagoPA S.p.A.',
    };

    const LANGUAGES = {
        it: {
            it: 'Italiano',
            en: 'Inglese',
            fr: 'Francese',
        },
        en: {
            it: 'Italian',
            en: 'English',
            fr: 'French',
        },
        fr: {
            it: 'Italien',
            en: 'Anglais',
            fr: 'Français',
        },
    };
    
    
    const companyLegalInfo = (
        <>
            <strong>PagoPA S.p.A.</strong>
            {' '}
          — società per azioni con socio unico -
          capitale sociale di euro 1,000,000 interamente versato - sede legale in
          Roma, Piazza Colonna 370,
            <br />
          CAP 00187 - n. di iscrizione a Registro Imprese di Roma, CF e P.IVA
          15376371009
        </>
    );
    
    const pagoPALink: CompanyLinkType = {
        href: "https://www.pagopa.it/",
        ariaLabel: "Link: vai al sito di PagoPA S.p.A.",
    };
          
    const postLoginLinks: Array<FooterLinksType> = [
        {
            label: "Informativa Privacy",
            href: "https://www.pagopa.it/it/informativa-privacy-area-riservata/",
            ariaLabel: "Vai al link: Informativa Privacy",
            linkType: "internal",
        },
        {
            label: "Diritto alla protezione dei dati personali",
            href: "https://privacyportal-de.onetrust.com/webform/77f17844-04c3-4969-a11d-462ee77acbe1/9ab6533d-be4a-482e-929a-0d8d2ab29df8",
            ariaLabel: "Vai al link: Diritto alla protezione dei dati personali",
            linkType: "internal",
        },
        {
            label: "Termini e condizioni",
            href: "https://www.pagopa.it/it/termini-condizioni-area-riservata/",
            ariaLabel: "Vai al link: Termini e condizioni",
            linkType: "internal",
        },
        {
            label: "Accessibilità",
            href: "https://form.agid.gov.it/view/7aa810f2-bc15-40d1-b996-6eaa658439c3",
            ariaLabel: "Vai al link: Accessibilità",
            linkType: "internal",
        },
    ];
    
    
    const preLoginLinks: PreLoginFooterLinksType = {
        // First column
        aboutUs: {
            title: undefined,
            links: [
                {
                    label: "PagoPA S.p.A.",
                    href: "https://www.pagopa.it/it/societa/chi-siamo/",
                    ariaLabel: "Vai al link: Chi siamo",
                    linkType: "internal",
                },
                {
                    label: "Media",
                    href: "https://www.pagopa.it/it/",
                    ariaLabel: "Vai al link: Media",
                    linkType: "internal",
                },
                {
                    label: "Lavora con noi",
                    href: "https://www.pagopa.it/it/lavora-con-noi/",
                    ariaLabel: "Vai al link: Lavora con noi",
                    linkType: "internal",
                },
            ],
        },
        // Third column
        resources: {
            title: "Risorse",
            links: [
                {
                    label: "Informativa Privacy",
                    href: "https://www.pagopa.it/it/informativa-privacy-area-riservata/",
                    ariaLabel: "Vai al link: Informativa Privacy",
                    linkType: "internal",
                },
                {
                    label: "Certificazioni",
                    href: "https://www.pagopa.it/it/certificazioni/",
                    ariaLabel: "Vai al link: Certificazioni",
                    linkType: "internal",
                },
                {
                    label: "Sicurezza delle informazioni",
                    href: "https://www.pagopa.it/it/politiche-per-la-sicurezza-delle-informazioni/",
                    ariaLabel: "Vai al link: Sicurezza delle informazioni",
                    linkType: "internal",
                },
                {
                    label: "Diritto alla protezione dei dati personali",
                    ariaLabel: "Vai al link: Diritto alla protezione dei dati personali",
                    linkType: "internal",
                    href: "https://privacyportal-de.onetrust.com/webform/77f17844-04c3-4969-a11d-462ee77acbe1/9ab6533d-be4a-482e-929a-0d8d2ab29df8"
                },
                {
                    label: "Preferenze Cookie",
                    href: "#preferenze-cookie",
                    ariaLabel: "Vai al link: Preferenze Cookie",
                    linkType: "internal",
                    onClick: () => {
                        console.log("onClick");
                    },
                },
                {
                    label: "Termini e Condizioni",
                    href: "https://www.pagopa.it/it/termini-condizioni-area-riservata/",
                    ariaLabel: "Vai al link: Termini e Condizioni",
                    linkType: "internal",
                },
                {
                    label: "Società trasparente",
                    href: "https://pagopa.portaleamministrazionetrasparente.it/",
                    ariaLabel: "Vai al link: Società trasparente",
                    linkType: "internal",
                },
                {
                    label: "Responsible Disclosure Policy",
                    href: "https://www.pagopa.it/it/responsible-disclosure-policy/",
                    ariaLabel: "Vai al link: Responsible Disclosure Policy",
                    linkType: "internal",
                },
                {
                    label: "Modello 321",
                    href: "https://pagopa.portaleamministrazionetrasparente.it/pagina746_altri-contenuti.html",
                    ariaLabel: "Vai al link: Modello 321",
                    linkType: "internal",
                },
            ],
        },
        // Fourth column
        followUs: {
            title: "Seguici su",
            socialLinks: [
                {
                    icon: "linkedin",
                    title: "LinkedIn",
                    href: "https://www.linkedin.com/company/pagopa/",
                    ariaLabel: "Link: vai al sito LinkedIn di PagoPA S.p.A.",
                },
                {
                    title: "Twitter",
                    icon: "twitter",
                    href: "https://twitter.com/pagopa",
                    ariaLabel: "Link: vai al sito Twitter di PagoPA S.p.A.",
                },
                {
                    icon: "instagram",
                    title: "Instagram",
                    href: "https://www.instagram.com/pagopa/",
                    ariaLabel: "Link: vai al sito Instagram di PagoPA S.p.A.",
                },
                {
                    icon: "medium",
                    title: "Medium",
                    href: "https://medium.com/pagopa",
                    ariaLabel: "Link: vai al sito Medium di PagoPA S.p.A.",
                },
            ],
            links: [
                {
                    label: "Accessibilità",
                    href: "https://form.agid.gov.it/view/7aa810f2-bc15-40d1-b996-6eaa658439c3",
                    ariaLabel: "Vai al link: Accessibilità",
                    linkType: "internal",
                },
            ],
        },
    };
  
    



    return  ( <ThemeProvider theme={theme}>
        <div className="div_header">
            <HeaderAccount
                rootLink={pagoPALinkHeader}
                enableLogin={false}
                onAssistanceClick={() => {
             
                    if(result.profilo.auth === 'PAGOPA'){
                        window.open(`mailto:fatturazione@assistenza.pagopa.it`);
                    }else{
        
                        window.location.href = "https://uat.selfcare.pagopa.it/assistenza?productId=prod-pf";
                        localStorage.clear(); 
                    }
                }}
            />
        </div>

        <div className='container d-flex align-items-center justify-content-center my-5'>
            <div>
                <div >
                    <Box sx={{textAlign:'center', paddingTop:'24px'}} >
                        <IllusError title='errore' />
                    </Box>
                </div>
                <div className='m-3 p-3'>
                    <Typography sx={{textAlign:'center'}} variant="h3">Qualcosa è andato storto</Typography>
                </div>
                <div className='bg-light rounded-3 m-3 p-3'>
                    <Typography sx={{textAlign:'center'}} variant="body1">
                    Siamo spiacenti, ma si è verificato un errore imprevisto durante l'utilizzo del portale.
                    </Typography>
                    <Typography sx={{textAlign:'center'}} variant="body1">
                    Il nostro team sta lavorando per risolvere questo problema il più rapidamente possibile.
                    </Typography>
                    <Typography sx={{textAlign:'center'}} variant="body1">
                    Grazie per la comprensione.
                    </Typography>
                </div>
                <div className='bg-light rounded-3 m-3 p-3'>
                    <Typography sx={{textAlign:'center'}} variant="body1">
                        <ListItemText primary="Contattare l'assistenza del Portale Fatturazione e fornire i seguenti dati" />
                    </Typography>
                </div>
                
                <div  className='bg-light rounded-3 m-4 p-4 border border-danger'>
                    <Typography id="textError1"  variant="h6" sx={{textAlign:'center', marginBottom:'24px'}} >
                        {line1}
                    </Typography>
                    <Typography id="textError2" variant="h6" sx={{textAlign:'center', marginBottom:'24px'}} >
                        {line2}
                    </Typography>
                    <Typography id="textError3" variant="h6" sx={{textAlign:'center', marginBottom:'24px'}} >
                        {infoDate}
                    </Typography>
                </div>
                <div className='d-flex align-items-center justify-content-center mt-5'>
                    <Button 
                        id="copyButton"
                        variant="contained"
                        onClick={()=> resetErrorBoundary()}
                    >{result.profilo.auth === 'PAGOPA' ? "Reset" : "Copia la descrizione dell'errore"}</Button>
                </div>
            </div>
        </div>
        <div>
            <Footer
                loggedUser={false}
                companyLink={pagoPALink}
                legalInfo={companyLegalInfo}
                postLoginLinks={postLoginLinks}
                languages={LANGUAGES}
                currentLangCode={'it'}
                preLoginLinks={preLoginLinks}
                onLanguageChanged={
                    () => {
                        console.log("Changed Language");
                    }
                }
                productsJsonUrl="https://dev.selfcare.pagopa.it/assets/products.json"
                hideProductsColumn={false}
            /> 
        </div>
      
    </ThemeProvider>);
}

export default BundleError;