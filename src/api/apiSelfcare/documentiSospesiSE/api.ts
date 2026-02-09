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

export const getListaDocumentiSospesi = async (token:string, nonce:string , body:BodyDocumentiEmessiEnte)  => {
    const finalBody = body;
    if(finalBody.mese === 9999){
        finalBody.mese = null;
    }
    const response = await axios.post(`${url}/api/fatture/ente/credito/sospeso?nonce=${nonce}`,
        finalBody,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};

export const getListaDocumentiEmessi = async (token:string, nonce:string , body:BodyDocumentiEmessiEnte)  => {
    const finalBody = body;
    if(finalBody.mese === 9999){
        finalBody.mese = null;
    }
    const response = await axios.post(`${url}/api/fatture/ente/periodo/emesse?nonce=${nonce}`,
        finalBody,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};