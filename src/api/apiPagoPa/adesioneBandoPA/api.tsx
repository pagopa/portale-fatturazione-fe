import axios from "axios";
import { url } from "../../api";

export const listaAsseverazionePagopa = async (token:string, nonce:string) => {
    const response =  await axios.post(`${url}/api/asseverazione?nonce=${nonce}`,
        {},
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};

export const downloadDocumentoAsseverazionePagoPa = async (token:string, nonce:string) => {
    const response =  await axios.post(`${url}/api/asseverazione/documento?nonce=${nonce}`,
        {},
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};