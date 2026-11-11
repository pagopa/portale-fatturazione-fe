import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";

export const headersDocContabiliAppio : HeaderGridCustom[] = [
  { label: "", align: "center", width: "80px", keyValue: "collaps", typeColumn: "collaps" },
  { label: "Ente", align: "center", width: "200px", keyValue: "name", typeColumn: "ragionesociale", makeAction: true, applyCss: true },
  { label: "ID Contratto", align: "center", width: "200px", keyValue: "contractId", typeColumn: "string"},
  //{ label: "Numero", align: "center", width: "200px", keyValue: "numero", typeColumn: "string"},
  { label: "Trimestre", align: "center", width: "200px", keyValue: "yearQuarter", typeColumn: "string" },
  //{ label: "Data", align: "center", width: "200px", keyValue: "data", typeColumn: "data" },
  { label: "Importo Tot.", align: "center", width: "200px", keyValue: "importoTotale", typeColumn: "euro" },
  {label:"", align:"center", width:"80px", keyValue:"arrow", typeColumn:"arrow"}
];

export const headersDocContabiliAppioCollapse: HeaderGridCustom[] = [
  { label: "Codice Articolo", align: "center", width: "100px", keyValue: "codiceArticolo", typeColumn: "number" },
  // { label: "ID Categoria", align: "center", width: "100px", keyValue: "category", typeColumn: "string" },
  { label: "Quantità", align: "center", width: "100px", keyValue: "quantita", typeColumn: "number" },
  { label: "Importo", align: "center", width: "100px", keyValue: "importo", typeColumn: "euro-number" },
  { label: "Codice IVA", align: "center", width: "100px", keyValue: "codIva", typeColumn: "string" },
  { label: "Condizioni", align: "center", width: "100px", keyValue: "condizioni", typeColumn: "string" },
  { label: "Causale", align: "center", width: "100px", keyValue: "causale", typeColumn: "string" },
];




export const dettaglioDocContabileAppio = [
  { key: 'name', description: 'Ente' },
  { key: 'partitaIva', description: 'Partita IVA' },
  { key: 'codiceFiscale', description: 'Codice fiscale' },
  { key: 'contractId', description: 'ID contratto' },
  { key: 'prodotto', description: 'Prodotto' },
  { key: 'pricingPlan', description: 'Piano tariffario' },
  { key: 'yearQuarter', description: 'Trimestre' },
  { key: 'importoTotale', description: 'Importo totale' ,formatter: (value) => value ? value+" €" : ''  }, 
  { key: 'dataCreazione', description: 'Data creazione',  formatter: (value) => value ? new Date(value).toISOString().split('T')[0] : '' }, 
  { key: 'ultimoAggiornamento', description: 'Ultimo aggiornamento', formatter: (value) => value ? new Date(value).toISOString().split('T')[0] : '' }, 
  { key: 'data', description: 'Report data', formatter: (value) => value ? new Date(value).toISOString().split('T')[0] : '' },
];


