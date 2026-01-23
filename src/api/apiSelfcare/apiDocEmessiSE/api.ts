
import axios from "axios";
import { url } from "../../api";


export const getFatturazioneEnte = async (token:string, nonce:string, body: any) => {
    const response =  await axios.post(`${url}/api/fatture/ente?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};

export const getTipologieFaEnte = async (token:string, nonce:string, body: {anno:number,mese:number}) => {
    const response =  await axios.post(`${url}/api/fatture/ente/tipologia?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};


export const downloadFattureEnte = async (token:string, nonce:string,body: any) => {
    const response = await fetch(`${url}/api/fatture/ente/download?nonce=${nonce}`, 
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