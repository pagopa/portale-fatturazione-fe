import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";

export const headerRelEnte: HeaderGridCustom[] = [
  { label: "Ragione Sociale", align: "center", width: "200px", keyValue: "ragioneSociale",typeColumn:"ragionesociale",makeAction:true, applyCss:true },
  { label: "Tipologia Fattura", align: "center", width: "150px", keyValue: "tipologiaFattura", typeColumn:"string" },
  { label: "Tipo Contratto", align: "center", width: "150px", keyValue: "tipologiaContratto" , typeColumn:"string"},
  { label: "Reg. Es. PDF", align: "center", width: "120px", keyValue: "firmata", typeColumn:"string" },
  { label: "ID Contratto", align: "center", width: "120px", keyValue: "idContratto" , typeColumn:"string"},
  { label: "Anno", align: "center", width: "100px", keyValue: "anno", typeColumn:"string"},
  { label: "Mese", align: "center", width: "100px", keyValue: "mese",typeColumn:"mese-number" },
  { label: "Tot. Analogico", align: "center", width: "150px", keyValue: "totaleAnalogico" , typeColumn:"euro"},
  { label: "Tot. Digitale", align: "center", width: "150px", keyValue: "totaleDigitale" , typeColumn:"euro"},
  { label: "Tot. Not. Analogico", align: "center", width: "150px", keyValue: "totaleNotificheAnalogiche" , typeColumn:"string"},
  { label: "Tot. Not. Digitali", align: "center", width: "150px", keyValue: "totaleNotificheDigitali", typeColumn:"string" },
  { label: "Totale", align: "center", width: "150px", keyValue: "totale" , typeColumn:"euro"},
  {label:"", align:"center", width:"80px", keyValue:"arrow", typeColumn:"arrow"}
];

export const headerRelAdmin: HeaderGridCustom[] = [
  { label: "Ragione Sociale", align: "center", width: "200px", keyValue: "ragioneSociale", typeColumn:"ragionesociale",makeAction:true, applyCss:true},
  { label: "Tipologia Fattura", align: "center", width: "150px", keyValue: "tipologiaFattura", typeColumn:"string" },
  { label: "Tipo Contratto", align: "center", width: "150px", keyValue: "tipologiaContratto" , typeColumn:"string"},
  { label: "Reg. Es. PDF", align: "center", width: "120px", keyValue: "firmata", typeColumn:"string"  },
  { label: "ID Contratto", align: "center", width: "120px", keyValue: "idContratto", typeColumn:"string" },
  { label: "Anno", align: "center", width: "100px", keyValue: "anno", typeColumn:"string" },
  { label: "Mese", align: "center", width: "100px", keyValue: "mese" ,typeColumn:"mese-number"},
  { label: "Tot. Analogico", align: "center", width: "150px", keyValue: "totaleAnalogico",typeColumn:"euro" },
  { label: "Tot. Digitale", align: "center", width: "150px", keyValue: "tottaleDigitale",typeColumn:"euro"},
  { label: "Tot. Not. Analogico", align: "center", width: "150px", keyValue: "totaleNotificheAnalogiche",typeColumn:"number" },
  { label: "Tot. Not. Digitali", align: "center", width: "150px", keyValue: "totaleNotificheDigitali",typeColumn:"number" },
  { label: "Totale", align: "center", width: "150px", keyValue: "totale",typeColumn:"euro" },
  {label:"", align:"center", width:"80px", keyValue:"arrow", typeColumn:"arrow"}
];