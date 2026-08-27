import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";


const getLabelDataFattura = (obj) => {
  return  obj.dataFattura
    ?  new Date(obj.dataFattura).toLocaleDateString('it-IT')
    : '--';
};


export const headersDocumentiSospesiEnte : HeaderGridCustom[] = [
  { label: "", align: "center", width: "30px", keyValue: "collaps", typeColumn: "collaps" },
  {label:"Data Fattura",keyValue:"custom", typeColumn:"custom-value",align:'center',width:'200px',headerActionSort:true,funToManipulateValue:getLabelDataFattura,makeAction: true, applyCss: true},
  {label:"Stato",keyValue:"custom", typeColumn:"custom-value",align:'center',width:'160px',funToManipulateValue:() => "Sospesa"},
  {label:"T. Fattura",keyValue:"custom", typeColumn:"custom-value",align:'center',width:'160px',funToManipulateValue:(obj) => obj.datiGeneraliDocumento[0].tipologia || "--"},
  {label:"Ident.",keyValue:"identificativo", typeColumn:"string",align:'center',width:'160px',headerActionSort:true},
  {label: "Tipo Contratto", align: "center", width: "150px", keyValue: "tipoContratto", typeColumn: "string-tipocontratto" },
  {label:"Tot.", align: "center", width: "150px", keyValue: "totale", typeColumn: "euro-number",headerActionSort:true},
  {label:"N. Fattura", align: "center", width: "150px", keyValue: "numero", typeColumn: "number",headerActionSort:true},
  {label:"Tipo Documento", align: "center", width: "200px", keyValue: "tipoDocumento", typeColumn: "string",headerActionSort:true},
  {label:"Divisa",align:"center",width:"100px", keyValue: "divisa", typeColumn: "string"},
  {label:"M. Pagamento",keyValue:"metodoPagamento",typeColumn: "string",align:"center",width:"100px"},
  {label:"Split",keyValue:"split",typeColumn:"boolean",align:"center",width:"100px"},
  {label:"", align:"center", width:"80px", keyValue:"arrow", typeColumn:"arrow"}
];

export const headersDocumentiSospesiEnteCollapse : HeaderGridCustom[] = [
  { label: "Numero Linea", align: "center", width: "100px", keyValue: "numeroLinea", typeColumn: "number" },
  { label: "Codice Materiale", align: "center", width: "100px", keyValue: "codiceMateriale", typeColumn: "string" },
  { label: "Imponibile", align: "center", width: "100px", keyValue: "imponibile", typeColumn: "euro-number" },
  { label: "Periodo di riferimento", align: "center", width: "100px", keyValue: "periodoRiferimento", typeColumn: "string" },
  { label: "Periodo di fatturazione", align: "center", width: "100px", keyValue: "periodoFatturazione", typeColumn: "string" }, 
];
