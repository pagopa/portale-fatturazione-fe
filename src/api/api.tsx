import axios from 'axios';
import {DatiFatturazione} from '../types/typesAreaPersonaleUtenteEnte';

export const getDatiFatturazione  = async (setState:any) => {
    const response = await axios.get(
        `https://portalefatturebeapi20231102162515.azurewebsites.net/api/datifatturazione/ente/176f304b-d5d5-4cb8-a99a-45937c3df238`).then( (res) => {
        setState(res.data);
  
        console.log(res.data, 'CICCIO');
        return res.data;
    });
    return response;
};


export const modifyDatiFatturazione = async (datiFatturazione: DatiFatturazione) => {

    const response= await axios.put(`https://portalefatturebeapi20231102162515.azurewebsites.net/api/datifatturazione/176f304b-d5d5-4cb8-a99a-45937c3df238`,
        datiFatturazione
    );
};