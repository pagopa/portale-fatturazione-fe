import axios from "axios";
import { BodyListaNotifiche } from "../../../types/typesGeneral";
import { url } from "../../api";
import { ModalBodyContestazioneModifyPagoPa } from "../../../types/typeReportDettaglio";

export const listaNotifichePagoPa = async (token:string, nonce:string , page:number, pageSize:number, body: BodyListaNotifiche) => {
    const response =  await axios.post(`${url}/api/notifiche/pagopa?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};

export const getContestazionePagoPa = async (token:string, nonce:string , idNotifica:string) => {
    const response =  await axios.get(`${url}/api/notifiche/pagopa/contestazione/${idNotifica}?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const modifyContestazioneEntePagoPa = async (token:string, nonce:string , body: ModalBodyContestazioneModifyPagoPa) => {
    const response =  await axios.put(`${url}/api/notifiche/pagopa/contestazione?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );
    return response;
};

export const downloadNotifchePagoPa = async (token:string, nonce:string , body: BodyListaNotifiche) => {
    const response =  await axios.post(`${url}/api/notifiche/pagopa/documento/ricerca?binary=false&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );
    return response;
};


export const getTipologieScadenziario = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/tipologia/scadenziariocontestazioni?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};
