import { Box, IconButton, Tooltip } from "@mui/material";
import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import VisibilityIcon from '@mui/icons-material/Visibility';

const getChipElaborazione = (row) =>{
  let tooltipObj:any = {label:'',title:''};
  if(row.statoInvio === 0){
    tooltipObj = {label:'Da inviare',title:'Da inviare',color:'#86E1FD'};
  }else if(row.statoInvio === 2){
    tooltipObj = {label:'Elaborazione',title:'La fatture sono in elaborazione',color:"#FFE5A3"};
  }else if(row.statoInvio === 3){
    tooltipObj = {label:'Inviate',title:'La fattura sono state inviate',color:'#B5E2B4'};
  }else if(row.statoInvio === 4){
    tooltipObj = {label:'Re-Inviata',title:'La fattura sono state re-inviate',color:'#B5E2B4'};
  }
  return tooltipObj;
};

const getChipElaborazioneCollapse = (row) =>{
  let tooltipObj:any = {label:'',title:''};
  if(row.statoInvio === 0){
    tooltipObj = {label:'Da inviare',title:'Da inviare',color:'#86E1FD'};
  }else if(row.statoInvio === 2){
    tooltipObj = {label:'Elaborazione',title:'La fattura è in elaborazione',color:"#FFE5A3"};
  }else if(row.statoInvio === 3){
    tooltipObj = {label:'Inviata',title:'La fattura è stata inviata',color:'#B5E2B4'};
  }else if(row.statoInvio === 4){
    tooltipObj = {label:'Re-Inviata',title:'La fattura è stata re-inviata',color:'#B5E2B4'};
  }
  return tooltipObj;
};

//TODO valutare di  cambiare a fine sviluppo
const showNoteGestioneFatture = (obj,fun) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Tooltip title={"Date di invio"}>
        <span>
          <IconButton
            size="medium"
            disabled={obj.statoInvio === 0}
            onClick={() => fun && fun(obj,'note')}
          >
            <FormatListBulletedIcon/>
          </IconButton>
        </span>
      </Tooltip>
    </Box> 
  );
};

export const headerNamesInvioFatture: HeaderGridCustom[] = [
  { label: "", align: "center", width: "30px", keyValue: "", typeColumn: 'checkbox' },
  { label: "", align: "center", width: "30px", keyValue: "collaps", typeColumn: "collaps" },
  { label: "Tipologia Fattura", align: "center", width: "200px", keyValue: "tipologiaFattura", typeColumn: 'string', makeAction: true, applyCss: true },
  { label: "Stato Invio",align: "center", width: "100px",keyValue: "statoInvio", typeColumn: "chip-tooltip" ,funToManipulateValue:getChipElaborazione},
  { label: "Numero Fatture", align: "center", width: "150px", keyValue: "numeroFatture", typeColumn: 'number' },
  { label: "Anno Riferimento", align: "center", width: "150px", keyValue: "annoRiferimento", typeColumn: 'string',headerActionSort:true, },
  { label: "Mese Riferimento", align: "center", width: "150px", keyValue: "meseRiferimento", typeColumn: 'mese-number',headerActionSort:true },
  { label: "Importo", align: "center", width: "150px", keyValue: "importo", typeColumn: 'euro' },
  // {label:"", align:"center", width:"80px", keyValue:"arrow", typeColumn:"arrow"}
];

export const headerNamesInvioFattureCollapse: HeaderGridCustom[] = [
  { label: "", align: "center", width: "30px", keyValue: "", typeColumn: 'checkbox' },
  { label: "N. Fattura", align: "center", width: "150px", keyValue: "idFattura", typeColumn: 'number' },
  { label: "T. Fattura", align: "center", width: "180px", keyValue: "tipologiaFattura", typeColumn: 'string' },
  { label: "Stato Invio",align: "center", width: "150px",keyValue: "statoInvio", typeColumn: "chip-tooltip" ,funToManipulateValue:getChipElaborazioneCollapse},
  { label: "Ragione Sociale", align: "center", width: "200px", keyValue: "ragioneSociale", typeColumn: 'ragionesociale' },
  { label: "Importo", align: "center", width: "150px", keyValue: "importo", typeColumn: 'euro' },
  { label: "FK ID Doc.", align: "center", width: "150px", keyValue: "", typeColumn: 'string' },
  { label: "D. Fat.", align: "center", width: "180px", keyValue: "dataFattura", typeColumn: 'data' },
  { label: "D. Ultima Gen.", align: "center", width: "200px", keyValue: "dataGenerazione", typeColumn: 'data-ora' },
  { label: "File JSON", align: "center", width: "150px", keyValue: "fileJson", typeColumn:"snackbar",icon:"file_invio_sap",sentenceSnackbar:"Nome del file copiato!" },
  { label: 'Date Invio', align: 'center', width: '150px', keyValue: 'note', typeColumn: "action",funToManipulateValue:showNoteGestioneFatture },
];

export const keyValueObjModalInfo = [
  {
    key:"ragioneSociale",
    label:"Ragione Sociale",
  },
  {
    key:"annoRiferimento",
    label:"Anno Riferimento"
  },
  {
    key:"meseRiferimento",
    label:"Mese Riferimento"
  },
  {
    key:"tipologiaFattura",
    label:"Tipologia Fattura"
  },
  {
    key:"statoInvio",
    label:"N. Invio"
  }
];

