import { Chip, Tooltip } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";
import { month } from "../../reusableFunction/reusableArrayObj";
import { DataGridCommessa } from "../../types/typeModuloCommessaElenco";
import { transformDateTimeWithNameMonth } from "../../reusableFunction/function";


const getLabelMeseAnno = (obj:DataGridCommessa) => {
  return month[obj.meseValidita-1]+"/"+obj.annoValidita;
};

const getStatoComponente = (obj:DataGridCommessa) => {
  const label = obj?.source ? obj?.source.charAt(0).toUpperCase() + obj?.source.slice(1) : "";
  let color = "#ffffff";
  if(obj.source === "obbligatorio"){
    color = "#5BB0D5";
  }else if(obj.source === "archiviato"){
    color =  "#A2ADB8";
  }else if(obj.source === "facoltativo"){
    color = "#f7e7bc";
  }
  return ( 
    <Tooltip
      placement="bottom"
      title={label}
    ><span>
        <CheckCircleIcon sx={{ color: color }}/>
      </span>
    </Tooltip> );
};

const getValueInserimento = (obj:DataGridCommessa) => {
  const inserimento = obj.totaleNotifiche === null ? "Non inserito" : "Inserito";
  const color = obj.totaleNotifiche === null ? "#FB9EAC" : "#B5E2B4";
  return (
    <Chip
      variant="outlined"
      label={inserimento}
      sx={{ backgroundColor: color }}
    />
  );
};

const getdataChiusura = (obj:DataGridCommessa) => {
  const value = obj.source === "archiviato" ? "--" : obj.source === "facoltativo" ? "TBD" : (transformDateTimeWithNameMonth(obj.dataChiusura||"")|| "--");
  return value;
};

export const subHeaderNameModComTrimestraleENTE: HeaderGridCustom[] = [
  { label: 'Mese/Anno',keyValue:"custom", typeColumn:"custom-value",align:'center',width:'160px', headerAction:false,funToManipulateValue:getLabelMeseAnno,makeAction: true, applyCss: true },
  { label: 'Stato',keyValue:"custom", typeColumn:"custom-value",align:'center',width:'100px',headerAction:false, funToManipulateValue:getStatoComponente},
  { label: 'Inserimento',keyValue:"chip", typeColumn:"custom-value",align:'center',width:'100px',headerAction:false, funToManipulateValue:getValueInserimento},
  { label: 'Data inserimento',keyValue:'dataInserimento',typeColumn:"data",align:'center',width:'160px', headerAction:false},
  { label: 'Data chiusura',keyValue:'custom-value',typeColumn:"custom-value",align:'center',width:'160px', headerAction:false,funToManipulateValue:getdataChiusura},
  { label: 'Tot. Digit.',keyValue:'totaleNotificheDigitaleNaz',typeColumn:"number",align:'center',width:'160px', headerAction:false},
  { label: 'Tot. Digit. Int.',keyValue:'totaleNotificheDigitaleInternaz',typeColumn:"number",align:'center',width:'160px', headerAction:false},
  { label: 'Tot. AR.',keyValue:'totaleNotificheAnalogicoARNaz',typeColumn:"number",align:'center',width:'160px', headerAction:false},
  { label: 'Tot. AR. Int.',keyValue:'totaleNotificheAnalogicoARInternaz',typeColumn:"number",align:'center',width:'160px', headerAction:false},
  { label: 'Tot. 890.',keyValue:'totaleNotificheAnalogico890Naz',typeColumn:"number",align:'center',width:'160px', headerAction:false},
  { label: 'Tot. Not.',keyValue:'totaleNotifiche',typeColumn:"number",align:'center',width:'160px', headerAction:false},
  {label:"", align:"center", width:"80px", keyValue:"arrow", typeColumn:"arrow"}
];


