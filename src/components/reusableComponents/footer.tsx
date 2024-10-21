import { CompanyLinkType, Footer } from '@pagopa/mui-italia';
import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import '../../style/areaPersonaleUtenteEnte.css';
import { GlobalContext } from '../../store/context/globalContext';
import { redirect } from '../../api/api';
import useIsTabActive from '../../reusableFunction/tabIsActiv';
import { getProfilo } from '../../reusableFunction/actionLocalStorage';

type LangCode = "it" | "en";
type LinkType = "internal" | "external";
type FooterLinksType = {
    label: string;
    href?: string;
    ariaLabel: string;
    linkType: LinkType;
    onClick?: () => void;
};

type PreLoginFooterSingleSectionType = {
    title?: string;
    links: Array<FooterLinksType>;
};

type PreLoginFooterSocialLink = {
    icon: string;
    /** the url to witch the user will be redirect */
    href?: string;
    title: string;
    ariaLabel: string;
    /** if defined it will override the href behavior */
    onClick?: () => void;
};

type PreLoginFooterLinksType = {
    aboutUs: PreLoginFooterSingleSectionType;
    resources: PreLoginFooterSingleSectionType;
    followUs: {
        title: string;
        socialLinks: Array<PreLoginFooterSocialLink>;
        links: Array<FooterLinksType>;
    };
};

const FooterComponent = () => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;


    const profilo =  mainState.profilo;
    const tabActive = useIsTabActive();


    useEffect(()=>{
        if(mainState.authenticated === true && window.location.pathname !== '/selezionaprodotto' && tabActive === true && (mainState.nonce !== profilo.nonce)){
            window.location.href = redirect;
        }
    },[tabActive]);
    
    const [ lang, setLang ] = useState<LangCode>("it"); 
    const location = useLocation();

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
      

  

    const hideFooter = location.pathname === '/auth' ||
    location.pathname === '/azure' ||
    location.pathname === '/auth/azure';



      



    return (
        <div>
            {!hideFooter && 
            <Footer
                loggedUser={mainState.authenticated}
                companyLink={pagoPALink}
                legalInfo={companyLegalInfo}
                postLoginLinks={postLoginLinks}
                languages={LANGUAGES}
                currentLangCode={lang}
                preLoginLinks={preLoginLinks}
                onLanguageChanged={
                    () => {
                        console.log("Changed Language");
                    }
                }
                productsJsonUrl="https://dev.selfcare.pagopa.it/assets/products.json"
                hideProductsColumn={false}
            /> }
        </div>

    );
};

export default FooterComponent;
