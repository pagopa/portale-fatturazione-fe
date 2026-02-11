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
    const finalBody = {
        ...body,
        mese: body.mese === 9999 ? null : body.mese,
        anno: body.anno === 9999 ? null : body.anno,
    };
    const response = await axios.post(`${url}/api/fatture/ente/credito/sospeso?nonce=${nonce}`,
        finalBody,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};

export const getListaDocumentiEmessi = async (token:string, nonce:string , body:BodyDocumentiEmessiEnte)  => {
    const finalBody = {
        ...body,
        mese: body.mese === 9999 ? null : body.mese,
        anno: body.anno === 9999 ? null : body.anno,
    };
    const response = await axios.post(`${url}/api/fatture/ente/periodo/emesse?nonce=${nonce}`,
        finalBody,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};

export const getDettaglioFatturaEmessa = async (token:string , nonce:string , id:number) =>{
    const response = await axios.post(`${url}/api/fatture/ente/emesse/dettaglio?nonce=${nonce}`,
        {Idfattura:id},
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};

export const getDettaglioFatturaSospesa = async (token:string , nonce:string , id:number) =>{
    const response = await axios.post(`${url}/api/fatture/ente/sospese/dettaglio?nonce=${nonce}`,
        {Idfattura:id},
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};




