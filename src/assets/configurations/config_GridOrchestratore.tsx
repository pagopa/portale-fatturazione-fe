import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoIcon from '@mui/icons-material/Info';
import DangerousIcon from '@mui/icons-material/Dangerous';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Tooltip } from "@mui/material";


const getActionOrchestratore = (obj,fun) => {


  let color = "#636363";
  let titleTooltip = 'Programmato';
  let customValue = <AccessTimeIcon sx={{color:color}}/>;
  if(obj.esecuzione === 1){
    titleTooltip = "Eseguito";
    color = "green";
    customValue = <CheckCircleOutlineIcon sx={{color:color}}/>;
  }else if(obj.esecuzione === 2){
    titleTooltip = "Eseguito no data";
    color = "orange";
    customValue = <InfoIcon sx={{color:color}}/>;
  }else if(obj.esecuzione === 3){
    titleTooltip = "Errore";
    color = "red";
    customValue = <DangerousIcon sx={{color:color}}/>;
  }
  
 
  return (
    <Tooltip  title={titleTooltip} placement="right">
      {customValue}
    </Tooltip>
  );
};

  

export const headersName: HeaderGridCustom[] = [
  { label: 'Esecuzione',align:'center',width:'160px',headerAction:true,keyValue:'dataEsecuzione',typeColumn: "data",variant:"caption-semibold"},
  { label:'Anno',align:'center',width:'100px',headerAction:false,keyValue:'anno',typeColumn: "string",variant:"caption-semibold"},
  { label: 'Mese',align:'center',width:'100px',headerAction:false,keyValue:'mese',typeColumn: "mese-number",variant:"caption-semibold"},
  { label: 'Tipologia',align:'center',width:'150px',headerAction:false,keyValue:'tipologia',typeColumn: "string",variant:"caption-semibold"},
  { label: 'Fase',align:'center',width:'150px',headerAction:false,keyValue:'fase',typeColumn: "string",variant:"caption-semibold"},
  { label: 'Fine Contes.',align:'center',width:'130px',headerAction:false,keyValue:'dataFineContestazioni',typeColumn: "data",variant:"caption-semibold"},
  { label: 'Fatturazione',align:'center',width:'130px',headerAction:false,keyValue:'dataFatturazione',typeColumn: "data",variant:"caption-semibold"},
  { label: 'Counter',align:'center',width:'80px',headerAction:false,keyValue:'count',typeColumn: "number",variant:"caption-semibold"},
  { label: 'Processo',align:'center',width:'100px',headerAction:false,keyValue:'esecuzione',typeColumn: "action",funToManipulateValue:getActionOrchestratore,keyToManipulateData:"esecuzione"}];

  