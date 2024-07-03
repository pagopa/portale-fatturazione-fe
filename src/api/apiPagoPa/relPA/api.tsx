import axios from "axios";
import { url } from "../../api";
import { BodyRel, BodyRelLog } from "../../../types/typeRel";


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


export const downloadListaRelPdfZipPagopa = async (token:string, nonce:string , body: any) => {
  
    const response = await fetch(`${url}/api/rel/pagopa/firma/download?nonce=${nonce}`, 
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

export const getLogPagoPaRelDocumentoFirmato = async (token:string, nonce:string , body: BodyRelLog) => {
    const response =  await axios.post(`${url}/api/rel/pagopa/firma/log?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};

export const getRelPdfPagoPa = async ( token:string ,nonce:string , id:string) => {
    const response =  await axios.get(`${url}/api/rel/pagopa/documento/download/${id}?nonce=${nonce}`,  
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const downloadQuadraturaRelPagopa = async (token:string, nonce:string , body: BodyRel) => {
    const response =  await axios.post(`${url}/api/rel/pagopa/quadratura/ricerca?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};


export const getTipologieFatturePagoPa = async (token:string, nonce:string , body: {mese:number,anno:number}) => {
    const response =  await axios.post(`${url}/api/rel/pagopa/tipologiafattura?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};



