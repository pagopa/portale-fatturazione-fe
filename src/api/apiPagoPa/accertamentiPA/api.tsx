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

export const getDownloadSingleAccertamentoPagoPaCsv = async (token:string, nonce:string , body: {idReport:number}) => {

    const response =  await axios.post(`${url}/api/accertamenti/report/download?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
    
};

export const getDownloadSingleAccertamentoPagoPaZipExel = async (token:string, nonce:string , body: {idReport:number}) => {
    const response = await fetch(`${url}/api/accertamenti/report/download?nonce=${nonce}`, 
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


