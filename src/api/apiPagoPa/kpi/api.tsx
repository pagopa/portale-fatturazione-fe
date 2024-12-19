import { url } from "../../api";


export const getMatriceKpi = async ( token:string, nonce:string , yearQuarter:string) => {
    const response = await fetch(`${url}/api/v2/pagopa/kpipagamenti/matrice?year_quarter=${yearQuarter}&nonce=${nonce}`, 
        {
            headers: {
                Authorization: 'Bearer '+token
            },
            method: 'GET',
        });
    return response;
};
