import axios from "axios";
import { url } from "../../api";

export interface BodyWhite {
    idEnti: string[]
    tipologiaContratto: number
    tipologiaFattura: string|null
    anno: number|string
    mese: number|string
}

export const getWhiteListPagoPa = async (token:string, nonce:string, page:number, pageSize:number, body:BodyWhite) => {
    const response =  await axios.post(`${url}/api/fatture/pagopa/whitelist?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};
