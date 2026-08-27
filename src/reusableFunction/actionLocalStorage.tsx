export const profiliEnti = (mainState) => {
   
  const profiloValue = mainState?.profilo?.profilo||'';
    
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

export const getProdotti = () =>{
  const prodotti = localStorage.getItem('prodotti') || '{}';
  const result =  JSON.parse(prodotti);

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
