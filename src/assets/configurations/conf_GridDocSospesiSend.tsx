import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";

const getStatoFattura = (obj) =>{
  return "Sospesa";
};

export const headersDocumentiSospesiiSend : HeaderGridCustom[] = [
  { label: "", align: "center", width: "30px", keyValue: "collaps", typeColumn: "collaps" },
  { label: "Ragione sociale", align: "center", width: "200px", keyValue: "ragionesociale", typeColumn: "ragionesociale", makeAction: true, applyCss: true },
  { label: "Data Fattura", align: "center", width: "180px", keyValue: "dataFattura", typeColumn: "string" },
  //{ label: "Stato", align: "center", width: "100px", keyValue: "stato", typeColumn: "data-exeption" , funToManipulateValue:getStatoFattura, keyToManipulateData:"stato"},
  { label: "T. Fattura", align: "center", width: "180px", keyValue: "tipologiaFattura", typeColumn: "string" },
  { label: "Ident.", align: "center", width: "100px", keyValue: "identificativo", typeColumn: "string" },
  { label: "Tipo Contratto", align: "center", width: "150px", keyValue: "tipoContratto", typeColumn: "string" },
  { label: "Tot.", align: "center", width: "100px", keyValue: "totale", typeColumn: "euro-number" },
  { label: "N. Fattura", align: "center", width: "150px", keyValue: "numero", typeColumn: "number" },
  { label: "Tipo Documento", align: "center", width: "180px", keyValue: "tipoDocumento", typeColumn: "string" },
  { label: "Divisa", align: "center", width: "100px", keyValue: "divisa", typeColumn: "string" },
  { label: "M. Pagamento", align: "center", width: "180px", keyValue: "metodoPagamento", typeColumn: "string" },
  { label: "Split", align: "center", width: "100px", keyValue: "split", typeColumn: "boolean" },
  {label:"", align:"center", width:"80px", keyValue:"arrow", typeColumn:"arrow"}
];

export const headersDocumentiSospesiSendCollapse: HeaderGridCustom[] = [
  { label: "Numero Linea", align: "center", width: "100px", keyValue: "numerolinea", typeColumn: "number" },
  { label: "Codice Materiale", align: "center", width: "100px", keyValue: "codiceMateriale", typeColumn: "string" },
  { label: "Imponibile", align: "center", width: "100px", keyValue: "imponibile", typeColumn: "euro-number" },
  { label: "Periodo di Riferimento", align: "center", width: "100px", keyValue: "periodoRiferimento", typeColumn: "string" },
  { label: "Periodo di Fatturazione", align: "center", width: "100px", keyValue: "periodoFatturazione", typeColumn: "string" },
];