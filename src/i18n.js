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
                        409:"L'operazione non è andata a buon fine",
                        419:"Sessione scaduta. Effettuare nuovamente l'accesso",
                        500:"L'operazione non è andata a buon fine. Si prega di riprovare",
                        400:"L'operazione non è andata a buon fine. Contattare l'assistenza",// mauro messaggio 
                        404:"La ricerca non ha prodotto risultati",
                        410:"La risorsa non è più disponibile",
                        '404_DOWNLOAD':"L'azione di download non ha prodotto risultati",
                        '404_RAGIONE_SOCIALE':"La ricerca per Rag. Soc. Ente non ha prodotto risultati",
                        "Network Error":"La connessione Internet risulta non attiva",
                        'PRESA':"Azione presa in carico",
                        'FATTURA_SOSPESA_RIPRISTINATA':"Operazione andata a buon fine",
                        'CAMBIO_TIPOLOGIA_CONTRATTO':"Operazione andata a buon fine",
                        'INSER_DELETE_WHITE_LIST':"Operazione andata a buon fine",
                        "SEND_JSON_SAP_OK":"Operazione andata a buon fine",
                        'PRESA_IN_CARICO_DOCUMENTO':"Azione presa in carico. Vai ai messaggi per visualizzare lo stato di elaborazione",
                        'PRESA_IN_CARICO_DOCUMENTO_ENTE':"Azione presa in carico. Visualizza lo stato di elaborazione",
                        'ERRORE_MANUALE':'Manuale momentaneamente non disponibile',
                        'ERROR_LIST_JSON_TO_SAP':"Dettaglio momentaneamente non disponibile",
                        "404_RIGHE_ID":"Il report di dettaglio notifiche Regolare Esecuzione sarà disponibile a breve",
                    }
                }
            }
        }
    });


export default i18n;