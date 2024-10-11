import axios from "axios";
import { url } from "../../api";
import { RequestBodyListaAnagraficaPsp } from "../../../types/typeAngraficaPsp";

export const getListaAnagraficaPsp = async (token:string, nonce:string , body:RequestBodyListaAnagraficaPsp, page:number, pageSize:number) => {
    const response =  await axios.post(`${url}/api/v2/pagopa/psps?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};

export const getListaNamePsp = async (token:string, nonce:string , body:{name:string}) => {
    const response =  await axios.post(`${url}/api/v2/pagopa/psps/name?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};