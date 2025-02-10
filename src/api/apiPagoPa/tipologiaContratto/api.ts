import axios from "axios";
import { BodyContratto } from "../../../page/tipologiaContratto";
import { url } from "../../api";

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