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


export const fattureTipologiaSapPa = async (token:string, nonce:string, body:{anno:number,mese:number}) => {
    const response =  await axios.post(`${url}/api/fatture/invio/sap?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};

export const fattureInvioSapPa = async (token:string, nonce:string, body:{annoRiferimento:number,meseRiferimento: number,tipologiaFattura: string}) => {
    const response =  await axios.post(`${url}/api/fatture/invio/pipeline?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};

export const fattureResetSapPa = async (token:string, nonce:string, body:{annoRiferimento: number,meseRiferimento: number,tipologiaFattura: string}) => {
    const response =  await axios.post(`${url}/api/fatture/resetta/pipeline?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};

export const getAnniDocEmessiPagoPa = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/fatture/anni?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};

export const getMesiDocEmessiPagoPa = async (token:string, nonce:string, body:{anno: string}) => {
    const response =  await axios.post(`${url}/api/fatture/mesi?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};

export const sendListaJsonFatturePagoPa = async (token:string, nonce:string, body:{annoRiferimento: number,meseRiferimento: number,tipologiaFattura: string}) => {
    const response =  await axios.post(`${url}/api/fatture/invio/sap/multiplo/periodo?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};

export const getListaJsonFatturePagoPa = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/fatture/invio/sap/multiplo?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};

export const invioListaJsonFatturePagoPa = async (token:string, nonce:string,body:{annoRiferimento: number,meseRiferimento: number,tipologiaFattura: string}[]) => {
    const response =  await axios.put(`${url}/api/fatture/invio/sap/multiplo?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};

export const getTipologieFaPagoPaWithData = async (token:string, nonce:string, body: {anno:number,mese:number,idEnti:string[],tipologiaFattura:string[],cancellata:boolean}) => {
    const response =  await axios.post(`${url}/api/fatture/date?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};




