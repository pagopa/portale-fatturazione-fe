import axios from "axios";
import { url } from "../../api";

export const getListaActionMonitoring = async (token:string, nonce:string , body:{init: string|null|Date,end:string|null|Date,stati: number[]},page:number,pageSize:number) => {
    const response =  await axios.post(`${url}/api/orchestratore?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
        },
        }
    );
    return response;
};

export const getStatiMonitoring = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/orchestratore/stati?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );

    return response;
};