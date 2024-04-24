import { DataGridCommessa } from "../types/typeModuloCommessaElenco";
import { DatiModuloCommessaPdf, ModuliCommessa } from "../types/typeModuloCommessaInserimento";

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
    return arr.reduce((a:number,b:any) =>{
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