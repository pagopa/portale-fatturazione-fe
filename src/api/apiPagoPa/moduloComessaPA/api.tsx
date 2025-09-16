import axios from "axios";
import { BodyDownloadListaCommesse, BodyListaModuloCommessa } from "../../../types/typesGeneral";
import { url } from "../../api";
import { DatiCommessa } from "../../../types/typeModuloCommessaInserimento";

export const listaModuloCommessaPagopa = async (body : BodyListaModuloCommessa, token:string, nonce:string) => {
    const response =  await axios.post(`${url}/api/v2/modulocommessa/pagopa/ricerca?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getModuloCommessaPagoPa = async (token:string, nonce:string , idente:string, prodotto:string, idtipocontratto:number , mese:number, anno:number) => {
    const response =  await axios.get(`${url}/api/modulocommessa/pagopa/dettaglio/${anno}/${mese}?idEnte=${idente}&prodotto=${prodotto}&idTipoContratto=${idtipocontratto}&nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
}; 


export const modifyDatiModuloCommessaPagoPa = async (body:DatiCommessa, token:string, nonce:string) => {
    const response =  await axios.post(`${url}/api/modulocommessa/pagopa?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getModuloCommessaPagoPaPdf = async ( token:string ,nonce:string ,mese:string, anno:string,idEnte:string, prodotto:string, idTipoContratto:number ) => {
    const response =  await axios.get(`${url}/api/modulocommessa/pagopa/documento/${anno}/${mese}?idEnte=${idEnte}&prodotto=${prodotto}&idTipoContratto=${idTipoContratto}&nonce=${nonce}`,  
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const downloadModuloCommessaPagoPaPdf = async (token:string, nonce:string, mese:string, anno:string, idEnte:string, prodotto:string, idTipoContratto:number, tipo:string, ) => {
    const response =  await axios.get(`${url}/api/modulocommessa/pagopa/download/${anno}/${mese}?idEnte=${idEnte}&prodotto=${prodotto}&idTipoContratto=${idTipoContratto}&tipo=${tipo}&nonce=${nonce}`,
       
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const downloadDocumentoListaModuloCommessaPagoPa = async (token:string, nonce:string , body: BodyDownloadListaCommesse) => {
    const response =  await axios.post(`${url}/api/modulocommessa/pagopa/documento/ricerca?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
            ContentType: 'application/octet-stream',
        },
        }
    );
    return response;
};

export const anniMesiModuliCommessa = async(token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/modulocommessa/pagopa/periodo?nonce=${nonce}`,
       
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};
