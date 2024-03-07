import axios from 'axios';
import { TokenObject,ManageErrorResponse} from '../types/typesGeneral';


export const url = process.env.REACT_APP_URL;
export const redirect = process.env.REACT_APP_REDIRECT || '';

export const manageError = (res:ManageErrorResponse,navigate:any) =>{
    
    if(res?.response?.request?.status === 401){
      
        localStorage.removeItem("token");
        localStorage.removeItem("profilo");
        window.location.href = redirect;
      
    }else if(res?.response?.request?.status   === 404){
        //navigate('/error');
        // alert('Qualcosa è andato storto');
    }else if(res?.response?.request?.status   === 419){
        window.location.href = redirect;
        // alert('Qualcosa è andato storto');else if(res?.response?.request?.status   === 500){
    }else if(res?.response?.request?.status  === 400){
        console.log('400 da gestire');
    }else if(res?.response?.request?.status  === 403){
        window.location.href = redirect;
        //navigate('/error');
    }else if(res?.response?.request?.status  === 500){
        alert('Operazione non eseguita: Internal Server Error');
        navigate('/error');
    }
};



export const pagopaLogin = async (tokenObject:TokenObject) => {
    const result = await axios.post(`${url}/api/auth/pagopa/login`, tokenObject);
    return result;
};



export const selfcareLogin = async (selfcareToken:string|null) =>{
    const result = await axios.get(`${url}/api/auth/selfcare/login?selfcareToken=${selfcareToken}`,
  
    );
    return result;
};

export const getAuthProfilo = async (tokenFromSelfcarePagoPa:string) => {

    const result = await axios.get(`${url}/api/auth/profilo`,
        { headers: {
            Authorization: 'Bearer ' + tokenFromSelfcarePagoPa
        }} 
  
    );
    return result;
};





export const getTipologiaProfilo = async (token:string, nonce:string) => {
    const response =  await axios.get(`${url}/api/tipologia/tipoprofilo?nonce=${nonce}`,
        { headers: {
            Authorization: 'Bearer ' + token
        },}
    );
    return response;
};



















