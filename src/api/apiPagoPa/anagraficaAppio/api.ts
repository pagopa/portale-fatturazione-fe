import axios from "axios";
import { url } from "../../api";
import { RequestBodyListaAnagraficaAppio } from "../../../page/prod_appio/anagraficaappio";


export const getListaAnagraficaAppio = async (token:string, nonce:string , body:RequestBodyListaAnagraficaAppio, page:number, pageSize:number) => {
  const response =  await axios.post(`${url}/api/appio/contracts?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
    body,
    { headers: {
      Authorization: 'Bearer ' + token
    }
    }
  );
  return response;
};

export const getListaNameAppio = async (token:string, nonce:string , body:{name:string, quarters:string[]}) => {
  const response =  await axios.post(`${url}/api/appio/contracts/name?nonce=${nonce}`,
    body,
    { headers: {
      Authorization: 'Bearer ' + token
    }}
  );
  return response;
};


export const downloadAppio = async (token:string, nonce:string , body:RequestBodyListaAnagraficaAppio) => {
  const response =  await fetch(`${url}/api/appio/contracts/download?nonce=${nonce}`,
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

export const getListaAnniAppio = async (token:string, nonce:string) => {
  const response =  await axios.get(`${url}/api/appio/contracts/years?nonce=${nonce}`,
    { headers: {
      Authorization: 'Bearer ' + token
    },}
  );
  return response;
}; 


export const getListaQuarters = async (token:string, nonce:string , body:{year:string}) => {
  const response =  await axios.post(`${url}/api/appio/contracts/quarters?nonce=${nonce}`,
    body,
    { headers: { Authorization: 'Bearer ' + token }}
  );
  return response;
};