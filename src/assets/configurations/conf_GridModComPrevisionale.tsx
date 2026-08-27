
import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";



export const getStatusColor = (obj): string => {
  switch (obj.source) {
  case "obbligatorio":
    return "#5BB0D5";
  case "archiviato":
    return "#fafafa";
  case "facoltativo":
    return "#f7e7bc";
  default:
    return "#ffffff";
  }
};

export const headersGridPrevisionale : HeaderGridCustom[]  = [
  { label: 'Ragione Sociale',align:'center',width:'200px',keyValue:'ragioneSociale',typeColumn:'ragionesociale',headerAction:false,makeAction:true,applyCss:true},
  { label: 'Anno',align:'center',width:'100px',keyValue:'annoValidita',headerAction:false,typeColumn:'string'},
  { label: 'Mese',align:'center',width:'100px',keyValue:'meseValidita',headerAction:false,typeColumn:'mese-number'},
  { label: 'Stato',align:'center',width:'100px',keyValue:'source',headerAction:false,chip:true,typeColumn:'chip',funToManipulateValue:getStatusColor,keyToManipulateData:"source"},
  { label: 'Tipo Contratto',align:'center',width:'150px',keyValue:'tipologiaContratto',headerAction:false,typeColumn:'string'},
  { label: 'Data Contratto',align:'center',width:'150px',keyValue:'dataContratto',headerAction:false,typeColumn:'data'},
  { label: 'Data Inserimento',align:'center',width:'150px',keyValue:'dataInserimento',headerAction:false,typeColumn:'data'},
  { label: 'Data Chiusura',align:'center',width:'150px',keyValue:'dataChiusura',headerAction:false,typeColumn:'data'},
  { label: 'Tot. Dig. Naz.',align:'center',width:'130px',keyValue:'totaleNotificheDigitaleNaz',headerAction:false,typeColumn:'number'},
  { label: 'Tot. Dig. Int.',align:'center',width:'130px',keyValue:'totaleNotificheDigitaleInternaz',headerAction:false,typeColumn:'number'},
  { label: 'Tot. Analog. AR. Naz.',align:'center',width:'130px',keyValue:'totaleNotificheAnalogicoARNaz',headerAction:false,typeColumn:'number'},
  { label: 'Tot. Analog. AR. Int.',align:'center',width:'130px',keyValue:'totaleNotificheAnalogicoARInternaz',headerAction:false,typeColumn:'number'},
  { label: 'Tot. Analog. 890 Naz.',align:'center',width:'130px',keyValue:'totaleNotificheAnalogico890Naz',headerAction:false,typeColumn:'number'},
  { label: 'Tot. Not.',align:'center',width:'130px',keyValue:'totaleNotifiche',headerAction:false,typeColumn:'number'},
  {label: '',align:'center',width:'60px', keyValue:'arrow',headerAction:false,typeColumn:'arrow'}
];

   