import axios from "axios";

import { url } from "../../api";
import { BodyContratto } from "../../../page/prod_pn/tipologiaContratto";

export const getListaTipologiaFatturazionePagoPa = async (token:string, nonce:string , page:number, pageSize:number, body: BodyContratto) => {
    const response =  await axios.post(`${url}/api/fatture/contratti/tipologia?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};

export const downloadTipologiePagopa = async (token:string, nonce:string,body: BodyContratto) => {
    const response = await fetch(`${url}/api/fatture/contratti/download?nonce=${nonce}`, 
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

export const modifyContrattoPagoPa = async (token:string, nonce:string , body: {idEnte: string, tipologiaContratto:number}) => {
    const response =  await axios.post(`${url}/api/fatture/contratti/modifica?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};

export const getContrattoDatiDiFatturazionePA = async(token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/datifatturazione/pagopa/tipologiacontratto?nonce=${nonce}`,
       
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};



