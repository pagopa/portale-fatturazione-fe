import { createContext, useEffect, useReducer,useState } from "react";
import {  loadState, reducerMainState } from "../../reducer/reducerMainState";



export const GlobalContext = createContext({
    mainState:{
        mese:'',
        anno:'',
        nomeEnteClickOn:'',
        datiFatturazione:false,// l'ente ha i dati di fatturazione?
        userClickOn:undefined, // se l'utente clicca su un elemento di lista commesse setto GRID
        inserisciModificaCommessa:undefined, // INSERT MODIFY  se il sevizio get commessa mi restituisce true []
        primoInserimetoCommessa:true,// la commessa mese corrente è stata inserita?
        statusPageDatiFatturazione:'immutable',
        statusPageInserimentoCommessa:'immutable',
        relSelected:{
            nomeEnteClickOn:'',
            mese:0,
            anno:0,
            idElement:''
        },
        apiError:null,
        authenticated:false,
        badgeContent:0,
        messaggioSelected:null,
        prodotti:[],
        profilo:{},
        docContabileSelected:{key:''}
    },
    dispatchMainState:({type,value}) => null,
    openBasicModal_DatFat_ModCom:{visible:false,clickOn:''},
    setOpenBasicModal_DatFat_ModCom:(prev) => null,
    showAlert:true,
    setShowAlert:(prev) => null,
    setOpenModalInfo:(prev) => null,
    openModalInfo:{open:false,sentence:''},
    // logic error alert to implement on all error message
    errorAlert:{error:0,message:''},
    setErrorAlert:(prev) => null
});


function GlobalContextProvider({children}){

    const [mainState, dispatchMainState] = useReducer(reducerMainState,loadState());
    const [openBasicModal_DatFat_ModCom, setOpenBasicModal_DatFat_ModCom] = useState({visible:false,clickOn:''});
    const [showAlert, setShowAlert] = useState(true);
    const [openModalInfo, setOpenModalInfo] = useState({open:false,sentence:''});
    //nuova logica errori da implemnetare sull'applicazione  22/11
    const [errorAlert, setErrorAlert] = useState({error:0,message:''});
  

    // eslint-disable-next-line no-undef
    useEffect(() => {
        // eslint-disable-next-line no-undef
        localStorage.setItem('globalState', JSON.stringify(mainState));
    }, [mainState]);
   
 

    const value = {
        mainState,
        dispatchMainState,
        openBasicModal_DatFat_ModCom,
        setOpenBasicModal_DatFat_ModCom,
        showAlert,
        setShowAlert,
        openModalInfo,
        setOpenModalInfo,
        errorAlert,
        setErrorAlert
    };


    return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export default GlobalContextProvider;