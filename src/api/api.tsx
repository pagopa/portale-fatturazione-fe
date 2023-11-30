import axios from 'axios';
import {DatiFatturazione,DatiFatturazionePost} from '../types/typesAreaPersonaleUtenteEnte';
import { DatiCommessa } from '../types/typeModuloCommessaInserimento';
import { useState, useEffect } from 'react';



export const url = 'https://portalefatturebeapi20231102162515.azurewebsites.net';


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
    console.log({res}, 'response');
    if(res?.response?.status === 404){
            
        alert('Non è stato possibile aggiungere i dati');
    }else if(res?.error?.response?.status === 401){
        console.log('DENTRO 401');
        navigate('/error');
    }else if(res?.error?.response?.status === 500){
        
        navigate('/error');
    }
};




export const selfcareLogin = async (selfcareToken:string|null) =>{
    const result = await axios.get(`https://portalefatturebeapi20231102162515.azurewebsites.net/api/auth/selfcare/login?selfcareToken=${selfcareToken}`,
  
    );
    return result;
};

export const getAuthProfilo = async (tokenFromSelfcare:string) => {
    const result = await axios.get(`https://portalefatturebeapi20231102162515.azurewebsites.net/api/auth/profilo`,
        { headers: {
            Authorization: 'Bearer ' + tokenFromSelfcare
        }} 
  
    );
    return result;
};


export const getDatiFatturazione  = async (token:string) => {
  
    const response = await axios.get(
        `https://portalefatturebeapi20231102162515.azurewebsites.net/api/datifatturazione/ente`,
        { headers: {
            Authorization: 'Bearer ' + token
        }});
    return response;
     
   
   
};


export const modifyDatiFatturazione = async (datiFatturazione: DatiFatturazione, token:string) => {

    const response= await axios.put(`https://portalefatturebeapi20231102162515.azurewebsites.net/api/datifatturazione`,
        datiFatturazione,
        { headers: {
            Authorization: 'Bearer ' + token
        },}

    );

    return response;
};

export const insertDatiFatturazione = async (datiFatturazione: DatiFatturazionePost, token:string) => {
    const response = await axios.post(`https://portalefatturebeapi20231102162515.azurewebsites.net/api/datifatturazione`,
        datiFatturazione,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};


export const insertDatiModuloCommessa = async (datiCommessa : DatiCommessa, token:string) => {
    const response =  await axios.post(`https://portalefatturebeapi20231102162515.azurewebsites.net/api/modulocommessa`,
        datiCommessa,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getDatiModuloCommessa = async ( token:string) => {
    const response =  await axios.get(`https://portalefatturebeapi20231102162515.azurewebsites.net/api/modulocommessa`,
       
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};





