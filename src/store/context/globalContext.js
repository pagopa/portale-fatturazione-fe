import { createContext, Dispatch, useReducer } from "react";
import { ActionReducerType, reducerMainState } from "../../reducer/reducerMainState";
import { Messaggi, ProfiloObject } from "../../types/typesGeneral";


export const GlobalContext = createContext({
    mainState:{},
    dispatchMainState:({type,value}) => null
});


function GlobalContextProvider({children}){

    const [mainState, dispatchMainState] = useReducer(reducerMainState, {
        mese:'',
        anno:'',
        nonce:'',
        datiFatturazione:false,// l'ente ha i dati di fatturazione?
        userClickOn:undefined, // se l'utente clicca su un elemento di lista commesse setto GRID
        inserisciModificaCommessa:undefined, // INSERT MODIFY  se il sevizio get commessa mi restituisce true []
        primoInserimetoCommessa:true,// la commessa mese corrente è stata inserita?
        statusPageDatiFatturazione:'immutable',
        statusPageInserimentoCommessa:'immutable',
        relSelected: null,
        apiError:null,
        authenticated:false,
        badgeContent:0,
        messaggioSelected:null,
        prodotti:[]
    });

  

    // eslint-disable-next-line no-undef
    console.log(mainState,'pippo');
    const value = {
        mainState,
        dispatchMainState
    };


    return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export default GlobalContextProvider;