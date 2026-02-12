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

export const getAnniWhiteAdd = async (token:string, nonce:string,body:{tipologiaFattura: string, idEnte: string}) => {
    const response =  await axios.post(`${url}/api/fatture/pagopa/whitelist/anni/modifica?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};

export const getMesiWhiteAdd = async (token:string, nonce:string,body:{tipologiaFattura: string, idEnte: string,anno:number}) => {
    const response =  await axios.post(`${url}/api/fatture/pagopa/whitelist/mesi/modifica?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};

export const whiteListAdd = async (token:string, nonce:string,body:{mesi: string[],anno:number,tipologiaFattura:string,idEnte:string}) => {
    const response =  await axios.post(`${url}/api/fatture/pagopa/whitelist/inserisci?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};

export const downloadWhiteListPagopa = async (token:string, nonce:string,body:BodyWhite) => {
    const response = await fetch(`${url}/api/fatture/pagopa/whitelist/download?nonce=${nonce}`, 
        {
            headers: {
                Authorization: 'Bearer '+token,
                'Content-type':'application/json'
            },
            method: 'POST',
            body:JSON.stringify(body),
        });
    return response;
};

