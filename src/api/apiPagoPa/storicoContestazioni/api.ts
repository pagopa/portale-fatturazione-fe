import axios from "axios";
import { url } from "../../api";
import { BodyStoricoContestazioni } from "../../../page/prod_pn/storicoContestazioni";

export const getTipoReportCon = async ( token:string ,nonce:string ) => {
    const response =  await axios.get(`${url}/api/notifiche/pagopa/contestazioni/tiporeport?nonce=${nonce}`,  
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};

export const getListaStorico = async (token:string, nonce:string , body: BodyStoricoContestazioni,page:number, pageSize:number) => {
    const response =  await axios.post(`${url}/api/notifiche/pagopa/contestazioni/reports?nonce=${nonce}&page=${page}&pageSize=${pageSize}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};

export const getTipoContestazioni = async ( token:string ,nonce:string ) => {
    const response =  await axios.get(`${url}/api/notifiche/pagopa/contestazioni/steps?nonce=${nonce}`,  
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};


export const downloadReportContestazione = async (token:string, nonce:string , idReport:number , tipoReport:string) => {

    const response =  await axios.get(`${url}/api/notifiche/pagopa/contestazioni/reports?nonce=${nonce}&idReport=${idReport}&tipoReport=${tipoReport}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
    
};

export const getDettaglioContestazionePA = async (token:string, nonce:string , body:{idReport:number}) => {
    const response =  await axios.post(`${url}/api/notifiche/pagopa/contestazioni/single/report?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};




