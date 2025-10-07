import dayjs from "dayjs";
import { DataGridCommessa } from "../types/typeModuloCommessaElenco";
import { ArrayTipologieCommesse, DatiModuloCommessaPdf, ModuliCommessa } from "../types/typeModuloCommessaInserimento";
import { month, objMesiWithZero } from "./reusableArrayObj";

export const fixResponseForDataGrid = (arr:any[]):any =>{
      
    const res = arr.map( (singlObj:any) =>{
        
        return {
            id : Math.random(),
            ...singlObj
        };
    } );
    
    // Group by quarter
    const grouped = res.reduce((acc, moduli) => {
        const { quarter } = moduli;
        if (!acc[quarter]) {
            acc[quarter] = [];
        }
        acc[quarter].push(moduli);
        return acc;
    }, {});
 
    // Convert to desired array structure and sort by quarter
    const arrayQuarters = Object.entries(grouped)
        .map(([quarter, moduli]) => ({ quarter, moduli }))
        .sort((a, b) => {
            const [yearA, qA] = a.quarter.split('-Q').map(Number);
            const [yearB, qB] = b.quarter.split('-Q').map(Number);
            return yearA !== yearB ? yearA - yearB : qA - qB;
        });
    try{
        const result = arrayQuarters.map((el:any)=> {
            return {
                id:el.quarter,
                anno:el.quarter.slice(0,4),
                quarter:el.quarter.slice(5,7),
                stato:el.moduli.filter(el => el.source === "obbligatorio"|| el.source === "facoltativo").length > 0 ? "Da completare" : "Completo",
                //totaleNotifiche:el.moduli.reduce((acc, item) => acc + item.totaleNotifiche, 0),
                arrow:"",
                moduli:el.moduli.map(mod => {

                    


                    let inserimentoInfo = {inserimento:"--",color:"#ffffff"};

                    if(mod.stato === null ){
                        inserimentoInfo = {inserimento:"Non inserito",color:"#FB9EAC"};
                    }else{
                        inserimentoInfo = {inserimento:"Inserito",color:"#B5E2B4"};
                    }

                    return {
                        id:mod.meseValidita+"/"+mod.annoValidita,
                        meseAnno:month[mod.meseValidita-1]+"/"+mod.annoValidita,
                        stato:mod.source.charAt(0).toUpperCase() + mod.source.slice(1)||"--",
                        inserimento:inserimentoInfo,
                        dataInserimento:mod.dataInserimento?.split('T')[0]|| "--",
                        dataChiusura:mod.dataChiusura?.split('T')[0]|| "--",
                        totaleDig:mod.totaleDigitaleNaz !== null ?mod.totaleDigitaleNaz:"--",
                        totaleNotificheDigitaleInternaz:mod.totaleNotificheDigitaleInternaz !== null ? mod.totaleNotificheDigitaleInternaz: "--",
                        totaleAR:mod.totaleNotificheAnalogicoARInternaz !== null ?mod.totaleNotificheAnalogicoARInternaz :"--",
                        totaleARInt:mod.totaleNotificheAnalogicoARInternaz !== null ? mod.totaleNotificheAnalogicoARInternaz: "--",    
                        totaleAnalogico890Naz:mod.totaleNotificheAnalogico890Naz !== null ? mod.totaleNotificheAnalogico890Naz: "--",
                        totale:mod.totaleNotifiche !== null ? mod.totaleNotifiche : "--",
                        source:mod.source,
                        modifica:mod.modifica,
                        quarter:el.quarter,
                        arrow:""
                    };
                })
            };
        });
        return result;
    }catch(err){
        console.log(err);
    }
    
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
            return "Processo completato";
        default:
            "Caricamento file";
            
    }
};
export function transformObjectToArray(obj: Record<string, string>):{value: number, description: string}[]{
    return Object.entries(obj).map(([key, value]) => ({
        value: parseInt(key, 10), // Convert the key to an integer
        description: value
    }));
}

export  function transformDateTime(input: string): string {
    if(input){
        const [datePart, timePart] = input.split("T"); // Split the input into date and time
        const [year, month, day] = datePart.split("-"); // Split the date into components
        return `${day}-${month}-${year} ${timePart}`; // Rearrange and return the formatted string
    }else{
        return "";
    }
}

export  function transformDateTimeWithNameMonth(input: string): string {
    if(input){
        const [datePart, timePart] = input.split("T"); // Split the input into date and time
        const [year, month, day] = datePart.split("-"); // Split the date into components
        return `${day}-${objMesiWithZero[month]}-${year} ${timePart}`; // Rearrange and return the formatted string
    }else{
        return "";
    }
}


// function to check  start data is less then data end
export function isDateInvalid(dateInput) {
    const date = new Date(dateInput); // Create a Date object
    return isNaN(date.getTime()); // Check if the date is invalid
}

export const formatDateToValidation = (date:any) => {
    if(!isDateInvalid(date)){
        return  dayjs(new Date(date)).format("YYYY-MM-DD").replace(/-/g,"");
    }else{
        return null;
    }
};



export const fixResponseForDataGridRollBack = (arr:any[]):any =>{
 
    try{
        return arr.map((el:any)=> {
         


            let inserimentoInfo = {inserimento:"--",color:"#ffffff"};

            if(el.stato === null ){
                inserimentoInfo = {inserimento:"Non inserito",color:"#FB9EAC"};
            }else{
                inserimentoInfo = {inserimento:"Inserito",color:"#B5E2B4"};
            }

            return {
                id:el.meseValidita+"/"+el.annoValidita,
                meseAnno:month[el.meseValidita-1]+"/"+el.annoValidita,
                stato:el.source.charAt(0).toUpperCase() + el.source.slice(1)||"--",
                inserimento:inserimentoInfo,
                dataInserimento:el.dataInserimento?.split('T')[0]|| "--",
                dataChiusura:el.dataChiusura?.split('T')[0]|| "--",
                totaleDig:el.totaleDigitaleNaz !== null ?el.totaleDigitaleNaz:"--",
                totaleNotificheDigitaleInternaz:el.totaleNotificheDigitaleInternaz !== null ? el.totaleNotificheDigitaleInternaz: "--",
                totaleAR:el.totaleNotificheAnalogicoARInternaz !== null ?el.totaleNotificheAnalogicoARInternaz :"--",
                totaleARInt:el.totaleNotificheAnalogicoARInternaz !== null ? el.totaleNotificheAnalogicoARInternaz: "--",    
                totaleAnalogico890Naz:el.totaleNotificheAnalogico890Naz !== null ? el.totaleNotificheAnalogico890Naz: "--",
                totale:el.totaleNotifiche !== null ? el.totaleNotifiche : "--",
                source:el.source,
                modifica:el.modifica,
                quarter:el.quarter,
                arrow:""
            };
        });
           
       
    
    }catch(err){
        console.log({err});
    }
  
    return [];
};
