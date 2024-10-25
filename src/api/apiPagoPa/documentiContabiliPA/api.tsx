import axios from "axios";
import { url } from "../../api";
import { RequestBodyListaDocContabiliPagopa } from "../../../types/typeDocumentiContabili";


export const getListaDocumentiContabiliPa = async (token:string, nonce:string , body:RequestBodyListaDocContabiliPagopa) => {
    const response =  await axios.post(`${url}/api/v2/pagopa/financialreports?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }
        }
    );
    return response;
};

export const getQuartersDocContabiliPa = async (token:string, nonce:string , body:{year:string}) => {
    const response =  await axios.post(`${url}/api/v2/pagopa/financialreports/quarters?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }
        }
    );
    return response;
};


export const getYearsDocContabiliPa = async (token:string,nonce:string) => {
    const response =  await axios.get(`${url}/api/v2/pagopa/financialreports/years?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
}; 


export const downloadDocContabili = async (token:string, nonce:string , body:RequestBodyListaDocContabiliPagopa) => {
    const response =  await fetch(`${url}/api/v2/pagopa/financialreports/document?nonce=${nonce}`,
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

export const downloadFinancialReportDocContabili = async (token:string, nonce:string , body:RequestBodyListaDocContabiliPagopa) => {
    const response =  await fetch(`${url}/api/v2/pagopa/financialreports/documentpdnd?nonce=${nonce}`,
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


export const getDetailsDocContabilePa = async (token:string, nonce:string , body:{contractId:string,quarter:string}) => {
    const response =  await axios.post(`${url}/api/v2/pagopa/financialreports/dettaglio?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }
        }
    );
    return response;
};

