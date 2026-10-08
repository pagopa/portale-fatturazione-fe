import axios from "axios";
import { url } from "../../api";
import { BodyDocContabiliAppiio } from "../../../page/prod_appio/documentiContabiliappio";



export const getListaDocumentiContabiliAppio = async (token:string, nonce:string , body:BodyDocContabiliAppiio) => {
  const response =  await axios.post(`${url}/api/appio/financialreports?nonce=${nonce}`,
    body,
    { headers: {
      Authorization: 'Bearer ' + token
    }
    }
  );
  return response;
};

export const getQuartersDocContabiliAppio = async (token:string, nonce:string , body:{year:string}) => {
  const response =  await axios.post(`${url}/api/appio/financialreports/quarters?nonce=${nonce}`,
    body,
    { headers: {
      Authorization: 'Bearer ' + token
    }
    }
  );
  return response;
};


export const getYearsDocContabiliAppio = async (token:string,nonce:string) => {
  const response =  await axios.get(`${url}/api/appio/financialreports/years?nonce=${nonce}`,
    { headers: {
      Authorization: 'Bearer ' + token
    },}
  );
  return response;
}; 


export const downloadDocContabiliAppio = async (token:string, nonce:string , body:BodyDocContabiliAppiio) => {
  const response =  await fetch(`${url}/api/appio/financialreports/document?nonce=${nonce}`,
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

export const downloadFinancialReportDocContabiliAppio = async (token:string, nonce:string , body:BodyDocContabiliAppiio) => {
  const response =  await fetch(`${url}/api/appio/financialreports/documentpdnd?nonce=${nonce}`,
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


export const getDetailsDocContabileAppio = async (token:string, nonce:string , body:{key:string}) => {
  const response =  await axios.post(`${url}/api/appio/financialreports/dettaglio?nonce=${nonce}`,
    body,
    { headers: {
      Authorization: 'Bearer ' + token
    }
    }
  );
  return response;
};


