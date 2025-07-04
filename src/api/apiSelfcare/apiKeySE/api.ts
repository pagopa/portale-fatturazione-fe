import axios from "axios";
import { url } from "../../api";
import { BodyApiKey } from "../../../page/apiKeyEnte";


export const createApiKey = async (token:string, nonce:string,body:BodyApiKey) => {
    const response =  await axios.post(`${url}/api/apikey/genera?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};

export const getPageApiKeyVisibleIP = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/apikey/ips?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};

export const createIP = async (token:string, nonce:string,ipAddress:string) => {
    const response =  await axios.post(`${url}/api/apikey/ips?nonce=${nonce}`,
        {ipAddress:ipAddress},
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};

export const deleteIP = async (token:string, nonce:string,ipAddress:string) => {
    const response =  await axios.delete(`${url}/api/apikey/ips?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        data:{ipAddress:ipAddress}}
    );
    return response;
};


