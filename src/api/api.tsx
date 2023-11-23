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


export const getDatiFatturazione  = async () => {
  
    const response = await axios.get(
        `https://portalefatturebeapi20231102162515.azurewebsites.net/api/datifatturazione/ente/99755d5a-322c-4dd3-bad5-8de118295366`);
    return response;
     
   
   
};


export const modifyDatiFatturazione = async (datiFatturazione: DatiFatturazione) => {

    const response= await axios.put(`https://portalefatturebeapi20231102162515.azurewebsites.net/api/datifatturazione/176f304b-d5d5-4cb8-a99a-45937c3df238`,
        datiFatturazione
    ).then(res => res).catch(err => err);
};

export const insertDatiFatturazione = async (datiFatturazione: DatiFatturazionePost) => {
    await axios.post(`https://portalefatturebeapi20231102162515.azurewebsites.net/api/datifatturazione`,
        datiFatturazione
    ).then(res => res).catch(err => err);
};


export const insertDatiModuloCommessa = async (datiCommessa : DatiCommessa, setResponse : any) => {
    await axios.post(`https://portalefatturebeapi20231102162515.azurewebsites.net/api/modulocommessa`,
        datiCommessa
    ).then(res => setResponse(res.data.totale)).catch(err => err);
};