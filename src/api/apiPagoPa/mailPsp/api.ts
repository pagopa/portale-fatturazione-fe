import axios from "axios";
import { RequestBodyMailPsp } from "../../../page/prod_pagopa/emailpsp";
import { url } from "../../api";

export const getListaMailPsp = async (body:RequestBodyMailPsp, token:string, nonce:string) => {
    const response =  await axios.post(`${url}/api/v2/pagopa/pspemail?nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );

    return response;
};



export const downloadListaMailPsp = async ( body: RequestBodyMailPsp,token:string, nonce:string ,) => {
    const response =  await fetch(`${url}/api/v2/pagopa/pspemail/document?nonce=${nonce}`,
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
