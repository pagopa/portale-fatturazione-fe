import { Footer } from '@pagopa/mui-italia';
import { useContext, useState } from 'react';
import { GlobalContext } from '../store/context/globalContext';
import { LangCode } from '../types/typesGeneral';
import { companyLegalInfo, LANGUAGES, pagoPALink, postLoginLinks, preLoginLinks } from '../assets/dataLayout';

const FooterComponent = () => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
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
                productsJsonUrl="https://dev.selfcare.pagopa.it/assets/products.json"
                hideProductsColumn={false}
            /> 
        </div>
    );
};

export default FooterComponent;
