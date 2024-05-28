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