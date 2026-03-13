import { Footer } from '@pagopa/mui-italia';
import {  useState } from 'react';
import { LangCode } from '../types/typesGeneral';
import { companyLegalInfo, LANGUAGES, pagoPALink, postLoginLinks, preLoginLinks } from '../assets/dataLayout';
import { useGlobalStore } from '../store/context/useGlobalStore';

const FooterComponent = () => {

    const mainState = useGlobalStore(state => state.mainState);
    const [ lang, setLang ] = useState<LangCode>("it"); 

    return (
        <div>
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
                productsJsonUrl="https://selfcare.pagopa.it/assets/products.json"
                hideProductsColumn={false}
            /> 
        </div>
    );
};

export default FooterComponent;
