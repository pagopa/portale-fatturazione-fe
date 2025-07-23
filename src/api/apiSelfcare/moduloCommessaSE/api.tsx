import axios from "axios";
import { url } from "../../api";
import { DatiCommessa } from "../../../types/typeModuloCommessaInserimento";

export const getDatiConfigurazioneCommessa = async (token:string, idTipoContratto:number, prodotto:string, nonce:string) =>{

    const result = await axios.get(`${url}/api/configurazionemodulocommessa?idTipoContratto=${idTipoContratto}&prodotto=${prodotto}&nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }} 
  
    );
    return result;
};






export const getAnni = async (token:string , nonce:string) =>{
    const response = await axios.get(
        `${url}/api/modulocommessa/anni?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }});
    return response;
};
/*
export const getListaCommessa = async(token:string , nonce:string) =>{
    const response = await axios.get(
        `${url}/api/modulocommessa/lista?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }});
    return response;
};
*/
export const getListaCommessaFiltered = async (token:string, nonce:string, valueSelect:string) =>{
    if(valueSelect){
        const response = await axios.get(
            `${url}/api/modulocommessa/lista/${valueSelect}?nonce=${nonce}`,
            { headers: {
                Authorization: 'Bearer ' + token
            }});
        return response;
    }else{
        const response = await axios.get(
            `${url}/api/modulocommessa/lista?nonce=${nonce}`,
            { headers: {
                Authorization: 'Bearer ' + token
            }});
        return response;
    }
   
};
/*
export const getListaCommessaOnAnnulla = async (token:string ,nonce:string) =>{
    const response = await axios.get(
        `${url}/api/modulocommessa/lista?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }});
    return response;
};
*/
export const getCategoriaSpedizione =  async (token:string, nonce:string) =>{
    const response = await axios.get(
        `${url}/api/tipologia/categoriaspedizione?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }});
    return response;
};



export const insertDatiModuloCommessa = async (datiCommessa : DatiCommessa, token:string, nonce:string) => {
    const response =  await axios.post(`${url}/api/modulocommessa?nonce=${nonce}`,
        datiCommessa,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getDatiModuloCommessa = async ( token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/modulocommessa?nonce=${nonce}`,
       
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getDettaglioModuloCommessa = async (token:string, anno:string, mese:string,nonce:string) => {
    const response =  await axios.get(`${url}/api/modulocommessa/dettaglio/${anno}/${mese}?nonce=${nonce}`,
       
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getModuloCommessaPdf = async ( token:string ,mese:string, anno:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/modulocommessa/documento/${mese}/${anno}?nonce=${nonce}`,
       
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const downloadModuloCommessaPdf = async (token:string, mese:string, anno:string,tipo:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/modulocommessa/download/${mese}/${anno}?Tipo=${tipo}&nonce=${nonce}`,
       
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getTipologiaProdotto = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/tipologia/prodotto?nonce=${nonce}`,
       
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getListaCommessaFilteredV2 = async (token:string, nonce:string, valueSelect:string) =>{
    if(valueSelect){
        const response = await axios.get(
            `${url}/api/v2/modulocommessa/lista/${valueSelect}?nonce=${nonce}`,
            { headers: {
                Authorization: 'Bearer ' + token
            }});
        return response;
    }else{
        const response = await axios.get(
            `${url}/api/v2/modulocommessa/lista?nonce=${nonce}`,
            { headers: {
                Authorization: 'Bearer ' + token
            }});
        return response;
    }
};

export const getCommessaObbligatoriVerificaV2 = async (token:string, nonce:string) =>{
    const response = await axios.get(
        `${url}/api/v2/modulocommessa/obbligatori/verifica?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }});
    return response;
};

export const getCommessaObbligatoriListaV2 = async (token:string, nonce:string) =>{
    const response = await axios.get(
        `${url}/api/v2/modulocommessa/obbligatori/lista?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }});
    return response;
};

export const getRegioniModuloCommessa = async (token:string, nonce:string) =>{
    const response = await axios.get(
        `${url}/api/v2/modulocommessa/regioni?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }});
    return response;
};

export const getDettaglioModuloCommessaV2 = async (token:string, anno:string, mese:string,nonce:string) => {
    const response =  await axios.get(`${url}/api/v2/modulocommessa/dettaglio/${anno}/${mese}?nonce=${nonce}`,
       
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};