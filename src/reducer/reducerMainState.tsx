import { redirect } from "../api/api";
import { MainState } from "../types/typesGeneral";
export interface ActionReducerType{
    type:string,
    value:any
}

export const initialState:MainState =  {
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
        idElement:'',
        id:""
    },
    apiError:null,
    authenticated:false,
    badgeContent:0,
    messaggioSelected:null,
    prodotti:[],
    profilo:{},
    docContabileSelected:{key:''},
    infoTrimestreComSelected:{},
    contestazioneSelected:{ 
        ragioneSociale:"",
        anno:0,
        mese:0,
        categoriaDocumento:"",
        dataInserimento:"",
        descrizioneStato:"",
        stato:0,
        reportId:0

    },
    datiFatturazioneNotCompleted:false
};


export function reducerMainState(
    mainState: MainState,
    action: { type: string; value?: any }
): MainState {
    switch (action.type) {
        case 'MODIFY_MAIN_STATE':
            return {
                ...mainState,
                ...action.value,
            };

        default:
            return mainState;
    }
}

export function loadState (){ 
    try{
        const savedState = localStorage.getItem('globalStatePF');
        const globalIsNotEmpty = Object.keys(JSON.parse(savedState||'{}')).length > 0;
        return (savedState && globalIsNotEmpty) ? JSON.parse(savedState) : initialState;
    }catch(err){
        localStorage.clear();
        return initialState;
    }
   
}