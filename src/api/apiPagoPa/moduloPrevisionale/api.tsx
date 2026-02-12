import axios from "axios";
import { url } from "../../api";
import { BodyPrevisionale } from "../../../page/prod_pn/listaModuloComPrevisonale";

export const listaModuloCommessaPrevisonalePagopa = async (body:BodyPrevisionale , token:string, nonce:string) => {
    const response =  await axios.post(`${url}/api/v2/modulocommessa/pagopa/ricerca/date?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};

export const downloadDocumentoListaPrevisionaleaPagoPa = async (token:string, nonce:string , body: BodyPrevisionale) => {
    const response =  await fetch(`${url}/api/v2/modulocommessa/pagopa/report/ricerca/date?nonce=${nonce}`,
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