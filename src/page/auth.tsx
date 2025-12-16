import { useSearchParams, useNavigate, useNavigation, useLoaderData, Await } from 'react-router-dom';
import { selfcareLogin, getAuthProfilo, manageError, redirect, getPageApiKeyVisible } from '../api/api';
import { Suspense, useEffect} from 'react';
import { getDatiModuloCommessa } from '../api/apiSelfcare/moduloCommessaSE/api';
import { PathPf } from '../types/enum';

import Loader from '../components/reusableComponents/loader';
import { useGlobalStore } from '../store/context/useGlobalStore';
import { getDatiFatturazione } from '../api/apiSelfcare/datiDiFatturazioneSE/api';

// Blank page utilizzata per l'accesso degli utenti tramite  Selfcare

/*quando l'utente SELFCARE va al link https://uat.selfcare.pagopa.it/auth/login , procede con login es. (comune di Erba ) , viene fatto un redirect
automatico su questa ('/auth?selfcareToken=token') blank page dove , se c'è un profilo già presente nella LOCAL STORAGE lo andiamo ad eliminare , prendiamo il token che selfcare ci inserisce nell'url ,
e andiamo a fare la prima chiamata getSelfcare che ci restituisce un secondo token che noi utilizziamo nella seconda chiamata getProfilo.
Nella risposta della chiamata getProfilo noi andiamo ad estrapolare il jwt, salvarlo nella LOCAL STORAGE, così da poterlo utilizzare in ogni chiamata 
da parte dell'utente SELFCARE

*/

type  Jwt = {
    jwt:string
}
interface ParameterGetProfilo {
    data:Jwt[]
}
const Auth : React.FC = () =>{

    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
    const setMainData = useGlobalStore(state => state.setMainData);
    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
    
  
    const [searchParams] = useSearchParams();
    const token = searchParams.get('selfcareToken');
    const navigate = useNavigate();


    useEffect(()=>{
        loginAuth();
    },[]);

    

    const loginAuth = async () =>{
  
        if (!token) {
            return window.location.href = redirect;
        }
    
        try {
        // 1️⃣ selfcare
            const selfcareRes = await selfcareLogin(token);
    
            localStorage.removeItem("globalStatePF");
            localStorage.removeItem("filters");
    
            if (selfcareRes.status !== 200) {
                return window.location.href = redirect;
            }
    
            // 2️⃣ profilo
            const profiloRes = await getAuthProfilo(selfcareRes.data[0].jwt);
            const storeProfilo = profiloRes.data;
    
            const newProfilo = {
                auth: storeProfilo.auth,
                nomeEnte: storeProfilo.nomeEnte,
                descrizioneRuolo: storeProfilo.descrizioneRuolo,
                ruolo: storeProfilo.ruolo,
                dataUltimo: storeProfilo.dataUltimo,
                dataPrimo: storeProfilo.dataPrimo,
                prodotto: storeProfilo.prodotto,
                jwt: selfcareRes.data[0].jwt,
                profilo: storeProfilo.profilo,
                nonce: storeProfilo.nonce,
                user: { name: "", ruolo: storeProfilo.descrizioneRuolo, id: "1" },
                idTipoContratto: storeProfilo.idTipoContratto,
                idEnte: storeProfilo.idEnte,
            };
    
            handleModifyMainState({
                authenticated: true,
                profilo: newProfilo,
                prodotti: [],
                mese: "",
                anno: "",
                nomeEnteClickOn: "",
                datiFatturazione: false,
                primoInserimetoCommessa: true,
                statusPageDatiFatturazione: "immutable",
                statusPageInserimentoCommessa: "immutable",
                apiError: null,
                badgeContent: 0,
                messaggioSelected: null,
            });
    
    
            if (storeProfilo.profilo === "REC" || storeProfilo.profilo === "CON") {
                return navigate(PathPf.LISTA_NOTIFICHE_REC_CON);
            }
    
     
            const commessaRes = await getDatiModuloCommessa(
                newProfilo.jwt,
                newProfilo.nonce
            );
    
            if (commessaRes.data.modifica === true && commessaRes.data.moduliCommessa.length === 0) {
                handleModifyMainState({
                    inserisciModificaCommessa: "INSERT",
                    statusPageInserimentoCommessa: "mutable",
                    primoInserimetoCommessa: true,
                });
            } else if (commessaRes.data.modifica === true) {
                handleModifyMainState({
                    inserisciModificaCommessa: "MODIFY",
                    statusPageInserimentoCommessa: "immutable",
                    primoInserimetoCommessa: false,
                });
            } else {
                handleModifyMainState({
                    inserisciModificaCommessa: "NO_ACTION",
                    statusPageInserimentoCommessa: "immutable",
                    primoInserimetoCommessa: false,
                });
            }
    
            await getDatiFat(newProfilo.jwt, newProfilo.nonce,handleModifyMainState);
            await apiKeyPageAvailable(newProfilo.jwt, newProfilo.nonce,setMainData);
            //evita la chimata se lato AZURE
            navigate(PathPf.DATI_FATTURAZIONE_EN);
            
     
    
        } catch (err) {
        
            return window.location.href = redirect;
        }
    };
       
    return (
        <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
            <div id='loader_on_gate_pages'>
                <Loader sentence={'Autenticazione in corso...'}></Loader> 
            </div>
        </div>
    );
};

export default Auth;


const apiKeyPageAvailable = async (token: string, profilo, setMainData) => {
    try {
        const res = await getPageApiKeyVisible(token, profilo);
    
        const newKeys = res?.data
            ?.map((el) => el.apiKey)
            .filter((el) => el !== null);
    
        setMainData((prev) => ({
            ...prev,
            apiKeyPage: {
                ...prev.apiKeyPage,
                keys: newKeys,
                ip: [],
                visible: true,
            },
        }));
    } catch (err: any) {
        const status = err?.response?.status;
    
        if (status === 401) {
            setMainData((prev) => ({
                ...prev,
                apiKeyPage: { ...prev.apiKeyPage, visible: false },
            }));
        } else if (status === 404) {
            setMainData((prev) => ({
                ...prev,
                apiKeyPage: { ...prev.apiKeyPage, visible: true },
            }));
        } else {
            setMainData((prev) => ({
                ...prev,
                apiKeyPage: { ...prev.apiKeyPage, visible: false },
            }));
        }
    }
};
    
    
const getDatiFat = async (token: string, profilo,handleModifyMainState) => {
    try {
        await getDatiFatturazione(token, profilo);
    
        // ✅ dati fatturazione presenti
        handleModifyMainState({ datiFatturazione: true });
    
    } catch (err: any) {
        // ✅ 404 = dati fatturazione NON presenti
        if (err?.response?.status === 404) {
            handleModifyMainState({ datiFatturazione: false });
        } else {
            // optional: handle other errors if needed
            handleModifyMainState({ datiFatturazione: false });
        }
    }
};

