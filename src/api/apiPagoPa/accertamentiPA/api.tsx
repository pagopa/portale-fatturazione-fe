import axios from "axios";
import { url } from "../../api";

export const getListaAccertamentiPagoPa = async (token:string, nonce:string , body: {anno:number, mese?:number}) => {
    const response =  await axios.post(`${url}/api/accertamenti/report?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};

export const getDownloadSingleAccertamentoPagoPa = async (token:string, nonce:string , body: {idReport:number}) => {
    const response =  await axios.post(`${url}/api/accertamenti/report/download?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};