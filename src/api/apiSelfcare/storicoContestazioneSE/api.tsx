import axios from "axios";
import { url } from "../../api";
import { BodyContestazionePage } from "../../../page/ente/inserimentoContestazioniEnte";
import { BodyStoricoContestazioniSE } from "../../../page/ente/storicoContestazioniEnte";



export const getMesiContestazioniSE = async (token:string, nonce:string , anno:string) => {
    const response =  await axios.post(`${url}/api/notifiche/enti/contestazioni/mesi?nonce=${nonce}`,
        {anno},
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );
    return response;
};

export const getAnniContestazioniSE = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/notifiche/enti/contestazioni/anni?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getTipoReportConSE = async ( token:string ,nonce:string ) => {
    const response =  await axios.get(`${url}/api/notifiche/enti/contestazioni/tiporeport?nonce=${nonce}`,  
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};

export const getTipoContestazioniSE = async ( token:string ,nonce:string ) => {
    const response =  await axios.get(`${url}/api/notifiche/enti/contestazioni/steps?nonce=${nonce}`,  
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};

export const getListaStoricoSE = async (token:string, nonce:string , body: BodyStoricoContestazioniSE,page:number, pageSize:number) => {
    const response =  await axios.post(`${url}/api/notifiche/enti/contestazioni/reports?nonce=${nonce}&page=${page}&pageSize=${pageSize}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};
export const recapContestazioniSE = async (token:string, nonce:string , body:BodyContestazionePage) => {
    const response =  await axios.post(`${url}/api/notifiche/enti/contestazioni/recap?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
            ContentType : 'multipart/form-data',
        },
        }
    );
    return response;
};

export const uploadContestazioniSE = async (token:string, nonce:string , formData:FormData) => {
    const response =  await axios.post(`${url}/api/notifiche/enti/contestazioni/upload?nonce=${nonce}`,
        formData,
        { headers: {
            Authorization: 'Bearer ' + token,
            ContentType : 'multipart/form-data',
        },
        }
    );
    return response;
};

export const getTipoReportSE = async ( token:string ,nonce:string ) => {
    const response =  await axios.get(`${url}/api/notifiche/enti/contestazioni/tiporeport?nonce=${nonce}`,  
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};

export const getDettaglioContestazioneSE = async (token:string, nonce:string , idReport:number) => {
    const response =  await axios.get(`${url}/api/notifiche/enti/contestazioni/reports/steps?idReport=${idReport}&nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};

export const downloadReportContestazioneSE = async (token:string, nonce:string , idReport:number , tipoReport:string) => {

    const response =  await axios.get(`${url}/api/notifiche/enti/contestazioni/reports?nonce=${nonce}&idReport=${idReport}&tipoReport=${tipoReport}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
    
};

export const getContestazioneExelSE = async ( token:string ,nonce:string , body:{ idReport:number,step:number|null}) => {
    const response =  await axios.post(`${url}/api/notifiche/enti/contestazioni/reports/document?nonce=${nonce}`,  
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );

    return response;
};

export const getMesiContestazioniAzioniSE = async (token:string, nonce:string , anno:string) => {
    const response =  await axios.post(`${url}/api/notifiche/enti/contestazioni/azione/mesi?nonce=${nonce}`,
        {anno},
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );
    return response;
};

export const getAnniContestazioniAzioniSE = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/notifiche/enti/contestazioni/azione/anni?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};