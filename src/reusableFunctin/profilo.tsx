
export const profiliEnti = () => {
    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);
    
    const profiloValue = profilo.profilo;
    
    const result = profiloValue === "PA" || profiloValue === "GSP" || profiloValue === "SCP" || profiloValue === "PSP" || profiloValue === "AS" || profiloValue === "SA" || profiloValue === "PT";
    return result;
};


