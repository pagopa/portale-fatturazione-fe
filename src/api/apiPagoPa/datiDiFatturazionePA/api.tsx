import axios from "axios";
import { url } from "../../api";
import { DatiFatturazionePostPagopa } from "../../../types/typesAreaPersonaleUtenteEnte";
import { BodyDownloadDatiFatturazione, BodyListaDatiFatturazione } from "../../../types/typesGeneral";

export const listaDatiFatturazionePagopa = async (body : BodyListaDatiFatturazione, token:string, nonce:string) => {
    const response =  await axios.post(`${url}/api/datifatturazione/pagopa/ricerca?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + 'aa'
        },}
    );

    return response;
};

export const getDatiFatturazionePagoPa = async (token:string, nonce:string , idente:string, prodotto:string) => {
    const response =  await axios.get(`${url}/api/datifatturazione/pagopa/ente?idente=${idente}&prodotto=${prodotto}&nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
}; 

export const modifyDatiFatturazionePagoPa = async (token:string, nonce:string ,body: DatiFatturazionePostPagopa,) => {
    const response =  await axios.put(`${url}/api/datifatturazione/pagopa?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
}; 

export const insertDatiFatturazionePagoPa = async (token:string, nonce:string ,body: DatiFatturazionePostPagopa) => {
    const response =  await axios.post(`${url}/api/datifatturazione/pagopa?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};

export const downloadDocumentoListaDatiFatturazionePagoPa = async (token:string, nonce:string ,body: BodyDownloadDatiFatturazione) => {
    const response =  await axios.post(`${url}/api/datifatturazione/pagopa/documento/ricerca?nonce=${nonce}`,
        body,
        
        { headers: {
            Authorization: 'Bearer ' + token,
            ContentType: 'application/octet-stream',
        },
        }
    );
    return response;
};