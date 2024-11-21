import axios from 'axios';
import { url } from '../../api';
import { DatiFatturazione, DatiFatturazionePost } from '../../../types/typesAreaPersonaleUtenteEnte';


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

export const getValidationCodiceSdiEnte = async (token:string, nonce:string ,body: {codiceSDI:string|null}) => {
    const response =  await axios.post(`${url}/api/datifatturazione/codiceSDI?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};
