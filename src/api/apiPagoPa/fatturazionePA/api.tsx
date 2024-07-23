import axios from "axios";
import { url } from "../../api";
import { BodyFatturazione } from "../../../types/typeFatturazione";

export const getFatturazionePagoPa = async (token:string, nonce:string, body: BodyFatturazione) => {
    const response =  await axios.post(`${url}/api/fatture?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};

export const getTipologieFaPagoPa = async (token:string, nonce:string, body: {anno:number,mese:number,cancellata:boolean}) => {
    const response =  await axios.post(`${url}/api/fatture/tipologia?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};


export const downloadFatturePagopa = async (token:string, nonce:string,body: BodyFatturazione) => {
    const response = await fetch(`${url}/api/fatture/download?nonce=${nonce}`, 
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

export const downloadFattureReportPagopa = async (token:string, nonce:string,body: BodyFatturazione) => {
    const response = await fetch(`${url}/api/fatture/report?nonce=${nonce}`, 
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


export const fatturePrenotazioneReportPagoPa = async (token:string, nonce:string, body:BodyFatturazione) => {
    const response =  await axios.post(`${url}/api/fatture/report/prenotazione?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};

export const fattureCancellazioneRipristinoPagoPa = async (token:string, nonce:string, body:{idFatture:number[],cancellazione:boolean}) => {
    const response =  await axios.post(`${url}/api/fatture/cancellazione?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};
