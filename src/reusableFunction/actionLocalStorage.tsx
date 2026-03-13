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

export const getChosenPath = () => {
    const result =  localStorage.getItem('chosenPath') || '';
    return result;
};

export const setInfoToStatusApplicationLoacalStorage = (oldObj, newObj) => {

    localStorage.setItem('statusApplication',JSON.stringify({...oldObj,...newObj}));
};

export const setInfoToProfiloLoacalStorage = (oldObj, newObj) => {

    localStorage.setItem('profilo',JSON.stringify({...oldObj,...newObj}));
};

export const setFilterToLocalStorage = (bodyGetLista,textValue,valueAutocomplete) => {
    localStorage.setItem("filtersListaDatiFatturazione", JSON.stringify({bodyGetLista,textValue,valueAutocomplete}));
}; 

export const setInfoPageToLocalStorage = (info) => {
    localStorage.setItem("pageRowListaDatiFatturazione", JSON.stringify(info));
};

export const deleteFilterToLocalStorage = () => {
    localStorage.removeItem("filtersListaDatiFatturazione");
}; 

export const getFiltersFromLocalStorage = () => {
    const filtri = localStorage.getItem('filtersListaDatiFatturazione') || '{}';
    const result =  JSON.parse(filtri);
    return result;
};

export const getInfoPageFromLocalStorage = () => {
    const infoPage = localStorage.getItem('pageRowListaDatiFatturazione') || '{}';
    const result =  JSON.parse(infoPage);
    return result;
};

export const setFilterToLocalStorageCommessa = (bodyGetLista,textValue,valueAutocomplete) => {
    localStorage.setItem("filtersModuliCommessa", JSON.stringify({bodyGetLista,textValue,valueAutocomplete}));
}; 
export const setInfoPageToLocalStorageCommessa = (info) => {
    localStorage.setItem("pageRowListaModuliCommessa", JSON.stringify(info));
};

export const deleteFilterToLocalStorageCommessa = () => {
    localStorage.removeItem("filtersModuliCommessa");
}; 

export const getFiltersFromLocalStorageCommessa = () => {
    const filtri = localStorage.getItem('filtersModuliCommessa') || '{}';
    const result =  JSON.parse(filtri);
    return result;
};
export const getInfoPageFromLocalStorageCommessa = () => {
    const infoPage = localStorage.getItem('pageRowListaModuliCommessa') || '{}';
    const result =  JSON.parse(infoPage);
    return result;
};

export const setFilterToLocalStorageRel = (bodyRel,textValue,valueAutocomplete, page, rowsPerPage,valuetipologiaFattura) => {
    localStorage.setItem("filtersRel", JSON.stringify({bodyRel,textValue,valueAutocomplete, page, rowsPerPage,valuetipologiaFattura}));
}; 

export const setFilterToLocalStorageAnagrafica = (body,textValue,valueAutocomplete, page, rowsPerPage) => {
    localStorage.setItem("filtersAnagrafica", JSON.stringify({body,textValue,valueAutocomplete, page, rowsPerPage}));
}; 

export const deleteFilterToLocalStorageRel = () => {
    localStorage.removeItem("filtersRel");
}; 

export const getFiltersFromLocalStorageRel = () => {
    const filtri = localStorage.getItem('filtersRel') || '{}';
    const result =  JSON.parse(filtri);
    return result;
};
export const getFiltersFromLocalStorageAnagrafica = () => {
    const filtri = localStorage.getItem('filtersAnagrafica') || '{}';
    const result =  JSON.parse(filtri);
    return result;
};

export const getFilterPageRowAnagrafica = () => {
    const infoPage = localStorage.getItem('filtersAnagraficaRow') || '{}';
    const result =  JSON.parse(infoPage);
    return result;
};



export const setFilterToLocalStorageNotifiche = (bodyGetLista,textValue,valueAutocomplete, page, rowsPerPage,valueFgContestazione) => {
    localStorage.setItem("filtersNotifiche", JSON.stringify({bodyGetLista,textValue,valueAutocomplete, page, rowsPerPage,valueFgContestazione}));
}; 
export const deleteFilterToLocalStorageNotifiche = () => {
    localStorage.removeItem("filtersNotifiche");
}; 

export const getFiltersFromLocalStorageNotifiche = () => {
    const filtri = localStorage.getItem('filtersNotifiche') || '{}';
    const result =  JSON.parse(filtri);
    return result;
};


export const setFilterToLocalStorageFatture = (bodyGetLista,textValue,valueAutocomplete) => {
    localStorage.setItem("filtersFatture", JSON.stringify({bodyGetLista,textValue,valueAutocomplete}));
}; 

export const setInfoPageToLocalStorageFatture = (info) => {
    localStorage.setItem("pageRowFatture", JSON.stringify(info));
};

export const deleteFilterToLocalStorageFatture = () => {
    localStorage.removeItem("filtersFatture");
}; 
export const deleteFilterToLocalStorageAnagrafica = () => {
    localStorage.removeItem("filtersAnagrafica");
}; 

export const deleteFilterToLocalStorageDocConPA = () => {
    localStorage.removeItem("filtersDocContabiliPA");
}; 

export const deleteFilterToLocalStorageDocConPaginationPA = () => {
    localStorage.removeItem("filtersDocContabiliPageRowPA");
};

export const getFiltersFromLocalStorageFatture = () => {
    const filtri = localStorage.getItem('filtersFatture') || '{}';
    const result =  JSON.parse(filtri);
    return result;
};

export const getInfoPageFromLocalStorageFatture = () => {
    const infoPage = localStorage.getItem('pageRowFatture') || '{}';
    const result =  JSON.parse(infoPage);
    return result;
};

export const setFilterToLocalStorageDocConPA = (body,textValue,valueAutocomplete,valueQuarters) => {
    localStorage.setItem("filtersDocContabiliPA", JSON.stringify({body,textValue,valueAutocomplete,valueQuarters}));
};

export const setFilterPageRowDocConPA = (page, rowsPerPage) => {

    localStorage.setItem("filtersDocContabiliPageRowPA", JSON.stringify({page, rowsPerPage}));
};

export const getFilterPageRowDocConPA = () => {
    const infoPage = localStorage.getItem('filtersDocContabiliPageRowPA') || '{}';
    const result =  JSON.parse(infoPage);
    return result;
};


export const getInfoPageFromLocalStorageDocConPA = () => {
    const infoPage = localStorage.getItem('filtersDocContabiliPA') || '{}';
    const result =  JSON.parse(infoPage);
    return result;
};


