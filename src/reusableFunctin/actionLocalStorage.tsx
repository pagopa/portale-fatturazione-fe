export const profiliEnti = () => {
    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);
    
    const profiloValue = profilo.profilo;
    
    const result = profiloValue === "PA" || profiloValue === "GSP" || profiloValue === "SCP" || profiloValue === "PSP" || profiloValue === "AS" || profiloValue === "SA" || profiloValue === "PT";
    return result;
};

export const getToken = () =>{
    const token = localStorage.getItem('token') || '{}';
    const result =  JSON.parse(token).token;

    return result;
};

export const getProfilo = () =>{
    const profilo = localStorage.getItem('profilo') || '{}';
    const result =  JSON.parse(profilo);

    return result;
};

export const getStatusApp = () =>{
    const status = localStorage.getItem('statusApplication') || '{}';
    const result =  JSON.parse(status);

    return result;
};

export const getTipoCommessa = () => {
    const result =  localStorage.getItem('tipo') || '';
    return result;
};

export const setInfoToStatusApplicationLoacalStorage = (oldObj, newObj) => {

    localStorage.setItem('statusApplication',JSON.stringify({...oldObj,...newObj}));
};
