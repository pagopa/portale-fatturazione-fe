import axios from "axios";
import { url } from "../../api";
import { RequestBodyKpi } from "../../../types/typeKpi";


export const getMatriceKpi = async ( token:string, nonce:string , yearQuarter:string) => {
    const response = await fetch(`${url}/api/v2/pagopa/kpipagamenti/matrice?nonce=${nonce}&year_quarter=${yearQuarter}`, 
        {
            headers: {
                Authorization: 'Bearer '+token
            },
            method: 'GET',
        });
    return response;
};


export const getListaKpi = async (token:string, nonce:string , body:RequestBodyKpi) => {
    const response =  await axios.post(`${url}/api/v2/pagopa/kpipagamenti?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }
        }
    );
    return response;
};


