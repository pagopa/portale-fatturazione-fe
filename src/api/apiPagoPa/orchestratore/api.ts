import axios from "axios";
import { url } from "../../api";
import { BodyOrchestratore } from "../../../page/processiOrchestratore";

export const getListaActionMonitoring = async (token:string, nonce:string , body:BodyOrchestratore,page:number,pageSize:number) => {
    const response =  await axios.post(`${url}/api/orchestratore?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token,
        },}
    );
    return response;
};

export const getStatiMonitoring = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/orchestratore/stati?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};

export const getTipologieMonitoring = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/orchestratore/tipologie?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};

export const getFasiMonitoring = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/orchestratore/fasi?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};

export const downloadOrchestratore = async (token:string, nonce:string,body:BodyOrchestratore) => {
    const response = await fetch(`${url}/api/orchestratore/download?nonce=${nonce}`, 
        { headers: {
            Authorization: 'Bearer '+token,
            'Content-type':'application/json'
        },
        method: 'POST',
        body:JSON.stringify(body),
        });
   
    return response;
};