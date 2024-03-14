import axios from "axios";
import { url } from "../../api";
import { BodyRel } from "../../../types/typeRel";
import { saveAs } from "file-saver";

export const getListaRelPagoPa = async (token:string, nonce:string , page:number, pageSize:number, body: BodyRel) => {
    const response =  await axios.post(`${url}/api/rel/pagopa?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};

export const downloadListaRelPagopa = async (token:string, nonce:string , body: BodyRel) => {
    const response =  await axios.post(`${url}/api/rel/pagopa/documento/ricerca?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },
        }
    );
    return response;
};

export const getRelExelPagoPa = async ( token:string ,nonce:string , id:string) => {
    const response =  await axios.get(`${url}/api/rel/pagopa/righe/${id}?nonce=${nonce}`,  
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getSingleRelPagopa = async ( token:string ,nonce:string , id:string) => {
    const response =  await axios.get(`${url}/api/rel/pagopa/${id}?nonce=${nonce}`,  
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const getRelPdfFirmatoPagoPa = async ( token:string ,nonce:string , id:string) => {
    const response =  await axios.get(`${url}/api/rel/pagopa/firma/download/${id}?nonce=${nonce}`,  
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};

/*export const downloadListaRelPdfZipPagopa = async (token:string, nonce:string , body: BodyRel) => {
    const response =  await axios.post(`${url}/api/rel/pagopa/firma/download?nonce=${nonce}`,
        body,
        {responseType: 'arraybuffer',
            headers: {
                Authorization: 'Bearer ' + token,
                Accept:"application/zip",
            },
       
        }
    );
    return response;
};*/

export const downloadListaRelPdfZipPagopa = (token:string, nonce:string , body: any) => {
   
    fetch(`${url}/api/rel/pagopa/firma/download?nonce=${nonce}`, 
        {
            headers: {Authorization: 'Bearer '+token, 'Content-type':'application/json'},
            method: 'POST',
            body:JSON.stringify(body),
        })
        .then(response => response.blob())
        .then(blob => {

            saveAs(blob,'Lista PDF Reg. Es..zip' );
            /* const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'Lista PDF Reg. Es..zip'; 
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            */
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

