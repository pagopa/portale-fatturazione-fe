import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
// don't want to use this?
// have a look at the Quick start guide 
// for passing in lng and translations on init

i18n
// load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
// learn more: https://github.com/i18next/i18next-http-backend
// want your translations to be loaded from a professional CDN? => https://github.com/locize/react-tutorial#step-2---use-the-locize-cdn
    .use(Backend)
// detect user language
// learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
// pass the i18n instance to react-i18next.
    .use(initReactI18next)
// init i18next
// for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        fallbackLng: 'ita',
        debug: true,

        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        resources:{
            ita:{
                translation:{
                    errori:{
                        401:"Utente non autenticato. Effettuare nuovamente l'accesso",
                        403:"Utente non autenticato. Effettuare nuovamente l'accesso",
                        419:"Sessione scaduta. Effettuare nuovamente l'accesso",
                        500:"L'operazione non è andata a buon fine. Si prega di riprovare",
                        400:"L'operazione non è andata a buon fine. Contattare l'assistenza",
                        404:"La ricerca non ha prodotto risultati",
                        "Network Error":"La connessione Internet risulta non attiva"
                    }
                }
            }
        }
    });


export default i18n;