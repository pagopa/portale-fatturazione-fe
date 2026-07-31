import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";
import DeleteIcon from '@mui/icons-material/Delete';
import UpdateIcon from '@mui/icons-material/Update';
import CancelIcon from '@mui/icons-material/Cancel';

export const headersObjGridDocemessiSend : HeaderGridCustom[] = [
  {label:"",keyValue:"",align:"left",width:"30px"},
  {label:"Ragione Sociale",keyValue:"",align:"left",width:"200px"},
  {label:"Azioni",keyValue:"",align:"center",width:"100px",
    renderValue:(obj,fun) =>{
      return(
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {(obj.tipologiaFattura !== "ACCONTO" && obj.tipologiaFattura !== "ANTICIPO") ? 
            <Tooltip title={obj.inviata === 0 ? "Posticipa" : null}>
              <span>
                <IconButton
                  disabled={(obj.inviata === 0 )? false : true}
                  size="medium"
                  onClick={() => fun(obj,"posticipa")}
                >
                  <UpdateIcon  />
                </IconButton>
              </span>
            </Tooltip>
            : <Tooltip title={obj.inviata === 0 ? "Elimina" : null}>
              <span>
                <IconButton
                  disabled={(obj.inviata === 0 )? false : true}
                  size="medium"
                  onClick={() => fun(obj,"eliminazione")}
                >
                  <DeleteIcon  />
                </IconButton>
              </span>
            </Tooltip>
          }
        </Box>
      );
    }  },
  {label:"Data Fattura",keyValue:"",align:"center",width:"160px"},
  {label:"Elaborazione",keyValue:"",align:"center",width:"120px",
    renderValue:(row) =>{

      let tooltipObj:any= {label:'Non Inviata',title:'La fattura non è stata inviata'};
      if(row.inviata === 1){
        tooltipObj = {label:'Inviata',title:'La fattura è stata inviata',color:'#B5E2B4'};
      }else if(row.inviata === 2){
        tooltipObj = {label:'Elaborazione',title:'La fattura è in elaborazione',color:'#86E1FD'};
      }else if(row.inviata === 3){
        tooltipObj = {label:'Eliminata',title:'La fattura è stata cancellata',color:'#ef9a9a'};
      }else if(row.inviata === 4){
        tooltipObj = {label:'Posticipata',title:'La fattura è stata posticipata',color:'#FFE5A3'};
      }

      return(
        <Chip variant="outlined" label={tooltipObj.label} sx={{backgroundColor:tooltipObj.color}} />
      );
    }  },
  {label:"T. Fattura",keyValue:"",align:"center",width:"100px"},
  {label:"Ident.",keyValue:"",align:"center",width:"100px"},
  {label:"Tipo Contratto",keyValue:"",align:"center",width:"140px"},
  {label:"Tot.",keyValue:"",align:"center",width:"100px"},
  {label:"N. Fattura",keyValue:"",align:"center",width:"150px"},
  {label:"Tipo Documento",keyValue:"",align:"center",width:"180px"},
  {label:"Divisa",keyValue:"",align:"center",width:"100px"},
  {label:"M. Pagamento",keyValue:"",align:"center",width:"140px"},
  {label:"Split",keyValue:"",align:"center",width:"100px"},
  {label:"",keyValue:"",align:"center",width:"80px"},
];

export const headersObjGridDocemessiSendCollapse : HeaderGridCustom[] = [
  {label:"Numero Linea",keyValue:"",align:"center",width:"100px"},
  {label:"Codice Materiale",keyValue:"",align:"center",width:"100px"},
  {label:"Imponibile",keyValue:"",align:"center",width:"100px"},
  {label:"Periodo di riferimento",keyValue:"",align:"center",width:"100px"},
  {label:"Periodo di fatturazione",keyValue:"",align:"center",width:"100px"},

];

/* TODO da eliminare se non vogliono la nota visibile nella griglia
{label: 'Nota', align: 'center', width: '100px', keyValue: 'nota', renderValue:(obj,fun) => {
    return (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Tooltip title={obj.nota}>
          <span>
            <IconButton
              size="medium"
              onClick={() => fun(obj)}
            >
              <NoteIcon  />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
     
    );
  } },

*/