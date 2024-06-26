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


export const getListaMessaggi = async (token:string, nonce:string , body:BodyCentromessaggi, page:number, pageSize:number,) => {
    const response =  await axios.post(`${url}/api/messaggi?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};