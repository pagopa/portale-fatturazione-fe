import axios from 'axios';
import {DatiFatturazione,DatiFatturazionePost} from '../types/typesAreaPersonaleUtenteEnte';
import { DatiCommessa } from '../types/typeModuloCommessaInserimento';

const standardId = 'c2e6c704-692d-44f9-872b-39e46c32d003';


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