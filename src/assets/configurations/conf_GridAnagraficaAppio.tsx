import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";


export const headerAnagraficaAppio: HeaderGridCustom[]  = [
  { label: "Ente", align: "center", width: "100px", keyValue: "name" ,typeColumn: "ragionesociale", makeAction: false, applyCss: true },
  { label: "ID Contratto", align: "center", width: "120px", keyValue: "contractId", typeColumn: "string"},
  { label: "Trimestre", align: "center", width: "100px", keyValue: "yearQuarter", typeColumn: "string" },
  { label: "E-Mail Ref. Fattura", align: "center", width: "150px", keyValue: "referenteFatturaMail", typeColumn: "string" },
  { label: "Data", align: "center", width: "100px", keyValue: "signedDate", typeColumn: "data" }
];

