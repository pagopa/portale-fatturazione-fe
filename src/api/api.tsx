import axios from 'axios';
import {DatiFatturazione,DatiFatturazionePost} from '../types/typesAreaPersonaleUtenteEnte';
import { DatiCommessa } from '../types/typeModuloCommessaInserimento';

const standardId = 'c2e6c704-692d-44f9-872b-39e46c32d003';
export const getDatiFatturazione  = async (setData:any, setStatus:any, setUser:any) => {
    try{
        const response = await axios.get(
            `https://portalefatturebeapi20231102162515.azurewebsites.net/api/datifatturazione/ente/c2e6c704-692d-44f9-872b-39e46c32d003`);
        setUser('old');
        setData(response.data);  
    }catch(err: any){
        
        setStatus('mutable');
        setUser('new');
        setData({
            tipoCommessa:'',
            splitPayment:false,
            cup: '',
            cig:'',
            idDocumento:'',
            codCommessa:'',
            contatti:[],
            dataCreazione:'',
            dataModifica:'',
            dataDocumento:new Date().toISOString(),
            pec:''
    
        });
        console.log(err.message);
        return err;
    }
   
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