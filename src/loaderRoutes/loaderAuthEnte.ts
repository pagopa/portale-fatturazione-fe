import { defer, redirect } from "react-router-dom";
import { useGlobalStore } from "../store/context/useGlobalStore";
import { getAuthProfilo, getPageApiKeyVisible, manageError, selfcareLogin } from "../api/api";
import { getDatiModuloCommessa } from "../api/apiSelfcare/moduloCommessaSE/api";
import { PathPf } from "../types/enum";
import { redirect as globalRedirect } from "../api/api";
import { getDatiFatturazione } from "../api/apiSelfcare/datiDiFatturazioneSE/api";


export async function authEnteLoader({ request }) {

    const url = new URL(request.url);
    const token = url.searchParams.get("selfcareToken");

    if (!token) {
        return redirect(globalRedirect);
    }

    const { dispatchMainState, setMainData } = useGlobalStore.getState();

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type: "MODIFY_MAIN_STATE",
            value: valueObj,
        });
    };

    try {
    // 1️⃣ selfcare
        const selfcareRes = await selfcareLogin(token);

        localStorage.removeItem("globalStatePF");
        localStorage.removeItem("filters");

        if (selfcareRes.status !== 200) {
            return redirect(globalRedirect);
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
            return redirect(PathPf.LISTA_NOTIFICHE_REC_CON);
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
        //redirect(PathPf.DATI_FATTURAZIONE_EN);
        
        return defer({ authData: true });

    } catch (err) {
    
        return redirect(globalRedirect);
    }

   
}



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