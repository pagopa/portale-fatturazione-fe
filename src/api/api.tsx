import axios from 'axios';
import {DatiFatturazione,DatiFatturazionePost, DatiFatturazionePostPagopa} from '../types/typesAreaPersonaleUtenteEnte';
import { DatiCommessa } from '../types/typeModuloCommessaInserimento';
import { 
    TokenObject,
    BodyListaDatiFatturazione,
    BodyDownloadDatiFatturazione,
    BodyListaModuloCommessa
} from '../types/typesGeneral';



//dev

export const url = "https://portalefatturebeapi20231102162515.azurewebsites.net";
export const redirect = "https://uat.selfcare.pagopa.it/";


//prd
/*
export const url = "https://fat-p-app-api.azurewebsites.net";
export const redirect = "https://selfcare.pagopa.it/";
*/



export const manageError = (res:any,navigate:any) =>{
    console.log({res}, 'ERROR');
    if(res?.error?.response?.status === 401){
        localStorage.removeItem("token");
        navigate('/error');
      
    }else if(res?.error?.response?.status === 404){
        navigate('/error');
        //alert('Non è stato possibile aggiungere i dati');
    }else if(res?.error?.response?.status === 500){
        
        navigate('/error');
    }else if(res?.error?.response?.status === 400){
        console.log('400 da gestire');
    }
};



export const pagopaLogin = async (tokenObject:TokenObject) => {
    const result = await axios.post(`${url}/api/auth/pagopa/login`, tokenObject);
    return result;
};




export const selfcareLogin = async (selfcareToken:string|null) =>{
    const result = await axios.get(`${url}/api/auth/selfcare/login?selfcareToken=${selfcareToken}`,
  
    );
    return result;
};

export const getAuthProfilo = async (tokenFromSelfcarePagoPa:string) => {

    const result = await axios.get(`${url}/api/auth/profilo`,
        { headers: {
            Authorization: 'Bearer ' + tokenFromSelfcarePagoPa
        }} 
  
    );
    return result;
};



export const getDatiConfigurazioneCommessa = async (token:string, idTipoContratto:number, prodotto:string, nonce:string) =>{

    const result = await axios.get(`${url}/api/configurazionemodulocommessa?idTipoContratto=${idTipoContratto}&prodotto=${prodotto}&nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }} 
  
    );
    return result;
};




export const getDatiFatturazione  = async (token:string, nonce:string) => {
  
    const response = await axios.get(
        `${url}/api/datifatturazione/ente?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }});
    return response;
     
   
   
};


export const modifyDatiFatturazione = async (datiFatturazione: DatiFatturazione, token:string, nonce:string) => {

    const response= await axios.put(`${url}/api/datifatturazione?nonce=${nonce}`,
        datiFatturazione,
        { headers: {
            Authorization: 'Bearer ' + token
        },}

    );

    return response;
};

export const insertDatiFatturazione = async (datiFatturazione: DatiFatturazionePost, token:string, nonce:string) => {
    const response = await axios.post(`${url}/api/datifatturazione?nonce=${nonce}`,
        datiFatturazione,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};


export const getAnni = async (token:string , nonce:string) =>{
    const response = await axios.get(
        `${url}/api/modulocommessa/anni?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }});
    return response;
};

export const getListaCommessa = async(token:string , nonce:string) =>{
    const response = await axios.get(
        `${url}/api/modulocommessa/lista?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }});
    return response;
};

export const getListaCommessaFiltered = async (token:string, nonce:string, valueSelect:string) =>{
    const response = await axios.get(
        `${url}/api/modulocommessa/lista/${valueSelect}?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }});
    return response;
};

export const getListaCommessaOnAnnulla = async (token:string ,nonce:string) =>{
    const response = await axios.get(
        `${url}/api/modulocommessa/lista?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }});
    return response;
};

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

export const getTipologiaProfilo = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/tipologia/tipoprofilo?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};

export const listaDatiFatturazionePagopa = async (body : BodyListaDatiFatturazione, token:string, nonce:string) => {
    const response =  await axios.post(`${url}/api/datifatturazione/pagopa/ricerca?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
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


export const listaModuloCommessaPagopa = async (body : BodyListaModuloCommessa, token:string, nonce:string) => {
    const response =  await axios.post(`${url}/api/modulocommessa/pagopa/ricerca?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};










