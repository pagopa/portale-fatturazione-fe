import axios from "axios";
import { BodyListaNotifiche } from "../../../types/typesGeneral";
import { url } from "../../api";
import { ModalBodyContestazioneModifyPagoPa } from "../../../types/typeReportDettaglio";
import { BodyContestazionePage } from "../../../page/prod_pn/inserimentoContestazioni";

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

export const downloadNotifchePagoPa  = async (token:string, nonce:string , body: BodyListaNotifiche) => {
    const response =  await axios.post(`${url}/api/notifiche/pagopa/documento/ricerca?binary=false&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
            "Accept" : "application/octet-stream, application/json, text/plain, */*"
        },
        responseType: 'arraybuffer',
        maxContentLength: Infinity,
        maxBodyLength: Infinity
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


export const getTipologiaEntiCompletiPagoPa = async (token:string, nonce:string , tipo:string) => {
    const response =  await axios.post(`${url}/api/tipologia/enti/fornitori?nonce=${nonce}`,
        {tipo},
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );
    return response;
};

export const getAnniContestazioni = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/notifiche/pagopa/contestazioni/anni?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getAnniNotifiche = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/notifiche/anni?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getMesiContestazioni = async (token:string, nonce:string , anno:string) => {
    const response =  await axios.post(`${url}/api/notifiche/pagopa/contestazioni/mesi?nonce=${nonce}`,
        {anno},
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );
    return response;
};

export const getEntiContestazioni = async (token:string, nonce:string , descrizione:string) => {
    const response =  await axios.post(`${url}/api/notifiche/pagopa/contestazioni/enti?nonce=${nonce}`,
        {descrizione},
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );
    return response;
};


export const uploadContestazioniAzure = async (token:string, nonce:string , formData:FormData) => {


    const response =  await axios.post(`${url}/api/notifiche/pagopa/contestazioni/upload?nonce=${nonce}`,
        formData,
        { headers: {
            Authorization: 'Bearer ' + token,
            ContentType : 'multipart/form-data',
        },
        }
    );
    return response;
};

export const recapContestazioniAzure = async (token:string, nonce:string , body:BodyContestazionePage) => {
    const response =  await axios.post(`${url}/api/notifiche/pagopa/contestazioni/recap?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
            ContentType : 'multipart/form-data',
        },
        }
    );
    return response;
};

export const getMesiNotifiche = async (token:string, nonce:string , body:{anno:string}) => {
    const response =  await axios.post(`${url}/api/notifiche/mesi?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );
    return response;
};


export const getDettaglioContestazione = async (token:string, nonce:string , idReport:number) => {
    const response =  await axios.get(`${url}/api/notifiche/pagopa/contestazioni/reports/steps?idreport=${idReport}&nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};
