import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";

export const headersDocContabiliAppio : HeaderGridCustom[] = [
  { label: "", align: "center", width: "80px", keyValue: "collaps", typeColumn: "collaps" },
  { label: "Ente", align: "center", width: "200px", keyValue: "name", typeColumn: "ragionesociale", makeAction: true, applyCss: true },
  { label: "ID Contratto", align: "center", width: "200px", keyValue: "contractId", typeColumn: "string"},
  { label: "Numero", align: "center", width: "200px", keyValue: "numero", typeColumn: "string"},
  { label: "Trimestre", align: "center", width: "200px", keyValue: "yearQuarter", typeColumn: "string" },
  { label: "Data", align: "center", width: "200px", keyValue: "data", typeColumn: "data" },
  {label:"", align:"center", width:"80px", keyValue:"arrow", typeColumn:"arrow"}
];

export const headersDocContabiliAppioCollapse: HeaderGridCustom[] = [
  { label: "Codice Articolo", align: "center", width: "100px", keyValue: "codiceArticolo", typeColumn: "number" },
  { label: "ID Categoria", align: "center", width: "100px", keyValue: "category", typeColumn: "string" },
  { label: "Quantità", align: "center", width: "100px", keyValue: "quantita", typeColumn: "number" },
  { label: "Importo", align: "center", width: "100px", keyValue: "importo", typeColumn: "euro-number" },
  { label: "Codice IVA", align: "center", width: "100px", keyValue: "codIva", typeColumn: "string" },
  { label: "Condizioni", align: "center", width: "100px", keyValue: "condizioni", typeColumn: "string" },
  { label: "Causale", align: "center", width: "100px", keyValue: "causale", typeColumn: "string" },
];


