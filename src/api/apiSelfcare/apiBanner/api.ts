import axios from "axios";
import { url } from "../../api";

export const getInfoBanner = async (token:string, nonce:string ) => {
  const response = await axios.get(`${url}/api/info-banner?nonce=${nonce}`,
    { headers: {
      Authorization: 'Bearer ' + token
    },}
  );
  return response;
};