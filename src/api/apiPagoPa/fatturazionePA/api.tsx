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

export const getTipologieFaPagoPa = async (token:string, nonce:string, body: {anno:number,mese:number}) => {
    const response =  await axios.post(`${url}/api/fatture/tipologia?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};



