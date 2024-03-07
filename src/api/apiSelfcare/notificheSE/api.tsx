import axios from "axios";
import { url } from "../../api";
import { BodyListaNotifiche } from "../../../types/typesGeneral";
import { BodyListaEnti, ModalBodyContestazione, ModalBodyContestazioneModify } from "../../../types/typeReportDettaglio";

export const listaNotifiche = async (token:string, nonce:string , page:number, pageSize:number, body: BodyListaNotifiche) => {
    const response =  await axios.post(`${url}/api/notifiche/ente?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};

export const tipologiaTipoContestazione = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/tipologia/tipocontestazione?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const flagContestazione = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/tipologia/flagcontestazione?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const createContestazione = async (token:string, nonce:string , body: ModalBodyContestazione) => {
    const response =  await axios.post(`${url}/api/notifiche/contestazione?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );
    return response;
};

export const getContestazione = async (token:string, nonce:string , idNotifica:string) => {
    const response =  await axios.get(`${url}/api/notifiche/contestazione/${idNotifica}?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const modifyContestazioneEnte = async (token:string, nonce:string , body: ModalBodyContestazioneModify) => {
    const response =  await axios.put(`${url}/api/notifiche/contestazione?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );
    return response;
};

export const downloadNotifche = async (token:string, nonce:string , body: BodyListaNotifiche) => {
    const response =  await axios.post(`${url}/api/notifiche/ente/documento/ricerca?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );
    return response;
};

export const listaEntiNotifichePage = async (token:string, nonce:string , body: BodyListaEnti) => {
    const response =  await axios.post(`${url}/api/tipologia/enti/completi?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );
    return response;
};
