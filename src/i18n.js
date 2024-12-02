import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n.use(Backend)    
    .use(LanguageDetector)
    .use(initReactI18next).init({
        fallbackLng: 'ita',
        resources:{
            it:{
                translation:{
                    errori:{
                        401:"Utente non autenticato. Effettuare nuovamente l'accesso",
                        403:"Utente non autenticato. Effettuare nuovamente l'accesso",
                        419:"Sessione scaduta. Effettuare nuovamente l'accesso",
                        500:"L'operazione non è andata a buon fine. Si prega di riprovare",
                        400:"L'operazione non è andata a buon fine. Contattare l'assistenza",
                        404:"La ricerca non ha prodotto risultati",
                        410:"La risorsa non è più disponibile",
                        '404_DOWNLOAD':"L'azione di download non ha prodotto risultati",
                        '404_RAGIONE_SOCIALE':"La ricerca per Rag. Soc. Ente non ha prodotto risultati",
                        "Network Error":"La connessione Internet risulta non attiva",
                        'PRESA':"Azione presa in carico",
                        'FATTURA_SOSPESA_RIPRISTINATA':"Operazione andata a buon fine",
                        'PRESA_IN_CARICO_DOCUMENTO':"Azione presa in carico. Vai ai messaggi per visualizzare lo stato di elaborazione",
                        'ERRORE_MANUALE':'Manuale momentaneamente non disponibile'
                    }
                }
            }
        }
    });


export default i18n;