import axios from "axios";
import { url } from "../../api";
import { BodyListaNotifiche, BodyListaNotificheConsolidatore, BodyListaNotificheSelfcare } from "../../../types/typesGeneral";
import { BodyListaEnti, ModalBodyContestazione, ModalBodyContestazioneModify } from "../../../types/typeReportDettaglio";

export const listaNotifiche = async (token:string, nonce:string , page:number, pageSize:number, body: BodyListaNotificheSelfcare) => {
    const response =  await axios.post(`${url}/api/notifiche/ente?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};

export const listaNotificheRecapitista = async (token:string, nonce:string , page:number, pageSize:number, body: BodyListaNotificheSelfcare) => {
    const response =  await axios.post(`${url}/api/notifiche/recapitista?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};

export const listaNotificheConsolidatore = async (token:string, nonce:string , page:number, pageSize:number, body: BodyListaNotificheConsolidatore) => {
    const response =  await axios.post(`${url}/api/notifiche/consolidatore?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
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

export const getContestazioneRecapitista = async (token:string, nonce:string , idNotifica:string) => {
    const response =  await axios.get(`${url}/api/notifiche/recapitista/contestazione/${idNotifica}?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getContestazioneCosolidatore = async (token:string, nonce:string , idNotifica:string) => {
    const response =  await axios.get(`${url}/api/notifiche/consolidatore/contestazione/${idNotifica}?nonce=${nonce}`,
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

export const modifyContestazioneRecapitista = async (token:string, nonce:string , body: ModalBodyContestazioneModify) => {
    const response =  await axios.put(`${url}/api/notifiche/recapitista/contestazione?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );
    return response;
};

export const modifyContestazioneConsolidatore = async (token:string, nonce:string , body: ModalBodyContestazioneModify) => {
    const response =  await axios.put(`${url}/api/notifiche/consolidatore/contestazione?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );
    return response;
};



export const downloadNotifche = async (token:string, nonce:string , body: BodyListaNotificheSelfcare) => {
    const response =  await axios.post(`${url}/api/notifiche/ente/documento/ricerca?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );
    return response;
};

export const downloadNotifcheRecapitista = async (token:string, nonce:string , body: BodyListaNotificheSelfcare) => {
    const response =  await axios.post(`${url}/api/notifiche/recapitista/documento/ricerca?binary=false&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );
    return response;
};

export const downloadNotifcheConsolidatore = async (token:string, nonce:string , body: BodyListaNotificheConsolidatore) => {
    const response =  await axios.post(`${url}/api/notifiche/consolidatore/documento/ricerca?binary=false&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );
    return response;
};
export const listaEntiNotifichePageConsolidatore = async (token:string, nonce:string , body: BodyListaEnti) => {
    const response =  await axios.post(`${url}/api/tipologia/enti/consolidatore/completi?nonce=${nonce}`,
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
