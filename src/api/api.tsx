import axios from 'axios';
interface TipoContratto {
    id: number,
    descrizione : string
   
  }

export const getAllTipoContratto  = async () => {


    try{
      const response = await axios.get<TipoContratto[]>(
        `https://portalefatturebeapi20231102162515.azurewebsites.net/api/datifatturazione/tipocontratto`)
        .then( (res) => {

            return res.data;
        });
      
        console.log(response,'RE');
        return response;

           
    }catch(error){
        alert(error);
    }
return [];
   
  };