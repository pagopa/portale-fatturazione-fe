import axios from "axios";
import { url } from "../../api";
import { BodyCentromessaggi } from "../../../types/typeCentroMessaggi";

export const getMessaggiCount = async (token:string,nonce:string) => {
    const response =  await axios.get(`${url}/api/messaggi/count?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
}; 


export const getListaMessaggi = async (token:string, nonce:string , body:BodyCentromessaggi, page:number, pageSize:number) => {
    const response =  await axios.post(`${url}/api/messaggi?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};

export const downloadMessaggioPagoPaZipExel = async (token:string, nonce:string , body:{idMessaggio:number}) => {
    const response =  await fetch(`${url}/api/messaggi/download?nonce=${nonce}`,
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


export const downloadMessaggioPagoPaCsv = async (token:string, nonce:string , body: {idMessaggio:number}) => {

    const response =  await axios.post(`${url}/api/messaggi/download?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
    
};


export const readMessaggioPagoPa = async (token:string, nonce:string ,body:{idMessaggio:number}) => {
    const response =  await axios.post(`${url}/api/messaggi/read?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};

