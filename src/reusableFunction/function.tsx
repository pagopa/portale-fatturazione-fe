import { DataGridCommessa } from "../types/typeModuloCommessaElenco";
import { ArrayTipologieCommesse, DatiModuloCommessaPdf, ModuliCommessa } from "../types/typeModuloCommessaInserimento";

export const fixResponseForDataGrid = (arr:DataGridCommessa[]) =>{
      
    const result = arr.map( (singlObj:DataGridCommessa) =>{
        
        return {
            id : Math.random(),
            ...singlObj
        };
    } );
    return result;
};

export  const calculateTot = (arr:ModuliCommessa[], string:string) =>{
    return arr.reduce((a,b) =>{
        return a + b[string];
    } , 0 );
};

export  const createDateFromString = (string:string) =>{
    const getGiorno = new Date(string).getDate();
  
    const getMese = new Date(string).getMonth() + 1;
    const getAnno = new Date(string).getFullYear();

    return getGiorno+'/'+getMese+'/'+getAnno;
};

export  const replaceDate = (arr:DatiModuloCommessaPdf[], stringToRepace:string, stringToInsert:string) =>{
    return arr.map((singleObj :DatiModuloCommessaPdf ) =>{
        singleObj.tipo = singleObj.tipo.replace(stringToRepace,stringToInsert);
        return singleObj;
    });
};
export const currentMonth = () =>{
    let currString;
    //creo un array di oggetti con tutti i mesi 
    
    if((new Date()).getMonth() === 11){
        currString = '1';
    }else{
        const currentMonth = (new Date()).getMonth() + 2;
        currString = currentMonth.toString();
    }

    return currString;
};

export const getCurrentFinancialYear = () => {
    const thisYear = (new Date()).getFullYear();
    const yearArray = [-1,0,1].map((count) => `${thisYear - count}`);
    return yearArray;
};
export const get2FinancialYear = () => {
    const thisYear = (new Date()).getFullYear();
    const yearArray = [0,1].map((count) => `${thisYear - count}`);
    return yearArray;
};

export const getIdByTipo = (string:string, array:ArrayTipologieCommesse[]) =>{
      
    const getAllObjs = array.map((singleObj)=>{
        return singleObj.tipoSpedizione;
    }).flat().filter((obj)=>{
        return obj.tipo === string;
    });
    return getAllObjs[0].id;
 
};


export const findStatoContestazioni = (code:number) => {
    const result = '';

    switch (code) {
        case 0:
            return "Caricamento file";
        case 1:
            return "Inelaborazione";
        case 2:
            return "Notifiche inesistenti";
        case 3:
            return "Notifiche non associate all'Ente xxx";
        case 4:
            return "Notifiche dell'Ente con contratto diverso da: {idContratto}";
        case 5:   
            return "Notifiche non nello stesso periodo di riferimento: {anno} {mese}";
        case 6:
            return "Notifiche già fatturate o asseverate";
        case 7:
            return "Notifiche che non si possono annullare";
        case 8:
            return "Notifiche che non si possono contestare";
        case 9:
            return "Notifiche che non si possono accettare";
        case 10:
            return "Notifiche che non si possono rifiutare";
        case 11:
            return "Notifiche contestate";
        default:
            "Caricamento file";
    }
};
