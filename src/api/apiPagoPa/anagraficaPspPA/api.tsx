import axios from "axios";
import { url } from "../../api";
import { RequestBodyListaAnagraficaPsp } from "../../../types/typeAngraficaPsp";

export const getListaAnagraficaPsp = async (token:string, nonce:string , body:RequestBodyListaAnagraficaPsp, page:number, pageSize:number) => {
    const response =  await axios.post(`${url}/api/v2/pagopa/psps?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }
        }
    );
    return response;
};

export const getListaNamePsp = async (token:string, nonce:string , body:{name:string}) => {
    const response =  await axios.post(`${url}/api/v2/pagopa/psps/name?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }
        }
    );
    return response;
};


export const downloadPsp = async (token:string, nonce:string , body:RequestBodyListaAnagraficaPsp) => {
    const response =  await fetch(`${url}/api/v2/pagopa/psps/document?nonce=${nonce}`,
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

export const getListaAnniPsp = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/v2/pagopa/psps/years?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
}; 

export const getListaQuarters = async (token:string, nonce:string , body:{year:string}) => {
    const response =  await axios.post(`${url}/api/v2/pagopa/psps/quarters?nonce=${nonce}`,
        body,
        { headers: { Authorization: 'Bearer ' + token }}
    );
    return response;
};