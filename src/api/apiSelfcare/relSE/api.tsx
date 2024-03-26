import axios from "axios";
import { BodyRel, BodyRelLog } from "../../../types/typeRel";
import { url } from "../../api";

export const getListaRel = async (token:string, nonce:string , page:number, pageSize:number, body: BodyRel) => {
    const response =  await axios.post(`${url}/api/rel/ente?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};

export const getSingleRel = async (token:string, nonce:string , id:string) => {
    const response =  await axios.get(`${url}/api/rel/ente/${id}?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getRelPdf = async ( token:string ,nonce:string , id:string) => {
    const response =  await axios.get(`${url}/api/rel/ente/download/${id}?nonce=${nonce}`,  
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getRelExel = async ( token:string ,nonce:string , id:string) => {
    const response =  await axios.get(`${url}/api/rel/ente/righe/${id}?nonce=${nonce}`,  
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const downloadListaRel = async (token:string, nonce:string , body: BodyRel) => {
    const response =  await axios.post(`${url}/api/rel/ente/documento/ricerca?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};


export const uploadPdfRel = async (token:string, nonce:string , id:string, body: any) => {
    const response =  await axios.post(`${url}/api/rel/firma/upload/${id}?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
            'Content-type': 'multipart/form-data',
        },
        }
    );
    return response;
};

export const getRelPdfFirmato = async ( token:string ,nonce:string , id:string) => {
    const response =  await axios.get(`${url}/api/rel/firma/download/${id}?nonce=${nonce}`,  
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getLogRelDocumentoFirmato = async (token:string, nonce:string , body: BodyRelLog) => {
    const response =  await axios.post(`${url}/api/rel/firma/log?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};