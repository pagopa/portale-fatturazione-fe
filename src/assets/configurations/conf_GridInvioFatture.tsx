import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";

const getChipElaborazione = (row) =>{
  let tooltipObj:any = {label:'',title:''};
  if(row.statoInvio === 0){
    tooltipObj = {label:'Da inviare',title:'Da inviare',color:'#86E1FD'};
  }else if(row.statoInvio === 2){
    tooltipObj = {label:'Elaborazione',title:'La fatture sono in elaborazione',color:"#FFE5A3"};
  }else if(row.statoInvio === 3){
    tooltipObj = {label:'Inviate',title:'La fattura sono state inviate',color:'#B5E2B4'};
  }
  return tooltipObj;
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
  { label: "Numero Fattura", align: "center", width: "160px", keyValue: "idFattura", typeColumn: 'number' },
  { label: "Tipologia Fattura", align: "center", width: "180px", keyValue: "tipologiaFattura", typeColumn: 'string' },
  { label: "Ragione Sociale", align: "center", width: "200px", keyValue: "ragioneSociale", typeColumn: 'ragionesociale' },
  { label: "Importo", align: "center", width: "150px", keyValue: "importo", typeColumn: 'euro' },
  { label: "FK ID Doc.", align: "center", width: "150px", keyValue: "", typeColumn: 'string' },
  { label: "Data Fattura", align: "center", width: "180px", keyValue: "dataFattura", typeColumn: 'data' },
  { label: "Data Generazione", align: "center", width: "180px", keyValue: "", typeColumn: 'data' }
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
  }
];

