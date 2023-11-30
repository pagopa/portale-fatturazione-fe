import React, { useEffect } from 'react';
import { Footer } from '@pagopa/mui-italia';
import { useState } from 'react';
import { useLocation } from 'react-router';
import '../style/areaPersonaleUtenteEnte.css';

type LangCode = "it" | "en";
type LinkType = "internal" | "external";
type FooterLinksType = {
    label: string;
    /** the url to witch the user will be redirect */
    href?: string;
    ariaLabel: string;
    linkType: LinkType;
    /** if defined it will override the href behavior */
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

export default function FooterPostLogin() {
    console.log("FOOTER");
    const [ lang, setLang ] = useState<LangCode>("it"); 
    const location : any = useLocation();

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

    const pagoPALink = {
        href: 'https://www.pagopa.it/',
        ariaLabel: 'Link: vai al sito di PagoPA S.p.A.',
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

 

    const postLoginLinks: Array<FooterLinksType> = [
        {
            label: "Informativa Privacy",
            href: "#informativa-privacy",
            ariaLabel: "Vai al link: Informativa Privacy",
            linkType: "internal",
        },
        {
            label: "Diritto alla protezione dei dati personali",
            href: "#diritto-allaprotezionedipersonalidati",
            ariaLabel: "Vai al link: Diritto alla protezione dei dati personali",
            linkType: "internal",
        },
        {
            label: "Termini e condizioni",
            href: "#terms-conditions",
            ariaLabel: "Vai al link: Termini e condizioni",
            linkType: "internal",
        },
        {
            label: "Accessibilità",
            href: "#accessibility",
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
                    label: "Chi siamo",
                    href: "#chi-siamo",
                    ariaLabel: "Vai al link: Chi siamo",
                    linkType: "internal",
                },
                {
                    label: "PNRR",
                    href: "#pnrr",
                    ariaLabel: "Vai al link: PNRR",
                    linkType: "internal",
                },
                {
                    label: "Media",
                    href: "#media",
                    ariaLabel: "Vai al link: Media",
                    linkType: "internal",
                },
                {
                    label: "Lavora con noi",
                    href: "#lavora-con-noi",
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
                    href: "#informativa-privacy",
                    ariaLabel: "Vai al link: Informativa Privacy",
                    linkType: "internal",
                },
                {
                    label: "Certificazioni",
                    href: "#certificazioni",
                    ariaLabel: "Vai al link: Certificazioni",
                    linkType: "internal",
                },
                {
                    label: "Sicurezza delle informazioni",
                    href: "#sicurezza-delle-informazioni",
                    ariaLabel: "Vai al link: Sicurezza delle informazioni",
                    linkType: "internal",
                },
                {
                    label: "Diritto alla protezione dei dati personali",
                    ariaLabel: "Vai al link: Diritto alla protezione dei dati personali",
                    linkType: "internal",
                    onClick: () => {
                        console.log("onClick");
                    },
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
                    href: "#terms-conditions",
                    ariaLabel: "Vai al link: Termini e Condizioni",
                    linkType: "internal",
                },
                {
                    label: "Società trasparente",
                    href: "#societa-trasparente",
                    ariaLabel: "Vai al link: Società trasparente",
                    linkType: "internal",
                },
                {
                    label: "Responsible Disclosure Policy",
                    href: "#responsible-disclosure-policy",
                    ariaLabel: "Vai al link: Responsible Disclosure Policy",
                    linkType: "internal",
                },
                {
                    label: "Modello 321",
                    href: "#modello-321",
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
                    href: "#accessibilità",
                    ariaLabel: "Vai al link: Accessibilità",
                    linkType: "internal",
                },
            ],
        },
    };

    const getDataUser = localStorage.getItem('dati')|| '{}';
    
    const dataUser = JSON.parse(getDataUser);

    const [statusLog, setStatusLog] = useState(false);

    useEffect(()=>{
        const bool = getDataUser === '{}' ? false : true;
        setStatusLog(bool);
    },[dataUser]);

    return (
        <div>
            {( location.pathname === '/auth')  ? null : 
                <Footer
                    loggedUser={statusLog}
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
                />}
        </div>

    );
}

