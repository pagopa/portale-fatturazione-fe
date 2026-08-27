import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";


export const headerAnagraficaPsp : HeaderGridCustom[]  = [
  { label: "Nome PSP", align: "center", width: "100px", keyValue: "name" ,typeColumn: "ragionesociale", makeAction: false, applyCss: true },
  { label: "ID Contratto", align: "center", width: "120px", keyValue: "contractId", typeColumn: "string"},
  { label: "Trimestre", align: "center", width: "100px", keyValue: "yearQuarter", typeColumn: "string" },
  { label: "Nome Fornitore", align: "center", width: "150px", keyValue: "providerNames", typeColumn: "string" },
  { label: "E-mail PEC", align: "center", width: "150px", keyValue: "pecMail", typeColumn: "string" },
  { label: "Codice SDI", align: "center", width: "120px", keyValue: "sdiCode", typeColumn: "string" },
  { label: "Codice ABI", align: "center", width: "120px", keyValue: "abi", typeColumn: "string" },
  { label: "E-Mail Ref. Fattura", align: "center", width: "150px", keyValue: "referenteFatturaMail", typeColumn: "string" },
  { label: "Data", align: "center", width: "100px", keyValue: "signedDate", typeColumn: "data" }
];

