import axios from 'axios';
import {DatiFatturazione,DatiFatturazionePost} from '../types/typesAreaPersonaleUtenteEnte';
import { DatiCommessa } from '../types/typeModuloCommessaInserimento';
import { useState, useEffect } from 'react';


//dev

export const url = "https://portalefatturebeapi20231102162515.azurewebsites.net";
//"https://fat-p-app-api.azurewebsites.net";
//'https://portalefatturebeapi20231102162515.azurewebsites.net';
const getToken = localStorage.getItem('token') || '{}';
const token =  JSON.parse(getToken).token;


export  const useAxios = (axiosParams:any) => {
    const [response, setResponse] = useState<any>(undefined);
    const [error, setError] = useState(undefined);
    const [loading, setLoading] = useState(true);

   
    const fetchData = async (params:any) => {
       
        try {
            const result = await axios.request(params);
            setResponse(result.data);
        } catch( error:any ) {
        
            setError(error);
        } finally {
            setLoading(false);
        }
    };
  
    useEffect(() => {
       
        fetchData(axiosParams);
       
    }, []);

    return { response, error, loading ,fetchData};
};


export const menageError = (res:any,navigate:any) =>{
    
    if(res?.error?.response?.status === 401){
      
        navigate('/error');
      
    }else if(res?.error?.response?.status === 404){
        navigate('/error');
        //alert('Non è stato possibile aggiungere i dati');
    }else if(res?.error?.response?.status === 500){
        
        navigate('/error');
    }else if(res?.error?.response?.status === 400){
        navigate('/error');
    }
};




export const selfcareLogin = async (selfcareToken:string|null) =>{
    const result = await axios.get(`${url}/api/auth/selfcare/login?selfcareToken=${selfcareToken}`,
  
    );
    return result;
};

export const getAuthProfilo = async (tokenFromSelfcare:string) => {

    const result = await axios.get(`${url}/api/auth/profilo`,
        { headers: {
            Authorization: 'Bearer ' + tokenFromSelfcare
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





