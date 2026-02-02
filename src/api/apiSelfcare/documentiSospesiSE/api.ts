import axios from "axios";
import { url } from "../../api";
import { BodyDocumentiEmessiEnte } from "../../../page/ente/docConEme";

export const getPeriodoSospeso = async (token:string , nonce:string) =>{
    const response = await axios.get(
        `${url}/api/fatture/ente/periodo/sospeso?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }});
    return response;
};

export const getListaDocumentiEmessi = async (token:string, nonce:string , body:BodyDocumentiEmessiEnte)  => {
    const response = await axios.post(`${url}/api/fatture/ente/credito/sospeso?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};