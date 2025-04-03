import axios from "axios";
import { BodyAsyncDoc } from "../../../page/asyncDocumenti";
import { url } from "../../api";

export const getListaAsyncDoc = async ( token:string, nonce:string,body: BodyAsyncDoc,page:number,pageSize:number) => {
    const response = await axios.post(`${url}/api/notifiche/richiesta?page=${page}&pageSize=${pageSize}&nonce=${nonce}`,
        body,
        { headers: {
            Authorization: 'Bearer ' + token
        }}
    );
    return response;
};