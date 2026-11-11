import { BodyDettaglioFatture, BodyGeneraJson, BodyInvioFatture } from "../../../page/prod_pn/invioFatture";
import { url } from "../../api";
import axios from "axios";

export const getListaInvioFatture = async (token:string, nonce:string, body:BodyInvioFatture) => {
  const response =  await axios.post(`${url}/api/fatture/invio-sap?nonce=${nonce}`,
    body,
    { headers: {
      Authorization: 'Bearer ' + token
    }}
  );
  return response;
};

export const getDettaglioInvioFatture = async (token:string, nonce:string, body:BodyDettaglioFatture) => {
  const response =  await axios.post(`${url}/api/fatture/invio-sap/dettaglio?nonce=${nonce}`,
    body,
    { headers: {
      Authorization: 'Bearer ' + token
    }}
  );
  return response;
};

export const generazioneJson = async (token:string, nonce:string,body:BodyGeneraJson) => {
  const response =  await axios.put(`${url}/api/fatture/invio-sap/genera?nonce=${nonce}`,
    body,
    { headers: {
      Authorization: 'Bearer ' + token
    }}
  );
  return response;
};

export const downloadInvioFatture = async (token:string, nonce:string,body: BodyInvioFatture) => {
  const response = await fetch(`${url}/api/fatture/invio-sap/download?nonce=${nonce}`, 
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

export const downloadInvioFattureDaReInviare = async (token:string, nonce:string,body: BodyInvioFatture) => {
  const response = await fetch(`${url}/api/fatture/invio-sap/download/reinviate?nonce=${nonce}`, 
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

export const getCheckLock = async (token:string, nonce:string) => {
  const response =  await axios.get(`${url}/api/fatture/invio-sap/lock?nonce=${nonce}`,
    { headers: {
      Authorization: 'Bearer ' + token
    }}
  );
  return response;
};

export const getStatiInvioJson = async (token:string, nonce:string) => {
  const response =  await axios.get(`${url}/api/fatture/invio-sap/stati?nonce=${nonce}`,
    { headers: {
      Authorization: 'Bearer ' + token
    }}
  );
  return response;
};