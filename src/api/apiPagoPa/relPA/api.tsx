import axios from "axios";
import { url } from "../../api";
import { BodyRel } from "../../../types/typeRel";

export const getListaRelPagoPa = async (token:string, nonce:string , page:number, pageSize:number, body: BodyRel) => {
    const response =  await axios.post(`${url}/api/rel/pagopa?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};

export const downloadListaRelPagopa = async (token:string, nonce:string , body: BodyRel) => {
    const response =  await axios.post(`${url}/api/rel/pagopa/documento/ricerca?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};

export const getRelExelPagoPa = async ( token:string ,nonce:string , id:string) => {
    const response =  await axios.get(`${url}/api/rel/pagopa/righe/${id}?nonce=${nonce}`,  
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getSingleRelPagopa = async ( token:string ,nonce:string , id:string) => {
    const response =  await axios.get(`${url}/api/rel/pagopa/${id}?nonce=${nonce}`,  
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getRelPdfFirmatoPagoPa = async ( token:string ,nonce:string , id:string) => {
    const response =  await axios.get(`${url}/api/rel/pagopa/firma/download/${id}?nonce=${nonce}`,  
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};

export const downloadListaRelPdfZipPagopa = async (token:string, nonce:string , body: BodyRel) => {
    const response =  await axios.post(`${url}/api/rel/pagopa/firma/download?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        }
    );
    return response;
};


