import axios from 'axios';
import { TokenObject,ManageErrorResponse} from '../types/typesGeneral';

export const url = process.env.REACT_APP_URL;
export const redirect = process.env.REACT_APP_REDIRECT || '';

export const manageError = (res:ManageErrorResponse,dispatchMainState:any) =>{

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
    console.log(res);
    if(res?.response?.request?.status === 401){
        // localStorage.clear();
        // window.location.href = redirect;
        handleModifyMainState({apiError:res.response.request.status});
        
    }else if(res?.response?.request?.status   === 404){
        //navigate('/error');
        // alert('Qualcosa è andato storto');
        handleModifyMainState({apiError:res.response.request.status});
    }else if(res?.response?.request?.status   === 419){
        handleModifyMainState({apiError:res.response.request.status});
        //window.location.href = redirect;
       
    }else if(res?.response?.request?.status  === 400){
        handleModifyMainState({apiError:res.response.request.status});
        // console.log('400 da gestire');
    }else if(res?.response?.request?.status  === 403){
        handleModifyMainState({apiError:res.response.request.status});
        //window.location.href = redirect;
        //navigate('/error');
    }else if(res?.response?.request?.status  === 500){
        handleModifyMainState({apiError:res.response.request.status});
        // alert('Operazione non eseguita: Internal Server Error');
        // navigate('/error');
    }else if(res?.message === "Network Error"){
        handleModifyMainState({apiError:"Network Error"});
        //window.location.href = '/error';
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
