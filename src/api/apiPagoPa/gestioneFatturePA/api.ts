import axios from "axios";
import { url } from "../../api";

export interface GestioneFattureInterface {
    idEnti: string[]
    tipologiaContratto: number|null
    tipologiaFattura: string|null
    anno: number|null
    mesi: number[],
    azione:null|string
}


export const getAnniGestioneFatture = async (token:string, nonce:string) => {
  const response =  await axios.get(`${url}/api/fatture/pagopa/gestione-fatture/anni?nonce=${nonce}`,
    { headers: {
      Authorization: 'Bearer ' + token
    },}
  );

  return response;
};

export const getMesiGestioneFatture = async (token:string, nonce:string , body:{anno:number}) => {
  const response =  await axios.post(`${url}/api/fatture/pagopa/gestione-fatture/mesi?nonce=${nonce}`,
    body,
    { headers: {
      Authorization: 'Bearer ' + token,
    },
    }
  );
  return response;
};

export const getTipologiaFatturaGestioneFatture = async (token:string, nonce:string, body:{anno:number|null,mesi:number[]}) => {
  const response =  await axios.post(`${url}/api/fatture/pagopa/gestione-fatture/tipologia-fattura?nonce=${nonce}`,
    body,
    { headers: {
      Authorization: 'Bearer ' + token
    },}
  );

  return response;
};


export const downloadGestioneFatturePagopa = async (token:string, nonce:string,body:GestioneFattureInterface) => {
  const response = await fetch(`${url}/api/fatture/pagopa/gestione-fatture/download?nonce=${nonce}`, 
    {
      headers: {
        Authorization: 'Bearer '+token,
        'Content-type':'application/json'
      },
      method: 'POST',
      body:JSON.stringify(body),
    });
  return response;
};


export const getListaGestioneFatturePagoPa = async (token:string, nonce:string, page:number, pageSize:number, body:GestioneFattureInterface) => {
  const response =  await axios.post(`${url}/api/fatture/pagopa/gestione-fatture?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
    body,
    { headers: {
      Authorization: 'Bearer ' + token
    }}
  );
  return response;
};


export const getMesiGestioneFattureAzione = async (token:string, nonce:string , body:{anno:number|null,azione:string,tipologiaFattura:string}) => {
  const response =  await axios.post(`${url}/api/fatture/pagopa/gestione-fatture/modifica/mesi?nonce=${nonce}`,
    body,
    { headers: {
      Authorization: 'Bearer ' + token,
    },
    }
  );
  return response;
};

export const getAnniGestioneFattureAzione = async (token:string, nonce:string, body:{azione:string,tipologiaFattura:string}) => {
  const response =  await axios.post(`${url}/api/fatture/pagopa/gestione-fatture/modifica/anni?nonce=${nonce}`,
    body,
    { headers: {
      Authorization: 'Bearer ' + token
    },}
  );

  return response;
};

export const gestioneFattureInserisci = async (token:string, nonce:string,body:{mese: string,anno:string,tipologiaFattura:string,idEnte:string,nota:{data:string,testo:string}}) => {
  const response =  await axios.post(`${url}/api/fatture/pagopa/gestione-fatture/azione?nonce=${nonce}`,
    body,
    { headers: {
      Authorization: 'Bearer ' + token
    }}
  );
  return response;
};