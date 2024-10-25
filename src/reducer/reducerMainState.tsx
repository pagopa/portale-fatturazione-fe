import { MainState } from "../types/typesGeneral";
export interface ActionReducerType{
    type:string,
    value:any
}

const initialState =  {
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
    docContabileSelected:{contractId:'',quarter:''},
    filterDocContabili:{
        body:{
            contractIds:[],
            membershipId: '',
            recipientId: '',
            abi: '',
            quarters:[]},
        valueAutocomplete:[],
        valueQuarters:[],
        infoPage:{row:10,page:0}
    }
};


export function reducerMainState(mainState:MainState, action:ActionReducerType) {
    const updateInfoObj = action.value;
    if (action.type === 'MODIFY_MAIN_STATE') {
    
        return {
            ...mainState, ...updateInfoObj      
        };
    }
}

export function loadState (){
    const savedState = localStorage.getItem('globalState');
    return savedState ? JSON.parse(savedState) : initialState;
}