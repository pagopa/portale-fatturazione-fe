import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";
import { getOnereLabel } from "../../reusableFunction/function";

export const headerNamesEnte: HeaderGridCustom[] = [
  {label:"Contestazione", align:"center", width:"100px", keyValue:"contestazione", typeColumn:"string",makeAction:true},
  {label:"Event ID", align:"center", width:"80px", keyValue:"idNotifica", typeColumn:"snackbar"},
  {label:"Onere", align:"center", width:"100px", keyValue:"onere", typeColumn:"string", funToManipulateValue:getOnereLabel},
  {label:"Recipient ID", align:"center", width:"100px", keyValue:"recipientId", typeColumn:"string"},
  {label:"Anno", align:"center", width:"100px", keyValue:"anno", typeColumn:"string"},
  {label:"Mese", align:"center", width:"100px", keyValue:"mese", typeColumn:"mese-number"},
  {label:"Data Evento", align:"center", width:"150px", headerActionSort:true, keyValue:"data", typeColumn:"data"},
  {label:"Tipo Notifica", align:"center", width:"100px", keyValue:"tipoNotifica", typeColumn:"string"},
  {label:"IUN", align:"center", width:"100px", keyValue:"iun", typeColumn:"string"},
  {label:"Data Postalizzazione", align:"center", width:"100px", keyValue:"dataInvio", typeColumn:"data"},
  {label:"Stato estero", align:"center", width:"100px", keyValue:"statoEstero", typeColumn:"string"},
  {label:"CAP", align:"center", width:"100px", keyValue:"cap", typeColumn:"string"},
  {label:"Costo", align:"center", width:"100px", keyValue:"costEuroInCentesimi", typeColumn:"euro-centesimi"},
  {label:"", align:"center", width:"80px", keyValue:"arrow", typeColumn:"arrow"}
];


export const headerNamesAdmin: HeaderGridCustom[] = [
  {label:"Contestazione", align:"center", width:"180px", keyValue:"contestazione", typeColumn:"string",makeAction:true},
  {label:"Event ID", align:"center", width:"100px", keyValue:"idNotifica", typeColumn:"snackbar"},
  {label:"Onere", align:"center", width:"100px", keyValue:"onere", typeColumn:"string", funToManipulateValue:getOnereLabel},
  {label:"Recipient ID", align:"center", width:"150px", keyValue:"recipientId", typeColumn:"string"},
  {label:"Anno", align:"center", width:"100px", keyValue:"anno", typeColumn:"string"},
  {label:"Mese", align:"center", width:"100px", keyValue:"mese", typeColumn:"mese-number"},
  {label:"Data Evento", align:"center", width:"250px", headerActionSort:true, keyValue:"data", typeColumn:"data-ora"},
  {label:"Ragione Sociale", align:"center", width:"180px", keyValue:"ragioneSociale", typeColumn:"ragionesociale",makeAction:false},
  {label:"Tipo Notifica", align:"center", width:"150px", keyValue:"tipoNotifica", typeColumn:"string"},
  {label:"IUN", align:"center", width:"150px", keyValue:"iun", typeColumn:"string"},
  {label:"Data Postalizzazione", align:"center", width:"100px", keyValue:"dataInvio", typeColumn:"data"},
  {label:"Stato Estero", align:"center", width:"150px", keyValue:"statoEstero", typeColumn:"string"},
  {label:"CAP", align:"center", width:"100px", keyValue:"cap", typeColumn:"string"},
  {label:"Costo", align:"center", width:"180px", keyValue:"costEuroInCentesimi", typeColumn:"euro-centesimi"},
  {label:"", align:"center", width:"80px", keyValue:"arrow", typeColumn:"arrow"}
];



