import axios from "axios";
import { url } from "../../api";

export interface BodyWhite {
    idEnti: string[]
    tipologiaContratto: number|null
    tipologiaFattura: string|null
    anno: number|null
    mesi: number[]
}


export const getAnniWhite = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/fatture/pagopa/whitelist/anni?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getMesiWhite = async (token:string, nonce:string , body:{anno:number}) => {
    const response =  await axios.post(`${url}/api/fatture/pagopa/whitelist/mesi?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );
    return response;
};

export const getTipologiaFatturaWhite = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/fatture/pagopa/whitelist/tipologieFattura?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getWhiteListPagoPa = async (token:string, nonce:string, page:number, pageSize:number, body:BodyWhite) => {
    const response =  await axios.post(`${url}/api/fatture/pagopa/whitelist?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};


export const deleteWhiteListPagoPa = async (token:string, nonce:string, body:number[]) => {
    const response =  await axios.delete(`${url}/api/fatture/pagopa/whitelist?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        data:{ids:body}
        }
    );
    return response;
};