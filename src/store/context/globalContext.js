/* eslint-disable no-undef */
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
        docContabileSelected:{key:''},
        contestazioneSelected:{
            reportId:0
        }
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
    setErrorAlert:(prev) => null,
    countMessages:0,
    setCountMessages:(prev) => null,
    statusQueryGetUri:[],
    setStatusQueryGetUri:(prev) => null,
    mainData:{apiKeyPage:{visible:null,keys:[]}},
    setMainData:(prev) => null
});


function GlobalContextProvider({children}){
    

    const [mainState, dispatchMainState] = useReducer(reducerMainState,loadState());
    const [openBasicModal_DatFat_ModCom, setOpenBasicModal_DatFat_ModCom] = useState({visible:false,clickOn:''});
    const [showAlert, setShowAlert] = useState(true);
    const [openModalInfo, setOpenModalInfo] = useState({open:false,sentence:''});
    const [countMessages, setCountMessages] = useState(0);
    //nuova logica errori da implemnetare sull'applicazione  22/11
    const [errorAlert, setErrorAlert] = useState({error:0,message:''});
    const [statusQueryGetUri,setStatusQueryGetUri] = useState([]);
  
   

    //nuovo stato dove spostare info che non vogliamo inserire nel MAIN STATE
    const [mainData,setMainData] = useState({
        apiKeyPage:{
            visible:null,
            keys:[]
        }});
  
    // eslint-disable-next-line no-undef
    useEffect(() => {
        // eslint-disable-next-line no-undef
        localStorage.setItem('globalState', JSON.stringify(mainState));
    }, [mainState]);

    useEffect(() => {
        const loQueryGetUri = localStorage.getItem('statusQueryGetUri');
        const loQueryGetUriIsNotEmpty = JSON.parse(loQueryGetUri||'[]').length > 0;
        if(loQueryGetUriIsNotEmpty){
            setStatusQueryGetUri(JSON.parse(loQueryGetUri));
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line no-undef
        localStorage.setItem('statusQueryGetUri', JSON.stringify(statusQueryGetUri));
    }, [statusQueryGetUri]);

    /*
     // eslint-disable-next-line no-undef
    useEffect(() => {
        const hashedState = CryptoJS.HmacSHA256(JSON.stringify(mainState), "GIULIA_MONTANELLO").toString();
        // eslint-disable-next-line no-undef
        localStorage.setItem('globalState', JSON.stringify(hashedState));
    }, [mainState]); */
   
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
        setErrorAlert,
        countMessages,
        setCountMessages,
        setStatusQueryGetUri,
        statusQueryGetUri,
        setMainData,
        mainData
    };


    return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export default GlobalContextProvider;